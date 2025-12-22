<template>
  <div v-if="userProfile === 'admin'">
    <q-card class="q-ma-sm" square>
      <div class="text-h5 q-pa-sm q-ma-sm">
        Horário de Atendimento
        <q-icon name="help">
          <q-tooltip
            content-class="bg-light-blue-1 text-black q-pa-sm shadow-4"
          >
            <span class="text-weight-medium">Tipos de horário:</span>
            <span class="row col">
              Aberto: Estabelecimento aberto durante todo o dia. Não será feito
              envio de mensagem de ausência;
            </span>
            <span class="row col">
              Fechado: Estabelecimento fechado durante todo o dia. Será feito
              envio de mensagem de ausência, independente do horário;
            </span>
            <span class="row col">
              Horário: Representa o horário de funcionamento do estabelecimento.
              O sistema enviará mensagem de ausênica quando mensagens forem
              recebidas fora dos horários estabelecidos.
            </span>
            <span class="row col">
              Importante: A mensagem de ausência será enviada após o
              encerramento do atendimento automático.
            </span>
          </q-tooltip>
        </q-icon>

        <q-btn
          rounded
          color="positive"
          label="Salvar"
          class="float-right"
          @click="salvarHorariosAtendimento"
        />
      </div>

      <q-separator />

      <q-card-section>
        <div class="row q-col-gutter-sm">
          <div
            class="col-xs-12 col-sm-4 q-mt-sm"
            v-for="dia in businessHours"
            :key="dia.value"
          >
            <q-card square bordered flat>
              <div class="text-body1 text-bold bg-grey-3 q-pa-xs q-pl-sm">
                {{ dia.label }}
              </div>

              <q-separator />

              <q-card-section class="q-pt-none">
                <q-option-group
                  inline
                  class="row justify-between q-mb-md"
                  v-model="dia.type"
                  :options="optType"
                  color="primary"
                />

                <div class="row items-baseline q-gutter-sm">
                  <q-input
                    :disable="dia.type !== 'H'"
                    dense
                    rounded
                    outlined
                    class="col-grow"
                    error-message="Obrigatório"
                    hide-underline
                    type="time"
                    v-model="dia.hr1"
                  />
                  <h6>às</h6>
                  <q-input
                    :disable="dia.type !== 'H'"
                    dense
                    rounded
                    outlined
                    class="col-grow"
                    error-message="Obrigatório"
                    hide-underline
                    type="time"
                    v-model="dia.hr2"
                  />
                </div>

                <div class="row items-baseline q-gutter-sm">
                  <q-input
                    :disable="dia.type !== 'H'"
                    dense
                    rounded
                    outlined
                    class="col-grow"
                    error-message="Obrigatório"
                    hide-underline
                    type="time"
                    v-model="dia.hr3"
                  />
                  <h6>às</h6>
                  <q-input
                    :disable="dia.type !== 'H'"
                    dense
                    outlined
                    rounded
                    class="col-grow"
                    error-message="Obrigatório"
                    hide-underline
                    type="time"
                    v-model="dia.hr4"
                  />
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card class="q-ma-sm q-mt-md full-full-height">
      <div class="text-h6 q-pa-sm q-ma-sm">
        Mensagem de Ausência
        <q-btn
          color="positive"
          label="Salvar"
          rounded
          class="float-right"
          @click="salvarMensagemAusencia"
        />
      </div>

      <q-card-section class="q-pt-none">
        <div class="row items-center">
          <div class="col-xs-3 col-sm-2 col-md-1">
            <q-btn round flat class="q-ml-sm">
              <q-icon size="2em" name="mdi-emoticon-happy-outline" />
              <q-tooltip>Emoji</q-tooltip>
              <q-menu anchor="top right" self="bottom middle" :offset="[5, 40]">
                <VEmojiPicker
                  style="width: 40vw"
                  :showSearch="false"
                  :emojisByRow="20"
                  labelSearch="Localizar..."
                  lang="pt-BR"
                  @select="onInsertSelectEmoji"
                />
              </q-menu>
            </q-btn>

            <q-btn round flat dense>
              <q-icon size="2em" name="mdi-variable" />
              <q-tooltip>Variáveis</q-tooltip>
              <q-menu touch-position>
                <q-list dense style="min-width: 100px">
                  <q-item
                    v-for="variavel in variaveis"
                    :key="variavel.label"
                    clickable
                    @click="onInsertSelectVariable(variavel.value)"
                    v-close-popup
                  >
                    <q-item-section>{{ variavel.label }}</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>

          <div class="col-xs-8 col-sm-10 col-md-11 q-pl-sm">
            <textarea
              ref="inputEnvioMensagem"
              style="min-height: 9vh; max-height: 9vh"
              class="q-pa-sm bg-white rounded-all full-width"
              placeholder="Digite a mensagem"
              @input="(v) => (messageBusinessHours = v.target.value)"
              :value="messageBusinessHours"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
