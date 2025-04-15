/**
 * Brazilian Stocks Module
 * Utiliza a API brapi.dev para obter dados de ações brasileiras
 */

// Controle de taxa para brapi.dev API
const brapiRateLimiter = {
    queue: [],
    processing: false,
    lastRequestTime: 0,
    minInterval: 1500, // 1.5 segundos entre chamadas
    maxQueueSize: 50,

    // Adicionar uma requisição à fila
    enqueue(requestFn) {
        return new Promise((resolve, reject) => {
            if (this.queue.length >= this.maxQueueSize) {
                console.warn('brapi.dev API queue is full, rejecting request');
                reject(new Error('Queue is full'));
                return;
            }

            this.queue.push({ requestFn, resolve, reject });

            if (!this.processing) {
                this.processQueue();
            }
        });
    },

    // Processar a fila de requisições
    async processQueue() {
        if (this.queue.length === 0) {
            this.processing = false;
            return;
        }

        this.processing = true;

        const now = Date.now();
        const timeToWait = Math.max(0, this.lastRequestTime + this.minInterval - now);

        if (timeToWait > 0) {
            await new Promise(resolve => setTimeout(resolve, timeToWait));
        }

        const { requestFn, resolve, reject } = this.queue.shift();

        try {
            this.lastRequestTime = Date.now();
            const result = await requestFn();
            resolve(result);
        } catch (error) {
            reject(error);
        } finally {
            // Continuar processando a fila
            setTimeout(() => this.processQueue(), 50);
        }
    }
};

/**
 * Obtém cotações de ações brasileiras
 * @param {string[]} symbols - Símbolos das ações (ex: ['PETR4', 'VALE3'])
 * @returns {Promise<Array>} - Dados das ações
 */
async function loadBrazilianStocks(symbols = ['PETR4', 'VALE3', 'ITUB4', 'BBDC4', 'ABEV3']) {
    try {
        console.log(`Carregando dados de ações brasileiras para ${symbols.length} símbolos...`);

        // Verificar se há dados em cache
        const cacheKey = `brazilian_stocks_${symbols.join('_')}`;
        const cachedData = CacheManager.getFromCache(cacheKey);

        if (cachedData) {
            console.log('Usando dados de ações brasileiras do cache');
            return cachedData;
        }

        // Limitar o número de símbolos para evitar muitas chamadas de API
        const limitedSymbols = symbols.slice(0, 5);
        if (symbols.length > 5) {
            console.warn(`Limitando requisição para 5 símbolos dos ${symbols.length} solicitados`);
        }

        // Resultados
        const results = [];

        // Processar cada símbolo individualmente para evitar erros de API
        for (const symbol of limitedSymbols) {
            try {
                // Construir URL da API
                const baseUrl = CONFIG.apiEndpoints.useProxy ?
                    CONFIG.apiEndpoints.proxyBrapi :
                    CONFIG.apiEndpoints.brapi;

                // Usar o rate limiter para a chamada da API
                const stockData = await brapiRateLimiter.enqueue(async () => {
                    // Chamar a API para um único símbolo por vez
                    const url = `${baseUrl}/quote/${symbol}?token=${CONFIG.apiKeys.brapi}`;
                    console.log('Chamando brapi.dev API para símbolo individual:', url);

                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error(`Erro na API brapi.dev: ${response.status}`);
                    }

                    return await response.json();
                }).catch(error => {
                    console.error(`Erro ao obter dados para ${symbol}:`, error);
                    throw error;
                });

                if (stockData && stockData.results && stockData.results.length > 0) {
                    const stock = stockData.results[0];

                    // Processar dados
                    results.push({
                        symbol: stock.symbol,
                        name: stock.longName || stock.symbol,
                        price: stock.regularMarketPrice,
                        change: stock.regularMarketChange,
                        changePercent: stock.regularMarketChangePercent,
                        high: stock.regularMarketDayHigh,
                        low: stock.regularMarketDayLow,
                        open: stock.regularMarketOpen,
                        previousClose: stock.regularMarketPreviousClose,
                        volume: stock.regularMarketVolume,
                        marketCap: stock.marketCap,
                        currency: 'BRL',
                        region: 'BR',
                        sector: stock.sector || 'N/A',
                        logo: stock.logourl
                    });
                }
            } catch (error) {
                console.error(`Erro ao obter dados para ${symbol}:`, error);

                // Adicionar dados simulados para este símbolo
                results.push(simulateBrazilianStock(symbol));
            }
        }

        // Adicionar dados simulados para os símbolos restantes
        if (symbols.length > limitedSymbols.length) {
            const remainingSymbols = symbols.slice(limitedSymbols.length);
            for (const symbol of remainingSymbols) {
                results.push(simulateBrazilianStock(symbol));
            }
        }

        // Salvar no cache
        CacheManager.saveToCache(cacheKey, results, CONFIG.cache.ttl.stocks);

        return results;
    } catch (error) {
        console.error('Erro ao carregar dados de ações brasileiras:', error);
        return simulateBrazilianStocks(symbols);
    }
}

