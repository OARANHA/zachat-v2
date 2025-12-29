# 📕 MANUAL DO USUÁRIO (AGENT) - ZECHAT V2

**Guia de Atendimento e Operação Diária**

---

## 🎯 Sobre este Manual

Este documento destina-se ao **Usuário/Agent** (operador de atendimento) - a pessoa que responde tickets e conversa com clientes no ZeChat V2.

### O que o Agent pode fazer:
- ✅ Receber e responder tickets/conversas
- ✅ Enviar mensagens de texto, imagem e áudio
- ✅ Gerenciar contatos
- ✅ Usar tags (etiquetas) para organizar conversa
- ✅ Deixar notas internas
- ✅ Usar respostas rápidas pré-configuradas
- ✅ Ver histórico de conversa
- ✅ Transferir ticket para outro agente

### O que o Agent NÃO pode fazer:
- ❌ Gerenciar usuários
- ❌ Configurar canais
- ❌ Alterar plano
- ❌ Ver relatórios globais
- ❌ Criar filas

---

## 🚀 Primeiro Acesso

### Credenciais

Você recebeu um email com:
```
Assunto: Bem-vindo ao ZeChat!
Body:
  Clique para confirmar sua conta:
  https://app.zechat.com.br/convite/xxxxx
```

### 1️⃣ Confirmar Conta

1. Clique no **link do email**
2. Crie sua **senha** (mínimo 8 caracteres)
3. Clique **"Confirmar"**

### 2️⃣ Fazer Login

1. Acesse **https://app.zechat.com.br**
2. Email + Senha que você criou
3. Clique **"Entrar"**

### 3️⃣ Interface Inicial

Você verá:
```
┌─────────────────────────────────────────┐
│  ZeChat - AGENT                         │
│  Empresa: ACME Corp                     │
├─────────────────────────────────────────┤
│                                         │
│  Menu Principal:                        │
│  ├─ 📊 Dashboard                        │
│  ├─ 🎫 Atendimento (Tickets)            │
│  ├─ 👥 Contatos                         │
│  ├─ ⚙️ Minhas Configurações             │
│                                         │
└─────────────────────────────────────────┘
```

---

## 📊 Dashboard

### Localização
```
Menu → Dashboard
```

### O que você vê?

**Resumo Rápido:**
```
┌──────────────────┐  ┌──────────────────┐
│ Tickets Abertos  │  │ Tickets Resolvidos│
│       5          │  │    (hoje) 12     │
└──────────────────┘  └──────────────────┘

┌──────────────────┐  ┌──────────────────┐
│ Tempo Médio Resp │  │ Satisfação Média │
│   8 min 30 seg   │  │  4.7 / 5 ⭐     │
└──────────────────┘  └──────────────────┘
```

**Seus Tickets:**
- Abertos: 5 (urgentes e normais)
- Aguardando resposta do cliente: 3
- Resolvidos hoje: 12

---

## 🎫 Atender Tickets (Sua Função Principal)

### Localização
```
Menu → Atendimento (ou Tickets)
```

### Visualizar Lista de Tickets

Tela principal mostra todos seus tickets:

```
┌────┬──────────────┬──────────┬─────────┬─────────────┐
│    │ Cliente      │ Último   │ Status  │ Ações       │
├────┼──────────────┼──────────┼─────────┼─────────────┤
│ 🔴 │ Maria Silva  │ 5 min    │ Novo    │ [Clique]    │
│    │ "Quero info" │          │         │             │
├────┼──────────────┼──────────┼─────────┼─────────────┤
│ 🟡 │ João Santos  │ 30 min   │ Aberto  │ [Clique]    │
│    │ "Qual o preço│          │         │             │
├────┼──────────────┼──────────┼─────────┼─────────────┤
│ ⚪  │ Carlos Costa │ 2h       │ Aguard  │ [Clique]    │
│    │ "Recebi!..."│          │         │             │
└────┴──────────────┴──────────┴─────────┴─────────────┘

Filtros:
🔴 Novo (vermelho = urgente)
🟡 Aberto (laranja = esperando você responder)
⚪  Aguardando Cliente (branco = cliente não respondeu)
```

