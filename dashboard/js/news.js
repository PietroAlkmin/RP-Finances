/**
 * Funcionalidades específicas para a página de notícias financeiras
 * Responsável pela exibição e atualização de notícias de múltiplas fontes
 */

// As funções do data-loader.js são acessíveis globalmente

// Objeto global para armazenar dados da página de notícias
window.newsData = {
    general: null,
    financial: null,
    featured: null,
    sentiment: null,
    filters: {
        language: 'all',
        topic: 'all'
    },
    dataLoaded: false,
    lastUpdate: null
};

// Inicializar a página quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Configurar filtros
    setupFilters();

    // Atualizar data atual
    updateCurrentDate();

    // Configurar botão de retry
    const retryButton = document.getElementById('retry-button');
    if (retryButton) {
        retryButton.addEventListener('click', function() {
            // Esconder mensagem de erro
            const errorMessage = document.getElementById('error-message');
            if (errorMessage) errorMessage.classList.add('hidden');

            // Mostrar indicador de carregamento
            const loadingIndicator = document.getElementById('loading-indicator');
            if (loadingIndicator) loadingIndicator.classList.remove('hidden');

            // Limpar cache de notícias
            CacheManager.clearCacheByType('news');

            // Tentar carregar dados novamente
            setTimeout(() => {
                window.loadNewsData('all', window.newsData.filters.language, window.newsData.filters.topic)
                    .finally(() => {
                        // Esconder indicador de carregamento
                        if (loadingIndicator) loadingIndicator.classList.add('hidden');
                    });
            }, 1000);
        });
    }

    // Configurar botão de limpar cache
    const clearCacheButton = document.getElementById('clear-cache-button');
    if (clearCacheButton) {
        clearCacheButton.addEventListener('click', function() {
            // Limpar todo o cache
            CacheManager.clearAllCache();

            // Recarregar a página
            window.location.reload();
        });
    }

    // Mostrar indicador de carregamento
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) loadingIndicator.classList.remove('hidden');

    // Carregar dados iniciais
    try {
        window.loadNewsData('all', window.newsData.filters.language, window.newsData.filters.topic)
            .finally(() => {
                // Esconder indicador de carregamento
                if (loadingIndicator) loadingIndicator.classList.add('hidden');
            });
    } catch (error) {
        console.error('Erro ao carregar notícias:', error);
        // Esconder indicador de carregamento em caso de erro
        if (loadingIndicator) loadingIndicator.classList.add('hidden');

        // Mostrar mensagem de erro
        const errorMessage = document.getElementById('error-message');
        if (errorMessage) errorMessage.classList.remove('hidden');
    }
});

// Quando os dados forem carregados
document.addEventListener('newsDataLoaded', function() {
    console.log('Evento newsDataLoaded recebido, dados:', window.newsData);
    renderFeaturedNews();
    // renderNewsFeeds() - Removido pois a seção de feeds foi removida
    renderSentimentAnalysis();
});

// Adicionar um listener para o evento DOMContentLoaded para garantir que o evento newsDataLoaded seja capturado
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se os dados já foram carregados
    if (window.newsData && window.newsData.dataLoaded) {
        console.log('Dados já carregados no DOMContentLoaded, renderizando...');
        renderFeaturedNews();
        // renderNewsFeeds() - Removido pois a seção de feeds foi removida
        renderSentimentAnalysis();
    }
});

/**
 * Atualiza o contador de filtros ativos
 */
function updateActiveFiltersCount() {
    const activeFiltersCount = document.getElementById('active-filters-count');
    if (!activeFiltersCount) return;

    let count = 0;

    // Contar filtros ativos
    if (window.newsData.filters.language !== 'all') count++;
    if (window.newsData.filters.topic !== 'all') count++;

    // Atualizar texto do contador
    if (count > 0) {
        activeFiltersCount.textContent = `${count} ${count === 1 ? 'filtro ativo' : 'filtros ativos'}`;
        activeFiltersCount.style.display = 'inline-block';
    } else {
        activeFiltersCount.style.display = 'none';
    }
}

/**
 * Configura os filtros de idioma e tópico
 */
