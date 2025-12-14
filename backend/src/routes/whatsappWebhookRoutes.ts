import { Router } from "express";
import WhatsAppWebhookController from "../controllers/WhatsAppWebhookController";

const router = Router();

router.post("/", WhatsAppWebhookController.handle);

export default router;