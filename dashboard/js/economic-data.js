/**
 * Economic Data Module
 * Utiliza a API FRED para obter dados econômicos
 */

/**
 * Obtém dados de séries econômicas do FRED
 * @param {string[]} seriesIds - IDs das séries (ex: ['GDP', 'UNRATE'])
 * @returns {Promise<Array>} - Dados das séries econômicas
 */
async function loadEconomicData(seriesIds = ['GDP', 'UNRATE', 'CPIAUCSL', 'FEDFUNDS', 'INDPRO']) {
    try {
        console.log(`Carregando dados econômicos para ${seriesIds.length} séries...`);
        
        // Verificar se há dados em cache
        const cacheKey = `economic_data_${seriesIds.join('_')}`;
        const cachedData = CacheManager.getFromCache(cacheKey);
        
        if (cachedData) {
            console.log('Usando dados econômicos do cache');
            return cachedData;
        }
        
        // Resultados
        const results = [];
        
        // Obter dados para cada série
        for (const seriesId of seriesIds) {
            try {
                // Construir URL da API
                const baseUrl = CONFIG.apiEndpoints.useProxy ? 
                    CONFIG.apiEndpoints.proxyFred : 
                    CONFIG.apiEndpoints.fred;
                    
                const url = `${baseUrl}/observations?series_id=${seriesId}&api_key=${CONFIG.apiKeys.fred}&file_type=json&sort_order=desc&limit=1`;
                
                console.log('Chamando FRED API:', url);
                const response = await fetch(url);
                
                if (!response.ok) {
                    throw new Error(`Erro na API FRED: ${response.status}`);
                }
                
                const data = await response.json();
                console.log(`Dados recebidos para série ${seriesId}:`, data);
                
                // Obter informações da série
                const seriesInfoUrl = `${baseUrl}?series_id=${seriesId}&api_key=${CONFIG.apiKeys.fred}&file_type=json`;
                const seriesInfoResponse = await fetch(seriesInfoUrl);
                
                if (!seriesInfoResponse.ok) {
                    throw new Error(`Erro na API FRED ao obter informações da série: ${seriesInfoResponse.status}`);
                }
                
                const seriesInfo = await seriesInfoResponse.json();
                
                // Processar dados
                if (data.observations && data.observations.length > 0) {
                    const latestObservation = data.observations[0];
                    
                    results.push({
                        id: seriesId,
                        name: seriesInfo.seriess ? seriesInfo.seriess[0].title : getSeriesName(seriesId),
                        value: parseFloat(latestObservation.value),
                        date: latestObservation.date,
                        units: seriesInfo.seriess ? seriesInfo.seriess[0].units : '',
                        frequency: seriesInfo.seriess ? seriesInfo.seriess[0].frequency : '',
                        description: seriesInfo.seriess ? seriesInfo.seriess[0].notes : ''
                    });
                }
                
                // Aguardar um pouco para não sobrecarregar a API
                await new Promise(resolve => setTimeout(resolve, 500));
                
            } catch (error) {
                console.error(`Erro ao obter dados para série ${seriesId}:`, error);
                
                // Adicionar dados simulados para esta série
                results.push(simulateEconomicSeries(seriesId));
            }
        }
        
        // Salvar no cache
        CacheManager.saveToCache(cacheKey, results, CONFIG.cache.ttl.economic);
        
        return results;
    } catch (error) {
        console.error('Erro ao carregar dados econômicos:', error);
        return seriesIds.map(id => simulateEconomicSeries(id));
    }
}

/**
 * Obtém dados históricos de uma série econômica
 * @param {string} seriesId - ID da série (ex: 'GDP')
 * @param {number} limit - Número máximo de observações
 * @returns {Promise<Object>} - Dados históricos da série
 */
async function loadEconomicSeriesHistory(seriesId = 'GDP', limit = 100) {
    try {
        console.log(`Carregando histórico para série econômica ${seriesId}...`);
        
        // Verificar se há dados em cache
        const cacheKey = `economic_history_${seriesId}_${limit}`;
        const cachedData = CacheManager.getFromCache(cacheKey);
        
        if (cachedData) {
            console.log('Usando histórico econômico do cache');
            return cachedData;
        }
        
        // Construir URL da API
        const baseUrl = CONFIG.apiEndpoints.useProxy ? 
            CONFIG.apiEndpoints.proxyFred : 
            CONFIG.apiEndpoints.fred;
            
        const url = `${baseUrl}/observations?series_id=${seriesId}&api_key=${CONFIG.apiKeys.fred}&file_type=json&sort_order=desc&limit=${limit}`;
        
        console.log('Chamando FRED API para histórico:', url);
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Erro na API FRED: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`Dados históricos recebidos para série ${seriesId}`);
        
        // Obter informações da série
        const seriesInfoUrl = `${baseUrl}?series_id=${seriesId}&api_key=${CONFIG.apiKeys.fred}&file_type=json`;
        const seriesInfoResponse = await fetch(seriesInfoUrl);
        
        if (!seriesInfoResponse.ok) {
            throw new Error(`Erro na API FRED ao obter informações da série: ${seriesInfoResponse.status}`);
        }
        
        const seriesInfo = await seriesInfoResponse.json();
        
        // Processar dados
        const seriesData = {
            id: seriesId,
            name: seriesInfo.seriess ? seriesInfo.seriess[0].title : getSeriesName(seriesId),
            units: seriesInfo.seriess ? seriesInfo.seriess[0].units : '',
            frequency: seriesInfo.seriess ? seriesInfo.seriess[0].frequency : '',
            description: seriesInfo.seriess ? seriesInfo.seriess[0].notes : '',
            observations: data.observations.map(obs => ({
                date: obs.date,
                value: parseFloat(obs.value)
            }))
        };
        
        // Salvar no cache
        CacheManager.saveToCache(cacheKey, seriesData, CONFIG.cache.ttl.economic);
        
        return seriesData;
    } catch (error) {
        console.error('Erro ao carregar histórico econômico:', error);
        return simulateEconomicSeriesHistory(seriesId, limit);
    }
}

