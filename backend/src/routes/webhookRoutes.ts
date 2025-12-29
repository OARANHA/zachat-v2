import { Router } from "express";
import EvolutionWebhookController from "../controllers/EvolutionWebhookController";

const router = Router();

/**
 * Rota única para webhooks da Evolution API.
 *
 * Aceita:
 * - POST /api/webhook/evolution
 * - POST /api/webhook/evolution/connection-update
 * - POST /api/webhook/evolution/messages-upsert
 * - POST /api/webhook/evolution/<qualquer-outro-evento>
 *
 * Quando webhook_by_events = true, a Evolution adiciona
 * o slug do evento ao final da URL (connection-update, messages-upsert, etc).
 */
router.post("/api/webhook/evolution*", (req, res) => {
  const fullPath = req.path; // ex: /api/webhook/evolution/connection-update
  const base = "/api/webhook/evolution";

  // Extrai o sufixo após /api/webhook/evolution
  let suffix = fullPath.startsWith(base)
    ? fullPath.slice(base.length) // ex: /connection-update
    : "";

  // Normaliza: remove barras iniciais e coloca em minúsculo
  suffix = suffix.replace(/^\/+/, "").toLowerCase(); // ex: connection-update

  const slugToEvent: Record<string, string> = {
    "connection-update": "CONNECTION_UPDATE",
    "messages-upsert": "MESSAGES_UPSERT",
    "messages-update": "MESSAGES_UPDATE",
    "messages-delete": "MESSAGES_DELETE",
    "qrcode-updated": "QRCODE_UPDATED"
    // Adicionar aqui novos eventos se quiser nome mais bonito;
    // caso contrário, o fallback usa suffix.toUpperCase().
  };

  if (!req.body) {
    (req as any).body = {};
  }

  // Se o body ainda não tiver "event", tenta mapear pelo slug
  if (!(req as any).body.event && suffix) {
    (req as any).body.event = slugToEvent[suffix] || suffix.toUpperCase();
  }

  return EvolutionWebhookController.handle(req as any, res as any);
});

export default router;
