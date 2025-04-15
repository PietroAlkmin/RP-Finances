/**
 * Cryptocurrency Data Module
 * Utiliza a API CoinGecko para obter dados de criptomoedas
 */

// Controle de taxa para CoinGecko API (10-50 chamadas por minuto)
const coinGeckoRateLimiter = {
    queue: [],
    processing: false,
    lastRequestTime: 0,
    minInterval: 2000, // 2 segundos entre chamadas (30 chamadas por minuto)
    maxQueueSize: 50,

    // Adicionar uma requisição à fila
    enqueue(requestFn) {
        return new Promise((resolve, reject) => {
            if (this.queue.length >= this.maxQueueSize) {
                console.warn('CoinGecko API queue is full, rejecting request');
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
 * Obtém dados de mercado de criptomoedas
 * @param {string[]} coinIds - IDs das criptomoedas (ex: ['bitcoin', 'ethereum'])
 * @returns {Promise<Array>} - Dados das criptomoedas
 */
async function loadCryptoMarketData(coinIds = ['bitcoin', 'ethereum', 'binancecoin', 'ripple', 'cardano']) {
    try {
        console.log(`Carregando dados de mercado para ${coinIds.length} criptomoedas...`);

        // Verificar se há dados em cache
        const cacheKey = `crypto_market_${coinIds.join('_')}`;
        const cachedData = CacheManager.getFromCache(cacheKey);

        if (cachedData) {
            console.log('Usando dados de criptomoedas do cache');
            return cachedData;
        }

        // Limitar o número de moedas para evitar problemas com a API
        const limitedCoinIds = coinIds.slice(0, 5);
        if (coinIds.length > 5) {
            console.warn(`Limitando requisição para 5 moedas das ${coinIds.length} solicitadas`);
        }

        // Usar o rate limiter para a chamada da API
        try {
            const data = await coinGeckoRateLimiter.enqueue(async () => {
                // Construir URL da API
                const baseUrl = CONFIG.apiEndpoints.useProxy ?
                    CONFIG.apiEndpoints.proxyCoinGecko :
                    CONFIG.apiEndpoints.coinGecko;

                const url = `${baseUrl}/coins/markets?vs_currency=usd&ids=${limitedCoinIds.join(',')}&order=market_cap_desc&sparkline=true&price_change_percentage=24h,7d,30d`;

                console.log('Chamando CoinGecko API:', url);
                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error(`Erro na API CoinGecko: ${response.status}`);
                }

                return await response.json();
            });

            console.log('Dados de criptomoedas recebidos:', data.length, 'moedas');

            // Adicionar dados simulados para as moedas restantes
            let result = [...data];
            if (coinIds.length > limitedCoinIds.length) {
                const remainingCoinIds = coinIds.slice(limitedCoinIds.length);
                const simulatedData = simulateCryptoMarketData(remainingCoinIds);
                result = result.concat(simulatedData);
            }

            // Salvar no cache
            CacheManager.saveToCache(cacheKey, result, CONFIG.cache.ttl.crypto);

            return result;
        } catch (apiError) {
            console.error('Erro na chamada à API CoinGecko:', apiError);
            throw apiError; // Propagar erro para ser tratado no catch externo
        }
    } catch (error) {
        console.error('Erro ao carregar dados de criptomoedas:', error);
        return simulateCryptoMarketData(coinIds);
    }
}

/**
 * Obtém dados detalhados de uma criptomoeda
 * @param {string} coinId - ID da criptomoeda (ex: 'bitcoin')
 * @returns {Promise<Object>} - Dados detalhados da criptomoeda
 */
async function loadCryptoDetails(coinId = 'bitcoin') {
    try {
        console.log(`Carregando detalhes para criptomoeda ${coinId}...`);

        // Verificar se há dados em cache
        const cacheKey = `crypto_details_${coinId}`;
        const cachedData = CacheManager.getFromCache(cacheKey);

        if (cachedData) {
            console.log('Usando detalhes de criptomoeda do cache');
            return cachedData;
        }

        // Usar o rate limiter para a chamada da API
        try {
            const data = await coinGeckoRateLimiter.enqueue(async () => {
                // Construir URL da API
                const baseUrl = CONFIG.apiEndpoints.useProxy ?
                    CONFIG.apiEndpoints.proxyCoinGecko :
                    CONFIG.apiEndpoints.coinGecko;

                const url = `${baseUrl}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=true&developer_data=false`;

                console.log('Chamando CoinGecko API para detalhes:', url);
                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error(`Erro na API CoinGecko: ${response.status}`);
                }

                return await response.json();
            });

            console.log('Detalhes recebidos para', coinId);

            // Salvar no cache
            CacheManager.saveToCache(cacheKey, data, CONFIG.cache.ttl.crypto);

            return data;
        } catch (apiError) {
            console.error('Erro na chamada à API CoinGecko para detalhes:', apiError);
            throw apiError; // Propagar erro para ser tratado no catch externo
        }
    } catch (error) {
        console.error('Erro ao carregar detalhes de criptomoeda:', error);
        return simulateCryptoDetails(coinId);
    }
}

/**
 * Simula dados de mercado de criptomoedas quando a API falha
 */
function simulateCryptoMarketData(coinIds) {
    console.warn('Usando dados simulados de criptomoedas');

    const cryptoData = {
        'bitcoin': {
            id: 'bitcoin',
            symbol: 'btc',
            name: 'Bitcoin',
            image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
            current_price: 63715.17,
            market_cap: 1248275802934,
            market_cap_rank: 1,
            total_volume: 25392532591,
            price_change_24h: 2215.17 * (Math.random() > 0.5 ? 1 : -1),
            price_change_percentage_24h: 3.48 * (Math.random() > 0.5 ? 1 : -1),
            price_change_percentage_7d: 5.12 * (Math.random() > 0.5 ? 1 : -1),
            price_change_percentage_30d: 10.45 * (Math.random() > 0.5 ? 1 : -1),
            sparkline_in_7d: { price: generateRandomPrices(24, 60000, 65000) }
        },
        'ethereum': {
            id: 'ethereum',
            symbol: 'eth',
            name: 'Ethereum',
            image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
            current_price: 3117.08,
            market_cap: 374259723649,
            market_cap_rank: 2,
            total_volume: 15987654321,
            price_change_24h: 38.17 * (Math.random() > 0.5 ? 1 : -1),
            price_change_percentage_24h: 1.23 * (Math.random() > 0.5 ? 1 : -1),
            price_change_percentage_7d: 3.45 * (Math.random() > 0.5 ? 1 : -1),
            price_change_percentage_30d: 8.76 * (Math.random() > 0.5 ? 1 : -1),
            sparkline_in_7d: { price: generateRandomPrices(24, 3000, 3200) }
        }
    };

    // Apenas Bitcoin e Ethereum são usados

    // Retornar apenas as moedas solicitadas
    return coinIds.map(id => cryptoData[id] || {
        id: id,
        symbol: id.substring(0, 3),
        name: id.charAt(0).toUpperCase() + id.slice(1),
        image: `https://assets.coingecko.com/coins/images/1/large/${id}.png`,
        current_price: 1.0 + (Math.random() * 0.5),  // Valor mais realista para criptomoedas menos conhecidas
        market_cap: 1000000000 + (Math.random() * 500000000),
        market_cap_rank: 50 + Math.floor(Math.random() * 50),
        total_volume: 100000000 + (Math.random() * 50000000),
        price_change_24h: 0.05 * (Math.random() > 0.5 ? 1 : -1),
        price_change_percentage_24h: 2 * (Math.random() > 0.5 ? 1 : -1),
        price_change_percentage_7d: 5 * (Math.random() > 0.5 ? 1 : -1),
        price_change_percentage_30d: 10 * (Math.random() > 0.5 ? 1 : -1),
        sparkline_in_7d: { price: generateRandomPrices(24, 0.9, 1.1) }
    });
}

/**
 * Simula dados detalhados de uma criptomoeda quando a API falha
 */
function simulateCryptoDetails(coinId) {
    console.warn(`Simulando detalhes para criptomoeda ${coinId}`);

    // Dados básicos simulados
    const baseDetails = {
        id: coinId,
        symbol: coinId.substring(0, 3),
        name: coinId.charAt(0).toUpperCase() + coinId.slice(1),
        description: {
            en: `${coinId.charAt(0).toUpperCase() + coinId.slice(1)} é uma criptomoeda digital.`
        },
        image: {
            thumb: `https://assets.coingecko.com/coins/images/1/thumb/${coinId}.png`,
            small: `https://assets.coingecko.com/coins/images/1/small/${coinId}.png`,
            large: `https://assets.coingecko.com/coins/images/1/large/${coinId}.png`
        },
        market_data: {
            current_price: {
                usd: 100 + (Math.random() * 50),
                brl: (100 + (Math.random() * 50)) * 5
            },
            market_cap: {
                usd: 10000000000 + (Math.random() * 5000000000)
            },
            total_volume: {
                usd: 1000000000 + (Math.random() * 500000000)
            },
            price_change_percentage_24h: 5 * (Math.random() > 0.5 ? 1 : -1),
            price_change_percentage_7d: 10 * (Math.random() > 0.5 ? 1 : -1),
            price_change_percentage_30d: 20 * (Math.random() > 0.5 ? 1 : -1)
        },
        community_data: {
            twitter_followers: 100000 + Math.floor(Math.random() * 900000),
            reddit_subscribers: 50000 + Math.floor(Math.random() * 450000)
        }
    };

    // Dados específicos para moedas conhecidas
    if (coinId === 'bitcoin') {
        baseDetails.name = 'Bitcoin';
        baseDetails.symbol = 'btc';
        baseDetails.description.en = 'Bitcoin é a primeira criptomoeda descentralizada do mundo, criada em 2009 por uma pessoa (ou grupo) usando o pseudônimo Satoshi Nakamoto.';
        baseDetails.market_data.current_price.usd = 63715.17 + (Math.random() * 2000 - 1000);
        baseDetails.market_data.current_price.brl = baseDetails.market_data.current_price.usd * 5;
        baseDetails.market_data.market_cap.usd = 1248275802934;
        baseDetails.market_data.total_volume.usd = 25392532591;
    } else if (coinId === 'ethereum') {
        baseDetails.name = 'Ethereum';
        baseDetails.symbol = 'eth';
        baseDetails.description.en = 'Ethereum é uma plataforma de blockchain descentralizada que permite a criação de contratos inteligentes e aplicações descentralizadas.';
        baseDetails.market_data.current_price.usd = 3117.08 + (Math.random() * 200 - 100);
        baseDetails.market_data.current_price.brl = baseDetails.market_data.current_price.usd * 5;
        baseDetails.market_data.market_cap.usd = 374259723649;
        baseDetails.market_data.total_volume.usd = 15987654321;
    }

    return baseDetails;
}

/**
 * Gera preços aleatórios para gráficos de linha
 */
function generateRandomPrices(count, min, max) {
    const prices = [];
    for (let i = 0; i < count; i++) {
        prices.push(min + Math.random() * (max - min));
    }
    return prices;
}

// Exportar funções para uso em outros arquivos
window.loadCryptoMarketData = loadCryptoMarketData;
window.loadCryptoDetails = loadCryptoDetails;
