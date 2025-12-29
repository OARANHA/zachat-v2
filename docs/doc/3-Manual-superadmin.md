# 📘 MANUAL DO SUPERADMIN - ZECHAT V2

**Guia Completo de Gestão da Plataforma SaaS**

---

## 🎯 Sobre este Manual

Este documento destina-se ao **SuperAdmin** - a pessoa responsável por gerenciar toda a plataforma ZeChat V2, incluindo tenants (empresas clientes), planos, subscrições, faturamento e configurações globais.

### O que o SuperAdmin pode fazer:
- ✅ Gerenciar tenants (criar, editar, deletar, ativar/desativar)
- ✅ Gerenciar usuários globais (superadmins)
- ✅ Visualizar métricas globais (uso, performance, revenue)
- ✅ Configurar planos de assinatura
- ✅ Monitorar faturamento e uso de recursos
- ✅ Administrar integrações globais
- ✅ Ver todos os canais WhatsApp cadastrados
- ✅ Aplicar regras de RBAC (roles e permissões)

---

## 🚀 Primeiro Acesso

### Credenciais Iniciais

Você recebeu um email com:
```
Email: seu.email@empresa.com.br
Senha: (senha temporária)
Link: https://app.zechat.com.br
```

### 1️⃣ Fazer Login

1. Acesse **https://app.zechat.com.br**
2. Insira seu **email** e **senha**
3. Ao primeiro acesso, mude para uma **senha forte**
4. Clique **"Entrar"**

### 2️⃣ Validar Acesso SuperAdmin

Ao entrar, você deve ver:
```
┌─────────────────────────────────────────┐
│  ZeChat - SUPERADMIN                    │
├─────────────────────────────────────────┤
│                                         │
│  Menu Principal:                        │
│  ├─ 📊 Dashboard SuperAdmin             │
│  ├─ 🏢 Empresas (Tenants)               │
│  ├─ 👥 Usuários SuperAdmin              │
│  ├─ 💰 Billing & Subscriptions          │
│  ├─ 📋 Planos                           │
│  ├─ 📊 Relatórios Globais               │
│  └─ ⚙️ Configurações Globais            │
│                                         │
└─────────────────────────────────────────┘
```

Se não vir este menu, **você não é SuperAdmin**. Contate o administrador.

---

## 📊 Dashboard SuperAdmin

### Localização
```
Menu Principal → Dashboard → SuperAdmin Dashboard
```

### O que você vê?

A tela de Dashboard SuperAdmin exibe:

**1. Métricas Principais (Cards no topo)**
```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Total Tenants   │  │ Usuários Ativos │  │ Revenue Mês     │
│      42         │  │      127        │  │   R$ 12.450,00  │
└─────────────────┘  └─────────────────┘  └─────────────────┘

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Sessões Ativas  │  │ Mensagens/dia   │  │ Taxa Uptime     │
│      158        │  │      2.340      │  │     99.85%      │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

**2. Gráficos de Tendência**
- Novos tenants por mês
- Receita ao longo do tempo
- Taxa de churn (clientes que cancelam)
- Usar/limite de recursos por plano

**3. Alertas & Ações Rápidas**
- Tenants próximos ao limite de uso
- Subscriptions vencendo
- Erros em produção

**4. Últimos Eventos**
```
- Novo tenant criado: Empresa XYZ
- Upgrade: ABC para plano Professional
- Downgrade: 123 para plano Starter
- Ticket crítico aberto em TenantID #45
```

---

## 🏢 Gerenciar Tenants (Empresas Clientes)

### Localização
```
Menu Principal → Empresas (ou Tenants)
```

### Visualizar Lista de Tenants

A tela mostra uma **tabela com todos os clientes**:

```
┌────┬───────────────┬──────────┬──────────┬─────────┬────────┐
│ ID │ Nome Empresa  │ Status   │ Plano    │ Uso %   │ Ações  │
├────┼───────────────┼──────────┼──────────┼─────────┼────────┤
│ 1  │ ACME Corp     │ Ativo    │ Premium  │ 67%     │ ✎ 🗑️  │
│ 2  │ Tech Ltda     │ Ativo    │ Starter  │ 15%     │ ✎ 🗑️  │
│ 3  │ Shop Online   │ Inativo  │ Free     │ 0%      │ ✎ 🗑️  │
│ ... │              │          │          │         │        │
└────┴───────────────┴──────────┴──────────┴─────────┴────────┘

