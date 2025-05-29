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
        // Propagar erro em vez de usar dados simulados
        throw error;
    }
}

// Função de simulação de dados de criptomoedas removida - usando apenas dados reais das APIs

// Função de simulação de dados históricos de criptomoedas removida - usando apenas dados reais das APIs

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

        // Se não conseguimos dados para todas as criptomoedas, registrar aviso
        if (processedData.length < cryptoIds.length) {
            const missingIds = cryptoIds.filter(id => !processedData.some(coin => coin.id === id));
            console.warn(`Dados não disponíveis para: ${missingIds.join(', ')}`);
        }

        // Salvar no cache
        const cacheKey = `crypto_market_${cryptoIds.join('_')}_${currency}`;
        CacheManager.saveToCache(cacheKey, processedData, CONFIG.cache.ttl.crypto);

        return processedData;
    } catch (error) {
        console.error('Erro ao processar resposta da Alpha Vantage:', error);
        // Propagar erro em vez de usar dados simulados
        throw error;
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
