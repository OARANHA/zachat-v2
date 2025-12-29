# 🗺️ MAPA VISUAL - FUNCIONALIDADES DO ZECHAT V2

**Visualização do que está implementado vs faltando**

---

## 📊 MATRIZ DE FUNCIONALIDADES

### SUPERADMIN - GESTÃO DA PLATAFORMA

```
┌─────────────────────────────────────────────────────────────────────────┐
│  SUPERADMIN DASHBOARD                                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Cards Rápidos:                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐│
│  │ Total Tenants│  │ Receita (MÊS)│  │ Usuários     │  │ Tickets hoje ││
│  │      23      │  │  R$ 45.000   │  │    156       │  │     245      ││
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘│
│                                                                          │
│  Gráficos:                                                               │
│  ┌─────────────────────────────────┐  ┌──────────────────────────────┐ │
│  │ Crescimento de Tenants          │  │ Receita por Plano            │ │
│  │ Últimos 30 dias                 │  │ Starter / Professional / Ent.│ │
│  │ ▲                               │  │                              │ │
│  │ │    ╱╲╱╲                       │  │                              │ │
│  │ │   ╱  ╲  ╲                     │  │                              │ │
│  │ └────────────────────           │  │                              │ │
│  └─────────────────────────────────┘  └──────────────────────────────┘ │
│                                                                          │
│  Menu Esquerdo:                                                          │
│  ✅ Dashboard              ✅ Gerenciar Tenants                         │
│  ✅ Gestão de Planos       ✅ Gerenciar Superadmins                     │
│  ✅ Billing                🟡 Relatórios (INCOMPLETO)                  │
│  🟡 Health Check (FALTANDO) 🔴 RBAC (NÃO APLICADO)                     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Funcionalidades Detalhadas

**✅ IMPLEMENTADO - Gerenciar Tenants**
```
[Listar Tenants]
┌────┬──────────────────┬──────────┬──────────┬──────────────┐
│ ID │ Nome da Empresa  │ Plano    │ Status   │ Ações        │
├────┼──────────────────┼──────────┼──────────┼──────────────┤
│  1 │ ACME Corp        │ Prof.    │ Ativo    │ [Editar]     │
│  2 │ Tech Solutions   │ Starter  │ Ativo    │ [Editar]     │
│  3 │ Design Agency    │ Ent.     │ Inativo  │ [Editar]     │
└────┴──────────────────┴──────────┴──────────┴──────────────┘

[Criar Novo Tenant]
Nome: [____________________]
Email Admin: [____________________]
Plano: [Starter ▼]
[Criar]
```

**🟡 PARCIAL - Billing & Relatórios**
```
[Billing Dashboard]
- ✅ Ver Subscriptions ativas
- 🟡 Ver Métricas de faturamento
- 🔴 Processar pagamento automático (FALTANDO)
- 🔴 Gerar Invoice/Boleto (FALTANDO)
- 🔴 Webhook de pagamento (FALTANDO)
```

**🔴 FALTANDO - Health & Monitoring**
```
Recomendação:
  Criar endpoint: GET /health
  Resposta: {
    status: "ok" | "degraded" | "down",
    db: "connected" | "disconnected",
    redis: "connected" | "disconnected",
    uptime: 99.5%,
    latency: 145ms,
    errors_1h: 3
  }
```

---

### ADMIN TENANT - GESTÃO DA CONTA

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ADMIN DASHBOARD (Conta ACME Corp)                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Cards Rápidos:                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐│
│  │ Usuários     │  │ Tickets (7d) │  │ Tempo Médio  │  │ Satisfação   ││
│  │    12        │  │    247       │  │  8 min 30s   │  │  4.7 / 5 ⭐  ││
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘│
│                                                                          │
│  Plano Atual:                                                            │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Professional - R$ 999/mês                                        │  │
│  │ ├─ Usuários: 12 / 15                                             │  │
│  │ ├─ Canais: 3 / 5                                                 │  │
│  │ ├─ Contatos: 2.847 / 10.000                                      │  │
│  │ └─ Upgrade: [Clique para Upgrade]                                │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  Menu Esquerdo:                                                          │
│  ✅ Dashboard                 ✅ Gerenciar Usuários                     │
│  ✅ Canais WhatsApp           ✅ Gerenciar Filas                        │
│  ✅ Automações/ChatFlow       ✅ Respostas Rápidas                      │
│  🟡 Relatórios                🟡 Integração ERP (SEM UI)                │
│  🟡 Campanhas (INCOMPLETO)    🔴 Dark Mode (FALTANDO)                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Funcionalidades Detalhadas

**✅ IMPLEMENTADO - Gerenciar Usuários**
```
[Lista de Usuários]
┌────┬──────────────────┬────────────┬──────────┬──────────────────┐
│ ID │ Nome             │ Email      │ Roles    │ Ações            │
├────┼──────────────────┼────────────┼──────────┼──────────────────┤
│  1 │ João Silva       │ joao@...   │ Admin    │ [Editar] [Remov] │
│  2 │ Maria Santos     │ maria@...  │ Agent    │ [Editar] [Remov] │
│  3 │ Carlos Costa     │ carlos@... │ Agent    │ [Editar] [Remov] │
└────┴──────────────────┴────────────┴──────────┴──────────────────┘

