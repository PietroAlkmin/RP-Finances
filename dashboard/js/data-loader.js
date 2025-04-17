/**
 * Carregador de dados para o dashboard financeiro
 * Responsável por carregar os dados de APIs e disponibilizá-los para os componentes do dashboard
 */

/**
 * Gera dados simulados de criptomoedas
 * @returns {Array} - Dados simulados de criptomoedas
 */
function getSimulatedCryptoData() {
    return [
        {
            id: 'bitcoin',
            symbol: 'btc',
            name: 'Bitcoin',
            image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
            current_price: 63715.17,
            market_cap: 1248275802934,
            market_cap_rank: 1,
            total_volume: 25392532591,
            price_change_24h: 2215.17,
            price_change_percentage_24h: 3.48,
            price_change_percentage_7d: 5.12,
            price_change_percentage_30d: 10.45,
            price_change_percentage_1y: 45.23,
            sparkline_in_7d: { price: generateRandomSparklineData(24, 60000, 65000) }
        },
        {
            id: 'ethereum',
            symbol: 'eth',
            name: 'Ethereum',
            image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
            current_price: 3117.08,
            market_cap: 374259723649,
            market_cap_rank: 2,
            total_volume: 15987654321,
            price_change_24h: 38.17,
            price_change_percentage_24h: 1.23,
            price_change_percentage_7d: 3.45,
            price_change_percentage_30d: 8.76,
            price_change_percentage_1y: 32.15,
            sparkline_in_7d: { price: generateRandomSparklineData(24, 3000, 3200) }
        },
        {
            id: 'binancecoin',
            symbol: 'bnb',
            name: 'BNB',
            image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
            current_price: 574.32,
            market_cap: 88654321098,
            market_cap_rank: 3,
            total_volume: 2345678901,
            price_change_24h: 12.15,
            price_change_percentage_24h: 2.15,
            price_change_percentage_7d: 4.32,
            price_change_percentage_30d: 7.65,
            price_change_percentage_1y: 28.43,
            sparkline_in_7d: { price: generateRandomSparklineData(24, 550, 580) }
        },
        {
            id: 'ripple',
            symbol: 'xrp',
            name: 'XRP',
            image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
            current_price: 0.5423,
            market_cap: 29876543210,
            market_cap_rank: 4,
            total_volume: 1234567890,
            price_change_24h: -0.0082,
            price_change_percentage_24h: -1.45,
            price_change_percentage_7d: -2.34,
            price_change_percentage_30d: 5.67,
            price_change_percentage_1y: 15.43,
            sparkline_in_7d: { price: generateRandomSparklineData(24, 0.52, 0.56) }
        },
        {
            id: 'cardano',
            symbol: 'ada',
            name: 'Cardano',
            image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
            current_price: 0.4321,
            market_cap: 15234567890,
            market_cap_rank: 5,
            total_volume: 987654321,
            price_change_24h: 0.0037,
            price_change_percentage_24h: 0.87,
            price_change_percentage_7d: 1.23,
            price_change_percentage_30d: 4.56,
            price_change_percentage_1y: 12.34,
            sparkline_in_7d: { price: generateRandomSparklineData(24, 0.42, 0.44) }
        },
        {
            id: 'solana',
            symbol: 'sol',
            name: 'Solana',
            image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
            current_price: 137.89,
            market_cap: 59876543210,
            market_cap_rank: 6,
            total_volume: 3456789012,
            price_change_24h: 5.67,
            price_change_percentage_24h: 4.32,
            price_change_percentage_7d: 8.76,
            price_change_percentage_30d: 15.43,
            price_change_percentage_1y: 65.32,
            sparkline_in_7d: { price: generateRandomSparklineData(24, 130, 140) }
        }
    ];
}

/**
 * Gera dados aleatórios para gráficos de linha
 * @param {number} points - Número de pontos
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {Array} - Array de valores aleatórios
 */
function generateRandomSparklineData(points, min, max) {
    const data = [];
    for (let i = 0; i < points; i++) {
        data.push(min + Math.random() * (max - min));
    }
    return data;
}

// Objeto global para armazenar todos os dados
const dashboardData = {
    indices: null,
    stocks: null,
    regions: null,
    sectors: null,
    correlations: null,
    marketSummary: null,
    cryptoMarket: null,  // Dados de mercado de criptomoedas
    dataLoaded: false
};

/**
 * Carrega todos os dados necessários para o dashboard principal
 */
async function loadAllData() {
    try {
        console.log('Carregando dados do dashboard...');

        // Mostrar indicador de carregamento
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) loadingIndicator.classList.remove('hidden');

        // Obter dados de índices (reais ou simulados)
        let indicesData;
        try {
            indicesData = await fetchIndicesData();
            dashboardData.indicesError = false;
        } catch (error) {
            console.error('Erro ao carregar índices:', error);
            dashboardData.indicesError = true;
            // Usar dados em cache se disponíveis, caso contrário usar dados simulados
            indicesData = dashboardData.indices || await simulateIndicesData();
        }

        // Obter dados de ações (reais ou simulados)
        let stocksData;
        try {
            stocksData = await fetchStocksData();
            dashboardData.stocksError = false;
        } catch (error) {
            console.error('Erro ao carregar ações:', error);
            dashboardData.stocksError = true;
            // Usar dados em cache se disponíveis, caso contrário usar dados simulados
            stocksData = dashboardData.stocks || await simulateStocksData();
        }

        // Processar dados para análise regional
        const regionsData = processRegionsData(indicesData);

        // Processar dados para análise setorial
        const sectorsData = processSectorsData(stocksData);

        // Calcular correlações entre índices
        const correlationsData = calculateCorrelations(indicesData);

        // Gerar resumo do mercado
        const marketSummaryData = generateMarketSummary(indicesData, stocksData, regionsData, sectorsData);

        // Usar dados simulados de criptomoedas para evitar chamadas de API
        console.log('Usando dados simulados de criptomoedas...');
        const cryptoData = getSimulatedCryptoData();

        // Armazenar dados no objeto global
        dashboardData.indices = indicesData;
        dashboardData.stocks = stocksData;
        dashboardData.regions = regionsData;
        dashboardData.sectors = sectorsData;
        dashboardData.correlations = correlationsData;
        dashboardData.marketSummary = marketSummaryData;
        dashboardData.cryptoMarket = cryptoData;
        dashboardData.dataLoaded = true;
        dashboardData.lastUpdate = new Date();

        // Ocultar indicador de carregamento
        if (loadingIndicator) loadingIndicator.classList.add('hidden');

        console.log('Dados do dashboard carregados com sucesso');

        // Disparar evento de dados carregados
        const event = new CustomEvent('dataLoaded');
        document.dispatchEvent(event);

        return true;
    } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
        return false;
    }
}

/**
 * Carrega dados para a página de melhores ativos
 */
async function loadBestAssetsData(period = 'week', assetType = 'all') {
    try {
        console.log(`Carregando dados de melhores ativos (período: ${period}, tipo: ${assetType})...`);

        // Mostrar indicador de carregamento
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) loadingIndicator.classList.remove('hidden');

        // Verificar se há dados em cache
        const cacheKey = `best_assets_${period}_${assetType}`;
        const cachedData = CacheManager.getFromCache(cacheKey);

        if (cachedData) {
            console.log('Usando dados de melhores ativos do cache');

            // Armazenar dados no objeto global
            bestAssetsData.assets = cachedData.assets;
            bestAssetsData.categories = cachedData.categories;
            bestAssetsData.period = period;
            bestAssetsData.assetType = assetType;
            bestAssetsData.dataLoaded = true;
            bestAssetsData.lastUpdate = new Date();

            // Ocultar indicador de carregamento
            if (loadingIndicator) loadingIndicator.classList.add('hidden');

            // Disparar evento de dados carregados
            const event = new CustomEvent('bestAssetsDataLoaded');
            document.dispatchEvent(event);

            return true;
        }

        // Obter dados reais da API Alpha Vantage ou usar dados simulados como fallback
        let assetsData;
        let apiSuccess = false;

        try {
            // Tentar obter dados da API
            const apiData = await fetchAssetsDataFromAPI(period, assetType);

            // Verificar se os dados da API são válidos
            if (apiData && apiData.assets && Array.isArray(apiData.assets) && apiData.assets.length > 0) {
                assetsData = apiData;
                apiSuccess = true;
                console.log('Dados da API carregados com sucesso');
            } else {
                throw new Error('Dados da API inválidos ou vazios');
            }
        } catch (apiError) {
            console.warn('Erro ao obter dados da API Alpha Vantage:', apiError);
            console.log('Usando dados simulados como fallback...');

            // Mostrar mensagem de erro
            const errorMessage = document.getElementById('error-message');
            if (errorMessage) errorMessage.classList.remove('hidden');

            // Obter dados simulados
            try {
                const simulatedData = await fetchAssetsData(period, assetType);
                assetsData = simulatedData;
                console.log('Dados simulados carregados com sucesso');
            } catch (simError) {
                console.error('Erro ao carregar dados simulados:', simError);
                throw new Error('Falha ao carregar dados reais e simulados');
            }
        }

        // Verificar se temos dados válidos
        if (!assetsData || !assetsData.assets || !Array.isArray(assetsData.assets)) {
            throw new Error('Dados de ativos inválidos após tentativas de carregamento');
        }

        // Processar dados por categoria (já deve estar processado, mas garantimos aqui)
        const categoriesData = assetsData.categories || processCategoriesData(assetsData.assets, period);

        // Armazenar dados no objeto global
        bestAssetsData.assets = assetsData.assets;
        bestAssetsData.categories = categoriesData;
        bestAssetsData.period = period;
        bestAssetsData.assetType = assetType;
        bestAssetsData.dataLoaded = true;
        bestAssetsData.lastUpdate = new Date();

        // Salvar dados no cache
        CacheManager.saveToCache(cacheKey, {
            assets: assetsData.assets,
            categories: categoriesData
        }, CONFIG.cache.ttl.bestAssets);

        // Ocultar indicador de carregamento
        if (loadingIndicator) loadingIndicator.classList.add('hidden');

        console.log('Dados de melhores ativos carregados com sucesso');

        // Disparar evento de dados carregados
        const event = new CustomEvent('bestAssetsDataLoaded');
        document.dispatchEvent(event);

        return true;
    } catch (error) {
        console.error('Erro ao carregar dados de melhores ativos:', error);

        // Ocultar indicador de carregamento e mostrar mensagem de erro
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) loadingIndicator.classList.add('hidden');

        const errorMessage = document.getElementById('error-message');
        if (errorMessage) errorMessage.classList.remove('hidden');

        return false;
    }
}

