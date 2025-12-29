import { ConsultarDadosTicket, LocalizarMensagens } from 'src/service/tickets'
import { Notify } from 'quasar'
import $router from 'src/router'
import { orderBy } from 'lodash'
import { parseISO } from 'date-fns'

const orderMessages = (messages) => {
  const newMessages = orderBy(messages, (obj) => parseISO(obj.timestamp || obj.createdAt), ['asc'])
  return [...newMessages]
}

const orderTickets = (tickets) => {
  const newTickes = orderBy(tickets, (obj) => parseISO(obj.lastMessageAt || obj.updatedAt), ['asc'])
  return [...newTickes]
}

/**
 * safeParse
 * Faz JSON.parse com tratamento de erro e retorno padrão.
 */
const safeParse = (value, defaultValue) => {
  try {
    // nada definido -> retorna default
    if (value === null || value === undefined) {
      return defaultValue
    }

    // se já for objeto/array/etc, não parseia de novo
    if (typeof value !== 'string') {
      return value
    }

    // tratar lixo comum gravado no localStorage
    const trimmed = value.trim()
    if (trimmed === '' || trimmed === 'undefined' || trimmed === 'null') {
      return defaultValue
    }

    return JSON.parse(trimmed)
  } catch (error) {
    console.error('Erro ao fazer JSON.parse:', error, 'value=', value)
    return defaultValue
  }
}

const checkTicketFilter = (ticket) => {
  const filtroPadrao = {
    searchParam: '',
    pageNumber: 1,
    status: ['open', 'pending', 'closed'],
    showAll: false,
    count: null,
    queuesIds: [],
    withUnreadMessages: false,
    isNotAssignedUser: false,
    includeNotQueueDefined: true
  }

  const NotViewTicketsChatBot = () => {
    const configuracoes = safeParse(localStorage.getItem('configuracoes'), [])
    const conf = configuracoes?.find(c => c.key === 'NotViewTicketsChatBot')
    return (conf?.value === 'enabled')
  }

  const DirectTicketsToWallets = () => {
    const configuracoes = safeParse(localStorage.getItem('configuracoes'), [])
    const conf = configuracoes?.find(c => c.key === 'DirectTicketsToWallets')
    return (conf?.value === 'enabled')
  }

  const isNotViewAssignedTickets = () => {
    const configuracoes = safeParse(localStorage.getItem('configuracoes'), [])
    const conf = configuracoes?.find(c => c.key === 'NotViewAssignedTickets')
    return (conf?.value === 'enabled')
  }

  let filtros = filtroPadrao
  let usuario = {}
  let UserQueues = []
  let filasCadastradas = []

  filtros = safeParse(localStorage.getItem('filtrosAtendimento'), filtroPadrao)
  usuario = safeParse(localStorage.getItem('usuario'), {})
  UserQueues = safeParse(localStorage.getItem('queues'), [])
  filasCadastradas = safeParse(localStorage.getItem('filasCadastradas'), [])

  const profile = localStorage.getItem('profile') || 'user'
  const isAdminShowAll = profile === 'admin' && filtros.showAll
  const isQueuesTenantExists = filasCadastradas.length > 0

  const userId = usuario?.userId || +localStorage.getItem('userId')

  // Verificar se é admin e se está solicitando para mostrar todos
  if (isAdminShowAll) {
    console.log('isAdminShowAll', isAdminShowAll)
    return true
  }

  // se ticket for um grupo, todos podem verificar.
  if (ticket.isGroup) {
    console.log('ticket.isGroup', ticket.isGroup)
    return true
  }

  // se status do ticket diferente do staatus filtrado, retornar false
  if (filtros.status.length > 0 && !filtros.status.includes(ticket.status)) {
    console.log('Status ticket', filtros.status, ticket.status)
    return false
  }

  // verificar se já é um ticket do usuário
  if (ticket?.userId == userId) {
    console.log('Ticket do usuário', ticket?.userId, userId)
    return true
  }

  // Não visualizar tickets ainda com o Chatbot
  // desde que ainda não exista usuário ou fila definida
  if (NotViewTicketsChatBot() && ticket.autoReplyId) {
    if (!ticket?.userId && !ticket.queueId) {
      console.log('NotViewTicketsChatBot e o ticket está sem usuário e fila definida')
      return false
    }
  }

  let isValid = true

  // verificar se o usuário possui fila liberada
  if (isQueuesTenantExists) {
    const isQueueUser = UserQueues.findIndex(q => ticket.queueId === q.id)
    if (isQueueUser !== -1) {
      console.log('Fila do ticket liberada para o Usuario', ticket.queueId)
      isValid = true
    } else {
      console.log('Usuario não tem acesso a fila', ticket.queueId)
      return false
    }
  }

  // verificar se a fila do ticket está filtrada
  if (isQueuesTenantExists && filtros?.queuesIds.length) {
    const isQueue = filtros.queuesIds.findIndex(q => ticket.queueId === q)
    if (isQueue == -1) {
      console.log('filas filtradas e diferentes da do ticket', ticket.queueId)
      return false
    }
  }

  // se configuração para carteira ativa: verificar se já é um ticket da carteira do usuário
  if (DirectTicketsToWallets() && (ticket?.contact?.wallets?.length || 0) > 0) {
    const idx = ticket?.contact?.wallets.findIndex(w => w.id == userId)
    if (idx !== -1) {
      console.log('Ticket da carteira do usuário')
      return true
    }
    console.log('DirectTicketsToWallets: Ticket não pertence à carteira do usuário', ticket)
    return false
  }

  // verificar se o parametro para não permitir visualizar
  // tickets atribuidos à outros usuários está ativo
  if (isNotViewAssignedTickets() && (ticket?.userId || userId) !== userId) {
    console.log('isNotViewAssignedTickets e ticket não é do usuário', ticket?.userId, userId)
    // se usuário não estiver atribuido, permitir visualizar
    if (!ticket?.userId) {
      return true
    }
    return false
  }

  // verificar se filtro somente tickets não assinados (isNotAssingned) ativo
  if (filtros.isNotAssignedUser) {
    console.log('isNotAssignedUser ativo para exibir somente tickets não assinados', filtros.isNotAssignedUser, !ticket.userId)
    return filtros.isNotAssignedUser && !ticket.userId
  }

  return isValid
}

