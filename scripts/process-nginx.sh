#!/bin/bash

# Script para processar o template nginx.conf
# Utiliza variáveis de ambiente para gerar o nginx.conf final

set -e

TEMPLATE_FILE="nginx-template.conf"
OUTPUT_FILE="frontend/nginx.conf"
FRONTEND_TARGET=${FRONTEND_TARGET:-frontend-dev:3000}
envsubst '${FRONTEND_TARGET}' < "$TEMPLATE_FILE" > "$OUTPUT_FILE"

echo "Processando template nginx..."
echo "FRONTEND_TARGET: $FRONTEND_TARGET"

# Processar o template substituindo variáveis de ambiente
envsubst '${FRONTEND_TARGET}' < "$TEMPLATE_FILE" > "$OUTPUT_FILE"

echo "nginx.conf gerado com sucesso em: $OUTPUT_FILE"
echo "Configuração:"
echo "  Frontend target: $FRONTEND_TARGET"
echo "  Backend API: backend:3100"
echo "  WhatsApp Gateway: whatsapp-gateway:3001"
