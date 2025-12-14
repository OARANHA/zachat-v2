# Arquitetura do WhatsApp Gateway - 28web Hub

## Overview

O WhatsApp Gateway é um microserviço isolado responsável por gerenciar todas as operações relacionadas ao WhatsApp no sistema 28web Hub. Ele implementa o padrão Strangler Fig para extrair gradualmente a dependência do whatsapp-web.js do monolito principal.

## Arquitetura

```mermaid
flowchart TD
    A[Backend Principal] --> B[WhatsAppProvider]
    B --> C[HTTP API]
    C --> D[WhatsApp Gateway]
    D --> E[SessionManager]
    D --> F[WhatsAppClient]
    D --> G[MessageQueue]
    D --> H[WebhookService]
    F --> I[whatsapp-web.js]
    G --> J[Redis/Bull]
    H --> A
    
    K[Frontend 28web] --> A
```

## Componentes

### 1. WhatsApp Gateway (Microserviço)

**Localização**: `28web-whatsapp-gateway/`

**Responsabilidades**:
- Gerenciar sessões WhatsApp
- Enviar e receber mensagens
- Sincronizar contatos
- Emitir eventos via webhooks
- Monitorar saúde do sistema

### 2. SessionManager

**Arquivo**: `28web-whatsapp-gateway/src/services/SessionManager.ts`

**Funcionalidades**:
- Criar e gerenciar múltiplas sessões
- Monitorar status das sessões
- Limpar sessões inativas
- Recuperar sessões após restart

**Interface**:
```typescript
interface ISessionManager {
  createSession(config: SessionConfig): Promise<Session>
  getSession(sessionId: string): Session | null
  deleteSession(sessionId: string): Promise<void>
  getAllSessions(): SessionInfo[]
  getSessionStats(): SessionStats
}
```

### 3. WhatsAppClient

**Arquivo**: `28web-whatsapp-gateway/src/services/WhatsAppClient.ts`

**Funcionalidades**:
- Wrapper sobre whatsapp-web.js
- Tratamento de eventos do WhatsApp
- Gerenciamento de QR code
- Envio de mensagens (texto, mídia)

**Eventos Tratados**:
- `qr`: QR code gerado
- `authenticated`: Sessão autenticada
- `ready`: Sessão pronta para uso
- `message_create`: Nova mensagem recebida
- `message_ack`: Confirmação de leitura
- `message_edit`: Mensagem editada
- `message_revoke_everyone`: Mensagem revogada
- `change_state`: Mudança de estado da conexão
- `change_battery`: Mudança no nível de bateria
- `disconnected`: Conexão perdida

### 4. MessageQueue

**Arquivo**: `28web-whatsapp-gateway/src/queue/MessageQueue.ts`

**Funcionalidades**:
- Fila de processamento de mensagens
- Retry automático em caso de falha
- Controle de concorrência
- Métricas de processamento

**Implementação**: Bull + Redis

### 5. WebhookService

**Arquivo**: `28web-whatsapp-gateway/src/services/WebhookService.ts`

**Funcionalidades**:
- Envio de eventos para backend principal
- Autenticação via API key
- Timeout e retry
- Logs de entregas

## API REST

### Endpoints

#### Sessões

```
POST   /api/v1/sessions              - Criar nova sessão
GET    /api/v1/sessions              - Listar sessões
GET    /api/v1/sessions/:id          - Obter detalhes da sessão
DELETE /api/v1/sessions/:id          - Deletar sessão
GET    /api/v1/sessions/:id/qr      - Obter QR code
```

#### Mensagens

```
POST   /api/v1/sessions/:id/messages  - Enviar mensagem
GET    /api/v1/sessions/:id/messages - Listar mensagens
```

#### Contatos

```
GET    /api/v1/sessions/:id/contacts - Listar contatos
POST   /api/v1/sessions/:id/contacts/sync - Sincronizar contatos
```

#### Saúde e Monitoramento

```
GET    /health                        - Saúde básica
GET    /health/detailed               - Saúde detalhada
GET    /health/sessions               - Métricas de sessões
GET    /health/system                 - Métricas do sistema
GET    /health/performance            - Métricas de performance
GET    /health/sessions/:id          - Status de sessão específica
```

## Eventos de Webhook

### Estrutura Base

```typescript
{
  sessionId: string,
  event: string,
  timestamp: number,
  data: any
}
```

### Tipos de Eventos

#### message
```typescript
{
  sessionId: string,
  event: "message",
  timestamp: 1702323456,
  data: {
    from: string,
    to: string,
    body: string,
    messageId: string,
    timestamp: number,
    isGroup: boolean
  }
}
```