/**
 * Obtém dados de ativos da API Alpha Vantage
 */
async function fetchAssetsDataFromAPI(period, assetType) {
    console.log('Obtendo dados de ativos da API Alpha Vantage...');

    // Verificar se há dados em cache
    const cacheKey = `assets_api_${period}_${assetType}`;
    const cachedData = CacheManager.getFromCache(cacheKey);

    if (cachedData) {
        console.log('Usando dados de ativos do cache');

        // Verificar se os dados em cache são válidos
        if (cachedData && cachedData.assets && Array.isArray(cachedData.assets) && cachedData.assets.length > 0) {
            return cachedData;
        } else {
            console.warn('Dados em cache inválidos, obtendo novos dados...');
            // Remover dados inválidos do cache
            CacheManager.removeFromCache(cacheKey);
        }
    }

    // Selecionar símbolos com base no tipo de ativo
    let symbols = [];
    if (assetType === 'all') {
        // Pegar alguns símbolos de cada categoria
        Object.values(CONFIG.assetTypes).forEach(type => {
            symbols = symbols.concat(type.symbols.slice(0, 2));
        });
    } else if (CONFIG.assetTypes[assetType]) {
        symbols = CONFIG.assetTypes[assetType].symbols;
    }

    // Limitar a quantidade de símbolos para não exceder limites da API
    symbols = symbols.slice(0, 5); // Limitar a 5 símbolos para evitar exceder limites da API gratuita

    const results = [];
    const sectorMap = {};

    // Mapear símbolos para setores
    Object.entries(CONFIG.assetTypes).forEach(([type, data]) => {
        data.symbols.forEach(symbol => {
            sectorMap[symbol] = {
                type: type,
                name: data.name
            };
        });
    });

    // Obter dados para cada símbolo
    for (const symbol of symbols) {
        try {
            // Construir URL para a API Alpha Vantage
            let url;
            if (CONFIG.apiEndpoints.useProxy) {
                url = `${CONFIG.apiEndpoints.proxyAlphaVantage}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${CONFIG.apiKeys.alphaVantage}`;
            } else {
                url = `${CONFIG.apiEndpoints.alphaVantage}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${CONFIG.apiKeys.alphaVantage}`;
            }

            // Fazer a chamada à API
            console.log('Chamando Alpha Vantage API com URL:', url);
            const response = await fetch(url);

            if (!response.ok) {
                console.error(`Erro na API: ${response.status}`);
                throw new Error(`Erro na API: ${response.status}`);
            }

            console.log('Resposta recebida da API Alpha Vantage');

            const data = await response.json();

            // Verificar se a resposta contém dados válidos
            if (data['Error Message'] || !data['Time Series (Daily)']) {
                // Verificar se é um erro de limite de API
                if (data['Note'] && data['Note'].includes('API call frequency')) {
                    console.warn(`Limite de API excedido para ${symbol}. Usando dados em cache ou simulados.`);
                    throw new Error(`Limite de API excedido para ${symbol}`);
                } else if (data['Information']) {
                    // Mensagem informativa da API (geralmente sobre limites)
                    console.warn(`Informação da API para ${symbol}:`, data['Information']);
                    throw new Error(`Informação da API: ${data['Information']}`);
                } else {
                    console.warn(`Dados inválidos para ${symbol}:`, data);
                    throw new Error(`Dados inválidos para ${symbol}`);
                }
            }

            // Verificar se temos dados suficientes
            const timeSeries = data['Time Series (Daily)'];
            if (!timeSeries || Object.keys(timeSeries).length === 0) {
                console.warn(`Sem dados para ${symbol}`);
                throw new Error(`Sem dados para ${symbol}`);
            }

            // Processar dados
            const dates = Object.keys(timeSeries).sort().reverse(); // Mais recente primeiro

            if (dates.length === 0) {
                console.warn(`Sem dados para ${symbol}`);
                continue;
            }

            // Obter preço atual e histórico
            const lastPrice = parseFloat(timeSeries[dates[0]]['4. close']);

            // Calcular retornos com base no período
            let periodIndex = 0;
            if (period === 'week' && dates.length > 5) periodIndex = 5;
            else if (period === 'month' && dates.length > 20) periodIndex = 20;
            else if (period === 'year' && dates.length > 250) periodIndex = Math.min(250, dates.length - 1);
            else periodIndex = Math.min(20, dates.length - 1);

            const previousPrice = parseFloat(timeSeries[dates[periodIndex]]['4. close']);
            const periodReturn = ((lastPrice - previousPrice) / previousPrice) * 100;

            // Calcular retornos para diferentes períodos
            const weekIndex = Math.min(5, dates.length - 1);
            const monthIndex = Math.min(20, dates.length - 1);
            const yearIndex = Math.min(250, dates.length - 1);

            const weekPrice = parseFloat(timeSeries[dates[weekIndex]]['4. close']);
            const monthPrice = parseFloat(timeSeries[dates[monthIndex]]['4. close']);
            const yearPrice = dates.length > yearIndex ? parseFloat(timeSeries[dates[yearIndex]]['4. close']) : previousPrice;

            const weekReturn = ((lastPrice - weekPrice) / weekPrice) * 100;
            const monthReturn = ((lastPrice - monthPrice) / monthPrice) * 100;
            const yearReturn = ((lastPrice - yearPrice) / yearPrice) * 100;

            // Calcular volume médio
            let totalVolume = 0;
            let count = 0;
            for (let i = 0; i < Math.min(5, dates.length); i++) {
                totalVolume += parseInt(timeSeries[dates[i]]['5. volume']);
                count++;
            }
            const avgVolume = count > 0 ? totalVolume / count : 0;

            // Determinar tendência
            const trend = periodReturn > 0 ? 'Alta' : 'Baixa';

            // Obter informações adicionais do ativo
            const assetInfo = sectorMap[symbol] || { type: 'stocks', name: 'Outros' };

            // Adicionar ao resultado
            results.push({
                symbol: symbol,
                name: symbol.replace('.SA', '').replace('.', ' '),
                type: assetInfo.type,
                last_price: lastPrice,
                week_return: parseFloat(weekReturn.toFixed(2)),
                month_return: parseFloat(monthReturn.toFixed(2)),
                year_return: parseFloat(yearReturn.toFixed(2)),
                volume: avgVolume,
                trend: trend
            });

            // Aguardar um pouco para não exceder limites de taxa da API
            await new Promise(resolve => setTimeout(resolve, 500));

        } catch (error) {
            // Verificar se é um erro de limite de API
            if (error.message && (error.message.includes('Limite de API excedido') || error.message.includes('API call frequency'))) {
                console.warn(`Usando dados simulados para ${symbol} devido a limite de API`);
                // Mostrar mensagem de erro no UI
                const errorMessage = document.getElementById('error-message');
                if (errorMessage) errorMessage.classList.remove('hidden');
            } else if (error.message && error.message.includes('standard API rate limit is 25 requests per day')) {
                console.warn(`Limite diário da API excedido para ${symbol}. Usando dados simulados.`);
                // Mostrar mensagem de erro no UI
                const errorMessage = document.getElementById('error-message');
                if (errorMessage) errorMessage.classList.remove('hidden');
            } else {
                console.warn(`Erro ao obter dados para ${symbol}:`, error.message);
            }

            // Usar dados simulados para este símbolo
            const assetInfo = sectorMap[symbol] || { type: 'stocks', name: 'Outros' };

            results.push({
                symbol: symbol,
                name: symbol.replace('.SA', '').replace('.', ' '),
                type: assetInfo.type,
                last_price: symbol === 'AAPL' ? 175 + (Math.random() * 10 - 5) :
                           symbol === 'MSFT' ? 410 + (Math.random() * 15 - 7.5) :
                           symbol === 'GOOGL' ? 150 + (Math.random() * 8 - 4) :
                           symbol === 'AMZN' ? 180 + (Math.random() * 10 - 5) :
                           symbol === 'TSLA' ? 190 + (Math.random() * 15 - 7.5) :
                           symbol.includes('BTC') ? 65000 + (Math.random() * 3000 - 1500) :
                           100 + (Math.random() * 50 - 25),
                week_return: (Math.random() * 6 - 2),
                month_return: (Math.random() * 10 - 3),
                year_return: (Math.random() * 30 - 10),
                volume: 1000000 + (Math.random() * 10000000),
                trend: Math.random() > 0.4 ? 'Alta' : 'Baixa'
            });
        }
    }

    // Ordenar por retorno do período selecionado
    const returnField = period === 'week' ? 'week_return' : period === 'month' ? 'month_return' : 'year_return';
    results.sort((a, b) => b[returnField] - a[returnField]);

    // Salvar dados no cache
    CacheManager.saveToCache(cacheKey, results, CONFIG.cache.ttl.bestAssets);

    // Processar dados por categoria para garantir consistência
    const categoriesData = processCategoriesData(results, period);

    // Retornar objeto com estrutura consistente
    return {
        assets: results,
        categories: categoriesData
    };
}

/**
 * Carrega dados para a página de notícias
 */
