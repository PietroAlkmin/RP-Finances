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
        return simulateCompanyProfiles(symbols);
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
        
        for (const symbol of symbols) {
            financialData[symbol] = await simulateFinancialData(symbol);
        }
        
        // Salvar no cache
        CacheManager.saveToCache(cacheKey, financialData, CONFIG.cache.ttl.stocks);
        
        return financialData;
    } catch (error) {
        console.error('Erro ao carregar dados financeiros:', error);
        
        // Em caso de erro, retornar dados simulados
        const financialData = {};
        for (const symbol of symbols) {
            financialData[symbol] = await simulateFinancialData(symbol);
        }
        return financialData;
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
        return simulateStockHistoricalData(symbol, timeframe);
    }
}

/**
 * Simula dados de perfil de empresas quando a API falha
 * @param {string[]} symbols - Símbolos das ações
 * @returns {Array} - Dados simulados de perfil das empresas
 */
function simulateCompanyProfiles(symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META']) {
    console.warn('Usando dados simulados de perfil de empresas');
    
    const companyData = {
        'AAPL': {
            symbol: 'AAPL',
            name: 'Apple Inc.',
            price: 175.50 + (Math.random() * 10 - 5),
            changes: 1.25 * (Math.random() > 0.5 ? 1 : -1),
            changesPercentage: 0.72 * (Math.random() > 0.5 ? 1 : -1),
            currency: 'USD',
            exchange: 'NASDAQ',
            industry: 'Consumer Electronics',
            sector: 'Technology',
            marketCap: 2800000000000,
            website: 'https://www.apple.com',
            description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.',
            ceo: 'Tim Cook',
            image: 'https://financialmodelingprep.com/image-stock/AAPL.png',
            ipoDate: '1980-12-12',
            country: 'US',
            employees: 164000
        },
        'MSFT': {
            symbol: 'MSFT',
            name: 'Microsoft Corporation',
            price: 380.20 + (Math.random() * 15 - 7.5),
            changes: 2.30 * (Math.random() > 0.5 ? 1 : -1),
            changesPercentage: 0.61 * (Math.random() > 0.5 ? 1 : -1),
            currency: 'USD',
            exchange: 'NASDAQ',
            industry: 'Software—Infrastructure',
            sector: 'Technology',
            marketCap: 2900000000000,
            website: 'https://www.microsoft.com',
            description: 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide.',
            ceo: 'Satya Nadella',
            image: 'https://financialmodelingprep.com/image-stock/MSFT.png',
            ipoDate: '1986-03-13',
            country: 'US',
            employees: 221000
        },
        'GOOGL': {
            symbol: 'GOOGL',
            name: 'Alphabet Inc.',
            price: 140.10 + (Math.random() * 8 - 4),
            changes: 0.85 * (Math.random() > 0.5 ? 1 : -1),
            changesPercentage: 0.61 * (Math.random() > 0.5 ? 1 : -1),
            currency: 'USD',
            exchange: 'NASDAQ',
            industry: 'Internet Content & Information',
            sector: 'Communication Services',
            marketCap: 1800000000000,
            website: 'https://www.abc.xyz',
            description: 'Alphabet Inc. offers various products and platforms in the United States, Europe, the Middle East, Africa, the Asia-Pacific, Canada, and Latin America.',
            ceo: 'Sundar Pichai',
            image: 'https://financialmodelingprep.com/image-stock/GOOGL.png',
            ipoDate: '2004-08-19',
            country: 'US',
            employees: 190234
        },
        'AMZN': {
            symbol: 'AMZN',
            name: 'Amazon.com, Inc.',
            price: 175.35 + (Math.random() * 10 - 5),
            changes: 1.15 * (Math.random() > 0.5 ? 1 : -1),
            changesPercentage: 0.66 * (Math.random() > 0.5 ? 1 : -1),
            currency: 'USD',
            exchange: 'NASDAQ',
            industry: 'Internet Retail',
            sector: 'Consumer Cyclical',
            marketCap: 1850000000000,
            website: 'https://www.amazon.com',
            description: 'Amazon.com, Inc. engages in the retail sale of consumer products and subscriptions in North America and internationally.',
            ceo: 'Andy Jassy',
            image: 'https://financialmodelingprep.com/image-stock/AMZN.png',
            ipoDate: '1997-05-15',
            country: 'US',
            employees: 1540000
        },
        'META': {
            symbol: 'META',
            name: 'Meta Platforms, Inc.',
            price: 485.20 + (Math.random() * 20 - 10),
            changes: 3.45 * (Math.random() > 0.5 ? 1 : -1),
            changesPercentage: 0.72 * (Math.random() > 0.5 ? 1 : -1),
            currency: 'USD',
            exchange: 'NASDAQ',
            industry: 'Internet Content & Information',
            sector: 'Communication Services',
            marketCap: 1250000000000,
            website: 'https://about.meta.com',
            description: 'Meta Platforms, Inc. develops products that enable people to connect and share with friends and family through mobile devices, personal computers, virtual reality headsets, and wearables worldwide.',
            ceo: 'Mark Zuckerberg',
            image: 'https://financialmodelingprep.com/image-stock/META.png',
            ipoDate: '2012-05-18',
            country: 'US',
            employees: 86482
        },
        'TSLA': {
            symbol: 'TSLA',
            name: 'Tesla, Inc.',
            price: 215.75 + (Math.random() * 15 - 7.5),
            changes: 2.35 * (Math.random() > 0.5 ? 1 : -1),
            changesPercentage: 1.10 * (Math.random() > 0.5 ? 1 : -1),
            currency: 'USD',
            exchange: 'NASDAQ',
            industry: 'Auto Manufacturers',
            sector: 'Consumer Cyclical',
            marketCap: 680000000000,
            website: 'https://www.tesla.com',
            description: 'Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems.',
            ceo: 'Elon Musk',
            image: 'https://financialmodelingprep.com/image-stock/TSLA.png',
            ipoDate: '2010-06-29',
            country: 'US',
            employees: 127855
        },
        'NVDA': {
            symbol: 'NVDA',
            name: 'NVIDIA Corporation',
            price: 950.20 + (Math.random() * 40 - 20),
            changes: 15.35 * (Math.random() > 0.5 ? 1 : -1),
            changesPercentage: 1.65 * (Math.random() > 0.5 ? 1 : -1),
            currency: 'USD',
            exchange: 'NASDAQ',
            industry: 'Semiconductors',
            sector: 'Technology',
            marketCap: 2350000000000,
            website: 'https://www.nvidia.com',
            description: 'NVIDIA Corporation provides graphics, and compute and networking solutions in the United States, Taiwan, China, and internationally.',
            ceo: 'Jensen Huang',
            image: 'https://financialmodelingprep.com/image-stock/NVDA.png',
            ipoDate: '1999-01-22',
            country: 'US',
            employees: 26196
        }
    };
    
    // Retornar apenas os símbolos solicitados
    return symbols.map(symbol => companyData[symbol] || {
        symbol: symbol,
        name: `${symbol} Inc.`,
        price: 100 + (Math.random() * 50),
        changes: 1.5 * (Math.random() > 0.5 ? 1 : -1),
        changesPercentage: 1.5 * (Math.random() > 0.5 ? 1 : -1),
        currency: 'USD',
        exchange: 'NASDAQ',
        industry: 'Technology',
        sector: 'Technology',
        marketCap: 50000000000 + (Math.random() * 50000000000),
        website: `https://www.${symbol.toLowerCase()}.com`,
        description: `${symbol} Inc. is a technology company.`,
        ceo: 'John Doe',
        image: `https://financialmodelingprep.com/image-stock/${symbol}.png`,
        ipoDate: '2000-01-01',
        country: 'US',
        employees: 10000 + Math.floor(Math.random() * 90000)
    });
}

