import { logger } from "../../utils/logger";
import WhatsAppProvider from "../../providers/WhatsAppProvider";
import { Session } from "../../interfaces/IChannelProvider";
import Ticket from "../../models/Ticket";
import { Op } from "sequelize";

interface WhatsAppSessionInfo {
  sessionId: string;
  tenantId: number;
  name: string;
  status: string;
  phoneNumber?: string;
  isConnected: boolean;
  lastActivity: Date;
}

class WhatsAppSessionService {
  private whatsappProvider: WhatsAppProvider;

  constructor() {
    this.whatsappProvider = WhatsAppProvider.getInstance();
  }

  /**
   * Obter informações detalhadas de uma sessão WhatsApp
   */
  async getSessionInfo(sessionId: string): Promise<WhatsAppSessionInfo | null> {
    try {
      const session = await this.whatsappProvider.getSession(sessionId);
      
      if (!session) {
        return null;
      }

      return {
        sessionId: session.sessionId,
        tenantId: session.tenantId,
        name: session.name || `Sessão ${sessionId}`,
        status: session.status,
        phoneNumber: session.phoneNumber,
        isConnected: session.status === 'connected' || session.status === 'ready',
        lastActivity: new Date()
      };
    } catch (error) {
      logger.error(`Error getting session info for ${sessionId}: ${error}`);
      return null;
    }
  }

  /**
   * Listar todas as sessões ativas do WhatsApp para um tenant
   * Esta é uma implementação temporária que busca sessões
   * baseadas em contatos recentes e tickets
   */
  async listActiveSessions(tenantId: number): Promise<WhatsAppSessionInfo[]> {
    try {
      logger.info(`Listing active WhatsApp sessions for tenant ${tenantId}`);
      
      // Estratégia 1: Buscar sessões conhecidas no banco
      // Por enquanto, vamos retornar uma lista vazia e implementar
      // a descoberta automática em uma versão futura
      
      // TODO: Implementar descoberta automática de sessões
      // - Verificar tickets recentes do WhatsApp
      // - Verificar contatos WhatsApp recentes
      // - Consultar endpoint de saúde do gateway para sessões ativas
      
      return [];
    } catch (error) {
      logger.error(`Error listing active sessions for tenant ${tenantId}: ${error}`);
      return [];
    }
  }

  /**
   * Verificar se uma sessão está ativa e conectada
   */
  async isSessionActive(sessionId: string): Promise<boolean> {
    try {
      const sessionInfo = await this.getSessionInfo(sessionId);
      return sessionInfo?.isConnected || false;
    } catch (error) {
      logger.error(`Error checking session status for ${sessionId}: ${error}`);
      return false;
    }
  }

  /**
   * Obter sessões ativas baseadas em tickets recentes
   */
  async getActiveSessionsFromTickets(tenantId: number): Promise<string[]> {
    try {
      // Buscar tickets WhatsApp dos últimos 7 dias
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentTickets = await Ticket.findAll({
        where: {
          tenantId,
          whatsappId: { [Op.ne]: "" },
          updatedAt: { [Op.gte]: sevenDaysAgo }
        },
        include: [
          {
            association: "contact",
            attributes: ["number", "isWAContact"]
          }
        ],
        order: [["updatedAt", "DESC"]],
        limit: 50
      });

      // Extrair sessionIds únicas dos tickets recentes
      const sessionIds = new Set<string>();
      recentTickets.forEach(ticket => {
        if (ticket.contact?.isWAContact && ticket.whatsappId) {
          // Extrair sessionId do whatsappId (formato: tenant_X_session_Y)
          const whatsappIdStr = String(ticket.whatsappId);
          const match = whatsappIdStr.match(/tenant_\d+_session_(.+)/);
          if (match && match[1]) {
            sessionIds.add(match[1]);
          }
        }
      });

      return Array.from(sessionIds);
    } catch (error) {
      logger.error(`Error getting active sessions from tickets for tenant ${tenantId}: ${error}`);
      return [];
    }
  }

  /**
   * Sincronizar contatos para todas as sessões ativas do tenant
   */
  async syncContactsForAllSessions(tenantId: number): Promise<void> {
    try {
      logger.info(`Starting contact sync for all active sessions of tenant ${tenantId}`);
      
      const activeSessions = await this.listActiveSessions(tenantId);
      
      if (activeSessions.length === 0) {
        logger.warn(`No active WhatsApp sessions found for tenant ${tenantId}`);
        return;
      }

      // Importar dinamicamente para evitar dependência circular
      const { default: SyncContactsGatewayService } = await import("./SyncContactsGatewayService");
      const syncService = new SyncContactsGatewayService();

      // Sincronizar contatos para cada sessão ativa
      for (const sessionInfo of activeSessions) {
        try {
          logger.info(`Syncing contacts for session ${sessionInfo.sessionId}`);
          await syncService.syncContacts(sessionInfo.sessionId, tenantId);
        } catch (error) {
          logger.error(`Error syncing contacts for session ${sessionInfo.sessionId}: ${error}`);
        }
      }

      logger.info(`Contact sync completed for all sessions of tenant ${tenantId}`);
    } catch (error) {
      logger.error(`Error in syncContactsForAllSessions: ${error}`);
    }
  }
}

export default WhatsAppSessionService;