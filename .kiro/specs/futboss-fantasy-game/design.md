# Documento de Design - FutBoss

## Visão Geral

FutBoss é um aplicativo mobile-first de fantasy game de futebol que combina elementos de gamificação moderna com dados reais de desempenho de jogadores. O design prioriza uma experiência visual imersiva inspirada em fantasy games, com interface responsiva e fluxos intuitivos para criação e gerenciamento de times.

## Arquitetura

### Arquitetura Geral
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   APIs Externas │
│   (Mobile-First)│◄──►│   (Node.js)     │◄──►│   (SofaScore)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Cache Local     │    │ PostgreSQL      │    │ Dados Mockados  │
│ (Temporário)    │    │ (Railway)       │    │ (Fallback)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │ Prisma ORM      │
                       └─────────────────┘
```

### Camadas da Aplicação

**1. Camada de Apresentação (UI/UX)**
- Interface mobile-first responsiva
- Componentes reutilizáveis com Tailwind CSS
- Animações e transições fluidas
- Feedback visual para interações

**2. Camada de Lógica de Negócio**
- Gerenciamento de estado com Alpine.js/Vue.js
- Validação de orçamento e regras do fantasy
- Cálculo de pontuações em tempo real
- Gerenciamento de sessão de usuário

**3. Camada de Dados**
- PostgreSQL no Railway como banco principal
- Prisma ORM para modelagem e queries
- Cache local temporário para performance
- Sincronização em tempo real com banco

**4. Camada de Integração**
- API SofaScore para dados reais
- Sistema de fallback com dados do banco
- Tratamento de erros e timeout
- Rate limiting e cache inteligente

### Configuração do Banco de Dados

**Conexão PostgreSQL (Railway):**
```env
DATABASE_URL="postgresql://postgres:NhEEfyDNGUXpTzWpGvbeXfqWSgiNItUR@centerbeam.proxy.rlwy.net:27175/railway"
```

**Comandos Prisma:**
```bash
# Instalar Prisma CLI
npm install prisma @prisma/client

# Inicializar Prisma
npx prisma init

# Gerar cliente Prisma
npx prisma generate

# Executar migrações
npx prisma migrate dev --name init

# Executar seed
npx prisma db seed

