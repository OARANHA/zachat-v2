<template>
  <div class="wa-control">
    <div class="control-header">
      <h4>{{ channel.instanceName || 'WhatsApp' }}</h4>
      <span class="status-badge" :class="channel.status">
        {{ statusLabel }}
      </span>
    </div>

    <!-- QR Code Display -->
    <div v-if="channel.status === 'qrcode' && channel.qrcode" class="qr-display">
      <p class="qr-title">Escaneie o QR Code:</p>
      <img
        :src="`data:image/png;base64,${channel.qrcode}`"
        alt="QR Code"
        class="qr-image"
      />
      <p class="qr-helper-text">
        Abra WhatsApp no celular → Configurações → Dispositivos conectados → Conectar
      </p>
    </div>

    <!-- Control Buttons -->
    <div class="button-group">
      <button
        @click="generateQr"
        :disabled="loading"
        class="btn btn-primary"
        title="Gerar novo QR Code para escanear"
      >
        <span v-if="loading" class="spinner"></span>
        {{ channel.status === 'qrcode' ? 'Atualizar QR' : 'Gerar QR Code' }}
      </button>

      <button
        @click="reconnect"
        :disabled="loading || channel.status === 'connected'"
        class="btn btn-secondary"
        title="Reconectar ao WhatsApp"
      >
        <span v-if="loading" class="spinner"></span>
        Reconectar
      </button>

      <button
        @click="disconnect"
        :disabled="loading || channel.status === 'disconnected'"
        class="btn btn-danger"
        title="Desconectar do WhatsApp"
      >
        <span v-if="loading" class="spinner"></span>
        Desconectar
      </button>
    </div>

    <!-- Status Info -->
    <div v-if="channel.lastConnection" class="info-box">
      <p>Última conexão: {{ formatDate(channel.lastConnection) }}</p>
    </div>

    <!-- Error Message -->
    <div v-if="errorMsg" class="alert alert-danger">
      ⚠️ {{ errorMsg }}
    </div>

    <!-- Success Message -->
    <div v-if="successMsg" class="alert alert-success">
      ✅ {{ successMsg }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSocket } from '../composables/useSocket'
import { api } from '../api/axios'

const props = defineProps<{
  instanceName: string
  channel: any
}>()

const emit = defineEmits<{
  update: [data: any]
}>()

const { socket } = useSocket()
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const statusLabel = computed(() => {
  const map: Record<string, string> = {
    connected: '✅ Conectado',
    qrcode: '📱 Aguardando QR',
    connecting: '🔄 Conectando...',
    disconnected: '❌ Desconectado',
    error: '⚠️ Erro',
  }
  return map[props.channel.status] || props.channel.status
})

async function generateQr() {
  loading.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    await api.put(`/api/whatsapp-sessions/${props.instanceName}`, {
      isQrcode: true,
    })
    successMsg.value = 'QR Code gerado! Escaneie com seu WhatsApp.'
    setTimeout(() => {
      successMsg.value = ''
    }, 5000)
  } catch (error: any) {
    errorMsg.value =
      error.response?.data?.message || 'Erro ao gerar QR Code'
    setTimeout(() => {
      errorMsg.value = ''
    }, 5000)
  } finally {
    loading.value = false
  }
}

async function reconnect() {
  loading.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    await api.post(`/api/whatsapp-sessions/${props.instanceName}/restart`)
    successMsg.value = 'Reconectando...'
    setTimeout(() => {
      successMsg.value = ''
    }, 3000)
  } catch (error: any) {
    errorMsg.value = error.response?.data?.message || 'Erro ao reconectar'
    setTimeout(() => {
      errorMsg.value = ''
    }, 5000)
  } finally {
    loading.value = false
  }
}

async function disconnect() {
  if (
    !confirm(
      'Tem certeza que deseja desconectar este canal? Mensagens deixarão de ser recebidas.'
    )
  ) {
    return
  }

  loading.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    await api.delete(`/api/whatsapp-sessions/${props.instanceName}`)
    successMsg.value = 'Canal desconectado'
    setTimeout(() => {
      successMsg.value = ''
    }, 3000)
  } catch (error: any) {
    errorMsg.value = error.response?.data?.message || 'Erro ao desconectar'
    setTimeout(() => {
      errorMsg.value = ''
    }, 5000)
  } finally {
    loading.value = false
  }
}

function formatDate(date: string | Date): string {
  return new Date(date).toLocaleString('pt-BR')
}

onMounted(() => {
  socket.on('whatsapp:qrcode', (data) => {
    if (data.instanceName === props.instanceName) {
      emit('update', { qrcode: data.qrcode, status: 'qrcode' })
    }
  })

  socket.on('whatsapp:connection', (data) => {
    if (data.instanceName === props.instanceName) {
      emit('update', { status: data.status, lastConnection: new Date() })
    }
  })
})

onUnmounted(() => {
  socket.off('whatsapp:qrcode')
  socket.off('whatsapp:connection')
})
</script>

<style scoped>
.wa-control {
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #ffffff;
  margin-bottom: 20px;
}

.control-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
}

.control-header h4 {
  margin: 0;
  color: #333;
  font-size: 16px;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.status-badge.connected {
  background: #d4edda;
  color: #155724;
}

.status-badge.disconnected {
  background: #f8d7da;
  color: #721c24;
}

.status-badge.connecting {
  background: #fff3cd;
  color: #856404;
}

.status-badge.qrcode {
  background: #d1ecf1;
  color: #0c5460;
}

.qr-display {
  text-align: center;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 6px;
  margin-bottom: 15px;
}

.qr-title {
  margin: 0 0 10px 0;
  color: #666;
  font-weight: 500;
}

.qr-image {
  width: 200px;
  height: 200px;
  border: 2px solid #ddd;
  padding: 8px;
  background: white;
  border-radius: 4px;
}

.qr-helper-text {
  margin: 10px 0 0 0;
  font-size: 12px;
  color: #999;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.btn {
  flex: 1;
  min-width: 100px;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  color: white;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-primary {
  background: #007bff;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
}

.btn-secondary:hover:not(:disabled) {
  background: #545b62;
}

.btn-danger {
  background: #dc3545;
}

.btn-danger:hover:not(:disabled) {
  background: #c82333;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.info-box {
  padding: 10px;
  background: #f9f9f9;
  border-radius: 4px;
  font-size: 12px;
  color: #999;
  margin-bottom: 15px;
}

.info-box p {
  margin: 0;
}

.alert {
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 14px;
  margin-bottom: 15px;
}

.alert-danger {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.alert-success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}
</style>
