import Whatsapp from "../../models/Whatsapp";
import { getIO } from "../../libs/socket";
import wbotMonitor from "./wbotMonitor";
import { logger } from "../../utils/logger";
import WhatsAppProvider from "../../providers/WhatsAppProvider";

export const StartWhatsAppSessionVerify = async (
  whatsappId: number,
  error: string
): Promise<void> => {
  const errorString = error.toString().toLowerCase();
  const sessionClosed = "session closed";
  const sessiondisconnected =
    "TypeError: Cannot read property 'sendSeen' of undefined";
  const WAPP_NOT_INIT = "ERR_WAPP_NOT_INITIALIZED".toLowerCase();
  if (
    errorString.indexOf(sessionClosed) !== -1 ||
    errorString.indexOf(WAPP_NOT_INIT) !== -1 ||
    errorString.indexOf(sessiondisconnected) !== -1
  ) {
    const whatsapp = await Whatsapp.findByPk(whatsappId);
    try {
      if (whatsapp) {
        await whatsapp.update({ status: "OPENING" });
        const io = getIO();
        io.emit(`${whatsapp?.tenantId}:whatsappSession`, {
          action: "update",
          session: whatsapp
        });
        
        // AVISO: Usando WhatsAppProvider em vez de initWbot
        logger.warn(`StartWhatsAppSessionVerify usando WhatsAppProvider para whatsappId: ${whatsappId}`);
        
        // Apenas registrar que houve uma tentativa de reconexão
        // A reconexão real será feita via webhook quando o gateway estiver disponível
        logger.info(`Tentativa de reconexão registrada para whatsappId: ${whatsappId}. Aguardando webhook do gateway.`);
      }
    } catch (err) {
      logger.error(err);
    }
  }
};