function setupFilters() {
    // Inicializar contador de filtros ativos
    updateActiveFiltersCount();

    // Filtros de idioma
    const languageButtons = document.querySelectorAll('.language-filter .filter-button');
    languageButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remover classe active de todos os botões
            languageButtons.forEach(btn => btn.classList.remove('active'));

            // Adicionar classe active ao botão clicado
            this.classList.add('active');

            // Atualizar idioma selecionado
            window.newsData.filters.language = this.dataset.language;

            // Atualizar contador de filtros ativos
            updateActiveFiltersCount();

            // Recarregar dados com novo idioma
            window.loadNewsData('all', window.newsData.filters.language, window.newsData.filters.topic);
        });
    });

    // Filtros de tópico
    const topicButtons = document.querySelectorAll('.topic-filter .filter-button');
    topicButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remover classe active de todos os botões
            topicButtons.forEach(btn => btn.classList.remove('active'));

            // Adicionar classe active ao botão clicado
            this.classList.add('active');

            // Atualizar tópico selecionado
            window.newsData.filters.topic = this.dataset.topic;

            // Atualizar contador de filtros ativos
            updateActiveFiltersCount();

            // Recarregar dados com novo tópico
            window.loadNewsData('all', window.newsData.filters.language, window.newsData.filters.topic);
        });
    });
}

// Função setupNewsTabs removida pois não é mais necessária

/**
 * Atualiza a data no cabeçalho
 * Nota: Esta função foi mantida para compatibilidade, mas não faz mais nada
 * já que o cabeçalho foi removido
 */
function updateCurrentDate() {
    // Esta função foi mantida para compatibilidade, mas não faz mais nada
    console.log('Função updateCurrentDate chamada, mas não faz mais nada pois o cabeçalho foi removido');
    return;
}

/**
 * Renderiza as notícias em destaque
 */
