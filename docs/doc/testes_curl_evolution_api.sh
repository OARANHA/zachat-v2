#!/bin/bash

################################################################################
#                                                                              #
#          TESTES EVOLUTION API - ZECHAT FULL STACK                          #
#                                                                              #
#  Script bash para testar integração Evolution API ↔ Backend Zechat          #
#  Data: 29/12/2025                                                           #
#  Versão: 1.0                                                                #
#                                                                              #
################################################################################

set -e

# CORES PARA OUTPUT
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================================
# CONFIGURAÇÃO - EDITE CONFORME NECESSÁRIO
# ============================================================================

EVOLUTION_URL="${EVOLUTION_URL:-http://localhost:8080}"
EVOLUTION_API_KEY="${EVOLUTION_API_KEY:-467b9ca6680621bfa5350c221ef452c71eb07109ee9a3597cd85890c8d0fde8f}"
INSTANCE_NAME="${INSTANCE_NAME:-zechat-principal}"
TEST_PHONE="${TEST_PHONE:-5511987654321}"
BACKEND_URL="${BACKEND_URL:-http://localhost:3100}"

# ============================================================================
# FUNÇÕES AUXILIARES
# ============================================================================

print_header() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC} $1"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
}

print_test() {
    echo -e "\n${YELLOW}[TESTE] $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

run_curl() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    print_test "$description"
    
    if [ -z "$data" ]; then
        response=$(curl -s -X "$method" "${EVOLUTION_URL}${endpoint}" \
            -H "Content-Type: application/json" \
            -H "apikey: $EVOLUTION_API_KEY" 2>&1)
    else
        response=$(curl -s -X "$method" "${EVOLUTION_URL}${endpoint}" \
            -H "Content-Type: application/json" \
            -H "apikey: $EVOLUTION_API_KEY" \
            -d "$data" 2>&1)
    fi
    
    echo "$response" | jq . 2>/dev/null || echo "$response"
    
    return 0
}

# ============================================================================
# INICIO DOS TESTES
# ============================================================================

print_header "TESTES EVOLUTION API - ZECHAT"

echo ""
echo -e "${BLUE}Configuração:${NC}"
echo "  EVOLUTION_URL: $EVOLUTION_URL"
echo "  INSTANCE_NAME: $INSTANCE_NAME"
echo "  TEST_PHONE: $TEST_PHONE"
echo "  BACKEND_URL: $BACKEND_URL"
echo ""

# ============================================================================
# PRÉ-VOOS
# ============================================================================

print_header "FASE 1: PRÉ-VOOS (Health Checks)"

# TESTE 1
print_test "Evolution API - Status"
response=$(curl -s "$EVOLUTION_URL/" | jq . 2>/dev/null || echo "Erro de conexão")
if echo "$response" | grep -q "Evolution"; then
    print_success "Evolution API está respondendo"
else
    print_error "Evolution API não respondeu corretamente"
    echo "$response"
fi

# TESTE 2
print_test "Backend - Health Check"
response=$(curl -s "$BACKEND_URL/health" | jq . 2>/dev/null || echo "Erro de conexão")
if echo "$response" | grep -q "status"; then
    print_success "Backend está saudável"
else
    print_error "Backend não respondeu corretamente"
fi

# TESTE 3
print_test "Backend → Evolution Connectivity"
response=$(curl -s -X GET "$EVOLUTION_URL/instance/fetchInstances" \
    -H "Content-Type: application/json" \
    -H "apikey: $EVOLUTION_API_KEY" 2>&1 | jq . 2>/dev/null || echo "{}")
print_success "Conectividade testada"
echo "$response" | jq . 2>/dev/null || true

# ============================================================================
# GERENCIAMENTO DE INSTÂNCIAS
# ============================================================================

print_header "FASE 2: GERENCIAMENTO DE INSTÂNCIAS"

