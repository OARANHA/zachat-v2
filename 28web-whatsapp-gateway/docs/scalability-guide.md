# Guia de Escalabilidade - WhatsApp Gateway

## Visão Geral

Este documento descreve as estratégias e melhores práticas para escalar o WhatsApp Gateway, considerando as limitações técnicas do whatsapp-web.js e os requisitos de negócio do 28web Hub.

## Limitações Fundamentais

### whatsapp-web.js Constraints

1. **Processo por Sessão**
   - Cada instância WhatsApp cria um processo Chrome separado
   - Consumo de memória: 50-100MB por sessão
   - Limitação prática: ~20 sessões por servidor (8GB RAM)

2. **Rate Limiting do WhatsApp**
   - Limites de envio impostos pelo WhatsApp
   - Detecção de automação pode bloquear sessões
   - Necessidade de throttling inteligente

3. **Conexões WebSocket**
   - Cada sessão mantém conexão persistente
   - Overhead de gerenciamento de estado
   - Sensibilidade a desconexões

## Estratégias de Escalabilidade

### 1. Escalabilidade Horizontal (Recomendado)

#### Arquitetura Stateless
```typescript
// Externalizar estado em Redis
interface SessionState {
  sessionId: string;
  status: 'connecting' | 'connected' | 'disconnected';
  lastActivity: Date;
  metadata: Record<string, any>;
}

// Redis para compartilhar estado entre instâncias
const redis = new Redis(process.env.REDIS_URL);
```

#### Load Balancer Configuration
```nginx
# nginx.conf
upstream whatsapp_gateway {
    least_conn;
    server gateway1:3001 max_fails=3 fail_timeout=30s;
    server gateway2:3001 max_fails=3 fail_timeout=30s;
    server gateway3:3001 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;
    
    location / {
        proxy_pass http://whatsapp_gateway;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

#### Auto-scaling Kubernetes
```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: whatsapp-gateway
spec:
  replicas: 3
  selector:
    matchLabels:
      app: whatsapp-gateway
  template:
    metadata:
      labels:
        app: whatsapp-gateway
    spec:
      containers:
      - name: gateway
        image: whatsapp-gateway:latest
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        env:
        - name: REDIS_URL
          value: "redis://redis-service:6379"
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: whatsapp-gateway-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: whatsapp-gateway
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### 2. Escalabilidade Vertical (Complementar)

#### Resource Allocation por Sessão
```typescript
class SessionManager {
  private readonly MAX_SESSIONS_PER_INSTANCE = 15;
  private readonly MEMORY_PER_SESSION = 100 * 1024 * 1024; // 100MB
  
  async canCreateNewSession(): Promise<boolean> {
    const currentSessions = await this.getActiveSessionsCount();
    const memoryUsage = process.memoryUsage();
    
    return currentSessions < this.MAX_SESSIONS_PER_INSTANCE &&
           memoryUsage.heapUsed < (memoryUsage.heapTotal * 0.8);
  }
  
  async allocateSession(): Promise<string> {
    if (!await this.canCreateNewSession()) {
      throw new Error('Capacity limit reached');
    }
    
    return this.createSession();
  }
}
```

#### Memory Management
```typescript
// Monitoramento e cleanup automático
class MemoryManager {
  private readonly MEMORY_THRESHOLD = 0.85;
  
  startMonitoring(): void {
    setInterval(() => {
      const usage = process.memoryUsage();
      const heapUsedRatio = usage.heapUsed / usage.heapTotal;
      
      if (heapUsedRatio > this.MEMORY_THRESHOLD) {
        this.performCleanup();
      }
    }, 30000); // Verificar a cada 30 segundos
  }
  
  private performCleanup(): void {
    // Forçar garbage collection
    if (global.gc) {
      global.gc();
    }
    
    // Limpar caches
    this.clearCaches();
    
    // Desconectar sessões inativas
    this.disconnectInactiveSessions();
  }
}
```

## Configurações de Produção

### 1. Variáveis de Ambiente
```bash
# .env.production
NODE_ENV=production
PORT=3001

# Redis para estado compartilhado
REDIS_URL=redis://redis-cluster:6379
REDIS_PASSWORD=your_redis_password

# Limites de sessão
MAX_SESSIONS_PER_INSTANCE=15
SESSION_TIMEOUT=300000

# Rate limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Monitoramento
PROMETHEUS_PORT=9090
HEALTH_CHECK_INTERVAL=30000
```

### 2. Configuração do Servidor
```typescript
// server.ts
import express from 'express';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

const app = express();

// Security
app.use(helmet());

// Compression
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP'
});
app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  const memory = process.memoryUsage();
  const uptime = process.uptime();
  
  res.json({
    status: 'healthy',
    uptime,
    memory: {
      used: memory.heapUsed,
      total: memory.heapTotal,
      percentage: (memory.heapUsed / memory.heapTotal * 100).toFixed(2)
    },
    sessions: {
      active: sessionManager.getActiveSessionsCount(),
      max: parseInt(process.env.MAX_SESSIONS_PER_INSTANCE || '15')
    }
  });
});
```

## Monitoramento e Alertas

