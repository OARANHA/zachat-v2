<template>
  <div class="row q-col-gutter-md">
    <div class="col-12 col-md-6">
      <q-card>
        <q-card-section>
          <div class="text-subtitle2">Usuários</div>
          <q-linear-progress :value="ratio(usage.users, limits.users)" color="primary" class="q-mt-sm"/>
          <div class="text-caption q-mt-xs">{{ usage.users }} / {{ limits.users }} usuários</div>
        </q-card-section>
      </q-card>
    </div>

    <div class="col-12 col-md-6">
      <q-card>
        <q-card-section>
          <div class="text-subtitle2">Sessões WhatsApp</div>
          <q-linear-progress :value="ratio(usage.whatsappSessions, limits.whatsappSessions)" color="secondary" class="q-mt-sm"/>
          <div class="text-caption q-mt-xs">{{ usage.whatsappSessions }} / {{ limits.whatsappSessions }} sessões</div>
        </q-card-section>
      </q-card>
    </div>

    <div class="col-12 col-md-6">
      <q-card>
        <q-card-section>
          <div class="text-subtitle2">Mensagens (mês)</div>
          <q-linear-progress :value="ratio(usage.messages, limits.messagesPerMonth)" color="accent" class="q-mt-sm"/>
          <div class="text-caption q-mt-xs">{{ usage.messages }} / {{ limits.messagesPerMonth }} msgs</div>
        </q-card-section>
      </q-card>
    </div>

    <div class="col-12 col-md-6">
      <q-card>
        <q-card-section>
          <div class="text-subtitle2">Armazenamento</div>
          <q-linear-progress :value="ratio(bytesToGB(usage.storageBytes), limits.storageGB)" color="positive" class="q-mt-sm"/>
          <div class="text-caption q-mt-xs">{{ formatGB(usage.storageBytes) }} / {{ limits.storageGB }} GB</div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UsageBars',
  props: {
    usage: { type: Object, required: true },
    limits: { type: Object, required: true }
  },
  methods: {
    ratio (current, max) {
      if (!max || max <= 0) return 0
      const val = Number(current || 0) / Number(max)
      return Math.max(0, Math.min(1, val))
    },
    bytesToGB (bytes) {
      return Number(bytes || 0) / (1024 * 1024 * 1024)
    },
    formatGB (bytes) {
      const gb = this.bytesToGB(bytes)
      return gb.toFixed(2)
    }
  }
}
</script>