const atendimentoTicket = {
  state: {
    chatTicketDisponivel: false,
    tickets: [],
    ticketsLocalizadosBusca: [],
    ticketFocado: {
      contacts: {
        tags: [],
        wallets: [],
        extraInfo: []
      }
    },
    hasMore: false,
    contatos: [],
    mensagens: []
  },
  mutations: {
    SET_HAS_MORE (state, payload) {
      state.hasMore = payload
    },
    LOAD_TICKETS (state, payload) {
      const newTickets = orderTickets(payload)
      newTickets.forEach(ticket => {
        const ticketIndex = state.tickets.findIndex(t => t.id === ticket.id)
        if (ticketIndex !== -1) {
          state.tickets[ticketIndex] = ticket
          if (ticket.unreadMessages > 0) {
            state.tickets.unshift(state.tickets.splice(ticketIndex, 1)[0])
          }
        } else {
          if (checkTicketFilter(ticket)) {
            state.tickets.push(ticket)
          }
        }
      })
    },
    RESET_TICKETS (state) {
      state.hasMore = true
      state.tickets = []
    },
    RESET_UNREAD (state, payload) {
      const tickets = [...state.tickets]
      const ticketId = payload.ticketId
      const ticketIndex = tickets.findIndex(t => t.id === ticketId)
      if (ticketIndex !== -1) {
        tickets[ticketIndex] = payload
        tickets[ticketIndex].unreadMessages = 0
      }
      state.ticket = tickets
    },
    UPDATE_TICKET (state, payload) {
      if (!payload || !payload.id) return

      const ticketIndex = state.tickets.findIndex(t => t.id === payload.id)
      if (ticketIndex !== -1) {
        const tickets = [...state.tickets]
        tickets[ticketIndex] = {
          ...tickets[ticketIndex],
          ...payload,
          username: payload?.user?.name || payload?.username || tickets[ticketIndex].username,
          profilePicUrl: payload?.contact?.profilePicUrl || payload?.profilePicUrl || tickets[ticketIndex].profilePicUrl,
          name: payload?.contact?.name || payload?.name || tickets[ticketIndex].name
        }
        state.tickets = tickets.filter(t => checkTicketFilter(t))

        if (state.ticketFocado.id == payload.id) {
          state.ticketFocado = {
            ...state.ticketFocado,
            ...payload
          }
        }
      } else {
        const tickets = [...state.tickets]
        tickets.unshift({
          ...payload,
          username: payload?.user?.name || payload?.username,
          profilePicUrl: payload?.contact?.profilePicUrl || payload?.profilePicUrl,
          name: payload?.contact?.name || payload?.name
        })
        state.tickets = tickets.filter(t => checkTicketFilter(t))
      }
    },
    DELETE_TICKET (state, payload) {
      const ticketId = payload
      const ticketIndex = state.tickets.findIndex(t => t.id === ticketId)
      if (ticketIndex !== -1) {
        state.tickets.splice(ticketIndex, 1)
      }
    },
    UPDATE_TICKET_FOCADO_CONTACT (state, payload) {
      state.ticketFocado.contact = payload
    },
    UPDATE_CONTACT (state, payload) {
      if (state.ticketFocado.contactId == payload.id) {
        state.ticketFocado.contact = payload
      }
      const ticketIndex = state.tickets.findIndex(t => t.contactId === payload.id)
      if (ticketIndex !== -1) {
        const tickets = [...state.tickets]
        tickets[ticketIndex].contact = payload
        tickets[ticketIndex].name = payload.name
        tickets[ticketIndex].profilePicUrl = payload.profilePicUrl
        state.tickets = tickets
      }
    },
    TICKET_FOCADO (state, payload) {
      if (!payload || !payload.id) {
        state.ticketFocado = {
          contacts: {
            tags: [],
            wallets: [],
            extraInfo: []
          }
        }
        return
      }
      const params = {
        ...payload,
        status: payload.status == 'pending' ? 'open' : payload.status
      }
      state.ticketFocado = params
    },
    LOAD_INITIAL_MESSAGES (state, payload) {
      if (!payload) {
        state.mensagens = []
        return
      }
      const { messages = [], messagesOffLine = [] } = payload
      state.mensagens = []
      const newMessages = orderMessages([...messages, ...messagesOffLine])
      state.mensagens = newMessages
    },
    LOAD_MORE_MESSAGES (state, payload) {
      if (!payload) return

      const { messages = [], messagesOffLine = [] } = payload
      const arrayMessages = [...messages, ...messagesOffLine]
      const newMessages = []
      arrayMessages.forEach((message, index) => {
        const messageIndex = state.mensagens.findIndex(m => m.id === message.id)
        if (messageIndex !== -1) {
          state.mensagens[messageIndex] = message
          arrayMessages.splice(index, 1)
        } else {
          newMessages.push(message)
        }
      })
      const messagesOrdered = orderMessages(newMessages)
      state.mensagens = [...messagesOrdered, ...state.mensagens]
    },
    UPDATE_MESSAGES (state, payload) {
      if (!payload || !payload.ticket) return

      if (state.ticketFocado.id === payload.ticket.id) {
        const messageIndex = state.mensagens.findIndex(m => m.id === payload.id)
        const mensagens = [...state.mensagens]
        if (messageIndex !== -1) {
          mensagens[messageIndex] = payload
        } else {
          mensagens.push(payload)
        }
        state.mensagens = mensagens
        if (payload.scheduleDate && payload.status == 'pending') {
          if (state.ticketFocado.scheduledMessages) {
            const idxScheduledMessages = state.ticketFocado.scheduledMessages.findIndex(m => m.id === payload.id)
            if (idxScheduledMessages === -1) {
              state.ticketFocado.scheduledMessages.push(payload)
            }
          }
        }
      }

      const TicketIndexUpdate = state.tickets.findIndex(t => t.id == payload.ticket.id)
      if (TicketIndexUpdate !== -1) {
        const tickets = [...state.tickets]
        const unreadMessages = state.ticketFocado.id == payload.ticket.id ? 0 : payload.ticket.unreadMessages
        tickets[TicketIndexUpdate] = {
          ...state.tickets[TicketIndexUpdate],
          answered: payload.ticket.answered,
          unreadMessages,
          lastMessage: payload.mediaName || payload.body
        }
        state.tickets = tickets
      }
    },
    UPDATE_MESSAGE_STATUS (state, payload) {
      if (!payload || !payload.ticket) return

      if (state.ticketFocado.id != payload.ticket.id) {
        return
      }
      const messageIndex = state.mensagens.findIndex(m => m.id === payload.id)
      const mensagens = [...state.mensagens]
      if (messageIndex !== -1) {
        mensagens[messageIndex] = payload
        state.mensagens = mensagens
      }

      if (state.ticketFocado?.scheduledMessages) {
        const scheduledMessages = [...state.ticketFocado.scheduledMessages]
        const scheduled = scheduledMessages.filter(m => m.id != payload.id)
        state.ticketFocado.scheduledMessages = scheduled
      }
    },
    UPDATE_MESSAGE (state, payload) {
      if (!payload) return

      if (state.ticketFocado.id != payload.ticketId) {
        return
      }

      state.mensagens = state.mensagens.map((m) => {
        if (m.id == payload.id) {
          return { ...m, ...payload }
        }
        return m
      })

      if (state.ticketFocado?.scheduledMessages) {
        state.ticketFocado.scheduledMessages = state.ticketFocado.scheduledMessages.map((m) => {
          if (m.id == payload.id) {
            return { ...m, ...payload }
          }
          return m
        })
      }
    },
    RESET_MESSAGE (state) {
      state.mensagens = []
    }
  },
  actions: {
    async LocalizarMensagensTicket ({ commit, dispatch }, params) {
      try {
        const mensagens = await LocalizarMensagens(params)
        commit('SET_HAS_MORE', mensagens.data.hasMore)
        if (params.pageNumber === 1) {
          commit('LOAD_INITIAL_MESSAGES', mensagens.data)
        } else {
          commit('LOAD_MORE_MESSAGES', mensagens.data)
        }
      } catch (error) {
        console.error('Erro ao localizar mensagens:', error)
      }
    },
    async AbrirChatMensagens ({ commit, dispatch }, data) {
      try {
        await commit('TICKET_FOCADO', {})
        await commit('RESET_MESSAGE')
        const ticket = await ConsultarDadosTicket(data)
        await commit('TICKET_FOCADO', ticket.data)
        const params = {
          ticketId: data.id,
          pageNumber: 1
        }
        await dispatch('LocalizarMensagensTicket', params)

        await $router.push({ name: 'chat', params, query: { t: new Date().getTime() } })
      } catch (error) {
        if (!error) return
        const errorMsg = error?.response?.data?.error
        if (errorMsg) {
          Notify.create({
            type: 'negative',
            message: error.response.data.error,
            progress: true,
            position: 'top'
          })
        } else {
          Notify.create({
            type: 'negative',
            message: `Ops... Ocorreu um problema não identificado. ${JSON.stringify(error)}`,
            progress: true,
            position: 'top'
          })
        }
      }
    }
  }
}

export default atendimentoTicket
