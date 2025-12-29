# ✅ VERIFICAÇÃO PRÉ-IMPLEMENTAÇÃO

## 1. Verificação do Projeto Atual

### 1.1 - Verificar Modelo Whatsapp

```bash
cd backend/src/models
ls -la Whatsapp.ts
grep -E "(qrcode|status|number)" Whatsapp.ts
```

✅ **Esperado:**
```
@Column(DataType.TEXT)
qrcode: string;

@Column
status: string;

@Column
number: string;
```

---

### 1.2 - Verificar Controller Webhook

```bash
cd backend/src/controllers
ls -la WhatsAppWebhookController.ts
grep -E "getIO|logger|HandleMessage" WhatsAppWebhookController.ts
```

✅ **Esperado:**
```typescript
import { getIO } from "../libs/socket";
import { logger } from "../utils/logger";
import HandleMessage from "../services/WbotServices/helpers/HandleMessage";
```

---

### 1.3 - Verificar Rotas

```bash
cd backend/src/routes
ls -la whatsappWebhookRoutes.ts
cat whatsappWebhookRoutes.ts
```

✅ **Esperado:**
```typescript
import { Router } from "express";
import WhatsAppWebhookController from "../controllers/WhatsAppWebhookController";

const router = Router();
router.post("/", WhatsAppWebhookController.handle);
export default router;
```

---

### 1.4 - Verificar Socket.io

```bash
ls -la backend/src/libs/socket.ts
grep -A 5 "export.*getIO" backend/src/libs/socket.ts
```

✅ **Esperado:**
```typescript
export const getIO = () => io;
```

---

### 1.5 - Verificar HandleMessage

```bash
ls -la backend/src/services/WbotServices/helpers/HandleMessage.ts
grep "export" backend/src/services/WbotServices/helpers/HandleMessage.ts
```

✅ **Esperado:**
```typescript
export default HandleMessage;
```

---

## 2. Verificação do Banco de Dados

### 2.1 - Conectar ao Banco

```bash
# PostgreSQL
psql -h localhost -U seu_user -d seu_database

# MySQL
mysql -h localhost -u seu_user -p seu_database
```

---

### 2.2 - Verificar Tabela Whatsapps

```sql
DESC "Whatsapps";
-- ou
DESCRIBE "Whatsapps";
```

✅ **Esperado:**
```
Column Name  | Data Type
-------------|----------
id           | integer (PK)
name         | text/varchar
status       | text/varchar
qrcode       | text/varchar
number       | text/varchar
tenantId     | integer (FK)
createdAt    | timestamp
updatedAt    | timestamp
```

---

### 2.3 - Verificar Dados Existentes

```sql
SELECT id, name, status, number, qrcode 
FROM "Whatsapps" 
ORDER BY id DESC 
LIMIT 5;
```

---

## 3. Verificação da Estrutura de Pastas

```bash
ls -la backend/src/adapters/
# Se não existir:
mkdir -p backend/src/adapters
```

---

## 4. Verificação do Build

```bash
cd backend
npm run build
# ou
npx tsc --noEmit
```

✅ **Esperado:**
```
Successfully compiled X files with TypeScript
```

---

## 5. Teste Rápido de Rota Existente

```bash
curl -X POST http://localhost:3100/api/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "1", "event": "test", "data": {}}'

# Esperado: 200 OK ou erro esperado
```

---

## ✅ Checklist Pré-Implementação

Marque todos os ✅:

### Estrutura
- [ ] `Whatsapp.ts` existe e tem campos corretos
- [ ] `WhatsAppWebhookController.ts` existe
- [ ] `whatsappWebhookRoutes.ts` existe
- [ ] Pasta `adapters/` existe ou pode ser criada
- [ ] Socket.io está configurado
- [ ] HandleMessage está disponível

### Banco de Dados
- [ ] Consegui conectar ao banco
- [ ] Tabela `Whatsapps` existe
- [ ] Coluna `qrcode` existe
- [ ] Coluna `status` existe
- [ ] Coluna `number` existe

### Build
- [ ] Backend compila sem erros
- [ ] Sem erros de TypeScript
- [ ] Backend inicia sem erros
- [ ] Socket.io funciona

### Dependências
- [ ] Express instalado
- [ ] Sequelize instalado
- [ ] Socket.io instalado
- [ ] TypeScript instalado

---

**Se todos os checkboxes passaram, você está pronto! ✅**
