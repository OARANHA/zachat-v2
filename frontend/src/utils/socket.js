import { io } from 'socket.io-client'

const getSocketURL = () => {
  // Modo 1: Via Nginx (http://localhost SEM porta)
  if (window.location.hostname === 'localhost' && !window.location.port) {
    return window.location.origin // http://localhost
  }

  // Modo 2: Dev direto Quasar (http://localhost:3000)
  if (window.location.hostname === 'localhost' && window.location.port === '3000') {
    return 'http://localhost:3100'
  }

  // Modo 3: Se VUE_APP_WS_URL estiver definida (exceção)
  const envUrl = process.env.VUE_APP_WS_URL
  if (envUrl && /^https?:\/\//.test(envUrl)) {
    return envUrl
  }

  // Fallback: Dev em localhost:3100
  return 'http://localhost:3100'
}

export const socketIO = () => {
  const isDev = process.env.NODE_ENV === 'development' || process.env.DEV
  const socketUrl = getSocketURL()

  console.log('🔌 Socket URL:', socketUrl, '| Hostname:', window.location.hostname, '| Port:', window.location.port)

  const authData = { token: null }
  try {
    const tokenItem = localStorage.getItem('token')
    if (tokenItem) {
      try {
        authData.token = typeof tokenItem === 'string' ? JSON.parse(tokenItem) : tokenItem
      } catch (e) {
        console.error('socket auth token parse error:', e, tokenItem)
        authData.token = null
      }
    }
  } catch (error) {
    console.error('Erro ao ler token:', error)
  }

  return io(socketUrl, {
    path: '/socket.io',
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 20000,
    autoConnect: true,
    transports: isDev ? ['websocket', 'polling'] : ['websocket'],
    withCredentials: true,
    auth: authData
  })
}

const socket = socketIO()

socket.on('connect', () => {
  console.info('✅ Socket conectado:', socket.id)
})

socket.on('disconnect', (reason) => {
  console.warn('⚠️ Socket desconectado:', reason)
})

socket.on('connect_error', (error) => {
  console.error('❌ Erro de conexão socket:', error?.message)
})

export default socket