# Visualizar banco (Prisma Studio)
npx prisma studio
```

## Componentes e Interfaces

### 1. Sistema de Autenticação

**Componente: AuthManager**
```javascript
interface AuthManager {
  login(credentials: UserCredentials): Promise<AuthResult>
  register(userData: UserData): Promise<AuthResult>
  loginAsGuest(): Promise<GuestSession>
  logout(): void
  getCurrentUser(): User | null
  isAuthenticated(): boolean
}
```

**Tela de Login/Cadastro:**
- Layout centralizado com logo animado
- Formulário com validação em tempo real
- Botões com estados de loading
- Mensagens de erro contextuais
- Opção de login como convidado

### 2. Tela Inicial (Boas-vindas)

**Componente: WelcomeScreen**
```javascript
interface WelcomeScreen {
  initializeAnimations(): void
  navigateToTeamCreation(): void
  navigateToRealTeamSelection(): void
  displayUserGreeting(user: User): void
}
```

**Elementos Visuais:**
- Fundo com gradient roxo/preto (#6B46C1 → #000000)
- Sistema de partículas animadas (Canvas/CSS)
- Logo com efeito glow e animação de entrada
- Botões com hover effects e ripple animation
- Rodapé com slogan animado

### 3. Sistema de Criação de Time

**Componente: TeamBuilder**
```javascript
interface TeamBuilder {
  loadAvailablePlayers(): Promise<Player[]>
  filterPlayers(criteria: FilterCriteria): Player[]
  addPlayerToTeam(player: Player): BudgetResult
  removePlayerFromTeam(playerId: string): void
  calculateTotalCost(): number
  validateTeamComposition(): ValidationResult
  saveTeam(): Promise<SaveResult>
}
```

**Interface de Filtros:**
- Dropdown de posições (Goleiro, Defesa, Meio, Ataque)
- Slider de faixa de preço
- Busca por nome
- Ordenação por valor/pontuação

**Cards de Jogadores:**
- Foto do jogador (placeholder se não disponível)
- Nome e posição
- Valor de contratação
- Pontuação histórica (média)
- Botão de adicionar/remover
- Indicador de status (disponível/selecionado)

### 4. Sistema de Seleção de Times Reais

**Componente: RealTeamSelector**
```javascript
interface RealTeamSelector {
  searchClubs(query: string): Promise<Club[]>
  getClubRoster(clubId: string): Promise<Player[]>
  addPlayerFromClub(player: Player): BudgetResult
  displayClubInfo(club: Club): void
}
```

**Interface de Busca:**
- Campo de busca com autocomplete
- Lista de clubes com logos
- Filtros por liga/país
- Resultados paginados

### 5. Visualização do Time

**Componente: MyTeamView**
```javascript
interface MyTeamView {
  displayFormation(): void
  showPlayerDetails(playerId: string): PlayerDetails
  editTeam(): void
  calculateTotalPoints(): number
  updatePlayerStats(): Promise<void>
}
```

**Layout da Escalação:**
- Formação visual (4-4-2, 4-3-3, etc.)
- Posicionamento dos jogadores
- Pontuação individual e total
- Indicadores de performance
- Opções de substituição

## Esquema do Banco de Dados (Prisma)

### Schema Prisma
```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id          String   @id @default(cuid())
  email       String   @unique
  username    String   @unique
  password    String
  isGuest     Boolean  @default(false)
  createdAt   DateTime @default(now())
  lastLogin   DateTime @updatedAt
  
  // Relacionamentos
  fantasyTeams FantasyTeam[]
  preferences  UserPreferences?
  
  @@map("users")
}

model UserPreferences {
  id                String @id @default(cuid())
  userId            String @unique
  favoriteTeam      String?
  preferredFormation String @default("4-4-2")
  notifications     Boolean @default(true)
  
  // Relacionamentos
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("user_preferences")
}

model Player {
  id            String         @id @default(cuid())
  name          String
  position      PlayerPosition
  currentTeam   String
  marketValue   Float
  currentScore  Float          @default(0)
  averageScore  Float          @default(0)
  physicalStatus PhysicalStatus @default(AVAILABLE)
  photoUrl      String?
  nationality   String?
  age           Int?
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  
  // Relacionamentos
  teamPlayers   TeamPlayer[]
  playerStats   PlayerStats?
  club          Club?          @relation(fields: [clubId], references: [id])
  clubId        String?
  
  @@map("players")
}

model PlayerStats {
  id           String @id @default(cuid())
  playerId     String @unique
  gamesPlayed  Int    @default(0)
  goals        Int    @default(0)
  assists      Int    @default(0)
  yellowCards  Int    @default(0)
  redCards     Int    @default(0)
  lastGameRating Float @default(0)
  
  // Relacionamentos
  player Player @relation(fields: [playerId], references: [id], onDelete: Cascade)
  
  @@map("player_stats")
}

model Club {
  id       String @id @default(cuid())
  name     String @unique
  league   String
  country  String
  logoUrl  String?
  
  // Relacionamentos
  players  Player[]
  
  @@map("clubs")
}

model FantasyTeam {
  id          String   @id @default(cuid())
  userId      String
  name        String
  formation   String   @default("4-4-2")
  totalValue  Float    @default(0)
  totalPoints Float    @default(0)
  budget      Float    @default(100000000) // 100M budget padrão
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relacionamentos
  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  teamPlayers TeamPlayer[]
  
  @@map("fantasy_teams")
}

model TeamPlayer {
  id               String @id @default(cuid())
  fantasyTeamId    String
  playerId         String
  position         PlayerPosition
  acquisitionValue Float
  currentPoints    Float @default(0)
  
  // Relacionamentos
  fantasyTeam FantasyTeam @relation(fields: [fantasyTeamId], references: [id], onDelete: Cascade)
  player      Player      @relation(fields: [playerId], references: [id])
  
  @@unique([fantasyTeamId, playerId])
  @@map("team_players")
}