// @ts-ignore
import { VEmojiPicker } from 'v-emoji-picker'
import {
  MostrarHorariosAtendiemento,
  AtualizarHorariosAtendiemento,
  AtualizarMensagemHorariosAtendiemento
} from 'src/service/empresas'

export default {
  name: 'HorarioAtendimento',
  components: { VEmojiPicker },
  data () {
    return {
      userProfile: 'user',
      optType: [
        { value: 'O', label: 'Aberto' },
        { value: 'C', label: 'Fechado' },
        { value: 'H', label: 'Horário' }
      ],
      variaveis: [
        { label: 'Nome', value: '{{name}}' },
        { label: 'Saudação', value: '{{greeting}}' }
      ],
      businessHours: [
        {
          day: 0,
          label: 'Domingo',
          type: 'O',
          hr1: '08:00',
          hr2: '12:00',
          hr3: '14:00',
          hr4: '18:00'
        },
        {
          day: 1,
          label: 'Segunda-Feira',
          type: 'O',
          hr1: '08:00',
          hr2: '12:00',
          hr3: '14:00',
          hr4: '18:00'
        },
        {
          day: 2,
          label: 'Terça-Feira',
          type: 'O',
          hr1: '08:00',
          hr2: '12:00',
          hr3: '14:00',
          hr4: '18:00'
        },
        {
          day: 3,
          label: 'Quarta-Feira',
          type: 'O',
          hr1: '08:00',
          hr2: '12:00',
          hr3: '14:00',
          hr4: '18:00'
        },
        {
          day: 4,
          label: 'Quinta-Feira',
          type: 'O',
          hr1: '08:00',
          hr2: '12:00',
          hr3: '14:00',
          hr4: '18:00'
        },
        {
          day: 5,
          label: 'Sexta-Feira',
          type: 'O',
          hr1: '08:00',
          hr2: '12:00',
          hr3: '14:00',
          hr4: '18:00'
        },
        {
          day: 6,
          label: 'Sábado',
          type: 'O',
          hr1: '08:00',
          hr2: '12:00',
          hr3: '14:00',
          hr4: '18:00'
        }
      ],
      messageBusinessHours: null
    }
  },
  methods: {
    onInsertSelectVariable (variable) {
      const self = this
      const tArea = this.$refs.inputEnvioMensagem
      const startPos = tArea.selectionStart
      const endPos = tArea.selectionEnd
      const cursorPos = startPos
      const tmpStr = tArea.value

      if (!variable) {
        return
      }

      self.txtContent = this.messageBusinessHours
      self.txtContent =
        tmpStr.substring(0, startPos) +
        variable +
        tmpStr.substring(endPos, tmpStr.length)
      this.messageBusinessHours = self.txtContent

      setTimeout(() => {
        tArea.selectionStart = tArea.selectionEnd = cursorPos + 1
      }, 10)
    },

    onInsertSelectEmoji (emoji) {
      const self = this
      const tArea = this.$refs.inputEnvioMensagem
      const startPos = tArea.selectionStart
      const endPos = tArea.selectionEnd
      const cursorPos = startPos
      const tmpStr = tArea.value

      if (!emoji.data) {
        return
      }

      self.txtContent = this.messageBusinessHours
      self.txtContent =
        tmpStr.substring(0, startPos) +
        emoji.data +
        tmpStr.substring(endPos, tmpStr.length)
      this.messageBusinessHours = self.txtContent

      setTimeout(() => {
        tArea.selectionStart = tArea.selectionEnd =
          cursorPos + emoji.data.length
      }, 10)
    },

    async listarMensagemHorariosAtendimento () {
      try {
        console.log('🔍 Buscando horários de atendimento...')
        const { data } = await MostrarHorariosAtendiemento()
        console.log('📊 Dados recebidos (raw):', data)
        const payload = data?.data || data
        console.log('📊 businessHours:', payload?.businessHours)
        console.log('📊 messageBusinessHours:', payload?.messageBusinessHours)
        // Normaliza para garantir os 7 dias (Dom → Sáb)
        const defaultDays = [
          { day: 0, label: 'Domingo' },
          { day: 1, label: 'Segunda-Feira' },
          { day: 2, label: 'Terça-Feira' },
          { day: 3, label: 'Quarta-Feira' },
          { day: 4, label: 'Quinta-Feira' },
          { day: 5, label: 'Sexta-Feira' },
          { day: 6, label: 'Sábado' }
        ]

        const byDay = Array.isArray(payload?.businessHours)
          ? Object.fromEntries(payload.businessHours.map(d => [Number(d.day), d]))
          : {}

        const normalized = defaultDays.map(d => {
          const existing = byDay[d.day]
          return {
            day: d.day,
            label: d.label,
            type: existing?.type || 'O',
            hr1: existing?.hr1 || '08:00',
            hr2: existing?.hr2 || '12:00',
            hr3: existing?.hr3 || '14:00',
            hr4: existing?.hr4 || '18:00'
          }
        })

        this.businessHours = normalized
        this.messageBusinessHours = (payload && payload.messageBusinessHours != null)
          ? payload.messageBusinessHours
          : ''
        console.log('✅ Horários normalizados:', this.businessHours)
        console.log('✅ Mensagem carregada:', this.messageBusinessHours)
      } catch (error) {
        console.error('❌ Erro ao carregar horários:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Erro ao carregar horários de atendimento',
          position: 'top'
        })
      }
    },

    async salvarHorariosAtendimento () {
      try {
        const { data } = await AtualizarHorariosAtendiemento(this.businessHours)
        const payload = data?.data || data

        if (payload?.businessHours) this.businessHours = payload.businessHours

        this.$q.notify({
          type: 'positive',
          message: data?.message || 'Horários atualizados com sucesso',
          position: 'top'
        })
      } catch (err) {
        const res = err?.response?.data || {}
        this.$q.notify({
          type: 'negative',
          message: res.message || 'Erro ao atualizar horários de atendimento',
          position: 'top'
        })
        // eslint-disable-next-line no-console
        console.error(res.errors || err)
      }
    },

    async salvarMensagemAusencia () {
      try {
        const { data } = await AtualizarMensagemHorariosAtendiemento({
          messageBusinessHours: this.messageBusinessHours
        })
        const payload = data?.data || data

        if (payload?.messageBusinessHours != null) {
          this.messageBusinessHours = payload.messageBusinessHours
        }

        this.$q.notify({
          type: 'positive',
          message: data?.message || 'Mensagem de ausência atualizada com sucesso',
          position: 'top'
        })
      } catch (err) {
        const res = err?.response?.data || {}
        this.$q.notify({
          type: 'negative',
          message: res.message || 'Erro ao atualizar mensagem de ausência',
          position: 'top'
        })
        // eslint-disable-next-line no-console
        console.error(res.errors || err)
      }
    }
  },

  mounted () {
    this.userProfile = localStorage.getItem('profile')

    if (this.userProfile !== 'admin' && this.userProfile !== 'super') {
      this.$q.notify({
        type: 'negative',
        message: 'Apenas administradores podem acessar esta página',
        position: 'top'
      })
      this.$router.push({ name: 'atendimento' })
      return
    }

    this.listarMensagemHorariosAtendimento()
  }
}
</script>

<style lang="scss" scoped></style>
