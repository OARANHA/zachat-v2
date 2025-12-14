import request from 'supertest';
import app from '../../src/server';
import { WebhookEvent } from '../../src/types/api';

describe('WhatsApp Gateway E2E Tests', () => {
  it('should create a session', async () => {
    const response = await request(app)
      .post('/api/sessions')
      .send({ apiKey: 'test-key' });
    
    expect(response.status).toBe(201);
    expect(response.body.sessionId).toBeDefined();
  });

  it('should receive webhook events', async () => {
    const event: WebhookEvent = {
      sessionId: 'test-session-id',
      event: 'message_create',
      timestamp: Date.now(),
      data: {
        message: {
          id: 'message-id',
          from: 'sender-id',
          to: 'recipient-id',
          text: 'Hello World'
        }
      }
    };

    const response = await request(app)
      .post('/api/webhook')
      .send(event);
    
    expect(response.status).toBe(200);
  });
});