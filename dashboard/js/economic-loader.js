/**
 * Módulo para carregamento de dados econômicos
 * Utiliza a API FRED (Federal Reserve Economic Data) para obter indicadores econômicos
 */

/**
 * Obtém dados de séries econômicas do FRED
 * @param {string[]} seriesIds - IDs das séries (ex: ['GDP', 'UNRATE', 'CPIAUCSL'])
 * @returns {Promise<Object>} - Dados das séries econômicas
 */
async function loadEconomicData(seriesIds = ['GDP', 'UNRATE', 'CPIAUCSL', 'FEDFUNDS', 'DGS10']) {
    try {
        console.log(`Carregando dados econômicos para ${seriesIds.length} séries...`);
        
        // Verificar se há dados em cache
        const cacheKey = `economic_data_${seriesIds.join('_')}`;
        const cachedData = CacheManager.getFromCache(cacheKey);
        
        if (cachedData) {
            console.log('Usando dados econômicos do cache');
            return cachedData;
        }
        
        // Como não temos uma chave de API FRED real, vamos simular os dados
        // Em um ambiente real, faríamos chamadas à API para cada série
        const economicData = {};
        
        for (const seriesId of seriesIds) {
            economicData[seriesId] = await simulateEconomicSeries(seriesId);
        }
        
        // Salvar no cache
        CacheManager.saveToCache(cacheKey, economicData, CONFIG.cache.ttl.economic);
        
        return economicData;
    } catch (error) {
        console.error('Erro ao carregar dados econômicos:', error);
        
        // Em caso de erro, retornar dados simulados
        const economicData = {};
        for (const seriesId of seriesIds) {
            economicData[seriesId] = await simulateEconomicSeries(seriesId);
        }
        return economicData;
    }
}

/**
 * Simula dados para uma série econômica específica
 * @param {string} seriesId - ID da série econômica
 * @returns {Promise<Object>} - Dados simulados da série
 */
async function simulateEconomicSeries(seriesId) {
    console.warn(`Simulando dados econômicos para série ${seriesId}`);
    
    // Definir parâmetros de simulação com base na série
    let title, units, frequency, startValue, volatility, trend, seasonality;
    
    switch (seriesId) {
        case 'GDP': // Produto Interno Bruto
            title = 'Gross Domestic Product';
            units = 'Billions of Dollars';
            frequency = 'Quarterly';
            startValue = 22000; // Valor em bilhões de dólares
            volatility = 100;
            trend = 0.01; // Crescimento médio de 1% por trimestre
            seasonality = false;
            break;
            
        case 'UNRATE': // Taxa de Desemprego
            title = 'Unemployment Rate';
            units = 'Percent';
            frequency = 'Monthly';
            startValue = 3.5; // Percentual
            volatility = 0.2;
            trend = 0; // Sem tendência clara
            seasonality = true;
            break;
            
        case 'CPIAUCSL': // Índice de Preços ao Consumidor
            title = 'Consumer Price Index for All Urban Consumers';
            units = 'Index 1982-1984=100';
            frequency = 'Monthly';
            startValue = 300; // Valor do índice
            volatility = 1;
            trend = 0.003; // Inflação média de 0.3% ao mês
            seasonality = true;
            break;
            
        case 'FEDFUNDS': // Taxa de Juros do Fed
            title = 'Federal Funds Effective Rate';
            units = 'Percent';
            frequency = 'Monthly';
            startValue = 5.25; // Percentual
            volatility = 0.1;
            trend = -0.001; // Leve tendência de queda
            seasonality = false;
            break;
            
        case 'DGS10': // Rendimento do Tesouro de 10 anos
            title = '10-Year Treasury Constant Maturity Rate';
            units = 'Percent';
            frequency = 'Daily';
            startValue = 4.0; // Percentual
            volatility = 0.05;
            trend = 0.0005; // Leve tendência de alta
            seasonality = false;
            break;
            
        default:
            title = `Economic Series ${seriesId}`;
            units = 'Value';
            frequency = 'Monthly';
            startValue = 100;
            volatility = 5;
            trend = 0.005;
            seasonality = false;
    }
    
    // Gerar dados históricos
    const dataPoints = frequency === 'Daily' ? 252 : // Dias úteis em um ano
                      frequency === 'Weekly' ? 52 : // Semanas em um ano
                      frequency === 'Monthly' ? 60 : // 5 anos de dados mensais
                      frequency === 'Quarterly' ? 20 : 10; // 5 anos de dados trimestrais ou anuais
    
    const observations = [];
    let currentValue = startValue;
    const now = new Date();
    
    for (let i = 0; i < dataPoints; i++) {
        // Calcular data com base na frequência
        let date;
        if (frequency === 'Daily') {
            date = new Date(now);
            date.setDate(date.getDate() - (dataPoints - i));
        } else if (frequency === 'Weekly') {
            date = new Date(now);
            date.setDate(date.getDate() - ((dataPoints - i) * 7));
        } else if (frequency === 'Monthly') {
            date = new Date(now);
            date.setMonth(date.getMonth() - (dataPoints - i));
        } else if (frequency === 'Quarterly') {
            date = new Date(now);
            date.setMonth(date.getMonth() - ((dataPoints - i) * 3));
        } else { // Anual
            date = new Date(now);
            date.setFullYear(date.getFullYear() - (dataPoints - i));
        }
        
        // Formatar data como YYYY-MM-DD
        const formattedDate = date.toISOString().split('T')[0];
        
        // Adicionar tendência
        currentValue *= (1 + trend);
        
        // Adicionar sazonalidade se aplicável
        if (seasonality) {
            // Simular efeito sazonal com função seno
            const seasonalEffect = Math.sin((i % 12) / 12 * 2 * Math.PI) * volatility * 0.5;
            currentValue += seasonalEffect;
        }
        
        // Adicionar componente aleatório
        currentValue += (Math.random() - 0.5) * volatility;
        
        // Garantir que valores como taxas de desemprego não fiquem negativos
        if (seriesId === 'UNRATE' || seriesId === 'FEDFUNDS' || seriesId === 'DGS10') {
            currentValue = Math.max(currentValue, 0);
        }
        
        // Arredondar valor com base na unidade
        const roundedValue = units.includes('Percent') ? 
                           Math.round(currentValue * 100) / 100 : // 2 casas decimais para percentuais
                           Math.round(currentValue * 10) / 10; // 1 casa decimal para outros valores
        
        observations.push({
            date: formattedDate,
            value: roundedValue
        });
    }
    
    return {
        id: seriesId,
        title: title,
        units: units,
        frequency: frequency,
        observations: observations,
        lastUpdated: new Date().toISOString()
    };
}

