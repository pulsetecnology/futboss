const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Middleware de autenticação JWT
 * Verifica se o token é válido e adiciona o usuário ao request
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: {
          message: 'Token de acesso requerido',
          code: 'MISSING_TOKEN'
        }
      });
    }

    // Verificar token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuário no banco
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        isGuest: true,
        createdAt: true,
        lastLogin: true
      }
    });

    if (!user) {
      return res.status(401).json({
        error: {
          message: 'Usuário não encontrado',
          code: 'USER_NOT_FOUND'
        }
      });
    }

    // Adicionar usuário ao request
    req.user = user;
    next();

  } catch (error) {
    console.error('Erro na autenticação:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: {
          message: 'Token inválido',
          code: 'INVALID_TOKEN'
        }
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: {
          message: 'Token expirado',
          code: 'EXPIRED_TOKEN'
        }
      });
    }

    return res.status(500).json({
      error: {
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      }
    });
  }
};

/**
 * Middleware opcional - permite acesso com ou sem token
 * Se houver token válido, adiciona o usuário ao request
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        isGuest: true,
        createdAt: true,
        lastLogin: true
      }
    });

    req.user = user || null;
    next();

  } catch (error) {
    // Em caso de erro, continua sem usuário
    req.user = null;
    next();
  }
};

/**
 * Middleware para verificar se o usuário não é convidado
 */
const requireRegisteredUser = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: {
        message: 'Autenticação requerida',
        code: 'AUTH_REQUIRED'
      }
    });
  }

  if (req.user.isGuest) {
    return res.status(403).json({
      error: {
        message: 'Acesso restrito para usuários registrados',
        code: 'GUEST_RESTRICTED'
      }
    });
  }

  next();
};

/**
 * Gera token JWT para um usuário
 */
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Gera token de convidado
 */
const generateGuestToken = () => {
  return jwt.sign(
    { 
      userId: 'guest',
      isGuest: true 
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' } // Convidados têm token de 24h
  );
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireRegisteredUser,
  generateToken,
  generateGuestToken
};