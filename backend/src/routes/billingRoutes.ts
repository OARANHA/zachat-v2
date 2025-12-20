import { Router } from 'express';
import PlanService from '../services/BillingServices/PlanService';
import isAuth from '../middleware/isAuth';
import TenantBillingController from '../controllers/TenantBillingController';

const router = Router();

/**
 * Rotas de Billing / Planos.
 *
 * IMPORTANTE:
 * - O prefixo completo vem de routes/index.ts:
 *     routes.use('/api/billing', billingRoutes)
 *
 * - Isso significa que os caminhos finais são:
 *     GET    /api/billing/plans
 *     POST   /api/billing/plans
 *     PUT    /api/billing/plans/:id
 *     GET    /api/billing/metrics
 *     GET    /api/billing/subscriptions
 *   (e os demais que você adicionar aqui depois)
 */

/**
 * @route GET /api/billing/plans
 * @desc Lista todos os planos disponíveis
 * @access Private/Admin
 */
router.get('/plans', isAuth, async (req, res) => {
  try {
    const plans = await PlanService.listPlans();
    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    console.error('Error listing plans:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar planos'
    });
  }
});

/**
 * @route POST /api/billing/plans
 * @desc Cria um novo plano
 * @access Private/Admin
 */
router.post('/plans', isAuth, async (req, res) => {
  try {
    const planData = req.body;

    // Validações básicas
    if (!planData.name || !planData.price || !planData.limits || !planData.features) {
      return res.status(400).json({
        success: false,
        message: 'Dados do plano incompletos'
      });
    }

    // Aqui você implementaria a lógica de criação
    // Por enquanto, retornamos erro temporário
    res.status(501).json({
      success: false,
      message: 'Funcionalidade de criação de planos em desenvolvimento'
    });

  } catch (error) {
    console.error('Error creating plan:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar plano'
    });
  }
});

/**
 * @route PUT /api/billing/plans/:id
 * @desc Atualiza um plano existente
 * @access Private/Admin
 */
router.put('/plans/:id', isAuth, async (req, res) => {
  try {
    const planId = parseInt(req.params.id);
    const planData = req.body;

    // Validações básicas
    if (!planId || !planData) {
      return res.status(400).json({
        success: false,
        message: 'DADOS INVÁLIDOS'
      });
    }

    // Aqui você implementaria a lógica de atualização
    // Por enquanto, retornamos erro temporário
    res.status(501).json({
      success: false,
      message: 'Funcionalidade de atualização de planos em desenvolvimento'
    });

  } catch (error) {
    console.error('Error updating plan:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar plano'
    });
  }
});

/**
 * @route GET /api/billing/metrics
 * @desc Obtém métricas financeiras
 * @access Private/Admin
 */
router.get('/metrics', isAuth, async (req, res) => {
  try {
    // Métricas fictícias por enquanto
    const metrics = {
      monthlyRevenue: 15000.0,
      revenueGrowth: 12.5,
      activeSubscribers: 150,
      subscriberGrowth: 8.3,
      arpu: 100.0,
      churnRate: 3.2,
      planDistribution: [
        { name: 'starter',      count: 100, percentage: 66.7 },
        { name: 'professional', count: 35,  percentage: 23.3 },
        { name: 'enterprise',   count: 15,  percentage: 10.0 }
      ]
    };

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Error getting billing metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter métricas'
    });
  }
});

/**
 * @route GET /api/billing/subscriptions
 * @desc Lista assinaturas
 * @access Private/Admin
 */
router.get('/subscriptions', isAuth, async (req, res) => {
  try {
    // Dados fictícios por enquanto
    const subscriptions = {
      subscriptions: [],
      recent: []
    };

    res.json({
      success: true,
      data: subscriptions
    });
  } catch (error) {
    console.error('Error listing subscriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar assinaturas'
    });
  }
});

// ========== Tenant Billing endpoints ==========
router.get('/tenant/usage', isAuth, TenantBillingController.getUsage);
router.get('/tenant/subscription', isAuth, TenantBillingController.getTenantSubscription);
router.get('/tenant/plans', isAuth, TenantBillingController.listPlans);

export default router;
