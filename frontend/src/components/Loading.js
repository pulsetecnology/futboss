/**
 * Componente de Loading - FutBoss
 * Componente de loading com animações temáticas fantasy
 */

export class FutBossLoading {
  constructor() {
    this.types = {
      spinner: 'spinner',
      dots: 'dots',
      pulse: 'pulse',
      bars: 'bars',
      football: 'football',
      glow: 'glow'
    };

    this.sizes = {
      sm: 'loading-sm',
      md: 'loading-md',
      lg: 'loading-lg',
      xl: 'loading-xl'
    };
  }

  /**
   * Cria um componente de loading
   * @param {Object} config - Configurações do loading
   * @param {string} config.type - Tipo de animação
   * @param {string} config.size - Tamanho do loading
   * @param {string} config.message - Mensagem de loading
   * @param {string} config.color - Cor do loading
   * @param {boolean} config.overlay - Se deve ter overlay
   * @param {boolean} config.fullscreen - Se deve ocupar tela inteira
   * @returns {HTMLElement} Elemento de loading
   */
  create(config = {}) {
    const {
      type = 'spinner',
      size = 'md',
      message = 'Carregando...',
      color = 'primary',
      overlay = false,
      fullscreen = false
    } = config;

    const container = document.createElement('div');
    container.className = `futboss-loading ${this.sizes[size]} loading-${color} ${fullscreen ? 'fullscreen' : ''} ${overlay ? 'with-overlay' : ''}`;

    const loadingContent = this.createLoadingContent(type, message);
    container.innerHTML = loadingContent;

    // Adicionar animação de entrada
    this.addEntranceAnimation(container);

    return container;
  }

  /**
   * Cria o conteúdo do loading baseado no tipo
   */
  createLoadingContent(type, message) {
    const animations = {
      spinner: `
        <div class="loading-animation">
          <div class="spinner">
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
          </div>
        </div>
        ${message ? `<div class="loading-message">${message}</div>` : ''}
      `,
      
      dots: `
        <div class="loading-animation">
          <div class="dots">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
        </div>
        ${message ? `<div class="loading-message">${message}</div>` : ''}
      `,
      
      pulse: `
        <div class="loading-animation">
          <div class="pulse">
            <div class="pulse-ring"></div>
            <div class="pulse-ring"></div>
            <div class="pulse-ring"></div>
          </div>
        </div>
        ${message ? `<div class="loading-message">${message}</div>` : ''}
      `,
      
      bars: `
        <div class="loading-animation">
          <div class="bars">
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
          </div>
        </div>
        ${message ? `<div class="loading-message">${message}</div>` : ''}
      `,
      
      football: `
        <div class="loading-animation">
          <div class="football">
            <div class="ball">⚽</div>
            <div class="field"></div>
          </div>
        </div>
        ${message ? `<div class="loading-message">${message}</div>` : ''}
      `,
      
      glow: `
        <div class="loading-animation">
          <div class="glow-orb">
            <div class="orb"></div>
            <div class="glow-ring"></div>
          </div>
        </div>
        ${message ? `<div class="loading-message">${message}</div>` : ''}
      `
    };

    return animations[type] || animations.spinner;
  }

  /**
   * Adiciona animação de entrada
   */
  addEntranceAnimation(container) {
    container.style.opacity = '0';
    container.style.transform = 'scale(0.8)';
    
    setTimeout(() => {
      container.style.transition = 'all 0.3s ease';
      container.style.opacity = '1';
      container.style.transform = 'scale(1)';
    }, 50);
  }

