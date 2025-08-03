/**
 * Componente de Input - FutBoss
 * Input com validação visual em tempo real e estilos fantasy
 */

export class FutBossInput {
  constructor() {
    this.validators = {
      required: (value) => value.trim().length > 0,
      email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      minLength: (min) => (value) => value.length >= min,
      maxLength: (max) => (value) => value.length <= max,
      password: (value) => value.length >= 6,
      username: (value) => /^[a-zA-Z0-9_]{3,20}$/.test(value),
      number: (value) => !isNaN(value) && value !== '',
      phone: (value) => /^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(value)
    };

    this.messages = {
      required: 'Este campo é obrigatório',
      email: 'Digite um e-mail válido',
      minLength: (min) => `Mínimo de ${min} caracteres`,
      maxLength: (max) => `Máximo de ${max} caracteres`,
      password: 'Senha deve ter pelo menos 6 caracteres',
      username: 'Nome de usuário deve ter 3-20 caracteres (letras, números e _)',
      number: 'Digite apenas números',
      phone: 'Digite um telefone válido (00) 00000-0000'
    };
  }

  /**
   * Cria um input com validação
   * @param {Object} config - Configurações do input
   * @param {string} config.type - Tipo do input
   * @param {string} config.label - Label do input
   * @param {string} config.placeholder - Placeholder
   * @param {string} config.id - ID do elemento
   * @param {string} config.name - Nome do input
   * @param {string} config.value - Valor inicial
   * @param {Array} config.validations - Array de validações
   * @param {string} config.icon - Ícone do input
   * @param {boolean} config.required - Campo obrigatório
   * @param {Function} config.onChange - Callback de mudança
   * @param {Function} config.onValidation - Callback de validação
   * @returns {HTMLElement} Container do input
   */
  create(config = {}) {
    const {
      type = 'text',
      label = '',
      placeholder = '',
      id = `input_${Date.now()}`,
      name = id,
      value = '',
      validations = [],
      icon = null,
      required = false,
      onChange = null,
      onValidation = null
    } = config;

    const container = document.createElement('div');
    container.className = 'futboss-input-container';

    container.innerHTML = `
      ${label ? `<label for="${id}" class="input-label ${required ? 'required' : ''}">${label}</label>` : ''}
      
      <div class="input-wrapper">
        ${icon ? `<div class="input-icon">${icon}</div>` : ''}
        
        <input 
          type="${type}"
          id="${id}"
          name="${name}"
          class="futboss-input ${icon ? 'has-icon' : ''}"
          placeholder="${placeholder}"
          value="${value}"
          ${required ? 'required' : ''}
        />
        
        <div class="input-status">
          <div class="validation-icon"></div>
        </div>
      </div>
      
      <div class="input-feedback">
        <div class="error-message"></div>
        <div class="success-message"></div>
        <div class="help-text"></div>
      </div>
    `;

    const input = container.querySelector('.futboss-input');
    const errorMessage = container.querySelector('.error-message');
    const successMessage = container.querySelector('.success-message');
    const validationIcon = container.querySelector('.validation-icon');
    const inputWrapper = container.querySelector('.input-wrapper');

    // Estado de validação
    let isValid = false;
    let currentErrors = [];

    // Função de validação
    const validate = (value) => {
      currentErrors = [];
      
      // Validação obrigatória
      if (required && !this.validators.required(value)) {
        currentErrors.push(this.messages.required);
      }
      
      // Outras validações (apenas se o campo não estiver vazio ou for obrigatório)
      if (value.trim() || required) {
        validations.forEach(validation => {
          if (typeof validation === 'string') {
            if (this.validators[validation] && !this.validators[validation](value)) {
              const message = typeof this.messages[validation] === 'function' 
                ? this.messages[validation]() 
                : this.messages[validation];
              currentErrors.push(message);
            }
          } else if (typeof validation === 'object') {
            const { type: validationType, param, message } = validation;
            const validator = this.validators[validationType];
            
            if (validator) {
              const validatorFn = param ? validator(param) : validator;
              if (!validatorFn(value)) {
                const errorMsg = message || 
                  (typeof this.messages[validationType] === 'function' 
                    ? this.messages[validationType](param) 
                    : this.messages[validationType]);
                currentErrors.push(errorMsg);
              }
            }
          }
        });
      }
      
      isValid = currentErrors.length === 0;
      return { isValid, errors: currentErrors };
    };

    // Atualizar UI baseado na validação
    const updateUI = (validationResult) => {
      // Limpar estados anteriores
      inputWrapper.classList.remove('valid', 'invalid', 'empty');
      errorMessage.textContent = '';
      successMessage.textContent = '';
      validationIcon.innerHTML = '';

      if (!input.value.trim()) {
        inputWrapper.classList.add('empty');
      } else if (validationResult.isValid) {
        inputWrapper.classList.add('valid');
        validationIcon.innerHTML = '✓';
        if (required || validations.length > 0) {
          successMessage.textContent = 'Válido';
        }
      } else {
        inputWrapper.classList.add('invalid');
        validationIcon.innerHTML = '✕';
        errorMessage.textContent = validationResult.errors[0];
      }
    };

    // Event listeners
    input.addEventListener('input', (e) => {
      const validationResult = validate(e.target.value);
      updateUI(validationResult);
      
      if (onChange) onChange(e.target.value, validationResult);
      if (onValidation) onValidation(validationResult);
    });

    input.addEventListener('blur', (e) => {
      const validationResult = validate(e.target.value);
      updateUI(validationResult);
      inputWrapper.classList.add('touched');
    });

    input.addEventListener('focus', () => {
      inputWrapper.classList.add('focused');
    });

    input.addEventListener('blur', () => {
      inputWrapper.classList.remove('focused');
    });

    // Formatação especial para alguns tipos
    if (type === 'phone') {
      input.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length <= 11) {
          value = value.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
          e.target.value = value;
        }
      });
    }

    // Métodos públicos
    container.validate = () => validate(input.value);
    container.getValue = () => input.value;
    container.setValue = (newValue) => {
      input.value = newValue;
      const validationResult = validate(newValue);
      updateUI(validationResult);
    };
    container.focus = () => input.focus();
    container.clear = () => {
      input.value = '';
      updateUI({ isValid: false, errors: [] });
    };
    container.setError = (message) => {
      inputWrapper.classList.add('invalid');
      errorMessage.textContent = message;
      validationIcon.innerHTML = '✕';
    };
    container.clearError = () => {
      inputWrapper.classList.remove('invalid');
      errorMessage.textContent = '';
      validationIcon.innerHTML = '';
    };

    return container;
  }

  /**
   * Cria um grupo de inputs relacionados
   * @param {Array} inputs - Array de configurações de inputs
   * @param {string} title - Título do grupo
   * @returns {HTMLElement} Container do grupo
   */
  createGroup(inputs, title = '') {
    const group = document.createElement('div');
    group.className = 'input-group';

    if (title) {
      const titleElement = document.createElement('h3');
      titleElement.className = 'input-group-title';
      titleElement.textContent = title;
      group.appendChild(titleElement);
    }

    const inputsContainer = document.createElement('div');
    inputsContainer.className = 'input-group-inputs';

    inputs.forEach(inputConfig => {
      const input = this.create(inputConfig);
      inputsContainer.appendChild(input);
    });

    group.appendChild(inputsContainer);

    // Método para validar todo o grupo
    group.validateAll = () => {
      const results = [];
      const inputElements = group.querySelectorAll('.futboss-input-container');
      
      inputElements.forEach(container => {
        if (container.validate) {
          results.push(container.validate());
        }
      });

      return {
        isValid: results.every(r => r.isValid),
        results
      };
    };

    return group;
  }
}

