import { QueryTypes } from "sequelize";
import Contact from "../../models/Contact";
import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";
import WhatsAppProvider from "../../providers/WhatsAppProvider";

const SyncContactsWhatsappInstanceService = async (
  whatsappId: number,
  tenantId: number
): Promise<void> => {
  // Usar WhatsAppProvider em vez de getWbot
  const whatsappProvider = WhatsAppProvider.getInstance();
  
  let contacts;

  try {
    // Obter contatos do gateway
    contacts = await whatsappProvider.getContacts(String(whatsappId));
  } catch (err) {
    logger.error(
      `Could not get whatsapp contacts from gateway. Check connection. Error: ${err}`
    );
  }

  if (!contacts) {
    throw new AppError("ERR_CONTACTS_NOT_EXISTS_WHATSAPP", 404);
  }

  try {
    // eslint-disable-next-line @typescript-eslint/ban-types
    const dataArray: object[] = [];
    await Promise.all(
      contacts.map(async ({ name, pushname, number, isGroup, id }) => {
        if ((name || pushname) && !isGroup && id.server !== "lid") {
          // Usar workaround para URL de perfil já que não temos getProfilePicUrl no gateway
          // const profilePicUrl = await whatsappProvider.getProfilePicUrl(`${number}@c.us`);
          const contactObj = { name: name || pushname, number, tenantId };
          dataArray.push(contactObj);
        }
      })
    );
    if (dataArray.length) {
      const d = new Date().toJSON();
      const query = `INSERT INTO "Contacts" (number, name, "tenantId", "createdAt", "updatedAt") VALUES
        ${dataArray
          .map((e: any) => {
            const cleanedName = e.name.replace(/[^a-zA-Z0-9 ]+/g, '');
            return `('${e.number}',
			'${cleanedName}',
             '${e.tenantId}',
             '${d}'::timestamp,
             '${d}'::timestamp)`;
          })
          .join(",")}
        ON CONFLICT (number, "tenantId") DO NOTHING`;

      await Contact.sequelize?.query(query, {
        type: QueryTypes.INSERT
      });
      // await Contact.bulkCreate(dataArray, {
      //   fields: ["number", "name", "tenantId"],
      //   updateOnDuplicate: ["number", "name"],
      //   logging: console.log
      // });
      // console.log("sql contact");
    }
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

export default SyncContactsWhatsappInstanceService;
