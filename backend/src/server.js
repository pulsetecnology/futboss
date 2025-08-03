const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de segurança
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
    },
  },
}));

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // máximo 100 requests por IP
  message: {
    error: 'Muitas tentativas. Tente novamente em alguns minutos.'
  }
});
app.use('/api/', limiter);

// Middleware para parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos do frontend (para produção)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('../frontend/dist'));
}

// Rotas de saúde
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'FutBoss API está funcionando!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Importar Prisma Client
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Rota de teste para verificar conexão com banco
app.get('/api/test-db', async (req, res) => {
  try {
    // Testar conexão com Prisma
    await prisma.$connect();
    const userCount = await prisma.user.count();
    const playerCount = await prisma.player.count();
    const clubCount = await prisma.club.count();
    
    res.json({
      status: 'OK',
      message: 'Conexão com banco de dados OK',
      database: 'PostgreSQL (Railway)',
      stats: {
        users: userCount,
        players: playerCount,
        clubs: clubCount
      }
    });
  } catch (error) {
    console.error('Erro ao conectar com banco:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Erro ao conectar com banco de dados',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Importar rotas
const authRoutes = require('./routes/auth');

// Rotas da API
app.use('/api/auth', authRoutes);

// Rotas em desenvolvimento
app.use('/api/players', (req, res) => {
  res.json({ message: 'Rotas de jogadores em desenvolvimento' });
});

app.use('/api/clubs', (req, res) => {
  res.json({ message: 'Rotas de clubes em desenvolvimento' });
});

app.use('/api/fantasy-teams', (req, res) => {
  res.json({ message: 'Rotas de fantasy teams em desenvolvimento' });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro na aplicação:', err);
  
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Erro interno do servidor',
      status: err.status || 500,
      timestamp: new Date().toISOString()
    }
  });
});

// Rota catch-all para SPA (Single Page Application)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
  });
}

// Rota 404 para API
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: {
      message: 'Endpoint não encontrado',
      status: 404,
      path: req.path
    }
  });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 FutBoss Backend rodando na porta ${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔌 API Health: http://localhost:${PORT}/api/health`);
  
  if (process.env.NODE_ENV === 'production') {
    console.log(`🎮 FutBoss App: https://your-railway-domain.railway.app`);
  } else {
    console.log(`🎮 Frontend dev: http://localhost:3000`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Recebido SIGTERM, encerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Recebido SIGINT, encerrando servidor...');
  process.exit(0);
});

module.exports = app;