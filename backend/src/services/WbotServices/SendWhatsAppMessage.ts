// Envio via WhatsAppProvider (gateway) em vez de usar whatsapp-web.js diretamente
import AppError from "../../errors/AppError";
import WhatsAppProvider from "../../providers/WhatsAppProvider";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import UserMessagesLog from "../../models/UserMessagesLog";
import { logger } from "../../utils/logger";
// import { StartWhatsAppSessionVerify } from "./StartWhatsAppSessionVerify";

interface Request {
  body: string;
  ticket: Ticket;
  quotedMsg?: Message;
  userId?: number | string | undefined;
}

const SendWhatsAppMessage = async ({
  body,
  ticket,
  quotedMsg,
  userId
}: Request): Promise<any> => {
  try {
    const to = `${ticket.contact.number}@${ticket.isGroup ? "g" : "c"}.us`;
    const provider = WhatsAppProvider.getInstance();
    const resp = await provider.sendMessage({
      to,
      body,
      mediaUrl: undefined,
      metadata: { sessionId: String(ticket.whatsappId) }
    });

    await ticket.update({
      lastMessage: body,
      lastMessageAt: new Date().getTime()
    });
    try {
      if (userId) {
        await UserMessagesLog.create({
          messageId: resp.messageId,
          userId,
          ticketId: ticket.id
        });
      }
    } catch (error) {
      logger.error(`Error criar log mensagem ${error}`);
    }
    return resp;
  } catch (err) {
    logger.error(`SendWhatsAppMessage | Error: ${err}`);
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};

export default SendWhatsAppMessage;