async function loadNewsData(source = 'all', language = 'all', topic = 'all') {
    try {
        console.log(`Carregando dados de notícias (fonte: ${source}, idioma: ${language}, tópico: ${topic})...`);

        // Limpar cache de notícias para forçar nova chamada à API
        CacheManager.clearCacheByType('news');
        console.log('Cache de notícias limpo');

        // Verificar se devemos usar dados simulados diretamente
        // Isso evita erros de API desnecessários
        const useSimulatedData = false; // Tentar usar a API real primeiro

        let generalNews, financialNews;

        try {
            if (useSimulatedData) {
                // Usar diretamente dados simulados
                generalNews = simulateGeneralNews();
                // Criar dados financeiros a partir dos dados gerais
                financialNews = generalNews.map(news => ({
                    ...news,
                    impactScore: parseFloat((Math.random() * 10).toFixed(1)),
                    relevanceScore: parseFloat((Math.random() * 10).toFixed(1)),
                    marketReaction: Math.random() > 0.5 ? 'positive' : 'negative'
                }));
                console.log('Usando dados simulados para notícias');
            } else {
                // Tentar obter dados reais das APIs
                console.log('Tentando obter dados reais das APIs...');
                generalNews = await fetchGeneralNews(source, language, topic);
                financialNews = await fetchFinancialNews(source, language, topic);
                console.log('Dados reais obtidos com sucesso');
            }
        } catch (apiError) {
            console.error('Erro ao obter dados das APIs:', apiError);
            console.log('Usando dados simulados como fallback após erro na API');

            // Usar dados simulados como fallback
            generalNews = simulateGeneralNews();
            financialNews = generalNews.map(news => ({
                ...news,
                impactScore: parseFloat((Math.random() * 10).toFixed(1)),
                relevanceScore: parseFloat((Math.random() * 10).toFixed(1)),
                marketReaction: Math.random() > 0.5 ? 'positive' : 'negative'
            }));
        }

        // Verificar se financialNews é um array válido
        if (!financialNews || !Array.isArray(financialNews) || financialNews.length === 0) {
            console.warn('Dados de notícias financeiras inválidos ou vazios');
            // Criar dados simulados
            financialNews = simulateGeneralNews().map(news => ({
                ...news,
                impactScore: parseFloat((Math.random() * 10).toFixed(1)),
                relevanceScore: parseFloat((Math.random() * 10).toFixed(1)),
                marketReaction: Math.random() > 0.5 ? 'positive' : 'negative'
            }));
        }

        // Processar análise de sentimento
        const sentimentAnalysis = processSentimentAnalysis(financialNews);

        // Armazenar dados no objeto global (se não existir, criar)
        if (typeof window.newsData === 'undefined') {
            window.newsData = {};
        }

        window.newsData.general = generalNews;
        window.newsData.financial = financialNews;
        window.newsData.sentiment = sentimentAnalysis;
        window.newsData.filters = { source, language, topic };
        window.newsData.dataLoaded = true;
        window.newsData.lastUpdate = new Date();

        console.log('Dados de notícias carregados com sucesso');

        // Disparar evento de dados carregados
        const event = new CustomEvent('newsDataLoaded');
        document.dispatchEvent(event);

        return true;
    } catch (error) {
        console.error('Erro ao carregar dados de notícias:', error);

        // Mostrar mensagem de erro no UI
        const errorMessage = document.getElementById('error-message');
        if (errorMessage) errorMessage.classList.remove('hidden');

        // Tentar carregar dados simulados
        try {
            const generalNews = simulateGeneralNews(source, language, topic);
            const financialNews = generalNews.map(news => ({
                ...news,
                impactScore: parseFloat((Math.random() * 10).toFixed(1)),
                relevanceScore: parseFloat((Math.random() * 10).toFixed(1)),
                marketReaction: Math.random() > 0.5 ? 'positive' : 'negative'
            }));

            // Calcular análise de sentimento
            const sentimentAnalysis = {
                positive: generalNews.filter(n => n.sentiment === 'positive').length,
                negative: generalNews.filter(n => n.sentiment === 'negative').length,
                neutral: generalNews.filter(n => n.sentiment === 'neutral').length
            };

            window.newsData.general = generalNews;
            window.newsData.financial = financialNews;
            window.newsData.sentiment = sentimentAnalysis;
            window.newsData.filters = { source, language, topic };
            window.newsData.dataLoaded = true;
            window.newsData.lastUpdate = new Date();

            // Disparar evento de dados carregados
            const event = new CustomEvent('newsDataLoaded');
            document.dispatchEvent(event);

            return true;
        } catch (simError) {
            console.error('Erro ao carregar dados simulados de notícias:', simError);
            return false;
        }
    }
}

/**
 * Carrega apenas as notícias em destaque
 */
async function loadFeaturedNews() {
    try {
        console.log('Carregando notícias em destaque...');

        // Simular chamada para obter notícias em destaque
        const featuredNews = await fetchFeaturedNews();

        // Armazenar dados no objeto global (se não existir, criar)
        if (typeof window.newsData === 'undefined') {
            window.newsData = { dataLoaded: false };
        }

        window.newsData.featured = featuredNews;
        window.newsData.featuredLastUpdate = new Date();

        console.log('Notícias em destaque carregadas com sucesso');

        // Disparar evento de notícias em destaque carregadas
        const event = new CustomEvent('featuredNewsLoaded');
        document.dispatchEvent(event);

        return true;
    } catch (error) {
        console.error('Erro ao carregar notícias em destaque:', error);
        return false;
    }
}

// ===== Funções de simulação de API =====

/**
 * Obtém dados de índices de mercado da API do Yahoo Finance
 */
async function fetchIndicesData() {
    try {
        console.log('Obtendo dados de índices...');

        // Verificar se há dados em cache
        const cachedData = CacheManager.getFromCache('indices');
        if (cachedData) {
            console.log('Usando dados de índices do cache');
            return cachedData;
        }

        console.log('Obtendo dados de índices da API...');
        console.log('Usando API key Alpha Vantage:', CONFIG.apiKeys.alphaVantage);
        console.log('Proxy habilitado:', CONFIG.apiEndpoints.useProxy);

        // Lista de símbolos de índices que queremos obter
        const symbols = [
            '^GSPC',   // S&P 500
            '^DJI',    // Dow Jones
            '^IXIC',   // Nasdaq
            '^FTSE',   // FTSE 100
            '^GDAXI',  // DAX
            '^FCHI',   // CAC 40
            '^N225',   // Nikkei 225
            '^HSI',    // Hang Seng
            '^BVSP',   // Ibovespa
            '000001.SS' // SSE Composite
        ];

        // Mapeamento de símbolos para regiões e nomes completos
        const indexInfo = {
            '^GSPC': { name: 'S&P 500', region: 'US' },
            '^DJI': { name: 'Dow Jones', region: 'US' },
            '^IXIC': { name: 'Nasdaq', region: 'US' },
            '^FTSE': { name: 'FTSE 100', region: 'GB' },
            '^GDAXI': { name: 'DAX', region: 'DE' },
            '^FCHI': { name: 'CAC 40', region: 'FR' },
            '^N225': { name: 'Nikkei 225', region: 'JP' },
            '^HSI': { name: 'Hang Seng', region: 'HK' },
            '^BVSP': { name: 'Ibovespa', region: 'BR' },
            '000001.SS': { name: 'SSE Composite', region: 'CN' }
        };

        // Resultados
        const results = [];

        // Em um ambiente real, faríamos uma chamada para a API do Yahoo Finance
        // Como exemplo, vamos usar fetch para obter dados de cada índice
        for (const symbol of symbols) {
            try {
                // Construir URL para a API do Yahoo Finance
                // Usar proxy se configurado
                let url;
                if (CONFIG.apiEndpoints.useProxy) {
                    url = `${CONFIG.apiEndpoints.proxyYahooFinance}/chart/${symbol}?interval=1d&range=1mo`;
                } else {
                    url = `${CONFIG.apiEndpoints.yahooFinance}/chart/${symbol}?interval=1d&range=1mo`;
                }

                // Tentar fazer a chamada à API
                // Nota: Em um ambiente de desenvolvimento, isso pode falhar devido a restrições de CORS
                // Nesse caso, usamos dados simulados como fallback
                let response;
                try {
                    response = await fetch(url);

                    if (!response.ok) {
                        throw new Error(`Erro na API: ${response.status}`);
                    }

                    const data = await response.json();
                    const quote = data.chart.result[0].indicators.quote[0];
                    const meta = data.chart.result[0].meta;
                    const timestamps = data.chart.result[0].timestamp;

                    // Calcular retornos e volatilidade com base nos dados históricos
                    const lastPrice = meta.regularMarketPrice || quote.close[quote.close.length - 1];
                    const previousPrice = quote.close[0];
                    const periodReturn = ((lastPrice - previousPrice) / previousPrice) * 100;

                    // Calcular volatilidade (desvio padrão dos retornos diários)
                    const dailyReturns = [];
                    for (let i = 1; i < quote.close.length; i++) {
                        if (quote.close[i-1] && quote.close[i]) {
                            const dailyReturn = ((quote.close[i] - quote.close[i-1]) / quote.close[i-1]) * 100;
                            dailyReturns.push(dailyReturn);
                        }
                    }

                    // Calcular desvio padrão (volatilidade)
                    const avgReturn = dailyReturns.reduce((sum, val) => sum + val, 0) / dailyReturns.length;
                    const squaredDiffs = dailyReturns.map(val => Math.pow(val - avgReturn, 2));
                    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / squaredDiffs.length;
                    const volatility = Math.sqrt(variance) * Math.sqrt(252); // Anualizado

                    // Determinar tendência
                    const trend = periodReturn > 0 ? 'Alta' : 'Baixa';

                    // Adicionar ao resultado
                    results.push({
                        symbol: symbol,
                        name: indexInfo[symbol].name,
                        region: indexInfo[symbol].region,
                        last_price: lastPrice,
                        period_return: periodReturn,
                        week_return: periodReturn / 4, // Simplificação para exemplo
                        volatility: volatility,
                        trend: trend
                    });

                } catch (apiError) {
                    console.warn(`Erro ao obter dados da API para ${symbol}. Usando dados simulados como fallback.`, apiError);

                    // Usar dados simulados como fallback
                    results.push({
                        symbol: symbol,
                        name: indexInfo[symbol].name,
                        region: indexInfo[symbol].region,
                        last_price: symbol === '^GSPC' ? 5250 + (Math.random() * 50 - 25) :
                                   symbol === '^DJI' ? 39000 + (Math.random() * 300 - 150) :
                                   symbol === '^IXIC' ? 16500 + (Math.random() * 150 - 75) :
                                   symbol === '^FTSE' ? 7800 + (Math.random() * 80 - 40) :
                                   symbol === '^GDAXI' ? 18200 + (Math.random() * 180 - 90) :
                                   symbol === '^FCHI' ? 7900 + (Math.random() * 80 - 40) :
                                   symbol === '^N225' ? 38500 + (Math.random() * 350 - 175) :
                                   symbol === '^HSI' ? 16800 + (Math.random() * 160 - 80) :
                                   symbol === '^BVSP' ? 128000 + (Math.random() * 1200 - 600) :
                                   3100 + (Math.random() * 30 - 15), // 000001.SS
                        period_return: (Math.random() * 4 - 1),
                        week_return: (Math.random() * 2 - 0.5),
                        volatility: 10 + (Math.random() * 10),
                        trend: Math.random() > 0.4 ? 'Alta' : 'Baixa'
                    });
                }
            } catch (error) {
                console.error(`Erro ao processar índice ${symbol}:`, error);
            }
        }

        console.log(`Dados de ${results.length} índices obtidos com sucesso`);

        // Salvar dados no cache
        CacheManager.saveToCache('indices', results, CONFIG.cache.ttl.indices);

        return results;
    } catch (error) {
        console.error('Erro ao obter dados de índices:', error);

        // Em caso de erro, retornar dados simulados como fallback
        return simulateIndicesData();
    }
}

/**
 * Função de fallback para gerar dados simulados de índices
 */
