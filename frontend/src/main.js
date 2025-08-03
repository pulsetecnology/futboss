// Importar CSS
import './styles.css';

// Importar componentes
import './components/Button.js';
import './components/PlayerCard.js';
import './components/Input.js';
import './components/Loading.js';

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
                <div class="min-h-screen relative overflow-hidden">
                    <!-- Fundo com partículas (placeholder) -->
                    <div class="absolute inset-0 bg-gradient-main">
                        <div class="particles-container"></div>
                    </div>
                    
                    <!-- Conteúdo principal -->
                    <div class="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
                        <div class="text-center mb-12">
                            <h1 class="text-6xl font-bold text-glow animate-float mb-4">FutBoss</h1>
                            <p class="text-xl text-gray-300 mb-8">Bem-vindo de volta, ${this.user?.username || 'Chefe'}!</p>
                        </div>
                        
                        <div class="space-y-6 w-full max-w-md">
                            <button @click="navigateToTeamCreation" 
                                    class="btn-primary w-full text-lg py-4 animate-pulse-glow">
                                🏆 Criar meu fantasy team
                            </button>
                            
                            <button @click="navigateToRealTeamSelection" 
                                    class="btn-secondary w-full text-lg py-4">
                                ⚽ Selecionar time real
                            </button>
                        </div>
                        
                        <footer class="absolute bottom-8 text-center">
                            <p class="text-futboss-blue-neon animate-pulse">
                                ⚡ Seja o chefe do seu time dos sonhos! ⚡
                            </p>
                        </footer>
                    </div>
                </div>
            `;
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

        // Navegação
        navigateToTeamCreation() {
            console.log('Navegando para criação de time...');
            // TODO: Implementar tela de criação de time
            alert('Tela de criação de time em desenvolvimento!');
        },

        navigateToRealTeamSelection() {
            console.log('Navegando para seleção de time real...');
            // TODO: Implementar tela de seleção de time real
            alert('Tela de seleção de time real em desenvolvimento!');
        },

        // Logout
        async logout() {
            try {
                // Fazer logout via API
                await window.ApiService.logout();
            } catch (error) {
                console.warn('Erro no logout:', error);
            } finally {
                // Limpar estado local
                this.user = null;
                this.isAuthenticated = false;
                localStorage.removeItem('futboss_user');
                localStorage.removeItem('futboss_preferences');
                this.clearForms();
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