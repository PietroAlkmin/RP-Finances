/**
 * Gerenciador de preferências do usuário para o dashboard financeiro
 * Permite que o usuário personalize a aparência e o comportamento do dashboard
 */

const UserPreferences = {
    // Preferências padrão
    defaults: {
        theme: 'light',                // Tema (light, dark)
        refreshInterval: 60,           // Intervalo de atualização em segundos
        showVolatility: true,          // Mostrar volatilidade
        defaultCurrency: 'BRL',        // Moeda padrão
        favoriteStocks: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'PETR4.SA'],  // Ações favoritas
        favoriteIndices: ['^GSPC', '^BVSP'],  // Índices favoritos
        newsLanguage: 'pt',            // Idioma das notícias
        chartType: 'bar',              // Tipo de gráfico padrão
        dataDisplayMode: 'table',      // Modo de exibição de dados (table, cards)
    },
    
    // Preferências atuais
    current: {},
    
    /**
     * Inicializa as preferências do usuário
     */
    init: function() {
        // Carregar preferências salvas ou usar padrões
        this.loadPreferences();
        
        // Configurar painel de preferências
        this.setupPreferencesPanel();
        
        // Aplicar preferências
        this.applyPreferences();
    },
    
    /**
     * Carrega as preferências do usuário do localStorage
     */
    loadPreferences: function() {
        try {
            const savedPrefs = localStorage.getItem('dashboard_preferences');
            
            if (savedPrefs) {
                this.current = JSON.parse(savedPrefs);
                console.log('Preferências carregadas:', this.current);
            } else {
                // Usar preferências padrão se não houver salvas
                this.current = { ...this.defaults };
                console.log('Usando preferências padrão');
            }
        } catch (error) {
            console.warn('Erro ao carregar preferências:', error);
            this.current = { ...this.defaults };
        }
    },
    
    /**
     * Salva as preferências do usuário no localStorage
     */
    savePreferences: function() {
        try {
            localStorage.setItem('dashboard_preferences', JSON.stringify(this.current));
            console.log('Preferências salvas');
        } catch (error) {
            console.warn('Erro ao salvar preferências:', error);
        }
    },
    
    /**
     * Configura o painel de preferências
     */
    setupPreferencesPanel: function() {
        // Adicionar botão de preferências ao cabeçalho
        const header = document.querySelector('.header-actions');
        if (header) {
            const prefsButton = document.createElement('button');
            prefsButton.type = 'button';
            prefsButton.className = 'preferences-button';
            prefsButton.innerHTML = '<i class="fas fa-cog"></i>';
            prefsButton.title = 'Preferências';
            prefsButton.addEventListener('click', () => this.togglePreferencesPanel());
            header.appendChild(prefsButton);
        }
        
        // Criar painel de preferências se não existir
        if (!document.getElementById('preferences-panel')) {
            this.createPreferencesPanel();
        }
        
        // Configurar eventos para os controles
        this.setupPreferenceControls();
    },
    
    /**
     * Cria o painel de preferências
     */
    createPreferencesPanel: function() {
        const panel = document.createElement('div');
        panel.id = 'preferences-panel';
        panel.className = 'preferences-panel hidden';
        
        panel.innerHTML = `
            <div class="preferences-header">
                <h2>Preferências</h2>
                <button type="button" class="close-button" id="close-preferences">&times;</button>
            </div>
            <div class="preferences-content">
                <div class="preference-group">
                    <h3>Aparência</h3>
                    <div class="preference-item">
                        <label for="theme-select">Tema</label>
                        <select id="theme-select">
                            <option value="light">Claro</option>
                            <option value="dark">Escuro</option>
                        </select>
                    </div>
                    <div class="preference-item">
                        <label for="data-display-mode">Exibição de dados</label>
                        <select id="data-display-mode">
                            <option value="table">Tabela</option>
                            <option value="cards">Cartões</option>
                        </select>
                    </div>
                </div>
                
                <div class="preference-group">
                    <h3>Dados</h3>
                    <div class="preference-item">
                        <label for="refresh-interval">Intervalo de atualização (segundos)</label>
                        <input type="number" id="refresh-interval" min="30" max="300" step="10">
                    </div>
                    <div class="preference-item">
                        <label for="show-volatility">Mostrar volatilidade</label>
                        <input type="checkbox" id="show-volatility">
                    </div>
                    <div class="preference-item">
                        <label for="default-currency">Moeda padrão</label>
                        <select id="default-currency">
                            <option value="BRL">Real (R$)</option>
                            <option value="USD">Dólar (US$)</option>
                            <option value="EUR">Euro (€)</option>
                        </select>
                    </div>
                </div>
                
                <div class="preference-group">
                    <h3>Gráficos</h3>
                    <div class="preference-item">
                        <label for="chart-type">Tipo de gráfico padrão</label>
                        <select id="chart-type">
                            <option value="bar">Barras</option>
                            <option value="line">Linha</option>
                            <option value="pie">Pizza</option>
                        </select>
                    </div>
                </div>
                
                <div class="preference-group">
                    <h3>Notícias</h3>
                    <div class="preference-item">
                        <label for="news-language">Idioma das notícias</label>
                        <select id="news-language">
                            <option value="pt">Português</option>
                            <option value="en">Inglês</option>
                            <option value="all">Todos</option>
                        </select>
                    </div>
                </div>
                
                <div class="preference-actions">
                    <button type="button" id="reset-preferences" class="secondary-button">Restaurar padrões</button>
                    <button type="button" id="save-preferences" class="primary-button">Salvar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
    },
    
    /**
     * Configura os controles do painel de preferências
     */
    setupPreferenceControls: function() {
        // Botão de fechar
        const closeButton = document.getElementById('close-preferences');
        if (closeButton) {
            closeButton.addEventListener('click', () => this.togglePreferencesPanel(false));
        }
        
        // Botão de restaurar padrões
        const resetButton = document.getElementById('reset-preferences');
        if (resetButton) {
            resetButton.addEventListener('click', () => this.resetPreferences());
        }
        
        // Botão de salvar
        const saveButton = document.getElementById('save-preferences');
        if (saveButton) {
            saveButton.addEventListener('click', () => this.savePreferencesFromPanel());
        }
        
        // Preencher controles com valores atuais
        this.populatePreferenceControls();
    },
    
    /**
     * Preenche os controles do painel com os valores atuais
     */
    populatePreferenceControls: function() {
        // Tema
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            themeSelect.value = this.current.theme || this.defaults.theme;
        }
        
        // Intervalo de atualização
        const refreshInterval = document.getElementById('refresh-interval');
        if (refreshInterval) {
            refreshInterval.value = this.current.refreshInterval || this.defaults.refreshInterval;
        }
        
        // Mostrar volatilidade
        const showVolatility = document.getElementById('show-volatility');
        if (showVolatility) {
            showVolatility.checked = this.current.showVolatility !== undefined ? 
                this.current.showVolatility : this.defaults.showVolatility;
        }
        
        // Moeda padrão
        const defaultCurrency = document.getElementById('default-currency');
        if (defaultCurrency) {
            defaultCurrency.value = this.current.defaultCurrency || this.defaults.defaultCurrency;
        }
        
        // Tipo de gráfico
        const chartType = document.getElementById('chart-type');
        if (chartType) {
            chartType.value = this.current.chartType || this.defaults.chartType;
        }
        
        // Idioma das notícias
        const newsLanguage = document.getElementById('news-language');
        if (newsLanguage) {
            newsLanguage.value = this.current.newsLanguage || this.defaults.newsLanguage;
        }
        
        // Modo de exibição de dados
        const dataDisplayMode = document.getElementById('data-display-mode');
        if (dataDisplayMode) {
            dataDisplayMode.value = this.current.dataDisplayMode || this.defaults.dataDisplayMode;
        }
    },
    
    /**
     * Salva as preferências do painel
     */
    savePreferencesFromPanel: function() {
        // Tema
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            this.current.theme = themeSelect.value;
        }
        
        // Intervalo de atualização
        const refreshInterval = document.getElementById('refresh-interval');
        if (refreshInterval) {
            this.current.refreshInterval = parseInt(refreshInterval.value, 10);
        }
        
        // Mostrar volatilidade
        const showVolatility = document.getElementById('show-volatility');
        if (showVolatility) {
            this.current.showVolatility = showVolatility.checked;
        }
        
        // Moeda padrão
        const defaultCurrency = document.getElementById('default-currency');
        if (defaultCurrency) {
            this.current.defaultCurrency = defaultCurrency.value;
        }
        
        // Tipo de gráfico
        const chartType = document.getElementById('chart-type');
        if (chartType) {
            this.current.chartType = chartType.value;
        }
        
        // Idioma das notícias
        const newsLanguage = document.getElementById('news-language');
        if (newsLanguage) {
            this.current.newsLanguage = newsLanguage.value;
        }
        
        // Modo de exibição de dados
        const dataDisplayMode = document.getElementById('data-display-mode');
        if (dataDisplayMode) {
            this.current.dataDisplayMode = dataDisplayMode.value;
        }
        
        // Salvar preferências
        this.savePreferences();
        
        // Aplicar preferências
        this.applyPreferences();
        
        // Fechar painel
        this.togglePreferencesPanel(false);
        
        // Recarregar dados se necessário
        if (window.realtimeUpdater) {
            window.realtimeUpdater.updateSettings();
        }
    },
    
    /**
     * Restaura as preferências para os valores padrão
     */
    resetPreferences: function() {
        this.current = { ...this.defaults };
        this.populatePreferenceControls();
        this.savePreferences();
        this.applyPreferences();
    },
    
    /**
     * Alterna a visibilidade do painel de preferências
     * @param {boolean} [show] - Se definido, força o painel a mostrar (true) ou esconder (false)
     */
    togglePreferencesPanel: function(show) {
        const panel = document.getElementById('preferences-panel');
        if (panel) {
            if (show !== undefined) {
                panel.classList.toggle('hidden', !show);
            } else {
                panel.classList.toggle('hidden');
            }
        }
    },
    
    /**
     * Aplica as preferências atuais ao dashboard
     */
    applyPreferences: function() {
        // Aplicar tema
        document.body.classList.remove('theme-light', 'theme-dark');
        document.body.classList.add(`theme-${this.current.theme}`);
        
        // Aplicar modo de exibição de dados
        document.body.classList.remove('display-table', 'display-cards');
        document.body.classList.add(`display-${this.current.dataDisplayMode}`);
        
        // Aplicar visibilidade de volatilidade
        const volatilityElements = document.querySelectorAll('.volatility-data');
        volatilityElements.forEach(el => {
            el.classList.toggle('hidden', !this.current.showVolatility);
        });
        
        // Atualizar intervalo de atualização
        if (window.realtimeUpdater) {
            window.realtimeUpdater.setUpdateInterval(this.current.refreshInterval);
        }
        
        // Disparar evento de preferências aplicadas
        document.dispatchEvent(new CustomEvent('preferencesApplied', { 
            detail: { preferences: this.current } 
        }));
    },
    
    /**
     * Obtém uma preferência específica
     * @param {string} key - Chave da preferência
     * @returns {any} Valor da preferência ou valor padrão se não existir
     */
    get: function(key) {
        return this.current[key] !== undefined ? this.current[key] : this.defaults[key];
    },
    
    /**
     * Define uma preferência específica
     * @param {string} key - Chave da preferência
     * @param {any} value - Valor da preferência
     */
    set: function(key, value) {
        this.current[key] = value;
        this.savePreferences();
        this.applyPreferences();
    }
};
