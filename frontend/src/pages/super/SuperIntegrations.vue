<template>
  <div v-if="userProfile === 'super'" class="q-pa-lg">
    <!-- Configurar Integração -->
    <q-card class="q-mb-lg">
      <q-card-section>
        <div class="text-h6">Configurar Integração ERP</div>
        <div class="text-caption text-grey-7">Conecte um provider ERP para processar assinaturas</div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-select
              v-model="formData.providerType"
              :options="providers"
              label="Provider ERP"
              option-value="value"
              option-label="label"
              outlined
              dense
              @update:model-value="formData.providerType = $event.value"
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model="formData.apiKey"
              label="API Key"
              type="password"
              outlined
              dense
            />
          </div>
          <div class="col-12">
            <q-input
              v-model="formData.webhookSecret"
              label="Webhook Secret"
              type="password"
              outlined
              dense
            />
          </div>
          <div class="col-12">
            <q-input
              v-model="formData.webhookUrl"
              label="Webhook URL (ex: https://seu-dominio.com/webhook/erp)"
              outlined
              dense
            />
          </div>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          label="Testar Conexão"
          color="info"
          flat
          @click="testarConexao"
          :loading="loading"
          :disable="!formData.providerType || !formData.apiKey"
        />
        <q-btn
          label="Configurar"
          color="positive"
          @click="configurarIntegracao"
          :loading="loading"
          :disable="!formData.providerType || !formData.apiKey"
        />
      </q-card-actions>
    </q-card>

    <!-- Status da Integração Atual -->
    <q-card>
      <q-card-section>
        <div class="text-h6">Status da Integração</div>
      </q-card-section>
      <q-separator />
      <q-card-section v-if="integration">
        <q-list bordered separator>
          <q-item>
            <q-item-section>
              <q-item-label>Provider</q-item-label>
              <q-item-label caption>{{ integration.providerType | capitalize }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label>Status</q-item-label>
              <q-badge
                :color="integration.status === 'active' ? 'positive' : 'negative'"
                :label="statusLabel(integration.status)"
              />
            </q-item-section>
          </q-item>
          <q-item v-if="integration.lastSync">
            <q-item-section>
              <q-item-label>Última Sincronização</q-item-label>
              <q-item-label caption>{{ formatDate(integration.lastSync) }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item v-if="integration.errorMessage" class="bg-negative text-white">
            <q-item-section>
              <q-item-label>Erro</q-item-label>
              <q-item-label caption>{{ integration.errorMessage }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
        <div class="q-mt-md">
          <q-btn
            label="Desativar Integração"
            color="negative"
            outline
            @click="desativarIntegracao"
            :loading="loading"
          />
        </div>
      </q-card-section>
      <q-card-section v-else>
        <div class="text-center q-py-lg text-grey-7">
          <q-icon size="3em" name="mdi-information" />
          <p class="q-mt-md">Nenhuma integração configurada</p>
          <p class="text-caption">Configure uma integração acima para começar a processar assinaturas</p>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import api from 'src/service/request'
import { format } from 'date-fns'
import { pt } from 'date-fns/locale'

export default {
  name: 'SuperIntegrations',
  data () {
    return {
      userProfile: 'user',
      loading: false,
      formData: {
        providerType: null,
        apiKey: '',
        webhookSecret: '',
        webhookUrl: ''
      },
      integration: null,
      providers: [
        { label: 'Venda ERP', value: 'vendaerp' },
        { label: 'Bling', value: 'bling' },
        { label: 'Omie', value: 'omie' },
        { label: 'Mercado Pago', value: 'mercadopago' }
      ]
    }
  },
  filters: {
    capitalize: (value) => {
      if (!value) return ''
      value = value.toString()
      return value.charAt(0).toUpperCase() + value.slice(1)
    }
  },
  methods: {
    async carregarIntegracao () {
      try {
        this.loading = true
        const { data } = await api.get('/integrations/erp')
        this.integration = data
      } catch (error) {
        if (error.response?.status === 404) {
          this.integration = null
        } else {
          this.$notificarErro('Erro ao carregar integração', error)
        }
      } finally {
        this.loading = false
      }
    },
    async configurarIntegracao () {
      try {
        this.loading = true
        const { data } = await api.post('/integrations/erp/configure', this.formData)
        this.integration = data
        this.$q.notify({
          type: 'positive',
          message: 'Integração configurada com sucesso!',
          position: 'top'
        })
        this.formData = {
          providerType: null,
          apiKey: '',
          webhookSecret: '',
          webhookUrl: ''
        }
      } catch (error) {
        this.$notificarErro('Erro ao configurar integração', error)
      } finally {
        this.loading = false
      }
    },
    async testarConexao () {
      try {
        this.loading = true
        await api.post('/integrations/erp/test', this.formData)
        this.$q.notify({
          type: 'positive',
          message: 'Conexão com sucesso!',
          position: 'top'
        })
      } catch (error) {
        this.$notificarErro('Erro ao testar conexão', error)
      } finally {
        this.loading = false
      }
    },
    async desativarIntegracao () {
      this.$q.dialog({
        title: 'Desativar Integração',
        message: 'Tem certeza que deseja desativar a integração? Novos tenants não conseguirão contratar planos.',
        cancel: true,
        persistent: true
      }).onOk(async () => {
        try {
          this.loading = true
          await api.post('/integrations/erp/disable')
          this.integration = null
          this.$q.notify({
            type: 'positive',
            message: 'Integração desativada com sucesso!',
            position: 'top'
          })
        } catch (error) {
          this.$notificarErro('Erro ao desativar integração', error)
        } finally {
          this.loading = false
        }
      })
    },
    formatDate (date) {
      if (!date) return '-'
      return format(new Date(date), 'dd/MM/yyyy HH:mm:ss', { locale: pt })
    },
    statusLabel (status) {
      const labels = {
        active: 'Ativa',
        inactive: 'Inativa',
        error: 'Erro'
      }
      return labels[status] || status
    }
  },
  mounted () {
    this.userProfile = localStorage.getItem('profile')
    this.carregarIntegracao()
  }
}
</script>

<style lang="scss" scoped>
</style>
