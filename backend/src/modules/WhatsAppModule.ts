import { Module } from '@nestjs/common'
import { WebhookController } from '../controllers/WebhookController'
import { EvolutionWebhookService } from '../services/EvolutionWebhookService'

/**
 * Módulo de Integração com Evolution API
 * 
 * Componentes:
 * - WebhookController: Recebe webhooks da Evolution API
 * - EvolutionWebhookService: Processa eventos e atualiza banco de dados
 * 
 * Eventos suportados:
 * - QRCODE_UPDATED: Novo QR Code gerado
 * - CONNECTION_UPDATE: Mudança de estado da conexão
 * - MESSAGES_UPSERT: Nova mensagem recebida
 */
@Module({
  controllers: [WebhookController],
  providers: [EvolutionWebhookService],
  exports: [EvolutionWebhookService],
})
export class WhatsAppModule {}
