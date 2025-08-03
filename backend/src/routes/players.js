const express = require('express');
const router = express.Router();

// Importar controllers e middleware
const playersController = require('../controllers/playersController');
const { optionalAuth } = require('../middleware/auth');

/**
 * @route   GET /api/players
 * @desc    Obter todos os jogadores com filtros
 * @access  Public
 * @query   position, club, minValue, maxValue, minScore, maxScore, nationality, search, page, limit, sortBy, sortOrder
 */
router.get('/',
  optionalAuth,
  playersController.getPlayers
);

/**
 * @route   GET /api/players/search
 * @desc    Buscar jogadores por nome
 * @access  Public
 * @query   q (query), limit
 */
router.get('/search',
  optionalAuth,
  playersController.searchPlayers
);

/**
 * @route   GET /api/players/stats
 * @desc    Obter estatísticas dos jogadores
 * @access  Public
 */
router.get('/stats',
  optionalAuth,
  playersController.getPlayersStats
);

/**
 * @route   GET /api/players/position/:position
 * @desc    Obter jogadores por posição
 * @access  Public
 * @params  position (GOALKEEPER, DEFENDER, MIDFIELDER, FORWARD)
 * @query   limit, sortBy, sortOrder
 */
router.get('/position/:position',
  optionalAuth,
  playersController.getPlayersByPosition
);

/**
 * @route   GET /api/players/:id
 * @desc    Obter jogador por ID
 * @access  Public
 * @params  id
 */
router.get('/:id',
  optionalAuth,
  playersController.getPlayerById
);

module.exports = router;