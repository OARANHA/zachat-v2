/* eslint-disable camelcase */
import { Client, LocalAuth, DefaultOptions } from "whatsapp-web.js";
import path from "path";
import { rm } from "fs/promises";
import { getIO } from "./socket";
import Whatsapp from "../models/Whatsapp";
import { logger } from "../utils/logger";
import SyncUnreadMessagesWbot from "../services/WbotServices/SyncUnreadMessagesWbot";
import Queue from "./Queue";
import AppError from "../errors/AppError";
import WhatsAppProvider from "../providers/WhatsAppProvider";

const minimalArgs = require('./minimalArgs');

interface Session extends Client {
  id: number;
  checkMessages: any;
}

const sessions: Session[] = [];

// AVISO: Este arquivo está sendo depreciado em favor do WhatsAppProvider
// Use WhatsAppProvider.getInstance() para novas implementações
// Mantido apenas para compatibilidade com código legado

export const apagarPastaSessao = async (id: number | string): Promise<void> => {
  const pathRoot = path.resolve(__dirname, "..", "..", ".wwebjs_auth");
  const pathSession = `${pathRoot}/session-wbot-${id}`;
  try {
    await rm(pathSession, { recursive: true, force: true });
  } catch (error) {
    logger.info(`apagarPastaSessao:: ${pathSession}`);
    logger.error(error);
  }
};

export const removeWbot = (whatsappId: number): void => {
  try {
    const sessionIndex = sessions.findIndex(s => s.id === whatsappId);
    if (sessionIndex !== -1) {
      sessions[sessionIndex].destroy();
      sessions.splice(sessionIndex, 1);
    }
  } catch (err) {
    logger.error(`removeWbot | Error: ${err}`);
  }
};

// Função mantida para compatibilidade, mas uso depreciado
export const getWbot = (whatsappId: number): Session => {
  // AVISO: Usar WhatsAppProvider.getInstance() em vez desta função
  logger.warn(`getWbot() depreciado. Use WhatsAppProvider.getInstance() para whatsappId: ${whatsappId}`);
  
  const sessionIndex = sessions.findIndex(s => s.id === whatsappId);
  if (sessionIndex === -1) {
    throw new AppError("ERR_WAPP_NOT_INITIALIZED");
  }
  
  return sessions[sessionIndex];
};

export const initWbot = async (whatsapp: Whatsapp): Promise<Session> => {
  // AVISO: Esta função está sendo depreciada
  // Novas implementações devem usar WhatsAppProvider
  logger.warn(`initWbot() depreciado. Use WhatsAppProvider.getInstance() e WhatsAppProvider.createSession()`);
  
  return new Promise((resolve, reject) => {
    reject(new Error("initWbot() depreciado. Use WhatsAppProvider"));
  });
};

const args: string[] = process.env.CHROME_ARGS
  ? process.env.CHROME_ARGS.split(",")
  : minimalArgs;

const checkMessages = async (wbot: Session, tenantId: number | string): Promise<void> => {
  try {
    const isConnectStatus = wbot && (await wbot.getState()) === "CONNECTED";
    
    if (isConnectStatus) {
      logger.info("wbot:connected:checkMessages", wbot.id, tenantId);
      Queue.add("SendMessages", { sessionId: wbot.id, tenantId });
    }
  } catch (error) {
    const strError = String(error);
    if (strError.indexOf("Session closed.") !== -1) {
      logger.error(
        `BOT Whatsapp desconectado. Tenant: ${tenantId}:: BOT ID: ${wbot.id}`
      );
      clearInterval(wbot.checkMessages);
      removeWbot(wbot.id);
      return;
    }
    logger.error(`ERROR: checkMessages Tenant: ${tenantId}::`, error);
  }
};

export default {
  apagarPastaSessao,
  removeWbot,
  getWbot, // depreciado
  initWbot, // depreciado
  checkMessages
};
