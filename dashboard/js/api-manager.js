/**
 * API Manager
 * Gerencia a rotação de APIs e controla limites de chamadas
 */

const ApiManager = {
    /**
     * Inicializa o gerenciador de APIs
     */
    init: function() {
        console.log('Inicializando API Manager...');
        
        // Verificar se é um novo dia para resetar contadores
        const today = new Date().toDateString();
        if (CONFIG.apiRotation.lastResetDate !== today) {
            console.log('Novo dia detectado, resetando contadores de API...');
            CONFIG.apiRotation.callCount = {};
            CONFIG.apiRotation.lastResetDate = today;
        }
        
        // Inicializar contadores se não existirem
        if (!CONFIG.apiRotation.callCount) {
            CONFIG.apiRotation.callCount = {};
        }
        
        // Inicializar contadores para cada API
        for (const apiType in CONFIG.apiRotation.currentIndex) {
            const apis = this.getApisForType(apiType);
            apis.forEach(api => {
                if (!CONFIG.apiRotation.callCount[api]) {
                    CONFIG.apiRotation.callCount[api] = 0;
                }
            });
        }
    },
    
    /**
     * Obtém a próxima API disponível para um determinado tipo de dados
     * @param {string} type - Tipo de dados (stockMarket, news, crypto, economic)
     * @returns {string} - Nome da API a ser usada
     */
    getNextApi: function(type) {
        if (!CONFIG.apiRotation.enabled) {
            // Se a rotação estiver desativada, usar a primeira API do tipo
            return this.getApisForType(type)[0];
        }
        
        const apis = this.getApisForType(type);
        let currentIndex = CONFIG.apiRotation.currentIndex[type] || 0;
        let apiCount = apis.length;
        let attempts = 0;
        
        // Tentar encontrar uma API que não tenha atingido o limite
        while (attempts < apiCount) {
            const apiName = apis[currentIndex];
            
            // Verificar se a API atingiu o limite diário
            const callCount = CONFIG.apiRotation.callCount[apiName] || 0;
            const dailyLimit = CONFIG.apiRotation.dailyLimits[apiName] || Infinity;
            
            if (callCount < dailyLimit) {
                // Atualizar índice para a próxima chamada
                CONFIG.apiRotation.currentIndex[type] = (currentIndex + 1) % apiCount;
                return apiName;
            }
            
            // Tentar a próxima API
            currentIndex = (currentIndex + 1) % apiCount;
            attempts++;
        }
        
        // Se todas as APIs atingiram o limite, usar a primeira e avisar
        console.warn(`Todas as APIs do tipo ${type} atingiram o limite diário. Usando a primeira API.`);
        return apis[0];
    },
    
    /**
     * Registra uma chamada para uma API específica
     * @param {string} apiName - Nome da API
     */
    registerApiCall: function(apiName) {
        if (!CONFIG.apiRotation.callCount[apiName]) {
            CONFIG.apiRotation.callCount[apiName] = 0;
        }
        
        CONFIG.apiRotation.callCount[apiName]++;
        console.log(`API ${apiName}: ${CONFIG.apiRotation.callCount[apiName]} chamadas hoje (limite: ${CONFIG.apiRotation.dailyLimits[apiName] || 'ilimitado'})`);
    },
    
    /**
     * Verifica se uma API atingiu seu limite diário
     * @param {string} apiName - Nome da API
     * @returns {boolean} - true se atingiu o limite, false caso contrário
     */
    hasReachedLimit: function(apiName) {
        const callCount = CONFIG.apiRotation.callCount[apiName] || 0;
        const dailyLimit = CONFIG.apiRotation.dailyLimits[apiName] || Infinity;
        
        return callCount >= dailyLimit;
    },
    
    /**
     * Obtém a lista de APIs para um determinado tipo de dados
     * @param {string} type - Tipo de dados
     * @returns {string[]} - Lista de APIs
     */
    getApisForType: function(type) {
        switch (type) {
            case 'stockMarket':
                return CONFIG.apiRotation.stockMarketApis;
            case 'news':
                return CONFIG.apiRotation.newsApis;
            case 'crypto':
                return CONFIG.apiRotation.cryptoApis;
            case 'economic':
                return CONFIG.apiRotation.economicApis;
            default:
                console.warn(`Tipo de API desconhecido: ${type}. Usando APIs de mercado de ações.`);
                return CONFIG.apiRotation.stockMarketApis;
        }
    },
    
    /**
     * Obtém estatísticas de uso das APIs
     * @returns {Object} - Estatísticas de uso
     */
    getApiUsageStats: function() {
        const stats = {
            totalCalls: 0,
            apiCalls: {},
            remainingCalls: {}
        };
        
        // Calcular estatísticas para cada API
        for (const apiName in CONFIG.apiRotation.callCount) {
            const callCount = CONFIG.apiRotation.callCount[apiName] || 0;
            const dailyLimit = CONFIG.apiRotation.dailyLimits[apiName] || Infinity;
            
            stats.apiCalls[apiName] = callCount;
            stats.remainingCalls[apiName] = dailyLimit - callCount;
            stats.totalCalls += callCount;
        }
        
        return stats;
    },
    
    /**
     * Constrói a URL da API com base no tipo e parâmetros
     * @param {string} type - Tipo de dados (stockMarket, news, crypto, economic)
     * @param {string} endpoint - Endpoint específico da API
     * @param {Object} params - Parâmetros da chamada
     * @returns {Object} - Objeto com a URL e o nome da API
     */
    buildApiUrl: function(type, endpoint, params = {}) {
        // Obter a próxima API disponível
        const apiName = this.getNextApi(type);
        
        // Registrar a chamada
        this.registerApiCall(apiName);
        
        // Construir URL base
        let baseUrl;
        if (CONFIG.apiEndpoints.useProxy) {
            // Usar endpoint de proxy
            const proxyKey = `proxy${apiName.charAt(0).toUpperCase() + apiName.slice(1)}`;
            baseUrl = CONFIG.apiEndpoints[proxyKey] || '';
        } else {
            // Usar endpoint direto
            baseUrl = CONFIG.apiEndpoints[apiName] || '';
        }
        
        // Adicionar endpoint específico
        let url = `${baseUrl}/${endpoint}`;
        
        // Adicionar chave de API se necessário
        if (apiName !== 'coinGecko') { // CoinGecko não requer chave para endpoints básicos
            params.apikey = CONFIG.apiKeys[apiName];
        }
        
        // Adicionar parâmetros à URL
        const queryParams = new URLSearchParams();
        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined && value !== null) {
                queryParams.append(key, value);
            }
        }
        
        const queryString = queryParams.toString();
        if (queryString) {
            url += `?${queryString}`;
        }
        
        return {
            url,
            apiName
        };
    }
};

// Inicializar o gerenciador de APIs quando o script for carregado
document.addEventListener('DOMContentLoaded', function() {
    ApiManager.init();
});
