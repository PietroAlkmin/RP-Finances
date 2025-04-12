/**
 * Módulo para carregamento de dados de criptomoedas
 * Utiliza dados simulados para evitar chamadas de API
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
            currentPrice: 63715.17,
            marketCap: 1248275802934,
            marketCapRank: 1,
            volume24h: 25392532591,
            priceChangePercentage24h: 3.48,
            sparklineData: generateRandomSparklineData(24, 60000, 65000)
        },
        {
            id: 'ethereum',
            symbol: 'eth',
            name: 'Ethereum',
            image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
            currentPrice: 3117.08,
            marketCap: 374259723649,
            marketCapRank: 2,
            volume24h: 15987654321,
            priceChangePercentage24h: 1.23,
            sparklineData: generateRandomSparklineData(24, 3000, 3200)
        },
        {
            id: 'binancecoin',
            symbol: 'bnb',
            name: 'BNB',
            image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
            currentPrice: 574.32,
            marketCap: 88654321098,
            marketCapRank: 3,
            volume24h: 2345678901,
            priceChangePercentage24h: 2.15,
            sparklineData: generateRandomSparklineData(24, 550, 580)
        },
        {
            id: 'ripple',
            symbol: 'xrp',
            name: 'XRP',
            image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
            currentPrice: 0.5423,
            marketCap: 29876543210,
            marketCapRank: 4,
            volume24h: 1234567890,
            priceChangePercentage24h: -1.45,
            sparklineData: generateRandomSparklineData(24, 0.52, 0.56)
        },
        {
            id: 'cardano',
            symbol: 'ada',
            name: 'Cardano',
            image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
            currentPrice: 0.4321,
            marketCap: 15234567890,
            marketCapRank: 5,
            volume24h: 987654321,
            priceChangePercentage24h: 0.87,
            sparklineData: generateRandomSparklineData(24, 0.42, 0.44)
        },
        {
            id: 'solana',
            symbol: 'sol',
            name: 'Solana',
            image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
            currentPrice: 137.89,
            marketCap: 59876543210,
            marketCapRank: 6,
            volume24h: 3456789012,
            priceChangePercentage24h: 4.32,
            sparklineData: generateRandomSparklineData(24, 130, 140)
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

/**
 * Obtém dados de mercado para as principais criptomoedas
 * @param {string[]} cryptoIds - IDs das criptomoedas (ex: ['bitcoin', 'ethereum'])
 * @param {string} currency - Moeda para conversão (ex: 'usd', 'brl')
 * @returns {Promise<Array>} - Dados de mercado das criptomoedas
 */
