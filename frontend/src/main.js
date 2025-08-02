// Importar CSS
import './styles.css';

// Configuração principal do FutBoss
document.addEventListener('alpine:init', () => {
    Alpine.data('futbossApp', () => ({
        // Estado da aplicação
        loading: true,
        currentScreen: '',
        user: null,
        isAuthenticated: false,

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
                    // TODO: Validar token com backend
                    const userData = localStorage.getItem('futboss_user');
                    if (userData) {
                        this.user = JSON.parse(userData);
                        this.isAuthenticated = true;
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
                            <h1 class="text-4xl font-bold text-glow mb-2">FutBoss</h1>
                            <p class="text-gray-300">Seja o chefe do seu time dos sonhos</p>
                        </div>
                        
                        <div class="bg-gradient-card rounded-2xl p-8 border border-futboss-purple/30">
                            <form @submit.prevent="handleLogin">
                                <div class="mb-6">
                                    <label class="block text-sm font-medium mb-2">E-mail ou Usuário</label>
                                    <input type="text" x-model="loginForm.email" 
                                           class="input-field w-full" 
                                           placeholder="Digite seu e-mail ou usuário"
                                           required>
                                </div>
                                
                                <div class="mb-6">
                                    <label class="block text-sm font-medium mb-2">Senha</label>
                                    <input type="password" x-model="loginForm.password" 
                                           class="input-field w-full" 
                                           placeholder="Digite sua senha"
                                           required>
                                </div>
                                
                                <button type="submit" class="btn-primary w-full mb-4">
                                    Entrar
                                </button>
                                
                                <button type="button" @click="showRegister = true" 
                                        class="btn-secondary w-full mb-4">
                                    Cadastrar
                                </button>
                                
                                <button type="button" @click="loginAsGuest" 
                                        class="w-full text-futboss-blue-neon hover:text-white transition-colors">
                                    Entrar como convidado
                                </button>
                            </form>
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

        // Dados do formulário de login
        loginForm: {
            email: '',
            password: ''
        },

        // Manipular login
        async handleLogin() {
            try {
                console.log('Tentando fazer login...', this.loginForm);
                
                // TODO: Integrar com API do backend
                // Por enquanto, simular login bem-sucedido
                await this.delay(1000);
                
                const mockUser = {
                    id: '1',
                    username: this.loginForm.email,
                    email: this.loginForm.email
                };
                
                this.user = mockUser;
                this.isAuthenticated = true;
                
                // Salvar no localStorage
                localStorage.setItem('futboss_token', 'mock_token_123');
                localStorage.setItem('futboss_user', JSON.stringify(mockUser));
                
                // Carregar tela de boas-vindas
                this.loadWelcomeScreen();
                
                console.log('✅ Login realizado com sucesso!');
            } catch (error) {
                console.error('❌ Erro no login:', error);
                alert('Erro ao fazer login. Tente novamente.');
            }
        },

        // Login como convidado
        async loginAsGuest() {
            try {
                console.log('Fazendo login como convidado...');
                
                const guestUser = {
                    id: 'guest',
                    username: 'Convidado',
                    email: 'guest@futboss.app',
                    isGuest: true
                };
                
                this.user = guestUser;
                this.isAuthenticated = true;
                
                // Salvar no localStorage (temporário)
                localStorage.setItem('futboss_user', JSON.stringify(guestUser));
                
                this.loadWelcomeScreen();
                
                console.log('✅ Login como convidado realizado!');
            } catch (error) {
                console.error('❌ Erro no login como convidado:', error);
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
        logout() {
            this.user = null;
            this.isAuthenticated = false;
            localStorage.removeItem('futboss_token');
            localStorage.removeItem('futboss_user');
            this.loadLoginScreen();
            console.log('👋 Logout realizado');
        },

        // Utilitário para delay
        delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
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