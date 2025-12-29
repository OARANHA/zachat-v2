# Blueprint: Integração Evolution API no Zechat
## Documentação Completa e Robusta

**Versão:** 2.3.6  
**Última atualização:** Dezembro 2025  
**Status:** Pronto para Produção  
**Autor:** Agente de IA para Zechat  

---

## Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura da Solução](#arquitetura-da-solução)
3. [Pré-requisitos e Instalação](#pré-requisitos-e-instalação)
4. [Configuração Inicial](#configuração-inicial)
5. [Autenticação e Segurança](#autenticação-e-segurança)
6. [Gerenciamento de Instâncias](#gerenciamento-de-instâncias)
7. [APIs de Mensagens](#apis-de-mensagens)
8. [APIs de Chat e Contatos](#apis-de-chat-e-contatos)
9. [APIs de Grupos](#apis-de-grupos)
10. [Webhooks e Eventos](#webhooks-e-eventos)
11. [Integrações Avançadas](#integrações-avançadas)
12. [Implementação no Zechat](#implementação-no-zechat)
13. [Tratamento de Erros](#tratamento-de-erros)
14. [Performance e Otimização](#performance-e-otimização)
15. [Monitoramento e Logging](#monitoramento-e-logging)
16. [Checklist de Produção](#checklist-de-produção)
17. [Troubleshooting](#troubleshooting)

---

## Visão Geral

### O que é Evolution API?

Evolution API é uma plataforma open-source de integração com WhatsApp que permite:

- **Automação de mensagens**: Enviar e receber mensagens programaticamente
- **Integração multi-canal**: Suporte a WhatsApp Baileys e Cloud API
- **Webhooks em tempo real**: Eventos imediatos de mensagens e conexões
- **Gerenciamento de instâncias**: Controlar múltiplas contas WhatsApp
- **Recursos avançados**: Bots, integrações com IA, grupos, etc.

### Casos de Uso no Zechat

1. **Atendimento ao cliente**: Ticket system integrado com WhatsApp
2. **Notificações automáticas**: Envio de alertas e confirmações
3. **Chatbots inteligentes**: Respostas automáticas com IA
4. **CRM integrado**: Sincronização de contatos e histórico
5. **Broadcast**: Envio em massa para múltiplos contatos
6. **Gestão de grupos**: Controle de grupos WhatsApp

### Vantagens

✅ **Open Source**: Código aberto e sem dependências comerciais  
✅ **Gratuito**: Sem custos de licença ou subscrição  
✅ **Escalável**: Suporta múltiplas instâncias simultâneas  
✅ **Seguro**: Autenticação via API keys criptografadas  
✅ **Flexible**: Múltiplos tipos de integrações  
✅ **Real-time**: Webhooks instantâneos de eventos  

---

## Arquitetura da Solução

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────┐
│                     ZECHAT SYSTEM                        │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────┐         ┌──────────────────┐       │
│  │   API Gateway    │         │  Webhook Handler │       │
│  │  (Express.js)    │         │  (WebSocket)     │       │
│  └────────┬─────────┘         └────────┬─────────┘       │
│           │                           │                  │
│  ┌────────▼─────────────────────────▼─────────┐         │
│  │    Evolution Service Layer                 │         │
│  │  (Controllers, Services, Handlers)         │         │
│  └────────┬──────────────────────────┬────────┘         │
│           │                          │                  │
│  ┌────────▼─────────────┐  ┌────────▼──────────┐       │
│  │  Message Queue       │  │   Cache Layer     │       │
│  │  (Bull + Redis)      │  │   (Redis)         │       │
│  └────────┬─────────────┘  └────────┬──────────┘       │
│           │                          │                  │
│  ┌────────▼──────────────────────────▼─────────┐       │
│  │         Database Layer (PostgreSQL)         │       │
│  │  - Instances, Messages, Contacts, Chats     │       │
│  └──────────────────────────────────────────────┘       │
│                                                           │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│           EVOLUTION API (Docker Container)              │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────┐  ┌──────────────────────┐         │
│  │  Instance Manager│  │   WhatsApp Handlers  │         │
│  │                  │  │  - Baileys           │         │
│  └──────────────────┘  │  - Cloud API         │         │
│                        └──────────────────────┘         │
│  ┌──────────────────┐  ┌──────────────────────┐         │
│  │  Message Router  │  │  Event Broadcaster   │         │
│  └──────────────────┘  └──────────────────────┘         │
│                                                           │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
                 ┌──────────────────┐
                 │  WhatsApp Server │
                 └──────────────────┘
```

### Fluxo de Mensagens Recebidas

```
WhatsApp Message
       │
       ▼
Evolution API detects
       │
       ▼
Webhook sent to Zechat
       │
       ├─▶ WebSocket notificação cliente
       │
       ├─▶ Queue para processamento
       │
       ├─▶ Database insert
       │
       └─▶ Trigger automações
              ├─ Respostas automáticas
              ├─ Notificações
              └─ Integrações IA
```

### Stack Tecnológico Recomendado

```
Frontend:
  - Vue.js 3 / Quasar Framework
  - WebSocket para real-time
  - Notificações via HTML5

Backend:
  - Node.js + Express.js
  - TypeScript para type-safety
  - Prisma ORM para banco

Infraestrutura:
  - Docker + Docker Compose
  - PostgreSQL 14+
  - Redis 7+ para cache/queue
  - Evolution API 2.3.6+

Message Queue:
  - Bull (biblioteca Node.js)
  - Redis backend

Monitoring:
  - Prometheus + Grafana
  - Winston para logs
  - Sentry para error tracking
```

---

## Pré-requisitos e Instalação

### Requisitos de Sistema

**Mínimo:**
- CPU: 2 cores
- RAM: 4GB
- Disco: 20GB
- SO: Linux (Ubuntu 20.04+), Windows (WSL2), macOS

**Recomendado para Produção:**
- CPU: 4+ cores
- RAM: 8GB+
- Disco: 50GB SSD
- SO: Linux (Ubuntu 22.04 LTS)

### Dependências Obrigatórias

1. **Docker** (v20.10+)
   ```bash
   # Ubuntu/Debian
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   
   # Adicionar usuário ao grupo docker
   sudo usermod -aG docker $USER
   ```

2. **Docker Compose** (v2.0+)
   ```bash
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

3. **Node.js** (v18+ para desenvolvimento local)
   ```bash
   curl https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
   nvm install 18
   nvm use 18
   ```

4. **Git**
   ```bash
   sudo apt-get install git
   ```

### Instalação da Evolution API

#### Opção 1: Docker (Recomendado)

**1. Criar arquivo `.env`**

```env
# Evolution API
NODE_ENV=production
AUTHENTICATION_API_KEY=sua-chave-api-super-segura-123456789

# Database PostgreSQL
DATABASE_TYPE=postgres
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=evolution
DATABASE_PASSWORD=super-senha-forte-pg
DATABASE_NAME=evolution_db
DATABASE_SSL=true

# Redis Cache
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=super-senha-forte-redis
REDIS_DB=0

# Server
SERVER_TYPE=http
SERVER_PORT=8080
SERVER_PATH=/

# Webhook
WEBHOOK_GLOBAL_URL=https://seu-zechat.com/api/evolution/webhook
WEBHOOK_GLOBAL_WEBHOOK_BY_EVENTS=false
WEBHOOK_GLOBAL_WEBHOOK_BASE64=false

# Logging
LOG_LEVEL=debug
LOG_BAILEYS=off

# S3 Storage (opcional)
S3_ENABLED=false
S3_ACCESS_KEY=
S3_SECRET_KEY=
S3_BUCKET=evolution
S3_ENDPOINT=s3.amazonaws.com
S3_PORT=443
S3_USE_SSL=true

# Proxy (opcional)
USE_PROXY=false
PROXY_HOST=
PROXY_PORT=

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX_REQUESTS_PER_MINUTE=60

# Kafka (opcional)
KAFKA_ENABLED=false
KAFKA_HOST=kafka
KAFKA_PORT=9092
```

**2. Criar `docker-compose.yml`**

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: evolution_postgres
    environment:
      POSTGRES_USER: evolution
      POSTGRES_PASSWORD: super-senha-forte-pg
      POSTGRES_DB: evolution_db
      POSTGRES_INITDB_ARGS: "--encoding=UTF8 --locale=en_US.UTF-8"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U evolution"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - evolution_network
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: evolution_redis
    command: redis-server --requirepass super-senha-forte-redis --maxmemory 2gb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - evolution_network
    restart: unless-stopped

  evolution-api:
    image: atendai/evolution-api:latest
    container_name: evolution_api
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      NODE_ENV: production
      AUTHENTICATION_API_KEY: ${AUTHENTICATION_API_KEY}
      DATABASE_TYPE: postgres
      DATABASE_HOST: postgres
      DATABASE_PORT: 5432
      DATABASE_USER: evolution
      DATABASE_PASSWORD: super-senha-forte-pg
      DATABASE_NAME: evolution_db
      DATABASE_SSL: 'true'
      REDIS_HOST: redis
      REDIS_PORT: 6379
      REDIS_PASSWORD: super-senha-forte-redis
      SERVER_TYPE: http
      SERVER_PORT: 8080
      SERVER_PATH: /
      WEBHOOK_GLOBAL_URL: ${WEBHOOK_GLOBAL_URL}
      WEBHOOK_GLOBAL_WEBHOOK_BY_EVENTS: 'false'
      WEBHOOK_GLOBAL_WEBHOOK_BASE64: 'false'
      LOG_LEVEL: debug
      RATE_LIMIT_ENABLED: 'true'
      RATE_LIMIT_MAX_REQUESTS_PER_MINUTE: '60'
    ports:
      - "8080:8080"
    volumes:
      - evolution_data:/home/evolution/instances
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - evolution_network

  # Traefik Reverse Proxy (opcional, para produção)
  traefik:
    image: traefik:v2.10
    container_name: evolution_traefik
    command:
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
    ports:
      - "80:80"
      - "443:443"
      - "8081:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    networks:
      - evolution_network
    restart: unless-stopped

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  evolution_data:
    driver: local

networks:
  evolution_network:
    driver: bridge
```

**3. Executar stack**

```bash
# Criar diretório de configuração
mkdir -p evolution-api
cd evolution-api

# Copiar arquivos .env e docker-compose.yml
# (copiar conteúdos acima para seus respectivos arquivos)

# Iniciar containers
docker-compose up -d

# Verificar logs
docker-compose logs -f evolution-api

# Acessar a API
curl http://localhost:8080

# Resposta esperada:
# {
#   "status": 200,
#   "message": "Welcome to the Evolution API, it is working!",
#   "version": "2.3.6",
#   "swagger": "http://localhost:8080/docs",
#   "manager": "http://localhost:8080/manager"
# }
```

#### Opção 2: Instalação Manual em Desenvolvimento

```bash
# 1. Clonar repositório
git clone https://github.com/EvolutionAPI/evolution-api.git
cd evolution-api

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# 4. Executar migrations do banco
npm run prisma:migrate

# 5. Iniciar servidor
npm run dev
```

---

## Configuração Inicial

### Primeiro Acesso

**1. Acessar Manager Web**

```
URL: http://localhost:8080/manager
```

**2. Login Inicial**

- Use a `AUTHENTICATION_API_KEY` definida no `.env`
- Exemplo: `sua-chave-api-super-segura-123456789`

**3. Criar Primeira Instância**

```bash
# Via API
curl -X POST http://localhost:8080/instance/create \
  -H "Content-Type: application/json" \
  -H "apikey: sua-chave-api-super-segura-123456789" \
  -d '{
    "instanceName": "zechat-principal",
    "qrcode": true,
    "integration": "WHATSAPP-BAILEYS"
  }'

# Resposta esperada:
# {
#   "instance": {
#     "instanceName": "zechat-principal",
#     "integration": "WHATSAPP-BAILEYS",
#     "status": "connecting",
#     "qrcode": {
#       "base64": "iVBORw0KGgoAAAANS..."
#     }
#   }
# }
```

**4. Obter QR Code**

```bash
curl -X GET http://localhost:8080/instance/qrcode/zechat-principal \
  -H "apikey: sua-chave-api-super-segura-123456789"
```

**5. Escanear QR Code**

- Abra WhatsApp no seu celular
- Vá em **Configurações > Dispositivos Conectados > Conectar um dispositivo**
- Aponte câmera para o QR Code exibido

### Validar Conexão

```bash
# Verificar status da conexão
curl -X GET http://localhost:8080/instance/connectionState/zechat-principal \
  -H "apikey: sua-chave-api-super-segura-123456789"

# Resposta esperada quando conectado:
# {
#   "instance": {
#     "instanceName": "zechat-principal",
#     "state": "open",
#     "statusReason": 200
#   }
# }
```

### Configurar Webhook

```bash
curl -X POST http://localhost:8080/webhook/set/zechat-principal \
  -H "Content-Type: application/json" \
  -H "apikey: sua-chave-api-super-segura-123456789" \
  -d '{
    "url": "https://seu-zechat.com/api/evolution/webhook",
    "webhook_by_events": false,
    "webhook_base64": false,
    "events": [
      "messages.upsert",
      "messages.update",
      "connection.update",
      "qr.updated",
      "presence.update",
      "chats.upsert",
      "contacts.upsert",
      "groups.upsert"
    ]
  }'
```

---

## Autenticação e Segurança

### Estratégia de Autenticação

#### 1. API Key Global

```bash
# Usada para operações administrativas
AUTHENTICATION_API_KEY=sua-chave-super-segura

# Header em todas as requisições
-H "apikey: sua-chave-super-segura"
```

#### 2. API Key por Instância

Cada instância pode ter sua própria chave (gerada automaticamente):

```bash
# Obter chave da instância
curl -X GET http://localhost:8080/instance/fetchInstances \
  -H "apikey: AUTHENTICATION_API_KEY"

# Resposta inclui instanceApiKey para cada instância
```

### Boas Práticas de Segurança

#### 1. Rotação de Chaves

```bash
# Implementar rotação a cada 90 dias
# Manter histórico de chaves antigas
# Usar Vault para gerenciar secrets

# Exemplo com HashiCorp Vault:
vault kv put secret/evolution/keys \
  api_key="nova-chave" \
  rotation_date="2025-01-28" \
  old_key="chave-anterior"
```

#### 2. Criptografia em Repouso

```env
# Usar criptografia de dados no banco
DATABASE_ENCRYPTION_ENABLED=true
DATABASE_ENCRYPTION_KEY=chave-criptografia-32-caracteres

# Exemplo com libsodium
npm install libsodium.js
```

#### 3. HTTPS/TLS Obrigatório

```yaml
# docker-compose.yml
traefik:
  command:
    - "--entrypoints.websecure.address=:443"
    - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
    - "--certificatesresolvers.letsencrypt.acme.email=admin@seu-dominio.com"
    - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
```

#### 4. Validação de Webhooks

```typescript
// Validar origem do webhook
import crypto from 'crypto';

function validateWebhook(payload: string, signature: string, secret: string): boolean {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
}

// Implementar no handler
app.post('/webhook/evolution', (req, res) => {
  const signature = req.headers['x-webhook-signature'] as string;
  const payload = JSON.stringify(req.body);
  
  if (!validateWebhook(payload, signature, process.env.WEBHOOK_SECRET!)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Processar webhook
});
```

#### 5. Rate Limiting

```typescript
// Implementar rate limiting por IP e por API key
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 100, // 100 requisições por minuto
  keyGenerator: (req) => {
    return req.headers['apikey'] || req.ip;
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests',
      retryAfter: req.rateLimit.resetTime
    });
  }
});

app.use('/api/', limiter);
```

#### 6. Validação de Input

```typescript
// Validar e sanitizar inputs
import { body, validationResult } from 'express-validator';

const validatePhoneNumber = body('number')
  .matches(/^\d{10,15}$/)
  .trim()
  .escape();

const validateMessage = body('text')
  .isLength({ min: 1, max: 4096 })
  .trim()
  .escape();

app.post('/message/send', 
  validatePhoneNumber,
  validateMessage,
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Processar mensagem
  }
);
```

---

## Gerenciamento de Instâncias

### Tipos de Instância

#### 1. WhatsApp Baileys (Web Connection)

```bash
# Criar instância Baileys
curl -X POST http://localhost:8080/instance/create \
  -H "Content-Type: application/json" \
  -H "apikey: AUTHENTICATION_API_KEY" \
  -d '{
    "instanceName": "minha-instancia",
    "qrcode": true,
    "integration": "WHATSAPP-BAILEYS",
    "settings": {
      "rejectCall": true,
      "msgCall": "Desculpe, não posso atender chamadas",
      "groupsIgnore": false,
      "alwaysOnline": true,
      "readMessages": true,
      "readStatus": true
    }
  }'
```

**Vantagens:**
- ✅ Sem aprovação da Meta
- ✅ Sem custos
- ✅ Fácil setup

**Desvantagens:**
- ❌ Sujeito a bloqueios
- ❌ Não ideal para alto volume
- ❌ Requer renovação periódica

#### 2. WhatsApp Cloud API (Business)

```bash
# Criar instância Cloud API
curl -X POST http://localhost:8080/instance/create \
  -H "Content-Type: application/json" \
  -H "apikey: AUTHENTICATION_API_KEY" \
  -d '{
    "instanceName": "negocio-principal",
    "qrcode": false,
    "integration": "WHATSAPP-BUSINESS",
    "token": "EAAZ1zs2R7ygBO...",
    "number": "120123456789",
    "businessId": "123456789"
  }'
```

**Vantagens:**
- ✅ Oficialmente suportado pela Meta
- ✅ Maior confiabilidade
- ✅ Suporte a templates
- ✅ Ideal para produção

**Desvantagens:**
- ❌ Requer aprovação da Meta
- ❌ Custos por mensagem
- ❌ Setup mais complexo

### Operações de Instância

#### Listar todas as instâncias

```bash
curl -X GET http://localhost:8080/instance/fetchInstances \
  -H "apikey: AUTHENTICATION_API_KEY" \
  -H "Content-Type: application/json"

# Resposta:
# {
#   "instances": [
#     {
#       "instanceName": "zechat-principal",
#       "integration": "WHATSAPP-BAILEYS",
#       "status": "open",
#       "state": "connected",
#       "profileName": "João Silva",
#       "profilePictureUrl": "https://...",
#       "number": "5511987654321",
#       "instanceApiKey": "chave-instancia-unica",
#       "createdAt": "2025-01-15T10:30:00Z"
#     }
#   ]
# }
```

#### Obter detalhes de uma instância

```bash
curl -X GET http://localhost:8080/instance/connectionState/zechat-principal \
  -H "apikey: INSTANCE_API_KEY"

# Resposta:
# {
#   "instance": {
#     "instanceName": "zechat-principal",
#     "state": "open",
#     "statusReason": 200,
#     "statusDescription": "Connected",
#     "phoneNumber": "5511987654321",
#     "isActive": true,
#     "lastConnection": "2025-01-28T14:30:00Z"
#   }
# }
```

#### Reconectar instância

```bash
curl -X PUT http://localhost:8080/instance/connect/zechat-principal \
  -H "apikey: INSTANCE_API_KEY"

# Resposta:
# {
#   "instance": {
#     "instanceName": "zechat-principal",
#     "status": "connecting"
#   }
# }
```

#### Reiniciar instância

```bash
curl -X PUT http://localhost:8080/instance/restart/zechat-principal \
  -H "apikey: INSTANCE_API_KEY"
```

#### Desconectar/Logout

```bash
curl -X DELETE http://localhost:8080/instance/logout/zechat-principal \
  -H "apikey: INSTANCE_API_KEY"

# Nota: Mantém a instância criada, apenas desconecta
```

#### Deletar instância permanentemente

```bash
curl -X DELETE http://localhost:8080/instance/delete/zechat-principal \
  -H "apikey: AUTHENTICATION_API_KEY"

# ⚠️ AÇÃO IRREVERSÍVEL - Remove tudo da instância
```

#### Definir Presence (Status Online/Offline)

```bash
curl -X POST http://localhost:8080/instance/setPresence/zechat-principal \
  -H "Content-Type: application/json" \
  -H "apikey: INSTANCE_API_KEY" \
  -d '{
    "presence": "available" | "unavailable" | "composing" | "recording"
  }'

# Opções:
# - "available": Online
# - "unavailable": Offline
# - "composing": Digitando
# - "recording": Gravando áudio
```

### Configurações de Instância

#### Obter configurações

```bash
curl -X GET http://localhost:8080/settings/find/zechat-principal \
  -H "apikey: INSTANCE_API_KEY"
```

#### Atualizar configurações

```bash
curl -X POST http://localhost:8080/settings/set/zechat-principal \
  -H "Content-Type: application/json" \
  -H "apikey: INSTANCE_API_KEY" \
  -d '{
    "rejectCall": true,
    "msgCall": "Desculpe, não consigo atender chamadas de voz",
    "groupsIgnore": false,
    "alwaysOnline": true,
    "readMessages": true,
    "readStatus": true,
    "syncFullHistory": false,
    "msgCallTimeout": 15,
    "delayMessageSec": 1
  }'
```

### Gerenciar Perfil

#### Obter informações do perfil

```bash
curl -X POST http://localhost:8080/profile/fetch/zechat-principal \
  -H "apikey: INSTANCE_API_KEY"

# Resposta:
# {
#   "wid": "5511987654321@s.whatsapp.net",
#   "name": "João Silva",
#   "picture": "https://...",
#   "status": "Ocupado no momento",
#   "businessName": "",
#   "businessDescription": ""
# }
```

#### Atualizar nome do perfil

```bash
curl -X POST http://localhost:8080/profile/updateProfileName/zechat-principal \
  -H "Content-Type: application/json" \
  -H "apikey: INSTANCE_API_KEY" \
  -d '{
    "name": "Novo Nome"
  }'
```

#### Atualizar status

```bash
curl -X POST http://localhost:8080/profile/updateProfileStatus/zechat-principal \
  -H "Content-Type: application/json" \
  -H "apikey: INSTANCE_API_KEY" \
  -d '{
    "status": "Novo status aqui"
  }'
```

#### Atualizar foto de perfil

```bash
curl -X POST http://localhost:8080/profile/updateProfilePicture/zechat-principal \
  -H "Content-Type: application/json" \
  -H "apikey: INSTANCE_API_KEY" \
  -d '{
    "picture": "https://url.com/foto.jpg" 
    // ou base64: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
  }'
```

#### Remover foto de perfil

```bash
curl -X DELETE http://localhost:8080/profile/removeProfilePicture/zechat-principal \
  -H "apikey: INSTANCE_API_KEY"
```

#### Privacidade

```bash
# Obter configurações de privacidade
curl -X GET http://localhost:8080/profile/fetchPrivacySettings/zechat-principal \
  -H "apikey: INSTANCE_API_KEY"

# Atualizar privacidade
curl -X POST http://localhost:8080/profile/updatePrivacySettings/zechat-principal \
  -H "Content-Type: application/json" \
  -H "apikey: INSTANCE_API_KEY" \
  -d '{
    "readreceipts": "all" | "contacts" | "none",
    "profile": "all" | "contacts" | "none",
    "status": "all" | "contacts" | "none",
    "online": "all" | "match_last_seen" | "none",
    "last_seen": "all" | "contacts" | "none",
    "groupadd": "all" | "contacts" | "none"
  }'
```

---

## APIs de Mensagens

### Tipos de Mensagens Suportadas

| Tipo | Descrição | Endpoint |
|------|-----------|----------|
| Texto | Mensagem simples de texto | `/message/sendText` |
| Mídia | Imagem, vídeo, áudio, documento | `/message/sendMedia` |
| Áudio WhatsApp | Áudio formato específico | `/message/sendWhatsAppAudio` |
| Adesivo | Sticker/adesivo | `/message/sendSticker` |
| Localização | Mapa com coordenadas | `/message/sendLocation` |
| Contato | Cartão de contato | `/message/sendContact` |
| Reação | Emoji de reação | `/message/sendReaction` |
| Poll | Enquete/votação | `/message/sendPoll` |
| Lista | Menu com opções | `/message/sendList` |
| Botões | Botões interativos | `/message/sendButtons` |
| Status | Story/Status de 24h | `/message/sendStatus` |
| Template | Template pré-aprovado | `/message/sendTemplate` |

### 1. Enviar Mensagem de Texto

```bash
curl -X POST http://localhost:8080/message/sendText/zechat-principal \
  -H "Content-Type: application/json" \
  -H "apikey: INSTANCE_API_KEY" \
  -d '{
    "number": "5511987654321",
    "text": "Olá! Esta é uma mensagem de teste",
    "delay": 1000
  }'

