const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar clubes
  console.log('📊 Criando clubes...');
  
  const realMadrid = await prisma.club.upsert({
    where: { name: 'Real Madrid' },
    update: {},
    create: {
      name: 'Real Madrid',
      league: 'La Liga',
      country: 'Spain',
      logoUrl: '/logos/real-madrid.png'
    }
  });

  const barcelona = await prisma.club.upsert({
    where: { name: 'FC Barcelona' },
    update: {},
    create: {
      name: 'FC Barcelona',
      league: 'La Liga',
      country: 'Spain',
      logoUrl: '/logos/barcelona.png'
    }
  });

  const palmeiras = await prisma.club.upsert({
    where: { name: 'Palmeiras' },
    update: {},
    create: {
      name: 'Palmeiras',
      league: 'Brasileirão',
      country: 'Brazil',
      logoUrl: '/logos/palmeiras.png'
    }
  });

  const flamengo = await prisma.club.upsert({
    where: { name: 'Flamengo' },
    update: {},
    create: {
      name: 'Flamengo',
      league: 'Brasileirão',
      country: 'Brazil',
      logoUrl: '/logos/flamengo.png'
    }
  });

  // Criar jogadores
  console.log('⚽ Criando jogadores...');
  
  const players = [
    // Real Madrid
    {
      name: 'Rodrygo',
      position: 'FORWARD',
      currentTeam: 'Real Madrid',
      marketValue: 65000000,
      currentScore: 7.9,
      averageScore: 7.2,
      nationality: 'Brazil',
      age: 23,
      clubId: realMadrid.id
    },
    {
      name: 'Vinícius Jr.',
      position: 'FORWARD',
      currentTeam: 'Real Madrid',
      marketValue: 120000000,
      currentScore: 8.1,
      averageScore: 7.8,
      nationality: 'Brazil',
      age: 24,
      clubId: realMadrid.id
    },
    {
      name: 'Jude Bellingham',
      position: 'MIDFIELDER',
      currentTeam: 'Real Madrid',
      marketValue: 150000000,
      currentScore: 8.5,
      averageScore: 8.2,
      nationality: 'England',
      age: 21,
      clubId: realMadrid.id
    },
    // Barcelona
    {
      name: 'Robert Lewandowski',
      position: 'FORWARD',
      currentTeam: 'FC Barcelona',
      marketValue: 45000000,
      currentScore: 8.3,
      averageScore: 8.0,
      nationality: 'Poland',
      age: 35,
      clubId: barcelona.id
    },
    {
      name: 'Pedri',
      position: 'MIDFIELDER',
      currentTeam: 'FC Barcelona',
      marketValue: 80000000,
      currentScore: 7.8,
      averageScore: 7.5,
      nationality: 'Spain',
      age: 22,
      clubId: barcelona.id
    },
    // Palmeiras
    {
      name: 'Endrick',
      position: 'FORWARD',
      currentTeam: 'Palmeiras',
      marketValue: 35000000,
      currentScore: 7.5,
      averageScore: 7.0,
      nationality: 'Brazil',
      age: 18,
      clubId: palmeiras.id
    },
    {
      name: 'Raphael Veiga',
      position: 'MIDFIELDER',
      currentTeam: 'Palmeiras',
      marketValue: 15000000,
      currentScore: 7.6,
      averageScore: 7.3,
      nationality: 'Brazil',
      age: 29,
      clubId: palmeiras.id
    },
    // Flamengo
    {
      name: 'Gabriel Barbosa',
      position: 'FORWARD',
      currentTeam: 'Flamengo',
      marketValue: 18000000,
      currentScore: 7.4,
      averageScore: 7.1,
      nationality: 'Brazil',
      age: 28,
      clubId: flamengo.id
    },
    {
      name: 'Arrascaeta',
      position: 'MIDFIELDER',
      currentTeam: 'Flamengo',
      marketValue: 12000000,
      currentScore: 7.7,
      averageScore: 7.4,
      nationality: 'Uruguay',
      age: 30,
      clubId: flamengo.id
    }
  ];

  for (const playerData of players) {
    const player = await prisma.player.upsert({
      where: { 
        name: playerData.name 
      },
      update: playerData,
      create: playerData
    });

    // Criar estatísticas para cada jogador
    await prisma.playerStats.upsert({
      where: { playerId: player.id },
      update: {},
      create: {
        playerId: player.id,
        gamesPlayed: Math.floor(Math.random() * 30) + 10,
        goals: Math.floor(Math.random() * 20),
        assists: Math.floor(Math.random() * 15),
        yellowCards: Math.floor(Math.random() * 5),
        redCards: Math.floor(Math.random() * 2),
        lastGameRating: playerData.currentScore
      }
    });
  }

  // Criar usuário de teste
  console.log('👤 Criando usuário de teste...');
  
  const testUser = await prisma.user.upsert({
    where: { email: 'test@futboss.app' },
    update: {},
    create: {
      email: 'test@futboss.app',
      username: 'testuser',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      isGuest: false
    }
  });

  // Criar preferências do usuário
  await prisma.userPreferences.upsert({
    where: { userId: testUser.id },
    update: {},
    create: {
      userId: testUser.id,
      favoriteTeam: 'Real Madrid',
      preferredFormation: '4-3-3',
      notifications: true
    }
  });

  console.log('✅ Seed concluído com sucesso!');
  console.log(`📊 Clubes criados: ${await prisma.club.count()}`);
  console.log(`⚽ Jogadores criados: ${await prisma.player.count()}`);
  console.log(`👤 Usuários criados: ${await prisma.user.count()}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Erro no seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });