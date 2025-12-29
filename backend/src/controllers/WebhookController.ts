import { Controller, Post, Body, HttpCode, Logger } from '@nestjs/common'
import { EvolutionWebhookService } from '../services/EvolutionWebhookService'

@Controller('api/webhook/evolution')
export class WebhookController {
  private logger = new Logger('WebhookController')

  constructor(private webhookService: EvolutionWebhookService) {}

  /**
   * Normaliza nomes de eventos para padrão interno (UPPERCASE_WITH_UNDERSCORE)
   * Aceita variações:
   * - QRCODE_UPDATED, QRCODEUPDATED, qrcode.updated, qr.updated, qrcodeUpdated
   * - CONNECTION_UPDATE, CONNECTIONUPDATE, connection.update, connectionUpdate
   * - MESSAGES_UPSERT, MESSAGESUPSERT, messages.upsert, messagesUpsert
   */
  private normalizeEventName(event: string): string {
    if (!event) return ''
    
    // Converter para UPPERCASE_WITH_UNDERSCORE
    return event
      .replace(/([a-z])([A-Z])/g, '$1_$2') // camelCase → snake_case
      .replace(/\./g, '_') // dot → underscore
      .replace(/-/g, '_') // dash → underscore
      .toUpperCase()
  }

  @Post()
  @HttpCode(200)
  async handleWebhook(@Body() payload: any) {
    try {
      const { event, instance, data } = payload

      // Normalizar nome do evento
      const normalizedEvent = this.normalizeEventName(event)

      this.logger.log(
        `Webhook recebido: ${event} (normalizado: ${normalizedEvent}) para ${instance}`
      )

      // Rotear por evento normalizado
      switch (normalizedEvent) {
        case 'QRCODE_UPDATED':
        case 'QR_UPDATED':
          await this.webhookService.handleQrCodeUpdated(instance, data)
          break

        case 'CONNECTION_UPDATE':
          await this.webhookService.handleConnectionUpdate(instance, data)
          break

        case 'MESSAGES_UPSERT':
          await this.webhookService.handleMessageUpsert(instance, data)
          break

        default:
          this.logger.warn(`Evento desconhecido (normalizado): ${normalizedEvent}`)
      }

      return { status: 'received', event: normalizedEvent, instance }
    } catch (error) {
      this.logger.error(`Erro ao processar webhook: ${error.message}`, error.stack)
      // Retornar 200 OK mesmo com erro para não gerar retentativas infinitas
      return { status: 'error_but_acked', message: error.message }
    }
  }
}