# Resposta:
# {
#   "key": {
#     "remoteJid": "5511987654321@s.whatsapp.net",
#     "fromMe": true,
#     "id": "BAE5B5C7F..."
#   },
#   "message": {
#     "conversation": "Olá! Esta é uma mensagem de teste"
#   },
#   "status": "sent",
#   "timestamp": 1706456700
# }
```

**Parâmetros:**
- `number`: Telefone com DDD (ex: 5511987654321)
- `text`: Conteúdo da mensagem (máx 4096 caracteres)
- `delay`: Milissegundos antes de enviar (opcional)

### 2. Enviar Mensagem com Menção

```bash
curl -X POST http://localhost:8080/message/sendText/zechat-principal \
  -H "Content-Type: application/json" \
  -H "apikey: INSTANCE_API_KEY" \
  -d '{
    "number": "120123456789-1234567890@g.us",
    "text": "Oi @5511987654321 @5511912345678",
    "mentions": ["5511987654321@s.whatsapp.net", "5511912345678@s.whatsapp.net"]
  }'
```

### 3. Enviar Mídia (Imagem)

```bash
# Via URL
curl -X POST http://localhost:8080/message/sendMedia/zechat-principal \
  -H "Content-Type: application/json" \
  -H "apikey: INSTANCE_API_KEY" \
  -d '{
    "number": "5511987654321",
    "mediatype": "image",
    "media": "https://example.com/foto.jpg",
    "caption": "Descrição da imagem",
    "delay": 1000
  }'

