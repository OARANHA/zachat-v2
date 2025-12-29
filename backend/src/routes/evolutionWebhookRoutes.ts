import { Router } from "express";
import EvolutionWebhookController from "../controllers/EvolutionWebhookController";

const evolutionWebhookRoutes = Router();

// Normaliza eventos quando a Evolution envia sufixos no path
// Ex.: /api/webhook/evolution/connection-update -> event = CONNECTION_UPDATE
const normalizeEventFromPath = (req: any, _res: any, next: any) => {
  try {
    const rawPath: string = (req.path || "").toString();
    const suffix = rawPath.replace(/\/+$/, "").replace(/^\/*/, ""); // remove barras extras
    // quando path é "/" não há sufixo
    const pathSuffix = suffix === "" ? "" : `/${suffix}`;

    const map: Record<string, string> = {
      "/connection-update": "CONNECTION_UPDATE",
      "/messages-upsert": "MESSAGES_UPSERT",
      "/messages-update": "MESSAGES_UPDATE",
      "/qrcode-updated": "QRCODE_UPDATED",
      "": (req.body?.event as string) // fallback: usa event do body
    };

    const mapped = map[pathSuffix];
    if (mapped) {
      req.body = req.body || {};
      req.body.event = mapped;
    }
  } catch (_) {
    // noop
  }
  return next();
};

evolutionWebhookRoutes.post("/", EvolutionWebhookController.handle);
// aceita qualquer sufixo após /evolution
// exemplos: /evolution/connection-update, /evolution/messages-upsert
// mantém um normalizador para compatibilizar com nossa convenção interna
(evolutionWebhookRoutes as any).post("/*", normalizeEventFromPath, EvolutionWebhookController.handle);

export default evolutionWebhookRoutes;