/**
 * Obtém dados de indicadores econômicos brasileiros
 * @returns {Promise<Array>} - Dados dos indicadores econômicos brasileiros
 */
async function loadBrazilianEconomicData() {
    try {
        console.log('Carregando dados econômicos brasileiros...');
        
        // Verificar se há dados em cache
        const cacheKey = 'brazilian_economic_data';
        const cachedData = CacheManager.getFromCache(cacheKey);
        
        if (cachedData) {
            console.log('Usando dados econômicos brasileiros do cache');
            return cachedData;
        }
        
        // Construir URL da API
        const baseUrl = CONFIG.apiEndpoints.useProxy ? 
            CONFIG.apiEndpoints.proxyBrapi : 
            CONFIG.apiEndpoints.brapi;
            
        const url = `${baseUrl}/v2/prime-rate?token=${CONFIG.apiKeys.brapi}`;
        
        console.log('Chamando brapi.dev API para dados econômicos brasileiros:', url);
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Erro na API brapi.dev: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Dados econômicos brasileiros recebidos:', data);
        
        // Processar dados
        const indicators = [];
        
        if (data.selic) {
            indicators.push({
                id: 'SELIC',
                name: 'Taxa SELIC',
                value: data.selic,
                date: new Date().toISOString().split('T')[0],
                units: 'Percent',
                frequency: 'Monthly',
                description: 'Taxa básica de juros da economia brasileira'
            });
        }
        
        if (data.cdi) {
            indicators.push({
                id: 'CDI',
                name: 'Taxa CDI',
                value: data.cdi,
                date: new Date().toISOString().split('T')[0],
                units: 'Percent',
                frequency: 'Daily',
                description: 'Certificado de Depósito Interbancário'
            });
        }
        
        if (data.ipca) {
            indicators.push({
                id: 'IPCA',
                name: 'IPCA (Inflação)',
                value: data.ipca,
                date: new Date().toISOString().split('T')[0],
                units: 'Percent',
                frequency: 'Monthly',
                description: 'Índice Nacional de Preços ao Consumidor Amplo'
            });
        }
        
        // Salvar no cache
        CacheManager.saveToCache(cacheKey, indicators, CONFIG.cache.ttl.economic);
        
        return indicators;
    } catch (error) {
        console.error('Erro ao carregar dados econômicos brasileiros:', error);
        return simulateBrazilianEconomicData();
    }
}

/**
 * Obtém o nome de uma série econômica com base no ID
 * @param {string} seriesId - ID da série
 * @returns {string} - Nome da série
 */
function getSeriesName(seriesId) {
    const seriesNames = {
        'GDP': 'Produto Interno Bruto (PIB)',
        'UNRATE': 'Taxa de Desemprego',
        'CPIAUCSL': 'Índice de Preços ao Consumidor',
        'FEDFUNDS': 'Taxa de Juros Federal',
        'INDPRO': 'Produção Industrial',
        'PCE': 'Gastos de Consumo Pessoal',
        'HOUST': 'Novas Construções Residenciais',
        'RSAFS': 'Vendas no Varejo',
        'PAYEMS': 'Folha de Pagamento Não-Agrícola',
        'GS10': 'Rendimento do Tesouro de 10 anos'
    };
    
    return seriesNames[seriesId] || `Série ${seriesId}`;
}

/**
 * Simula dados de uma série econômica quando a API falha
 * @param {string} seriesId - ID da série
 * @returns {Object} - Dados simulados da série
 */
