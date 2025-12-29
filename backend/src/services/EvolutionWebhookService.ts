import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'
import * as io from 'socket.io'

@Injectable()
export class EvolutionWebhookService {
  private logger = new Logger('EvolutionWebhookService')
  private io: any // Socket.io server instance

  constructor(private prisma: PrismaService) {}

  // Configurar socket.io server (chamar no main.ts)
  setSocketServer(ioServer: any) {
    this.io = ioServer
  }

  async handleQrCodeUpdated(instanceName: string, data: any) {
    try {
      const qrcode = data.qrcode || data.qrCode || data.base64

      this.logger.log(`QR Code gerado para: ${instanceName}`)

      // Salvar QR Code no banco
      await this.prisma.whatsAppInstance.update({
        where: { instanceName },
        data: {
          qrcode,
          status: 'qrcode',
        },
      })

      // Notificar frontend via WebSocket
      if (this.io) {
        this.io.to(`whatsapp:${instanceName}`).emit('whatsapp:qrcode', {
          instanceName,
          qrcode,
        })
      }

      this.logger.log(`QR Code notificado para frontend`)
    } catch (error) {
      this.logger.error(`Erro ao processar QR Code: ${error.message}`)
    }
  }

  async handleConnectionUpdate(instanceName: string, data: any) {
    try {
      const state = data.state || data.status
      const statusReason = data.statusReason || data.reason

      this.logger.log(`Status atualizado: ${instanceName} -> ${state}`)

      // Mapear status
      const status = this.mapConnectionState(state)

      // Atualizar no banco
      await this.prisma.whatsAppInstance.update({
        where: { instanceName },
        data: {
          status,
          lastConnection: new Date(),
          statusReason: statusReason?.toString() || null,
        },
      })

      // Notificar frontend
      if (this.io) {
        this.io.to(`whatsapp:${instanceName}`).emit('whatsapp:connection', {
          instanceName,
          status,
          state,
          statusReason,
        })
      }

      // Log de desconexão
      if (state === 'close' || state === 'disconnected') {
        this.logger.warn(
          `Instância desconectada: ${instanceName} (motivo: ${statusReason})`
        )
      }
    } catch (error) {
      this.logger.error(`Erro ao processar connection.update: ${error.message}`)
    }
  }

  async handleMessageUpsert(instanceName: string, data: any) {
    try {
      const { key, message, messageTimestamp, pushName } = data

      this.logger.debug(`Mensagem recebida de ${pushName}`)

      // TODO: Implementar lógica de processamento de mensagens
      // - Criar Message no banco
      // - Abrir/atualizar Ticket
      // - Trigger automações

      // Notificar frontend
      if (this.io) {
        this.io.to(`whatsapp:${instanceName}`).emit('whatsapp:message', {
          instanceName,
          from: key?.remoteJid,
          pushName,
          message: this.extractMessageContent(message),
        })
      }
    } catch (error) {
      this.logger.error(`Erro ao processar mensagem: ${error.message}`)
    }
  }

  private mapConnectionState(state: string): string {
    const mapping: Record<string, string> = {
      open: 'connected',
      close: 'disconnected',
      connecting: 'connecting',
      qr: 'qrcode',
      CONNECTED: 'connected',
      DISCONNECTED: 'disconnected',
      CONNECTING: 'connecting',
      QRCODE: 'qrcode',
    }
    return mapping[state] || state
  }

  private extractMessageContent(message: any): string {
    if (!message) return '[Mensagem vazia]'
    if (message.conversation) return message.conversation
    if (message.extendedTextMessage) return message.extendedTextMessage.text
    if (message.imageMessage) return '[Imagem]'
    if (message.audioMessage) return '[Áudio]'
    if (message.videoMessage) return '[Vídeo]'
    if (message.documentMessage) return '[Documento]'
    return '[Mensagem]'
  }
}