function simulateIndicesData() {
    console.warn('Usando dados simulados para índices');
    return [
        {
            symbol: '^GSPC',
            name: 'S&P 500',
            region: 'US',
            last_price: 5250 + (Math.random() * 50 - 25),
            hours24_return: 0.3 + (Math.random() * 0.8 - 0.4),
            month_return: 2.5 + (Math.random() * 2 - 1),
            ytd_return: 8.2 + (Math.random() * 3 - 1.5),
            year12_return: 15.8 + (Math.random() * 5 - 2.5)
        },
        {
            symbol: '^DJI',
            name: 'Dow Jones',
            region: 'US',
            last_price: 39000 + (Math.random() * 300 - 150),
            hours24_return: 0.2 + (Math.random() * 0.6 - 0.3),
            month_return: 1.8 + (Math.random() * 2 - 1),
            ytd_return: 6.5 + (Math.random() * 3 - 1.5),
            year12_return: 12.4 + (Math.random() * 5 - 2.5)
        },
        {
            symbol: '^IXIC',
            name: 'Nasdaq',
            region: 'US',
            last_price: 16500 + (Math.random() * 150 - 75),
            hours24_return: 0.4 + (Math.random() * 1 - 0.5),
            month_return: 3.2 + (Math.random() * 2 - 1),
            ytd_return: 10.5 + (Math.random() * 3 - 1.5),
            year12_return: 18.7 + (Math.random() * 5 - 2.5)
        },
        {
            symbol: '^FTSE',
            name: 'FTSE 100',
            region: 'UK',
            last_price: 7800 + (Math.random() * 80 - 40),
            hours24_return: 0.1 + (Math.random() * 0.6 - 0.3),
            month_return: 1.2 + (Math.random() * 2 - 1),
            ytd_return: 4.7 + (Math.random() * 3 - 1.5),
            year12_return: 9.8 + (Math.random() * 5 - 2.5)
        },
        {
            symbol: '^GDAXI',
            name: 'DAX',
            region: 'EU',
            last_price: 18200 + (Math.random() * 180 - 90),
            hours24_return: 0.2 + (Math.random() * 0.8 - 0.4),
            month_return: 2.0 + (Math.random() * 2 - 1),
            ytd_return: 7.8 + (Math.random() * 3 - 1.5),
            year12_return: 14.2 + (Math.random() * 5 - 2.5)
        },
        {
            symbol: '^FCHI',
            name: 'CAC 40',
            region: 'EU',
            last_price: 7900 + (Math.random() * 80 - 40),
            hours24_return: 0.15 + (Math.random() * 0.7 - 0.35),
            month_return: 1.8 + (Math.random() * 2 - 1),
            ytd_return: 6.9 + (Math.random() * 3 - 1.5),
            year12_return: 13.4 + (Math.random() * 5 - 2.5)
        },
        {
            symbol: '^N225',
            name: 'Nikkei 225',
            region: 'JP',
            last_price: 38500 + (Math.random() * 350 - 175),
            hours24_return: 0.25 + (Math.random() * 0.9 - 0.45),
            month_return: 2.3 + (Math.random() * 2 - 1),
            ytd_return: 9.1 + (Math.random() * 3 - 1.5),
            year12_return: 17.5 + (Math.random() * 5 - 2.5)
        },
        {
            symbol: '^HSI',
            name: 'Hang Seng',
            region: 'HK',
            last_price: 16800 + (Math.random() * 160 - 80),
            hours24_return: -0.3 + (Math.random() * 1 - 0.5),
            month_return: -2.1 + (Math.random() * 2 - 1),
            ytd_return: -4.8 + (Math.random() * 3 - 1.5),
            year12_return: -11.3 + (Math.random() * 5 - 2.5)
        },
        {
            symbol: '^BVSP',
            name: 'Ibovespa',
            region: 'BR',
            last_price: 128000 + (Math.random() * 1200 - 600),
            hours24_return: 0.3 + (Math.random() * 0.8 - 0.4),
            month_return: 1.9 + (Math.random() * 2 - 1),
            ytd_return: 5.4 + (Math.random() * 3 - 1.5),
            year12_return: 12.8 + (Math.random() * 5 - 2.5)
        }
    ];
}

/**
 * Obtém dados de ações da API do Yahoo Finance
 */
async function fetchStocksData() {
    try {
        console.log('Obtendo dados de ações...');

        // Verificar se há dados em cache
        const cachedData = CacheManager.getFromCache('stocks');
        if (cachedData) {
            console.log('Usando dados de ações do cache');
            return cachedData;
        }

        console.log('Obtendo dados de ações da API...');

        // Lista de símbolos de ações que queremos obter
        const symbols = [
            'AAPL',     // Apple
            'MSFT',     // Microsoft
            'GOOGL',    // Alphabet
            'AMZN',     // Amazon
            'TSLA',     // Tesla
            'PETR4.SA', // Petrobras
            'VALE3.SA', // Vale
            'ITUB4.SA'  // Itaú Unibanco
        ];

        // Mapeamento de símbolos para informações adicionais
        const stockInfo = {
            'AAPL': { name: 'Apple', region: 'US', sector: 'Tecnologia' },
            'MSFT': { name: 'Microsoft', region: 'US', sector: 'Tecnologia' },
            'GOOGL': { name: 'Alphabet', region: 'US', sector: 'Tecnologia' },
            'AMZN': { name: 'Amazon', region: 'US', sector: 'Comércio' },
            'TSLA': { name: 'Tesla', region: 'US', sector: 'Automotivo' },
            'PETR4.SA': { name: 'Petrobras', region: 'BR', sector: 'Energia' },
            'VALE3.SA': { name: 'Vale', region: 'BR', sector: 'Mineração' },
            'ITUB4.SA': { name: 'Itaú Unibanco', region: 'BR', sector: 'Financeiro' }
        };

        // Resultados
        const results = [];

        // Em um ambiente real, faríamos uma chamada para a API do Yahoo Finance
        // Como exemplo, vamos usar fetch para obter dados de cada ação
        for (const symbol of symbols) {
            try {
                // Construir URL para a API do Yahoo Finance
                // Usar proxy se configurado
                let url;
                if (CONFIG.apiEndpoints.useProxy) {
                    url = `${CONFIG.apiEndpoints.proxyYahooFinance}/chart/${symbol}?interval=1d&range=1mo`;
                } else {
                    url = `${CONFIG.apiEndpoints.yahooFinance}/chart/${symbol}?interval=1d&range=1mo`;
                }

                // Tentar fazer a chamada à API
                // Nota: Em um ambiente de desenvolvimento, isso pode falhar devido a restrições de CORS
                // Nesse caso, usamos dados simulados como fallback
                let response;
                try {
                    response = await fetch(url);

                    if (!response.ok) {
                        throw new Error(`Erro na API: ${response.status}`);
                    }

                    const data = await response.json();
                    const quote = data.chart.result[0].indicators.quote[0];
                    const meta = data.chart.result[0].meta;
                    const timestamps = data.chart.result[0].timestamp;

                    // Calcular retornos e volatilidade com base nos dados históricos
                    const lastPrice = meta.regularMarketPrice || quote.close[quote.close.length - 1];
                    const previousPrice = quote.close[0];
                    const periodReturn = ((lastPrice - previousPrice) / previousPrice) * 100;

                    // Calcular volatilidade (desvio padrão dos retornos diários)
                    const dailyReturns = [];
                    for (let i = 1; i < quote.close.length; i++) {
                        if (quote.close[i-1] && quote.close[i]) {
                            const dailyReturn = ((quote.close[i] - quote.close[i-1]) / quote.close[i-1]) * 100;
                            dailyReturns.push(dailyReturn);
                        }
                    }

                    // Calcular desvio padrão (volatilidade)
                    const avgReturn = dailyReturns.reduce((sum, val) => sum + val, 0) / dailyReturns.length;
                    const squaredDiffs = dailyReturns.map(val => Math.pow(val - avgReturn, 2));
                    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / squaredDiffs.length;
                    const volatility = Math.sqrt(variance) * Math.sqrt(252); // Anualizado

                    // Calcular volume médio
                    const avgVolume = quote.volume.reduce((sum, val) => sum + (val || 0), 0) /
                                     quote.volume.filter(vol => vol !== null && vol !== undefined).length;

                    // Determinar tendência
                    const trend = periodReturn > 0 ? 'Alta' : 'Baixa';

                    // Adicionar ao resultado
                    results.push({
                        symbol: symbol,
                        name: stockInfo[symbol].name,
                        region: stockInfo[symbol].region,
                        sector: stockInfo[symbol].sector,
                        last_price: lastPrice,
                        period_return: periodReturn,
                        week_return: periodReturn / 4, // Simplificação para exemplo
                        volatility: volatility,
                        avg_volume: avgVolume,
                        trend: trend
                    });

                } catch (apiError) {
                    console.warn(`Erro ao obter dados da API para ${symbol}. Usando dados simulados como fallback.`, apiError);

                    // Usar dados simulados como fallback
                    results.push({
                        symbol: symbol,
                        name: stockInfo[symbol].name,
                        region: stockInfo[symbol].region,
                        sector: stockInfo[symbol].sector,
                        last_price: symbol === 'AAPL' ? 175 + (Math.random() * 10 - 5) :
                                   symbol === 'MSFT' ? 410 + (Math.random() * 15 - 7.5) :
                                   symbol === 'GOOGL' ? 150 + (Math.random() * 8 - 4) :
                                   symbol === 'AMZN' ? 180 + (Math.random() * 10 - 5) :
                                   symbol === 'TSLA' ? 190 + (Math.random() * 15 - 7.5) :
                                   symbol === 'PETR4.SA' ? 35 + (Math.random() * 2 - 1) :
                                   symbol === 'VALE3.SA' ? 65 + (Math.random() * 3 - 1.5) :
                                   32 + (Math.random() * 1.5 - 0.75), // ITUB4.SA
                        period_return: (Math.random() * 6 - 2),
                        week_return: (Math.random() * 3 - 1),
                        volatility: 20 + (Math.random() * 10),
                        avg_volume: symbol === 'AAPL' ? 80000000 + (Math.random() * 10000000) :
                                   symbol === 'MSFT' ? 30000000 + (Math.random() * 5000000) :
                                   symbol === 'GOOGL' ? 25000000 + (Math.random() * 5000000) :
                                   symbol === 'AMZN' ? 40000000 + (Math.random() * 8000000) :
                                   symbol === 'TSLA' ? 100000000 + (Math.random() * 20000000) :
                                   symbol === 'PETR4.SA' ? 50000000 + (Math.random() * 10000000) :
                                   symbol === 'VALE3.SA' ? 40000000 + (Math.random() * 8000000) :
                                   30000000 + (Math.random() * 6000000), // ITUB4.SA
                        trend: Math.random() > 0.4 ? 'Alta' : 'Baixa'
                    });
                }
            } catch (error) {
                console.error(`Erro ao processar ação ${symbol}:`, error);
            }
        }

        console.log(`Dados de ${results.length} ações obtidos com sucesso`);

        // Salvar dados no cache
        CacheManager.saveToCache('stocks', results, CONFIG.cache.ttl.stocks);

        return results;
    } catch (error) {
        console.error('Erro ao obter dados de ações:', error);

        // Em caso de erro, retornar dados simulados como fallback
        return simulateStocksData();
    }
}

