import express from "express";
import multer from "multer";
import isAuth from "../middleware/isAuth";

import uploadConfig from "../config/upload";
import * as ContactController from "../controllers/ContactController";
import * as ImportPhoneContactsController from "../controllers/ImportPhoneContactsController";
import checkPlanLimits from "../middleware/checkPlanLimits";

const upload = multer(uploadConfig);
const contactRoutes = express.Router();

// prefixo /contacts vem do index.ts

contactRoutes.post(
  "/import",
  isAuth,
  ImportPhoneContactsController.store
);

contactRoutes.post(
  "/upload",
  isAuth,
  // Validar limite de storage antes de processar upload de contatos
  checkPlanLimits("storage"),
  upload.array("file"),
  ContactController.upload
);

contactRoutes.post(
  "/export",
  isAuth,
  ContactController.exportContacts
);

contactRoutes.get("/", isAuth, ContactController.index);

contactRoutes.get("/:contactId", isAuth, ContactController.show);

contactRoutes.post("/", isAuth, ContactController.store);

contactRoutes.post("/sync", isAuth, ContactController.syncContacts);

contactRoutes.put("/:contactId", isAuth, ContactController.update);

contactRoutes.delete("/:contactId", isAuth, ContactController.remove);

contactRoutes.put(
  "/contact-tags/:contactId",
  isAuth,
  ContactController.updateContactTags
);

contactRoutes.put(
  "/contact-wallet/:contactId",
  isAuth,
  ContactController.updateContactWallet
);

export default contactRoutes;
