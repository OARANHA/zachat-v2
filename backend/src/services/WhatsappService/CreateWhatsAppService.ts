import axios from "axios";
import AppError from "../../errors/AppError";
import { getIO } from "../../libs/socket";
import Whatsapp from "../../models/Whatsapp";
import { logger } from "../../utils/logger";

interface Request {
  name: string;
  status?: string;
  isDefault?: boolean;
  tenantId: string | number;
  tokenTelegram?: string;
  instagramUser?: string;
  instagramKey?: string;
  wabaBSP?: string;
  tokenAPI?: string;
  fbPageId?: string;
  farewellMessage?: string;
  type: "waba" | "instagram" | "telegram" | "whatsapp" | "messenger";
  wavoip?: string;
}

interface Response {
  whatsapp: Whatsapp;
  oldDefaultWhatsapp: Whatsapp | null;
  qrCode?: string; // ✅ NOVO: retorna QR code
}

const CreateWhatsAppService = async ({
  name,
  status = "DISCONNECTED",
  tenantId,
  tokenTelegram,
  instagramUser,
  instagramKey,
  type,
  wabaBSP,
  tokenAPI,
  fbPageId,
  farewellMessage,
  wavoip,
  isDefault = false
}: Request): Promise<Response> => {
  if (type === "waba" && (!tokenAPI || !wabaBSP)) {
    throw new AppError("WABA: favor informar o Token e a BSP");
  }

  if (type === "instagram" && !instagramUser) {
    throw new AppError(
      "Instagram: favor informar o Usuário e senha corretamente."
    );
  }

  if (type === "telegram" && !tokenTelegram) {
    throw new AppError("Telegram: favor informar o Token.");
  }

  const whatsappFound = await Whatsapp.findOne({
    where: { tenantId, isDefault: true }
  } as any);

  if (!whatsappFound) {
    isDefault = true;
  }

  if (isDefault && whatsappFound) {
    await whatsappFound.update({ isDefault: false });
  }

  try {
    // 1. Criar registro no banco
    const whatsapp = await Whatsapp.create({
      name,
      status,
      isDefault,
      tenantId,
      tokenTelegram,
      instagramUser,
      instagramKey,
      type,
      wabaBSP,
      tokenAPI,
      fbPageId,
      farewellMessage,
      wavoip
    } as any);

    // 2. ✅ SE FOR WHATSAPP, CHAMAR O GATEWAY
    let qrCode: string | undefined;

    if (type === "whatsapp") {
      try {
        if (process.env.USE_EVOLUTION_API === "true") {
          // Evolution API flow (QR chegará via webhook QRCODE_UPDATED)
          const provider = (await import("../../providers/WhatsAppProvider")).default.getInstance();
          const instanceName = whatsapp.name; // manter padrão já usado
          const backendUrl = (process.env.BACKEND_URL || "http://host.docker.internal:3100").replace(/\/+$/, "");

          await provider.createInstance({
            instanceName,
            qrcode: true,
            integration: "WHATSAPP-BAILEYS",
            webhook: {
              url: `${backendUrl}/api/webhook/evolution`,
              byEvents: false, // global webhook consolidado
              base64: true,
              headers: { "Content-Type": "application/json" },
              events: ["CONNECTION_UPDATE", "QRCODE_UPDATED", "MESSAGES_UPSERT"]
            }
          });

          // Reforçar webhook via endpoint dedicado (best-effort)
          try {
            await provider.setInstanceWebhook(instanceName, {
              url: `${backendUrl}/api/webhook/evolution`,
              byEvents: false,
              base64: true,
              headers: { "Content-Type": "application/json" },
              events: ["CONNECTION_UPDATE", "QRCODE_UPDATED", "MESSAGES_UPSERT"]
            });
          } catch (e) {
            logger.warn(`Evolution setInstanceWebhook falhou: ${String(e)}`);
          }

          // Opcional: restart para acelerar emissão de QR
          try {
            await provider.restartInstance(instanceName);
          } catch (e) {
            logger.warn(`Evolution restartInstance falhou: ${String(e)}`);
          }

          logger.info(`Evolution instance '${instanceName}' criada (tenantId=${tenantId}). QR chegará via webhook.`);
        } else {
          // Legado: Gateway HTTP
          const gatewayUrl = process.env.WHATSAPP_GATEWAY_URL || "http://localhost:3334";
          const webhookUrl = `${process.env.BACKEND_URL || "http://localhost:3333"}/webhook/whatsapp`;

          logger.info(
            `Calling gateway to create WhatsApp session [sessionId: ${whatsapp.id}, tenantId: ${tenantId}]`
          );

          // Chamar gateway para criar sessão
          const gatewayResponse = await axios.post(
            `${gatewayUrl}/api/sessions`,
            {
              sessionId: whatsapp.id, // Usar ID do Whatsapp como sessionId
              tenantId,
              name,
              webhookUrl
            },
            { timeout: 35000 } // Timeout um pouco maior que o do gateway
          );

          qrCode = gatewayResponse.data.qrCode;

          // 3. Armazenar QR code no banco
          if (qrCode) {
            await whatsapp.update({ qrcode: qrCode });
            logger.info(`QR code received and stored [sessionId: ${whatsapp.id}]`);
          } else {
            logger.warn(`Gateway returned no QR code [sessionId: ${whatsapp.id}]`);
          }
        }
      } catch (gatewayError: any) {
        logger.error(
          `Error creating WhatsApp session [sessionId: ${whatsapp.id}]: ${gatewayError.message}`
        );
        // Não falhar a criação do whatsapp, apenas log
        // O usuário pode tentar gerar novo QR depois
      }
    }

    // 4. Emitir evento para frontend atualizar em tempo real
    const io = getIO();
    io.emit(`${tenantId}:whatsapp`, {
      action: "update",
      whatsapp: whatsapp.toJSON()
    });

    return {
      whatsapp,
      oldDefaultWhatsapp: whatsappFound,
      qrCode // ✅ RETORNA QR CODE
    };

  } catch (error) {
    logger.error(error);
    throw new AppError("ERR_CREATE_WAPP", 404);
  }
};

export default CreateWhatsAppService;