[Criar Novo Usuário]
Nome: [____________________]
Email: [____________________]
Filas: [Vendas] [Suporte] [Outro]
Role: [Agent ▼]
[Enviar Convite]
→ Email de convite enviado para maria@...
```

**✅ IMPLEMENTADO - Conectar WhatsApp**
```
[Sessões WhatsApp]
┌────┬──────────────────┬──────────┬──────────┐
│ ID │ Número           │ Status   │ Ações    │
├────┼──────────────────┼──────────┼──────────┤
│  1 │ (11) 99999-8888  │ 🟢 Online │ [QR Code]│
│  2 │ (85) 98888-7777  │ 🟡 Idle  │ [QR Code]│
│  3 │ (21) 97777-6666  │ 🔴 Offline│ [QR Code]│
└────┴──────────────────┴──────────┴──────────┘

[Conectar Novo Canal]
Clique: [+ Novo Canal]
↓
Mostra QR Code
↓
Escaneia no celular
↓
Status muda para "Online"
```

**✅ IMPLEMENTADO - Gerenciar Filas**
```
[Filas de Atendimento]
┌────┬──────────────┬──────────┬──────────────────┐
│ ID │ Nome         │ Agentes  │ Ações            │
├────┼──────────────┼──────────┼──────────────────┤
│  1 │ Vendas       │ 4        │ [Editar] [Remov] │
│  2 │ Suporte      │ 5        │ [Editar] [Remov] │
│  3 │ Cobrança     │ 2        │ [Editar] [Remov] │
└────┴──────────────┴──────────┴──────────────────┘

[Criar Nova Fila]
Nome: [____________________]
Agentes: [Selecionar agentes]
Horários: [Configurar]
SLA: [Não definido]
[Criar]
```

**✅ IMPLEMENTADO - Automações/ChatFlow**
```
[ChatFlows Disponíveis]
┌────┬──────────────┬──────────┬──────────────────┐
│ ID │ Nome         │ Trigger  │ Ações            │
├────┼──────────────┼──────────┼──────────────────┤
│  1 │ Boas-vindas  │ Novo chat│ [Editar] [Testa]│
│  2 │ Menu Opções  │ Palavra  │ [Editar] [Testa]│
│  3 │ Coletar CPF  │ Vendas   │ [Editar] [Testa]│
└────┴──────────────┴──────────┴──────────────────┘

[Criar Novo ChatFlow]
Nome: [____________________]
Trigger: [Mensagem contém ▼]
Palavras-chave: [____________________]
Ações: 
  1. [Responder com texto]
  2. [Enviar imagem]
  3. [Transferir para fila]
[Salvar]
```

**🟡 PARCIAL - Relatórios**
```
[Relatórios Disponíveis]
✅ Contatos por Estado
✅ Contatos por Tags
✅ Resumo de Atendimentos por Usuário

🟡 Faltando:
  - Relatório de Satisfação (NPS/CSAT)
  - Análise de Tendências
  - Previsão de Demanda
  - Export para CSV/PDF

Recomendação:
  Criar endpoint: GET /reports/satisfaction
  Criar endpoint: GET /reports/trends
  Criar endpoint: GET /reports/forecast
