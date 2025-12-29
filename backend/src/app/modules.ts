import * as Sentry from "@sentry/node";
import expressInstance, { NextFunction, Request, Response } from "express";
import { readFileSync } from "fs";
import moment from "moment";
import uploadConfig from "../config/upload";
import AppError from "../errors/AppError";
import routes from "../routes";
import webhookRoutes from "../routes/webhookRoutes";
import { logger } from "../utils/logger";

export default async function modules(app): Promise<void> {
  console.log('Iniciando módulos...');
  const { version } = JSON.parse(readFileSync("./package.json").toString());
  const started = new Date();
  const { env } = process;

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    serverName: env.BACKEND_URL,
    release: version
  });

  app.get("/health", async (req, res) => {
    let checkConnection;
    try {
      checkConnection = "Servidor disponível!";
    } catch (e) {
      checkConnection = `Servidor indisponível! ${e}`;
    }
    res.json({
      started: moment(started).format("DD/MM/YYYY HH:mm:ss"),
      currentVersion: version,
      uptime: (Date.now() - Number(started)) / 1000,
      statusService: checkConnection
    });
  });
  
  app.get('/', (req, res) => {
      res.send(`Backend está funcionando corretamente. Acesse o frontend: <a href="${env.FRONTEND_URL}">${env.FRONTEND_URL}</a>`);
  });

  
  app.use(Sentry.Handlers.requestHandler());

  app.use("/public", expressInstance.static(uploadConfig.directory));

  console.log('Registrando rotas...');
  // Primeiro registra os webhooks da Evolution (rota absoluta /api/webhook/evolution*)
  app.use(webhookRoutes);
  // Depois, o restante das rotas
  app.use('/', routes);
  console.log('Rotas registradas com sucesso!');
  app.use(Sentry.Handlers.errorHandler());

  // error handle
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use(async (err: Error, req: Request, res: Response, _: NextFunction) => {
    if (err instanceof AppError) {
      if (err.statusCode === 403) {
        logger.warn(err);
      } else {
        logger.error(err);
      }
      return res.status(err.statusCode).json({ error: err.message });
    }

    logger.error(err);
    return res.status(500).json({ error: `Internal server error: ${err}` });
  });

  logger.info("modules routes already in server!");
}