/**
 * Obtém dados históricos de preços para uma ação brasileira
 * @param {string} symbol - Símbolo da ação (ex: 'PETR4')
 * @param {string} range - Período de tempo (1d, 5d, 1mo, 3mo, 6mo, 1y, 5y, max)
 * @param {string} interval - Intervalo (1d, 1wk, 1mo)
 * @returns {Promise<Object>} - Dados históricos de preços
 */
async function loadBrazilianStockHistory(symbol = 'PETR4', range = '1y', interval = '1d') {
    try {
        console.log(`Carregando histórico para ação brasileira ${symbol} (${range})...`);

        // Verificar se há dados em cache
        const cacheKey = `brazilian_stock_history_${symbol}_${range}_${interval}`;
        const cachedData = CacheManager.getFromCache(cacheKey);

        if (cachedData) {
            console.log('Usando histórico de ação brasileira do cache');
            return cachedData;
        }

        // Construir URL da API
        const baseUrl = CONFIG.apiEndpoints.useProxy ?
            CONFIG.apiEndpoints.proxyBrapi :
            CONFIG.apiEndpoints.brapi;

        const url = `${baseUrl}/quote/${symbol}/historical?range=${range}&interval=${interval}&token=${CONFIG.apiKeys.brapi}`;

        console.log('Chamando brapi.dev API para histórico:', url);
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Erro na API brapi.dev: ${response.status}`);
        }

        const data = await response.json();
        console.log('Dados históricos recebidos para', symbol);

        // Processar dados
        const historicalData = {
            symbol: symbol,
            range: range,
            interval: interval,
            prices: data.results.map(item => ({
                date: item.date,
                open: item.open,
                high: item.high,
                low: item.low,
                close: item.close,
                volume: item.volume,
                adjustedClose: item.adjustedClose
            }))
        };

        // Salvar no cache
        CacheManager.saveToCache(cacheKey, historicalData, CONFIG.cache.ttl.stocks);

        return historicalData;
    } catch (error) {
        console.error('Erro ao carregar histórico de ação brasileira:', error);
        return simulateBrazilianStockHistory(symbol, range, interval);
    }
}

/**
 * Obtém dados de fundos imobiliários brasileiros
 * @param {string[]} symbols - Símbolos dos FIIs (ex: ['KNRI11', 'HGLG11'])
 * @returns {Promise<Array>} - Dados dos FIIs
 */
async function loadBrazilianREITs(symbols = ['KNRI11', 'HGLG11', 'XPLG11', 'VISC11', 'HFOF11']) {
    try {
        console.log(`Carregando dados de FIIs para ${symbols.length} símbolos...`);

        // Verificar se há dados em cache
        const cacheKey = `brazilian_reits_${symbols.join('_')}`;
        const cachedData = CacheManager.getFromCache(cacheKey);

        if (cachedData) {
            console.log('Usando dados de FIIs do cache');
            return cachedData;
        }

        // Limitar o número de símbolos para evitar muitas chamadas de API
        const limitedSymbols = symbols.slice(0, 3);
        if (symbols.length > 3) {
            console.warn(`Limitando requisição para 3 símbolos dos ${symbols.length} solicitados`);
        }

        // Resultados
        const results = [];

        // Processar cada símbolo individualmente para evitar erros de API
        for (const symbol of limitedSymbols) {
            try {
                // Construir URL da API
                const baseUrl = CONFIG.apiEndpoints.useProxy ?
                    CONFIG.apiEndpoints.proxyBrapi :
                    CONFIG.apiEndpoints.brapi;

                // Usar o rate limiter para a chamada da API
                const reitData = await brapiRateLimiter.enqueue(async () => {
                    // Chamar a API para um único símbolo por vez
                    const url = `${baseUrl}/quote/${symbol}?token=${CONFIG.apiKeys.brapi}&fundamental=true`;
                    console.log('Chamando brapi.dev API para FII individual:', url);

                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error(`Erro na API brapi.dev: ${response.status}`);
                    }

                    return await response.json();
                }).catch(error => {
                    console.error(`Erro ao obter dados para FII ${symbol}:`, error);
                    throw error;
                });

                if (reitData && reitData.results && reitData.results.length > 0) {
                    const reit = reitData.results[0];

                    // Processar dados
                    results.push({
                        symbol: reit.symbol,
                        name: reit.longName || reit.symbol,
                        price: reit.regularMarketPrice,
                        change: reit.regularMarketChange,
                        changePercent: reit.regularMarketChangePercent,
                        high: reit.regularMarketDayHigh,
                        low: reit.regularMarketDayLow,
                        open: reit.regularMarketOpen,
                        previousClose: reit.regularMarketPreviousClose,
                        volume: reit.regularMarketVolume,
                        marketCap: reit.marketCap,
                        currency: 'BRL',
                        region: 'BR',
                        sector: 'Real Estate',
                        dividend: reit.dividendsData?.cashDividends?.length > 0 ?
                            reit.dividendsData.cashDividends[0].value : 0,
                        dividendYield: reit.dividendYield || 0,
                        logo: reit.logourl
                    });
                }
            } catch (error) {
                console.error(`Erro ao obter dados para FII ${symbol}:`, error);

                // Adicionar dados simulados para este símbolo
                results.push(simulateBrazilianREIT(symbol));
            }
        }

        // Adicionar dados simulados para os símbolos restantes
        if (symbols.length > limitedSymbols.length) {
            const remainingSymbols = symbols.slice(limitedSymbols.length);
            for (const symbol of remainingSymbols) {
                results.push(simulateBrazilianREIT(symbol));
            }
        }

        // Salvar no cache
        CacheManager.saveToCache(cacheKey, results, CONFIG.cache.ttl.stocks);

        return results;
    } catch (error) {
        console.error('Erro ao carregar dados de FIIs:', error);
        return simulateBrazilianREITs(symbols);
    }
}

/**
 * Obtém dados do índice Ibovespa
 * @returns {Promise<Object>} - Dados do Ibovespa
 */
async function loadIbovespaData() {
    try {
        console.log('Carregando dados do Ibovespa...');

        // Verificar se há dados em cache
        const cacheKey = 'ibovespa_data';
        const cachedData = CacheManager.getFromCache(cacheKey);

        if (cachedData) {
            console.log('Usando dados do Ibovespa do cache');
            return cachedData;
        }

        // Construir URL da API
        const baseUrl = CONFIG.apiEndpoints.useProxy ?
            CONFIG.apiEndpoints.proxyBrapi :
            CONFIG.apiEndpoints.brapi;

        const url = `${baseUrl}/quote/^BVSP?token=${CONFIG.apiKeys.brapi}`;

        console.log('Chamando brapi.dev API para Ibovespa:', url);
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Erro na API brapi.dev: ${response.status}`);
        }

        const data = await response.json();
        console.log('Dados do Ibovespa recebidos:', data);

        // Processar dados
        const ibovespaData = {
            symbol: '^BVSP',
            name: 'Ibovespa',
            price: data.results[0].regularMarketPrice,
            change: data.results[0].regularMarketChange,
            changePercent: data.results[0].regularMarketChangePercent,
            high: data.results[0].regularMarketDayHigh,
            low: data.results[0].regularMarketDayLow,
            open: data.results[0].regularMarketOpen,
            previousClose: data.results[0].regularMarketPreviousClose,
            volume: data.results[0].regularMarketVolume,
            currency: 'BRL',
            region: 'BR'
        };

        // Salvar no cache
        CacheManager.saveToCache(cacheKey, ibovespaData, CONFIG.cache.ttl.indices);

        return ibovespaData;
    } catch (error) {
        console.error('Erro ao carregar dados do Ibovespa:', error);
        return simulateIbovespaData();
    }
}