```

---

### AGENT - OPERADOR DE ATENDIMENTO

```
┌─────────────────────────────────────────────────────────────────────────┐
│  TELA DE ATENDIMENTO (Agent)                                            │
├──────────────────────────┬──────────────────────────────────────────────┤
│   LISTA DE TICKETS       │  CONVERSA (Chat)                             │
│                          │                                              │
│  🔴 [1] Maria Silva      │ MARIA SILVA                                  │
│     "Quero info preço"   │ (11) 99999-8888                              │
│     5 min                │ ────────────────────────────────────────     │
│                          │                                              │
│  🟡 [2] João Santos      │ Maria: Olá! Quero saber o preço             │
│     "Qual o preço"       │ [14:30]                                      │
│     30 min               │                                              │
│                          │ Você: Oi Maria! Bem-vindo! 😊                │
│  ⚪ [3] Carlos Costa     │       Qual produto te interessa?              │
│     "Recebi!"            │ [14:32]                                      │
│     2h                   │                                              │
│                          │ Maria: O plano Professional                  │
│                          │ [14:35]                                      │
│                          │                                              │
│                          │ Você: Ótimo! O Professional...               │
│                          │ [Digitando...]                               │
│                          │                                              │
│ Filtros:                 │ ────────────────────────────────────────     │
│ 🔴 Novo (urgente)        │                                              │
│ 🟡 Aberto                │ [Documentos] [Imagens] [Voz]                │
│ ⚪ Aguardando            │                                              │
│                          │ Escreva sua mensagem... [Enviar]            │
│                          │                                              │
│                          │ Tags: [Vendas] [Urgente]                    │
│                          │ Nota: [Clique para adicionar]               │
│                          │ Status: [Aberto ▼]                          │
│                          │                                              │
│                          │ [Resolver] [Transferir] [Bloquear]          │
│                          │                                              │
└──────────────────────────┴──────────────────────────────────────────────┘
```

#### Funcionalidades Detalhadas

**✅ IMPLEMENTADO - Receber & Responder Tickets**
```
Fluxo Completo:
1. Cliente envia mensagem no WhatsApp
   ↓
2. Mensagem aparece em "Lista de Tickets" como 🔴 NOVO
   ↓
3. Agent clica para abrir
   ↓
4. Vê histórico completo da conversa
   ↓
5. Digita resposta
   ↓
6. Clica [Enviar]
   ↓
7. Mensagem vai para cliente
   ↓
8. Quando cliente responde, atualiza em tempo real
   ↓
9. Agent pode resolver, transferir ou deixar aberto
```

**✅ IMPLEMENTADO - Usar Tags**
```
Exemplo de Uso:
┌──────────────────────────────────┐
│ Tags: [Vendas] [Urgente]         │
│                                  │
│ Disponíveis:                     │
│ ✓ Vendas                        │
│ ✓ Suporte                       │
│ ✓ Urgente                       │
│ ✓ Bloqueado                     │
│ ☐ Produto A                     │
│ ☐ Produto B                     │
│                                  │
│ [Tipo novo: ] [+ Criar]         │
└──────────────────────────────────┘

Benefício: Filtrar depois por tag
  "Mostrar só tickets com tag Vendas"
  "Mostrar só Urgentes"
```

**✅ IMPLEMENTADO - Gerenciar Contatos**
```
[Contatos]
┌────┬─────────────────┬───────────┬──────────────────┐
│ ID │ Nome            │ Telefone  │ Últimas Tags     │
├────┼─────────────────┼───────────┼──────────────────┤
│  1 │ Maria Silva     │ (11) 99...│ Vendas           │
│  2 │ João Santos     │ (85) 97...│ Suporte, Urgent  │
│  3 │ Carlos Costa    │ (21) 96...│ Bloqueado        │
└────┴─────────────────┴───────────┴──────────────────┘

Clique em um contato:
→ Vê TODAS as conversas anteriores
→ Vê tags atribuídas
→ Vê última atividade
→ Vê notas deixadas por outros agents
```

**✅ IMPLEMENTADO - Notas Internas**
```
Exemplo de Nota:
┌─────────────────────────────────────┐
│ Nota Interna:                       │
│                                     │
│ "Cliente é VIP. Sempre preferir    │
│  resposta rápida. Email para       │
│  confirmação: maria@empresa.com.br"│
│                                     │
│ Adicionado por: João Silva         │
│ Data: 22/12/2025 14:30             │
└─────────────────────────────────────┘

Benefício: Próximo agent vê a nota
          e consegue melhor contexto
```

**✅ IMPLEMENTADO - Respostas Rápidas**
```
Atalhos Disponíveis:
!ola → "Olá! Bem-vindo! Como posso ajudar?"
!preco → "Nossos preços são..."
!obrigado → "Muito obrigado por contatar!"
!nao_posso → "Infelizmente não posso ajudar com isso"

