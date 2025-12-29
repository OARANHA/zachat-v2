import { Request, Response } from "express";
import { logger } from "../utils/logger";
import Whatsapp from "../models/Whatsapp";
import Queue from "../libs/Queue";
import { getIO } from "../libs/socket";

/**
 * EvolutionWebhookController
 * Alinha eventos típicos da Evolution API:
 * - messages.upsert (mensagens novas)
 * - messages.update (acks/updates)
 * - qrcode.updated (novo QR)
 * - connection.update (mudança de estado)
 *
 * Ajuste os nomes exatos conforme a doc da instância ativa.
 */
class EvolutionWebhookController {
  static async handle(req: Request, res: Response): Promise<Response> {
    try {
      const event = (req.body?.event || req.body?.type || "").toString();
      const sessionId = String(
        req.body?.instance ||      // ← Evolution usa "instance"
        req.body?.instanceName ||  // ← Evolution Manager usa "instanceName"
        req.body?.session || 
        req.body?.sessionId || 
        ""
      );
      const data = req.body?.data || req.body;

      logger.info(`Evolution Webhook | event=${event} session=${sessionId}`);

      switch (event) {
        // Mensagens novas
        case "MESSAGES_UPSERT":
        case "messages.upsert":
        case "message.upsert": {
          await EvolutionWebhookController.handleIncomingMessage(sessionId, data);
          break;
        }
        // Atualizações/ACK de mensagem
        case "MESSAGES_UPDATE":
        case "messages.update":
        case "message.update": {
          await EvolutionWebhookController.handleMessageUpdate(sessionId, data);
          break;
        }
        // QR Code atualizado
        case "QRCODE_UPDATED":
        case "qrcode.updated":
        case "qr.updated":
        case "qr": {
          await EvolutionWebhookController.handleQrCode(sessionId, data);
          break;
        }
        // Mudança de estado de conexão
        case "CONNECTION_UPDATE":
        case "connection.update":
        case "connection.state":
        case "connection": {
          await EvolutionWebhookController.handleConnectionUpdate(sessionId, data);
          break;
        }
        // Upserts auxiliares (podem ser usados no futuro para sync)
        case "CHATS_UPSERT":
        case "CONTACTS_UPSERT": {
          logger.info(`Evolution Webhook | upsert event received: ${event}`);
          break;
        }
        default: {
          logger.warn(`Evolution Webhook | evento não mapeado: ${event}`);
          break;
        }
      }
    } catch (err) {
      logger.error(`Evolution Webhook error: ${err}`);
    }
    // Sempre 200 para evitar retries excessivos
    return res.status(200).json({ received: true });
  }

  private static async handleIncomingMessage(sessionId: string, payload: any): Promise<void> {
    if (!sessionId) return;

    const msg = Array.isArray(payload?.messages) ? payload.messages[0] : payload?.message || payload;

    const adaptedMessage = {
      message_id: msg?.key?.id || msg?.id || "",
      body: msg?.message?.conversation || msg?.message?.extendedTextMessage?.text || msg?.text || "",
      fromMe: !!msg?.key?.fromMe,
      sender: msg?.key?.participant || msg?.key?.remoteJid || msg?.from || msg?.sender || "",
      timestamp: Math.floor(Date.now() / 1000)
    };

    await Queue.add("ProcessIncomingWhatsAppMessage", {
      sessionId,
      adaptedMessage
    });

    const io = getIO();
    io.to(sessionId).emit("whatsappMessage", { action: "new", message: adaptedMessage });
  }

  private static async handleMessageUpdate(sessionId: string, payload: any): Promise<void> {
    const ack = payload?.status || payload?.ack;
    const messageId = payload?.key?.id || payload?.id;

    const io = getIO();
    io.to(sessionId).emit("whatsappMessage", { action: "ack", message: { id: messageId, ack } });
  }

  private static async findWhatsappBySession(sessionId: string): Promise<any | null> {
    // Tenta casar pelo campo name (string) e, em fallback, por session
    const whereByName = { name: sessionId } as any;
    const byName = await (Whatsapp as any).findOne({ where: whereByName });
    if (byName) return byName;

    const whereBySession = { session: sessionId } as any;
    const bySession = await (Whatsapp as any).findOne({ where: whereBySession });
    if (bySession) return bySession;

    return null;
  }

  private static async handleQrCode(sessionId: string, payload: any): Promise<void> {
    const qrCode = payload?.qrcode || payload?.qrCode || payload?.base64 || payload?.image || payload?.code;
    if (!sessionId || !qrCode) return;

    const whatsapp = await EvolutionWebhookController.findWhatsappBySession(sessionId);
    if (whatsapp) {
      await whatsapp.update({ qrcode: qrCode });
      const io = getIO();
      io.emit(`${whatsapp.tenantId}:whatsappSession`, { action: "qrcode", session: whatsapp.toJSON() });
    }
  }

  private static async handleConnectionUpdate(sessionId: string, payload: any): Promise<void> {
    const state = (payload?.state || payload?.status || payload)?.toString().toLowerCase();

    const map: Record<string, string> = {
      open: "connected",
      connected: "connected",
      close: "disconnected",
      disconnected: "disconnected",
      qr: "qr_code",
      connecting: "connecting"
    };

    const status = (map[state] || "connecting") as any;

    const whatsapp = await EvolutionWebhookController.findWhatsappBySession(sessionId);
    if (whatsapp) {
      await whatsapp.update({ status });
      const io = getIO();
      io.emit(`${whatsapp.tenantId}:whatsappSession`, { action: "update", session: whatsapp.toJSON() });
    }
  }
}

export default EvolutionWebhookController;
