/**
 * Simple Express server to handle Pluggy API requests
 */
const express = require('express');
const cors = require('cors');
const path = require('path');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dashboard')));

// Mock Pluggy API data
const mockData = {
    // Mock connect token
    connectToken: {
        accessToken: 'mock-connect-token-' + Date.now(),
        expiresIn: 900
    },
    
    // Mock accounts
    accounts: {
        results: [
            {
                id: 'mock-account-1',
                name: 'Conta Corrente',
                type: 'CHECKING',
                number: '12345-6',
                balance: 1250.75,
                currency: 'BRL',
                institution: {
                    name: 'Banco Demo',
                    type: 'PERSONAL_BANK'
                }
            },
            {
                id: 'mock-account-2',
                name: 'Conta Poupança',
                type: 'SAVINGS',
                number: '12345-7',
                balance: 5430.20,
                currency: 'BRL',
                institution: {
                    name: 'Banco Demo',
                    type: 'PERSONAL_BANK'
                }
            },
            {
                id: 'mock-account-3',
                name: 'Cartão de Crédito',
                type: 'CREDIT',
                number: '****-****-****-1234',
                balance: -750.30,
                currency: 'BRL',
                institution: {
                    name: 'Banco Demo',
                    type: 'PERSONAL_BANK'
                }
            },
            {
                id: 'mock-account-4',
                name: 'Investimentos',
                type: 'INVESTMENT',
                number: '12345-8',
                balance: 10250.45,
                currency: 'BRL',
                institution: {
                    name: 'Banco Demo',
                    type: 'INVESTMENT'
                }
            }
        ]
    },
    
    // Mock transactions
    transactions: {
        results: [
            {
                id: 'mock-tx-1',
                description: 'Supermercado Extra',
                amount: -156.78,
                date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
                category: 'Alimentação'
            },
            {
                id: 'mock-tx-2',
                description: 'Transferência recebida',
                amount: 1200.00,
                date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
                category: 'Transferência'
            },
            {
                id: 'mock-tx-3',
                description: 'Netflix',
                amount: -39.90,
                date: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
                category: 'Entretenimento'
            },
            {
                id: 'mock-tx-4',
                description: 'Farmácia',
                amount: -85.60,
                date: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
                category: 'Saúde'
            }
        ]
    },
    
    // Mock investments
    investments: {
        results: [
            {
                id: 'mock-inv-1',
                name: 'CDB Banco Demo',
                type: 'FIXED_INCOME',
                balance: 5000.00,
                amount: 5000.00,
                date: new Date(Date.now() - 2592000000).toISOString(), // 30 days ago
                performance: 0.08
            },
            {
                id: 'mock-inv-2',
                name: 'Tesouro Direto',
                type: 'GOVERNMENT_BOND',
                balance: 3500.45,
                amount: 3000.00,
                date: new Date(Date.now() - 5184000000).toISOString(), // 60 days ago
                performance: 0.12
            },
            {
                id: 'mock-inv-3',
                name: 'Fundo de Ações',
                type: 'EQUITY',
                balance: 1750.00,
                amount: 2000.00,
                date: new Date(Date.now() - 7776000000).toISOString(), // 90 days ago
                performance: -0.05
            }
        ]
    }
};

// API Routes

// Get connect token
app.get('/api/pluggy/connect-token', (req, res) => {
    // Simulate API delay
    setTimeout(() => {
        res.json(mockData.connectToken);
    }, 500);
});

// Get accounts
app.get('/api/pluggy/accounts', (req, res) => {
    // Simulate API delay
    setTimeout(() => {
        // Add some randomness to balances to simulate changes
        const accounts = JSON.parse(JSON.stringify(mockData.accounts));
        accounts.results.forEach(account => {
            account.balance += (Math.random() * 100 - 50);
        });
        res.json(accounts);
    }, 800);
});

// Get transactions
app.get('/api/pluggy/transactions', (req, res) => {
    const { accountId } = req.query;
    
    if (!accountId) {
        return res.status(400).json({ error: 'Account ID is required' });
    }
    
    // Simulate API delay
    setTimeout(() => {
        res.json(mockData.transactions);
    }, 600);
});

// Get investments
app.get('/api/pluggy/investments', (req, res) => {
    const { accountId } = req.query;
    
    if (!accountId) {
        return res.status(400).json({ error: 'Account ID is required' });
    }
    
    // Simulate API delay
    setTimeout(() => {
        res.json(mockData.investments);
    }, 700);
});

// Delete item (disconnect)
app.delete('/api/pluggy/items/:itemId', (req, res) => {
    // Simulate API delay
    setTimeout(() => {
        res.json({ success: true, message: 'Item disconnected successfully' });
    }, 500);
});

// Catch-all route to serve the frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
});
