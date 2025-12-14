import { v4 as uuidv4 } from 'uuid';
import { WhatsAppClient } from './WhatsAppClient';

export class SessionManager {
  private sessions: Map<string, WhatsAppClient> = new Map();

  static async createSession(apiKey: string): Promise<string> {
    // Aqui você pode adicionar lógica para validar a apiKey, se necessário
    const sessionId = uuidv4();
    return sessionId;
  }

  getSession(sessionId: string): WhatsAppClient | undefined {
    return this.sessions.get(sessionId);
  }

  addSession(client: WhatsAppClient): void {
    this.sessions.set(client.sessionId, client);
  }

  removeSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  getAllSessions(): WhatsAppClient[] {
    return Array.from(this.sessions.values());
  }
}