enum PlayerPosition {
  GOALKEEPER
  DEFENDER
  MIDFIELDER
  FORWARD
}

enum PhysicalStatus {
  AVAILABLE
  INJURED
  SUSPENDED
  DOUBTFUL
}
```

## Data Models

### User Model
```typescript
interface User {
  id: string
  email: string
  username: string
  createdAt: Date
  lastLogin: Date
  isGuest: boolean
  preferences: UserPreferences
}

interface UserPreferences {
  favoriteTeam?: string
  preferredFormation: string
  notifications: boolean
}
```

### Player Model
```typescript
interface Player {
  id: string
  name: string
  position: PlayerPosition
  currentTeam: string
  marketValue: number
  currentScore: number
  averageScore: number
  physicalStatus: PhysicalStatus
  photoUrl?: string
  stats: PlayerStats
}

interface PlayerStats {
  gamesPlayed: number
  goals: number
  assists: number
  yellowCards: number
  redCards: number
  lastGameRating: number
}

enum PlayerPosition {
  GOALKEEPER = 'GK',
  DEFENDER = 'DEF',
  MIDFIELDER = 'MID',
  FORWARD = 'FWD'
}

enum PhysicalStatus {
  AVAILABLE = 'available',
  INJURED = 'injured',
  SUSPENDED = 'suspended',
  DOUBTFUL = 'doubtful'
}
```

### Team Model
```typescript
interface FantasyTeam {
  id: string
  userId: string
  name: string
  formation: string
  players: TeamPlayer[]
  totalValue: number
  totalPoints: number
  budget: number
  createdAt: Date
  lastUpdated: Date
}

interface TeamPlayer {
  playerId: string
  position: PlayerPosition
  acquisitionValue: number
  currentPoints: number
}
```

### Club Model
```typescript
interface Club {
  id: string
  name: string
  league: string
  country: string
  logoUrl: string
  players: Player[]
}
```

## Backend e APIs

### Backend Architecture (Node.js + Prisma)

**Estrutura do Backend:**
```
backend/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── src/
│   ├── controllers/
│   ├── services/
│   ├── routes/
│   ├── middleware/
│   └── utils/
├── package.json
└── .env
```

**API Endpoints:**
```javascript
// Autenticação
POST /api/auth/register
POST /api/auth/login
POST /api/auth/guest
POST /api/auth/logout

// Usuários
GET /api/users/profile
PUT /api/users/profile
GET /api/users/preferences
PUT /api/users/preferences

// Jogadores
GET /api/players
GET /api/players/:id
GET /api/players/search?q=:query
GET /api/players/by-position/:position

// Clubes
GET /api/clubs
GET /api/clubs/:id
GET /api/clubs/:id/players

// Fantasy Teams
GET /api/fantasy-teams
POST /api/fantasy-teams
GET /api/fantasy-teams/:id
PUT /api/fantasy-teams/:id
DELETE /api/fantasy-teams/:id
POST /api/fantasy-teams/:id/players
DELETE /api/fantasy-teams/:id/players/:playerId
```

**Serviços do Backend:**
```javascript
// services/PlayerService.js
class PlayerService {
  async getAllPlayers(filters = {}) {
    return await prisma.player.findMany({
      where: filters,
      include: {
        playerStats: true,
        club: true
      }
    });
  }
  
  async updatePlayerScores() {
    // Integração com SofaScore API
    const apiData = await this.fetchFromSofaScore();
    // Atualizar scores no banco
  }
}

// services/FantasyTeamService.js
class FantasyTeamService {
  async createTeam(userId, teamData) {
    return await prisma.fantasyTeam.create({
      data: {
        ...teamData,
        userId,
        teamPlayers: {
          create: teamData.players
        }
      }
    });
  }
  
