import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'

@Injectable()
export class EvolutionWebhookService {
  private logger = new Logger('EvolutionWebhookService')
  private io: any // Socket.io server instance

  constructor(private prisma: PrismaService) {}

  // Configurar socket.io server (chamar no main.ts)
  setSocketServer(ioServer: any) {
    this.io = ioServer
  }

  /**
   * CORREÇÃO 1: Extrair QR Code como string (não objeto)
   * 
   * Evolution envia qrcode em vários formatos:
   * - data.qrCode: string base64 (mais comum)
   * - data.qrCode.base64: string base64 (aninhado)
   * - data.base64: string base64
   * - data.qrcode: string base64 (variação minúscula)
   * - Nunca: objeto inteiro (causa SequelizeValidationError)
   */
  private extractQrCodeString(data: any): string | null {
    if (!data) return null

    // Tentar prioridades em ordem
    const candidates = [
      data.qrCode, // string direto
      data.qrCode?.base64, // aninhado em object
      data.qrcode, // variação minúscula
      data.base64, // alternativa
      data.image, // outra possibilidade
    ]

    for (const candidate of candidates) {
      if (typeof candidate === 'string' && candidate.length > 0) {
        this.logger.debug(`QR extraído como string (${candidate.length} bytes)`)
        return candidate
      }
    }

    this.logger.error('Nenhum QR Code string encontrado', {
      tipos: Object.keys(data).map((k) => `${k}:${typeof data[k]}`),
    })

    return null
  }

  /**
   * CORREÇÃO 3: Mapear connection state para status interno
   * 
   * Evolution envia: state = 'open', 'connecting', 'close', etc.
   * Zechat espera: status = 'CONNECTED', 'OPENING', 'DISCONNECTED', etc.
   * 
   * Mapeamento:
   * - 'open' → 'CONNECTED' (pode receber/enviar mensagens)
   * - 'connecting' → 'OPENING' (conectando, aguarde)
   * - 'close'/'closed'/'disconnected' → 'DISCONNECTED' (desconectado)
   * - Qualquer outro → 'DISCONNECTED' (falha segura)
   */
  private mapConnectionState(state: string): string {
    if (!state) return 'DISCONNECTED'

    const stateUpper = state.toUpperCase()

    const mapping: Record<string, string> = {
      OPEN: 'CONNECTED',
      CONNECTED: 'CONNECTED',
      CONNECTING: 'OPENING',
      PAIRING: 'OPENING',
      CLOSE: 'DISCONNECTED',
      CLOSED: 'DISCONNECTED',
      DISCONNECTED: 'DISCONNECTED',
      ERROR: 'DISCONNECTED',
    }

    const result = mapping[stateUpper] || 'DISCONNECTED'
    this.logger.log(`Estado mapeado: ${state} → ${result}`)
    return result
  }

  /**
   * CORREÇÃO 2: Processar QRCODE_UPDATED
   * 
   * - Extrair apenas string base64 (não objeto)
   * - Salvar em Whatsapp.qrcode como string
   * - NÃO serializar objeto inteiro
   * - Emitir via socket para frontend exibir QR
   */
  async handleQrCodeUpdated(instanceName: string, data: any) {
    try {
      this.logger.log(`QR Code gerado para: ${instanceName}`)

      // Extrair QR como string
      const qrString = this.extractQrCodeString(data)

      if (!qrString) {
        this.logger.error(`Falha ao extrair QR para ${instanceName}`)
        return
      }

      // Atualizar no banco com string (não objeto)
      const updated = await this.prisma.whatsAppInstance.update({
        where: { instanceName },
        data: {
          qrcode: qrString, // ✅ String, não JSON.stringify(data)
          status: 'OPENING', // QR significa que está tentando conectar
          lastConnection: new Date(),
        },
      })

      this.logger.log(`QR Code salvo com sucesso (${qrString.length} bytes)`)

      // Notificar frontend via WebSocket
      if (this.io) {
        this.io.to(`whatsapp:${instanceName}`).emit('whatsapp:qrcode', {
          instanceName,
          qrcode: qrString, // ✅ Enviar apenas string base64
          status: 'OPENING',
        })
        this.logger.debug(`Socket emitido: whatsapp:qrcode para ${instanceName}`)
      }
    } catch (error) {
      this.logger.error(`Erro ao processar QR Code: ${error.message}`, error.stack)
    }
  }

