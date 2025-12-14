import WhatsAppProvider from "../providers/WhatsAppProvider";
import GetDefaultWhatsApp from "./GetDefaultWhatsApp";
import Ticket from "../models/Ticket";

const GetTicketWbot = async (ticket: Ticket): Promise<any> => {
  if (!ticket.whatsappId) {
    const defaultWhatsapp = await GetDefaultWhatsApp(ticket.tenantId);

    await ticket.$set("whatsapp", defaultWhatsapp);
  }

  const provider = WhatsAppProvider.getInstance();
  const session = await provider.getSession(String(ticket.whatsappId));

  return session;
};

export default GetTicketWbot;
