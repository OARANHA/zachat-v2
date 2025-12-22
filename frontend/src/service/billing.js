/**
 * Billing Service - Comunicação com API de billing/assinaturas
 *
 * © 2024 28web. Todos os direitos reservados.
 */

import request from 'src/service/request'

/**
 * IMPORTANTE:
 * - Todas as rotas internas agora estão padronizadas em /api/...
 * - O Nginx encaminha /api/... para o backend (Express).
 * - O backend registra billing em routes.use('/api/billing', billingRoutes).
 *
 * Portanto, todos os endpoints abaixo devem usar o prefixo /api/billing/...,
 * e /api/tenants para rotas de tenants.
 */

/**
 * Obtém métricas financeiras gerais
 * GET /api/billing/metrics
 */
export const ObterMetricasFinanceiras = () => {
  return request({
    url: '/billing/metrics',
    method: 'get'
  })
}

/**
 * Lista todas as assinaturas (tenant plans)
 * GET /api/billing/subscriptions
 */
export const ListarAssinaturas = (filtros = {}) => {
  return request({
    url: '/billing/subscriptions',
    method: 'get',
    params: filtros
  })
}

/**
 * Busca assinatura de um tenant específico
 * GET /api/billing/subscriptions/tenant/:tenantId
 */
export const BuscarAssinaturaTenant = (tenantId) => {
  return request({
    url: `/billing/subscriptions/tenant/${tenantId}`,
    method: 'get'
  })
}

/**
 * Associa um plano a um tenant
 * POST /api/billing/assign-plan
 */
export const AssociarPlanoTenant = (tenantId, planId, subscriptionId = null) => {
  return request({
    url: '/billing/assign-plan',
    method: 'post',
    data: {
      tenantId,
      planId,
      subscriptionId
    }
  })
}

/**
 * Cancela assinatura de um tenant
 * POST /api/billing/cancel-subscription
 */
export const CancelarAssinaturaTenant = (tenantId, cancelAtPeriodEnd = true) => {
  return request({
    url: '/billing/cancel-subscription',
    method: 'post',
    data: {
      tenantId,
      cancelAtPeriodEnd
    }
  })
}

/**
 * Renova assinatura de um tenant
 * POST /api/billing/renew-subscription
 */
export const RenovarAssinaturaTenant = (tenantId) => {
  return request({
    url: '/billing/renew-subscription',
    method: 'post',
    data: { tenantId }
  })
}

/**
 * Lista tenants com informações de plano
 * GET /api/billing/tenants-with-plans
 */
export const ListarTenantsComPlanos = () => {
  return request({
    url: '/billing/tenants-with-plans',
    method: 'get'
  })
}

/**
 * Obtém relatório de receita por período
 * GET /api/billing/revenue-report?periodo=...
 */
export const ObterRelatorioReceita = (periodo = 'month') => {
  return request({
    url: '/billing/revenue-report',
    method: 'get',
    params: { periodo }
  })
}

/**
 * Obtém estatísticas de planos (quantos tenants por plano)
 * GET /api/billing/plan-statistics
 */
export const ObterEstatisticasPlanos = () => {
  return request({
    url: '/billing/plan-statistics',
    method: 'get'
  })
}

/**
 * Obtém métricas de churn e conversão
 * GET /api/billing/churn-metrics
 */
export const ObterMetricasChurn = () => {
  return request({
    url: '/billing/churn-metrics',
    method: 'get'
  })
}

/**
 * Lista assinaturas vencendo em X dias
 * GET /api/billing/expiring-subscriptions?dias=...
 */
export const ListarAssinaturasVencendo = (dias = 7) => {
  return request({
    url: '/billing/expiring-subscriptions',
    method: 'get',
    params: { dias }
  })
}

/**
 * Histórico de mudanças de planos
 * GET /api/billing/plan-changes/:tenantId
 */
export const ObterHistoricoMudancasPlanos = (tenantId) => {
  return request({
    url: `/billing/plan-changes/${tenantId}`,
    method: 'get'
  })
}

/**
 * Simula upgrade/downgrade de plano
 * POST /api/billing/simulate-plan-change
 */
export const SimularMudancaPlano = (tenantId, novoPlanId) => {
  return request({
    url: '/billing/simulate-plan-change',
    method: 'post',
    data: { tenantId, novoPlanId }
  })
}

/**
 * Lista todos os tenants para gestão
 * GET /api/tenants
 *
 * OBS: tenants é módulo separado, mas mantido aqui
 * por ser usado na tela de billing.
 */
export const ListarTenants = () => {
  return request({
    url: '/tenants',
    method: 'get'
  })
}

/**
 * Lista todos os planos disponíveis
 * GET /api/billing/plans
 */
export const ListarPlanos = () => {
  return request({
    url: '/billing/plans',
    method: 'get'
  })
}

/**
 * Cria um novo plano
 * POST /api/billing/plans
 */
export const CriarPlano = (planoData) => {
  return request({
    url: '/billing/plans',
    method: 'post',
    data: planoData
  })
}

/**
 * Atualiza um plano existente
 * PUT /api/billing/plans/:planoId
 */
export const AtualizarPlano = (planoId, planoData) => {
  return request({
    url: `/billing/plans/${planoId}`,
    method: 'put',
    data: planoData
  })
}

// ================= Tenant Billing (uso/planos disponíveis) =================
export const getTenantUsage = () => {
  return request({
    url: '/billing/tenant/usage',
    method: 'get'
  })
}

export const getTenantSubscription = () => {
  return request({
    url: '/billing/tenant/subscription',
    method: 'get'
  })
}

export const getTenantPlans = () => {
  return request({
    url: '/billing/tenant/plans',
    method: 'get'
  })
}
