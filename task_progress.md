# Plano de Correção - Problemas de Conectividade Docker/Nginx

## Problemas Identificados:
- [ ] Inconsistência na configuração PROXY_PORT (80 vs 3100)
- [ ] Nginx configurado apenas para ambiente dev (frontend-dev:3000)
- [ ] Mapeamento incorreto de rotas de backend
- [ ] Health checks mal configurados
- [ ] Variáveis de ambiente inconsistentes entre containers

## Ações Necessárias:
- [ ] Corrigir PROXY_PORT para 3100 no docker-compose.yml
- [ ] Atualizar nginx.conf para ser dinâmico (dev/prod)
- [ ] Ajustar upstream backend_api para usar variável de ambiente
- [ ] Corrigir health checks do backend
- [ ] Adicionar variáveis de ambiente para区分 ambientes
- [ ] Testar conectividade após mudanças

## Arquivos a Modificar:
- [ ] docker-compose.yml
- [ ] frontend/nginx.conf
- [ ] backend/.env (se necessário)