/**
 * Simula dados de uma ação brasileira quando a API falha
 * @param {string} symbol - Símbolo da ação
 * @returns {Object} - Dados simulados da ação
 */
function simulateBrazilianStock(symbol) {
    console.warn(`Simulando dados para ação brasileira ${symbol}`);

    const stockData = {
        'PETR4': {
            symbol: 'PETR4',
            name: 'Petrobras PN',
            price: 35.42 + (Math.random() * 2 - 1),
            change: 0.75 * (Math.random() > 0.5 ? 1 : -1),
            changePercent: 2.15 * (Math.random() > 0.5 ? 1 : -1),
            high: 36.10,
            low: 35.05,
            open: 35.20,
            previousClose: 34.67,
            volume: 45000000 + (Math.random() * 10000000),
            marketCap: 462000000000,
            currency: 'BRL',
            region: 'BR',
            sector: 'Petróleo e Gás',
            logo: 'https://brapi.dev/favicon.svg'
        },
        'VALE3': {
            symbol: 'VALE3',
            name: 'Vale ON',
            price: 65.78 + (Math.random() * 3 - 1.5),
            change: 1.25 * (Math.random() > 0.5 ? 1 : -1),
            changePercent: 1.95 * (Math.random() > 0.5 ? 1 : -1),
            high: 66.50,
            low: 65.10,
            open: 65.30,
            previousClose: 64.53,
            volume: 38000000 + (Math.random() * 8000000),
            marketCap: 320000000000,
            currency: 'BRL',
            region: 'BR',
            sector: 'Mineração',
            logo: 'https://brapi.dev/favicon.svg'
        },
        'ITUB4': {
            symbol: 'ITUB4',
            name: 'Itaú Unibanco PN',
            price: 32.45 + (Math.random() * 1.5 - 0.75),
            change: 0.45 * (Math.random() > 0.5 ? 1 : -1),
            changePercent: 1.40 * (Math.random() > 0.5 ? 1 : -1),
            high: 32.80,
            low: 32.10,
            open: 32.25,
            previousClose: 32.00,
            volume: 25000000 + (Math.random() * 5000000),
            marketCap: 315000000000,
            currency: 'BRL',
            region: 'BR',
            sector: 'Financeiro',
            logo: 'https://brapi.dev/favicon.svg'
        },
        'BBDC4': {
            symbol: 'BBDC4',
            name: 'Bradesco PN',
            price: 14.85 + (Math.random() * 0.8 - 0.4),
            change: 0.25 * (Math.random() > 0.5 ? 1 : -1),
            changePercent: 1.70 * (Math.random() > 0.5 ? 1 : -1),
            high: 15.10,
            low: 14.65,
            open: 14.75,
            previousClose: 14.60,
            volume: 22000000 + (Math.random() * 4000000),
            marketCap: 148000000000,
            currency: 'BRL',
            region: 'BR',
            sector: 'Financeiro',
            logo: 'https://brapi.dev/favicon.svg'
        },
        'ABEV3': {
            symbol: 'ABEV3',
            name: 'Ambev ON',
            price: 13.25 + (Math.random() * 0.6 - 0.3),
            change: 0.15 * (Math.random() > 0.5 ? 1 : -1),
            changePercent: 1.15 * (Math.random() > 0.5 ? 1 : -1),
            high: 13.40,
            low: 13.10,
            open: 13.20,
            previousClose: 13.10,
            volume: 18000000 + (Math.random() * 3000000),
            marketCap: 208000000000,
            currency: 'BRL',
            region: 'BR',
            sector: 'Bebidas',
            logo: 'https://brapi.dev/favicon.svg'
        }
    };

    // Retornar dados para o símbolo solicitado
    return stockData[symbol] || {
        symbol: symbol,
        name: `${symbol}`,
        price: 50 + (Math.random() * 20 - 10),
        change: 0.5 * (Math.random() > 0.5 ? 1 : -1),
        changePercent: 1.0 * (Math.random() > 0.5 ? 1 : -1),
        high: 52 + (Math.random() * 2),
        low: 48 + (Math.random() * 2),
        open: 50 + (Math.random() * 1),
        previousClose: 49.5 + (Math.random() * 1),
        volume: 10000000 + (Math.random() * 5000000),
        marketCap: 100000000000 + (Math.random() * 50000000000),
        currency: 'BRL',
        region: 'BR',
        sector: 'Outros',
        logo: 'https://brapi.dev/favicon.svg'
    };
}

