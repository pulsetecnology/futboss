#!/usr/bin/env node

const crypto = require('crypto');

/**
 * Gera uma chave JWT segura usando crypto.randomBytes
 * @param {number} length - Tamanho da chave em bytes (padrão: 64)
 * @returns {string} Chave JWT em formato base64
 */
function generateJWTSecret(length = 64) {
  return crypto.randomBytes(length).toString('base64');
}

/**
 * Gera uma chave JWT segura usando crypto.randomBytes em formato hex
 * @param {number} length - Tamanho da chave em bytes (padrão: 64)
 * @returns {string} Chave JWT em formato hexadecimal
 */
function generateJWTSecretHex(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Gera uma chave JWT segura usando caracteres alfanuméricos
 * @param {number} length - Tamanho da chave em caracteres (padrão: 128)
 * @returns {string} Chave JWT alfanumérica
 */
function generateJWTSecretAlphanumeric(length = 128) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

console.log('🔐 Gerador de Chaves JWT Seguras para FutBoss\n');

console.log('📋 Opções de chaves JWT seguras:\n');

console.log('1️⃣  Base64 (Recomendado para produção):');
const base64Key = generateJWTSecret();
console.log(`   ${base64Key}\n`);

console.log('2️⃣  Hexadecimal (Alternativa):');
const hexKey = generateJWTSecretHex();
console.log(`   ${hexKey}\n`);

console.log('3️⃣  Alfanumérico (Mais legível):');
const alphanumericKey = generateJWTSecretAlphanumeric();
console.log(`   ${alphanumericKey}\n`);

console.log('🚀 Para usar no Railway:');
console.log('   1. Acesse o painel do Railway');
console.log('   2. Vá em Variables');
console.log('   3. Adicione: JWT_SECRET');
console.log(`   4. Cole uma das chaves acima\n`);

console.log('💻 Para desenvolvimento local:');
console.log('   1. Edite o arquivo backend/.env');
console.log(`   2. Substitua: JWT_SECRET=${base64Key}\n`);

console.log('⚠️  IMPORTANTE:');
console.log('   - Nunca compartilhe essas chaves');
console.log('   - Use chaves diferentes para dev/prod');
console.log('   - Mantenha as chaves seguras e privadas');

// Salvar no arquivo .env se solicitado
const args = process.argv.slice(2);
if (args.includes('--save')) {
  const fs = require('fs');
  const path = require('path');
  
  const envPath = path.join(__dirname, '../backend/.env');
  
  try {
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Substituir ou adicionar JWT_SECRET
    const jwtSecretRegex = /^JWT_SECRET=.*$/m;
    const newJwtSecret = `JWT_SECRET=${base64Key}`;
    
    if (jwtSecretRegex.test(envContent)) {
      envContent = envContent.replace(jwtSecretRegex, newJwtSecret);
    } else {
      envContent += `\n${newJwtSecret}\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ Chave JWT salva em backend/.env');
  } catch (error) {
    console.error('\n❌ Erro ao salvar no .env:', error.message);
  }
}