---
name: Transformação 28web Hub SaaS - Estratégia Otimizada
overview: Transformar zaap.izing.open.io em SaaS proprietário "28web Hub" usando estratégia de MVP rápido + extração gradual (Strangler Fig Pattern) para maximizar time-to-market e minimizar risco, priorizando validação de mercado antes de escalar arquitetura.
todos:
  - id: fase1-mvp-rebranding
    content: "Fase 1 (Semanas 1-2): MVP Rápido - Rebranding completo, remover AGPL, criar interfaces de abstração (IChannelProvider), sistema básico de billing com Redis counters"
    status: completed
  - id: fase2-whatsapp-gateway
    content: "Fase 2 (Semanas 3-4): Extrair WhatsApp Gateway - Microserviço isolado substituindo whatsapp-web.js, API REST limpa, webhooks para app principal"
    status: completed
  - id: fase3-billing-robusto
    content: "Fase 3 (Semanas 5-6): Billing Robusto - Sistema completo de planos, tracking de uso, limites por tenant, dashboard de billing, integração com gateway de pagamento"
    status: pending
  - id: fase4-validacao-mercado
    content: "Fase 4 (Semana 7): Validação de Mercado - Deploy, coleta de métricas (tenants, canais mais usados, gargalos), decisão data-driven para próximos passos"
    status: pending
  - id: fase5-abstracoes-interface
    content: "Fase 5 (Paralelo): Interfaces de Abstração - Criar IChannelProvider para todos os canais, wrappers sobre serviços existentes (Instagram, Telegram, Messenger)"
    status: pending
  - id: fase6-evolucao-organica
    content: "Fase 6 (Conforme demanda): Evolução Orgânica - Extrair outros canais como microserviços apenas se houver necessidade comprovada (Storage, Instagram Gateway, etc)"
    status: pending
---

# Plano de Transformação: zaap.izing.open.io → 28web Hub SaaS

## Estratégia: MVP Rápido + Extração Gradual (Strangler Fig Pattern)

## Princípios da Estratégia

**Validação Antes de Escalar**: Não investir 4-6 meses em refatoração completa sem validar mercado primeiro

**Extração Estratégica**: Isolar apenas componentes críticos (WhatsApp) como microserviços inicialmente

**Abstração desde o Início**: Interfaces permitem trocar implementações sem refatoração massiva

**Evolução Orgânica**: Escalar arquitetura baseado em demanda real, não em antecipação teórica

## Análise do Estado Atual

### Dependências Críticas Identificadas

**Prioridade ALTA (Extrair Primeiro):**

- **WhatsApp** (`whatsapp-web.js` + 360dialog): ~80% do uso, mais instável, maior risco operacional
- **NotificaMe Hub** (`notificamehubsdk`): Vendor lock-in, dependência externa crítica

**Prioridade MÉDIA (Wrappers Iniciais):**

- **Instagram** (`instagram-private-api`, `@androz2091/insta.js`): APIs não-oficiais, pode ficar no core com wrapper
- **Facebook/Messenger** (`messaging-api-messenger`): SDK oficial, criar wrapper proprietário
- **Telegram** (`telegraf`): SDK oficial estável, wrapper simples

**Prioridade BAIXA (Depois da Validação):**

- **Wavoip** (VoIP): Serviço especializado, manter até ter demanda comprovada
- **360dialog** (WABA): Pode ser substituído por gateway próprio quando necessário

### Infraestrutura Existente

- ✅ **PostgreSQL**: Manter (shared database por enquanto)
- ✅ **Redis**: Manter (cache, sessões, filas Bull)
- ⚠️ **RabbitMQ**: Opcional, pode ser removido se não estiver sendo usado
- ✅ **Bull**: Manter (sistema de filas robusto)

## Fase 1: MVP Rápido (Semanas 1-2) - TIME TO MARKET

**Objetivo**: Lançar produto vendável em 2-3 semanas, validar mercado antes de escalar arquitetura

