import { Router } from 'express';
import isAuthAdmin from '../middleware/isAuthAdmin';
import AdminBillingController from '../controllers/AdminBillingController';

const router = Router();

// GET /api/admin/plans
router.get('/plans', isAuthAdmin, AdminBillingController.listPlans);

// GET /api/admin/tenants/:tenantId/usage
router.get('/tenants/:tenantId/usage', isAuthAdmin, AdminBillingController.getTenantUsage);

export default router;
