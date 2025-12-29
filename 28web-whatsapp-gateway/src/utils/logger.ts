import pino from 'pino';

// Configuração do logger com suporte a desenvolvimento e produção
const isDevelopment = process.env.NODE_ENV !== 'production';

const loggerConfig = isDevelopment
  ? {
      level: process.env.LOG_LEVEL || 'debug',
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
          singleLine: false,
        },
      },
    }
  : {
      level: process.env.LOG_LEVEL || 'info',
    };

const logger = pino(loggerConfig);

// Export para uso em outros módulos
export { logger };

// Função de log personalizada para facilitar uso
export const logInfo = (message: string, meta?: any) => {
  logger.info(message, meta);
};

export const logError = (message: string, error?: any) => {
  logger.error(message, error);
};

export const logWarn = (message: string, meta?: any) => {
  logger.warn(message, meta);
};

export const logDebug = (message: string, meta?: any) => {
  logger.debug(message, meta);
};