async function loadCryptoMarketData(cryptoIds = ['bitcoin', 'ethereum', 'binancecoin', 'ripple', 'cardano', 'solana'], currency = 'usd') {
    // Usar dados simulados para evitar chamadas de API
    console.log('Usando dados simulados de criptomoedas...');
    return getSimulatedCryptoData();

    // O código abaixo foi desativado para evitar chamadas de API
    /*
    try {
        console.log(`Carregando dados de mercado para ${cryptoIds.length} criptomoedas...`);

        // Verificar se há dados em cache
        const cacheKey = `crypto_market_${cryptoIds.join('_')}_${currency}`;
        const cachedData = CacheManager.getFromCache(cacheKey);

        if (cachedData) {
            console.log('Usando dados de criptomoedas do cache');
            return cachedData;
        }

        // Usar o sistema de rotação de APIs
        try {
            // Construir parâmetros para a API
            const params = {
                vs_currency: currency,
                ids: cryptoIds.join(','),
                order: 'market_cap_desc',
                per_page: 100,
                page: 1,
                sparkline: true,
                price_change_percentage: '1h,24h,7d'
            };

            // Obter URL e nome da API usando o gerenciador de APIs
            const apiInfo = ApiManager.buildApiUrl('crypto', 'coins/markets', params);
            const url = apiInfo.url;
            const apiName = apiInfo.apiName;

            console.log(`Chamando API de criptomoedas (${apiName}) com URL:`, url);
            const response = await fetch(url);
    */

            /* Comentado para evitar chamadas de API
            // Se estamos usando Alpha Vantage para criptomoedas, o formato da resposta será diferente
            if (apiName === 'alphaVantage') {
                return await processAlphaVantageResponse(response, cryptoIds, currency);
            }
            */

            /* Comentado para evitar chamadas de API
            if (!response.ok) {
                throw new Error(`Erro na API de criptomoedas (${apiName}): ${response.status}`);
            }
            */
        /* Comentado para evitar chamadas de API
        } catch (error) {
            console.error('Erro ao chamar API de criptomoedas:', error);
            throw error;
        }
        */

        /* Comentado para evitar chamadas de API
        const data = await response.json();
        console.log('Dados de criptomoedas recebidos:', data.length, 'moedas');
        */

        /* Comentado para evitar chamadas de API
        // Processar dados
        const processedData = data.map(coin => ({
            id: coin.id,
            symbol: coin.symbol.toUpperCase(),
            name: coin.name,
            image: coin.image,
            currentPrice: coin.current_price,
            marketCap: coin.market_cap,
            marketCapRank: coin.market_cap_rank,
            volume24h: coin.total_volume,
            priceChange24h: coin.price_change_24h,
            priceChangePercentage24h: coin.price_change_percentage_24h,
            priceChangePercentage1h: coin.price_change_percentage_1h_in_currency,
            priceChangePercentage7d: coin.price_change_percentage_7d_in_currency,
            circulatingSupply: coin.circulating_supply,
            totalSupply: coin.total_supply,
            maxSupply: coin.max_supply,
        */
            /* Comentado para evitar chamadas de API
            ath: coin.ath,
            athDate: coin.ath_date,
            sparklineData: coin.sparkline_in_7d?.price || [],
            lastUpdated: coin.last_updated
            */
        /* Comentado para evitar chamadas de API
        }));

        // Salvar no cache
        CacheManager.saveToCache(cacheKey, processedData, CONFIG.cache.ttl.crypto);

        return processedData;
        */
    /* Comentado para evitar chamadas de API
    } catch (error) {
        console.error('Erro ao carregar dados de criptomoedas:', error);
        return simulateCryptoData(cryptoIds, currency);
    }
    */
}

/**
 * Obtém dados históricos para uma criptomoeda específica
 * @param {string} cryptoId - ID da criptomoeda (ex: 'bitcoin')
 * @param {string} currency - Moeda para conversão (ex: 'usd', 'brl')
 * @param {number} days - Número de dias de dados históricos
 * @returns {Promise<Object>} - Dados históricos da criptomoeda
 */
