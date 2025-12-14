import dotenv from "dotenv";

dotenv.config();

export type Env = {
  port: number;
  apiKey?: string;
  appWebhookApiKey?: string;
  redisUrl?: string;
  chromeBin?: string;
  chromeArgs?: string[];
  wwebjsAuthPath: string;
  healthCheckInterval?: number;
  performanceMonitoring?: boolean;
};

export const env: Env = {
  port: Number(process.env.PORT || 3001),
  apiKey: process.env.API_KEY,
  appWebhookApiKey: process.env.APP_WEBHOOK_API_KEY,
  redisUrl: process.env.REDIS_URL,
  chromeBin: process.env.CHROME_BIN,
  chromeArgs: process.env.CHROME_ARGS ? process.env.CHROME_ARGS.split(",") : undefined,
  wwebjsAuthPath: process.env.WWEBJS_AUTH_PATH || `${process.cwd()}/.wwebjs_auth`,
  healthCheckInterval: Number(process.env.HEALTH_CHECK_INTERVAL) || 30000, // 30 segundos
  performanceMonitoring: process.env.PERFORMANCE_MONITORING === "true"
};
