# QA Checklist - Billing & Usage Tracking V1

## 📋 Informações
- Feature: Sistema de Billing e Usage Tracking
- Versão: 1.0.0-billing
- Ambiente de teste: Staging
- Data: //2025
- Testador: _______________

## ✅ Pré-requisitos
- [ ] Backend deployado em staging com versão correta
- [ ] Migrations executadas com sucesso
- [ ] Redis acessível e funcionando
- [ ] Seed de planos executado
- [ ] Token de autenticação de tenant disponível
- [ ] Token de autenticação de admin disponível

## 🧩 Testes Funcionais

### 1. APIs de Planos (Tenant)
- TC001 - Listar planos disponíveis
  - Endpoint: GET /api/billing/tenant/plans
  - Passos:
    1. Fazer request com token de tenant válido
    2. Verificar status code 200
    3. Validar response JSON
  - Resultado esperado:
    ```json
    [
      {
        "id": 1,
        "name": "Starter",
        "description": "Plano inicial para pequenos times",
        "price": 99.90,
        "currency": "BRL",
        "billingCycle": "monthly",
        "limits": {"messagesPerMonth":0,"storageGB":0,"users":0,"whatsappSessions":0},
        "features": {},
        "status": "active"
      }
    ]
    ```
  - Validações:
    - [ ] Array de planos retornado
    - [ ] Planos ordenados por price ASC
    - [ ] Apenas planos com status 'active'
    - [ ] Campos currency, description, billingCycle presentes
    - [ ] Limits contém messagesPerMonth, storageGB, users, whatsappSessions
  - Status: ⬜ Passou | ⬜ Falhou
  - Observações: _________________________________

- TC002 - Listar planos sem autenticação
  - Endpoint: GET /api/billing/tenant/plans
  - Passos:
    1. Fazer request SEM token de autenticação
  - Resultado esperado: 401 Unauthorized
  - Status: ⬜ Passou | ⬜ Falhou

### 2. APIs de Usage (Tenant)
- TC003 - Consultar uso atual
  - Endpoint: GET /api/billing/tenant/usage
  - Resultado esperado:
    ```json
    {"usage":{"messages":0,"storageBytes":0,"users":0,"whatsappSessions":0},"limits":{"messagesPerMonth":0,"storageGB":0,"users":0,"whatsappSessions":0}}
    ```
  - Validações:
    - [ ] usage com 4 métricas
    - [ ] limits com 4 limites
    - [ ] tenantId corresponde ao tenant autenticado
    - [ ] storageBytes numérico e >= 0
  - Status: ⬜ Passou | ⬜ Falhou

### 3. Tracking de Mensagens
- TC004 - Criar mensagem incrementa contador
  - Endpoint: POST /api/messages/:ticketId
  - Passos:
    1. Obter usage.messages atual
    2. Criar nova mensagem
    3. Checar incremento em usage.messages
  - Validações:
    - [ ] Contador incrementou
    - [ ] Storage não incrementou (sem anexo)
  - Status: ⬜ Passou | ⬜ Falhou

- TC005 - Criar mensagem com anexo incrementa storage
  - Endpoint: POST /api/messages/:ticketId
  - Passos:
    1. Obter usage.storageBytes atual
    2. Criar mensagem com upload (ex.: 1MB)
    3. Verificar incremento ~1MB
  - Validações:
    - [ ] Storage incrementou aprox. tamanho do arquivo
    - [ ] Mensagens incrementou
  - Status: ⬜ Passou | ⬜ Falhou

### 4. Validação de Limites (checkPlanLimits)
- TC006 - Bloquear criação quando limite de mensagens atingido
  - Setup: no Redis, setar usage:1:YYYYMM messages próximo ao limite
  - Esperado: 402 Payment Required com limitType 'messages'

- TC007 - Bloquear upload quando limite de storage atingido
  - Endpoint: POST /contacts/upload
  - Setup: setar storageBytes no limite
  - Esperado: 402 com limitType 'storage'

### 5. Tracking de Usuários
- TC008 - Criar usuário incrementa contador
  - Endpoint: POST /api/users
  - Validações: contador users incrementou

- TC009 - Bloquear criação quando limite de usuários atingido
  - Setup: users no limite
  - Esperado: 402

### 6. Tracking de Sessões WhatsApp
- TC010 - Iniciar sessão incrementa contador
  - Endpoint: POST /whatsappsession/:whatsappId

- TC011 - Bloquear quando limite de sessões atingido
  - Setup: whatsappSessions no limite
  - Esperado: 402

### 7. Storage em Campanhas
- TC012 - Upload de mídia em campanha incrementa storage
  - Endpoint: POST /campaigns
  - Validações: incremento ~tamanho do arquivo

### 8. APIs de Admin
- TC013 - Admin lista todos os planos (ativos e inativos)
- TC014 - Admin consulta uso de tenant específico
- TC015 - Tenant não acessa APIs de admin (403)

### 🔍 Edge Cases
- TC016 - Tenant sem plano ativo usa defaults
- TC017 - Override de Tenant.maxUsers aplicado

### 🔄 Concorrência (opcional)
- TC018 - 10 mensagens simultâneas incrementam exatamente 10
  - Nota: pode haver pequeno desvio até refatorar atomicidade

### 📊 Redis
- TC019 - Estrutura de chaves correta usage:{tenantId}:{YYYYMM}

### 🛡️ Segurança
- TC020 - Tenant não acessa usage de outro tenant

## 📝 Resumo de Testes
- Total: 20
- Passou: ___
- Falhou: ___
- Bloqueados: ___
- Bugs encontrados: _______________
- Recomendação: ⬜ Aprovar | ⬜ Requer correções
- Assinatura QA: ______  Data: //2025
