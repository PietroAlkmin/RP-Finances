/**
 * News Data Module
 * Utiliza a API GNews para obter notícias financeiras
 */

/**
 * Obtém notícias financeiras
 * @param {string} topic - Tópico das notícias (ex: 'business', 'finance', 'economy')
 * @param {string} lang - Idioma das notícias (ex: 'en', 'pt')
 * @param {number} max - Número máximo de notícias
 * @returns {Promise<Array>} - Lista de notícias
 */
async function loadFinancialNews(topic = 'business', lang = 'en', max = 10) {
    try {
        console.log(`Carregando notícias financeiras (tópico: ${topic}, idioma: ${lang})...`);
        
        // Verificar se há dados em cache
        const cacheKey = `financial_news_${topic}_${lang}`;
        const cachedData = CacheManager.getFromCache(cacheKey);
        
        if (cachedData) {
            console.log('Usando notícias do cache');
            return cachedData.slice(0, max);
        }
        
        // Construir URL da API
        const baseUrl = CONFIG.apiEndpoints.useProxy ? 
            CONFIG.apiEndpoints.proxyGnews : 
            CONFIG.apiEndpoints.gnews;
            
        const url = `${baseUrl}/top-headlines?topic=${topic}&lang=${lang}&country=us,br&max=${max}&apikey=${CONFIG.apiKeys.gnews}`;
        
        console.log('Chamando GNews API:', url);
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Erro na API GNews: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Notícias recebidas:', data);
        
        // Processar dados
        const news = data.articles.map(article => ({
            title: article.title,
            description: article.description,
            content: article.content,
            url: article.url,
            image: article.image,
            publishedAt: article.publishedAt,
            source: {
                name: article.source.name,
                url: article.source.url
            }
        }));
        
        // Salvar no cache
        CacheManager.saveToCache(cacheKey, news, CONFIG.cache.ttl.news);
        
        return news.slice(0, max);
    } catch (error) {
        console.error('Erro ao carregar notícias financeiras:', error);
        return simulateFinancialNews(topic, lang, max);
    }
}

/**
 * Obtém notícias sobre uma empresa ou ativo específico
 * @param {string} query - Termo de busca (ex: 'Apple', 'Bitcoin')
 * @param {string} lang - Idioma das notícias (ex: 'en', 'pt')
 * @param {number} max - Número máximo de notícias
 * @returns {Promise<Array>} - Lista de notícias
 */
async function loadAssetNews(query, lang = 'en', max = 5) {
    try {
        console.log(`Carregando notícias sobre ${query} (idioma: ${lang})...`);
        
        // Verificar se há dados em cache
        const cacheKey = `asset_news_${query}_${lang}`;
        const cachedData = CacheManager.getFromCache(cacheKey);
        
        if (cachedData) {
            console.log('Usando notícias de ativo do cache');
            return cachedData.slice(0, max);
        }
        
        // Construir URL da API
        const baseUrl = CONFIG.apiEndpoints.useProxy ? 
            CONFIG.apiEndpoints.proxyGnews : 
            CONFIG.apiEndpoints.gnews;
            
        const url = `${baseUrl}/search?q=${encodeURIComponent(query)}&lang=${lang}&max=${max}&apikey=${CONFIG.apiKeys.gnews}`;
        
        console.log('Chamando GNews API para busca:', url);
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Erro na API GNews: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Notícias de ativo recebidas:', data);
        
        // Processar dados
        const news = data.articles.map(article => ({
            title: article.title,
            description: article.description,
            content: article.content,
            url: article.url,
            image: article.image,
            publishedAt: article.publishedAt,
            source: {
                name: article.source.name,
                url: article.source.url
            }
        }));
        
        // Salvar no cache
        CacheManager.saveToCache(cacheKey, news, CONFIG.cache.ttl.news);
        
        return news.slice(0, max);
    } catch (error) {
        console.error(`Erro ao carregar notícias sobre ${query}:`, error);
        return simulateAssetNews(query, lang, max);
    }
}

/**
 * Obtém notícias brasileiras
 * @param {string} topic - Tópico das notícias (ex: 'business', 'finance', 'economy')
 * @param {number} max - Número máximo de notícias
 * @returns {Promise<Array>} - Lista de notícias
 */