  /**
   * CORREÇÃO 3: Processar CONNECTION_UPDATE
   * 
   * - Mapear state → status interno
   * - Se open:
   *   - status = CONNECTED
   *   - Limpar qrcode (já conectou)
   *   - Salvar instanceKey (session)
   *   - Salvar phoneNumber se disponível
   * - Se connecting:
   *   - status = OPENING
   * - Se close/disconnected:
   *   - status = DISCONNECTED
   * - Emitir socket para atualizar UI
   */
  async handleConnectionUpdate(instanceName: string, data: any) {
    try {
      const state = data.state || data.status || data.connection || 'unknown'
      const statusReason = data.statusReason || data.reason

      this.logger.log(
        `Connection.update: ${instanceName} → state=${state}, reason=${statusReason}`
      )

      // Mapear para status interno
      const internalStatus = this.mapConnectionState(state)

      // Preparar update
      const updateData: any = {
        status: internalStatus,
        lastConnection: new Date(),
      }

      // Se conectado (open), limpar QR e atualizar session
      if (state.toUpperCase() === 'OPEN') {
        updateData.qrcode = null // Limpar QR já que conectou
        updateData.instanceKey = data.key || data.instanceKey // Salvar chave da sessão

        // Extrair número de telefone se disponível
        if (data.phone) {
          updateData.phone = data.phone
        } else if (data.phoneNumber) {
          updateData.phone = data.phoneNumber
        }
      }

      // Se desconectado, limpar dados de sessão
      if (
        state.toUpperCase() === 'CLOSE' ||
        state.toUpperCase() === 'DISCONNECTED'
      ) {
        updateData.instanceKey = null
        updateData.phone = null
      }

      // Salvar no banco
      const updated = await this.prisma.whatsAppInstance.update({
        where: { instanceName },
        data: updateData,
      })

      this.logger.log(
        `Instância atualizada: ${instanceName} → ${internalStatus}`
      )

      // Notificar frontend via WebSocket
      if (this.io) {
        this.io.to(`whatsapp:${instanceName}`).emit('whatsapp:connection', {
          instanceName,
          status: internalStatus,
          state,
          statusReason,
          phone: updated.phone,
          connectedAt: updated.lastConnection,
        })
        this.logger.debug(
          `Socket emitido: whatsapp:connection para ${instanceName}`
        )
      }

      // Log especial para desconexões
      if (
        state.toUpperCase() === 'CLOSE' ||
        state.toUpperCase() === 'DISCONNECTED'
      ) {
        this.logger.warn(
          `Instância desconectada: ${instanceName} (motivo: ${statusReason})`
        )
      }
    } catch (error) {
      this.logger.error(
        `Erro ao processar connection.update: ${error.message}`,
        error.stack
      )
    }
  }

  /**
   * Processar MESSAGES_UPSERT
   * 
   * TODO: Implementar lógica completa
   * - Extrair conteúdo da mensagem
   * - Criar registro em Message
   * - Abrir/atualizar Ticket
   * - Trigger automações
   */
  async handleMessageUpsert(instanceName: string, data: any) {
    try {
      const { key, message, messageTimestamp, pushName } = data

      this.logger.debug(
        `Mensagem recebida de ${pushName} em ${instanceName}`
      )

      // TODO: Implementar processamento de mensagens

      // Notificar frontend (apenas para debug por enquanto)
      if (this.io) {
        this.io.to(`whatsapp:${instanceName}`).emit('whatsapp:message', {
          instanceName,
          from: key?.remoteJid,
          pushName,
          message: this.extractMessageContent(message),
        })
      }
    } catch (error) {
      this.logger.error(
        `Erro ao processar mensagem: ${error.message}`,
        error.stack
      )
    }
  }

  /**
   * Extrair conteúdo legível da mensagem
   */
  private extractMessageContent(message: any): string {
    if (!message) return '[Mensagem vazia]'
    if (message.conversation) return message.conversation
    if (message.extendedTextMessage) return message.extendedTextMessage.text
    if (message.imageMessage) return '[Imagem]'
    if (message.audioMessage) return '[Áudio]'
    if (message.videoMessage) return '[Vídeo]'
    if (message.documentMessage) return '[Documento]'
    if (message.stickerMessage) return '[Sticker]'
    return '[Mensagem]'
  }
}