function simulateEconomicSeries(seriesId) {
    console.warn(`Simulando dados para série econômica ${seriesId}`);
    
    // Valores simulados com base no ID da série
    let value, units, frequency;
    
    switch (seriesId) {
        case 'GDP':
            value = 25000 + (Math.random() * 1000 - 500);
            units = 'Billions of Dollars';
            frequency = 'Quarterly';
            break;
        case 'UNRATE':
            value = 3.5 + (Math.random() * 0.5 - 0.25);
            units = 'Percent';
            frequency = 'Monthly';
            break;
        case 'CPIAUCSL':
            value = 300 + (Math.random() * 10 - 5);
            units = 'Index 1982-1984=100';
            frequency = 'Monthly';
            break;
        case 'FEDFUNDS':
            value = 5.25 + (Math.random() * 0.25 - 0.125);
            units = 'Percent';
            frequency = 'Monthly';
            break;
        case 'INDPRO':
            value = 105 + (Math.random() * 2 - 1);
            units = 'Index 2017=100';
            frequency = 'Monthly';
            break;
        default:
            value = 100 + (Math.random() * 10 - 5);
            units = 'Index';
            frequency = 'Monthly';
    }
    
    return {
        id: seriesId,
        name: getSeriesName(seriesId),
        value: value,
        date: new Date().toISOString().split('T')[0],
        units: units,
        frequency: frequency,
        description: `Dados simulados para ${getSeriesName(seriesId)}`
    };
}

/**
 * Simula dados históricos de uma série econômica quando a API falha
 * @param {string} seriesId - ID da série
 * @param {number} limit - Número máximo de observações
 * @returns {Object} - Dados históricos simulados
 */
function simulateEconomicSeriesHistory(seriesId, limit = 100) {
    console.warn(`Simulando histórico para série econômica ${seriesId}`);
    
    // Valores iniciais com base no ID da série
    let baseValue, trend, volatility, units, frequency;
    
    switch (seriesId) {
        case 'GDP':
            baseValue = 20000;
            trend = 100;
            volatility = 50;
            units = 'Billions of Dollars';
            frequency = 'Quarterly';
            break;
        case 'UNRATE':
            baseValue = 5;
            trend = -0.02;
            volatility = 0.1;
            units = 'Percent';
            frequency = 'Monthly';
            break;
        case 'CPIAUCSL':
            baseValue = 250;
            trend = 0.5;
            volatility = 0.3;
            units = 'Index 1982-1984=100';
            frequency = 'Monthly';
            break;
        case 'FEDFUNDS':
            baseValue = 2;
            trend = 0.05;
            volatility = 0.1;
            units = 'Percent';
            frequency = 'Monthly';
            break;
        case 'INDPRO':
            baseValue = 95;
            trend = 0.2;
            volatility = 0.5;
            units = 'Index 2017=100';
            frequency = 'Monthly';
            break;
        default:
            baseValue = 100;
            trend = 0.1;
            volatility = 1;
            units = 'Index';
            frequency = 'Monthly';
    }
    
    // Gerar observações
    const observations = [];
    let currentValue = baseValue;
    const now = new Date();
    
    for (let i = 0; i < limit; i++) {
        // Calcular data
        const date = new Date(now);
        
        if (frequency === 'Monthly') {
            date.setMonth(date.getMonth() - i);
        } else if (frequency === 'Quarterly') {
            date.setMonth(date.getMonth() - (i * 3));
        } else {
            date.setDate(date.getDate() - i);
        }
        
        // Formatar data
        const formattedDate = date.toISOString().split('T')[0];
        
        // Adicionar observação
        observations.push({
            date: formattedDate,
            value: parseFloat(currentValue.toFixed(2))
        });
        
        // Atualizar valor para a próxima observação (mais antiga)
        currentValue = currentValue - trend + ((Math.random() - 0.5) * volatility * 2);
        
        // Garantir que valores como taxa de desemprego não fiquem negativos
        if ((seriesId === 'UNRATE' || seriesId === 'FEDFUNDS') && currentValue < 0) {
            currentValue = Math.abs(currentValue) * 0.5;
        }
    }
    
    return {
        id: seriesId,
        name: getSeriesName(seriesId),
        units: units,
        frequency: frequency,
        description: `Dados históricos simulados para ${getSeriesName(seriesId)}`,
        observations: observations
    };
}

/**
 * Simula dados de indicadores econômicos brasileiros quando a API falha
 * @returns {Array} - Dados simulados de indicadores econômicos brasileiros
 */
function simulateBrazilianEconomicData() {
    console.warn('Usando dados simulados de indicadores econômicos brasileiros');
    
    return [
        {
            id: 'SELIC',
            name: 'Taxa SELIC',
            value: 10.75 + (Math.random() * 0.5 - 0.25),
            date: new Date().toISOString().split('T')[0],
            units: 'Percent',
            frequency: 'Monthly',
            description: 'Taxa básica de juros da economia brasileira'
        },
        {
            id: 'CDI',
            name: 'Taxa CDI',
            value: 10.65 + (Math.random() * 0.5 - 0.25),
            date: new Date().toISOString().split('T')[0],
            units: 'Percent',
            frequency: 'Daily',
            description: 'Certificado de Depósito Interbancário'
        },
        {
            id: 'IPCA',
            name: 'IPCA (Inflação)',
            value: 4.5 + (Math.random() * 0.6 - 0.3),
            date: new Date().toISOString().split('T')[0],
            units: 'Percent',
            frequency: 'Monthly',
            description: 'Índice Nacional de Preços ao Consumidor Amplo'
        }
    ];
}

// Exportar funções para uso em outros arquivos
window.loadEconomicData = loadEconomicData;
window.loadEconomicSeriesHistory = loadEconomicSeriesHistory;
window.loadBrazilianEconomicData = loadBrazilianEconomicData;