function renderFeaturedNews() {
    console.log('Renderizando notícias em destaque...', window.newsData);

    if (!window.newsData.financial || !window.newsData.dataLoaded) {
        console.warn('Dados de notícias não disponíveis para renderização das notícias em destaque');

        // Mostrar mensagem de erro
        const featuredNewsContainer = document.getElementById('featured-news');
        if (featuredNewsContainer) {
            featuredNewsContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📰</div>
                    <h3>Sem notícias disponíveis</h3>
                    <p>Não foi possível carregar as notícias em destaque.</p>
                    <button id="retry-featured-news" class="btn btn-primary">Tentar Novamente</button>
                </div>
            `;

            // Adicionar evento para tentar novamente
            const retryButton = document.getElementById('retry-featured-news');
            if (retryButton) {
                retryButton.addEventListener('click', function() {
                    // Limpar cache de notícias
                    CacheManager.clearCacheByType('news');
                    // Recarregar dados
                    window.loadNewsData(window.newsData.filters.source, window.newsData.filters.language, window.newsData.filters.topic);
                });
            }
        }
        return;
    }

    const featuredNewsContainer = document.getElementById('featured-news');

    // Selecionar as 5 notícias mais recentes
    const featuredNews = window.newsData.financial.slice(0, 5);

    let featuredHTML = '';

    featuredNews.forEach(news => {
        const publishedDate = new Date(news.publishedAt);
        const timeAgo = getTimeAgo(publishedDate);
        const sourceIcon = getSourceIcon(news.source);
        const sentimentClass = getSentimentClass(news.sentiment);

        // Obter o nome da fonte para exibição
        let sourceName = news.source;
        if (news.sourceName) {
            sourceName = news.sourceName;
        } else if (CONFIG.newsSources[news.source]) {
            sourceName = CONFIG.newsSources[news.source].name;
        } else if (news.originalSource) {
            sourceName = news.originalSource;
        }

        featuredHTML += `
            <div class="featured-news-item ${sentimentClass}">
                <div class="news-header">
                    <div class="news-source">
                        ${sourceIcon} ${sourceName}
                    </div>
                    <div class="news-time">${timeAgo}</div>
                </div>
                <h3 class="news-title">
                    <a href="${news.url}" target="_blank" rel="noopener noreferrer">
                        ${news.title}
                    </a>
                </h3>
                <p class="news-description">${news.description}</p>
                <div class="news-footer">
                    <div class="news-topics">
                        ${renderTopics(news.topics)}
                    </div>
                    <div class="news-impact">
                        Impacto: <span class="impact-score">${news.impactScore.toFixed(1)}/10</span>
                    </div>
                </div>
            </div>
        `;
    });

    featuredNewsContainer.innerHTML = featuredHTML;
}

/**
 * Renderiza os feeds de notícias
 * Nota: Esta função foi mantida para compatibilidade, mas não faz mais nada
 * já que a seção de feeds foi removida
 */
function renderNewsFeeds() {
    console.log('Função renderNewsFeeds chamada, mas não faz mais nada pois a seção foi removida');
    // Esta função foi mantida para compatibilidade, mas não faz mais nada
    return;
}

/**
 * Renderiza um feed de notícias específico
 * Nota: Esta função foi mantida para compatibilidade, mas não faz mais nada
 * já que a seção de feeds foi removida
 */
function renderNewsFeed(source, news) {
    console.log('Função renderNewsFeed chamada, mas não faz mais nada pois a seção foi removida');
    // Esta função foi mantida para compatibilidade, mas não faz mais nada
    return;
}

/**
 * Renderiza a análise de sentimento
 */
function renderSentimentAnalysis() {
    if (!window.newsData.sentiment || !window.newsData.dataLoaded) {
        console.warn('Dados de sentimento não disponíveis para renderização');

        // Mostrar mensagem de erro no gráfico de sentimento
        const chartContainer = document.querySelector('.sentiment-chart-container');
        if (chartContainer) {
            chartContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📈</div>
                    <h3>Sem dados de sentimento</h3>
                    <p>Não foi possível carregar a análise de sentimento.</p>
                </div>
            `;
        }

        // Mostrar mensagem de erro nos tópicos de sentimento
        const topicsContainer = document.getElementById('sentiment-topics');
        if (topicsContainer) {
            topicsContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📉</div>
                    <h3>Sem dados de tópicos</h3>
                    <p>Não foi possível carregar os tópicos de sentimento.</p>
                </div>
            `;
        }
        return;
    }

    // Renderizar gráfico de sentimento
    renderSentimentChart();

    // Renderizar tópicos de sentimento
    renderSentimentTopics();
}

/**
 * Renderiza o gráfico de análise de sentimento
 */
function renderSentimentChart() {
    const ctx = document.getElementById('sentiment-chart').getContext('2d');
    const sentiment = window.newsData.sentiment;

    // Verificar se temos dados de percentagens
    if (!sentiment || !sentiment.percentages) {
        // Calcular percentagens a partir das contagens
        const total = sentiment ? (sentiment.counts.positive + sentiment.counts.neutral + sentiment.counts.negative) : 0;
        const percentages = {
            positive: total > 0 ? parseFloat(((sentiment?.counts.positive || 0) / total * 100).toFixed(1)) : 33.3,
            neutral: total > 0 ? parseFloat(((sentiment?.counts.neutral || 0) / total * 100).toFixed(1)) : 33.3,
            negative: total > 0 ? parseFloat(((sentiment?.counts.negative || 0) / total * 100).toFixed(1)) : 33.3
        };

        // Se sentiment não existir, criar um objeto vazio
        if (!sentiment) {
            window.newsData.sentiment = {
                counts: { positive: 0, neutral: 0, negative: 0 },
                percentages: percentages,
                byTopic: {},
                overall: 'neutral'
            };
            sentiment = window.newsData.sentiment;
        } else {
            // Adicionar percentagens ao objeto sentiment existente
            sentiment.percentages = percentages;
        }
    }

    // Dados para o gráfico
    const data = [
        sentiment.percentages.positive,
        sentiment.percentages.neutral,
        sentiment.percentages.negative
    ];

    // Cores para o gráfico
    const colors = [
        'rgba(16, 185, 129, 0.7)', // Verde para positivo
        'rgba(59, 130, 246, 0.7)', // Azul para neutro
        'rgba(239, 68, 68, 0.7)'   // Vermelho para negativo
    ];

    // Verificar se já existe um gráfico e destruí-lo
    if (window.sentimentChart instanceof Chart) {
        window.sentimentChart.destroy();
    }

    // Criar novo gráfico
    window.sentimentChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Positivo', 'Neutro', 'Negativo'],
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.raw.toFixed(1)}%`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Renderiza os tópicos de sentimento
 */
function renderSentimentTopics() {
    const topicsContainer = document.getElementById('sentiment-topics');
    const sentiment = window.newsData.sentiment;

    // Verificar se temos dados de tópicos
    if (!sentiment || !sentiment.byTopic || Object.keys(sentiment.byTopic).length === 0) {
        // Criar dados de tópicos simulados
        if (!sentiment) {
            window.newsData.sentiment = {
                counts: { positive: 0, neutral: 0, negative: 0 },
                percentages: { positive: 33.3, neutral: 33.3, negative: 33.3 },
                byTopic: {
                    'stocks': { positive: 1, neutral: 1, negative: 1, total: 3 },
                    'economy': { positive: 1, neutral: 1, negative: 1, total: 3 }
                },
                overall: 'neutral'
            };
            sentiment = window.newsData.sentiment;
        } else if (!sentiment.byTopic) {
            sentiment.byTopic = {
                'stocks': { positive: 1, neutral: 1, negative: 1, total: 3 },
                'economy': { positive: 1, neutral: 1, negative: 1, total: 3 }
            };
        }
    }

    let topicsHTML = `
        <div class="sentiment-overall">
            <h3>Sentimento Geral do Mercado</h3>
            <div class="sentiment-indicator ${getSentimentOverallClass(sentiment.overall)} tooltip">
                ${getSentimentOverallLabel(sentiment.overall)}
                <span class="tooltip-text">
                    <strong>Sentimento do Mercado:</strong> Representa a tendência geral das notícias financeiras.<br>
                    <br>
                    <strong>Como é calculado:</strong><br>
                    - Baseado na proporção de notícias positivas, neutras e negativas<br>
                    - Positivo: Quando há mais notícias positivas que negativas e neutras<br>
                    - Negativo: Quando há mais notícias negativas que positivas e neutras<br>
                    - Neutro: Quando há equilíbrio ou predominância de notícias neutras<br>
                    <br>
                    Este indicador ajuda a entender o clima geral do mercado financeiro.
                </span>
            </div>
        </div>

        <div class="sentiment-topics-list">
            <h3>Sentimento por Tópico <span class="info-icon tooltip">ℹ️
                <span class="tooltip-text">
                    <strong>Sentimento por Tópico:</strong> Mostra como cada segmento do mercado está sendo percebido.<br>
                    <br>
                    <strong>Como é calculado:</strong><br>
                    - Cada notícia é classificada por tópico (ações, cripto, etc.)<br>
                    - As barras mostram a proporção de notícias positivas, neutras e negativas<br>
                    - A cor de fundo indica o sentimento predominante<br>
                    <br>
                    Isso permite identificar quais setores estão com tendências positivas ou negativas.
                </span>
            </span></h3>
            <div class="topics-grid">
    `;

    // Adicionar cada tópico
    Object.entries(sentiment.byTopic).forEach(([topic, data]) => {
        const topicLabel = getTopicLabel(topic);
        const positivePercentage = (data.positive / data.total * 100).toFixed(1);
        const neutralPercentage = (data.neutral / data.total * 100).toFixed(1);
        const negativePercentage = (data.negative / data.total * 100).toFixed(1);

        // Determinar sentimento predominante
        let predominantSentiment = 'neutral';
        if (data.positive > data.neutral && data.positive > data.negative) {
            predominantSentiment = 'positive';
        } else if (data.negative > data.neutral && data.negative > data.positive) {
            predominantSentiment = 'negative';
        }

        topicsHTML += `
            <div class="topic-item sentiment-${predominantSentiment}">
                <div class="topic-name">${topicLabel}</div>
                <div class="topic-sentiment-bars">
                    <div class="sentiment-bar-container">
                        <div class="sentiment-bar positive" style="width: ${positivePercentage}%"></div>
                        <div class="sentiment-bar neutral" style="width: ${neutralPercentage}%"></div>
                        <div class="sentiment-bar negative" style="width: ${negativePercentage}%"></div>
                    </div>
                    <div class="sentiment-percentages">
                        <span class="positive">${positivePercentage}%</span>
                        <span class="neutral">${neutralPercentage}%</span>
                        <span class="negative">${negativePercentage}%</span>
                    </div>
                </div>
            </div>
        `;
    });

    topicsHTML += `
            </div>
        </div>
    `;

    topicsContainer.innerHTML = topicsHTML;
}

// ===== Funções utilitárias =====

/**
 * Agrupa notícias por fonte
 */
function groupNewsBySource(news) {
    const sources = {};

    news.forEach(item => {
        if (!sources[item.source]) {
            sources[item.source] = [];
        }

        sources[item.source].push(item);
    });

    return sources;
}

/**
 * Renderiza os tópicos de uma notícia
 */
function renderTopics(topics) {
    if (!topics || topics.length === 0) return '';

    return topics.map(topic =>
        `<span class="topic-badge">${getTopicLabel(topic)}</span>`
    ).join('');
}

/**
 * Retorna o rótulo de um tópico
 */
function getTopicLabel(topic) {
    const topicLabels = {
        'stocks': 'Ações',
        'crypto': 'Criptomoedas',
        'reits': 'Fundos Imobiliários',
        'fixed-income': 'Renda Fixa',
        'etfs': 'ETFs',
        'gold': 'Ouro',
        'economy': 'Economia',
        'technology': 'Tecnologia',
        'commodities': 'Commodities'
    };

    return topicLabels[topic] || topic;
}

/**
 * Retorna o nome de uma fonte
 */
function getSourceName(source) {
    const sourceNames = {
        'infomoney': 'InfoMoney',
        'bbc': 'BBC News',
        'forbes': 'Forbes',
        'g1': 'G1 Economia',
        'investing': 'Investing.com',
        'cnbc': 'CNBC',
        'bloomberg': 'Bloomberg',
        'reuters': 'Reuters',
        'wsj': 'Wall Street Journal',
        'ft': 'Financial Times',
        'yahoo': 'Yahoo Finance',
        'other': 'Outras Fontes'
    };

    // Se a fonte não estiver no mapeamento, formatar o nome para exibição
    if (sourceNames[source]) {
        return sourceNames[source];
    }

    // Tentar formatar o nome da fonte se não estiver no mapeamento
    if (source && typeof source === 'string') {
        // Capitalizar primeira letra de cada palavra
        return source.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    return 'Fonte Desconhecida';
}

/**
 * Retorna o ícone de uma fonte
 */
function getSourceIcon(source) {
    const sourceIcons = {
        'infomoney': '📊',
        'bbc': '🌐',
        'forbes': '💼',
        'g1': '🇧🇷',
        'investing': '📈',
        'cnbc': '📺',
        'bloomberg': '💹',
        'reuters': '🌎',
        'wsj': '📄',
        'ft': '📰',
        'yahoo': '📱',
        'other': '📰'
    };

    // Se a fonte não estiver no mapeamento, retornar o ícone padrão de notícias
    return sourceIcons[source] || '📰';
}

/**
 * Retorna a classe CSS para um sentimento
 */
function getSentimentClass(sentiment) {
    if (sentiment === 'positive') return 'sentiment-positive';
    if (sentiment === 'negative') return 'sentiment-negative';
    return 'sentiment-neutral';
}

/**
 * Retorna o rótulo para um sentimento
 */
function getSentimentLabel(sentiment) {
    const labels = {
        'positive': 'Positivo',
        'negative': 'Negativo',
        'neutral': 'Neutro'
    };

    return labels[sentiment] || sentiment;
}

/**
 * Retorna a classe CSS para o sentimento geral
 */
function getSentimentOverallClass(sentiment) {
    if (sentiment === 'bullish' || sentiment === 'slightly_bullish') return 'sentiment-positive';
    if (sentiment === 'bearish' || sentiment === 'slightly_bearish') return 'sentiment-negative';
    return 'sentiment-neutral';
}

/**
 * Retorna o rótulo para o sentimento geral
 */
function getSentimentOverallLabel(sentiment) {
    const sentimentLabels = {
        'bullish': 'Muito Otimista',
        'slightly_bullish': 'Levemente Otimista',
        'neutral': 'Neutro',
        'slightly_bearish': 'Levemente Pessimista',
        'bearish': 'Muito Pessimista'
    };

    return sentimentLabels[sentiment] || 'Neutro';
}

/**
 * Retorna o rótulo para a reação do mercado
 */
function getReactionLabel(reaction) {
    if (reaction === 'positive') return 'Positiva';
    if (reaction === 'negative') return 'Negativa';
    return 'Neutra';
}

/**
 * Retorna o tempo decorrido desde uma data
 */
function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);

    if (diffSec < 60) {
        return `${diffSec} segundos atrás`;
    } else if (diffSec < 3600) {
        const diffMin = Math.floor(diffSec / 60);
        return `${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'} atrás`;
    } else if (diffSec < 86400) {
        const diffHour = Math.floor(diffSec / 3600);
        return `${diffHour} ${diffHour === 1 ? 'hora' : 'horas'} atrás`;
    } else {
        const diffDay = Math.floor(diffSec / 86400);
        return `${diffDay} ${diffDay === 1 ? 'dia' : 'dias'} atrás`;
    }
}
