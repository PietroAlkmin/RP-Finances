/**
 * Servidor proxy simples para contornar problemas de CORS ao fazer chamadas de API
 * Este servidor atua como intermediário entre o frontend e as APIs externas
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Habilitar CORS para todas as rotas
app.use(cors());

// Parse JSON request body
app.use(bodyParser.json());

// Servir arquivos estáticos da pasta dashboard
app.use(express.static(path.join(__dirname, 'dashboard')));

// Rota para redirecionar páginas principais para a pasta dashboard
app.get('/:page.html', (req, res) => {
    const { page } = req.params;
    // Lista de páginas válidas
    const validPages = ['index', 'news', 'best-assets', 'portfolio', 'api-test'];

    if (validPages.includes(page)) {
        console.log(`Redirecionando /${page}.html para /dashboard/${page}.html`);
        res.redirect(`/dashboard/${page}.html`);
    } else {
        // Se não for uma página válida, continuar para o próximo middleware
        res.status(404).send('Página não encontrada');
    }
});

// Rota para verificar a saúde do servidor proxy
app.get('/api/health', (req, res) => {
    console.log('Health check recebido');
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'Proxy server is running',
        version: '1.0.0'
    });
});

// Rota para proxy da API do Yahoo Finance
app.get('/api/yahoo-finance/:endpoint(*)', async (req, res) => {
    try {
        const { endpoint } = req.params;
        const queryParams = req.query;

        // Construir URL para a API do Yahoo Finance
        // Usar a URL completa para lidar com símbolos especiais como ^GSPC
        let url;
        if (endpoint.startsWith('chart/')) {
            // Para requisições de gráficos
            const symbol = endpoint.replace('chart/', '');
            url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;

            // Log para debug
            console.log(`Yahoo Finance chart request for symbol: ${symbol}`);
            console.log('Range:', queryParams.range);
            console.log('Interval:', queryParams.interval);
        } else {
            // Para outras requisições
            url = `https://query1.finance.yahoo.com/v8/finance/${endpoint}`;
        }

        console.log(`Proxy request to Yahoo Finance: ${url}`);
        console.log('Query params:', queryParams);

        // Fazer a chamada à API
        const response = await axios.get(url, {
            params: queryParams,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        // Log para debug
        if (endpoint.startsWith('chart/')) {
            const data = response.data;
            if (data && data.chart && data.chart.result && data.chart.result.length > 0) {
                const result = data.chart.result[0];
                console.log('Yahoo Finance response contains valid data');
                console.log('Timestamp count:', result.timestamp ? result.timestamp.length : 0);
                console.log('First timestamp:', result.timestamp ? new Date(result.timestamp[0] * 1000).toISOString() : 'N/A');
                console.log('Last timestamp:', result.timestamp ? new Date(result.timestamp[result.timestamp.length - 1] * 1000).toISOString() : 'N/A');
            } else {
                console.warn('Yahoo Finance response does not contain valid data');
            }
        }

        // Retornar os dados para o cliente
        res.json(response.data);
    } catch (error) {
        console.error('Error proxying Yahoo Finance request:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        res.status(error.response?.status || 500).json({
            error: 'Failed to fetch data from Yahoo Finance',
            details: error.message
        });
    }
});

// Rota para proxy da API Alpha Vantage
app.get('/api/alpha-vantage', async (req, res) => {
    try {
        const queryParams = req.query;

        // Verificar se a chave de API está presente ou usar a chave padrão
        if (!queryParams.apikey) {
            queryParams.apikey = 'AW76YEYYVF2XFURD'; // Usar sua chave da Alpha Vantage
        }

        // Construir URL para a API Alpha Vantage
        const url = 'https://www.alphavantage.co/query';

        console.log(`Proxy request to Alpha Vantage: ${url}`);
        console.log('Query params:', queryParams);

        // Fazer a chamada à API
        const response = await axios.get(url, { params: queryParams });

        // Retornar os dados para o cliente
        res.json(response.data);
    } catch (error) {
        console.error('Error proxying Alpha Vantage request:', error.message);
        res.status(500).json({
            error: 'Failed to fetch data from Alpha Vantage',
            details: error.message
        });
    }
});

// Rota para proxy da API de notícias removida - usando apenas GNews

// Rota para proxy da API CoinGecko (reativada para usar dados reais)
app.get('/api/coingecko/:endpoint(*)', async (req, res) => {
    try {
        const { endpoint } = req.params;
        const queryParams = req.query;

        // Construir URL para a API CoinGecko
        const url = `https://api.coingecko.com/api/v3/${endpoint}`;
        console.log(`Proxying CoinGecko API request to: ${url}`);
        console.log('Query params:', queryParams);

        // Fazer a chamada à API CoinGecko
        const response = await axios.get(url, {
            params: queryParams,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        // Retornar os dados reais para o cliente
        res.json(response.data);
    } catch (error) {
        console.error('Error proxying CoinGecko API request:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        res.status(error.response?.status || 500).json({
            error: 'Failed to fetch data from CoinGecko API',
            details: error.message
        });
    }
});

// Rota para proxy da API Alpha Vantage
app.get('/api/alpha-vantage/:endpoint(*)', async (req, res) => {
    try {
        const { endpoint } = req.params;
        const queryParams = req.query;

        // Construir URL para a API Alpha Vantage
        const url = `https://www.alphavantage.co/query`;

        // Adicionar function=CRYPTO_INTRADAY para chamadas de criptomoedas
        if (endpoint.includes('coins/markets')) {
            queryParams.function = 'CRYPTO_INTRADAY';
            queryParams.symbol = queryParams.ids ? queryParams.ids.split(',')[0] : 'BTC';
            queryParams.market = 'USD';
            queryParams.interval = '5min';
            delete queryParams.ids;
        }
        console.log(`Proxying Alpha Vantage API request to: ${url}`);

        // Fazer a chamada à API
        const response = await axios.get(url, { params: queryParams });

        // Retornar os dados para o cliente
        res.json(response.data);
    } catch (error) {
        console.error('Error proxying Alpha Vantage API request:', error.message);
        res.status(error.response?.status || 500).json({
            error: 'Failed to fetch data from Alpha Vantage API',
            details: error.message
        });
    }
});

// Rota para proxy da API Financial Modeling Prep
// Nota: Esta API não é mais usada para notícias, apenas para dados financeiros
app.get('/api/fmp/:endpoint(*)', async (req, res) => {
    try {
        const { endpoint } = req.params;
        const queryParams = req.query;

        // Adicionar a chave de API se não estiver presente
        if (!queryParams.apikey) {
            queryParams.apikey = 'demo'; // Usar a chave demo para testes
            // Nota: Para uso em produção, é necessário obter uma chave válida em https://financialmodelingprep.com/
        }

        // Construir URL para a API Financial Modeling Prep
        const url = `https://financialmodelingprep.com/api/v3/${endpoint}`;
        console.log(`Proxying Financial Modeling Prep API request to: ${url}`);
        console.log('Query params:', queryParams);

        // Fazer a chamada à API
        const response = await axios.get(url, { params: queryParams });

        // Retornar os dados para o cliente
        res.json(response.data);
    } catch (error) {
        console.error('Error proxying Financial Modeling Prep API request:', error.message);
        res.status(error.response?.status || 500).json({
            error: 'Failed to fetch data from Financial Modeling Prep API',
            details: error.message
        });
    }
});

// Rota para proxy da API Finnhub
app.get('/api/finnhub/:endpoint(*)', async (req, res) => {
    try {
        const { endpoint } = req.params;
        const queryParams = req.query;

        // Adicionar a chave de API se não estiver presente
        if (!queryParams.token) {
            queryParams.token = 'cvu3b51r01qjg1379ukgcvu3b51r01qjg1379ul0'; // Chave premium do Finnhub
        }

        // Construir URL para a API Finnhub
        const url = `https://finnhub.io/api/v1/${endpoint}`;
        console.log(`Proxying Finnhub API request to: ${url}`);

        // Fazer a chamada à API
        const response = await axios.get(url, { params: queryParams });

        // Retornar os dados para o cliente
        res.json(response.data);
    } catch (error) {
        console.error('Error proxying Finnhub API request:', error.message);
        res.status(error.response?.status || 500).json({
            error: 'Failed to fetch data from Finnhub API',
            details: error.message
        });
    }
});

// Pluggy API Configuration
const PLUGGY_API_URL = 'https://api.pluggy.ai'; // Production API URL
const PLUGGY_CLIENT_ID = process.env.PLUGGY_CLIENT_ID || '9b51ba06-7461-420c-a79c-1c58bcfb3127'; // Client ID
const PLUGGY_CLIENT_SECRET = process.env.PLUGGY_CLIENT_SECRET || 'a576c67a-ce3b-4991-8419-486bc95bf2ef'; // Client Secret

// Flag to check if Pluggy credentials are configured
const isPluggyConfigured = true; // We now have valid credentials

// Cache for Pluggy API key
let pluggyApiKey = null;
let pluggyApiKeyExpiration = null;

// Function to get a valid Pluggy API key
async function getPluggyApiKey() {
    // Check if we have a valid cached API key
    if (pluggyApiKey && pluggyApiKeyExpiration && new Date() < pluggyApiKeyExpiration) {
        console.log('Using cached Pluggy API key');
        return pluggyApiKey;
    }

    try {
        console.log('Requesting new Pluggy API key with credentials:', {
            clientId: PLUGGY_CLIENT_ID,
            clientSecret: '***' // Hide the secret for security
        });

        // Request a new API key
        const response = await axios.post(`${PLUGGY_API_URL}/auth`, {
            clientId: PLUGGY_CLIENT_ID,
            clientSecret: PLUGGY_CLIENT_SECRET
        });

        console.log('Pluggy auth response:', response.data);

        // Cache the API key and set expiration (2 hours from now)
        pluggyApiKey = response.data.apiKey;
        pluggyApiKeyExpiration = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours

        return pluggyApiKey;
    } catch (error) {
        console.error('Error getting Pluggy API key:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
        }
        throw error;
    }
}

// Endpoint to get a Pluggy Connect Token
app.get('/api/pluggy/connect-token', async (req, res) => {
    try {
        // Check if Pluggy is configured
        if (!isPluggyConfigured) {
            return res.status(400).json({
                error: 'Pluggy API credentials not configured',
                details: 'Please set up your Pluggy CLIENT_ID and CLIENT_SECRET in the proxy-server.js file',
                demo: true
            });
        }

        // Always use real Pluggy API - no mock data

        console.log('Getting Pluggy API key...');
        // Get a valid API key
        const apiKey = await getPluggyApiKey();
        console.log('Successfully obtained Pluggy API key');

        console.log('Requesting Pluggy Connect Token...');
        // Request a Connect Token with parameters to show all connectors
        const response = await axios.post(`${PLUGGY_API_URL}/connect_token`, {
            clientUserId: 'user-' + Date.now(), // Use a unique user ID
            options: {
                includeSandbox: true,
                showAllConnectors: true
            }
        }, {
            headers: {
                'X-API-KEY': apiKey
            }
        });

        console.log('Successfully obtained Pluggy Connect Token:', response.data);

        // Return the Connect Token
        res.json(response.data);
    } catch (error) {
        console.error('Error getting Pluggy Connect Token:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
        }

        // Return error instead of mock token
        res.status(500).json({
            error: 'Failed to get Pluggy Connect Token',
            details: error.message
        });
    }
});

// Proxy route for Pluggy Connect script
app.get('/pluggy-connect.js', async (req, res) => {
    try {
        console.log('Proxying request for Pluggy Connect script');
        const response = await axios.get('https://web.pluggy.ai/pluggy-connect.js', {
            responseType: 'text'
        });

        res.set('Content-Type', 'application/javascript');
        res.send(response.data);
    } catch (error) {
        console.error('Error proxying Pluggy Connect script:', error.message);
        res.status(500).send('// Error loading Pluggy Connect script');
    }
});

// Endpoint to get accounts for an item
app.get('/api/pluggy/accounts', async (req, res) => {
    try {
        const { itemId } = req.query;

        if (!itemId) {
            return res.status(400).json({ error: 'Item ID is required' });
        }

        // No mock data - always use real Pluggy API

        // Always use real Pluggy API - no mock data fallback

        // Get a valid API key
        const apiKey = await getPluggyApiKey();

        // Request accounts for the item
        const response = await axios.get(`${PLUGGY_API_URL}/accounts?itemId=${itemId}`, {
            headers: {
                'X-API-KEY': apiKey
            }
        });

        // Return the accounts
        res.json(response.data);
    } catch (error) {
        console.error('Error getting Pluggy accounts:', error.message);

        // Return error to the frontend - no fallback to mock data
        res.status(500).json({
            error: 'Failed to fetch accounts from Pluggy API',
            message: error.message
        });
    }
});

// Endpoint to get transactions for an account
app.get('/api/pluggy/transactions', async (req, res) => {
    try {
        const { accountId, from, to, page, pageSize } = req.query;

        if (!accountId) {
            return res.status(400).json({ error: 'Account ID is required' });
        }

        // No mock data - always use real Pluggy API

        // Always use real Pluggy API - no mock data fallback

        // Build query parameters
        const queryParams = new URLSearchParams();
        queryParams.append('accountId', accountId);
        if (from) queryParams.append('from', from);
        if (to) queryParams.append('to', to);
        if (page) queryParams.append('page', page);
        if (pageSize) queryParams.append('pageSize', pageSize);

        // Get a valid API key
        const apiKey = await getPluggyApiKey();

        // Request transactions for the account
        const response = await axios.get(`${PLUGGY_API_URL}/transactions?${queryParams}`, {
            headers: {
                'X-API-KEY': apiKey
            }
        });

        // Return the transactions
        res.json(response.data);
    } catch (error) {
        console.error('Error getting Pluggy transactions:', error.message);

        // Return error to the frontend
        res.status(500).json({
            error: 'Failed to fetch transactions from Pluggy API',
            message: error.message
        });
    }
});

// Endpoint to get investments for an account or item
app.get('/api/pluggy/investments', async (req, res) => {
    try {
        const { accountId, itemId } = req.query;

        if (!accountId && !itemId) {
            return res.status(400).json({ error: 'Either Account ID or Item ID is required' });
        }

        // No mock data - always use real Pluggy API

        // Always use real Pluggy API - no mock data fallback

        // Get a valid API key
        const apiKey = await getPluggyApiKey();

        // Build the URL based on whether we have an account ID or item ID
        let url;
        if (accountId) {
            url = `${PLUGGY_API_URL}/investments?accountId=${accountId}`;
            console.log('Requesting investments for account:', accountId);
        } else {
            url = `${PLUGGY_API_URL}/investments?itemId=${itemId}`;
            console.log('Requesting investments for item:', itemId);
        }

        // Request investments
        const response = await axios.get(url, {
            headers: {
                'X-API-KEY': apiKey
            }
        });

        // Return the investments
        res.json(response.data);
    } catch (error) {
        console.error('Error getting Pluggy investments:', error.message);

        // Return error to the frontend
        res.status(500).json({
            error: 'Failed to fetch investments from Pluggy API',
            message: error.message
        });
    }
});

// Webhook endpoint for Pluggy notifications (MFA, etc.)
app.post('/api/pluggy/webhook', async (req, res) => {
    try {
        console.log('Received webhook notification from Pluggy:', req.body);

        // Handle different webhook event types
        const event = req.body;

        if (event && event.type) {
            switch (event.type) {
                case 'item/created':
                    console.log('Item created:', event.item);
                    break;
                case 'item/updated':
                    console.log('Item updated:', event.item);
                    break;
                case 'item/error':
                    console.error('Item error:', event.error);
                    break;
                case 'connector/status/updated':
                    console.log('Connector status updated:', event.connector);
                    break;
                case 'item/login_succeeded':
                    console.log('Login succeeded for item:', event.item);
                    break;
                case 'item/waiting_user_input':
                    console.log('Item waiting for user input:', event.item);
                    // This is typically for MFA challenges
                    break;
                default:
                    console.log('Unhandled webhook event type:', event.type);
            }
        }

        // Always return 200 OK to acknowledge receipt
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error processing webhook:', error.message);
        // Still return 200 to acknowledge receipt
        res.status(200).json({ success: true, error: error.message });
    }
});

// Endpoint to refresh an item
app.post('/api/pluggy/items/:itemId/refresh', async (req, res) => {
    try {
        const { itemId } = req.params;
        const { parameters } = req.body || {};

        if (!itemId) {
            return res.status(400).json({ error: 'Item ID is required' });
        }

        // Log if we received Rico-specific parameters
        if (parameters) {
            console.log(`Received refresh parameters for item ${itemId}:`, parameters);
        }

        // Always use real Pluggy API - no mock data

        // Get a valid API key
        const apiKey = await getPluggyApiKey();

        // Prepare request body with parameters if provided
        const requestBody = parameters ? { parameters } : {};
        console.log(`Refreshing item ${itemId} with body:`, requestBody);

        // Refresh the item
        const response = await axios.post(`${PLUGGY_API_URL}/items/${itemId}/refresh`, requestBody, {
            headers: {
                'X-API-KEY': apiKey
            }
        });

        // Return the response
        res.json(response.data);
    } catch (error) {
        console.error('Error refreshing Pluggy item:', error.message);

        // Return error instead of mock success
        res.status(500).json({
            error: 'Failed to refresh Pluggy item',
            message: error.message
        });
    }
});

// Endpoint to delete an item
app.delete('/api/pluggy/items/:itemId', async (req, res) => {
    try {
        const { itemId } = req.params;

        if (!itemId) {
            return res.status(400).json({ error: 'Item ID is required' });
        }

        // Always use real Pluggy API - no mock data

        // Get a valid API key
        const apiKey = await getPluggyApiKey();

        // Delete the item
        const response = await axios.delete(`${PLUGGY_API_URL}/items/${itemId}`, {
            headers: {
                'X-API-KEY': apiKey
            }
        });

        // Return success
        res.json({ success: true, message: 'Item disconnected successfully' });
    } catch (error) {
        console.error('Error deleting Pluggy item:', error.message);

        // Return error instead of mock success
        res.status(500).json({
            error: 'Failed to delete Pluggy item',
            message: error.message
        });
    }
});

// Rota para proxy da API brapi.dev (ações brasileiras)
app.get('/api/brapi/:endpoint(*)', async (req, res) => {
    try {
        const { endpoint } = req.params;
        const queryParams = req.query;

        // Adicionar a chave de API se não estiver presente
        if (!queryParams.token) {
            queryParams.token = '5gqN7YFNFzWD28VXADXHNV'; // Chave PRO para brapi.dev
        }

        // Construir URL para a API brapi.dev
        const url = `https://brapi.dev/api/${endpoint}`;
        console.log(`Proxying brapi.dev API request to: ${url}`);

        // Fazer a chamada à API
        const response = await axios.get(url, { params: queryParams });

        // Retornar os dados para o cliente
        res.json(response.data);
    } catch (error) {
        console.error('Error proxying brapi.dev API request:', error.message);
        res.status(error.response?.status || 500).json({
            error: 'Failed to fetch data from brapi.dev API',
            details: error.message
        });
    }
});

// Rota para proxy da API FRED (Federal Reserve Economic Data)
app.get('/api/fred/:endpoint(*)', async (req, res) => {
    try {
        const { endpoint } = req.params;
        const queryParams = req.query;

        // Adicionar a chave de API se não estiver presente
        if (!queryParams.api_key) {
            queryParams.api_key = '79d701bccfad503602710ec931fc09b9'; // Chave para FRED API
        }

        // Adicionar formato JSON se não estiver presente
        if (!queryParams.file_type) {
            queryParams.file_type = 'json';
        }

        // Construir URL para a API FRED
        const url = `https://api.stlouisfed.org/fred/${endpoint}`;
        console.log(`Proxying FRED API request to: ${url}`);

        // Fazer a chamada à API
        const response = await axios.get(url, { params: queryParams });

        // Retornar os dados para o cliente
        res.json(response.data);
    } catch (error) {
        console.error('Error proxying FRED API request:', error.message);
        res.status(error.response?.status || 500).json({
            error: 'Failed to fetch data from FRED API',
            details: error.message
        });
    }
});

// Rota para proxy da API GNews
app.get('/api/gnews/:endpoint(*)', async (req, res) => {
    try {
        const { endpoint } = req.params;
        const queryParams = req.query;

        console.log('GNews API request received:', { endpoint, queryParams });

        // Adicionar a chave de API se não estiver presente
        if (!queryParams.apikey && !queryParams.token) {
            queryParams.apikey = '4e4869808f12183074b165f43ef3de7f'; // Chave para GNews API
            console.log('Added GNews API key to request');
        }

        // Construir URL para a API GNews
        const url = `https://gnews.io/api/v4/${endpoint}`;
        console.log(`Proxying GNews API request to: ${url}`);
        console.log('Query params:', queryParams);

        // Fazer a chamada à API
        try {
            console.log('Making request to GNews API...');
            const response = await axios.get(url, { params: queryParams });
            console.log('GNews API response received, status:', response.status);

            // Verificar se a resposta contém dados válidos
            if (response.data && response.data.articles) {
                console.log(`GNews API returned ${response.data.articles.length} articles`);
            } else {
                console.warn('GNews API response does not contain articles:', response.data);
            }

            // Retornar os dados para o cliente
            res.json(response.data);
        } catch (apiError) {
            console.error('Error calling GNews API:', apiError.message);
            if (apiError.response) {
                console.error('Response status:', apiError.response.status);
                console.error('Response data:', apiError.response.data);
            }
            throw apiError;
        }
    } catch (error) {
        console.error('Error proxying GNews API request:', error.message);
        res.status(error.response?.status || 500).json({
            error: 'Failed to fetch data from GNews API',
            details: error.message
        });
    }
});

// Atualizar a rota para proxy da API CoinGecko para usar a API real em vez de dados simulados
app.get('/api/coingecko/:endpoint(*)', async (req, res) => {
    try {
        const { endpoint } = req.params;
        const queryParams = req.query;

        // Construir URL para a API CoinGecko
        const url = `https://api.coingecko.com/api/v3/${endpoint}`;
        console.log(`Proxying CoinGecko API request to: ${url}`);

        // Fazer a chamada à API
        const response = await axios.get(url, { params: queryParams });

        // Retornar os dados para o cliente
        res.json(response.data);
    } catch (error) {
        console.error('Error proxying CoinGecko API request:', error.message);

        // Se a API retornar erro 429 (Too Many Requests), retornar dados simulados
        if (error.response && error.response.status === 429) {
            console.log('CoinGecko API rate limit exceeded - returning simulated data');

            // Retornar dados simulados em vez de chamar a API
            if (endpoint.includes('coins/markets')) {
                // Dados simulados para criptomoedas
                const simulatedData = [
                    {
                        id: 'bitcoin',
                        symbol: 'btc',
                        name: 'Bitcoin',
                        image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
                        current_price: 63715.17 + (Math.random() * 2000 - 1000),
                        market_cap: 1248275802934,
                        market_cap_rank: 1,
                        total_volume: 25392532591,
                        price_change_24h: 2215.17,
                        price_change_percentage_24h: 3.48,
                        sparkline_in_7d: { price: generateRandomPrices(24, 60000, 65000) }
                    },
                    {
                        id: 'ethereum',
                        symbol: 'eth',
                        name: 'Ethereum',
                        image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
                        current_price: 3117.08 + (Math.random() * 200 - 100),
                        market_cap: 374259723649,
                        market_cap_rank: 2,
                        total_volume: 15987654321,
                        price_change_24h: 38.17,
                        price_change_percentage_24h: 1.23,
                        sparkline_in_7d: { price: generateRandomPrices(24, 3000, 3200) }
                    }
                ];

                return res.json(simulatedData);
            } else {
                // Dados genéricos para outras chamadas
                return res.json({ status: 'success', message: 'Simulated data', data: [] });
            }
        }

        res.status(error.response?.status || 500).json({
            error: 'Failed to fetch data from CoinGecko API',
            details: error.message
        });
    }
});

// Rota padrão para servir o index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard', 'index.html'));
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
    console.log(`Dashboard available at http://localhost:${PORT}`);
});
