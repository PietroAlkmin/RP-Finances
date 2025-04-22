/**
 * Pluggy Manager
 * Handles integration with Pluggy API for Open Finance
 */

const PluggyManager = {
    // Configuration
    config: {
        connectTokenEndpoint: '/api/pluggy/connect-token',
        accountsEndpoint: '/api/pluggy/accounts',
        transactionsEndpoint: '/api/pluggy/transactions',
        investmentsEndpoint: '/api/pluggy/investments',
        connectWidgetUrl: 'https://cdn.pluggy.ai/pluggy-connect/v1',
        itemId: null
    },

    // Initialize the Pluggy Manager
    init() {
        console.log('Initializing Pluggy Manager...');

        // Load any saved Pluggy data from localStorage
        this.loadPluggyData();

        // Initialize the Pluggy Connect Widget script
        this.loadPluggyConnectScript();
    },

    // Load Pluggy data from localStorage
    loadPluggyData() {
        const savedData = localStorage.getItem('pluggyData');

        if (savedData) {
            const data = JSON.parse(savedData);
            this.config.itemId = data.itemId;
            console.log('Loaded Pluggy data from localStorage:', data);
        }
    },

    // Save Pluggy data to localStorage
    savePluggyData(data) {
        localStorage.setItem('pluggyData', JSON.stringify(data));
    },

    // Load the Pluggy Connect Widget script
    loadPluggyConnectScript() {
        if (document.getElementById('pluggy-connect-script')) {
            return; // Script already loaded
        }

        // Use the correct CDN URL for Pluggy Connect
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.id = 'pluggy-connect-script';
            script.src = 'https://cdn.pluggy.ai/pluggy-connect/v2.8.2/pluggy-connect.js';
            script.async = true;
            script.onload = () => {
                console.log('Pluggy Connect script loaded successfully');
                resolve();
            };
            script.onerror = (error) => {
                console.error('Failed to load Pluggy Connect script:', error);
                window.showNotification('Erro ao carregar o widget do Pluggy. Usando modo de demonstração.', 'warning');
                reject(error);
            };
            document.head.appendChild(script);
        });
    },

    // Helper method to load a script from a URL with promise support
    loadScriptFromUrl(url, id) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.id = id;
            script.src = url;
            script.async = true;

            script.onload = () => {
                console.log(`Script ${id} loaded successfully from ${url}`);
                resolve();
            };

            script.onerror = (error) => {
                console.error(`Error loading script ${id} from ${url}:`, error);
                reject(error);
            };

            document.head.appendChild(script);
        });
    },

    // Get a Connect Token from the server
    async getConnectToken() {
        try {
            // First try without mock parameter to get a real token if possible
            const url = this.config.connectTokenEndpoint;
            console.log('Requesting Connect Token from:', url);

            try {
                const response = await fetch(url);

                // If we get a 404, the API endpoint doesn't exist (we're in development mode)
                if (response.status === 404) {
                    console.warn('API endpoint not found, running in demo mode');
                    window.showNotification('Modo de demonstração: API não disponível', 'info');
                    throw new Error('Demo mode: API not available');
                }

                const data = await response.json();
                console.log('Connect Token response:', data);

                // Check if this is a mock token
                if (data.isMock) {
                    console.warn('Received mock token from server');
                    window.showNotification('Modo de demonstração ativado', 'info');
                }

                if (!response.ok && !data.accessToken) {
                    // Check if this is a demo mode error (credentials not configured)
                    if (data.demo) {
                        console.warn('Running in demo mode:', data.details);
                        window.showNotification('Modo de demonstração: Credenciais do Pluggy não configuradas', 'info');
                        throw new Error('Demo mode: ' + data.details);
                    }

                    throw new Error(`Failed to get Connect Token: ${response.status} ${response.statusText}`);
                }

                return data.accessToken;
            } catch (initialError) {
                // If the first attempt fails, try with mock=true
                console.warn('Failed to get real token, trying with mock=true', initialError);

                const mockUrl = `${this.config.connectTokenEndpoint}?mock=true`;
                console.log('Requesting mock Connect Token from:', mockUrl);

                const mockResponse = await fetch(mockUrl);
                const mockData = await mockResponse.json();

                console.log('Mock Connect Token response:', mockData);

                if (mockData.accessToken) {
                    window.showNotification('Usando token de demonstração', 'info');
                    return mockData.accessToken;
                }

                // If even the mock request fails, throw the original error
                throw initialError;
            }
        } catch (error) {
            console.error('Error getting Connect Token:', error);

            // If there's a specific error about the connect token
            if (error.message && error.message.includes('connectToken')) {
                window.showNotification('Erro com o token de conexão. Usando modo de demonstração.', 'warning');

                // Try to get a mock token as a fallback
                try {
                    const mockUrl = `${this.config.connectTokenEndpoint}?mock=true`;
                    console.log('Requesting mock Connect Token as fallback:', mockUrl);

                    const mockResponse = await fetch(mockUrl);
                    const mockData = await mockResponse.json();

                    if (mockData.accessToken) {
                        window.showNotification('Usando token de demonstração', 'info');
                        return mockData.accessToken;
                    }
                } catch (mockError) {
                    console.error('Failed to get mock token as fallback:', mockError);
                }
            }

            if (!error.message.includes('Demo mode')) {
                window.showNotification('Erro ao obter token de conexão', 'error');
            }
            throw error;
        }
    },

    // Create and open the Pluggy Connect Widget
    async openConnectWidget() {
        try {
            // Check if the Pluggy Connect script is loaded
            if (!window.PluggyConnect) {
                console.warn('Pluggy Connect script not loaded, attempting to load it now...');

                try {
                    // Try to load the script again with our improved method
                    await this.loadPluggyConnectScript();

                    // If we get here, the script loaded successfully
                    console.log('Pluggy Connect script loaded successfully on demand');

                    // Wait a moment for the script to initialize
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    if (!window.PluggyConnect) {
                        console.error('Pluggy Connect object still not available after loading script');
                        window.showNotification('Erro ao carregar o widget do Pluggy. Usando modo de demonstração.', 'warning');
                        this.createMockConnection();
                        return;
                    }
                } catch (loadError) {
                    console.error('Failed to load Pluggy Connect script on demand:', loadError);
                    window.showNotification('Erro ao carregar o widget do Pluggy. Usando modo de demonstração.', 'warning');
                    this.createMockConnection();
                    return;
                }
            }

            try {
                // Get a Connect Token
                const connectToken = await this.getConnectToken();

                // Check if this is a mock token but don't require mock=true in URL
                if (connectToken.startsWith('mock-')) {
                    console.log('Received mock token, attempting to use real connection anyway');
                    // Continue with real connection attempt, it will fall back to mock if needed
                }

                // Create the Pluggy Connect instance
                console.log('Creating Pluggy Connect instance with token:', connectToken);

                const pluggyConnectConfig = {
                    connectToken,
                    includeSandbox: true, // Enable sandbox mode for testing
                    // Include all countries, with focus on Brazil
                    countries: ['BR', 'US', 'AR', 'CO', 'MX'],
                    // Include all connector types
                    connectorTypes: [
                        'PERSONAL_BANK', 'BUSINESS_BANK', 'INVESTMENT', 'INVOICE', 'PAYMENT',
                        'DIGITAL_WALLET', 'DIGITAL_CURRENCY', 'TELECOMMUNICATION', 'INSURANCE', 'UTILITIES'
                    ],
                    // Force sandbox mode for testing
                    sandbox: true,
                    // Show all available connectors
                    showAllConnectors: true,
                    // Specific parameters for investment institutions
                    itemParameters: {
                        // Rico Investimentos specific parameters
                        // These parameters help with credential validation and MFA handling
                        '8': { // Rico Investimentos connector ID
                            forceWebView: true, // Force using web view for better authentication handling
                            webhookUrl: window.location.origin + '/api/pluggy/webhook', // Webhook for MFA notifications
                            clientUserId: 'rico-user-' + Date.now() // Unique user ID for tracking
                        }
                    },
                    onSuccess: (itemData) => {
                        console.log('Pluggy Connect success:', itemData);

                        // Save the item ID
                        this.config.itemId = itemData.item.id;

                        // Save to localStorage
                        this.savePluggyData({
                            itemId: itemData.item.id,
                            connectorId: itemData.item.connector.id,
                            connectorName: itemData.item.connector.name,
                            createdAt: itemData.item.createdAt
                        });

                        // Fetch accounts data
                        this.fetchAccounts();

                        // Show success notification
                        window.showNotification('Conta conectada com sucesso!', 'success');
                    },
                    onError: (error) => {
                        console.error('Pluggy Connect error:', error);

                        // Enhanced error handling for credential issues
                        let errorMessage = error.message || 'Erro desconhecido';

                        // Check for specific error types
                        if (error.code === 'INVALID_CREDENTIALS') {
                            errorMessage = 'Credenciais inválidas. Por favor, verifique seu usuário e senha.';
                        } else if (error.code === 'ALREADY_LOGGED_IN') {
                            errorMessage = 'Já existe uma sessão ativa. Por favor, faça logout no site do banco e tente novamente.';
                        } else if (error.code === 'ACCOUNT_LOCKED') {
                            errorMessage = 'Conta bloqueada. Por favor, acesse o site do banco para desbloquear sua conta.';
                        } else if (error.code === 'MFA_REQUIRED') {
                            errorMessage = 'Autenticação de dois fatores necessária. Por favor, complete o processo de autenticação.';
                        } else if (error.code === 'CONNECTION_ERROR') {
                            errorMessage = 'Erro de conexão com a instituição. Por favor, tente novamente mais tarde.';
                        } else if (error.message && error.message.toLowerCase().includes('rico')) {
                            // Specific handling for Rico Investimentos
                            errorMessage = 'Erro ao conectar com Rico Investimentos. Verifique suas credenciais e tente novamente.';

                            // Log detailed information for debugging
                            console.log('Rico Investimentos connection error details:', error);
                        }

                        window.showNotification('Erro ao conectar conta: ' + errorMessage, 'error');
                    },
                    onClose: () => {
                        console.log('Pluggy Connect closed');
                    }
                };

                console.log('Pluggy Connect config:', JSON.stringify(pluggyConnectConfig, null, 2));

                const pluggyConnect = new window.PluggyConnect(pluggyConnectConfig);

                // Open the widget
                pluggyConnect.init();
            } catch (error) {
                // If this is a demo mode error, create a mock connection
                if (error.message && error.message.includes('Demo mode')) {
                    this.createMockConnection();
                } else if (error instanceof TypeError && !window.PluggyConnect) {
                    // If PluggyConnect is still not available, use mock connection
                    console.error('PluggyConnect is not available, using mock connection');
                    window.showNotification('Erro ao inicializar o widget do Pluggy. Usando modo de demonstração.', 'warning');
                    this.createMockConnection();
                } else {
                    throw error;
                }
            }

        } catch (error) {
            console.error('Error opening Pluggy Connect Widget:', error);
            if (!error.message || !error.message.includes('Demo mode')) {
                window.showNotification('Erro ao abrir o widget de conexão. Usando modo de demonstração.', 'warning');
                this.createMockConnection();
            }
        }

        // The code below would be used in a production environment
        /*
        try {
            // Check if the Pluggy Connect script is loaded
            if (!window.PluggyConnect) {
                console.warn('Pluggy Connect script not loaded, attempting to load it now...');

                try {
                    // Try to load the script again with our improved method
                    await this.loadPluggyConnectScript();

                    // If we get here, the script loaded successfully
                    console.log('Pluggy Connect script loaded successfully on demand');

                    // Wait a moment for the script to initialize
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    if (!window.PluggyConnect) {
                        console.error('Pluggy Connect object still not available after loading script');
                        window.showNotification('Erro ao carregar o widget do Pluggy. Usando modo de demonstração.', 'warning');
                        this.createMockConnection();
                        return;
                    }
                } catch (loadError) {
                    console.error('Failed to load Pluggy Connect script on demand:', loadError);
                    window.showNotification('Erro ao carregar o widget do Pluggy. Usando modo de demonstração.', 'warning');
                    this.createMockConnection();
                    return;
                }
            }

            try {
                // Get a Connect Token
                const connectToken = await this.getConnectToken();

                // Create the Pluggy Connect instance
                console.log('Creating Pluggy Connect instance with token:', connectToken);

                const pluggyConnectConfig = {
                    connectToken,
                    includeSandbox: true, // Enable sandbox mode for testing
                    // Include all countries, with focus on Brazil
                    countries: ['BR', 'US', 'AR', 'CO', 'MX'],
                    // Include all connector types
                    connectorTypes: [
                        'PERSONAL_BANK', 'BUSINESS_BANK', 'INVESTMENT', 'INVOICE', 'PAYMENT',
                        'DIGITAL_WALLET', 'DIGITAL_CURRENCY', 'TELECOMMUNICATION', 'INSURANCE', 'UTILITIES'
                    ],
                    // Force sandbox mode for testing
                    sandbox: true,
                    // Show all available connectors
                    showAllConnectors: true,
                    onSuccess: (itemData) => {
                        console.log('Pluggy Connect success:', itemData);

                        // Save the item ID
                        this.config.itemId = itemData.item.id;

                        // Save to localStorage
                        this.savePluggyData({
                            itemId: itemData.item.id,
                            connectorId: itemData.item.connector.id,
                            connectorName: itemData.item.connector.name,
                            createdAt: itemData.item.createdAt
                        });

                        // Fetch accounts data
                        this.fetchAccounts();

                        // Show success notification
                        window.showNotification('Conta conectada com sucesso!', 'success');
                    },
                    onError: (error) => {
                        console.error('Pluggy Connect error:', error);
                        window.showNotification('Erro ao conectar conta: ' + error.message, 'error');
                    },
                    onClose: () => {
                        console.log('Pluggy Connect closed');
                    }
                };

                console.log('Pluggy Connect config:', JSON.stringify(pluggyConnectConfig, null, 2));

                const pluggyConnect = new window.PluggyConnect(pluggyConnectConfig);

                // Open the widget
                pluggyConnect.init();
            } catch (error) {
                // If this is a demo mode error, create a mock connection
                if (error.message && error.message.includes('Demo mode')) {
                    this.createMockConnection();
                } else if (error instanceof TypeError && !window.PluggyConnect) {
                    // If PluggyConnect is still not available, use mock connection
                    console.error('PluggyConnect is not available, using mock connection');
                    window.showNotification('Erro ao inicializar o widget do Pluggy. Usando modo de demonstração.', 'warning');
                    this.createMockConnection();
                } else {
                    throw error;
                }
            }

        } catch (error) {
            console.error('Error opening Pluggy Connect Widget:', error);
            if (!error.message || !error.message.includes('Demo mode')) {
                window.showNotification('Erro ao abrir o widget de conexão. Usando modo de demonstração.', 'warning');
                this.createMockConnection();
            }
        }
        */
    },

    // Create a connection using the Pluggy API
    async createConnection() {
        console.log('Creating connection to bank');

        try {
            // Get a Connect Token
            const connectToken = await this.getConnectToken();

            if (!connectToken) {
                throw new Error('Failed to get connect token');
            }

            // Create the Pluggy Connect instance
            console.log('Creating Pluggy Connect instance with token');

            const pluggyConnectConfig = {
                connectToken,
                includeSandbox: true, // Enable sandbox mode for testing
                // Include all countries, with focus on Brazil
                countries: ['BR', 'US', 'AR', 'CO', 'MX'],
                // Include all connector types
                connectorTypes: [
                    'PERSONAL_BANK', 'BUSINESS_BANK', 'INVESTMENT', 'INVOICE', 'PAYMENT',
                    'DIGITAL_WALLET', 'DIGITAL_CURRENCY', 'TELECOMMUNICATION', 'INSURANCE', 'UTILITIES'
                ],
                // Force sandbox mode for testing
                sandbox: true,
                // Show all available connectors
                showAllConnectors: true,
                onSuccess: (itemData) => {
                    console.log('Pluggy Connect success:', itemData);

                    // Save the item ID
                    this.config.itemId = itemData.item.id;

                    // Save to localStorage
                    this.savePluggyData({
                        itemId: itemData.item.id,
                        connectorId: itemData.item.connector.id,
                        connectorName: itemData.item.connector.name,
                        createdAt: itemData.item.createdAt
                    });

                    // Show success notification
                    window.showNotification('Conta conectada com sucesso!', 'success');

                    // Update the UI to show connected state
                    if (window.portfolioManager) {
                        window.portfolioManager.renderOpenFinanceSection();
                    }

                    // Fetch accounts data
                    this.fetchAccounts().catch(error => {
                        console.error('Error fetching accounts after connection:', error);
                        window.showNotification('Erro ao buscar contas. Por favor, tente novamente.', 'error');
                    });
                },
                onError: (error) => {
                    console.error('Pluggy Connect error:', error);
                    window.showNotification('Erro ao conectar conta: ' + error.message, 'error');
                },
                onClose: () => {
                    console.log('Pluggy Connect closed');
                }
            };

            console.log('Pluggy Connect config:', JSON.stringify(pluggyConnectConfig, null, 2));

            const pluggyConnect = new window.PluggyConnect(pluggyConnectConfig);

            // Open the widget
            pluggyConnect.init();

            return true;
        } catch (error) {
            console.error('Error creating connection:', error);
            window.showNotification('Erro ao conectar com o banco. Por favor, tente novamente.', 'error');
            return false;
        }
    },

    // Create a mock connection for demo purposes
    createMockConnection() {
        console.log('Creating mock investment connection');

        // Generate a mock item ID
        const mockItemId = 'mock-item-' + Date.now();

        // Save the mock item ID
        this.config.itemId = mockItemId;

        // Save to localStorage
        this.savePluggyData({
            itemId: mockItemId,
            connectorId: 'mock-connector',
            connectorName: 'Plataforma de Investimentos (Demo)',
            createdAt: new Date().toISOString()
        });

        // Show success notification
        window.showNotification('Plataforma de Investimentos (Demo) conectada com sucesso!', 'success');

        // Update the UI to show connected state
        if (window.portfolioManager) {
            window.portfolioManager.renderOpenFinanceSection();
        }

        // Fetch mock accounts data
        setTimeout(() => {
            this.fetchAccounts()
                .then(accountsData => {
                    console.log('Mock accounts fetched:', accountsData);

                    // Find the investment account
                    const investmentAccount = accountsData.results?.find(acc => acc.type === 'INVESTMENT');

                    if (investmentAccount) {
                        console.log('Found mock investment account, auto-importing investments:', investmentAccount.id);

                        // Automatically import investments to portfolio
                        if (window.portfolioManager) {
                            // Wait a moment for the UI to update before importing
                            setTimeout(() => {
                                window.portfolioManager.importInvestmentsToPortfolio(investmentAccount.id);
                            }, 1500);
                        }
                    }
                })
                .catch(error => {
                    console.error('Error fetching mock accounts:', error);
                });
        }, 1000);

        return true;
    },

    // Flag to prevent multiple simultaneous account fetches
    _isFetchingAccounts: false,

    // Fetch accounts from the connected item
    async fetchAccounts() {
        // Use a flag to prevent multiple simultaneous fetches
        if (this._isFetchingAccounts) {
            console.log('Already fetching accounts, skipping duplicate request');
            return Promise.resolve({ results: [], isFetchingInProgress: true });
        }

        return new Promise(async (resolve, reject) => {
            try {
                // Set the fetching flag
                this._isFetchingAccounts = true;

                if (!this.config.itemId) {
                    console.error('No item ID available');
                    this._isFetchingAccounts = false;
                    reject(new Error('No item ID available'));
                    return;
                }

                // Build the URL for fetching accounts
                const url = `${this.config.accountsEndpoint}?itemId=${this.config.itemId}`;
                console.log('Fetching accounts from:', url);

                const response = await fetch(url);

                if (!response.ok && response.status !== 404) {
                    throw new Error(`Failed to fetch accounts: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();
                console.log('Fetched accounts:', data);

                // Check if this is mock data
                if (data.isMock) {
                    console.warn('Received mock accounts data from server');
                }

                // Dispatch an event to notify that accounts have been fetched
                const event = new CustomEvent('pluggy:accounts-fetched', { detail: data });
                document.dispatchEvent(event);

                // Clear the fetching flag
                this._isFetchingAccounts = false;
                resolve(data);
            } catch (error) {
                console.error('Error fetching accounts:', error);
                window.showNotification('Erro ao buscar contas. Por favor, tente novamente.', 'error');

                // Dispatch a connection error event
                const errorEvent = new CustomEvent('pluggy:connection-error', {
                    detail: { error: error.message }
                });
                document.dispatchEvent(errorEvent);

                // Clear the fetching flag
                this._isFetchingAccounts = false;

                // Reject the promise to indicate failure
                reject(error);
            }
        });
    },

    // Fetch transactions for an account
    async fetchTransactions(accountId, options = {}) {
        try {
            if (!accountId) {
                console.error('No account ID provided');
                return { results: [] };
            }

            // Build query parameters
            const queryParams = new URLSearchParams({
                accountId,
                ...options
            });

            const url = `${this.config.transactionsEndpoint}?${queryParams}`;
            console.log('Fetching transactions from:', url);

            const response = await fetch(url);

            if (!response.ok && response.status !== 404) {
                throw new Error(`Failed to fetch transactions: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Fetched transactions:', data);

            // Check if this is mock data
            if (data.isMock) {
                console.warn('Received mock transactions data from server');
            }

            return data;
        } catch (error) {
            console.error('Error fetching transactions:', error);
            window.showNotification('Erro ao buscar transações', 'error');

            // Return fallback mock transactions
            return {
                results: [
                    {
                        id: 'mock-tx-1',
                        description: 'Supermercado (Fallback)',
                        amount: -156.78,
                        date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
                        category: 'Alimentação'
                    },
                    {
                        id: 'mock-tx-2',
                        description: 'Transferência (Fallback)',
                        amount: 1200.00,
                        date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
                        category: 'Transferência'
                    }
                ],
                isMock: true,
                error: error.message
            };
        }
    },

    // Fetch investments for an account or item
    async fetchInvestments(accountId) {
        try {
            // If no account ID is provided, try to use the item ID
            if (!accountId && this.config.itemId) {
                console.log('No account ID provided, using item ID instead:', this.config.itemId);

                // Try to fetch investments directly from the item
                const itemUrl = `${this.config.investmentsEndpoint}?itemId=${this.config.itemId}`;
                console.log('Fetching investments directly from item:', itemUrl);

                try {
                    const itemResponse = await fetch(itemUrl);
                    if (itemResponse.ok) {
                        const itemData = await itemResponse.json();
                        console.log('Fetched investments directly from item:', itemData);
                        return itemData;
                    }
                } catch (itemError) {
                    console.error('Error fetching investments from item:', itemError);
                }
            }

            if (!accountId) {
                console.error('No account ID or item ID available');
                return { results: [] };
            }

            // Build the URL for fetching investments by account ID
            const url = `${this.config.investmentsEndpoint}?accountId=${accountId}`;
            console.log('Fetching investments from account:', url);

            const response = await fetch(url);

            if (!response.ok && response.status !== 404) {
                throw new Error(`Failed to fetch investments: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Fetched investments from account:', data);

            // Check if this is mock data
            if (data.isMock) {
                console.warn('Received mock investments data from server');
            }

            // If we got an empty array but this is a known investment account,
            // try to fetch investments directly from the item as a fallback
            if ((!data.results || data.results.length === 0) && this.config.itemId) {
                console.log('No investments found for account, trying to fetch from item as fallback');

                // Try to fetch investments directly from the item
                const itemUrl = `${this.config.investmentsEndpoint}?itemId=${this.config.itemId}`;
                console.log('Fetching investments from item (fallback):', itemUrl);

                try {
                    const itemResponse = await fetch(itemUrl);
                    if (itemResponse.ok) {
                        const itemData = await itemResponse.json();
                        console.log('Fetched investments from item (fallback):', itemData);
                        return itemData;
                    }
                } catch (fallbackError) {
                    console.error('Error fetching investments from item (fallback):', fallbackError);
                }
            }

            return data;
        } catch (error) {
            console.error('Error fetching investments:', error);
            window.showNotification('Erro ao buscar investimentos', 'error');

            // Return fallback mock investments
            return {
                results: [
                    {
                        id: 'mock-inv-1',
                        name: 'CDB (Fallback)',
                        type: 'FIXED_INCOME',
                        balance: 5000.00,
                        amount: 5000.00,
                        date: new Date(Date.now() - 2592000000).toISOString(), // 30 days ago
                        performance: 0.08
                    }
                ],
                isMock: true,
                error: error.message
            };
        }
    },

    // Disconnect a connected item
    async disconnectItem() {
        try {
            if (!this.config.itemId) {
                console.error('No item ID available');
                return false;
            }

            // Build the URL for disconnecting the item
            const url = `/api/pluggy/items/${this.config.itemId}`;
            console.log('Disconnecting item:', url);

            const response = await fetch(url, {
                method: 'DELETE'
            });

            // Even if we get an error, we'll still disconnect the item locally
            if (!response.ok && response.status !== 404) {
                console.warn(`Warning: Failed to disconnect item on server: ${response.status} ${response.statusText}`);
            }

            try {
                const data = await response.json();
                console.log('Disconnect response:', data);

                // Check if this is mock data
                if (data.isMock) {
                    console.warn('Received mock disconnect response from server');
                }
            } catch (e) {
                console.warn('Could not parse disconnect response');
            }

            // Clear the item ID
            this.config.itemId = null;

            // Clear from localStorage
            localStorage.removeItem('pluggyData');

            // Show success notification
            window.showNotification('Conta desconectada com sucesso!', 'success');

            // Dispatch an event to notify that the item has been disconnected
            const event = new CustomEvent('pluggy:item-disconnected');
            document.dispatchEvent(event);

            return true;
        } catch (error) {
            console.error('Error disconnecting item:', error);
            window.showNotification('Erro ao desconectar conta', 'error');

            // Even if we get an error, we'll still disconnect the item locally
            // Clear the item ID
            this.config.itemId = null;

            // Clear from localStorage
            localStorage.removeItem('pluggyData');

            // Dispatch an event to notify that the item has been disconnected
            const event = new CustomEvent('pluggy:item-disconnected');
            document.dispatchEvent(event);

            return true; // Return true anyway to avoid breaking the UI
        }
    },

    // Check if an item is connected
    isItemConnected() {
        return !!this.config.itemId;
    },

    // Connect to investment platforms (including Rico Investimentos)
    async connectToRico() {
        try {
            console.log('Attempting to connect to investment platforms...');

            // Get a Connect Token
            const connectToken = await this.getConnectToken();

            if (!connectToken) {
                throw new Error('Failed to get connect token');
            }

            // Check if this is a mock token but don't require mock=true in URL
            if (connectToken.startsWith('mock-')) {
                console.log('Received mock token, attempting to use real connection anyway');
                // Continue with real connection attempt, it will fall back to mock if needed
            }

            // Create the Pluggy Connect instance for investment platforms
            console.log('Creating Pluggy Connect instance for investments with token');

            const pluggyConnectConfig = {
                connectToken,
                includeSandbox: true, // Enable sandbox mode for testing
                // Only include Brazil
                countries: ['BR'],
                // Only include investment connector type
                connectorTypes: ['INVESTMENT'],
                // Enable sandbox mode for testing
                sandbox: true,
                // Show all investment connectors
                showAllConnectors: true,
                // Specific parameters for better connection
                parameters: {
                    forceWebView: true, // Force using web view for better authentication
                    clientUserId: 'investment-user-' + Date.now(), // Unique user ID for tracking
                    // Additional parameters that might help with connection
                    redirectUrl: window.location.origin + '/dashboard/portfolio.html',
                    userAction: 'CONNECT'
                },
                onSuccess: (itemData) => {
                    console.log('Investment platform connection success:', itemData);

                    // Save the item ID
                    this.config.itemId = itemData.item.id;

                    // Get the connector name
                    const connectorName = itemData.item.connector.name || 'Plataforma de Investimentos';

                    // Save to localStorage
                    this.savePluggyData({
                        itemId: itemData.item.id,
                        connectorId: itemData.item.connector.id,
                        connectorName: connectorName,
                        createdAt: itemData.item.createdAt
                    });

                    // Show success notification
                    window.showNotification(`${connectorName} conectado com sucesso!`, 'success');

                    // Update the UI to show connected state
                    if (window.portfolioManager) {
                        window.portfolioManager.renderOpenFinanceSection();
                    }

                    // Fetch accounts data
                    this.fetchAccounts()
                        .then(accountsData => {
                            console.log('Accounts fetched after investment connection:', accountsData);

                            // Find the investment account
                            const investmentAccount = accountsData.results?.find(acc => acc.type === 'INVESTMENT');

                            if (investmentAccount) {
                                console.log('Found investment account, auto-importing investments:', investmentAccount.id);

                                // Automatically import investments to portfolio
                                if (window.portfolioManager) {
                                    // Wait a moment for the UI to update before importing
                                    setTimeout(() => {
                                        window.portfolioManager.importInvestmentsToPortfolio(investmentAccount.id);
                                    }, 1500);
                                }
                            } else {
                                console.log('No investment account found, trying to fetch investments directly from item');

                                // Try to fetch investments directly from the item
                                this.fetchInvestments()
                                    .then(investmentsData => {
                                        console.log('Fetched investments directly from item:', investmentsData);

                                        if (investmentsData.results && investmentsData.results.length > 0) {
                                            console.log('Found investments directly from item, importing them');
                                            // We have investments, import them
                                            if (window.portfolioManager && window.portfolioManager.importInvestmentsFromData) {
                                                window.portfolioManager.importInvestmentsFromData(investmentsData);
                                            } else {
                                                console.error('portfolioManager or importInvestmentsFromData method not available');
                                            }
                                        } else {
                                            console.log('No investments found directly from item');
                                        }
                                    })
                                    .catch(error => {
                                        console.error('Error fetching investments directly:', error);
                                    });
                            }
                        })
                        .catch(error => {
                            console.error('Error fetching accounts after investment connection:', error);
                            window.showNotification('Erro ao buscar contas. Por favor, tente novamente.', 'error');

                            // Even if we can't fetch accounts, try to fetch investments directly
                            console.log('Trying to fetch investments directly after account fetch error');
                            this.fetchInvestments()
                                .then(investmentsData => {
                                    if (investmentsData.results && investmentsData.results.length > 0) {
                                        console.log('Found investments directly after error, importing them');
                                        if (window.portfolioManager && window.portfolioManager.importInvestmentsFromData) {
                                            window.portfolioManager.importInvestmentsFromData(investmentsData);
                                        }
                                    }
                                })
                                .catch(invError => {
                                    console.error('Error fetching investments after account fetch error:', invError);
                                });
                        });
                },
                onError: (error) => {
                    console.error('Investment platform connection error:', error);

                    // Enhanced error handling for credential issues
                    let errorMessage = error.message || 'Erro desconhecido';

                    // Check for specific error types
                    if (error.code === 'INVALID_CREDENTIALS') {
                        errorMessage = 'Credenciais inválidas. Por favor, verifique seu CPF/CNPJ e senha.';
                    } else if (error.code === 'ALREADY_LOGGED_IN') {
                        errorMessage = 'Já existe uma sessão ativa. Por favor, faça logout no site da instituição e tente novamente.';
                    } else if (error.code === 'ACCOUNT_LOCKED') {
                        errorMessage = 'Conta bloqueada. Por favor, acesse o site da instituição para desbloquear sua conta.';
                    } else if (error.code === 'MFA_REQUIRED') {
                        errorMessage = 'Autenticação de dois fatores necessária. Por favor, complete o processo de autenticação.';
                    } else if (error.code === 'CONNECTOR_ERROR') {
                        errorMessage = 'Erro no conector da instituição financeira. Por favor, tente novamente mais tarde ou escolha outra instituição.';
                    }

                    window.showNotification('Erro ao conectar: ' + errorMessage, 'error');
                },
                onClose: () => {
                    console.log('Investment platform connection widget closed');
                }
            };

            console.log('Investment Connect config:', JSON.stringify(pluggyConnectConfig, null, 2));

            const pluggyConnect = new window.PluggyConnect(pluggyConnectConfig);

            // Open the widget
            pluggyConnect.init();

            return true;
        } catch (error) {
            console.error('Error creating investment platform connection:', error);
            window.showNotification('Erro ao conectar com a plataforma de investimentos. Por favor, tente novamente.', 'error');
            return false;
        }
    },

    // Refresh the connection
    async refreshConnection() {
        try {
            if (!this.config.itemId) {
                console.error('No item ID available to refresh');
                window.showNotification('Nenhuma conta conectada para atualizar', 'warning');
                return false;
            }

            // Build the URL for refreshing the item
            const url = `/api/pluggy/items/${this.config.itemId}/refresh`;
            console.log('Refreshing item connection:', url);

            // Show notification that we're refreshing
            window.showNotification('Atualizando conexão...', 'info');

            const response = await fetch(url, {
                method: 'POST'
            });

            if (!response.ok && response.status !== 404) {
                throw new Error(`Failed to refresh item: ${response.status} ${response.statusText}`);
            }

            try {
                const data = await response.json();
                console.log('Refresh response:', data);

                // Check if this is mock data
                if (data.isMock) {
                    console.warn('Received mock refresh response from server');
                }

                // Show success notification
                window.showNotification('Conexão atualizada com sucesso!', 'success');

                // Fetch accounts to update the UI
                this.fetchAccounts();

                return true;
            } catch (e) {
                console.warn('Could not parse refresh response');

                // Still try to fetch accounts
                this.fetchAccounts();

                return true;
            }
        } catch (error) {
            console.error('Error refreshing connection:', error);
            window.showNotification('Erro ao atualizar conexão', 'error');

            // Try to fetch accounts anyway
            try {
                await this.fetchAccounts();
            } catch (fetchError) {
                console.error('Error fetching accounts after refresh error:', fetchError);
            }

            return false;
        }
    }
};

// Export the PluggyManager for global use
window.PluggyManager = PluggyManager;
