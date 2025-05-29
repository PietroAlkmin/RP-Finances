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

            // Usar apenas dados reais da API
            let result = [...data];

            // Salvar no cache
            CacheManager.saveToCache(cacheKey, result, CONFIG.cache.ttl.crypto);

            return result;
        } catch (apiError) {
            console.error('Erro na chamada à API CoinGecko:', apiError);
            throw apiError; // Propagar erro para ser tratado no catch externo
        }
    } catch (error) {
        console.error('Erro ao carregar dados de criptomoedas:', error);
        throw error; // Propagar erro em vez de usar dados simulados
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
        throw error; // Propagar erro em vez de usar dados simulados
    }
}

// Função de simulação de dados de criptomoedas removida - usando apenas dados reais das APIs

// Função de simulação de detalhes de criptomoedas removida - usando apenas dados reais das APIs

// Exportar funções para uso em outros arquivos
window.loadCryptoMarketData = loadCryptoMarketData;
window.loadCryptoDetails = loadCryptoDetails;