# Via Base64
curl -X POST http://localhost:8080/message/sendMedia/zechat-principal \
  -H "Content-Type: application/json" \
  -H "apikey: INSTANCE_API_KEY" \
  -d '{
    "number": "5511987654321",
    "mediatype": "image",
    "media": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "caption": "Imagem em base64"
  }'
```

**Parâmetros:**
- `mediatype`: `image` | `video` | `audio` | `document`
- `media`: URL ou base64 da mídia
- `caption`: Texto descritivo (opcional)

### 4. Enviar Áudio

```bash
curl -X POST http://localhost:8080/message/sendWhatsAppAudio/zechat-principal \
  -H "Content-Type: application/json" \
  -H "apikey: INSTANCE_API_KEY" \
  -d '{
    "number": "5511987654321",
    "audio": "https://example.com/audio.mp3",
    "encoding": true
  }'

# Formatos suportados: MP3, OGG, M4A, AAC
```

### 5. Enviar Adesivo (Sticker)

```bash
curl -X POST http://localhost:8080/message/sendSticker/zechat-principal \
  -H "Content-Type: application/json" \
  -H "apikey: INSTANCE_API_KEY" \
  -d '{
    "number": "5511987654321",
    "sticker": "https://example.com/sticker.webp"
  }'

# Formato: WebP (preferido), PNG
```

### 6. Enviar Localização

```bash
curl -X POST http://localhost:8080/message/sendLocation/zechat-principal \
  -H "Content-Type: application/json" \
  -H "apikey: INSTANCE_API_KEY" \
  -d '{
    "number": "5511987654321",
    "latitude": -23.5505,
    "longitude": -46.6333,
    "name": "Escritório Principal",
    "address": "Rua Exemplo, 123, São Paulo - SP"
  }'
```

### 7. Enviar Contato

```bash
curl -X POST http://localhost:8080/message/sendContact/zechat-principal \
  -H "Content-Type: application/json" \
  -H "apikey: INSTANCE_API_KEY" \
  -d '{
    "number": "5511987654321",
    "contact": {
      "fullName": "João Silva",
      "wuid": "5511987654321",
      "phoneNumber": "11987654321"
    }
  }'

# Múltiplos contatos:
curl -X POST http://localhost:8080/message/sendContact/zechat-principal \
  -H "Content-Type: application/json" \
  -H "apikey: INSTANCE_API_KEY" \
  -d '{
    "number": "5511987654321",
    "contacts": [
      {
        "fullName": "João Silva",
        "wuid": "5511987654321",
        "phoneNumber": "11987654321"
      },
      {
        "fullName": "Maria Santos",
        "wuid": "5511912345678",
        "phoneNumber": "11912345678"
      }
    ]
  }'
```

### 8. Enviar Reação (Emoji)

```bash
curl -X POST http://localhost:8080/message/sendReaction/zechat-principal \
  -H "Content-Type: application/json" \
  -H "apikey: INSTANCE_API_KEY" \
  -d '{
    "number": "5511987654321",
    "reactionEmoji": "👍",
    "messageId": "BAE5B5C7F..."
  }'

# Emojis suportados: 👍 ❤️ 😂 😮 😢 🙏 etc
```

### 9. Enviar Enquete (Poll)

```bash
curl -X POST http://localhost:8080/message/sendPoll/zechat-principal \
  -H "Content-Type: application/json" \
  -H "apikey: INSTANCE_API_KEY" \
  -d '{
    "number": "5511987654321",
    "poll": {
      "name": "Qual seu horário preferido?",
      "options": [
        "Manhã (8h-12h)",
        "Tarde (12h-18h)",
        "Noite (18h-22h)"
      ],
      "multiselect": false
    }
  }'
```

### 10. Enviar Lista/Menu

```bash
curl -X POST http://localhost:8080/message/sendList/zechat-principal \
  -H "Content-Type: application/json" \
  -H "apikey: INSTANCE_API_KEY" \
  -d '{
    "number": "5511987654321",
    "title": "Escolha uma opção",
    "description": "Clique no botão abaixo para ver as opções disponíveis",
    "buttonText": "Ver opções",
    "sections": [
      {
        "title": "Seção 1 - Produtos",
        "rows": [
          {
            "title": "Produto A",
            "description": "Descrição do Produto A",
            "rowId": "produto_a"
          },
          {
            "title": "Produto B",
            "description": "Descrição do Produto B",
            "rowId": "produto_b"
          }
        ]
      },
      {
        "title": "Seção 2 - Serviços",
        "rows": [
          {
            "title": "Serviço X",
            "description": "Descrição do Serviço X",
            "rowId": "servico_x"
          }
        ]
      }
    ]
  }'
```

### 11. Enviar Botões

```bash
curl -X POST http://localhost:8080/message/sendButtons/zechat-principal \
  -H "Content-Type: application/json" \
  -H "apikey: INSTANCE_API_KEY" \
  -d '{
    "number": "5511987654321",
    "title": "Clique em uma opção",
    "description": "Selecione uma das opções abaixo",
    "buttons": [
      {
        "id": "btn_1",
        "displayText": "Opção 1"
      },
      {
        "id": "btn_2",
        "displayText": "Opção 2"
      },
      {
        "id": "btn_3",
        "displayText": "Opção 3"
      }
    ]
  }'
```

### 12. Enviar Status (Story)

```bash
curl -X POST http://localhost:8080/message/sendStatus/zechat-principal \
  -H "Content-Type: application/json" \
  -H "apikey: INSTANCE_API_KEY" \
  -d '{
    "type": "text",
    "content": "Meu novo status!",
    "caption": "Veja este status",
    "backgroundColor": "#008000",
    "font": 2,
    "allContacts": true,
    "statusJidList": []
  }'

# Tipos:
# - "text": Texto puro
# - "image": Imagem
# - "audio": Áudio
# - "video": Vídeo

