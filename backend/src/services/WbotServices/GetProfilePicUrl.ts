import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import WhatsAppProvider from "../../providers/WhatsAppProvider";
import { logger } from "../../utils/logger";

const GetProfilePicUrl = async (
  number: string,
  tenantId: string | number
): Promise<string> => {
  try {
    const defaultWhatsapp = await GetDefaultWhatsApp(tenantId);
    const provider = WhatsAppProvider.getInstance();
    const session = await provider.getSession(String(defaultWhatsapp.id));

    if (!session || session.status !== 'connected') {
      logger.warn(`GetProfilePicUrl | Session not connected for WhatsApp ${defaultWhatsapp.id}`);
      return "";
    }

    // Como o gateway não tem endpoint direto para profile pic,
    // retornamos uma URL padrão ou vazia
    // Em uma implementação real, poderíamos adicionar um endpoint
    // no gateway para obter a foto de perfil
    const profilePicUrl = `https://ui-avatars.com/api/?name=${number}&background=random`;
    return profilePicUrl;
  } catch (error) {
    logger.error(`GetProfilePicUrl - ${error}`);
    return "";
  }
};

export default GetProfilePicUrl;
