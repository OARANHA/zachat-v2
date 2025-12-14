# Multi-stage build for optimization
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# debug
#RUN ls -R

# Production stage
FROM node:18-alpine AS stage-1

WORKDIR /app

# Copy built application
COPY --from=builder /app/dist/ ./dist/

# Copy node_modules
COPY --from=builder /app/node_modules ./node_modules

# Copy package.json
COPY --from=builder /app/package.json ./package.json

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/health-check.js || exit 1

# Start application
CMD ["node", "dist/server.js"]
