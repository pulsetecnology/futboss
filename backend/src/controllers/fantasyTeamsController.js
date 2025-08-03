const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

// Orçamento padrão para fantasy teams
const DEFAULT_BUDGET = 100000000; // 100M

/**
 * Obter fantasy teams do usuário
 */
const getFantasyTeams = async (req, res) => {
  try {
    const userId = req.user.id;

    if (req.user.isGuest) {
      return res.json({
        success: true,
        data: {
          teams: [],
          count: 0,
          message: 'Usuários convidados não podem criar fantasy teams'
        }
      });
    }

    const teams = await prisma.fantasyTeam.findMany({
      where: { userId },
      include: {
        teamPlayers: {
          include: {
            player: {
              include: {
                club: {
                  select: {
                    name: true,
                    logoUrl: true
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            teamPlayers: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: {
        teams,
        count: teams.length
      }
    });

  } catch (error) {
    console.error('Erro ao buscar fantasy teams:', error);
    res.status(500).json({
      error: {
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      }
    });
  }
};

/**
 * Criar fantasy team
 */
const createFantasyTeam = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          message: 'Dados inválidos',
          code: 'VALIDATION_ERROR',
          details: errors.array()
        }
      });
    }

    const userId = req.user.id;
    const { name, formation = '4-4-2', players = [] } = req.body;

    if (req.user.isGuest) {
      return res.status(403).json({
        error: {
          message: 'Usuários convidados não podem criar fantasy teams',
          code: 'GUEST_RESTRICTED'
        }
      });
    }

    // Validar jogadores se fornecidos
    let totalValue = 0;
    let validatedPlayers = [];

    if (players.length > 0) {
      // Buscar jogadores no banco
      const playerIds = players.map(p => p.playerId);
      const dbPlayers = await prisma.player.findMany({
        where: { id: { in: playerIds } }
      });

      if (dbPlayers.length !== playerIds.length) {
        return res.status(400).json({
          error: {
            message: 'Um ou mais jogadores não foram encontrados',
            code: 'PLAYERS_NOT_FOUND'
          }
        });
      }

      // Validar orçamento
      for (const playerData of players) {
        const dbPlayer = dbPlayers.find(p => p.id === playerData.playerId);
        totalValue += dbPlayer.marketValue;
        
        validatedPlayers.push({
          playerId: playerData.playerId,
          position: playerData.position || dbPlayer.position,
          acquisitionValue: dbPlayer.marketValue
        });
      }

      if (totalValue > DEFAULT_BUDGET) {
        return res.status(400).json({
          error: {
            message: `Orçamento excedido. Total: €${(totalValue / 1000000).toFixed(1)}M, Limite: €${(DEFAULT_BUDGET / 1000000).toFixed(1)}M`,
            code: 'BUDGET_EXCEEDED',
            totalValue,
            budget: DEFAULT_BUDGET
          }
        });
      }
    }

    // Criar fantasy team
    const fantasyTeam = await prisma.fantasyTeam.create({
      data: {
        userId,
        name,
        formation,
        totalValue,
        budget: DEFAULT_BUDGET,
        teamPlayers: {
          create: validatedPlayers
        }
      },
      include: {
        teamPlayers: {
          include: {
            player: {
              include: {
                club: {
                  select: {
                    name: true,
                    logoUrl: true
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            teamPlayers: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Fantasy team criado com sucesso',
      data: {
        team: fantasyTeam
      }
    });

  } catch (error) {
    console.error('Erro ao criar fantasy team:', error);
    res.status(500).json({
      error: {
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      }
    });
  }
};

/**
 * Obter fantasy team por ID
 */
const getFantasyTeamById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const team = await prisma.fantasyTeam.findFirst({
      where: { 
        id,
        userId // Garantir que o usuário só acesse seus próprios times
      },
      include: {
        teamPlayers: {
          include: {
            player: {
              include: {
                club: {
                  select: {
                    name: true,
                    logoUrl: true
                  }
                },
                playerStats: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            username: true
          }
        },
        _count: {
          select: {
            teamPlayers: true
          }
        }
      }
    });

    if (!team) {
      return res.status(404).json({
        error: {
          message: 'Fantasy team não encontrado',
          code: 'TEAM_NOT_FOUND'
        }
      });
    }

    // Calcular estatísticas do time
    const teamStats = {
      totalPlayers: team._count.teamPlayers,
      remainingBudget: team.budget - team.totalValue,
      averageScore: team.teamPlayers.length > 0 
        ? team.teamPlayers.reduce((sum, tp) => sum + tp.player.currentScore, 0) / team.teamPlayers.length 
        : 0,
      positionBreakdown: team.teamPlayers.reduce((acc, tp) => {
        acc[tp.position] = (acc[tp.position] || 0) + 1;
        return acc;
      }, {})
    };

    res.json({
      success: true,
      data: {
        team: {
          ...team,
          stats: teamStats
        }
      }
    });

  } catch (error) {
    console.error('Erro ao buscar fantasy team:', error);
    res.status(500).json({
      error: {
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      }
    });
  }
};

/**
 * Atualizar fantasy team
 */
const updateFantasyTeam = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          message: 'Dados inválidos',
          code: 'VALIDATION_ERROR',
          details: errors.array()
        }
      });
    }

    const { id } = req.params;
    const userId = req.user.id;
    const { name, formation } = req.body;

    // Verificar se o team existe e pertence ao usuário
    const existingTeam = await prisma.fantasyTeam.findFirst({
      where: { id, userId }
    });

    if (!existingTeam) {
      return res.status(404).json({
        error: {
          message: 'Fantasy team não encontrado',
          code: 'TEAM_NOT_FOUND'
        }
      });
    }

    // Atualizar team
    const updatedTeam = await prisma.fantasyTeam.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(formation && { formation })
      },
      include: {
        teamPlayers: {
          include: {
            player: {
              include: {
                club: {
                  select: {
                    name: true,
                    logoUrl: true
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            teamPlayers: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Fantasy team atualizado com sucesso',
      data: {
        team: updatedTeam
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar fantasy team:', error);
    res.status(500).json({
      error: {
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      }
    });
  }
};

/**
 * Deletar fantasy team
 */
const deleteFantasyTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar se o team existe e pertence ao usuário
    const existingTeam = await prisma.fantasyTeam.findFirst({
      where: { id, userId }
    });

    if (!existingTeam) {
      return res.status(404).json({
        error: {
          message: 'Fantasy team não encontrado',
          code: 'TEAM_NOT_FOUND'
        }
      });
    }

    // Deletar team (cascade vai deletar teamPlayers automaticamente)
    await prisma.fantasyTeam.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Fantasy team deletado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar fantasy team:', error);
    res.status(500).json({
      error: {
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      }
    });
  }
};

/**
 * Adicionar jogador ao team
 */
const addPlayerToTeam = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          message: 'Dados inválidos',
          code: 'VALIDATION_ERROR',
          details: errors.array()
        }
      });
    }

    const { teamId } = req.params;
    const userId = req.user.id;
    const { playerId, position } = req.body;

    // Verificar se o team existe e pertence ao usuário
    const team = await prisma.fantasyTeam.findFirst({
      where: { id: teamId, userId },
      include: {
        teamPlayers: true
      }
    });

    if (!team) {
      return res.status(404).json({
        error: {
          message: 'Fantasy team não encontrado',
          code: 'TEAM_NOT_FOUND'
        }
      });
    }

    // Verificar se o jogador existe
    const player = await prisma.player.findUnique({
      where: { id: playerId }
    });

    if (!player) {
      return res.status(404).json({
        error: {
          message: 'Jogador não encontrado',
          code: 'PLAYER_NOT_FOUND'
        }
      });
    }

    // Verificar se o jogador já está no time
    const existingTeamPlayer = team.teamPlayers.find(tp => tp.playerId === playerId);
    if (existingTeamPlayer) {
      return res.status(400).json({
        error: {
          message: 'Jogador já está no time',
          code: 'PLAYER_ALREADY_IN_TEAM'
        }
      });
    }

    // Verificar orçamento
    const newTotalValue = team.totalValue + player.marketValue;
    if (newTotalValue > team.budget) {
      return res.status(400).json({
        error: {
          message: `Orçamento insuficiente. Valor do jogador: €${(player.marketValue / 1000000).toFixed(1)}M, Disponível: €${((team.budget - team.totalValue) / 1000000).toFixed(1)}M`,
          code: 'INSUFFICIENT_BUDGET',
          playerValue: player.marketValue,
          availableBudget: team.budget - team.totalValue
        }
      });
    }

    // Adicionar jogador ao time
    const teamPlayer = await prisma.teamPlayer.create({
      data: {
        fantasyTeamId: teamId,
        playerId,
        position: position || player.position,
        acquisitionValue: player.marketValue
      },
      include: {
        player: {
          include: {
            club: {
              select: {
                name: true,
                logoUrl: true
              }
            }
          }
        }
      }
    });

    // Atualizar valor total do time
    await prisma.fantasyTeam.update({
      where: { id: teamId },
      data: {
        totalValue: newTotalValue
      }
    });

    res.status(201).json({
      success: true,
      message: 'Jogador adicionado ao time com sucesso',
      data: {
        teamPlayer
      }
    });

  } catch (error) {
    console.error('Erro ao adicionar jogador ao time:', error);
    res.status(500).json({
      error: {
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      }
    });
  }
};

/**
 * Remover jogador do team
 */
const removePlayerFromTeam = async (req, res) => {
  try {
    const { teamId, playerId } = req.params;
    const userId = req.user.id;

    // Verificar se o team existe e pertence ao usuário
    const team = await prisma.fantasyTeam.findFirst({
      where: { id: teamId, userId }
    });

    if (!team) {
      return res.status(404).json({
        error: {
          message: 'Fantasy team não encontrado',
          code: 'TEAM_NOT_FOUND'
        }
      });
    }

    // Verificar se o jogador está no time
    const teamPlayer = await prisma.teamPlayer.findFirst({
      where: {
        fantasyTeamId: teamId,
        playerId
      }
    });

    if (!teamPlayer) {
      return res.status(404).json({
        error: {
          message: 'Jogador não encontrado no time',
          code: 'PLAYER_NOT_IN_TEAM'
        }
      });
    }

    // Remover jogador do time
    await prisma.teamPlayer.delete({
      where: { id: teamPlayer.id }
    });

    // Atualizar valor total do time
    const newTotalValue = team.totalValue - teamPlayer.acquisitionValue;
    await prisma.fantasyTeam.update({
      where: { id: teamId },
      data: {
        totalValue: Math.max(0, newTotalValue) // Garantir que não seja negativo
      }
    });

    res.json({
      success: true,
      message: 'Jogador removido do time com sucesso'
    });

  } catch (error) {
    console.error('Erro ao remover jogador do time:', error);
    res.status(500).json({
      error: {
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      }
    });
  }
};

module.exports = {
  getFantasyTeams,
  createFantasyTeam,
  getFantasyTeamById,
  updateFantasyTeam,
  deleteFantasyTeam,
  addPlayerToTeam,
  removePlayerFromTeam
};