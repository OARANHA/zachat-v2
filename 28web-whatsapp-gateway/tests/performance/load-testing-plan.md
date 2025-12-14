# Plano de Testes de Carga e Performance - WhatsApp Gateway

## Objetivo
Validar performance e escalabilidade do WhatsApp Gateway sob diferentes cenários de carga para identificar gargalos e limites.

## Ferramentas de Teste
- **Artillery**: Para testes de carga HTTP/REST APIs
- **K6**: Para testes de carga e estresse
- **Node.js Memory Profiling**: Para análise de consumo de memória
- **Clinic.js**: Para profiling de performance do Node.js

## Cenários de Teste

### 1. Teste de Criação de Sessões
**Objetivo**: Validar capacidade de criar múltiplas sessões simultâneas
```bash
# artillery config
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 60
      arrivalRate: 50
    - duration: 60
      arrivalRate: 100
scenarios:
  - name: "Criar Sessão WhatsApp"
    weight: 100
    flow:
      - post:
          url: "/api/sessions"
          json:
            apiKey: "test-key-{{ randomString() }}"
```

### 2. Teste de Processamento de Webhooks
**Objetivo**: Validar throughput de processamento de eventos
```bash
# k6 test
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '2m', target: 500 },
    { duration: '2m', target: 1000 },
  ],
};

export default function () {
  const event = {
    type: 'message_create',
    timestamp: Date.now(),
    message: {
      id: `msg-${Math.random()}`,
      from: 'sender-id',
      to: 'recipient-id',
      text: 'Test message'
    }
  };

  const response = http.post('http://localhost:3000/api/webhook', JSON.stringify(event), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

### 3. Teste de Concorrência de Mensagens
**Objetivo**: Validar processamento simultâneo de múltiplas mensagens
```javascript
// Test script para múltiplas sessões enviando mensagens
const WebSocket = require('ws');
const { performance } = require('perf_hooks');

class LoadTester {
  constructor(sessionCount, messagesPerSession) {
    this.sessionCount = sessionCount;
    this.messagesPerSession = messagesPerSession;
    this.sessions = [];
    this.metrics = {
      totalMessages: 0,
      successfulMessages: 0,
      failedMessages: 0,
      avgResponseTime: 0,
      memoryUsage: [],
      cpuUsage: []
    };
  }

  async runTest() {
    console.log(`Iniciando teste: ${this.sessionCount} sessões, ${this.messagesPerSession} mensagens cada`);
    
    // Criar sessões
    for (let i = 0; i < this.sessionCount; i++) {
      await this.createSession(i);
    }
    
    // Aguardar inicialização
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Enviar mensagens simultâneas
    const startTime = Date.now();
    const promises = [];
    
    for (let i = 0; i < this.sessionCount; i++) {
      for (let j = 0; j < this.messagesPerSession; j++) {
        promises.push(this.sendMessage(i, `Test message ${i}-${j}`));
      }
    }
    
    // Coletar métricas durante o teste
    const metricsInterval = setInterval(() => {
      const memUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      
      this.metrics.memoryUsage.push({
        timestamp: Date.now(),
        rss: memUsage.rss,
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal
      });
      
      this.metrics.cpuUsage.push({
        timestamp: Date.now(),
        user: cpuUsage.user,
        system: cpuUsage.system
      });
    }, 1000);
    
    // Executar testes
    const results = await Promise.allSettled(promises);
    
    clearInterval(metricsInterval);
    
    // Processar resultados
    this.processResults(results, Date.now() - startTime);
  }
  
  async createSession(sessionId) {
    // Implementar criação de sessão real
    const response = await fetch('http://localhost:3000/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: `test-key-${sessionId}` })
    });
    
