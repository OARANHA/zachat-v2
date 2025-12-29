# 🚀 GUIA DE IMPLEMENTAÇÃO - EVOLUTION API + ZACHAT

## PASSO 1: Criar o Adapter Evolution

**Arquivo:** `backend/src/adapters/EvolutionWebhookAdapter.ts`

```typescript
import { logger } from "../utils/logger";

/**
 * Adapter para normalizar webhooks da Evolution API
 * Converte dados da Evolution para o formato esperado pelo Zechat
 */
export class EvolutionWebhookAdapter {
  /**
   * Normaliza nomes de eventos da Evolution
   */
  static normalizeEventName(event: string): string {
    if (!event) return "";

    const eventMap: Record<string, string> = {
      "connection.update": "connection.status",
      "connectionupdate": "connection.status",
      "connectionUpdate": "connection.status",
      "CONNECTION_UPDATE": "connection.status",
      
      "qrcode.updated": "qr_code",
      "qrcodeupdated": "qr_code",
      "qrcodeUpdated": "qr_code",
      "QRCODE_UPDATED": "qr_code",
      "qr.updated": "qr_code",
      
      "messages.upsert": "message",
      "messagesupsert": "message",
      "messagesUpsert": "message",
      "MESSAGES_UPSERT": "message",
      
      "message.ack": "message_ack",
      "messageack": "message_ack",
      "MESSAGE_ACK": "message_ack",
      
      "disconnected": "disconnected",
      "DISCONNECTED": "disconnected",
    };

    if (eventMap[event]) {
      return eventMap[event];
    }

    const lowerEvent = event.toLowerCase();
    if (eventMap[lowerEvent]) {
      return eventMap[lowerEvent];
    }

    logger.warn(`Evento não mapeado da Evolution: ${event}`);
    return event;
  }

  /**
   * Extrai QR code como string (não como objeto)
   */
  static extractQrCode(data: any): string | null {
    if (!data) return null;

    if (typeof data === "string") {
      return data;
    }

    if (typeof data === "object") {
      if (data.qrCode?.base64 && typeof data.qrCode.base64 === "string") {
        return data.qrCode.base64;
      }

      if (typeof data.qrCode === "string") {
        return data.qrCode;
      }

      if (data.base64 && typeof data.base64 === "string") {
        return data.base64;
      }

      if (data.qr && typeof data.qr === "string") {
        return data.qr;
      }
    }

    return null;
  }

  /**
   * Mapeia status da Evolution para o padrão Zechat
   */
  static mapConnectionStatus(evolutionState: string): string {
    if (!evolutionState) return "DISCONNECTED";

    const statusMap: Record<string, string> = {
      open: "CONNECTED",
      opened: "CONNECTED",
      ready: "CONNECTED",
      authenticated: "CONNECTED",
      
      connecting: "OPENING",
      Opening: "OPENING",
      OPENING: "OPENING",
      authenticating: "OPENING",
      
      close: "DISCONNECTED",
      closed: "DISCONNECTED",
      DISCONNECTED: "DISCONNECTED",
      disconnected: "DISCONNECTED",
      error: "DISCONNECTED",
      rejected: "DISCONNECTED",
      unauthorized: "DISCONNECTED",
      timeout: "DISCONNECTED",
    };

    const lowerState = evolutionState.toLowerCase();
    return statusMap[lowerState] || "DISCONNECTED";
  }

  /**
   * Prepara dados completos do webhook
   */
  static prepareWebhookData(event: string, data: any) {
    const normalizedEvent = this.normalizeEventName(event);

    const preparedData: any = {
      ...data,
    };

    // Se tiver estado, mapear para status
    if (data.state) {
      preparedData.status = this.mapConnectionStatus(data.state);
      delete preparedData.state;
    }

    // Se tiver qrCode, extrair como string
    if (data.qrCode !== undefined) {
      preparedData.qrCode = this.extractQrCode(data.qrCode);
    }

    return {
      event: normalizedEvent,
      originalEvent: event,
      data: preparedData,
    };
  }

  /**
   * Valida se webhook tem dados essenciais
   */
  static isValid(body: any): { valid: boolean; error?: string } {
    if (!body) {
      return { valid: false, error: "Body vazio" };
    }

    if (!body.event) {
      return { valid: false, error: "Campo 'event' obrigatório" };
    }

    if (!body.instance) {
      return { valid: false, error: "Campo 'instance' obrigatório" };
    }

    if (typeof body.data !== "object") {
      return { valid: false, error: "Campo 'data' deve ser um objeto" };
    }

    return { valid: true };
  }
}
```