async function loadBrazilianNews(topic = 'business', max = 10) {
    try {
        console.log(`Carregando notícias brasileiras (tópico: ${topic})...`);
        
        // Verificar se há dados em cache
        const cacheKey = `brazilian_news_${topic}`;
        const cachedData = CacheManager.getFromCache(cacheKey);
        
        if (cachedData) {
            console.log('Usando notícias brasileiras do cache');
            return cachedData.slice(0, max);
        }
        
        // Construir URL da API
        const baseUrl = CONFIG.apiEndpoints.useProxy ? 
            CONFIG.apiEndpoints.proxyGnews : 
            CONFIG.apiEndpoints.gnews;
            
        const url = `${baseUrl}/top-headlines?topic=${topic}&lang=pt&country=br&max=${max}&apikey=${CONFIG.apiKeys.gnews}`;
        
        console.log('Chamando GNews API para notícias brasileiras:', url);
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Erro na API GNews: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Notícias brasileiras recebidas:', data);
        
        // Processar dados
        const news = data.articles.map(article => ({
            title: article.title,
            description: article.description,
            content: article.content,
            url: article.url,
            image: article.image,
            publishedAt: article.publishedAt,
            source: {
                name: article.source.name,
                url: article.source.url
            }
        }));
        
        // Salvar no cache
        CacheManager.saveToCache(cacheKey, news, CONFIG.cache.ttl.news);
        
        return news.slice(0, max);
    } catch (error) {
        console.error('Erro ao carregar notícias brasileiras:', error);
        return simulateBrazilianNews(topic, max);
    }
}

/**
 * Simula notícias financeiras quando a API falha
 */
function simulateFinancialNews(topic, lang, max) {
    console.warn(`Simulando notícias financeiras (tópico: ${topic}, idioma: ${lang})`);
    
    const newsItems = [
        {
            title: 'Federal Reserve mantém taxas de juros inalteradas',
            description: 'O Federal Reserve decidiu manter as taxas de juros inalteradas na reunião desta semana.',
            content: 'O Federal Reserve dos Estados Unidos decidiu manter as taxas de juros inalteradas na reunião desta semana, citando preocupações com a inflação e o crescimento econômico.',
            url: 'https://example.com/news/1',
            image: 'https://example.com/images/fed.jpg',
            publishedAt: new Date(Date.now() - 3600000).toISOString(),
            source: {
                name: 'Financial Times',
                url: 'https://ft.com'
            }
        },
        {
            title: 'Apple anuncia novos produtos em evento anual',
            description: 'A Apple apresentou sua nova linha de produtos durante evento anual.',
            content: 'A Apple apresentou sua nova linha de produtos durante evento anual, incluindo novos iPhones, iPads e atualizações de software.',
            url: 'https://example.com/news/2',
            image: 'https://example.com/images/apple.jpg',
            publishedAt: new Date(Date.now() - 7200000).toISOString(),
            source: {
                name: 'CNBC',
                url: 'https://cnbc.com'
            }
        },
        {
            title: 'Bitcoin atinge novo recorde histórico',
            description: 'A criptomoeda Bitcoin atingiu um novo recorde histórico de preço hoje.',
            content: 'A criptomoeda Bitcoin atingiu um novo recorde histórico de preço hoje, ultrapassando os $65.000 pela primeira vez.',
            url: 'https://example.com/news/3',
            image: 'https://example.com/images/bitcoin.jpg',
            publishedAt: new Date(Date.now() - 10800000).toISOString(),
            source: {
                name: 'CoinDesk',
                url: 'https://coindesk.com'
            }
        }
    ];
    
    // Adicionar mais notícias simuladas se necessário
    if (max > 3) {
        for (let i = 4; i <= max; i++) {
            newsItems.push({
                title: `Notícia financeira simulada ${i}`,
                description: `Esta é uma descrição simulada para a notícia ${i}.`,
                content: `Este é o conteúdo simulado para a notícia financeira ${i}. Contém informações sobre mercados, economia e finanças.`,
                url: `https://example.com/news/${i}`,
                image: `https://example.com/images/news${i}.jpg`,
                publishedAt: new Date(Date.now() - (i * 3600000)).toISOString(),
                source: {
                    name: 'Financial News',
                    url: 'https://financialnews.com'
                }
            });
        }
    }
    
    return newsItems.slice(0, max);
}

/**
 * Simula notícias sobre um ativo específico quando a API falha
 */
