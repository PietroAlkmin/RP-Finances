/**
 * Gerenciador de cache para o dashboard financeiro
 * Implementa mecanismos de cache para reduzir chamadas de API e melhorar performance
 */

const CacheManager = {
    /**
     * Salva dados no cache
     * @param {string} key - Chave para identificar os dados
     * @param {any} data - Dados a serem armazenados
     * @param {number} ttl - Tempo de vida em milissegundos
     */
    saveToCache: function(key, data, ttl) {
        if (!CONFIG.cache.enabled) return;

        try {
            const cacheItem = {
                data: data,
                timestamp: Date.now(),
                expiry: Date.now() + ttl
            };

            localStorage.setItem(`dashboard_cache_${key}`, JSON.stringify(cacheItem));
            console.log(`Dados salvos no cache: ${key}`);
        } catch (error) {
            console.warn(`Erro ao salvar no cache: ${error.message}`);
        }
    },

    /**
     * Recupera dados do cache
     * @param {string} key - Chave para identificar os dados
     * @returns {any|null} - Dados armazenados ou null se não encontrados ou expirados
     */
    getFromCache: function(key) {
        if (!CONFIG.cache.enabled) return null;

        try {
            const cachedData = localStorage.getItem(`dashboard_cache_${key}`);

            if (!cachedData) return null;

            const cacheItem = JSON.parse(cachedData);

            // Verificar se o cache expirou
            if (Date.now() > cacheItem.expiry) {
                console.log(`Cache expirado para: ${key}`);
                localStorage.removeItem(`dashboard_cache_${key}`);
                return null;
            }

            console.log(`Dados recuperados do cache: ${key}`);
            return cacheItem.data;
        } catch (error) {
            console.warn(`Erro ao recuperar do cache: ${error.message}`);
            return null;
        }
    },

    /**
     * Limpa todo o cache do dashboard
     */
    clearAllCache: function() {
        try {
            const keys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('dashboard_cache_')) {
                    keys.push(key);
                }
            }

            keys.forEach(key => localStorage.removeItem(key));
            console.log(`Cache limpo: ${keys.length} itens removidos`);
        } catch (error) {
            console.warn(`Erro ao limpar cache: ${error.message}`);
        }
    },

    /**
     * Limpa o cache para um tipo específico de dados
     * @param {string} type - Tipo de dados (indices, stocks, news, etc.)
     */
    clearCacheByType: function(type) {
        try {
            const keys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith(`dashboard_cache_${type}`)) {
                    keys.push(key);
                }
            }

            keys.forEach(key => localStorage.removeItem(key));
            console.log(`Cache limpo para ${type}: ${keys.length} itens removidos`);
        } catch (error) {
            console.warn(`Erro ao limpar cache para ${type}: ${error.message}`);
        }
    },

    /**
     * Remove um item específico do cache
     * @param {string} key - Chave do item a ser removido
     */
    removeFromCache: function(key) {
        try {
            localStorage.removeItem(`dashboard_cache_${key}`);
            console.log(`Item removido do cache: ${key}`);
        } catch (error) {
            console.warn(`Erro ao remover item do cache: ${error.message}`);
        }
    },

    /**
     * Limpa todo o cache do dashboard
     */
    clearAllCache: function() {
        try {
            const keys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('dashboard_cache_')) {
                    keys.push(key);
                }
            }

            keys.forEach(key => localStorage.removeItem(key));
            console.log(`Todo o cache do dashboard foi limpo. ${keys.length} itens removidos.`);
        } catch (error) {
            console.warn(`Erro ao limpar todo o cache: ${error.message}`);
        }
    },

    /**
     * Limpa o cache por tipo (prefixo)
     * @param {string} type - Tipo/prefixo do cache a ser limpo
     */
    clearCacheByType: function(type) {
        try {
            const keys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith(`dashboard_cache_${type}`)) {
                    keys.push(key);
                }
            }

            keys.forEach(key => localStorage.removeItem(key));
            console.log(`Cache do tipo '${type}' foi limpo. ${keys.length} itens removidos.`);
        } catch (error) {
            console.warn(`Erro ao limpar cache do tipo '${type}': ${error.message}`);
        }
    }
};