Como usar:
Escreva: !preco
Pressione: Espaço ou Enter
→ Insere: "Nossos preços são..."
→ Você completa se necessário
→ Envia
```

---

## 📈 GRÁFICO DE IMPLEMENTAÇÃO

```
SUPERADMIN
  Dashboard           ██████████░░░░░░░░░░  70%
  Tenants CRUD        ██████████████████░░  90%
  Usuários            ████████████████░░░░  80%
  Planos              ██████████░░░░░░░░░░  70%
  Billing             ████░░░░░░░░░░░░░░░░  30%
  Relatórios          ██░░░░░░░░░░░░░░░░░░  20%
  Health Check        ░░░░░░░░░░░░░░░░░░░░   0%
  RBAC                ███░░░░░░░░░░░░░░░░░░  15%
─────────────────────────────────────────────────────
ADMIN TENANT
  Dashboard           ██████████████████░░  90%
  Usuários CRUD       ██████████████████░░  90%
  Canais (WA)         ████████████████░░░░  80%
  Filas               ██████████████████░░  90%
  Automações          ████████████░░░░░░░░  70%
  Respostas Rápidas   ██████████████████░░  90%
  Relatórios          ████░░░░░░░░░░░░░░░░  40%
  Integração ERP      ░░░░░░░░░░░░░░░░░░░░   0%
  Campanhas           ██░░░░░░░░░░░░░░░░░░  20%
─────────────────────────────────────────────────────
AGENT
  Receber Tickets     ██████████████████░░  95%
  Responder           ██████████████████░░  95%
  Enviar Imagem       █████████████░░░░░░░  70%
  Enviar Áudio        ███████░░░░░░░░░░░░░  50%
  Tags                ██████████████████░░  95%
  Contatos            ██████████████████░░  95%
  Notas Internas      ██████░░░░░░░░░░░░░░  60%
  Transferir          ██████████████████░░  95%
─────────────────────────────────────────────────────
GERAL                ████████████████░░░░  80%
```

---

## 🎯 MATRIZ DE IMPACTO vs ESFORÇO

```
ESFORÇO ALTO │
             │
             │  • Integração ERP        • Billing Automático
             │    (Importância: ALTA)     (Importância: CRÍTICA)
             │
             │  • Dark Mode             • RBAC em todas rotas
             │    (Importância: BAIXA)    (Importância: CRÍTICA)
             │
             │  • AB Testing            • Health Check
             │    (Importância: MÉDIA)    (Importância: ALTA)
             │
ESFORÇO BAIXO│
             │  • Preview Imagens       • Documentação Swagger
             │    (Importância: BAIXA)    (Importância: ALTA)
             │
             │  • Customização Contatos
             │    (Importância: BAIXA)
             │
             └──────────────────────────────────────────
               IMPACTO BAIXO        IMPACTO ALTO
```

**Recomendação de Priorização:**
1. Impacto ALTO + Esforço BAIXO (Rápido win)
   - Documentação Swagger
   - Preview de imagens
   
2. Impacto CRÍTICO + Esforço MÉDIO (Bloqueadores)
   - RBAC em todas rotas
   - Billing automático
   
3. Impacto ALTO + Esforço MÉDIO
   - Health check
   - Integração ERP (UI)

---

## ✅ CHECKLIST DE FUNCIONALIDADES POR PAPEL

### SuperAdmin
- [x] Login/Logout
- [x] Ver Dashboard global
- [x] Criar/editar/deletar tenants
- [x] Gerenciar superadmins
- [x] Configurar planos básicos
- [x] Ver subscriptions ativas
- [ ] Processar pagamentos
- [ ] Ver relatórios avançados
- [ ] Health check dashboard
- [ ] Alertas de anomalias

### Admin Tenant
- [x] Login/Logout
- [x] Ver Dashboard de atendimento
- [x] CRUD de usuários
- [x] Conectar WhatsApp
- [x] Gerenciar filas
- [x] Criar automações
- [x] Respostas rápidas
- [x] Ver plano atual
- [x] Ver limites de uso
- [ ] Integração ERP
- [ ] AB testing para campanhas
- [ ] Relatórios avançados

### Agent
- [x] Login/Logout
- [x] Receber tickets
- [x] Responder mensagens
- [x] Ver histórico
- [x] Usar tags
- [x] Gerenciar contatos
- [x] Deixar notas
- [x] Usar respostas rápidas
- [x] Transferir tickets
- [x] Resolver tickets
- [ ] Preview de imagens
- [ ] Enviar documentos

---

**Documento atualizado:** 22/12/2025  
**Status:** Pronto para uso como mapa de desenvolvimento  
**Versão:** 1.0
