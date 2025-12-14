# Checklist de Instalação - 28web Hub SaaS

## ✅ PRÉ-INSTALAÇÃO

### 1. Requisitos de Sistema
- [ ] **Node.js** >= 20.19.6
- [ ] **Docker** >= 20.10.0
- [ ] **Docker Compose** >= 2.20.0
- [ ] **PostgreSQL** >= 15 (recomendado 15-alpine)
- [ ] **Redis** >= 7 (recomendado 7-alpine)
- [ ] **Git** para clonar repositório
- [ ] **4GB+ RAM** mínimo recomendado
- [ ] **20GB+ Storage** disponível

### 2. Dependências Externas
- [ ] **Domínio** configurado (se produção)
- [ ] **SSL/TLS** certificado (se produção)
- [ ] **Firewall** portas 80, 443, 3001, 8080
- [ ] **Backup** estratégico definido
- [ ] **Monitoramento** configurado

---

## ✅ PASSO 1: CLONAR E CONFIGURAR

### 1.1. Clonar Repositório
```bash
# Clonar projeto principal
git clone https://github.com/usuario/28web-hub.git

# Ou clonar com SSH (recomendado)
git clone git@github.com:usuario/28web-hub.git
```

### 1.2. Estrutura de Diretórios
```
28web-hub/
├── backend/          # Backend Node.js/TypeScript
├── frontend/         # Frontend Vue.js/Quasar
├── 28web-whatsapp-gateway/  # Microserviço WhatsApp
├── docker-compose.yml  # Orquestração Docker
├── docs/             # Documentação
├── .env.example       # Variáveis de ambiente
└── README.md          # Instruções
```

### 1.3. Configurar Variáveis de Ambiente
```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar configurações críticas
nano .env
```

**Variáveis obrigatórias:**
```bash
# Database
POSTGRES_HOST=postgres
POSTGRES_USER=chatex
POSTGRES_PASSWORD=SUA_SENHA_FORTA
POSTGRES_DB=chatex
DB_PORT=5432

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=SUA_SENHA_FORTA

# JWT Secrets (GERAR NOVOS!)
JWT_SECRET=SUA_CHAVE_JWT_SECRETA
JWT_REFRESH_SECRET=SUA_CHAVE_JWT_REFRESH_SECRET
API_TOKEN_SECRET=SUA_CHAVE_API_TOKEN_SECRETA

# URLs
BACKEND_URL=http://backend:3100
FRONTEND_URL=http://nginx:80
PROXY_PORT=80

# WhatsApp Gateway
WHATSAPP_GATEWAY_URL=http://whatsapp-gateway:3001
WHATSAPP_GATEWAY_API_KEY=SUA_CHAVE_GATEWAY_API

# Billing (se usar)
BILLING_PROVIDER=vendaerp
VENDAERP_API_URL=https://api.vendaerp.com.br
VENDAERP_API_TOKEN=SEU_TOKEN_VENDAERP

# Domínio (produção)
DOMAIN=seudominio.com.br
```

---

## ✅ PASSO 2: PREPARAR INFRAESTRUTURA

### 2.1. Instalar Docker e Docker Compose
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker
sudo systemctl enable docker

# CentOS/RHEL
sudo yum install -y docker
sudo systemctl enable docker
sudo systemctl start docker

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)-x86_64" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2.2. Preparar Volumes Persistentes
```bash
# Criar diretórios para dados persistentes
sudo mkdir -p /opt/28web-hub/{postgres,redis,uploads,sessions,logs}
sudo chown -R $USER:$USER /opt/28web-hub
sudo chmod -R 755 /opt/28web-hub

# Ajustar permissões do SELinux (se necessário)
sudo semanage fcontext -a -t svirt_sandbox_file_t /opt/28web-hub/postgres_data "postgresql_db_t:s0"
sudo restorecon -Rv /opt/28web-hub/postgres_data
```

### 2.3. Otimizar Configurações Docker
```bash
# Limitar recursos do container
echo '{"default-ulimits":{"memlock":"256M","nofile":"1024","nproc":"512"}}' | sudo tee -a /etc/docker/daemon.json

# Configurar log rotation
echo '{"log-driver":"json-file","log-opts":{"max-size":"10m","max-file":"3"}}' | sudo tee -a /etc/docker/daemon.json
```

---

## ✅ PASSO 3: INSTALAR E CONFIGURAR BANCO DE DADOS