  /**
   * Cria um loading overlay para cobrir um elemento específico
   * @param {HTMLElement} target - Elemento alvo
   * @param {Object} config - Configurações do loading
   * @returns {HTMLElement} Overlay de loading
   */
  createOverlay(target, config = {}) {
    const overlay = this.create({
      ...config,
      overlay: true
    });

    // Posicionar sobre o elemento alvo
    const rect = target.getBoundingClientRect();
    overlay.style.position = 'absolute';
    overlay.style.top = `${rect.top + window.scrollY}px`;
    overlay.style.left = `${rect.left + window.scrollX}px`;
    overlay.style.width = `${rect.width}px`;
    overlay.style.height = `${rect.height}px`;

    document.body.appendChild(overlay);

    // Método para remover
    overlay.remove = () => {
      overlay.style.opacity = '0';
      overlay.style.transform = 'scale(0.8)';
      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      }, 300);
    };

    return overlay;
  }

  /**
   * Cria um loading fullscreen
   * @param {Object} config - Configurações do loading
   * @returns {HTMLElement} Loading fullscreen
   */
  createFullscreen(config = {}) {
    const loading = this.create({
      ...config,
      fullscreen: true,
      overlay: true
    });

    document.body.appendChild(loading);

    // Método para remover
    loading.remove = () => {
      loading.style.opacity = '0';
      setTimeout(() => {
        if (loading.parentNode) {
          loading.parentNode.removeChild(loading);
        }
      }, 300);
    };

    return loading;
  }

  /**
   * Atualiza a mensagem do loading
   * @param {HTMLElement} loading - Elemento de loading
   * @param {string} message - Nova mensagem
   */
  updateMessage(loading, message) {
    const messageElement = loading.querySelector('.loading-message');
    if (messageElement) {
      messageElement.textContent = message;
    }
  }

  /**
   * Cria um loading para botão
   * @param {HTMLElement} button - Elemento do botão
   * @param {string} message - Mensagem de loading
   * @returns {Function} Função para parar o loading
   */
  createButtonLoading(button, message = 'Carregando...') {
    const originalContent = button.innerHTML;
    const originalDisabled = button.disabled;

    button.disabled = true;
    button.innerHTML = `
      <div class="flex items-center justify-center">
        <div class="spinner-sm mr-2">
          <div class="spinner-ring-sm"></div>
        </div>
        <span>${message}</span>
      </div>
    `;

    // Retorna função para parar o loading
    return () => {
      button.disabled = originalDisabled;
      button.innerHTML = originalContent;
    };
  }
}

// Instância global
window.FutBossLoading = new FutBossLoading();

