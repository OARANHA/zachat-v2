# Multi-stage build for optimization
FROM node:18 AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage - usando imagem com Chromium pré-instalado
FROM node:18

WORKDIR /app

# Install Chromium and dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    libnss3 \
    libxss1 \
    libappindicator3-1 \
    libgbm1 \
    libxshmfence1 \
    fonts-liberation \
    xdg-utils \
    dumb-init \
    && rm -rf /var/lib/apt/lists/*

# Copy built application
COPY --from=builder /app/dist/ ./dist/

# Copy node_modules
COPY --from=builder /app/node_modules ./node_modules

# Copy package.json
COPY --from=builder /app/package.json ./package.json

# Create non-root user
RUN useradd -m -u 1001 nodejs
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/health-check.js || exit 1

# Start application
CMD ["dumb-init", "node", "dist/server.js"]
