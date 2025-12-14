import { Router } from 'express';
import { healthCheck } from '../controllers/HealthController';

const healthRouter = Router();

healthRouter.get('/', healthCheck);

export { healthRouter };