// Estilos CSS
const style = document.createElement('style');
style.textContent = `
  .futboss-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
  }
  
  .futboss-loading.with-overlay {
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(4px);
    border-radius: 12px;
  }
  
  .futboss-loading.fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    background: rgba(0, 0, 0, 0.9);
  }
  
  .loading-message {
    color: #E5E7EB;
    font-size: 1rem;
    font-weight: 500;
    text-align: center;
    animation: pulse-text 2s ease-in-out infinite;
  }
  
  /* Tamanhos */
  .loading-sm .loading-animation { transform: scale(0.7); }
  .loading-md .loading-animation { transform: scale(1); }
  .loading-lg .loading-animation { transform: scale(1.3); }
  .loading-xl .loading-animation { transform: scale(1.6); }
  
  /* Cores */
  .loading-primary { --loading-color: #6B46C1; }
  .loading-secondary { --loading-color: #D946EF; }
  .loading-success { --loading-color: #10B981; }
  .loading-warning { --loading-color: #F59E0B; }
  .loading-danger { --loading-color: #EF4444; }
  
  /* Spinner */
  .spinner {
    position: relative;
    width: 60px;
    height: 60px;
  }
  
  .spinner-ring {
    position: absolute;
    width: 100%;
    height: 100%;
    border: 3px solid transparent;
    border-top-color: var(--loading-color, #6B46C1);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  .spinner-ring:nth-child(2) {
    width: 80%;
    height: 80%;
    top: 10%;
    left: 10%;
    border-top-color: var(--loading-color, #6B46C1);
    opacity: 0.7;
    animation-duration: 1.5s;
    animation-direction: reverse;
  }
  
  .spinner-ring:nth-child(3) {
    width: 60%;
    height: 60%;
    top: 20%;
    left: 20%;
    border-top-color: var(--loading-color, #6B46C1);
    opacity: 0.4;
    animation-duration: 2s;
  }
  
  /* Dots */
  .dots {
    display: flex;
    gap: 8px;
  }
  
  .dot {
    width: 12px;
    height: 12px;
    background: var(--loading-color, #6B46C1);
    border-radius: 50%;
    animation: bounce-dot 1.4s ease-in-out infinite both;
  }
  
  .dot:nth-child(1) { animation-delay: -0.32s; }
  .dot:nth-child(2) { animation-delay: -0.16s; }
  .dot:nth-child(3) { animation-delay: 0s; }
  .dot:nth-child(4) { animation-delay: 0.16s; }
  
  /* Pulse */
  .pulse {
    position: relative;
    width: 60px;
    height: 60px;
  }
  
  .pulse-ring {
    position: absolute;
    width: 100%;
    height: 100%;
    border: 2px solid var(--loading-color, #6B46C1);
    border-radius: 50%;
    animation: pulse-ring 2s ease-out infinite;
  }
  
  .pulse-ring:nth-child(2) { animation-delay: 0.7s; }
  .pulse-ring:nth-child(3) { animation-delay: 1.4s; }
  
  /* Bars */
  .bars {
    display: flex;
    gap: 4px;
    align-items: end;
  }
  
  .bar {
    width: 6px;
    height: 40px;
    background: var(--loading-color, #6B46C1);
    border-radius: 3px;
    animation: bounce-bar 1.2s ease-in-out infinite;
  }
  
  .bar:nth-child(1) { animation-delay: -0.4s; }
  .bar:nth-child(2) { animation-delay: -0.3s; }
  .bar:nth-child(3) { animation-delay: -0.2s; }
  .bar:nth-child(4) { animation-delay: -0.1s; }
  .bar:nth-child(5) { animation-delay: 0s; }
  
  /* Football */
  .football {
    position: relative;
    width: 80px;
    height: 40px;
  }
  
  .ball {
    position: absolute;
    font-size: 24px;
    animation: kick-ball 2s ease-in-out infinite;
  }
  
  .field {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, #10B981, #059669);
    border-radius: 2px;
  }
  
  /* Glow Orb */
  .glow-orb {
    position: relative;
    width: 60px;
    height: 60px;
  }
  
  .orb {
    position: absolute;
    width: 20px;
    height: 20px;
    background: var(--loading-color, #6B46C1);
    border-radius: 50%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    box-shadow: 0 0 20px var(--loading-color, #6B46C1);
    animation: glow-pulse 2s ease-in-out infinite;
  }
  
  .glow-ring {
    position: absolute;
    width: 100%;
    height: 100%;
    border: 2px solid var(--loading-color, #6B46C1);
    border-radius: 50%;
    opacity: 0.3;
    animation: glow-expand 2s ease-out infinite;
  }
  
  /* Spinner pequeno para botões */
  .spinner-sm {
    width: 16px;
    height: 16px;
  }
  
  .spinner-ring-sm {
    width: 100%;
    height: 100%;
    border: 2px solid transparent;
    border-top-color: currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  /* Animações */
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  @keyframes bounce-dot {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
  }
  
  @keyframes pulse-ring {
    0% {
      transform: scale(0);
      opacity: 1;
    }
    100% {
      transform: scale(1);
      opacity: 0;
    }
  }
  
  @keyframes bounce-bar {
    0%, 40%, 100% { transform: scaleY(0.4); }
    20% { transform: scaleY(1); }
  }
  
  @keyframes kick-ball {
    0%, 100% { 
      left: 0; 
      transform: translateY(0); 
    }
    25% { 
      left: 20px; 
      transform: translateY(-10px); 
    }
    50% { 
      left: 40px; 
      transform: translateY(0); 
    }
    75% { 
      left: 60px; 
      transform: translateY(-5px); 
    }
  }
  
  @keyframes glow-pulse {
    0%, 100% { 
      transform: translate(-50%, -50%) scale(1);
      opacity: 1;
    }
    50% { 
      transform: translate(-50%, -50%) scale(1.2);
      opacity: 0.8;
    }
  }
  
  @keyframes glow-expand {
    0% {
      transform: scale(0.8);
      opacity: 0.8;
    }
    100% {
      transform: scale(1.2);
      opacity: 0;
    }
  }
  
  @keyframes pulse-text {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
`;

document.head.appendChild(style);