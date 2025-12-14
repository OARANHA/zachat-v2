#!/usr/bin/env node

/**
 * Script para diagnosticar problemas de configuração de ambiente
 * Valida quais arquivos .env estão sendo carregados e seus valores
 */

const fs = require('fs');
const path = require('path');

console.log('=== DIAGNÓSTICO DE CONFIGURAÇÃO .env ===');
console.log('Data/Hora:', new Date().toISOString());
console.log('');

// 1. Verificar quais arquivos .env existem
const possibleEnvFiles = [
  '.env',
  'backend/.env',
  'frontend/.env'
];

console.log('1. ARQUIVOS .ENV ENCONTRADOS:');
possibleEnvFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
});
console.log('');

// 2. Ler conteúdo dos arquivos .env encontrados
const envContents = {};
possibleEnvFiles.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      envContents[file] = content;
      console.log(`2. CONTEÚDO DE ${file}:`);
      console.log(content);
      console.log('');
    } catch (error) {
      console.log(`❌ Erro ao ler ${file}:`, error.message);
    }
  }
});

// 3. Simular carregamento como o backend faz
console.log('3. SIMULAÇÃO DE CARREGAMENTO (como backend/src/app/config-env.ts):');
require('dotenv').config({
  path: process.env.NODE_ENV === "test" ? ".env.test" : ".env"
});

console.log('Variáveis de ambiente carregadas:');
const relevantVars = [
  'DATABASE_URL',
  'REDIS_URL',
  'POSTGRES_HOST',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'POSTGRES_DB',
  'DB_HOST',
  'REDIS_HOST',
  'REDIS_PASSWORD',
  'NODE_ENV'
];

relevantVars.forEach(varName => {
  const value = process.env[varName];
  console.log(`   ${varName}: ${value || 'NÃO DEFINIDO'}`);
});
console.log('');

// 4. Análise das URLs de conexão
console.log('4. ANÁLISE DAS URLs DE CONEXÃO:');

const dbUrl = process.env.DATABASE_URL;
const redisUrl = process.env.REDIS_URL;

if (dbUrl) {
  console.log(`DATABASE_URL: ${dbUrl}`);
  const dbHost = dbUrl.includes('localhost') ? '❌ LOCALHOST' : '✅ DOCKER HOST';
  console.log(`   Host detectado: ${dbHost}`);
  
  if (dbUrl.includes('postgres')) {
    const matches = dbUrl.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (matches) {
      console.log(`   User: ${matches[1]}`);
      console.log(`   Password: ${matches[2] ? '***' : 'VAZIO'}`);
      console.log(`   Host: ${matches[3]}`);
      console.log(`   Port: ${matches[4]}`);
      console.log(`   Database: ${matches[5]}`);
    }
  }
}
console.log('');

if (redisUrl) {
  console.log(`REDIS_URL: ${redisUrl}`);
  const redisHost = redisUrl.includes('localhost') ? '❌ LOCALHOST' : '✅ DOCKER HOST';
  console.log(`   Host detectado: ${redisHost}`);
  
  if (redisUrl.includes('redis')) {
    const matches = redisUrl.match(/redis:\/\/:([^@]*)@([^:]+):(\d+)\/?/);
    if (matches) {
      console.log(`   Password: ${matches[1] ? '***' : 'VAZIO'}`);
      console.log(`   Host: ${matches[2]}`);
      console.log(`   Port: ${matches[3]}`);
    }
  }
}
console.log('');

// 5. Verificar configuração do Docker
console.log('5. VERIFICAÇÃO DO DOCKER COMPOSE:');
try {
  const dockerComposePath = 'docker-compose.yml';
  if (fs.existsSync(dockerComposePath)) {
    const dockerContent = fs.readFileSync(dockerComposePath, 'utf8');
    
    // Verificar serviços definidos
    const hasPostgres = dockerContent.includes('postgres:');
    const hasRedis = dockerContent.includes('redis:');
    const hasBackend = dockerContent.includes('backend:');
    
    console.log(`   Serviço postgres: ${hasPostgres ? '✅' : '❌'}`);
    console.log(`   Serviço redis: ${hasRedis ? '✅' : '❌'}`);
    console.log(`   Serviço backend: ${hasBackend ? '✅' : '❌'}`);
    
    // Verificar variáveis de ambiente no backend
    if (hasBackend) {
      const backendEnvSection = dockerContent.match(/backend:\s*\n((?:[ ]{2,}.*)?\n)*?)/s);
      if (backendEnvSection) {
        const backendEnv = backendEnvSection[1];
        const hasDbHost = backendEnv.includes('DB_HOST: postgres');
        const hasRedisHost = backendEnv.includes('REDIS_HOST: redis');
        
        console.log(`   DB_HOST no backend: ${hasDbHost ? '✅' : '❌'}`);
        console.log(`   REDIS_HOST no backend: ${hasRedisHost ? '✅' : '❌'}`);
      }
    }
  }
} catch (error) {
  console.log('❌ Erro ao analisar docker-compose.yml:', error.message);
}

console.log('');
console.log('=== FIM DO DIAGNÓSTICO ===');