### 1.1 Rebranding Completo

**Arquivos a modificar:**

- `backend/package.json` - Nome, descrição, repositório
- `frontend/package.json` - Nome, descrição
- `README.md` - Documentação completa
- `backend/src/**/*.ts` - Referências "izing" → "28web"
- `frontend/src/**/*.{vue,js}` - Referências "izing" → "28web"
- Assets (logos, ícones, favicon)
- Variáveis de ambiente (BACKEND_URL, FRONTEND_URL)

**Comandos úteis:**

```bash
# Buscar todas as referências
grep -r "izing" backend/ frontend/ --exclude-dir=node_modules
grep -r "IZING" backend/ frontend/ --exclude-dir=node_modules
```

### 1.2 Remover Referências Open Source

- Remover headers AGPL de todos os arquivos
- Atualizar LICENSE para proprietário
- Remover links para repositórios públicos
- Adicionar copyright "© 2024 28web. Todos os direitos reservados."

### 1.3 Criar Interfaces de Abstração (CRÍTICO)

**Arquivo: `backend/src/interfaces/IChannelProvider.ts`**

```typescript
interface IChannelProvider {
  sendMessage(data: SendMessageDTO): Promise<MessageResponse>;
  receiveMessage(handler: MessageHandler): void;
  createSession(config: SessionConfig): Promise<Session>;
  deleteSession(sessionId: string): Promise<void>;
  getSessionStatus(sessionId: string): Promise<SessionStatus>;
}
```

**Benefício**: Permite trocar implementações sem refatorar código consumidor

### 1.4 Sistema Básico de Billing

**Implementação inicial (Redis counters):**

- Modelo de planos (Starter, Pro, Enterprise)
- Tracking de uso por tenant (mensagens, storage, usuários)
- Limites por plano
- Middleware de validação de limites
- Dashboard básico de uso

**Arquivos:**

- `backend/src/models/Plan.ts`
- `backend/src/services/BillingServices/UsageTracker.ts`
- `backend/src/middleware/checkPlanLimits.ts`
- `backend/src/services/BillingServices/PlanService.ts`

**Redis keys:**

```
usage:{tenantId}:{YYYY-MM}:messages → counter
usage:{tenantId}:{YYYY-MM}:storage → bytes
usage:{tenantId}:{YYYY-MM}:users → count
```

## Fase 2: Extração WhatsApp Gateway (Semanas 3-4) - ISOLAMENTO CRÍTICO ✅

**Objetivo**: Isolar componente mais crítico e instável como microserviço independente

### 2.1 Estrutura do Microserviço

**Diretório: `28web-whatsapp-gateway/`**

```
28web-whatsapp-gateway/
├── src/
│   ├── controllers/
│   │   ├── SessionController.ts      # POST /sessions, DELETE /sessions/{id}
│   │   ├── MessageController.ts      # POST /sessions/{id}/messages
│   │   └── WebhookController.ts      # Endpoint interno para eventos
│   ├── services/
│   │   ├── WhatsAppClient.ts         # Wrapper whatsapp-web.js
│   │   ├── SessionManager.ts         # Gerenciar múltiplas sessões
│   │   └── WebhookService.ts         # Enviar eventos para app principal
│   ├── models/
│   │   └── Session.ts                # Model de sessão (TypeORM/Sequelize)
│   ├── queue/
│   │   └── MessageQueue.ts           # Fila de envio (Bull)
│   └── server.ts
├── docker-compose.yml
├── Dockerfile
└── package.json
```

### 2.2 API do Gateway

**Criar Sessão:**

```typescript
POST /api/v1/sessions
{
  "tenantId": "tenant_123",
  "name": "Atendimento Principal",
  "webhookUrl": "https://app.28web.com.br/webhook/whatsapp"
}

// Response
{
  "sessionId": "sess_abc123",
  "qrCode": "data:image/png;base64...",
  "status": "qr_code"
}
```

**Enviar Mensagem:**

