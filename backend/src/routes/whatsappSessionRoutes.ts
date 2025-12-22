import { Router } from "express";
import isAuth from "../middleware/isAuth";
import checkPlanLimits from "../middleware/checkPlanLimits";

import WhatsAppSessionController from "../controllers/WhatsAppSessionController";

const whatsappSessionRoutes = Router();

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

whatsappSessionRoutes.delete(
  "/whatsappsession/:whatsappId",
  isAuth,
  WhatsAppSessionController.remove
);

export default whatsappSessionRoutes;
