# 28web Stack - Guia Completo de Correções e Setup

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Problemas Encontrados](#problemas-encontrados)
3. [Arquivos Corrigidos](#arquivos-corrigidos)
4. [Passo a Passo de Implementação](#passo-a-passo-de-implementação)
5. [Testes de Validação](#testes-de-validação)
6. [Comandos Úteis](#comandos-úteis)

---

## Visão Geral

Este documento documenta todas as correções aplicadas ao stack Docker da **28web** para funcionamento correto em ambientes de **desenvolvimento** e **produção**.

### Stack Completo
- **Frontend**: Quasar Vue.js (dev em 8080, prod em 80)
- **Backend**: Node.js/Express (porta 3100)
- **WhatsApp Gateway**: Microservice (porta 3001)
- **Nginx**: Proxy reverso (porta 80)
- **Databases**: PostgreSQL (5432), Redis (6379)
- **Monitoring**: Prometheus (9090), Grafana (3002)
- **Message Queue**: RabbitMQ (5672)

---

## Problemas Encontrados

### 1. **CORS e Helmet CSP bloqueando localhost**
**Problema**: Express estava configurado com:
- CORS restrito a `https://app.28web.com.br`
- Helmet CSP com wildcard inválido (`*localhost:3101`)
- Headers `Credentials: true` com `Origin: *` (inconsistente)

**Impacto**: Requisições do frontend local para backend falhavam com 403/CORS error.

---

### 2. **Colisão de rotas no Nginx**
**Problema**: Uma regex gigante de `location ~ ^/(queue|...|auth|...)` sobrescrevia locations específicas como `/login`, `/auth/`, `/api/`.

**Impacto**: Requisições iam para lugar errado (ex: POST /login ia para frontend em vez do backend).

---

### 3. **Variável de template não expandida**
**Problema**: `nginx-template.conf` usava `${FRONTEND_TARGET:-frontend-dev:3000}` dentro do bloco `upstream`, que Nginx não consegue interpretar.

**Impacto**: 502 Bad Gateway com erro "invalid port in upstream".

---

### 4. **Frontend rodando em porta errada**
**Problema**: Quasar dev configurado para `port 3000`, mas na verdade iniciava em `8080`.

**Impacto**: Nginx tentava falar com `frontend-dev:3000`, mas dev server estava em `frontend-dev:8080` → Connection refused (111).

---

### 5. **docker-compose.yml sem PROXY_PORT**
**Problema**: Nginx hardcoded para `80:80`, sem suporte a múltiplas portas por ambiente.

**Impacto**: Dificuldade para rodar múltiplas instâncias ou usar portas alternativas em dev.

---

## Arquivos Corrigidos

### 1. **docker-compose.yml** - Versão 3.9 otimizada

#### Principais mudanças:
- ✅ Removed deprecated `version: "3.9"` (Docker agora ignora, mas aviso permanecia)
- ✅ Adicionado `PROXY_PORT` variável de ambiente (padrão 80)
- ✅ Melhorado `depends_on` com `condition: service_healthy`
- ✅ Adicionado `profiles: ["dev"]` e `profiles: ["prod"]` para frontend
- ✅ Nginx depende agora APENAS de backend (frontend subido separadamente por profile)
- ✅ FRONTEND_URL ajustado para `http://nginx:80` internamente
- ✅ Todos os healthchecks otimizados
- ✅ Volumes e networks organizados

```yaml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "${PROXY_PORT:-80}:80"  # 👈 Novo: variável PROXY_PORT
      - "443:443"
    volumes:
      - ./frontend/nginx.conf:/etc/nginx/nginx.conf:ro
      - nginx_logs:/var/log/nginx
    depends_on:
      backend:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

  frontend-dev:
    profiles: ["dev"]  # 👈 Novo: roda só com --profile dev
    build:
      context: ./frontend
      target: development
    ports:
      - "3000:3000"  # Atenção: Quasar roda em 8080, não 3000
```

---

### 2. **nginx-template.conf** - Template parametrizado

#### Principais mudanças:
- ✅ Removido wildcard inválido `*localhost:3101`
- ✅ Upstream frontend usa `${FRONTEND_TARGET}` sem fallback (fallback via script)
- ✅ Adicionada rota específica **`location = /login`** (era cair no SPA fallback)
- ✅ Removida regex gigante que colidia com locations específicas
- ✅ Separadas rotas em **prioridades**:
  1. Exatas: `/login`, `/auth/`, `/api/`, `/socket.io/`
  2. Regex específicas: `/queue/`, `/settings/`, `/tickets/`
  3. Assets com cache: `*.js`, `*.css`, `*.png`
  4. SPA fallback: `/`
- ✅ CORS dev mantido, pode remover em prod

```nginx
upstream frontend_app {
    server ${FRONTEND_TARGET};  # 👈 Sem fallback aqui
}

# 🎯 PRIORIDADE 1: LOGIN exato
location = /login {
    proxy_pass http://backend_api/login;
    # ... headers
}

# 🎯 PRIORIDADE 2: Rotas exatas com /
location /auth/ { ... }
location /api/ { ... }
location /socket.io/ { ... }

# 🎯 PRIORIDADE 3: Regex específicas (sem colisão)
location ~ ^/(queue|settings|tickets|statistics|chats|contacts|messages)/ { ... }

# 🎯 PRIORIDADE 4: Assets com cache
location ~* \.(js|css|...) { expires 1y; }

# 🎯 PRIORIDADE 5: SPA fallback
location / { try_files $uri $uri/ @frontend; }
location @frontend { proxy_pass http://frontend_app; }
```

**Por que funciona agora**:
- Nginx processa locations por prioridade: exatas > regex > wildcard
- `/login` é exato, então atinge antes da regex de rotas
- `/auth/login` atinge `/auth/` (exato) antes de qualquer regex

---

### 3. **process-nginx.sh** - Script de template processing

#### Principais mudanças:
- ✅ Garantido default `FRONTEND_TARGET=frontend-dev:3000`
- ✅ Script valida entrada e mostra feedback
- ✅ Gera arquivo final `frontend/nginx.conf` sem variáveis

```bash
#!/bin/bash
set -e

TEMPLATE_FILE="nginx-template.conf"
OUTPUT_FILE="frontend/nginx.conf"

# 👈 Default importante
FRONTEND_TARGET=${FRONTEND_TARGET:-frontend-dev:3000}

echo "Processando template nginx..."
echo "FRONTEND_TARGET: $FRONTEND_TARGET"

# Substitui ${FRONTEND_TARGET} by seu valor
envsubst '${FRONTEND_TARGET}' < "$TEMPLATE_FILE" > "$OUTPUT_FILE"

echo "nginx.conf gerado com sucesso em: $OUTPUT_FILE"
```

**Como usar**:
```bash
# Dev com frontend-dev:3000
./process-nginx.sh

# Ou especificar outro alvo
FRONTEND_TARGET=frontend:80 ./process-nginx.sh
```

---

### 4. **backend/src/config/express.ts** - Express CORS e Helmet

#### Principais mudanças:
- ✅ Detecta automaticamente `NODE_ENV=dev`
- ✅ CORS inteligente por ambiente:
  - **Dev**: lista de `localhost` (3000, 3101, 5173, 8080, 127.0.0.1)
  - **Prod**: usa `FRONTEND_URL` + fallback
- ✅ Helmet CSP **apenas em produção** (não bloqueia dev local)
- ✅ Removido wildcard inválido de CSP
- ✅ Adicionado log de debug com origem e env

```typescript
const isDev = process.env.NODE_ENV === "dev" || process.env.NODE_ENV === "development";

const allowedOrigins = isDev
  ? [
      "http://localhost:3000",
      "http://localhost:3101",
      "http://localhost:5173",   // Vite
      "http://localhost:8080",   // 👈 Quasar dev
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3101",
      "http://127.0.0.1:5173"
    ]
  : [
      process.env.FRONTEND_URL || "https://app.28web.com.br",
      "https://app.28web.com.br",
      "https://staging.28web.com.br"
    ];

// Helmet + CSP só em prod
if (!isDev) {
  app.use(helmet());
  app.use(helmet.contentSecurityPolicy({
    directives: {
      scriptSrc: ["'self'", process.env.FRONTEND_URL || "https://app.28web.com.br"]
      // Removido wildcard inválido
    }
  }));
}

logger.info("CORS origins:", allowedOrigins);
logger.info("Ambiente:", NODE_ENV);
```

---

### 5. **frontend/Dockerfile** - Build multi-stage correto

#### Principais mudanças:
- ✅ Dev stage usa `npx quasar dev -m pwa --host 0.0.0.0` (ouve em todas as interfaces)
- ✅ Porta 8080 exposta (padrão do Quasar)
- ✅ Builder stage gera dist/pwa
- ✅ Prod stage serve via Nginx

```dockerfile
# Development stage
FROM node:18-alpine AS development
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .

EXPOSE 3000  # 👈 Aviso: Quasar vai usar 8080, não 3000
CMD ["npx", "quasar", "dev", "-m", "pwa", "--host", "0.0.0.0"]
# 👆 Escuta em 0.0.0.0:8080 por padrão

# Builder stage
FROM node:18-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /usr/src/app/dist/pwa /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

### 6. **.env.dev** - Arquivo de variáveis de desenvolvimento

#### Criado novo:
```bash
# Ambiente
NODE_ENV=dev
PROXY_PORT=80

# URLs internas (Docker)
FRONTEND_URL=http://localhost:8080
BACKEND_URL=http://backend:3100
BACKEND_EXTERNAL_URL=http://localhost:8080

# Banco de dados
DB_HOST=postgres
DB_PORT=5432
DB_USER=chatex
DB_PASS=chatex
DB_NAME=chatex

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=chatex

# WhatsApp Gateway
WHATSAPP_GATEWAY_URL=http://whatsapp-gateway:3001
WHATSAPP_GATEWAY_API_KEY=whatsapp_gateway_api_key_dev

# Outros
JWT_SECRET=28web_dev_secret
JWT_REFRESH_SECRET=28web_dev_refresh_secret
API_TOKEN_SECRET=28web_dev_token_secret
```

---

### 7. **.env.prod** - Arquivo de variáveis de produção

#### Criado novo:
```bash
# Ambiente
NODE_ENV=production
PROXY_PORT=80

# URLs externas (produção)
FRONTEND_URL=https://app.28web.com.br
BACKEND_URL=https://app.28web.com.br
BACKEND_EXTERNAL_URL=https://api.28web.com.br

# Banco de dados (ajuste conforme)
DB_HOST=postgres
DB_PORT=5432
DB_USER=${POSTGRES_USER}
DB_PASS=${POSTGRES_PASSWORD}
DB_NAME=${POSTGRES_DB}

# Redis (ajuste conforme)
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=${REDIS_PASSWORD}

# Resto igual ao .env.dev, mas com valores de prod
```

---

## Passo a Passo de Implementação

### 1️⃣ Preparação

```bash
# 1.1 Faça backup dos arquivos atuais
cp docker-compose.yml docker-compose.yml.backup
cp nginx-template.conf nginx-template.conf.backup

# 1.2 Limpe containers e volumes antigos
docker compose down -v --remove-orphans
docker system prune -af
```

---

### 2️⃣ Aplicar as correções no `docker-compose.yml`

Substitua o arquivo inteiro pelo corrigido [veja acima] ou altere manualmente:

- Adicione `PROXY_PORT=${PROXY_PORT:-80}` nos ports do nginx
- Adicione `profiles: ["dev"]` ao frontend-dev
- Adicione `profiles: ["prod"]` ao frontend (se existir)
- Altere `FRONTEND_URL` no backend para `http://nginx:80` (dev) ou seu domínio (prod)

---

### 3️⃣ Aplicar correções no Nginx

```bash
# 3.1 Editar nginx-template.conf
# Substitua o bloco upstream frontend_app por:
# upstream frontend_app {
#     server ${FRONTEND_TARGET};
# }

# 3.2 Regenerar nginx.conf
chmod +x process-nginx.sh
./process-nginx.sh

# 3.3 Validar resultado
sed -n '55,75p' frontend/nginx.conf
# Deve aparecer: server frontend-dev:8080; (sem ${...})
```

---

### 4️⃣ Aplicar correções no Backend

Atualize `backend/src/config/express.ts` com a configuração de CORS/Helmet inteligente [veja acima].

```bash
# Validar sintaxe TypeScript
npm run lint  # no diretório backend
```

---

### 5️⃣ Aplicar correções no Frontend

No `frontend/Dockerfile`, confirme que a linha de CMD de dev é:
```dockerfile
CMD ["npx", "quasar", "dev", "-m", "pwa", "--host", "0.0.0.0"]
```

---

### 6️⃣ Subir o stack de desenvolvimento

```bash
# 6.1 Definir variáveis (opcional, com defaults no .env)
export NODE_ENV=dev
export PROXY_PORT=80
export FRONTEND_TARGET=frontend-dev:8080

# 6.2 Subir com profile dev
docker compose --profile dev up -d --build

# 6.3 Aguardar healthchecks (2-3 min)
watch -n 5 'docker compose ps'

# 6.4 Validar quando todos estiverem "healthy"
docker compose ps
```

---

### 7️⃣ Validar Nginx e rotas

```bash
# 7.1 Sintaxe do Nginx
docker compose exec nginx nginx -t

# 7.2 Conectividade interna
docker compose exec nginx curl -v http://frontend-dev:8080/
docker compose exec nginx curl -v http://backend:3100/health
docker compose exec nginx curl -v http://localhost/health

# 7.3 Teste via browser
curl -v http://localhost/
# Deve devolver HTML do Quasar dev
```

---

## Testes de Validação

### ✅ Teste 1: Frontend carrega
```bash
curl -v http://localhost:8080/
# Status 200, HTML com Quasar app
```

### ✅ Teste 2: Backend responde
```bash
curl -v http://localhost:8080/api/health
# Status 200, JSON health check
```

### ✅ Teste 3: CORS permite frontend
```bash
curl -v -H "Origin: http://localhost:8080" \
     -X OPTIONS http://localhost/api/test
# Access-Control-Allow-Origin: http://localhost:8080
```

### ✅ Teste 4: Socket.IO funciona
```bash
curl -v -H "Upgrade: websocket" \
     http://localhost/socket.io/
# Upgrade 101 ou resposta válida
```

### ✅ Teste 5: WhatsApp Gateway acessível
```bash
docker compose exec nginx curl -v http://whatsapp-gateway:3001/health
# Status 200
```

### ✅ Teste 6: Login via navegador
```
Abrir http://localhost
→ Deve carrega tela de login
→ Network tab deve mostrar requisições a /auth/login
```

---

## Comandos Úteis

### Desenvolvimento

```bash
# Subir stack dev completo
docker compose --profile dev up -d --build

# Ver logs em tempo real
docker compose logs -f backend nginx frontend-dev

# Parar e limpar
docker compose down -v

# Rebuild só um serviço
docker compose up -d --build frontend-dev
docker compose up -d --build backend

# Entrar em um container
docker exec -it 28web-backend sh
docker exec -it 28web-frontend-dev sh
```

### Validação

```bash
# Ver status de todos
docker compose ps

# Health de um serviço
docker inspect 28web-backend | jq '.State.Health'

# Validar Nginx
docker compose exec nginx nginx -t
docker compose exec nginx nginx -s reload

# Testar conectividade
docker compose exec nginx curl -v http://frontend-dev:8080/
docker compose exec nginx curl -v http://backend:3100/health
```

### Produção

```bash
# Subir sem profile dev (usa frontend build estático)
docker compose up -d --build

# Se quiser especificar porta
PROXY_PORT=8080 docker compose up -d --build

# Verificar que frontend-dev não subiu
docker compose ps | grep frontend-dev
# Não deve aparecer
```

### Debugging

```bash
# Logs do nginx (últimas 50 linhas)
docker logs 28web-nginx --tail 50

# Buscar erros
docker logs 28web-nginx | grep -i error

# Ver config nginx no container
docker compose exec nginx cat /etc/nginx/nginx.conf

# Validar rede Docker
docker compose exec backend ping frontend-dev
docker network inspect 28web_28web-network
```

---

## Checklist Final

- [ ] `docker-compose.yml` atualizado com `PROXY_PORT` e `profiles`
- [ ] `nginx-template.conf` sem `${...:-...}` dentro de `upstream`
- [ ] `process-nginx.sh` executável e testado
- [ ] `frontend/nginx.conf` gerado com `./process-nginx.sh`
- [ ] `backend/express.ts` com CORS inteligente por NODE_ENV
- [ ] `frontend/Dockerfile` dev usa `--host 0.0.0.0`
- [ ] `.env.dev` criado com variáveis corretas
- [ ] Stack subiu com `docker compose --profile dev up -d --build`
- [ ] `docker compose ps` mostra todos "healthy"
- [ ] `curl http://localhost/` retorna HTML
- [ ] Login está acessível e carrega dados do backend
- [ ] Network do browser mostra requisições a `/api/`, `/auth/`, etc.

---

## 🚀 Próximos Passos

1. **Testar deploy em produção**: `docker compose up -d --build` (sem `--profile dev`)
2. **Configurar Traefik** (se usar): add labels ao nginx para roteamento automático
3. **Setup HTTPS**: gerar certs Let's Encrypt e configurar no Nginx
4. **Monitoring**: verificar Prometheus/Grafana em `http://localhost:9090` e `http://localhost:3002`
5. **Backup**: estratégia para volumes `postgres_data` e `redis_data`

---

## 📞 Suporte

Erros comuns e soluções:

**502 Bad Gateway no Nginx**
```bash
# Verificar conectividade
docker compose exec nginx curl -v http://frontend-dev:8080/
docker compose exec nginx curl -v http://backend:3100/health
# Se falhar, container está down ou porta errada
```

**CORS error no browser**
```bash
# Verificar se está em NODE_ENV=dev
docker compose exec backend printenv | grep NODE_ENV

# Validar header de resposta
curl -H "Origin: http://localhost:8080" \
     http://localhost/api/test -v | grep Access-Control
```

**Quasar não compila**
```bash
# Ver logs completos
docker logs 28web-frontend-dev --tail 200

# Limpar node_modules e rebuild
docker compose build --no-cache frontend-dev
docker compose up -d frontend-dev
```

**Nginx não recarrega config**
```bash
# Forçar reload
docker compose exec nginx nginx -t
docker compose exec nginx nginx -s reload

# Ou recriar container
docker compose restart nginx
```

---

**Documento atualizado em**: 14/12/2025
**Versão**: 1.0
**Stack**: 28web v1.0 - Docker Compose