```typescript
POST /api/v1/sessions/{sessionId}/messages
{
  "to": "5548999999999@c.us",
  "body": "Olá!",
  "mediaUrl": "https://storage.28web.com.br/file123" // opcional
}
```

**Webhook para App Principal:**

```typescript
POST {webhookUrl}
{
  "sessionId": "sess_abc123",
  "event": "message",
  "data": {
    "from": "5548999999999@c.us",
    "body": "Preciso de ajuda",
    "timestamp": 1702323456,
    "messageId": "msg_xyz"
  }
}
```

### 2.3 Migração no App Principal

**Arquivo: `backend/src/providers/WhatsAppProvider.ts`**

```typescript
import { IChannelProvider } from '../interfaces/IChannelProvider';

class WhatsAppProvider implements IChannelProvider {
  private apiUrl = process.env.WHATSAPP_GATEWAY_URL;
  private apiKey = process.env.WHATSAPP_GATEWAY_API_KEY;

  async sendMessage(data: SendMessageDTO) {
    // HTTP call para gateway
    return axios.post(`${this.apiUrl}/sessions/${sessionId}/messages`, data);
  }
  
  // Implementar outros métodos da interface
}
```

**Arquivo: `backend/src/controllers/WhatsAppWebhookController.ts`**

```typescript
app.post('/webhook/whatsapp', async (req, res) => {
  const { sessionId, event, data } = req.body;
  
  if (event === 'message') {
    await handleIncomingMessage(data); // Lógica existente
  }
  
  res.sendStatus(200);
});
```

### 2.4 Docker Compose

```yaml
services:
  whatsapp-gateway:
    build: ./28web-whatsapp-gateway
    container_name: 28web-whatsapp-gateway
    ports:
         - "3001:3001"
    environment:
         - DATABASE_URL=postgresql://user:pass@postgres:5432/gateway
         - REDIS_URL=redis://redis:6379
         - API_KEY=${WHATSAPP_GATEWAY_API_KEY}
         - APP_WEBHOOK_URL=${APP_WEBHOOK_URL}
    volumes:
         - ./28web-whatsapp-gateway/sessions:/app/sessions
         - .data/.wwebjs_auth:/app/.wwebjs_auth
    depends_on:
         - postgres
         - redis
```

## Fase 3: Billing Robusto (Semanas 5-6) - MONETIZAÇÃO ✅

**Objetivo**: Sistema completo de billing e limites por plano

### 3.1 Modelo de Planos

**Arquivo: `backend/src/models/Plan.ts`**

```typescript
interface Plan {
  id: string;
  name: 'starter' | 'professional' | 'enterprise';
  price: number; // R$/mês
  limits: {
    whatsappSessions: number;
    messagesPerMonth: number;
    storageGB: number;
    users: number;
  };
  features: string[];
}
```

**Planos sugeridos:**

- **Starter**: R$ 99/mês - 1 sessão, 1k msgs, 5GB, 2 usuários
- **Professional**: R$ 399/mês - 5 sessões, 10k msgs, 50GB, 10 usuários
- **Enterprise**: R$ 999/mês - Ilimitado, 100k msgs, 200GB, 50 usuários

### 3.2 Tracking de Uso

**Arquivo: `backend/src/services/BillingServices/UsageTracker.ts`**

```typescript
class UsageTracker {
  async trackMessage(tenantId: string, channel: string) {
    const key = `usage:${tenantId}:${getCurrentMonth()}`;
    await redis.hincrby(key, 'messages', 1);
    await this.checkLimits(tenantId);
  }
  
  async trackStorage(tenantId: string, bytes: number) {
    // ...
  }
  
  async getUsage(tenantId: string) {
    const usage = await redis.hgetall(`usage:${tenantId}:${getCurrentMonth()}`);
    const plan = await getPlan(tenantId);
    return { usage, plan, limits: plan.limits };
  }
  
  async checkLimits(tenantId: string) {
    const usage = await this.getUsage(tenantId);
    // Enviar alerta se próximo do limite
  }
}
```

