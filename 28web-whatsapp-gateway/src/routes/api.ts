import { Router } from 'express';
import { webhookRouter } from '../controllers/WebhookController';
import { sessionRouter } from '../controllers/SessionController';
import { v1Router } from './v1';

const apiRouter = Router();

// v1 endpoints (utilizados pelo backend Chatex)
apiRouter.use('/v1', v1Router);

// legacy/basic endpoints
apiRouter.use('/sessions', sessionRouter);
apiRouter.use('/webhook', webhookRouter);

export { apiRouter };