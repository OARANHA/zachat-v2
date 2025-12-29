import Whatsapp from "../../models/Whatsapp";
import { getIO } from "../../libs/socket";
import wbotMonitor from "./wbotMonitor";
import { logger } from "../../utils/logger";
import AppError from "../../errors/AppError";
import { StartInstaBotSession } from "../InstagramBotServices/StartInstaBotSession";
import { StartTbotSession } from "../TbotServices/StartTbotSession";
import { StartWaba360 } from "../WABA360/StartWaba360";
import { StartMessengerBot } from "../MessengerChannelServices/StartMessengerBot";
import WhatsAppProvider from "../../providers/WhatsAppProvider";
import UsageService from "../BillingServices/UsageService";

export const StartWhatsAppSession = async (
  whatsapp: Whatsapp
): Promise<void> => {
  await whatsapp.update({ status: "OPENING" });

  const io = getIO();
  io.emit(`${whatsapp.tenantId}:whatsappSession`, {
    action: "update",
    session: whatsapp
  });

  try {
    if (whatsapp.type === "whatsapp") {
      // AVISO: Usando WhatsAppProvider em vez de initWbot
      logger.warn(`StartWhatsAppSession usando WhatsAppProvider para whatsappId: ${whatsapp.id}`);
      
      // Seleciona o provider conforme feature flag USE_EVOLUTION_API
      const provider = WhatsAppProvider.getInstance();

      // Criar sessão no provider selecionado
      const sessionData = await provider.createSession({
        tenantId: String(whatsapp.tenantId),
        name: whatsapp.name,
        webhookUrl: process.env.USE_EVOLUTION_API === "true"
          ? `${process.env.BACKEND_URL}/api/webhook/evolution`
          : `${process.env.BACKEND_URL}/api/webhook/whatsapp`,
        metadata: {
          sessionId: String(whatsapp.id),
          whatsappId: whatsapp.id
        }
      });
      
      // Atualizar status da sessão com dados do gateway
      await whatsapp.update({
        status: sessionData.status,
        qrcode: sessionData.qrCode || "",
        retries: 0
      });

      // Incremento real de uso: +1 sessão WhatsApp no período corrente
      try {
        await UsageService.incrementWhatsappSessions(Number(whatsapp.tenantId), 1);
      } catch (e) {
        // Não falhar a criação da sessão em caso de erro no Redis/tracking
        // TODO: logar warning futuramente
      }
      
      // Emitir eventos para frontend
      io.emit(`${whatsapp.tenantId}:whatsappSession`, {
        action: "update",
        session: whatsapp
      });
      
      // Se houver QR code, emitir evento indicando que está pronto (não enviar o QR em si)
      if (sessionData.qrCode) {
        io.emit(`${whatsapp.tenantId}:whatsappSession`, {
          action: "qrcode",
          sessionId: whatsapp.id,
          message: "QR code ready - fetch from /api/whatsapp/:id"
        });
      }
    }

    if (whatsapp.type === "telegram") {
      StartTbotSession(whatsapp);
    }

    if (whatsapp.type === "instagram") {
      StartInstaBotSession(whatsapp);
    }

    if (whatsapp.type === "messenger") {
      StartMessengerBot(whatsapp);
    }

    if (whatsapp.type === "waba") {
      if (whatsapp.wabaBSP === "360") {
        StartWaba360(whatsapp);
      }
    }
  } catch (err) {
    logger.error(`StartWhatsAppSession | Error: ${err}`);
    throw new AppError("ERR_START_SESSION", 404);
  }
};