### 3.1. PostgreSQL
```bash
# Ubuntu
sudo apt update
sudo apt install -y postgresql postgresql-contrib

# CentOS/RHEL
sudo yum install -y postgresql-server postgresql-contrib

# Criar banco e usuário
sudo -u postgres createdb chatex
sudo -u postgres createuser --interactive chatex
sudo -u postgres psql -d chatex -c "GRANT ALL PRIVILEGES ON DATABASE chatex TO chatex;"
sudo -u postgres psql -d chatex -c "ALTER USER chatex WITH PASSWORD 'senha_forte';"
```

### 3.2. Redis
```bash
# Ubuntu
sudo apt install -y redis-server

# CentOS/RHEL
sudo yum install -y redis

# Configurar Redis
sudo nano /etc/redis/redis.conf
# Adicionar: requirepass sua_senha_forte
# Adicionar: bind 127.0.0.1 seu_ip
sudo systemctl enable redis
sudo systemctl start redis
```

### 3.3. Opcional: PostgreSQL Externo (Nuvem)
```bash
# AWS RDS
aws rds create-db-instance \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --db-instance-identifier 28web-hub-prod \
  --master-username postgres \
  --master-password senha_forte \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxxxxxxxx

# Google Cloud SQL
gcloud sql instances create 28web-hub-prod \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --authorized-networks=default
  --storage-size=20GB
  --database-name=chatex
```

---

## ✅ PASSO 4: EXECUTAR PROJETO

### 4.1. Subir Serviços
```bash
# Entrar no diretório do projeto
cd 28web-hub

# Construir e subir containers
docker-compose up -d --build

# Verificar status dos containers
docker-compose ps

# Verificar logs
docker-compose logs -f backend
docker-compose logs -f postgres
docker-compose logs -f redis
```

### 4.2. Configurar Reverse Proxy (Nginx)
```bash
# Instalar Nginx
sudo apt install -y nginx

# Configurar proxy reverso
sudo nano /etc/nginx/sites-available/28web-hub
```

**Configuração Nginx:**
```nginx
server {
    listen 80;
    server_name seu.dominio.com.br;
    
    # Frontend Vue.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # WebSocket
    location /socket.io/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
    
    # WhatsApp Gateway
    location /whatsapp-gateway/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 4.3. Configurar SSL (Let's Encrypt)
```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Gerar certificado
sudo certbot --nginx -d seu.dominio.com.br

# Testar renovação automática
sudo certbot renew --dry-run
```

---

## ✅ PASSO 5: VERIFICAÇÃO FINAL

### 5.1. Teste de Conectividade
```bash
# Testar Backend
curl -X GET http://localhost:8080/health

# Testar Frontend
curl -X GET http://localhost:3000

# Testar WhatsApp Gateway
curl -X GET http://localhost:3001/health

# Testar PostgreSQL
docker exec -it 28web-postgres psql -U chatex -d chatex -c "SELECT version();"

# Testar Redis
docker exec -it 28web-redis redis-cli ping
```

### 5.2. Verificar Logs
```bash
# Logs de aplicação
docker-compose logs --tail=100 backend

# Logs de sistema
sudo journalctl -u docker -f

# Logs Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### 5.3. Acesso Inicial
```bash
# Acessar aplicação
http://localhost ou http://seu_ip

# Criar primeiro tenant (via API ou direto no banco)
curl -X POST http://localhost:8080/api/tenants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_ADMIN" \
  -d '{
    "name": "Empresa Demo",
    "email": "admin@empresa.com",
    "phone": "5548999999999",
    "document": "12345678901",
    "plan": "starter"
  }'
```

---

## 🚨 POSSÍVEIS PROBLEMAS E SOLUÇÕES

### Banco de Dados
- **Erro:** `FATAL: database "chatex" does not exist`
  **Solução:** `sudo -u postgres createdb chatex`

### Conexão PostgreSQL
- **Erro:** `connection refused` ou `timeout`
  **Solução:** Verificar se PostgreSQL está rodando: `sudo systemctl status postgresql`

### Memória Insuficiente
- **Erro:** Containers reiniciando aleatoriamente
  **Solução:** Aumentar swap: `sudo fallocate -l 2G /swapfile` e `sudo chmod 600 /swapfile`

