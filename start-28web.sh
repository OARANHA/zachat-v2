#!/bin/bash

# Script de Inicialização do Ambiente 28web Hub
# Este script configura e inicia todos os serviços da aplicação 28web Hub

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função de log
log() {
    echo -e "${GREEN}[28web Hub]${NC} $1"
}

# Função de erro
error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Função de aviso
warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    error "Docker não está instalado. Por favor, instale o Docker primeiro."
fi

# Verificar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose não está instalado. Por favor, instale o Docker Compose primeiro."
fi

# Verificar se estamos no diretório correto
if [ ! -f "docker-compose.yml" ]; then
    error "docker-compose.yml não encontrado no diretório atual. Por favor, execute este script a partir do diretório raiz do projeto."
fi

# Criar estrutura de diretórios necessária
log "Criando estrutura de diretórios para volumes..."

mkdir -p docker/postgres/data docker/redis/data .data

if [ $? -eq 0 ]; then
    log "Estrutura de diretórios criada com sucesso."
else
    error "Falha ao criar estrutura de diretórios."
fi

# Verificar arquivo .env
if [ ! -f ".env" ]; then
    warn "Arquivo .env não encontrado. Usando variáveis padrão."
    ENV_FILE=".env.example"
else
    ENV_FILE=".env"
    log "Usando arquivo de ambiente: $ENV_FILE"
fi

# Parar serviços existentes (se estiverem rodando)
log "Parando serviços existentes..."
docker-compose down

# Limpar containers e volumes órfãos
log "Limpando containers e volumes órfãos..."
docker system prune -f

# Construir imagens (se necessário)
log "Construindo imagens Docker..."
docker-compose build

if [ $? -eq 0 ]; then
    log "Imagens construídas com sucesso."
else
    error "Falha ao construir imagens Docker."
fi

# Iniciar serviços
log "Iniciando serviços do 28web Hub..."
docker-compose up -d

# Verificar status dos serviços
sleep 10

log "Verificando status dos serviços..."

# Verificar PostgreSQL
if docker-compose ps | grep -q "28web-postgres.*Up"; then
    log "✅ PostgreSQL: Rodando"
else
    warn "⚠️  PostgreSQL: Não está rodando"
fi

# Verificar Redis
if docker-compose ps | grep -q "28web-redis.*Up"; then
    log "✅ Redis: Rodando"
else
    warn "⚠️  Redis: Não está rodando"
fi

# Verificar Backend
if docker-compose ps | grep -q "28web-backend.*Up"; then
    log "✅ Backend: Rodando"
else
    warn "⚠️  Backend: Não está rodando"
fi

# Nota: WhatsApp Gateway roda isoladamente
log "ℹ️  WhatsApp Gateway: Roda isoladamente (porta 3001)"

# Verificar Frontend
if docker-compose ps | grep -q "28web-frontend.*Up"; then
    log "✅ Frontend: Rodando"
else
    warn "⚠️  Frontend: Não está rodando"
fi

# Mostrar URLs de acesso
echo ""
log "🌐 URLs de Acesso:"
echo -e "${BLUE}Frontend:${NC} http://localhost:3000"
echo -e "${BLUE}Backend API:${NC} http://localhost:8080"
echo -e "${BLUE}WhatsApp Gateway:${NC} http://localhost:3001"
echo ""

# Mostrar comandos úteis
log "📋 Comandos Úteis:"
echo -e "${GREEN}Verificar logs de todos os serviços:${NC} docker-compose logs -f"
echo -e "${GREEN}Verificar logs de um serviço específico:${NC} docker-compose logs -f [nome-do-serviço]"
echo -e "${GREEN}Parar todos os serviços:${NC} docker-compose down"
echo -e "${GREEN}Reiniciar um serviço:${NC} docker-compose restart [nome-do-serviço]"
echo -e "${GREEN}Acessar terminal de um serviço:${NC} docker-compose exec [nome-do-serviço] bash"
echo ""

# Verificar health checks
log "🔍 Verificando health checks..."

# Aguardar um momento para os serviços iniciarem completamente
sleep 30

# Testar health checks
HEALTH_CHECKS=0

# Verificar health check do PostgreSQL
if curl -f http://localhost:5432 2>/dev/null; then
    log "✅ PostgreSQL Health Check: OK"
    ((HEALTH_CHECKS++))
else
    warn "⚠️  PostgreSQL Health Check: Falhando"
fi

# Verificar health check do Redis
if curl -f http://localhost:6379 2>/dev/null; then
    log "✅ Redis Health Check: OK"
    ((HEALTH_CHECKS++))
else
    warn "⚠️  Redis Health Check: Falhando"
fi

# Verificar health check do Backend
if curl -f http://localhost:8080/health 2>/dev/null; then
    log "✅ Backend Health Check: OK"
    ((HEALTH_CHECKS++))
else
    warn "⚠️  Backend Health Check: Falhando"
fi

# Verificar health check do Frontend
if curl -f http://localhost:3000 2>/dev/null; then
    log "✅ Frontend Health Check: OK"
    ((HEALTH_CHECKS++))
else
    warn "⚠️  Frontend Health Check: Falhando"
fi

# Executar migrations do backend
log "🗄️  Executando migrations do backend..."
docker-compose exec -T backend npm run db:migrate

if [ $? -eq 0 ]; then
    log "✅ Migrations executadas com sucesso"
else
    warn "⚠️  Falha ao executar migrations. Pode ser necessário executar manualmente."
fi

# Resumo final
echo ""
log "📊 Resumo da Inicialização:"
echo -e "Serviços verificados: ${HEALTH_CHECKS}/4"

if [ $HEALTH_CHECKS -eq 4 ]; then
    log "🎉 Serviços principais funcionando! WhatsApp Gateway deve rodar separadamente."
    echo -e "${GREEN}O 28web Hub está pronto para uso (lembre-se de iniciar o WhatsApp Gateway separadamente).${NC}"
else
    warn "⚠️  Alguns serviços podem não estar funcionando corretamente."
    echo -e "${YELLOW}Verifique os logs para mais detalhes: docker-compose logs -f${NC}"
fi

echo ""
log "💡 Dica: Use 'docker-compose logs -f [nome-do-serviço]' para acompanhar os logs em tempo real."
echo ""
