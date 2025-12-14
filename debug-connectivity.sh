#!/bin/bash

# Script de debug para testar conectividade entre containers Docker
echo "=== DEBUG DE CONECTIVIDADE DOCKER COMPOSE ==="
echo "Data: $(date)"
echo

# 1. Verificar status dos containers
echo "1. STATUS DOS CONTAINERS:"
docker-compose ps
echo

# 2. Verificar configuração da rede Docker
echo "2. CONFIGURAÇÃO DA REDE DOCKER:"
docker network ls | grep 28web
echo

# 3. Testar resolução de hostname a partir do container backend
echo "3. TESTE DE RESOLUÇÃO DE HOSTNAME (POSTGRES):"
docker-compose exec backend nslookup postgres
echo

# 4. Testar conectividade de rede com PostgreSQL
echo "4. TESTE DE CONECTIVIDADE COM POSTGRESQL:"
docker-compose exec backend ping -c 3 postgres
echo

# 5. Testar porta PostgreSQL
echo "5. TESTE DE PORTA POSTGRESQL (5432):"
docker-compose exec backend nc -zv postgres 5432
echo

# 6. Verificar variáveis de ambiente no container backend
echo "6. VARIÁVEIS DE AMBIENTE NO BACKEND:"
docker-compose exec backend env | grep -E "(DB_|POSTGRES_|DEBUG_)"
echo

# 7. Testar conexão PostgreSQL usando psql (se disponível)
echo "7. TESTE DE CONEXÃO POSTGRESQL COM PSQL:"
docker-compose exec backend sh -c "which psql && psql -h postgres -U \${DB_USER:-chatex} -d \${DB_NAME:-chatex} -c 'SELECT version();' || echo 'psql não disponível'"
echo

# 8. Verificar logs do container PostgreSQL
echo "8. ÚLTIMOS LOGS DO POSTGRESQL:"
docker-compose logs --tail=20 postgres
echo

# 9. Verificar logs do container backend
echo "9. ÚLTIMOS LOGS DO BACKEND:"
docker-compose logs --tail=20 backend
echo

# 10. Testar conectividade Redis
echo "10. TESTE DE CONECTIVIDADE COM REDIS:"
docker-compose exec backend ping -c 2 redis
docker-compose exec backend nc -zv redis 6379
echo

echo "=== FIM DO DEBUG ==="