### 3.3 Middleware de Validação

**Arquivo: `backend/src/middleware/checkPlanLimits.ts`**

```typescript
export async function checkPlanLimits(req, res, next) {
  const tenantId = req.user.tenantId;
  const usage = await usageTracker.getUsage(tenantId);
  
  if (req.path.includes('/messages/send')) {
    if (usage.messages >= usage.plan.limits.messagesPerMonth) {
      return res.status(403).json({ 
        error: 'Limite mensal de mensagens atingido',
        upgradeUrl: '/billing/upgrade'
      });
    }
  }
  
  next();
}
```

### 3.4 Integração com Gateway de Pagamento

- Integrar com Stripe/PagSeguro/Asaas
- Webhooks de pagamento
- Renovação automática
- Suspensão por falta de pagamento

## Fase 4: Validação de Mercado (Semana 7) - DECISÃO DATA-DRIVEN ✅

**Objetivo**: Coletar métricas reais para decidir próximos passos

### 4.1 Métricas a Coletar

- Número de tenants ativos
- Canal mais usado (WhatsApp %, Instagram %, etc)
- Volume de mensagens por canal
- Gargalos de performance identificados
- Feedback de clientes
- CAC (Custo de Aquisição) vs LTV (Lifetime Value)
- Churn rate

### 4.2 Dashboard de Métricas

**Arquivo: `backend/src/services/AnalyticsServices/MetricsService.ts`**

```typescript
class MetricsService {
  async getChannelDistribution(period: string) {
    // WhatsApp: 75%, Instagram: 15%, Telegram: 8%, Messenger: 2%
  }
  
  async getPerformanceMetrics() {
    // Tempo de resposta, uptime, erros
  }
  
  async getBusinessMetrics() {
    // MRR, churn, CAC, LTV
  }
}
```

### 4.3 Decisão Baseada em Dados

**Se WhatsApp > 80% do uso:**

- ✅ Estratégia correta (já isolado)
- Focar em melhorias de performance do gateway

**Se outros canais crescem:**

- Considerar extrair Instagram ou Telegram
- Priorizar baseado em % de uso

**Se sistema estável:**

- Manter arquitetura atual
- Focar em features e vendas

**Se há gargalos:**

- Identificar causa raiz
- Extrair componente problemático

## Fase 5: Wrappers e Abstrações (Paralelo) - PREPARAÇÃO FUTURA ✅

**Objetivo**: Criar camadas de abstração para facilitar migrações futuras

### 5.1 Wrapper Instagram

**Arquivo: `backend/src/providers/InstagramProvider.ts`**

```typescript
class InstagramProvider implements IChannelProvider {
  private instaBot: any; // instagram-private-api por enquanto
  
  async sendMessage(data: SendMessageDTO) {
    // Usar instagram-private-api agora
    // Depois troca para SDK próprio sem mudar interface
  }
}
```

### 5.2 Wrapper Telegram

**Arquivo: `backend/src/providers/TelegramProvider.ts`**

```typescript
class TelegramProvider implements IChannelProvider {
  private telegraf: Telegraf; // SDK oficial por enquanto
  
  // Wrapper simples, pode evoluir depois
}
```

### 5.3 Wrapper Messenger

**Arquivo: `backend/src/providers/MessengerProvider.ts`**

```typescript
class MessengerProvider implements IChannelProvider {
  // Wrapper sobre notificamehubsdk ou messaging-api-messenger
  // Preparado para substituição futura
}
```

**Benefício**: Permite trocar implementações sem refatorar código consumidor

## Fase 6: Evolução Orgânica (Conforme Demanda) - ESCALA INTELIGENTE ✅

**Objetivo**: Extrair componentes apenas quando houver necessidade comprovada

### 6.1 Critérios para Extração

**Extrair Storage Service SE:**

- Uso de storage > 100GB total
- Necessidade de CDN global
- Requisitos de compliance (S3-compatible)

