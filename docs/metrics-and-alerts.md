# Métricas e Alertas do WhatsApp Gateway

## Métricas Implementadas

### 1. **Latência**
- **Descrição**: Tempo médio de resposta para processamento de mensagens.
- **Coleta**: Medido no `SessionManager.ts` usando o método `calculateAverageResponseTime()`.
- **Métrica Prometheus**: `whatsapp_gateway_latency_seconds`

### 2. **Taxa de Erros**
- **Descrição**: Porcentagem de mensagens que falharam no processamento.
- **Coleta**: Medido no `SessionManager.ts` usando o método `calculateErrorRate()`.
- **Métrica Prometheus**: `whatsapp_gateway_error_rate`

### 3. **Uso de Recursos**
- **Descrição**: Uso de CPU, memória e disco pelo serviço.
- **Coleta**: Coletado automaticamente pelo Prometheus usando métricas padrão do Node.js.
- **Métricas Prometheus**:
  - `process_cpu_usage_seconds_total`
  - `process_memory_usage_bytes`
  - `process_disk_usage_bytes`

### 4. **Health Checks**
- **Descrição**: Verificações de saúde do sistema, incluindo status do Redis, filas e webhooks.
- **Coleta**: Implementado no `HealthService.ts`.
- **Métrica Prometheus**: `whatsapp_gateway_health_check_status`

## Alertas Configurados

### 1. **Latência Elevada**
- **Condição**: `whatsapp_gateway_latency_seconds > 5`
- **Ação**: Notificação via WebSocket e email.

### 2. **Taxa de Erros Crítica**
- **Condição**: `whatsapp_gateway_error_rate > 0.1`
- **Ação**: Notificação via WebSocket e email.

### 3. **Uso de CPU Elevado**
- **Condição**: `process_cpu_usage_seconds_total > 90%`
- **Ação**: Notificação via WebSocket.

### 4. **Health Check Falhou**
- **Condição**: `whatsapp_gateway_health_check_status == 0`
- **Ação**: Notificação via WebSocket e email.

## Como Visualizar as Métricas
1. Acesse o Grafana em `http://localhost:3000`.
2. Navegue até o dashboard "WhatsApp Gateway Metrics".
3. Explore as métricas e alertas configurados.

## Como Modificar Alertas
1. Edite o arquivo `prometheus.yml` para ajustar as condições dos alertas.
2. Reinicie o Prometheus para aplicar as mudanças.
