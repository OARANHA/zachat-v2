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
  chromeBin: process.env.CHROME_BIN || "/usr/bin/chromium",
  chromeArgs: process.env.CHROME_ARGS ? process.env.CHROME_ARGS.split(",") : [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-background-networking",
    "--disable-breakpad",
    "--disable-client-side-phishing-detection",
    "--disable-component-extensions-with-background-pages",
    "--disable-default-apps",
    "--disable-extensions",
    "--disable-features=TranslateUI",
    "--disable-preconnect",
    "--disable-popup-blocking",
    "--disable-prompt-on-repost",
    "--disable-sync",
    "--metrics-recording-only",
    "--mute-audio",
    "--no-service-autorun",
    "--password-store=basic",
    "--use-mock-keychain"
  ],
  wwebjsAuthPath: process.env.WWEBJS_AUTH_PATH || `${process.cwd()}/.wwebjs_auth`,
  healthCheckInterval: Number(process.env.HEALTH_CHECK_INTERVAL) || 30000,
  performanceMonitoring: process.env.PERFORMANCE_MONITORING === "true"
};
