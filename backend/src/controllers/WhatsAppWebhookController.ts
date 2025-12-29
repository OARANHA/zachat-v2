import { Request, Response } from "express";
import AppError from "../errors/AppError";
import { logger } from "../utils/logger";
import HandleMessage from "../services/WbotServices/helpers/HandleMessage";
import verifyBusinessHours from "../services/WbotServices/helpers/VerifyBusinessHours";
import { Op } from "sequelize";
import Message from "../models/Message";
import Ticket from "../models/Ticket";
import Whatsapp from "../models/Whatsapp";
import { getIO } from "../libs/socket";

interface WebhookEventData {
  sessionId: string;
  event: string;
  data: any;
}

interface MessageData {
  from: string;
  to?: string;
  body: string;
  timestamp: number;
  messageId: string;
  mediaType?: string;
  mediaUrl?: string;
  hasMedia?: boolean;
  fromMe?: boolean;
  type?: string;
  media?: { data?: string; mimetype?: string; filename?: string };
}

interface MessageAckData {
  messageId: string;
  ack: number;
}

interface MessageEditData {
  messageId: string;
  newBody: string;
}

interface MessageRevokeData {
  body?: string;
}

interface BatteryData {
  battery: number;
  plugged: boolean;
}

interface SessionStatusData {
  status: string;
  qrCode?: string;
  phoneNumber?: string;
}

interface ConnectionStatusData {
  status: string;
}

// Interface compatível com o esperado pelo HandleMessage
interface WbotMessage {
  id: { id: string };
  from: string;
  to: string;
  body: string;
  timestamp: number;
  hasMedia: boolean;
  mediaType?: string;
  mediaUrl?: string;
  fromMe: boolean;
  type: string;
  ack: number;
  status?: string;
  wabaMediaId?: string;
  read?: boolean;
  isDeleted?: boolean;
  quotedMsgId?: string;
  ticketId?: number;
  contactId?: number;
  userId?: number;
  scheduleDate?: Date;
  sendType?: string;
  tenantId?: number;
  idFront?: string;
  // Propriedades necessárias para compatibilidade com Message
  deviceType?: string;
  broadcast?: boolean;
  isStatus?: boolean;
  isGif?: boolean;
  // Métodos necessários para compatibilidade
  getChat(): Promise<any>;
  getContact(): Promise<any>;
}

import Queue from "../libs/Queue";