/**
 * Simula dados de um FII quando a API falha
 * @param {string} symbol - Símbolo do FII
 * @returns {Object} - Dados simulados do FII
 */
function simulateBrazilianREIT(symbol) {
    console.warn(`Simulando dados para FII ${symbol}`);

    const reitData = {
        'KNRI11': {
            symbol: 'KNRI11',
            name: 'Kinea Renda Imobiliária FII',
            price: 125.42 + (Math.random() * 5 - 2.5),
            change: 0.75 * (Math.random() > 0.5 ? 1 : -1),
            changePercent: 0.65 * (Math.random() > 0.5 ? 1 : -1),
            high: 126.50,
            low: 124.80,
            open: 125.10,
            previousClose: 124.67,
            volume: 1500000 + (Math.random() * 500000),
            marketCap: 12000000000,
            currency: 'BRL',
            region: 'BR',
            sector: 'Real Estate',
            dividend: 0.65,
            dividendYield: 6.2,
            logo: 'https://brapi.dev/favicon.svg'
        },
        'HGLG11': {
            symbol: 'HGLG11',
            name: 'CSHG Logística FII',
            price: 165.78 + (Math.random() * 6 - 3),
            change: 1.25 * (Math.random() > 0.5 ? 1 : -1),
            changePercent: 0.75 * (Math.random() > 0.5 ? 1 : -1),
            high: 166.50,
            low: 164.10,
            open: 165.30,
            previousClose: 164.53,
            volume: 1200000 + (Math.random() * 400000),
            marketCap: 9500000000,
            currency: 'BRL',
            region: 'BR',
            sector: 'Real Estate',
            dividend: 0.72,
            dividendYield: 5.2,
            logo: 'https://brapi.dev/favicon.svg'
        },
        'XPLG11': {
            symbol: 'XPLG11',
            name: 'XP Log FII',
            price: 102.45 + (Math.random() * 4 - 2),
            change: 0.45 * (Math.random() > 0.5 ? 1 : -1),
            changePercent: 0.44 * (Math.random() > 0.5 ? 1 : -1),
            high: 103.80,
            low: 101.10,
            open: 102.25,
            previousClose: 102.00,
            volume: 950000 + (Math.random() * 300000),
            marketCap: 7800000000,
            currency: 'BRL',
            region: 'BR',
            sector: 'Real Estate',
            dividend: 0.58,
            dividendYield: 6.8,
            logo: 'https://brapi.dev/favicon.svg'
        },
        'VISC11': {
            symbol: 'VISC11',
            name: 'Vinci Shopping Centers FII',
            price: 98.85 + (Math.random() * 3.5 - 1.75),
            change: 0.35 * (Math.random() > 0.5 ? 1 : -1),
            changePercent: 0.36 * (Math.random() > 0.5 ? 1 : -1),
            high: 99.50,
            low: 97.65,
            open: 98.25,
            previousClose: 98.50,
            volume: 850000 + (Math.random() * 250000),
            marketCap: 6500000000,
            currency: 'BRL',
            region: 'BR',
            sector: 'Real Estate',
            dividend: 0.60,
            dividendYield: 7.3,
            logo: 'https://brapi.dev/favicon.svg'
        },
        'HFOF11': {
            symbol: 'HFOF11',
            name: 'Hedge Top FOFII',
            price: 85.25 + (Math.random() * 3 - 1.5),
            change: 0.25 * (Math.random() > 0.5 ? 1 : -1),
            changePercent: 0.29 * (Math.random() > 0.5 ? 1 : -1),
            high: 86.40,
            low: 84.10,
            open: 85.20,
            previousClose: 85.00,
            volume: 750000 + (Math.random() * 200000),
            marketCap: 5200000000,
            currency: 'BRL',
            region: 'BR',
            sector: 'Real Estate',
            dividend: 0.55,
            dividendYield: 7.7,
            logo: 'https://brapi.dev/favicon.svg'
        }
    };

    // Retornar dados para o símbolo solicitado
    return reitData[symbol] || {
        symbol: symbol,
        name: `${symbol}`,
        price: 100 + (Math.random() * 20 - 10),
        change: 0.4 * (Math.random() > 0.5 ? 1 : -1),
        changePercent: 0.4 * (Math.random() > 0.5 ? 1 : -1),
        high: 102 + (Math.random() * 2),
        low: 98 + (Math.random() * 2),
        open: 100 + (Math.random() * 1),
        previousClose: 99.5 + (Math.random() * 1),
        volume: 800000 + (Math.random() * 400000),
        marketCap: 6000000000 + (Math.random() * 2000000000),
        currency: 'BRL',
        region: 'BR',
        sector: 'Real Estate',
        dividend: 0.5 + (Math.random() * 0.3),
        dividendYield: 6 + (Math.random() * 2),
        logo: 'https://brapi.dev/favicon.svg'
    };
}

