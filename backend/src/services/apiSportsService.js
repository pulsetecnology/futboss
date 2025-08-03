const axios = require('axios');

const API_SPORTS_BASE_URL = 'https://v3.football.api-sports.io';
const API_SPORTS_KEY = '84bd27d469b20d0641f3192024dd2752';

class ApiSportsService {
  constructor() {
    this.client = axios.create({
      baseURL: API_SPORTS_BASE_URL,
      headers: {
        'x-rapidapi-key': API_SPORTS_KEY
      }
    });
  }

  // Principais ligas que vamos sincronizar
  getTargetLeagues() {
    return [
      { id: 39, name: 'Premier League', country: 'England' },
      { id: 140, name: 'La Liga', country: 'Spain' },
      { id: 135, name: 'Serie A', country: 'Italy' },
      { id: 78, name: 'Bundesliga', country: 'Germany' },
      { id: 61, name: 'Ligue 1', country: 'France' },
      { id: 71, name: 'Série A', country: 'Brazil' },
      { id: 128, name: 'Liga Profesional', country: 'Argentina' }
    ];
  }

  async getLeagues(season = 2023) {
    try {
      const response = await this.client.get(`/leagues?season=${season}`);
      return {
        success: true,
        data: response.data.response,
        source: 'api-sports'
      };
    } catch (error) {
      console.error('Erro ao buscar ligas:', error.message);
      return {
        success: false,
        error: error.message,
        source: 'api-sports'
      };
    }
  }

  async getTeamsByLeague(leagueId, season = 2023) {
    try {
      const response = await this.client.get(`/teams?league=${leagueId}&season=${season}`);
      return {
        success: true,
        data: response.data.response,
        source: 'api-sports'
      };
    } catch (error) {
      console.error(`Erro ao buscar times da liga ${leagueId}:`, error.message);
      return {
        success: false,
        error: error.message,
        source: 'api-sports'
      };
    }
  }

  async getPlayersByTeam(teamId, season = 2023, page = 1) {
    try {
      console.log(`🔍 Buscando jogadores do time ${teamId}, temporada ${season}, página ${page}`);
      const response = await this.client.get(`/players?team=${teamId}&season=${season}&page=${page}`);
      console.log(`📊 API retornou ${response.data.results} jogadores para o time ${teamId}`);
      return {
        success: true,
        data: response.data.response,
        paging: response.data.paging,
        source: 'api-sports'
      };
    } catch (error) {
      console.error(`Erro ao buscar jogadores do time ${teamId}:`, error.message);
      return {
        success: false,
        error: error.message,
        source: 'api-sports'
      };
    }
  }

  async getAllPlayersByTeam(teamId, season = 2023) {
    try {
      let allPlayers = [];
      let currentPage = 1;
      let totalPages = 1;

      do {
        const result = await this.getPlayersByTeam(teamId, season, currentPage);
        if (!result.success) {
          return result;
        }

        allPlayers = allPlayers.concat(result.data);
        totalPages = result.paging.total;
        currentPage++;
      } while (currentPage <= totalPages);

      console.log(`✅ Total de ${allPlayers.length} jogadores encontrados para o time ${teamId}`);
      return {
        success: true,
        data: allPlayers,
        source: 'api-sports'
      };
    } catch (error) {
      console.error(`Erro ao buscar todos os jogadores do time ${teamId}:`, error.message);
      return {
        success: false,
        error: error.message,
        source: 'api-sports'
      };
    }
  }

  // Mapear posição da API-Sports para nosso sistema
  mapPosition(apiPosition) {
    const positionMap = {
      'Goalkeeper': 'Goleiro',
      'Defender': 'Zagueiro',
      'Midfielder': 'Meio-campo',
      'Attacker': 'Atacante'
    };
    return positionMap[apiPosition] || 'Meio-campo';
  }

  // Calcular pontuação baseada nas estatísticas do jogador
  calculatePlayerScore(playerStats) {
    if (!playerStats || !playerStats.games) {
      return Math.floor(Math.random() * 30) + 50; // Score aleatório entre 50-80
    }

    const games = playerStats.games;
    const goals = playerStats.goals;
    const passes = playerStats.passes;
    const tackles = playerStats.tackles;
    const cards = playerStats.cards;

    let score = 60; // Base score

    // Pontos por jogos
    if (games.appearences) {
      score += Math.min(games.appearences * 0.5, 10);
    }

    // Pontos por gols
    if (goals.total) {
      score += goals.total * 3;
    }

    // Pontos por assistências
    if (goals.assists) {
      score += goals.assists * 2;
    }

    // Pontos por passes
    if (passes.accuracy && passes.total) {
      const passAccuracy = passes.accuracy / 100;
      score += (passes.total * passAccuracy) / 50;
    }

    // Pontos por desarmes
    if (tackles.total) {
      score += tackles.total * 0.5;
    }

    // Penalidade por cartões
    if (cards.yellow) {
      score -= cards.yellow * 1;
    }
    if (cards.red) {
      score -= cards.red * 3;
    }

    // Garantir que o score esteja entre 30 e 99
    return Math.max(30, Math.min(99, Math.round(score)));
  }

