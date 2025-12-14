import { SessionManager } from './SessionManager';
import { MessageQueue } from '../queue/MessageQueue';
import { logger } from '../utils/logger';
import { Redis } from 'ioredis';
import axios from 'axios';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  services: {
    sessionManager: ServiceHealth;
    messageQueue: ServiceHealth;
    redis: ServiceHealth;
    webhook: ServiceHealth;
    database: ServiceHealth;
  };
  metrics: {
    activeSessions: number;
    totalMessagesProcessed: number;
    messagesInQueue: number;
    averageResponseTime: number;
    errorRate: number;
    memoryUsage: NodeJS.MemoryUsage;
    cpuUsage: NodeJS.CpuUsage;
    diskUsage: DiskUsage;
  };
}

export interface DiskUsage {
  total: number;
  free: number;
  used: number;
}

export interface ServiceHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: string;
  responseTime?: number;
  error?: string;
}

export class HealthService {
  private sessionManager: SessionManager;
  private messageQueue: MessageQueue;
  private redis: Redis;
  private startTime: number;
  private metrics: {
    totalMessagesProcessed: number;
    totalResponseTime: number;
    totalRequests: number;
    totalErrors: number;
    lastMetricsReset: number;
  };

  constructor(sessionManager: SessionManager, messageQueue: MessageQueue, redis: Redis) {
    this.sessionManager = sessionManager;
    this.messageQueue = messageQueue;
    this.redis = redis;
    this.startTime = Date.now();
    this.metrics = {
      totalMessagesProcessed: 0,
      totalResponseTime: 0,
      totalRequests: 0,
      totalErrors: 0,
      lastMetricsReset: Date.now()
    };
  }

  // Métodos existentes...

  private async getDiskUsage(): Promise<DiskUsage> {
    const disk = require('diskusage');
    const path = process.platform === 'win32' ? 'c:' : '/';
    const { total, free } = disk.checkSync(path);
    return {
      total,
      free,
      used: total - free
    };
  }

  private resetMetrics(): void {
    this.metrics = {
      totalMessagesProcessed: 0,
      totalResponseTime: 0,
      totalRequests: 0,
      totalErrors: 0,
      lastMetricsReset: Date.now()
    };
    logger.info('Métricas resetadas');
  }

  private calculateAverageResponseTime(): number {
    if (this.metrics.totalRequests === 0) return 0;
    return Math.round(this.metrics.totalResponseTime / this.metrics.totalRequests);
  }

  private calculateErrorRate(): number {
    if (this.metrics.totalRequests === 0) return 0;
    return Math.round((this.metrics.totalErrors / this.metrics.totalRequests) * 100);
  }

  // Restante dos métodos existentes...
}