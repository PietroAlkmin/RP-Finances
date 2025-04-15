/**
 * Best Assets Loader
 * Carrega dados de ativos para a página de melhores ativos usando múltiplas APIs
 */

/**
 * Carrega dados para a página de melhores ativos usando múltiplas APIs
 * @param {string} period - Período de tempo (week, month, year)
 * @param {string} assetType - Tipo de ativo (all, stocks, crypto, reits, etc.)
 * @returns {Promise<Object>} - Dados dos melhores ativos
 */
async function loadEnhancedBestAssetsData(period = 'week', assetType = 'all') {
    try {
        console.log(`Carregando dados de melhores ativos (período: ${period}, tipo: ${assetType})...`);

        // Mostrar indicador de carregamento
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) loadingIndicator.classList.remove('hidden');

        // Verificar se há dados em cache
        const cacheKey = `enhanced_best_assets_${period}_${assetType}`;
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

        // Carregar dados de diferentes fontes com base no tipo de ativo
        let assetsData = [];

        // Carregar ações globais (Finnhub)
        if (assetType === 'all' || assetType === 'stocks') {
            try {
                const globalStocks = await loadGlobalStocksForBestAssets();
                assetsData = assetsData.concat(globalStocks);
                console.log('Ações globais carregadas:', globalStocks.length);
            } catch (error) {
                console.error('Erro ao carregar ações globais:', error);
            }
        }

        // Carregar ações brasileiras (brapi.dev)
        if (assetType === 'all' || assetType === 'stocks' || assetType === 'brazilian') {
            try {
                const brazilianStocks = await loadBrazilianStocksForBestAssets();
                assetsData = assetsData.concat(brazilianStocks);
                console.log('Ações brasileiras carregadas:', brazilianStocks.length);
            } catch (error) {
                console.error('Erro ao carregar ações brasileiras:', error);
            }
        }

        // Carregar fundos imobiliários (brapi.dev)
        if (assetType === 'all' || assetType === 'reits') {
            try {
                const reits = await loadREITsForBestAssets();
                assetsData = assetsData.concat(reits);
                console.log('Fundos imobiliários carregados:', reits.length);
            } catch (error) {
                console.error('Erro ao carregar fundos imobiliários:', error);
            }
        }

        // Carregar criptomoedas (CoinGecko)
        if (assetType === 'all' || assetType === 'crypto') {
            try {
                const cryptos = await loadCryptosForBestAssets();
                assetsData = assetsData.concat(cryptos);
                console.log('Criptomoedas carregadas:', cryptos.length);
            } catch (error) {
                console.error('Erro ao carregar criptomoedas:', error);
            }
        }

        // Carregar ETFs (Finnhub/Yahoo Finance)
        if (assetType === 'all' || assetType === 'etfs') {
            try {
                const etfs = await loadETFsForBestAssets();
                assetsData = assetsData.concat(etfs);
                console.log('ETFs carregados:', etfs.length);
            } catch (error) {
                console.error('Erro ao carregar ETFs:', error);
            }
        }

        // Verificar se temos dados suficientes
        if (assetsData.length === 0) {
            console.warn('Nenhum dado de ativo carregado, usando dados simulados');
            assetsData = await fetchAssetsData(period, assetType);
        }

        // Ordenar ativos por retorno no período selecionado
        const returnField = period === 'week' ? 'week_return' : period === 'month' ? 'month_return' : 'year_return';
        assetsData.sort((a, b) => b[returnField] - a[returnField]);

        // Processar dados por categoria
        const categoriesData = processCategoriesData(assetsData, period);

        // Armazenar dados no objeto global
        bestAssetsData.assets = assetsData;
        bestAssetsData.categories = categoriesData;
        bestAssetsData.period = period;
        bestAssetsData.assetType = assetType;
        bestAssetsData.dataLoaded = true;
        bestAssetsData.lastUpdate = new Date();

        // Salvar dados no cache
        CacheManager.saveToCache(cacheKey, {
            assets: assetsData,
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
 * Carrega ações globais para a página de melhores ativos
 * @returns {Promise<Array>} - Lista de ações globais formatadas
 */
async function loadGlobalStocksForBestAssets() {
    // Lista de símbolos de ações globais populares
    const symbols = [
        'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA',
        'META', 'NVDA', 'JPM', 'V', 'WMT',
        'JNJ', 'PG', 'DIS', 'NFLX', 'INTC'
    ];

    try {
        // Carregar dados das ações globais
        const stocksData = await loadGlobalStocks(symbols);

        // Calcular retornos históricos (simulados para demonstração)
        // Em um ambiente real, você usaria loadGlobalStockHistory para cada ação
        return stocksData.map(stock => {
            // Simular retornos históricos com base no preço atual
            const weekReturn = ((Math.random() * 10) - 5) + (stock.change > 0 ? 2 : -2);
            const monthReturn = weekReturn * 2 + ((Math.random() * 5) - 2.5);
            const yearReturn = monthReturn * 3 + ((Math.random() * 15) - 7.5);

            return {
                symbol: stock.symbol,
                name: stock.name,
                type: 'stocks',
                last_price: stock.price,
                week_return: parseFloat(weekReturn.toFixed(2)),
                month_return: parseFloat(monthReturn.toFixed(2)),
                year_return: parseFloat(yearReturn.toFixed(2)),
                volume: stock.volume || 0,
                trend: stock.change > 0 ? 'Alta' : 'Baixa',
                region: 'US',
                currency: 'USD',
                logo: stock.logo
            };
        });
    } catch (error) {
        console.error('Erro ao carregar ações globais:', error);
        return [];
    }
}

/**
 * Carrega ações brasileiras para a página de melhores ativos
 * @returns {Promise<Array>} - Lista de ações brasileiras formatadas
 */
async function loadBrazilianStocksForBestAssets() {
    // Lista de símbolos de ações brasileiras populares
    const symbols = [
        'PETR4', 'VALE3', 'ITUB4', 'BBDC4', 'ABEV3',
        'B3SA3', 'WEGE3', 'RENT3', 'MGLU3', 'BBAS3',
        'RADL3', 'SUZB3', 'JBSS3', 'LREN3', 'PRIO3'
    ];

    try {
        // Carregar dados das ações brasileiras
        const stocksData = await loadBrazilianStocks(symbols);

        // Calcular retornos históricos (simulados para demonstração)
        // Em um ambiente real, você usaria loadBrazilianStockHistory para cada ação
        return stocksData.map(stock => {
            // Simular retornos históricos com base no preço atual
            const weekReturn = ((Math.random() * 10) - 5) + (stock.change > 0 ? 2 : -2);
            const monthReturn = weekReturn * 2 + ((Math.random() * 5) - 2.5);
            const yearReturn = monthReturn * 3 + ((Math.random() * 15) - 7.5);

            return {
                symbol: stock.symbol,
                name: stock.name,
                type: 'brazilian',
                last_price: stock.price,
                week_return: parseFloat(weekReturn.toFixed(2)),
                month_return: parseFloat(monthReturn.toFixed(2)),
                year_return: parseFloat(yearReturn.toFixed(2)),
                volume: stock.volume || 0,
                trend: stock.change > 0 ? 'Alta' : 'Baixa',
                region: 'BR',
                currency: 'BRL',
                logo: stock.logo
            };
        });
    } catch (error) {
        console.error('Erro ao carregar ações brasileiras:', error);
        return [];
    }
}

/**
 * Carrega fundos imobiliários para a página de melhores ativos
 * @returns {Promise<Array>} - Lista de FIIs formatados
 */
async function loadREITsForBestAssets() {
    // Lista de símbolos de FIIs populares
    const symbols = [
        'KNRI11', 'HGLG11', 'XPLG11', 'VISC11', 'HFOF11',
        'MXRF11', 'BCFF11', 'HSML11', 'VILG11', 'IRDM11'
    ];

    try {
        // Carregar dados dos FIIs
        const reitsData = await loadBrazilianREITs(symbols);

        // Calcular retornos históricos (simulados para demonstração)
        return reitsData.map(reit => {
            // Simular retornos históricos com base no preço atual
            const weekReturn = ((Math.random() * 8) - 4) + (reit.change > 0 ? 1 : -1);
            const monthReturn = weekReturn * 1.5 + ((Math.random() * 4) - 2);
            const yearReturn = monthReturn * 2.5 + ((Math.random() * 10) - 5);

            return {
                symbol: reit.symbol,
                name: reit.name,
                type: 'reits',
                last_price: reit.price,
                week_return: parseFloat(weekReturn.toFixed(2)),
                month_return: parseFloat(monthReturn.toFixed(2)),
                year_return: parseFloat(yearReturn.toFixed(2)),
                volume: reit.volume || 0,
                trend: reit.change > 0 ? 'Alta' : 'Baixa',
                region: 'BR',
                currency: 'BRL',
                dividend_yield: reit.dividendYield || 0,
                logo: reit.logo
            };
        });
    } catch (error) {
        console.error('Erro ao carregar fundos imobiliários:', error);
        return [];
    }
}

/**
 * Carrega criptomoedas para a página de melhores ativos
 * @returns {Promise<Array>} - Lista de criptomoedas formatadas
 */
async function loadCryptosForBestAssets() {
    // Lista de IDs de criptomoedas populares - reduzida para apenas Bitcoin e Ethereum
    const coinIds = [
        'bitcoin', 'ethereum'
    ];

    try {
        // Carregar dados das criptomoedas
        const cryptoData = await loadCryptoMarketData(coinIds);

        return cryptoData.map(crypto => {
            return {
                symbol: crypto.symbol.toUpperCase(),
                name: crypto.name,
                type: 'crypto',
                last_price: crypto.current_price,
                week_return: crypto.price_change_percentage_7d || 0,
                month_return: crypto.price_change_percentage_30d || 0,
                year_return: crypto.price_change_percentage_1y || crypto.price_change_percentage_30d * 12 || 0,
                volume: crypto.total_volume || 0,
                trend: crypto.price_change_percentage_24h > 0 ? 'Alta' : 'Baixa',
                region: 'Global',
                currency: 'USD',
                market_cap: crypto.market_cap,
                image: crypto.image,
                // Adicionar flag para indicar que é uma criptomoeda (para formatação especial)
                is_crypto: true
            };
        });
    } catch (error) {
        console.error('Erro ao carregar criptomoedas:', error);
        return [];
    }
}

/**
 * Carrega ETFs para a página de melhores ativos
 * @returns {Promise<Array>} - Lista de ETFs formatados
 */
async function loadETFsForBestAssets() {
    // Lista de símbolos de ETFs populares
    const symbols = [
        'SPY', 'QQQ', 'VTI', 'VOO', 'IWM',
        'EWZ', 'BOVA11.SA', 'IVVB11.SA', 'SMAL11.SA', 'HASH11.SA'
    ];

    try {
        // Simular dados de ETFs (em um ambiente real, você usaria uma API específica)
        const etfsData = [];

        for (const symbol of symbols) {
            const isBrazilian = symbol.includes('.SA');
            const price = isBrazilian ? 50 + (Math.random() * 50) : 200 + (Math.random() * 300);
            const change = (Math.random() * 4) - 2;
            const weekReturn = ((Math.random() * 8) - 4) + (change > 0 ? 1 : -1);
            const monthReturn = weekReturn * 1.5 + ((Math.random() * 4) - 2);
            const yearReturn = monthReturn * 2.5 + ((Math.random() * 10) - 5);

            etfsData.push({
                symbol: symbol,
                name: getETFName(symbol),
                type: 'etfs',
                last_price: price,
                week_return: parseFloat(weekReturn.toFixed(2)),
                month_return: parseFloat(monthReturn.toFixed(2)),
                year_return: parseFloat(yearReturn.toFixed(2)),
                volume: Math.floor(1000000 + (Math.random() * 10000000)),
                trend: change > 0 ? 'Alta' : 'Baixa',
                region: isBrazilian ? 'BR' : 'US',
                currency: isBrazilian ? 'BRL' : 'USD'
            });
        }

        return etfsData;
    } catch (error) {
        console.error('Erro ao carregar ETFs:', error);
        return [];
    }
}

/**
 * Processa dados de ativos por categoria
 * @param {Array} assets - Lista de ativos
 * @param {string} period - Período de tempo (week, month, year)
 * @returns {Object} - Dados processados por categoria
 */
function processCategoriesData(assets, period) {
    if (!assets || !Array.isArray(assets) || assets.length === 0) {
        return {};
    }

    const returnField = period === 'week' ? 'week_return' : period === 'month' ? 'month_return' : 'year_return';
    const categories = {};

    // Agrupar ativos por tipo
    assets.forEach(asset => {
        if (!asset.type) return;

        if (!categories[asset.type]) {
            categories[asset.type] = {
                count: 0,
                total_return: 0,
                avg_return: 0,
                assets: []
            };
        }

        categories[asset.type].count++;
        categories[asset.type].total_return += asset[returnField] || 0;
        categories[asset.type].assets.push(asset);
    });

    // Calcular retorno médio para cada categoria
    Object.keys(categories).forEach(type => {
        const category = categories[type];
        category.avg_return = parseFloat((category.total_return / category.count).toFixed(2));
    });

    return categories;
}

/**
 * Obtém o nome de um ETF com base no símbolo
 * @param {string} symbol - Símbolo do ETF
 * @returns {string} - Nome do ETF
 */
function getETFName(symbol) {
    const etfNames = {
        'SPY': 'SPDR S&P 500 ETF',
        'QQQ': 'Invesco QQQ Trust (Nasdaq-100)',
        'VTI': 'Vanguard Total Stock Market ETF',
        'VOO': 'Vanguard S&P 500 ETF',
        'IWM': 'iShares Russell 2000 ETF',
        'EWZ': 'iShares MSCI Brazil ETF',
        'BOVA11.SA': 'iShares Ibovespa ETF',
        'IVVB11.SA': 'iShares S&P 500 ETF',
        'SMAL11.SA': 'iShares Small Cap ETF',
        'HASH11.SA': 'Hashdex Nasdaq Crypto ETF'
    };

    return etfNames[symbol] || `ETF ${symbol}`;
}

// Exportar funções para uso em outros arquivos
window.loadEnhancedBestAssetsData = loadEnhancedBestAssetsData;
