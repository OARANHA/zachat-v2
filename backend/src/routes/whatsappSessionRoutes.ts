import { Router } from "express";
import isAuth from "../middleware/isAuth";
import checkPlanLimits from "../middleware/checkPlanLimits";

import WhatsAppSessionController from "../controllers/WhatsAppSessionController";

const whatsappSessionRoutes = Router();

// Novo contrato (mais simples):
// POST   /api/whatsapp-sessions                 -> cria/inicia sessão (body: { whatsappId })
// PUT    /api/whatsapp-sessions/:whatsappId     -> reinicia/gera QR code
// DELETE /api/whatsapp-sessions/:whatsappId     -> desconecta sessão

// Backward-compatible aliases também aceitos:
// POST/PUT/DELETE /api/whatsapp-sessions/whatsappsession/:whatsappId

// POST /api/whatsapp-sessions (body.whatsappId)
whatsappSessionRoutes.post(
  "/",
  isAuth,
  checkPlanLimits("whatsappSessions"),
  WhatsAppSessionController.store
);

// POST /api/whatsapp-sessions/:whatsappId (compatível)
whatsappSessionRoutes.post(
  "/:whatsappId",
  isAuth,
  checkPlanLimits("whatsappSessions"),
  WhatsAppSessionController.store
);

// PUT /api/whatsapp-sessions/:whatsappId
whatsappSessionRoutes.put(
  "/:whatsappId",
  isAuth,
  checkPlanLimits("whatsappSessions"),
  WhatsAppSessionController.update
);

// Aliases legados
whatsappSessionRoutes.post(
  "/whatsappsession/:whatsappId",
  isAuth,
  checkPlanLimits("whatsappSessions"),
  WhatsAppSessionController.store
);

whatsappSessionRoutes.put(
  "/whatsappsession/:whatsappId",
  isAuth,
  checkPlanLimits("whatsappSessions"),
  WhatsAppSessionController.update
);

// DELETE /api/whatsapp-sessions/:whatsappId
whatsappSessionRoutes.delete(
  "/:whatsappId",
  isAuth,
  WhatsAppSessionController.remove
);

// Alias legado
whatsappSessionRoutes.delete(
  "/whatsappsession/:whatsappId",
  isAuth,
  WhatsAppSessionController.remove
);

export default whatsappSessionRoutes;