Filtros disponíveis:
🔍 Buscar por nome
📊 Filtrar por Status (Ativo, Inativo, Suspenso)
📈 Filtrar por Plano (Starter, Professional, Enterprise)
```

### ✅ Criar Novo Tenant

**1. Clicar em "+ Novo Tenant" ou "+ Adicionar"**

**2. Preencher formulário:**
```
Nome da Empresa: ________________
CNPJ/CPF: ______________________
Email Principal: ________________
Telefone: _______________________
Responsável: ____________________
Cidade/Estado: __________________

Plano Inicial: [Starter ▼]

Status: [Ativo ▼]
```

**3. Definir Limites**
```
Max Usuários: [5]
Max Canais: [1]
Max Contatos: [1000]
Max Mensagens/mês: [10000]
Storage GB: [5]
```

**4. Salvar**
```
Clique: [CRIAR TENANT]
```

**O que acontece após criar:**
- ✅ Tenant criado no banco de dados
- ✅ Admin automático criado (email recebe convite)
- ✅ Primeiras filas criadas (default)
- ✅ Plano associado e começar trial (se configurado)
- ✅ Email de boas-vindas enviado ao admin do tenant

### 🖊️ Editar Tenant

**1. Clicar no ícone ✎ (editar) na linha do tenant**

**2. Tela de Edição se abre com campos:**
```
Nome: [ACME Corp         ]
CNPJ: [12.345.678/0001-99]
Email: [contato@acme.com ]
Status: [Ativo ▼]
Plano: [Premium ▼]
```

**3. Modificar o que precisar**

**Ações disponíveis:**
- [ ] Mudar plano (Starter → Professional)
- [ ] Suspender temporariamente
- [ ] Aumentar/diminuir limites de uso
- [ ] Resetar dados (cuidado!)

**4. Clique: [SALVAR ALTERAÇÕES]**

### 🗑️ Deletar/Desativar Tenant

**Opção A: Desativar (Reversível)**
```
Clique em: [⋮] Mais Opções → Desativar
- Tenant para de funcionar
- Dados são preservados
- Pode ser reativado depois
```

**Opção B: Deletar Permanente (⚠️ CUIDADO)**
```
Clique em: [⋮] Mais Opções → Deletar
- ⚠️  AÇÃO IRREVERSÍVEL
- Todos os dados são perdidos
- Confirmar 2 vezes
```

### 📊 Ver Detalhes e Uso do Tenant

**Clicar no nome do tenant** para ver painel completo:

```
┌─────────────────────────────────────────┐
│ ACME Corp - Painel de Detalhes         │
├─────────────────────────────────────────┤
│                                         │
│ Status: Ativo                           │
│ Plano: Premium                          │
│ Desde: 15/06/2025                       │
│                                         │
│ ┌─ USO ATUAL ─────────────────────────┐ │
│ │ Usuários: 8 / 15 (53%)              │ │
│ │ Canais WhatsApp: 3 / 5 (60%)        │ │
│ │ Contatos: 1.200 / 10.000 (12%)      │ │
│ │ Mensagens mês: 3.450 / 100.000 (3%)│ │
│ │ Storage: 1.2 GB / 50 GB (2%)        │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Últimas Atividades:                     │
│ - Login: há 2 horas                     │
│ - Nova sessão WhatsApp: há 1 dia       │
│ - 2.340 mensagens enviadas: ontem      │
│                                         │
│ [EDITAR LIMITES] [RESETAR] [SUSPENDER] │
│                                         │
└─────────────────────────────────────────┘
```

---

## 👥 Gerenciar Usuários SuperAdmin

### Localização
```
Menu Principal → Usuários SuperAdmin
```

### Listar Usuários SuperAdmin

Tabela com todos os super admins:

```
┌────┬─────────────────┬──────────────────┬──────────┬────────┐
│ ID │ Nome            │ Email            │ Status   │ Ações  │
├────┼─────────────────┼──────────────────┼──────────┼────────┤
│ 1  │ João Silva      │ joao@zechat.com  │ Ativo    │ ✎ 🗑️  │
│ 2  │ Maria Santos    │ maria@zechat.com │ Ativo    │ ✎ 🗑️  │
└────┴─────────────────┴──────────────────┴──────────┴────────┘
```

### ➕ Criar Novo SuperAdmin

**1. Clique em "+ Novo SuperAdmin"**

**2. Preencha o formulário:**
```
Nome: ______________________
Email: ______________________
Senha: ______________________
Confirmar Senha: ____________
```

**3. Clique: [CRIAR]**

**Resultado:**
- SuperAdmin criado e ativado imediatamente
- Pode fazer login com email e senha

### 🖊️ Editar SuperAdmin

**Clicar no ícone ✎**

Pode mudar:
- Nome
- Email
- Status (Ativo/Inativo)
- Redefinir senha

### 🗑️ Remover SuperAdmin

**Clicar no ícone 🗑️**

⚠️ **CUIDADO:** Verifique se há pelo menos 2 SuperAdmins antes de remover!

---

## 💰 Billing & Subscriptions

### Localização
```
Menu Principal → Billing & Subscriptions
```

### 📋 Ver Subscriptions Ativas

Tabela com todas as assinaturas:

```
┌──────┬───────────────┬──────────┬─────────────┬──────────┬────────┐
│ Ten. │ Empresa       │ Plano    │ Data Vencto │ Valor    │ Status │
├──────┼───────────────┼──────────┼─────────────┼──────────┼────────┤
│ 1    │ ACME Corp     │ Premium  │ 15/08/2025  │ R$ 999   │ Ativo  │
│ 2    │ Tech Ltda     │ Starter  │ 01/08/2025  │ R$ 299   │ Ativo  │
│ 3    │ Shop Online   │ Free     │ ∞           │ R$ 0     │ Ativo  │
└──────┴───────────────┴──────────┴─────────────┴──────────┴────────┘
```

### 💳 Processar Cobrança Manual

Para tenants que não têm integração de pagamento automático:

**1. Localizar tenant na lista**

**2. Clique em [⋮] → "Cobrar"**

**3. Gere um boleto/invoice:**
```
Data de Vencimento: [15/08/2025]
Valor: [R$ 999,00]
Referência: [Subscription #1 - ACME - Agosto/2025]
```

**4. Enviar para cliente via email**

### 📊 Visualizar Faturamento

**Dashboard com:**
- Total de receita mensal
- Receita por plano
- Upgrade/Downgrade rate
- Churn rate
- Previsão de receita

---

## 📈 Planos de Assinatura

### Localização
```
Menu Principal → Planos
```

### Visualizar Planos

```
┌─────────────────────────────────────────────┐
│ STARTER - R$ 299/mês                        │
├─────────────────────────────────────────────┤
│ ✓ 5 Usuários                                │
│ ✓ 1 Canal WhatsApp                          │
│ ✓ 1.000 Contatos                            │
│ ✓ 10.000 Mensagens/mês                      │
│ ✓ 5 GB Storage                              │
│ [EDITAR]                                    │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ PROFESSIONAL - R$ 999/mês                   │
├─────────────────────────────────────────────┤
│ ✓ 15 Usuários                               │
│ ✓ 5 Canais WhatsApp                         │
│ ✓ 10.000 Contatos                           │
│ ✓ 50.000 Mensagens/mês                      │
│ ✓ 50 GB Storage                             │
│ + Integração com ERP                        │
│ [EDITAR]                                    │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ ENTERPRISE - Custom                         │
├─────────────────────────────────────────────┤
│ ✓ Usuários ilimitados                       │
│ ✓ Canais ilimitados                         │
│ ✓ Contatos ilimitados                       │
│ ✓ Mensagens ilimitadas                      │
│ ✓ 500 GB Storage                            │
│ ✓ SLA 99.9%                                 │
│ [EDITAR]                                    │
└─────────────────────────────────────────────┘
```

### 🖊️ Editar Plano

**Clique em [EDITAR] do plano**

Pode modificar:
```
Nome: [Professional]
Preço: [R$ 999,00]
Moeda: [BRL ▼]

Limites:
- Max Usuários: [15]
- Max Canais: [5]
- Max Contatos: [10.000]
- Max Mensagens/mês: [50.000]
- Storage (GB): [50]

Features:
☑ WhatsApp
☑ Instagram
☑ ERP Integration
☑ API Access
☑ Custom Fields
```

Clique: **[SALVAR PLANO]**

### ➕ Criar Novo Plano

**Clique em "+ Novo Plano"**

Preencha dados acima e salve.

---

## ⚙️ Configurações Globais

### Localização
```
Menu Principal → Configurações (ícone ⚙️)
```

### Opções Disponíveis

**1. Email & Notificações**
```
SMTP Host: [smtp.gmail.com]
SMTP Port: [587]
SMTP User: [noreply@zechat.com.br]
SMTP Password: [••••••••]

Email de Notificação: [alerts@zechat.com.br]
```

**2. Logo & Branding**
```
Logo da Plataforma: [Upload Logo]
Cores Padrão: [#FF6B00]
Favicon: [Upload Favicon]
```

**3. Limites Globais**
```
Max Tenants Simultâneos: [1000]
Max Conexões por Tenant: [100]
Max Storage por Tenant: [1 TB]
```

**4. Integrações Globais**
```
Evolution API: [URL: https://...]
OpenAI API Key: [sk-...]
Sentry DSN: [https://...]
```

**5. SMTP & Email**
- Configurar servidor SMTP para envio de emails
- Testar conexão
- Verificar logs de envio

---

## 📊 Relatórios Globais

### Localização
```
Menu Principal → Relatórios
```

### Relatórios Disponíveis

**1. Relatório de Crescimento**
- Novos tenants por período
- Taxa de crescimento MoM (mês a mês)
- Previsão de crescimento

**2. Relatório Financeiro**
- Receita total
- Receita por plano
- Valor médio por cliente (ARPU)
- Churn rate
- LTV (lifetime value)

**3. Relatório de Uso**
- Mensagens por dia/mês
- Canais mais usados
- Tenants mais ativos
- Taxa de utilização de recursos

**4. Relatório de Saúde**
- Uptime do sistema
- Erros em produção
- Performance (latência, CPU, memória)
- Alertas gerados

---

## 🔐 Gestão de Permissões e RBAC

### Localização
```
Menu Principal → Configurações → Roles & Permissões
```

### Visualizar Permissões

Tabela de permissões disponíveis:

```
┌────────────────────────┬────────┬──────────┐
│ Permissão              │ Escopo │ Status   │
├────────────────────────┼────────┼──────────┤
│ tenant.create          │ Global │ Ativo    │
│ tenant.read            │ Global │ Ativo    │
│ tenant.update          │ Global │ Ativo    │
│ tenant.delete          │ Global │ Ativo    │
│ user.create            │ Tenant │ Ativo    │
│ user.read              │ Tenant │ Ativo    │
│ ...                    │ ...    │ ...      │
└────────────────────────┴────────┴──────────┘
```

### Atribuir Permissões a Roles

**Superadmin Role:**
- ✅ Todas as permissões globais
- ✅ Todas as permissões de tenant

**AdminTenant Role:**
- ✅ user.create, user.read, user.update (em seu tenant)
- ✅ ticket.read, ticket.update (em seu tenant)
- ✅ channel.create, channel.read (em seu tenant)

---

## 🎯 Operações Comuns

### ✅ Ativar Novo Tenant para Cliente

```
1. Crie o tenant (Menu → Empresas → + Novo)
2. Admin recebe email de convite
3. Admin faz login e configura canais
4. Primeiros usuários são criados
5. Cliente começa a usar!

Tempo total: ~15 minutos
```

### ✅ Migrar Cliente para Plano Superior

```
1. Menu → Empresas
2. Clique no tenant
3. Mude de "Starter" para "Professional"
4. Aumente limites de usuários, canais, etc
5. Salve alterações

O cliente verá novo limite imediatamente
```

### ✅ Gerar Relatório de Receita

```
1. Menu → Relatórios → Financeiro
2. Escolha período (últimos 30 dias, 3 meses, etc)
3. Clique: [GERAR RELATÓRIO]
4. Exporte para Excel ou PDF
```

### ✅ Monitorar Saúde da Plataforma

```
1. Menu → Dashboard → SuperAdmin
2. Veja card "Uptime" e "Erros"
3. Se algo está amarelo/vermelho, investigue
4. Clique em "Detalhes" para logs
```

---

## ⚠️ Troubleshooting

### Problema: Tenant não consegue fazer login

**Verificar:**
1. Tenant está com status "Ativo"?
2. Admin do tenant recebeu email de convite?
3. Admin resetou a senha?
4. Verificar logs de erro em Dashboard

### Problema: Cobrança não foi processada

**Verificar:**
1. Subscription está ativa?
2. Cartão de crédito é válido?
3. Gateway de pagamento está funcionando?
4. Enviar boleto manualmente como alternativa

### Problema: Sistema lento

**Verificar:**
1. Dashboard → Métricas → CPU/Memória
2. Quantos tenants estão rodando?
3. Algum tenant usando muitos recursos?
4. Se necessário, limitar uso temporariamente

---

## 📞 Contatos & Suporte

**Equipe ZeChat:**
- Email: suporte@zechat.com.br
- WhatsApp: (11) 98765-4321
- Slack: #zechat-support

**Documentação:**
- Dev Docs: https://docs.zechat.com
- API Docs: https://api.zechat.com/docs
- GitHub: https://github.com/OARANHA/zachat-v2

---

**Última atualização:** 22/12/2025  
**Versão:** 2.0  
**Status:** Documento em produção