/**
 * Obtém dados de indicadores econômicos principais
 * @returns {Promise<Object>} - Dados dos principais indicadores econômicos
 */
async function loadKeyEconomicIndicators() {
    try {
        console.log('Carregando indicadores econômicos principais...');
        
        // Verificar se há dados em cache
        const cacheKey = 'key_economic_indicators';
        const cachedData = CacheManager.getFromCache(cacheKey);
        
        if (cachedData) {
            console.log('Usando indicadores econômicos do cache');
            return cachedData;
        }
        
        // Carregar séries econômicas principais
        const seriesData = await loadEconomicData(['GDP', 'UNRATE', 'CPIAUCSL', 'FEDFUNDS', 'DGS10']);
        
        // Processar dados para formato mais amigável
        const indicators = {
            gdp: {
                name: 'PIB (EUA)',
                value: seriesData.GDP.observations[seriesData.GDP.observations.length - 1].value,
                previousValue: seriesData.GDP.observations[seriesData.GDP.observations.length - 2].value,
                change: calculateChange(
                    seriesData.GDP.observations[seriesData.GDP.observations.length - 1].value,
                    seriesData.GDP.observations[seriesData.GDP.observations.length - 2].value
                ),
                unit: 'Trilhões USD',
                trend: calculateTrend(seriesData.GDP.observations.slice(-4).map(obs => obs.value)),
                lastUpdated: seriesData.GDP.lastUpdated
            },
            unemployment: {
                name: 'Desemprego (EUA)',
                value: seriesData.UNRATE.observations[seriesData.UNRATE.observations.length - 1].value,
                previousValue: seriesData.UNRATE.observations[seriesData.UNRATE.observations.length - 2].value,
                change: calculateChange(
                    seriesData.UNRATE.observations[seriesData.UNRATE.observations.length - 1].value,
                    seriesData.UNRATE.observations[seriesData.UNRATE.observations.length - 2].value
                ),
                unit: '%',
                trend: calculateTrend(seriesData.UNRATE.observations.slice(-6).map(obs => obs.value)),
                lastUpdated: seriesData.UNRATE.lastUpdated
            },
            inflation: {
                name: 'Inflação (EUA)',
                value: calculateInflationRate(
                    seriesData.CPIAUCSL.observations[seriesData.CPIAUCSL.observations.length - 1].value,
                    seriesData.CPIAUCSL.observations[seriesData.CPIAUCSL.observations.length - 13].value
                ),
                previousValue: calculateInflationRate(
                    seriesData.CPIAUCSL.observations[seriesData.CPIAUCSL.observations.length - 2].value,
                    seriesData.CPIAUCSL.observations[seriesData.CPIAUCSL.observations.length - 14].value
                ),
                change: calculateChange(
                    calculateInflationRate(
                        seriesData.CPIAUCSL.observations[seriesData.CPIAUCSL.observations.length - 1].value,
                        seriesData.CPIAUCSL.observations[seriesData.CPIAUCSL.observations.length - 13].value
                    ),
                    calculateInflationRate(
                        seriesData.CPIAUCSL.observations[seriesData.CPIAUCSL.observations.length - 2].value,
                        seriesData.CPIAUCSL.observations[seriesData.CPIAUCSL.observations.length - 14].value
                    )
                ),
                unit: '%',
                trend: calculateTrend(seriesData.CPIAUCSL.observations.slice(-6).map((obs, i, arr) => {
                    if (i < 12) return 0;
                    return calculateInflationRate(obs.value, arr[i - 12].value);
                })),
                lastUpdated: seriesData.CPIAUCSL.lastUpdated
            },
            interestRate: {
                name: 'Taxa de Juros (Fed)',
                value: seriesData.FEDFUNDS.observations[seriesData.FEDFUNDS.observations.length - 1].value,
                previousValue: seriesData.FEDFUNDS.observations[seriesData.FEDFUNDS.observations.length - 2].value,
                change: calculateChange(
                    seriesData.FEDFUNDS.observations[seriesData.FEDFUNDS.observations.length - 1].value,
                    seriesData.FEDFUNDS.observations[seriesData.FEDFUNDS.observations.length - 2].value
                ),
                unit: '%',
                trend: calculateTrend(seriesData.FEDFUNDS.observations.slice(-6).map(obs => obs.value)),
                lastUpdated: seriesData.FEDFUNDS.lastUpdated
            },
            treasuryYield: {
                name: 'Rendimento do Tesouro (10 anos)',
                value: seriesData.DGS10.observations[seriesData.DGS10.observations.length - 1].value,
                previousValue: seriesData.DGS10.observations[seriesData.DGS10.observations.length - 2].value,
                change: calculateChange(
                    seriesData.DGS10.observations[seriesData.DGS10.observations.length - 1].value,
                    seriesData.DGS10.observations[seriesData.DGS10.observations.length - 2].value
                ),
                unit: '%',
                trend: calculateTrend(seriesData.DGS10.observations.slice(-30).map(obs => obs.value)),
                lastUpdated: seriesData.DGS10.lastUpdated
            }
        };
        
        // Salvar no cache
        CacheManager.saveToCache(cacheKey, indicators, CONFIG.cache.ttl.economic);
        
        return indicators;
    } catch (error) {
        console.error('Erro ao carregar indicadores econômicos principais:', error);
        return simulateKeyEconomicIndicators();
    }
}

