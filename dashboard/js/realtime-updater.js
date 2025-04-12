/**
 * Módulo de atualização em tempo real para o dashboard financeiro
 * Responsável por atualizar os dados do dashboard automaticamente
 */

class RealtimeUpdater {
    constructor() {
        this.config = CONFIG;
        this.isEnabled = this.config.realtime.enabled;

        // Usar preferências do usuário se disponíveis
        const userRefreshInterval = UserPreferences.get('refreshInterval');
        this.marketDataInterval = userRefreshInterval ? userRefreshInterval * 1000 : this.config.realtime.marketDataInterval;

        this.newsInterval = this.config.realtime.newsInterval;
        this.retryInterval = this.config.realtime.retryInterval;
        this.maxRetries = this.config.realtime.maxRetries;

        this.marketDataTimer = null;
        this.newsTimer = null;
        this.retryCount = 0;

        this.lastMarketUpdate = null;
        this.lastNewsUpdate = null;

        // Adicionar listener para mudanças nas preferências
        document.addEventListener('preferencesApplied', (event) => {
            this.updateSettings(event.detail.preferences);
        });

        this.updateStatusDisplay();
    }

    /**
     * Inicializa a atualização em tempo real
     */
    init() {
        if (!this.isEnabled) {
            console.log('Atualização em tempo real desabilitada nas configurações');
            return;
        }

        console.log('Inicializando atualização em tempo real');
        this.startMarketDataUpdates();
        this.startNewsUpdates();

        // Atualizar o status no rodapé
        this.updateStatusDisplay();

        // Adicionar listener para pausar atualizações quando a página não estiver visível
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseUpdates();
            } else {
                this.resumeUpdates();
            }
        });
    }

    /**
     * Inicia a atualização periódica dos dados de mercado
     */
    startMarketDataUpdates() {
        // Executar imediatamente a primeira atualização
        this.updateMarketData();

        // Configurar timer para atualizações periódicas
        this.marketDataTimer = setInterval(() => {
            this.updateMarketData();
        }, this.marketDataInterval);

        console.log(`Atualizações de dados de mercado iniciadas (intervalo: ${this.marketDataInterval / 1000}s)`);
    }

    /**
     * Inicia a atualização periódica das notícias
     */
    startNewsUpdates() {
        // Executar imediatamente a primeira atualização
        this.updateNews();

        // Configurar timer para atualizações periódicas
        this.newsTimer = setInterval(() => {
            this.updateNews();
        }, this.newsInterval);

        console.log(`Atualizações de notícias iniciadas (intervalo: ${this.newsInterval / 1000}s)`);
    }

    /**
     * Atualiza os dados de mercado
     */
    async updateMarketData() {
        try {
            console.log('Atualizando dados de mercado...');

            // Verificar qual página está ativa para determinar quais dados atualizar
            const currentPage = this.getCurrentPage();

            if (currentPage === 'index' || currentPage === '') {
                // Atualizar dados da página principal
                await this.updateDashboardData();
            } else if (currentPage === 'best-assets') {
                // Atualizar dados da página de melhores ativos
                await this.updateBestAssetsData();
            }

            // Resetar contador de tentativas após sucesso
            this.retryCount = 0;
            this.lastMarketUpdate = new Date();
            this.updateStatusDisplay();

            console.log('Dados de mercado atualizados com sucesso');
        } catch (error) {
            console.error('Erro ao atualizar dados de mercado:', error);
            this.handleUpdateError('market');
        }
    }

    /**
     * Atualiza as notícias
     */
    async updateNews() {
        try {
            console.log('Atualizando notícias...');

            // Verificar se estamos na página de notícias
            const currentPage = this.getCurrentPage();

            if (currentPage === 'news') {
                // Atualizar dados da página de notícias
                await this.updateNewsData();
            } else {
                // Em outras páginas, apenas atualizar o resumo de notícias se existir
                const featuredNewsElement = document.getElementById('featured-news');
                if (featuredNewsElement) {
                    await this.updateFeaturedNews();
                }
            }

            // Resetar contador de tentativas após sucesso
            this.retryCount = 0;
            this.lastNewsUpdate = new Date();
            this.updateStatusDisplay();

            console.log('Notícias atualizadas com sucesso');
        } catch (error) {
            console.error('Erro ao atualizar notícias:', error);
            this.handleUpdateError('news');
        }
    }

    /**
     * Atualiza os dados do dashboard principal
     */
    async updateDashboardData() {
        // Verificar se o objeto dashboardData existe
        if (typeof dashboardData === 'undefined') {
            console.warn('Objeto dashboardData não encontrado');
            return;
        }

        // Recarregar dados
        await loadAllData();

        // Atualizar visualizações
        if (typeof updateCurrentDate === 'function') updateCurrentDate();
        if (typeof renderMarketSummary === 'function') renderMarketSummary();
        if (typeof renderIndicesTable === 'function') renderIndicesTable();
        if (typeof renderRegionsPerformance === 'function') renderRegionsPerformance();
        if (typeof renderSectorsPerformance === 'function') renderSectorsPerformance();
        if (typeof renderStocks === 'function') renderStocks();
        if (typeof renderCorrelations === 'function') renderCorrelations();
    }

    /**
     * Atualiza os dados da página de melhores ativos
     */
    async updateBestAssetsData() {
        // Verificar se o objeto bestAssetsData existe
        if (typeof bestAssetsData === 'undefined') {
            console.warn('Objeto bestAssetsData não encontrado');
            return;
        }

        // Obter filtros ativos
        const activePeriod = document.querySelector('.period-filter .filter-button.active').dataset.period;
        const activeType = document.querySelector('.asset-type-filter .filter-button.active').dataset.type;

        // Recarregar dados com filtros ativos
        await loadBestAssetsData(activePeriod, activeType);

        // Atualizar visualizações
        if (typeof updateCurrentDate === 'function') updateCurrentDate();
        if (typeof renderBestAssetsTable === 'function') renderBestAssetsTable();
        if (typeof renderBestAssetsChart === 'function') renderBestAssetsChart();
        if (typeof renderCategoryPerformance === 'function') renderCategoryPerformance();
    }

    /**
     * Atualiza os dados da página de notícias
     */
    async updateNewsData() {
        // Verificar se o objeto newsData existe
        if (typeof window.newsData === 'undefined') {
            console.warn('Objeto newsData não encontrado');
            return;
        }

        // Obter filtros ativos
        const activeSource = document.querySelector('.source-filter .filter-button.active').dataset.source;
        const activeLanguage = document.querySelector('.language-filter .filter-button.active').dataset.language;
        const activeTopic = document.querySelector('.topic-filter .filter-button.active').dataset.topic;

        // Recarregar dados com filtros ativos
        await window.loadNewsData(activeSource, activeLanguage, activeTopic);

        // Atualizar visualizações
        if (typeof updateCurrentDate === 'function') updateCurrentDate();
        if (typeof renderFeaturedNews === 'function') renderFeaturedNews();
        if (typeof renderNewsFeeds === 'function') renderNewsFeeds();
        if (typeof renderSentimentAnalysis === 'function') renderSentimentAnalysis();
    }

    /**
     * Atualiza apenas as notícias em destaque
     */
    async updateFeaturedNews() {
        // Implementação depende da estrutura específica da página
        if (typeof loadFeaturedNews === 'function') {
            await loadFeaturedNews();
            if (typeof renderFeaturedNews === 'function') renderFeaturedNews();
        }
    }

    /**
     * Trata erros de atualização
     */
    handleUpdateError(type) {
        this.retryCount++;

        if (this.retryCount <= this.maxRetries) {
            console.log(`Tentando novamente em ${this.retryInterval / 1000} segundos (tentativa ${this.retryCount} de ${this.maxRetries})`);

            // Tentar novamente após o intervalo de retry
            setTimeout(() => {
                if (type === 'market') {
                    this.updateMarketData();
                } else if (type === 'news') {
                    this.updateNews();
                }
            }, this.retryInterval);
        } else {
            console.error(`Número máximo de tentativas (${this.maxRetries}) excedido. Aguardando próximo ciclo de atualização.`);
            this.retryCount = 0;
        }

        this.updateStatusDisplay();
    }

    /**
     * Pausa as atualizações automáticas
     */
    pauseUpdates() {
        if (this.marketDataTimer) {
            clearInterval(this.marketDataTimer);
            this.marketDataTimer = null;
        }

        if (this.newsTimer) {
            clearInterval(this.newsTimer);
            this.newsTimer = null;
        }

        console.log('Atualizações em tempo real pausadas (página não visível)');
    }

    /**
     * Retoma as atualizações automáticas
     */
    resumeUpdates() {
        if (!this.isEnabled) return;

        if (!this.marketDataTimer) {
            this.startMarketDataUpdates();
        }

        if (!this.newsTimer) {
            this.startNewsUpdates();
        }

        console.log('Atualizações em tempo real retomadas');
    }

    /**
     * Atualiza as configurações com base nas preferências do usuário
     * @param {Object} preferences - Preferências do usuário
     */
    updateSettings(preferences) {
        if (!preferences) return;

        // Atualizar intervalo de atualização de dados de mercado
        if (preferences.refreshInterval) {
            const newInterval = preferences.refreshInterval * 1000; // Converter para milissegundos

            if (newInterval !== this.marketDataInterval) {
                console.log(`Atualizando intervalo de atualização: ${this.marketDataInterval / 1000}s -> ${preferences.refreshInterval}s`);

                this.marketDataInterval = newInterval;

                // Reiniciar timer se estiver ativo
                if (this.marketDataTimer) {
                    this.stopMarketDataUpdates();
                    this.startMarketDataUpdates();
                }
            }
        }

        // Atualizar o status no rodapé
        this.updateStatusDisplay();
    }

    /**
     * Define um novo intervalo de atualização
     * @param {number} seconds - Intervalo em segundos
     */
    setUpdateInterval(seconds) {
        if (!seconds || seconds < 10) return; // Evitar intervalos muito curtos

        const newInterval = seconds * 1000; // Converter para milissegundos

        if (newInterval !== this.marketDataInterval) {
            console.log(`Definindo novo intervalo de atualização: ${seconds}s`);

            this.marketDataInterval = newInterval;

            // Reiniciar timer se estiver ativo
            if (this.marketDataTimer) {
                this.stopMarketDataUpdates();
                this.startMarketDataUpdates();
            }
        }
    }

    /**
     * Atualiza o status no rodapé
     */
    updateStatusDisplay() {
        const statusElement = document.querySelector('.footer p:last-child');
        if (!statusElement) return;

        if (!this.isEnabled) {
            statusElement.textContent = 'Atualização em tempo real desativada';
            statusElement.classList.add('status-disabled');
            return;
        }

        let statusText = 'Atualização em tempo real ativada';

        if (this.lastMarketUpdate) {
            const timeAgo = this.getTimeAgo(this.lastMarketUpdate);
            statusText += ` | Mercado: ${timeAgo}`;
        }

        if (this.lastNewsUpdate) {
            const timeAgo = this.getTimeAgo(this.lastNewsUpdate);
            statusText += ` | Notícias: ${timeAgo}`;
        }

        statusElement.textContent = statusText;
        statusElement.classList.remove('status-disabled');
    }

    /**
     * Retorna o tempo decorrido desde uma data em formato legível
     */
    getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffSec = Math.floor(diffMs / 1000);

        if (diffSec < 60) {
            return `${diffSec}s atrás`;
        } else if (diffSec < 3600) {
            const diffMin = Math.floor(diffSec / 60);
            return `${diffMin}m atrás`;
        } else {
            const diffHour = Math.floor(diffSec / 3600);
            return `${diffHour}h atrás`;
        }
    }

    /**
     * Retorna o nome da página atual com base na URL
     */
    getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop();

        if (filename === 'best-assets.html') {
            return 'best-assets';
        } else if (filename === 'news.html') {
            return 'news';
        } else {
            return 'index';
        }
    }
}

// Inicializar o atualizador em tempo real quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    const updater = new RealtimeUpdater();
    updater.init();

    // Tornar o updater acessível globalmente para debugging
    window.realtimeUpdater = updater;
});
