const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 Verificando usuários no banco...\n');
    
    // Buscar usuário test@futboss.app
    const testUser = await prisma.user.findUnique({
      where: { email: 'test@futboss.app' },
      include: {
        preferences: true
      }
    });
    
    if (testUser) {
      console.log('📊 Usuário test@futboss.app encontrado:');
      console.log('ID:', testUser.id);
      console.log('Email:', testUser.email);
      console.log('Username:', testUser.username);
      console.log('IsGuest:', testUser.isGuest);
      console.log('CreatedAt:', testUser.createdAt);
      console.log('LastLogin:', testUser.lastLogin);
      console.log('Password Hash:', testUser.password.substring(0, 30) + '...');
      console.log('Preferences:', testUser.preferences);
      console.log('');
    } else {
      console.log('❌ Usuário test@futboss.app não encontrado\n');
    }
    
    // Listar todos os usuários
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        isGuest: true,
        createdAt: true,
        lastLogin: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log('📋 Todos os usuários no banco:');
    console.log(`Total: ${allUsers.length} usuários\n`);
    
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.username})`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Guest: ${user.isGuest}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log(`   Last Login: ${user.lastLogin}`);
      console.log('');
    });
    
    // Contar por tipo
    const guestCount = allUsers.filter(u => u.isGuest).length;
    const registeredCount = allUsers.filter(u => !u.isGuest).length;
    
    console.log('📈 Estatísticas:');
    console.log(`Usuários registrados: ${registeredCount}`);
    console.log(`Usuários convidados: ${guestCount}`);
    console.log(`Total: ${allUsers.length}`);
    
  } catch (error) {
    console.error('❌ Erro ao verificar usuários:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();