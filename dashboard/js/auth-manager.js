/**
 * Gerenciador de autenticação para o dashboard financeiro
 * Implementa um sistema simples de autenticação baseado em localStorage
 */

const AuthManager = {
    // Chave para armazenar dados de autenticação no localStorage
    storageKey: 'dashboard_auth',
    
    // Usuário atual
    currentUser: null,
    
    // Estado de autenticação
    isAuthenticated: false,
    
    /**
     * Inicializa o gerenciador de autenticação
     */
    init: function() {
        // Verificar se há um usuário autenticado
        this.checkAuth();
        
        // Configurar eventos de autenticação
        this.setupAuthEvents();
    },
    
    /**
     * Verifica se há um usuário autenticado
     */
    checkAuth: function() {
        try {
            const authData = localStorage.getItem(this.storageKey);
            
            if (authData) {
                const userData = JSON.parse(authData);
                
                // Verificar se o token ainda é válido (não expirou)
                if (userData.expiry && userData.expiry > Date.now()) {
                    this.currentUser = userData;
                    this.isAuthenticated = true;
                    
                    console.log('Usuário autenticado:', this.currentUser.username);
                    
                    // Atualizar UI para usuário autenticado
                    this.updateAuthUI();
                    
                    // Disparar evento de autenticação
                    document.dispatchEvent(new CustomEvent('userAuthenticated', { 
                        detail: { user: this.currentUser } 
                    }));
                    
                    return true;
                } else {
                    // Token expirado, fazer logout
                    console.log('Sessão expirada');
                    this.logout();
                }
            }
        } catch (error) {
            console.warn('Erro ao verificar autenticação:', error);
        }
        
        // Não autenticado
        this.isAuthenticated = false;
        this.currentUser = null;
        
        // Atualizar UI para usuário não autenticado
        this.updateAuthUI();
        
        return false;
    },
    
    /**
     * Configura eventos de autenticação
     */
    setupAuthEvents: function() {
        // Adicionar botão de login/perfil ao cabeçalho
        const header = document.querySelector('.header-actions');
        if (header) {
            // Verificar se o botão já existe
            if (!document.getElementById('auth-button')) {
                const authButton = document.createElement('button');
                authButton.type = 'button';
                authButton.id = 'auth-button';
                authButton.className = 'auth-button';
                authButton.innerHTML = '<i class="fas fa-user"></i>';
                authButton.title = 'Login / Perfil';
                authButton.addEventListener('click', () => this.toggleAuthPanel());
                header.appendChild(authButton);
            }
        }
        
        // Criar painel de autenticação se não existir
        if (!document.getElementById('auth-panel')) {
            this.createAuthPanel();
        }
    },
    
    /**
     * Cria o painel de autenticação
     */
    createAuthPanel: function() {
        const panel = document.createElement('div');
        panel.id = 'auth-panel';
        panel.className = 'auth-panel hidden';
        
        // Conteúdo inicial (login ou perfil)
        this.updateAuthPanelContent(panel);
        
        document.body.appendChild(panel);
    },
    
    /**
     * Atualiza o conteúdo do painel de autenticação
     * @param {HTMLElement} panel - Elemento do painel (opcional)
     */
    updateAuthPanelContent: function(panel) {
        const authPanel = panel || document.getElementById('auth-panel');
        if (!authPanel) return;
        
        if (this.isAuthenticated) {
            // Painel de perfil para usuário autenticado
            authPanel.innerHTML = `
                <div class="auth-header">
                    <h2>Perfil do Usuário</h2>
                    <button type="button" class="close-button" id="close-auth">&times;</button>
                </div>
                <div class="auth-content">
                    <div class="user-profile">
                        <div class="user-avatar">
                            <i class="fas fa-user-circle"></i>
                        </div>
                        <div class="user-info">
                            <h3>${this.currentUser.username}</h3>
                            <p>${this.currentUser.email}</p>
                        </div>
                    </div>
                    
                    <div class="auth-actions">
                        <button type="button" id="logout-button" class="primary-button">Sair</button>
                    </div>
                </div>
            `;
            
            // Configurar evento de logout
            setTimeout(() => {
                const logoutButton = document.getElementById('logout-button');
                if (logoutButton) {
                    logoutButton.addEventListener('click', () => this.logout());
                }
                
                const closeButton = document.getElementById('close-auth');
                if (closeButton) {
                    closeButton.addEventListener('click', () => this.toggleAuthPanel(false));
                }
            }, 0);
        } else {
            // Painel de login para usuário não autenticado
            authPanel.innerHTML = `
                <div class="auth-header">
                    <h2>Login</h2>
                    <button type="button" class="close-button" id="close-auth">&times;</button>
                </div>
                <div class="auth-content">
                    <form id="login-form">
                        <div class="form-group">
                            <label for="username">Usuário</label>
                            <input type="text" id="username" name="username" required>
                        </div>
                        <div class="form-group">
                            <label for="password">Senha</label>
                            <input type="password" id="password" name="password" required>
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="remember-me" name="remember-me">
                                Lembrar de mim
                            </label>
                        </div>
                        <div id="login-error" class="error-message hidden"></div>
                        <div class="auth-actions">
                            <button type="submit" class="primary-button">Entrar</button>
                        </div>
                    </form>
                </div>
            `;
            
            // Configurar evento de login
            setTimeout(() => {
                const loginForm = document.getElementById('login-form');
                if (loginForm) {
                    loginForm.addEventListener('submit', (e) => {
                        e.preventDefault();
                        this.login();
                    });
                }
                
                const closeButton = document.getElementById('close-auth');
                if (closeButton) {
                    closeButton.addEventListener('click', () => this.toggleAuthPanel(false));
                }
            }, 0);
        }
    },
    
    /**
     * Atualiza a UI com base no estado de autenticação
     */
    updateAuthUI: function() {
        // Atualizar botão de autenticação
        const authButton = document.getElementById('auth-button');
        if (authButton) {
            if (this.isAuthenticated) {
                authButton.innerHTML = '<i class="fas fa-user-check"></i>';
                authButton.title = 'Perfil';
            } else {
                authButton.innerHTML = '<i class="fas fa-user"></i>';
                authButton.title = 'Login';
            }
        }
        
        // Atualizar conteúdo do painel de autenticação
        this.updateAuthPanelContent();
        
        // Atualizar classes no body
        if (this.isAuthenticated) {
            document.body.classList.add('user-authenticated');
            document.body.classList.remove('user-anonymous');
        } else {
            document.body.classList.add('user-anonymous');
            document.body.classList.remove('user-authenticated');
        }
    },
    
    /**
     * Alterna a visibilidade do painel de autenticação
     * @param {boolean} [show] - Se definido, força o painel a mostrar (true) ou esconder (false)
     */
    toggleAuthPanel: function(show) {
        const panel = document.getElementById('auth-panel');
        if (panel) {
            if (show !== undefined) {
                panel.classList.toggle('hidden', !show);
            } else {
                panel.classList.toggle('hidden');
            }
        }
    },
    
    /**
     * Realiza o login do usuário
     */
    login: function() {
        const username = document.getElementById('username')?.value;
        const password = document.getElementById('password')?.value;
        const rememberMe = document.getElementById('remember-me')?.checked;
        
        if (!username || !password) {
            this.showLoginError('Preencha todos os campos');
            return;
        }
        
        // Em um ambiente real, aqui seria feita uma chamada para a API de autenticação
        // Para este exemplo, vamos simular uma autenticação bem-sucedida
        
        // Simular validação de credenciais
        if (username === 'admin' && password === 'admin123') {
            // Criar dados do usuário
            const userData = {
                username: username,
                email: 'admin@example.com',
                token: 'simulated-jwt-token-' + Math.random().toString(36).substring(2),
                expiry: rememberMe ? Date.now() + (30 * 24 * 60 * 60 * 1000) : Date.now() + (1 * 60 * 60 * 1000) // 30 dias ou 1 hora
            };
            
            // Salvar dados de autenticação
            localStorage.setItem(this.storageKey, JSON.stringify(userData));
            
            // Atualizar estado
            this.currentUser = userData;
            this.isAuthenticated = true;
            
            // Atualizar UI
            this.updateAuthUI();
            
            // Fechar painel
            this.toggleAuthPanel(false);
            
            // Disparar evento de autenticação
            document.dispatchEvent(new CustomEvent('userAuthenticated', { 
                detail: { user: this.currentUser } 
            }));
            
            console.log('Login bem-sucedido:', username);
        } else {
            this.showLoginError('Usuário ou senha inválidos');
        }
    },
    
    /**
     * Realiza o logout do usuário
     */
    logout: function() {
        // Remover dados de autenticação
        localStorage.removeItem(this.storageKey);
        
        // Atualizar estado
        this.currentUser = null;
        this.isAuthenticated = false;
        
        // Atualizar UI
        this.updateAuthUI();
        
        // Fechar painel
        this.toggleAuthPanel(false);
        
        // Disparar evento de logout
        document.dispatchEvent(new CustomEvent('userLoggedOut'));
        
        console.log('Logout realizado');
    },
    
    /**
     * Mostra uma mensagem de erro no formulário de login
     * @param {string} message - Mensagem de erro
     */
    showLoginError: function(message) {
        const errorElement = document.getElementById('login-error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('hidden');
        }
    },
    
    /**
     * Verifica se o usuário está autenticado
     * @returns {boolean} - Verdadeiro se o usuário estiver autenticado
     */
    isUserAuthenticated: function() {
        return this.isAuthenticated;
    },
    
    /**
     * Obtém o usuário atual
     * @returns {Object|null} - Dados do usuário ou null se não estiver autenticado
     */
    getCurrentUser: function() {
        return this.currentUser;
    }
};
