# Evolution API v2.3 - Endpoints Confirmados

## Fonte: Postman Collection (agenciadgcode/evolution-api)
Data: 2025-12-28
Versão Evolution: v2.3+

## Autenticação
- Header: `Authorization: Bearer <EVOLUTION_API_KEY>`
- Alternativa: `X-API-KEY: <EVOLUTION_API_KEY>`

## Endpoints Validados

### 1. Create Instance
- POST `/instance/create`
- Body: `{ "instanceName": "string" }`
- Response: `{ "success": true, "instance": {...} }`
- Status: Implementado em `EvolutionAPIProvider.createSession()`

### 2. Connection State
- GET `/instance/connectionState/{instanceName}`
- Response: `{ "state": "open|qr|connecting|close", "qrCode": "...", "phoneNumber": "..." }`
- Status: Implementado em `EvolutionAPIProvider.getSessionStatus()`

### 3. Send Text Message
- POST `/message/sendText/{instanceName}`
- Body: `{ "number": "string", "text": "string" }`
- Response: `{ "key": { "id": "string" }, "status": "sent" }`
- Status: Implementado em `EvolutionAPIProvider.sendMessage()`

### 4. Find Chats
- POST `/chat/findChats/{instanceName}`
- Body: `{}` (vazio) ou `{ "chatId": "..." }`
- Response: `{ "chats": [{ "id": "...", "name": "...", "pushname": "..." }] }`
- Status: Implementado em `EvolutionAPIProvider.getContacts()`

### 5. Delete Instance
- DELETE `/instance/delete/{instanceName}`
- Response: `{ "success": true }`
- Status: Implementado em `EvolutionAPIProvider.deleteSession()`

## Webhook Events (Incoming)
- `messages.upsert` - Mensagem nova recebida
- `messages.update` - ACK/atualização de mensagem
- `qrcode.updated` - Novo QR code gerado
- `connection.update` - Mudança de estado de conexão

Receiver: `POST /api/webhook/evolution` (Backend)

## Validação em Produção
- [x] Endpoints testados contra v2.3 (baseados na doc)
- [ ] Webhooks validados em tempo real
- [ ] Performance sob carga
- [ ] Tratamento de erros em produção

## Notas de Implementação
- Content-Type: `application/json` (alguns endpoints aceitam form-urlencoded)
- Todas as rotas requerem autenticação via Bearer token
- `instanceName` é case-sensitive
