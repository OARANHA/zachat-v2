import { Router } from "express";
import multer from "multer";
import isAuth from "../middleware/isAuth";
import uploadConfig from "../config/upload";
import checkPlanLimits from "../middleware/checkPlanLimits";

import * as MessageController from "../controllers/MessageController";

const messageRoutes = Router();

const upload = multer(uploadConfig);

messageRoutes.get("/messages/:ticketId", isAuth, MessageController.index);

messageRoutes.post(
  "/messages/:ticketId",
  isAuth,
  // Validar limites antes de processar upload e criar mensagem
  checkPlanLimits("messages"),
  checkPlanLimits("storage"),
  upload.array("medias"),
  MessageController.store
);

messageRoutes.post("/forward-messages/", isAuth, MessageController.forward);

messageRoutes.delete("/messages/:messageId", isAuth, MessageController.remove);

messageRoutes.post("/messages/edit/:messageId", isAuth, MessageController.edit);

export default messageRoutes;