---

## PASSO 2: Estender WhatsAppWebhookController

**Arquivo:** `backend/src/controllers/WhatsAppWebhookController.ts`

Adicione **ANTES** da export:

```typescript
import { EvolutionWebhookAdapter } from "../adapters/EvolutionWebhookAdapter";

// ... resto do código existente ...

// ADICIONAR AO FIM DA CLASSE:

  static async handleEvolution(req: Request, res: Response): Promise<Response> {
    try {
      const { event, instance, data } = req.body;

      // Validar webhook
      const validation = EvolutionWebhookAdapter.isValid(req.body);
      if (!validation.valid) {
        logger.warn(`Webhook Evolution inválido: ${validation.error}`);
        return res.status(400).json({ error: validation.error });
      }

      logger.info(`📱 Evolution webhook recebido: ${event} para instância ${instance}`);

      // Adaptar dados
      const adapted = EvolutionWebhookAdapter.prepareWebhookData(event, data);

      // Encontrar sessão Whatsapp no banco
      const whatsapp = await Whatsapp.findOne({
        where: { name: instance },
      });

      if (!whatsapp) {
        logger.warn(`❌ Instância Evolution '${instance}' não encontrada no banco`);
        return res.status(404).json({
          error: "Instance not found",
          instance,
        });
      }

      // Rotear para handler específico
      switch (adapted.event) {
        case "connection.status":
          await WhatsAppWebhookController.handleEvolutionConnection(
            whatsapp,
            adapted.data
          );
          break;

        case "qr_code":
          await WhatsAppWebhookController.handleEvolutionQrCode(
            whatsapp,
            adapted.data
          );
          break;

        case "message":
          await WhatsAppWebhookController.handleEvolutionMessage(
            whatsapp,
            adapted.data
          );
          break;

        case "disconnected":
          await WhatsAppWebhookController.handleEvolutionDisconnect(whatsapp);
          break;

        default:
          logger.info(
            `ℹ️ Evento Evolution '${adapted.event}' ainda não implementado`
          );
      }

      return res.status(200).json({
        status: "received",
        event: adapted.event,
        instance,
      });
    } catch (err) {
      logger.error(`❌ Erro no webhook Evolution: ${err}`);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // Handler para conexão
  private static async handleEvolutionConnection(
    whatsapp: Whatsapp,
    data: any
  ): Promise<void> {
    try {
      const { status, phone } = data;

      logger.info(
        `🔄 Evolution Connection: ${whatsapp.name} → status: ${status}`
      );

      const updateData: any = {
        status,
      };

      if (phone) {
        updateData.number = phone;
      }

      if (status === "CONNECTED") {
        logger.info(`✅ ${whatsapp.name} conectado com sucesso`);
        updateData.qrcode = null;
        updateData.retries = 0;
      }

      if (status === "DISCONNECTED") {
        logger.warn(`❌ ${whatsapp.name} desconectado`);
        updateData.qrcode = null;
        updateData.number = null;
      }

      await whatsapp.update(updateData);

      const io = getIO();
      io.emit("whatsappStatusUpdate", {
        whatsappId: whatsapp.id,
        tenantId: whatsapp.tenantId,
        status,
        name: whatsapp.name,
      });
    } catch (err) {
      logger.error(`❌ Erro ao processar Connection: ${err}`);
    }
  }

  // Handler para QR Code
  private static async handleEvolutionQrCode(
    whatsapp: Whatsapp,
    data: any
  ): Promise<void> {
    try {
      const { qrCode } = data;

      logger.info(`📲 QR Code recebido para: ${whatsapp.name}`);

      if (!qrCode || typeof qrCode !== "string") {
        logger.warn(`⚠️ QR Code inválido para ${whatsapp.name}`);
        return;
      }

      await whatsapp.update({
        qrcode: qrCode,
        status: "OPENING",
      });

      const io = getIO();
      io.emit("whatsappQrCode", {
        whatsappId: whatsapp.id,
        tenantId: whatsapp.tenantId,
        qrcode: qrCode,
        name: whatsapp.name,
      });
    } catch (err) {
      logger.error(`❌ Erro ao processar QR Code: ${err}`);
    }
  }

  // Handler para mensagens
  private static async handleEvolutionMessage(
    whatsapp: Whatsapp,
    data: any
  ): Promise<void> {
    try {
      logger.info(`💬 Mensagem recebida para: ${whatsapp.name}`);

      const adaptedMessage: WbotMessage = {
        id: { id: data.messageId || data.id || `msg_${Date.now()}` },
        from: data.from,
        to: data.to || data.remoteJid || "",
        body: data.body || data.text || "",
        timestamp: data.timestamp || Math.floor(Date.now() / 1000),
        hasMedia: data.hasMedia === true || !!data.mediaType,
        mediaType: data.mediaType,
        mediaUrl: data.mediaUrl,
        fromMe: data.fromMe === true,
        type: data.mediaType || "chat",
        ack: 0,
        status: "received",
        tenantId: whatsapp.tenantId,
        wabaMediaId: undefined,
        read: false,
        isDeleted: false,
        quotedMsgId: undefined,
        ticketId: undefined,
        contactId: undefined,
        userId: undefined,
        scheduleDate: undefined,
        sendType: "chat",
        idFront: undefined,
        deviceType: undefined,
        broadcast: false,
        isStatus: false,
        isGif: false,
        getChat: async () => ({ isGroup: false }),
        getContact: async () => ({ id: data.from, name: "Contact" }),
      };

      await HandleMessage(adaptedMessage as any, whatsapp as any);

      logger.debug(`✅ Mensagem processada com sucesso`);
    } catch (err) {
      logger.error(`❌ Erro ao processar mensagem: ${err}`);
    }
  }

  // Handler para desconexão
  private static async handleEvolutionDisconnect(
    whatsapp: Whatsapp
  ): Promise<void> {
    try {
      logger.warn(`🔌 ${whatsapp.name} foi desconectado`);

      await whatsapp.update({
        status: "DISCONNECTED",
        qrcode: null,
        number: null,
      });

      const io = getIO();
      io.emit("whatsappStatusUpdate", {
        whatsappId: whatsapp.id,
        status: "DISCONNECTED",
        name: whatsapp.name,
      });
    } catch (err) {
      logger.error(`❌ Erro ao processar desconexão: ${err}`);
    }
  }
```