/**
 * Função de fallback para gerar dados simulados de ações
 */
function simulateStocksData() {
    console.warn('Usando dados simulados para ações');
    return [
        {
            symbol: 'AAPL',
            name: 'Apple',
            region: 'US',
            last_price: 175 + (Math.random() * 10 - 5),
            period_return: 3.5 + (Math.random() * 3 - 1.5),
            week_return: 1.2 + (Math.random() * 1.5 - 0.75),
            volatility: 20 + (Math.random() * 4 - 2),
            avg_volume: 80000000 + (Math.random() * 10000000),
            trend: Math.random() > 0.3 ? 'Alta' : 'Baixa',
            sector: 'Tecnologia'
        },
        {
            symbol: 'MSFT',
            name: 'Microsoft',
            region: 'US',
            last_price: 410 + (Math.random() * 15 - 7.5),
            period_return: 4.2 + (Math.random() * 3 - 1.5),
            week_return: 1.5 + (Math.random() * 1.5 - 0.75),
            volatility: 18 + (Math.random() * 4 - 2),
            avg_volume: 30000000 + (Math.random() * 5000000),
            trend: Math.random() > 0.3 ? 'Alta' : 'Baixa',
            sector: 'Tecnologia'
        },
        // Outras ações simuladas...
        {
            symbol: 'ITUB4.SA',
            name: 'Itaú Unibanco',
            region: 'BR',
            last_price: 32 + (Math.random() * 1.5 - 0.75),
            period_return: 1.5 + (Math.random() * 3 - 1.5),
            week_return: 0.4 + (Math.random() * 1.5 - 0.75),
            volatility: 22 + (Math.random() * 4 - 2),
            avg_volume: 30000000 + (Math.random() * 6000000),
            trend: Math.random() > 0.4 ? 'Alta' : 'Baixa',
            sector: 'Financeiro'
        }
    ];
}

/**
 * Simula uma chamada para obter dados de ativos para a página de melhores ativos
 */
async function fetchAssetsData(period, assetType) {
    // Verificar se há dados em cache
    const cacheKey = `assets_simulated_${period}_${assetType}`;
    const cachedData = CacheManager.getFromCache(cacheKey);

    if (cachedData) {
        console.log('Usando dados simulados de ativos do cache');
        return cachedData;
    }

    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 600));

    // Base de ativos
    const allAssets = [
        // Ações
        {
            symbol: 'AAPL',
            name: 'Apple',
            type: 'stocks',
            last_price: 175 + (Math.random() * 10 - 5),
            week_return: 1.2 + (Math.random() * 3 - 1),
            month_return: 3.5 + (Math.random() * 5 - 2),
            year_return: 15.8 + (Math.random() * 10 - 5),
            volume: 80000000 + (Math.random() * 10000000),
            trend: Math.random() > 0.3 ? 'Alta' : 'Baixa'
        },
        {
            symbol: 'MSFT',
            name: 'Microsoft',
            type: 'stocks',
            last_price: 410 + (Math.random() * 15 - 7.5),
            week_return: 1.5 + (Math.random() * 3 - 1),
            month_return: 4.2 + (Math.random() * 5 - 2),
            year_return: 20.5 + (Math.random() * 10 - 5),
            volume: 30000000 + (Math.random() * 5000000),
            trend: Math.random() > 0.3 ? 'Alta' : 'Baixa'
        },
        {
            symbol: 'NVDA',
            name: 'NVIDIA',
            type: 'stocks',
            last_price: 880 + (Math.random() * 40 - 20),
            week_return: 2.8 + (Math.random() * 3 - 1),
            month_return: 8.5 + (Math.random() * 5 - 2),
            year_return: 150 + (Math.random() * 30 - 15),
            volume: 50000000 + (Math.random() * 10000000),
            trend: Math.random() > 0.2 ? 'Alta' : 'Baixa'
        },

        // Criptomoedas
        {
            symbol: 'BTC',
            name: 'Bitcoin',
            type: 'crypto',
            last_price: 65000 + (Math.random() * 3000 - 1500),
            week_return: 3.5 + (Math.random() * 6 - 3),
            month_return: 10.2 + (Math.random() * 10 - 5),
            year_return: 45.8 + (Math.random() * 20 - 10),
            volume: 30000000000 + (Math.random() * 5000000000),
            trend: Math.random() > 0.4 ? 'Alta' : 'Baixa'
        },
        {
            symbol: 'ETH',
            name: 'Ethereum',
            type: 'crypto',
            last_price: 3500 + (Math.random() * 200 - 100),
            week_return: 4.2 + (Math.random() * 6 - 3),
            month_return: 12.5 + (Math.random() * 10 - 5),
            year_return: 40.2 + (Math.random() * 20 - 10),
            volume: 15000000000 + (Math.random() * 3000000000),
            trend: Math.random() > 0.4 ? 'Alta' : 'Baixa'
        },

        // Fundos Imobiliários
        {
            symbol: 'KNRI11.SA',
            name: 'Kinea Renda Imobiliária',
            type: 'reits',
            last_price: 140 + (Math.random() * 5 - 2.5),
            week_return: 0.8 + (Math.random() * 2 - 1),
            month_return: 2.5 + (Math.random() * 3 - 1.5),
            year_return: 12.5 + (Math.random() * 8 - 4),
            volume: 10000000 + (Math.random() * 2000000),
            trend: Math.random() > 0.4 ? 'Alta' : 'Baixa'
        },
        {
            symbol: 'HGLG11.SA',
            name: 'CSHG Logística',
            type: 'reits',
            last_price: 170 + (Math.random() * 6 - 3),
            week_return: 0.9 + (Math.random() * 2 - 1),
            month_return: 2.8 + (Math.random() * 3 - 1.5),
            year_return: 13.2 + (Math.random() * 8 - 4),
            volume: 8000000 + (Math.random() * 1500000),
            trend: Math.random() > 0.4 ? 'Alta' : 'Baixa'
        },

        // ETFs
        {
            symbol: 'SPY',
            name: 'SPDR S&P 500 ETF',
            type: 'etfs',
            last_price: 520 + (Math.random() * 15 - 7.5),
            week_return: 1.1 + (Math.random() * 2 - 1),
            month_return: 3.2 + (Math.random() * 3 - 1.5),
            year_return: 15.5 + (Math.random() * 8 - 4),
            volume: 100000000 + (Math.random() * 20000000),
            trend: Math.random() > 0.3 ? 'Alta' : 'Baixa'
        },
        {
            symbol: 'QQQ',
            name: 'Invesco QQQ Trust',
            type: 'etfs',
            last_price: 430 + (Math.random() * 15 - 7.5),
            week_return: 1.3 + (Math.random() * 2 - 1),
            month_return: 3.8 + (Math.random() * 3 - 1.5),
            year_return: 18.2 + (Math.random() * 8 - 4),
            volume: 80000000 + (Math.random() * 15000000),
            trend: Math.random() > 0.3 ? 'Alta' : 'Baixa'
        },

        // Ouro e derivados
        {
            symbol: 'GC=F',
            name: 'Gold Futures',
            type: 'gold',
            last_price: 2300 + (Math.random() * 50 - 25),
            week_return: 0.7 + (Math.random() * 2 - 1),
            month_return: 2.1 + (Math.random() * 3 - 1.5),
            year_return: 10.5 + (Math.random() * 8 - 4),
            volume: 200000 + (Math.random() * 50000),
            trend: Math.random() > 0.4 ? 'Alta' : 'Baixa'
        },
        {
            symbol: 'GLD',
            name: 'SPDR Gold Shares',
            type: 'gold',
            last_price: 215 + (Math.random() * 8 - 4),
            week_return: 0.6 + (Math.random() * 2 - 1),
            month_return: 2.0 + (Math.random() * 3 - 1.5),
            year_return: 9.8 + (Math.random() * 8 - 4),
            volume: 8000000 + (Math.random() * 1500000),
            trend: Math.random() > 0.4 ? 'Alta' : 'Baixa'
        },

        // Renda Fixa
        {
            symbol: 'IPCA+',
            name: 'Tesouro IPCA+',
            type: 'fixed-income',
            last_price: 1000 + (Math.random() * 10 - 5),
            week_return: 0.2 + (Math.random() * 0.4 - 0.2),
            month_return: 0.9 + (Math.random() * 0.6 - 0.3),
            year_return: 11.2 + (Math.random() * 2 - 1),
            volume: null,
            trend: 'Alta'
        },
        {
            symbol: 'CDI',
            name: 'Certificado de Depósito Interbancário',
            type: 'fixed-income',
            last_price: 1000 + (Math.random() * 5 - 2.5),
            week_return: 0.18 + (Math.random() * 0.04 - 0.02),
            month_return: 0.8 + (Math.random() * 0.1 - 0.05),
            year_return: 10.5 + (Math.random() * 1 - 0.5),
            volume: null,
            trend: 'Alta'
        }
    ];

    // Filtrar por tipo de ativo
    let filteredAssets = allAssets;
    if (assetType !== 'all') {
        filteredAssets = allAssets.filter(asset => asset.type === assetType);
    }

    // Ordenar por retorno do período selecionado
    const returnField = period === 'week' ? 'week_return' : period === 'month' ? 'month_return' : 'year_return';
    filteredAssets.sort((a, b) => b[returnField] - a[returnField]);

    // Salvar dados no cache
    CacheManager.saveToCache(cacheKey, filteredAssets, CONFIG.cache.ttl.bestAssets);

    // Processar dados por categoria para garantir consistência
    const categoriesData = processCategoriesData(filteredAssets, period);

    // Retornar objeto com estrutura consistente
    return {
        assets: filteredAssets,
        categories: categoriesData
    };
}

/**
 * Obtém notícias gerais da API de notícias
 */
