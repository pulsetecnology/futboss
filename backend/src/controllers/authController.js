const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { generateToken, generateGuestToken } = require('../middleware/auth');

const prisma = new PrismaClient();

/**
 * Registrar novo usuário
 */
const register = async (req, res) => {
  try {
    // Verificar erros de validação
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

    const { email, username, password } = req.body;

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: username.toLowerCase() }
        ]
      }
    });

    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? 'E-mail' : 'Nome de usuário';
      return res.status(409).json({
        error: {
          message: `${field} já está em uso`,
          code: 'USER_EXISTS',
          field: existingUser.email === email.toLowerCase() ? 'email' : 'username'
        }
      });
    }

    // Hash da senha
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        password: hashedPassword,
        isGuest: false,
        lastLogin: new Date()
      },
      select: {
        id: true,
        email: true,
        username: true,
        isGuest: true,
        createdAt: true
      }
    });

    // Criar preferências padrão
    await prisma.userPreferences.create({
      data: {
        userId: user.id,
        favoriteTeam: null,
        preferredFormation: '4-4-2',
        notifications: true
      }
    });

    // Gerar token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: {
        user,
        token,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      }
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({
      error: {
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      }
    });
  }
};

/**
 * Login de usuário
 */
const login = async (req, res) => {
  try {
    // Verificar erros de validação
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

    const { emailOrUsername, password } = req.body;

    // Buscar usuário por email ou username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrUsername.toLowerCase() },
          { username: emailOrUsername.toLowerCase() }
        ],
        isGuest: false // Não permitir login de convidados
      }
    });

    if (!user) {
      return res.status(401).json({
        error: {
          message: 'E-mail/usuário ou senha incorretos',
          code: 'INVALID_CREDENTIALS'
        }
      });
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: {
          message: 'E-mail/usuário ou senha incorretos',
          code: 'INVALID_CREDENTIALS'
        }
      });
    }

    // Atualizar último login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Gerar token
    const token = generateToken(user.id);

    // Buscar preferências do usuário
    const preferences = await prisma.userPreferences.findUnique({
      where: { userId: user.id }
    });

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          isGuest: user.isGuest,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        },
        preferences,
        token,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      error: {
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      }
    });
  }
};

/**
 * Login como convidado
 */
const loginAsGuest = async (req, res) => {
  try {
    // Gerar token de convidado
    const token = generateGuestToken();

    res.json({
      success: true,
      message: 'Login como convidado realizado',
      data: {
        user: {
          id: 'guest',
          email: 'guest@futboss.app',
          username: 'Convidado',
          isGuest: true,
          createdAt: new Date(),
          lastLogin: new Date()
        },
        token,
        expiresIn: '24h'
      }
    });

  } catch (error) {
    console.error('Erro no login como convidado:', error);
    res.status(500).json({
      error: {
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      }
    });
  }
};

/**
 * Verificar token (refresh)
 */
const verifyToken = async (req, res) => {
  try {
    // O middleware já verificou o token e adicionou o usuário
    const user = req.user;

    if (user.id === 'guest') {
      return res.json({
        success: true,
        data: {
          user: {
            id: 'guest',
            email: 'guest@futboss.app',
            username: 'Convidado',
            isGuest: true,
            createdAt: new Date(),
            lastLogin: new Date()
          }
        }
      });
    }

    // Buscar preferências para usuários registrados
    const preferences = await prisma.userPreferences.findUnique({
      where: { userId: user.id }
    });

    res.json({
      success: true,
      data: {
        user,
        preferences
      }
    });

  } catch (error) {
    console.error('Erro na verificação do token:', error);
    res.status(500).json({
      error: {
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      }
    });
  }
};

/**
 * Logout (invalidar token - implementação futura)
 */
const logout = async (req, res) => {
  try {
    // Por enquanto, apenas retorna sucesso
    // Em implementação futura, podemos adicionar blacklist de tokens
    
    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });

  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({
      error: {
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      }
    });
  }
};

/**
 * Atualizar perfil do usuário
 */
const updateProfile = async (req, res) => {
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
    const { username, email } = req.body;

    // Verificar se não é convidado
    if (req.user.isGuest) {
      return res.status(403).json({
        error: {
          message: 'Convidados não podem atualizar perfil',
          code: 'GUEST_RESTRICTED'
        }
      });
    }

    // Verificar se email/username já existem (exceto o próprio usuário)
    if (email || username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: userId } },
            {
              OR: [
                email ? { email: email.toLowerCase() } : {},
                username ? { username: username.toLowerCase() } : {}
              ].filter(condition => Object.keys(condition).length > 0)
            }
          ]
        }
      });

      if (existingUser) {
        const field = existingUser.email === email?.toLowerCase() ? 'E-mail' : 'Nome de usuário';
        return res.status(409).json({
          error: {
            message: `${field} já está em uso`,
            code: 'USER_EXISTS',
            field: existingUser.email === email?.toLowerCase() ? 'email' : 'username'
          }
        });
      }
    }

    // Atualizar usuário
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(email && { email: email.toLowerCase() }),
        ...(username && { username: username.toLowerCase() })
      },
      select: {
        id: true,
        email: true,
        username: true,
        isGuest: true,
        createdAt: true,
        lastLogin: true
      }
    });

    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: {
        user: updatedUser
      }
    });

  } catch (error) {
    console.error('Erro na atualização do perfil:', error);
    res.status(500).json({
      error: {
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      }
    });
  }
};

module.exports = {
  register,
  login,
  loginAsGuest,
  verifyToken,
  logout,
  updateProfile
};