/**
 * Simula dados de ações brasileiras quando a API falha
 * @param {string[]} symbols - Símbolos das ações
 * @returns {Array} - Dados simulados de ações brasileiras
 */
function simulateBrazilianStocks(symbols) {
    console.warn('Simulando conjunto de ações brasileiras');
    return symbols.map(symbol => simulateBrazilianStock(symbol));
}

/**
 * Simula dados de FIIs quando a API falha
 * @param {string[]} symbols - Símbolos dos FIIs
 * @returns {Array} - Dados simulados de FIIs
 */
function simulateBrazilianREITs(symbols) {
    console.warn('Simulando conjunto de FIIs brasileiros');
    return symbols.map(symbol => simulateBrazilianREIT(symbol));
}

/**
 * Simula dados históricos de preços para uma ação brasileira quando a API falha
 * @param {string} symbol - Símbolo da ação
 * @param {string} range - Período de tempo
 * @param {string} interval - Intervalo
 * @returns {Object} - Dados históricos simulados
 */
function simulateBrazilianStockHistory(symbol, range = '1y', interval = '1d') {
    console.warn(`Simulando histórico para ação brasileira ${symbol} (${range})`);

    // Definir parâmetros de simulação
    let dataPoints, volatility, trend;
    const now = new Date();

    switch (range) {
        case '1d':
            dataPoints = 8; // 8 horas de mercado
            volatility = 0.005;
            trend = (Math.random() - 0.5) * 0.01;
            break;
        case '5d':
            dataPoints = 5; // 5 dias
            volatility = 0.01;
            trend = (Math.random() - 0.5) * 0.02;
            break;
        case '1mo':
            dataPoints = 30; // 30 dias
            volatility = 0.02;
            trend = (Math.random() - 0.5) * 0.04;
            break;
        case '3mo':
            dataPoints = 90; // 90 dias
            volatility = 0.03;
            trend = (Math.random() - 0.5) * 0.06;
            break;
        case '6mo':
            dataPoints = 180; // 180 dias
            volatility = 0.04;
            trend = (Math.random() - 0.5) * 0.08;
            break;
        case '1y':
            dataPoints = 252; // Dias úteis em um ano
            volatility = 0.05;
            trend = (Math.random() - 0.5) * 0.1;
            break;
        case '5y':
            dataPoints = 60; // 60 meses
            volatility = 0.08;
            trend = (Math.random() - 0.5) * 0.15;
            break;
        case 'max':
            dataPoints = 120; // 10 anos em meses
            volatility = 0.1;
            trend = (Math.random() - 0.5) * 0.2;
            break;
        default:
            dataPoints = 252; // Padrão: 1 ano
            volatility = 0.05;
            trend = (Math.random() - 0.5) * 0.1;
    }

    // Definir preço inicial com base no símbolo
    let basePrice;
    switch (symbol) {
        case 'PETR4': basePrice = 35; break;
        case 'VALE3': basePrice = 65; break;
        case 'ITUB4': basePrice = 32; break;
        case 'BBDC4': basePrice = 15; break;
        case 'ABEV3': basePrice = 13; break;
        default: basePrice = 50;
    }

    // Gerar dados históricos
    const prices = [];
    let currentPrice = basePrice;

    for (let i = 0; i < dataPoints; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (dataPoints - i));

        // Calcular variação diária
        const dailyChange = currentPrice * (trend + ((Math.random() - 0.5) * volatility * 2));

        // Calcular preços de abertura, máxima, mínima e fechamento
        const open = currentPrice;
        const close = currentPrice + dailyChange;
        const high = Math.max(open, close) + (Math.random() * Math.abs(dailyChange) * 0.5);
        const low = Math.min(open, close) - (Math.random() * Math.abs(dailyChange) * 0.5);

        // Calcular volume
        const baseVolume = symbol === 'PETR4' ? 45000000 :
                          symbol === 'VALE3' ? 38000000 :
                          symbol === 'ITUB4' ? 25000000 :
                          symbol === 'BBDC4' ? 22000000 :
                          symbol === 'ABEV3' ? 18000000 : 10000000;

        const volume = Math.round(baseVolume * (0.7 + (Math.random() * 0.6)));

        // Formatar data
        const formattedDate = date.toISOString().split('T')[0];

        // Adicionar ponto de dados
        prices.push({
            date: formattedDate,
            open: parseFloat(open.toFixed(2)),
            high: parseFloat(high.toFixed(2)),
            low: parseFloat(low.toFixed(2)),
            close: parseFloat(close.toFixed(2)),
            adjustedClose: parseFloat(close.toFixed(2)),
            volume: volume
        });

        // Atualizar preço atual para o próximo ponto
        currentPrice = close;
    }

    return {
        symbol: symbol,
        range: range,
        interval: interval,
        prices: prices
    };
}

