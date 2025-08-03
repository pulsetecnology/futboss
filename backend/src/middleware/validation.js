const { body } = require('express-validator');

/**
 * Validações para registro de usuário
 */
const validateRegister = [
  body('email')
    .isEmail()
    .withMessage('Digite um e-mail válido')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('E-mail muito longo'),
    
  body('username')
    .isLength({ min: 3, max: 20 })
    .withMessage('Nome de usuário deve ter entre 3 e 20 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Nome de usuário pode conter apenas letras, números e underscore'),
    
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número')
];

/**
 * Validações para login
 */
const validateLogin = [
  body('emailOrUsername')
    .notEmpty()
    .withMessage('E-mail ou nome de usuário é obrigatório')
    .isLength({ max: 255 })
    .withMessage('E-mail/usuário muito longo'),
    
  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória')
    .isLength({ min: 1, max: 255 })
    .withMessage('Senha inválida')
];

/**
 * Validações para atualização de perfil
 */
const validateUpdateProfile = [
  body('email')
    .optional()
    .isEmail()
    .withMessage('Digite um e-mail válido')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('E-mail muito longo'),
    
  body('username')
    .optional()
    .isLength({ min: 3, max: 20 })
    .withMessage('Nome de usuário deve ter entre 3 e 20 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Nome de usuário pode conter apenas letras, números e underscore')
];

/**
 * Validações para mudança de senha
 */
const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Senha atual é obrigatória'),
    
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Nova senha deve ter pelo menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Nova senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'),
    
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Confirmação de senha não confere');
      }
      return true;
    })
];

/**
 * Validações para preferências do usuário
 */
const validateUserPreferences = [
  body('favoriteTeam')
    .optional()
    .isString()
    .withMessage('Time favorito deve ser uma string')
    .isLength({ max: 100 })
    .withMessage('Nome do time muito longo'),
    
  body('preferredFormation')
    .optional()
    .isIn(['4-4-2', '4-3-3', '3-5-2', '4-2-3-1', '5-3-2'])
    .withMessage('Formação inválida'),
    
  body('notifications')
    .optional()
    .isBoolean()
    .withMessage('Notificações deve ser verdadeiro ou falso')
];

/**
 * Validações para fantasy team
 */
const validateFantasyTeam = [
  body('name')
    .notEmpty()
    .withMessage('Nome do time é obrigatório')
    .isLength({ min: 3, max: 50 })
    .withMessage('Nome deve ter entre 3 e 50 caracteres')
    .matches(/^[a-zA-Z0-9\s\-_]+$/)
    .withMessage('Nome pode conter apenas letras, números, espaços, hífens e underscores'),
    
  body('formation')
    .optional()
    .isIn(['4-4-2', '4-3-3', '3-5-2', '4-2-3-1', '5-3-2', '3-4-3', '4-5-1'])
    .withMessage('Formação inválida'),
    
  body('players')
    .optional()
    .isArray()
    .withMessage('Jogadores deve ser um array'),
    
  body('players.*.playerId')
    .if(body('players').exists())
    .notEmpty()
    .withMessage('ID do jogador é obrigatório')
    .isString()
    .withMessage('ID do jogador deve ser uma string'),
    
  body('players.*.position')
    .if(body('players').exists())
    .optional()
    .isIn(['GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'FORWARD'])
    .withMessage('Posição inválida')
];

/**
 * Validações para atualização de fantasy team
 */
const validateUpdateFantasyTeam = [
  body('name')
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage('Nome deve ter entre 3 e 50 caracteres')
    .matches(/^[a-zA-Z0-9\s\-_]+$/)
    .withMessage('Nome pode conter apenas letras, números, espaços, hífens e underscores'),
    
  body('formation')
    .optional()
    .isIn(['4-4-2', '4-3-3', '3-5-2', '4-2-3-1', '5-3-2', '3-4-3', '4-5-1'])
    .withMessage('Formação inválida')
];

/**
 * Validações para adicionar jogador ao time
 */
const validateAddPlayerToTeam = [
  body('playerId')
    .notEmpty()
    .withMessage('ID do jogador é obrigatório')
    .isString()
    .withMessage('ID do jogador deve ser uma string'),
    
  body('position')
    .optional()
    .isIn(['GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'FORWARD'])
    .withMessage('Posição inválida')
];

/**
 * Sanitização de dados de entrada
 */
const sanitizeInput = (req, res, next) => {
  // Remover espaços em branco desnecessários
  for (const key in req.body) {
    if (typeof req.body[key] === 'string') {
      req.body[key] = req.body[key].trim();
    }
  }
  
  next();
};

/**
 * Validação de rate limiting personalizada
 */
const validateRateLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map();
  
  return (req, res, next) => {
    const key = req.ip + req.path;
    const now = Date.now();
    
    // Limpar tentativas antigas
    for (const [k, v] of attempts.entries()) {
      if (now - v.firstAttempt > windowMs) {
        attempts.delete(k);
      }
    }
    
    const userAttempts = attempts.get(key);
    
    if (!userAttempts) {
      attempts.set(key, {
        count: 1,
        firstAttempt: now
      });
      return next();
    }
    
    if (userAttempts.count >= maxAttempts) {
      return res.status(429).json({
        error: {
          message: 'Muitas tentativas. Tente novamente em alguns minutos.',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: Math.ceil((windowMs - (now - userAttempts.firstAttempt)) / 1000)
        }
      });
    }
    
    userAttempts.count++;
    next();
  };
};

/**
 * Validação de força da senha
 */
const validatePasswordStrength = (req, res, next) => {
  const { password } = req.body;
  
  if (!password) {
    return next();
  }
  
  const strength = {
    score: 0,
    feedback: []
  };
  
  // Verificações de força
  if (password.length >= 8) strength.score++;
  else strength.feedback.push('Use pelo menos 8 caracteres');
  
  if (/[a-z]/.test(password)) strength.score++;
  else strength.feedback.push('Inclua letras minúsculas');
  
  if (/[A-Z]/.test(password)) strength.score++;
  else strength.feedback.push('Inclua letras maiúsculas');
  
  if (/\d/.test(password)) strength.score++;
  else strength.feedback.push('Inclua números');
  
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength.score++;
  else strength.feedback.push('Inclua símbolos especiais');
  
  if (!/(.)\1{2,}/.test(password)) strength.score++;
  else strength.feedback.push('Evite repetir caracteres');
  
  // Verificar senhas comuns
  const commonPasswords = [
    '123456', 'password', '123456789', '12345678', '12345',
    '1234567', '1234567890', 'qwerty', 'abc123', 'password123'
  ];
  
  if (!commonPasswords.includes(password.toLowerCase())) strength.score++;
  else strength.feedback.push('Evite senhas muito comuns');
  
  // Adicionar informações de força ao request
  req.passwordStrength = strength;
  
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword,
  validateUserPreferences,
  validateFantasyTeam,
  validateUpdateFantasyTeam,
  validateAddPlayerToTeam,
  sanitizeInput,
  validateRateLimit,
  validatePasswordStrength
};