/**
 * Calcula a variação percentual entre dois valores
 * @param {number} current - Valor atual
 * @param {number} previous - Valor anterior
 * @returns {number} - Variação percentual
 */
function calculateChange(current, previous) {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
}

/**
 * Calcula a tendência com base em uma série de valores
 * @param {number[]} values - Série de valores
 * @returns {string} - Tendência (up, down, stable)
 */
function calculateTrend(values) {
    if (values.length < 2) return 'stable';
    
    // Calcular média das variações
    let totalChange = 0;
    for (let i = 1; i < values.length; i++) {
        totalChange += (values[i] - values[i-1]);
    }
    
    const avgChange = totalChange / (values.length - 1);
    
    // Determinar tendência com base na média das variações
    if (avgChange > 0.01) return 'up';
    if (avgChange < -0.01) return 'down';
    return 'stable';
}

/**
 * Calcula a taxa de inflação anual com base em dois valores do CPI
 * @param {number} current - Valor atual do CPI
 * @param {number} yearAgo - Valor do CPI há um ano
 * @returns {number} - Taxa de inflação anual em percentual
 */
function calculateInflationRate(current, yearAgo) {
    return ((current - yearAgo) / yearAgo) * 100;
}

/**
 * Simula dados para indicadores econômicos principais quando a API falha
 * @returns {Object} - Dados simulados dos principais indicadores econômicos
 */
function simulateKeyEconomicIndicators() {
    console.warn('Usando dados simulados para indicadores econômicos principais');
    
    return {
        gdp: {
            name: 'PIB (EUA)',
            value: 23.32,
            previousValue: 23.15,
            change: 0.73,
            unit: 'Trilhões USD',
            trend: 'up',
            lastUpdated: new Date().toISOString()
        },
        unemployment: {
            name: 'Desemprego (EUA)',
            value: 3.8,
            previousValue: 3.7,
            change: 2.7,
            unit: '%',
            trend: 'up',
            lastUpdated: new Date().toISOString()
        },
        inflation: {
            name: 'Inflação (EUA)',
            value: 3.2,
            previousValue: 3.4,
            change: -5.88,
            unit: '%',
            trend: 'down',
            lastUpdated: new Date().toISOString()
        },
        interestRate: {
            name: 'Taxa de Juros (Fed)',
            value: 5.25,
            previousValue: 5.25,
            change: 0,
            unit: '%',
            trend: 'stable',
            lastUpdated: new Date().toISOString()
        },
        treasuryYield: {
            name: 'Rendimento do Tesouro (10 anos)',
            value: 4.05,
            previousValue: 3.95,
            change: 2.53,
            unit: '%',
            trend: 'up',
            lastUpdated: new Date().toISOString()
        }
    };
}

// Exportar funções para uso em outros arquivos
window.loadEconomicData = loadEconomicData;
window.loadKeyEconomicIndicators = loadKeyEconomicIndicators;
