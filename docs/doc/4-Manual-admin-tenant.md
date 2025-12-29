# 📗 MANUAL DO ADMIN DO TENANT - ZECHAT V2

**Guia Completo de Administração da Conta**

---

## 🎯 Sobre este Manual

Este documento destina-se ao **Admin do Tenant** - a pessoa responsável por gerenciar a conta de sua empresa no ZeChat V2. Você terá acesso a gerenciar usuários, configurar canais de atendimento, filas, planos e monitorar uso de recursos.

### O que o Admin do Tenant pode fazer:
- ✅ Gerenciar usuários da sua empresa (criar, editar, remover)
- ✅ Configurar canais de atendimento (WhatsApp, Instagram, Telegram)
- ✅ Criar e gerenciar filas de atendimento
- ✅ Visualizar dashboard com métricas da sua empresa
- ✅ Monitorar plano atual e uso de recursos
- ✅ Configurar automações e respostas rápidas
- ✅ Criar chatbots
- ✅ Gerar relatórios de atendimento

---

## 🚀 Primeiro Acesso

### Credenciais Iniciais

Você recebeu um email de boas-vindas com:
```
Assunto: Bem-vindo ao ZeChat!
Body: 
  Clique no link abaixo para confirmar sua conta:
  https://app.zechat.com.br/convite/xxxxx
```

### 1️⃣ Confirmar Conta

1. Clique no **link de convite** no email
2. Você será levado a uma tela de "Criar Senha"
3. Defina uma **senha forte** (mínimo 8 caracteres)
4. Clique **"Confirmar"**

### 2️⃣ Fazer Login

1. Acesse **https://app.zechat.com.br**
2. Email: (mesmo do convite)
3. Senha: (que você criou)
4. Clique **"Entrar"**

### 3️⃣ Validar Acesso Admin Tenant

Ao entrar, você deve ver:
```
┌─────────────────────────────────────────┐
│  ZeChat - ADMIN TENANT                  │
│  Empresa: ACME Corp                     │
├─────────────────────────────────────────┤
│                                         │
│  Menu Principal:                        │
│  ├─ 📊 Dashboard                        │
│  ├─ 👥 Usuários                         │
│  ├─ 📱 Canais (WhatsApp, Instagram)     │
│  ├─ 🎯 Filas                            │
│  ├─ 🤖 Automações & Chatbots            │
│  ├─ ⚙️ Configurações                    │
│  ├─ 💰 Plano & Uso                      │
│  └─ 📊 Relatórios                       │
│                                         │
└─────────────────────────────────────────┘
```

Se não vir este menu, **você não tem permissão de Admin**. Contate o SuperAdmin.

---

## 📊 Dashboard Admin Tenant

### Localização
```
Menu Principal → Dashboard
```

### O que você vê?

A tela de Dashboard exibe um resumo de sua empresa:

**1. Status do Plano (Card destacado)**
```
┌─────────────────────────────────────────┐
│ Seu Plano: PROFESSIONAL                 │
│                                         │
│ ✓ Usuários: 8 / 15 (53%)                │
│ ✓ Canais WhatsApp: 3 / 5 (60%)          │
│ ✓ Contatos: 1.200 / 10.000 (12%)        │
│ ✓ Mensagens este mês: 3.450 / 50.000    │
│ ✓ Storage: 1.2 GB / 50 GB               │
│                                         │
│ ⚠️ Atenção: Próximo ao limite de usuários
│                                         │
│ [VISUALIZAR PLANO] [UPGRADE] [RELAT.]   │
└─────────────────────────────────────────┘
```

**2. Métricas de Atendimento (Cards menores)**
```
┌──────────────────┐  ┌──────────────────┐
│ Tickets Abertos  │  │ Tickets Resolvidos│
│       12         │  │      127 (ontem) │
└──────────────────┘  └──────────────────┘

┌──────────────────┐  ┌──────────────────┐
│ Tempo Médio Resp │  │ Satisfação Média │
│    8 minutos     │  │    4.7 / 5 ⭐    │
└──────────────────┘  └──────────────────┘
```

**3. Gráfico de Atividade**
- Tickets por dia (últimos 7 dias)
- Mensagens por dia (últimos 7 dias)
- Taxa de resposta ao longo do tempo

**4. Últimos Eventos**
```
- João respondeu ticket #123
- Nova sessão WhatsApp conectada
- Campanha "BlackFriday" iniciada
- Contato Maria Silva bloqueado
```

---

## 👥 Gerenciar Usuários

### Localização
```
Menu Principal → Usuários (ou Gerenciamento → Usuários)
```

### Visualizar Usuários

Tabela com todos os usuários da sua empresa:

