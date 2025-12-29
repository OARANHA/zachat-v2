import request from 'supertest';
import application from '../../app';

// Mock minimal app startup without DB and queues
jest.mock('../../app/boot', () => ({ __esModule: true, default: async () => {} }));

describe('WhatsApp Webhook Routes', () => {
  let app: any;

  beforeAll(async () => {
    app = await application();
  });

  afterAll(async () => {
    if (app && app.close) await app.close();
  });

  const payload = {
    sessionId: '1',
    event: 'connection.status',
    data: { status: 'ready' }
  };

  it('POST /webhook/whatsapp should return 200', async () => {
    const res = await request(app).post('/webhook/whatsapp').send(payload);
    expect([200, 204]).toContain(res.status);
  });

  it('POST /api/webhook/whatsapp should return 200', async () => {
    const res = await request(app).post('/api/webhook/whatsapp').send(payload);
    expect([200, 204]).toContain(res.status);
  });
});
