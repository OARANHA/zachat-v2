<template>
  <div>
    <q-card
      v-for="p in plans"
      :key="p.id"
      class="q-mb-md"
    >
      <q-card-section>
        <div class="text-subtitle1">{{ p.name }}</div>
        <div class="text-caption text-grey">
          <!-- se tiver price, etc -->
        </div>
        <div class="q-mt-sm">
          <div class="text-caption text-grey-6">Limites:</div>
          <ul class="q-ml-md">
            <li>
              Mensagens/mês:
              {{ p.limits && p.limits.messagesPerMonth != null ? p.limits.messagesPerMonth : '—' }}
            </li>
            <li>
              Armazenamento (GB):
              {{ p.limits && p.limits.storageGB != null ? p.limits.storageGB : '—' }}
            </li>
            <li>
              Usuários:
              {{ p.limits && p.limits.users != null ? p.limits.users : '—' }}
            </li>
            <li>
              Sessões WhatsApp:
              {{ p.limits && p.limits.whatsappSessions != null ? p.limits.whatsappSessions : '—' }}
            </li>
          </ul>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          label="Selecionar"
          color="primary"
          @click="$emit('select', p)"
        />
      </q-card-actions>
    </q-card>
  </div>
</template>
<script>
export default {
  name: 'PlanList',
  props: {
    plans: { type: Array, default: () => [] }
  },
  methods: {
    onSelect (plan) {
      // TODO: chamar endpoint de mudança de plano quando existir
      // Por enquanto, apenas loga
      // eslint-disable-next-line no-console
      console.log('Selecionar plano:', plan)
      this.$q.notify({ type: 'info', message: `Plano '${plan.name}' selecionado (mock)` })
    }
  }
}
</script>
