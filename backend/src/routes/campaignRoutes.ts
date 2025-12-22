import express from "express";
import multer from "multer";
import uploadConfig from "../config/upload";
import isAuth from "../middleware/isAuth";

import * as CampaignController from "../controllers/CampaignController";
import checkPlanLimits from "../middleware/checkPlanLimits";

const campaignsRoutes = express.Router();
const upload = multer(uploadConfig);

campaignsRoutes.post(
  "/",
  isAuth,
  // Validar limite de storage antes de upload de mídias da campanha
  checkPlanLimits("storage"),
  upload.array("medias"),
  CampaignController.store
);
campaignsRoutes.get("/", isAuth, CampaignController.index);
campaignsRoutes.put(
  "/:campaignId",
  isAuth,
  // Validar limite de storage antes de upload de mídias da campanha
  checkPlanLimits("storage"),
  upload.array("medias"),
  CampaignController.update
);
campaignsRoutes.delete(
  "/:campaignId",
  isAuth,
  CampaignController.remove
);

campaignsRoutes.post(
  "/start/:campaignId",
  isAuth,
  CampaignController.startCampaign
);

campaignsRoutes.post(
  "/cancel/:campaignId",
  isAuth,
  CampaignController.cancelCampaign
);

export default campaignsRoutes;