### 1. Métricas Essenciais
```typescript
// metrics.ts
import { register, Counter, Histogram, Gauge } from 'prom-client';

// Contadores
const activeSessionsGauge = new Gauge({
  name: 'whatsapp_active_sessions',
  help: 'Number of active WhatsApp sessions'
});

const messagesSentCounter = new Counter({
  name: 'whatsapp_messages_sent_total',
  help: 'Total number of messages sent'
});

const messageProcessingTime = new Histogram({
  name: 'whatsapp_message_processing_duration_seconds',
  help: 'Time spent processing messages',
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

const memoryUsageGauge = new Gauge({
  name: 'whatsapp_memory_usage_bytes',
  help: 'Memory usage in bytes'
});

// Exportar métricas
export {
  activeSessionsGauge,
  messagesSentCounter,
  messageProcessingTime,
  memoryUsageGauge
};
```

### 2. Alertas do Prometheus
```yaml
# prometheus-alerts.yml
groups:
- name: whatsapp-gateway
  rules:
  - alert: HighMemoryUsage
    expr: whatsapp_memory_usage_bytes / (1024*1024*1024) > 1.5
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High memory usage on WhatsApp Gateway"
      description: "Memory usage is above 1.5GB for more than 5 minutes"

  - alert: TooManyActiveSessions
    expr: whatsapp_active_sessions > 12
    for: 2m
    labels:
      severity: warning
    annotations:
      summary: "Too many active sessions"
      description: "Active sessions count is above 12"

  - alert: HighMessageProcessingTime
    expr: histogram_quantile(0.95, whatsapp_message_processing_duration_seconds) > 2
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "High message processing time"
      description: "95th percentile of message processing time is above 2 seconds"
```

## Estratégias de Mitigação

### 1. Circuit Breaker Pattern
```typescript
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > 60000) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }
    
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess(): void {
    this.failures = 0;
    this.state = 'CLOSED';
  }
  
  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= 5) {
      this.state = 'OPEN';
    }
  }
}
```

### 2. Retry com Backoff Exponencial
```typescript
class RetryHandler {
  async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    baseDelay = 1000
  ): Promise<T> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw new Error('Max retries exceeded');
  }
}
```

## Capacity Planning

### 1. Estimativa de Recursos

| Sessões Simultâneas | CPU Cores | RAM | Instâncias | Redis RAM |
|-------------------|-----------|-----|------------|-----------|
| 10-20             | 2-4       | 4GB | 1          | 512MB     |
| 50-100            | 4-8       | 8GB | 3-5        | 1GB       |
| 200-500           | 8-16      | 16GB| 10-15      | 2GB       |

### 2. Cálculo de Throughput

```typescript
// Cálculo de capacidade
interface CapacityCalculation {
  messagesPerSecond: number;
  sessionsPerInstance: number;
  memoryPerSession: number;
  cpuPerSession: number;
}

function calculateCapacity(
  totalSessions: number,
  avgMessagesPerSession: number
): CapacityCalculation {
  const sessionsPerInstance = 15; // Limite prático
  const memoryPerSession = 100 * 1024 * 1024; // 100MB
  const cpuPerSession = 0.05; // 5% de CPU por sessão
  
  const instancesNeeded = Math.ceil(totalSessions / sessionsPerInstance);
  const messagesPerSecond = totalSessions * avgMessagesPerSession;
  
  return {
    messagesPerSecond,
    sessionsPerInstance,
    memoryPerSession,
    cpuPerSession
  };
}
```

## Disaster Recovery

### 1. Backup e Restore
```typescript
class BackupManager {
  async backupSessions(): Promise<void> {
    const sessions = await this.sessionManager.getAllSessions();
    const backup = {
      timestamp: new Date().toISOString(),
      sessions: sessions.map(session => ({
        id: session.id,
        status: session.status,
        metadata: session.metadata
      }))
    };
    
    await this.storage.save(`backup-${Date.now()}.json`, backup);
  }
  
  async restoreSessions(backupFile: string): Promise<void> {
    const backup = await this.storage.load(backupFile);
    
    for (const sessionData of backup.sessions) {
      try {
        await this.sessionManager.restoreSession(sessionData);
      } catch (error) {
        console.error(`Failed to restore session ${sessionData.id}:`, error);
      }
    }
  }
}
```

### 2. Health Checks Automáticos
```typescript
class HealthChecker {
  async performHealthCheck(): Promise<HealthStatus> {
    const checks = await Promise.allSettled([
      this.checkRedisConnection(),
      this.checkMemoryUsage(),
      this.checkActiveSessions(),
      this.checkMessageQueue()
    ]);
    
    const status = checks.every(check => check.status === 'fulfilled') 
      ? 'healthy' 
      : 'degraded';
    
    return {
      status,
      timestamp: new Date(),
      details: checks.map(check => ({
        status: check.status,
        value: check.status === 'fulfilled' ? check.value : null,
        error: check.status === 'rejected' ? check.reason : null
      }))
    };
  }
}
```

## Conclusão

A escalabilidade do WhatsApp Gateway depende fundamentalmente de:

1. **Arquitetura Stateless** com Redis para compartilhamento de estado
2. **Load Balancing** para distribuição de carga
3. **Monitoramento Contínuo** com métricas e alertas
4. **Auto-scaling** baseado em recursos utilizados
5. **Mitigação de Riscos** com circuit breakers e retries

Seguindo este guia, o gateway pode suportar dezenas a centenas de sessões simultâneas com alta disponibilidade e performance adequada.

---
*Guia criado em 12/12/2025*
*Baseado na análise de performance e limitações técnicas*