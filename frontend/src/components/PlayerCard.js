/**
 * Componente de Card de Jogador - FutBoss
 * Card interativo com animações hover e informações do jogador
 */

export class PlayerCard {
  constructor() {
    this.defaultPlayer = {
      id: '',
      name: 'Jogador',
      position: 'FORWARD',
      currentTeam: 'Time',
      marketValue: 0,
      currentScore: 0,
      averageScore: 0,
      nationality: 'Brasil',
      age: 25,
      photoUrl: null
    };
  }

  /**
   * Cria um card de jogador
   * @param {Object} player - Dados do jogador
   * @param {Object} config - Configurações do card
   * @param {boolean} config.selectable - Se o card é selecionável
   * @param {boolean} config.selected - Se o card está selecionado
   * @param {Function} config.onSelect - Callback de seleção
   * @param {Function} config.onView - Callback para visualizar detalhes
   * @param {string} config.size - Tamanho do card (sm, md, lg)
   * @returns {HTMLElement} Elemento do card
   */
  create(player = {}, config = {}) {
    const playerData = { ...this.defaultPlayer, ...player };
    const {
      selectable = true,
      selected = false,
      onSelect = null,
      onView = null,
      size = 'md'
    } = config;

    const card = document.createElement('div');
    card.className = `player-card player-card-${size} ${selected ? 'selected' : ''}`;
    card.dataset.playerId = playerData.id;

    // Formatação de valores
    const formattedValue = this.formatCurrency(playerData.marketValue);
    const positionText = this.getPositionText(playerData.position);
    const scoreColor = this.getScoreColor(playerData.currentScore);

    card.innerHTML = `
      <div class="player-card-inner">
        <!-- Header com foto e informações básicas -->
        <div class="player-card-header">
          <div class="player-photo">
            ${playerData.photoUrl 
              ? `<img src="${playerData.photoUrl}" alt="${playerData.name}" class="player-image">`
              : `<div class="player-placeholder">
                   <span class="player-initials">${this.getInitials(playerData.name)}</span>
                 </div>`
            }
            <div class="player-position-badge ${playerData.position.toLowerCase()}">
              ${positionText}
            </div>
          </div>
          
          <div class="player-info">
            <h3 class="player-name">${playerData.name}</h3>
            <p class="player-team">${playerData.currentTeam}</p>
            <div class="player-meta">
              <span class="player-nationality">${playerData.nationality}</span>
              <span class="player-age">${playerData.age} anos</span>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="player-stats">
          <div class="stat-item">
            <span class="stat-label">Valor</span>
            <span class="stat-value">${formattedValue}</span>
          </div>
          
          <div class="stat-item">
            <span class="stat-label">Nota Atual</span>
            <span class="stat-value score-${scoreColor}">${playerData.currentScore.toFixed(1)}</span>
          </div>
          
          <div class="stat-item">
            <span class="stat-label">Média</span>
            <span class="stat-value">${playerData.averageScore.toFixed(1)}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="player-actions">
          ${selectable ? `
            <button class="action-btn select-btn ${selected ? 'selected' : ''}" 
                    data-action="select">
              <span class="btn-icon">${selected ? '✓' : '+'}</span>
              <span class="btn-text">${selected ? 'Selecionado' : 'Selecionar'}</span>
            </button>
          ` : ''}
          
          <button class="action-btn view-btn" data-action="view">
            <span class="btn-icon">👁</span>
            <span class="btn-text">Detalhes</span>
          </button>
        </div>

        <!-- Selection overlay -->
        ${selected ? '<div class="selection-overlay"></div>' : ''}
      </div>
    `;

    // Event listeners
    this.addEventListeners(card, playerData, { onSelect, onView });
    
    // Animações de entrada
    this.addEntranceAnimation(card);

    return card;
  }

