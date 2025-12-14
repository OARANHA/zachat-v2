import { Router } from 'express';
import metricsRouter from './metrics';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import ticketRoutes from './ticketRoutes';
import whatsappRoutes from './whatsappRoutes';
import settingRoutes from './settingRoutes';
import queueRoutes from './queueRoutes';
import contactRoutes from './contactRoutes';
import messageRoutes from './messageRoutes';
import tagRoutes from './tagRoutes';
import fastReplyRoutes from './fastReplyRoutes';
import campaignRoutes from './campaignRoutes';
import campaignContactsRoutes from './campaignContactsRoutes';
import autoReplyRoutes from './autoReplyRoutes';
import chatFlowRoutes from './chatFlowRoutes';
import hubWebhookRoutes from './hubWebhookRoutes';
import hubMessageRoutes from './hubMessageRoutes';
import hubChannelRoutes from './hubChannelRoutes';
import whatsappSessionRoutes from './whatsappSessionRoutes';
import whatsappWebhookRoutes from './whatsappWebhookRoutes';
import apiConfigRoutes from './apiConfigRoutes';
import apiExternalRoutes from './apiExternalRoutes';
import adminRoutes from './adminRoutes';
import tenantRoutes from './tenantRoutes';
import statisticsRoutes from './statisticsRoutes';
import contactSyncRoutes from './contactSyncRoutes';
import facebookRoutes from './facebookRoutes';

const routes = Router();

// Health check já está no modules.ts

// Auth routes
routes.use('/auth', authRoutes);

// API routes
routes.use('/users', userRoutes);
routes.use('/tickets', ticketRoutes);
routes.use('/whatsapp', whatsappRoutes);
routes.use('/settings', settingRoutes);
routes.use('/queue', queueRoutes);
routes.use('/contacts', contactRoutes);
routes.use('/messages', messageRoutes);
routes.use('/tags', tagRoutes);
routes.use('/fast-reply', fastReplyRoutes);
routes.use('/campaigns', campaignRoutes);
routes.use('/campaign-contacts', campaignContactsRoutes);
routes.use('/auto-reply', autoReplyRoutes);
routes.use('/chat-flow', chatFlowRoutes);
routes.use('/hub-webhooks', hubWebhookRoutes);
routes.use('/hub-messages', hubMessageRoutes);
routes.use('/hub-channels', hubChannelRoutes);
routes.use('/whatsapp-sessions', whatsappSessionRoutes);
routes.use('/whatsapp-webhooks', whatsappWebhookRoutes);
routes.use('/api-config', apiConfigRoutes);
routes.use('/api-external', apiExternalRoutes);
routes.use('/admin', adminRoutes);
routes.use('/tenants', tenantRoutes);
routes.use('/statistics', statisticsRoutes);
routes.use('/contact-sync', contactSyncRoutes);
routes.use('/facebook', facebookRoutes);
routes.use('/metrics', metricsRouter);

export default routes;