# Fontes disponíveis:
# 1 = SERIF
# 2 = NORICAN_REGULAR
# 3 = BRYNDAN_WRITE
# 4 = BEBASNEUE_REGULAR
# 5 = OSWALD_HEAVY
```

### 13. Enviar Template (WhatsApp Cloud API)

```bash
curl -X POST http://localhost:8080/message/sendTemplate/zechat-principal \
  -H "Content-Type: application/json" \
  -H "apikey: INSTANCE_API_KEY" \
  -d '{
    "number": "5511987654321",
    "template": {
      "name": "hello_world",
      "language": "pt_BR",
      "components": [
        {
          "type": "body",
          "parameters": [
            {
              "type": "text",
              "text": "João"
            }
          ]
        }
      ]
    }
  }'
```

### Controle de Delay e Limite de Taxa

```typescript
// Implementar delay entre mensagens para evitar bloqueios
const sendMessageWithDelay = async (
  messages: Array<{number: string, text: string}>
) => {
  for (const msg of messages) {
    await evolutionService.sendText(msg.number, msg.text);
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay
  }
};

// Para múltiplas mensagens, usar fila
import Bull from 'bull';

const messageQueue = new Bull('messages');

messageQueue.process(async (job) => {
  const { number, text } = job.data;
  await evolutionService.sendText(number, text);
});

// Adicionar à fila
await messageQueue.add(
  { number: '5511987654321', text: 'Olá!' },
  { delay: 1000 }
);
```

---

## APIs de Chat e Contatos

### Buscar Chats

```bash
curl -X POST http://localhost:8080/chat/findChats/zechat-principal \
  -H "Content-Type: application/json" \
  -H "apikey: INSTANCE_API_KEY" \
  -d '{
    "where": {},
    "limit": 100,
    "offset": 0
  }'

# Com filtros:
curl -X POST http://localhost:8080/chat/findChats/zechat-principal \
  -H "Content-Type: application/json" \
  -H "apikey: INSTANCE_API_KEY" \
  -d '{
    "where": {
      "id": {
        "contains": "5511987654321"
      },
      "timestamp": {
        "gte": 1704067200000,
        "lte": 1706745600000
      }
    },
    "limit": 50,
    "offset": 0,
    "orderBy": [
      {
        "timestamp": "desc"
      }
    ]
  }'
```

### Buscar Mensagens

```bash
curl -X POST http://localhost:8080/chat/findMessages/zechat-principal \
  -H "Content-Type: application/json" \
  -H "apikey: INSTANCE_API_KEY" \
  -d '{
    "where": {
      "key": {
        "remoteJid": "5511987654321@s.whatsapp.net"
      }
    },
    "limit": 50,
    "offset": 0
  }'

# Com filtro de data:
curl -X POST http://localhost:8080/chat/findMessages/zechat-principal \
  -H "Content-Type: application/json" \
  -H "apikey: INSTANCE_API_KEY" \
  -d '{
    "where": {
      "key": {
        "remoteJid": "5511987654321@s.whatsapp.net"
      },
      "messageTimestamp": {
        "gte": 1704067200,
        "lte": 1706745600
      }
    },
    "limit": 100
  }'
```

### Marcar Mensagem como Lida

```bash
curl -X POST http://localhost:8080/chat/markMessageAsRead/zechat-principal \
  -H "Content-Type: application/json" \
  -H "apikey: INSTANCE_API_KEY" \
  -d '{
    "remoteJid": "5511987654321@s.whatsapp.net",
    "fromMe": false,
    "id": "BAE5B5C7F..."
  }'
```

### Marcar Mensagem como Não Lida

```bash
curl -X POST http://localhost:8080/chat/markMessageAsUnread/zechat-principal \
  -H "Content-Type: application/json" \
  -H "apikey: INSTANCE_API_KEY" \
  -d '{
    "remoteJid": "5511987654321@s.whatsapp.net",
    "fromMe": false,
    "id": "BAE5B5C7F..."
  }'
```

### Arquivar Chat

```bash
curl -X POST http://localhost:8080/chat/archiveChat/zechat-principal \
  -H "Content-Type: application/json" \
  -H "apikey: INSTANCE_API_KEY" \
  -d '{
    "chat": "5511987654321@s.whatsapp.net",
    "archive": true
  }'
```

### Deletar Chat

```bash
curl -X DELETE http://localhost:8080/chat/deleteChat/zechat-principal \
  -H "Content-Type: application/json" \
  -H "apikey: INSTANCE_API_KEY" \
  -d '{
    "remoteJid": "5511987654321@s.whatsapp.net"
  }'
```

### Deletar Mensagem para Todos

```bash
curl -X DELETE http://localhost:8080/chat/deleteMessageForEveryone/zechat-principal \
  -H "Content-Type: application/json" \
  -H "apikey: INSTANCE_API_KEY" \
  -d '{
    "remoteJid": "5511987654321@s.whatsapp.net",
    "fromMe": true,
    "id": "BAE5B5C7F..."
  }'
```

### Editar Mensagem

```bash
curl -X POST http://localhost:8080/chat/updateMessage/zechat-principal \
  -H "Content-Type: application/json" \
  -H "apikey: INSTANCE_API_KEY" \
  -d '{
    "remoteJid": "5511987654321@s.whatsapp.net",
    "fromMe": true,
    "id": "BAE5B5C7F...",
    "text": "Mensagem editada"
  }'
```

### Buscar Contatos

```bash
curl -X POST http://localhost:8080/chat/findContacts/zechat-principal \
  -H "Content-Type: application/json" \
  -H "apikey: INSTANCE_API_KEY" \
  -d '{
    "where": {},
    "limit": 100
  }'

# Com filtro:
curl -X POST http://localhost:8080/chat/findContacts/zechat-principal \
  -H "Content-Type: application/json" \
  -H "apikey: INSTANCE_API_KEY" \
  -d '{
    "where": {
      "pushName": {
        "contains": "João"
      }
    },
    "limit": 50
  }'
```

### Verificar Números no WhatsApp

```bash
curl -X POST http://localhost:8080/chat/whatsappNumbers/zechat-principal \
  -H "Content-Type: application/json" \
  -H "apikey: INSTANCE_API_KEY" \
  -d '{
    "numbers": ["5511987654321", "5511912345678", "5511999999999"]
  }'

# Resposta:
# {
#   "data": [
#     {
#       "number": "5511987654321",
#       "exists": true,
#       "jid": "5511987654321@s.whatsapp.net"
#     },
#     {
#       "number": "5511912345678",
#       "exists": true,
#       "jid": "5511912345678@s.whatsapp.net"
#     },
#     {
#       "number": "5511999999999",
#       "exists": false,
#       "jid": null
#     }
#   ]
# }
```

### Obter Foto de Perfil

```bash
curl -X POST http://localhost:8080/chat/fetchProfilePictureUrl/zechat-principal \
  -H "Content-Type: application/json" \
  -H "apikey: INSTANCE_API_KEY" \
  -d '{
    "number": "5511987654321"
  }'

# Resposta:
# {
#   "pictureUrl": "https://..."
# }
```

### Enviar Presença (Typing, Recording)

```bash
curl -X POST http://localhost:8080/chat/sendPresence/zechat-principal \
  -H "Content-Type: application/json" \
  -H "apikey: INSTANCE_API_KEY" \
  -d '{
    "number": "5511987654321",
    "presence": "composing" | "paused" | "recording"
  }'

# Tipos de presença:
# - "composing": Digitando mensagem
# - "paused": Parou de digitar
# - "recording": Gravando áudio
```

### Bloquear/Desbloquear Contato

```bash
# Bloquear
curl -X POST http://localhost:8080/chat/updateBlockStatus/zechat-principal \
  -H "Content-Type: application/json" \
  -H "apikey: INSTANCE_API_KEY" \
  -d '{
    "number": "5511987654321",
    "blocked": true
  }'

# Desbloquear
curl -X POST http://localhost:8080/chat/updateBlockStatus/zechat-principal \
  -H "Content-Type: application/json" \
  -H "apikey: INSTANCE_API_KEY" \
  -d '{
    "number": "5511987654321",
    "blocked": false
  }'
```

---

## APIs de Grupos

### Criar Grupo

```bash
curl -X POST http://localhost:8080/group/create/zechat-principal \
  -H "Content-Type: application/json" \
  -H "apikey: INSTANCE_API_KEY" \
  -d '{
    "groupName": "Equipe Zechat",
    "participants": [
      "5511987654321@s.whatsapp.net",
      "5511912345678@s.whatsapp.net",
      "5511999999999@s.whatsapp.net"
    ]
  }'

# Resposta:
# {
#   "groupJid": "120123456789-1234567890@g.us",
#   "groupName": "Equipe Zechat",
#   "participants": 3,
#   "createdAt": "2025-01-28T14:30:00Z"
# }
```

### Obter Informações do Grupo

```bash
curl -X GET http://localhost:8080/group/findGroupByJid/zechat-principal/120123456789-1234567890@g.us \
  -H "apikey: INSTANCE_API_KEY"

# Resposta:
# {
#   "id": "120123456789-1234567890@g.us",
#   "subject": "Equipe Zechat",
#   "subjectOwner": "5511987654321@s.whatsapp.net",
#   "subjectTime": 1706456700,
#   "creation": 1706456600,
#   "creator": "5511987654321@s.whatsapp.net",
#   "description": "Grupo de trabalho",
#   "descId": "3EB0000000000001",
#   "restrict": false,
#   "announce": false,
#   "participants": [...]
# }
```

### Listar Todos os Grupos

```bash
curl -X GET http://localhost:8080/group/fetchAllGroups/zechat-principal \
  -H "apikey: INSTANCE_API_KEY"
```

### Buscar Membros do Grupo

```bash
curl -X GET http://localhost:8080/group/findGroupMembers/zechat-principal/120123456789-1234567890@g.us \
  -H "apikey: INSTANCE_API_KEY"

# Resposta:
# {
#   "members": [
#     {
#       "id": "5511987654321@s.whatsapp.net",
#       "name": "João Silva",
#       "admin": true
#     },
#     {
#       "id": "5511912345678@s.whatsapp.net",
#       "name": "Maria Santos",
#       "admin": false
#     }
#   ]
# }
```

### Atualizar Membros do Grupo

```bash
# Adicionar membros
curl -X POST http://localhost:8080/group/updateGroupMembers/zechat-principal/120123456789-1234567890@g.us \
  -H "Content-Type: application/json" \
  -H "apikey: INSTANCE_API_KEY" \
  -d '{
    "participants": [
      {
        "jid": "5511999999999@s.whatsapp.net",
        "action": "add"
      },
      {
        "jid": "5511888888888@s.whatsapp.net",
        "action": "remove"
      },
      {
        "jid": "5511777777777@s.whatsapp.net",
        "action": "promote"
      },
      {
        "jid": "5511666666666@s.whatsapp.net",
        "action": "demote"
      }
    ]
  }'

