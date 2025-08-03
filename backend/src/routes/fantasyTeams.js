const express = require('express');
const router = express.Router();

// Importar controllers e middleware
const fantasyTeamsController = require('../controllers/fantasyTeamsController');
const { authenticateToken, requireRegisteredUser } = require('../middleware/auth');
const {
  validateFantasyTeam,
  validateUpdateFantasyTeam,
  validateAddPlayerToTeam,
  sanitizeInput
} = require('../middleware/validation');

/**
 * @route   GET /api/fantasy-teams
 * @desc    Obter fantasy teams do usuário
 * @access  Private (Registered users only)
 */
router.get('/',
  authenticateToken,
  requireRegisteredUser,
  fantasyTeamsController.getFantasyTeams
);

/**
 * @route   POST /api/fantasy-teams
 * @desc    Criar fantasy team
 * @access  Private (Registered users only)
 * @body    { name, formation?, players? }
 */
router.post('/',
  authenticateToken,
  requireRegisteredUser,
  sanitizeInput,
  validateFantasyTeam,
  fantasyTeamsController.createFantasyTeam
);

/**
 * @route   GET /api/fantasy-teams/:id
 * @desc    Obter fantasy team por ID
 * @access  Private (Owner only)
 * @params  id
 */
router.get('/:id',
  authenticateToken,
  requireRegisteredUser,
  fantasyTeamsController.getFantasyTeamById
);

/**
 * @route   PUT /api/fantasy-teams/:id
 * @desc    Atualizar fantasy team
 * @access  Private (Owner only)
 * @params  id
 * @body    { name?, formation? }
 */
router.put('/:id',
  authenticateToken,
  requireRegisteredUser,
  sanitizeInput,
  validateUpdateFantasyTeam,
  fantasyTeamsController.updateFantasyTeam
);

/**
 * @route   DELETE /api/fantasy-teams/:id
 * @desc    Deletar fantasy team
 * @access  Private (Owner only)
 * @params  id
 */
router.delete('/:id',
  authenticateToken,
  requireRegisteredUser,
  fantasyTeamsController.deleteFantasyTeam
);

/**
 * @route   POST /api/fantasy-teams/:teamId/players
 * @desc    Adicionar jogador ao team
 * @access  Private (Owner only)
 * @params  teamId
 * @body    { playerId, position? }
 */
router.post('/:teamId/players',
  authenticateToken,
  requireRegisteredUser,
  sanitizeInput,
  validateAddPlayerToTeam,
  fantasyTeamsController.addPlayerToTeam
);

/**
 * @route   DELETE /api/fantasy-teams/:teamId/players/:playerId
 * @desc    Remover jogador do team
 * @access  Private (Owner only)
 * @params  teamId, playerId
 */
router.delete('/:teamId/players/:playerId',
  authenticateToken,
  requireRegisteredUser,
  fantasyTeamsController.removePlayerFromTeam
);

module.exports = router;