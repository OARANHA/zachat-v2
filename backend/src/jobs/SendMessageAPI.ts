import WhatsAppProvider from "../providers/WhatsAppProvider";
import UpsertMessageAPIService from "../services/ApiMessageService/UpsertMessageAPIService";
import Queue from "../libs/Queue";
import CheckIsValidContact from "../services/WbotServices/CheckIsValidContact";
import AppError from "../errors/AppError";
import VerifyContact from "../services/WbotServices/helpers/VerifyContact";
import FindOrCreateTicketService from "../services/TicketServices/FindOrCreateTicketService";
import CreateMessageSystemService from "../services/MessageServices/CreateMessageSystemService";
import { logger } from "../utils/logger";

export default {
  key: "SendMessageAPI",
  options: {
    delay: 6000,
    attempts: 50,
    removeOnComplete: true,
    removeOnFail: false,
    backoff: {
      type: "fixed",
      delay: 60000 * 3 // 3 min
    }
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async handle({ data }: any) {
    try {
      const provider = WhatsAppProvider.getInstance();
      
      // Verificar se o número é válido usando o provider
      const session = await provider.getSession(data.sessionId);
      if (!session || session.status !== 'connected') {
        const payload = {
          ack: -2,
          body: data.body,
          messageId: "",
          number: data.number,
          externalKey: data.externalKey,
          error: "session not connected",
          type: "hookMessageStatus",
          authToken: data.authToken
        };

        if (data?.apiConfig?.urlMessageStatus) {
          Queue.add("WebHooksAPI", {
            url: data.apiConfig.urlMessageStatus,
            type: payload.type,
            payload
          });
        }
        return payload;
      }
      
      // Enviar mensagem usando o provider
      const messageData = {
        to: data.number,
        body: data.body,
        mediaUrl: data.mediaUrl,
        metadata: {
          sessionId: data.sessionId
        }
      };
      
      const result = await provider.sendMessage(messageData);
      
      if (result.status === "failed") {
        throw new AppError(`Erro ao enviar mensagem: ${result.error}`);
      }
      
      // Lógica existente para validação de contato e criação de ticket
      try {
        // Criar objeto compatível com WbotContact para VerifyContact
        const msgContact = {
          id: { _serialized: data.number },
          pushname: "",
          name: "",
          isMyContact: false,
          isUser: true,
          isWAContact: true,
          isGroup: false,
          number: data.number.replace(/\D/g, "")
        } as any;
        
        const contact = await VerifyContact(msgContact, data.tenantId);
        const ticket = await FindOrCreateTicketService({
          contact,
          whatsappId: session.phoneNumber || data.sessionId,
          unreadMessages: 0,
          tenantId: data.tenantId,
          groupContact: undefined,
          msg: data,
          channel: "whatsapp"
        });

        await CreateMessageSystemService({
          msg: data,
          tenantId: data.tenantId,
          ticket,
          sendType: "API",
          status: "pending"
        });

        await ticket.update({
          apiConfig: {
            ...data.apiConfig,
            externalKey: data.externalKey
          }
        });
      } catch (error) {
        const payload = {
          ack: -2,
          body: data.body,
          messageId: "",
          number: data.number,
          externalKey: data.externalKey,
          error: "error creating ticket",
          type: "hookMessageStatus",
          authToken: data.authToken
        };

        if (data?.apiConfig?.urlMessageStatus) {
          Queue.add("WebHooksAPI", {
            url: data.apiConfig.urlMessageStatus,
            type: payload.type,
            payload
          });
        }
        throw new Error(error);
      }
      
      // Lógica existente para API externa
      const apiMessage = await UpsertMessageAPIService({
        sessionId: data.sessionId,
        messageId: result.messageId,
        ack: result.status === "sent" ? 1 : 2,
        body: data.body,
        number: data.number,
        mediaName: data?.media?.filename,
        mediaUrl: data.mediaUrl,
        timestamp: result.timestamp,
        externalKey: data.externalKey,
        apiConfig: data.apiConfig,
        tenantId: data.tenantId,
        messageWA: {
          id: result.messageId,
          ack: result.status === "sent" ? 1 : 2,
          body: data.body,
          fromMe: true,
          number: data.number,
          mediaName: data?.media?.filename,
          mediaUrl: data.mediaUrl,
          timestamp: result.timestamp
        }
      });

      if (data?.apiConfig?.urlMessageStatus) {
        Queue.add("WebHooksAPI", {
          url: data.apiConfig.urlMessageStatus,
          type: "MessageStatus",
          payload: {
            ack: result.status === "sent" ? 1 : 2,
            body: data.body,
            messageId: result.messageId,
            number: data.number,
            externalKey: data.externalKey
          }
        });
      }

      return apiMessage;
    } catch (error) {
      logger.error({ message: "Error send message api", error });
      throw new AppError(error);
    }
  }
};