# Ações disponíveis:
# - "add": Adicionar membro
# - "remove": Remover membro
# - "promote": Tornar admin
# - "demote": Remover privilégios de admin
```

### Atualizar Nome do Grupo

```bash
curl -X POST http://localhost:8080/group/updateGroupSubject/zechat-principal/120123456789-1234567890@g.us \
  -H "Content-Type: application/json" \
  -H "apikey: INSTANCE_API_KEY" \
  -d '{
    "subject": "Novo Nome do Grupo"
  }'
```

### Atualizar Descrição do Grupo

```bash
curl -X POST http://localhost:8080/group/updateGroupDescription/zechat-principal/120123456789-1234567890@g.us \
  -H "Content-Type: application/json" \
  -H "apikey: INSTANCE_API_KEY" \
  -d '{
    "description": "Nova descrição do grupo"
  }'
```

### Atualizar Foto do Grupo

```bash
curl -X POST http://localhost:8080/group/updateGroupPicture/zechat-principal/120123456789-1234567890@g.us \
  -H "Content-Type: application/json" \
  -H "apikey: INSTANCE_API_KEY" \
  -d '{
    "picture": "https://example.com/foto.jpg"
  }'
```

### Configurações de Grupo

```bash
# Alterar quem pode editar info
curl -X POST http://localhost:8080/group/updateGroupSettings/zechat-principal/120123456789-1234567890@g.us \
  -H "Content-Type: application/json" \
  -H "apikey: INSTANCE_API_KEY" \
  -d '{
    "restrict": true,  # Apenas admins podem editar
    "announce": true,  # Apenas admins podem mandar mensagens
    "ephemeral": 604800 # Mensagens desaparecem em 7 dias
  }'
```

### Obter Código de Convite

```bash
curl -X GET http://localhost:8080/group/fetchInviteCode/zechat-principal/120123456789-1234567890@g.us \
  -H "apikey: INSTANCE_API_KEY"

# Resposta:
# {
#   "inviteCode": "D7E5B5C7"
# }
```

### Revogar Código de Convite

```bash
curl -X POST http://localhost:8080/group/revokeInviteCode/zechat-principal/120123456789-1234567890@g.us \
  -H "apikey: INSTANCE_API_KEY"
```

### Sair do Grupo

```bash
curl -X DELETE http://localhost:8080/group/leaveGroup/zechat-principal/120123456789-1234567890@g.us \
  -H "apikey: INSTANCE_API_KEY"
```

---

## Webhooks e Eventos

### Estrutura do Webhook

Quando um evento ocorre, a Evolution API envia um POST para a URL configurada:

```json
{
  "event": "messages.upsert",
  "instance": "zechat-principal",
  "data": {
    "key": {
      "remoteJid": "5511987654321@s.whatsapp.net",
      "fromMe": false,
      "id": "BAE5B5C7F..."
    },
    "message": {
      "conversation": "Olá!"
    },
    "messageTimestamp": 1706456700,
    "pushName": "João Silva"
  },
  "server_url": "http://localhost:8080",
  "date_time": "2025-01-28T14:30:00Z",
  "apikey": "INSTANCE_API_KEY"
}
```

### Tipos de Eventos

#### 1. messages.upsert
Dispara quando uma mensagem é recebida ou enviada

```typescript
interface MessagesUpsertEvent {
  event: 'messages.upsert';
  instance: string;
  data: {
    key: {
      remoteJid: string;      // Ex: "5511987654321@s.whatsapp.net"
      fromMe: boolean;        // true se enviado pela conta
      id: string;             // ID único da mensagem
    };
    message: MessageContent;   // Conteúdo da mensagem
    messageTimestamp: number;  // Unix timestamp
    pushName?: string;         // Nome do remetente
  };
}
```

#### 2. messages.update
Dispara quando uma mensagem é editada ou muda de status

```typescript
interface MessagesUpdateEvent {
  event: 'messages.update';
  instance: string;
  data: {
    key: {
      remoteJid: string;
      fromMe: boolean;
      id: string;
    };
    update: {
      status?: 'error' | 'pending' | 'server_ack' | 'delivery_ack' | 'read';
      pollUpdates?: any[];
      reactionUpdate?: {
        emoji: string;
        fromMe: boolean;
        timestamp: number;
      };
    };
  };
}
```

#### 3. connection.update
Dispara quando status da conexão muda

```typescript
interface ConnectionUpdateEvent {
  event: 'connection.update';
  instance: string;
  data: {
    state: 'open' | 'closed' | 'connecting';
    statusReason: number;       // 200 = OK
    statusDescription: string;
    lastConnection?: number;
  };
}
```

#### 4. qr.updated
Dispara quando um novo QR code é gerado

```typescript
interface QrUpdatedEvent {
  event: 'qr.updated';
  instance: string;
  data: {
    qrcode: string; // Base64 da imagem
  };
}
```

#### 5. presence.update
Dispara quando presença muda (online/offline)

```typescript
interface PresenceUpdateEvent {
  event: 'presence.update';
  instance: string;
  data: {
    jid: string;
    lastSeen: number;
    lastKnownPresence: 'available' | 'unavailable' | 'composing' | 'recording';
  };
}
```

#### 6. chats.upsert
Dispara quando um novo chat é criado ou existente é atualizado

```typescript
interface ChatsUpsertEvent {
  event: 'chats.upsert';
  instance: string;
  data: {
    id: string;
    name?: string;
    timestamp: number;
    lastMessage?: {
      key: {
        id: string;
      };
      messageTimestamp: number;
    };
  };
}
```

#### 7. contacts.upsert
Dispara quando um contato é criado ou atualizado

```typescript
interface ContactsUpsertEvent {
  event: 'contacts.upsert';
  instance: string;
  data: {
    id: string;
    name?: string;
    pushName?: string;
    timestamp: number;
  };
}
```

#### 8. groups.upsert
Dispara quando um grupo é criado ou atualizado

```typescript
interface GroupsUpsertEvent {
  event: 'groups.upsert';
  instance: string;
  data: {
    id: string;
    subject: string;
    subjectTime: number;
    creation: number;
    creator: string;
    description?: string;
    restrict: boolean;
    announce: boolean;
  };
}
```

### Configurar Webhook

```bash
curl -X POST http://localhost:8080/webhook/set/zechat-principal \
  -H "Content-Type: application/json" \
  -H "apikey: INSTANCE_API_KEY" \
  -d '{
    "url": "https://seu-zechat.com/api/evolution/webhook",
    "webhook_by_events": false,
    "webhook_base64": false,
    "events": [
      "messages.upsert",
      "messages.update",
      "connection.update",
      "qr.updated",
      "presence.update",
      "chats.upsert",
      "contacts.upsert",
      "groups.upsert"
    ]
  }'
```

### Implementar Handler de Webhook

```typescript
// src/controllers/evolution-webhook.controller.ts
import { Controller, Post, Body, Headers } from '@nestjs/common';
import { EvolutionWebhookService } from '../services/evolution-webhook.service';

@Controller('api/evolution')
export class EvolutionWebhookController {
  constructor(private webhookService: EvolutionWebhookService) {}

  @Post('webhook')
  async handleWebhook(
    @Body() payload: any,
    @Headers('x-webhook-signature') signature: string
  ) {
    try {
      // Validar signature
      if (!this.webhookService.validateSignature(payload, signature)) {
        return { status: 401, message: 'Invalid signature' };
      }

      const { event, instance, data } = payload;

      switch (event) {
        case 'messages.upsert':
          await this.webhookService.handleNewMessage(instance, data);
          break;

        case 'messages.update':
          await this.webhookService.handleMessageUpdate(instance, data);
          break;

        case 'connection.update':
          await this.webhookService.handleConnectionUpdate(instance, data);
          break;

        case 'qr.updated':
          await this.webhookService.handleQrCode(instance, data);
          break;

        case 'presence.update':
          await this.webhookService.handlePresenceUpdate(instance, data);
          break;

        case 'chats.upsert':
          await this.webhookService.handleChatUpsert(instance, data);
          break;

        case 'contacts.upsert':
          await this.webhookService.handleContactUpsert(instance, data);
          break;

        case 'groups.upsert':
          await this.webhookService.handleGroupUpsert(instance, data);
          break;

        default:
          console.warn(`Unknown event: ${event}`);
      }

      return { status: 200, message: 'Webhook processed' };
    } catch (error) {
      console.error('Webhook error:', error);
      return { status: 500, message: 'Internal error' };
    }
  }
}
```

```typescript
// src/services/evolution-webhook.service.ts
import { Injectable } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { WebSocketGateway } from '../gateways/websocket.gateway';
import crypto from 'crypto';

@Injectable()
export class EvolutionWebhookService {
  constructor(
    private db: DatabaseService,
    private wsGateway: WebSocketGateway
  ) {}

