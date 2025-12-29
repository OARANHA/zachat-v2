/**
 * WhatsApp Provider – compatível com dois modos de operação:
 * 1) Evolution API v2.2.3 (recomendado)
 * 2) Gateway HTTP legado (compatibilidade)
 *
 * O modo é escolhido por USE_EVOLUTION_API=true|false.
 * Quando USE_EVOLUTION_API=true, nenhuma validação do gateway legado é feita
 * e todas as chamadas são roteadas para a Evolution API.
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

class WhatsAppProvider implements IChannelProvider {
  private static instance: WhatsAppProvider;
  private messageHandlers: Map<string, MessageHandler> = new Map();

  // Flags e clientes HTTP
  private isEvolutionMode = false;
  private httpGateway: AxiosInstance | null = null;
  private httpEvolution: AxiosInstance | null = null;

  private constructor() {
    // ✅ PRIMEIRO: Verifica se deve usar Evolution
    if ((process.env.USE_EVOLUTION_API || "").toLowerCase() === "true") {
      this.initializeEvolutionMode();
      return;
    }

    // Modo legado (Gateway HTTP) - só executa se Evolution desabilitado
    this.initializeGatewayMode();
  }

  /**
   * Inicializa modo Evolution API v2.2.3
   */
  private initializeEvolutionMode(): void {
    this.isEvolutionMode = true;

    const raw = process.env.EVOLUTION_API_URL || "";
    const baseURL = raw.replace(/\/+$/, "");
    
    if (!baseURL || !/^https?:\/\//i.test(baseURL)) {
      const hint = baseURL ? `Valor atual: ${baseURL}` : "(vazio)";
      throw new Error(
        `EVOLUTION_API_URL inválida. Defina uma URL com protocolo, ex: http://evolution-api:8080. ${hint}`
      );
    }

    // Autenticação: apikey (padrão) ou bearer
    const authType = (process.env.EVOLUTION_API_AUTH_TYPE || "apikey").toLowerCase();
    const apiKey = process.env.EVOLUTION_API_KEY || process.env.EVOLUTION_API_TOKEN;
    const headers: Record<string, string> = {};
    
    if (apiKey) {
      if (authType === "bearer") {
        headers["Authorization"] = `Bearer ${apiKey}`;
      } else {
        headers["apikey"] = apiKey;
      }
    }

    this.httpEvolution = axios.create({
      baseURL,
      timeout: 20000,
      headers: Object.keys(headers).length ? headers : undefined
    });

    logger.info("✅ WhatsAppProvider: Evolution API v2.2.3 mode enabled");
  }

  /**
   * Inicializa modo Gateway HTTP legado
   */
  private initializeGatewayMode(): void {
    const raw = process.env.WHATSAPP_GATEWAY_URL || "";
    const baseURL = raw.replace(/\/+$/, "");

    if (!baseURL || !/^https?:\/\//i.test(baseURL)) {
      const hint = baseURL ? `Valor atual: ${baseURL}` : "(vazio)";
      throw new Error(
        `WHATSAPP_GATEWAY_URL inválida. Defina uma URL com protocolo, ex: http://whatsapp-gateway:3001. ${hint}`
      );
    }

    this.httpGateway = axios.create({
      baseURL,
      timeout: 15000,
      headers: process.env.WHATSAPP_GATEWAY_API_KEY
        ? { "x-api-key": process.env.WHATSAPP_GATEWAY_API_KEY }
        : undefined
    });
    
    logger.info("✅ WhatsAppProvider: Gateway mode enabled");
  }

  // Singleton
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

  private buildInstanceName(config: SessionConfig): string {
    const desired = config.metadata?.sessionId || config.metadata?.whatsappId || config.name;
    return String(desired ?? `${config.tenantId}-${Date.now()}`);
  }

  // =========================================================
  // ENVIO DE MENSAGENS
  // =========================================================
  async sendMessage(data: SendMessageDTO): Promise<MessageResponse> {
    if (this.isEvolutionMode) return this.sendMessageEvolution(data);
    return this.sendMessageGateway(data);
  }

  private async sendMessageGateway(data: SendMessageDTO): Promise<MessageResponse> {
    const sessionId = this.requireSessionId(data.metadata);
    logger.info(`WhatsAppProvider.sendMessage via gateway: sessionId=${sessionId}`);

    const startedAt = Date.now();
    try {
      const resp = await this.httpGateway!.post(
        `/api/v1/sessions/${encodeURIComponent(sessionId)}/messages`,
        {
          to: data.to,
          body: data.body,
          mediaUrl: data.mediaUrl
        }
      );

      return {
        messageId: resp.data?.messageId || "",
        status: "sent",
        timestamp: startedAt
      };
    } catch (err: any) {
      logger.error(
        `WhatsAppProvider.sendMessage (gateway) failed: ${err instanceof Error ? err.message : String(err)}`
      );
      return {
        messageId: "",
        status: "failed",
        timestamp: startedAt,
        error: err instanceof Error ? err.message : String(err)
      };
    }
  }

  private async sendMessageEvolution(data: SendMessageDTO): Promise<MessageResponse> {
    const sessionId = this.requireSessionId(data.metadata);
    logger.info(`WhatsAppProvider.sendMessage via evolution: sessionId=${sessionId}`);

    const startedAt = Date.now();
    try {
      const resp = await this.httpEvolution!.post(
        `/message/sendText/${encodeURIComponent(sessionId)}`,
        {
          number: data.to,
          text: data.body
        }
      );

      return {
        messageId: resp.data?.messageId || resp.data?.id || "",
        status: "sent",
        timestamp: startedAt
      };
    } catch (err: any) {
      logger.error(
        `WhatsAppProvider.sendMessage (evolution) failed: ${err instanceof Error ? err.message : String(err)}`
      );
      return {
        messageId: "",
        status: "failed",
        timestamp: startedAt,
        error: err instanceof Error ? err.message : String(err)
      };
    }
  }

  // =========================================================
  // RECEBIMENTO (callback interno – mantido para compat)
  // =========================================================
  receiveMessage(handler: MessageHandler): void {
    const handlerId = `handler_${Date.now()}`;
    this.messageHandlers.set(handlerId, handler);
    logger.info(`WhatsAppProvider: Message handler registered: ${handlerId}`);
  }

  // =========================================================
  // SESSÃO: criação / status / controle
  // =========================================================
  async createSession(config: SessionConfig): Promise<Session> {
    if (this.isEvolutionMode) return this.createSessionEvolution(config);
    return this.createSessionGateway(config);
  }

  /**
   * ✅ EVOLUTION v2.2.3 COM WEBHOOK CONFIGURADO
   * 
   * Fluxo:
   * 1. Cria instância com /instance/create
   * 2. Configura webhook POR INSTÂNCIA (CRÍTICO!)
   * 3. Obtém status + QR Code
   * 4. Retorna Session com QR
   */
  private async createSessionEvolution(config: SessionConfig): Promise<Session> {
    const instanceKey = this.buildInstanceName(config);
    logger.info(`WhatsAppProvider.createSession (evolution v2.2.3) instance=${instanceKey}`);

    try {
      // ====================================================
      // 1. CRIAR instância COM payload completo
      // ====================================================
      const createPayload = {
        instanceName: instanceKey,
        integration: "WHATSAPP-BAILEYS",  // ← CRÍTICO!
        qrcode: true,
        settings: {
          rejectCall: true,
          msgCall: "Não posso atender chamadas",
          groupsIgnore: false,
          alwaysOnline: true,
          readMessages: true,
          readStatus: true
        }
      };

      const createResp = await this.httpEvolution!.post(
        `/instance/create`,
        createPayload
      );

      logger.info(`✅ Evolution instance "${instanceKey}" criada com sucesso`);

      // ====================================================
      // 2. CONFIGURAR WEBHOOK POR INSTÂNCIA (NOVO!)
      // ====================================================
      try {
        const backendBase = (process.env.BACKEND_URL || "http://backend:3100").replace(/\/+$/, "");
        
        await this.setInstanceWebhook(instanceKey, {
          url: `${backendBase}/api/webhook/evolution`,
          byEvents: false,  // ← Todos eventos em UM endpoint
          base64: true,
          headers: { "Content-Type": "application/json" },
          events: ["QRCODE_UPDATED", "CONNECTION_UPDATE", "MESSAGES_UPSERT"]
        });
        
        logger.info(`✅ Evolution webhook configurado para instância "${instanceKey}"`);
      } catch (e: any) {
        logger.warn(
          `WhatsAppProvider.createSessionEvolution: falha ao configurar webhook: ${e?.message || e}`
        );
        // NÃO falha criação se webhook falhar, mas avisa
      }

      // ====================================================
      // 3. OBTER STATUS + QR CODE
      // ====================================================
      const statusResp = await this.httpEvolution!.get(
        `/instance/connectionState/${encodeURIComponent(instanceKey)}`
      );

      const data = statusResp.data || {};
      const state = (data.state || data.connectionStatus || "").toString().toLowerCase();
      const hasQr = Boolean(data.qrCode || data.qrcode || data.qr);

      const status: Session["status"] =
        state === "open" || state === "connected"
          ? "connected"
          : hasQr
          ? "qr_code"
          : "connecting";

      return {
        sessionId: instanceKey,
        status,
        qrCode: data.qrCode || data.qrcode || undefined,
        phoneNumber: data.phoneNumber || data.phone?.number,
        metadata: { raw: { create: createResp.data, status: data } }
      };
    } catch (err: any) {
      logger.error(
        `WhatsAppProvider.createSessionEvolution failed: ${err instanceof Error ? err.message : String(err)}`
      );
      throw err;
    }
  }

  private async createSessionGateway(config: SessionConfig): Promise<Session> {
    logger.info(`WhatsAppProvider.createSession via gateway: ${JSON.stringify(config)}`);
    const desiredSessionId = config.metadata?.sessionId || config.metadata?.whatsappId;

    const resp = await this.httpGateway!.post("/api/sessions", {
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
    if (this.isEvolutionMode) {
      logger.info(`WhatsAppProvider.deleteSession (evolution): ${sessionId}`);
      await this.httpEvolution!.delete(`/manager/instances/${encodeURIComponent(sessionId)}`);
      return;
    }

    logger.info(`WhatsAppProvider.deleteSession via gateway: ${sessionId}`);
    await this.httpGateway!.delete(`/api/sessions/${encodeURIComponent(sessionId)}`);
  }

  async getSessionStatus(sessionId: string): Promise<SessionStatus> {
    if (this.isEvolutionMode) {
      logger.info(`WhatsAppProvider.getSessionStatus (evolution): ${sessionId}`);
      const resp = await this.httpEvolution!.get(
        `/instance/connectionState/${encodeURIComponent(sessionId)}`
      );
      const data = resp.data || {};
      const state = (data.state || data.connectionStatus || "").toString().toLowerCase();
      const status: SessionStatus["status"] =
        state === "open" || state === "connected" ? "connected" : "connecting";
      return {
        sessionId,
        status,
        phoneNumber: data.phoneNumber || data.phone?.number
      };
    }

    logger.info(`WhatsAppProvider.getSessionStatus via gateway: ${sessionId}`);
    const resp = await this.httpGateway!.get(
      `/api/sessions/${encodeURIComponent(sessionId)}/status`
    );
    return {
      sessionId: resp.data.sessionId,
      status: resp.data.status,
      phoneNumber: resp.data.phoneNumber
    };
  }

  async getSession(sessionId: string): Promise<any> {
    if (this.isEvolutionMode) {
      logger.info(`WhatsAppProvider.getSession (evolution): ${sessionId}`);
      const resp = await this.httpEvolution!.get(
        `/instance/connectionState/${encodeURIComponent(sessionId)}`
      );
      return resp.data;
    }

    logger.info(`WhatsAppProvider.getSession via gateway: ${sessionId}`);
    try {
      const resp = await this.httpGateway!.get(
        `/api/sessions/${encodeURIComponent(sessionId)}/status`
      );
      return resp.data;
    } catch (error) {
      logger.error(`WhatsAppProvider.getSession failed: ${error}`);
      throw error;
    }
  }

  async disconnectSession(sessionId: string): Promise<void> {
    if (this.isEvolutionMode) {
      logger.info(`WhatsAppProvider.disconnectSession (evolution): ${sessionId}`);
      try {
        await this.httpEvolution!.post(
          `/manager/instances/${encodeURIComponent(sessionId)}/disconnect`
        );
      } catch {
        // Fallback: deletar a instância (restaura QR em nova criação)
        await this.deleteSession(sessionId);
      }
      return;
    }

    logger.info(`WhatsAppProvider.disconnectSession via gateway: ${sessionId}`);
    await this.httpGateway!.post(
      `/api/sessions/${encodeURIComponent(sessionId)}/disconnect`
    );
  }

  async reconnectSession(sessionId: string): Promise<Session> {
    if (this.isEvolutionMode) {
      logger.info(`WhatsAppProvider.reconnectSession (evolution): ${sessionId}`);
      const status = await this.getSessionStatus(sessionId);
      return {
        sessionId: status.sessionId,
        status: status.status,
        phoneNumber: status.phoneNumber
      };
    }

    logger.info(`WhatsAppProvider.reconnectSession via gateway: ${sessionId}`);
    const status = await this.getSessionStatus(sessionId);
    return {
      sessionId: status.sessionId,
      status: status.status,
      phoneNumber: status.phoneNumber
    };
  }

  async getContacts(sessionId: string): Promise<Array<{ number: string; name: string }>> {
    if (this.isEvolutionMode) {
      logger.info(`WhatsAppProvider.getContacts (evolution): ${sessionId}`);
      try {
        const resp = await this.httpEvolution!.get(
          `/chat/findContacts/${encodeURIComponent(sessionId)}`
        );
        return resp.data.contacts || [];
      } catch (error) {
        logger.error(`WhatsAppProvider.getContacts (evolution) failed: ${error}`);
        throw error;
      }
    }

    logger.info(`WhatsAppProvider.getContacts via gateway: ${sessionId}`);
    try {
      const resp = await this.httpGateway!.get(
        `/api/v1/sessions/${encodeURIComponent(sessionId)}/contacts`
      );
      return resp.data.contacts || [];
    } catch (error) {
      logger.error(`WhatsAppProvider.getContacts (gateway) failed: ${error}`);
      throw error;
    }
  }

  // =========================================================
  // Evolution helper methods (façade público)
  // =========================================================
  public async createInstance(params: {
    instanceName: string;
    qrcode?: boolean;
    integration?: string;
    webhook?: any;
    settings?: Record<string, any>;
  }): Promise<any> {
    if (!this.isEvolutionMode) {
      logger.info("WhatsAppProvider.createInstance no-op (gateway mode)");
      return { mode: "gateway", skipped: true };
    }
    const name = String(params.instanceName);
    const body: any = {
      instanceName: name,
      integration: params.integration || "WHATSAPP-BAILEYS",
      qrcode: params.qrcode ?? true,
      settings: params.settings,
      webhook: params.webhook
    };
    const resp = await this.httpEvolution!.post(
      `/instance/create`,
      body
    );
    return resp.data;
  }

  public async setInstanceWebhook(
    instanceName: string,
    config: {
      url: string;
      byEvents?: boolean;
      base64?: boolean;
      headers?: Record<string, string>;
      events?: string[];
    }
  ): Promise<void> {
    if (!this.isEvolutionMode) {
      logger.info("WhatsAppProvider.setInstanceWebhook no-op (gateway mode)");
      return;
    }
    await this.httpEvolution!.post(
      `/webhook/set/${encodeURIComponent(instanceName)}`,
      { webhook: config }
    );
  }

  public async restartInstance(instanceName: string): Promise<void> {
    if (!this.isEvolutionMode) {
      logger.info("WhatsAppProvider.restartInstance no-op (gateway mode)");
      return;
    }
    try {
      await this.httpEvolution!.post(
        `/manager/instances/${encodeURIComponent(instanceName)}/restart`
      );
    } catch (e: any) {
      logger.warn(
        `WhatsAppProvider.restartInstance (evolution) falhou em /restart: ${e?.message || e}`
      );
      // Tentativa alternativa suave: desconectar e reativar
      try {
        await this.httpEvolution!.post(
          `/manager/instances/${encodeURIComponent(instanceName)}/disconnect`
        );
        await this.httpEvolution!.put(
          `/manager/instances/${encodeURIComponent(instanceName)}`
        );
      } catch (e2: any) {
        logger.warn(
          `WhatsAppProvider.restartInstance (fallback disconnect/put) falhou: ${e2?.message || e2}`
        );
      }
    }
  }
}

export default WhatsAppProvider;
