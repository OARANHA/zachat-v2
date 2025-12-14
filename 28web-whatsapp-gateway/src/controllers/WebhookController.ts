import { Request, Response, Router } from 'express';
import { WebhookEvent } from '../types/api';

const webhookRouter = Router();

webhookRouter.post('/', (req: Request, res: Response) => {
  try {
    const event = req.body as WebhookEvent;
    console.log('Received webhook event:', event);
    // Simulate event processing
    console.log('Processing event:', event.event);
    // Simulate successful processing
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing webhook event:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export { webhookRouter };
