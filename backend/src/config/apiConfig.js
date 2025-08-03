// Configuração das APIs de Futebol
module.exports = {
  // API Futebol (Brasil)
  apiFutebol: {
    baseURL: 'https://api.api-futebol.com.br/v1',
    apiKey: process.env.API_FUTEBOL_KEY || 'live_e9b1aee008e2ac6870603cc9fd4911',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json'
    }
  },

  // SportsData API
  sportsData: {
    baseURL: 'https://api.sportsdata.io/v4/soccer/scores/json',
    apiKey: process.env.SPORTSDATA_API_KEY || '8f6591524fa1486aba400e23e8a474fd',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json'
    }
  },

  // Configurações gerais
  general: {
    retryAttempts: 3,
    retryDelay: 1000,
    cacheTimeout: 300000, // 5 minutos
    enableLogging: process.env.NODE_ENV === 'development'
  },

  // Endpoints disponíveis
  endpoints: {
    apiFutebol: {
      championships: '/campeonatos',
      teams: '/campeonatos/{id}/tabela',
      matches: '/campeonatos/{id}/rodadas',
      player: '/jogadores/{id}',
      standings: '/campeonatos/{id}/tabela'
    },
    sportsData: {
      competitions: '/Competitions',
      teams: '/Teams/{competition}',
      players: '/PlayersByTeam/{team}',
      matches: '/Games/{competition}',
      standings: '/Standings/{competition}'
    }
  }
};