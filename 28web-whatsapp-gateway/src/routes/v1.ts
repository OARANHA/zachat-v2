import { Router, Request, Response } from 'express';
import { SessionManager } from '../services/SessionManager';
import { logger } from '../utils/logger';

const v1Router = Router();
const sessionManager = SessionManager.getInstance();

// Enviar mensagem: POST /api/v1/sessions/:sessionId/messages
v1Router.post('/sessions/:sessionId/messages', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { to, body } = req.body || {};

    if (!to) {
      return res.status(400).json({ error: 'Missing required field: to' });
    }

    const client = sessionManager.getSession(sessionId);
    if (!client) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const result = await client.sendMessage(to, body);
    return res.status(200).json({ messageId: result.messageId, status: 'sent' });
  } catch (error: any) {
    logger.error({ err: error?.message || String(error) }, 'send message failed');
    return res.status(500).json({ error: 'Failed to send message', details: error?.message || String(error) });
  }
});

// Listar contatos: GET /api/v1/sessions/:sessionId/contacts
v1Router.get('/sessions/:sessionId/contacts', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    const client = sessionManager.getSession(sessionId);
    if (!client) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const contacts = await client.getContacts();
    return res.status(200).json({ contacts });
  } catch (error: any) {
    logger.error({ err: error?.message || String(error) }, 'get contacts failed');
    return res.status(500).json({ error: 'Failed to get contacts', details: error?.message || String(error) });
  }
});

export { v1Router };