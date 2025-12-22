# Monitoramento e Alertas - Billing & Usage Tracking

## 📊 Overview
Este documento define métricas, alertas e dashboards necessários para monitorar o sistema de billing em produção.

## 🎯 Métricas a Coletar (Prometheus)

### 1) Métricas de Usage Tracking
- Counter: total de incrementos por tipo
```
billing_usage_increment_total{tenant_id, metric_type}
```
Labels: tenant_id, metric_type (messages|storage|users|whatsappSessions)

- Counter: erros em incrementos
```
billing_usage_increment_errors_total{tenant_id, metric_type, error_type}
```

- Histogram: latência de operações Redis
```
billing_redis_operation_duration_seconds{operation}
```
Labels: operation (get|set|hset|hgetall)

### 2) Métricas de Limites (checkPlanLimits)
- Counter: bloqueios por tipo de limite
```
billing_limit_exceeded_total{tenant_id, limit_type}
```

- Gauge: percentual de uso por limite (0-100)
```
billing_usage_percentage{tenant_id, limit_type}
```

### 3) Métricas de Planos
- Gauge/Counter: distribuição de tenants por plano
```
billing_tenants_per_plan{plan_id, plan_name}
```

- Counter: chamadas às APIs de billing
```
billing_api_requests_total{endpoint, status_code}
```
Endpoints: /api/billing/tenant/plans, /api/billing/tenant/usage, /api/admin/plans, /api/admin/tenants/:id/usage

### 4) Métricas de Redis
- Gauge: uso de memória
```
billing_redis_memory_bytes
```
- Gauge: total de chaves usage:*
```
billing_redis_usage_keys_total
```
- Gauge: conexões ativas
```
billing_redis_connections_active
```

## 🚨 Alertas Recomendados (Alertmanager)

- Alerta: Limite de Mensagens Próximo (80%)
```
- alert: BillingUsageNearLimit
  expr: billing_usage_percentage{limit_type="messages"} > 80
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "Tenant {{ $labels.tenant_id }} próximo do limite de mensagens"
    description: "Uso está em {{ $value }}% do limite mensal"
```

- Alerta: Limite Excedido com Frequência
```
- alert: BillingLimitExceededFrequent
  expr: rate(billing_limit_exceeded_total[5m]) > 0.1
  for: 10m
  labels:
    severity: critical
  annotations:
    summary: "Tenant {{ $labels.tenant_id }} excedendo limite frequentemente"
    description: "Taxa: {{ $value }} bloqueios/s nos últimos 5min"
```

- Alerta: Redis Down
```
- alert: BillingRedisDown
  expr: up{job="redis"} == 0
  for: 1m
  labels:
    severity: critical
  annotations:
    summary: "Redis do billing está inacessível"
    description: "Tracking de uso não está funcionando"
```

- Alerta: Latência Alta em Redis (P95 > 0.1s)
```
- alert: BillingRedisHighLatency
  expr: histogram_quantile(0.95, billing_redis_operation_duration_seconds) > 0.1
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "Latência do Redis do billing está alta"
    description: "P95: {{ $value }}s (threshold: 0.1s)"
```

- Alerta: Erros em Incrementos
```
- alert: BillingUsageIncrementErrors
  expr: rate(billing_usage_increment_errors_total[5m]) > 0.01
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "Erros ao incrementar uso no billing"
    description: "Taxa: {{ $value }} erros/s"
```

- Alerta: Tenant Sem Plano (usando defaults)
```
- alert: BillingTenantWithoutPlan
  expr: billing_tenant_using_defaults == 1
  for: 30m
  labels:
    severity: info
  annotations:
    summary: "Tenant {{ $labels.tenant_id }} sem plano ativo"
    description: "Usando limites default há 30min+"
```

## 📈 Dashboards (Grafana)

### Dashboard 1: Visão Geral de Billing
- Total de Mensagens por Tenant (Top 10)
```
sum by (tenant_id) (billing_usage_increment_total{metric_type="messages"})
```
- Storage Total Usado (single stat)
```
sum(billing_redis_memory_bytes)
```
- Taxa de Bloqueios (última 1h)
```
rate(billing_limit_exceeded_total[1h])
```
- Distribuição de Tenants por Plano (pie)
```
billing_tenants_per_plan
```

### Dashboard 2: Saúde do Redis (Billing)
- Latência P95 por operação
```
histogram_quantile(0.95, billing_redis_operation_duration_seconds)
```
- Conexões ativas (gauge)
```
billing_redis_connections_active
```
- Total de chaves usage:* (single stat)
```
billing_redis_usage_keys_total
```
- Taxa de erros (time series)
```
rate(billing_usage_increment_errors_total[5m])
```

### Dashboard 3: Uso por Tenant (Individual)
- Percentual de uso por recurso (4 gauges)
```
billing_usage_percentage{tenant_id="$tenant_id"}
```
- Histórico de mensagens (30 dias)
```
billing_usage_increment_total{tenant_id="$tenant_id", metric_type="messages"}
```
- Storage usado ao longo do tempo
```
billing_usage_increment_total{tenant_id="$tenant_id", metric_type="storage"}
```
- Eventos de limite excedido (tabela)
```
billing_limit_exceeded_total{tenant_id="$tenant_id"}
```