// Instância global
window.FutBossInput = new FutBossInput();

// Estilos CSS
const style = document.createElement('style');
style.textContent = `
  .futboss-input-container {
    margin-bottom: 20px;
  }
  
  .input-label {
    display: block;
    color: #E5E7EB;
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: 6px;
  }
  
  .input-label.required::after {
    content: ' *';
    color: #EF4444;
  }
  
  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    background: #1F2937;
    border: 2px solid #374151;
    border-radius: 12px;
    transition: all 0.3s ease;
    overflow: hidden;
  }
  
  .input-wrapper.focused {
    border-color: #6B46C1;
    box-shadow: 0 0 0 3px rgba(107, 70, 193, 0.1);
  }
  
  .input-wrapper.valid {
    border-color: #10B981;
  }
  
  .input-wrapper.invalid.touched {
    border-color: #EF4444;
  }
  
  .input-icon {
    padding: 0 12px;
    color: #9CA3AF;
    font-size: 1.1rem;
  }
  
  .futboss-input {
    flex: 1;
    background: transparent;
    border: none;
    padding: 12px 16px;
    color: #FFFFFF;
    font-size: 1rem;
    outline: none;
  }
  
  .futboss-input.has-icon {
    padding-left: 0;
  }
  
  .futboss-input::placeholder {
    color: #6B7280;
  }
  
  .input-status {
    padding: 0 12px;
  }
  
  .validation-icon {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.875rem;
    font-weight: bold;
  }
  
  .input-wrapper.valid .validation-icon {
    color: #10B981;
  }
  
  .input-wrapper.invalid .validation-icon {
    color: #EF4444;
  }
  
  .input-feedback {
    margin-top: 6px;
    min-height: 20px;
  }
  
  .error-message {
    color: #EF4444;
    font-size: 0.8rem;
    display: block;
  }
  
  .success-message {
    color: #10B981;
    font-size: 0.8rem;
    display: block;
  }
  
  .help-text {
    color: #9CA3AF;
    font-size: 0.8rem;
  }
  
  /* Grupo de inputs */
  .input-group {
    margin-bottom: 24px;
  }
  
  .input-group-title {
    color: #FFFFFF;
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid #374151;
  }
  
  .input-group-inputs {
    display: grid;
    gap: 16px;
  }
  
  /* Animações */
  .input-wrapper {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .futboss-input {
    transition: all 0.2s ease;
  }
  
  /* Estados especiais */
  .input-wrapper:hover:not(.focused) {
    border-color: #4B5563;
  }
  
  /* Responsividade */
  @media (max-width: 768px) {
    .futboss-input {
      font-size: 16px; /* Previne zoom no iOS */
    }
  }
`;

document.head.appendChild(style);