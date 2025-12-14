import * as Yup from "yup";
import { Request, Response } from "express";
import AppError from "../errors/AppError";
import ApiConfig from "../models/ApiConfig";
import Queue from "../libs/Queue";
import ShowWhatsAppService from "../services/WhatsappService/ShowWhatsAppService";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession";
import WhatsAppProvider from "../providers/WhatsAppProvider";
import { logger } from "../utils/logger";

interface MessageDataRequest {
  apiId: string;
  sessionId: number;
  body: string;
  number: string;
  media?: Express.Multer.File | string;
  externalKey: string;
  tenantId: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiConfig?: any;
}

export const sendMessageAPI = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId, sessionId } = req.APIAuth;
  const { apiId } = req.params;

  const APIConfig = await ApiConfig.findOne({
    where: {
      id: apiId,
      tenantId
    }
  });

  if (APIConfig?.sessionId !== sessionId) {
    throw new AppError("ERR_SESSION_NOT_AUTH_TOKEN", 403);
  }

  const media = req.file as Express.Multer.File;
  const { body, number, externalKey } = req.body;

  const newMessage: MessageDataRequest = {
    apiId,
    sessionId,
    body,
    number,
    media,
    externalKey,
    tenantId,
    apiConfig: APIConfig
  };

  const schema = Yup.object().shape({
    apiId: Yup.string(),
    sessionId: Yup.number(),
    body: Yup.string().required(),
    number: Yup.string().required(),
    mediaUrl:
      Yup.string().url().nullable() ||
      Yup.object().shape({
        destination: Yup.string().required(),
        encoding: Yup.string().required(),
        fieldname: Yup.string().required(),
        filename: Yup.string().required(),
        mimetype: Yup.string().required(),
        size: Yup.number().required()
      }),
    externalKey: Yup.string().required(),
    tenantId: Yup.number().required()
  });

  try {
    await schema.validate(newMessage);
  } catch (error) {
    throw new AppError(error.message);
  }

  // Usar WhatsAppProvider em vez de getWbot direto
  const whatsappProvider = WhatsAppProvider.getInstance();
  
  try {
    // Verificar status da sessão antes de enviar mensagem
    const session = await whatsappProvider.getSession(String(sessionId));
    if (!session || session.status !== 'CONNECTED') {
      throw new Error("Sessão WhatsApp não está conectada");
    }

    Queue.add("SendMessageAPI", newMessage);
    
    return res.status(200).json({ message: "Message add queue" });
  } catch (error) {
    logger.error(`Erro ao enviar mensagem via API: ${error}`);
    throw new AppError("Erro ao enviar mensagem");
  }
};

export const startSession = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId, sessionId } = req.APIAuth;
  const { apiId } = req.params;

  const APIConfig = await ApiConfig.findOne({
    where: {
      id: apiId,
      tenantId
    }
  });

  if (APIConfig?.sessionId !== sessionId) {
    throw new AppError("ERR_SESSION_NOT_AUTH_TOKEN", 403);
  }

  const whatsapp = await ShowWhatsAppService({
    id: APIConfig.sessionId,
    tenantId,
    isInternal: true
  });

  try {
    // Usar WhatsAppProvider para verificar status da sessão
    const whatsappProvider = WhatsAppProvider.getInstance();
    const session = await whatsappProvider.getSession(String(APIConfig.sessionId));
    
    if (!session || session.status !== 'CONNECTED') {
      StartWhatsAppSession(whatsapp);
    }
  } catch (error) {
    logger.error(`Erro ao iniciar sessão WhatsApp: ${error}`);
    StartWhatsAppSession(whatsapp);
  }

  return res.status(200).json(whatsapp);
};
