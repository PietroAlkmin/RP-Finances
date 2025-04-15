/**
 * Configurações globais para o dashboard financeiro
 * Contém chaves de API, intervalos de atualização e outras configurações
 */

const CONFIG = {
    // Sistema de rotação de APIs
    apiRotation: {
        // Configuração para rotação de APIs
        enabled: true,  // Ativar/desativar rotação

        // Grupos de APIs por tipo de dados
        stockMarketApis: ['alphaVantage', 'yahooFinance', 'financialModelingPrep', 'polygon', 'finnhub', 'brapi'],
        newsApis: ['gnews'],
        cryptoApis: ['coinGecko', 'alphaVantage', 'brapi'],
        economicApis: ['fred', 'alphaVantage', 'finnhub'],
        brazilianStockApis: ['brapi', 'yahooFinance'],

        // Índice atual para cada tipo de API (será incrementado automaticamente)
        currentIndex: {
            stockMarket: 0,
            news: 0,
            crypto: 0,
            economic: 0
        },

        // Contador de chamadas para cada API
        callCount: {},

        // Limites diários para cada API
        dailyLimits: {
            alphaVantage: 25,
            newsApi: 100,
            yahooFinance: 500,
            financialModelingPrep: 250,
            polygon: 5,
            coinGecko: 50,
            fred: 100,
            finnhub: 60,  // 60 chamadas por minuto no plano gratuito
            brapi: 200,   // Limite estimado para o plano PRO
            gnews: 100    // Limite estimado para o plano gratuito
        },

        // Última data de reset dos contadores
        lastResetDate: new Date().toDateString()
    },

    // Chaves de API (em produção, estas chaves devem ser armazenadas de forma segura no servidor)
    apiKeys: {
        // APIs existentes
        alphaVantage: 'PQNAG49IHI7ID3Y6', // Sua chave da Alpha Vantage

        // Novas APIs com chaves atualizadas
        finnhub: 'cvu3b51r01qjg1379ukgcvu3b51r01qjg1379ul0', // Chave premium do Finnhub
        coinGecko: '', // CoinGecko não requer chave para endpoints básicos
        financialModelingPrep: 'demo', // Chave demo para Financial Modeling Prep
        polygon: 'DEMO_KEY', // Chave demo para Polygon.io
        brapi: '5gqN7YFNFzWD28VXADXHNV', // Chave PRO para brapi.dev (ações brasileiras)
        fred: '79d701bccfad503602710ec931fc09b9', // Chave para FRED API
        gnews: '4e4869808f12183074b165f43ef3de7f', // Chave para GNews API
    },

    // Endpoints de API
    apiEndpoints: {
        // Endpoints diretos (podem ter problemas de CORS)
        alphaVantage: 'https://www.alphavantage.co/query',
        newsApi: 'https://newsapi.org/v2',
        yahooFinance: 'https://query1.finance.yahoo.com/v8/finance',
        finnhub: 'https://finnhub.io/api/v1',
        coinGecko: 'https://api.coingecko.com/api/v3',
        financialModelingPrep: 'https://financialmodelingprep.com/api/v3',
        polygon: 'https://api.polygon.io/v2',
        fred: 'https://api.stlouisfed.org/fred/series',
        brapi: 'https://brapi.dev/api',
        gnews: 'https://gnews.io/api/v4',

        // Endpoints via proxy (recomendado para desenvolvimento)
        proxyAlphaVantage: 'http://localhost:3000/api/alpha-vantage',
        proxyNewsApi: 'http://localhost:3000/api/news',
        proxyYahooFinance: 'http://localhost:3000/api/yahoo-finance',
        proxyFinnhub: 'http://localhost:3000/api/finnhub',
        proxyCoinGecko: 'http://localhost:3000/api/coingecko',
        proxyFinancialModelingPrep: 'http://localhost:3000/api/fmp',
        proxyPolygon: 'http://localhost:3000/api/polygon',
        proxyFred: 'http://localhost:3000/api/fred',
        proxyBrapi: 'http://localhost:3000/api/brapi',
        proxyGnews: 'http://localhost:3000/api/gnews',

        // Configuração para usar proxy ou não
        useProxy: true
    },

    // Configuração de cache
    cache: {
        // Tempo de vida do cache em milissegundos
        ttl: {
            indices: 15 * 60 * 1000,     // 15 minutos para índices
            stocks: 15 * 60 * 1000,      // 15 minutos para ações
            news: 30 * 60 * 1000,        // 30 minutos para notícias
            crypto: 5 * 60 * 1000,       // 5 minutos para criptomoedas
            commodities: 30 * 60 * 1000,  // 30 minutos para commodities
            bestAssets: 15 * 60 * 1000,   // 15 minutos para melhores ativos
            economic: 60 * 60 * 1000,     // 60 minutos para dados econômicos
            financials: 24 * 60 * 60 * 1000  // 24 horas para dados financeiros
        },
        // Habilitar cache
        enabled: true
    },

    // Configurações de atualização em tempo real
    realtime: {
        enabled: true,                // Habilitar/desabilitar atualização em tempo real
        marketDataInterval: 60000,    // Intervalo de atualização para dados de mercado (em ms) - 1 minuto
        newsInterval: 300000,         // Intervalo de atualização para notícias (em ms) - 5 minutos
        retryInterval: 10000,         // Intervalo para tentar novamente em caso de falha (em ms) - 10 segundos
        maxRetries: 3                 // Número máximo de tentativas em caso de falha
    },

    // Configurações de exibição
    display: {
        defaultPeriod: 'week',        // Período padrão para análise de ativos (week, month, year)
        defaultAssetType: 'all',      // Tipo de ativo padrão para filtros
        defaultLanguage: 'all',       // Idioma padrão para notícias
        maxNewsItems: 10,             // Número máximo de notícias a exibir por fonte
        maxFeaturedNews: 5,           // Número máximo de notícias em destaque
        chartColors: [
            'rgba(37, 99, 235, 0.8)',   // Azul primário
            'rgba(79, 70, 229, 0.8)',   // Azul secundário
            'rgba(139, 92, 246, 0.8)',  // Roxo
            'rgba(16, 185, 129, 0.8)',  // Verde
            'rgba(239, 68, 68, 0.8)',   // Vermelho
            'rgba(245, 158, 11, 0.8)',  // Laranja
            'rgba(14, 165, 233, 0.8)',  // Azul claro
            'rgba(168, 85, 247, 0.8)',  // Roxo claro
            'rgba(236, 72, 153, 0.8)',  // Rosa
            'rgba(34, 197, 94, 0.8)'    // Verde claro
        ]
    },

    // Configurações de fontes de notícias
    newsSources: {
        infomoney: {
            name: 'InfoMoney',
            url: 'https://www.infomoney.com.br',
            language: 'pt',
            country: 'br',
            category: 'business'
        },
        bbc: {
            name: 'BBC News',
            url: 'https://www.bbc.com/news/business',
            language: 'en',
            country: 'gb',
            category: 'business'
        },
        forbes: {
            name: 'Forbes',
            url: 'https://www.forbes.com',
            language: 'en',
            country: 'us',
            category: 'business'
        },
        g1: {
            name: 'G1 Economia',
            url: 'https://g1.globo.com/economia/',
            language: 'pt',
            country: 'br',
            category: 'business'
        },
        investing: {
            name: 'Investing.com',
            url: 'https://www.investing.com',
            language: 'en',
            country: 'us',
            category: 'business'
        }
    },

    // Configurações de tipos de ativos
    assetTypes: {
        stocks: {
            name: 'Ações',
            symbols: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NVDA', 'JPM', 'BABA', 'PETR4.SA', 'VALE3.SA', 'ITUB4.SA', 'BBDC4.SA', 'ABEV3.SA']
        },
        crypto: {
            name: 'Criptomoedas',
            symbols: ['BTC', 'ETH', 'BNB', 'XRP', 'ADA', 'SOL', 'DOT', 'DOGE', 'AVAX', 'MATIC']
        },
        reits: {
            name: 'Fundos Imobiliários',
            symbols: ['KNRI11.SA', 'HGLG11.SA', 'XPLG11.SA', 'VISC11.SA', 'HFOF11.SA', 'MXRF11.SA', 'BCFF11.SA', 'HSML11.SA']
        },
        'fixed-income': {
            name: 'Renda Fixa',
            symbols: ['IPCA+', 'CDI', 'SELIC', 'PREFIXADO', 'TESOURO DIRETO', 'CDB', 'LCI', 'LCA']
        },
        etfs: {
            name: 'ETFs',
            symbols: ['SPY', 'QQQ', 'IWM', 'VTI', 'BOVA11.SA', 'IVVB11.SA', 'SMAL11.SA', 'HASH11.SA']
        },
        gold: {
            name: 'Ouro e Derivados',
            symbols: ['GC=F', 'GOLD', 'GLD', 'IAU', 'OURO.SA']
        }
    }
};

// Exportar configurações para uso em outros arquivos
if (typeof module !== 'undefined') {
    module.exports = CONFIG;
}
