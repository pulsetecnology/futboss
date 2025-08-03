/**
 * Serviço de API - FutBoss
 * Comunicação com o backend
 */

class ApiService {
  constructor() {
    this.baseURL = '/api';
    this.token = localStorage.getItem('futboss_token');
  }

  /**
   * Configurar token de autenticação
   */
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('futboss_token', token);
    } else {
      localStorage.removeItem('futboss_token');
    }
  }

  /**
   * Obter headers padrão
   */
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Fazer requisição HTTP
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: this.getHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(data.error?.message || 'Erro na requisição', response.status, data.error?.code);
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      // Erro de rede ou parsing
      throw new ApiError('Erro de conexão com o servidor', 0, 'NETWORK_ERROR');
    }
  }

  /**
   * Métodos HTTP
   */
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // === AUTENTICAÇÃO ===

  /**
   * Registrar usuário
   */
  async register(userData) {
    const response = await this.post('/auth/register', userData);
    
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  /**
   * Login de usuário
   */
  async login(credentials) {
    const response = await this.post('/auth/login', credentials);
    
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  /**
   * Login como convidado
   */
  async loginAsGuest() {
    const response = await this.post('/auth/guest');
    
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  /**
   * Verificar token
   */
  async verifyToken() {
    return this.get('/auth/verify');
  }

  /**
   * Logout
   */
  async logout() {
    try {
      await this.post('/auth/logout');
    } catch (error) {
      // Continuar mesmo se der erro no logout
      console.warn('Erro no logout:', error);
    } finally {
      this.setToken(null);
    }
  }

  /**
   * Obter dados do usuário atual
   */
  async getCurrentUser() {
    return this.get('/auth/me');
  }

  /**
   * Atualizar perfil
   */
  async updateProfile(profileData) {
    return this.put('/auth/profile', profileData);
  }

  /**
   * Verificar status de autenticação
   */
  async getAuthStatus() {
    return this.get('/auth/status');
  }

  // === JOGADORES ===

  /**
   * Obter jogadores
   */
  async getPlayers(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.get(`/players?${params}`);
  }

  /**
   * Obter jogador por ID
   */
  async getPlayer(id) {
    return this.get(`/players/${id}`);
  }

  // === CLUBES ===

  /**
   * Obter clubes
   */
  async getClubs(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.get(`/clubs?${params}`);
  }

  /**
   * Obter clube por ID
   */
  async getClub(id) {
    return this.get(`/clubs/${id}`);
  }

  /**
   * Obter jogadores de um clube
   */
  async getClubPlayers(id) {
    return this.get(`/clubs/${id}/players`);
  }

  // === FANTASY TEAMS ===

  /**
   * Obter fantasy teams do usuário
   */
  async getFantasyTeams() {
    return this.get('/fantasy-teams');
  }

  /**
   * Criar fantasy team
   */
  async createFantasyTeam(teamData) {
    return this.post('/fantasy-teams', teamData);
  }

  /**
   * Obter fantasy team por ID
   */
  async getFantasyTeam(id) {
    return this.get(`/fantasy-teams/${id}`);
  }

  /**
   * Atualizar fantasy team
   */
  async updateFantasyTeam(id, teamData) {
    return this.put(`/fantasy-teams/${id}`, teamData);
  }

  /**
   * Deletar fantasy team
   */
  async deleteFantasyTeam(id) {
    return this.delete(`/fantasy-teams/${id}`);
  }

  /**
   * Adicionar jogador ao time
   */
  async addPlayerToTeam(teamId, playerData) {
    return this.post(`/fantasy-teams/${teamId}/players`, playerData);
  }

  /**
   * Remover jogador do time
   */
  async removePlayerFromTeam(teamId, playerId) {
    return this.delete(`/fantasy-teams/${teamId}/players/${playerId}`);
  }

  // === UTILITÁRIOS ===

  /**
   * Testar conexão com o banco
   */
  async testDatabase() {
    return this.get('/test-db');
  }

  /**
   * Health check
   */
  async healthCheck() {
    return this.get('/health');
  }
}

/**
 * Classe de erro personalizada para API
 */
class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

// Instância global
window.ApiService = new ApiService();
window.ApiError = ApiError;

export { ApiService, ApiError };