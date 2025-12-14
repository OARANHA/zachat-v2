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
      this.status = "qr_code";
      this.currentQrDataUrl = await QRCode.toDataURL(qr);
      await this.emitWebhook("change_state", { status: this.status });
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
      this.currentQrDataUrl = undefined;
      this.phoneNumber = this.client.info?.wid?.user;
      logger.info({ sessionId: this.sessionId, phoneNumber: this.phoneNumber }, "ready");
      await this.emitWebhook("change_state", { status: this.status, phoneNumber: this.phoneNumber });
    });

    // Eventos de mensagens (para integração com o Core via webhook)
    this.client.on("message_create", async (msg: WbotMessage) => {
      if ((msg as any).isStatus) return;
      await this.emitWebhook("message_create", {
        messageId: msg.id.id,
        from: msg.from,
        to: msg.to,
        body: msg.body,
        timestamp: msg.timestamp,
        fromMe: msg.fromMe,
        hasMedia: msg.hasMedia,
        type: msg.type
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
    this.status = "connecting";
    this.client.initialize();
  }

  async destroy(): Promise<void> {
    try {
      await (this.client as any).destroy();
    } catch (err: any) {
      logger.error({ err, sessionId: this.sessionId }, "destroy failed");
    }
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