async function fetchGeneralNews(source, language, topic) {
    try {
        console.log(`Obtendo notícias gerais (fonte: ${source}, idioma: ${language}, tópico: ${topic})...`);

        // Verificar se há dados em cache
        const cacheKey = `news_${source}_${language}_${topic}`;
        const cachedData = CacheManager.getFromCache(cacheKey);
        if (cachedData) {
            console.log('Usando notícias do cache');
            return cachedData;
        }

        // Tentar obter notícias usando o sistema de rotação de APIs
        try {
            // Construir parâmetros para a API de notícias
            const params = {
                topic: 'business',
                lang: language !== 'all' ? language : 'en',
                country: 'us,br' // Obter notícias dos EUA e Brasil
            };

            // Obter URL e nome da API usando o gerenciador de APIs
            const apiInfo = ApiManager.buildApiUrl('news', 'top-headlines', params);
            const url = apiInfo.url;
            const apiName = apiInfo.apiName;

            console.log(`Usando API de notícias: ${apiName}`);
            console.log(`Chamadas restantes hoje: ${CONFIG.apiRotation.dailyLimits[apiName] - (CONFIG.apiRotation.callCount[apiName] || 0)}`);

            // Removido código para Financial Modeling Prep API

            // Verificar se estamos solicitando InfoMoney ou Investing.com
            if (source === 'infomoney' || source === 'investing') {
                // Para InfoMoney e Investing.com, usamos dados simulados diretamente
                console.log(`Usando dados simulados para ${CONFIG.newsSources[source].name}`);
                return simulateGeneralNews(source, language, topic);
            }

            // Para GNews API, precisamos ajustar os parâmetros
            let apiUrl = url; // Criar uma cópia da URL original

            if (apiName === 'gnews') {
                // Criar uma nova URL com os parâmetros corretos para GNews
                apiUrl = `${CONFIG.apiEndpoints.gnews}/top-headlines?`;

                // Adicionar parâmetros obrigatórios
                apiUrl += `apikey=${CONFIG.apiKeys.gnews}`;
                apiUrl += `&topic=business`; // Sempre usar business como tópico

                // Adicionar idioma se especificado
                if (language !== 'all') {
                    apiUrl += `&lang=${language}`;
                } else {
                    apiUrl += `&lang=en`; // Padrão em inglês
                }

                // Adicionar países (sempre incluir EUA e Brasil)
                apiUrl += `&country=us,br`;

                // Adicionar número máximo de notícias
                apiUrl += `&max=${CONFIG.display.maxNewsItems || 10}`;

                console.log('URL da GNews API ajustada:', apiUrl);
            }

            // Fazer a chamada à API
            console.log('Chamando API com URL:', apiUrl);
            if (apiName === 'gnews') {
                console.log('Usando GNews API key:', CONFIG.apiKeys.gnews);
            }

            let response;
            try {
                response = await fetch(apiUrl);
                console.log('Resposta da API recebida, status:', response.status);

                if (!response.ok) {
                    console.error(`Erro na API de notícias: ${response.status}`);
                    throw new Error(`Erro na API de notícias: ${response.status}`);
                }

                console.log('Resposta recebida da GNews API com sucesso');
            } catch (fetchError) {
                console.error('Erro ao fazer fetch da API:', fetchError);
                throw fetchError;
            }

            const data = await response.json();

            // Processar resultados da API
            console.log('Processando dados da API:', data);

            // Verificar se a resposta contém artigos válidos
            if (!data.articles || !Array.isArray(data.articles) || data.articles.length === 0) {
                console.warn('Resposta da API não contém artigos válidos:', data);
                throw new Error('Resposta da API não contém artigos válidos');
            }

            const newsItems = data.articles.map(article => {
                console.log('Processando artigo:', article);

                // Extrair todos os campos disponíveis
                const originalSource = article.source?.name || 'Fonte desconhecida';
                const author = article.author || 'Autor desconhecido';
                const content = article.content || '';
                const urlToImage = article.urlToImage || '';

                // Determinar fonte
                let newsSource = 'other';
                for (const [key, sourceInfo] of Object.entries(CONFIG.newsSources)) {
                    if (originalSource.toLowerCase().includes(sourceInfo.name.toLowerCase())) {
                        newsSource = key;
                        break;
                    }
                }

                // Se a fonte for 'other', usar o nome original como sourceName
                const sourceName = newsSource === 'other' ? originalSource : (CONFIG.newsSources[newsSource]?.name || originalSource);

                // Determinar idioma com base na fonte e conteúdo
                let newsLanguage = 'en'; // Padrão em inglês

                // Verificar fontes brasileiras conhecidas
                if (originalSource.includes('G1') ||
                    originalSource.includes('InfoMoney') ||
                    originalSource.includes('Valor') ||
                    originalSource.includes('Folha') ||
                    originalSource.includes('UOL')) {
                    newsLanguage = 'pt';
                }

                // Verificar palavras em português no título ou descrição
                const ptWords = ['da', 'do', 'para', 'com', 'em', 'no', 'na', 'os', 'as', 'um', 'uma'];
                const titleAndDesc = (article.title + ' ' + (article.description || '')).toLowerCase();
                if (ptWords.some(word => {
                    const regex = new RegExp(`\\b${word}\\b`, 'i');
                    return regex.test(titleAndDesc);
                })) {
                    newsLanguage = 'pt';
                }

                // Determinar tópicos de forma mais abrangente
                const newsTopics = [];

                // Palavras-chave para cada tópico
                const topicKeywords = {
                    stocks: ['stock', 'stocks', 'ações', 'ação', 'bolsa', 'equity', 'market', 'mercado', 'ibovespa', 'nasdaq', 'dow jones', 's&p', 'nyse'],
                    crypto: ['crypto', 'bitcoin', 'ethereum', 'btc', 'eth', 'blockchain', 'token', 'criptomoeda', 'altcoin', 'defi', 'nft'],
                    gold: ['gold', 'ouro', 'precious metal', 'metal precioso', 'bullion'],
                    economy: ['economy', 'economic', 'economia', 'econômico', 'gdp', 'pib', 'inflation', 'inflação', 'interest rate', 'taxa de juros', 'fed', 'central bank', 'banco central'],
                    reits: ['reit', 'real estate', 'imóveis', 'fii', 'fundo imobiliário', 'property'],
                    'fixed-income': ['bond', 'título', 'treasury', 'tesouro', 'fixed income', 'renda fixa', 'yield', 'rendimento', 'selic', 'cdi'],
                    etfs: ['etf', 'exchange traded fund', 'index fund', 'fundo de índice'],
                    commodities: ['commodity', 'commodities', 'oil', 'petróleo', 'gas', 'gás', 'agricultural', 'agrícola', 'soybean', 'soja', 'corn', 'milho']
                };

                // Verificar o texto completo para identificar tópicos
                const fullText = (article.title + ' ' + (article.description || '') + ' ' + (article.content || '')).toLowerCase();

                // Adicionar tópicos encontrados
                for (const [topic, keywords] of Object.entries(topicKeywords)) {
                    if (keywords.some(keyword => fullText.includes(keyword))) {
                        newsTopics.push(topic);
                    }
                }

                // Adicionar 'economy' como tópico padrão se nenhum outro for encontrado
                if (newsTopics.length === 0) {
                    newsTopics.push('economy');
                }

                // Análise de sentimento mais sofisticada
                let sentiment = 'neutral';

                // Palavras que indicam sentimento positivo
                const positiveWords = [
                    'rise', 'gain', 'surge', 'jump', 'high', 'record', 'growth', 'boost', 'improve', 'recovery', 'positive', 'bullish', 'rally',
                    'sobe', 'alta', 'crescimento', 'aumento', 'melhora', 'recuperação', 'positivo', 'otimista', 'valorização'
                ];

                // Palavras que indicam sentimento negativo
                const negativeWords = [
                    'fall', 'drop', 'decline', 'plunge', 'low', 'loss', 'crash', 'bearish', 'negative', 'concern', 'worry', 'fear', 'risk', 'crisis',
                    'cai', 'queda', 'redução', 'diminuição', 'perda', 'negativo', 'pessimista', 'preocupação', 'risco', 'crise'
                ];

                // Contar ocorrências de palavras positivas e negativas
                let positiveCount = 0;
                let negativeCount = 0;

                positiveWords.forEach(word => {
                    const regex = new RegExp(`\\b${word}\\b`, 'gi');
                    const matches = fullText.match(regex);
                    if (matches) positiveCount += matches.length;
                });

                negativeWords.forEach(word => {
                    const regex = new RegExp(`\\b${word}\\b`, 'gi');
                    const matches = fullText.match(regex);
                    if (matches) negativeCount += matches.length;
                });

                // Determinar sentimento com base na contagem
                if (positiveCount > negativeCount + 1) {
                    sentiment = 'positive';
                } else if (negativeCount > positiveCount + 1) {
                    sentiment = 'negative';
                }

                return {
                    // Campos básicos
                    source: newsSource,
                    language: newsLanguage,
                    title: article.title,
                    description: article.description || 'Sem descrição disponível',
                    url: article.url,
                    publishedAt: article.publishedAt,

                    // Campos adicionais da API
                    author: author,
                    content: content,
                    urlToImage: urlToImage,
                    originalSource: originalSource,
                    sourceName: sourceName, // Usar o nome da fonte determinado acima

                    // Campos de análise
                    topics: newsTopics,
                    sentiment: sentiment,
                    positiveScore: positiveCount,
                    negativeScore: negativeCount,
                    sentimentScore: positiveCount - negativeCount
                };
            });

            // Aplicar filtros adicionais
            let filteredNews = newsItems;

            if (topic !== 'all') {
                filteredNews = filteredNews.filter(news => news.topics.includes(topic));
            }

            // Ordenar por data de publicação (mais recentes primeiro)
            filteredNews.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

            // Salvar dados no cache
            CacheManager.saveToCache(cacheKey, filteredNews, CONFIG.cache.ttl.news);

            return filteredNews;

        } catch (apiError) {
            console.warn('Erro ao obter notícias da API. Usando dados simulados como fallback.', apiError);

            // Verificar se é um erro de limite de API
            if (apiError.message && apiError.message.includes('429')) {
                console.warn('Limite de API excedido para GNews API. Usando dados simulados.');
                // Mostrar mensagem de erro no UI
                const errorMessage = document.getElementById('error-message');
                if (errorMessage) errorMessage.classList.remove('hidden');
            }

            return simulateGeneralNews(source, language, topic);
        }
    } catch (error) {
        console.error('Erro ao obter notícias gerais:', error);
        return simulateGeneralNews(source, language, topic);
    }
}

// Função fetchFinancialModelingPrepNews removida - usando apenas GNews API

/**
 * Função de fallback para gerar notícias simuladas
 */
