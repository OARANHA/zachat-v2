# ==========================================
# DEVELOPMENT STAGE - Quasar dev server (PWA)
# ==========================================
FROM node:18-alpine AS development

WORKDIR /usr/src/app

# Copiar dependencies
COPY package*.json ./
RUN npm ci

# Copiar código-fonte
COPY . .

# Debug info (opcional, remova em prod)
RUN echo "Node version:" && node --version && \
    echo "NPM version:" && npm --version && \
    echo "Scripts disponíveis:" && cat package.json | grep -A10 '"scripts"'

# Expor a porta do Quasar
EXPOSE 3000

# Health check - aguarda Quasar estar pronto
# start-period: tempo de espera inicial (120s = 2 minutos)
# timeout: tempo máximo para cada check (5s)
# interval: frequência dos checks (10s)
HEALTHCHECK --interval=10s --timeout=5s --start-period=120s --retries=5 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

# Inicia Quasar em modo dev (PWA)
CMD ["npx", "quasar", "dev", "-m", "pwa", "--host", "0.0.0.0", "--port", "3000"]

# ==========================================
# BUILDER STAGE - Compilar Quasar para produção
# ==========================================
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Copiar dependencies
COPY package*.json ./
RUN npm ci

# Copiar código-fonte
COPY . .

# Build do Quasar para produção (PWA)
RUN npm run build

# ==========================================
# PRODUCTION STAGE - Servir com Nginx
# ==========================================
FROM nginx:alpine AS production

# Copiar build do stage builder
COPY --from=builder /usr/src/app/dist/pwa /usr/share/nginx/html

# Copiar configuração nginx customizada
COPY nginx.conf /etc/nginx/nginx.conf

# Expor porta
EXPOSE 80

# Health check para Nginx
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
