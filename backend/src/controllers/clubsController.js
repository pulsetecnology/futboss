const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

/**
 * Obter todos os clubes com filtros
 */
const getClubs = async (req, res) => {
  try {
    const {
      league,
      country,
      search,
      page = 1,
      limit = 20,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    // Construir filtros
    const where = {};
    
    if (league) {
      where.league = {
        contains: league,
        mode: 'insensitive'
      };
    }
    
    if (country) {
      where.country = {
        contains: country,
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
          league: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          country: {
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

    // Buscar clubes
    const [clubs, total] = await Promise.all([
      prisma.club.findMany({
        where,
        include: {
          players: {
            select: {
              id: true,
              name: true,
              position: true,
              currentScore: true,
              marketValue: true
            },
            orderBy: {
              currentScore: 'desc'
            },
            take: 5 // Top 5 jogadores por clube
          },
          _count: {
            select: {
              players: true
            }
          }
        },
        orderBy,
        skip,
        take
      }),
      prisma.club.count({ where })
    ]);

    // Calcular metadados de paginação
    const totalPages = Math.ceil(total / take);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      data: {
        clubs,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: take,
          hasNextPage,
          hasPrevPage
        },
        filters: {
          league,
          country,
          search
        }
      }
    });

  } catch (error) {
    console.error('Erro ao buscar clubes:', error);
    res.status(500).json({
      error: {
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      }
    });
  }
};

/**
 * Obter clube por ID
 */
const getClubById = async (req, res) => {
  try {
    const { id } = req.params;

    const club = await prisma.club.findUnique({
      where: { id },
      include: {
        players: {
          include: {
            playerStats: true
          },
          orderBy: {
            currentScore: 'desc'
          }
        },
        _count: {
          select: {
            players: true
          }
        }
      }
    });

    if (!club) {
      return res.status(404).json({
        error: {
          message: 'Clube não encontrado',
          code: 'CLUB_NOT_FOUND'
        }
      });
    }

    // Calcular estatísticas do clube
    const clubStats = {
      totalPlayers: club._count.players,
      averageScore: club.players.length > 0 
        ? club.players.reduce((sum, player) => sum + player.currentScore, 0) / club.players.length 
        : 0,
      totalValue: club.players.reduce((sum, player) => sum + player.marketValue, 0),
      positionBreakdown: club.players.reduce((acc, player) => {
        acc[player.position] = (acc[player.position] || 0) + 1;
        return acc;
      }, {})
    };

    res.json({
      success: true,
      data: {
        club: {
          ...club,
          stats: clubStats
        }
      }
    });

  } catch (error) {
    console.error('Erro ao buscar clube:', error);
    res.status(500).json({
      error: {
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      }
    });
  }
};

/**
 * Obter jogadores de um clube
 */
const getClubPlayers = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      position, 
      minValue, 
      maxValue, 
      minScore, 
      maxScore,
      sortBy = 'currentScore',
      sortOrder = 'desc',
      limit = 50
    } = req.query;

    // Verificar se o clube existe
    const club = await prisma.club.findUnique({
      where: { id },
      select: { id: true, name: true }
    });

    if (!club) {
      return res.status(404).json({
        error: {
          message: 'Clube não encontrado',
          code: 'CLUB_NOT_FOUND'
        }
      });
    }

    // Construir filtros para jogadores
    const where = { clubId: id };
    
    if (position) {
      where.position = position.toUpperCase();
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

    // Ordenação
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    const players = await prisma.player.findMany({
      where,
      include: {
        playerStats: true
      },
      orderBy,
      take: parseInt(limit)
    });

    res.json({
      success: true,
      data: {
        club: {
          id: club.id,
          name: club.name
        },
        players,
        count: players.length,
        filters: {
          position,
          minValue,
          maxValue,
          minScore,
          maxScore
        }
      }
    });

  } catch (error) {
    console.error('Erro ao buscar jogadores do clube:', error);
    res.status(500).json({
      error: {
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      }
    });
  }
};

/**
 * Buscar clubes por nome
 */
const searchClubs = async (req, res) => {
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

    const clubs = await prisma.club.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query.trim(),
              mode: 'insensitive'
            }
          },
          {
            league: {
              contains: query.trim(),
              mode: 'insensitive'
            }
          },
          {
            country: {
              contains: query.trim(),
              mode: 'insensitive'
            }
          }
        ]
      },
      include: {
        _count: {
          select: {
            players: true
          }
        }
      },
      take: parseInt(limit),
      orderBy: {
        name: 'asc'
      }
    });

    res.json({
      success: true,
      data: {
        clubs,
        query: query.trim(),
        count: clubs.length
      }
    });

  } catch (error) {
    console.error('Erro na busca de clubes:', error);
    res.status(500).json({
      error: {
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      }
    });
  }
};

/**
 * Obter clubes por liga
 */
const getClubsByLeague = async (req, res) => {
  try {
    const { league } = req.params;
    const { limit = 20, sortBy = 'name', sortOrder = 'asc' } = req.query;

    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    const clubs = await prisma.club.findMany({
      where: {
        league: {
          contains: league,
          mode: 'insensitive'
        }
      },
      include: {
        _count: {
          select: {
            players: true
          }
        }
      },
      orderBy,
      take: parseInt(limit)
    });

    res.json({
      success: true,
      data: {
        clubs,
        league,
        count: clubs.length
      }
    });

  } catch (error) {
    console.error('Erro ao buscar clubes por liga:', error);
    res.status(500).json({
      error: {
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      }
    });
  }
};

/**
 * Obter estatísticas dos clubes
 */
const getClubsStats = async (req, res) => {
  try {
    const stats = await prisma.club.aggregate({
      _count: {
        id: true
      }
    });

    const leagueStats = await prisma.club.groupBy({
      by: ['league'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });

    const countryStats = await prisma.club.groupBy({
      by: ['country'],
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

    // Top clubes por valor total do elenco
    const topClubsByValue = await prisma.club.findMany({
      include: {
        players: {
          select: {
            marketValue: true
          }
        }
      },
      take: 10
    });

    const clubsWithTotalValue = topClubsByValue.map(club => ({
      id: club.id,
      name: club.name,
      league: club.league,
      country: club.country,
      totalValue: club.players.reduce((sum, player) => sum + player.marketValue, 0),
      playerCount: club.players.length
    })).sort((a, b) => b.totalValue - a.totalValue);

    res.json({
      success: true,
      data: {
        general: stats,
        byLeague: leagueStats,
        byCountry: countryStats,
        topByValue: clubsWithTotalValue
      }
    });

  } catch (error) {
    console.error('Erro ao obter estatísticas dos clubes:', error);
    res.status(500).json({
      error: {
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      }
    });
  }
};

module.exports = {
  getClubs,
  getClubById,
  getClubPlayers,
  searchClubs,
  getClubsByLeague,
  getClubsStats
};