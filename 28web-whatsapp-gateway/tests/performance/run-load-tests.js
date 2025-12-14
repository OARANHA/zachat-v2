const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class LoadTestRunner {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      tests: [],
      summary: {}
    };
    this.startTime = Date.now();
  }

  async runAllTests() {
    console.log('🚀 Iniciando suíte de testes de carga para WhatsApp Gateway...');
    console.log('⏱️ Timestamp:', this.results.timestamp);
    
    // Criar diretório de relatórios se não existir
    const reportDir = path.join(__dirname, 'reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
      console.log('📁 Diretório de relatórios criado:', reportDir);
    }
    
    const tests = [
      { 
        name: 'session-creation-low', 
        description: 'Criação de sessões - Baixa carga (10 req/s)',
        script: 'artillery run tests/performance/session-test-low.yml'
      },
      { 
        name: 'session-creation-medium', 
        description: 'Criação de sessões - Carga média (50 req/s)',
        script: 'artillery run tests/performance/session-test-medium.yml'
      },
      { 
        name: 'session-creation-high', 
        description: 'Criação de sessões - Alta carga (100 req/s)',
        script: 'artillery run tests/performance/session-test-high.yml'
      },
      { 
        name: 'webhook-processing', 
        description: 'Processamento de webhooks',
        script: 'node tests/performance/webhook-test.js'
      },
      { 
        name: 'message-throughput', 
        description: 'Throughput de mensagens',
        script: 'node tests/performance/message-load-test.js'
      },
      { 
        name: 'stress-test', 
        description: 'Teste de estresse',
        script: 'artillery run tests/performance/stress-test.yml'
      }
    ];
    
    for (const test of tests) {
      console.log(`\n📋 Executando teste: ${test.name}`);
      console.log(`📝 Descrição: ${test.description}`);
      
      const result = await this.runTest(test);
      this.results.tests.push(result);
      
      // Aguardar recuperação entre testes
      console.log('⏳ Aguardando 30 segundos para recuperação...');
      await new Promise(resolve => setTimeout(resolve, 30000));
    }
    
    this.generateReport();
    console.log('\n✅ Suíte de testes concluída!');
    console.log(`⏱️ Duração total: ${(Date.now() - this.startTime) / 1000} segundos`);
  }
  
  async runTest(test) {
    const testStartTime = Date.now();
    
    try {
      console.log(`🔧 Executando comando: ${test.script}`);
      
      const output = execSync(test.script, { 
        encoding: 'utf8', 
        timeout: 600000, // 10 minutos timeout
        maxBuffer: 1024 * 1024 // 1MB de buffer
      });
      
      const testEndTime = Date.now();
      const duration = testEndTime - testStartTime;
      
      // Analisar output para métricas
      const metrics = this.parseArtilleryOutput(output);
      
      console.log(`✅ Teste ${test.name} concluído em ${duration}ms`);
      console.log(`📊 Métricas extraídas:`, metrics);
      
      return {
        name: test.name,
        description: test.description,
        status: this.determineTestStatus(metrics),
        duration: duration,
        metrics: metrics,
        output: output.substring(0, 1000) + '...' // Primeiros 1000 caracteres
      };
    } catch (error) {
      const testEndTime = Date.now();
      const duration = testEndTime - testStartTime;
      
      console.error(`❌ Erro no teste ${test.name}:`, error.message);
      
      return {
        name: test.name,
        description: test.description,
        status: 'failed',
        duration: duration,
        error: error.message,
        metrics: null
      };
    }
  }
  
  parseArtilleryOutput(output) {
    const metrics = {
      requests: { total: 0, completed: 0, failed: 0 },
      responseTime: { min: 0, max: 0, median: 0, p95: 0, p99: 0 },
      rps: { count: 0, mean: 0 },
      errors: { total: 0, rate: 0 }
    };
    
    // Extrair métricas do output do Artillery
    const lines = output.split('\n');
    
    for (const line of lines) {
      if (line.includes('http.requests.rate:')) {
        const match = line.match(/http\.requests\.rate:\s*(\d+\.\d+)/);
        if (match) metrics.rps.mean = parseFloat(match[1]);
      }
      
      if (line.includes('http.requests.total:')) {
        const match = line.match(/http\.requests\.total:\s*(\d+)/);
        if (match) metrics.requests.total = parseInt(match[1]);
      }
      
      if (line.includes('http.requests.completed:')) {
        const match = line.match(/http\.requests\.completed:\s*(\d+)/);
        if (match) metrics.requests.completed = parseInt(match[1]);
      }
      
      if (line.includes('http.requests.failed:')) {
        const match = line.match(/http\.requests\.failed:\s*(\d+)/);
        if (match) metrics.requests.failed = parseInt(match[1]);
      }
      
      if (line.includes('http.response_time.min:')) {
        const match = line.match(/http\.response_time\.min:\s*(\d+\.\d+)/);
        if (match) metrics.responseTime.min = parseFloat(match[1]);
      }
      
      if (line.includes('http.response_time.max:')) {
        const match = line.match(/http\.response_time\.max:\s*(\d+\.\d+)/);
        if (match) metrics.responseTime.max = parseFloat(match[1]);
      }
      
      if (line.includes('http.response_time.median:')) {
        const match = line.match(/http\.response_time\.median:\s*(\d+\.\d+)/);
        if (match) metrics.responseTime.median = parseFloat(match[1]);
      }
      
      if (line.includes('http.response_time.p95:')) {
        const match = line.match(/http\.response_time\.p95:\s*(\d+\.\d+)/);
        if (match) metrics.responseTime.p95 = parseFloat(match[1]);
      }
      
      if (line.includes('http.response_time.p99:')) {
        const match = line.match(/http\.response_time\.p99:\s*(\d+\.\d+)/);
        if (match) metrics.responseTime.p99 = parseFloat(match[1]);
      }
      
      if (line.includes('http.errors.rate:')) {
        const match = line.match(/http\.errors\.rate:\s*(\d+\.\d+)/);
        if (match) metrics.errors.rate = parseFloat(match[1]);
      }
    }
    
    return metrics;
  }
  
  determineTestStatus(metrics) {
    if (!metrics) return 'failed';
    
    // Critérios de sucesso/fracasso baseados nas métricas
    const errorRate = metrics.requests.total > 0 ? (metrics.requests.failed / metrics.requests.total) * 100 : 0;
    const avgResponseTime = metrics.responseTime.median || metrics.responseTime.p95;
    
    if (errorRate > 10 || avgResponseTime > 5000 || metrics.errors.rate > 5) {
      return 'failed';
    } else if (errorRate > 5 || avgResponseTime > 2000 || metrics.errors.rate > 2) {
      return 'degraded';
    } else {
      return 'passed';
    }
  }
  
  generateReport() {
    const reportData = {
      ...this.results,
      summary: this.generateSummary()
    };
    
    // Salvar relatório JSON
    const jsonReportPath = path.join(__dirname, 'reports', `performance-report-${Date.now()}.json`);
    fs.writeFileSync(jsonReportPath, JSON.stringify(reportData, null, 2));
    console.log(`📄 Relatório JSON salvo: ${jsonReportPath}`);
    
    // Gerar relatório Markdown
    const mdReportPath = jsonReportPath.replace('.json', '.md');
    const mdReport = this.generateMarkdownReport(reportData);
    fs.writeFileSync(mdReportPath, mdReport);
    console.log(`📄 Relatório Markdown salvo: ${mdReportPath}`);
    
    // Exibir resumo no console
    console.log('\n📊 RESUMO EXECUTIVO:');
    console.log('================');
    this.displaySummary(reportData.summary);
  }
  
  generateSummary() {
    const passedTests = this.results.tests.filter(t => t.status === 'passed').length;
    const degradedTests = this.results.tests.filter(t => t.status === 'degraded').length;
    const failedTests = this.results.tests.filter(t => t.status === 'failed').length;
    const totalTests = this.results.tests.length;
    
    return {
      total: totalTests,
      passed: passedTests,
      degraded: degradedTests,
      failed: failedTests,
      successRate: totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0
    };
  }
  
  displaySummary(summary) {
    console.log(`Total de testes: ${summary.total}`);
    console.log(`✅ Aprovados: ${summary.passed}`);
    console.log(`⚠️ Degradados: ${summary.degraded}`);
    console.log(`❌ Falhados: ${summary.failed}`);
    console.log(`📈 Taxa de sucesso: ${summary.successRate}%`);
    
    // Destaques dos testes críticos
    const criticalTests = this.results.tests.filter(t => 
      t.name.includes('session-creation') || 
      t.name.includes('message-throughput') ||
      t.name.includes('stress-test')
    );
    
    if (criticalTests.length > 0) {
      console.log('\n🎯 ANÁLISE DOS TESTES CRÍTICOS:');
      criticalTests.forEach(test => {
        console.log(`\n📋 ${test.name}: ${test.status}`);
        if (test.metrics) {
          console.log(`   📊 RPS: ${test.metrics.rps?.mean || 'N/A'}`);
          console.log(`   ⏱️ Response Time p95: ${test.metrics.responseTime?.p95 || 'N/A'}ms`);
          console.log(`   ❌ Error Rate: ${test.metrics.errors?.rate || 'N/A'}%`);
        }
      });
    }
  }
  
  generateMarkdownReport(data) {
    let markdown = `# Relatório de Performance - WhatsApp Gateway\n\n`;
    markdown += `**Data**: ${data.timestamp}\n`;
    markdown += `**Duração Total**: ${(Date.now() - this.startTime) / 1000} segundos\n\n`;
    
    markdown += `## Resumo Executivo\n\n`;
    markdown += `- **Testes Executados**: ${data.summary.total}\n`;
    markdown += `- **Aprovados**: ${data.summary.passed} (${data.summary.successRate}%)\n`;
    markdown += `- **Degradados**: ${data.summary.degraded}\n`;
    markdown += `- **Falhados**: ${data.summary.failed}\n\n`;
    
    markdown += `## Resultados Detalhados\n\n`;
    markdown += `| Teste | Status | Duração (ms) | RPS | Response Time p95 (ms) | Error Rate (%) |\n`;
    markdown += `|-------|--------|-------------|-----|----------------------|------------------|\n`;
    
    for (const test of data.tests) {
      const status = test.status === 'passed' ? '✅' : test.status === 'degraded' ? '⚠️' : '❌';
      const rps = test.metrics?.rps?.mean || 'N/A';
      const p95 = test.metrics?.responseTime?.p95 || 'N/A';
      const errorRate = test.metrics?.errors?.rate || 'N/A';
      
      markdown += `| ${test.name} | ${status} | ${test.duration} | ${rps} | ${p95} | ${errorRate} |\n`;
      
      if (test.error) {
        markdown += `| **Erro**: ${test.error} |\n`;
        markdown += `|-------|--------|-------------|-----|----------------------|------------------|\n`;
      }
    }
    
    markdown += `\n\n## Análise e Recomendações\n\n`;
    
    // Análise baseada nos resultados
    const hasFailures = data.summary.failed > 0;
    const hasDegraded = data.summary.degraded > 0;
    
    if (hasFailures || hasDegraded) {
      markdown += `### ⚠️ Problemas Identificados\n\n`;
      
      if (hasFailures) {
        markdown += `- **Falhas Críticas**: Testes apresentaram taxas de erro inaceitáveis\n`;
        markdown += `- **Gargalos de Performance**: Response times acima dos limites especificados\n`;
      }
      
      if (hasDegraded) {
        markdown += `- **Degradação**: Performance abaixo do esperado mas funcional\n`;
        markdown += `- **Limites de Escalabilidade**: Sistema não suporta carga máxima esperada\n`;
      }
      
      markdown += `\n### 🔧 Recomendações Imediatas\n\n`;
      markdown += `1. **Otimizar SessionManager**: Implementar cache e pooling de conexões\n`;
      markdown += `2. **Melhorar MessageQueue**: Adicionar processamento em batch e retry exponencial\n`;
      markdown += `3. **Implementar Rate Limiting**: Controlar carga por sessão\n`;
      markdown += `4. **Monitoramento Granular**: Adicionar métricas em tempo real\n`;
      markdown += `5. **Escalabilidade Horizontal**: Preparar arquitetura para múltiplas instâncias\n`;
    } else {
      markdown += `### ✅ Performance Adequada\n\n`;
      markdown += `- **Throughput**: Sistema suporta carga esperada\n`;
      markdown += `- **Response Time**: Tempos de resposta dentro dos limites\n`;
      markdown += `- **Escalabilidade**: Arquitetura preparada para crescimento\n`;
    }
    
    return markdown;
  }
}

// Executar testes se chamado diretamente
if (require.main === module) {
  const runner = new LoadTestRunner();
  runner.runAllTests().catch(console.error);
}

module.exports = LoadTestRunner;