function simulateAssetNews(query, lang, max) {
    console.warn(`Simulando notícias sobre ${query} (idioma: ${lang})`);
    
    const newsItems = [
        {
            title: `${query} anuncia resultados trimestrais acima das expectativas`,
            description: `A empresa ${query} divulgou resultados financeiros acima das expectativas dos analistas.`,
            content: `A empresa ${query} divulgou resultados financeiros acima das expectativas dos analistas, com receita de $10 bilhões e lucro de $2 bilhões no último trimestre.`,
            url: 'https://example.com/asset/1',
            image: 'https://example.com/images/earnings.jpg',
            publishedAt: new Date(Date.now() - 3600000).toISOString(),
            source: {
                name: 'Bloomberg',
                url: 'https://bloomberg.com'
            }
        },
        {
            title: `Analistas elevam preço-alvo para ações de ${query}`,
            description: `Vários analistas elevaram o preço-alvo para as ações de ${query} após resultados positivos.`,
            content: `Vários analistas elevaram o preço-alvo para as ações de ${query} após resultados positivos, com projeções de crescimento para os próximos trimestres.`,
            url: 'https://example.com/asset/2',
            image: 'https://example.com/images/stocks.jpg',
            publishedAt: new Date(Date.now() - 7200000).toISOString(),
            source: {
                name: 'Reuters',
                url: 'https://reuters.com'
            }
        }
    ];
    
    // Adicionar mais notícias simuladas se necessário
    if (max > 2) {
        for (let i = 3; i <= max; i++) {
            newsItems.push({
                title: `Notícia ${i} sobre ${query}`,
                description: `Esta é uma descrição simulada para a notícia ${i} sobre ${query}.`,
                content: `Este é o conteúdo simulado para a notícia ${i} sobre ${query}. Contém informações relevantes sobre a empresa ou ativo.`,
                url: `https://example.com/asset/${i}`,
                image: `https://example.com/images/asset${i}.jpg`,
                publishedAt: new Date(Date.now() - (i * 3600000)).toISOString(),
                source: {
                    name: 'Financial News',
                    url: 'https://financialnews.com'
                }
            });
        }
    }
    
    return newsItems.slice(0, max);
}

/**
 * Simula notícias brasileiras quando a API falha
 */
function simulateBrazilianNews(topic, max) {
    console.warn(`Simulando notícias brasileiras (tópico: ${topic})`);
    
    const newsItems = [
        {
            title: 'Banco Central mantém taxa Selic em 10,75% ao ano',
            description: 'O Comitê de Política Monetária (Copom) decidiu manter a taxa Selic em 10,75% ao ano.',
            content: 'O Comitê de Política Monetária (Copom) do Banco Central decidiu manter a taxa Selic em 10,75% ao ano na reunião desta semana, em linha com as expectativas do mercado.',
            url: 'https://example.com/br/1',
            image: 'https://example.com/images/bc.jpg',
            publishedAt: new Date(Date.now() - 3600000).toISOString(),
            source: {
                name: 'Valor Econômico',
                url: 'https://valor.com.br'
            }
        },
        {
            title: 'Ibovespa fecha em alta de 1,2% impulsionado por commodities',
            description: 'O principal índice da bolsa brasileira fechou em alta, impulsionado por ações de commodities.',
            content: 'O Ibovespa, principal índice da bolsa brasileira, fechou em alta de 1,2% nesta quinta-feira, impulsionado principalmente por ações de empresas ligadas a commodities, como Petrobras e Vale.',
            url: 'https://example.com/br/2',
            image: 'https://example.com/images/ibovespa.jpg',
            publishedAt: new Date(Date.now() - 7200000).toISOString(),
            source: {
                name: 'InfoMoney',
                url: 'https://infomoney.com.br'
            }
        },
        {
            title: 'Governo anuncia pacote de medidas econômicas',
            description: 'O governo federal anunciou hoje um novo pacote de medidas econômicas.',
            content: 'O governo federal anunciou hoje um novo pacote de medidas econômicas visando estimular o crescimento e controlar a inflação nos próximos meses.',
            url: 'https://example.com/br/3',
            image: 'https://example.com/images/governo.jpg',
            publishedAt: new Date(Date.now() - 10800000).toISOString(),
            source: {
                name: 'G1 Economia',
                url: 'https://g1.globo.com/economia/'
            }
        }
    ];
    
    // Adicionar mais notícias simuladas se necessário
    if (max > 3) {
        for (let i = 4; i <= max; i++) {
            newsItems.push({
                title: `Notícia brasileira simulada ${i}`,
                description: `Esta é uma descrição simulada para a notícia brasileira ${i}.`,
                content: `Este é o conteúdo simulado para a notícia brasileira ${i}. Contém informações sobre economia e finanças no Brasil.`,
                url: `https://example.com/br/${i}`,
                image: `https://example.com/images/br${i}.jpg`,
                publishedAt: new Date(Date.now() - (i * 3600000)).toISOString(),
                source: {
                    name: 'Notícias Brasil',
                    url: 'https://noticiasbrasil.com'
                }
            });
        }
    }
    
    return newsItems.slice(0, max);
}

// Exportar funções para uso em outros arquivos
window.loadFinancialNews = loadFinancialNews;
window.loadAssetNews = loadAssetNews;
window.loadBrazilianNews = loadBrazilianNews;
