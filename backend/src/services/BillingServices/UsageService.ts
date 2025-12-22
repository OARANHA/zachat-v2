import { format } from 'date-fns';
import * as redisClient from '../../libs/redisClient';
import { TenantPlan } from '../../models/Plan';
import Subscription from '../../models/Subscription';
import Tenant from '../../models/Tenant';

export type UsageMetrics = {
  messages: number;
  storageBytes: number;
  users: number;
  whatsappSessions: number;
};

export type UsageLimits = {
  messagesPerMonth: number;
  storageGB: number;
  users: number;
  whatsappSessions: number;
};

export type UsageSnapshot = {
  usage: UsageMetrics;
  limits: UsageLimits;
  tenantId?: number;
};

const DEFAULT_LIMITS: UsageLimits = {
  messagesPerMonth: 1000,
  storageGB: 5,
  users: 10,
  whatsappSessions: 1
};

function keyForTenantMonth(tenantId: number, date = new Date()) {
  const yyyyMM = format(date, 'yyyyMM');
  return `usage:${tenantId}:${yyyyMM}`;
}

class UsageService {
  // TODO (scalability): Melhorar atomicidade dos increments utilizando estruturas atômicas no Redis
  // (ex.: HINCRBY/INCRBY) quando o volume/concurrency exigir. O modelo atual Read-Modify-Write é suficiente
  // para o MVP, aceitando pequeno desvio em cenários de corrida.
  // TODO (data-retention): Implementar TTL/limpeza de chaves antigas e job de agregação mensal
  // para uma tabela tenant_usage_history no Postgres. Sugestão: TTL ~90 dias após o fim do mês.

  private async loadUsage(tenantId: number): Promise<UsageMetrics> {
    const key = keyForTenantMonth(tenantId);
    const raw: any = await redisClient.getValue(key);
    if (!raw) {
      return { messages: 0, storageBytes: 0, users: 0, whatsappSessions: 0 };
    }
    const parsed = typeof raw === 'string' ? (() => { try { return JSON.parse(raw); } catch { return {}; } })() : raw;
    return {
      messages: Number(parsed.messages) || 0,
      storageBytes: Number(parsed.storageBytes) || 0,
      users: Number(parsed.users) || 0,
      whatsappSessions: Number(parsed.whatsappSessions) || 0
    };
  }

  private async saveUsage(tenantId: number, usage: UsageMetrics): Promise<void> {
    const key = keyForTenantMonth(tenantId);
    await redisClient.setValue(key, usage as any);
  }

  private async getLimits(tenantId: number): Promise<UsageLimits> {
    // 1) Subscription ativa
    const subscription = await Subscription.scope && (Subscription as any).scope('active')?.findOne({ where: { tenantId } });
    if (subscription && subscription.planLimits) {
      const limits = subscription.planLimits as UsageLimits;
      return this.applyTenantOverrides(tenantId, limits);
    }

    // 2) TenantPlan ativo
    const tenantPlan = await (TenantPlan as any).findOne({ where: { tenantId, status: 'active' } });
    if (tenantPlan && tenantPlan.planLimits) {
      const limits = tenantPlan.planLimits as UsageLimits;
      return this.applyTenantOverrides(tenantId, limits);
    }

    // 3) Defaults
    return this.applyTenantOverrides(tenantId, DEFAULT_LIMITS);
  }

  private async applyTenantOverrides(tenantId: number, limits: UsageLimits): Promise<UsageLimits> {
    const tenant = await (Tenant as any).findByPk?.(tenantId);
    if (!tenant) return limits;
    const out = { ...limits };
    if (tenant.maxUsers && Number(tenant.maxUsers) > 0) {
      out.users = Number(tenant.maxUsers);
    }
    if (tenant.maxConnections && Number(tenant.maxConnections) > 0) {
      out.whatsappSessions = Number(tenant.maxConnections);
    }
    return out;
  }

  async getUsage(tenantId: number): Promise<UsageSnapshot> {
    const usage = await this.loadUsage(tenantId);
    const limits = await this.getLimits(tenantId);
    return { usage, limits, tenantId };
  }

  async incrementMessages(tenantId: number, count: number, bytes = 0): Promise<void> {
    const usage = await this.loadUsage(tenantId);
    usage.messages = (usage.messages || 0) + Number(count || 0);
    if (bytes && bytes > 0) {
      usage.storageBytes = (usage.storageBytes || 0) + Number(bytes);
    }
    await this.saveUsage(tenantId, usage);
  }

  async incrementWhatsappSessions(tenantId: number, count: number): Promise<void> {
    const usage = await this.loadUsage(tenantId);
    usage.whatsappSessions = (usage.whatsappSessions || 0) + Number(count || 0);
    await this.saveUsage(tenantId, usage);
  }

  async incrementUsers(tenantId: number, count: number): Promise<void> {
    const usage = await this.loadUsage(tenantId);
    usage.users = (usage.users || 0) + Number(count || 0);
    await this.saveUsage(tenantId, usage);
  }

  async incrementStorage(tenantId: number, bytes: number): Promise<void> {
    const usage = await this.loadUsage(tenantId);
    usage.storageBytes = (usage.storageBytes || 0) + Number(bytes || 0);
    await this.saveUsage(tenantId, usage);
  }
}

export default new UsageService();
