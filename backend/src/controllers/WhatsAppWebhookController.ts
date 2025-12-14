import { Request, Response } from "express";
import AppError from "../errors/AppError";
import { logger } from "../utils/logger";
import HandleMessage from "../services/WbotServices/helpers/HandleMessage";
import verifyBusinessHours from "../services/WbotServices/helpers/VerifyBusinessHours";
import { Op } from "sequelize";
import Message from "../models/Message";
import Ticket from "../models/Ticket";
import { getIO } from "../libs/socket";

interface WebhookEventData {
  sessionId: string;
  event: string;
  data: any;
}

interface MessageData {
  from: string;
  body: string;
  timestamp: number;
  messageId: string;
  mediaType?: string;
  mediaUrl?: string;
  hasMedia?: boolean;
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

class WhatsAppWebhookController {
  static async handle(req: Request, res: Response): Promise<Response> {
    try {
      const { sessionId, event, data } = req.body as WebhookEventData;

      switch (event) {
        case "message":
          await WhatsAppWebhookController.handleIncomingMessage(sessionId, data);
          break;
        case "message_create":
          await WhatsAppWebhookController.handleIncomingMessage(sessionId, data);
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
    try {
      logger.info(`Processing incoming message from session ${sessionId}: ${data.messageId}`);
      
      // Adaptar dados do gateway para o formato esperado pelo HandleMessage
      const adaptedMessage: WbotMessage = {
        id: { id: data.messageId },
        from: data.from,
        to: "", // Será preenchido posteriormente
        body: data.body,
        timestamp: data.timestamp,
        hasMedia: data.hasMedia || false,
        mediaType: data.mediaType,
        mediaUrl: data.mediaUrl,
        fromMe: false,
        type: data.mediaType || "chat",
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
        getChat: async () => ({ isGroup: false }),
        getContact: async () => ({ id: data.from, name: "Contact" })
      };

      // Criar um objeto wbot mock para compatibilidade
      const mockWbot = {
        id: parseInt(sessionId),
        getChat: async () => ({ isGroup: false }),
        getContactById: async (id: string) => ({ id, name: "Contact" })
      };

      await HandleMessage(adaptedMessage as any, mockWbot as any);
      
      // Emitir evento para frontend
      const io = getIO();
      io.to(sessionId).emit("whatsappMessage", {
        action: "create",
        message: adaptedMessage
      });
    } catch (err) {
      logger.error(`Error handling incoming message: ${err}`);
    }
  }

  private static async handleSessionStatus(sessionId: string, data: SessionStatusData): Promise<void> {
    try {
      logger.info(`Session ${sessionId} status changed to: ${data.status}`);
      
      const io = getIO();
      io.to(sessionId).emit("whatsappSession", {
        action: "update",
        session: {
          id: sessionId,
          status: data.status,
          qrCode: data.qrCode,
          phoneNumber: data.phoneNumber
        }
      });
    } catch (err) {
      logger.error(`Error handling session status: ${err}`);
    }
  }

  private static async handleChangeState(sessionId: string, data: SessionStatusData): Promise<void> {
    try {
      logger.info(`Session ${sessionId} state changed to: ${data.status}`);
      
      const io = getIO();
      io.to(sessionId).emit("whatsappSession", {
        action: "update",
        session: {
          id: sessionId,
          status: data.status,
          qrCode: data.qrCode,
          phoneNumber: data.phoneNumber
        }
      });
    } catch (err) {
      logger.error(`Error handling change state: ${err}`);
    }
  }

  private static async handleQrCode(sessionId: string, data: any): Promise<void> {
    try {
      logger.info(`QR Code received for session ${sessionId}`);
      
      const io = getIO();
      io.to(sessionId).emit("whatsappSession", {
        action: "qrcode",
        session: {
          id: sessionId,
          qrCode: data.qrCode
        }
      });
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