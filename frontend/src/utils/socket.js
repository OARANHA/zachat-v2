// frontend/src/utils/socket.js
// ARQUIVO CORRIGIDO - Socket Auth JWT Fix
// Data: 2025-12-29
// Problema: Token estava sendo parseado 2x, chegando malformado no backend
// Solução: Extrair token corretamente com validação de formato JWT

import { io } from 'socket.io-client'

/**
 * Determina a URL do servidor socket baseado no ambiente
 */
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

/**
 * FUNÇÃO CRÍTICA: Extrai token JWT corretamente do localStorage
 *
 * Problema anterior:
 * - localStorage salva como: "eyJhbGciOiJIUzI1NiIs..." (string JSON com aspas)
 * - Código antigo fazia JSON.parse() transformando em: eyJhbGciOiJIUzI1NiIs... (sem aspas)
 * - Backend recebia formato errado
 *
 * Solução:
 * - Tenta extrair em 3 formatos diferentes
 * - Valida se é JWT válido (xxx.yyy.zzz)
 * - Retorna string pura ou null
 */
const getTokenForSocket = () => {
  try {
    const tokenItem = localStorage.getItem('token')

    if (!tokenItem) {
      console.warn('⚠️ Socket: Nenhum token encontrado em localStorage')
      return null
    }

    let token = null

    // 🔴 TENTATIVA 1: Se for string JSON com aspas
    // localStorage.setItem('token', JSON.stringify(res.data.token))
    // Salva como: "eyJhbGciOiJIUzI1NiIs..."
    if (typeof tokenItem === 'string' && tokenItem.startsWith('"') && tokenItem.endsWith('"')) {
      try {
        token = JSON.parse(tokenItem) // Remove aspas JSON, fica: eyJhbGciOiJIUzI1NiIs...
        console.log('✅ Token extraído via JSON.parse (estava com aspas)')
      } catch (e) {
        console.error('❌ Falha ao fazer JSON.parse do token:', e)
        token = null
      }
    }

    // 🔴 TENTATIVA 2: Se for string pura (já é JWT válido)
    // Token no formato: xxx.yyy.zzz
    if (!token && typeof tokenItem === 'string') {
      const parts = tokenItem.split('.')
      if (parts.length === 3) {
        token = tokenItem
        console.log('✅ Token extraído como string pura JWT')
      }
    }

    // 🔴 TENTATIVA 3: Se for objeto (caso raro)
    if (!token && typeof tokenItem === 'object') {
      token = tokenItem.token || tokenItem.access_token || tokenItem
      console.log('✅ Token extraído do objeto')
    }

    if (!token) {
      console.error('❌ Socket: Não conseguiu extrair token válido', {
        tipo: typeof tokenItem,
        comprimento: tokenItem?.length,
        inicio: tokenItem?.substring(0, 20),
        contem_ponto: tokenItem?.includes('.'),
        comeca_aspas: tokenItem?.startsWith('"'),
        termina_aspas: tokenItem?.endsWith('"')
      })
      return null
    }

    console.log('✅ Socket: Token extraído com sucesso', {
      tipo: typeof token,
      comprimento: token.length,
      valido_jwt: token.split('.').length === 3,
      inicio: token.substring(0, 20) + '...',
      fim: '...' + token.substring(token.length - 20)
    })

    return token
  } catch (error) {
    console.error('❌ Socket: Erro fatal ao extrair token:', error)
    return null
  }
}

/**
 * Factory para criar socket.io com configurações corretas
 */
export const socketIO = () => {
  const isDev = process.env.NODE_ENV === 'development' || process.env.DEV
  const socketUrl = getSocketURL()
  const token = getTokenForSocket()

  console.log('🔌 Socket inicializando:', {
    url: socketUrl,
    hostname: window.location.hostname,
    port: window.location.port,
    temToken: !!token,
    modoDesenvolvimento: isDev,
    timestamp: new Date().toISOString()
  })

  return io(socketUrl, {
    path: '/socket.io',
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    autoConnect: true,
    transports: isDev ? ['websocket', 'polling'] : ['websocket'],
    withCredentials: true,
    // 🔴 CRÍTICO: Estrutura correta para autenticação
    // Token deve ser string pura JWT, não parseada
    auth: {
      token: token // ✅ String JWT válida ou null
    }
  })
}

// 📡 Criar instância do socket
const socket = socketIO()

// ============================================
// LISTENERS - Conectividade
// ============================================

/**
 * ✅ Listener: Conexão bem-sucedida
 * Disparado quando socket conecta ao servidor
 */
socket.on('connect', () => {
  console.log('✅ Socket conectado com sucesso!', {
    id: socket.id,
    conectado: socket.connected,
    timestamp: new Date().toISOString()
  })
})

/**
 * ⚠️ Listener: Desconexão
 * Disparado quando socket desconecta do servidor
 */
socket.on('disconnect', (reason) => {
  console.warn('⚠️ Socket desconectado', {
    motivo: reason,
    timestamp: new Date().toISOString()
  })
})

/**
 * ❌ Listener: Erro de conexão
 * Disparado quando há erro na conexão ou autenticação
 */
socket.on('connect_error', (error) => {
  console.error('❌ Erro de conexão socket', {
    mensagem: error?.message,
    descricao: error?.description || error?.toString(),
    timestamp: new Date().toISOString()
  })

  // Se erro for de autenticação, limpar token
  if (
    error?.message?.includes('auth') ||
    error?.message?.includes('token') ||
    error?.message?.includes('unauthorized') ||
    error?.message?.includes('401')
  ) {
    console.error('🔴 Erro de autenticação detectado - token inválido ou expirado')
    localStorage.removeItem('token')
    sessionStorage.removeItem('token')
    // Descomente a linha abaixo para redirecionar para login automaticamente
    // window.location.href = '/login'
  }
})

/**
 * 🔄 Listener: Tentativa de reconexão
 * Disparado quando socket tenta reconectar após desconexão
 */
socket.on('reconnect_attempt', (attempt) => {
  console.log('🔄 Socket tentando reconectar...', {
    tentativa: attempt,
    proxima: new Date(Date.now() + 1000).toISOString()
  })
})

/**
 * ✅ Listener: Reconectado com sucesso
 * Disparado quando socket reconecta após desconexão
 */
socket.on('reconnect', () => {
  console.log('✅ Socket reconectado com sucesso!', {
    id: socket.id,
    timestamp: new Date().toISOString()
  })
})

/**
 * ❌ Listener: Falha na reconexão
 * Disparado quando socket falha em se reconectar após todas as tentativas
 */
socket.on('reconnect_failed', () => {
  console.error('❌ Socket: Falha na reconexão após todas as tentativas', {
    timestamp: new Date().toISOString()
  })
})

// ============================================
// EXPORTAÇÃO
// ============================================

export default socket