/**
 * Simula dados de fundos imobiliários brasileiros quando a API falha
 * @param {string[]} symbols - Símbolos dos FIIs
 * @returns {Array} - Dados simulados de FIIs
 */
function simulateBrazilianREITs(symbols = ['KNRI11', 'HGLG11', 'XPLG11', 'VISC11', 'HFOF11']) {
    console.warn('Usando dados simulados de FIIs');

    const reitData = {
        'KNRI11': {
            symbol: 'KNRI11',
            name: 'Kinea Renda Imobiliária FII',
            price: 140.25 + (Math.random() * 5 - 2.5),
            change: 0.85 * (Math.random() > 0.5 ? 1 : -1),
            changePercent: 0.65 * (Math.random() > 0.5 ? 1 : -1),
            high: 141.50,
            low: 139.80,
            open: 140.10,
            previousClose: 139.40,
            volume: 8500000 + (Math.random() * 1500000),
            marketCap: 14000000000,
            currency: 'BRL',
            region: 'BR',
            sector: 'Real Estate',
            dividend: 0.75,
            dividendYield: 0.0625,
            logo: 'https://brapi.dev/favicon.svg'
        },
        'HGLG11': {
            symbol: 'HGLG11',
            name: 'CSHG Logística FII',
            price: 170.35 + (Math.random() * 6 - 3),
            change: 1.05 * (Math.random() > 0.5 ? 1 : -1),
            changePercent: 0.75 * (Math.random() > 0.5 ? 1 : -1),
            high: 171.80,
            low: 169.50,
            open: 170.20,
            previousClose: 169.30,
            volume: 7500000 + (Math.random() * 1200000),
            marketCap: 12000000000,
            currency: 'BRL',
            region: 'BR',
            sector: 'Real Estate',
            dividend: 0.85,
            dividendYield: 0.0595,
            logo: 'https://brapi.dev/favicon.svg'
        },
        'XPLG11': {
            symbol: 'XPLG11',
            name: 'XP Log FII',
            price: 110.45 + (Math.random() * 4 - 2),
            change: 0.65 * (Math.random() > 0.5 ? 1 : -1),
            changePercent: 0.55 * (Math.random() > 0.5 ? 1 : -1),
            high: 111.20,
            low: 109.80,
            open: 110.10,
            previousClose: 109.80,
            volume: 6500000 + (Math.random() * 1000000),
            marketCap: 9000000000,
            currency: 'BRL',
            region: 'BR',
            sector: 'Real Estate',
            dividend: 0.65,
            dividendYield: 0.0705,
            logo: 'https://brapi.dev/favicon.svg'
        },
        'VISC11': {
            symbol: 'VISC11',
            name: 'Vinci Shopping Centers FII',
            price: 105.75 + (Math.random() * 4 - 2),
            change: 0.55 * (Math.random() > 0.5 ? 1 : -1),
            changePercent: 0.50 * (Math.random() > 0.5 ? 1 : -1),
            high: 106.40,
            low: 105.10,
            open: 105.50,
            previousClose: 105.20,
            volume: 5500000 + (Math.random() * 900000),
            marketCap: 8500000000,
            currency: 'BRL',
            region: 'BR',
            sector: 'Real Estate',
            dividend: 0.60,
            dividendYield: 0.0680,
            logo: 'https://brapi.dev/favicon.svg'
        },
        'HFOF11': {
            symbol: 'HFOF11',
            name: 'Hedge TOP FOFII 3 FII',
            price: 85.35 + (Math.random() * 3 - 1.5),
            change: 0.45 * (Math.random() > 0.5 ? 1 : -1),
            changePercent: 0.55 * (Math.random() > 0.5 ? 1 : -1),
            high: 85.90,
            low: 84.80,
            open: 85.20,
            previousClose: 84.90,
            volume: 4500000 + (Math.random() * 800000),
            marketCap: 7000000000,
            currency: 'BRL',
            region: 'BR',
            sector: 'Real Estate',
            dividend: 0.55,
            dividendYield: 0.0770,
            logo: 'https://brapi.dev/favicon.svg'
        }
    };

    // Retornar apenas os símbolos solicitados
    return symbols.map(symbol => reitData[symbol] || {
        symbol: symbol,
        name: `${symbol}`,
        price: 100 + (Math.random() * 20 - 10),
        change: 0.5 * (Math.random() > 0.5 ? 1 : -1),
        changePercent: 0.5 * (Math.random() > 0.5 ? 1 : -1),
        high: 102 + (Math.random() * 2),
        low: 98 + (Math.random() * 2),
        open: 100 + (Math.random() * 1),
        previousClose: 99.5 + (Math.random() * 1),
        volume: 5000000 + (Math.random() * 1000000),
        marketCap: 8000000000 + (Math.random() * 2000000000),
        currency: 'BRL',
        region: 'BR',
        sector: 'Real Estate',
        dividend: 0.60,
        dividendYield: 0.07,
        logo: 'https://brapi.dev/favicon.svg'
    });
}

/**
 * Simula dados do índice Ibovespa quando a API falha
 * @returns {Object} - Dados simulados do Ibovespa
 */
function simulateIbovespaData() {
    console.warn('Usando dados simulados do Ibovespa');

    return {
        symbol: '^BVSP',
        name: 'Ibovespa',
        price: 128500 + (Math.random() * 1500 - 750),
        change: 850 * (Math.random() > 0.5 ? 1 : -1),
        changePercent: 0.65 * (Math.random() > 0.5 ? 1 : -1),
        high: 129200,
        low: 127800,
        open: 128100,
        previousClose: 127650,
        volume: 15000000000 + (Math.random() * 3000000000),
        currency: 'BRL',
        region: 'BR'
    };
}

// Exportar funções para uso em outros arquivos
window.loadBrazilianStocks = loadBrazilianStocks;
window.loadBrazilianStockHistory = loadBrazilianStockHistory;
window.loadBrazilianREITs = loadBrazilianREITs;
window.loadIbovespaData = loadIbovespaData;
