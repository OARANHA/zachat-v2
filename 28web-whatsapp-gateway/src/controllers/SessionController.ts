import { Request, Response, Router } from 'express';
import { SessionManager } from '../services/SessionManager';

const sessionRouter = Router();

sessionRouter.post('/', async (req: Request, res: Response) => {
  const { apiKey } = req.body;
  const sessionId = await SessionManager.createSession(apiKey);
  res.status(201).json({ sessionId });
});

export { sessionRouter };