import { Router } from 'express';
import adminRoutes from './adminRoutes';
import apiConfigRoutes from './apiConfigRoutes';
import apiExternalRoutes from './apiExternalRoutes';
import authRoutes from './authRoutes';
import autoReplyRoutes from './autoReplyRoutes';
import campaignContactsRoutes from './campaignContactsRoutes';
import campaignRoutes from './campaignRoutes';
import chatFlowRoutes from './chatFlowRoutes';
import contactRoutes from './contactRoutes';
import contactSyncRoutes from './contactSyncRoutes';
import facebookRoutes from './facebookRoutes';
import fastReplyRoutes from './fastReplyRoutes';
import hubChannelRoutes from './hubChannelRoutes';
import hubMessageRoutes from './hubMessageRoutes';
import hubWebhookRoutes from './hubWebhookRoutes';
import messageRoutes from './messageRoutes';
import metricsRouter from './metrics';
import queueRoutes from './queueRoutes';
import settingRoutes from './settingRoutes';
import statisticsRoutes from './statisticsRoutes';
import tagRoutes from './tagRoutes';
import tenantRoutes from './tenantRoutes';
import ticketRoutes from './ticketRoutes';
import userRoutes from './userRoutes';
import whatsappRoutes from './whatsappRoutes';
import whatsappSessionRoutes from './whatsappSessionRoutes';
import whatsappWebhookRoutes from './whatsappWebhookRoutes';
import billingRoutes from './billingRoutes';
import tenantPlanRoutes from './tenantPlanRoutes';
import erpIntegrationRoutes from './erpIntegrationRoutes';
import erpWebhookRoutes from './erpWebhookRoutes';
import subscriptionRoutes from './subscriptionRoutes';
import adminBillingRoutes from './adminBillingRoutes';

const routes = Router();

// ========== AUTH ==========
routes.use('/api/auth', authRoutes);

// ========== API INTERNA (/api/...) ==========
routes.use('/api/users', userRoutes);
routes.use('/api/tickets', ticketRoutes);
routes.use('/api/whatsapp', whatsappRoutes);
routes.use('/api/settings', settingRoutes);
routes.use('/api/queue', queueRoutes);
routes.use('/api/contacts', contactRoutes);
routes.use('/api/messages', messageRoutes);
routes.use('/api/tags', tagRoutes);
routes.use('/api/fast-reply', fastReplyRoutes);
routes.use('/api/campaigns', campaignRoutes);
routes.use('/api/campaign-contacts', campaignContactsRoutes);
routes.use('/api/auto-reply', autoReplyRoutes);
routes.use('/api/chat-flow', chatFlowRoutes);
routes.use('/api/hub-webhooks', hubWebhookRoutes);
routes.use('/api/hub-messages', hubMessageRoutes);
routes.use('/api/hub-channels', hubChannelRoutes);
routes.use('/api/whatsapp-sessions', whatsappSessionRoutes);
routes.use('/api/whatsapp-webhooks', whatsappWebhookRoutes);
routes.use('/api/api-config', apiConfigRoutes);
routes.use('/api/admin', adminRoutes);
routes.use('/api/admin', adminBillingRoutes);
routes.use('/api/tenants', tenantRoutes);
routes.use('/api/statistics', statisticsRoutes);
routes.use('/api/contact-sync', contactSyncRoutes);
routes.use('/api/facebook', facebookRoutes);
routes.use('/api/metrics', metricsRouter);
routes.use('/api/billing', billingRoutes);
routes.use('/api/tenant-plan', tenantPlanRoutes);
// ========== WEBHOOKS ==========
routes.use('/webhook/erp', erpWebhookRoutes);
// ✅ NOVO: Compatibilidade com gateway WhatsApp que usa /webhook/whatsapp
routes.use('/webhook/whatsapp', whatsappWebhookRoutes);
// Alias compatível para cenários que chamam /api/webhook/whatsapp
routes.use('/api/webhook/whatsapp', whatsappWebhookRoutes);

// ========== INTEGRAÇÕES E ASSINATURAS ==========
routes.use('/api/integrations/erp', erpIntegrationRoutes);
routes.use('/api/subscriptions', subscriptionRoutes);

// ========== API EXTERNA (pública) ==========
// mantém os caminhos completos /v1/api/external/...
routes.use('/', apiExternalRoutes);

export default routes;
