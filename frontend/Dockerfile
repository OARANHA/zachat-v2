# Development stage
FROM node:18-alpine AS development

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .

# Debug info (opcional, remova em prod)
RUN npx @quasar/cli --help 2>&1 | head -10 || echo "@quasar/cli not found" && \
    echo "Node version:" && node --version && \
    echo "NPM version:" && npm --version && \
    echo "Scripts:" && cat package.json | grep -A5 '"scripts"'

EXPOSE 3000
CMD ["npx", "quasar", "dev", "-m", "pwa", "--host", "0.0.0.0"]

# Builder stage
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
# Build para PWA (ajuste NODE_OPTIONS se necessário para sua versão)
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /usr/src/app/dist/pwa /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]