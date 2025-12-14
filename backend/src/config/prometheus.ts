import { Registry, collectDefaultMetrics } from 'prom-client';

const register = new Registry();

// Coleta métricas padrão do Node.js (CPU, memória, etc.)
collectDefaultMetrics({ register });

export default register;