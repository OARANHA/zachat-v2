# Billing & Usage (Zechat V1)

Este documento descreve o modelo de planos, assinaturas e rastreamento de uso em tempo real do Zechat V1, incluindo os pontos de incremento e os endpoints mínimos expostos para consulta por tenant e por superadmin.

---

## Visão geral

- Fonte de verdade dos limites
  - O plano vigente do tenant define os limites de uso (Plan.limits).
  - Caso exista override técnico no Tenant (maxUsers, maxConnections), esses valores complementam/substituem os limites do plano para “users” e “whatsappSessions”.
  - Ordem de resolução de limites:
    1) Subscription ativa → Plan.limits
    2) TenantPlan ativo (fallback) → Plan.limits
    3) Defaults seguros (se nenhum plano encontrado)
    4) Overrides do Tenant (maxUsers/maxConnections) se > 0

- Onde os limites são aplicados
  - Middleware `checkPlanLimits` (backend/src/middleware/checkPlanLimits.ts) utiliza `UsageService.getUsage(tenantId)` para obter `{ usage, limits }` e bloquear operações quando os limites forem alcançados.
  - Exemplos de bloqueio:
    - Limite de mensagens por mês
    - Limite de armazenamento (upload) → comparado em bytes com `storageBytes`
    - Limite de usuários
    - Limite de sessões WhatsApp

- Rastreamento de uso em tempo real (Redis)
  - `UsageService` (backend/src/services/BillingServices/UsageService.ts) armazena contadores por tenant e por período (YYYYMM) em Redis.
  - Estrutura de chave: `usage:{tenantId}:{YYYYMM}` com campos:
    - `messages` (nº de mensagens)
    - `storageBytes` (bytes acumulados de mídias)
    - `users` (nº de usuários criados no período)
    - `whatsappSessions` (nº de sessões criadas no período)

---

## Modelos envolvidos

- Tenant (backend/src/models/Tenant.ts)
  - Representa a empresa/cliente. Possui overrides técnicos opcionais:
    - `maxUsers`, `maxConnections` (se > 0, substituem os limites do plano para esses itens)

- Plan (backend/src/models/Plan.ts)
  - Plano global, gerenciado pelo superadmin. Contém `limits` (messagesPerMonth, storageGB, users, whatsappSessions) e `features`.

- TenantPlan (no mesmo arquivo de Plan.ts, se utilizado)
  - Associação Tenant → Plan, com status/período. Fallback para identificação do plano vigente quando não existir Subscription ativa.

- Subscription (backend/src/models/Subscription.ts)
  - Assinatura do tenant em um `Plan`, com período/status, normalmente origem de verdade para o plano vigente.

- UsageService (backend/src/services/BillingServices/UsageService.ts)
  - Tipos:
    - `UsageMetrics`: `{ messages, storageBytes, users, whatsappSessions }`
    - `UsageLimits`: `{ messagesPerMonth, storageGB, users, whatsappSessions }`
    - `UsageSnapshot`: `{ usage: UsageMetrics, limits: UsageLimits }`
  - Métodos principais:
    - `getUsage(tenantId)` → carrega usage atual e resolve limites (plano + overrides do tenant)
    - `incrementMessages(tenantId, count, bytes?)`
    - `incrementWhatsappSessions(tenantId, count)`
    - `incrementUsers(tenantId, count)`
    - `incrementStorage(tenantId, bytes)`

---

## Fluxo de uso (incrementos)

- Incrementos implementados (primeira etapa):
  - Criação de usuário (CreateUserService)
    - Local: `backend/src/services/UserServices/CreateUserService.ts`
    - Ação: `await UsageService.incrementUsers(tenantId, 1)` após `User.create(...)` com try/catch para não quebrar o fluxo em caso de falha no tracking.

  - Criação de sessão WhatsApp (StartWhatsAppSession)
    - Local: `backend/src/services/WbotServices/StartWhatsAppSession.ts`
    - Ação: `await UsageService.incrementWhatsappSessions(tenantId, 1)` após persistir/atualizar a sessão criada (try/catch para robustez).

  - Envio de mensagem (CreateMessageSystemService)
    - Local: `backend/src/services/MessageServices/CreateMessageSystemService.ts`
    - Ações:
      - Mensagens sem mídia: `await UsageService.incrementMessages(tenantId, 1, 0)`
      - Mensagens com mídia: calcula `totalBytes` (soma do tamanho dos anexos) e chama `await UsageService.incrementMessages(tenantId, 1, totalBytes)`

- Consolidação de uso e limites
  - `getUsage(tenantId)` retorna `{ usage, limits }` conforme o plano vigente (Subscription/TenantPlan) e overrides do Tenant.
  - O middleware `checkPlanLimits` usa esse snapshot para validar e bloquear operações que excedem os limites.

---

## Endpoints expostos (mínimos)

- Admin de tenant
  - `GET /api/billing/tenant/usage`
    - Retorna `{ usage, limits }` do tenant autenticado (usa `req.user.tenantId`).
  - `GET /api/billing/tenant/plans`
    - Lista de planos disponíveis (no esqueleto atual, mock; futuramente, `Plan.scope('active')`).

- Superadmin
  - `GET /api/admin/plans`
    - Retorna a lista de `Plan`. CRUD completo ficará em endpoints específicos.
  - `GET /api/admin/tenants/:tenantId/usage`
    - Retorna `{ usage, limits }` para qualquer tenant, para auditoria/administração.

---

## Comportamento esperado (exemplos)

- Criar usuário → `usage.users` sobe em +1
- Abrir sessão WhatsApp → `usage.whatsappSessions` sobe em +1
- Enviar mensagens:
  - Sem mídia → `usage.messages` sobe em +1
  - Com mídia → `usage.messages` sobe em +1 e `usage.storageBytes` aumenta pelo tamanho total dos anexos (bytes)

- Storage/upload
  - `checkPlanLimits` calcula `storageLimitBytes = limits.storageGB * 1024 * 1024 * 1024` e compara com `usage.storageBytes` para bloquear novos uploads quando exceder.

---

## Observações e próximos passos

- Persistência mensal em Postgres
  - Fase futura: job de agregação que consolida os contadores de Redis (por `usage:{tenantId}:{YYYYMM}`) em tabelas SQL para relatórios/auditoria.

- RBAC/Autorização
  - Os endpoints de superadmin exigem middleware/admin; endpoints de tenant exigem `isAuth` e usam sempre `req.user.tenantId`.

- Fonte de verdade de limites
  - Sempre `Plan.limits` da assinatura corrente (Subscription) ou do TenantPlan ativo como fallback; overrides de Tenant (maxUsers, maxConnections) apenas como exceção controlada por superadmin.