async function loadCryptoHistoricalData(cryptoId = 'bitcoin', currency = 'usd', days = 30) {
    try {
        console.log(`Carregando dados históricos para ${cryptoId}...`);

        // Verificar se há dados em cache
        const cacheKey = `crypto_historical_${cryptoId}_${currency}_${days}`;
        const cachedData = CacheManager.getFromCache(cacheKey);

        if (cachedData) {
            console.log('Usando dados históricos de criptomoedas do cache');
            return cachedData;
        }

        // Construir URL da API
        const baseUrl = CONFIG.apiEndpoints.useProxy ?
            CONFIG.apiEndpoints.proxyCoinGecko :
            CONFIG.apiEndpoints.coinGecko;

        const url = `${baseUrl}/coins/${cryptoId}/market_chart?vs_currency=${currency}&days=${days}`;

        console.log('Chamando CoinGecko API para dados históricos:', url);
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Erro na API CoinGecko: ${response.status}`);
        }

        const data = await response.json();
        console.log('Dados históricos recebidos para', cryptoId);

        // Processar dados
        const processedData = {
            id: cryptoId,
            currency: currency,
            days: days,
            prices: data.prices.map(item => ({
                timestamp: item[0],
                price: item[1]
            })),
            marketCaps: data.market_caps.map(item => ({
                timestamp: item[0],
                marketCap: item[1]
            })),
            volumes: data.total_volumes.map(item => ({
                timestamp: item[0],
                volume: item[1]
            }))
        };

        // Salvar no cache
        CacheManager.saveToCache(cacheKey, processedData, CONFIG.cache.ttl.crypto);

        return processedData;
    } catch (error) {
        console.error('Erro ao carregar dados históricos de criptomoedas:', error);
        return simulateCryptoHistoricalData(cryptoId, currency, days);
    }
}

/**
 * Simula dados de mercado para criptomoedas quando a API falha
 * @param {string[]} cryptoIds - IDs das criptomoedas
 * @param {string} currency - Moeda para conversão
 * @returns {Array} - Dados simulados de criptomoedas
 */
function simulateCryptoData(cryptoIds = ['bitcoin', 'ethereum'], currency = 'usd') {
    console.warn('Usando dados simulados de criptomoedas');

    const simulatedData = [
        {
            id: 'bitcoin',
            symbol: 'BTC',
            name: 'Bitcoin',
            image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
            currentPrice: 50000 + (Math.random() * 5000),
            marketCap: 950000000000,
            marketCapRank: 1,
            volume24h: 30000000000,
            priceChange24h: 1500 * (Math.random() > 0.5 ? 1 : -1),
            priceChangePercentage24h: 3 * (Math.random() > 0.5 ? 1 : -1),
            priceChangePercentage1h: 0.5 * (Math.random() > 0.5 ? 1 : -1),
            priceChangePercentage7d: 5 * (Math.random() > 0.5 ? 1 : -1),
            circulatingSupply: 19000000,
            totalSupply: 21000000,
            maxSupply: 21000000,
            ath: 69000,
            athDate: '2021-11-10T14:24:11.849Z',
            sparklineData: Array(168).fill(0).map((_, i) => 50000 + (Math.sin(i/24) * 3000) + (Math.random() * 1000)),
            lastUpdated: new Date().toISOString()
        },
        {
            id: 'ethereum',
            symbol: 'ETH',
            name: 'Ethereum',
            image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
            currentPrice: 3000 + (Math.random() * 300),
            marketCap: 350000000000,
            marketCapRank: 2,
            volume24h: 15000000000,
            priceChange24h: 100 * (Math.random() > 0.5 ? 1 : -1),
            priceChangePercentage24h: 3.5 * (Math.random() > 0.5 ? 1 : -1),
            priceChangePercentage1h: 0.7 * (Math.random() > 0.5 ? 1 : -1),
            priceChangePercentage7d: 7 * (Math.random() > 0.5 ? 1 : -1),
            circulatingSupply: 120000000,
            totalSupply: 120000000,
            maxSupply: null,
            ath: 4800,
            athDate: '2021-11-08T20:15:31.861Z',
            sparklineData: Array(168).fill(0).map((_, i) => 3000 + (Math.sin(i/24) * 200) + (Math.random() * 100)),
            lastUpdated: new Date().toISOString()
        },
        {
            id: 'binancecoin',
            symbol: 'BNB',
            name: 'BNB',
            image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
            currentPrice: 400 + (Math.random() * 40),
            marketCap: 60000000000,
            marketCapRank: 3,
            volume24h: 2000000000,
            priceChange24h: 15 * (Math.random() > 0.5 ? 1 : -1),
            priceChangePercentage24h: 4 * (Math.random() > 0.5 ? 1 : -1),
            priceChangePercentage1h: 0.6 * (Math.random() > 0.5 ? 1 : -1),
            priceChangePercentage7d: 6 * (Math.random() > 0.5 ? 1 : -1),
            circulatingSupply: 155000000,
            totalSupply: 165000000,
            maxSupply: 165000000,
            ath: 690,
            athDate: '2021-05-10T07:30:34.310Z',
            sparklineData: Array(168).fill(0).map((_, i) => 400 + (Math.sin(i/24) * 30) + (Math.random() * 15)),
            lastUpdated: new Date().toISOString()
        },
        {
            id: 'ripple',
            symbol: 'XRP',
            name: 'XRP',
            image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
            currentPrice: 0.5 + (Math.random() * 0.1),
            marketCap: 25000000000,
            marketCapRank: 6,
            volume24h: 1500000000,
            priceChange24h: 0.02 * (Math.random() > 0.5 ? 1 : -1),
            priceChangePercentage24h: 4 * (Math.random() > 0.5 ? 1 : -1),
            priceChangePercentage1h: 0.8 * (Math.random() > 0.5 ? 1 : -1),
            priceChangePercentage7d: 8 * (Math.random() > 0.5 ? 1 : -1),
            circulatingSupply: 50000000000,
            totalSupply: 100000000000,
            maxSupply: 100000000000,
            ath: 3.4,
            athDate: '2018-01-07T00:00:00.000Z',
            sparklineData: Array(168).fill(0).map((_, i) => 0.5 + (Math.sin(i/24) * 0.05) + (Math.random() * 0.02)),
            lastUpdated: new Date().toISOString()
        },
        {
            id: 'cardano',
            symbol: 'ADA',
            name: 'Cardano',
            image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
            currentPrice: 0.3 + (Math.random() * 0.05),
            marketCap: 10000000000,
            marketCapRank: 8,
            volume24h: 500000000,
            priceChange24h: 0.01 * (Math.random() > 0.5 ? 1 : -1),
            priceChangePercentage24h: 3 * (Math.random() > 0.5 ? 1 : -1),
            priceChangePercentage1h: 0.5 * (Math.random() > 0.5 ? 1 : -1),
            priceChangePercentage7d: 5 * (Math.random() > 0.5 ? 1 : -1),
            circulatingSupply: 35000000000,
            totalSupply: 45000000000,
            maxSupply: 45000000000,
            ath: 3.1,
            athDate: '2021-09-02T06:00:10.474Z',
            sparklineData: Array(168).fill(0).map((_, i) => 0.3 + (Math.sin(i/24) * 0.03) + (Math.random() * 0.01)),
            lastUpdated: new Date().toISOString()
        },
        {
            id: 'solana',
            symbol: 'SOL',
            name: 'Solana',
            image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
            currentPrice: 100 + (Math.random() * 10),
            marketCap: 40000000000,
            marketCapRank: 5,
            volume24h: 2500000000,
            priceChange24h: 5 * (Math.random() > 0.5 ? 1 : -1),
            priceChangePercentage24h: 5 * (Math.random() > 0.5 ? 1 : -1),
            priceChangePercentage1h: 1 * (Math.random() > 0.5 ? 1 : -1),
            priceChangePercentage7d: 10 * (Math.random() > 0.5 ? 1 : -1),
            circulatingSupply: 400000000,
            totalSupply: 500000000,
            maxSupply: null,
            ath: 260,
            athDate: '2021-11-06T21:54:35.825Z',
            sparklineData: Array(168).fill(0).map((_, i) => 100 + (Math.sin(i/24) * 10) + (Math.random() * 5)),
            lastUpdated: new Date().toISOString()
        }
    ];

    // Filtrar apenas as criptomoedas solicitadas
    return simulatedData.filter(coin => cryptoIds.includes(coin.id));
}

/**
 * Simula dados históricos para uma criptomoeda quando a API falha
 * @param {string} cryptoId - ID da criptomoeda
 * @param {string} currency - Moeda para conversão
 * @param {number} days - Número de dias de dados históricos
 * @returns {Object} - Dados históricos simulados
 */
function simulateCryptoHistoricalData(cryptoId = 'bitcoin', currency = 'usd', days = 30) {
    console.warn(`Usando dados históricos simulados para ${cryptoId}`);

    // Definir preço base e volatilidade com base na moeda
    let basePrice, volatility;

    switch (cryptoId) {
        case 'bitcoin':
            basePrice = 50000;
            volatility = 5000;
            break;
        case 'ethereum':
            basePrice = 3000;
            volatility = 300;
            break;
        case 'binancecoin':
            basePrice = 400;
            volatility = 40;
            break;
        case 'ripple':
            basePrice = 0.5;
            volatility = 0.05;
            break;
        case 'cardano':
            basePrice = 0.3;
            volatility = 0.03;
            break;
        case 'solana':
            basePrice = 100;
            volatility = 10;
            break;
        default:
            basePrice = 100;
            volatility = 10;
    }

    // Gerar dados históricos
    const now = Date.now();
    const dataPoints = days * 24; // Pontos por hora
    const interval = (days * 24 * 60 * 60 * 1000) / dataPoints;

    const prices = [];
    const marketCaps = [];
    const volumes = [];

    let currentPrice = basePrice;
    let trend = 0;

    for (let i = 0; i < dataPoints; i++) {
        const timestamp = now - ((dataPoints - i) * interval);

        // Simular movimento de preço com tendência e aleatoriedade
        if (i % 24 === 0) {
            // Mudar tendência a cada 24 pontos (diariamente)
            trend = (Math.random() - 0.5) * 0.1;
        }

        // Adicionar componente aleatório e tendência
        currentPrice = currentPrice * (1 + trend + (Math.random() - 0.5) * 0.02);

        // Garantir que o preço não caia abaixo de um valor mínimo
        currentPrice = Math.max(currentPrice, basePrice * 0.5);

        // Adicionar dados
        prices.push([timestamp, currentPrice]);

        // Simular market cap (preço * oferta circulante)
        const circulatingSupply = cryptoId === 'bitcoin' ? 19000000 :
                                 cryptoId === 'ethereum' ? 120000000 :
                                 cryptoId === 'binancecoin' ? 155000000 :
                                 cryptoId === 'ripple' ? 50000000000 :
                                 cryptoId === 'cardano' ? 35000000000 :
                                 cryptoId === 'solana' ? 400000000 : 1000000000;

        marketCaps.push([timestamp, currentPrice * circulatingSupply]);

        // Simular volume (maior em dias de maior volatilidade)
        const dailyVolatility = Math.abs(trend) * 10;
        const volume = currentPrice * circulatingSupply * (0.05 + dailyVolatility) * (0.8 + Math.random() * 0.4);
        volumes.push([timestamp, volume]);
    }

    return {
        id: cryptoId,
        currency: currency,
        days: days,
        prices: prices.map(item => ({
            timestamp: item[0],
            price: item[1]
        })),
        marketCaps: marketCaps.map(item => ({
            timestamp: item[0],
            marketCap: item[1]
        })),
        volumes: volumes.map(item => ({
            timestamp: item[0],
            volume: item[1]
        }))
    };
}

/**
 * Processa a resposta da API Alpha Vantage para criptomoedas
 * @param {Response} response - Resposta da API
 * @param {string[]} cryptoIds - IDs das criptomoedas
 * @param {string} currency - Moeda para conversão
 * @returns {Promise<Array>} - Dados processados
 */
async function processAlphaVantageResponse(response, cryptoIds, currency) {
    try {
        if (!response.ok) {
            throw new Error(`Erro na API Alpha Vantage: ${response.status}`);
        }

        const data = await response.json();
        console.log('Dados recebidos da Alpha Vantage:', data);

        // Alpha Vantage tem um formato diferente para criptomoedas
        // Vamos converter para o formato usado pelo CoinGecko
        const processedData = [];

        // Para cada criptomoeda solicitada
        for (const cryptoId of cryptoIds) {
            // Mapear ID para símbolo usado pela Alpha Vantage
            const symbol = mapCryptoIdToSymbol(cryptoId);

            // Verificar se temos dados para este símbolo
            if (data[`Digital Currency Daily`] && data[`Digital Currency Daily`][`1. Digital Currency Code`] === symbol) {
                const metadata = data[`Digital Currency Daily`];
                const timeSeries = data[`Time Series (Digital Currency Daily)`];

                // Obter dados mais recentes
                const latestDate = Object.keys(timeSeries)[0];
                const latestData = timeSeries[latestDate];

                // Calcular preço e variação
                const currentPrice = parseFloat(latestData[`4a. close (${currency.toUpperCase()})`]);

                // Obter dados do dia anterior para calcular variação
                const previousDate = Object.keys(timeSeries)[1];
                const previousData = timeSeries[previousDate];
                const previousPrice = parseFloat(previousData[`4a. close (${currency.toUpperCase()})`]);

                // Calcular variação percentual
                const priceChange = currentPrice - previousPrice;
                const priceChangePercentage = (priceChange / previousPrice) * 100;

                // Gerar dados de sparkline (7 dias)
                const sparklineData = [];
                const dates = Object.keys(timeSeries).slice(0, 7).reverse();

                for (const date of dates) {
                    sparklineData.push(parseFloat(timeSeries[date][`4a. close (${currency.toUpperCase()})`]));
                }

                // Criar objeto no formato esperado
                processedData.push({
                    id: cryptoId,
                    symbol: symbol.toLowerCase(),
                    name: getCryptoName(cryptoId),
                    image: `https://assets.coincap.io/assets/icons/${symbol.toLowerCase()}@2x.png`,
                    currentPrice: currentPrice,
                    marketCap: parseFloat(latestData[`6. market cap (${currency.toUpperCase()})`]),
                    marketCapRank: 0, // Alpha Vantage não fornece ranking
                    volume24h: parseFloat(latestData[`5. volume`]) * currentPrice,
                    priceChange24h: priceChange,
                    priceChangePercentage24h: priceChangePercentage,
                    priceChangePercentage1h: 0, // Alpha Vantage não fornece variação por hora
                    priceChangePercentage7d: 0, // Calcularíamos com mais dados históricos
                    circulatingSupply: 0, // Alpha Vantage não fornece
                    totalSupply: 0,
                    maxSupply: 0,
                    ath: 0,
                    athDate: null,
                    sparklineData: sparklineData,
                    lastUpdated: new Date().toISOString()
                });
            }
        }

        // Se não conseguimos dados para todas as criptomoedas, complementar com dados simulados
        if (processedData.length < cryptoIds.length) {
            const missingIds = cryptoIds.filter(id => !processedData.some(coin => coin.id === id));
            const simulatedData = simulateCryptoData(missingIds, currency);

            // Adicionar dados simulados
            processedData.push(...simulatedData);
        }

        // Salvar no cache
        const cacheKey = `crypto_market_${cryptoIds.join('_')}_${currency}`;
        CacheManager.saveToCache(cacheKey, processedData, CONFIG.cache.ttl.crypto);

        return processedData;
    } catch (error) {
        console.error('Erro ao processar resposta da Alpha Vantage:', error);
        return simulateCryptoData(cryptoIds, currency);
    }
}