#### message_create
```typescript
{
  sessionId: string,
  event: "message_create",
  timestamp: 1702323456,
  data: {
    id: string,
    from: string,
    to: string,
    body: string,
    timestamp: number,
    author?: string,
    isForwarded: boolean,
    isStatus: boolean
  }
}
```

#### session.status
```typescript
{
  sessionId: string,
  event: "session.status",
  timestamp: 1702323456,
  data: {
    status: "connecting" | "connected" | "disconnected" | "qr_code"
  }
}
```

#### qr_code
```typescript
{
  sessionId: string,
  event: "qr_code",
  timestamp: 1702323456,
  data: {
    qrCode: string, // base64
    timeout: number
  }
}
```

#### connection.status
```typescript
{
  sessionId: string,
  event: "connection.status",
  timestamp: 1702323456,
  data: {
    state: "open" | "connecting" | "closed" | "refused",
    lastSeen?: number
  }
}
```

#### disconnected
```typescript
{
  sessionId: string,
  event: "disconnected",
  timestamp: 1702323456,
  data: {
    reason: string,
    isReconnectable: boolean
  }
}
```

#### message_ack
```typescript
{
  sessionId: string,
  event: "message_ack",
  timestamp: 1702323456,
  data: {
    messageId: string,
    ack: number, // 0: pendente, 1: recebida, 2: lida, 3: reproduzida
    timestamp: number
  }
}
```

#### message_edit
```typescript
{
  sessionId: string,
  event: "message_edit",
  timestamp: 1702323456,
  data: {
    messageId: string,
    newBody: string,
    previousBody: string,
    editedAt: number
  }
}
```

#### message_revoke_everyone
```typescript
{
  sessionId: string,
  event: "message_revoke_everyone",
  timestamp: 1702323456,
  data: {
    messageId: string,
    revokedAt: number
  }
}
```

#### change_battery
```typescript
{
  sessionId: string,
  event: "change_battery",
  timestamp: 1702323456,
  data: {
    battery: number, // 0-100
    plugged: boolean
  }
}
```

## Integração com Backend Principal

### WhatsAppProvider

**Arquivo**: `backend/src/providers/WhatsAppProvider.ts`

**Implementação**: Adapter pattern implementando `IChannelProvider`

**Métodos**:
- `sendMessage()`: Envia mensagem via HTTP API
- `createSession()`: Cria sessão no gateway
- `deleteSession()`: Remove sessão
- `getSessionStatus()`: Verifica status da sessão
- `getContacts()`: Busca contatos sincronizados

### WhatsAppWebhookController

**Arquivo**: `backend/src/controllers/WhatsAppWebhookController.ts`

**Funcionalidades**:
- Receber eventos do gateway
- Processar mensagens recebidas
- Atualizar status de sessões
- Sincronizar contatos

**Handlers Implementados**:
- `handleIncomingMessage()`: Processa mensagens recebidas
- `handleSessionStatus()`: Atualiza status da sessão
- `handleQrCode()`: Processa QR code para autenticação
- `handleConnectionStatus()`: Monitora estado da conexão
- `handleDisconnected()`: Trata desconexões
- `handleMessageAck()`: Confirmações de leitura
- `handleMessageEdit()`: Mensagens editadas
- `handleMessageRevoke()`: Mensagens revogadas
- `handleBatteryChange()`: Mudanças no nível de bateria

## Configuração

### Variáveis de Ambiente

```bash
# Gateway
PORT=3001
NODE_ENV=production
API_KEY=sua-api-key-aqui

# Redis
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

# Database (opcional)
DATABASE_URL=postgresql://user:pass@localhost:5432/gateway

# Chrome (para whatsapp-web.js)
CHROME_EXECUTABLE_PATH=/usr/bin/google-chrome
CHROME_ARGS=--no-sandbox --disable-setuid-sandbox

# Webhook
APP_WEBHOOK_URL=https://app.28web.com.br/webhook/whatsapp
WEBHOOK_TIMEOUT=10000

# Monitoramento
HEALTH_CHECK_INTERVAL=30000
PERFORMANCE_MONITORING=false

# Storage
SESSIONS_PATH=./sessions
WWEBJS_AUTH_PATH=./.wwebjs_auth
```

### Docker Compose