  validateSignature(payload: any, signature: string): boolean {
    const secret = process.env.WEBHOOK_SECRET!;
    const hash = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(hash),
      Buffer.from(signature)
    );
  }

  async handleNewMessage(instance: string, data: any) {
    const { key, message, messageTimestamp, pushName } = data;

    // Salvar no banco
    const msg = await this.db.whatsappMessage.create({
      instanceId: instance,
      messageId: key.id,
      remoteJid: key.remoteJid,
      fromMe: key.fromMe,
      body: this.extractMessageBody(message),
      messageType: this.getMessageType(message),
      timestamp: new Date(messageTimestamp * 1000),
      pushName,
      status: 'received'
    });

    // Criar ou atualizar ticket
    const ticket = await this.db.ticket.upsert({
      where: { whatsappNumber: key.remoteJid },
      update: {
        lastMessage: new Date(),
        status: 'open'
      },
      create: {
        whatsappNumber: key.remoteJid,
        contactName: pushName,
        instanceId: instance,
        status: 'open'
      }
    });

    // Notificar via WebSocket
    this.wsGateway.notifyNewMessage(ticket.id, msg);

    // Trigger automações
    await this.triggerAutomations(instance, ticket, message);
  }

  async handleMessageUpdate(instance: string, data: any) {
    const { key, update } = data;

    // Atualizar status
    if (update.status) {
      await this.db.whatsappMessage.update({
        where: { messageId: key.id },
        data: {
          status: this.mapWhatsAppStatus(update.status)
        }
      });
    }

    // Notificar
    this.wsGateway.notifyMessageUpdate(key.id, update.status);
  }

  async handleConnectionUpdate(instance: string, data: any) {
    const { state, statusReason } = data;

    // Atualizar instância
    await this.db.whatsappInstance.update({
      where: { instanceName: instance },
      data: {
        status: state,
        lastConnection: new Date()
      }
    });

    // Notificar
    this.wsGateway.notifyConnectionStatus(instance, state);

    // Se desconectou, enviar alerta
    if (state === 'closed') {
      await this.sendAlertToAdmins(`Instância ${instance} foi desconectada`);
    }
  }

  async handleQrCode(instance: string, data: any) {
    const { qrcode } = data;

    // Armazenar QR code
    await this.db.whatsappInstance.update({
      where: { instanceName: instance },
      data: { qrcode }
    });

    // Notificar frontend para exibir QR
    this.wsGateway.notifyQrCode(instance, qrcode);
  }

  async handlePresenceUpdate(instance: string, data: any) {
    // Armazenar presença do contato
    const { jid, lastSeen, lastKnownPresence } = data;

    await this.db.contact.update({
      where: { jid },
      data: {
        lastSeen: new Date(lastSeen * 1000),
        presence: lastKnownPresence
      }
    });
  }

  async handleChatUpsert(instance: string, data: any) {
    const { id, name, timestamp } = data;

    await this.db.chat.upsert({
      where: { remoteJid: id },
      update: { name, updatedAt: new Date() },
      create: {
        remoteJid: id,
        name,
        instanceId: instance,
        createdAt: new Date(timestamp * 1000)
      }
    });
  }

  async handleContactUpsert(instance: string, data: any) {
    const { id, name, pushName } = data;

    await this.db.contact.upsert({
      where: { jid: id },
      update: { name: name || pushName },
      create: {
        jid: id,
        name: name || pushName,
        instanceId: instance
      }
    });
  }

  async handleGroupUpsert(instance: string, data: any) {
    const { id, subject, creator, restrict, announce } = data;

    await this.db.group.upsert({
      where: { jid: id },
      update: {
        name: subject,
        restrict,
        announce
      },
      create: {
        jid: id,
        name: subject,
        creator,
        restrict,
        announce,
        instanceId: instance
      }
    });
  }

  private extractMessageBody(message: any): string {
    if (message.conversation) return message.conversation;
    if (message.extendedTextMessage) return message.extendedTextMessage.text;
    if (message.imageMessage) return `[Imagem] ${message.imageMessage.caption || ''}`;
    if (message.audioMessage) return '[Áudio]';
    if (message.videoMessage) return `[Vídeo] ${message.videoMessage.caption || ''}`;
    if (message.documentMessage) return `[Documento] ${message.documentMessage.title || 'Sem título'}`;
    if (message.locationMessage) return '[Localização]';
    if (message.contactMessage) return '[Contato]';
    if (message.listResponseMessage) return `[Resposta: ${message.listResponseMessage.title}]`;
    if (message.buttonsResponseMessage) return `[Botão: ${message.buttonsResponseMessage.selectedDisplayText}]`;
    return '[Mensagem desconhecida]';
  }

  private getMessageType(message: any): string {
    if (message.conversation) return 'text';
    if (message.extendedTextMessage) return 'text';
    if (message.imageMessage) return 'image';
    if (message.audioMessage) return 'audio';
    if (message.videoMessage) return 'video';
    if (message.documentMessage) return 'document';
    if (message.locationMessage) return 'location';
    if (message.contactMessage) return 'contact';
    if (message.stickerMessage) return 'sticker';
    return 'unknown';
  }

  private mapWhatsAppStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'error': 'erro',
      'pending': 'pendente',
      'server_ack': 'enviada',
      'delivery_ack': 'entregue',
      'read': 'lida'
    };
    return statusMap[status] || status;
  }

  private async triggerAutomations(instance: string, ticket: any, message: any) {
    // Implementar lógica de automação
    // - Responder automaticamente
    // - Criar tarefas
    // - Notificar IA
    // etc.
  }

  private async sendAlertToAdmins(message: string) {
    // Enviar notificação para admins
  }
}
```

---

## Integrações Avançadas

### Integração com Chatwoot

```bash
curl -X POST http://localhost:8080/chatwoot/set/zechat-principal \
  -H "Content-Type: application/json" \
  -H "apikey: INSTANCE_API_KEY" \
  -d '{
    "enabled": true,
    "account_id": 1,
    "token": "CHATWOOT_WEBHOOK_TOKEN",
    "url": "https://chatwoot.seu-dominio.com",
    "sign_msg": true,
    "reopen_conversation": true,
    "conversation_pending": true,
    "import_messages": true,
    "days_limit": 90
  }'
```

### Integração com Typebot (Chatbot)

```bash
curl -X POST http://localhost:8080/typebot/set/zechat-principal \
  -H "Content-Type: application/json" \
  -H "apikey: INSTANCE_API_KEY" \
  -d '{
    "enabled": true,
    "url": "https://typebot.seu-dominio.com/api",
    "typebot": "seu-typebot-id",
    "expire": 0,
    "keyword_finish": "#sair",
    "delay_message": 1000,
    "unknownMessage": "Desculpe, não entendi sua mensagem"
  }'
```

### Integração com OpenAI (Respostas com IA)

```bash
curl -X POST http://localhost:8080/openai/set/zechat-principal \
  -H "Content-Type: application/json" \
  -H "apikey: INSTANCE_API_KEY" \
  -d '{
    "enabled": true,
    "apiKey": "sk-...",
    "model": "gpt-4",
    "max_tokens": 2048,
    "temperature": 0.7,
    "systemMessages": [
      "Você é um assistente de atendimento ao cliente.",
      "Responda de forma educada e profissional.",
      "Se não souber responder, peça para o usuário entrar em contato com um agente."
    ]
  }'
```

### Integração com RabbitMQ (Fila de Mensagens)

```bash
curl -X POST http://localhost:8080/rabbitmq/set/zechat-principal \
  -H "Content-Type: application/json" \
  -H "apikey: INSTANCE_API_KEY" \
  -d '{
    "enabled": true,
    "url": "amqp://user:password@rabbitmq-host:5672",
    "queue": "evolution-messages",
    "vhost": "/"
  }'
```

### Integração com SQS AWS

```bash
curl -X POST http://localhost:8080/sqs/set/zechat-principal \
  -H "Content-Type: application/json" \
  -H "apikey: INSTANCE_API_KEY" \
  -d '{
    "enabled": true,
    "accessKeyId": "AWS_ACCESS_KEY",
    "secretAccessKey": "AWS_SECRET_KEY",
    "region": "us-east-1",
    "queueUrl": "https://sqs.us-east-1.amazonaws.com/123456789/evolution-queue"
  }'
```

### Integração com S3 (Armazenamento de Mídia)

```env
S3_ENABLED=true
S3_ACCESS_KEY=AKIA2EXAMPLE
S3_SECRET_KEY=secret-key-very-long
S3_BUCKET=evolution-media
S3_ENDPOINT=s3.amazonaws.com
S3_PORT=443
S3_USE_SSL=true
S3_REGION=us-east-1
```

---

## Implementação no Zechat

### Estrutura de Diretórios Recomendada

```
zechat/
├── src/
│   ├── modules/
│   │   ├── evolution/
│   │   │   ├── controllers/
│   │   │   │   ├── evolution.controller.ts
│   │   │   │   └── evolution-webhook.controller.ts
│   │   │   ├── services/
│   │   │   │   ├── evolution.service.ts
│   │   │   │   ├── evolution-webhook.service.ts
│   │   │   │   └── evolution-message.service.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-instance.dto.ts
│   │   │   │   ├── send-message.dto.ts
│   │   │   │   └── webhook-payload.dto.ts
│   │   │   ├── models/
│   │   │   │   ├── whatsapp-instance.model.ts
│   │   │   │   ├── whatsapp-message.model.ts
│   │   │   │   └── whatsapp-chat.model.ts
│   │   │   ├── queues/
│   │   │   │   └── message.queue.ts
│   │   │   ├── guards/
│   │   │   │   └── webhook-signature.guard.ts
│   │   │   └── evolution.module.ts
│   │   │
│   │   ├── tickets/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   └── models/
│   │   │
│   │   └── ...
│   │
│   ├── common/
│   │   ├── decorators/
│   │   ├── interceptors/
│   │   ├── filters/
│   │   └── pipes/
│   │
│   ├── database/
│   │   ├── migrations/
│   │   ├── seeds/
│   │   ├── prisma.service.ts
│   │   └── schema.prisma
│   │
│   ├── gateways/
│   │   └── evolution.gateway.ts
│   │
│   └── app.module.ts
│
├── docker-compose.yml
├── .env.example
├── prisma/
│   └── schema.prisma
└── package.json
```

### Schema Prisma

```prisma
// prisma/schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model WhatsappInstance {
  id                    String   @id @default(cuid())
  instanceName          String   @unique
  integration           String   // WHATSAPP-BAILEYS | WHATSAPP-BUSINESS
  number                String?
  status                String   // connecting | open | closed
  apiKey                String   @unique
  globalApiKey          String
  webhookUrl            String?
  qrcode                String?  @db.Text
  profileName           String?
  profilePictureUrl     String?
  businessId            String?
  token                 String?
  
  settings              Json?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  lastConnection        DateTime?
  
  messages              WhatsappMessage[]
  chats                 Chat[]
  contacts              Contact[]
  groups                Group[]
  tickets               Ticket[]

  @@map("whatsapp_instances")
}

model WhatsappMessage {
  id                    String   @id @default(cuid())
  instanceId            String
  instance              WhatsappInstance @relation(fields: [instanceId], references: [id], onDelete: Cascade)
  
  messageId             String   @unique
  remoteJid             String
  fromMe                Boolean
  body                  String?  @db.Text
  messageType           String   // text | image | audio | video | document | location | contact | etc
  mediaUrl              String?
  mediaSize             Int?
  mediaMime             String?
  
  status                String   @default("received") // pending | sent | delivered | read | error
  ack                   Int?     // 0 = pending, 1 = sent, 2 = delivered, 3 = read
  
  quotedMsg             String?
  mentions              String[]
  
  timestamp             DateTime
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  ticket                Ticket?  @relation(fields: [ticketId], references: [id], onDelete: SetNull)
  ticketId              String?

  @@unique([instanceId, messageId])
  @@index([remoteJid, timestamp])
  @@index([ticketId])
  @@map("whatsapp_messages")
}

model Chat {
  id                    String   @id @default(cuid())
  instanceId            String
  instance              WhatsappInstance @relation(fields: [instanceId], references: [id], onDelete: Cascade)
  
  remoteJid             String
  name                  String?
  isGroup               Boolean  @default(false)
  isArchived            Boolean  @default(false)
  isMuted               Boolean  @default(false)
  
  lastMessage           DateTime?
  lastMessageBody       String?
  unreadCount           Int      @default(0)
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  contact               Contact?
  group                 Group?

  @@unique([instanceId, remoteJid])
  @@index([remoteJid])
  @@map("chats")
}

model Contact {
  id                    String   @id @default(cuid())
  instanceId            String?
  instance              WhatsappInstance? @relation(fields: [instanceId], references: [id], onDelete: SetNull)
  
  jid                   String
  name                  String?
  pushName              String?
  profilePicture        String?
  status                String?
  statusTimestamp       DateTime?
  presence              String?   // available | unavailable | composing | recording
  lastSeen              DateTime?
  
  phone                 String?
  email                 String?
  company               String?
  
  isBlocked             Boolean  @default(false)
  isFavorite            Boolean  @default(false)
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  chat                  Chat?    @relation(fields: [chatId], references: [id], onDelete: SetNull)
  chatId                String?  @unique
  
  tickets               Ticket[]

  @@unique([jid, instanceId])
  @@index([jid])
  @@map("contacts")
}

