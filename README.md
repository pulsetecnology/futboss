# FutBoss - Fantasy Game de Futebol

## 📱 Sobre o Projeto

FutBoss é um aplicativo mobile-first de fantasy game de futebol onde o usuário assume o papel de "chefe" de um time, gerenciando jogadores, comissão técnica e orçamento. A experiência é individualizada com sistema de login único e utiliza dados reais de desempenho através de APIs como SofaScore.

## 🎯 Características Principais

- **Mobile-First**: Interface otimizada para dispositivos móveis
- **Fantasy Game**: Crie e gerencie seu próprio time de futebol
- **Dados Reais**: Integração com APIs de estatísticas esportivas
- **Gamificação**: Experiência visual moderna com elementos fantasy
- **Multiplataforma**: Funciona em web e mobile

## 🛠️ Tecnologias

### Frontend
- **Tailwind CSS** - Estilização e design system
- **Alpine.js/Vue.js** - Interatividade e reatividade
- **HTML5/CSS3** - Estrutura e animações

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Prisma ORM** - Modelagem e queries do banco
- **PostgreSQL** - Banco de dados (Railway)
- **JWT** - Autenticação

### APIs Externas
- **SofaScore API** - Dados de jogadores e estatísticas
- **Fallback** - Sistema com dados mockados

## 🎨 Design

- **Paleta**: Roxo, magenta, azul neon, laranja vibrante
- **Estilo**: Fantasy games modernos
- **Animações**: Transições suaves, partículas, efeitos glow
- **UX**: Interface intuitiva e responsiva

## 📋 Funcionalidades

### Telas Principais
1. **Login/Cadastro** - Autenticação de usuários
2. **Boas-vindas** - Tela inicial com animações
3. **Criação de Time** - Monte seu time fantasy
4. **Seleção de Times Reais** - Escolha jogadores de clubes reais
5. **Meu Time** - Visualize e gerencie sua escalação

### Recursos
- Sistema de orçamento para contratações
- Pontuação baseada em performance real
- Filtros por posição e valor
- Escalação visual interativa
- Histórico de pontuações

## 🗂️ Estrutura do Projeto

```
futboss/
├── .kiro/specs/futboss-fantasy-game/
│   ├── requirements.md    # Requisitos detalhados
│   ├── design.md         # Arquitetura e design
│   └── tasks.md          # Plano de implementação
├── frontend/             # Aplicação frontend
├── backend/              # API e servidor
├── prisma/              # Schema e migrações
└── docs/                # Documentação
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- PostgreSQL (Railway)
- Git

### Instalação Local
```bash
# Clone o repositório
git clone https://github.com/pulsetecnology/futboss.git
cd futboss

# Instale todas as dependências
npm run install:all

# Configure as variáveis de ambiente
cp backend/.env.example backend/.env

# Execute as migrações do banco
npm run prisma:migrate

# Popule o banco com dados iniciais
npm run prisma:seed

# Inicie o servidor de desenvolvimento
npm run dev
```

### Deploy no Railway

O projeto está configurado para deploy automático no Railway:

1. **Conecte o repositório** no painel do Railway
2. **Configure as variáveis de ambiente** (veja `railway.env.example`)
3. **Deploy automático** acontece a cada push na branch `main`

```bash
# Deploy manual usando scripts
./scripts/deploy.sh        # Linux/Mac
./scripts/deploy.ps1       # Windows PowerShell

# Ou simplesmente
git push origin main
```

**URLs após deploy:**
- App: `https://your-app.railway.app`
- Health Check: `https://your-app.railway.app/health`
- API: `https://your-app.railway.app/api/health`

## 📊 Métricas de Sucesso

- Taxa de conversão de criação de time > 70%
- Tempo médio de sessão > 3 minutos
- Retenção de usuários com login único
- Performance Score > 90 (Lighthouse)

## 🎮 Roadmap

- [x] Especificações e design
- [ ] Setup inicial do projeto
- [ ] Configuração do banco de dados
- [ ] Sistema de autenticação
- [ ] Telas principais
- [ ] Integração com APIs
- [ ] Testes e otimizações
- [ ] Deploy e publicação

## 📝 Documentação

A documentação completa está disponível na pasta `.kiro/specs/`:
- [Requisitos](/.kiro/specs/futboss-fantasy-game/requirements.md)
- [Design e Arquitetura](/.kiro/specs/futboss-fantasy-game/design.md)
- [Plano de Implementação](/.kiro/specs/futboss-fantasy-game/tasks.md)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**André Silva**
- Versão: 1.0
- Data: 02/08/2025

---

⚽ **FutBoss** - Seja o chefe do seu time dos sonhos!