    if (response.ok) {
      const { sessionId: actualSessionId } = await response.json();
      this.sessions[sessionId] = actualSessionId;
      console.log(`Sessão ${sessionId} criada: ${actualSessionId}`);
    }
  }
  
  async sendMessage(sessionId, message) {
    const startTime = Date.now();
    
    try {
      // Implementar envio real de mensagem
      const response = await fetch(`http://localhost:3000/api/sessions/${this.sessions[sessionId]}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: `55119${String(Math.floor(Math.random() * 900000000)).padStart(9, '0')}`,
          body: message
        })
      });
      
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        this.metrics.successfulMessages++;
        this.metrics.avgResponseTime = 
          (this.metrics.avgResponseTime * this.metrics.successfulMessages + responseTime) / 
          (this.metrics.successfulMessages + 1);
      } else {
        this.metrics.failedMessages++;
      }
      
      this.metrics.totalMessages++;
      
      return {
        success: response.ok,
        responseTime,
        sessionId,
        message
      };
    } catch (error) {
      this.metrics.failedMessages++;
      this.metrics.totalMessages++;
      
      return {
        success: false,
        error: error.message,
        sessionId,
        message
      };
    }
  }
  
  processResults(results, totalTime) {
    const successful = results.filter(r => r.value && r.value.success).length;
    const failed = results.filter(r => r.value && !r.value.success).length;
    
    console.log('\n=== RESULTADOS DO TESTE ===');
    console.log(`Total de mensagens: ${this.metrics.totalMessages}`);
    console.log(`Sucessos: ${successful}`);
    console.log(`Falhas: ${failed}`);
    console.log(`Taxa de sucesso: ${((successful / this.metrics.totalMessages) * 100).toFixed(2)}%`);
    console.log(`Tempo médio de resposta: ${this.metrics.avgResponseTime.toFixed(2)}ms`);
    console.log(`Tempo total do teste: ${totalTime}ms`);
    
    // Análise de memória
    const maxMemory = Math.max(...this.metrics.memoryUsage.map(m => m.heapUsed));
    const avgMemory = this.metrics.memoryUsage.reduce((sum, m) => sum + m.heapUsed, 0) / this.metrics.memoryUsage.length;
    console.log(`Pico de memória: ${(maxMemory / 1024 / 1024).toFixed(2)}MB`);
    console.log(`Média de memória: ${(avgMemory / 1024 / 1024).toFixed(2)}MB`);
    
    // Análise de CPU
    const avgCpu = this.metrics.cpuUsage.reduce((sum, c) => sum + c.user, 0) / this.metrics.cpuUsage.length;
    console.log(`Média de CPU: ${(avgCpu / 1000000).toFixed(2)}%`);
  }
}

// Executar teste
const tester = new LoadTester(10, 50); // 10 sessões, 50 mensagens cada
tester.runTest().catch(console.error);
```

### 4. Teste de Estresse (Stress Test)
**Objetivo**: Identificar limites máximos e pontos de falha
```yaml
# artillery stress test
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 30
      arrivalRate: 1
    - duration: 30
      arrivalRate: 10
    - duration: 30
      arrivalRate: 50
    - duration: 30
      arrivalRate: 100
    - duration: 30
      arrivalRate: 500
    - duration: 30
      arrivalRate: 1000
  payload:
    path: "/api/sessions"
    method: "POST"
    body: '{"apiKey": "stress-test-key"}'
```

### 5. Teste de Resistência (Endurance Test)
**Objetivo**: Validar estabilidade sob carga prolongada
```bash
# Teste de 24 horas com carga moderada
artillery run endurance-test.yml --duration 86400
```

## Métricas a Coletar

### Performance Metrics
1. **Throughput**: Mensagens por segundo
2. **Response Time**: Tempo médio de resposta (p50, p90, p95, p99)
3. **Error Rate**: Taxa de erros por segundo
4. **Concurrent Users**: Número máximo de usuários simultâneos

### Resource Metrics
1. **Memory Usage**: RSS, Heap Used, Heap Total
2. **CPU Usage**: Percentual de utilização
3. **Disk I/O**: Operações de leitura/escrita
4. **Network I/O**: Bytes enviados/recebidos

### Business Metrics
1. **Session Success Rate**: Taxa de criação bem-sucedida de sessões
2. **Message Delivery Rate**: Taxa de entrega de mensagens
3. **Queue Depth**: Profundidade da fila de mensagens
4. **WebSocket Connections**: Número de conexões ativas

## Limites a Validar

### Limites Esperados (Baseline)
- **Máximo de Sessões Simultâneas**: 100
- **Mensagens por Segundo por Sessão**: 10
- **Tempo de Resposta Webhook**: < 100ms (p95)
- **Uso de Memória por Sessão**: < 50MB
- **CPU por Instância**: < 80%

### Critérios de Falha
- **Error Rate > 5%**: Considerado falha
- **Response Time p99 > 5000ms**: Considerado falha
- **Memory Leak**: Crescimento contínuo de memória
- **Session Creation Failure > 10%**: Considerado falha

## Execução dos Testes

### Preparação do Ambiente
```bash
# 1. Instalar ferramentas
npm install -g artillery k6

# 2. Limpar ambiente
docker-compose down
docker-compose up -d

# 3. Configurar monitoramento
npm run monitor &

# 4. Executar testes
npm run test:load
```

### Scripts de Execução
```json
// package.json scripts
{
  "scripts": {
    "test:load": "node tests/performance/run-load-tests.js",
    "test:stress": "artillery run tests/performance/stress-test.yml",
    "test:endurance": "artillery run tests/performance/endurance-test.yml --duration 3600",
    "monitor": "node tests/performance/monitor-resources.js",
    "profile": "node --inspect tests/performance/profile-memory.js"
  }
}
```

## Análise de Resultados

### Relatório de Performance
```markdown
# Relatório de Performance - WhatsApp Gateway

## Resumo Executivo
- **Data**: 2024-12-12
- **Duração**: 2 horas
- **Pico de Carga**: 1000 usuários simultâneos
- **Status**: ✅ Aprovado / ⚠️ Degradado / ❌ Falha

## Métricas de Performance
| Métrica | Valor | Limite | Status |
|---------|------|--------|-------|
| Throughput (msg/s) | 850 | 1000 | ✅ |
| Response Time p95 (ms) | 250 | 500 | ✅ |
| Error Rate (%) | 2.1 | 5.0 | ✅ |
| Max Concurrent Sessions | 95 | 100 | ✅ |

## Métricas de Recursos
| Recurso | Pico | Média | Limite | Status |
|---------|------|-------|--------|-------|
| Memory (MB) | 2048 | 1536 | 4096 | ✅ |
| CPU (%) | 75 | 45 | 80 | ✅ |
| Disk I/O (MB/s) | 12 | 8 | 100 | ✅ |

## Gargalos Identificados
1. **Session Manager**: Memory leak detectado após 50 sessões
2. **Message Queue**: Latência crescente com alto volume
3. **WebSocket**: Timeout em conexões > 100 simultâneas

## Recomendações
1. Implementar pooling de conexões WhatsApp
2. Otimizar garbage collection do Node.js
3. Implementar rate limiting por sessão
4. Adicionar monitoramento granular
```

## Automação de Testes
```javascript
// tests/performance/automated-runner.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class AutomatedTestRunner {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      tests: [],
      summary: {}
    };
  }

  async runAllTests() {
    console.log('Iniciando suíte automatizada de testes de performance...');
    
    const tests = [
      { name: 'session-creation', script: 'artillery run tests/performance/session-test.yml' },
      { name: 'webhook-processing', script: 'k6 run tests/performance/webhook-test.js' },
      { name: 'message-throughput', script: 'node tests/performance/message-load-test.js' },
      { name: 'stress-test', script: 'artillery run tests/performance/stress-test.yml' },
      { name: 'endurance-test', script: 'artillery run tests/performance/endurance-test.yml --duration 3600' }
    ];
    
    for (const test of tests) {
      console.log(`Executando teste: ${test.name}`);
      const result = await this.runTest(test);
      this.results.tests.push(result);
      
      // Aguardar recuperação entre testes
      await new Promise(resolve => setTimeout(resolve, 30000));
    }
    
    this.generateReport();
  }
  
  async runTest(test) {
    const startTime = Date.now();
    
    try {
      const output = execSync(test.script, { encoding: 'utf8', timeout: 600000 });
      const endTime = Date.now();
      
      return {
        name: test.name,
        status: 'success',
        duration: endTime - startTime,
        output: output
      };
    } catch (error) {
      const endTime = Date.now();
      
      return {
        name: test.name,
        status: 'failed',
        duration: endTime - startTime,
        error: error.message
      };
    }
  }
  
  generateReport() {
    const reportPath = path.join(__dirname, 'reports', `performance-report-${Date.now()}.json`);
    
    // Criar diretório se não existir
    const reportDir = path.dirname(reportPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`Relatório gerado: ${reportPath}`);
    
    // Gerar relatório em Markdown
    const mdReportPath = reportPath.replace('.json', '.md');
    const mdReport = this.generateMarkdownReport();
    fs.writeFileSync(mdReportPath, mdReport);
    
    console.log(`Relatório Markdown gerado: ${mdReportPath}`);
  }
  
  generateMarkdownReport() {
    let markdown = `# Relatório de Performance - WhatsApp Gateway\n\n`;
    markdown += `**Data**: ${this.results.timestamp}\n\n`;
    
    markdown += `## Resultados dos Testes\n\n`;
    markdown += `| Teste | Status | Duração | Observações |\n`;
    markdown += `|-------|--------|----------|-------------|\n`;
    
    for (const test of this.results.tests) {
      markdown += `| ${test.name} | ${test.status} | ${test.duration}ms | ${test.error || ''} |\n`;
    }
    
    return markdown;
  }
}

// Executar testes automatizados
const runner = new AutomatedTestRunner();
runner.runAllTests().catch(console.error);
```

## Monitoramento em Tempo Real
```javascript
// tests/performance/realtime-monitor.js
const WebSocket = require('ws');
const { performance } = require('perf_hooks');

class RealtimeMonitor {
  constructor() {
    this.metrics = {
      sessions: new Map(),
      messages: [],
      resources: [],
      alerts: []
    };
    
    this.wsServer = new WebSocket.Server({ port: 8080 });
    this.setupWebSocketServer();
    this.startMetricsCollection();
  }
  
  setupWebSocketServer() {
    this.wsServer.on('connection', (ws) => {
      console.log('Cliente de monitoramento conectado');
      
      // Enviar métricas atuais a cada segundo
      const interval = setInterval(() => {
        const currentMetrics = this.getCurrentMetrics();
        ws.send(JSON.stringify(currentMetrics));
      }, 1000);
      
      ws.on('close', () => {
        clearInterval(interval);
        console.log('Cliente de monitoramento desconectado');
      });
    });
    
    console.log('Servidor WebSocket de monitoramento iniciado na porta 8080');
  }
  
  startMetricsCollection() {
    setInterval(() => {
      const memUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      
      this.metrics.resources.push({
        timestamp: Date.now(),
        memory: {
          rss: memUsage.rss,
          heapUsed: memUsage.heapUsed,
          heapTotal: memUsage.heapTotal,
          external: memUsage.external
        },
        cpu: {
          user: cpuUsage.user,
          system: cpuUsage.system
        }
      });
      
      // Manter apenas últimas 100 medições
      if (this.metrics.resources.length > 100) {
        this.metrics.resources = this.metrics.resources.slice(-100);
      }
      
      // Verificar alertas
      this.checkAlerts();
    }, 1000);
  }
  
  getCurrentMetrics() {
    return {
      timestamp: Date.now(),
      activeSessions: this.metrics.sessions.size,
      totalMessages: this.metrics.messages.length,
      recentMessages: this.metrics.messages.filter(m => 
        Date.now() - m.timestamp < 60000
      ).length,
      resources: this.metrics.resources[this.metrics.resources.length - 1] || {},
      alerts: this.metrics.alerts.slice(-10)
    };
  }
  
  checkAlerts() {
    const current = this.getCurrentMetrics();
    const recentResources = this.metrics.resources.slice(-10);
    
    // Alerta de memória
    if (current.resources.memory && current.resources.memory.heapUsed > 1024 * 1024 * 1024) { // 1GB
      this.addAlert('HIGH_MEMORY', 'Uso de memória acima de 1GB');
    }
    
    // Alerta de CPU
    if (current.resources.cpu && current.resources.cpu.user > 80 * 1000000) { // 80%
      this.addAlert('HIGH_CPU', 'Uso de CPU acima de 80%');
    }
    
    // Alerta de crescimento de memória
    if (recentResources.length >= 5) {
      const memoryTrend = recentResources.map(r => r.memory.heapUsed);
      const isIncreasing = memoryTrend.every((val, i) => i === 0 || val >= memoryTrend[i-1]);
      
      if (isIncreasing) {
        this.addAlert('MEMORY_LEAK', 'Possível memory leak detectado');
      }
    }
  }
  
  addAlert(type, message) {
    this.metrics.alerts.push({
      type,
      message,
      timestamp: Date.now()
    });
    
    console.log(`🚨 ALERTA: ${type} - ${message}`);
  }
}

// Iniciar monitoramento
const monitor = new RealtimeMonitor();
```

## Execução Contínua (CI/CD)
```yaml
# .github/workflows/performance-tests.yml
name: Performance Tests

on:
  schedule:
    - cron: '0 2 * * *' # Diariamente às 2h da manhã
  workflow_dispatch:

jobs:
  performance-tests:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run performance tests
      run: npm run test:load
      
    - name: Generate report
      run: npm run test:report
      
    - name: Upload results
      uses: actions/upload-artifact@v3
      with:
        name: performance-reports
        path: tests/performance/reports/
```

Este plano abrange todos os aspectos necessários para validar performance e escalabilidade do WhatsApp Gateway, desde testes básicos até monitoramento contínuo e automação CI/CD.