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

                // If we received a mock token, use mock connection instead
                if (connectToken.startsWith('mock-')) {
                    console.log('Received mock token, using mock connection');
                    this.createMockConnection();
                    return;
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

    // For backward compatibility, keep the old method name but use the new implementation
    createMockConnection() {
        return this.createConnection();
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

    // Fetch investments for an account
    async fetchInvestments(accountId) {
        try {
            if (!accountId) {
                console.error('No account ID provided');
                return { results: [] };
            }

            // Build the URL for fetching investments
            const url = `${this.config.investmentsEndpoint}?accountId=${accountId}`;
            console.log('Fetching investments from:', url);

            const response = await fetch(url);

            if (!response.ok && response.status !== 404) {
                throw new Error(`Failed to fetch investments: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Fetched investments:', data);

            // Check if this is mock data
            if (data.isMock) {
                console.warn('Received mock investments data from server');
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
    }
};

// Export the PluggyManager for global use
window.PluggyManager = PluggyManager;