```yaml
version: '3.8'

services:
  whatsapp-gateway:
    build: ./28web-whatsapp-gateway
    container_name: 28web-whatsapp-gateway
    ports:
      - "3001:3001"
    environment:
      - PORT=3001
      - NODE_ENV=production
      - API_KEY=${WHATSAPP_GATEWAY_API_KEY}
      - REDIS_URL=redis://redis:6379
      - APP_WEBHOOK_URL=${APP_WEBHOOK_URL}
      - WEBHOOK_TIMEOUT=10000
      - HEALTH_CHECK_INTERVAL=30000
      - PERFORMANCE_MONITORING=false
    volumes:
      - ./28web-whatsapp-gateway/sessions:/app/sessions
      - .data/.wwebjs_auth:/app/.wwebjs_auth
    depends_on:
      - redis
    restart: unless-stopped
    networks:
      - 28web-network

  redis:
    image: redis:7-alpine
    container_name: 28web-redis-gateway
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped
    networks:
      - 28web-network

volumes:
  redis_data:

networks:
  28web-network:
    driver: bridge
```

## Monitoramento e Saúde

### HealthController

**Arquivo**: `28web-whatsapp-gateway/src/controllers/HealthController.ts`

**Endpoints**:
- `/health`: Verificação básica de funcionamento
- `/health/detailed`: Saúde detalhada de todos os componentes
- `/health/sessions`: Métricas de sessões ativas
- `/health/system`: Recursos do sistema (CPU, memória)
- `/health/performance`: Métricas de performance
- `/health/sessions/:id`: Status de sessão específica

### Métricas Coletadas

#### Sessões
- Total de sessões
- Sessões ativas
- Sessões conectadas
- Sessões com QR code pendente
- Sessões desconectadas

#### Mensagens
- Mensagens na fila
- Mensagens processadas
- Mensagens falhadas
- Tempo médio de processamento

#### Sistema
- Uso de CPU
- Uso de memória
- Uso de disco
- Uptime do serviço

## Segurança

### Autenticação

- API key para autenticar requisições
- Header `x-28web-gateway-key`
- Validação em todos os endpoints

### Rate Limiting

- Implementado no nível de middleware
- Limites por IP e por API key
- Configurável via variáveis de ambiente

### Validação de Input

- Sanitização de todos os inputs
- Validação de schemas com Joi/Zod
- Proteção contra injection

## Performance

### Otimizações

- Connection pooling no Redis
- HTTP keep-alive
- Cache de sessões em memória
- Processamento assíncrono de mensagens
- Lazy loading de contatos

### Escalabilidade

- Horizontal scaling via load balancer
- Redis cluster para alta disponibilidade
- Sticky sessions para manter estado
- Auto-scaling baseado em métricas

## Troubleshooting

### Problemas Comuns

#### Sessão Não Conecta
1. Verificar se o QR code foi escaneado corretamente
2. Checar logs do gateway para erros de conexão
3. Validar configuração do Chrome/headless
4. Verificar se há bloqueio de firewall

#### Mensagens Não São Entregues
1. Verificar se a sessão está ativa
2. Checar se o número está formatado corretamente
3. Validar se há mensagens na fila com erro
4. Verificar logs do WebhookService

#### Webhooks Não São Recebidos
1. Verificar URL do webhook no gateway
2. Validar se a API key está correta
3. Checar se o backend está respondendo
4. Verificar logs de entrega do webhook

#### Alto Uso de Memória
1. Monitorar número de sessões ativas
2. Verificar se há sessões "zumbis"
3. Configurar GC do Node.js
4. Implementar restart periódico do container

### Logs

#### Níveis de Log
- `error`: Erros críticos
- `warn`: Alertas
- `info`: Informações gerais
- `debug`: Detalhes de debug

#### Estrutura
```json
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "level": "info",
  "sessionId": "sess_abc123",
  "message": "Session created successfully",
  "metadata": {}
}
```

## Roadmap Futuro

### Short Term (Próximas 2 semanas)
- [ ] Implementar retry exponencial para webhooks
- [ ] Adicionar métricas de latência
- [ ] Implementar cache de contatos no Redis
- [ ] Melhorar tratamento de erros

### Medium Term (Próximo mês)
- [ ] Suporte a múltiplos dispositivos por sessão
- [ ] Implementar rate limiting avançado
- [ ] Adicionar dashboard de monitoramento
- [ ] Suporte a mensagens programadas

### Long Term (Próximos 3 meses)
- [ ] Migrar para WhatsApp Business API
- [ ] Implementar clustering horizontal
- [ ] Adicionar suporte a templates
- [ ] Implementar analytics avançado

## Conclusão

O WhatsApp Gateway representa um passo crucial na estratégia de transformação do 28web Hub, isolando o componente mais crítico e instável do sistema em um microserviço dedicado. Esta arquitetura permite:

1. **Manutenibilidade**: Isolamento facilita updates e fixes
2. **Escalabilidade**: Escalonamento independente do componente
3. **Resiliência**: Falhas no gateway não afetam o core
4. **Flexibilidade**: Possibilidade de trocar implementação facilmente

A implementação atual já está funcional e pronta para produção, com monitoramento completo e tratamento robusto de erros.