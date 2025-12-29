import { Router } from "express";
import multer from "multer";
import isAuth from "../middleware/isAuth";
import uploadConfig from "../config/upload";
import checkPlanLimits from "../middleware/checkPlanLimits";

import * as MessageController from "../controllers/MessageController";

const messageRoutes = Router();

const upload = multer(uploadConfig);

// Rotas padronizadas sob /api/messages
messageRoutes.get("/:ticketId", isAuth, MessageController.index);

messageRoutes.post(
  "/:ticketId",
  isAuth,
  checkPlanLimits("messages"),
  checkPlanLimits("storage"),
  upload.array("medias"),
  MessageController.store
);

messageRoutes.post("/forward-messages/", isAuth, MessageController.forward);

messageRoutes.delete("/:messageId", isAuth, MessageController.remove);

messageRoutes.post("/edit/:messageId", isAuth, MessageController.edit);

export default messageRoutes;
