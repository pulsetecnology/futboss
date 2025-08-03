const axios = require('axios');

// Configuração das APIs de Futebol
const API_FUTEBOL_BASE_URL = 'https://api.api-futebol.com.br/v1';
const API_FUTEBOL_KEY = 'live_e9b1aee008e2ac6870603cc9fd4911';

const SPORTSDATA_BASE_URL = 'https://api.sportsdata.io/v4/soccer/scores/json';
const SPORTSDATA_KEY = '8f6591524fa1486aba400e23e8a474fd';

class FootballApiService {
  constructor() {
    // Cliente para API Futebol (Brasil)
    this.apiFutebolClient = axios.create({
      baseURL: API_FUTEBOL_BASE_URL,
      headers: {
        'Authorization': `Bearer ${API_FUTEBOL_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    // Cliente para SportsData
    this.sportsDataClient = axios.create({
      baseURL: SPORTSDATA_BASE_URL,
      timeout: 10000
    });
  }

  // API Futebol - Métodos
  async getChampionships() {
    try {
      const response = await this.apiFutebolClient.get('/campeonatos');
      return {
        success: true,
        data: response.data,
        source: 'api-futebol'
      };
    } catch (error) {
      console.error('Erro ao buscar campeonatos:', error.message);
      return {
        success: false,
        error: error.message,
        source: 'api-futebol'
      };
    }
  }

  async getTeams(championshipId) {
    try {
      const response = await this.apiFutebolClient.get(`/campeonatos/${championshipId}/tabela`);
      return {
        success: true,
        data: response.data,
        source: 'api-futebol'
      };
    } catch (error) {
      console.error('Erro ao buscar times:', error.message);
      return {
        success: false,
        error: error.message,
        source: 'api-futebol'
      };
    }
  }

  async getMatches(championshipId) {
    try {
      const response = await this.apiFutebolClient.get(`/campeonatos/${championshipId}/rodadas`);
      return {
        success: true,
        data: response.data,
        source: 'api-futebol'
      };
    } catch (error) {
      console.error('Erro ao buscar partidas:', error.message);
      return {
        success: false,
        error: error.message,
        source: 'api-futebol'
      };
    }
  }

  async getPlayerStats(playerId) {
    try {
      const response = await this.apiFutebolClient.get(`/jogadores/${playerId}`);
      return {
        success: true,
        data: response.data,
        source: 'api-futebol'
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas do jogador:', error.message);
      return {
        success: false,
        error: error.message,
        source: 'api-futebol'
      };
    }
  }

  // SportsData - Métodos
  async getSportsDataCompetitions() {
    try {
      const response = await this.sportsDataClient.get(`/Competitions?key=${SPORTSDATA_KEY}`);
      return {
        success: true,
        data: response.data,
        source: 'sportsdata'
      };
    } catch (error) {
      console.error('Erro ao buscar competições SportsData:', error.message);
      return {
        success: false,
        error: error.message,
        source: 'sportsdata'
      };
    }
  }

  async getSportsDataTeams(competition) {
    try {
      const response = await this.sportsDataClient.get(`/Teams/${competition}?key=${SPORTSDATA_KEY}`);
      return {
        success: true,
        data: response.data,
        source: 'sportsdata'
      };
    } catch (error) {
      console.error('Erro ao buscar times SportsData:', error.message);
      return {
        success: false,
        error: error.message,
        source: 'sportsdata'
      };
    }
  }

  async getSportsDataPlayers(teamKey) {
    try {
      const response = await this.sportsDataClient.get(`/PlayersByTeam/${teamKey}?key=${SPORTSDATA_KEY}`);
      return {
        success: true,
        data: response.data,
        source: 'sportsdata'
      };
    } catch (error) {
      console.error('Erro ao buscar jogadores SportsData:', error.message);
      return {
        success: false,
        error: error.message,
        source: 'sportsdata'
      };
    }
  }

  async getSportsDataPlayersByTeamId(teamId) {
    try {
      const response = await this.sportsDataClient.get(`/Players/${teamId}?key=${SPORTSDATA_KEY}`);
      return {
        success: true,
        data: response.data,
        source: 'sportsdata'
      };
    } catch (error) {
      console.error('Erro ao buscar jogadores por ID do time SportsData:', error.message);
      return {
        success: false,
        error: error.message,
        source: 'sportsdata'
      };
    }
  }

  // Método para testar conectividade das APIs
  async testApiConnections() {
    const results = {
      apiFutebol: { connected: false, error: null },
      sportsData: { connected: false, error: null }
    };

    // Testar API Futebol
    try {
      await this.apiFutebolClient.get('/campeonatos');
      results.apiFutebol.connected = true;
    } catch (error) {
      results.apiFutebol.error = error.message;
    }

    // Testar SportsData
    try {
      await this.sportsDataClient.get(`/Competitions?key=${SPORTSDATA_KEY}`);
      results.sportsData.connected = true;
    } catch (error) {
      results.sportsData.error = error.message;
    }

    return results;
  }

  // Método híbrido para buscar dados de múltiplas fontes
  async getFootballData(type, params = {}) {
    const results = [];

    switch (type) {
      case 'championships':
        // Tentar API Futebol primeiro
        const championships = await this.getChampionships();
        if (championships.success) {
          results.push(championships);
        }
        
        // Tentar SportsData como fallback
        const competitions = await this.getSportsDataCompetitions();
        if (competitions.success) {
          results.push(competitions);
        }
        break;

      case 'teams':
        if (params.championshipId) {
          const teams = await this.getTeams(params.championshipId);
          results.push(teams);
        }
        if (params.competition) {
          const sportsTeams = await this.getSportsDataTeams(params.competition);
          results.push(sportsTeams);
        }
        break;

      case 'players':
        if (params.team) {
          const players = await this.getSportsDataPlayers(params.team);
          results.push(players);
        }
        break;
    }

    return results;
  }
}

module.exports = new FootballApiService();