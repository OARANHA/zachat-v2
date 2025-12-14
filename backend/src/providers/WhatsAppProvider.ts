/**
 * WhatsApp Provider - Implementação inicial usando whatsapp-web.js
 * Depois será substituído para usar o gateway HTTP
 * 
 * © 2024 28web. Todos os direitos reservados.
 */

import axios, { AxiosInstance } from "axios";
import {
  IChannelProvider,
  SendMessageDTO,
  MessageResponse,
  MessageHandler,
  SessionConfig,
  Session,
  SessionStatus
} from "../interfaces/IChannelProvider";
import { logger } from "../utils/logger";

/**
 * Provider inicial para WhatsApp
 * Esta é uma implementação temporária que será substituída
 * quando o WhatsApp Gateway for criado na Fase 2
 */
class WhatsAppProvider implements IChannelProvider {
  private static instance: WhatsAppProvider;
  private messageHandlers: Map<string, MessageHandler> = new Map();
  private http: AxiosInstance;

  private constructor() {
    const baseURL = (process.env.WHATSAPP_GATEWAY_URL || "").replace(/\/+$/, "");
    this.http = axios.create({
      baseURL,
      timeout: 15_000,
      headers: process.env.WHATSAPP_GATEWAY_API_KEY
        ? { "x-api-key": process.env.WHATSAPP_GATEWAY_API_KEY }
        : undefined
    });
  }

  // Padrão Singleton para garantir única instância
  public static getInstance(): WhatsAppProvider {
    if (!WhatsAppProvider.instance) {
      WhatsAppProvider.instance = new WhatsAppProvider();
    }
    return WhatsAppProvider.instance;
  }

  private requireSessionId(meta?: Record<string, any>): string {
    const sessionId = meta?.sessionId || meta?.whatsappId || meta?.channelId;
    if (!sessionId) {
      throw new Error(
        "WhatsAppProvider: sessionId ausente. Forneça em SendMessageDTO.metadata.sessionId (ou whatsappId)."
      );
    }
    return String(sessionId);
  }

  async sendMessage(data: SendMessageDTO): Promise<MessageResponse> {
    const sessionId = this.requireSessionId(data.metadata);
    logger.info(`WhatsAppProvider.sendMessage via gateway: sessionId=${sessionId}`);

    const startedAt = Date.now();
    try {
      const resp = await this.http.post(`/api/v1/sessions/${encodeURIComponent(sessionId)}/messages`, {
        to: data.to,
        body: data.body,
        mediaUrl: data.mediaUrl
      });

      return {
        messageId: resp.data?.messageId || "",
        status: "sent",
        timestamp: startedAt
      };
    } catch (err: any) {
      logger.error(`WhatsAppProvider.sendMessage failed: ${err instanceof Error ? err.message : String(err)}`);
      return {
        messageId: "",
        status: "failed",
        timestamp: startedAt,
        error: err instanceof Error ? err.message : String(err)
      };
    }
  }

  receiveMessage(handler: MessageHandler): void {
    const handlerId = `handler_${Date.now()}`;
    this.messageHandlers.set(handlerId, handler);
    logger.info(`WhatsAppProvider: Message handler registered: ${handlerId}`);
  }

  async createSession(config: SessionConfig): Promise<Session> {
    logger.info(`WhatsAppProvider.createSession via gateway: ${JSON.stringify(config)}`);

    const desiredSessionId = config.metadata?.sessionId || config.metadata?.whatsappId;

    const resp = await this.http.post("/api/v1/sessions", {
      tenantId: config.tenantId,
      name: config.name,
      webhookUrl: config.webhookUrl,
      sessionId: desiredSessionId ? String(desiredSessionId) : undefined
    });

    return {
      sessionId: resp.data.sessionId,
      status: resp.data.status,
      qrCode: resp.data.qrCode,
      phoneNumber: resp.data.phoneNumber,
      error: resp.data.error
    };
  }

  async deleteSession(sessionId: string): Promise<void> {
    logger.info(`WhatsAppProvider.deleteSession via gateway: ${sessionId}`);
    await this.http.delete(`/api/v1/sessions/${encodeURIComponent(sessionId)}`);
  }

  async getSessionStatus(sessionId: string): Promise<SessionStatus> {
    logger.info(`WhatsAppProvider.getSessionStatus via gateway: ${sessionId}`);

    const resp = await this.http.get(`/api/v1/sessions/${encodeURIComponent(sessionId)}`);
    return {
      sessionId: resp.data.sessionId,
      status: resp.data.status,
      phoneNumber: resp.data.phoneNumber
    };
  }

  async getSession(sessionId: string): Promise<any> {
    logger.info(`WhatsAppProvider.getSession via gateway: ${sessionId}`);
    
    try {
      const resp = await this.http.get(`/api/v1/sessions/${encodeURIComponent(sessionId)}`);
      return resp.data;
    } catch (error) {
      logger.error(`WhatsAppProvider.getSession failed: ${error}`);
      throw error;
    }
  }

  async disconnectSession(sessionId: string): Promise<void> {
    logger.info(`WhatsAppProvider.disconnectSession via gateway: ${sessionId}`);
    await this.http.post(`/api/v1/sessions/${encodeURIComponent(sessionId)}/disconnect`);
  }

  async reconnectSession(sessionId: string): Promise<Session> {
    logger.info(`WhatsAppProvider.reconnectSession via gateway: ${sessionId}`);
    // Gateway ainda não expõe endpoint dedicado de reconnect.
    // Estratégia mínima: consultar status atual; se necessário, recriar sessão.
    const status = await this.getSessionStatus(sessionId);
    return {
      sessionId: status.sessionId,
      status: status.status,
      phoneNumber: status.phoneNumber
    };
  }

  async getContacts(sessionId: string): Promise<Array<{ number: string; name: string }>> {
    logger.info(`WhatsAppProvider.getContacts via gateway: ${sessionId}`);
    
    try {
      const resp = await this.http.get(`/api/v1/sessions/${encodeURIComponent(sessionId)}/contacts`);
      return resp.data.contacts || [];
    } catch (error) {
      logger.error(`WhatsAppProvider.getContacts failed: ${error}`);
      throw error;
    }
  }
}

export default WhatsAppProvider;
