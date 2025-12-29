import { Controller, Post, Body, HttpCode, Logger } from '@nestjs/common'
import { EvolutionWebhookService } from '../services/EvolutionWebhookService'

@Controller('api/webhook/evolution')
export class WebhookController {
  private logger = new Logger('WebhookController')

  constructor(private webhookService: EvolutionWebhookService) {}

  @Post()
  @HttpCode(200)
  async handleWebhook(@Body() payload: any) {
    try {
      const { event, instance, data } = payload

      this.logger.log(`Webhook recebido: ${event} para ${instance}`)

      switch (event) {
        case 'QRCODEUPDATED':
        case 'qr.updated':
          await this.webhookService.handleQrCodeUpdated(instance, data)
          break

        case 'CONNECTIONUPDATE':
        case 'connection.update':
          await this.webhookService.handleConnectionUpdate(instance, data)
          break

        case 'MESSAGESUPSERT':
        case 'messages.upsert':
          await this.webhookService.handleMessageUpsert(instance, data)
          break

        default:
          this.logger.warn(`Evento desconhecido: ${event}`)
      }

      return { status: 'received', event, instance }
    } catch (error) {
      this.logger.error(`Erro ao processar webhook: ${error.message}`)
      return { status: 'error_but_acked' }
    }
  }
}
