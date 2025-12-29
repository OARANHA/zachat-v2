/* eslint-disable camelcase */
import { Client, LocalAuth, DefaultOptions, Message as WbotMessage } from "whatsapp-web.js";
import path from "path";
import QRCode from "qrcode";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import { WebhookService } from "./WebhookService";
import { WebhookEvent } from "../types/api";

export type WhatsAppClientConfig = {
  sessionId: string;
  tenantId: string | number;
  name: string;
  webhookUrl?: string;
};

export class WhatsAppClient {
  public readonly sessionId: string;
  public readonly tenantId: string | number;
  public readonly name: string;

  private client: Client;
  private webhookUrl?: string;
  private webhook: WebhookService;
  private currentQrDataUrl?: string;
  private status: "qr_code" | "connecting" | "connected" | "disconnected" | "error" = "connecting";
  private phoneNumber?: string;
  private lastError?: string;

  constructor(cfg: WhatsAppClientConfig) {
    this.sessionId = cfg.sessionId;
    this.tenantId = cfg.tenantId;
    this.name = cfg.name;
    this.webhookUrl = cfg.webhookUrl;
    this.webhook = new WebhookService();

    const args: string[] = env.chromeArgs || [];
    args.unshift(`--user-agent=${DefaultOptions.userAgent}`);

    this.client = new Client({
      authStrategy: new LocalAuth({
        clientId: `wbot-${this.sessionId}`,
        dataPath: path.resolve(env.wwebjsAuthPath)
      }),
      takeoverOnConflict: true,
      puppeteer: {
        executablePath: env.chromeBin || undefined,
        args
      },
      qrMaxRetries: 5
    });

    this.bindEvents();
  }

  private bindEvents(): void {
    this.client.on("qr", async (qr: string) => {
      logger.info({ sessionId: this.sessionId }, `🔲 QR code event triggered`);
      this.status = "qr_code";
      this.currentQrDataUrl = await QRCode.toDataURL(qr);
      logger.info({ sessionId: this.sessionId }, `✅ QR code converted to Data URL`);
      // Não emitir webhook aqui pois o payload seria muito grande
      // O backend já aguarda waitForQRCode() que retorna o QR code
    });

    this.client.on("authenticated", async () => {
      logger.info({ sessionId: this.sessionId }, "authenticated");
    });

    this.client.on("auth_failure", async (msg: string) => {
      this.status = "error";
      this.lastError = msg;
      logger.error({ sessionId: this.sessionId, msg }, "auth_failure");
      await this.emitWebhook("disconnected", { reason: "auth_failure", msg });
    });

    this.client.on("ready", async () => {
      this.status = "connected";
      this.phoneNumber = this.client.info?.wid?.user;
      logger.info({ sessionId: this.sessionId, phoneNumber: this.phoneNumber }, "ready");
      await this.emitWebhook("change_state", { status: this.status, phoneNumber: this.phoneNumber });
    });

    // Eventos de mensagens (para integração com o Core via webhook)
    this.client.on("message_create", async (msg: WbotMessage) => {
      if ((msg as any).isStatus) return;
      let media: any = undefined;
      try {
        if (msg.hasMedia) {
          const m = await msg.downloadMedia();
          media = {
            data: m?.data,
            mimetype: m?.mimetype,
            filename: m?.filename
          };
        }
      } catch (e) {
        logger.warn({ sessionId: this.sessionId, e }, 'Failed to download media for webhook payload');
      }
      await this.emitWebhook("message_create", {
        messageId: msg.id.id,
        from: msg.from,
        to: msg.to,
        body: msg.body,
        timestamp: msg.timestamp,
        fromMe: msg.fromMe,
        hasMedia: msg.hasMedia,
        type: msg.type,
        media
      });
    });

    this.client.on("message_ack", async (msg: WbotMessage, ack: any) => {
      await this.emitWebhook("message_ack", {
        messageId: msg.id.id,
        ack
      });
    });

    this.client.on("message_edit", async (msg: WbotMessage, newBody: string) => {
      await this.emitWebhook("message_edit", {
        messageId: msg.id.id,
        newBody
      });
    });

    this.client.on("message_revoke_everyone", async (_after: any, before: any) => {
      await this.emitWebhook("message_revoke_everyone", {
        body: before?.body
      });
    });

    this.client.on("change_state", async (newState: string) => {
      await this.emitWebhook("change_state", { newState });
    });

    this.client.on("change_battery", async (batteryInfo: any) => {
      await this.emitWebhook("change_battery", batteryInfo);
    });

    this.client.on("disconnected", async (reason: string) => {
      this.status = "disconnected";
      await this.emitWebhook("disconnected", { reason });
    });
  }

  private async emitWebhook(event: WebhookEvent["event"], data: any): Promise<void> {
    if (!this.webhookUrl) return;
    const payload: WebhookEvent = {
      sessionId: this.sessionId,
      event,
      data,
      timestamp: Date.now()
    };
    await this.webhook.post(this.webhookUrl, payload);
  }

