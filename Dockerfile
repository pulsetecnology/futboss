# Multi-stage build para otimizar o tamanho da imagem
FROM node:18-alpine AS base

# Instalar dependências do sistema
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copiar arquivos de configuração
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Instalar dependências
RUN npm ci --only=production

# Stage para build do frontend
FROM base AS frontend-builder
WORKDIR /app/frontend
COPY frontend/ .
RUN npm ci
RUN npm run build

# Stage para build do backend
FROM base AS backend-builder
WORKDIR /app/backend
COPY backend/ .
RUN npm ci
RUN npx prisma generate

# Stage final de produção
FROM node:18-alpine AS production

WORKDIR /app

# Copiar dependências instaladas
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/backend/node_modules ./backend/node_modules

# Copiar código do backend
COPY --from=backend-builder /app/backend ./backend

# Copiar build do frontend
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Copiar arquivos de configuração
COPY package*.json ./

# Criar usuário não-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 futboss

# Mudar ownership dos arquivos
RUN chown -R futboss:nodejs /app
USER futboss

# Expor porta
EXPOSE 3001

# Variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Comando para iniciar a aplicação
CMD ["npm", "run", "start:production"]