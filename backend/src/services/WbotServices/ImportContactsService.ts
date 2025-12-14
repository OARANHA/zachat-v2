import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import WhatsAppProvider from "../../providers/WhatsAppProvider";
import Contact from "../../models/Contact";
import { logger } from "../../utils/logger";

const ImportContactsService = async (
  tenantId: string | number
): Promise<void> => {
  const defaultWhatsapp = await GetDefaultWhatsApp(tenantId);
  
  const whatsappProvider = WhatsAppProvider.getInstance();
  const sessionId = String(defaultWhatsapp.id);

  let phoneContacts;

  try {
    phoneContacts = await whatsappProvider.getContacts(sessionId);
  } catch (err) {
    logger.error(
      `Could not get whatsapp contacts from gateway. Check connection status. Error: ${err}`
    );
  }

  if (phoneContacts) {
    await Promise.all(
      phoneContacts.map(async ({ number, name }) => {
        if (!number) {
          return null;
        }
        if (!name) {
          name = number;
        }

        const numberExists = await Contact.findOne({
          where: { number, tenantId }
        });

        if (numberExists) return null;

        return Contact.create({ number, name, tenantId });
      })
    );
  }
};

export default ImportContactsService;
