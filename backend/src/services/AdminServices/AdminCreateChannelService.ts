import * as Yup from "yup";

import AppError from "../../errors/AppError";
import Whatsapp from "../../models/Whatsapp";
import WhatsAppProvider from "../../providers/WhatsAppProvider";
import { logger } from "../../utils/logger";

interface Request {
  name: string;
  status?: string;
  isDefault?: boolean;
  tenantId: string | number;
  tokenTelegram?: string;
  instagramUser?: string;
  instagramKey?: string;
}

interface Response {
  whatsapp: Whatsapp;
  oldDefaultWhatsapp: Whatsapp | null;
}

const AdminCreateChannelService = async ({
  name,
  status = "OPENING",
  isDefault = false,
  tenantId,
  tokenTelegram,
  instagramUser,
  instagramKey
}: Request): Promise<Response> => {
  const schema = Yup.object().shape({
    name: Yup.string()
      .required()
      .min(2)
      .test(
        "Check-name",
        "This whatsapp name is already used.",
        async value => {
          if (value) {
            const whatsappFound = await Whatsapp.findOne({
              where: { name: value }
            });
            return !whatsappFound;
          }
          return true;
        }
      ),
    isDefault: Yup.boolean().required()
  });

  try {
    await schema.validate({ name, status, isDefault });
  } catch (err) {
    throw new AppError(err.message);
  }

  const whatsappFound = await Whatsapp.findOne({ where: { tenantId } });

  if (!whatsappFound) {
    isDefault = !whatsappFound;
  }

  let oldDefaultWhatsapp: Whatsapp | null = null;

  if (isDefault) {
    oldDefaultWhatsapp = await Whatsapp.findOne({
      where: { isDefault: true, tenantId }
    });
    if (oldDefaultWhatsapp) {
      await oldDefaultWhatsapp.update({ isDefault: false });
    }
  }

  const whatsapp = await Whatsapp.create({
    name,
    status,
    isDefault,
    tenantId,
    tokenTelegram,
    instagramUser,
    instagramKey
  });

  // Evolution Migration: criar instância e configurar webhook (best-effort)
  try {
    if (process.env.USE_EVOLUTION_API === "true") {
      const provider = WhatsAppProvider.getInstance();
      const instanceName = whatsapp.name;
      const backendUrl = (process.env.BACKEND_URL || "http://host.docker.internal:3100").replace(/\/+$/, "");
      // 1) criar instância (JSON) com qrcode e integração padrão WHATSAPP-BAILEYS
      await provider.createInstance({
        instanceName,
        qrcode: true,
        integration: "WHATSAPP-BAILEYS",
        webhook: {
          url: `${backendUrl}/api/webhook/evolution`,
          byEvents: true,
          base64: true,
          headers: { "Content-Type": "application/json" },
          events: ["CONNECTION_UPDATE", "QRCODE_UPDATED", "MESSAGES_UPSERT"]
        }
      });
      // 2) reforçar webhook via endpoint dedicado
      try {
        await provider.setInstanceWebhook(instanceName, {
          url: `${backendUrl}/api/webhook/evolution`,
          byEvents: true,
          base64: true,
          headers: { "Content-Type": "application/json" },
          events: ["CONNECTION_UPDATE", "QRCODE_UPDATED", "MESSAGES_UPSERT"]
        });
      } catch (e) {
        logger.warn(`Evolution setInstanceWebhook falhou: ${String(e)}`);
      }
      // 3) restart (opcional)
      try {
        await provider.restartInstance(instanceName);
      } catch (e) {
        logger.warn(`Evolution restartInstance falhou: ${String(e)}`);
      }
      logger.info(`Evolution instance '${instanceName}' criada e webhook configurado.`);
    }
  } catch (e) {
    logger.warn(`Evolution createInstance best-effort falhou: ${String(e)}`);
  }

  return { whatsapp, oldDefaultWhatsapp };
};

export default AdminCreateChannelService;