```
┌────┬─────────────────┬──────────────────┬──────────┬──────────────┬────────┐
│ ID │ Nome            │ Email            │ Tipo     │ Filas        │ Ações  │
├────┼─────────────────┼──────────────────┼──────────┼──────────────┼────────┤
│ 1  │ João Silva      │ joao@acme.com    │ Admin    │ Todas        │ ✎ 🗑️  │
│ 2  │ Maria Santos    │ maria@acme.com   │ Agent    │ Vendas       │ ✎ 🗑️  │
│ 3  │ Carlos Oliveira │ carlos@acme.com  │ Agent    │ Suporte      │ ✎ 🗑️  │
│ 4  │ Ana Costa       │ ana@acme.com     │ Supervisor│ Todas       │ ✎ 🗑️  │
└────┴─────────────────┴──────────────────┴──────────┴──────────────┴────────┘

Tipos de Usuários:
- Admin: Acesso total à conta (gerenciar usuários, canais, etc)
- Agent: Operador de atendimento (responder tickets)
- Supervisor: Vê tudo, mas só pode responder tickets (relatórios)
```

### ➕ Criar Novo Usuário

**1. Clicar em "+ Novo Usuário"**

**2. Preencher formulário:**
```
Nome: ______________________
Email: ______________________
Tipo: [Admin ▼]
  ├─ Admin (controle total)
  ├─ Agent (atendimento)
  └─ Supervisor (monitorar)

Filas que pode atender:
☑ Vendas
☑ Suporte
☐ Financeiro

Status: [Ativo ▼]
```

**3. Clique: [CONVIDAR]**

**O que acontece:**
- ✅ Email de convite enviado para o usuário
- ✅ Usuário recebe link para confirmar conta
- ✅ Pode fazer login após confirmar

### 🖊️ Editar Usuário

**1. Clicar no ícone ✎ da linha**

**2. Pode modificar:**
```
Nome: [Maria Santos]
Email: [maria@acme.com]
Tipo: [Agent ▼]
Filas: ☑ Vendas ☑ Suporte
Status: [Ativo ▼]
```

**3. Clique: [SALVAR]**

### 🔄 Resetar Senha de Usuário

**1. Clique em [⋮] Mais Opções → Resetar Senha**

**2. Email é enviado ao usuário com link para criar nova senha**

### 🗑️ Remover Usuário

**1. Clique no ícone 🗑️**

**2. Confirme a remoção**

⚠️ **CUIDADO:** Verifique se há outro Admin antes de remover o único Admin!

---

## 📱 Configurar Canais (Atendimento)

### Localização
```
Menu Principal → Canais (ou Integrações → Canais)
```

### 🟢 Conectar WhatsApp

Este é o canal mais importante! Aqui você conecta seu número de WhatsApp.

#### Passo-a-Passo Completo:

**1. Clicar em "+ Novo Canal" → "WhatsApp"**

**2. Tela de QR Code aparece:**
```
┌─────────────────────────────────────────┐
│ Conectar WhatsApp                       │
│                                         │
│ 1. Abra WhatsApp no seu celular        │
│ 2. Vá em: Mais Opções → Dispositivos   │
│ 3. Clique: Conectar novo dispositivo   │
│ 4. Aponte a câmera para este QR:       │
│                                         │
│    ┌───────────────────────┐           │
│    │                       │           │
│    │  [QR CODE AQUI]       │           │
│    │                       │           │
│    └───────────────────────┘           │
│                                         │
│ ⏱️  Válido por: 1 minuto e 50 segundos │
│ [Gerar novo QR Code]                   │
│                                         │
└─────────────────────────────────────────┘
```

**3. Escanear QR Code no Celular**
- Abra WhatsApp
- Menu ⋮ → Dispositivos Conectados
- Clique "Conectar novo dispositivo"
- Aponte câmera para o QR Code
- WhatsApp sincronizará (30 segundos)

**4. Aguardar Status = "Conectado"**
```
Status passou de "Aguardando" para "✅ Conectado"
```

**5. Configurar Informações Adicionais:**
```
Nome do Canal: "Vendas" ou "Principal"
Fila Padrão: [Vendas ▼]
Status: [Ativo ▼]
```

**6. Pronto!** Seu WhatsApp está conectado!

#### ⚠️ Se Não Conectar?

| Problema | Solução |
|----------|---------|
| QR Code expirou | Espere 2 min, clique "Gerar novo" |
| Não consegue escanear | Ajuste iluminação, limpe câmera |
| Mensagens não chegam | Feche WhatsApp em outros aparelhos |
| Desconecta sozinho | Abra WhatsApp no celular, sincronize |

