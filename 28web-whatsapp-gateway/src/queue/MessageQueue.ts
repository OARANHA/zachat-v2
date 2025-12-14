import Queue from "bull";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import { SessionManager } from "../services/SessionManager";

type SendMessageJob = {
  sessionId: string;
  to: string;
  body?: string;
};

export interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
}

export class MessageQueue {
  private queue?: Queue.Queue<SendMessageJob>;

  constructor(private sessionManager: SessionManager) {
    if (!env.redisUrl) {
      logger.warn("REDIS_URL não configurado. MessageQueue desabilitada (envio será síncrono)." );
      return;
    }

    this.queue = new Queue<SendMessageJob>("28web_whatsapp_send_message", env.redisUrl);
    this.queue.process(async (job: Queue.Job<SendMessageJob>) => {
      const session = this.sessionManager.getSession(job.data.sessionId);
      if (!session) throw new Error("Session not found");
      await session.sendMessage(job.data.to, job.data.body);
    });
  }

  isEnabled(): boolean {
    return Boolean(this.queue);
  }

  async enqueueSendMessage(data: SendMessageJob): Promise<void> {
    if (!this.queue) throw new Error("Queue disabled");
    await this.queue.add(data, {
      attempts: 3,
      backoff: 5000,
      removeOnComplete: true,
      removeOnFail: true
    });
  }

  /**
   * Obtém estatísticas da fila
   */
  async getStats(): Promise<QueueStats> {
    if (!this.queue) {
      return {
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0
      };
    }

    try {
      const waiting = await this.queue.getWaiting();
      const active = await this.queue.getActive();
      const completed = await this.queue.getCompleted();
      const failed = await this.queue.getFailed();

      return {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length
      };
    } catch (error) {
      logger.error({ error }, "Failed to get queue stats");
      return {
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0
      };
    }
  }
}
