# Release Checklist - Billing & Usage Tracking V1

## 📋 Pré-requisitos

### Ambiente
- [ ] Redis disponível e acessível pelo backend
- [ ] Migrations testadas em staging
- [ ] Backup do banco realizado
- [ ] Variáveis de ambiente do Redis configuradas

### Validações Técnicas
- [ ] Testes unitários passando
- [ ] PR revisado e aprovado
- [ ] Sem conflitos com branch principal
- [ ] Build backend/ frontend sem erros

## 🔧 Deploy Staging

### 1. Database
- [ ] Rodar migrations: `yarn sequelize db:migrate`
- [ ] Verificar campos novos em Plans
- [ ] Rodar seed de descrições
- [ ] Validar planos atualizados via SQL

### 2. Backend
- [ ] Deploy em staging
- [ ] Logs limpos (sem erros Redis)
- [ ] Health check ok
- [ ] Redis PING -> PONG

### 3. Smoke Tests
- [ ] Listar planos (tenant)
- [ ] Ver usage (tenant)
- [ ] Criar mensagem e verificar incremento no Redis
- [ ] Simular limite e verificar 402

### 4. Validações de Negócio
- [ ] Tenant sem plano usa defaults
- [ ] Tenant com TenantPlan ok
- [ ] Tenant com Subscription priorizado
- [ ] Overrides maxUsers/maxConnections aplicados

### 5. Performance
- [ ] /api/billing/tenant/usage < 100ms
- [ ] Overhead de tracking < 10ms
- [ ] Monitor Redis

## 🎯 Deploy Produção

### Pré-deploy
- [ ] Itens de staging validados
- [ ] Comunicação feita
- [ ] Janela de manutenção (se necessário)
- [ ] Plano de rollback

### 1. Backup
- [ ] Backup do banco
- [ ] Snapshot Redis (se necessário)
- [ ] Tag versão: `git tag v1.0.0-pre-billing`

### 2. Database
- [ ] Rodar migrations
- [ ] Validar campos
- [ ] Rodar seed
- [ ] Validar planos

### 3. Backend
- [ ] Deploy produção
- [ ] Monitorar logs 5min
- [ ] Health checks ok
- [ ] Redis ok

### 4. Smoke Tests Produção
- [ ] Listar planos
- [ ] Ver usage
- [ ] Criar mensagem incrementa contador
- [ ] Logs sem erros

### 5. Monitoramento (24h)
- [ ] Sem PLAN_LIMIT_EXCEEDED inesperados
- [ ] Redis estável
- [ ] Tracking ok
- [ ] Performance ok

## 🔄 Rollback
- [ ] Reverter código (tag anterior)
- [ ] Undo migrations: `yarn sequelize db:migrate:undo`
- [ ] Validar estado da tabela Plans
- [ ] Limpar Redis (se necessário)

## 📊 Métricas de Sucesso
- [ ] Zero erros críticos
- [ ] p95 < 100ms
- [ ] Tracking ativo para todos os tenants
- [ ] Sem bloqueios incorretos

## ❓ Troubleshooting
- Redis inacessível: verificar docker/ firewall/ rede
- Incrementos não acontecendo: checar logs/ try-catch/ fluxos de serviço
- Limites não válidos: confirmar middleware nas rotas
- Performance: índices e cache de planos, pooling Redis

## 📝 Responsáveis
- Tech Lead: ______
- DevOps: ______
- QA: ______
- Data de release: ______
- Responsável pelo deploy: ______
