<template>
  <q-page padding>
    <div class="text-h5 q-mb-md">Billing - Meu Plano</div>

    <div v-if="loading" class="q-my-xl flex flex-center">
      <q-spinner color="primary" size="2em" />
    </div>

    <div v-else>
      <div class="q-mb-lg">
        <div class="text-subtitle1 q-mb-sm">Meu Plano</div>
        <q-card>
          <q-card-section>
            <div class="text-body1">
              Plano atual: <strong>{{ currentPlanName || 'Não definido' }}</strong>
              <span v-if="currentPlanStatus" class="q-ml-md text-grey">(status: {{ currentPlanStatus }})</span>
            </div>
            <div v-if="currentPeriodStart || currentPeriodEnd" class="text-caption q-mt-xs">
              Período atual:
              <span v-if="currentPeriodStart">{{ new Date(currentPeriodStart).toLocaleDateString() }}</span>
              <span> - </span>
              <span v-if="currentPeriodEnd">{{ new Date(currentPeriodEnd).toLocaleDateString() }}</span>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="q-mb-lg">
        <div class="text-subtitle1 q-mb-sm">Meus Limites e Uso Atual</div>
        <UsageBars v-if="usage && limits" :usage="usage" :limits="limits" />
      </div>

      <div>
        <div class="text-subtitle1 q-mb-sm">Planos Disponíveis</div>
        <PlanList :plans="plans" />
      </div>
    </div>

    <div v-if="error" class="text-negative q-mt-md">
      {{ error }}
    </div>
  </q-page>
</template>

<script>
import { getTenantUsage, getTenantPlans, getTenantSubscription } from 'src/service/billing'
import UsageBars from 'components/billing/UsageBars.vue'
import PlanList from 'components/billing/PlanList.vue'

export default {
  name: 'TenantBilling',
  components: { UsageBars, PlanList },
  data () {
    return {
      usage: null,
      limits: null,
      plans: [],
      currentPlanName: null,
      currentPlanStatus: null,
      currentPeriodStart: null,
      currentPeriodEnd: null,
      loading: false,
      error: null
    }
  },
  async created () {
    this.loading = true
    try {
      const usageResp = await getTenantUsage()
      this.usage = usageResp.usage
      this.limits = usageResp.limits

      const plansResp = await getTenantPlans()
      this.plans = plansResp.plans || []

      const subResp = await getTenantSubscription()
      this.currentPlanName = subResp.planName || 'Não definido'
      this.currentPlanStatus = subResp.status || null
      this.currentPeriodStart = subResp.currentPeriodStart || null
      this.currentPeriodEnd = subResp.currentPeriodEnd || null
    } catch (e) {
      this.error = 'Falha ao carregar dados de billing'
    } finally {
      this.loading = false
    }
  }
}
</script>
