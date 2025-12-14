import { logger } from "../../utils/logger";
import NotificationService from "../NotificationService";

interface UsageData {
  usage: {
    messages: number;
    storage: number;
    users: number;
    whatsappSessions: number;
  };
  limits: {
    messagesPerMonth: number;
    storageGB: number;
    users: number;
    whatsappSessions: number;
  };
}

class UsageTracker {
  private notificationService = NotificationService;

  /**
   * Obtém dados de uso do tenant (mock - implementar com Redis)
   */
  async getUsage(tenantId: string | number): Promise<UsageData> {
    // Implementação mock - em produção seria consultar Redis
    return {
      usage: {
        messages: 0,
        storage: 0,
        users: 1,
        whatsappSessions: 0
      },
      limits: {
        messagesPerMonth: 1000,
        storageGB: 5,
        users: 10,
        whatsappSessions: 1
      }
    };
  }

  /**
   * Verifica se o uso de mensagens excedeu o limite
   */
  checkMessageUsage(currentUsage: number, limit: number): void {
    if (currentUsage >= limit) {
      const message = `Uso de mensagens excedeu o limite: ${currentUsage}/${limit}`;
      logger.warn(message);
      this.notificationService.sendNotification("message_limit_exceeded", message, "global");
    }
  }

  /**
   * Verifica se o uso de armazenamento excedeu o limite
   */
  checkStorageUsage(currentUsage: number, limit: number): void {
    if (currentUsage >= limit) {
      const message = `Uso de armazenamento excedeu o limite: ${currentUsage}/${limit}`;
      logger.warn(message);
      this.notificationService.sendNotification("storage_limit_exceeded", message, "global");
    }
  }

  /**
   * Verifica se o número de usuários ativos excedeu o limite
   */
  checkActiveUsers(currentUsage: number, limit: number): void {
    if (currentUsage >= limit) {
      const message = `Número de usuários ativos excedeu o limite: ${currentUsage}/${limit}`;
      logger.warn(message);
      this.notificationService.sendNotification("active_users_limit_exceeded", message, "global");
    }
  }

  /**
   * Verifica se o número de sessões do WhatsApp excedeu o limite
   */
  checkWhatsAppSessions(currentUsage: number, limit: number): void {
    if (currentUsage >= limit) {
      const message = `Número de sessões do WhatsApp excedeu o limite: ${currentUsage}/${limit}`;
      logger.warn(message);
      this.notificationService.sendNotification("whatsapp_sessions_limit_exceeded", message, "global");
    }
  }
}

export default new UsageTracker();
