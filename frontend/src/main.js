// Importar CSS
import './styles.css';

// Importar componentes
import './components/Button.js';
import './components/PlayerCard.js';
import './components/Input.js';
import './components/Loading.js';
import './components/ParticleSystem.js';

// Importar serviços
import './services/api.js';

// Configuração principal do FutBoss
document.addEventListener('alpine:init', () => {
    Alpine.data('futbossApp', () => ({
        // Estado da aplicação
        loading: true,
        currentScreen: '',
        user: null,
        isAuthenticated: false,
        showRegister: false,
        errorMessage: '',

        // Estado da criação de time
        teamCreation: {
            step: 1, // 1: Nome e formação, 2: Seleção de jogadores, 3: Revisão
            teamName: '',
            formation: '4-4-2',
            selectedPlayers: [],
            availablePlayers: [],
            budget: 100000000, // 100M
            usedBudget: 0,
            filters: {
                position: '',
                search: '',
                minValue: '',
                maxValue: '',
                sortBy: 'currentScore',
                sortOrder: 'desc'
            },
            loading: false
        },

        // Inicialização da aplicação
        init() {
            console.log('🚀 FutBoss iniciando...');
            this.initializeApp();
        },

        async initializeApp() {
            try {
                // Simular carregamento inicial
                await this.delay(2000);
                
                // Verificar se usuário está logado
                await this.checkAuthStatus();
                
                // Carregar tela inicial apropriada
                if (this.isAuthenticated) {
                    this.loadWelcomeScreen();
                } else {
                    this.loadLoginScreen();
                }
                
                this.loading = false;
                console.log('✅ FutBoss carregado com sucesso!');
            } catch (error) {
                console.error('❌ Erro ao inicializar FutBoss:', error);
                this.loading = false;
            }
        },

        // Verificar status de autenticação
        async checkAuthStatus() {
            const token = localStorage.getItem('futboss_token');
            if (token) {
                try {
                    // Verificar token com backend
                    const response = await window.ApiService.verifyToken();
                    
                    if (response.success && response.data.user) {
                        this.user = response.data.user;
                        this.isAuthenticated = true;
                        
                        // Atualizar dados salvos
                        localStorage.setItem('futboss_user', JSON.stringify(response.data.user));
                        if (response.data.preferences) {
                            localStorage.setItem('futboss_preferences', JSON.stringify(response.data.preferences));
                        }
                    } else {
                        this.logout();
                    }
                } catch (error) {
                    console.error('Erro ao verificar autenticação:', error);
                    this.logout();
                }
            }
        },

        // Carregar tela de login
        loadLoginScreen() {
            this.currentScreen = `
                <div class="min-h-screen flex items-center justify-center p-4">
                    <div class="w-full max-w-md">
                        <div class="text-center mb-8">
                            <h1 class="text-4xl font-bold text-glow mb-2 animate-float">FutBoss</h1>
                            <p class="text-gray-300">Seja o chefe do seu time dos sonhos</p>
                        </div>
                        
                        <div class="bg-gradient-card rounded-2xl p-8 border border-futboss-purple/30 animate-fade-in-up">
                            <!-- Abas Login/Cadastro -->
                            <div class="flex mb-6 bg-futboss-gray-dark rounded-lg p-1">
                                <button @click="showRegister = false" 
                                        :class="!showRegister ? 'bg-futboss-purple text-white' : 'text-gray-400'"
                                        class="flex-1 py-2 px-4 rounded-md transition-all duration-200 font-medium">
                                    Login
                                </button>
                                <button @click="showRegister = true" 
                                        :class="showRegister ? 'bg-futboss-purple text-white' : 'text-gray-400'"
                                        class="flex-1 py-2 px-4 rounded-md transition-all duration-200 font-medium">
                                    Cadastro
                                </button>
                            </div>

                            <!-- Formulário de Login -->
                            <form x-show="!showRegister" @submit.prevent="handleLogin" class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium mb-2 text-gray-300">E-mail ou Usuário</label>
                                    <input type="text" x-model="loginForm.email" 
                                           class="input-field w-full" 
                                           placeholder="Digite seu e-mail ou usuário"
                                           required>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium mb-2 text-gray-300">Senha</label>
                                    <input type="password" x-model="loginForm.password" 
                                           class="input-field w-full" 
                                           placeholder="Digite sua senha"
                                           required>
                                </div>
                                
                                <button type="submit" class="btn-primary w-full" :disabled="loading">
                                    <span x-show="!loading">🚀 Entrar</span>
                                    <span x-show="loading" class="flex items-center justify-center">
                                        <div class="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                        Entrando...
                                    </span>
                                </button>
                            </form>

                            <!-- Formulário de Cadastro -->
                            <form x-show="showRegister" @submit.prevent="handleRegister" class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium mb-2 text-gray-300">E-mail</label>
                                    <input type="email" x-model="registerForm.email" 
                                           class="input-field w-full" 
                                           placeholder="Digite seu e-mail"
                                           required>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium mb-2 text-gray-300">Nome de Usuário</label>
                                    <input type="text" x-model="registerForm.username" 
                                           class="input-field w-full" 
                                           placeholder="Digite seu nome de usuário"
                                           required>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium mb-2 text-gray-300">Senha</label>
                                    <input type="password" x-model="registerForm.password" 
                                           class="input-field w-full" 
                                           placeholder="Digite sua senha"
                                           required>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium mb-2 text-gray-300">Confirmar Senha</label>
                                    <input type="password" x-model="registerForm.confirmPassword" 
                                           class="input-field w-full" 
                                           placeholder="Confirme sua senha"
                                           required>
                                </div>
                                
                                <button type="submit" class="btn-primary w-full" :disabled="loading">
                                    <span x-show="!loading">✨ Criar Conta</span>
                                    <span x-show="loading" class="flex items-center justify-center">
                                        <div class="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                        Criando...
                                    </span>
                                </button>
                            </form>
                            
                            <!-- Botão Convidado -->
                            <div class="mt-6 pt-4 border-t border-gray-600">
                                <button @click="loginAsGuest" 
                                        class="w-full text-futboss-blue-neon hover:text-white transition-colors py-2 font-medium"
                                        :disabled="loading">
                                    👤 Entrar como convidado
                                </button>
                            </div>

                            <!-- Mensagens de erro -->
                            <div x-show="errorMessage" 
                                 class="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm"
                                 x-text="errorMessage">
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        // Carregar tela de boas-vindas
        loadWelcomeScreen() {
            this.currentScreen = `
                <div class="min-h-screen relative overflow-hidden" id="welcome-screen">
                    <!-- Fundo com partículas -->
                    <div class="absolute inset-0 bg-gradient-main" id="particles-container">
                        <!-- Partículas serão inseridas aqui -->
                    </div>
                    
                    <!-- Overlay com gradiente -->
                    <div class="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40 z-5"></div>
                    
                    <!-- Conteúdo principal -->
                    <div class="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
                        <!-- Header com logo e saudação -->
                        <div class="text-center mb-12 animate-fade-in-up">
                            <div class="mb-6">
                                <h1 class="text-6xl md:text-7xl font-bold text-glow animate-float mb-4">
                                    FutBoss
                                </h1>
                                <div class="w-24 h-1 bg-gradient-to-r from-futboss-purple to-futboss-magenta mx-auto rounded-full"></div>
                            </div>
                            
                            <div class="space-y-2">
                                <p class="text-2xl md:text-3xl font-semibold text-white">
                                    Bem-vindo de volta, 
                                    <span class="gradient-text">${this.user?.username || 'Chefe'}</span>!
                                </p>
                                <p class="text-lg text-gray-300">
                                    ${this.user?.isGuest ? 'Modo Convidado' : 'Pronto para dominar o campo?'}
                                </p>
                            </div>
                        </div>
                        
                        <!-- Botões de ação -->
                        <div class="space-y-6 w-full max-w-md animate-fade-in-up" style="animation-delay: 0.3s">
                            <button @click="navigateToTeamCreation" 
                                    class="btn-primary w-full text-lg py-4 animate-pulse-glow group">
                                <div class="flex items-center justify-center space-x-3">
                                    <span class="text-2xl group-hover:scale-110 transition-transform">🏆</span>
                                    <span>Criar meu fantasy team</span>
                                </div>
                            </button>
                            
                            <button @click="navigateToRealTeamSelection" 
                                    class="btn-secondary w-full text-lg py-4 group">
                                <div class="flex items-center justify-center space-x-3">
                                    <span class="text-2xl group-hover:scale-110 transition-transform">⚽</span>
                                    <span>Selecionar time real</span>
                                </div>
                            </button>
                            
                            <!-- Botão Meu Time (se tiver time) -->
                            <button @click="navigateToMyTeam" 
                                    class="btn-ghost w-full text-lg py-4 group opacity-75 hover:opacity-100">
                                <div class="flex items-center justify-center space-x-3">
                                    <span class="text-2xl group-hover:scale-110 transition-transform">👥</span>
                                    <span>Meu Time</span>
                                </div>
                            </button>
                        </div>
                        
                        <!-- Stats do usuário (se não for convidado) -->
                        ${!this.user?.isGuest ? `
                            <div class="mt-12 animate-fade-in-up" style="animation-delay: 0.6s">
                                <div class="bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-futboss-purple/30">
                                    <div class="grid grid-cols-3 gap-6 text-center">
                                        <div>
                                            <div class="text-2xl font-bold text-futboss-magenta">0</div>
                                            <div class="text-sm text-gray-400">Times</div>
                                        </div>
                                        <div>
                                            <div class="text-2xl font-bold text-futboss-blue-neon">0</div>
                                            <div class="text-sm text-gray-400">Pontos</div>
                                        </div>
                                        <div>
                                            <div class="text-2xl font-bold text-futboss-orange">0</div>
                                            <div class="text-sm text-gray-400">Ranking</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                        
                        <!-- Footer -->
                        <footer class="absolute bottom-8 left-0 right-0 text-center animate-fade-in-up" style="animation-delay: 0.9s">
                            <div class="space-y-2">
                                <p class="text-futboss-blue-neon animate-pulse font-medium">
                                    ⚡ Seja o chefe do seu time dos sonhos! ⚡
                                </p>
                                <button @click="logout" 
                                        class="text-gray-400 hover:text-white transition-colors text-sm">
                                    Sair
                                </button>
                            </div>
                        </footer>
                    </div>
                </div>
            `;
            
            // Inicializar sistema de partículas após renderizar
            setTimeout(() => {
                this.initParticleSystem();
            }, 100);
        },

        // Dados dos formulários
        loginForm: {
            email: '',
            password: ''
        },

        registerForm: {
            email: '',
            username: '',
            password: '',
            confirmPassword: ''
        },

        // Manipular login
        async handleLogin() {
            try {
                console.log('Tentando fazer login...', this.loginForm);
                
                // Mostrar loading
                this.showLoading('Fazendo login...');
                
                // Fazer login via API
                const response = await window.ApiService.login({
                    emailOrUsername: this.loginForm.email,
                    password: this.loginForm.password
                });
                
                if (response.success) {
                    this.user = response.data.user;
                    this.isAuthenticated = true;
                    
                    // Salvar dados do usuário
                    localStorage.setItem('futboss_user', JSON.stringify(response.data.user));
                    if (response.data.preferences) {
                        localStorage.setItem('futboss_preferences', JSON.stringify(response.data.preferences));
                    }
                    
                    // Carregar tela de boas-vindas
                    this.loadWelcomeScreen();
                    
                    console.log('✅ Login realizado com sucesso!');
                } else {
                    throw new Error(response.message || 'Erro no login');
                }
                
            } catch (error) {
                console.error('❌ Erro no login:', error);
                this.showError(error.message || 'Erro ao fazer login. Verifique suas credenciais.');
            } finally {
                this.hideLoading();
            }
        },

        // Manipular registro
        async handleRegister() {
            try {
                console.log('Tentando registrar usuário...', this.registerForm);
                
                // Validar senhas
                if (this.registerForm.password !== this.registerForm.confirmPassword) {
                    this.showError('As senhas não conferem');
                    return;
                }
                
                // Mostrar loading
                this.showLoading('Criando conta...');
                
                // Registrar via API
                const response = await window.ApiService.register({
                    email: this.registerForm.email,
                    username: this.registerForm.username,
                    password: this.registerForm.password
                });
                
                if (response.success) {
                    this.user = response.data.user;
                    this.isAuthenticated = true;
                    
                    // Salvar dados do usuário
                    localStorage.setItem('futboss_user', JSON.stringify(response.data.user));
                    
                    // Carregar tela de boas-vindas
                    this.loadWelcomeScreen();
                    
                    console.log('✅ Registro realizado com sucesso!');
                } else {
                    throw new Error(response.message || 'Erro no registro');
                }
                
            } catch (error) {
                console.error('❌ Erro no registro:', error);
                this.showError(error.message || 'Erro ao criar conta. Tente novamente.');
            } finally {
                this.hideLoading();
            }
        },

        // Login como convidado
        async loginAsGuest() {
            try {
                console.log('Fazendo login como convidado...');
                
                // Mostrar loading
                this.showLoading('Entrando como convidado...');
                
                // Login como convidado via API
                const response = await window.ApiService.loginAsGuest();
                
                if (response.success) {
                    this.user = response.data.user;
                    this.isAuthenticated = true;
                    
                    // Salvar dados do usuário
                    localStorage.setItem('futboss_user', JSON.stringify(response.data.user));
                    
                    this.loadWelcomeScreen();
                    
                    console.log('✅ Login como convidado realizado!');
                } else {
                    throw new Error(response.message || 'Erro no login como convidado');
                }
                
            } catch (error) {
                console.error('❌ Erro no login como convidado:', error);
                this.showError(error.message || 'Erro ao entrar como convidado.');
            } finally {
                this.hideLoading();
            }
        },

        // Sistema de partículas
        particleSystem: null,

        initParticleSystem() {
            const container = document.getElementById('particles-container');
            if (container && !this.particleSystem) {
                this.particleSystem = new window.ParticleSystem(container, {
                    particleCount: 60,
                    particleSize: { min: 1, max: 4 },
                    particleSpeed: { min: 0.3, max: 1.5 },
                    connectionDistance: 120,
                    connectionOpacity: 0.15,
                    mouseInteraction: true,
                    mouseRadius: 200
                });
                console.log('🌟 Sistema de partículas inicializado');
            }
        },

        destroyParticleSystem() {
            if (this.particleSystem) {
                this.particleSystem.destroy();
                this.particleSystem = null;
            }
        },

        // Navegação
        navigateToTeamCreation() {
            console.log('Navegando para criação de time...');
            this.destroyParticleSystem();
            this.loadTeamCreationScreen();
        },

        navigateToRealTeamSelection() {
            console.log('Navegando para seleção de time real...');
            this.destroyParticleSystem();
            // TODO: Implementar tela de seleção de time real
            this.showComingSoon('Seleção de Time Real', 'Em breve você poderá escolher jogadores de times reais!');
        },

        navigateToMyTeam() {
            console.log('Navegando para meu time...');
            this.destroyParticleSystem();
            // TODO: Implementar tela do meu time
            this.showComingSoon('Meu Time', 'Em breve você poderá visualizar e gerenciar seu time!');
        },

        // Tela de criação de time
        loadTeamCreationScreen() {
            this.resetTeamCreation();
            this.currentScreen = `
                <div class="min-h-screen bg-gradient-main p-4">
                    <div class="max-w-6xl mx-auto">
                        <!-- Header -->
                        <div class="flex items-center justify-between mb-8">
                            <div class="flex items-center space-x-4">
                                <button @click="loadWelcomeScreen" 
                                        class="text-gray-400 hover:text-white transition-colors">
                                    ← Voltar
                                </button>
                                <h1 class="text-3xl font-bold text-white">Criar Fantasy Team</h1>
                            </div>
                            
                            <!-- Progress -->
                            <div class="flex items-center space-x-2">
                                <div class="flex space-x-2">
                                    <div :class="teamCreation.step >= 1 ? 'bg-futboss-purple' : 'bg-gray-600'" 
                                         class="w-3 h-3 rounded-full"></div>
                                    <div :class="teamCreation.step >= 2 ? 'bg-futboss-purple' : 'bg-gray-600'" 
                                         class="w-3 h-3 rounded-full"></div>
                                    <div :class="teamCreation.step >= 3 ? 'bg-futboss-purple' : 'bg-gray-600'" 
                                         class="w-3 h-3 rounded-full"></div>
                                </div>
                                <span class="text-gray-400 text-sm">Passo <span x-text="teamCreation.step"></span> de 3</span>
                            </div>
                        </div>

                        <!-- Step 1: Nome e Formação -->
                        <div x-show="teamCreation.step === 1" class="animate-fade-in-up">
                            <div class="max-w-2xl mx-auto">
                                <div class="bg-gradient-card rounded-2xl p-8 border border-futboss-purple/30">
                                    <h2 class="text-2xl font-bold text-white mb-6 text-center">
                                        🏆 Configure seu Time
                                    </h2>
                                    
                                    <div class="space-y-6">
                                        <div>
                                            <label class="block text-sm font-medium mb-2 text-gray-300">Nome do Time</label>
                                            <input type="text" x-model="teamCreation.teamName" 
                                                   class="input-field w-full" 
                                                   placeholder="Digite o nome do seu time"
                                                   maxlength="50">
                                        </div>
                                        
                                        <div>
                                            <label class="block text-sm font-medium mb-2 text-gray-300">Formação</label>
                                            <select x-model="teamCreation.formation" class="input-field w-full">
                                                <option value="4-4-2">4-4-2 (Clássica)</option>
                                                <option value="4-3-3">4-3-3 (Ofensiva)</option>
                                                <option value="3-5-2">3-5-2 (Meio-campo)</option>
                                                <option value="4-2-3-1">4-2-3-1 (Moderna)</option>
                                                <option value="5-3-2">5-3-2 (Defensiva)</option>
                                            </select>
                                        </div>
                                        
                                        <div class="bg-black/30 rounded-lg p-4">
                                            <h3 class="text-lg font-semibold text-white mb-2">Orçamento</h3>
                                            <div class="text-3xl font-bold text-futboss-magenta">
                                                €100M
                                            </div>
                                            <p class="text-gray-400 text-sm mt-1">
                                                Monte seu time dos sonhos com este orçamento
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div class="mt-8 flex justify-end">
                                        <button @click="nextStep" 
                                                :disabled="!teamCreation.teamName.trim()"
                                                class="btn-primary px-8 py-3">
                                            Próximo: Selecionar Jogadores →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Step 2: Seleção de Jogadores -->
                        <div x-show="teamCreation.step === 2" class="animate-fade-in-up">
                            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <!-- Filtros e Lista de Jogadores -->
                                <div class="lg:col-span-2">
                                    <div class="bg-gradient-card rounded-2xl p-6 border border-futboss-purple/30">
                                        <h2 class="text-xl font-bold text-white mb-4">Jogadores Disponíveis</h2>
                                        
                                        <!-- Filtros -->
                                        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                            <select x-model="teamCreation.filters.position" 
                                                    @change="loadPlayers"
                                                    class="input-field">
                                                <option value="">Todas as posições</option>
                                                <option value="GOALKEEPER">Goleiro</option>
                                                <option value="DEFENDER">Defensor</option>
                                                <option value="MIDFIELDER">Meio-campo</option>
                                                <option value="FORWARD">Atacante</option>
                                            </select>
                                            
                                            <input type="text" x-model="teamCreation.filters.search" 
                                                   @input="debounceLoadPlayers"
                                                   class="input-field" 
                                                   placeholder="Buscar jogador...">
                                            
                                            <select x-model="teamCreation.filters.sortBy" 
                                                    @change="loadPlayers"
                                                    class="input-field">
                                                <option value="currentScore">Pontuação</option>
                                                <option value="marketValue">Valor</option>
                                                <option value="name">Nome</option>
                                            </select>
                                            
                                            <select x-model="teamCreation.filters.sortOrder" 
                                                    @change="loadPlayers"
                                                    class="input-field">
                                                <option value="desc">Maior → Menor</option>
                                                <option value="asc">Menor → Maior</option>
                                            </select>
                                        </div>
                                        
                                        <!-- Lista de Jogadores -->
                                        <div class="space-y-4 max-h-96 overflow-y-auto" id="players-list">
                                            <div x-show="teamCreation.loading" class="text-center py-8">
                                                <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-futboss-purple mx-auto"></div>
                                                <p class="text-gray-400 mt-2">Carregando jogadores...</p>
                                            </div>
                                            
                                            <div x-show="!teamCreation.loading && teamCreation.availablePlayers.length === 0" 
                                                 class="text-center py-8 text-gray-400">
                                                Nenhum jogador encontrado
                                            </div>
                                            
                                            <!-- Jogadores serão inseridos aqui via JavaScript -->
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Meu Time -->
                                <div class="lg:col-span-1">
                                    <div class="bg-gradient-card rounded-2xl p-6 border border-futboss-purple/30 sticky top-4">
                                        <h2 class="text-xl font-bold text-white mb-4">
                                            <span x-text="teamCreation.teamName"></span>
                                        </h2>
                                        
                                        <!-- Orçamento -->
                                        <div class="mb-6">
                                            <div class="flex justify-between items-center mb-2">
                                                <span class="text-gray-300">Orçamento</span>
                                                <span class="text-white font-semibold" x-text="formatCurrency(teamCreation.budget - teamCreation.usedBudget)"></span>
                                            </div>
                                            <div class="w-full bg-gray-700 rounded-full h-2">
                                                <div class="bg-gradient-to-r from-futboss-purple to-futboss-magenta h-2 rounded-full transition-all duration-300"
                                                     :style="'width: ' + (teamCreation.usedBudget / teamCreation.budget * 100) + '%'"></div>
                                            </div>
                                            <div class="text-xs text-gray-400 mt-1">
                                                Usado: <span x-text="formatCurrency(teamCreation.usedBudget)"></span>
                                            </div>
                                        </div>
                                        
                                        <!-- Jogadores Selecionados -->
                                        <div class="space-y-2 mb-6 max-h-64 overflow-y-auto">
                                            <template x-for="player in teamCreation.selectedPlayers" :key="player.id">
                                                <div class="flex items-center justify-between bg-black/30 rounded-lg p-3">
                                                    <div class="flex-1 min-w-0">
                                                        <div class="text-white font-medium truncate" x-text="player.name"></div>
                                                        <div class="text-xs text-gray-400" x-text="getPositionText(player.position)"></div>
                                                    </div>
                                                    <div class="text-right ml-2">
                                                        <div class="text-sm text-futboss-blue-neon" x-text="formatCurrency(player.marketValue)"></div>
                                                        <button @click="removePlayerFromTeam(player)" 
                                                                class="text-red-400 hover:text-red-300 text-xs">
                                                            Remover
                                                        </button>
                                                    </div>
                                                </div>
                                            </template>
                                            
                                            <div x-show="teamCreation.selectedPlayers.length === 0" 
                                                 class="text-center py-8 text-gray-400">
                                                Nenhum jogador selecionado
                                            </div>
                                        </div>
                                        
                                        <!-- Botões -->
                                        <div class="space-y-3">
                                            <button @click="prevStep" class="btn-secondary w-full">
                                                ← Voltar
                                            </button>
                                            <button @click="nextStep" 
                                                    :disabled="teamCreation.selectedPlayers.length === 0"
                                                    class="btn-primary w-full">
                                                Revisar Time →
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Step 3: Revisão e Criação -->
                        <div x-show="teamCreation.step === 3" class="animate-fade-in-up">
                            <div class="max-w-4xl mx-auto">
                                <div class="bg-gradient-card rounded-2xl p-8 border border-futboss-purple/30">
                                    <h2 class="text-2xl font-bold text-white mb-6 text-center">
                                        ✅ Revisar seu Time
                                    </h2>
                                    
                                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <!-- Informações do Time -->
                                        <div>
                                            <h3 class="text-lg font-semibold text-white mb-4">Informações</h3>
                                            <div class="space-y-3">
                                                <div class="flex justify-between">
                                                    <span class="text-gray-300">Nome:</span>
                                                    <span class="text-white font-medium" x-text="teamCreation.teamName"></span>
                                                </div>
                                                <div class="flex justify-between">
                                                    <span class="text-gray-300">Formação:</span>
                                                    <span class="text-white font-medium" x-text="teamCreation.formation"></span>
                                                </div>
                                                <div class="flex justify-between">
                                                    <span class="text-gray-300">Jogadores:</span>
                                                    <span class="text-white font-medium" x-text="teamCreation.selectedPlayers.length"></span>
                                                </div>
                                                <div class="flex justify-between">
                                                    <span class="text-gray-300">Valor Total:</span>
                                                    <span class="text-futboss-magenta font-bold" x-text="formatCurrency(teamCreation.usedBudget)"></span>
                                                </div>
                                                <div class="flex justify-between">
                                                    <span class="text-gray-300">Orçamento Restante:</span>
                                                    <span class="text-futboss-blue-neon font-bold" x-text="formatCurrency(teamCreation.budget - teamCreation.usedBudget)"></span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <!-- Lista de Jogadores -->
                                        <div>
                                            <h3 class="text-lg font-semibold text-white mb-4">Elenco</h3>
                                            <div class="space-y-2 max-h-64 overflow-y-auto">
                                                <template x-for="player in teamCreation.selectedPlayers" :key="player.id">
                                                    <div class="flex items-center justify-between bg-black/30 rounded-lg p-3">
                                                        <div class="flex items-center space-x-3">
                                                            <div class="w-8 h-8 bg-futboss-purple rounded-full flex items-center justify-center text-xs font-bold">
                                                                <span x-text="getPositionAbbr(player.position)"></span>
                                                            </div>
                                                            <div>
                                                                <div class="text-white font-medium" x-text="player.name"></div>
                                                                <div class="text-xs text-gray-400" x-text="player.currentTeam"></div>
                                                            </div>
                                                        </div>
                                                        <div class="text-right">
                                                            <div class="text-sm text-futboss-blue-neon" x-text="formatCurrency(player.marketValue)"></div>
                                                            <div class="text-xs text-gray-400">Nota: <span x-text="player.currentScore.toFixed(1)"></span></div>
                                                        </div>
                                                    </div>
                                                </template>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="mt-8 flex justify-between">
                                        <button @click="prevStep" class="btn-secondary px-8 py-3">
                                            ← Voltar
                                        </button>
                                        <button @click="createTeam" 
                                                :disabled="teamCreation.loading"
                                                class="btn-primary px-8 py-3">
                                            <span x-show="!teamCreation.loading">🏆 Criar Time</span>
                                            <span x-show="teamCreation.loading" class="flex items-center">
                                                <div class="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                                Criando...
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Carregar jogadores iniciais
            setTimeout(() => {
                this.loadPlayers();
            }, 100);
        },

        // Tela temporária "Em breve"
        showComingSoon(title, message) {
            this.currentScreen = `
                <div class="min-h-screen flex items-center justify-center p-4 bg-gradient-main">
                    <div class="text-center max-w-md">
                        <div class="mb-8">
                            <div class="text-6xl mb-4">🚧</div>
                            <h2 class="text-3xl font-bold text-white mb-4">${title}</h2>
                            <p class="text-gray-300 mb-8">${message}</p>
                        </div>
                        
                        <div class="space-y-4">
                            <button @click="loadWelcomeScreen" class="btn-primary w-full">
                                🏠 Voltar ao Início
                            </button>
                            
                            <div class="text-sm text-gray-400">
                                <p>Funcionalidade em desenvolvimento</p>
                                <p class="text-futboss-blue-neon">Próximas tarefas: 9, 11-21</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        // Logout
        async logout() {
            try {
                // Mostrar loading
                this.showLoading('Saindo...');
                
                // Fazer logout via API
                await window.ApiService.logout();
            } catch (error) {
                console.warn('Erro no logout:', error);
            } finally {
                // Limpar sistema de partículas
                this.destroyParticleSystem();
                
                // Limpar estado local
                this.user = null;
                this.isAuthenticated = false;
                this.showRegister = false;
                localStorage.removeItem('futboss_user');
                localStorage.removeItem('futboss_preferences');
                this.clearForms();
                this.hideLoading();
                this.loadLoginScreen();
                console.log('👋 Logout realizado');
            }
        },

        // Utilitários
        delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        },

        showLoading(message = 'Carregando...') {
            this.loading = true;
            this.errorMessage = '';
        },

        hideLoading() {
            this.loading = false;
        },

        showError(message) {
            this.errorMessage = message;
            setTimeout(() => {
                this.errorMessage = '';
            }, 5000);
        },

        clearForms() {
            this.loginForm = { email: '', password: '' };
            this.registerForm = { email: '', username: '', password: '', confirmPassword: '' };
        },

        // Funções da criação de time
        resetTeamCreation() {
            this.teamCreation = {
                step: 1,
                teamName: '',
                formation: '4-4-2',
                selectedPlayers: [],
                availablePlayers: [],
                budget: 100000000,
                usedBudget: 0,
                filters: {
                    position: '',
                    search: '',
                    minValue: '',
                    maxValue: '',
                    sortBy: 'currentScore',
                    sortOrder: 'desc'
                },
                loading: false
            };
        },

        nextStep() {
            if (this.teamCreation.step < 3) {
                this.teamCreation.step++;
            }
        },

        prevStep() {
            if (this.teamCreation.step > 1) {
                this.teamCreation.step--;
            }
        },

        async loadPlayers() {
            try {
                this.teamCreation.loading = true;
                
                const filters = {
                    ...this.teamCreation.filters,
                    limit: 50
                };
                
                // Remover filtros vazios
                Object.keys(filters).forEach(key => {
                    if (!filters[key]) delete filters[key];
                });
                
                const response = await window.ApiService.getPlayers(filters);
                
                if (response.success) {
                    this.teamCreation.availablePlayers = response.data.players;
                    this.renderPlayersList();
                }
                
            } catch (error) {
                console.error('Erro ao carregar jogadores:', error);
                this.showError('Erro ao carregar jogadores');
            } finally {
                this.teamCreation.loading = false;
            }
        },

        debounceLoadPlayers() {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                this.loadPlayers();
            }, 500);
        },

        renderPlayersList() {
            const container = document.getElementById('players-list');
            if (!container) return;
            
            // Limpar loading e mensagens
            const loadingElements = container.querySelectorAll('.animate-spin, .text-center');
            loadingElements.forEach(el => el.remove());
            
            // Renderizar jogadores
            this.teamCreation.availablePlayers.forEach(player => {
                const isSelected = this.teamCreation.selectedPlayers.some(p => p.id === player.id);
                const canAfford = (this.teamCreation.usedBudget + player.marketValue) <= this.teamCreation.budget;
                
                const playerCard = window.PlayerCard.create(player, {
                    selectable: !isSelected && canAfford,
                    selected: isSelected,
                    size: 'sm',
                    onSelect: (playerData) => {
                        if (!isSelected && canAfford) {
                            this.addPlayerToTeam(playerData);
                        }
                    },
                    onView: (playerData) => {
                        this.showPlayerDetails(playerData);
                    }
                });
                
                // Adicionar indicador de orçamento
                if (!canAfford && !isSelected) {
                    playerCard.classList.add('opacity-50');
                    const budgetWarning = document.createElement('div');
                    budgetWarning.className = 'absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded';
                    budgetWarning.textContent = 'Sem orçamento';
                    playerCard.querySelector('.player-card-inner').appendChild(budgetWarning);
                }
                
                container.appendChild(playerCard);
            });
        },

        addPlayerToTeam(player) {
            const newUsedBudget = this.teamCreation.usedBudget + player.marketValue;
            
            if (newUsedBudget > this.teamCreation.budget) {
                this.showError('Orçamento insuficiente para este jogador');
                return;
            }
            
            if (this.teamCreation.selectedPlayers.some(p => p.id === player.id)) {
                this.showError('Jogador já está no time');
                return;
            }
            
            this.teamCreation.selectedPlayers.push(player);
            this.teamCreation.usedBudget = newUsedBudget;
            
            // Re-renderizar lista para atualizar estados
            this.renderPlayersList();
        },

        removePlayerFromTeam(player) {
            const index = this.teamCreation.selectedPlayers.findIndex(p => p.id === player.id);
            if (index > -1) {
                this.teamCreation.selectedPlayers.splice(index, 1);
                this.teamCreation.usedBudget -= player.marketValue;
                
                // Re-renderizar lista para atualizar estados
                this.renderPlayersList();
            }
        },

        async createTeam() {
            try {
                this.teamCreation.loading = true;
                
                const teamData = {
                    name: this.teamCreation.teamName,
                    formation: this.teamCreation.formation,
                    players: this.teamCreation.selectedPlayers.map(player => ({
                        playerId: player.id,
                        position: player.position
                    }))
                };
                
                const response = await window.ApiService.createFantasyTeam(teamData);
                
                if (response.success) {
                    this.showSuccess('Time criado com sucesso!');
                    setTimeout(() => {
                        this.loadWelcomeScreen();
                    }, 2000);
                } else {
                    throw new Error(response.message || 'Erro ao criar time');
                }
                
            } catch (error) {
                console.error('Erro ao criar time:', error);
                this.showError(error.message || 'Erro ao criar time');
            } finally {
                this.teamCreation.loading = false;
            }
        },

        showPlayerDetails(player) {
            // TODO: Implementar modal de detalhes do jogador
            alert(`Detalhes de ${player.name}\nPosição: ${this.getPositionText(player.position)}\nTime: ${player.currentTeam}\nValor: ${this.formatCurrency(player.marketValue)}\nNota: ${player.currentScore.toFixed(1)}`);
        },

        showSuccess(message) {
            // Criar notificação de sucesso
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-up';
            notification.textContent = message;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 3000);
        },

        // Utilitários
        formatCurrency(value) {
            if (value >= 1000000) {
                return `€${(value / 1000000).toFixed(1)}M`;
            } else if (value >= 1000) {
                return `€${(value / 1000).toFixed(0)}K`;
            }
            return `€${value}`;
        },

        getPositionText(position) {
            const positions = {
                'GOALKEEPER': 'Goleiro',
                'DEFENDER': 'Defensor',
                'MIDFIELDER': 'Meio-campo',
                'FORWARD': 'Atacante'
            };
            return positions[position] || position;
        },

        getPositionAbbr(position) {
            const positions = {
                'GOALKEEPER': 'GOL',
                'DEFENDER': 'DEF',
                'MIDFIELDER': 'MEI',
                'FORWARD': 'ATA'
            };
            return positions[position] || position;
        }
    }));
});

// Inicializar sistema de partículas (placeholder)
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 FutBoss - Fantasy Game de Futebol');
    console.log('⚽ Versão 1.0.0 - MVP');
    
    // TODO: Implementar sistema de partículas animadas
    // TODO: Adicionar service worker para PWA
    // TODO: Implementar sistema de notificações
});