import { logger } from "../utils/logger";
import WebSocket from "ws";

class NotificationService {
  private wsClients: Set<WebSocket> = new Set();

  /**
   * Adiciona um cliente WebSocket à lista de clientes conectados
   */
  addClient(client: WebSocket): void {
    this.wsClients.add(client);
    client.on("close", () => this.removeClient(client));
  }

  /**
   * Remove um cliente WebSocket da lista de clientes conectados
   */
  removeClient(client: WebSocket): void {
    this.wsClients.delete(client);
  }

  /**
   * Envia uma notificação para todos os clientes conectados
   */
  sendNotification(type: string, message: string, tenantId: string): void {
    const notification = {
      type,
      message,
      tenantId,
      timestamp: new Date().toISOString()
    };

    this.wsClients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(notification));
      }
    });

    logger.info(`Notification sent: ${JSON.stringify(notification)}`);
  }
}

export default new NotificationService();