import request from 'src/service/request'

/**
 * Serviços para sessões WhatsApp
 * Backend:
 * - routes.use('/api/whatsapp', whatsappRoutes) - para /whatsapp
 * - routes.use('/api/whatsapp-sessions', whatsappSessionRoutes) - para /whatsappsession
 */

export function ListarWhatsapps (whatsAppId) {
  return request({
    url: '/whatsapp/whatsapp/',
    method: 'get'
  })
}

export function StartWhatsappSession (whatsAppId) {
  return request({
    url: `/whatsapp-sessions/whatsappsession/${whatsAppId}`,
    method: 'post'
  })
}

export function DeleteWhatsappSession (whatsAppId) {
  return request({
    url: `/whatsapp-sessions/whatsappsession/${whatsAppId}`,
    method: 'delete'
  })
}

export function RequestNewQrCode (data) {
  return request({
    url: `/whatsapp-sessions/whatsappsession/${data.id}`,
    method: 'put',
    data
  })
}

// ✅ NOVO: Função auxiliar para buscar o whatsapp atualizado com o QR
export function GetWhatsAppWithQRCode (whatsappId) {
  return request({
    url: `/whatsapp/whatsapp/${whatsappId}`,
    method: 'get'
  })
}

export function GetWhatSession (whatsAppId) {
  return request({
    url: `/whatsapp/whatsapp/${whatsAppId}`,
    method: 'get'
  })
}

export function UpdateWhatsapp (whatsAppId, data) {
  return request({
    url: `/whatsapp/whatsapp/${whatsAppId}`,
    method: 'put',
    data
  })
}

export function CriarWhatsapp (data) {
  return request({
    url: '/whatsapp/whatsapp',
    method: 'post',
    data
  })
}

export function DeletarWhatsapp (whatsAppId) {
  return request({
    url: `/whatsapp/whatsapp/${whatsAppId}`,
    method: 'delete'
  })
}

// api.put(`/whatsapp/${whatsAppId}`, {
//   name: values.name,
//   isDefault: values.isDefault,
// });
