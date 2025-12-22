import { Request, Response } from 'express';
import isAuthAdmin from '../middleware/isAuthAdmin';
import Plan from '../models/Plan';
import UsageService from '../services/BillingServices/UsageService';

export default {
  // GET /admin/plans
  async listPlans(req: Request, res: Response) {
    // Papel verificado via middleware da rota (isAuthAdmin)
    const plans = await Plan.findAll({ attributes: ['id', 'name', 'price', 'limits', 'features', 'status'] });
    return res.json({ plans });
  },

  // GET /admin/tenants/:tenantId/usage
  async getTenantUsage(req: Request, res: Response) {
    const tenantId = Number(req.params.tenantId);
    if (!tenantId) return res.status(400).json({ error: 'tenantId inválido' });

    const snapshot = await UsageService.getUsage(tenantId);
    return res.json(snapshot);
  }
};
