import { Request, Response } from "express";
import { logger } from "../utils/logger";
import SyncContactsGatewayService from "../services/WbotServices/SyncContactsGatewayService";
import isAuth from "../middleware/isAuth";
import Tenant from "../models/Tenant";

class ContactSyncController {
  private syncService: SyncContactsGatewayService;

  constructor() {
    this.syncService = new SyncContactsGatewayService();
  }

  /**
   * Sincronizar contatos de uma sessão específica
   */
  syncSessionContacts = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { sessionId } = req.params;
      const tenantId = req.user?.tenantId;

      if (!sessionId) {
        return res.status(400).json({ error: "sessionId is required" });
      }

      if (!tenantId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      logger.info(`Contact sync requested for session ${sessionId}, tenant ${tenantId}`);

      const result = await this.syncService.syncContacts(sessionId, Number(tenantId));

      return res.status(200).json({
        success: result.success,
        message: result.success 
          ? "Contacts synchronized successfully" 
          : "Contact sync completed with errors",
        data: {
          added: result.added,
          updated: result.updated,
          errors: result.errors
        }
      });
    } catch (error) {
      logger.error(`Error in syncSessionContacts: ${error.message}`);
      return res.status(500).json({ 
        error: "Internal server error",
        details: error.message 
      });
    }
  };

  /**
   * Sincronizar todos os contatos do tenant
   */
  syncAllContacts = async (req: Request, res: Response): Promise<Response> => {
    try {
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      logger.info(`Full contact sync requested for tenant ${tenantId}`);

      await this.syncService.syncAllContacts(Number(tenantId));

      return res.status(200).json({
        success: true,
        message: "Contact sync initiated for all sessions"
      });
    } catch (error) {
      logger.error(`Error in syncAllContacts: ${error.message}`);
      return res.status(500).json({ 
        error: "Internal server error",
        details: error.message 
      });
    }
  };

  /**
   * Obter status da sincronização de contatos
   */
  getSyncStatus = async (req: Request, res: Response): Promise<Response> => {
    try {
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Por enquanto, retornar informações básicas
      // Futuramente podemos implementar um sistema de status mais robusto
      const tenant = await Tenant.findByPk(Number(tenantId));
      
      return res.status(200).json({
        success: true,
        data: {
          tenantId: Number(tenantId),
          lastSync: tenant?.updatedAt || null,
          status: "ready"
        }
      });
    } catch (error) {
      logger.error(`Error in getSyncStatus: ${error.message}`);
      return res.status(500).json({ 
        error: "Internal server error",
        details: error.message 
      });
    }
  };
}

export default new ContactSyncController();