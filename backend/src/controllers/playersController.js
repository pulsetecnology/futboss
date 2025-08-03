const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

/**
 * Obter todos os jogadores com filtros
 */
const getPlayers = async (req, res) => {
  try {
    const {
      position,
      club,
      minValue,
      maxValue,
      minScore,
      maxScore,
      nationality,
      search,
      page = 1,
      limit = 20,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    // Construir filtros
    const where = {};
    
    if (position) {
      where.position = position.toUpperCase();
    }
    
    if (club) {
      where.club = {
        name: {
          contains: club,
          mode: 'insensitive'
        }
      };
    }
    
    if (minValue || maxValue) {
      where.marketValue = {};
      if (minValue) where.marketValue.gte = parseFloat(minValue);
      if (maxValue) where.marketValue.lte = parseFloat(maxValue);
    }
    
    if (minScore || maxScore) {
      where.currentScore = {};
      if (minScore) where.currentScore.gte = parseFloat(minScore);
      if (maxScore) where.currentScore.lte = parseFloat(maxScore);
    }
    
    if (nationality) {
      where.nationality = {
        contains: nationality,
        mode: 'insensitive'
      };
    }
    
    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          currentTeam: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    // Paginação
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Ordenação
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    // Buscar jogadores
    const [players, total] = await Promise.all([
      prisma.player.findMany({
        where,
        include: {
          club: {
            select: {
              id: true,
              name: true,
              league: true,
              country: true,
              logoUrl: true
            }
          },
          playerStats: true
        },
        orderBy,
        skip,
        take
      }),
      prisma.player.count({ where })
    ]);

    // Calcular metadados de paginação
    const totalPages = Math.ceil(total / take);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      data: {
        players,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: take,
          hasNextPage,
          hasPrevPage
        },
        filters: {
          position,
          club,
          minValue,
          maxValue,
          minScore,
          maxScore,
          nationality,
          search
        }
      }
    });

  } catch (error) {
    console.error('Erro ao buscar jogadores:', error);
    res.status(500).json({
      error: {
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      }
    });
  }
};

/**
 * Obter jogador por ID
 */
const getPlayerById = async (req, res) => {
  try {
    const { id } = req.params;

    const player = await prisma.player.findUnique({
      where: { id },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            league: true,
            country: true,
            logoUrl: true
          }
        },
        playerStats: true,
        teamPlayers: {
          include: {
            fantasyTeam: {
              select: {
                id: true,
                name: true,
                userId: true
              }
            }
          }
        }
      }
    });

    if (!player) {
      return res.status(404).json({
        error: {
          message: 'Jogador não encontrado',
          code: 'PLAYER_NOT_FOUND'
        }
      });
    }

    res.json({
      success: true,
      data: {
        player
      }
    });

  } catch (error) {
    console.error('Erro ao buscar jogador:', error);
    res.status(500).json({
      error: {
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      }
    });
  }
};

/**
 * Buscar jogadores por nome
 */
const searchPlayers = async (req, res) => {
  try {
    const { q: query, limit = 10 } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        error: {
          message: 'Query deve ter pelo menos 2 caracteres',
          code: 'INVALID_QUERY'
        }
      });
    }

    const players = await prisma.player.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query.trim(),
              mode: 'insensitive'
            }
          },
          {
            currentTeam: {
              contains: query.trim(),
              mode: 'insensitive'
            }
          }
        ]
      },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            league: true,
            logoUrl: true
          }
        }
      },
      take: parseInt(limit),
      orderBy: {
        currentScore: 'desc'
      }
    });

    res.json({
      success: true,
      data: {
        players,
        query: query.trim(),
        count: players.length
      }
    });

  } catch (error) {
    console.error('Erro na busca de jogadores:', error);
    res.status(500).json({
      error: {
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      }
    });
  }
};

/**
 * Obter jogadores por posição
 */
const getPlayersByPosition = async (req, res) => {
  try {
    const { position } = req.params;
    const { limit = 20, sortBy = 'currentScore', sortOrder = 'desc' } = req.query;

    const validPositions = ['GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'FORWARD'];
    if (!validPositions.includes(position.toUpperCase())) {
      return res.status(400).json({
        error: {
          message: 'Posição inválida',
          code: 'INVALID_POSITION'
        }
      });
    }

    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    const players = await prisma.player.findMany({
      where: {
        position: position.toUpperCase()
      },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            league: true,
            logoUrl: true
          }
        },
        playerStats: true
      },
      orderBy,
      take: parseInt(limit)
    });

    res.json({
      success: true,
      data: {
        players,
        position: position.toUpperCase(),
        count: players.length
      }
    });

  } catch (error) {
    console.error('Erro ao buscar jogadores por posição:', error);
    res.status(500).json({
      error: {
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      }
    });
  }
};

/**
 * Obter estatísticas dos jogadores
 */
const getPlayersStats = async (req, res) => {
  try {
    const stats = await prisma.player.aggregate({
      _count: {
        id: true
      },
      _avg: {
        marketValue: true,
        currentScore: true,
        averageScore: true
      },
      _max: {
        marketValue: true,
        currentScore: true
      },
      _min: {
        marketValue: true,
        currentScore: true
      }
    });

    const positionStats = await prisma.player.groupBy({
      by: ['position'],
      _count: {
        id: true
      },
      _avg: {
        currentScore: true,
        marketValue: true
      }
    });

    const nationalityStats = await prisma.player.groupBy({
      by: ['nationality'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    });

    res.json({
      success: true,
      data: {
        general: stats,
        byPosition: positionStats,
        topNationalities: nationalityStats
      }
    });

  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({
      error: {
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      }
    });
  }
};

module.exports = {
  getPlayers,
  getPlayerById,
  searchPlayers,
  getPlayersByPosition,
  getPlayersStats
};