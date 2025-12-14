import { Router } from "express";
import ContactSyncController from "../controllers/ContactSyncController";
import isAuth from "../middleware/isAuth";

const router = Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(isAuth);

// Sincronizar contatos de uma sessão específica
router.post("/sessions/:sessionId/sync", ContactSyncController.syncSessionContacts);

// Sincronizar todos os contatos do tenant
router.post("/sync-all", ContactSyncController.syncAllContacts);

// Obter status da sincronização
router.get("/status", ContactSyncController.getSyncStatus);

export default router;