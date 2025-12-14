import { logger } from "../../utils/logger";
import WhatsAppProvider from "../../providers/WhatsAppProvider";
import Contact from "../../models/Contact";
import { Op } from "sequelize";

interface ContactData {
  id?: string;
  name?: string;
  number: string;
  pushname?: string;
}

interface SyncResult {
  success: boolean;
  added: number;
  updated: number;
  errors: string[];
}

class SyncContactsGatewayService {
  private whatsappProvider: WhatsAppProvider;

  constructor() {
    this.whatsappProvider = WhatsAppProvider.getInstance();
  }

  /**
   * Sincronizar contatos do WhatsApp Gateway com o banco local
   */
  async syncContacts(sessionId: string, tenantId: number): Promise<SyncResult> {
    try {
      logger.info(`Starting contact sync for session ${sessionId}, tenant ${tenantId}`);

      // Obter contatos do gateway
      const gatewayContacts = await this.whatsappProvider.getContacts(sessionId);
      
      if (!gatewayContacts || gatewayContacts.length === 0) {
        logger.warn(`No contacts found in gateway for session ${sessionId}`);
        return {
          success: true,
          added: 0,
          updated: 0,
          errors: []
        };
      }

      // Obter contatos existentes no banco para este tenant
      const existingContacts = await Contact.findAll({
        where: {
          tenantId,
          isWAContact: true // Apenas contatos do WhatsApp
        }
      });

      // Criar mapa de contatos existentes por número para lookup rápido
      const existingContactsMap = new Map();
      existingContacts.forEach(contact => {
        existingContactsMap.set(contact.number, contact);
      });

      let addedCount = 0;
      let updatedCount = 0;
      const errors: string[] = [];

      // Processar cada contato do gateway
      for (const gatewayContact of gatewayContacts) {
        try {
          const existingContact = existingContactsMap.get(gatewayContact.number);
          const contactData = gatewayContact as ContactData;

          if (existingContact) {
            // Atualizar contato existente
            const updates: any = {};
            
            if (gatewayContact.name && gatewayContact.name !== existingContact.name) {
              updates.name = gatewayContact.name;
            }
            
            if (contactData.pushname && contactData.pushname !== existingContact.pushname) {
              updates.pushname = contactData.pushname;
            }

            if (Object.keys(updates).length > 0) {
              await existingContact.update(updates);
              updatedCount++;
              logger.info(`Updated contact ${gatewayContact.number}: ${JSON.stringify(updates)}`);
            }
          } else {
            // Criar novo contato
            await Contact.create({
              name: gatewayContact.name || contactData.pushname || 'Unknown',
              number: gatewayContact.number,
              isWAContact: true,
              tenantId,
              email: contactData.pushname ? `${contactData.pushname}@wa.gateway` : null,
              profilePicUrl: null,
              acceptMessages: true
            });
            addedCount++;
            logger.info(`Added new contact ${gatewayContact.number}: ${gatewayContact.name || contactData.pushname}`);
          }
        } catch (error) {
          const errorMsg = `Error processing contact ${gatewayContact.number}: ${error.message}`;
          logger.error(errorMsg);
          errors.push(errorMsg);
        }
      }

      // Limpar contatos órfãos (remover contatos que não estão mais no gateway)
      const gatewayNumbers = new Set(gatewayContacts.map(c => c.number));
      const contactsToDelete = existingContacts.filter(contact => 
        contact.isWAContact && !gatewayNumbers.has(contact.number)
      );

      if (contactsToDelete.length > 0) {
        const deletedIds = contactsToDelete.map(contact => contact.id);
        await Contact.destroy({
          where: {
            id: deletedIds
          }
        });
        logger.info(`Deleted ${contactsToDelete.length} orphaned WhatsApp contacts`);
      }

      const result: SyncResult = {
        success: errors.length === 0,
        added: addedCount,
        updated: updatedCount,
        errors
      };

      logger.info(`Contact sync completed for session ${sessionId}: Added ${addedCount}, Updated ${updatedCount}, Deleted ${contactsToDelete.length}, Errors ${errors.length}`);

      return result;
    } catch (error) {
      logger.error(`Error in contact sync: ${error.message}`);
      return {
        success: false,
        added: 0,
        updated: 0,
        errors: [error.message]
      };
    }
  }

  /**
   * Sincronizar contatos de múltiplas sessões
   */
  async syncAllContacts(tenantId: number): Promise<void> {
    try {
      // Obter lista de sessões ativas do WhatsApp para o tenant
      // Por enquanto, vamos usar uma abordagem simplificada
      // Futuramente podemos implementar um método para listar sessões ativas
      
      // Por enquanto, vamos sincronizar apenas a sessão padrão se existir
      // Isso pode ser expandido para múltiplas sessões quando necessário
      const defaultSessionId = `tenant_${tenantId}_default`;
      
      try {
        await this.syncContacts(defaultSessionId, tenantId);
      } catch (error) {
        logger.warn(`Default session ${defaultSessionId} not found or inactive: ${error.message}`);
        
        // Tentar descobrir sessões ativas verificando tickets recentes
        const recentTickets = await Contact.findAll({
          where: {
            tenantId,
            isWAContact: true
          },
          limit: 1,
          order: [['updatedAt', 'DESC']]
        });
        
        if (recentTickets.length > 0) {
          // Se encontramos contatos WhatsApp, tentar sincronizar com uma sessão genérica
          logger.info(`Attempting to sync contacts for tenant ${tenantId} using generic session`);
          // Por enquanto, vamos pular a sincronização automática até termos
          // um método melhor para descobrir sessões ativas
        }
      }
      
      logger.info(`Contact sync completed for tenant ${tenantId}`);
    } catch (error) {
      logger.error(`Error in syncAllContacts: ${error.message}`);
    }
  }
}

export default SyncContactsGatewayService;
