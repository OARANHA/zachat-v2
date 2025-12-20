/**
 * BusinessHoursController
 * Gerenciar horários de atendimento do tenant (ADMIN do tenant)
 */

import { Request, Response } from "express";
import ShowBusinessHoursAndMessageService from "../services/TenantServices/ShowBusinessHoursAndMessageService";
import UpdateBusinessHoursService from "../services/TenantServices/UpdateBusinessHoursService";
import UpdateMessageBusinessHoursService from "../services/TenantServices/UpdateMessageBusinessHoursService";
import { logger } from "../utils/logger";
import AppError from "../errors/AppError";

/**
 * Exibir horários de atendimento e mensagem
 */
export const showBusinessHours = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { tenantId } = req.params;
    
    // Verificar se o usuário tem permissão para acessar este tenant
    if (req.user.profile !== "super" && req.user.tenantId !== parseInt(tenantId)) {
      throw new AppError("Acesso negado a este tenant", 403);
    }

    const tenant = await ShowBusinessHoursAndMessageService({
      tenantId
    });

    console.log("Resultado do serviço ShowBusinessHoursAndMessageService:", JSON.stringify(tenant, null, 2));

    return res.json({
      message: "Horários de atendimento encontrados",
      data: tenant
    });
  } catch (error) {
    logger.error(`Erro ao buscar horários de atendimento: ${error}`);
    return res.status(error.statusCode || 500).json({
      error: error.message || "Erro ao buscar horários de atendimento"
    });
  }
};

/**
 * Atualizar horários de atendimento
 */
export const updateBusinessHours = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { tenantId } = req.params;

    // Aceita múltiplos formatos de payload
    // { businessHours: Day[] } | Day[] | { data: { businessHours: Day[] } }
    let businessHours: any = (req.body as any)?.businessHours
      || (req.body as any)?.data?.businessHours
      || req.body;

    if (!Array.isArray(businessHours)) {
      return res.status(400).json({
        message: 'Erro de validação',
        errors: ['Formato de payload inválido: esperado array de businessHours.']
      });
    }

    // Validação por item
    const errors: string[] = [];
    businessHours.forEach((d: any, idx: number) => {
      if (typeof d.day === 'undefined') errors.push(`Dia[${idx}]: campo 'day' é obrigatório`);
      if (!d?.label) errors.push(`Dia[${idx}]: campo 'label' é obrigatório`);
      if (!d?.type) errors.push(`Dia[${idx}]: campo 'type' é obrigatório`);
      ['hr1','hr2','hr3','hr4'].forEach(h => {
        if (typeof d?.[h] === 'undefined') errors.push(`Dia[${idx}]: campo '${h}' é obrigatório`);
      });
    });
    if (errors.length) {
      return res.status(400).json({ message: 'Erro de validação', errors });
    }

    // Verificar se o usuário tem permissão para acessar este tenant
    if (req.user.profile !== "super" && req.user.tenantId !== parseInt(tenantId)) {
      throw new AppError("Acesso negado a este tenant", 403);
    }

    const tenant = await UpdateBusinessHoursService({
      businessHours,
      tenantId
    });

    logger.info(`Horários de atendimento atualizados para tenant ${tenantId}`);

    return res.json({
      message: "Horários de atendimento atualizados com sucesso",
      data: tenant
    });
  } catch (error) {
    logger.error(`Erro ao atualizar horários de atendimento: ${error}`);
    logger.error('Detalhes do erro (updateBusinessHours):', {
      message: (error as any)?.message,
      stack: (error as any)?.stack,
      params: req.params,
      body: req.body
    });
    return res.status((error as any)?.statusCode || 500).json({
      message: 'Erro ao atualizar horários de atendimento',
      errors: [(error as any)?.message || 'Erro interno']
    });
  }
};

/**
 * Atualizar mensagem de horário de atendimento
 */
export const updateMessageBusinessHours = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { tenantId } = req.params;
    const { messageBusinessHours } = req.body;

    if (!messageBusinessHours || typeof messageBusinessHours !== "string") {
      throw new AppError("Mensagem de horário de atendimento é obrigatória");
    }

    // Verificar se o usuário tem permissão para acessar este tenant
    if (req.user.profile !== "super" && req.user.tenantId !== parseInt(tenantId)) {
      throw new AppError("Acesso negado a este tenant", 403);
    }

    const tenant = await UpdateMessageBusinessHoursService({
      messageBusinessHours,
      tenantId
    });

    logger.info(`Mensagem de horário de atendimento atualizada para tenant ${tenantId}`);

    return res.json({
      message: "Mensagem de horário de atendimento atualizada com sucesso",
      data: tenant
    });
  } catch (error) {
    logger.error(`Erro ao atualizar mensagem de horário de atendimento: ${error}`);
    logger.error(`Detalhes do erro:`, {
      message: error.message,
      stack: error.stack,
      body: req.body,
      params: req.params
    });
    return res.status(error.statusCode || 500).json({
      error: error.message || "Erro ao atualizar mensagem de horário de atendimento"
    });
  }
};