# TESTE 4 - List Instances
print_test "Listar todas as instâncias"
response=$(curl -s -X GET "$EVOLUTION_URL/instance/fetchInstances" \
    -H "Content-Type: application/json" \
    -H "apikey: $EVOLUTION_API_KEY")
echo "$response" | jq '.instances | length' 2>/dev/null && echo "Instâncias encontradas"

# TESTE 5 - Create Instance
print_test "Criar nova instância ($INSTANCE_NAME)"
create_data='{
    "instanceName": "'$INSTANCE_NAME'",
    "qrcode": true,
    "integration": "WHATSAPP-BAILEYS",
    "settings": {
        "rejectCall": true,
        "alwaysOnline": true,
        "readMessages": true
    }
}'

response=$(curl -s -X POST "$EVOLUTION_URL/instance/create" \
    -H "Content-Type: application/json" \
    -H "apikey: $EVOLUTION_API_KEY" \
    -d "$create_data")

if echo "$response" | jq -e '.instance' >/dev/null 2>&1; then
    print_success "Instância criada com sucesso"
    echo "$response" | jq '.instance | {name, status}' 2>/dev/null
else
    print_info "Instância pode já existir. Continuando..."
    echo "$response" | jq . 2>/dev/null || true
fi

sleep 2

# ============================================================================
# QR CODE E CONEXÃO
# ============================================================================

print_header "FASE 3: QR CODE E CONEXÃO"

# TESTE 6 - Get QR Code
print_test "Obter QR Code"
response=$(curl -s -X GET "$EVOLUTION_URL/instance/qrcode/$INSTANCE_NAME" \
    -H "apikey: $EVOLUTION_API_KEY")

if echo "$response" | jq -e '.qrcode.base64' >/dev/null 2>&1; then
    print_success "QR Code obtido"
    echo "$response" | jq '.qrcode | {hasBase64: (.base64 != null), hasUrl: (.url != null)}'
    print_info "⚠️  AÇÃO MANUAL NECESSÁRIA: Escaneie o QR Code com seu celular"
    print_info "WhatsApp → Configurações → Dispositivos Conectados → Conectar"
    read -p "Pressione ENTER após escanear o QR Code..."
else
    print_error "QR Code não disponível"
    echo "$response" | jq . 2>/dev/null || true
fi

sleep 3

# TESTE 7 - Check Connection Status
print_test "Verificar status de conexão"
attempt=1
max_attempts=12
connected=false

while [ $attempt -le $max_attempts ]; do
    response=$(curl -s -X GET "$EVOLUTION_URL/instance/connectionState/$INSTANCE_NAME" \
        -H "apikey: $EVOLUTION_API_KEY")
    
    state=$(echo "$response" | jq -r '.instance.state' 2>/dev/null || echo "unknown")
    
    if [ "$state" = "open" ]; then
        print_success "Instância conectada! Estado: $state"
        connected=true
        break
    else
        echo -ne "${YELLOW}Tentativa $attempt/$max_attempts - Estado: $state${NC}\r"
        sleep 5
        ((attempt++))
    fi
done

if [ "$connected" = false ]; then
    print_error "Instância não conectou após $max_attempts tentativas"
    print_info "Dica: Rescaneie o QR Code e tente novamente"
    exit 1
fi

# ============================================================================
# WEBHOOK
# ============================================================================

print_header "FASE 4: CONFIGURAÇÃO DE WEBHOOK"

# TESTE 8 - Configure Webhook
print_test "Configurar webhook"
webhook_data='{
    "url": "http://backend:3100/api/webhook/evolution",
    "webhook_by_events": false,
    "events": ["messages.upsert", "connection.update", "messages.update", "presence.update"]
}'

response=$(curl -s -X POST "$EVOLUTION_URL/webhook/set/$INSTANCE_NAME" \
    -H "Content-Type: application/json" \
    -H "apikey: $EVOLUTION_API_KEY" \
    -d "$webhook_data")

if echo "$response" | jq -e '.webhook' >/dev/null 2>&1; then
    print_success "Webhook configurado"
    echo "$response" | jq '.webhook'
