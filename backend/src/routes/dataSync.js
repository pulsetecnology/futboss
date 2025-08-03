const express = require('express');
const router = express.Router();
const dataSyncService = require('../services/dataSyncService');
const apiSportsService = require('../services/apiSportsService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Middleware para log das requisições
router.use((req, res, next) => {
  console.log(`[Data Sync] ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Sincronizar futebol com dados reais
router.post('/sync/real-football', async (req, res) => {
  try {
    const result = await dataSyncService.syncRealFootball();
    res.json({
      success: true,
      message: 'Sincronização com dados reais concluída com sucesso',
      data: result
    });
  } catch (error) {
    console.error('Erro na sincronização:', error);
    res.status(500).json({
      success: false,
      message: 'Erro na sincronização com dados reais',
      error: error.message
    });
  }
});

// Manter compatibilidade com endpoint antigo
router.post('/sync/european-football', async (req, res) => {
  res.status(410).json({
    success: false,
    message: 'Endpoint descontinuado. Use /sync/real-football'
  });
});

// Rota para sincronizar dados do futebol brasileiro (mantida para compatibilidade)
router.post('/sync/brazilian-football', async (req, res) => {
  res.status(410).json({
    success: false,
    message: 'Endpoint descontinuado. Use /sync/european-football',
    redirect: '/api/data-sync/sync/european-football'
  });
});

// Sincronizar clubes das principais ligas
router.post('/sync/real-clubs', async (req, res) => {
  try {
    const result = await dataSyncService.syncRealClubs();
    res.json({
      success: true,
      message: 'Sincronização de clubes concluída com sucesso',
      data: result
    });
  } catch (error) {
    console.error('Erro na sincronização de clubes:', error);
    res.status(500).json({
      success: false,
      message: 'Erro na sincronização de clubes',
      error: error.message
    });
  }
});

// Manter compatibilidade
router.post('/sync/clubs', async (req, res) => {
  res.status(410).json({
    success: false,
    message: 'Endpoint descontinuado. Use /sync/real-clubs'
  });
});

// Sincronizar jogadores das principais ligas
router.post('/sync/real-players', async (req, res) => {
  try {
    const result = await dataSyncService.syncRealPlayers();
    
    res.json({
      success: true,
      message: 'Sincronização de jogadores concluída com sucesso',
      data: result
    });
  } catch (error) {
    console.error('Erro na sincronização de jogadores:', error);
    res.status(500).json({
      success: false,
      message: 'Erro na sincronização de jogadores',
      error: error.message
    });
  }
});

// Manter compatibilidade
router.post('/sync/players', async (req, res) => {
  res.status(410).json({
    success: false,
    message: 'Endpoint descontinuado. Use /sync/real-players'
  });
});

// Rota para atualizar pontuações dos jogadores
router.post('/update/player-scores', async (req, res) => {
  try {
    const updatedCount = await dataSyncService.updatePlayerScores();
    
    res.json({
      success: true,
      message: 'Pontuações dos jogadores atualizadas com sucesso',
      data: {
        playersUpdated: updatedCount
      }
    });
  } catch (error) {
    console.error('Erro na atualização de pontuações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar pontuações',
      error: error.message
    });
  }
});

// Rota para verificar status da sincronização
router.get('/sync/status', (req, res) => {
  try {
    const status = dataSyncService.getSyncStatus();
    
    res.json({
      success: true,
      message: 'Status da sincronização obtido com sucesso',
      data: status
    });
  } catch (error) {
    console.error('Erro ao obter status:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter status da sincronização',
      error: error.message
    });
  }
});

// Rota para listar clubes europeus
router.get('/clubs/european', async (req, res) => {
  try {
    const clubs = await prisma.club.findMany({
      where: {
        country: {
          in: ['England', 'Spain', 'Italy', 'Germany', 'France']
        }
      },
      include: {
        _count: {
          select: {
            players: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    res.json({
      success: true,
      message: 'Clubes europeus obtidos com sucesso',
      data: clubs,
      count: clubs.length
    });
  } catch (error) {
    console.error('Erro ao buscar clubes:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar clubes europeus',
      error: error.message
    });
  }
});

// Rota para listar clubes brasileiros no banco (mantida para compatibilidade)
router.get('/clubs/brazilian', async (req, res) => {
  try {
    const clubs = await prisma.club.findMany({
      where: {
        country: 'Brasil'
      },
      include: {
        _count: {
          select: {
            players: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    res.json({
      success: true,
      message: 'Clubes brasileiros obtidos com sucesso',
      data: clubs,
      count: clubs.length
    });
  } catch (error) {
    console.error('Erro ao buscar clubes:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar clubes brasileiros',
      error: error.message
    });
  }
});

// Rota para listar jogadores europeus
router.get('/players/european', async (req, res) => {
  try {
    const { limit = 20, offset = 0, position, club } = req.query;
    
    // Construir filtros
    const where = {
      club: {
        country: {
          in: ['England', 'Spain', 'Italy', 'Germany', 'France']
        }
      }
    };
    
    if (position) {
      where.position = position;
    }
    
    if (club) {
      where.club = {
        ...where.club,
        name: {
          contains: club,
          mode: 'insensitive'
        }
      };
    }
    
    const players = await prisma.player.findMany({
      where,
      include: {
        club: {
          select: {
            name: true,
            league: true,
            country: true,
            logoUrl: true
          }
        },
        playerStats: true
      },
      orderBy: {
        marketValue: 'desc'
      },
      take: parseInt(limit),
      skip: parseInt(offset)
    });
    
    const total = await prisma.player.count({ where });
    
    res.json({
      success: true,
      message: 'Jogadores europeus obtidos com sucesso',
      data: players,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < total
      }
    });
  } catch (error) {
    console.error('Erro ao buscar jogadores europeus:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno ao buscar jogadores europeus',
      error: error.message
    });
  }
});

// Rota para listar jogadores brasileiros
router.get('/players/brazilian', async (req, res) => {
  try {
    const { page = 1, limit = 20, position, club } = req.query;
    const skip = (page - 1) * limit;
    
    const where = {
      nationality: 'Brasil'
    };
    
    if (position) {
      where.position = position.toUpperCase();
    }
    
    if (club) {
      where.currentTeam = {
        contains: club,
        mode: 'insensitive'
      };
    }
    
    const [players, total] = await Promise.all([
      prisma.player.findMany({
        where,
        include: {
          playerStats: true,
          club: true
        },
        orderBy: {
          marketValue: 'desc'
        },
        skip: parseInt(skip),
        take: parseInt(limit)
      }),
      prisma.player.count({ where })
    ]);
    
    res.json({
      success: true,
      message: 'Jogadores brasileiros obtidos com sucesso',
      data: players,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar jogadores:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar jogadores brasileiros',
      error: error.message
    });
  }
});

// Rota para obter estatísticas gerais
router.get('/stats', async (req, res) => {
  try {
    const [clubsCount, playersCount, playersByPosition] = await Promise.all([
      prisma.club.count({
        where: { country: 'Brasil' }
      }),
      prisma.player.count({
        where: { nationality: 'Brasil' }
      }),
      prisma.player.groupBy({
        by: ['position'],
        where: { nationality: 'Brasil' },
        _count: {
          position: true
        }
      })
    ]);
    
    const topPlayers = await prisma.player.findMany({
      where: { nationality: 'Brasil' },
      orderBy: { marketValue: 'desc' },
      take: 10,
      include: {
        club: true,
        playerStats: true
      }
    });
    
    res.json({
      success: true,
      message: 'Estatísticas obtidas com sucesso',
      data: {
        summary: {
          totalClubs: clubsCount,
          totalPlayers: playersCount,
          playersByPosition: playersByPosition.reduce((acc, item) => {
            acc[item.position] = item._count.position;
            return acc;
          }, {})
        },
        topPlayers
      }
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter estatísticas',
      error: error.message
    });
  }
});

// Testar conexão com API-Sports
router.get('/test/api-sports', async (req, res) => {
  try {
    const result = await apiSportsService.testConnection();
    res.json(result);
  } catch (error) {
    console.error('Erro ao testar API-Sports:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao testar conexão com API-Sports',
      error: error.message
    });
  }
});

// Rota para verificar dados sincronizados
router.get('/stats/players', async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const playersCount = await prisma.player.count();
    const playersWithStats = await prisma.player.count({
      where: {
        playerStats: { isNot: null }
      }
    });
    const playersWithScouts = await prisma.player.count({
      where: {
        playerScouts: { isNot: null }
      }
    });
    const clubsCount = await prisma.club.count();
    
    // Buscar alguns jogadores de exemplo
    const samplePlayers = await prisma.player.findMany({
      take: 5,
      include: {
        playerStats: true,
        playerScouts: true,
        club: true
      }
    });
    
    res.json({
      success: true,
      stats: {
        totalPlayers: playersCount,
        playersWithStats: playersWithStats,
        playersWithScouts: playersWithScouts,
        totalClubs: clubsCount
      },
      samplePlayers: samplePlayers.map(player => ({
        name: player.name,
        position: player.position,
        currentTeam: player.currentTeam,
        league: player.league,
        currentScore: player.currentScore,
        marketValue: player.marketValue,
        hasStats: !!player.playerStats,
        hasScouts: !!player.playerScouts,
        totalScout: player.playerScouts?.totalScout || 0
      }))
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas',
      error: error.message
    });
  }
});

// Rota para atualizar scores (usando dados mockados quando API está limitada)
router.post('/update/scores', async (req, res) => {
  try {
    const result = await dataSyncService.updatePlayerScores();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar scores',
      error: error.message
    });
  }
});

// Rota para criar jogadores mockados para demonstração
router.post('/demo/create-players', async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Buscar alguns clubes para adicionar jogadores
    const clubs = await prisma.club.findMany({
      take: 10, // Apenas 10 clubes para demonstração
      where: {
        league: {
          in: ['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1']
        }
      }
    });
    
    let totalPlayersCreated = 0;
    
    for (const club of clubs) {
      const playersCreated = await dataSyncService.createMockPlayersForClub(club);
      totalPlayersCreated += playersCreated;
      console.log(`✅ ${playersCreated} jogadores criados para ${club.name}`);
    }
    
    res.json({
      success: true,
      message: `${totalPlayersCreated} jogadores mockados criados com sucesso`,
      data: {
        clubsProcessed: clubs.length,
        totalPlayersCreated: totalPlayersCreated
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao criar jogadores mockados',
      error: error.message
    });
  }
});

// Rota para limpar dados (apenas em desenvolvimento)
router.delete('/clear/all', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: 'Operação não permitida em produção'
    });
  }
  
  try {
    // Deletar em ordem devido às relações
    await prisma.teamPlayer.deleteMany();
    await prisma.playerStats.deleteMany();
    await prisma.player.deleteMany();
    await prisma.club.deleteMany();
    
    res.json({
      success: true,
      message: 'Todos os dados foram limpos com sucesso'
    });
  } catch (error) {
    console.error('Erro ao limpar dados:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao limpar dados',
      error: error.message
    });
  }
});

// Rota de documentação
router.get('/docs', (req, res) => {
  res.json({
    success: true,
    message: 'Documentação da API de Sincronização de Dados',
    endpoints: {
      sync: {
        fullSync: {
          path: '/api/data-sync/sync/brazilian-football',
          method: 'POST',
          description: 'Sincroniza clubes e jogadores do futebol brasileiro'
        },
        clubs: {
          path: '/api/data-sync/sync/clubs',
          method: 'POST',
          description: 'Sincroniza apenas clubes brasileiros'
        },
        players: {
          path: '/api/data-sync/sync/players',
          method: 'POST',
          description: 'Sincroniza apenas jogadores brasileiros'
        },
        updateScores: {
          path: '/api/data-sync/update/player-scores',
          method: 'POST',
          description: 'Atualiza pontuações dos jogadores'
        },
        status: {
          path: '/api/data-sync/sync/status',
          method: 'GET',
          description: 'Verifica status da sincronização'
        }
      },
      data: {
        clubs: {
          path: '/api/data-sync/clubs/brazilian',
          method: 'GET',
          description: 'Lista clubes brasileiros'
        },
        players: {
          path: '/api/data-sync/players/brazilian',
          method: 'GET',
          description: 'Lista jogadores brasileiros',
          queryParams: {
            page: 'Página (padrão: 1)',
            limit: 'Limite por página (padrão: 20)',
            position: 'Filtrar por posição (GOALKEEPER, DEFENDER, MIDFIELDER, FORWARD)',
            club: 'Filtrar por clube'
          }
        },
        stats: {
          path: '/api/data-sync/stats',
          method: 'GET',
          description: 'Estatísticas gerais dos dados'
        }
      },
      admin: {
        clear: {
          path: '/api/data-sync/clear/all',
          method: 'DELETE',
          description: 'Limpa todos os dados (apenas desenvolvimento)'
        }
      }
    }
  });
});

module.exports = router;