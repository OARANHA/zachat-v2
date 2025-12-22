# Guia de Integração - Billing Frontend

Este documento orienta a integração do frontend com as novas APIs de billing e usage tracking.

## APIs Disponíveis

1. Listar Planos Disponíveis
- Endpoint: GET /api/billing/tenant/plans
- Auth: Bearer token (tenant user)
- Exemplo de resposta:

```json
[
  {
    "id": 1,
    "name": "Starter",
    "description": "Plano inicial para pequenos times",
    "price": 99.90,
    "currency": "BRL",
    "billingCycle": "monthly",
    "limits": {
      "messagesPerMonth": 5000,
      "storageGB": 10,
      "users": 5,
      "whatsappSessions": 2
    },
    "features": {
      "chatFlow": true,
      "campaigns": false,
      "api": false,
      "multiChannel": false
    },
    "status": "active"
  }
]
```

Uso sugerido no frontend:
- Tela: /billing/plans
- Componente: frontend/src/components/billing/PlanCard.vue
- Campos importantes: currency (formatação), billingCycle (rótulo), description (subtítulo), limits/features (recursos)

2. Ver Uso Atual do Tenant
- Endpoint: GET /api/billing/tenant/usage
- Auth: Bearer token (tenant user)
- Exemplo de resposta:

```json
{
  "usage": {
    "messages": 1523,
    "storageBytes": 2147483648,
    "users": 3,
    "whatsappSessions": 1
  },
  "limits": {
    "messagesPerMonth": 5000,
    "storageGB": 10,
    "users": 5,
    "whatsappSessions": 2
  }
}
```

Uso sugerido:
- Tela: /billing/usage ou dashboard
- Componente sugerido: UsageMetrics.vue (novo)
- Conversões: storageBytes → GB (bytes / 1024^3).toFixed(2)
- Percentuais: usage / limits (exibir avisos > 80%)

## Componentes a criar/atualizar

1. PlanCard.vue (atualizar)
Props sugeridas:

```ts
interface PlanCardProps {
  plan: {
    name: string;
    description: string;      // NOVO
    price: number;
    currency: string;         // NOVO
    billingCycle: 'monthly' | 'quarterly' | 'yearly'; // NOVO
    limits: Record<string, any>;
    features: Record<string, any>;
  }
}
```

Helpers sugeridos:

```ts
const formatCurrency = (value: number, currency: string) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value);

const formatBillingCycle = (cycle: string) => ({ monthly: 'mês', quarterly: 'trimestre', yearly: 'ano' } as any)[cycle] || cycle;
```

2. UsageMetrics.vue (novo)
- Responsável por exibir uso vs limites com barras de progresso
- Regras de cor: >= 90% negative, >= 80% warning, senão positive

```vue
<q-card>
  <q-card-section>
    <div class="text-h6">Uso do Plano</div>
  </q-card-section>
  <q-card-section>
    <!-- Mensagens -->
    <div class="metric-item">
      <div class="row justify-between">
        <span>Mensagens</span>
        <span>{{ usage.messages }} / {{ limits.messagesPerMonth }}</span>
      </div>
      <q-linear-progress :value="usage.messages / limits.messagesPerMonth" :color="getColor(usage.messages / limits.messagesPerMonth)" size="12px" class="q-mt-sm" />
    </div>
    <!-- Storage -->
    <div class="metric-item q-mt-md">
      <div class="row justify-between">
        <span>Armazenamento</span>
        <span>{{ (usage.storageBytes/1024/1024/1024).toFixed(2) }} / {{ limits.storageGB }} GB</span>
      </div>
      <q-linear-progress :value="usage.storageBytes / (limits.storageGB*1024*1024*1024)" :color="getColor(usage.storageBytes / (limits.storageGB*1024*1024*1024))" size="12px" class="q-mt-sm" />
    </div>
  </q-card-section>
</q-card>
```

```ts
const getColor = (p: number) => (p >= 0.9 ? 'negative' : p >= 0.8 ? 'warning' : 'positive');
```

## Notificações de Limite
- Alertas: 80-89% (warning), 90-99% (danger), >=100% (critical)
- Locais sugeridos: banner no dashboard, modal antes de ações, badge na sidebar

## Fluxo de Upgrade (futuro)
- /billing/plans (listar planos)
- /billing/usage (visualizar uso)
- /billing/checkout (integração com gateway)
- API futura: POST /api/billing/tenant/subscription { planId, paymentMethod }

## Store (Pinia)

```ts
import { defineStore } from 'pinia';
import { listPlans, getTenantUsage } from '@/service/billing';

export const useBillingStore = defineStore('billing', {
  state: () => ({ plans: [], currentUsage: null, loading: false }),
  actions: {
    async fetchPlans() {
      this.loading = true;
      try {
        const { data } = await listPlans();
        this.plans = data.plans || data; // compat
      } finally { this.loading = false; }
    },
    async fetchUsage() {
      const { data } = await getTenantUsage();
      this.currentUsage = data;
    }
  },
  getters: {
    usagePercentages: (state) => {
      if (!state.currentUsage) return {} as any;
      const { usage, limits } = state.currentUsage;
      return {
        messages: +(usage.messages / limits.messagesPerMonth * 100).toFixed(1),
        storage: +(usage.storageBytes / (limits.storageGB * 1024 ** 3) * 100).toFixed(1),
        users: +(usage.users / limits.users * 100).toFixed(1),
        sessions: +(usage.whatsappSessions / limits.whatsappSessions * 100).toFixed(1)
      };
    }
  }
});
```

## Tratamento de Erros
- Código: 402 com error PLAN_LIMIT_EXCEEDED e limitType
- Exibir modal de upgrade e redirecionar para /billing/plans

## Testes Locais
- Backend com Redis
- Criar mensagens/anexos e verificar incrementos
- Simular limites no Redis e validar bloqueios

---

Dúvidas: falar com o backend ou abrir ticket no Jira.
