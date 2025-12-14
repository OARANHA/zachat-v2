import { Notify } from 'quasar'
import Errors from 'src/utils/errors'

export const notificarErro = (msg, error = null) => {
  let erro = ''
  if (error && typeof error === 'object') {
    erro = error?.data?.error || error?.data?.msg || error?.data?.message || error?.response?.data?.error || 'Não identificado'
  } else if (error && typeof error === 'string') {
    erro = error
  } else {
    erro = 'Erro não identificado'
  }
  const findErro = Errors.find(e => e.error == erro)
  let message = ''

  if (error && findErro) {
    message = `
      <p class="text-bold">
      <span class="text-bold">${findErro.description}.</span>
      </p>
      <p>${findErro.detail}</p>
    `
  } else {
    message = `
    <p class="text-bold">
      <span class="text-bold">${msg}</span>
    </p>
    <p>Detail: ${erro}</p>
    `
  }

  Notify.create({
    type: 'negative',
    progress: true,
    position: 'top',
    timeout: 500,
    message,
    actions: [{
      icon: 'close',
      round: true,
      color: 'white'
    }],
    html: true
  })
  throw new Error(message)
}

export const notificarSucesso = (msg) => {
  const message = `Tudo certo... <br>${msg}.`
  Notify.create({
    type: 'positive',
    progress: true,
    position: 'top',
    message,
    timeout: 500,
    actions: [{
      icon: 'close',
      round: true,
      color: 'white'
    }],
    html: true
  })
}
