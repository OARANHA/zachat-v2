import express from 'express';
import { apiRouter } from './routes/api';
import { healthRouter } from './routes/health';
import dotenv from 'dotenv';


// Carregar variáveis de ambiente
dotenv.config();


const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Routes
app.use('/api', apiRouter);
app.use('/health', healthRouter);


// Health check root
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: '28web-whatsapp-gateway',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});


// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});


// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404
    }
  });
});


// Start server
app.listen(PORT, HOST, () => {  // ← MUDADO (adicionado HOST)
  console.log(`🚀 28web WhatsApp Gateway running on ${HOST}:${PORT}`);
  console.log(`📊 Health check: http://${HOST}:${PORT}/health`);
  console.log(`🔗 API endpoints: http://${HOST}:${PORT}/api`);
});


export default app;
