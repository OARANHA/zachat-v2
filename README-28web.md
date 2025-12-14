# 28web Hub - Sistema de Comunicação SaaS

## Visão Geral

O **28web Hub** é uma plataforma SaaS de comunicação multi-canais que transforma o sistema zaap.izing.open.io em uma solução proprietária, seguindo a estratégia de MVP rápido + extração gradual (Strangler Fig Pattern).

## 🚀 Inicialização Rápida

### Pré-requisitos

- Docker Desktop instalado
- Docker Compose instalado
- 4GB+ de RAM recomendados
- 10GB+ de espaço em disco disponível

### 🚀 Passo 1: Inicializar o Ambiente

Execute o script de inicialização:

```bash
# Tornar o script executável
chmod +x start-28web.sh

# Executar a inicialização
./start-28web.sh
```

### 🌐 URLs de Acesso

Após a inicialização bem-sucedida, você terá acesso às seguintes URLs:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **WhatsApp Gateway**: http://localhost:3001

### 📊 Estrutura de Serviços

O sistema consiste em 4 microserviços orquestrados:

1. **28web-postgres**: Banco de dados PostgreSQL
2. **28web-redis**: Cache e filas Redis
3. **28web-backend**: Aplicação principal (Node.js)
4. **28web-whatsapp-gateway**: Microserviço especializado em WhatsApp
5. **28web-frontend**: Interface web (Vue.js)

### 🔧 Comandos Úteis

```bash
# Verificar status de todos os serviços
./start-28web.sh

# Verificar logs em tempo real
docker-compose logs -f

# Verificar logs de um serviço específico
docker-compose logs -f [nome-do-serviço]

# Parar todos os serviços
docker-compose down

# Reiniciar um serviço específico
docker-compose restart [nome-do-serviço]

# Acessar terminal de um serviço
docker-compose exec [nome-do-serviço] bash

# Reconstruir imagens (após alterações)
docker-compose build

# Limpar recursos não utilizados
docker system prune -f
```

### 📋 Verificação de Saúde

O script inclui verificações automáticas de health check para todos os serviços:

- ✅ PostgreSQL: Verifica conectividade com o banco
- ✅ Redis: Verifica conectividade com o cache
- ✅ Backend: Verifica se a API está respondendo
- ✅ WhatsApp Gateway: Verifica se o gateway está operacional
- ✅ Frontend: Verifica se a interface está acessível

### 🚨 Resolução de Problemas

Se algum serviço não iniciar:

1. **Verifique os logs**: `docker-compose logs -f [nome-do-serviço]`
2. **Verifique as portas**: `netstat -tlnp | grep :8080` (Windows) ou `lsof -i :8080` (Linux/Mac)
3. **Reinicie o serviço**: `docker-compose restart [nome-do-serviço]`

### 📚 Monitoramento e Performance

- Use `docker stats` para monitorar uso de recursos
- Use `docker-compose logs` para acompanhar logs em tempo real
- Health checks automáticos a cada 30 segundos

### 🔐 Variáveis de Ambiente

As variáveis de ambiente são configuradas nos seguintes arquivos:

- `docker-compose.yml`: Configuração principal dos serviços
- `backend/.env`: Configurações do backend
- `28web-whatsapp-gateway/.env`: Configurações do gateway WhatsApp

### 📞 Suporte

Para dúvidas ou problemas:

1. Verifique o arquivo `.env` para garantir configurações corretas
2. Use o script `start-28web.sh` para diagnóstico completo
3. Consulte os logs específicos de cada serviço

---

## 🎯 Próximos Passos (Conforme Plano)

- ✅ **Fase 1**: MVP Rápido - Rebranding completo
- ✅ **Fase 2**: WhatsApp Gateway isolado como microserviço
- 🔄 **Fase 3**: Sistema de billing robusto
- 📊 **Fase 4**: Validação de mercado e métricas

---

**Desenvolvido com ❤️ para 28web Hub**