  /**
   * Adiciona event listeners ao card
   */
  addEventListeners(card, playerData, callbacks) {
    const selectBtn = card.querySelector('.select-btn');
    const viewBtn = card.querySelector('.view-btn');

    if (selectBtn && callbacks.onSelect) {
      selectBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        callbacks.onSelect(playerData, card);
      });
    }

    if (viewBtn && callbacks.onView) {
      viewBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        callbacks.onView(playerData, card);
      });
    }

    // Hover effects
    card.addEventListener('mouseenter', () => {
      card.classList.add('hovered');
    });

    card.addEventListener('mouseleave', () => {
      card.classList.remove('hovered');
    });
  }

  /**
   * Adiciona animação de entrada
   */
  addEntranceAnimation(card) {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      card.style.transition = 'all 0.6s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, Math.random() * 200);
  }

  /**
   * Atualiza o estado de seleção do card
   */
  setSelected(card, selected) {
    const selectBtn = card.querySelector('.select-btn');
    const overlay = card.querySelector('.selection-overlay');
    
    if (selected) {
      card.classList.add('selected');
      if (selectBtn) {
        selectBtn.classList.add('selected');
        selectBtn.innerHTML = `
          <span class="btn-icon">✓</span>
          <span class="btn-text">Selecionado</span>
        `;
      }
      if (!overlay) {
        const newOverlay = document.createElement('div');
        newOverlay.className = 'selection-overlay';
        card.querySelector('.player-card-inner').appendChild(newOverlay);
      }
    } else {
      card.classList.remove('selected');
      if (selectBtn) {
        selectBtn.classList.remove('selected');
        selectBtn.innerHTML = `
          <span class="btn-icon">+</span>
          <span class="btn-text">Selecionar</span>
        `;
      }
      if (overlay) {
        overlay.remove();
      }
    }
  }

  /**
   * Utilitários
   */
  formatCurrency(value) {
    if (value >= 1000000) {
      return `€${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `€${(value / 1000).toFixed(0)}K`;
    }
    return `€${value}`;
  }

  getPositionText(position) {
    const positions = {
      'GOALKEEPER': 'GOL',
      'DEFENDER': 'DEF',
      'MIDFIELDER': 'MEI',
      'FORWARD': 'ATA'
    };
    return positions[position] || position;
  }

  getScoreColor(score) {
    if (score >= 8) return 'excellent';
    if (score >= 7) return 'good';
    if (score >= 6) return 'average';
    return 'poor';
  }

  getInitials(name) {
    return name.split(' ')
      .map(word => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }
}

// Instância global
window.PlayerCard = new PlayerCard();

// Estilos CSS
const style = document.createElement('style');
style.textContent = `
  .player-card {
    background: linear-gradient(145deg, #1F2937, #374151);
    border-radius: 16px;
    border: 1px solid rgba(107, 70, 193, 0.3);
    transition: all 0.3s ease;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  
  .player-card:hover,
  .player-card.hovered {
    border-color: #6B46C1;
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  }
  
  .player-card.selected {
    border-color: #10B981;
    background: linear-gradient(145deg, #1F2937, #065F46);
  }
  
  .player-card-inner {
    padding: 20px;
    position: relative;
    z-index: 1;
  }
  
  .player-card-header {
    display: flex;
    align-items: flex-start;
    margin-bottom: 16px;
  }
  
  .player-photo {
    position: relative;
    margin-right: 16px;
    flex-shrink: 0;
  }
  
  .player-image {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #6B46C1;
  }
  
  .player-placeholder {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6B46C1, #D946EF);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid #6B46C1;
  }
  
  .player-initials {
    color: white;
    font-weight: bold;
    font-size: 1.2rem;
  }
  
  .player-position-badge {
    position: absolute;
    bottom: -4px;
    right: -4px;
    background: #6B46C1;
    color: white;
    padding: 2px 6px;
    border-radius: 8px;
    font-size: 0.7rem;
    font-weight: bold;
  }
  
  .player-position-badge.goalkeeper { background: #F59E0B; }
  .player-position-badge.defender { background: #10B981; }
  .player-position-badge.midfielder { background: #3B82F6; }
  .player-position-badge.forward { background: #EF4444; }
  
  .player-info {
    flex: 1;
    min-width: 0;
  }
  
  .player-name {
    color: white;
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0 0 4px 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .player-team {
    color: #9CA3AF;
    font-size: 0.9rem;
    margin: 0 0 8px 0;
  }
  
  .player-meta {
    display: flex;
    gap: 12px;
    font-size: 0.8rem;
    color: #6B7280;
  }
  
  .player-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 16px;
    padding: 12px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
  }
  
  .stat-item {
    text-align: center;
  }
  
  .stat-label {
    display: block;
    color: #9CA3AF;
    font-size: 0.7rem;
    margin-bottom: 2px;
  }
  
  .stat-value {
    display: block;
    color: white;
    font-weight: 600;
    font-size: 0.9rem;
  }
  
  .stat-value.score-excellent { color: #10B981; }
  .stat-value.score-good { color: #3B82F6; }
  .stat-value.score-average { color: #F59E0B; }
  .stat-value.score-poor { color: #EF4444; }
  
  .player-actions {
    display: flex;
    gap: 8px;
  }
  
  .action-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 8px 12px;
    border: none;
    border-radius: 8px;
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .select-btn {
    background: #6B46C1;
    color: white;
  }
  
  .select-btn:hover {
    background: #553C9A;
  }
  
  .select-btn.selected {
    background: #10B981;
  }
  
  .view-btn {
    background: rgba(107, 70, 193, 0.2);
    color: #6B46C1;
    border: 1px solid #6B46C1;
  }
  
  .view-btn:hover {
    background: rgba(107, 70, 193, 0.3);
  }
  
  .selection-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(16, 185, 129, 0.1);
    border-radius: 16px;
    pointer-events: none;
  }
  
  /* Tamanhos */
  .player-card-sm .player-card-inner { padding: 12px; }
  .player-card-sm .player-image,
  .player-card-sm .player-placeholder { width: 40px; height: 40px; }
  .player-card-sm .player-name { font-size: 0.9rem; }
  
  .player-card-lg .player-card-inner { padding: 24px; }
  .player-card-lg .player-image,
  .player-card-lg .player-placeholder { width: 80px; height: 80px; }
  .player-card-lg .player-name { font-size: 1.3rem; }
`;

document.head.appendChild(style);