/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import { join } from "path";
import {
  Message as WbotMessage,
  Buttons,
  Client,
  List,
  MessageMedia
} from "whatsapp-web.js";
import { Op } from "sequelize";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import { logger } from "../../utils/logger";
import { sleepRandomTime } from "../../utils/sleepRandomTime";
import Contact from "../../models/Contact";
import GetWbotMessage from "../../helpers/GetWbotMessage";
// import SetTicketMessagesAsRead from "../../helpers/SetTicketMessagesAsRead";

interface Session extends Client {
  id: number;
}

interface GatewaySession {
  id: string;
  status: string;
  qrCode?: string;
  connectionStatus?: string;
  sendMessage: (chatId: string, content: any, options?: any) => Promise<any>;
}

// Type guard para verificar se é Client (wbot local)
function isClient(wbot: any): wbot is Client {
  return wbot && typeof wbot === 'object' && 'info' in wbot && typeof wbot.info === 'function';
}

// Type guard para verificar se é GatewaySession
function isGatewaySession(wbot: any): wbot is GatewaySession {
  return wbot && typeof wbot === 'object' && 'sendMessage' in wbot && typeof wbot.sendMessage === 'function' && !('info' in wbot);
}

const SendMessagesSystemWbot = async (
  wbot: Session | GatewaySession,
  tenantId: number | string
): Promise<void> => {
  const where = {
    fromMe: true,
    messageId: { [Op.is]: null },
    status: "pending",
    [Op.or]: [
      {
        scheduleDate: {
          [Op.lte]: new Date()
        }
      },
      {
        scheduleDate: { [Op.is]: null }
      }
    ]
  };
  const messages = await Message.findAll({
    where,
    include: [
      {
        model: Contact,
        as: "contact",
        where: {
          tenantId,
          number: {
            [Op.notIn]: ["", "null"]
          }
        }
      },
      {
        model: Ticket,
        as: "ticket",
        where: {
          tenantId,
          [Op.or]: {
            status: { [Op.ne]: "closed" },
            isFarewellMessage: true
          },
          channel: "whatsapp",
          whatsappId: typeof wbot === 'object' && 'id' in wbot ? wbot.id : undefined
        },
        include: ["contact"]
      },
      {
        model: Message,
        as: "quotedMsg",
        include: ["contact"]
      }
    ],
    order: [["createdAt", "ASC"]]
  });
  let sendedMessage;

  // logger.info(
  //   `SystemWbot SendMessages | Count: ${messages.length} | Tenant: ${tenantId} `
  // );

  for (const message of messages) {
    let quotedMsgSerializedId: string | undefined;
    const { ticket } = message;
    const contactNumber = ticket.contact.number;
    const typeGroup = ticket?.isGroup ? "g" : "c";
    const chatId = `${contactNumber}@${typeGroup}.us`;

    if (message.quotedMsg) {
      const inCache: WbotMessage | undefined = await GetWbotMessage(
        ticket,
        message.quotedMsg.messageId,
        200
      );
      if (inCache) {
        quotedMsgSerializedId = inCache?.id?._serialized || undefined;
      } else {
        quotedMsgSerializedId = undefined;
      }
      // eslint-disable-next-line no-underscore-dangle
    }

    try {
      // MIGRAÇÃO: Adaptar para trabalhar com gateway ou wbot local dependendo do tipo
      if (isClient(wbot)) {
        // Usando wbot local (legado) - manter lógica original
        if (message.mediaType !== "chat" && message.mediaName) {
          const customPath = join(__dirname, "..", "..", "..", "public");
          const mediaPath = join(customPath, message.mediaName);
          const newMedia = MessageMedia.fromFilePath(mediaPath);
          sendedMessage = await wbot.sendMessage(chatId, newMedia, {
            quotedMessageId: quotedMsgSerializedId,
            linkPreview: false, // fix: send a message takes 2 seconds when there's a link on message body
            sendAudioAsVoice: true
          });
          logger.info("sendMessage media");
        } else {
          sendedMessage = await wbot.sendMessage(chatId, message.body, {
            quotedMessageId: quotedMsgSerializedId,
            linkPreview: false // fix: send a message takes 2 seconds when there's a link on message body
          });
          logger.info("sendMessage text");
        }
      } else if (isGatewaySession(wbot)) {
        // Usando gateway - dados compatíveis com interface antiga
        if (message.mediaType !== "chat" && message.mediaName) {
          const customPath = join(__dirname, "..", "..", "..", "public");
          const mediaPath = join(customPath, message.mediaName);
          const newMedia = MessageMedia.fromFilePath(mediaPath);
          sendedMessage = await wbot.sendMessage(chatId, newMedia, {
            quotedMessageId: quotedMsgSerializedId,
            linkPreview: false, // fix: send a message takes 2 seconds when there's a link on message body
            sendAudioAsVoice: true
          });
          logger.info("sendMessage media");
        } else {
          sendedMessage = await wbot.sendMessage(chatId, message.body, {
            quotedMessageId: quotedMsgSerializedId,
            linkPreview: false // fix: send a message takes 2 seconds when there's a link on message body
          });
          logger.info("sendMessage text");
        }
      } else {
        throw new Error("Tipo de sessão WhatsApp inválido");
      }

      // enviar old_id para substituir no front a mensagem corretamente
      const messageToUpdate = {
        ...message,
        ...sendedMessage,
        id: message.id,
        messageId: typeof sendedMessage === 'object' && 'id' in sendedMessage 
          ? sendedMessage.id.id 
          : (sendedMessage as any)?._serialized,
        status: "sended"
      };

      await Message.update(
        { ...messageToUpdate },
        { where: { id: message.id } }
      );

      logger.info("Message Update");
      // await SetTicketMessagesAsRead(ticket);

      // delay para processamento da mensagem
      await sleepRandomTime({
        minMilliseconds: Number(process.env.MIN_SLEEP_INTERVAL || 500),
        maxMilliseconds: Number(process.env.MAX_SLEEP_INTERVAL || 2000)
      });

      const messageId = typeof sendedMessage === 'object' && 'id' in sendedMessage 
        ? sendedMessage.id.id 
        : (sendedMessage as any)?._serialized;

      logger.info("sendMessage", messageId);
    } catch (error) {
      const idMessage = message.id;
      const ticketId = message.ticket.id;

      if (error.code === "ENOENT") {
        await Message.destroy({
          where: { id: message.id }
        });
      }

      logger.error(
        `Error message is (tenant: ${tenantId} | Ticket: ${ticketId})`
      );
      logger.error(`Error send message (id: ${idMessage})::${error}`);
    }
  }
};

export default SendMessagesSystemWbot;
