import AppError from "../../errors/AppError";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import WhatsAppProvider from "../../providers/WhatsAppProvider";
import { logger } from "../../utils/logger";
// import { StartWhatsAppSessionVerify } from "./StartWhatsAppSessionVerify";

const CheckIsValidContact = async (
  number: string,
  tenantId: string | number
): Promise<any> => {
  const defaultWhatsapp = await GetDefaultWhatsApp(tenantId);

  const provider = WhatsAppProvider.getInstance();
  const session = await provider.getSession(String(defaultWhatsapp.id));

  if (!session || session.status !== 'connected') {
    throw new AppError("ERR_WAPP_SESSION_DISCONNECTED", 400);
  }

  try {
    // Usando o provider para validar o contato
    // Como não temos método direto no gateway, simulamos a validação
    // verificando se o número está em formato válido
    const cleanNumber = number.replace(/\D/g, "");
    if (cleanNumber.length < 10 || cleanNumber.length > 15) {
      throw new AppError("invalidNumber", 400);
    }
    
    // Retornamos o número formatado como ID válido
    return `${cleanNumber}@c.us`;
  } catch (err: any) {
    logger.error(`CheckIsValidContact | Error: ${err}`);
    // StartWhatsAppSessionVerify(defaultWhatsapp.id, err);
    if (err.message === "invalidNumber") {
      throw new AppError("ERR_WAPP_INVALID_CONTACT");
    }
    throw new AppError("ERR_WAPP_CHECK_CONTACT");
  }
};

export default CheckIsValidContact;
