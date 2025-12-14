import { Router } from 'express';
import { webhookRouter } from '../controllers/WebhookController';
import { sessionRouter } from '../controllers/SessionController';

const apiRouter = Router();

apiRouter.use('/sessions', sessionRouter);
apiRouter.use('/webhook', webhookRouter);

export { apiRouter };