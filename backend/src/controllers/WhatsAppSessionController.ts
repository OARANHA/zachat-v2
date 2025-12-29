import { Request, Response } from "express";
import ShowWhatsAppService from "../services/WhatsappService/ShowWhatsAppService";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession";
import UpdateWhatsAppService from "../services/WhatsappService/UpdateWhatsAppService";
import { setValue } from "../libs/redisClient";
import { logger } from "../utils/logger";
import { getTbot, removeTbot } from "../libs/tbot";
import { getInstaBot, removeInstaBot } from "../libs/InstaBot";
import AppError from "../errors/AppError";
import { getIO } from "../libs/socket";
import WhatsAppProvider from "../providers/WhatsAppProvider";

const store = async (req: Request, res: Response): Promise<Response> => {
  // Aceita tanto via params quanto via body
  const whatsappId = (req.params as any)?.whatsappId || (req.body as any)?.whatsappId;
  if (!whatsappId) {
    return res.status(400).json({ error: 'MISSING_WHATSAPP_ID', message: 'Informe whatsappId no path ou no body.' });
  }
  const { tenantId } = req.user;
  const whatsapp = await ShowWhatsAppService({
    id: whatsappId,
    tenantId,
    isInternal: true
  });

  await StartWhatsAppSession(whatsapp);

  return res.status(200).json({ message: "Starting session.", whatsappId });
};

const update = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { isQrcode } = req.body;
  const { tenantId } = req.user;

  try {
    if (isQrcode) {
      // Seleciona o provider (façade único)
      const provider = WhatsAppProvider.getInstance();
      try {
        await provider.deleteSession(String(whatsappId));
      } catch (error) {
        logger.error(`Erro ao deletar sessão no provider: ${error}`);
      }
    }

    const { whatsapp } = await UpdateWhatsAppService({
      whatsappId,
      whatsappData: { session: "" },
      tenantId
    });

    // Iniciar sessão no provider selecionado (Evolution quando USE_EVOLUTION_API=true)
    await StartWhatsAppSession(whatsapp);
    
    // Aguardar um pouco para o QR code ser gerado e salvo no banco
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Refrescar dados do whatsapp do banco para retornar QR code atualizado
    const updatedWhatsapp = await ShowWhatsAppService({
      id: whatsappId,
      tenantId,
      isInternal: true
    });
    
    return res.status(200).json({ 
      message: "Starting session.",
      whatsapp: updatedWhatsapp
    });
  } catch (err: any) {
    logger.error(`WhatsAppSessionController.update failed: ${err?.message || err}`);
    const status = err?.statusCode || 500;
    return res.status(status).json({ error: err?.message || 'ERR_UPDATE_SESSION', detail: err?.stack });
  }
};

const remove = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { tenantId } = req.user;
  const channel = await ShowWhatsAppService({ id: whatsappId, tenantId });

  const io = getIO();

  try {
    if (channel.type === "whatsapp") {
      // Seleciona o provider (façade único)
      const provider = WhatsAppProvider.getInstance();
      try {
        await provider.deleteSession(String(channel.id));
        logger.info(`Sessão WhatsApp ${channel.id} desconectada via provider`);
      } catch (error) {
        logger.error(`Erro ao desconectar sessão no provider: ${error}`);
      }
      
      await setValue(`${channel.id}-retryQrCode`, 0);
    }

    if (channel.type === "telegram") {
      const tbot = getTbot(channel.id);
      await tbot.telegram
        .logOut()
        .catch(error => logger.error("Erro ao fazer logout da conexão", error));
      removeTbot(channel.id);
    }

    if (channel.type === "instagram") {
      const instaBot = getInstaBot(channel.id);
      await instaBot.destroy();
      removeInstaBot(channel);
    }

    await channel.update({
      status: "DISCONNECTED",
      session: "",
      qrcode: null,
      retries: 0
    });
  } catch (error) {
    logger.error(error);
    await channel.update({
      status: "DISCONNECTED",
      session: "",
      qrcode: null,
      retries: 0
    });

    io.emit(`${channel.tenantId}:whatsappSession`, {
      action: "update",
      session: channel
    });
    throw new AppError("ERR_NO_WAPP_FOUND", 404);
  }
  return res.status(200).json({ message: "Session disconnected." });
};

export default { store, remove, update };
