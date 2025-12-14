/**
 * Plan Service - Gerenciamento de planos de assinatura
 * 
 * © 2024 28web. Todos os direitos reservados.
 */

import { logger } from "../../utils/logger";
import Plan, { TenantPlan, PlanLimits } from "../../models/Plan";
import Tenant from "../../models/Tenant";

interface CreatePlanDTO {
  name: string;
  price: number;
  limits: PlanLimits;
  features: Record<string, any>;
}

class PlanService {
  /**
   * Planos padrão do sistema
   */
  private readonly DEFAULT_PLANS: CreatePlanDTO[] = [
    {
      name: "starter",
      price: 99.00,
      limits: {
        whatsappSessions: 1,
        messagesPerMonth: 1000,
        storageGB: 5,
        users: 2
      },
      features: {
        whatsapp: true,
        instagram: false,
        telegram: false,
        messenger: false,
        api: false,
        webhooks: false
      }
    },
    {
      name: "professional",
      price: 399.00,
      limits: {
        whatsappSessions: 5,
        messagesPerMonth: 10000,
        storageGB: 50,
        users: 10
      },
      features: {
        whatsapp: true,
        instagram: true,
        telegram: true,
        messenger: false,
        api: true,
        webhooks: true
      }
    },
    {
      name: "enterprise",
      price: 999.00,
      limits: {
        whatsappSessions: 999, // Ilimitado para efeitos práticos
        messagesPerMonth: 100000,
        storageGB: 200,
        users: 50
      },
      features: {
        whatsapp: true,
        instagram: true,
        telegram: true,
        messenger: true,
        api: true,
        webhooks: true,
        support: "priority",
        sla: "99.9%"
      }
    }
  ];

  /**
   * Inicializa planos padrão no banco
   */
  async initializeDefaultPlans(): Promise<void> {
    try {
      for (const planData of this.DEFAULT_PLANS) {
        const [plan, created] = await Plan.findOrCreate({
          where: { name: planData.name },
          defaults: planData
        });

        if (created) {
          logger.info(`PlanService: Plano ${planData.name} criado`);
        }
      }
    } catch (error) {
      logger.error(`PlanService.initializeDefaultPlans error: ${error}`);
      throw error;
    }
  }

  /**
   * Obtém todos os planos disponíveis
   */
  async listPlans(): Promise<Plan[]> {
    try {
      return await Plan.findAll({
        where: { status: "active" },
        order: [["price", "ASC"]]
      });
    } catch (error) {
      logger.error(`PlanService.listPlans error: ${error}`);
      throw error;
    }
  }

  /**
   * Obtém um plano por ID
   */
  async getPlanById(planId: number): Promise<Plan | null> {
    try {
      return await Plan.findOne({
        where: { id: planId, status: "active" }
      });
    } catch (error) {
      logger.error(`PlanService.getPlanById error: ${error}`);
      throw error;
    }
  }

  /**
   * Obtém um plano por nome
   */
  async getPlanByName(name: string): Promise<Plan | null> {
    try {
      return await Plan.findOne({
        where: { name, status: "active" }
      });
    } catch (error) {
      logger.error(`PlanService.getPlanByName error: ${error}`);
      throw error;
    }
  }

  /**
   * Obtém o plano de um tenant
   */
  async getTenantPlan(tenantId: number): Promise<any> {
    try {
      const tenantPlan = await TenantPlan.findOne({
        where: { tenantId, status: "active" },
        include: [
          {
            model: Plan,
            as: "plan"
          },
          {
            model: Tenant,
            as: "tenant"
          }
        ],
        order: [["createdAt", "DESC"]]
      });

      return tenantPlan;
    } catch (error) {
      logger.error(`PlanService.getTenantPlan error: ${error}`);
      // Retorna plano starter como padrão se não encontrar
      const starterPlan = await this.getPlanByName("starter");
      return {
        plan: starterPlan,
        limits: starterPlan?.limits || this.DEFAULT_PLANS[0].limits
      };
    }
  }

  /**
   * Associa um plano a um tenant
   */
  async assignPlanToTenant(
    tenantId: number,
    planId: number,
    subscriptionId?: string
  ): Promise<TenantPlan> {
    try {
      // Desativa planos anteriores
      await TenantPlan.update(
        { status: "cancelled" },
        { where: { tenantId, status: "active" } }
      );

      // Cria novo plano
      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      const tenantPlan = await TenantPlan.create({
        tenantId,
        planId,
        status: "active",
        subscriptionId: subscriptionId || "",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false
      });

      logger.info(`PlanService: Plano ${planId} associado ao tenant ${tenantId}`);
      return tenantPlan;
    } catch (error) {
      logger.error(`PlanService.assignPlanToTenant error: ${error}`);
      throw error;
    }
  }

  /**
   * Cancela assinatura de um tenant
   */
  async cancelTenantPlan(tenantId: number, cancelAtPeriodEnd: boolean = true): Promise<void> {
    try {
      await TenantPlan.update(
        { cancelAtPeriodEnd },
        { where: { tenantId, status: "active" } }
      );
      logger.info(`PlanService: Assinatura do tenant ${tenantId} marcada para cancelamento`);
    } catch (error) {
      logger.error(`PlanService.cancelTenantPlan error: ${error}`);
      throw error;
    }
  }

  /**
   * Renova período de assinatura
   */
  async renewTenantPlan(tenantId: number): Promise<void> {
    try {
      const tenantPlan = await TenantPlan.findOne({
        where: { tenantId, status: "active" }
      });

      if (!tenantPlan) {
        throw new Error(`Tenant ${tenantId} não possui plano ativo`);
      }

      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      await tenantPlan.update({
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false
      });

      logger.info(`PlanService: Período renovado para tenant ${tenantId}`);
    } catch (error) {
      logger.error(`PlanService.renewTenantPlan error: ${error}`);
      throw error;
    }
  }
}

export default new PlanService();