### Portas Bloqueadas
- **Erro:** `curl: connection refused`
  **Solução:** Abrir portas no firewall: `sudo ufw allow 80,443,3001,8080`

### Permissões de Arquivos
- **Erro:** `Permission denied`
  **Solução:** `sudo chown -R $USER:$USER . && sudo chmod -R 755 .`

### SSL/TLS
- **Erro:** `ERR_SSL_PROTOCOL_ERROR`
  **Solução:** Configurar certificado válido e reiniciar Nginx

---

## 📊 MONITORAMENTO E MANUTENÇÃO

### 6.1. Scripts de Manutenção
```bash
#!/bin/bash
# backup-diario.sh
DATE=$(date +%Y%m%d)
docker exec 28web-postgres pg_dump -U chatex chatex > /opt/backups/chatex_$DATE.sql
docker exec 28web-redis redis-cli BGSAVE

# limpeza-logs.sh
find /opt/28web-hub/logs -name "*.log" -mtime +30 -delete
docker system prune -f
```

### 6.2. Scripts de Monitoramento
```bash
#!/bin/bash
# monitor-saude.sh
curl -s http://localhost:8080/health | jq -r '.status' || echo "CRITICAL"
docker stats --no-stream | jq -r '.[] | select(.name, .mem_usage_pct) | select(.mem_usage_pct > 80)' || echo "WARNING"

# atualizacao-automática.sh
git pull origin main
docker-compose down
docker-compose up -d --build
```

---

## 📋 CONFIGURAÇÕES DE PRODUÇÃO

### 7.1. Variáveis de Ambiente Produção
```bash
# .env.production
NODE_ENV=production
DEBUG=false

# Segurança
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=https://seu.dominio.com.br

# Performance
CLUSTER_MODE=false
WORKERS=4

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
```

### 7.2. Docker Compose Produção
```yaml
version: '3.8'

services:
  backend:
    image: 28web-hub-backend:latest
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 1G
          cpus: 0.5
    volumes:
      - ./logs:/app/logs
      - ./uploads:/app/uploads

  postgres:
    image: postgres:15-alpine
    restart: unless-stopped
    environment:
      - POSTGRES_DB=chatex
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: 1.0
```

### 7.3. Backup Automático
```bash
# Cron job para backup diário
0 2 * * * /opt/28web-hub/scripts/backup-diario.sh

# Script de backup completo
#!/bin/bash
docker-compose exec -T postgres pg_dump -U chatex chatex | gzip > /opt/backups/chatex_$(date +%Y%m%d_%H%M%S).sql.gz
aws s3 cp /opt/backups/chatex_$(date +%Y%m%d_%H%M%S).sql.gz s3://backups-28web-hub/ --storage-class GLACIER
```

---

## 🔄 ATUALIZAÇÃO E DEPLOY

### 8.1. Deploy com Zero Downtime
```bash
# Deploy Blue-Green
docker-compose pull
docker-compose up -d --no-deps --build
docker-compose exec -T nginx nginx -s reload
```

### 8.2. Rollback Automático
```bash
# Em caso de falha
git checkout HEAD~1
docker-compose down
docker-compose up -d --build
```

---

## 📚 DOCUMENTAÇÃO IMPORTANTE

### 9.1. Manual do Administrador
- Backup diário automático
- Logs centralizados
- Monitoramento de saúde
- Procedimentos de emergência
- Contatos de suporte

### 9.2. Manual do Desenvolvedor
- Estrutura de código documentada
- Git workflow padronizado
- Testes automatizados
- Code review obrigatório

### 9.3. Compliance e Segurança
- GDPR implementado
- Logs de auditoria
- Criptografia de dados sensíveis
- Autenticação multifator
- Rate limiting configurado

---

## ✅ VERIFICAÇÃO FINAL DE INSTALAÇÃO

Marque cada item como [x] quando concluído:

- [ ] Requisitos de sistema instalados
- [ ] Docker e Docker Compose funcionando
- [ ] Banco de dados PostgreSQL configurado
- [ ] Redis configurado e funcionando
- [ ] Variáveis de ambiente configuradas
- [ ] Projeto construído e subido
- [ ] Conectividade testada
- [ ] SSL/TLS configurado (se produção)
- [ ] Monitoramento configurado
- [ ] Backup automático configurado
- [ ] Documentação lida e entendida
- [ ] Testes iniciais executados com sucesso

---

**Estado final:** [ ] Instalação concluída com sucesso
