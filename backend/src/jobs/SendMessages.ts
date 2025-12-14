/* eslint-disable @typescript-eslint/no-explicit-any */
// import { v4 as uuid } from "uuid";
import WhatsAppProvider from "../providers/WhatsAppProvider";
import SendMessagesSystemWbot from "../services/WbotServices/SendMessagesSystemWbot";
import { logger } from "../utils/logger";

const sending: any = {};

export default {
  key: "SendMessages",
  options: {
    attempts: 0,
    removeOnComplete: true,
    removeOnFail: true
    // repeat: {
    //   every: 5000
    // }
  },
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async handle({ data }: any) {
    try {
      logger.info(`Sending Tenant Initiated: ${data.tenantId}`);
      if (sending[data.tenantId]) return;
      
      // MIGRAÇÃO: Usar WhatsAppProvider como singleton
      const whatsappProvider = WhatsAppProvider.getInstance();
      const wbot = await whatsappProvider.getSession(data.sessionId);
      
      sending[data.tenantId] = true;
      await SendMessagesSystemWbot(wbot, data.tenantId);
      sending[data.tenantId] = false;
      logger.info(`Finalized Sending Tenant: ${data.tenantId}`);
    } catch (error) {
      logger.error({ message: "Error send messages", error });
      sending[data.tenantId] = false;
      throw new Error(error);
    }
  }
};