**Extrair Instagram Gateway SE:**

- Instagram > 20% do uso
- Problemas de performance com instagram-private-api
- Múltiplas instâncias necessárias

**Extrair Auth Service SE:**

- Necessidade de SSO
- Múltiplas aplicações usando mesmo auth
- Requisitos de compliance (SAML, OIDC)

### 6.2 Padrão de Extração

1. Criar wrapper/abstração primeiro
2. Testar wrapper no core
3. Extrair para microserviço
4. Migrar gradualmente
5. Manter compatibilidade durante transição

### Fase 7: Infraestrutura e DevOps (Contínuo) ✅

### 7.1 Monorepo Structure

```
28web-hub/
├── packages/
│   ├── 28web-whatsapp-sdk/
│   ├── 28web-instagram-sdk/
│   ├── 28web-messenger-sdk/
│   ├── 28web-telegram-sdk/
│   ├── 28web-core/ (shared utilities)
│   └── 28web-types/ (TypeScript types)
├── backend/
├── frontend/
└── infrastructure/
    ├── docker/
    ├── kubernetes/
    └── terraform/
```

### 7.2 Sistema de Build e Deploy

- Configurar monorepo com Turborepo ou Nx
- CI/CD pipelines proprietários
- Build otimizado para produção
- Versionamento semântico

### 7.3 Infraestrutura como Código

- Terraform para recursos cloud
- Kubernetes para orquestração (opcional)
- Scripts de migração de banco

### Fase 8: Sistema de Licenciamento e Multi-tenancy ✅

### 8.1 Sistema de Assinaturas

- Modelo de planos (Starter, Professional, Enterprise)
- Limites por plano (usuários, canais, mensagens)
- Billing e pagamentos
- Webhook de status de pagamento

### 8.2 Isolamento de Tenants

- Row-level security no banco
- Namespacing de recursos
- Rate limiting por tenant
- Quotas e limites

### Fase 9: Sistema de Monitoramento e Observabilidade ✅

### 9.1 Sistema de Métricas Proprietário

- Dashboard de métricas próprio
- Substituir New Relic por solução própria
- Logs centralizados
- Alertas customizados

### 9.2 Analytics Proprietário

- Sistema de analytics interno
- Relatórios de uso
- Business intelligence

## Cronograma Otimizado

| Fase | Semanas | Atividade | Resultado | Prioridade |
|------|---------|-----------|-----------|------------|
| **Fase 1** | 1-2 | MVP: Rebranding + Abstrações + Billing Básico | Sistema vendável | 🔴 CRÍTICA |
| **Fase 2** | 3-4 | Extrair WhatsApp Gateway | Isolamento crítico | 🔴 CRÍTICA |
| **Fase 3** | 5-6 | Billing Robusto + Gateway Pagamento | Monetização completa | 🔴 CRÍTICA |
| **Fase 4** | 7 | Validação de Mercado | Decisão data-driven | 🟡 IMPORTANTE |
| **Fase 5** | Paralelo | Wrappers e Abstrações | Preparação futura | 🟢 NICE-TO-HAVE |
| **Fase 6** | Conforme demanda | Evolução Orgânica | Escala inteligente | 🟢 NICE-TO-HAVE |

**Time to Market**: 7 semanas (vs 24 semanas do plano original)

**Validação**: Semana 7 (vs sem validação)

**ROI**: Começa a monetizar em 6 semanas

## Arquivos Críticos - Fase 1 (MVP)

### Backend - Rebranding

- `backend/package.json` - Nome, descrição, repositório
- `backend/src/**/*.ts` - Buscar/re substituir "izing" → "28web"
- Todos os arquivos de licença (remover AGPL)

### Backend - Abstrações (NOVO)

- `backend/src/interfaces/IChannelProvider.ts` - **CRIAR** Interface unificada
- `backend/src/providers/WhatsAppProvider.ts` - **CRIAR** Wrapper inicial
- `backend/src/services/MessageServices/` - Refatorar para usar IChannelProvider