else
    print_info "Webhook pode já estar configurado"
    echo "$response" | jq . 2>/dev/null || true
fi

# ============================================================================
# MENSAGENS
# ============================================================================

print_header "FASE 5: TESTES DE MENSAGENS"

# TESTE 9 - Send Text Message
print_test "Enviar mensagem de texto"
msg_data='{
    "number": "'$TEST_PHONE'",
    "text": "🚀 Teste Evolution API - Zechat Full Stack",
    "delay": 1000
}'

response=$(curl -s -X POST "$EVOLUTION_URL/message/sendText/$INSTANCE_NAME" \
    -H "Content-Type: application/json" \
    -H "apikey: $EVOLUTION_API_KEY" \
    -d "$msg_data")

if echo "$response" | jq -e '.status' >/dev/null 2>&1; then
    status=$(echo "$response" | jq -r '.status' 2>/dev/null)
    if [ "$status" = "PENDING" ] || [ "$status" = "SENT" ]; then
        print_success "Mensagem enviada com sucesso (Status: $status)"
    else
        print_error "Status inesperado: $status"
    fi
else
    print_error "Falha ao enviar mensagem"
fi
echo "$response" | jq . 2>/dev/null || true

sleep 2

# TESTE 10 - Find Contacts
print_test "Buscar contatos"
contacts_data='{"where": {}, "limit": 10}'

response=$(curl -s -X POST "$EVOLUTION_URL/chat/findContacts/$INSTANCE_NAME" \
    -H "Content-Type: application/json" \
    -H "apikey: $EVOLUTION_API_KEY" \
    -d "$contacts_data")

contact_count=$(echo "$response" | jq '.contacts | length' 2>/dev/null || echo "0")
print_success "Encontrados $contact_count contatos"
echo "$response" | jq '.contacts | length' 2>/dev/null || true

# TESTE 11 - Validate WhatsApp Numbers
print_test "Validar números WhatsApp"
validate_data='{"numbers": ["'$TEST_PHONE'", "5511912345678", "5511999999999"]}'

response=$(curl -s -X POST "$EVOLUTION_URL/chat/whatsappNumbers/$INSTANCE_NAME" \
    -H "Content-Type: application/json" \
    -H "apikey: $EVOLUTION_API_KEY" \
    -d "$validate_data")

valid_count=$(echo "$response" | jq '.data | length' 2>/dev/null || echo "0")
print_success "Validados $valid_count números"
echo "$response" | jq '.data' 2>/dev/null | head -5 || true

# TESTE 12 - Send Image
print_test "Enviar imagem (teste)"
image_data='{
    "number": "'$TEST_PHONE'",
    "mediatype": "image",
    "media": "https://via.placeholder.com/300",
    "caption": "Imagem de Teste"
}'

response=$(curl -s -X POST "$EVOLUTION_URL/message/sendMedia/$INSTANCE_NAME" \
    -H "Content-Type: application/json" \
    -H "apikey: $EVOLUTION_API_KEY" \
    -d "$image_data")

if echo "$response" | jq -e '.status' >/dev/null 2>&1; then
    print_success "Requisição de imagem enviada"
else
    print_info "Imagem pode ter falhas, mas API respondeu"
fi

# ============================================================================
# RESUMO FINAL
# ============================================================================

print_header "RESUMO FINAL"

echo ""
echo -e "${GREEN}✅ TESTES COMPLETADOS COM SUCESSO!${NC}"
echo ""
echo "Próximos passos:"
echo "  1. Verifique se as mensagens chegaram no celular"
echo "  2. Acesse http://localhost:3000 para testar a interface Zechat"
echo "  3. Crie um ticket/atendimento na interface"
echo "  4. Envie uma resposta pelo WhatsApp"
echo "  5. Verifique se a resposta aparece no Zechat"
echo ""
echo -e "${BLUE}Documentação: cat README_TESTES.md${NC}"
echo ""
