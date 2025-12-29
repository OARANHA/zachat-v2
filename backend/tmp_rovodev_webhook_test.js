const path = require('path');
const supertest = require('supertest');

(async () => {
  try {
    const bootPath = path.resolve(__dirname, 'dist', 'app', 'boot.js');
    // Mock do boot para não conectar DB/filas
    require.cache[bootPath] = {
      id: bootPath,
      filename: bootPath,
      loaded: true,
      exports: { __esModule: true, default: async () => {} }
    };

    const application = require('./dist/app').default; // carrega default de app/index
    const app = await application();

    const payload = { sessionId: '1', event: 'connection.status', data: { status: 'ready' } };

    const resp1 = await supertest(app).post('/webhook/whatsapp').send(payload);
    const resp2 = await supertest(app).post('/api/webhook/whatsapp').send(payload);

    console.log(JSON.stringify({ r1: resp1.status, r2: resp2.status }));

    if (![200,204].includes(resp1.status) || ![200,204].includes(resp2.status)) {
      process.exit(2);
    }

    if (app && app.close) await app.close();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