  // Calcular scouts detalhados do jogador
  calculatePlayerScouts(playerStats, position) {
    if (!playerStats) {
      return {
        goalsScout: 0,
        assistsScout: 0,
        finalizationScout: 0,
        tacklesScout: 0,
        interceptionsScout: 0,
        blocksScout: 0,
        savesScout: 0,
        cleanSheetsScout: 0,
        penaltiesSavedScout: 0,
        disciplineScout: 0,
        passesScout: 0,
        duelsScout: 0,
        totalScout: 0
      };
    }

    const scouts = {
      goalsScout: (playerStats.goals?.total || 0) * 5,
      assistsScout: (playerStats.goals?.assists || 0) * 3,
      finalizationScout: (playerStats.shots?.total || 0) * 0.5,
      tacklesScout: (playerStats.tackles?.total || 0) * 1.5,
      interceptionsScout: (playerStats.tackles?.interceptions || 0) * 2,
      blocksScout: (playerStats.tackles?.blocks || 0) * 2,
      savesScout: position === 'GOALKEEPER' ? (playerStats.goals?.saves || 0) * 2 : 0,
      cleanSheetsScout: position === 'GOALKEEPER' ? (playerStats.goals?.conceded === 0 ? 5 : 0) : 0,
      penaltiesSavedScout: position === 'GOALKEEPER' ? (playerStats.penalty?.saved || 0) * 10 : 0,
      disciplineScout: -((playerStats.cards?.yellow || 0) * 1 + (playerStats.cards?.red || 0) * 3),
      passesScout: (playerStats.passes?.total || 0) * 0.1,
      duelsScout: (playerStats.duels?.won || 0) * 1
    };

    // Calcular scout total
    scouts.totalScout = Object.values(scouts).reduce((sum, value) => sum + value, 0);
    
    return scouts;
  }

  // Calcular valor de mercado baseado na idade, posição e performance
  calculateMarketValue(age, position, score) {
    let baseValue = 1000000; // 1M base

    // Ajuste por idade
    if (age <= 23) {
      baseValue *= 1.5; // Jovens talentos
    } else if (age <= 28) {
      baseValue *= 2; // Prime
    } else if (age <= 32) {
      baseValue *= 1.2; // Experiência
    } else {
      baseValue *= 0.8; // Veteranos
    }

    // Ajuste por posição
    const positionMultiplier = {
      'Atacante': 1.5,
      'Meio-campo': 1.3,
      'Zagueiro': 1.1,
      'Goleiro': 1.0
    };
    baseValue *= positionMultiplier[position] || 1.0;

    // Ajuste por performance (score)
    baseValue *= (score / 70); // Score médio de 70

    // Adicionar variação aleatória
    const variation = 0.8 + (Math.random() * 0.4); // ±20%
    baseValue *= variation;

    return Math.round(baseValue);
  }

  // Converter dados da API para nosso formato
  formatPlayerData(apiPlayer, teamName, leagueName) {
    const player = apiPlayer.player;
    const stats = apiPlayer.statistics && apiPlayer.statistics[0];
    
    const age = player.age || 25;
    const position = this.mapPosition(stats?.games?.position || 'Midfielder');
    const score = this.calculatePlayerScore(stats);
    const marketValue = this.calculateMarketValue(age, position, score);
    const scouts = this.calculatePlayerScouts(stats, position);

    return {
      name: player.name,
      age: age,
      position: position,
      currentTeam: teamName,
      league: leagueName,
      marketValue: marketValue,
      score: score,
      nationality: player.nationality || 'Unknown',
      apiId: player.id.toString(),
      photo: player.photo,
      statistics: {
        season: 2023,
        games: stats?.games?.appearences || 0,
        minutes: stats?.games?.minutes || 0,
        goals: stats?.goals?.total || 0,
        assists: stats?.goals?.assists || 0,
        yellowCards: stats?.cards?.yellow || 0,
        redCards: stats?.cards?.red || 0,
        saves: stats?.goals?.saves || 0,
        cleanSheets: stats?.goals?.conceded === 0 ? 1 : 0,
        goalsConceded: stats?.goals?.conceded || 0,
        passes: stats?.passes?.total || 0,
        passAccuracy: stats?.passes?.accuracy || 0,
        tackles: stats?.tackles?.total || 0,
        interceptions: stats?.tackles?.interceptions || 0,
        blocks: stats?.tackles?.blocks || 0,
        duelsWon: stats?.duels?.won || 0,
        duelsTotal: stats?.duels?.total || 0,
        dribbles: stats?.dribbles?.attempts || 0,
        foulsDrawn: stats?.fouls?.drawn || 0,
        foulsCommitted: stats?.fouls?.committed || 0,
        penaltiesScored: stats?.penalty?.scored || 0,
        penaltiesMissed: stats?.penalty?.missed || 0,
        rating: stats?.games?.rating ? parseFloat(stats.games.rating) : 0,
        averageRating: stats?.games?.rating ? parseFloat(stats.games.rating) : 0
      },
      scouts: scouts
    };
  }

  async testConnection() {
    try {
      const result = await this.getLeagues();
      return {
        success: result.success,
        message: result.success ? 'Conexão com API-Sports estabelecida com sucesso' : 'Falha na conexão com API-Sports',
        error: result.error
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao testar conexão com API-Sports',
        error: error.message
      };
    }
  }
}

module.exports = new ApiSportsService();