<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# esta confusa sua correção me mande todo arquivo corrigido entao

**WhatsAppProvider.ts COMPLETO e CORRIGIDO para Evolution v2.2.3:**

```typescript
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
    // Se estiver em modo Evolution, inicializa client Evolution e retorna
    if ((process.env.USE_EVOLUTION_API || "").toLowerCase() === "true") {
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
        if (authType === "bearer") headers["Authorization"] = `Bearer ${apiKey}`;
        else headers["apikey"] = apiKey;
      }

      this.httpEvolution = axios.create({
        baseURL,
        timeout: 20000,
        headers: Object.keys(headers).length ? headers : undefined
      });

      logger.info("✅ WhatsAppProvider: Evolution API v2.2.3 mode enabled");
      return; // Não inicializa/valida o gateway legado
    }

    // Modo legado (Gateway HTTP)
    const raw = process.env.WHATSAPP_GATEWAY_URL || "";
    const baseURL = raw.replace(/\/+$/, "");

    // Validação só no modo gateway
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
    logger.info("WhatsAppProvider: Gateway mode enabled");
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

  // -------------------------
  // Envio de mensagens
  // -------------------------
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
<span style="display:none">[^1][^2]</span>

<div align="center">⁂</div>

[^1]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/29172246/ccbf77fb-6d7f-4150-a7a0-d65c4dd09b0e/evolution-api-blueprint.md
[^2]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/29172246/6a4a3a4b-ba1b-4a21-af17-469c44be719c/image.jpg```

