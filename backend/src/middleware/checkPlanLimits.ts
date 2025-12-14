/**
 * Middleware de validação de limites do plano
 * Bloqueia requisições que excedem os limites do plano do tenant
 * 
 * © 2024 28web. Todos os direitos reservados.
 */

import { Request, Response, NextFunction } from "express";
import UsageTracker from "../services/BillingServices/UsageTracker";
import AppError from "../errors/AppError";
import { logger } from "../utils/logger";

interface AuthenticatedRequest extends Omit<Request, 'user'> {
  user?: {
    id: string;
    tenantId: string | number;
    email: string;
    profile: string;
  };
}

/**
 * Middleware que valida limites do plano antes de processar requisições
 */
export async function checkPlanLimits(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Se não há usuário autenticado, pula validação
    if (!req.user || !req.user.tenantId) {
      return next();
    }

    const tenantId = req.user.tenantId;
    const usageData = await UsageTracker.getUsage(tenantId);

    // Valida limite de mensagens para rotas de envio
    if (req.path.includes("/messages") && (req.method === "POST" || req.method === "PUT")) {
      if (usageData.usage.messages >= usageData.limits.messagesPerMonth) {
        logger.warn(
          `Tenant ${tenantId}: Tentativa de enviar mensagem com limite excedido (${usageData.usage.messages}/${usageData.limits.messagesPerMonth})`
        );
        throw new AppError(
          "Limite mensal de mensagens atingido. Faça upgrade do seu plano para continuar.",
          403,
          "PLAN_LIMIT_EXCEEDED",
          {
            limitType: "messages",
            current: usageData.usage.messages,
            limit: usageData.limits.messagesPerMonth,
            upgradeUrl: "/billing/upgrade"
          }
        );
      }
    }

    // Valida limite de storage para uploads
    if (req.path.includes("/upload") && req.method === "POST") {
      const storageGB = usageData.limits.storageGB * 1024 * 1024 * 1024;
      if (usageData.usage.storage >= storageGB) {
        logger.warn(
          `Tenant ${tenantId}: Tentativa de upload com limite de storage excedido (${usageData.usage.storage}/${storageGB} bytes)`
        );
        throw new AppError(
          "Limite de armazenamento atingido. Faça upgrade do seu plano para continuar.",
          403,
          "PLAN_LIMIT_EXCEEDED",
          {
            limitType: "storage",
            current: usageData.usage.storage,
            limit: storageGB,
            upgradeUrl: "/billing/upgrade"
          }
        );
      }
    }

    // Valida limite de usuários para criação de usuários
    if (req.path.includes("/users") && req.method === "POST") {
      if (usageData.usage.users >= usageData.limits.users) {
        logger.warn(
          `Tenant ${tenantId}: Tentativa de criar usuário com limite excedido (${usageData.usage.users}/${usageData.limits.users})`
        );
        throw new AppError(
          `Limite de usuários atingido (${usageData.limits.users}). Faça upgrade do seu plano para adicionar mais usuários.`,
          403,
          "PLAN_LIMIT_EXCEEDED",
          {
            limitType: "users",
            current: usageData.usage.users,
            limit: usageData.limits.users,
            upgradeUrl: "/billing/upgrade"
          }
        );
      }
    }

    // Valida limite de sessões WhatsApp
    if (req.path.includes("/whatsapps") && req.method === "POST") {
      if (usageData.usage.whatsappSessions >= usageData.limits.whatsappSessions) {
        logger.warn(
          `Tenant ${tenantId}: Tentativa de criar sessão WhatsApp com limite excedido (${usageData.usage.whatsappSessions}/${usageData.limits.whatsappSessions})`
        );
        throw new AppError(
          `Limite de sessões WhatsApp atingido (${usageData.limits.whatsappSessions}). Faça upgrade do seu plano para adicionar mais sessões.`,
          403,
          "PLAN_LIMIT_EXCEEDED",
          {
            limitType: "whatsappSessions",
            current: usageData.usage.whatsappSessions,
            limit: usageData.limits.whatsappSessions,
            upgradeUrl: "/billing/upgrade"
          }
        );
      }
    }

    // Adiciona informações de uso no request para uso posterior
    (req as any).usageData = usageData;

    next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error(`checkPlanLimits middleware error: ${(error as Error).message}`);
    next(error);
  }
}

/**
 * Middleware opcional que apenas adiciona dados de uso ao request sem bloquear
 * Útil para rotas que apenas precisam exibir informações de uso
 */
export async function attachUsageData(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user || !req.user.tenantId) {
      return next();
    }

    const usageData = await UsageTracker.getUsage(req.user.tenantId);
    (req as any).usageData = usageData;

    next();
  } catch (error) {
    logger.error(`attachUsageData middleware error: ${(error as Error).message}`);
    // Não bloqueia a requisição se houver erro ao obter dados de uso
    next();
  }
}