/**
 * Simula dados financeiros de empresas quando a API falha
 * @param {string} symbol - Símbolo da ação
 * @returns {Promise<Object>} - Dados financeiros simulados
 */
async function simulateFinancialData(symbol) {
    console.warn(`Simulando dados financeiros para ${symbol}`);
    
    // Obter perfil da empresa para usar alguns dados como base
    const profiles = await loadCompanyProfiles([symbol]);
    const profile = profiles[0] || {
        marketCap: 100000000000,
        price: 100
    };
    
    // Calcular métricas financeiras com base no market cap e preço
    const marketCap = profile.marketCap || 100000000000;
    const price = profile.price || 100;
    
    // Calcular receita anual (aproximadamente 20-40% do market cap)
    const revenuePercentage = 0.2 + (Math.random() * 0.2);
    const annualRevenue = marketCap * revenuePercentage;
    
    // Calcular lucro líquido (aproximadamente 10-30% da receita)
    const profitMargin = 0.1 + (Math.random() * 0.2);
    const netIncome = annualRevenue * profitMargin;
    
    // Calcular EPS com base no lucro e número estimado de ações
    const estimatedShares = marketCap / price;
    const eps = netIncome / estimatedShares;
    
    // Calcular P/E
    const pe = price / eps;
    
    // Calcular dividendo (0-3% do preço)
    const dividendYield = Math.random() * 0.03;
    const dividend = price * dividendYield;
    
    // Gerar dados dos últimos 4 trimestres
    const quarters = [];
    let quarterlyRevenue = annualRevenue / 4;
    
    for (let i = 0; i < 4; i++) {
        // Adicionar variação sazonal
        const seasonalFactor = 1 + (Math.sin(i * Math.PI / 2) * 0.1);
        const quarterRev = quarterlyRevenue * seasonalFactor;
        
        // Variação aleatória no lucro
        const quarterProfitMargin = profitMargin * (0.9 + (Math.random() * 0.2));
        const quarterProfit = quarterRev * quarterProfitMargin;
        
        quarters.push({
            period: `Q${4-i} ${new Date().getFullYear() - (i > 0 ? 1 : 0)}`,
            revenue: quarterRev,
            netIncome: quarterProfit,
            eps: quarterProfit / estimatedShares
        });
    }
    
    // Inverter para ordem cronológica
    quarters.reverse();
    
    return {
        symbol: symbol,
        metrics: {
            marketCap: marketCap,
            pe: pe,
            eps: eps,
            beta: 0.8 + (Math.random() * 0.8),
            dividend: dividend,
            dividendYield: dividendYield,
            profitMargin: profitMargin,
            roe: 0.1 + (Math.random() * 0.3),
            debtToEquity: 0.2 + (Math.random() * 0.8),
            currentRatio: 1.2 + (Math.random() * 1.5),
            priceToBook: 2 + (Math.random() * 8),
            priceToSales: price / (annualRevenue / estimatedShares)
        },
        financials: {
            annual: {
                revenue: annualRevenue,
                netIncome: netIncome,
                eps: eps,
                freeCashFlow: netIncome * (0.8 + (Math.random() * 0.4)),
                grossMargin: 0.3 + (Math.random() * 0.4),
                operatingMargin: 0.15 + (Math.random() * 0.25),
                netMargin: profitMargin
            },
            quarterly: quarters
        },
        growth: {
            revenueGrowth: 0.05 + (Math.random() * 0.3),
            epsGrowth: 0.05 + (Math.random() * 0.35),
            dividendGrowth: Math.random() * 0.1
        },
        lastUpdated: new Date().toISOString()
    };
}