---

## PASSO 3: Adicionar Rota

**Arquivo:** `backend/src/routes/whatsappWebhookRoutes.ts`

**Altere de:**
```typescript
router.post("/", WhatsAppWebhookController.handle);
```

**Para:**
```typescript
router.post("/", WhatsAppWebhookController.handle);
router.post("/evolution", WhatsAppWebhookController.handleEvolution);
```

---

## PASSO 4: Testar com CURL

### Teste 1: Connection Update
```bash
curl -X POST http://localhost:3100/api/webhook/whatsapp/evolution \
  -H "Content-Type: application/json" \
  -d '{
    "event": "connection.update",
    "instance": "mkt",
    "data": {
      "state": "open",
      "phone": "5511999999999"
    }
  }'
```

### Teste 2: QR Code
```bash
curl -X POST http://localhost:3100/api/webhook/whatsapp/evolution \
  -H "Content-Type: application/json" \
  -d '{
    "event": "qrcode.updated",
    "instance": "mkt",
    "data": {
      "qrCode": {
        "base64": "iVBORw0KGgoAAAANSUhEUgAA..."
      }
    }
  }'
```

---

## PASSO 5: Verificar Banco

```sql
SELECT id, name, status, number, qrcode 
FROM "Whatsapps" 
WHERE name = 'mkt';

-- Esperado:
-- status: CONNECTED
-- number: 5511999999999
-- qrcode: NULL (após conectar)
```

---

**Pronto! A implementação está completa! 🎉**
