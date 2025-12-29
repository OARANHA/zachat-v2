import HandleMessage from "../services/WbotServices/helpers/HandleMessage";
import { logger } from "../utils/logger";

export default {
  key: "ProcessIncomingWhatsAppMessage",
  options: {
    attempts: 5,
    removeOnComplete: true,
    backoff: { type: "fixed", delay: 2000 }
  },
  async handle({ data }: any) {
    const { sessionId, adaptedMessage } = data;
    try {
      const mockWbot = {
        id: parseInt(sessionId, 10),
        getChat: async () => ({ isGroup: false }),
        getContactById: async (id: string) => ({ id, name: "Contact" })
      };
      await HandleMessage(adaptedMessage as any, mockWbot as any);
    } catch (err) {
      logger.error("Failed to process incoming WhatsApp message", { sessionId, err });
      throw err;
    }
  }
};