/**
 * Simula dados históricos de preços para uma ação quando a API falha
 * @param {string} symbol - Símbolo da ação
 * @param {string} timeframe - Período de tempo
 * @returns {Object} - Dados históricos simulados
 */
function simulateStockHistoricalData(symbol, timeframe = '1y') {
    console.warn(`Simulando dados históricos para ${symbol} (${timeframe})`);
    
    // Definir parâmetros de simulação
    let dataPoints, interval, volatility, trend;
    const now = new Date();
    
    switch (timeframe) {
        case '1d':
            dataPoints = 390; // 6.5 horas de mercado em minutos
            interval = 60 * 1000; // 1 minuto
            volatility = 0.001;
            trend = (Math.random() - 0.5) * 0.002;
            break;
        case '5d':
            dataPoints = 5 * 78; // 5 dias com pontos a cada 5 minutos
            interval = 5 * 60 * 1000; // 5 minutos
            volatility = 0.002;
            trend = (Math.random() - 0.5) * 0.003;
            break;
        case '1mo':
            dataPoints = 30; // 30 dias
            interval = 24 * 60 * 60 * 1000; // 1 dia
            volatility = 0.01;
            trend = (Math.random() - 0.5) * 0.005;
            break;
        case '3mo':
            dataPoints = 90; // 90 dias
            interval = 24 * 60 * 60 * 1000; // 1 dia
            volatility = 0.015;
            trend = (Math.random() - 0.5) * 0.01;
            break;
        case '6mo':
            dataPoints = 180; // 180 dias
            interval = 24 * 60 * 60 * 1000; // 1 dia
            volatility = 0.02;
            trend = (Math.random() - 0.5) * 0.015;
            break;
        case '1y':
            dataPoints = 252; // Dias úteis em um ano
            interval = 24 * 60 * 60 * 1000; // 1 dia
            volatility = 0.025;
            trend = (Math.random() - 0.5) * 0.02;
            break;
        case '5y':
            dataPoints = 60; // 60 meses
            interval = 30 * 24 * 60 * 60 * 1000; // 1 mês
            volatility = 0.04;
            trend = (Math.random() - 0.5) * 0.03;
            break;
        case 'max':
            dataPoints = 120; // 10 anos em meses
            interval = 30 * 24 * 60 * 60 * 1000; // 1 mês
            volatility = 0.05;
            trend = (Math.random() - 0.5) * 0.04;
            break;
        default:
            dataPoints = 252; // Padrão: 1 ano
            interval = 24 * 60 * 60 * 1000;
            volatility = 0.025;
            trend = (Math.random() - 0.5) * 0.02;
    }
    
    // Definir preço inicial com base no símbolo
    let basePrice;
    switch (symbol) {
        case 'AAPL': basePrice = 175; break;
        case 'MSFT': basePrice = 380; break;
        case 'GOOGL': basePrice = 140; break;
        case 'AMZN': basePrice = 175; break;
        case 'META': basePrice = 485; break;
        case 'TSLA': basePrice = 215; break;
        case 'NVDA': basePrice = 950; break;
        default: basePrice = 100;
    }
    
    // Gerar dados históricos
    const prices = [];
    let currentPrice = basePrice;
    let currentTrend = trend;
    
    for (let i = 0; i < dataPoints; i++) {
        const date = new Date(now.getTime() - ((dataPoints - i) * interval));
        
        // Ajustar tendência periodicamente
        if (i % 20 === 0) {
            currentTrend = trend + ((Math.random() - 0.5) * trend * 2);
        }
        
        // Calcular variação diária
        const dailyChange = currentPrice * (currentTrend + ((Math.random() - 0.5) * volatility * 2));
        
        // Calcular preços de abertura, máxima, mínima e fechamento
        const open = currentPrice;
        const close = currentPrice + dailyChange;
        const high = Math.max(open, close) + (Math.random() * Math.abs(dailyChange) * 0.5);
        const low = Math.min(open, close) - (Math.random() * Math.abs(dailyChange) * 0.5);
        
        // Calcular volume
        const baseVolume = symbol === 'AAPL' ? 80000000 :
                          symbol === 'MSFT' ? 30000000 :
                          symbol === 'GOOGL' ? 20000000 :
                          symbol === 'AMZN' ? 40000000 :
                          symbol === 'META' ? 25000000 :
                          symbol === 'TSLA' ? 120000000 :
                          symbol === 'NVDA' ? 50000000 : 10000000;
        
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
            volume: volume,
            change: parseFloat(dailyChange.toFixed(2)),
            changePercent: parseFloat(((dailyChange / currentPrice) * 100).toFixed(2))
        });
        
        // Atualizar preço atual para o próximo ponto
        currentPrice = close;
    }
    
    return {
        symbol: symbol,
        timeframe: timeframe,
        prices: prices
    };
}

// Exportar funções para uso em outros arquivos
window.loadCompanyProfiles = loadCompanyProfiles;
window.loadFinancialData = loadFinancialData;
window.loadStockHistoricalData = loadStockHistoricalData;
