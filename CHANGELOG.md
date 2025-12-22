# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em "Keep a Changelog",
e este projeto adere ao Semantic Versioning.

## [Unreleased]

## [1.0.0-billing] - 2025-12-20

### 🎉 Adicionado
- Sistema completo de Billing & Usage Tracking
- UsageService com Redis para rastreamento em tempo real de uso por tenant
- Rastreamento de métricas: mensagens, armazenamento (bytes), usuários, sessões WhatsApp
- Middleware checkPlanLimits para validação de limites antes de consumir recursos
- Resposta 402 (Payment Required) quando limites são excedidos

### APIs de Billing para Tenants
- GET /api/billing/tenant/plans - Lista planos disponíveis (ordenado por preço)
- GET /api/billing/tenant/usage - Consulta uso atual do tenant

### APIs de Billing para Admins
- GET /api/admin/plans - Lista todos os planos
- GET /api/admin/tenants/:tenantId/usage - Consulta uso de qualquer tenant

### Extensão do modelo Plan
- Campo currency (VARCHAR(3), default 'BRL') para suporte multi-moeda
- Campo description (TEXT) para descrições detalhadas dos planos
- Campo billingCycle (ENUM) com valores: monthly, quarterly, yearly

### Pontos de integração de tracking
- Criação de mensagens: incrementa contador + storage de anexos
- Criação de usuários: incrementa contador de users
- Início de sessão WhatsApp: incrementa contador de sessões
- Upload de contatos: valida e incrementa storage
- Upload em campanhas: valida e incrementa storage

### Documentação
- BILLING_USAGE_TRACKING.md - Arquitetura técnica completa com diagrama
- BILLING_INTEGRATION_GUIDE.md - Guia para integração do frontend
- RELEASE_CHECKLIST_BILLING_V1.md - Checklist completo de deploy
- Seção "Documentação Técnica" no README principal

### 🔒 Segurança
- Isolamento multi-tenant em todos os endpoints de billing
- Validação de tenantId em todas as operações de usage
- Endpoints admin protegidos por middleware isAuthAdmin

### 📊 Performance
- Cache de métricas em Redis com chaves por tenant + período (YYYYMM)
- Overhead médio < 10ms por operação rastreada
- Try/catch em incrementos para não afetar fluxo principal

### 🛠️ Migrations
- 20250120000001-add-plan-extended-fields.ts - Adiciona campos ao Plan
- 20250120000002-update-plan-descriptions.ts - Seed de descrições

### 📝 Notas
- TODOs documentados para: tracking em hub/apiExternal, atomicidade Redis, TTL/agregação mensal
- Sistema preparado para integração futura com gateway de pagamento
- Defaults de limites aplicados quando tenant não tem plano ativo

### ⚠️ Breaking Changes
- Nenhuma. Implementação é 100% aditiva e backward-compatible.

## [0.9.0] - 2025-XX-XX
- ...