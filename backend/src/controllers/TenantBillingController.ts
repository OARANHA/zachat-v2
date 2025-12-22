import { Request, Response } from 'express';
import UsageService from '../services/BillingServices/UsageService';

import Plan, { TenantPlan } from '../models/Plan';
import Subscription from '../models/Subscription';

export default {
  // GET /tenant/plans
  async listPlans(req: Request, res: Response) {
    try {
      // Nota: Plan.scope('active') existe no model Plan. Alguns atributos solicitados (currency, description, billingCycle)
      // ainda não existem no model Plan atual. Para evitar erro de coluna inexistente, retornamos apenas os atributos disponíveis.
      // TODO: Quando os campos currency, description e billingCycle forem adicionados via migration/model,
      // incluir no attributes abaixo.
      const plans = await Plan.scope('active').findAll({
        attributes: [
          'id',
          'name',
          'description',
          'price',
          'currency',
          'limits',
          'features',
          'status',
          'billingCycle'
        ],
        order: [['price', 'ASC']]
      });
      return res.json({ plans });
    } catch (err: any) {
      return res.status(500).json({ error: 'FAILED_TO_LIST_PLANS', message: err?.message });
    }
  },

  // GET /tenant/usage
  async getUsage(req: Request, res: Response) {
    const tenantId = Number((req as any).user?.tenantId);
    if (!tenantId) return res.status(401).json({ error: 'Unauthorized' });

    const snapshot = await UsageService.getUsage(tenantId);
    return res.json(snapshot);
  },

  // GET /tenant/subscription
  async getTenantSubscription(req: Request, res: Response) {
    const tenantId = Number((req as any).user?.tenantId);
    if (!tenantId) return res.status(401).json({ error: 'Unauthorized' });

    // Tenta subscription ativa; fallback TenantPlan ativo; se nada, retorna baseline
    let planName = 'Sem plano definido';
    let status: string = 'none';
    let currentPeriodStart: string | null = null;
    let currentPeriodEnd: string | null = null;

    try {
      const sub = await Subscription.scope('active').findOne({ where: { tenantId } });
      if (sub) {
        status = sub.status || 'active';
        currentPeriodStart = sub.currentPeriodStart?.toISOString?.() || null;
        currentPeriodEnd = sub.currentPeriodEnd?.toISOString?.() || null;
        const plan = await Plan.findByPk(sub.planId);
        planName = plan?.name || planName;
      } else {
        const tp = await TenantPlan.findOne({ where: { tenantId, status: 'active' } });
        if (tp) {
          status = 'active';
          const plan = await Plan.findByPk(tp.planId);
          planName = plan?.name || planName;
        }
      }
    } catch (e) {
      // mantém baseline em caso de erro
    }

    return res.json({ planName, status, currentPeriodStart, currentPeriodEnd });
  }
};
