import { v4 as uuidv4 } from 'uuid';
import { WhatsAppClient, WhatsAppClientConfig } from './WhatsAppClient';
import { logger } from '../utils/logger';

export class SessionManager {
  private static instance: SessionManager;
  private sessions: Map<string, WhatsAppClient> = new Map();

  // Singleton pattern
  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  /**
   * Criar e inicializar uma nova sessão WhatsApp
   */
  async createSession(config: WhatsAppClientConfig): Promise<WhatsAppClient> {
    // 1. Verificar se já existe
    if (this.sessions.has(config.sessionId)) {
      const existing = this.sessions.get(config.sessionId)!;
      const status = existing.getStatus();
      if (status === 'error' || status === 'disconnected') {
        logger.warn({ sessionId: config.sessionId, status }, 'Existing session in bad state, restarting');
        try { existing.destroy(); } catch {}
        this.sessions.delete(config.sessionId);
      } else {
        logger.info({ sessionId: config.sessionId, status }, 'Session already exists, returning existing');
        return existing;
      }
    }

    // 2. Criar instância do cliente
    logger.info({ sessionId: config.sessionId, tenantId: config.tenantId }, 'Creating new WhatsApp client');
    const client = new WhatsAppClient(config);

    // 3. Inicializar o cliente (inicia o navegador, aguarda QR)
    await client.initialize();

    // 4. Armazenar no Map
    this.sessions.set(config.sessionId, client);

    logger.info({ sessionId: config.sessionId }, 'WhatsApp client created and initialized');
    return client;
  }

  /**
   * Obter uma sessão existente
   */
  getSession(sessionId: string): WhatsAppClient | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Obter o QR code atual de uma sessão
   */
  getSessionQRCode(sessionId: string): string | undefined {
    return this.sessions.get(sessionId)?.getQRCode();
  }

  /**
   * Remover uma sessão
   */
  removeSession(sessionId: string): void {
    const client = this.sessions.get(sessionId);
    if (client) {
      logger.info({ sessionId }, 'Removing WhatsApp session');
      client.destroy();
      this.sessions.delete(sessionId);
    }
  }

  /**
   * Listar todas as sessões
   */
  getAllSessions(): WhatsAppClient[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Obter status de uma sessão
   */
  getSessionStatus(sessionId: string): string | undefined {
    return this.sessions.get(sessionId)?.getStatus();
  }

  /**
   * Obter número de telefone de uma sessão conectada
   */
  getSessionPhoneNumber(sessionId: string): string | undefined {
    const client = this.sessions.get(sessionId);
    if (client) {
      const snapshot = client.getSnapshot();
      return snapshot.phoneNumber;
    }
    return undefined;
  }
}