  async initialize(): Promise<void> {
    const attemptInitialize = async (attempt: number): Promise<void> => {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('WhatsApp client initialization timeout'));
        }, 60000);

        // Se já está ready ou tem QR code, resolve logo
        if (this.status === 'connected' || (this.status === 'qr_code' && this.currentQrDataUrl)) {
          clearTimeout(timeout);
          resolve();
          return;
        }

        // Espera o evento 'qr' (QR code gerado) ou 'ready' (conexão estabelecida)
        const onQR = () => {
          clearTimeout(timeout);
          logger.info({ sessionId: this.sessionId }, 'QR code generated, initialize complete');
          resolve();
        };

        const onReady = () => {
          clearTimeout(timeout);
          logger.info({ sessionId: this.sessionId }, 'Client ready, initialize complete');
          resolve();
        };

        this.client.on('qr', onQR);
        this.client.on('ready', onReady);

        this.status = "connecting";
        logger.info({ sessionId: this.sessionId, attempt }, 'Starting client initialization...');
        this.client.initialize().catch(async (error) => {
          clearTimeout(timeout);
          logger.error({ sessionId: this.sessionId, attempt, error: String(error) }, 'Puppeteer initialize failed');
          // Se for primeiro erro, tenta limpar diretórios e reiniciar uma vez
          if (attempt === 1) {
            try {
              const fs = require('fs').promises;
              const p = require('path');
              const authDir = p.resolve(process.env.WWEBJS_AUTH_PATH || './.wwebjs_auth', `session-wbot-${this.sessionId}`);
              await fs.rm(authDir, { recursive: true, force: true });
              logger.warn({ sessionId: this.sessionId }, 'Cleaned auth dir after init failure, retrying...');
            } catch (e) {
              logger.warn({ sessionId: this.sessionId, e }, 'Failed to cleanup dirs before retry');
            }
            // recriar client com mesmo config para garantir que puppeteer pegue dirs limpos
            const args: string[] = (env.chromeArgs || []).slice();
            args.unshift(`--user-agent=${DefaultOptions.userAgent}`);
            this.client = new Client({
              authStrategy: new LocalAuth({
                clientId: `wbot-${this.sessionId}`,
                dataPath: path.resolve(env.wwebjsAuthPath)
              }),
              takeoverOnConflict: true,
              puppeteer: {
                executablePath: env.chromeBin || undefined,
                args
              },
              qrMaxRetries: 5
            });
            this.bindEvents();
            try {
              await attemptInitialize(2);
              resolve();
              return;
            } catch (e2) {
              reject(e2);
              return;
            }
          }
          reject(error);
        });
      });
    };

    return attemptInitialize(1);
  }

  /**
   * Aguardar QR code ser gerado
   */
  async waitForQRCode(timeoutMs: number = 60000): Promise<string | undefined> {
    return new Promise((resolve) => {
      const startTime = Date.now();

      // Se já temos QR code, retorna imediatamente
      if (this.currentQrDataUrl) {
        logger.info({ sessionId: this.sessionId }, `QR code already available`);
        resolve(this.currentQrDataUrl);
        return;
      }

      const checkQRCode = () => {
        if (this.currentQrDataUrl) {
          logger.info({ sessionId: this.sessionId }, `QR code found after ${Date.now() - startTime}ms`);
          resolve(this.currentQrDataUrl);
          return;
        }

        const elapsedTime = Date.now() - startTime;
        if (elapsedTime > timeoutMs) {
          logger.warn({ sessionId: this.sessionId }, `QR code timeout after ${elapsedTime}ms`);
          resolve(undefined);
          return;
        }

        // Verifica novamente em 500ms
        setTimeout(checkQRCode, 500);
      };

      checkQRCode();
    });
  }

  async destroy(): Promise<void> {
    try {
     await (this.client as any).destroy();
     
     // Limpar diretórios do Chromium e LocalAuth para evitar erros nas próximas sessões
     const fs = require('fs').promises;
     const p = require('path');
     const base = process.env.WWEBJS_AUTH_PATH || './.wwebjs_auth';
     const authDir = p.resolve(base, `session-wbot-${this.sessionId}`);
     try {
       await fs.rm(authDir, { recursive: true, force: true });
       logger.info({ sessionId: this.sessionId }, `Cleaned up session directory: ${authDir}`);
     } catch (err) {
       // Silenciar erro de limpeza
       logger.warn({ sessionId: this.sessionId, err }, 'Failed to clean session directories');
     }
   } catch (err: any) {
      logger.error({ err, sessionId: this.sessionId }, "destroy failed");
    }
  }

  /**
   * Obter o QR code atual em formato Data URL
   */
  getQRCode(): string | undefined {
    return this.currentQrDataUrl;
  }

  async logout(): Promise<void> {
    try {
      await (this.client as any).logout();
      this.status = "disconnected";
    } catch (err: any) {
      logger.error({ err, sessionId: this.sessionId }, "logout failed");
    }
  }

  async sendMessage(to: string, body?: string): Promise<{ messageId: string }> {
    const chatId = to;
    const res = await this.client.sendMessage(chatId, body || "");
    return { messageId: res.id.id };
  }

  async getContacts(): Promise<Array<{ number: string; name: string }>> {
    try {
      const contacts = await this.client.getContacts();
      return contacts.map(contact => ({
        number: contact.number || contact.id?.user || contact.id?.server || contact.pushname || '',
        name: contact.name || contact.pushname || contact.number || contact.id?.user || 'Unknown'
      }));
    } catch (err: any) {
      logger.error({ err, sessionId: this.sessionId }, "Failed to get contacts");
      throw new Error(`Failed to get contacts: ${err?.message || 'Unknown error'}`);
    }
  }

  // Métodos getters para o SessionManager
  getTenantId(): string | number {
    return this.tenantId;
  }

  getName(): string {
    return this.name;
  }

  /**
   * Obter status atual
   */
  getStatus(): "qr_code" | "connecting" | "connected" | "disconnected" | "error" {
    return this.status;
  }

  getWebhookUrl(): string | undefined {
    return this.webhookUrl;
  }

  getSnapshot(): {
    sessionId: string;
    status: "qr_code" | "connecting" | "connected" | "disconnected" | "error";
    qrCode?: string;
    phoneNumber?: string;
    error?: string;
  } {
    return {
      sessionId: this.sessionId,
      status: this.status,
      qrCode: this.currentQrDataUrl,
      phoneNumber: this.phoneNumber,
      error: this.lastError
    };
  }
}
