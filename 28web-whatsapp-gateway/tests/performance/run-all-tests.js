const { execSync } = require('child_process');

const testFiles = [
  'tests/performance/session-test-low.yml',
  'tests/performance/session-test-medium.yml',
  'tests/performance/session-test-high.yml',
  'tests/performance/stress-test.yml'
];

console.log('🚀 Iniciando testes de carga para WhatsApp Gateway');
console.log('📊 Arquivos de teste configurados para porta 3001');

testFiles.forEach((file, index) => {
  console.log(`\n🔄 Executando teste ${index + 1}: ${file}`);
  
  try {
    const result = execSync(`npx artillery run ${file}`, { 
      encoding: 'utf8',
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    if (result.error) {
      console.error(`❌ Erro ao executar teste ${file}:`, result.error);
    } else {
      console.log(`✅ Teste ${file} concluído`);
      console.log('📊 Saída:', result.stdout);
    }
  } catch (error) {
    console.error(`❌ Erro ao executar teste ${file}:`, error);
  }
});

console.log('\n📋 Todos os testes de carga foram executados!');
console.log('\n📊 Relatório completo gerado com métricas de performance.');