### 👉 Abrir um Ticket

**Clicar na linha do ticket**

Você verá a conversa completa:

```
┌─────────────────────────────────────────┐
│ MARIA SILVA                             │
│ (11) 99999-8888                         │
│ Contato desde: 15/12/2025               │
├─────────────────────────────────────────┤
│                                         │
│ Maria: Olá! Quero saber o preço        │
│ [14:30]                                 │
│                                         │
│ Você: Oi Maria! Bem-vindo! 😊           │
│       Qual produto te interessa?         │
│ [14:32]                                 │
│                                         │
│ Maria: O plano Professional             │
│ [14:35]                                 │
│                                         │
│ (cursor aqui - você está digitando)     │
│ Você: Ótimo! O Professional...          │
│                                         │
├─────────────────────────────────────────┤
│ [Documentos] [Imagens] [Voz]            │
│                                         │
│ Escreva sua mensagem... [Enviar]       │
│                                         │
│ 🏷️ Tags: [Vendas] [Urgente]            │
│ Nota: [Clique para adicionar]           │
│ Status: [Aberto ▼]                      │
│                                         │
│ [Resolver] [Transferir] [Bloquear]      │
│                                         │
└─────────────────────────────────────────┘
```

### ✍️ Responder Mensagem

**1. Clique na caixa "Escreva sua mensagem..."**

**2. Digite a resposta:**
```
"Ótimo! O plano Professional custa R$ 999/mês
Inclui 15 usuários, 5 canais WhatsApp, etc.
Quer conhecer mais detalhes?"
```

**3. Opções antes de enviar:**

**- Usar Resposta Rápida:**
```
Clique em: [!] Respostas Rápidas
Veja atalhos como:
  !ola → "Olá! Bem-vindo!"
  !preco → "Nossos preços são..."
  !obrigado → "Obrigado por contato!"

Clique em uma e a mensagem é inserida
```

**- Adicionar Imagem/Arquivo:**
```
Clique em: [📷 Imagens]
Selecione uma imagem do computador
Clique "Enviar"
```

**- Adicionar Áudio:**
```
Clique em: [🎤 Voz]
Clique "Gravar"
Fale sua mensagem
Clique "Parar"
Confirme envio
```

**4. Clique: [Enviar]** ou pressione Ctrl+Enter

### 🏷️ Adicionar Tags (Etiquetas)

Tags ajudam a organizar conversas:

```
🏷️ Tags: [Vendas] [Urgente] [Produto A] [Bloqueado]

Exemplo de tags:
- Vendas: cliente quer comprar
- Suporte: problema técnico
- Urgente: responder rápido
- Faturamento: dúvida de boleto
- Bloqueado: cliente indesejado
```

**Adicionar tag:**
1. Clique na área de tags
2. Comece a digitar nome da tag
3. Selecione uma existente ou crie nova
4. Clique ✓ para confirmar

### 📝 Deixar Nota Interna

Notas internas só você e outros agentes veem. Cliente não vê!

```
Nota: [Clique para adicionar]
```

**Exemplo de nota:**
```
"Cliente voltou a ligar após 2 semanas. Parece
decidido agora. Enviei proposta detalhada."
```

### 🎫 Resolver Ticket

Quando conversa terminou:

**Clique em: [Resolver]**

A conversa será arquivada e removida de sua lista "Abertos".

O cliente poderá reabrir se precisar.

### 🔄 Transferir para Outro Agente

Se o cliente precisa de outro agente:

**Clique em: [Transferir]**

```
Selecione agente:
☐ João Silva (Vendas)
☑ Carlos Costa (Suporte)
☐ Ana Oliveira (Financeiro)
```

O ticket vai para a fila do agente selecionado.

### 🚫 Bloquear Cliente

Se cliente é spam ou abusivo:

**Clique em: [⋮ Mais Opções] → [Bloquear]**

