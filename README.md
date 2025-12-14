# 28web Hub

© 2024 28web. Todos os direitos reservados.

Sistema SaaS proprietário de atendimento multicanal com suporte para WhatsApp, Instagram, Telegram e Messenger.

## 🚀 Principais Funcionalidades

- ✅ Multíplos canais de atendimento (WhatsApp, Instagram, Telegram, Messenger)
- ✅ Multi-tenant com isolamento completo
- ✅ Sistema de billing e planos de assinatura
- ✅ Rastreamento de uso em tempo real
- ✅ Chatbot interativo com fluxos visuais
- ✅ Envio e recebimento de mensagens e mídias
- ✅ Multi-usuários por tenant
- ✅ API REST completa
- ✅ Webhooks customizáveis

## 📦 Requisitos

- Node.js >= 20
- PostgreSQL >= 14
- Redis >= 6
- Docker e Docker Compose (recomendado)

## 🔧 Instalação

### Usando Docker Compose (Recomendado)

```bash
# Clone o repositório
git clone <repository-url> 28web-hub
cd 28web-hub

# Configure as variáveis de ambiente
cp backend/.env.example backend/.env
# Edite backend/.env com suas configurações

# Inicie os serviços
docker-compose up -d
```

### Instalação Manual

Consulte a [documentação de instalação](docs/INSTALL_VPS_UBUNTU_20_22.md) para instruções detalhadas.

## ⚙️ Configuração

### Variáveis de Ambiente

Principais variáveis no `backend/.env`:

```env
# Aplicação
NODE_ENV=production
BACKEND_URL=https://api.28web.com.br
FRONTEND_URL=https://app.28web.com.br

# Banco de Dados
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=28web
POSTGRES_PASSWORD=your_password
POSTGRES_DB=28web_hub

# Redis
IO_REDIS_SERVER=localhost
IO_REDIS_PORT=6379
IO_REDIS_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
```

## 📚 Estrutura do Projeto

```
28web-hub/
├── backend/              # API Backend (Node.js + TypeScript)
│   ├── src/
│   │   ├── interfaces/   # Interfaces de abstração
│   │   ├── models/       # Modelos Sequelize
│   │   ├── services/     # Serviços de negócio
│   │   ├── controllers/  # Controllers REST
│   │   └── middleware/   # Middlewares
│   └── ...
├── frontend/             # Frontend (Vue.js + Quasar)
│   └── ...
└── docs/                 # Documentação
```

## 🔐 Autenticação

O sistema utiliza JWT para autenticação. Após login, use o token no header:

```
Authorization: Bearer <token>
```

## 📊 Planos de Assinatura

### Starter - R$ 99/mês
- 1 sessão WhatsApp
- 1.000 mensagens/mês
- 5 GB storage
- 2 usuários

### Professional - R$ 399/mês
- 5 sessões WhatsApp
- 10.000 mensagens/mês
- 50 GB storage
- 10 usuários
- Instagram + Telegram
- API + Webhooks

### Enterprise - R$ 999/mês
- Sessões ilimitadas
- 100.000 mensagens/mês
- 200 GB storage
- 50 usuários
- Todos os canais
- Suporte prioritário
- SLA 99.9%

## 🔌 API

Documentação completa da API disponível em `/api/docs` (quando implementado).

Principais endpoints:

- `POST /auth/login` - Autenticação
- `GET /whatsapps` - Listar sessões WhatsApp
- `POST /messages` - Enviar mensagem
- `GET /tickets` - Listar tickets
- `GET /billing/usage` - Uso atual do plano

## 🛠️ Desenvolvimento

```bash
# Backend
cd backend
npm install
npm run dev:server

# Frontend
cd frontend
npm install
npm run dev
```

## 📝 Licença

Este software é proprietário e está protegido por direitos autorais.

© 2024 28web. Todos os direitos reservados.

A utilização deste software sem autorização é proibida.

## ⚠️ Aviso Legal

Este projeto não é afiliado, associado, autorizado, endossado por, ou de qualquer forma oficialmente ligado ao WhatsApp, Instagram, Telegram, Messenger ou qualquer uma das suas filiais ou afiliadas. Os nomes, marcas, emblemas e imagens relacionados são marcas registradas dos seus respectivos proprietários.

## 📧 Suporte

Para suporte, entre em contato através do email: suporte@28web.com.br

---

**28web Hub** - Sistema de Atendimento Multicanal SaaS