### 📷 Conectar Instagram

**1. Clicar em "+ Novo Canal" → "Instagram"**

**2. Preencher Token:**
```
Instagram User: [seu_usuario]
Access Token: [cole_aqui]
Token é válido? [Validar Token]
```

**3. Obter Token:**
- Acesse: https://business.facebook.com
- Vá em: Apps → Seu App → Configurações
- Crie um "Instagram Graph API Token"
- Cole o token acima

**4. Validar e Salvar**

### ✈️ Conectar Telegram

**1. Clicar em "+ Novo Canal" → "Telegram"**

**2. Preencher Token:**
```
Bot Token: [cole_aqui]
Bot é válido? [Validar Token]
```

**3. Obter Token:**
- Abra Telegram
- Procure: @BotFather
- Envie: /newbot
- Escolha nome e username
- BotFather envia o token

**4. Validar e Salvar**

### Ver Canais Conectados

```
┌──────────────┬──────────┬──────────┬────────────┐
│ Canal        │ Número   │ Status   │ Ações      │
├──────────────┼──────────┼──────────┼────────────┤
│ WhatsApp     │ (11) 98765-4321 │ ✅ Conectado │ ✎ 🗑️ |
│ Instagram    │ @acme_corp      │ ✅ Conectado │ ✎ 🗑️ |
│ Telegram     │ @ACMEbot        │ ✅ Ativo    │ ✎ 🗑️ |
└──────────────┴──────────┴──────────┴────────────┘
```

---

## 🎯 Configurar Filas

Uma **Fila** é um grupo de trabalho. Exemplo:
- Fila "Vendas" → responde pessoas querendo comprar
- Fila "Suporte" → responde problemas técnicos
- Fila "Financeiro" → responde sobre faturas

### Localização
```
Menu Principal → Filas
```

### ➕ Criar Fila

**1. Clicar em "+ Nova Fila"**

**2. Preencher formulário:**
```
Nome: "Vendas"
Descrição: "Equipe de vendas"
Cor: [Cor laranja]
Status: [Ativo ▼]
```

**3. Adicionar Integrantes:**
```
Selecione usuários que trabalham nesta fila:
☑ João Silva
☑ Maria Santos
☐ Carlos Oliveira (depois adiciona)
```

**4. Horário de Funcionamento (Opcional):**
```
Dias: Segunda a Sexta
Abertura: [08:00]
Fechamento: [18:00]

Mensagem Fora do Horário:
"Estamos fechados. Retornaremos assim que possível."
```

**5. Clique: [CRIAR FILA]**

### 🖊️ Editar Fila

**1. Clicar no ícone ✎**

**2. Modificar Nome, Descrição, Integrantes, Horário**

**3. Salvar**

### 🗑️ Deletar Fila

**1. Clicar em [⋮] → Deletar**

⚠️ **CUIDADO:** Todos os tickets desta fila serão reassignados

---

## 🤖 Automações & Chatbots

### Localização
```
Menu Principal → Automações (ou Configurações → Automações)
```

### Criar Resposta Rápida

**Resposta rápida** = atalho para mensagens que você usa bastante

**1. Clicar em "+ Nova Resposta Rápida"**

**2. Preencher:**
```
Atalho: [!ola] (quando digitado, expande para a mensagem)
Mensagem: "Olá! Bem-vindo à nossa loja. Como posso ajudar?"
Ativo: [Sim ▼]
```

**3. Salvar**

**Uso no Atendimento:**
```
Digite: !ola
Mensagem é expandida automaticamente
Você pode editar antes de enviar
```

### Criar ChatBot (Fluxo de Respostas Automáticas)

**ChatBot** = respostas automáticas inteligentes

**1. Clicar em "+ Novo ChatBot"**

**2. Configurar Mensagem Inicial:**
```
Título: "ChatBot Vendas"
Primeira Mensagem:
  "Olá! Bem-vindo! Como posso ajudar?
   
   Escolha uma opção:
   [1] Ver Produtos
   [2] Fazer Pedido
   [3] Falar com Pessoa"
```

**3. Configurar Caminhos:**

Quando cliente clica **[1] Ver Produtos**:
```
Resposta: "Temos 3 produtos:"
Opções:
  [A] Produto 1 - R$ 99
  [B] Produto 2 - R$ 149
  [C] Voltar
```

Quando cliente clica **[3] Falar com Pessoa**:
```
Resposta: "Ok, te conectando..."
↓
Ticket é criado na Fila "Vendas"
↓
Próximo agente disponível responde
```

---

## ⚙️ Configurações da Conta

### Localização
```
Menu Principal → Configurações
```

### Opções Principais

