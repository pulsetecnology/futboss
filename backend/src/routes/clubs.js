const express = require('express');
const router = express.Router();

// Importar controllers e middleware
const clubsController = require('../controllers/clubsController');
const { optionalAuth } = require('../middleware/auth');

/**
 * @route   GET /api/clubs
 * @desc    Obter todos os clubes com filtros
 * @access  Public
 * @query   league, country, search, page, limit, sortBy, sortOrder
 */
router.get('/',
  optionalAuth,
  clubsController.getClubs
);

/**
 * @route   GET /api/clubs/search
 * @desc    Buscar clubes por nome
 * @access  Public
 * @query   q (query), limit
 */
router.get('/search',
  optionalAuth,
  clubsController.searchClubs
);

/**
 * @route   GET /api/clubs/stats
 * @desc    Obter estatísticas dos clubes
 * @access  Public
 */
router.get('/stats',
  optionalAuth,
  clubsController.getClubsStats
);

/**
 * @route   GET /api/clubs/league/:league
 * @desc    Obter clubes por liga
 * @access  Public
 * @params  league
 * @query   limit, sortBy, sortOrder
 */
router.get('/league/:league',
  optionalAuth,
  clubsController.getClubsByLeague
);

/**
 * @route   GET /api/clubs/:id
 * @desc    Obter clube por ID
 * @access  Public
 * @params  id
 */
router.get('/:id',
  optionalAuth,
  clubsController.getClubById
);

/**
 * @route   GET /api/clubs/:id/players
 * @desc    Obter jogadores de um clube
 * @access  Public
 * @params  id
 * @query   position, minValue, maxValue, minScore, maxScore, sortBy, sortOrder, limit
 */
router.get('/:id/players',
  optionalAuth,
  clubsController.getClubPlayers
);

module.exports = router;