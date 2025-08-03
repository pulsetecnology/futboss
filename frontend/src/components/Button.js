/**
 * Componente de Botão Reutilizável - FutBoss
 * Estilos fantasy com gradientes e efeitos glow
 */

export class FutBossButton {
  constructor() {
    this.variants = {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      ghost: 'btn-ghost',
      danger: 'btn-danger'
    };
    
    this.sizes = {
      sm: 'btn-sm',
      md: 'btn-md',
      lg: 'btn-lg',
      xl: 'btn-xl'
    };
  }

  /**
   * Cria um botão com as configurações especificadas
   * @param {Object} config - Configurações do botão
   * @param {string} config.text - Texto do botão
   * @param {string} config.variant - Variante do botão (primary, secondary, ghost, danger)
   * @param {string} config.size - Tamanho do botão (sm, md, lg, xl)
   * @param {string} config.icon - Ícone do botão (opcional)
   * @param {boolean} config.loading - Estado de loading
   * @param {boolean} config.disabled - Estado desabilitado
   * @param {Function} config.onClick - Função de clique
   * @param {string} config.id - ID do elemento
   * @param {string} config.classes - Classes CSS adicionais
   * @returns {HTMLElement} Elemento do botão
   */
  create(config = {}) {
    const {
      text = 'Button',
      variant = 'primary',
      size = 'md',
      icon = null,
      loading = false,
      disabled = false,
      onClick = null,
      id = null,
      classes = ''
    } = config;

    const button = document.createElement('button');
    
    // Classes base
    const baseClasses = [
      'futboss-btn',
      this.variants[variant] || this.variants.primary,
      this.sizes[size] || this.sizes.md,
      classes
    ].filter(Boolean).join(' ');
    
    button.className = baseClasses;
    
    // Atributos
    if (id) button.id = id;
    if (disabled || loading) button.disabled = true;
    
    // Conteúdo do botão
    let content = '';
    
    if (loading) {
      content = `
        <div class="flex items-center justify-center">
          <div class="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
          <span>Carregando...</span>
        </div>
      `;
    } else {
      if (icon) {
        content = `
          <div class="flex items-center justify-center">
            <span class="mr-2">${icon}</span>
            <span>${text}</span>
          </div>
        `;
      } else {
        content = `<span>${text}</span>`;
      }
    }
    
    button.innerHTML = content;
    
    // Event listener
    if (onClick && typeof onClick === 'function') {
      button.addEventListener('click', onClick);
    }
    
    // Efeitos de hover e animações
    this.addInteractionEffects(button);
    
    return button;
  }

  /**
   * Adiciona efeitos de interação ao botão
   * @param {HTMLElement} button - Elemento do botão
   */
  addInteractionEffects(button) {
    // Efeito ripple ao clicar
    button.addEventListener('click', (e) => {
      if (button.disabled) return;
      
      const ripple = document.createElement('span');
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
      `;
      
      button.style.position = 'relative';
      button.style.overflow = 'hidden';
      button.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });

    // Efeito de hover
    button.addEventListener('mouseenter', () => {
      if (!button.disabled) {
        button.style.transform = 'translateY(-2px)';
      }
    });

    button.addEventListener('mouseleave', () => {
      if (!button.disabled) {
        button.style.transform = 'translateY(0)';
      }
    });
  }

  /**
   * Atualiza o estado de loading do botão
   * @param {HTMLElement} button - Elemento do botão
   * @param {boolean} loading - Estado de loading
   */
  setLoading(button, loading) {
    if (loading) {
      button.disabled = true;
      button.innerHTML = `
        <div class="flex items-center justify-center">
          <div class="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
          <span>Carregando...</span>
        </div>
      `;
    } else {
      button.disabled = false;
      // Restaurar conteúdo original seria necessário armazenar o estado
    }
  }

  /**
   * Atualiza o texto do botão
   * @param {HTMLElement} button - Elemento do botão
   * @param {string} text - Novo texto
   */
  setText(button, text) {
    const span = button.querySelector('span:last-child') || button.querySelector('span');
    if (span) {
      span.textContent = text;
    }
  }
}

// Instância global para uso fácil
window.FutBossButton = new FutBossButton();

// Adicionar estilos CSS para animação ripple
const style = document.createElement('style');
style.textContent = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
  
  .futboss-btn {
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
    font-weight: 600;
    border: none;
    cursor: pointer;
    outline: none;
    user-select: none;
  }
  
  .futboss-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }
  
  /* Tamanhos */
  .btn-sm {
    padding: 8px 16px;
    font-size: 0.875rem;
    border-radius: 8px;
  }
  
  .btn-md {
    padding: 12px 24px;
    font-size: 1rem;
    border-radius: 12px;
  }
  
  .btn-lg {
    padding: 16px 32px;
    font-size: 1.125rem;
    border-radius: 16px;
  }
  
  .btn-xl {
    padding: 20px 40px;
    font-size: 1.25rem;
    border-radius: 20px;
  }
  
  /* Variantes adicionais */
  .btn-ghost {
    background: transparent;
    color: #6B46C1;
    border: 2px solid #6B46C1;
  }
  
  .btn-ghost:hover {
    background: rgba(107, 70, 193, 0.1);
  }
  
  .btn-danger {
    background: linear-gradient(135deg, #EF4444, #DC2626);
    color: white;
    box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
  }
  
  .btn-danger:hover {
    box-shadow: 0 8px 25px rgba(239, 68, 68, 0.6);
  }
`;

document.head.appendChild(style);