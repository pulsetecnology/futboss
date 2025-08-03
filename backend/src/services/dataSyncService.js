const footballApiService = require('./footballApiService');
const apiSportsService = require('./apiSportsService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class DataSyncService {
  constructor() {
    this.syncInProgress = false;
    this.lastSyncDate = null;
  }

  // Mapear posições da API para o enum do Prisma
  mapPlayerPosition(apiPosition) {
    const positionMap = {
      'Goleiro': 'GOALKEEPER',
      'Zagueiro': 'DEFENDER',
      'Lateral': 'DEFENDER',
      'Volante': 'MIDFIELDER',
      'Meio-campo': 'MIDFIELDER',
      'Meia': 'MIDFIELDER',
      'Atacante': 'FORWARD',
      'Centroavante': 'FORWARD'
    };
    
    return positionMap[apiPosition] || 'MIDFIELDER';
  }

  // Calcular valor de mercado baseado em estatísticas
  calculateMarketValue(playerStats) {
    let baseValue = 1000000; // 1M base
    
    if (playerStats.goals) {
      baseValue += playerStats.goals * 500000; // 500k por gol
    }
    if (playerStats.assists) {
      baseValue += playerStats.assists * 300000; // 300k por assistência
    }
    if (playerStats.gamesPlayed) {
      baseValue += playerStats.gamesPlayed * 100000; // 100k por jogo
    }
    
    // Reduzir valor por cartões
    if (playerStats.yellowCards) {
      baseValue -= playerStats.yellowCards * 50000;
    }
    if (playerStats.redCards) {
      baseValue -= playerStats.redCards * 200000;
    }
    
    return Math.max(baseValue, 500000); // Mínimo 500k
  }

  // Sincronizar clubes das principais ligas
  async syncRealClubs() {
    console.log('🏟️ Iniciando sincronização de clubes das principais ligas...');
    
    try {
      const targetLeagues = apiSportsService.getTargetLeagues();
      let totalClubs = 0;

      for (const league of targetLeagues) {
        console.log(`🔄 Processando liga: ${league.name} (${league.country})`);
        
        const teamsResult = await apiSportsService.getTeamsByLeague(league.id);
        
        if (teamsResult.success && teamsResult.data) {
          const teams = teamsResult.data;
          console.log(`👥 Encontrados ${teams.length} times na ${league.name}`);

          for (const teamData of teams) {
            try {
              const team = teamData.team;
              
              await prisma.club.upsert({
                where: { name: team.name },
                update: {
                  league: league.name,
                  country: league.country,
                  logoUrl: team.logo || null,
                  apiId: team.id?.toString(),
                  apiKey: team.id?.toString() // API-Sports usa ID como chave
                },
                create: {
                  name: team.name,
                  league: league.name,
                  country: league.country,
                  logoUrl: team.logo || null,
                  apiId: team.id?.toString(),
                  apiKey: team.id?.toString()
                }
              });
              
              totalClubs++;
            } catch (error) {
              console.error(`❌ Erro ao salvar clube ${team.name}:`, error.message);
            }
          }
        } else {
          console.error(`❌ Erro ao buscar times da ${league.name}:`, teamsResult.error);
        }
      }

      console.log(`✅ Sincronização de clubes concluída: ${totalClubs} clubes`);
      return { success: true, count: totalClubs };
      
    } catch (error) {
      console.error('❌ Erro na sincronização de clubes:', error);
      return { success: false, error: error.message };
    }
  }

  // Criar clubes brasileiros mockados como fallback
  async createMockBrazilianClubs() {
    const mockClubs = [
      { name: 'Flamengo', league: 'Brasileirão Série A', country: 'Brasil' },
      { name: 'Palmeiras', league: 'Brasileirão Série A', country: 'Brasil' },
      { name: 'Corinthians', league: 'Brasileirão Série A', country: 'Brasil' },
      { name: 'São Paulo', league: 'Brasileirão Série A', country: 'Brasil' },
      { name: 'Santos', league: 'Brasileirão Série A', country: 'Brasil' },
      { name: 'Vasco', league: 'Brasileirão Série A', country: 'Brasil' },
      { name: 'Botafogo', league: 'Brasileirão Série A', country: 'Brasil' },
      { name: 'Fluminense', league: 'Brasileirão Série A', country: 'Brasil' },
      { name: 'Grêmio', league: 'Brasileirão Série A', country: 'Brasil' },
      { name: 'Internacional', league: 'Brasileirão Série A', country: 'Brasil' },
      { name: 'Atlético-MG', league: 'Brasileirão Série A', country: 'Brasil' },
      { name: 'Cruzeiro', league: 'Brasileirão Série A', country: 'Brasil' }
    ];
    
    let created = 0;
    for (const club of mockClubs) {
      try {
        await prisma.club.upsert({
          where: { name: club.name },
          update: club,
          create: club
        });
        created++;
      } catch (error) {
        console.log(`⚠️ Erro ao criar clube mockado ${club.name}: ${error.message}`);
      }
    }
    
    console.log(`✅ Criados ${created} clubes brasileiros (dados mockados)`);
    return created;
  }

  // Sincronizar jogadores das principais ligas
  async syncRealPlayers() {
    console.log('⚽ Iniciando sincronização de jogadores das principais ligas...');
    
    try {
      // Buscar todos os clubes sincronizados
      const clubs = await prisma.club.findMany({
        where: {
          apiId: {
            not: null
          }
        }
      });

      console.log(`🏟️ Encontrados ${clubs.length} clubes para sincronização`);
      let totalPlayers = 0;

      for (const club of clubs) {
        console.log(`🔄 Processando jogadores do ${club.name} (${club.league})...`);
        
        try {
          const playersCount = await this.createApiSportsPlayersForClub(club);
          totalPlayers += playersCount;
          console.log(`✅ ${playersCount} jogadores adicionados ao ${club.name}`);
          
          // Pequena pausa para evitar rate limiting
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.error(`❌ Erro ao processar jogadores do ${club.name}:`, error.message);
        }
      }

      console.log(`✅ Sincronização de jogadores concluída: ${totalPlayers} jogadores`);
      return { success: true, count: totalPlayers };
      
    } catch (error) {
      console.error('❌ Erro na sincronização de jogadores:', error);
      return { success: false, error: error.message };
      throw error;
    }
  }

  // Criar jogadores reais para um clube usando SportsData API
  async createRealPlayersForClub(club) {
    try {
      // Verificar se temos a chave da API para este clube
      if (!club.apiKey) {
        throw new Error(`Clube ${club.name} não possui chave da API`);
      }
      
      // Buscar jogadores reais da SportsData API usando a chave do time
      const playersResult = await footballApiService.getSportsDataPlayers(club.apiKey);
      
      if (!playersResult.success || !playersResult.data) {
        throw new Error('Falha ao buscar jogadores da API');
      }
      
      const apiPlayers = Array.isArray(playersResult.data) ? playersResult.data : [];
      let created = 0;
      
      for (const apiPlayer of apiPlayers.slice(0, 25)) { // Limitar a 25 jogadores por time
        try {
          // Verificar se o jogador já existe
          const existingPlayer = await prisma.player.findUnique({
            where: { name: apiPlayer.CommonName || apiPlayer.FirstName + ' ' + apiPlayer.LastName }
          });
          
          if (!existingPlayer) {
            const position = this.mapSportsDataPosition(apiPlayer.Position);
            const marketValue = this.calculateMarketValueFromAge(apiPlayer.BirthDate, position);
            
            const player = await prisma.player.create({
              data: {
                name: apiPlayer.CommonName || `${apiPlayer.FirstName} ${apiPlayer.LastName}`,
                position: position,
                currentTeam: club.name,
                marketValue: marketValue,
                currentScore: Math.random() * 10,
                averageScore: Math.random() * 8 + 2,
                nationality: apiPlayer.Nationality || 'Unknown',
                age: this.calculateAge(apiPlayer.BirthDate),
                clubId: club.id,
                playerStats: {
                  create: {
                    gamesPlayed: Math.floor(Math.random() * 30),
                    goals: position === 'FORWARD' ? Math.floor(Math.random() * 20) : Math.floor(Math.random() * 5),
                    assists: Math.floor(Math.random() * 10),
                    yellowCards: Math.floor(Math.random() * 5),
                    redCards: Math.floor(Math.random() * 2),
                    lastGameRating: Math.random() * 4 + 6
                  }
                }
              }
            });
            
            created++;
          }
        } catch (error) {
          console.log(`⚠️ Erro ao criar jogador ${apiPlayer.CommonName || apiPlayer.FirstName}: ${error.message}`);
        }
      }
      
      return created;
      
    } catch (error) {
      console.log(`⚠️ Erro ao buscar jogadores reais para ${club.name}: ${error.message}`);
      throw error;
    }
  }
  
  // Novo método para criar jogadores usando API-Sports
  async createApiSportsPlayersForClub(club) {
    try {
      if (!club.apiId) {
        console.log(`⚠️ Clube ${club.name} não possui ID da API`);
        return 0;
      }

      const playersResult = await apiSportsService.getAllPlayersByTeam(club.apiId);
      
      if (!playersResult.success || !playersResult.data) {
        console.log(`⚠️ Não foi possível buscar jogadores para ${club.name}: ${playersResult.error}`);
        return 0;
      }

      const players = playersResult.data;
      let createdPlayers = 0;

      console.log(`📊 Encontrados ${players.length} jogadores para ${club.name}`);

      for (const apiPlayer of players) {
        try {
          const playerData = apiSportsService.formatPlayerData(apiPlayer, club.name, club.league);
          
          // Verificar se o jogador já existe
          const existingPlayer = await prisma.player.findFirst({
            where: {
              OR: [
                { name: playerData.name },
                { 
                  name: playerData.name,
                  clubId: club.id 
                }
              ]
            }
          });

          if (existingPlayer) {
            // Atualizar dados do jogador
            await prisma.player.update({
              where: { id: existingPlayer.id },
              data: {
                currentTeam: playerData.currentTeam,
                league: playerData.league,
                clubId: club.id,
                marketValue: playerData.marketValue,
                currentScore: playerData.score,
                averageScore: playerData.score,
                age: playerData.age,
                apiId: playerData.apiId,
                photoUrl: playerData.photo,
                lastSyncAt: new Date()
              }
            });

            // Atualizar ou criar estatísticas
            await prisma.playerStats.upsert({
              where: { playerId: existingPlayer.id },
              update: {
                season: playerData.statistics.season,
                gamesPlayed: playerData.statistics.games,
                minutesPlayed: playerData.statistics.minutes,
                goals: playerData.statistics.goals,
                assists: playerData.statistics.assists,
                yellowCards: playerData.statistics.yellowCards,
                redCards: playerData.statistics.redCards,
                saves: playerData.statistics.saves,
                cleanSheets: playerData.statistics.cleanSheets,
                goalsConceded: playerData.statistics.goalsConceded,
                passes: playerData.statistics.passes,
                passAccuracy: playerData.statistics.passAccuracy,
                tackles: playerData.statistics.tackles,
                interceptions: playerData.statistics.interceptions,
                blocks: playerData.statistics.blocks,
                duelsWon: playerData.statistics.duelsWon,
                duelsTotal: playerData.statistics.duelsTotal,
                dribbles: playerData.statistics.dribbles,
                foulsDrawn: playerData.statistics.foulsDrawn,
                foulsCommitted: playerData.statistics.foulsCommitted,
                penaltiesScored: playerData.statistics.penaltiesScored,
                penaltiesMissed: playerData.statistics.penaltiesMissed,
                lastGameRating: playerData.statistics.rating,
                averageRating: playerData.statistics.averageRating
              },
              create: {
                playerId: existingPlayer.id,
                season: playerData.statistics.season,
                gamesPlayed: playerData.statistics.games,
                minutesPlayed: playerData.statistics.minutes,
                goals: playerData.statistics.goals,
                assists: playerData.statistics.assists,
                yellowCards: playerData.statistics.yellowCards,
                redCards: playerData.statistics.redCards,
                saves: playerData.statistics.saves,
                cleanSheets: playerData.statistics.cleanSheets,
                goalsConceded: playerData.statistics.goalsConceded,
                passes: playerData.statistics.passes,
                passAccuracy: playerData.statistics.passAccuracy,
                tackles: playerData.statistics.tackles,
                interceptions: playerData.statistics.interceptions,
                blocks: playerData.statistics.blocks,
                duelsWon: playerData.statistics.duelsWon,
                duelsTotal: playerData.statistics.duelsTotal,
                dribbles: playerData.statistics.dribbles,
                foulsDrawn: playerData.statistics.foulsDrawn,
                foulsCommitted: playerData.statistics.foulsCommitted,
                penaltiesScored: playerData.statistics.penaltiesScored,
                penaltiesMissed: playerData.statistics.penaltiesMissed,
                lastGameRating: playerData.statistics.rating,
                averageRating: playerData.statistics.averageRating
              }
            });

            // Atualizar ou criar scouts
            await prisma.playerScouts.upsert({
              where: { playerId: existingPlayer.id },
              update: {
                season: playerData.statistics.season,
                goalsScout: playerData.scouts.goalsScout,
                assistsScout: playerData.scouts.assistsScout,
                finalizationScout: playerData.scouts.finalizationScout,
                tacklesScout: playerData.scouts.tacklesScout,
                interceptionsScout: playerData.scouts.interceptionsScout,
                blocksScout: playerData.scouts.blocksScout,
                savesScout: playerData.scouts.savesScout,
                cleanSheetsScout: playerData.scouts.cleanSheetsScout,
                penaltiesSavedScout: playerData.scouts.penaltiesSavedScout,
                disciplineScout: playerData.scouts.disciplineScout,
                passesScout: playerData.scouts.passesScout,
                duelsScout: playerData.scouts.duelsScout,
                totalScout: playerData.scouts.totalScout
              },
              create: {
                playerId: existingPlayer.id,
                season: playerData.statistics.season,
                goalsScout: playerData.scouts.goalsScout,
                assistsScout: playerData.scouts.assistsScout,
                finalizationScout: playerData.scouts.finalizationScout,
                tacklesScout: playerData.scouts.tacklesScout,
                interceptionsScout: playerData.scouts.interceptionsScout,
                blocksScout: playerData.scouts.blocksScout,
                savesScout: playerData.scouts.savesScout,
                cleanSheetsScout: playerData.scouts.cleanSheetsScout,
                penaltiesSavedScout: playerData.scouts.penaltiesSavedScout,
                disciplineScout: playerData.scouts.disciplineScout,
                passesScout: playerData.scouts.passesScout,
                duelsScout: playerData.scouts.duelsScout,
                totalScout: playerData.scouts.totalScout
              }
            });
            
            continue;
          }

          const player = await prisma.player.create({
            data: {
              name: playerData.name,
              position: playerData.position,
              currentTeam: playerData.currentTeam,
              league: playerData.league,
              clubId: club.id,
              marketValue: playerData.marketValue,
              currentScore: playerData.score,
              averageScore: playerData.score,
              nationality: playerData.nationality,
              age: playerData.age,
              apiId: playerData.apiId,
              photoUrl: playerData.photo,
              lastSyncAt: new Date()
            }
          });

          // Criar estatísticas detalhadas baseadas nos dados da API
          await prisma.playerStats.create({
            data: {
              playerId: player.id,
              season: playerData.statistics.season,
              gamesPlayed: playerData.statistics.games,
              minutesPlayed: playerData.statistics.minutes,
              goals: playerData.statistics.goals,
              assists: playerData.statistics.assists,
              yellowCards: playerData.statistics.yellowCards,
              redCards: playerData.statistics.redCards,
              saves: playerData.statistics.saves,
              cleanSheets: playerData.statistics.cleanSheets,
              goalsConceded: playerData.statistics.goalsConceded,
              passes: playerData.statistics.passes,
              passAccuracy: playerData.statistics.passAccuracy,
              tackles: playerData.statistics.tackles,
              interceptions: playerData.statistics.interceptions,
              blocks: playerData.statistics.blocks,
              duelsWon: playerData.statistics.duelsWon,
              duelsTotal: playerData.statistics.duelsTotal,
              dribbles: playerData.statistics.dribbles,
              foulsDrawn: playerData.statistics.foulsDrawn,
              foulsCommitted: playerData.statistics.foulsCommitted,
              penaltiesScored: playerData.statistics.penaltiesScored,
              penaltiesMissed: playerData.statistics.penaltiesMissed,
              lastGameRating: playerData.statistics.rating,
              averageRating: playerData.statistics.averageRating
            }
          });

          // Criar scouts baseados nos dados da API
          await prisma.playerScouts.create({
            data: {
              playerId: player.id,
              season: playerData.statistics.season,
              goalsScout: playerData.scouts.goalsScout,
              assistsScout: playerData.scouts.assistsScout,
              finalizationScout: playerData.scouts.finalizationScout,
              tacklesScout: playerData.scouts.tacklesScout,
              interceptionsScout: playerData.scouts.interceptionsScout,
              blocksScout: playerData.scouts.blocksScout,
              savesScout: playerData.scouts.savesScout,
              cleanSheetsScout: playerData.scouts.cleanSheetsScout,
              penaltiesSavedScout: playerData.scouts.penaltiesSavedScout,
              disciplineScout: playerData.scouts.disciplineScout,
              passesScout: playerData.scouts.passesScout,
              duelsScout: playerData.scouts.duelsScout,
              totalScout: playerData.scouts.totalScout
            }
          });

          createdPlayers++;
        } catch (error) {
          console.log(`⚠️ Erro ao criar jogador ${apiPlayer.player?.name}: ${error.message}`);
        }
      }

      return createdPlayers;
    } catch (error) {
      console.error(`❌ Erro ao buscar jogadores para ${club.name}:`, error.message);
      return 0;
    }
  }

  // Mapear posições da SportsData para o enum do Prisma
  mapSportsDataPosition(apiPosition) {
    if (!apiPosition) return 'MIDFIELDER';
    
    const position = apiPosition.toLowerCase();
    
    if (position.includes('goalkeeper') || position.includes('gk')) {
      return 'GOALKEEPER';
    }
    if (position.includes('defender') || position.includes('back') || position.includes('cb') || position.includes('lb') || position.includes('rb')) {
      return 'DEFENDER';
    }
    if (position.includes('midfielder') || position.includes('mid') || position.includes('cm') || position.includes('dm') || position.includes('am')) {
      return 'MIDFIELDER';
    }
    if (position.includes('forward') || position.includes('striker') || position.includes('winger') || position.includes('lw') || position.includes('rw')) {
      return 'FORWARD';
    }
    
    return 'MIDFIELDER';
  }
  
  // Calcular idade a partir da data de nascimento
  calculateAge(birthDate) {
    if (!birthDate) return Math.floor(Math.random() * 15) + 18;
    
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }
  
  // Calcular valor de mercado baseado na idade e posição
  calculateMarketValueFromAge(birthDate, position) {
    const age = this.calculateAge(birthDate);
    let baseValue = 2000000; // 2M base
    
    // Ajustar por idade (pico entre 24-28 anos)
    if (age >= 24 && age <= 28) {
      baseValue *= 1.5;
    } else if (age >= 29 && age <= 32) {
      baseValue *= 1.2;
    } else if (age >= 18 && age <= 23) {
      baseValue *= 1.3; // Jovens promissores
    } else if (age > 32) {
      baseValue *= 0.7;
    }
    
    // Ajustar por posição
    if (position === 'FORWARD') {
      baseValue *= 1.3;
    } else if (position === 'MIDFIELDER') {
      baseValue *= 1.1;
    } else if (position === 'GOALKEEPER') {
      baseValue *= 0.9;
    }
    
    // Adicionar variação aleatória
    const variation = (Math.random() - 0.5) * 0.4; // ±20%
    baseValue *= (1 + variation);
    
    return Math.max(Math.floor(baseValue), 500000); // Mínimo 500k
  }

  // Criar jogadores mockados para um clube
  async createMockPlayersForClub(club) {
    try {
      const positions = ['GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'FORWARD'];
      const nationalities = ['Brazil', 'Argentina', 'Spain', 'France', 'Germany', 'Italy', 'England', 'Portugal'];
      
      // Nomes brasileiros realistas
      const playerNames = [
        'Gabriel Silva', 'Lucas Santos', 'Rafael Oliveira', 'Diego Costa', 'Bruno Henrique',
        'Matheus Pereira', 'João Victor', 'Pedro Henrique', 'Thiago Maia', 'Everton Ribeiro',
        'Gustavo Scarpa', 'Raphael Veiga', 'Dudu Alves', 'Rony Silva', 'Weverton Santos',
        'Marcos Rocha', 'Luan Garcia', 'Zé Rafael', 'Patrick de Paula', 'Wesley Ribeiro',
        'Danilo Barbosa', 'Mayke Santos', 'Piquerez Lima', 'Murilo Cerqueira', 'Kuscevic Silva'
      ];
      
      const playersToCreate = Math.min(25, playerNames.length);
      let created = 0;
      
      for (let i = 0; i < playersToCreate; i++) {
        const position = positions[Math.floor(Math.random() * positions.length)];
        const nationality = nationalities[Math.floor(Math.random() * nationalities.length)];
        const age = Math.floor(Math.random() * 15) + 18; // 18-32 anos
        const marketValue = this.generateRandomMarketValue(position);
        const currentScore = Math.random() * 40 + 50; // 50-90
        
        try {
          const existingPlayer = await prisma.player.findUnique({
            where: { name: playerNames[i] }
          });
          
          if (!existingPlayer) {
            const player = await prisma.player.create({
              data: {
                name: playerNames[i],
                position: position,
                currentTeam: club.name,
                league: club.league,
                marketValue: marketValue,
                currentScore: currentScore,
                averageScore: currentScore,
                nationality: nationality,
                age: age,
                clubId: club.id,
                lastSyncAt: new Date()
              }
            });
            
            // Criar estatísticas mockadas
            const gamesPlayed = Math.floor(Math.random() * 30) + 5;
            const goals = position === 'FORWARD' ? Math.floor(Math.random() * 20) : 
                         position === 'MIDFIELDER' ? Math.floor(Math.random() * 8) : 
                         Math.floor(Math.random() * 3);
            const assists = position === 'FORWARD' ? Math.floor(Math.random() * 8) : 
                           position === 'MIDFIELDER' ? Math.floor(Math.random() * 12) : 
                           Math.floor(Math.random() * 4);
            
            await prisma.playerStats.create({
              data: {
                playerId: player.id,
                season: 2023,
                gamesPlayed: gamesPlayed,
                minutesPlayed: gamesPlayed * (Math.floor(Math.random() * 60) + 30),
                goals: goals,
                assists: assists,
                yellowCards: Math.floor(Math.random() * 5),
                redCards: Math.floor(Math.random() * 2),
                saves: position === 'GOALKEEPER' ? Math.floor(Math.random() * 100) + 20 : 0,
                cleanSheets: position === 'GOALKEEPER' ? Math.floor(Math.random() * 10) : 0,
                goalsConceded: position === 'GOALKEEPER' ? Math.floor(Math.random() * 30) + 10 : 0,
                passes: Math.floor(Math.random() * 1000) + 200,
                passAccuracy: Math.random() * 20 + 70, // 70-90%
                tackles: position !== 'FORWARD' ? Math.floor(Math.random() * 50) + 10 : Math.floor(Math.random() * 20),
                interceptions: position === 'DEFENDER' ? Math.floor(Math.random() * 40) + 10 : Math.floor(Math.random() * 20),
                blocks: position === 'DEFENDER' ? Math.floor(Math.random() * 20) + 5 : Math.floor(Math.random() * 10),
                duelsWon: Math.floor(Math.random() * 100) + 20,
                duelsTotal: Math.floor(Math.random() * 150) + 50,
                dribbles: position === 'FORWARD' ? Math.floor(Math.random() * 50) + 10 : Math.floor(Math.random() * 30),
                foulsDrawn: Math.floor(Math.random() * 20),
                foulsCommitted: Math.floor(Math.random() * 25),
                penaltiesScored: Math.floor(Math.random() * 3),
                penaltiesMissed: Math.floor(Math.random() * 2),
                lastGameRating: Math.random() * 4 + 6, // 6-10
                averageRating: Math.random() * 2 + 6.5 // 6.5-8.5
              }
            });
            
            // Criar scouts mockados
            await prisma.playerScouts.create({
              data: {
                playerId: player.id,
                season: 2023,
                goalsScout: goals * 5,
                assistsScout: assists * 3,
                finalizationScout: Math.floor(Math.random() * 20) + 5,
                tacklesScout: position !== 'FORWARD' ? Math.floor(Math.random() * 30) + 10 : Math.floor(Math.random() * 15),
                interceptionsScout: position === 'DEFENDER' ? Math.floor(Math.random() * 25) + 10 : Math.floor(Math.random() * 15),
                blocksScout: position === 'DEFENDER' ? Math.floor(Math.random() * 20) + 5 : Math.floor(Math.random() * 10),
                savesScout: position === 'GOALKEEPER' ? Math.floor(Math.random() * 50) + 20 : 0,
                cleanSheetsScout: position === 'GOALKEEPER' ? Math.floor(Math.random() * 25) + 5 : 0,
                penaltiesSavedScout: position === 'GOALKEEPER' ? Math.floor(Math.random() * 15) : 0,
                disciplineScout: -(Math.floor(Math.random() * 10) + 2), // Negativo por cartões
                passesScout: Math.floor(Math.random() * 30) + 10,
                duelsScout: Math.floor(Math.random() * 25) + 5,
                totalScout: 0 // Será calculado
              }
            });
            
            // Atualizar o scout total
            const scouts = await prisma.playerScouts.findUnique({
              where: { playerId: player.id }
            });
            
            const totalScout = scouts.goalsScout + scouts.assistsScout + scouts.finalizationScout +
                              scouts.tacklesScout + scouts.interceptionsScout + scouts.blocksScout +
                              scouts.savesScout + scouts.cleanSheetsScout + scouts.penaltiesSavedScout +
                              scouts.disciplineScout + scouts.passesScout + scouts.duelsScout;
            
            await prisma.playerScouts.update({
              where: { playerId: player.id },
              data: { totalScout: totalScout }
            });
            
            created++;
          }
        } catch (error) {
          console.log(`⚠️ Erro ao criar jogador ${playerNames[i]}: ${error.message}`);
        }
      }
      
      return created;
      
    } catch (error) {
      console.log(`⚠️ Erro ao criar jogadores mockados para ${club.name}: ${error.message}`);
      throw error;
    }
  }

  // Gerar valor de mercado aleatório baseado na posição
  generateRandomMarketValue(position) {
    const baseValues = {
      'GOALKEEPER': { min: 2000000, max: 15000000 },
      'DEFENDER': { min: 3000000, max: 25000000 },
      'MIDFIELDER': { min: 5000000, max: 40000000 },
      'FORWARD': { min: 8000000, max: 60000000 }
    };
    
    const range = baseValues[position];
    return Math.floor(Math.random() * (range.max - range.min) + range.min);
  }

  // Sincronização completa com dados reais
  async syncRealFootball() {
    if (this.syncInProgress) {
      throw new Error('Sincronização já em andamento');
    }
    
    this.syncInProgress = true;
    const startTime = Date.now();
    
    try {
      console.log('🚀 Iniciando sincronização completa com dados reais...');
      
      // 1. Sincronizar clubes das principais ligas
      console.log('\n📋 Etapa 1: Sincronizando clubes das principais ligas...');
      const clubsResult = await this.syncRealClubs();
      
      // 2. Sincronizar jogadores reais
      console.log('\n⚽ Etapa 2: Sincronizando jogadores reais...');
      const playersResult = await this.syncRealPlayers();
      
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      
      this.lastSyncDate = new Date();
      
      const summary = {
        success: true,
        duration: `${duration} segundos`,
        results: {
          clubs: clubsResult.count || 0,
          players: playersResult.count || 0
        }
      };
      
      console.log('\n✅ Sincronização completa finalizada!');
      console.log(`📊 Resumo: ${summary.results.clubs} clubes, ${summary.results.players} jogadores`);
      console.log(`⏱️ Tempo total: ${summary.duration}`);
      
      return summary;
      
    } catch (error) {
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      
      console.error('❌ Erro na sincronização:', error);
      
      return {
        success: false,
        error: error.message,
        duration: `${duration} segundos`
      };
    } finally {
      this.syncInProgress = false;
    }
  }

  // Atualizar pontuações dos jogadores
  async updatePlayerScores() {
    try {
      console.log('🔄 Iniciando atualização de pontuações dos jogadores...');
      
      const players = await prisma.player.findMany({
        include: {
          playerStats: true,
          playerScouts: true,
          club: true
        },
        where: {
          apiId: { not: null }, // Apenas jogadores com ID da API
          club: { apiId: { not: null } } // Apenas jogadores de clubes com ID da API
        }
      });

      let updated = 0;
      
      for (const player of players) {
        try {
          // Buscar dados atualizados da API
          const playersResult = await apiSportsService.getAllPlayersByTeam(player.club.apiId);
          
          if (!playersResult.success) {
            continue;
          }

          // Encontrar o jogador específico nos dados da API
          const apiPlayer = playersResult.data.find(p => p.player.id.toString() === player.apiId);
          
          if (!apiPlayer) {
            continue;
          }

          // Formatar dados atualizados
          const playerData = apiSportsService.formatPlayerData(apiPlayer, player.club.name, player.club.league);
          
          // Atualizar dados do jogador
          await prisma.player.update({
            where: { id: player.id },
            data: {
              currentScore: playerData.score,
              averageScore: (player.averageScore * 0.7) + (playerData.score * 0.3), // Média ponderada
              marketValue: playerData.marketValue,
              age: playerData.age,
              lastSyncAt: new Date()
            }
          });

          // Atualizar estatísticas
          if (player.playerStats) {
            await prisma.playerStats.update({
              where: { playerId: player.id },
              data: {
                gamesPlayed: playerData.statistics.games,
                minutesPlayed: playerData.statistics.minutes,
                goals: playerData.statistics.goals,
                assists: playerData.statistics.assists,
                yellowCards: playerData.statistics.yellowCards,
                redCards: playerData.statistics.redCards,
                saves: playerData.statistics.saves,
                cleanSheets: playerData.statistics.cleanSheets,
                goalsConceded: playerData.statistics.goalsConceded,
                passes: playerData.statistics.passes,
                passAccuracy: playerData.statistics.passAccuracy,
                tackles: playerData.statistics.tackles,
                interceptions: playerData.statistics.interceptions,
                blocks: playerData.statistics.blocks,
                duelsWon: playerData.statistics.duelsWon,
                duelsTotal: playerData.statistics.duelsTotal,
                dribbles: playerData.statistics.dribbles,
                foulsDrawn: playerData.statistics.foulsDrawn,
                foulsCommitted: playerData.statistics.foulsCommitted,
                penaltiesScored: playerData.statistics.penaltiesScored,
                penaltiesMissed: playerData.statistics.penaltiesMissed,
                lastGameRating: playerData.statistics.rating,
                averageRating: playerData.statistics.averageRating
              }
            });
          }

          // Atualizar scouts
          if (player.playerScouts) {
            await prisma.playerScouts.update({
              where: { playerId: player.id },
              data: {
                goalsScout: playerData.scouts.goalsScout,
                assistsScout: playerData.scouts.assistsScout,
                finalizationScout: playerData.scouts.finalizationScout,
                tacklesScout: playerData.scouts.tacklesScout,
                interceptionsScout: playerData.scouts.interceptionsScout,
                blocksScout: playerData.scouts.blocksScout,
                savesScout: playerData.scouts.savesScout,
                cleanSheetsScout: playerData.scouts.cleanSheetsScout,
                penaltiesSavedScout: playerData.scouts.penaltiesSavedScout,
                disciplineScout: playerData.scouts.disciplineScout,
                passesScout: playerData.scouts.passesScout,
                duelsScout: playerData.scouts.duelsScout,
                totalScout: playerData.scouts.totalScout
              }
            });
          }
          
          updated++;
          
          // Pausa para evitar rate limiting
          if (updated % 10 === 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          
        } catch (error) {
          console.log(`⚠️ Erro ao atualizar jogador ${player.name}: ${error.message}`);
        }
      }
      
      console.log(`✅ ${updated} jogadores tiveram suas pontuações atualizadas`);
      return {
        success: true,
        message: `${updated} jogadores atualizados com sucesso`,
        playersUpdated: updated
      };
      
    } catch (error) {
      console.error('❌ Erro ao atualizar pontuações:', error);
      throw error;
    }
  }

  // Status da sincronização
  getSyncStatus() {
    return {
      syncInProgress: this.syncInProgress,
      lastSyncDate: this.lastSyncDate,
      nextSyncRecommended: this.lastSyncDate ? 
        new Date(this.lastSyncDate.getTime() + 24 * 60 * 60 * 1000) : // 24 horas
        new Date()
    };
  }
}

module.exports = new DataSyncService();