### Backend - Billing (NOVO)

- `backend/src/models/Plan.ts` - **CRIAR** Modelo de planos
- `backend/src/services/BillingServices/UsageTracker.ts` - **CRIAR** Tracking Redis
- `backend/src/middleware/checkPlanLimits.ts` - **CRIAR** Validação limites
- `backend/src/services/BillingServices/PlanService.ts` - **CRIAR** Gestão planos

### Frontend - Rebranding

- `frontend/package.json` - Nome, descrição
- `frontend/src/**/*.{vue,js}` - Buscar/re substituir "izing" → "28web"
- `frontend/public/` - Logos, favicon, ícones

### Configuração

- `backend/.env.example` - Atualizar variáveis
- `README.md` - Documentação completa 28web
- `LICENSE` - Atualizar para proprietário

## Arquivos Críticos - Fase 2 (WhatsApp Gateway)

### Novo Microserviço

- `28web-whatsapp-gateway/` - **CRIAR** Diretório completo
- `28web-whatsapp-gateway/src/` - Código do gateway
- `28web-whatsapp-gateway/docker-compose.yml` - Configuração Docker
- `28web-whatsapp-gateway/Dockerfile` - Build do gateway
- `28web-whatsapp-gateway/package.json` - Dependências do gateway

### Backend - Migração

- `backend/src/providers/WhatsAppProvider.ts` - **ATUALIZAR** Para usar gateway HTTP
- `backend/src/controllers/WhatsAppWebhookController.ts` - **CRIAR** Receber eventos
- `backend/src/services/WbotServices/` - Refatorar para usar WhatsAppProvider
- `backend/src/routes/whatsappWebhookRoutes.ts` - **CRIAR** Rotas webhook

## Arquivos Críticos - Fase 3 (Billing)

### Backend - Billing Robusto

- `backend/src/models/Plan.ts` - **IMPLEMENTAR** Modelo completo
- `backend/src/services/BillingServices/UsageTracker.ts` - **IMPLEMENTAR** Tracking completo
- `backend/src/middleware/checkPlanLimits.ts` - **IMPLEMENTAR** Validação robusta
- `backend/src/services/BillingServices/PlanService.ts` - **IMPLEMENTAR** Gestão planos
- `backend/src/controllers/BillingController.ts` - **CRIAR** Endpoints billing
- `backend/src/routes/billingRoutes.ts` - **CRIAR** Rotas billing

### Integração Pagamento

- `backend/src/services/BillingServices/PaymentGatewayService.ts` - **CRIAR** Adapter pagamento
- `backend/src/controllers/PaymentWebhookController.ts` - **CRIAR** Webhook pagamentos
- `backend/src/routes/paymentWebhookRoutes.ts` - **CRIAR** Rotas webhook

## Arquivos Críticos - Fase 4 (Validação)

### Backend - Analytics

- `backend/src/services/AnalyticsServices/MetricsService.ts` - **CRIAR** Serviço métricas
- `backend/src/controllers/AnalyticsController.ts` - **CRIAR** Endpoints analytics
- `backend/src/routes/analyticsRoutes.ts` - **CRIAR** Rotas analytics

### Dashboard

- `backend/src/services/AnalyticsServices/DashboardService.ts` - **CRIAR** Serviço dashboard
- `frontend/src/pages/analytics/` - **CRIAR** Páginas analytics

## Riscos e Mitigações

### Riscos Técnicos

1. **WhatsApp API não-oficial instável**

      - **Mitigação**: Isolar em microserviço permite updates rápidos sem afetar core
      - **Fallback**: Manter versão anterior durante transição

2. **APIs Instagram bloqueadas**

      - **Mitigação**: Wrapper permite trocar implementação rapidamente
      - **Preparação**: Estudar Graph API oficial como alternativa

3. **Performance de microserviços**

      - **Mitigação**: Começar com apenas WhatsApp (80% do uso), monitorar latência
      - **Otimização**: Usar Redis para cache, HTTP keep-alive, connection pooling

### Riscos de Negócio

1. **Time to market longo**

      - **Mitigação**: MVP em 2 semanas, validação antes de escalar
      - **ROI**: Começa a monetizar em 6 semanas

2. **Vendor lock-in (NotificaMe Hub)**

      - **Mitigação**: Criar wrapper, preparar substituição gradual
      - **Preparação**: Estudar alternativas de mercado

3. **Complexidade operacional**

      - **Mitigação**: Começar simples, evoluir conforme necessidade
      - **Preparação**: Documentação clara e automação

### Riscos de Compliance

1. **GDPR/LGPD**

      - **Ação**: Revisar armazenamento de dados, implementar privacidade
      - **Arquivo**: `backend/src/services/ComplianceServices/`

2. **Termos de Uso das plataformas**

      - **Ação**: Revisar políticas WhatsApp, Instagram, etc
      - **Documentação**: Manter termos atualizados

## Métricas de Sucesso

### Fase 1 (MVP) - Semana 2

- ✅ 100% rebranding completo
- ✅ Sistema vendável funcionando
- ✅ Billing básico operacional
- ✅ Zero referências "izing" ou AGPL

### Fase 2 (WhatsApp Gateway) - Semana 4

- ✅ WhatsApp isolado em microserviço
- ✅ Zero dependência direta de whatsapp-web.js no core
- ✅ API REST do gateway funcionando
- ✅ Webhooks recebendo eventos

### Fase 3 (Billing) - Semana 6

- ✅ Planos funcionando
- ✅ Tracking de uso em tempo real
- ✅ Limites sendo respeitados
- ✅ Integração com gateway de pagamento

### Fase 4 (Validação) - Semana 7

- ✅ Métricas coletadas
- ✅ Dashboard de analytics funcionando
- ✅ Decisão data-driven sobre próximos passos

### Métricas de Longo Prazo (3-6 meses)

- Tempo de resposta < 200ms (95th percentile)
- Uptime > 99.5%
- Suporte a 100+ tenants simultâneos
- Churn rate < 5% mensal
- CAC < 30% do LTV

## Próximos Passos IMEDIATOS

### Esta Semana

1. ✅ Confirmar estratégia (este plano)
2. ✅ Criar checklist detalhado da Fase 1
3. ✅ Iniciar rebranding (buscar/substituir "izing")
4. ✅ Criar interface IChannelProvider
5. ✅ Implementar sistema básico de billing

### Próximas 2 Semanas

1. Completar Fase 1 (MVP)
2. Deploy de teste
3. Validar funcionamento básico
4. Iniciar Fase 2 (WhatsApp Gateway)

### Decisões Pendentes

- [ ] Escolher gateway de pagamento (Stripe/PagSeguro/Asaas)
- [ ] Definir domínios (28web.com.br? 28webhub.com?)
- [ ] Estratégia de deploy (Docker Compose? Kubernetes? VPS?)
- [ ] Preços finais dos planos

## Arquitetura Final Esperada (6 meses)

```
┌─────────────────────────────────────────────────────────┐
│      28WEB CORE (Monolito Modular)              │
│  ┌───────────────────────────────────────────┐  │
│  │  Auth + Billing + Multi-tenancy   │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────────────┐  │
│  │  Instagram/Telegram/Messenger               │  │
│  │  (wrappers, podem extrair depois)         │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────────────┐  │
│  │  Tickets/Messages/Contacts                │  │
│  │  (core business logic)                │  │
│  └───────────────────────────────────┘  │
└──────────────┬─────────────────────────────────────────┘
               │ HTTP/Webhooks
               ▼
┌─────────────────────────────────────────────────┐
│   28WEB WHATSAPP GATEWAY                │
│   (Microserviço Isolado)                │
└─────────────────────────────────────────────────┘

**Decisão de arquitetura futura será baseada em dados reais coletados na Fase 4.**