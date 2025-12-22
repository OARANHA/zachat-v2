import { Request, Response, NextFunction } from "express";
import AppError from "../errors/AppError";
import { logger } from "../utils/logger";
import UsageService from "../services/BillingServices/UsageService";

type LimitType = "messages" | "storage" | "users" | "whatsappSessions";

/**
 * Resolve o tipo de limite a partir da rota HTTP (fallback para retrocompatibilidade).
 * Preferível usar o middleware parametrizado (checkPlanLimits('messages'|...)) nas rotas específicas.
 */
function inferLimitType(req: Request): LimitType | null {
  const p = (req.path || "").toLowerCase();

  // Uploads/mídias
  if (p.includes("/upload") && req.method === "POST") return "storage";

  // Envio de mensagens
  if (p.includes("/messages") && req.method === "POST") return "messages";

  // Criação de usuário
  if (p.includes("/users") && req.method === "POST") return "users";

  // Sessões WhatsApp (criação/início)
  if (
    (p.includes("whatsappsession") || p.includes("/whatsapp-sessions")) &&
    (req.method === "POST" || req.method === "PUT")
  ) {
    return "whatsappSessions";
  }

  return null;
}

function throwLimitExceeded(limitType: LimitType, current: number, limit: number): never {
  const upgradeUrl = "/billing/upgrade";
  const label = {
    messages: "mensagens/mês",
    storage: "armazenamento (bytes)",
    users: "usuários",
    whatsappSessions: "sessões WhatsApp"
  }[limitType];

  throw new AppError(
    `Limite de ${label} atingido. Faça upgrade do seu plano para continuar.`,
    403,
    "PLAN_LIMIT_EXCEEDED",
    {
      limitType,
      current,
      limit,
      upgradeUrl
    }
  );
}

/**
 * Middleware principal (parametrizável).
 * - Se um limitType for fornecido, valida apenas aquele tipo.
 * - Caso contrário, tenta inferir a partir do path/method (retrocompatível).
 */
export default function checkPlanLimits(limitTypeParam?: LimitType) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const tenantId = Number((req as any)?.user?.tenantId);
      if (!tenantId) {
        return next(new AppError("Unauthorized", 401));
      }

      const usageData = await UsageService.getUsage(tenantId);
      // Disponibiliza snapshot para handlers posteriores (diagnóstico)
      (req as any).usageData = usageData;

      const limitType = limitTypeParam || inferLimitType(req);

      if (!limitType) {
        // Nada a validar neste endpoint
        return next();
      }

      const { usage, limits } = usageData;

      switch (limitType) {
        case "messages": {
          const current = usage.messages || 0;
          const limit = limits.messagesPerMonth || 0;

          if (limit > 0 && current >= limit) {
            logger.warn(`Tenant ${tenantId}: limite de mensagens atingido (${current}/${limit})`);
            throwLimitExceeded("messages", current, limit);
          }
          break;
        }

        case "storage": {
          const current = usage.storageBytes || 0;
          const storageLimitBytes = (limits.storageGB || 0) * 1024 * 1024 * 1024;

          if (storageLimitBytes > 0 && current >= storageLimitBytes) {
            logger.warn(
              `Tenant ${tenantId}: limite de storage atingido (${current}/${storageLimitBytes} bytes)`
            );
            throwLimitExceeded("storage", current, storageLimitBytes);
          }
          break;
        }

        case "users": {
          const current = usage.users || 0;
          const limit = limits.users || 0;

          if (limit > 0 && current >= limit) {
            logger.warn(`Tenant ${tenantId}: limite de usuários atingido (${current}/${limit})`);
            throwLimitExceeded("users", current, limit);
          }
          break;
        }

        case "whatsappSessions": {
          const current = usage.whatsappSessions || 0;
          const limit = limits.whatsappSessions || 0;

          if (limit > 0 && current >= limit) {
            logger.warn(
              `Tenant ${tenantId}: limite de sessões WhatsApp atingido (${current}/${limit})`
            );
            throwLimitExceeded("whatsappSessions", current, limit);
          }
          break;
        }
      }

      return next();
    } catch (err) {
      return next(err);
    }
  };
}