  async calculateTeamPoints(teamId) {
    const team = await prisma.fantasyTeam.findUnique({
      where: { id: teamId },
      include: {
        teamPlayers: {
          include: { player: true }
        }
      }
    });
    
    const totalPoints = team.teamPlayers.reduce(
      (sum, tp) => sum + tp.player.currentScore, 0
    );
    
    await prisma.fantasyTeam.update({
      where: { id: teamId },
      data: { totalPoints }
    });
    
    return totalPoints;
  }
}
```

## Integração com APIs Externas

### SofaScore API Integration

**Componente: SofaScoreService**
```javascript
interface SofaScoreService {
  getPlayerStats(playerId: string): Promise<PlayerStats>
  getTeamRoster(teamId: string): Promise<Player[]>
  getMatchResults(): Promise<MatchResult[]>
  getPlayerRatings(matchId: string): Promise<PlayerRating[]>
}
```

**Estrutura de Dados da API:**
```json
{
  "player": {
    "id": "123456",
    "name": "Rodrygo",
    "position": "Atacante",
    "team": "Real Madrid",
    "marketValue": "€65M",
    "currentRating": 7.9,
    "averageRating": 7.2,
    "status": "available",
    "stats": {
      "goals": 8,
      "assists": 5,
      "gamesPlayed": 15
    }
  }
}
```

**Sistema de Fallback:**
- Cache local de dados da API
- JSON mockado para desenvolvimento
- Indicadores visuais de fonte de dados
- Sincronização automática quando API volta

### Seed do Banco de Dados (Prisma)
```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Criar clubes
  const realMadrid = await prisma.club.create({
    data: {
      name: 'Real Madrid',
      league: 'La Liga',
      country: 'Spain',
      logoUrl: '/logos/real-madrid.png'
    }
  });

  const barcelona = await prisma.club.create({
    data: {
      name: 'FC Barcelona',
      league: 'La Liga',
      country: 'Spain',
      logoUrl: '/logos/barcelona.png'
    }
  });

  const palmeiras = await prisma.club.create({
    data: {
      name: 'Palmeiras',
      league: 'Brasileirão',
      country: 'Brazil',
      logoUrl: '/logos/palmeiras.png'
    }
  });

  // Criar jogadores
  const players = [
    {
      name: 'Rodrygo',
      position: 'FORWARD',
      currentTeam: 'Real Madrid',
      marketValue: 65000000,
      currentScore: 7.9,
      averageScore: 7.2,
      nationality: 'Brazil',
      age: 23,
      clubId: realMadrid.id
    },
    {
      name: 'Vinícius Jr.',
      position: 'FORWARD',
      currentTeam: 'Real Madrid',
      marketValue: 120000000,
      currentScore: 8.1,
      averageScore: 7.8,
      nationality: 'Brazil',
      age: 24,
      clubId: realMadrid.id
    },
    {
      name: 'Endrick',
      position: 'FORWARD',
      currentTeam: 'Palmeiras',
      marketValue: 35000000,
      currentScore: 7.5,
      averageScore: 7.0,
      nationality: 'Brazil',
      age: 18,
      clubId: palmeiras.id
    },
    {
      name: 'Robert Lewandowski',
      position: 'FORWARD',
      currentTeam: 'FC Barcelona',
      marketValue: 45000000,
      currentScore: 8.3,
      averageScore: 8.0,
      nationality: 'Poland',
      age: 35,
      clubId: barcelona.id
    }
  ];

  for (const playerData of players) {
    const player = await prisma.player.create({
      data: playerData
    });

    // Criar estatísticas para cada jogador
    await prisma.playerStats.create({
      data: {
        playerId: player.id,
        gamesPlayed: Math.floor(Math.random() * 30) + 10,
        goals: Math.floor(Math.random() * 20),
        assists: Math.floor(Math.random() * 15),
        yellowCards: Math.floor(Math.random() * 5),
        redCards: Math.floor(Math.random() * 2),
        lastGameRating: playerData.currentScore
      }
    });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

## Design Visual e UX

### Paleta de Cores
```css
:root {
  /* Cores Primárias */
  --primary-purple: #6B46C1;
  --primary-magenta: #D946EF;
  --primary-blue-neon: #06B6D4;
  --primary-orange: #F97316;
  
  /* Gradientes */
  --gradient-main: linear-gradient(135deg, #6B46C1 0%, #000000 100%);
  --gradient-card: linear-gradient(145deg, #1F2937 0%, #374151 100%);
  
  /* Cores de Estado */
  --success: #10B981;
  --warning: #F59E0B;
  --error: #EF4444;
  --info: #3B82F6;
}
```

### Tipografia
```css
/* Fonte Principal */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

.font-primary {
  font-family: 'Inter', sans-serif;
}

/* Hierarquia Tipográfica */
.text-hero { font-size: 2.5rem; font-weight: 700; }
.text-title { font-size: 1.875rem; font-weight: 600; }
.text-subtitle { font-size: 1.25rem; font-weight: 500; }
.text-body { font-size: 1rem; font-weight: 400; }
.text-caption { font-size: 0.875rem; font-weight: 300; }
```

### Componentes de Interface

**Botões:**
```css
.btn-primary {
  background: linear-gradient(135deg, #6B46C1, #D946EF);
  border-radius: 12px;
  padding: 12px 24px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(107, 70, 193, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(107, 70, 193, 0.6);
}
```

**Cards:**
```css
.card-player {
  background: linear-gradient(145deg, #1F2937, #374151);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(107, 70, 193, 0.3);
  transition: all 0.3s ease;
}

.card-player:hover {
  border-color: #6B46C1;
  transform: scale(1.02);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
}
```

### Animações e Transições

**Animações de Entrada:**
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes glow {
  0%, 100% { text-shadow: 0 0 20px #6B46C1; }
  50% { text-shadow: 0 0 30px #D946EF, 0 0 40px #D946EF; }
}
```

**Sistema de Partículas:**
- Canvas HTML5 para partículas animadas
- Movimento suave com easing
- Interação com cursor (opcional)
- Performance otimizada para mobile

## Error Handling

### Estratégias de Tratamento de Erro

**1. Erros de API:**
```javascript
class APIErrorHandler {
  handleError(error) {
    switch(error.type) {
      case 'NETWORK_ERROR':
        return this.fallbackToCache();
      case 'RATE_LIMIT':
        return this.scheduleRetry();
      case 'INVALID_DATA':
        return this.useMockData();
      default:
        return this.showUserFriendlyMessage();
    }
  }
}
```

**2. Erros de Validação:**
- Validação em tempo real de formulários
- Mensagens contextuais e específicas
- Prevenção de estados inválidos
- Feedback visual imediato

**3. Erros de Conectividade:**
- Detecção de status offline/online
- Cache inteligente de dados
- Sincronização automática
- Indicadores visuais de status

## Testing Strategy

### Testes Unitários
- Componentes de interface isolados
- Lógica de negócio (cálculos, validações)
- Utilitários e helpers
- Cobertura mínima de 80%

### Testes de Integração
- Fluxos completos de usuário
- Integração com APIs
- Persistência de dados
- Sincronização offline/online

### Testes de Interface
- Responsividade em diferentes dispositivos
- Acessibilidade (WCAG 2.1)
- Performance de animações
- Usabilidade em cenários reais

### Testes de Performance
- Tempo de carregamento inicial
- Fluidez de animações (60fps)
- Uso de memória
- Consumo de bateria

**Ferramentas Sugeridas:**
- Jest para testes unitários
- Cypress para testes E2E
- Lighthouse para performance
- axe-core para acessibilidade

### Métricas de Qualidade
- Taxa de conversão > 70%
- Tempo médio de sessão > 3 minutos
- Performance Score > 90 (Lighthouse)
- Acessibilidade Score > 95
- Tempo de carregamento < 3 segundos