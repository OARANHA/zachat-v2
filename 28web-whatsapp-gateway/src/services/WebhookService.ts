import axios from "axios";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import { WebhookEvent } from "../types/api";

export class WebhookService {
  async post(webhookUrl: string, payload: WebhookEvent): Promise<void> {
    try {
      await axios.post(webhookUrl, payload, {
        timeout: 10_000,
        headers: {
          "content-type": "application/json",
          ...(env.appWebhookApiKey ? { "x-28web-gateway-key": env.appWebhookApiKey } : {})
        }
      });
    } catch (err: any) {
      logger.error({ err, webhookUrl }, "WebhookService.post failed");
    }
  }
}