/**
 * Mapeia um ID de criptomoeda para o símbolo usado pela Alpha Vantage
 * @param {string} cryptoId - ID da criptomoeda
 * @returns {string} - Símbolo da criptomoeda
 */
function mapCryptoIdToSymbol(cryptoId) {
    const mapping = {
        'bitcoin': 'BTC',
        'ethereum': 'ETH',
        'binancecoin': 'BNB',
        'ripple': 'XRP',
        'cardano': 'ADA',
        'solana': 'SOL',
        'dogecoin': 'DOGE',
        'polkadot': 'DOT',
        'litecoin': 'LTC',
        'avalanche-2': 'AVAX'
    };

    return mapping[cryptoId] || cryptoId.toUpperCase();
}

/**
 * Obtém o nome completo de uma criptomoeda a partir do ID
 * @param {string} cryptoId - ID da criptomoeda
 * @returns {string} - Nome da criptomoeda
 */
function getCryptoName(cryptoId) {
    const mapping = {
        'bitcoin': 'Bitcoin',
        'ethereum': 'Ethereum',
        'binancecoin': 'Binance Coin',
        'ripple': 'XRP',
        'cardano': 'Cardano',
        'solana': 'Solana',
        'dogecoin': 'Dogecoin',
        'polkadot': 'Polkadot',
        'litecoin': 'Litecoin',
        'avalanche-2': 'Avalanche'
    };

    return mapping[cryptoId] || cryptoId.charAt(0).toUpperCase() + cryptoId.slice(1);
}

// Exportar funções para uso em outros arquivos
window.loadCryptoMarketData = loadCryptoMarketData;
window.loadCryptoHistoricalData = loadCryptoHistoricalData;
