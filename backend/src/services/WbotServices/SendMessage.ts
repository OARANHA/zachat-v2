import Ticket from "../../models/Ticket";
import { logger } from "../../utils/logger";
import WhatsAppProvider from "../../providers/WhatsAppProvider";
import { SendMessageDTO } from "../../interfaces/IChannelProvider";

interface MessageData {
  body: string;
  fromMe?: boolean;
  read?: boolean;
  quotedMsg?: MessageData;
}

interface Message {
  id?: string;
  body: string;
  fromMe?: boolean;
  read?: boolean;
  quotedMsg?: Message;
  mediaUrl?: string;
}

const isNumeric = (value: string) => /^[\d]+$/.test(value);

const getBodyLink = (template: string, contacts: Array<any>) => {
  let message = template;
  contacts.forEach(contact => {
    const link = `https://wa.me/${contact.number}?text=${encodeURIComponent(
      contact.message
    )}`;
    message = `${message}\n*${contact.name}*: ${link}`;
  });
  
  return message;
};

const getBody = (template: string, contacts: Array<any>) => {
  let message = template;
  contacts.forEach(contact => {
    message = `${message}\n*${contact.name}*: ${contact.number}`;
  });
  
  return message;
};

const GetProfilePicUrl = async (
  number: string,
  tenantId: number | string
): Promise<string> => {
  try {
    const result = await WhatsAppProvider.getInstance().sendMessage({
      to: number,
      body: "",
      metadata: { tenantId }
    });

    logger.info(`Profile pic URL requested for ${number}`);
    return ""; // TODO: Implementar no gateway
  } catch (err) {
    logger.warn(`Could not get profile pic url for ${number}. Error: ${err}`);
    return "";
  }
};

const buildMessageData = (message: string, contact: any) => {
  if (message.includes("{nome}")) {
    return message.replace(/{nome}/g, contact.name);
  }

  if (message.includes("{numero}")) {
    return message.replace(/{numero}/g, contact.number);
  }

  if (message.includes("{email}")) {
    return message.replace(/{email}/g, contact.email);
  }

  if (message.includes("{greeting}")) {
    const greeting =
      new Date().getHours() + 1 < 12
        ? "Bom dia"
        : new Date().getHours() + 1 < 18
        ? "Boa tarde"
        : "Boa noite";
    return message.replace(/{greeting}/g, greeting);
  }

  return message;
};

export const PrepareAndSendMessage = async (
  contact: any,
  message: string,
  tenantId: number | string,
  medias?: Express.Multer.File[],
  quotedMsg?: Message,
  link?: boolean
): Promise<any> => {
  const number = isNumeric(contact.number) ? `${contact.number}@c.us` : contact.number;

  const bodyMessage = buildMessageData(message, contact);

  const messageData: SendMessageDTO = {
    to: number,
    body: bodyMessage,
    mediaUrl: medias && medias.length > 0 ? medias[0].filename : undefined,
    metadata: {
      tenantId,
      ticketId: contact.id,
      contactId: contact.id,
      quotedMsgId: quotedMsg?.id
    }
  };

  try {
    const result = await WhatsAppProvider.getInstance().sendMessage(messageData);
    logger.info(`Message sent to ${contact.number}: ${result.messageId}`);
    return result;
  } catch (err) {
    logger.error(`Error sending message to ${contact.number}: ${err}`);
    throw err;
  }
};

export interface SendMessageParams {
  body: string;
  ticket: Ticket;
  quotedMsg?: Message;
  medias?: Express.Multer.File[];
  tenantId: number | string;
}

export const SendMessage = async ({
  body,
  ticket,
  quotedMsg,
  medias,
  tenantId
}: SendMessageParams): Promise<any> => {
  try {
    const number = isNumeric(ticket.contact.number)
      ? `${ticket.contact.number}@c.us`
      : ticket.contact.number;

    const messageData: SendMessageDTO = {
      to: number,
      body,
      mediaUrl: medias && medias.length > 0 ? medias[0].filename : undefined,
      metadata: {
        tenantId,
        ticketId: ticket.id,
        contactId: ticket.contact.id,
        quotedMsgId: quotedMsg?.id
      }
    };

    const result = await WhatsAppProvider.getInstance().sendMessage(messageData);

    logger.info(`Message sent to ticket ${ticket.id}: ${result.messageId}`);
    return result;
  } catch (err) {
    logger.error(`Error sending message to ticket ${ticket.id}: ${err}`);
    throw err;
  }
};

export default SendMessage;