function simulateGeneralNews(source, language, topic) {
    console.warn('Usando notícias simuladas');

    // Adicionar notícias dinâmicas para InfoMoney e Investing.com
    if (source === 'infomoney' || source === 'investing') {
        console.log(`Gerando notícias simuladas específicas para ${source}`);
    }

    // Notícias simuladas
    const allNews = [
        // InfoMoney (pt-BR)
        {
            source: 'infomoney',
            language: 'pt',
            title: 'Ibovespa sobe impulsionado por commodities e expectativa de corte de juros',
            description: 'O principal índice da bolsa brasileira avançou com forte desempenho das ações de mineração e petróleo, além da expectativa de corte na taxa Selic.',
            url: 'https://www.infomoney.com.br/mercados/ibovespa-sobe-impulsionado-por-commodities-e-expectativa-de-corte-de-juros/',
            publishedAt: new Date(Date.now() - 3600000).toISOString(),
            topics: ['stocks', 'economy'],
            sentiment: 'positive'
        },
        {
            source: 'infomoney',
            language: 'pt',
            title: 'Bitcoin atinge nova máxima histórica após aprovação de ETF',
            description: 'A principal criptomoeda do mundo superou os US$ 70 mil após a SEC aprovar novos ETFs de Bitcoin à vista nos Estados Unidos.',
            url: 'https://www.infomoney.com.br/mercados/bitcoin-atinge-nova-maxima-historica-apos-aprovacao-de-etf/',
            publishedAt: new Date(Date.now() - 7200000).toISOString(),
            topics: ['crypto'],
            sentiment: 'positive'
        },

        // BBC (en-GB)
        {
            source: 'bbc',
            language: 'en',
            title: 'US Federal Reserve signals potential interest rate cuts',
            description: 'The Federal Reserve has indicated it may begin cutting interest rates later this year as inflation shows signs of cooling.',
            url: 'https://www.bbc.com/news/business/us-federal-reserve-signals-potential-interest-rate-cuts',
            publishedAt: new Date(Date.now() - 5400000).toISOString(),
            topics: ['economy'],
            sentiment: 'positive'
        },
        // Investing.com (en-US)
        {
            source: 'investing',
            language: 'en',
            title: 'S&P 500 hits record high as tech stocks rally',
            description: 'The S&P 500 reached a new all-time high today as technology stocks continued their upward momentum, driven by strong earnings reports.',
            url: 'https://www.investing.com/indices/us-spx-500',
            publishedAt: new Date(Date.now() - 2800000).toISOString(),
            topics: ['stocks'],
            sentiment: 'positive'
        },
        {
            source: 'investing',
            language: 'en',
            title: 'Oil prices drop on increased supply concerns',
            description: 'Crude oil prices fell sharply today as OPEC+ members consider increasing production quotas amid growing global economic uncertainty.',
            url: 'https://www.investing.com/commodities/crude-oil',
            publishedAt: new Date(Date.now() - 4500000).toISOString(),
            topics: ['commodities'],
            sentiment: 'negative'
        },
        {
            source: 'investing',
            language: 'en',
            title: 'Gold reaches six-month high on inflation fears',
            description: 'Gold prices climbed to a six-month high as investors seek safe-haven assets amid persistent inflation concerns and geopolitical tensions.',
            url: 'https://www.investing.com/commodities/gold',
            publishedAt: new Date(Date.now() - 6300000).toISOString(),
            topics: ['gold', 'commodities'],
            sentiment: 'positive'
        },
        {
            source: 'investing',
            language: 'en',
            title: 'Fed minutes reveal divided opinions on rate path',
            description: 'The latest Federal Reserve meeting minutes show committee members are divided on the future path of interest rates, with some favoring more aggressive cuts.',
            url: 'https://www.investing.com/economic-calendar/fomc-meeting-minutes-108',
            publishedAt: new Date(Date.now() - 8100000).toISOString(),
            topics: ['economy', 'fixed-income'],
            sentiment: 'neutral'
        },

        // InfoMoney (pt-BR) - Mais notícias
        {
            source: 'infomoney',
            language: 'pt',
            title: 'Petrobras anuncia novo plano de investimentos com foco em transição energética',
            description: 'A estatal prevê investir R$ 80 bilhões nos próximos cinco anos em projetos de energia renovável e redução de emissões de carbono.',
            url: 'https://www.infomoney.com.br/mercados/petroleo-e-gas/',
            publishedAt: new Date(Date.now() - 9000000).toISOString(),
            topics: ['stocks', 'commodities'],
            sentiment: 'positive'
        },
        {
            source: 'infomoney',
            language: 'pt',
            title: 'Tesouro Direto: títulos públicos registram forte demanda após corte na Selic',
            description: 'Investidores buscam garantir rendimentos mais altos antes de possíveis novos cortes na taxa básica de juros pelo Banco Central.',
            url: 'https://www.infomoney.com.br/onde-investir/renda-fixa/',
            publishedAt: new Date(Date.now() - 10800000).toISOString(),
            topics: ['fixed-income', 'economy'],
            sentiment: 'neutral'
        },
        {
            source: 'infomoney',
            language: 'pt',
            title: 'Fundos imobiliários de logística lideram rentabilidade no primeiro trimestre',
            description: 'FIIs do segmento logístico apresentaram retorno médio de 8,5% no período, superando outros setores como shopping centers e láminas comerciais.',
            url: 'https://www.infomoney.com.br/onde-investir/fundos-imobiliarios/',
            publishedAt: new Date(Date.now() - 12600000).toISOString(),
            topics: ['reits'],
            sentiment: 'positive'
        },
        {
            source: 'infomoney',
            language: 'pt',
            title: 'ETFs de índices internacionais ganham popularidade entre investidores brasileiros',
            description: 'Produtos que replicam índices estrangeiros como S&P 500 e Nasdaq registram aumento de 150% no volume negociado na B3 nos últimos 12 meses.',
            url: 'https://www.infomoney.com.br/onde-investir/etfs/',
            publishedAt: new Date(Date.now() - 14400000).toISOString(),
            topics: ['etfs', 'stocks'],
            sentiment: 'positive'
        },

        // Outras notícias simuladas...
    ];

    // Aplicar filtros
    let filteredNews = allNews;

    if (source !== 'all') {
        filteredNews = filteredNews.filter(news => news.source === source);
    }

    if (language !== 'all') {
        filteredNews = filteredNews.filter(news => news.language === language);
    }

    if (topic !== 'all') {
        filteredNews = filteredNews.filter(news => news.topics.includes(topic));
    }

    // Ordenar por data de publicação (mais recentes primeiro)
    filteredNews.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    // Adicionar campos adicionais necessários para cada notícia
    filteredNews = filteredNews.map(news => {
        // Determinar o nome da fonte para exibição
        let sourceName = news.sourceName;
        if (!sourceName) {
            if (news.originalSource) {
                sourceName = news.originalSource;
            } else if (CONFIG.newsSources[news.source]) {
                sourceName = CONFIG.newsSources[news.source].name;
            } else {
                // Formatar o nome da fonte se não estiver no mapeamento
                sourceName = news.source.split('-').map(word =>
                    word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ');
            }
        }

        return {
            ...news,
            // Adicionar campos que podem estar faltando
            author: news.author || 'Autor desconhecido',
            content: news.content || news.description,
            urlToImage: news.urlToImage || '',
            originalSource: news.originalSource || news.source,
            sourceName: sourceName,
            // Adicionar campos de análise se não existirem
            positiveScore: news.positiveScore || Math.floor(Math.random() * 5),
            negativeScore: news.negativeScore || Math.floor(Math.random() * 5),
            sentimentScore: news.sentimentScore || (news.sentiment === 'positive' ? 2 : news.sentiment === 'negative' ? -2 : 0)
        };
    });

    return filteredNews;
}

/**
 * Obtém notícias financeiras específicas com métricas adicionais
 */
async function fetchFinancialNews(source, language, topic) {
    try {
        console.log(`Obtendo notícias financeiras (fonte: ${source}, idioma: ${language}, tópico: ${topic})...`);

        // Obter notícias gerais primeiro
        const generalNews = await fetchGeneralNews(source, language, topic);

        // Tentar enriquecer as notícias com dados da Alpha Vantage
        try {
            // Em um ambiente real, faríamos uma chamada para a API Alpha Vantage para obter dados de sentimento
            // Como exemplo, vamos simular essa chamada

            // Adicionar métricas financeiras específicas
            return generalNews.map(news => {
                // Calcular pontuação de impacto com base no sentimento e tópicos
                let impactScore = 5; // Base neutra

                // Ajustar com base no sentimento
                if (news.sentiment === 'positive') impactScore += 2;
                if (news.sentiment === 'negative') impactScore -= 2;

                // Ajustar com base nos tópicos
                if (news.topics.includes('stocks')) impactScore += 1;
                if (news.topics.includes('crypto')) impactScore += 1.5;
                if (news.topics.includes('economy')) impactScore += 0.5;

                // Adicionar alguma aleatoriedade
                impactScore += (Math.random() * 2 - 1);

                // Limitar entre 0 e 10
                impactScore = Math.max(0, Math.min(10, impactScore));

                // Calcular pontuação de relevância
                const relevanceScore = 5 + (Math.random() * 5);

                // Determinar reação do mercado
                const marketReaction = news.sentiment === 'positive' ?
                                      (Math.random() > 0.2 ? 'positive' : 'negative') :
                                      news.sentiment === 'negative' ?
                                      (Math.random() > 0.8 ? 'positive' : 'negative') :
                                      (Math.random() > 0.5 ? 'positive' : 'negative');

                return {
                    ...news,
                    impactScore: parseFloat(impactScore.toFixed(1)),
                    relevanceScore: parseFloat(relevanceScore.toFixed(1)),
                    marketReaction: marketReaction
                };
            });

        } catch (apiError) {
            console.warn('Erro ao enriquecer notícias financeiras. Usando dados básicos.', apiError);

            // Adicionar métricas financeiras simuladas
            return generalNews.map(news => ({
                ...news,
                impactScore: parseFloat((Math.random() * 10).toFixed(1)),
                relevanceScore: parseFloat((Math.random() * 10).toFixed(1)),
                marketReaction: Math.random() > 0.5 ? 'positive' : 'negative'
            }));
        }
    } catch (error) {
        console.error('Erro ao obter notícias financeiras:', error);

        // Em caso de erro, retornar dados simulados
        const simulatedNews = await simulateGeneralNews(source, language, topic);
        return simulatedNews.map(news => ({
            ...news,
            impactScore: parseFloat((Math.random() * 10).toFixed(1)),
            relevanceScore: parseFloat((Math.random() * 10).toFixed(1)),
            marketReaction: Math.random() > 0.5 ? 'positive' : 'negative'
        }));
    }
}

/**
 * Obtém notícias em destaque
 */
async function fetchFeaturedNews() {
    try {
        console.log('Obtendo notícias em destaque...');

        // Obter todas as notícias
        const allNews = await fetchGeneralNews('all', 'all', 'all');

        // Selecionar as notícias mais relevantes
        // Em um ambiente real, poderíamos usar um algoritmo mais sofisticado
        // para selecionar as notícias mais relevantes com base em vários fatores

        // Para este exemplo, vamos selecionar as notícias mais recentes
        // e com sentimento positivo ou negativo (evitando neutras)
        const filteredNews = allNews.filter(news => news.sentiment !== 'neutral');

        // Limitar ao número máximo definido na configuração
        const maxFeaturedNews = CONFIG.display.maxFeaturedNews || 5;
        return filteredNews.slice(0, maxFeaturedNews);
    } catch (error) {
        console.error('Erro ao obter notícias em destaque:', error);

        // Em caso de erro, retornar dados simulados
        const simulatedNews = await simulateGeneralNews('all', 'all', 'all');
        return simulatedNews.slice(0, 5);
    }
}

// ===== Funções de processamento de dados =====

/**
 * Processa dados para análise regional
 */
function processRegionsData(indicesData) {
    const regions = {};

    // Agrupar índices por região
    indicesData.forEach(index => {
        const region = index.region;
        if (!regions[region]) {
            regions[region] = {
                indices: [],
                avg_return: 0,
                count: 0
            };
        }

        regions[region].indices.push(index);

        // Usar o retorno de 12 meses se disponível, caso contrário usar period_return
        const returnValue = index.year12_return !== undefined ? index.year12_return : index.period_return;
        regions[region].avg_return += returnValue;
        regions[region].count += 1;
    });

    // Calcular retorno médio por região
    Object.keys(regions).forEach(region => {
        if (regions[region].count > 0) {
            regions[region].avg_return = parseFloat((regions[region].avg_return / regions[region].count).toFixed(2));
        }
    });

    return regions;
}

/**
 * Processa dados para análise setorial
 */
function processSectorsData(stocksData) {
    const sectors = {};

    // Agrupar ações por setor
    stocksData.forEach(stock => {
        const sector = stock.sector || 'Outros';
        if (!sectors[sector]) {
            sectors[sector] = {
                stocks: [],
                avg_return: 0,
                avg_volatility: 0,
                count: 0
            };
        }

        sectors[sector].stocks.push(stock);
        sectors[sector].avg_return += stock.period_return;
        sectors[sector].avg_volatility += stock.volatility;
        sectors[sector].count += 1;
    });

    // Calcular médias por setor
    Object.keys(sectors).forEach(sector => {
        if (sectors[sector].count > 0) {
            sectors[sector].avg_return = parseFloat((sectors[sector].avg_return / sectors[sector].count).toFixed(2));
            sectors[sector].avg_volatility = parseFloat((sectors[sector].avg_volatility / sectors[sector].count).toFixed(2));
        }
    });

    return sectors;
}

/**
 * Calcula correlações entre índices
 */
function calculateCorrelations(indicesData) {
    const correlations = [];

    // Calcular correlações simples (simuladas)
    for (let i = 0; i < indicesData.length; i++) {
        for (let j = i + 1; j < indicesData.length; j++) {
            // Gerar correlação simulada entre -1 e 1
            const correlation = parseFloat((Math.random() * 2 - 1).toFixed(2));

            correlations.push({
                index1: indicesData[i].name,
                index2: indicesData[j].name,
                correlation: correlation
            });
        }
    }

    // Ordenar por valor absoluto da correlação (do maior para o menor)
    return correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
}

/**
 * Gera resumo do mercado
 */
function generateMarketSummary(indicesData, stocksData, regionsData, sectorsData) {
    // Encontrar melhor e pior índice usando retorno de 12 meses
    const bestIndex = indicesData.reduce((best, current) => {
        const bestReturn = best.year12_return !== undefined ? best.year12_return : best.period_return;
        const currentReturn = current.year12_return !== undefined ? current.year12_return : current.period_return;
        return currentReturn > bestReturn ? current : best;
    }, indicesData[0]);

    const worstIndex = indicesData.reduce((worst, current) => {
        const worstReturn = worst.year12_return !== undefined ? worst.year12_return : worst.period_return;
        const currentReturn = current.year12_return !== undefined ? current.year12_return : current.period_return;
        return currentReturn < worstReturn ? current : worst;
    }, indicesData[0]);

    // Encontrar melhor e pior ação
    const bestStock = stocksData.reduce((best, current) =>
        current.period_return > best.period_return ? current : best, stocksData[0]);

    const worstStock = stocksData.reduce((worst, current) =>
        current.period_return < worst.period_return ? current : worst, stocksData[0]);

    // Encontrar ação mais volátil
    const mostVolatileStock = stocksData.reduce((most, current) =>
        current.volatility > most.volatility ? current : most, stocksData[0]);

    // Encontrar melhor região
    const bestRegion = Object.entries(regionsData).reduce((best, [region, data]) =>
        !best.region || data.avg_return > best.avg_return
            ? { region, avg_return: data.avg_return }
            : best,
        { region: null, avg_return: -Infinity });

    // Encontrar melhor setor
    const bestSector = Object.entries(sectorsData).reduce((best, [sector, data]) =>
        !best.sector || data.avg_return > best.avg_return
            ? { sector, avg_return: data.avg_return }
            : best,
        { sector: null, avg_return: -Infinity });

    // Obter o retorno apropriado para os índices
    const bestIndexReturn = bestIndex.year12_return !== undefined ? bestIndex.year12_return : bestIndex.period_return;
    const worstIndexReturn = worstIndex.year12_return !== undefined ? worstIndex.year12_return : worstIndex.period_return;

    return {
        date: new Date().toISOString(),
        indices_count: indicesData.length,
        stocks_count: stocksData.length,
        best_performing_index: {
            name: bestIndex.name,
            return: bestIndexReturn
        },
        worst_performing_index: {
            name: worstIndex.name,
            return: worstIndexReturn
        },
        best_performing_stock: {
            name: bestStock.name,
            return: bestStock.period_return
        },
        worst_performing_stock: {
            name: worstStock.name,
            return: worstStock.period_return
        },
        highest_volatility_stock: {
            name: mostVolatileStock.name,
            volatility: mostVolatileStock.volatility
        },
        best_performing_region: {
            region: bestRegion.region,
            return: bestRegion.avg_return
        },
        best_performing_sector: {
            sector: bestSector.sector,
            return: bestSector.avg_return
        }
    };
}

/**
 * Processa dados por categoria para a página de melhores ativos
 */
function processCategoriesData(assetsData, period) {
    const categories = {};

    // Verificar se assetsData é um array válido
    if (!assetsData || !Array.isArray(assetsData) || assetsData.length === 0) {
        console.warn('Dados de ativos inválidos ou vazios para processamento de categorias');
        return categories;
    }

    // Agrupar ativos por tipo
    assetsData.forEach(asset => {
        const type = asset.type;
        if (!categories[type]) {
            categories[type] = {
                assets: [],
                avg_return: 0,
                count: 0
            };
        }

        categories[type].assets.push(asset);

        // Usar o retorno do período selecionado
        const returnField = period === 'week' ? 'week_return' : period === 'month' ? 'month_return' : 'year_return';
        categories[type].avg_return += asset[returnField];
        categories[type].count += 1;
    });

    // Calcular médias por categoria
    Object.keys(categories).forEach(type => {
        if (categories[type].count > 0) {
            categories[type].avg_return = parseFloat((categories[type].avg_return / categories[type].count).toFixed(2));
        }
    });

    return categories;
}

/**
 * Processa análise de sentimento para notícias financeiras
 */
function processSentimentAnalysis(financialNews) {
    // Contagem de sentimentos
    const sentimentCounts = {
        positive: 0,
        neutral: 0,
        negative: 0
    };

    // Contagem por tópico
    const topicSentiment = {};

    // Processar cada notícia
    financialNews.forEach(news => {
        // Incrementar contagem de sentimento
        sentimentCounts[news.sentiment]++;

        // Processar sentimento por tópico
        news.topics.forEach(topic => {
            if (!topicSentiment[topic]) {
                topicSentiment[topic] = {
                    positive: 0,
                    neutral: 0,
                    negative: 0,
                    total: 0
                };
            }

            topicSentiment[topic][news.sentiment]++;
            topicSentiment[topic].total++;
        });
    });

    // Calcular percentuais
    const total = financialNews.length;
    const sentimentPercentages = {
        positive: parseFloat(((sentimentCounts.positive / total) * 100).toFixed(1)),
        neutral: parseFloat(((sentimentCounts.neutral / total) * 100).toFixed(1)),
        negative: parseFloat(((sentimentCounts.negative / total) * 100).toFixed(1))
    };

    // Calcular sentimento geral
    let overallSentiment = 'neutral';
    if (sentimentPercentages.positive > 60) {
        overallSentiment = 'bullish';
    } else if (sentimentPercentages.negative > 60) {
        overallSentiment = 'bearish';
    } else if (sentimentPercentages.positive > sentimentPercentages.negative + 20) {
        overallSentiment = 'slightly_bullish';
    } else if (sentimentPercentages.negative > sentimentPercentages.positive + 20) {
        overallSentiment = 'slightly_bearish';
    }

    return {
        counts: sentimentCounts,
        percentages: sentimentPercentages,
        byTopic: topicSentiment,
        overall: overallSentiment
    };
}

// ===== Funções utilitárias =====

/**
 * Formata valores percentuais
 */
function formatPercentage(value) {
    return value > 0
        ? `+${value.toFixed(2)}%`
        : `${value.toFixed(2)}%`;
}

/**
 * Formata valores monetários
 */
function formatCurrency(value, currency = 'USD') {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

/**
 * Determina a classe CSS com base no valor (positivo/negativo)
 */
function getValueClass(value) {
    return value > 0 ? 'positive' : value < 0 ? 'negative' : '';
}

// Exportar funções para uso em outros arquivos
window.loadNewsData = loadNewsData;
window.loadBestAssetsData = loadBestAssetsData;
window.loadAllData = loadAllData;

// Iniciar carregamento de dados quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Verificar qual página está ativa
    const path = window.location.pathname;
    const filename = path.split('/').pop();

    if (filename === 'best-assets.html') {
        loadBestAssetsData();
    } else if (filename === 'news.html') {
        // O carregamento é feito no arquivo news.js
    } else {
        loadAllData();
    }
});
