#!/usr/bin/env node

const crypto = require('crypto');

console.log('🚀 Gerador de Variáveis de Ambiente para Railway - FutBoss\n');

// Gerar nova chave JWT para produção
const productionJWTSecret = crypto.randomBytes(64).toString('base64');

console.log('📋 COPIE E COLE ESTAS VARIÁVEIS NO RAILWAY:\n');
console.log('=' .repeat(60));

const variables = [
  {
    name: 'NODE_ENV',
    value: 'production',
    required: true,
    description: 'Define ambiente como produção'
  },
  {
    name: 'JWT_SECRET',
    value: productionJWTSecret,
    required: true,
    description: 'Chave secreta para JWT (NUNCA COMPARTILHE)'
  },
  {
    name: 'JWT_EXPIRES_IN',
    value: '7d',
    required: true,
    description: 'Tempo de expiração do JWT'
  },
  {
    name: 'CORS_ORIGIN',
    value: 'https://seu-app-name.railway.app',
    required: true,
    description: '⚠️  SUBSTITUA pelo seu domínio Railway real'
  },
  {
    name: 'RATE_LIMIT_WINDOW_MS',
    value: '900000',
    required: false,
    description: 'Janela de rate limiting (15 min)'
  },
  {
    name: 'RATE_LIMIT_MAX_REQUESTS',
    value: '100',
    required: false,
    description: 'Máximo de requests por IP'
  }
];

// Mostrar variáveis obrigatórias
console.log('🔴 OBRIGATÓRIAS:\n');
variables.filter(v => v.required).forEach((variable, index) => {
  console.log(`${index + 1}. Nome: ${variable.name}`);
  console.log(`   Valor: ${variable.value}`);
  console.log(`   Descrição: ${variable.description}\n`);
});

// Mostrar variáveis opcionais
console.log('🟡 OPCIONAIS (Recomendadas):\n');
variables.filter(v => !v.required).forEach((variable, index) => {
  console.log(`${index + 1}. Nome: ${variable.name}`);
  console.log(`   Valor: ${variable.value}`);
  console.log(`   Descrição: ${variable.description}\n`);
});

console.log('=' .repeat(60));
console.log('🚨 VARIÁVEIS QUE O RAILWAY CONFIGURA AUTOMATICAMENTE:\n');
console.log('❌ NÃO configure estas (Railway faz automaticamente):');
console.log('   • DATABASE_URL (configurado quando conecta PostgreSQL)');
console.log('   • PORT (Railway define automaticamente)\n');

console.log('=' .repeat(60));
console.log('📝 INSTRUÇÕES:\n');
console.log('1. Acesse: https://railway.app/dashboard');
console.log('2. Selecione seu projeto FutBoss');
console.log('3. Clique na aba "Variables"');
console.log('4. Para cada variável acima:');
console.log('   • Clique "New Variable"');
console.log('   • Cole o Nome exato');
console.log('   • Cole o Valor exato');
console.log('   • Clique "Add"');
console.log('5. Aguarde o redeploy automático\n');

console.log('⚠️  IMPORTANTE:');
console.log('   • Substitua "seu-app-name" pelo nome real do seu app Railway');
console.log('   • Nunca compartilhe a JWT_SECRET');
console.log('   • Salve essas informações em local seguro\n');

// Formato para copiar rapidamente
console.log('=' .repeat(60));
console.log('📋 FORMATO RÁPIDO PARA COPIAR:\n');

variables.forEach(variable => {
  console.log(`${variable.name}=${variable.value}`);
});

console.log('\n✅ Após configurar, teste em:');
console.log('   • https://seu-app.railway.app/health');
console.log('   • https://seu-app.railway.app/api/health');

// Salvar em arquivo se solicitado
const args = process.argv.slice(2);
if (args.includes('--save')) {
  const fs = require('fs');
  const path = require('path');
  
  const envContent = variables.map(v => `${v.name}=${v.value}`).join('\n');
  const filePath = path.join(__dirname, '../railway-variables.txt');
  
  try {
    fs.writeFileSync(filePath, envContent);
    console.log(`\n💾 Variáveis salvas em: ${filePath}`);
  } catch (error) {
    console.error('\n❌ Erro ao salvar arquivo:', error.message);
  }
}