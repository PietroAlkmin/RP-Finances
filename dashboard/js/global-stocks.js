/**
 * Global Stocks Module
 * Utiliza a API Finnhub para obter dados de ações globais
 */

// Controle de taxa para Finnhub API (60 chamadas por minuto)
const finnhubRateLimiter = {
    queue: [],
    processing: false,
    lastRequestTime: 0,
    minInterval: 1100, // 1.1 segundos entre chamadas (permite ~54 chamadas por minuto)
    maxQueueSize: 100,

    // Adicionar uma requisição à fila
    enqueue(requestFn) {
        return new Promise((resolve, reject) => {
            if (this.queue.length >= this.maxQueueSize) {
                console.warn('Finnhub API queue is full, rejecting request');
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
 * Obtém cotações de ações globais
 * @param {string[]} symbols - Símbolos das ações (ex: ['AAPL', 'MSFT'])
 * @returns {Promise<Array>} - Dados das ações
 */
async function loadGlobalStocks(symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA']) {
    try {
        console.log(`Carregando dados de ações globais para ${symbols.length} símbolos...`);

        // Verificar se há dados em cache
        const cacheKey = `global_stocks_${symbols.join('_')}`;
        const cachedData = CacheManager.getFromCache(cacheKey);

        if (cachedData) {
            console.log('Usando dados de ações globais do cache');
            return cachedData;
        }

        // Limitar o número de símbolos para evitar muitas chamadas de API
        const limitedSymbols = symbols.slice(0, 10);
        if (symbols.length > 10) {
            console.warn(`Limitando requisição para 10 símbolos dos ${symbols.length} solicitados`);
        }

        // Resultados
        const results = [];

        // Obter dados para cada símbolo
        for (const symbol of limitedSymbols) {
            try {
                // Construir URL da API
                const baseUrl = CONFIG.apiEndpoints.useProxy ?
                    CONFIG.apiEndpoints.proxyFinnhub :
                    CONFIG.apiEndpoints.finnhub;

                // Usar o rate limiter para a chamada da API
                const quoteData = await finnhubRateLimiter.enqueue(async () => {
                    const url = `${baseUrl}/quote?symbol=${symbol}&token=${CONFIG.apiKeys.finnhub}`;
                    console.log('Chamando Finnhub API (quote):', url);

                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error(`Erro na API Finnhub: ${response.status}`);
                    }

                    return await response.json();
                }).catch(error => {
                    console.error(`Erro ao obter cotação para ${symbol}:`, error);
                    throw error;
                });

                console.log(`Dados recebidos para ${symbol}:`, quoteData);

                // Usar o rate limiter para obter o perfil da empresa
                const profile = await finnhubRateLimiter.enqueue(async () => {
                    const profileUrl = `${baseUrl}/stock/profile2?symbol=${symbol}&token=${CONFIG.apiKeys.finnhub}`;
                    console.log('Chamando Finnhub API (profile):', profileUrl);

                    const profileResponse = await fetch(profileUrl);
                    if (!profileResponse.ok) {
                        throw new Error(`Erro na API Finnhub ao obter perfil: ${profileResponse.status}`);
                    }

                    return await profileResponse.json();
                }).catch(error => {
                    console.error(`Erro ao obter perfil para ${symbol}:`, error);
                    return {}; // Retornar objeto vazio em caso de erro
                });

                // Processar dados
                results.push({
                    symbol: symbol,
                    name: profile.name || symbol,
                    price: quoteData.c,
                    change: quoteData.d,
                    changePercent: quoteData.dp,
                    high: quoteData.h,
                    low: quoteData.l,
                    open: quoteData.o,
                    previousClose: quoteData.pc,
                    marketCap: profile.marketCapitalization ? profile.marketCapitalization * 1000000 : null,
                    currency: 'USD',
                    region: 'US',
                    sector: profile.finnhubIndustry || 'N/A',
                    logo: profile.logo || null,
                    weburl: profile.weburl || null
                });

            } catch (error) {
                console.error(`Erro ao obter dados para ${symbol}:`, error);

                // Adicionar dados simulados para este símbolo
                results.push(simulateGlobalStock(symbol));
            }
        }

        // Adicionar dados simulados para os símbolos restantes
        if (symbols.length > limitedSymbols.length) {
            const remainingSymbols = symbols.slice(limitedSymbols.length);
            for (const symbol of remainingSymbols) {
                results.push(simulateGlobalStock(symbol));
            }
        }

        // Salvar no cache
        CacheManager.saveToCache(cacheKey, results, CONFIG.cache.ttl.stocks);

        return results;
    } catch (error) {
        console.error('Erro ao carregar dados de ações globais:', error);
        return symbols.map(symbol => simulateGlobalStock(symbol));
    }
}

/**
 * Obtém dados históricos de preços para uma ação global
 * @param {string} symbol - Símbolo da ação (ex: 'AAPL')
 * @param {string} resolution - Resolução dos dados (1, 5, 15, 30, 60, D, W, M)
 * @param {number} from - Timestamp de início (Unix)
 * @param {number} to - Timestamp de fim (Unix)
 * @returns {Promise<Object>} - Dados históricos de preços
 */
async function loadGlobalStockHistory(symbol = 'AAPL', resolution = 'D', from = null, to = null) {
    try {
        console.log(`Carregando histórico para ação global ${symbol}...`);

        // Definir período se não fornecido
        if (!from || !to) {
            to = Math.floor(Date.now() / 1000);

            // Definir período com base na resolução
            switch (resolution) {
                case '1':
                case '5':
                case '15':
                case '30':
                case '60':
                    from = to - (60 * 60 * 24); // 1 dia
                    break;
                case 'D':
                    from = to - (60 * 60 * 24 * 365); // 1 ano
                    break;
                case 'W':
                    from = to - (60 * 60 * 24 * 365 * 2); // 2 anos
                    break;
                case 'M':
                    from = to - (60 * 60 * 24 * 365 * 5); // 5 anos
                    break;
                default:
                    from = to - (60 * 60 * 24 * 30); // 30 dias
            }
        }

        // Verificar se há dados em cache
        const cacheKey = `global_stock_history_${symbol}_${resolution}_${from}_${to}`;
        const cachedData = CacheManager.getFromCache(cacheKey);

        if (cachedData) {
            console.log('Usando histórico de ação global do cache');
            return cachedData;
        }

        // Construir URL da API
        const baseUrl = CONFIG.apiEndpoints.useProxy ?
            CONFIG.apiEndpoints.proxyFinnhub :
            CONFIG.apiEndpoints.finnhub;

        const url = `${baseUrl}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${CONFIG.apiKeys.finnhub}`;

        console.log('Chamando Finnhub API para histórico:', url);
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Erro na API Finnhub: ${response.status}`);
        }

        const data = await response.json();
        console.log('Dados históricos recebidos para', symbol);

        // Verificar se a resposta é válida
        if (data.s !== 'ok') {
            throw new Error(`Erro nos dados: ${data.s}`);
        }

        // Processar dados
        const historicalData = {
            symbol: symbol,
            resolution: resolution,
            from: from,
            to: to,
            prices: []
        };

        // Converter arrays em objetos de preço
        for (let i = 0; i < data.t.length; i++) {
            historicalData.prices.push({
                time: data.t[i] * 1000, // Converter para milissegundos
                open: data.o[i],
                high: data.h[i],
                low: data.l[i],
                close: data.c[i],
                volume: data.v[i]
            });
        }

        // Salvar no cache
        CacheManager.saveToCache(cacheKey, historicalData, CONFIG.cache.ttl.stocks);

        return historicalData;
    } catch (error) {
        console.error('Erro ao carregar histórico de ação global:', error);
        return simulateGlobalStockHistory(symbol, resolution, from, to);
    }
}

/**
 * Obtém dados de índices globais
 * @returns {Promise<Array>} - Dados dos índices
 */
async function loadGlobalIndices() {
    try {
        console.log('Carregando dados de índices globais...');

        // Verificar se há dados em cache
        const cacheKey = 'global_indices';
        const cachedData = CacheManager.getFromCache(cacheKey);

        if (cachedData) {
            console.log('Usando dados de índices globais do cache');
            return cachedData;
        }

        // Lista de símbolos de índices
        const indices = [
            { symbol: '^GSPC', name: 'S&P 500' },
            { symbol: '^DJI', name: 'Dow Jones' },
            { symbol: '^IXIC', name: 'Nasdaq' },
            { symbol: '^FTSE', name: 'FTSE 100' },
            { symbol: '^GDAXI', name: 'DAX' },
            { symbol: '^N225', name: 'Nikkei 225' }
        ];

        // Resultados
        const results = [];

        // Obter dados para cada índice
        for (const index of indices) {
            try {
                // Construir URL da API
                const baseUrl = CONFIG.apiEndpoints.useProxy ?
                    CONFIG.apiEndpoints.proxyFinnhub :
                    CONFIG.apiEndpoints.finnhub;

                const url = `${baseUrl}/quote?symbol=${index.symbol}&token=${CONFIG.apiKeys.finnhub}`;

                console.log('Chamando Finnhub API para índice:', url);
                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error(`Erro na API Finnhub: ${response.status}`);
                }

                const data = await response.json();
                console.log(`Dados recebidos para índice ${index.symbol}:`, data);

                // Processar dados
                results.push({
                    symbol: index.symbol,
                    name: index.name,
                    price: data.c,
                    change: data.d,
                    changePercent: data.dp,
                    high: data.h,
                    low: data.l,
                    open: data.o,
                    previousClose: data.pc
                });

                // Aguardar um pouco para não sobrecarregar a API
                await new Promise(resolve => setTimeout(resolve, 200));

            } catch (error) {
                console.error(`Erro ao obter dados para índice ${index.symbol}:`, error);

                // Adicionar dados simulados para este índice
                results.push(simulateGlobalIndex(index.symbol, index.name));
            }
        }

        // Salvar no cache
        CacheManager.saveToCache(cacheKey, results, CONFIG.cache.ttl.indices);

        return results;
    } catch (error) {
        console.error('Erro ao carregar dados de índices globais:', error);
        return simulateGlobalIndices();
    }
}

/**
 * Simula dados de uma ação global quando a API falha
 * @param {string} symbol - Símbolo da ação
 * @returns {Object} - Dados simulados da ação
 */
function simulateGlobalStock(symbol) {
    console.warn(`Simulando dados para ação global ${symbol}`);

    // Dados simulados com base no símbolo
    const stockData = {
        'AAPL': {
            symbol: 'AAPL',
            name: 'Apple Inc.',
            price: 185.92 + (Math.random() * 5 - 2.5),
            change: 1.25 * (Math.random() > 0.5 ? 1 : -1),
            changePercent: 0.65 * (Math.random() > 0.5 ? 1 : -1),
            high: 187.50,
            low: 184.80,
            open: 185.20,
            previousClose: 184.67,
            marketCap: 2900000000000,
            currency: 'USD',
            region: 'US',
            sector: 'Technology',
            logo: 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/AAPL.svg',
            weburl: 'https://www.apple.com/'
        },
        'MSFT': {
            symbol: 'MSFT',
            name: 'Microsoft Corporation',
            price: 415.50 + (Math.random() * 8 - 4),
            change: 2.15 * (Math.random() > 0.5 ? 1 : -1),
            changePercent: 0.55 * (Math.random() > 0.5 ? 1 : -1),
            high: 418.20,
            low: 413.40,
            open: 414.80,
            previousClose: 413.35,
            marketCap: 3100000000000,
            currency: 'USD',
            region: 'US',
            sector: 'Technology',
            logo: 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/MSFT.svg',
            weburl: 'https://www.microsoft.com/'
        },
        'GOOGL': {
            symbol: 'GOOGL',
            name: 'Alphabet Inc.',
            price: 165.30 + (Math.random() * 4 - 2),
            change: 1.05 * (Math.random() > 0.5 ? 1 : -1),
            changePercent: 0.65 * (Math.random() > 0.5 ? 1 : -1),
            high: 166.80,
            low: 164.20,
            open: 165.10,
            previousClose: 164.25,
            marketCap: 2100000000000,
            currency: 'USD',
            region: 'US',
            sector: 'Technology',
            logo: 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/GOOGL.svg',
            weburl: 'https://www.abc.xyz/'
        },
        'AMZN': {
            symbol: 'AMZN',
            name: 'Amazon.com Inc.',
            price: 178.75 + (Math.random() * 5 - 2.5),
            change: 1.35 * (Math.random() > 0.5 ? 1 : -1),
            changePercent: 0.75 * (Math.random() > 0.5 ? 1 : -1),
            high: 180.20,
            low: 177.50,
            open: 178.10,
            previousClose: 177.40,
            marketCap: 1850000000000,
            currency: 'USD',
            region: 'US',
            sector: 'Consumer Cyclical',
            logo: 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/AMZN.svg',
            weburl: 'https://www.amazon.com/'
        },
        'TSLA': {
            symbol: 'TSLA',
            name: 'Tesla Inc.',
            price: 245.60 + (Math.random() * 10 - 5),
            change: 3.25 * (Math.random() > 0.5 ? 1 : -1),
            changePercent: 1.35 * (Math.random() > 0.5 ? 1 : -1),
            high: 248.80,
            low: 242.40,
            open: 244.90,
            previousClose: 242.35,
            marketCap: 780000000000,
            currency: 'USD',
            region: 'US',
            sector: 'Automotive',
            logo: 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/TSLA.svg',
            weburl: 'https://www.tesla.com/'
        }
    };

    // Retornar dados para o símbolo solicitado ou dados genéricos
    return stockData[symbol] || {
        symbol: symbol,
        name: `${symbol} Inc.`,
        price: 100 + (Math.random() * 20 - 10),
        change: 1.5 * (Math.random() > 0.5 ? 1 : -1),
        changePercent: 1.5 * (Math.random() > 0.5 ? 1 : -1),
        high: 102 + (Math.random() * 2),
        low: 98 + (Math.random() * 2),
        open: 100 + (Math.random() * 1),
        previousClose: 99.5 + (Math.random() * 1),
        marketCap: 50000000000 + (Math.random() * 10000000000),
        currency: 'USD',
        region: 'US',
        sector: 'Various',
        logo: null,
        weburl: null
    };
}

/**
 * Simula dados históricos de preços para uma ação global quando a API falha
 * @param {string} symbol - Símbolo da ação
 * @param {string} resolution - Resolução dos dados
 * @param {number} from - Timestamp de início
 * @param {number} to - Timestamp de fim
 * @returns {Object} - Dados históricos simulados
 */
function simulateGlobalStockHistory(symbol, resolution, from, to) {
    console.warn(`Simulando histórico para ação global ${symbol}`);

    // Definir período se não fornecido
    if (!from || !to) {
        to = Math.floor(Date.now() / 1000);

        // Definir período com base na resolução
        switch (resolution) {
            case '1':
            case '5':
            case '15':
            case '30':
            case '60':
                from = to - (60 * 60 * 24); // 1 dia
                break;
            case 'D':
                from = to - (60 * 60 * 24 * 365); // 1 ano
                break;
            case 'W':
                from = to - (60 * 60 * 24 * 365 * 2); // 2 anos
                break;
            case 'M':
                from = to - (60 * 60 * 24 * 365 * 5); // 5 anos
                break;
            default:
                from = to - (60 * 60 * 24 * 30); // 30 dias
        }
    }

    // Definir parâmetros de simulação
    let dataPoints, interval, basePrice, volatility, trend;

    switch (resolution) {
        case '1':
            dataPoints = (to - from) / 60;
            interval = 60 * 1000; // 1 minuto em ms
            volatility = 0.001;
            break;
        case '5':
            dataPoints = (to - from) / (5 * 60);
            interval = 5 * 60 * 1000; // 5 minutos em ms
            volatility = 0.002;
            break;
        case '15':
            dataPoints = (to - from) / (15 * 60);
            interval = 15 * 60 * 1000; // 15 minutos em ms
            volatility = 0.003;
            break;
        case '30':
            dataPoints = (to - from) / (30 * 60);
            interval = 30 * 60 * 1000; // 30 minutos em ms
            volatility = 0.004;
            break;
        case '60':
            dataPoints = (to - from) / (60 * 60);
            interval = 60 * 60 * 1000; // 1 hora em ms
            volatility = 0.005;
            break;
        case 'D':
            dataPoints = (to - from) / (24 * 60 * 60);
            interval = 24 * 60 * 60 * 1000; // 1 dia em ms
            volatility = 0.01;
            break;
        case 'W':
            dataPoints = (to - from) / (7 * 24 * 60 * 60);
            interval = 7 * 24 * 60 * 60 * 1000; // 1 semana em ms
            volatility = 0.02;
            break;
        case 'M':
            dataPoints = (to - from) / (30 * 24 * 60 * 60);
            interval = 30 * 24 * 60 * 60 * 1000; // 1 mês em ms
            volatility = 0.03;
            break;
        default:
            dataPoints = (to - from) / (24 * 60 * 60);
            interval = 24 * 60 * 60 * 1000; // 1 dia em ms
            volatility = 0.01;
    }

    // Limitar número de pontos para evitar sobrecarga
    dataPoints = Math.min(dataPoints, 1000);

    // Definir preço base e tendência com base no símbolo
    switch (symbol) {
        case 'AAPL':
            basePrice = 185;
            trend = 0.0001;
            break;
        case 'MSFT':
            basePrice = 415;
            trend = 0.0002;
            break;
        case 'GOOGL':
            basePrice = 165;
            trend = 0.0001;
            break;
        case 'AMZN':
            basePrice = 178;
            trend = 0.0002;
            break;
        case 'TSLA':
            basePrice = 245;
            trend = 0.0003;
            break;
        default:
            basePrice = 100;
            trend = 0.0001;
    }

    // Gerar dados históricos
    const prices = [];
    let currentPrice = basePrice;
    const startTime = from * 1000; // Converter para milissegundos

    for (let i = 0; i < dataPoints; i++) {
        // Calcular tempo
        const time = startTime + (i * interval);

        // Calcular variação
        const change = currentPrice * (trend + ((Math.random() - 0.5) * volatility * 2));

        // Calcular preços
        const open = currentPrice;
        const close = currentPrice + change;
        const high = Math.max(open, close) + (Math.random() * Math.abs(change) * 0.5);
        const low = Math.min(open, close) - (Math.random() * Math.abs(change) * 0.5);

        // Calcular volume
        const volume = Math.round(basePrice * 100000 * (0.5 + Math.random()));

        // Adicionar ponto de dados
        prices.push({
            time: time,
            open: parseFloat(open.toFixed(2)),
            high: parseFloat(high.toFixed(2)),
            low: parseFloat(low.toFixed(2)),
            close: parseFloat(close.toFixed(2)),
            volume: volume
        });

        // Atualizar preço atual para o próximo ponto
        currentPrice = close;
    }

    return {
        symbol: symbol,
        resolution: resolution,
        from: from,
        to: to,
        prices: prices
    };
}

/**
 * Simula dados de um índice global quando a API falha
 * @param {string} symbol - Símbolo do índice
 * @param {string} name - Nome do índice
 * @returns {Object} - Dados simulados do índice
 */
function simulateGlobalIndex(symbol, name) {
    console.warn(`Simulando dados para índice global ${symbol}`);

    // Dados simulados com base no símbolo
    let basePrice, change, changePercent;

    switch (symbol) {
        case '^GSPC': // S&P 500
            basePrice = 5200;
            change = 15 * (Math.random() > 0.5 ? 1 : -1);
            changePercent = 0.3 * (Math.random() > 0.5 ? 1 : -1);
            break;
        case '^DJI': // Dow Jones
            basePrice = 38500;
            change = 120 * (Math.random() > 0.5 ? 1 : -1);
            changePercent = 0.35 * (Math.random() > 0.5 ? 1 : -1);
            break;
        case '^IXIC': // Nasdaq
            basePrice = 16300;
            change = 80 * (Math.random() > 0.5 ? 1 : -1);
            changePercent = 0.5 * (Math.random() > 0.5 ? 1 : -1);
            break;
        case '^FTSE': // FTSE 100
            basePrice = 7900;
            change = 25 * (Math.random() > 0.5 ? 1 : -1);
            changePercent = 0.3 * (Math.random() > 0.5 ? 1 : -1);
            break;
        case '^GDAXI': // DAX
            basePrice = 17800;
            change = 60 * (Math.random() > 0.5 ? 1 : -1);
            changePercent = 0.35 * (Math.random() > 0.5 ? 1 : -1);
            break;
        case '^N225': // Nikkei 225
            basePrice = 38200;
            change = 150 * (Math.random() > 0.5 ? 1 : -1);
            changePercent = 0.4 * (Math.random() > 0.5 ? 1 : -1);
            break;
        default:
            basePrice = 1000;
            change = 10 * (Math.random() > 0.5 ? 1 : -1);
            changePercent = 0.5 * (Math.random() > 0.5 ? 1 : -1);
    }

    const price = basePrice + (Math.random() * basePrice * 0.01 - basePrice * 0.005);

    return {
        symbol: symbol,
        name: name,
        price: price,
        change: change,
        changePercent: changePercent,
        high: price + (Math.random() * basePrice * 0.01),
        low: price - (Math.random() * basePrice * 0.01),
        open: price - change,
        previousClose: price - change
    };
}

/**
 * Simula dados de índices globais quando a API falha
 * @returns {Array} - Dados simulados de índices globais
 */
function simulateGlobalIndices() {
    console.warn('Simulando dados de índices globais');

    return [
        simulateGlobalIndex('^GSPC', 'S&P 500'),
        simulateGlobalIndex('^DJI', 'Dow Jones'),
        simulateGlobalIndex('^IXIC', 'Nasdaq'),
        simulateGlobalIndex('^FTSE', 'FTSE 100'),
        simulateGlobalIndex('^GDAXI', 'DAX'),
        simulateGlobalIndex('^N225', 'Nikkei 225')
    ];
}

// Exportar funções para uso em outros arquivos
window.loadGlobalStocks = loadGlobalStocks;
window.loadGlobalStockHistory = loadGlobalStockHistory;
window.loadGlobalIndices = loadGlobalIndices;