model Group {
  id                    String   @id @default(cuid())
  instanceId            String
  instance              WhatsappInstance @relation(fields: [instanceId], references: [id], onDelete: Cascade)
  
  jid                   String
  name                  String
  description           String?  @db.Text
  picture               String?
  
  creator               String
  subject               String?
  subjectTime           DateTime?
  creation              DateTime
  
  restrict              Boolean  @default(false)  // Apenas admins podem editar
  announce              Boolean  @default(false)  // Apenas admins podem enviar msg
  ephemeral             Int?                       // Mensagens desaparecem em X segundos
  
  participants          Json     @default("[]")   // Array de membros
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  chat                  Chat?    @relation(fields: [chatId], references: [id], onDelete: SetNull)
  chatId                String?  @unique

  @@unique([instanceId, jid])
  @@index([jid])
  @@map("groups")
}

model Ticket {
  id                    String   @id @default(cuid())
  instanceId            String
  instance              WhatsappInstance @relation(fields: [instanceId], references: [id], onDelete: Cascade)
  
  whatsappNumber        String
  contact               Contact? @relation(fields: [contactId], references: [id], onDelete: SetNull)
  contactId             String?
  
  contactName           String?
  contactPhone          String?
  
  status                String   @default("open")  // open | pending | waiting | closed | on_hold
  priority              String   @default("normal") // low | normal | high | urgent
  department            String?
  assignee              String?
  
  subject               String?
  description           String?  @db.Text
  
  lastMessage           DateTime?
  lastMessagePreview    String?
  
  messages              WhatsappMessage[]
  
  tags                  String[]
  customFields          Json?
  metadata              Json?
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  closedAt              DateTime?

  @@unique([instanceId, whatsappNumber])
  @@index([status])
  @@index([priority])
  @@index([createdAt])
  @@map("tickets")
}

model WebhookLog {
  id                    String   @id @default(cuid())
  instanceId            String
  
  event                 String
  payload               Json     @db.Text
  statusCode            Int?
  response              String?  @db.Text
  error                 String?  @db.Text
  
  retries               Int      @default(0)
  nextRetry             DateTime?
  
  createdAt             DateTime @default(now())
  
  @@index([instanceId, event])
  @@map("webhook_logs")
}
```

### Service Principal

```typescript
// src/modules/evolution/services/evolution.service.ts

import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class EvolutionService {
  private api: AxiosInstance;
  private baseUrl: string;
  private globalApiKey: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService
  ) {
    this.baseUrl = this.configService.get('EVOLUTION_API_URL');
    this.globalApiKey = this.configService.get('EVOLUTION_GLOBAL_API_KEY');

    this.api = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  // ===== INSTANCE MANAGEMENT =====

  async createInstance(data: CreateInstanceDto) {
    try {
      const response = await this.api.post('/instance/create', data, {
        headers: { apikey: this.globalApiKey }
      });

      // Salvar no banco
      await this.prisma.whatsappInstance.create({
        data: {
          instanceName: data.instanceName,
          integration: data.integration,
          status: 'connecting',
          apiKey: response.data.instance.instanceApiKey,
          globalApiKey: this.globalApiKey,
          qrcode: data.qrcode ? '' : null
        }
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to create instance: ${error.message}`);
    }
  }

  async getQrCode(instanceName: string): Promise<string> {
    try {
      const instance = await this.prisma.whatsappInstance.findUnique({
        where: { instanceName }
      });

      if (!instance) throw new Error('Instance not found');

      const response = await this.api.get(`/instance/qrcode/${instanceName}`, {
        headers: { apikey: instance.apiKey }
      });

      // Atualizar no banco
      await this.prisma.whatsappInstance.update({
        where: { instanceName },
        data: { qrcode: response.data.base64 }
      });

      return response.data.base64;
    } catch (error) {
      throw new Error(`Failed to get QR code: ${error.message}`);
    }
  }

  async getInstanceStatus(instanceName: string) {
    try {
      const instance = await this.prisma.whatsappInstance.findUnique({
        where: { instanceName }
      });

      if (!instance) throw new Error('Instance not found');

      const response = await this.api.get(
        `/instance/connectionState/${instanceName}`,
        { headers: { apikey: instance.apiKey } }
      );

      // Atualizar status no banco
      await this.prisma.whatsappInstance.update({
        where: { instanceName },
        data: {
          status: response.data.instance.state,
          lastConnection: new Date()
        }
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to get instance status: ${error.message}`);
    }
  }

  // ===== MESSAGE SENDING =====

  async sendText(
    instanceName: string,
    number: string,
    text: string,
    delay: number = 1000
  ) {
    try {
      const instance = await this.prisma.whatsappInstance.findUnique({
        where: { instanceName }
      });

      if (!instance) throw new Error('Instance not found');

      const response = await this.api.post(
        `/message/sendText/${instanceName}`,
        { number, text, delay },
        { headers: { apikey: instance.apiKey } }
      );

      // Salvar mensagem no banco
      await this.prisma.whatsappMessage.create({
        data: {
          instanceId: instance.id,
          messageId: response.data.key.id,
          remoteJid: response.data.key.remoteJid,
          fromMe: true,
          body: text,
          messageType: 'text',
          status: 'sent',
          timestamp: new Date(response.data.messageTimestamp * 1000)
        }
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  async sendMedia(
    instanceName: string,
    number: string,
    mediatype: 'image' | 'video' | 'audio' | 'document',
    media: string,
    caption?: string
  ) {
    try {
      const instance = await this.prisma.whatsappInstance.findUnique({
        where: { instanceName }
      });

      if (!instance) throw new Error('Instance not found');

      const response = await this.api.post(
        `/message/sendMedia/${instanceName}`,
        { number, mediatype, media, caption },
        { headers: { apikey: instance.apiKey } }
      );

      // Salvar no banco
      await this.prisma.whatsappMessage.create({
        data: {
          instanceId: instance.id,
          messageId: response.data.key.id,
          remoteJid: response.data.key.remoteJid,
          fromMe: true,
          body: caption || '',
          messageType: mediatype,
          mediaUrl: typeof media === 'string' && media.startsWith('http') ? media : undefined,
          status: 'sent',
          timestamp: new Date(response.data.messageTimestamp * 1000)
        }
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to send media: ${error.message}`);
    }
  }

  // ===== MESSAGE QUERIES =====

  async getMessages(instanceName: string, remoteJid: string, limit: number = 50) {
    try {
      const instance = await this.prisma.whatsappInstance.findUnique({
        where: { instanceName }
      });

      if (!instance) throw new Error('Instance not found');

      const response = await this.api.post(
        `/chat/findMessages/${instanceName}`,
        {
          where: { key: { remoteJid } },
          limit
        },
        { headers: { apikey: instance.apiKey } }
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed to get messages: ${error.message}`);
    }
  }

  // ===== WEBHOOK SETUP =====

  async configureWebhook(instanceName: string, webhookUrl: string) {
    try {
      const instance = await this.prisma.whatsappInstance.findUnique({
        where: { instanceName }
      });

      if (!instance) throw new Error('Instance not found');

      const response = await this.api.post(
        `/webhook/set/${instanceName}`,
        {
          url: webhookUrl,
          webhook_by_events: false,
          webhook_base64: false,
          events: [
            'messages.upsert',
            'messages.update',
            'connection.update',
            'qr.updated',
            'presence.update',
            'chats.upsert',
            'contacts.upsert',
            'groups.upsert'
          ]
        },
        { headers: { apikey: instance.apiKey } }
      );

      // Atualizar no banco
      await this.prisma.whatsappInstance.update({
        where: { instanceName },
        data: { webhookUrl }
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to configure webhook: ${error.message}`);
    }
  }
}
```

### WebSocket Gateway para Real-time

```typescript
// src/gateways/evolution.gateway.ts

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
@Injectable()
export class EvolutionGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map();

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    this.connectedUsers.set(userId, client.id);
    console.log(`User ${userId} connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.connectedUsers.forEach((socketId, userId) => {
      if (socketId === client.id) {
        this.connectedUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
      }
    });
  }

  // Notificações de eventos

  notifyNewMessage(ticketId: string, message: any) {
    this.server.emit(`ticket:${ticketId}:message`, {
      type: 'new_message',
      data: message
    });
  }

  notifyMessageUpdate(messageId: string, status: string) {
    this.server.emit(`message:${messageId}:update`, {
      type: 'status_change',
      status
    });
  }

  notifyConnectionStatus(instanceName: string, status: string) {
    this.server.emit(`instance:${instanceName}:connection`, {
      type: 'connection_update',
      status
    });
  }

  notifyQrCode(instanceName: string, qrcode: string) {
    this.server.emit(`instance:${instanceName}:qrcode`, {
      type: 'qr_code',
      qrcode
    });
  }

  notifyPresenceUpdate(number: string, presence: string) {
    this.server.emit(`contact:${number}:presence`, {
      type: 'presence_update',
      presence
    });
  }

  // Listeners do cliente

  @SubscribeMessage('subscribe_ticket')
  handleSubscribeTicket(client: Socket, data: { ticketId: string }) {
    client.join(`ticket:${data.ticketId}`);
  }

  @SubscribeMessage('unsubscribe_ticket')
  handleUnsubscribeTicket(client: Socket, data: { ticketId: string }) {
    client.leave(`ticket:${data.ticketId}`);
  }
}
```

### Message Queue para Processamento Assíncrono

```typescript
// src/modules/evolution/queues/message.queue.ts

import { Injectable } from '@nestjs/common';
import { Queue, Worker } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { EvolutionService } from '../services/evolution.service';

@Injectable()
export class MessageQueueService {
  private queue: Queue;

  constructor(
    private configService: ConfigService,
    private evolutionService: EvolutionService
  ) {
    this.queue = new Queue('messages', {
      connection: {
        host: this.configService.get('REDIS_HOST'),
        port: this.configService.get('REDIS_PORT'),
        password: this.configService.get('REDIS_PASSWORD')
      }
    });

    this.setupWorker();
  }

  private setupWorker() {
    const worker = new Worker(
      'messages',
      async (job) => {
        const { instanceName, number, text, delay } = job.data;

        try {
          await this.evolutionService.sendText(
            instanceName,
            number,
            text,
            delay || 1000
          );

          return { success: true };
        } catch (error) {
          // Retry logic
          throw error;
        }
      },
      {
        connection: {
          host: this.configService.get('REDIS_HOST'),
          port: this.configService.get('REDIS_PORT'),
          password: this.configService.get('REDIS_PASSWORD')
        },
        concurrency: 10
      }
    );

    worker.on('completed', (job) => {
      console.log(`Job ${job.id} completed`);
    });

    worker.on('failed', (job, err) => {
      console.error(`Job ${job.id} failed:`, err.message);
    });
  }

  async addMessage(data: {
    instanceName: string;
    number: string;
    text: string;
    delay?: number;
  }) {
    await this.queue.add(data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      },
      removeOnComplete: true,
      removeOnFail: false
    });
  }

  async addBulkMessages(
    messages: Array<{
      instanceName: string;
      number: string;
      text: string;
    }>
  ) {
    const jobs = messages.map((msg, index) => ({
      name: 'send-message',
      data: {
        ...msg,
        delay: index * 1000 // Espaçar mensagens
      }
    }));

    await this.queue.addBulk(jobs);
  }
}
```

---

## Tratamento de Erros

### Códigos de Erro Comuns

| Código | Descrição | Solução |
|--------|-----------|---------|
| 400 | Bad Request | Validar payload da requisição |
| 401 | Unauthorized | Verificar API key |
| 403 | Forbidden | Verificar permissões da instância |
| 404 | Not Found | Verificar nome da instância ou ID |
| 429 | Too Many Requests | Implementar rate limiting |
| 500 | Server Error | Verificar logs do servidor |
| 503 | Service Unavailable | Reconectar instância |

### Estratégia de Retry

```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i); // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

// Usar:
await retryWithBackoff(() =>
  evolutionService.sendText(instance, number, text)
);
```

### Error Handling Global

```typescript
// src/common/filters/evolution-exception.filter.ts

import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class EvolutionExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = 500;
    let message = 'Internal server error';
    let error = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = (exceptionResponse as any).message || exception.message;
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.stack;
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}
```

---

## Performance e Otimização

### Caching de Contatos

```typescript
// src/modules/evolution/services/contact-cache.service.ts

import { Injectable } from '@nestjs/common';
import { RedisService } from '@liaoliaots/nestjs-redis';

@Injectable()
export class ContactCacheService {
  private redis = this.redisService.getClient();

  constructor(private redisService: RedisService) {}

  async cacheContact(instanceId: string, number: string, data: any, ttl = 3600) {
    const key = `contact:${instanceId}:${number}`;
    await this.redis.setex(key, ttl, JSON.stringify(data));
  }

  async getContact(instanceId: string, number: string): Promise<any | null> {
    const key = `contact:${instanceId}:${number}`;
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async invalidateContact(instanceId: string, number: string) {
    const key = `contact:${instanceId}:${number}`;
    await this.redis.del(key);
  }
}
```

### Batch Processing

```typescript
async function processBatch<T>(
  items: T[],
  processor: (item: T) => Promise<void>,
  batchSize = 10
) {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await Promise.all(batch.map(processor));
    
    // Delay entre batches para evitar rate limit
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

// Usar:
await processBatch(
  numbers,
  (number) => evolutionService.sendText(instance, number, message),
  20
);
```

### Índices de Banco de Dados

```sql
-- Adicionar índices para queries comuns
CREATE INDEX idx_messages_instance_timestamp 
  ON whatsapp_messages(instance_id, message_timestamp DESC);

CREATE INDEX idx_messages_remote_jid_timestamp 
  ON whatsapp_messages(remote_jid, message_timestamp DESC);

CREATE INDEX idx_tickets_status_created 
  ON tickets(status, created_at DESC);

CREATE INDEX idx_tickets_contact_id 
  ON tickets(contact_id);

-- Verificar índices
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE schemaname NOT IN ('pg_catalog', 'information_schema');
```

---

## Monitoramento e Logging

### Configurar Winston Logger

```typescript
// src/common/logger/winston.config.ts

import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

export const loggerConfig = {
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp }) => {
          return `${timestamp} [${level}]: ${message}`;
        })
      )
    }),

    new DailyRotateFile({
      filename: 'logs/evolution-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      level: 'info'
    }),

    new DailyRotateFile({
      filename: 'logs/evolution-error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      level: 'error'
    })
  ],
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  )
};
```

### Métricas Prometheus

```typescript
// src/common/metrics/prometheus.service.ts

