const express = require('express');
const router = express.Router();
const footballApiService = require('../services/footballApiService');

// Middleware para log das requisições
router.use((req, res, next) => {
  console.log(`[Football API] ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Rota para testar conectividade das APIs
router.get('/test-connection', async (req, res) => {
  try {
    const results = await footballApiService.testApiConnections();
    res.json({
      success: true,
      message: 'Teste de conectividade realizado',
      data: results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro no teste de conectividade:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// Rotas da API Futebol (Brasil)
router.get('/br/championships', async (req, res) => {
  try {
    const result = await footballApiService.getChampionships();
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Campeonatos obtidos com sucesso',
        data: result.data,
        source: result.source
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Erro ao obter campeonatos',
        error: result.error,
        source: result.source
      });
    }
  } catch (error) {
    console.error('Erro na rota de campeonatos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

router.get('/br/teams/:championshipId', async (req, res) => {
  try {
    const { championshipId } = req.params;
    const result = await footballApiService.getTeams(championshipId);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Times obtidos com sucesso',
        data: result.data,
        source: result.source
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Erro ao obter times',
        error: result.error,
        source: result.source
      });
    }
  } catch (error) {
    console.error('Erro na rota de times:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

router.get('/br/matches/:championshipId', async (req, res) => {
  try {
    const { championshipId } = req.params;
    const result = await footballApiService.getMatches(championshipId);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Partidas obtidas com sucesso',
        data: result.data,
        source: result.source
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Erro ao obter partidas',
        error: result.error,
        source: result.source
      });
    }
  } catch (error) {
    console.error('Erro na rota de partidas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

router.get('/br/player/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;
    const result = await footballApiService.getPlayerStats(playerId);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Estatísticas do jogador obtidas com sucesso',
        data: result.data,
        source: result.source
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Erro ao obter estatísticas do jogador',
        error: result.error,
        source: result.source
      });
    }
  } catch (error) {
    console.error('Erro na rota de jogador:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// Rotas da SportsData
router.get('/sportsdata/competitions', async (req, res) => {
  try {
    const result = await footballApiService.getSportsDataCompetitions();
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Competições obtidas com sucesso',
        data: result.data,
        source: result.source
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Erro ao obter competições',
        error: result.error,
        source: result.source
      });
    }
  } catch (error) {
    console.error('Erro na rota de competições:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

router.get('/sportsdata/teams/:competition', async (req, res) => {
  try {
    const { competition } = req.params;
    const result = await footballApiService.getSportsDataTeams(competition);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Times obtidos com sucesso',
        data: result.data,
        source: result.source
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Erro ao obter times',
        error: result.error,
        source: result.source
      });
    }
  } catch (error) {
    console.error('Erro na rota de times SportsData:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

router.get('/sportsdata/players/:team', async (req, res) => {
  try {
    const { team } = req.params;
    const result = await footballApiService.getSportsDataPlayers(team);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Jogadores obtidos com sucesso',
        data: result.data,
        source: result.source
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Erro ao obter jogadores',
        error: result.error,
        source: result.source
      });
    }
  } catch (error) {
    console.error('Erro na rota de jogadores SportsData:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// Rota híbrida para buscar dados de múltiplas fontes
router.get('/hybrid/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const params = req.query;
    
    const results = await footballApiService.getFootballData(type, params);
    
    res.json({
      success: true,
      message: `Dados de ${type} obtidos de múltiplas fontes`,
      data: results,
      sources: results.map(r => r.source),
      count: results.length
    });
  } catch (error) {
    console.error('Erro na rota híbrida:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// Rota de documentação das APIs disponíveis
router.get('/docs', (req, res) => {
  res.json({
    success: true,
    message: 'Documentação das APIs de Futebol',
    endpoints: {
      test: {
        path: '/api/football/test-connection',
        method: 'GET',
        description: 'Testa a conectividade com as APIs'
      },
      apiFutebol: {
        championships: {
          path: '/api/football/br/championships',
          method: 'GET',
          description: 'Lista campeonatos brasileiros'
        },
        teams: {
          path: '/api/football/br/teams/:championshipId',
          method: 'GET',
          description: 'Lista times de um campeonato'
        },
        matches: {
          path: '/api/football/br/matches/:championshipId',
          method: 'GET',
          description: 'Lista partidas de um campeonato'
        },
        player: {
          path: '/api/football/br/player/:playerId',
          method: 'GET',
          description: 'Estatísticas de um jogador'
        }
      },
      sportsData: {
        competitions: {
          path: '/api/football/sportsdata/competitions',
          method: 'GET',
          description: 'Lista competições internacionais'
        },
        teams: {
          path: '/api/football/sportsdata/teams/:competition',
          method: 'GET',
          description: 'Lista times de uma competição'
        },
        players: {
          path: '/api/football/sportsdata/players/:team',
          method: 'GET',
          description: 'Lista jogadores de um time'
        }
      },
      hybrid: {
        path: '/api/football/hybrid/:type',
        method: 'GET',
        description: 'Busca dados de múltiplas fontes',
        types: ['championships', 'teams', 'players'],
        queryParams: {
          championshipId: 'ID do campeonato (API Futebol)',
          competition: 'Nome da competição (SportsData)',
          team: 'Nome do time (SportsData)'
        }
      }
    },
    apiKeys: {
      apiFutebol: 'Configurada',
      sportsData: 'Configurada'
    }
  });
});

module.exports = router;