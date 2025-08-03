const express = require('express');
const router = express.Router();

// Importar controllers e middleware
const authController = require('../controllers/authController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  sanitizeInput,
  validateRateLimit,
  validatePasswordStrength
} = require('../middleware/validation');

/**
 * @route   POST /api/auth/register
 * @desc    Registrar novo usuário
 * @access  Public
 */
router.post('/register',
  validateRateLimit(3, 15 * 60 * 1000), // 3 tentativas por 15 minutos
  sanitizeInput,
  validateRegister,
  validatePasswordStrength,
  authController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login de usuário
 * @access  Public
 */
router.post('/login',
  validateRateLimit(5, 15 * 60 * 1000), // 5 tentativas por 15 minutos
  sanitizeInput,
  validateLogin,
  authController.login
);

/**
 * @route   POST /api/auth/guest
 * @desc    Login como convidado
 * @access  Public
 */
router.post('/guest',
  validateRateLimit(10, 60 * 1000), // 10 tentativas por minuto
  authController.loginAsGuest
);

/**
 * @route   GET /api/auth/verify
 * @desc    Verificar token JWT
 * @access  Private
 */
router.get('/verify',
  authenticateToken,
  authController.verifyToken
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout do usuário
 * @access  Private
 */
router.post('/logout',
  optionalAuth, // Permite logout mesmo com token inválido
  authController.logout
);

/**
 * @route   PUT /api/auth/profile
 * @desc    Atualizar perfil do usuário
 * @access  Private
 */
router.put('/profile',
  authenticateToken,
  sanitizeInput,
  validateUpdateProfile,
  authController.updateProfile
);

/**
 * @route   GET /api/auth/me
 * @desc    Obter dados do usuário atual
 * @access  Private
 */
router.get('/me',
  authenticateToken,
  (req, res) => {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  }
);

/**
 * @route   GET /api/auth/status
 * @desc    Verificar status de autenticação (opcional)
 * @access  Public/Private
 */
router.get('/status',
  optionalAuth,
  (req, res) => {
    res.json({
      success: true,
      data: {
        authenticated: !!req.user,
        user: req.user || null
      }
    });
  }
);

module.exports = router;