import { Injectable } from '@nestjs/common';
import { Counter, Histogram, Gauge } from 'prom-client';

@Injectable()
export class PrometheusService {
  messagesSent = new Counter({
    name: 'evolution_messages_sent_total',
    help: 'Total de mensagens enviadas',
    labelNames: ['instance', 'type']
  });

  messagesFailed = new Counter({
    name: 'evolution_messages_failed_total',
    help: 'Total de mensagens que falharam',
    labelNames: ['instance', 'error']
  });

  connectionStatus = new Gauge({
    name: 'evolution_connection_status',
    help: 'Status da conexão (1=connected, 0=disconnected)',
    labelNames: ['instance']
  });

  messageProcessingTime = new Histogram({
    name: 'evolution_message_processing_seconds',
    help: 'Tempo de processamento de mensagens',
    labelNames: ['instance', 'type'],
    buckets: [0.1, 0.5, 1, 2, 5]
  });

  activeInstances = new Gauge({
    name: 'evolution_active_instances',
    help: 'Número de instâncias ativas'
  });

  webhookLatency = new Histogram({
    name: 'evolution_webhook_latency_seconds',
    help: 'Latência do webhook',
    labelNames: ['event'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1]
  });
}
```

### Health Check

```typescript
// src/health/evolution.health.ts

import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { EvolutionService } from '../modules/evolution/services/evolution.service';

@Injectable()
export class EvolutionHealthIndicator extends HealthIndicator {
  constructor(private evolutionService: EvolutionService) {
    super();
  }

  async isHealthy(): Promise<HealthIndicatorResult> {
    try {
      // Verificar todas as instâncias
      const instances = await this.evolutionService.listInstances();
      
      const connectedInstances = instances.filter((i: any) => i.status === 'open');
      const isHealthy = connectedInstances.length > 0;

      return this.getStatus('evolution', isHealthy, {
        totalInstances: instances.length,
        connectedInstances: connectedInstances.length
      });
    } catch (error) {
      throw new HealthCheckError('Evolution check failed', error);
    }
  }
}
```

---

## Checklist de Produção

### ✅ Segurança
- [ ] HTTPS/TLS configurado
- [ ] API Keys criptografadas no banco
- [ ] Validação de webhook signature
- [ ] Rate limiting implementado
- [ ] CORS restringido para domínios confiáveis
- [ ] Firewall configurado
- [ ] Secrets no Vault ou similar
- [ ] Auditoria de acesso logada
- [ ] Senhas de banco de dados fortes
- [ ] SSL certificates válidos

### ✅ Performance
- [ ] Redis cache configurado
- [ ] Índices de banco de dados criados
- [ ] Paginação implementada
- [ ] Batch processing para bulk operations
- [ ] CDN para assets estáticos
- [ ] Compressão de resposta ativada
- [ ] Connection pooling configurado
- [ ] Load balancer implementado

### ✅ Reliability
- [ ] Backup diário do banco de dados
- [ ] Disaster recovery plan documentado
- [ ] Retry logic implementado
- [ ] Circuit breaker para serviços externos
- [ ] Health checks configurados
- [ ] Alertas de downtime configurados
- [ ] SLA definido

### ✅ Monitoring
- [ ] Prometheus + Grafana
- [ ] Logs centralizados (ELK, Datadog, etc)
- [ ] Error tracking (Sentry)
- [ ] Tracing distribuído
- [ ] Alertas críticos configurados
- [ ] Dashboard de métricas
- [ ] Uptime monitoring

### ✅ Compliance
- [ ] GDPR compliance review
- [ ] Dados sensíveis criptografados
- [ ] Retenção de logs configurada
- [ ] Termos de serviço atualizados
- [ ] Política de privacidade publicada

### ✅ Deployment
- [ ] CI/CD pipeline configurado
- [ ] Testes automatizados (unit, integration, e2e)
- [ ] Code review process
- [ ] Staging environment idêntico ao prod
- [ ] Rollback procedure documentado
- [ ] Zero-downtime deployment capability

---

## Troubleshooting

### Problema: Instância não conecta
**Causas possíveis:**
- QR Code expirado
- Número bloqueado pela Meta
- Celular com sessão ativa

**Solução:**
```bash
# Deletar e recriar instância
curl -X DELETE http://localhost:8080/instance/delete/minha-instancia \
  -H "apikey: AUTHENTICATION_API_KEY"

# Desconectar WhatsApp do celular
# Criar nova instância
```

### Problema: Mensagens não enviam
**Causas possíveis:**
- Número sem WhatsApp
- Rate limit atingido
- Problema de conectividade

**Solução:**
```bash
# Verificar se número existe no WhatsApp
curl -X POST http://localhost:8080/chat/whatsappNumbers/zechat-principal \
  -H "Content-Type: application/json" \
  -H "apikey: INSTANCE_API_KEY" \
  -d '{"numbers": ["5511987654321"]}'

# Aguardar antes de enviar próxima mensagem
# Usar fila para melhorar controle
```

### Problema: Webhook não recebe eventos
**Causas possíveis:**
- URL inválida
- Firewall bloqueando
- Servidor offline

**Solução:**
```bash
# Verificar webhook configurado
curl -X GET http://localhost:8080/webhook/find/zechat-principal \
  -H "apikey: INSTANCE_API_KEY"

# Testar URL
curl -X POST https://seu-zechat.com/api/evolution/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# Verificar logs do Evolution
docker logs evolution_api
```

### Problema: Muita latência
**Otimizações:**
1. Usar batch processing
2. Aumentar conexões Redis
3. Aumentar workers do BullMQ
4. Adicionar índices no banco
5. Usar CDN para mídia

### Problema: Banco crescendo muito
**Solução:**
```sql
-- Arquivar mensagens antigas
DELETE FROM whatsapp_messages 
WHERE created_at < NOW() - INTERVAL '180 days';

-- Vacuum banco
VACUUM ANALYZE;

-- Verificar tamanho
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## Recursos Adicionais

### Links Úteis
- [Evolution API Docs](https://doc.evolution-api.com)
- [GitHub Evolution API](https://github.com/EvolutionAPI/evolution-api)
- [Postman Collection](https://www.postman.com/agenciadgcode/evolution-api)
- [WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api)

### Comunidade
- [Discord Evolution API](https://discord.gg/evolution)
- [GitHub Issues](https://github.com/EvolutionAPI/evolution-api/issues)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/evolution-api)

### Ferramentas
- Postman (testes de API)
- ngrok (tunnel para webhooks locais)
- Redis Desktop Manager (gerenciar Redis)
- pgAdmin (gerenciar PostgreSQL)

---

**Blueprint finalizado** | Versão 2.3.6 | Dezembro 2025
