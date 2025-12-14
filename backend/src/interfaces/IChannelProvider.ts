/**
 * Interface unificada para provedores de canais de comunicação
 * Permite trocar implementações sem refatorar código consumidor
 * 
 * © 2024 28web. Todos os direitos reservados.
 */

export interface SendMessageDTO {
  to: string;
  body?: string;
  mediaUrl?: string;
  mediaType?: string;
  quotedMessageId?: string;
  metadata?: Record<string, any>;
}

export interface MessageResponse {
  messageId: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: number;
  error?: string;
}

export type MessageHandler = (message: IncomingMessage) => Promise<void>;

export interface IncomingMessage {
  from: string;
  body?: string;
  mediaUrl?: string;
  mediaType?: string;
  timestamp: number;
  messageId: string;
  metadata?: Record<string, any>;
}

export interface SessionConfig {
  tenantId: string | number;
  name: string;
  webhookUrl?: string;
  metadata?: Record<string, any>;
}

export interface Session {
  sessionId: string;
  status: 'qr_code' | 'connecting' | 'connected' | 'disconnected' | 'error';
  qrCode?: string;
  phoneNumber?: string;
  error?: string;
  metadata?: Record<string, any>;
}

export interface SessionStatus {
  sessionId: string;
  status: Session['status'];
  phoneNumber?: string;
  battery?: string;
  plugged?: boolean;
  lastSeen?: number;
}

/**
 * Interface principal para provedores de canais
 * Todas as implementações devem seguir esta interface
 */
export interface IChannelProvider {
  /**
   * Envia uma mensagem através do canal
   */
  sendMessage(data: SendMessageDTO): Promise<MessageResponse>;

  /**
   * Configura handler para receber mensagens
   */
  receiveMessage(handler: MessageHandler): void;

  /**
   * Cria uma nova sessão/conexão
   */
  createSession(config: SessionConfig): Promise<Session>;

  /**
   * Remove uma sessão/conexão
   */
  deleteSession(sessionId: string): Promise<void>;

  /**
   * Obtém o status de uma sessão
   */
  getSessionStatus(sessionId: string): Promise<SessionStatus>;

  /**
   * Desconecta uma sessão (mantém dados)
   */
  disconnectSession(sessionId: string): Promise<void>;

  /**
   * Reconecta uma sessão desconectada
   */
  reconnectSession(sessionId: string): Promise<Session>;
}