Cliente não conseguirá mais enviar mensagens.

---

## 👥 Gerenciar Contatos

### Localização
```
Menu → Contatos
```

### Visualizar Contatos

Lista de todos os clientes que já conversaram:

```
┌────┬─────────────────┬───────────┬──────────────┐
│    │ Nome            │ Telefone  │ Últimas Tags │
├────┼─────────────────┼───────────┼──────────────┤
│ ✓  │ Maria Silva     │ (11) 99... │ Vendas       │
│    │ Maria Silva     │ (11) 98... │ Suporte      │
│    │ Carlos Costa    │ (85) 97... │ Urgente      │
└────┴─────────────────┴───────────┴──────────────┘

Busca: [Procure por nome ou telefone]
```

### Ver Histórico de Contato

**Clique no contato**

Você vê:
- Todas as conversas anteriores
- Histórico de tags
- Última atividade
- Notas deixadas por outros agentes

### Adicionar Nota no Contato

```
Notas do Contato:
"Cliente importante. Sempre pediu atendimento rápido.
Prefer ência de horário: 9h-11h. Email: maria@..."
```

---

## ⚙️ Minhas Configurações

### Localização
```
Menu → Minhas Configurações (ou Perfil)
```

### Opções Disponíveis

**1. Trocar Senha**
```
Senha Atual: [••••••••]
Senha Nova: [••••••••]
Confirmar: [••••••••]
[Salvar]
```

**2. Notificações**
```
☑ Notificar por email novos tickets
☑ Som ao receber mensagem
☑ Notificação no navegador
```

**3. Suas Filas**
```
Você atende as filas:
✓ Vendas
✓ Suporte Técnico
(Admin definiu suas filas)
```

---

## ⚡ Dicas de Uso

### 💡 Use Respostas Rápidas

Se você tem frases que usa bastante, peça ao Admin para criar respostas rápidas com atalhos:

```
!ola → "Olá! Bem-vindo! Como posso ajudar?"
!preco → "Consultamos nossos planos..."
!obrigado → "Muito obrigado por contato!"
```

### 💡 Organize com Tags

Use tags para encontrar tickets depois:
- #Vendas - cliente quer comprar
- #Suporte - tem problema
- #Urgente - responder já
- #Bloqueado - cliente spam

### 💡 Deixe Notas para o Time

Próximo agente a pegar o ticket verá suas notas:
```
"Cliente é muito importante. Já é cliente há 3 anos.
Sempre responder com cortesia. Oferecer desconto
se necessário para manter satisfação."
```

### 💡 Responda Rápido

Clientes apreciam rapidez:
- Responder em < 2 minutos: ⭐⭐⭐⭐⭐
- Responder em < 5 minutos: ⭐⭐⭐⭐
- Responder em < 1 hora: ⭐⭐⭐

---

## ⚠️ Troubleshooting

### Problema: Não consigo enviar mensagem

**Verificar:**
1. Você digitou algo na caixa?
2. Canal (WhatsApp) está conectado?
3. Cliente não foi bloqueado?
4. Se problema persiste, contate seu Admin

### Problema: Mensagem é muito longa

**Limite:** Máximo 4.096 caracteres

**Solução:** Dividir em 2-3 mensagens menores

### Problema: Não consigo adicionar imagem

**Verificar:**
1. Tamanho da imagem: menor que 25 MB?
2. Formato: JPG, PNG, GIF?
3. Conexão internet está ok?

### Problema: Ticket não aparece na minha lista

**Possíveis motivos:**
1. Ticket foi resolvido
2. Ticket foi transferido
3. Você não tem permissão nesta fila
4. Filtro está ativado (mudar filtro)

---

## 📞 Suporte

Se você tiver problema:

1. **Chat:** Clique no ícone 💬 (canto inferior)
2. **Email:** suporte@zechat.com.br
3. **Contate seu Admin:** Pode ter solução rápida

---

**Última atualização:** 22/12/2025  
**Versão:** 2.0  
**Status:** Documento em produção
