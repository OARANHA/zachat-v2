#!/bin/bash

echo "�� Parando containers..."
docker compose down -v

echo "🔨 Rebuild do frontend..."
docker compose build --no-cache frontend-dev

echo "🚀 Iniciando..."
docker compose up -d

echo "⏳ Aguardando 2 minutos para Quasar iniciar..."
sleep 120

echo "📊 Verificando status..."
docker compose ps

echo "📋 Logs do frontend:"
docker compose logs frontend-dev | tail -30

echo ""
echo "✅ Pronto! Acesse: http://localhost:3000"
echo ""
echo "Para monitorar em tempo real:"
echo "  docker compose logs -f frontend-dev"