## 🔧 Implementação no Código (exemplos)

### Configuração Prometheus (Backend)
Arquivo: `backend/src/config/prometheus.ts`
```ts
import { register, Counter, Gauge, Histogram } from 'prom-client';

export const usageIncrementCounter = new Counter({
  name: 'billing_usage_increment_total',
  help: 'Total de incrementos de uso',
  labelNames: ['tenant_id', 'metric_type']
});

export const usageIncrementErrorCounter = new Counter({
  name: 'billing_usage_increment_errors_total',
  help: 'Total de erros em incrementos',
  labelNames: ['tenant_id', 'metric_type', 'error_type']
});

export const usagePercentageGauge = new Gauge({
  name: 'billing_usage_percentage',
  help: 'Percentual de uso do limite',
  labelNames: ['tenant_id', 'limit_type']
});

export const limitExceededCounter = new Counter({
  name: 'billing_limit_exceeded_total',
  help: 'Total de limites excedidos',
  labelNames: ['tenant_id', 'limit_type']
});

export const redisOperationDuration = new Histogram({
  name: 'billing_redis_operation_duration_seconds',
  help: 'Latência de operações Redis',
  labelNames: ['operation'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1]
});

export const metricsEndpoint = (req: any, res: any) => {
  res.set('Content-Type', register.contentType);
  res.end(register.metrics());
};
```

Registro da rota:
```ts
// backend/src/routes/metrics.ts
import { Router } from 'express';
import { metricsEndpoint } from '../config/prometheus';

const router = Router();
router.get('/metrics', metricsEndpoint);
export default router;
```

### Instrumentação no UsageService (exemplo)
```ts
import { usageIncrementCounter, usageIncrementErrorCounter, redisOperationDuration } from '../../config/prometheus';

class UsageService {
  async incrementMessages(tenantId: number, count: number, bytes?: number) {
    const end = redisOperationDuration.startTimer({ operation: 'hset' });
    try {
      // ... lógica de incremento ...
      usageIncrementCounter.inc({ tenant_id: String(tenantId), metric_type: 'messages' }, count);
    } catch (error: any) {
      usageIncrementErrorCounter.inc({ tenant_id: String(tenantId), metric_type: 'messages', error_type: error?.name || 'unknown' });
      throw error;
    } finally {
      end();
    }
  }
}
```

### Instrumentação no checkPlanLimits (exemplo)
```ts
import { limitExceededCounter, usagePercentageGauge } from '../config/prometheus';

// ... dentro do middleware
usagePercentageGauge.set({ tenant_id: String(tenantId), limit_type }, percentage);
if (isExceeded) {
  limitExceededCounter.inc({ tenant_id: String(tenantId), limit_type });
}
```

## 📋 Checklist de Implementação

### Fase 1: Instrumentação do Código
- [ ] Adicionar métricas no UsageService
- [ ] Adicionar métricas no checkPlanLimits
- [ ] Criar endpoint /metrics
- [ ] Testar localmente: `curl http://localhost:3000/metrics | grep billing_`

### Fase 2: Configuração Prometheus
- [ ] Adicionar job no prometheus.yml
```
scrape_configs:
  - job_name: 'zechat-backend'
    static_configs:
      - targets: ['backend:3000']
    metrics_path: '/metrics'
    scrape_interval: 15s
```
- [ ] Deploy Prometheus
- [ ] Validar coleta de métricas

### Fase 3: Alertas
- [ ] Criar rules no Alertmanager
- [ ] Configurar canais (Slack/Email/PagerDuty)
- [ ] Testar alertas

### Fase 4: Dashboards (Grafana)
- [ ] Importar dashboards
- [ ] Configurar datasource Prometheus
- [ ] Ajustar queries
- [ ] Treinar time

## 🧪 Testes de Observabilidade
- Teste 1: Métricas expostas
```
curl http://localhost:3000/metrics | grep billing_
```
- Teste 2: Contadores incrementam
```
# Antes
curl http://localhost:3000/metrics | grep billing_usage_increment_total
# Ação (ex.: criar mensagem)
# Depois
curl http://localhost:3000/metrics | grep billing_usage_increment_total
```
- Teste 3: Alerta de limite próximo (simulado)
```
redis-cli HSET usage:1:202512 messages 4250
# se limite for 5000 (85%)
```

## 📞 Escalação de Alertas
- critical → PagerDuty + Slack #incidents (SLA 15 min)
- warning → Slack #monitoring (SLA 1h)
- info → Email para CS (SLA 1 dia útil)

## 📝 Notas Finais
- Métricas devem ser coletadas continuamente
- Dashboards revisados semanalmente
- Alertas ajustados por falsos positivos/negativos
- Considerar tracing distribuído (Jaeger) futuramente
- Responsáveis: DevOps + Tech Lead; Revisão mensal
