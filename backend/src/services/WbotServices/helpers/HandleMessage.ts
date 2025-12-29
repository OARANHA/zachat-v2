import {
  Contact as WbotContact,
  Message as WbotMessage,
  Client
} from "whatsapp-web.js";
import Contact from "../../../models/Contact";
import { logger } from "../../../utils/logger";
import FindOrCreateTicketService from "../../TicketServices/FindOrCreateTicketService";
import ShowWhatsAppService from "../../WhatsappService/ShowWhatsAppService";
import IsValidMsg from "./IsValidMsg";
// import VerifyAutoReplyActionTicket from "./VerifyAutoReplyActionTicket";
import VerifyContact from "./VerifyContact";
import VerifyMediaMessage from "./VerifyMediaMessage";
import VerifyMessage from "./VerifyMessage";
import verifyBusinessHours from "./VerifyBusinessHours";
import VerifyStepsChatFlowTicket from "../../ChatFlowServices/VerifyStepsChatFlowTicket";
import Queue from "../../../libs/Queue";
// import isMessageExistsService from "../../MessageServices/isMessageExistsService";
import Setting from "../../../models/Setting";

interface Session extends Client {
  id: number;
}

const HandleMessage = async (
  msg: WbotMessage,
  wbot: Session
): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    (async () => {
      if (!IsValidMsg(msg)) {
        return;
      }

      // Log de processamento e debug do payload completo (temporário)
      try {
        logger.info(`Processing incoming message from session ${wbot?.id}...`);
        // Log detalhado apenas para debugging do Business (somente sessão 32)
        // ATENÇÃO: temporário — remover após validação em produção
        if (Number(wbot?.id) === 32) {
          // eslint-disable-next-line no-console
          console.log('DEBUG MSG BUSINESS:', JSON.stringify(msg, null, 2));
        }
      } catch (e) {
        // ignore
      }

      const whatsapp = await ShowWhatsAppService({ id: wbot.id });

      const { tenantId } = whatsapp;

      // Obter chat com fallback para Business
      let chat: any = null;
      try {
        if (typeof (msg as any).getChat === 'function') {
          chat = await (msg as any).getChat();
        } else {
          chat = (msg as any).chat || (msg as any)._data?.chat || null;
        }
      } catch (e) {
        chat = (msg as any).chat || (msg as any)._data?.chat || null;
      }

      if (!chat) {
        // Business não retorna chat object, construir mínimo baseado na msg
        const fromOrTo = (msg as any).from || (msg as any).to;
        const [userPart, serverPart] = String(fromOrTo || '').split('@');
        const isGroup = String((msg as any)?.from || "").endsWith("@g.us");
        chat = {
          id: {
            _serialized: fromOrTo,
            user: userPart,
            server: serverPart
          },
          isGroup: isGroup,
          unreadCount: (msg as any).fromMe ? 0 : 1,
          name: undefined
        } as any;
        logger.info(`Created minimal chat for Business msg from: ${String((msg as any).from || '')}`);
      }
      // IGNORAR MENSAGENS DE GRUPO
      const Settingdb = await Setting.findOne({
        where: { key: "ignoreGroupMsg", tenantId }
      });

      const isGroupEarly = Boolean((chat as any)?.isGroup) || String((msg as any)?.from || "").endsWith("@g.us");

      if (
        Settingdb?.value === "enabled" &&
        (isGroupEarly || (msg as any).from === "status@broadcast")
      ) {
        return;
      }
      // IGNORAR MENSAGENS DE GRUPO

      try {
        let msgContact: WbotContact;
        let groupContact: Contact | undefined;

        // Helper para extrair o "user" a partir de um JID ou campos comuns
        const parseUserFrom = (jidLike: any): string | undefined => {
          if (!jidLike) return undefined;
          const s = String(jidLike);
          const atIdx = s.indexOf("@");
          return atIdx > 0 ? s.substring(0, atIdx) : s;
        };

        // Fallbacks para obter o contato da mensagem
        const buildMinimalContact = (userId?: string): WbotContact => {
          const minimal: any = {
            id: { user: userId || undefined },
            name: undefined,
            pushname: undefined,
            shortName: undefined,
            isUser: true,
            isWAContact: true,
            isGroup: false
          };
          return minimal as WbotContact;
        };

        try {
          if (msg.fromMe) {
            // media messages sent from me from cell phone, first comes with "hasMedia = false" and type = "image/ptt/etc"
            // the media itself comes on body of message, as base64
            // if this is the case, return and let this media be handled by media_uploaded event
            // it should be improoved to handle the base64 media here in future versions
            if (!msg.hasMedia && msg.type !== "chat" && msg.type !== "vcard" && msg.type !== "location")
              return;

            if (typeof (wbot as any).getContactById === 'function') {
              msgContact = await (wbot as any).getContactById((msg as any).to);
            } else {
              msgContact = buildMinimalContact(parseUserFrom((msg as any).to));
            }
          } else {
            if (typeof (msg as any).getContact === 'function') {
              msgContact = await (msg as any).getContact();
            } else if (typeof (wbot as any).getContactById === 'function') {
              msgContact = await (wbot as any).getContactById((msg as any).from);
            } else {
              const jid = (msg as any).from || (msg as any)?._data?.from || (chat as any)?.id?._serialized;
              msgContact = buildMinimalContact(parseUserFrom(jid));
            }
          }
        } catch (e) {
          const jid = (msg as any).fromMe ? (msg as any).to : (msg as any).from;
          msgContact = buildMinimalContact(parseUserFrom(jid));
        }

        // Detecção robusta de grupo
        const isGroup = Boolean((chat as any)?.isGroup) || String((msg as any)?.from || "").endsWith("@g.us");
        if (isGroup) {
          let msgGroupContact: any;
          try {
            if (msg.fromMe) {
              if (typeof (wbot as any).getContactById === 'function') {
                msgGroupContact = await (wbot as any).getContactById((msg as any).to);
              }
            } else if (typeof (wbot as any).getContactById === 'function') {
              msgGroupContact = await (wbot as any).getContactById((msg as any).from);
            }
          } catch (e) {
            // ignore
          }
          if (!msgGroupContact) {
            const jid = (msg as any).fromMe ? (msg as any).to : (msg as any).from;
            msgGroupContact = buildMinimalContact(parseUserFrom(jid));
            (msgGroupContact as any).isGroup = true;
          }
          groupContact = await VerifyContact(msgGroupContact, tenantId);
        }

        const unreadMessages = (msg as any).fromMe ? 0 : ((chat as any)?.unreadCount ?? 0);

        // const profilePicUrl = await msgContact.getProfilePicUrl();
        const contact = await VerifyContact(msgContact, tenantId);
        const ticket = await FindOrCreateTicketService({
          contact,
          whatsappId: wbot.id!,
          unreadMessages,
          tenantId,
          groupContact,
          msg,
          channel: "whatsapp"
        });

        if (ticket?.isCampaignMessage) {
          resolve();
          return;
        }

        if (ticket?.isFarewellMessage) {
          resolve();
          return;
        }

        if (msg.hasMedia) {
          await VerifyMediaMessage(msg, ticket, contact);
        } else {
          await VerifyMessage(msg, ticket, contact);
        }

        const isBusinessHours = await verifyBusinessHours(msg, ticket);

        // await VerifyAutoReplyActionTicket(msg, ticket);
        if (isBusinessHours) await VerifyStepsChatFlowTicket(msg, ticket);

        const apiConfig: any = ticket.apiConfig || {};
        if (
          !msg.fromMe &&
          !ticket.isGroup &&
          !ticket.answered &&
          apiConfig?.externalKey &&
          apiConfig?.urlMessageStatus
        ) {
          const payload = {
            timestamp: Date.now(),
            msg,
            messageId: msg.id.id,
            ticketId: ticket.id,
            externalKey: apiConfig?.externalKey,
            authToken: apiConfig?.authToken,
            type: "hookMessage"
          };
          Queue.add("WebHooksAPI", {
            url: apiConfig.urlMessageStatus,
            type: payload.type,
            payload
          });
        }

        resolve();
      } catch (err) {
        logger.error(err);
        reject(err);
      }
    })();
  });
};

export default HandleMessage;