class WhatsAppWebhookController {
  // Helper para localizar Whatsapp pela sessionId (nome/identificador Evolution)
  private static async findWhatsappBySession(sessionId: string): Promise<any | null> {
    if (!sessionId) return null;
    const byName = await (Whatsapp as any).findOne({ where: { name: sessionId } });
    if (byName) return byName;
    const bySession = await (Whatsapp as any).findOne({ where: { session: sessionId } });
    if (bySession) return bySession;
    return null;
  }
  // Enfileira mensagem de forma "fire-and-forget" para não bloquear o webhook
  static enqueueIncomingMessage(sessionId: string, data: MessageData): void {
    WhatsAppWebhookController.handleIncomingMessage(sessionId, data).catch(err => {
      logger.error(`enqueueIncomingMessage failed: ${err}`);
    });
  }
  static async handle(req: Request, res: Response): Promise<Response> {
    try {
      const { sessionId, event, data } = req.body as WebhookEventData;

      switch (event) {
        case "message":
          WhatsAppWebhookController.enqueueIncomingMessage(sessionId, data);
          break;
        case "message_create":
          WhatsAppWebhookController.enqueueIncomingMessage(sessionId, data);
          break;
        case "session.status":
          await WhatsAppWebhookController.handleSessionStatus(sessionId, data);
          break;
        case "change_state":
          await WhatsAppWebhookController.handleChangeState(sessionId, data);
          break;
        case "qr_code":
          await WhatsAppWebhookController.handleQrCode(sessionId, data);
          break;
        case "connection.status":
          await WhatsAppWebhookController.handleConnectionStatus(sessionId, data);
          break;
        case "disconnected":
          await WhatsAppWebhookController.handleDisconnected(sessionId, data);
          break;
        case "message_ack":
          await WhatsAppWebhookController.handleMessageAck(sessionId, data);
          break;
        case "message_edit":
          await WhatsAppWebhookController.handleMessageEdit(sessionId, data);
          break;
        case "message_revoke_everyone":
          await WhatsAppWebhookController.handleMessageRevoke(sessionId, data);
          break;
        case "change_battery":
          await WhatsAppWebhookController.handleBatteryChange(sessionId, data);
          break;
        default:
          logger.warn(`Unknown event type: ${event}`);
      }

      return res.sendStatus(200);
    } catch (err) {
      logger.error(`Error handling webhook: ${err}`);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  private static async handleIncomingMessage(sessionId: string, data: MessageData): Promise<void> {
    // Mantido para reuso interno; fila usará enqueueIncomingMessage para execução assíncrona
  
    try {
      logger.info(`Processing incoming message from session ${sessionId}: ${data.messageId}`);
      
      // Adaptar dados do gateway para o formato esperado pelo HandleMessage
      // OBS: esta função é executada pelo job em background; o webhook responde imediatamente

      const adaptedMessage: WbotMessage & { media?: { data?: string; mimetype?: string; filename?: string } } = {
        id: { id: data.messageId },
        from: data.from,
        to: data.to || "",
        body: data.body,
        timestamp: data.timestamp,
        hasMedia: data.hasMedia || Boolean(data.media),
        mediaType: data.mediaType || data?.media?.mimetype?.split('/')?.[0],
        mediaUrl: data.mediaUrl,
        fromMe: Boolean(data.fromMe),
        type: data.type || data.mediaType || "chat",
        ack: 0,
        status: "received",
        wabaMediaId: undefined,
        read: false,
        isDeleted: false,
        quotedMsgId: undefined,
        ticketId: undefined,
        contactId: undefined,
        userId: undefined,
        scheduleDate: undefined,
        sendType: "chat",
        tenantId: undefined,
        idFront: undefined,
        // Propriedades necessárias para compatibilidade com Message
        deviceType: undefined,
        broadcast: false,
        isStatus: false,
        isGif: false,
        // Métodos necessários para compatibilidade
        getChat: async () => ({ isGroup: false, unreadCount: 1 }),
        getContact: async () => ({ id: data.from, name: "Contact" }),
        media: data.media
      };

      // Enfileirar processamento para execução assíncrona
      await Queue.add("ProcessIncomingWhatsAppMessage", {
        sessionId,
        adaptedMessage
      });

      // Emitir evento para frontend (opcionalmente podemos emitir aqui um stub rápido)
      const io = getIO();
      io.to(sessionId).emit("whatsappMessage", {
        action: "queued",
        message: {
          id: adaptedMessage.id.id,
          from: adaptedMessage.from,
          body: adaptedMessage.body,
          timestamp: adaptedMessage.timestamp
        }
      });
    } catch (err) {
      logger.error(`Error handling incoming message: ${err}`);
    }
  }

  private static async handleSessionStatus(sessionId: string, data: SessionStatusData): Promise<void> {
    try {
      logger.info(`Session ${sessionId} status changed to: ${data.status}`);
      
      // ✅ NOVO: Atualizar o banco de dados com status e QR code se disponível
      try {
        const whatsapp = await WhatsAppWebhookController.findWhatsappBySession(String(sessionId));
        if (whatsapp) {
          const updateData: any = { status: data.status };
          if (data.qrCode) {
            updateData.qrcode = data.qrCode;
            logger.info(`QR code updated in database for session ${sessionId}`);
          }
          await whatsapp.update(updateData);
        }
      } catch (dbErr: any) {
        logger.warn(`Failed to update session status in database: ${dbErr.message}`);
      }
      
      // ✅ Emitir socket event para toda a plataforma com dados atualizados
      const io = getIO();
      const whatsapp = await (Whatsapp as any).findOne({ where: { id: sessionId } });
      if (whatsapp) {
        io.emit(`${whatsapp.tenantId}:whatsappSession`, {
          action: "update",
          session: whatsapp.toJSON()
        });
      }
    } catch (err) {
      logger.error(`Error handling session status: ${err}`);
    }
  }

  private static async handleChangeState(sessionId: string, data: SessionStatusData): Promise<void> {
    try {
      logger.info(`Session ${sessionId} state changed to: ${data.status}`);

      // ✅ NOVO: Atualizar o banco de dados com novo status
      try {
        const whatsapp = await WhatsAppWebhookController.findWhatsappBySession(String(sessionId));
        if (whatsapp && data.status) {
          const updateData: any = { status: data.status };
          if (data.phoneNumber) {
            updateData.number = data.phoneNumber;
          }
          await whatsapp.update(updateData);
          logger.info(`Session ${sessionId} status updated to ${data.status}`);
        }
      } catch (dbErr: any) {
        logger.warn(`Failed to update session change_state in database: ${dbErr.message}`);
      }

      // ✅ Emitir socket event para toda a plataforma com dados atualizados
      const io = getIO();
      const whatsapp = await (Whatsapp as any).findOne({ where: { id: sessionId } });
      if (whatsapp) {
        io.emit(`${whatsapp.tenantId}:whatsappSession`, {
          action: "update",
          session: whatsapp.toJSON()
        });
      }
    } catch (err) {
      logger.error(`Error handling change state: ${err}`);
    }
  }

  private static async handleQrCode(sessionId: string, data: any): Promise<void> {
    try {
      logger.info(`QR Code received for session ${sessionId}`);
      
      // ✅ NOVO: Atualizar o banco de dados com o QR code
      try {
        const whatsapp = await WhatsAppWebhookController.findWhatsappBySession(String(sessionId));
        if (whatsapp && data.qrCode) {
          await whatsapp.update({ qrcode: data.qrCode });
          logger.info(`QR code saved to database for session ${sessionId}`);
        }
      } catch (dbErr: any) {
        logger.warn(`Failed to save QR code to database: ${dbErr.message}`);
      }
      
      // ✅ Emitir socket event para toda a plataforma (não só para a sala sessionId)
      const io = getIO();
      const whatsapp = await WhatsAppWebhookController.findWhatsappBySession(String(sessionId));
      if (whatsapp) {
        io.emit(`${whatsapp.tenantId}:whatsappSession`, {
          action: "qrcode",
          session: whatsapp.toJSON()
        });
      }
    } catch (err) {
      logger.error(`Error handling QR code: ${err}`);
    }
  }

  private static async handleConnectionStatus(sessionId: string, data: ConnectionStatusData): Promise<void> {
    try {
      logger.info(`Connection status for session ${sessionId}: ${data.status}`);
      
      const io = getIO();
      io.to(sessionId).emit("whatsappSession", {
        action: "connection",
        session: {
          id: sessionId,
          status: data.status
        }
      });
    } catch (err) {
      logger.error(`Error handling connection status: ${err}`);
    }
  }

  private static async handleDisconnected(sessionId: string, data: any): Promise<void> {
    try {
      logger.info(`Session ${sessionId} disconnected`);
      
      const io = getIO();
      io.to(sessionId).emit("whatsappSession", {
        action: "disconnect",
        session: {
          id: sessionId
        }
      });
    } catch (err) {
      logger.error(`Error handling disconnection: ${err}`);
    }
  }

  private static async handleMessageAck(sessionId: string, data: MessageAckData): Promise<void> {
    try {
      logger.info(`Message ACK received for session ${sessionId}: ${data.messageId} - ACK: ${data.ack}`);
      
      // Atualizar status da mensagem no banco
      await Message.update(
        { 
          ack: data.ack,
          read: data.ack >= 3 ? true : false
        },
        { 
          where: { 
            id: data.messageId 
          } 
        }
      );

      // Emitir evento para frontend
      const io = getIO();
      io.to(sessionId).emit("whatsappMessage", {
        action: "update_ack",
        message: {
          id: data.messageId,
          ack: data.ack
        }
      });
    } catch (err) {
      logger.error(`Error handling message ACK: ${err}`);
    }
  }

  private static async handleMessageEdit(sessionId: string, data: MessageEditData): Promise<void> {
    try {
      logger.info(`Message edit received for session ${sessionId}: ${data.messageId}`);
      
      // Atualizar mensagem no banco
      await Message.update(
        { 
          body: data.newBody,
          editedAt: new Date()
        },
        { 
          where: { 
            id: data.messageId 
          } 
        }
      );

      // Emitir evento para frontend
      const io = getIO();
      io.to(sessionId).emit("whatsappMessage", {
        action: "update",
        message: {
          id: data.messageId,
          body: data.newBody,
          editedAt: new Date()
        }
      });
    } catch (err) {
      logger.error(`Error handling message edit: ${err}`);
    }
  }

  private static async handleMessageRevoke(sessionId: string, data: MessageRevokeData): Promise<void> {
    try {
      logger.info(`Message revoke received for session ${sessionId}`);
      
      // Marcar mensagem como deletada
      // Nota: Não temos o messageId original, apenas o body da mensagem revogada
      // Idealmente o gateway deveria enviar o messageId da mensagem original
      
      // Emitir evento para frontend
      const io = getIO();
      io.to(sessionId).emit("whatsappMessage", {
        action: "delete",
        message: {
          body: data.body,
          isDeleted: true,
          deletedAt: new Date()
        }
      });
    } catch (err) {
      logger.error(`Error handling message revoke: ${err}`);
    }
  }

  private static async handleBatteryChange(sessionId: string, data: BatteryData): Promise<void> {
    try {
      logger.info(`Battery status for session ${sessionId}: ${data.battery}% - Plugged: ${data.plugged}`);
      
      // Emitir evento para frontend
      const io = getIO();
      io.to(sessionId).emit("whatsappSession", {
        action: "battery",
        session: {
          id: sessionId,
          battery: data.battery,
          plugged: data.plugged
        }
      });
    } catch (err) {
      logger.error(`Error handling battery change: ${err}`);
    }
  }
}

export default WhatsAppWebhookController;