**1. Perfil da Empresa**
```
Nome: ACME Corp
CNPJ: 12.345.678/0001-99
Email: contato@acme.com
Telefone: (11) 98765-4321
```

**2. Logo & Branding**
```
Logo: [Upload Logo]
Cores Padrão: [#FF6B00]
```

**3. Integrações**
```
☑ Evolution API
☑ OpenAI (para respostas com IA)
☑ ERP Integration (se seu plano tiver)
```

**4. Notificações**
```
Email de Novos Tickets: [sim@empresa.com]
Alertas de Limite de Uso: [Ativar]
```

---

## 💰 Plano & Uso

### Localização
```
Menu Principal → Plano & Uso (ou Billing)
```

### Visualizar Plano Atual

```
┌─────────────────────────────────────────┐
│ Seu Plano: PROFESSIONAL                 │
│ Preço: R$ 999,00 / mês                  │
│ Próximo Vencimento: 15/01/2026          │
│                                         │
│ ┌─ LIMITES ATUAIS ─────────────────────┐│
│ │ Usuários: 8 / 15 (53%) 🟢             ││
│ │ Canais: 3 / 5 (60%) 🟢               ││
│ │ Contatos: 1.200 / 10.000 (12%) 🟢    ││
│ │ Mensagens: 3.450 / 50.000 (7%) 🟢    ││
│ │ Storage: 1.2 GB / 50 GB (2%) 🟢      ││
│ │                                       ││
│ │ 🟡 Atenção: Próximo ao limite de usuarios
│ └───────────────────────────────────────┘│
│                                         │
│ [UPGRADE PLANO] [VER FATURA]            │
│                                         │
└─────────────────────────────────────────┘
```

### Mudar Plano (Upgrade/Downgrade)

**1. Clicar em [UPGRADE PLANO]**

**2. Escolher novo plano:**
```
STARTER → PROFESSIONAL → ENTERPRISE
```

**3. Confirmar mudança**

**O que acontece:**
- ✅ Se upgrade: Novos limites entram em efeito imediatamente
- ✅ Fatura é ajustada (pro-rata)
- ✅ Email de confirmação é enviado

### Ver Faturas

**1. Clicar em [VER FATURA]**

**2. Lista de todas as faturas:**
```
┌─────────┬──────────────┬─────────┬────────┐
│ Período │ Plano        │ Valor   │ Status │
├─────────┼──────────────┼─────────┼────────┤
│ Dez/25  │ Professional │ R$ 999  │ Pago   │
│ Nov/25  │ Professional │ R$ 999  │ Pago   │
│ Out/25  │ Starter      │ R$ 299  │ Pago   │
└─────────┴──────────────┴─────────┴────────┘
```

**3. Download PDF da fatura**

---

## 📊 Relatórios

### Localização
```
Menu Principal → Relatórios
```

### Relatórios Disponíveis

**1. Relatório Geral de Atendimento**
- Total de tickets abertos/fechados
- Tempo médio de resposta
- Taxa de resolução
- Satisfação dos clientes

**2. Relatório por Fila**
- Tickets por fila
- Agentes mais produtivos
- Tempo médio por fila

**3. Relatório por Agente**
- Quantos tickets cada agente respondeu
- Tempo médio de resposta
- Satisfação dos clientes

**4. Relatório de Contatos**
- Total de contatos
- Por tag/etiqueta
- Por estado (ativo, bloqueado, etc)

---

## ⚠️ Troubleshooting

### Problema: Usuário não consegue fazer login

**Verificar:**
1. Usuário confirmou o email de convite?
2. Usuário resetou a senha?
3. Qual é o erro exato?
4. Contate suporte se problema persistir

### Problema: WhatsApp desconectou

**Solução:**
1. Abra WhatsApp no celular
2. Vá em: Mais Opções → Dispositivos Conectados
3. Reconecte o dispositivo (escanear QR novamente)
4. Se ainda não funcionar, desconecte e reconecte

### Problema: Não consigo enviar mensagem

**Verificar:**
1. Canal está conectado? (Status = "Conectado")
2. WhatsApp está aberto no celular?
3. Contato está com número válido?
4. Você tem permissão nesta fila?

### Problema: Próximo ao limite de usuários

**Opções:**
1. Remover usuários que não usam mais
2. Fazer upgrade para plano superior
3. Contate suporte para discussão de limites

---

## 📞 Suporte

**Equipe ZeChat:**
- Email: suporte@zechat.com.br
- WhatsApp: (11) 98765-4321
- Chat: clique no ícone 💬 (canto inferior direito)

---

**Última atualização:** 22/12/2025  
**Versão:** 2.0  
**Status:** Documento em produção
