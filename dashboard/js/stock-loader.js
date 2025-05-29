/**
 * Módulo para carregamento de dados de ações
 * Utiliza a API Financial Modeling Prep para obter dados de ações
 */

/**
 * Obtém dados de perfil de empresas
 * @param {string[]} symbols - Símbolos das ações (ex: ['AAPL', 'MSFT'])
 * @returns {Promise<Array>} - Dados de perfil das empresas
 */
async function loadCompanyProfiles(symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META']) {
    try {
        console.log(`Carregando perfis de empresas para ${symbols.length} símbolos...`);

        // Verificar se há dados em cache
        const cacheKey = `company_profiles_${symbols.join('_')}`;
        const cachedData = CacheManager.getFromCache(cacheKey);

        if (cachedData) {
            console.log('Usando perfis de empresas do cache');
            return cachedData;
        }

        // Construir URL da API
        const baseUrl = CONFIG.apiEndpoints.useProxy ?
            CONFIG.apiEndpoints.proxyFinancialModelingPrep :
            CONFIG.apiEndpoints.financialModelingPrep;

        const url = `${baseUrl}/profile/${symbols.join(',')}?apikey=${CONFIG.apiKeys.financialModelingPrep}`;

        console.log('Chamando Financial Modeling Prep API:', url);
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Erro na API Financial Modeling Prep: ${response.status}`);
        }

        const data = await response.json();
        console.log('Dados de perfil recebidos:', data.length, 'empresas');

        // Processar dados
        const processedData = data.map(company => ({
            symbol: company.symbol,
            name: company.companyName,
            price: company.price,
            changes: company.changes,
            changesPercentage: company.changesPercentage,
            currency: company.currency,
            exchange: company.exchange,
            industry: company.industry,
            sector: company.sector,
            marketCap: company.mktCap,
            website: company.website,
            description: company.description,
            ceo: company.ceo,
            image: company.image,
            ipoDate: company.ipoDate,
            country: company.country,
            employees: company.fullTimeEmployees
        }));

        // Salvar no cache
        CacheManager.saveToCache(cacheKey, processedData, CONFIG.cache.ttl.stocks);

        return processedData;
    } catch (error) {
        console.error('Erro ao carregar perfis de empresas:', error);
        // Propagar erro em vez de usar dados simulados
        throw error;
    }
}

/**
 * Obtém dados financeiros de empresas
 * @param {string[]} symbols - Símbolos das ações (ex: ['AAPL', 'MSFT'])
 * @returns {Promise<Object>} - Dados financeiros das empresas
 */
async function loadFinancialData(symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META']) {
    try {
        console.log(`Carregando dados financeiros para ${symbols.length} símbolos...`);

        // Verificar se há dados em cache
        const cacheKey = `financial_data_${symbols.join('_')}`;
        const cachedData = CacheManager.getFromCache(cacheKey);

        if (cachedData) {
            console.log('Usando dados financeiros do cache');
            return cachedData;
        }

        // Construir URL da API
        const baseUrl = CONFIG.apiEndpoints.useProxy ?
            CONFIG.apiEndpoints.proxyFinancialModelingPrep :
            CONFIG.apiEndpoints.financialModelingPrep;

        // Em um ambiente real, faríamos múltiplas chamadas para obter diferentes tipos de dados financeiros
        // Para simplificar, vamos simular os dados financeiros
        const financialData = {};

        // Não há dados financeiros reais disponíveis - retornar erro
        throw new Error('Dados financeiros reais não disponíveis');

        // Salvar no cache
        CacheManager.saveToCache(cacheKey, financialData, CONFIG.cache.ttl.stocks);

        return financialData;
    } catch (error) {
        console.error('Erro ao carregar dados financeiros:', error);

        // Propagar erro em vez de usar dados simulados
        throw error;
    }
}

/**
 * Obtém dados históricos de preços para uma ação
 * @param {string} symbol - Símbolo da ação (ex: 'AAPL')
 * @param {string} timeframe - Período de tempo (1d, 5d, 1mo, 3mo, 6mo, 1y, 5y, max)
 * @returns {Promise<Object>} - Dados históricos de preços
 */
async function loadStockHistoricalData(symbol = 'AAPL', timeframe = '1y') {
    try {
        console.log(`Carregando dados históricos para ${symbol} (${timeframe})...`);

        // Verificar se há dados em cache
        const cacheKey = `stock_historical_${symbol}_${timeframe}`;
        const cachedData = CacheManager.getFromCache(cacheKey);

        if (cachedData) {
            console.log('Usando dados históricos do cache');
            return cachedData;
        }

        // Construir URL da API
        const baseUrl = CONFIG.apiEndpoints.useProxy ?
            CONFIG.apiEndpoints.proxyFinancialModelingPrep :
            CONFIG.apiEndpoints.financialModelingPrep;

        // Mapear timeframe para o formato da API
        let apiTimeframe;
        switch (timeframe) {
            case '1d': apiTimeframe = '1min'; break;
            case '5d': apiTimeframe = '5min'; break;
            case '1mo': apiTimeframe = '1hour'; break;
            case '3mo': case '6mo': apiTimeframe = '4hour'; break;
            case '1y': apiTimeframe = '1day'; break;
            case '5y': case 'max': apiTimeframe = 'week'; break;
            default: apiTimeframe = '1day';
        }

        const url = `${baseUrl}/historical-price-full/${symbol}?apikey=${CONFIG.apiKeys.financialModelingPrep}`;

        console.log('Chamando Financial Modeling Prep API para dados históricos:', url);
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Erro na API Financial Modeling Prep: ${response.status}`);
        }

        const data = await response.json();
        console.log('Dados históricos recebidos para', symbol);

        // Processar dados
        const historicalData = {
            symbol: data.symbol,
            timeframe: timeframe,
            prices: data.historical.map(item => ({
                date: item.date,
                open: item.open,
                high: item.high,
                low: item.low,
                close: item.close,
                volume: item.volume,
                change: item.change,
                changePercent: item.changePercent
            }))
        };

        // Salvar no cache
        CacheManager.saveToCache(cacheKey, historicalData, CONFIG.cache.ttl.stocks);

        return historicalData;
    } catch (error) {
        console.error('Erro ao carregar dados históricos de ações:', error);
        // Propagar erro em vez de usar dados simulados
        throw error;
    }
}

// Função de simulação de perfis de empresas removida - usando apenas dados reais das APIs

// Função de simulação de dados financeiros removida - usando apenas dados reais das APIs

// Função de simulação de dados históricos removida - usando apenas dados reais das APIs

// Exportar funções para uso em outros arquivos
window.loadCompanyProfiles = loadCompanyProfiles;
window.loadFinancialData = loadFinancialData;
window.loadStockHistoricalData = loadStockHistoricalData;
