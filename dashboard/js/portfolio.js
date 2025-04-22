/**
 * Portfolio Manager
 * Handles user portfolio data and interactions
 */

class PortfolioManager {
    constructor() {
        this.portfolio = {
            assets: [],
            lastUpdated: null
        };
        this.currentAssetId = null;
        this.mockPrices = {}; // For simulating current prices

        // Initialize
        this.init();
    }

    /**
     * Initialize the portfolio manager
     */
    init() {
        // Make the portfolio manager globally accessible
        window.portfolioManager = this;
        console.log('Portfolio manager initialized and made globally accessible');

        // Load portfolio data
        this.loadPortfolio();

        // Set up event listeners
        this.setupEventListeners();

        // Generate mock current prices for demo
        this.generateMockPrices();

        // Render the portfolio
        this.renderPortfolio();

        // Initialize Pluggy Manager
        if (window.PluggyManager) {
            window.PluggyManager.init();
            this.setupPluggyEventListeners();
            this.renderOpenFinanceSection();
        }

        // Hide loading indicator
        document.getElementById('loading-indicator').classList.add('hidden');

        // Update date
        this.updateDate();
    }

    /**
     * Set up event listeners for portfolio interactions
     */
    setupEventListeners() {
        // Add asset button
        const addAssetBtn = document.getElementById('add-asset-btn');
        if (addAssetBtn) {
            addAssetBtn.addEventListener('click', () => this.showAssetModal());
        }

        // Empty state add button
        const emptyAddBtn = document.getElementById('empty-add-btn');
        if (emptyAddBtn) {
            emptyAddBtn.addEventListener('click', () => this.showAssetModal());
        }

        // Connect bank button
        const connectBankBtn = document.getElementById('connect-bank-btn');
        if (connectBankBtn) {
            connectBankBtn.addEventListener('click', () => this.connectBank());
        }

        // Add Rico Investments button to the portfolio section
        const portfolioHeader = document.querySelector('.section-header');
        if (portfolioHeader) {
            const ricoButton = document.createElement('button');
            ricoButton.type = 'button';
            ricoButton.className = 'btn btn-outline-primary';
            ricoButton.id = 'connect-rico-portfolio-btn';
            ricoButton.innerHTML = '<i class="fas fa-chart-line"></i> Importar Investimentos';
            ricoButton.style.marginRight = '10px';

            // Insert before the add asset button
            const addButton = portfolioHeader.querySelector('#add-asset-btn');
            if (addButton) {
                portfolioHeader.insertBefore(ricoButton, addButton);
            } else {
                portfolioHeader.appendChild(ricoButton);
            }

            // Add event listener
            ricoButton.addEventListener('click', () => this.connectToRico());
        }

        // Empty connect button
        const emptyConnectBtn = document.getElementById('empty-connect-btn');
        if (emptyConnectBtn) {
            emptyConnectBtn.addEventListener('click', () => this.connectBank());
        }

        // Connect Rico Investimentos button
        const connectRicoBtn = document.getElementById('connect-rico-btn');
        if (connectRicoBtn) {
            connectRicoBtn.addEventListener('click', () => this.connectToRico());
        }

        // Refresh Open Finance button
        const refreshOpenFinanceBtn = document.getElementById('refresh-open-finance-btn');
        if (refreshOpenFinanceBtn) {
            refreshOpenFinanceBtn.addEventListener('click', () => this.refreshOpenFinance());
        }

        // Close asset modal
        const closeAssetModal = document.getElementById('close-asset-modal');
        if (closeAssetModal) {
            closeAssetModal.addEventListener('click', () => this.hideAssetModal());
        }

        // Cancel asset button
        const cancelAssetBtn = document.getElementById('cancel-asset');
        if (cancelAssetBtn) {
            cancelAssetBtn.addEventListener('click', () => this.hideAssetModal());
        }

        // Save asset button
        const saveAssetBtn = document.getElementById('save-asset');
        if (saveAssetBtn) {
            saveAssetBtn.addEventListener('click', () => this.saveAsset());
        }

        // Close confirm delete modal
        const closeConfirmModal = document.getElementById('close-confirm-modal');
        if (closeConfirmModal) {
            closeConfirmModal.addEventListener('click', () => this.hideConfirmDeleteModal());
        }

        // Cancel delete button
        const cancelDeleteBtn = document.getElementById('cancel-delete');
        if (cancelDeleteBtn) {
            cancelDeleteBtn.addEventListener('click', () => this.hideConfirmDeleteModal());
        }

        // Confirm delete button
        const confirmDeleteBtn = document.getElementById('confirm-delete');
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', () => this.deleteAsset());
        }

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            const assetModal = document.getElementById('asset-modal');
            const confirmModal = document.getElementById('confirm-delete-modal');

            if (e.target === assetModal) {
                this.hideAssetModal();
            }

            if (e.target === confirmModal) {
                this.hideConfirmDeleteModal();
            }
        });
    }

    /**
     * Load portfolio data from localStorage
     */
    loadPortfolio() {
        const savedPortfolio = localStorage.getItem('userPortfolio');

        if (savedPortfolio) {
            this.portfolio = JSON.parse(savedPortfolio);
        } else {
            // If no portfolio exists, create a sample portfolio for demo
            this.createSamplePortfolio();
        }
    }

    /**
     * Save portfolio data to localStorage
     */
    savePortfolio() {
        this.portfolio.lastUpdated = new Date().toISOString();
        localStorage.setItem('userPortfolio', JSON.stringify(this.portfolio));
    }

    /**
     * Create a sample portfolio for demonstration
     */
    createSamplePortfolio() {
        this.portfolio = {
            assets: [
                {
                    id: this.generateId(),
                    symbol: 'PETR4',
                    name: 'Petrobras',
                    assetClass: 'stock',
                    quantity: 100,
                    purchasePrice: 28.50,
                    purchaseDate: '2023-01-15',
                    notes: 'Compra inicial para diversificação'
                },
                {
                    id: this.generateId(),
                    symbol: 'ITUB4',
                    name: 'Itaú Unibanco',
                    assetClass: 'stock',
                    quantity: 200,
                    purchasePrice: 32.75,
                    purchaseDate: '2023-02-10',
                    notes: 'Exposição ao setor bancário'
                },
                {
                    id: this.generateId(),
                    symbol: 'HGLG11',
                    name: 'CSHG Logística',
                    assetClass: 'reit',
                    quantity: 50,
                    purchasePrice: 175.20,
                    purchaseDate: '2023-03-05',
                    notes: 'FII de galpões logísticos'
                },
                {
                    id: this.generateId(),
                    symbol: 'AAPL',
                    name: 'Apple Inc.',
                    assetClass: 'international',
                    quantity: 10,
                    purchasePrice: 150.25,
                    purchaseDate: '2023-04-20',
                    notes: 'Exposição ao setor de tecnologia'
                },
                {
                    id: this.generateId(),
                    symbol: 'BTC',
                    name: 'Bitcoin',
                    assetClass: 'crypto',
                    quantity: 0.05,
                    purchasePrice: 35000.00,
                    purchaseDate: '2023-05-15',
                    notes: 'Pequena alocação em cripto'
                }
            ],
            lastUpdated: new Date().toISOString()
        };

        this.savePortfolio();
    }

    /**
     * Generate mock current prices for assets
     */
    generateMockPrices() {
        // Clear existing mock prices
        this.mockPrices = {};

        // Generate a mock price for each asset
        this.portfolio.assets.forEach(asset => {
            // Generate a random price change between -15% and +25%
            const changePercent = (Math.random() * 40) - 15;
            const currentPrice = asset.purchasePrice * (1 + (changePercent / 100));

            this.mockPrices[asset.id] = parseFloat(currentPrice.toFixed(2));
        });
    }

    /**
     * Render the portfolio data
     */
    renderPortfolio() {
        this.renderAssetTable();
        this.renderPortfolioSummary();
        this.renderAllocationChart();
        this.renderPerformanceChart();
    }

    /**
     * Render the asset table
     */
    renderAssetTable() {
        const tableBody = document.getElementById('assets-table-body');

        if (!tableBody) return;

        // Clear the table
        tableBody.innerHTML = '';

        // Check if portfolio is empty
        if (this.portfolio.assets.length === 0) {
            tableBody.innerHTML = `
                <tr class="empty-state">
                    <td colspan="8" class="empty-message">
                        <div class="empty-content">
                            <i class="fas fa-briefcase empty-icon"></i>
                            <p>Seu portfólio está vazio</p>
                            <p class="empty-description">Adicione ativos para começar a acompanhar seu desempenho</p>
                            <button type="button" class="btn btn-primary" id="empty-add-btn">
                                <i class="fas fa-plus btn-icon"></i>Adicionar Ativo
                            </button>
                        </div>
                    </td>
                </tr>
            `;

            // Re-attach event listener
            const emptyAddBtn = document.getElementById('empty-add-btn');
            if (emptyAddBtn) {
                emptyAddBtn.addEventListener('click', () => this.showAssetModal());
            }

            return;
        }

        // Add each asset to the table
        this.portfolio.assets.forEach(asset => {
            const currentPrice = this.mockPrices[asset.id] || asset.purchasePrice;
            const totalValue = currentPrice * asset.quantity;
            const changePercent = ((currentPrice - asset.purchasePrice) / asset.purchasePrice) * 100;
            const changeClass = changePercent >= 0 ? 'positive' : 'negative';
            const changeIcon = changePercent >= 0 ? 'fa-caret-up' : 'fa-caret-down';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="asset-name">${asset.name}</div>
                    <div class="asset-symbol">${asset.symbol}</div>
                </td>
                <td>
                    <span class="asset-class-badge asset-class-${asset.assetClass}">
                        ${this.getAssetClassName(asset.assetClass)}
                    </span>
                </td>
                <td>${this.formatNumber(asset.quantity)}</td>
                <td>R$ ${this.formatCurrency(asset.purchasePrice)}</td>
                <td>R$ ${this.formatCurrency(currentPrice)}</td>
                <td>R$ ${this.formatCurrency(totalValue)}</td>
                <td class="asset-change ${changeClass}">
                    <i class="fas ${changeIcon}"></i> ${Math.abs(changePercent).toFixed(2)}%
                </td>
                <td>
                    <div class="table-actions">
                        <button type="button" class="edit-asset" data-id="${asset.id}" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button type="button" class="delete-asset" data-id="${asset.id}" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;

            tableBody.appendChild(row);
        });

        // Add event listeners to edit and delete buttons
        const editButtons = document.querySelectorAll('.edit-asset');
        const deleteButtons = document.querySelectorAll('.delete-asset');

        editButtons.forEach(button => {
            button.addEventListener('click', () => {
                const assetId = button.getAttribute('data-id');
                this.editAsset(assetId);
            });
        });

        deleteButtons.forEach(button => {
            button.addEventListener('click', () => {
                const assetId = button.getAttribute('data-id');
                this.showConfirmDeleteModal(assetId);
            });
        });
    }

    /**
     * Render the portfolio summary
     */
    renderPortfolioSummary() {
        // Calculate portfolio metrics
        const metrics = this.calculatePortfolioMetrics();

        // Update the DOM
        document.getElementById('portfolio-total-value').textContent = `R$ ${this.formatCurrency(metrics.totalValue)}`;
        document.getElementById('portfolio-total-change').textContent = `${metrics.totalChangePercent >= 0 ? '+' : ''}${metrics.totalChangePercent.toFixed(2)}%`;
        document.getElementById('portfolio-total-change').className = `metric-change ${metrics.totalChangePercent >= 0 ? 'positive' : 'negative'}`;

        document.getElementById('portfolio-return').textContent = `${metrics.totalReturnPercent >= 0 ? '+' : ''}${metrics.totalReturnPercent.toFixed(2)}%`;
        document.getElementById('portfolio-return').className = `metric-value ${metrics.totalReturnPercent >= 0 ? 'positive' : 'negative'}`;

        document.getElementById('portfolio-assets-count').textContent = metrics.assetCount;
        document.getElementById('portfolio-diversification').textContent = `${metrics.diversificationIndex.toFixed(2)}%`;
    }

    /**
     * Render the allocation chart
     */
    renderAllocationChart() {
        const canvas = document.getElementById('allocation-chart');

        if (!canvas) return;

        // Calculate allocation by asset class
        const allocation = this.calculateAllocationByClass();

        // Define colors for each asset class
        const colors = {
            stock: '#3b82f6',
            reit: '#8b5cf6',
            crypto: '#f59e0b',
            etf: '#10b981',
            bond: '#6b7280',
            international: '#ec4899',
            other: '#9ca3af'
        };

        // Prepare data for chart
        const data = {
            labels: allocation.map(item => this.getAssetClassName(item.assetClass)),
            datasets: [{
                data: allocation.map(item => item.percentage),
                backgroundColor: allocation.map(item => colors[item.assetClass] || colors.other),
                borderWidth: 1,
                borderColor: '#ffffff'
            }]
        };

        // Create or update chart
        if (window.allocationChart) {
            window.allocationChart.data = data;
            window.allocationChart.update();
        } else {
            // Wait for the DOM to be fully rendered
            setTimeout(() => {
                // Ensure the canvas is visible and has dimensions
                if (canvas.offsetWidth === 0 || canvas.offsetHeight === 0) {
                    console.log('Canvas not visible yet, retrying in 200ms');
                    setTimeout(() => this.renderAllocationChart(), 200);
                    return;
                }

                window.allocationChart = new Chart(canvas, {
                    type: 'doughnut',
                    data: data,
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: {
                                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-color'),
                                    font: {
                                        size: 12
                                    },
                                    boxWidth: 15,
                                    padding: 15
                                }
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        return `${context.label}: ${context.raw.toFixed(2)}%`;
                                    }
                                }
                            }
                        }
                    }
                });
            }, 200);
        }
    }

    /**
     * Render the performance chart
     */
    renderPerformanceChart() {
        const canvas = document.getElementById('performance-chart');

        if (!canvas) return;

        // Generate mock performance data for demonstration
        const performanceData = this.generateMockPerformanceData();

        // Prepare data for chart
        const data = {
            labels: performanceData.labels,
            datasets: [{
                label: 'Valor do Portfólio',
                data: performanceData.values,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4
            }]
        };

        // Create or update chart
        if (window.performanceChart) {
            window.performanceChart.data = data;
            window.performanceChart.update();
        } else {
            // Wait for the DOM to be fully rendered
            setTimeout(() => {
                // Ensure the canvas is visible and has dimensions
                if (canvas.offsetWidth === 0 || canvas.offsetHeight === 0) {
                    console.log('Performance canvas not visible yet, retrying in 200ms');
                    setTimeout(() => this.renderPerformanceChart(), 200);
                    return;
                }

                window.performanceChart = new Chart(canvas, {
                    type: 'line',
                    data: data,
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        return `R$ ${context.raw.toFixed(2)}`;
                                    }
                                }
                            }
                        },
                        scales: {
                            x: {
                                grid: {
                                    display: false
                                },
                                ticks: {
                                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-light'),
                                    font: {
                                        size: 11
                                    },
                                    maxRotation: 0
                                }
                            },
                            y: {
                                grid: {
                                    color: 'rgba(0, 0, 0, 0.05)'
                                },
                                ticks: {
                                    callback: function(value) {
                                        return `R$ ${value.toFixed(0)}`;
                                    },
                                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-light'),
                                    font: {
                                        size: 11
                                    }
                                }
                            }
                        }
                    }
                });
            }, 200);
        }
    }

    /**
     * Show the asset modal for adding a new asset
     */
    showAssetModal(assetId = null) {
        const modal = document.getElementById('asset-modal');
        const modalTitle = document.getElementById('asset-modal-title');
        const form = document.getElementById('asset-form');

        // Reset form
        form.reset();

        // Set current asset ID
        this.currentAssetId = assetId;

        // Set default date to today
        const dateInput = document.getElementById('asset-date');
        if (!assetId && dateInput) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }

        // If editing an existing asset, populate the form
        if (assetId) {
            const asset = this.portfolio.assets.find(a => a.id === assetId);

            if (asset) {
                document.getElementById('asset-id').value = asset.id;
                document.getElementById('asset-symbol').value = asset.symbol;
                document.getElementById('asset-name').value = asset.name;
                document.getElementById('asset-class').value = asset.assetClass;
                document.getElementById('asset-quantity').value = asset.quantity;
                document.getElementById('asset-price').value = asset.purchasePrice;
                document.getElementById('asset-date').value = asset.purchaseDate;
                document.getElementById('asset-notes').value = asset.notes || '';

                modalTitle.textContent = 'Editar Ativo';
            }
        } else {
            modalTitle.textContent = 'Adicionar Ativo';
        }

        // Show modal
        modal.classList.remove('hidden');
    }

    /**
     * Hide the asset modal
     */
    hideAssetModal() {
        const modal = document.getElementById('asset-modal');
        modal.classList.add('hidden');
        this.currentAssetId = null;
    }

    /**
     * Show the confirm delete modal
     */
    showConfirmDeleteModal(assetId) {
        const modal = document.getElementById('confirm-delete-modal');
        const assetNameElement = document.getElementById('delete-asset-name');

        // Find the asset
        const asset = this.portfolio.assets.find(a => a.id === assetId);

        if (asset) {
            // Set the asset name in the modal
            assetNameElement.textContent = `${asset.name} (${asset.symbol})`;

            // Set current asset ID
            this.currentAssetId = assetId;

            // Show modal
            modal.classList.remove('hidden');
        }
    }

    /**
     * Hide the confirm delete modal
     */
    hideConfirmDeleteModal() {
        const modal = document.getElementById('confirm-delete-modal');
        modal.classList.add('hidden');
        this.currentAssetId = null;
    }

    /**
     * Save an asset (add new or update existing)
     */
    saveAsset() {
        // Get form data
        const form = document.getElementById('asset-form');
        const assetId = this.currentAssetId;
        const symbol = document.getElementById('asset-symbol').value.trim();
        const name = document.getElementById('asset-name').value.trim();
        const assetClass = document.getElementById('asset-class').value;
        const quantity = parseFloat(document.getElementById('asset-quantity').value);
        const price = parseFloat(document.getElementById('asset-price').value);
        const date = document.getElementById('asset-date').value;
        const notes = document.getElementById('asset-notes').value.trim();

        // Validate form
        if (!symbol || !name || !assetClass || isNaN(quantity) || isNaN(price) || !date) {
            window.showNotification('Por favor, preencha todos os campos obrigatórios.', 'error');
            return;
        }

        // Create asset object
        const asset = {
            id: assetId || this.generateId(),
            symbol,
            name,
            assetClass,
            quantity,
            purchasePrice: price,
            purchaseDate: date,
            notes
        };

        // Add or update asset in portfolio
        if (assetId) {
            // Update existing asset
            const index = this.portfolio.assets.findIndex(a => a.id === assetId);

            if (index !== -1) {
                this.portfolio.assets[index] = asset;
                window.showNotification('Ativo atualizado com sucesso!', 'success');
            }
        } else {
            // Add new asset
            this.portfolio.assets.push(asset);
            window.showNotification('Ativo adicionado com sucesso!', 'success');
        }

        // Save portfolio
        this.savePortfolio();

        // Generate new mock prices
        this.generateMockPrices();

        // Update UI
        this.renderPortfolio();

        // Hide modal
        this.hideAssetModal();
    }

    /**
     * Edit an existing asset
     */
    editAsset(assetId) {
        this.showAssetModal(assetId);
    }

    /**
     * Delete an asset
     */
    deleteAsset() {
        if (!this.currentAssetId) return;

        // Find the asset index
        const index = this.portfolio.assets.findIndex(a => a.id === this.currentAssetId);

        if (index !== -1) {
            // Remove the asset
            this.portfolio.assets.splice(index, 1);

            // Save portfolio
            this.savePortfolio();

            // Generate new mock prices
            this.generateMockPrices();

            // Update UI
            this.renderPortfolio();

            // Show notification
            window.showNotification('Ativo excluído com sucesso!', 'success');
        }

        // Hide modal
        this.hideConfirmDeleteModal();
    }

    /**
     * Calculate portfolio metrics
     */
    calculatePortfolioMetrics() {
        const metrics = {
            totalValue: 0,
            totalCost: 0,
            totalChangePercent: 0,
            totalReturnPercent: 0,
            assetCount: this.portfolio.assets.length,
            diversificationIndex: 0
        };

        // If portfolio is empty, return default metrics
        if (metrics.assetCount === 0) {
            return metrics;
        }

        // Calculate total value and cost
        this.portfolio.assets.forEach(asset => {
            const currentPrice = this.mockPrices[asset.id] || asset.purchasePrice;
            const totalValue = currentPrice * asset.quantity;
            const totalCost = asset.purchasePrice * asset.quantity;

            metrics.totalValue += totalValue;
            metrics.totalCost += totalCost;
        });

        // Calculate change percentages
        metrics.totalChangePercent = ((metrics.totalValue - metrics.totalCost) / metrics.totalCost) * 100;
        metrics.totalReturnPercent = metrics.totalChangePercent;

        // Calculate diversification index (based on asset class distribution)
        const classTotals = {};
        let maxClassPercentage = 0;

        this.portfolio.assets.forEach(asset => {
            const currentPrice = this.mockPrices[asset.id] || asset.purchasePrice;
            const totalValue = currentPrice * asset.quantity;

            classTotals[asset.assetClass] = (classTotals[asset.assetClass] || 0) + totalValue;
        });

        // Calculate percentage for each class
        Object.keys(classTotals).forEach(assetClass => {
            const percentage = (classTotals[assetClass] / metrics.totalValue) * 100;
            maxClassPercentage = Math.max(maxClassPercentage, percentage);
        });

        // Diversification index is inverse of max class percentage (normalized to 0-100)
        metrics.diversificationIndex = 100 - (maxClassPercentage / 100 * 100);

        return metrics;
    }

    /**
     * Calculate allocation by asset class
     */
    calculateAllocationByClass() {
        const allocation = [];
        const classTotals = {};
        let totalValue = 0;

        // Calculate total value and class totals
        this.portfolio.assets.forEach(asset => {
            const currentPrice = this.mockPrices[asset.id] || asset.purchasePrice;
            const value = currentPrice * asset.quantity;

            classTotals[asset.assetClass] = (classTotals[asset.assetClass] || 0) + value;
            totalValue += value;
        });

        // Calculate percentage for each class
        Object.keys(classTotals).forEach(assetClass => {
            const percentage = (classTotals[assetClass] / totalValue) * 100;

            allocation.push({
                assetClass,
                value: classTotals[assetClass],
                percentage
            });
        });

        // Sort by percentage (descending)
        allocation.sort((a, b) => b.percentage - a.percentage);

        return allocation;
    }

    /**
     * Generate mock performance data for the chart
     */
    generateMockPerformanceData() {
        const data = {
            labels: [],
            values: []
        };

        // Calculate total portfolio value
        const totalValue = this.portfolio.assets.reduce((total, asset) => {
            const currentPrice = this.mockPrices[asset.id] || asset.purchasePrice;
            return total + (currentPrice * asset.quantity);
        }, 0);

        // Generate data for the last 12 months
        const today = new Date();
        let currentValue = totalValue * 0.7; // Start at 70% of current value

        for (let i = 11; i >= 0; i--) {
            const date = new Date(today);
            date.setMonth(today.getMonth() - i);

            // Format date as month name
            const monthName = date.toLocaleString('pt-BR', { month: 'short' });

            // Add label and value
            data.labels.push(monthName);

            // Generate a random change between -5% and +8%
            const changePercent = (Math.random() * 13) - 5;
            currentValue = currentValue * (1 + (changePercent / 100));

            // Ensure the final value matches the current portfolio value
            if (i === 0) {
                currentValue = totalValue;
            }

            data.values.push(currentValue);
        }

        return data;
    }

    /**
     * Get the display name for an asset class
     */
    getAssetClassName(assetClass) {
        const classNames = {
            stock: 'Ações',
            reit: 'FIIs',
            crypto: 'Cripto',
            etf: 'ETFs',
            bond: 'Renda Fixa',
            international: 'Internacional',
            other: 'Outros'
        };

        return classNames[assetClass] || 'Outros';
    }

    /**
     * Generate a unique ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    /**
     * Format a number with thousand separators
     */
    formatNumber(number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    /**
     * Format a currency value
     */
    formatCurrency(value) {
        if (value === undefined || value === null) {
            return '0,00';
        }
        return value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    /**
     * Update the current date display
     */
    updateDate() {
        const dateElement = document.getElementById('current-date');

        if (dateElement) {
            const now = new Date();
            dateElement.textContent = `Atualizado em: ${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR')}`;
        }
    }

    /**
     * Set up Pluggy event listeners
     */
    setupPluggyEventListeners() {
        // Listen for account fetched events
        document.addEventListener('pluggy:accounts-fetched', (event) => {
            console.log('Accounts fetched:', event.detail);

            // Only render accounts if we have data
            if (event.detail && event.detail.results && event.detail.results.length > 0) {
                try {
                    // Directly render the accounts without triggering another fetch
                    this.renderConnectedAccounts(event.detail);
                } catch (error) {
                    console.error('Error rendering connected accounts:', error);

                    // Show an error message
                    const connectedAccounts = document.getElementById('connected-accounts');
                    if (connectedAccounts) {
                        connectedAccounts.innerHTML = `
                            <div class="empty-state">
                                <div class="empty-content">
                                    <i class="fas fa-exclamation-circle empty-icon"></i>
                                    <p>Erro ao exibir contas</p>
                                    <p class="empty-description">Ocorreu um erro ao exibir suas contas. Tente novamente mais tarde.</p>
                                    <button type="button" class="btn btn-primary" id="retry-render-btn">
                                        <i class="fas fa-sync-alt"></i> Tentar Novamente
                                    </button>
                                </div>
                            </div>
                        `;

                        // Add event listener to the retry button
                        const retryBtn = document.getElementById('retry-render-btn');
                        if (retryBtn) {
                            retryBtn.addEventListener('click', () => {
                                // Clear any stuck flags
                                if (window.PluggyManager) {
                                    window.PluggyManager._isFetchingAccounts = false;
                                }
                                // Try to render the accounts again
                                this.renderConnectedAccounts(event.detail);
                            });
                        }
                    }
                }
            } else {
                console.warn('Received empty accounts data');

                // Show a message indicating no accounts were found
                const connectedAccounts = document.getElementById('connected-accounts');
                if (connectedAccounts) {
                    connectedAccounts.innerHTML = `
                        <div class="empty-state">
                            <div class="empty-content">
                                <i class="fas fa-info-circle empty-icon"></i>
                                <p>Nenhuma conta encontrada</p>
                                <p class="empty-description">Não encontramos nenhuma conta bancária conectada.</p>
                                <button type="button" class="btn btn-primary" id="reconnect-bank-btn">
                                    <i class="fas fa-link"></i> Reconectar Banco
                                </button>
                            </div>
                        </div>
                    `;

                    // Add event listener to the reconnect button
                    const reconnectBtn = document.getElementById('reconnect-bank-btn');
                    if (reconnectBtn) {
                        reconnectBtn.addEventListener('click', () => this.connectBank());
                    }
                }
            }
        });

        // Listen for item disconnected events
        document.addEventListener('pluggy:item-disconnected', () => {
            console.log('Item disconnected');
            try {
                // Just update the UI to show the empty state without triggering a fetch
                const openFinanceContent = document.getElementById('open-finance-content');
                if (openFinanceContent) {
                    openFinanceContent.innerHTML = `
                        <div id="open-finance-empty" class="empty-accounts">
                            <i class="fas fa-university"></i>
                            <p>Nenhuma conta bancária conectada</p>
                            <p>Conecte suas contas bancárias para visualizar seus dados financeiros em um só lugar</p>
                            <button type="button" class="connect-bank-btn" id="empty-connect-btn">
                                <i class="fas fa-link"></i>Conectar Banco
                            </button>
                        </div>
                    `;

                    // Add event listener to the new button
                    const emptyConnectBtn = document.getElementById('empty-connect-btn');
                    if (emptyConnectBtn) {
                        emptyConnectBtn.addEventListener('click', () => this.connectBank());
                    }
                }
            } catch (error) {
                console.error('Error rendering Open Finance section after disconnect:', error);
                window.showNotification('Erro ao atualizar a interface. Tente recarregar a página.', 'error');
            }
        });

        // Listen for connection errors
        document.addEventListener('pluggy:connection-error', (event) => {
            console.error('Pluggy connection error:', event.detail);
            window.showNotification('Erro de conexão com o Open Finance. Tente novamente mais tarde.', 'error');

            // Update the UI to show the empty state
            const openFinanceContent = document.getElementById('open-finance-content');
            if (openFinanceContent) {
                openFinanceContent.innerHTML = `
                    <div id="open-finance-empty" class="empty-accounts">
                        <i class="fas fa-university"></i>
                        <p>Nenhuma conta bancária conectada</p>
                        <p>Conecte suas contas bancárias para visualizar seus dados financeiros em um só lugar</p>
                        <button type="button" class="connect-bank-btn" id="empty-connect-btn">
                            <i class="fas fa-link"></i>Conectar Banco
                        </button>
                    </div>
                `;

                // Add event listener to the new button
                const emptyConnectBtn = document.getElementById('empty-connect-btn');
                if (emptyConnectBtn) {
                    emptyConnectBtn.addEventListener('click', () => this.connectBank());
                }
            }

            // Clear any stuck flags
            if (window.PluggyManager) {
                window.PluggyManager._isFetchingAccounts = false;
            }
        });
    }

    /**
     * Connect a bank using Pluggy Connect
     */
    connectBank() {
        console.log('connectBank method called');
        console.log('PluggyManager exists:', !!window.PluggyManager);

        if (window.PluggyManager) {
            console.log('Calling openConnectWidget method');
            try {
                window.PluggyManager.openConnectWidget();
                console.log('openConnectWidget method called successfully');
            } catch (error) {
                console.error('Error calling openConnectWidget:', error);
                window.showNotification('Erro ao abrir o widget de conexão', 'error');
            }
        } else {
            console.error('Pluggy Manager not initialized');
            window.showNotification('Erro ao inicializar o Pluggy Manager', 'error');
        }
    }

    /**
     * Connect specifically to Rico Investimentos
     */
    connectToRico() {
        console.log('connectToRico method called');
        console.log('PluggyManager exists:', !!window.PluggyManager);

        if (window.PluggyManager) {
            console.log('Calling connectToRico method on PluggyManager');
            try {
                window.PluggyManager.connectToRico();
                console.log('connectToRico method called successfully');
            } catch (error) {
                console.error('Error calling connectToRico:', error);
                window.showNotification('Erro ao conectar com Rico Investimentos', 'error');
            }
        } else {
            console.error('Pluggy Manager not initialized');
            window.showNotification('Erro ao inicializar o Pluggy Manager', 'error');
        }
    }

    /**
     * Refresh the Open Finance connection
     */
    refreshOpenFinance() {
        // Add rotating class to the button
        const refreshBtn = document.getElementById('refresh-open-finance-btn');
        if (refreshBtn) {
            refreshBtn.classList.add('rotating');

            // Disable the button while refreshing
            refreshBtn.disabled = true;
        }

        if (window.PluggyManager) {
            // Check if an item is connected
            if (!window.PluggyManager.isItemConnected()) {
                window.showNotification('Nenhuma conta conectada para atualizar', 'warning');

                // Remove rotating class and re-enable button
                if (refreshBtn) {
                    refreshBtn.classList.remove('rotating');
                    refreshBtn.disabled = false;
                }

                return;
            }

            // Refresh the connection
            window.PluggyManager.refreshConnection()
                .then(success => {
                    if (success) {
                        console.log('Connection refreshed successfully');
                    } else {
                        console.warn('Connection refresh returned false');
                    }
                })
                .catch(error => {
                    console.error('Error refreshing connection:', error);
                    window.showNotification('Erro ao atualizar conexão', 'error');
                })
                .finally(() => {
                    // Remove rotating class and re-enable button after 1 second
                    setTimeout(() => {
                        if (refreshBtn) {
                            refreshBtn.classList.remove('rotating');
                            refreshBtn.disabled = false;
                        }
                    }, 1000);
                });
        } else {
            console.error('Pluggy Manager not initialized');
            window.showNotification('Erro ao inicializar o Pluggy Manager', 'error');

            // Remove rotating class and re-enable button
            if (refreshBtn) {
                refreshBtn.classList.remove('rotating');
                refreshBtn.disabled = false;
            }
        }
    }

    /**
     * Render the Open Finance section
     */
    renderOpenFinanceSection() {
        const openFinanceContent = document.getElementById('open-finance-content');

        console.log('Rendering Open Finance section');
        console.log('openFinanceContent:', openFinanceContent);
        console.log('PluggyManager connected:', window.PluggyManager && window.PluggyManager.isItemConnected());

        if (!openFinanceContent) {
            console.error('Could not find Open Finance content element');
            return;
        }

        // Clear the content area
        openFinanceContent.innerHTML = '';

        // Check if an item is connected
        if (window.PluggyManager && window.PluggyManager.isItemConnected()) {
            console.log('Item is connected, showing accounts');

            // Create the connected accounts container
            openFinanceContent.innerHTML = `
                <div id="connected-accounts" class="connected-accounts">
                    <!-- Accounts will be added here dynamically -->
                </div>
            `;

            // Only fetch accounts if we're not already fetching them
            // This prevents infinite loops and multiple simultaneous fetches
            if (window.PluggyManager && !window.PluggyManager._isFetchingAccounts) {
                // Show a loading indicator
                const connectedAccounts = document.getElementById('connected-accounts');
                if (connectedAccounts) {
                    connectedAccounts.innerHTML = `
                        <div class="loading-accounts">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Carregando...</span>
                            </div>
                            <p>Carregando suas contas bancárias...</p>
                        </div>
                    `;
                }

                // Fetch accounts with a slight delay to prevent UI jank
                setTimeout(() => {
                    window.PluggyManager.fetchAccounts()
                        .then(data => {
                            console.log('Accounts fetched successfully:', data);
                        })
                        .catch(error => {
                            console.error('Error fetching accounts:', error);
                            // Show an error message if fetching accounts fails
                            const connectedAccounts = document.getElementById('connected-accounts');
                            if (connectedAccounts) {
                                connectedAccounts.innerHTML = `
                                    <div class="empty-state">
                                        <div class="empty-content">
                                            <i class="fas fa-exclamation-circle empty-icon"></i>
                                            <p>Erro ao carregar contas</p>
                                            <p class="empty-description">Não foi possível carregar suas contas bancárias. Tente novamente mais tarde.</p>
                                            <button type="button" class="btn btn-primary" id="retry-fetch-btn">
                                                <i class="fas fa-sync-alt"></i> Tentar Novamente
                                            </button>
                                        </div>
                                    </div>
                                `;

                                // Add event listener to the retry button
                                const retryBtn = document.getElementById('retry-fetch-btn');
                                if (retryBtn) {
                                    retryBtn.addEventListener('click', () => {
                                        // Clear the fetching flag in case it got stuck
                                        if (window.PluggyManager) {
                                            window.PluggyManager._isFetchingAccounts = false;
                                        }
                                        this.renderOpenFinanceSection();
                                    });
                                }
                            }
                        });
                }, 300);
            }
        } else {
            console.log('No item connected, showing empty state');

            // Create the empty state
            openFinanceContent.innerHTML = `
                <div id="open-finance-empty" class="empty-accounts">
                    <i class="fas fa-university"></i>
                    <p>Nenhuma conta bancária conectada</p>
                    <p>Conecte suas contas bancárias para visualizar seus dados financeiros em um só lugar</p>
                    <div class="connect-buttons">
                        <button type="button" class="connect-bank-btn" id="empty-connect-btn">
                            <i class="fas fa-link"></i>Conectar Banco
                        </button>
                        <button type="button" class="connect-rico-btn" id="connect-rico-btn">
                            <i class="fas fa-chart-line"></i>Conectar Plataforma de Investimentos
                        </button>
                    </div>
                </div>
            `;

            // Add event listeners to the new buttons
            const emptyConnectBtn = document.getElementById('empty-connect-btn');
            if (emptyConnectBtn) {
                emptyConnectBtn.addEventListener('click', () => this.connectBank());
            }

            const connectRicoBtn = document.getElementById('connect-rico-btn');
            if (connectRicoBtn) {
                connectRicoBtn.addEventListener('click', () => this.connectToRico());
            }
        }
    }

    /**
     * Render connected accounts
     * @param {Object} accountsData - The accounts data from Pluggy
     */
    renderConnectedAccounts(accountsData) {
        console.log('Rendering connected accounts with data:', accountsData);

        // Store the accounts data for later use
        this.lastAccountsData = accountsData;

        // Get the open finance content container
        const openFinanceContent = document.getElementById('open-finance-content');
        if (!openFinanceContent) {
            console.error('Could not find open-finance-content element');
            return;
        }

        // Get the connected accounts container or create it if it doesn't exist
        let connectedAccounts = document.getElementById('connected-accounts');

        // If the connected accounts container doesn't exist, create it
        if (!connectedAccounts) {
            // Clear the content and create the connected accounts container
            openFinanceContent.innerHTML = `
                <div id="connected-accounts" class="connected-accounts">
                    <!-- Accounts will be added here dynamically -->
                </div>
            `;

            // Get the newly created connected accounts container
            connectedAccounts = document.getElementById('connected-accounts');
        }

        // Clear the connected accounts container
        connectedAccounts.innerHTML = '';

        console.log('Connected accounts element:', connectedAccounts);

        if (!connectedAccounts) {
            console.error('Could not find or create connected-accounts element');
            return;
        }

        // Check if we have accounts
        if (!accountsData || !accountsData.results || accountsData.results.length === 0) {
            connectedAccounts.innerHTML = `
                <div class="empty-state">
                    <div class="empty-content">
                        <i class="fas fa-exclamation-circle empty-icon"></i>
                        <p>Nenhuma conta encontrada</p>
                        <p class="empty-description">Não foram encontradas contas na instituição conectada</p>
                    </div>
                </div>
            `;
            return;
        }

        // Get institution name from the first account
        const institutionName = accountsData.results[0]?.institution?.name || 'Banco';

        // Get current date and time for last update
        const now = new Date();
        const lastUpdateFormatted = `${now.toLocaleDateString()} às ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

        // Create a summary section at the top
        const summarySection = document.createElement('div');
        summarySection.className = 'open-finance-summary';

        // Calculate total balance across all accounts
        let totalBalance = 0;
        let totalInvestments = 0;
        let totalCredit = 0;
        let totalAvailableCredit = 0;

        accountsData.results.forEach(account => {
            if (account.type === 'INVESTMENT') {
                totalInvestments += account.balance;
            } else if (account.type === 'CREDIT') {
                totalCredit += account.balance;
                // If available credit info exists
                if (account.creditData && account.creditData.availableAmount) {
                    totalAvailableCredit += account.creditData.availableAmount;
                }
            } else {
                totalBalance += account.balance;
            }
        });

        // Create summary items
        summarySection.innerHTML = `
            <div class="summary-item">
                <div class="summary-label">Saldo Total</div>
                <div class="summary-value">R$ ${this.formatCurrency(totalBalance)}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Investimentos</div>
                <div class="summary-value">R$ ${this.formatCurrency(totalInvestments)}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Cartões de Crédito</div>
                <div class="summary-value">R$ ${this.formatCurrency(totalCredit)}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Limite Disponível</div>
                <div class="summary-value">R$ ${this.formatCurrency(totalAvailableCredit)}</div>
            </div>
        `;

        // Add the summary section to the container
        connectedAccounts.appendChild(summarySection);

        // Render each account
        accountsData.results.forEach(account => {
            const accountCard = document.createElement('div');

            // Set appropriate class based on account type
            let accountClass = 'account-card';
            let icon = 'fa-university';
            let badgeClass = '';
            let badgeText = '';

            if (account.type === 'CREDIT') {
                accountClass += ' credit-card';
                icon = 'fa-credit-card';
                badgeClass = 'credit';
                badgeText = 'Crédito';
            } else if (account.type === 'INVESTMENT') {
                accountClass += ' investment';
                icon = 'fa-chart-line';
                badgeClass = 'investment';
                badgeText = 'Investimento';
            } else if (account.type === 'CHECKING') {
                accountClass += ' checking';
                icon = 'fa-university';
                badgeClass = 'primary';
                badgeText = 'Principal';
            } else if (account.type === 'SAVINGS') {
                accountClass += ' savings';
                icon = 'fa-piggy-bank';
                badgeClass = 'savings';
                badgeText = 'Poupança';
            }

            accountCard.className = accountClass;

            // Format balance
            const balance = this.formatCurrency(account.balance);

            // Create a balance trend indicator (this would be dynamic in a real app)
            const balanceTrend = Math.random() > 0.5 ?
                `<span class="balance-trend"><i class="fas fa-arrow-up"></i> 2.5%</span>` :
                `<span class="balance-trend negative"><i class="fas fa-arrow-down"></i> 1.8%</span>`;

            // Create account card HTML
            accountCard.innerHTML = `
                <div class="account-header">
                    <div class="account-type">
                        <i class="fas ${icon}"></i>
                        ${account.name}
                        ${badgeText ? `<span class="account-badge ${badgeClass}">${badgeText}</span>` : ''}
                    </div>
                    <button class="refresh-btn" title="Atualizar conta">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                </div>

                <div class="account-institution">
                    <i class="fas fa-landmark"></i> ${institutionName}
                </div>

                <div class="account-balance">R$ ${balance} ${balanceTrend}</div>

                <div class="account-number">
                    <i class="fas fa-hashtag"></i> ${this.formatAccountNumber(account.number)}
                </div>

                <div class="account-meta">
                    <div class="last-update">
                        <i class="far fa-clock"></i> Atualizado em: ${lastUpdateFormatted}
                    </div>
                </div>
            `;

            // Add account-specific details section based on account type
            if (account.type === 'CREDIT') {
                // Add credit card details section
                const detailsSection = document.createElement('div');
                detailsSection.className = 'account-details-section';

                // Get credit card details if available
                const creditLimit = account.creditData?.limit || 5000; // Fallback for demo
                const availableCredit = account.creditData?.availableAmount || (creditLimit - account.balance);
                const dueDate = account.creditData?.dueDate || '15/06/2023'; // Fallback for demo

                detailsSection.innerHTML = `
                    <div class="account-details-header" data-toggle="details">
                        <h4><i class="fas fa-info-circle"></i> Detalhes do Cartão</h4>
                        <i class="fas fa-chevron-down"></i>
                    </div>
                    <div class="account-details-content">
                        <div class="credit-details">
                            <div class="credit-detail-item">
                                <div class="detail-label">Limite Total</div>
                                <div class="detail-value">R$ ${this.formatCurrency(creditLimit)}</div>
                            </div>
                            <div class="credit-detail-item">
                                <div class="detail-label">Limite Disponível</div>
                                <div class="detail-value">R$ ${this.formatCurrency(availableCredit)}</div>
                            </div>
                            <div class="credit-detail-item">
                                <div class="detail-label">Vencimento</div>
                                <div class="detail-value">${dueDate}</div>
                            </div>
                        </div>
                    </div>
                `;

                accountCard.appendChild(detailsSection);
            } else if (account.type === 'INVESTMENT') {
                // Add investment details section
                const detailsSection = document.createElement('div');
                detailsSection.className = 'account-details-section';

                detailsSection.innerHTML = `
                    <div class="account-details-header" data-toggle="details">
                        <h4><i class="fas fa-chart-pie"></i> Detalhes dos Investimentos</h4>
                        <i class="fas fa-chevron-down"></i>
                    </div>
                    <div class="account-details-content">
                        <div class="investment-details">
                            <div class="investment-item">
                                <div>
                                    <div class="investment-name">CDB Banco XYZ</div>
                                    <div class="investment-type">Renda Fixa</div>
                                </div>
                                <div>
                                    <div class="investment-value">R$ ${this.formatCurrency(account.balance * 0.4)}</div>
                                    <div class="investment-return positive">+5.2% a.a.</div>
                                </div>
                            </div>
                            <div class="investment-item">
                                <div>
                                    <div class="investment-name">Tesouro Direto</div>
                                    <div class="investment-type">Títulos Públicos</div>
                                </div>
                                <div>
                                    <div class="investment-value">R$ ${this.formatCurrency(account.balance * 0.3)}</div>
                                    <div class="investment-return positive">+11.5% a.a.</div>
                                </div>
                            </div>
                            <div class="investment-item">
                                <div>
                                    <div class="investment-name">Fundo de Ações</div>
                                    <div class="investment-type">Renda Variável</div>
                                </div>
                                <div>
                                    <div class="investment-value">R$ ${this.formatCurrency(account.balance * 0.3)}</div>
                                    <div class="investment-return negative">-2.8% a.a.</div>
                                </div>
                            </div>
                        </div>
                        <button class="import-investments-btn" data-account-id="${account.id}">
                            <i class="fas fa-file-import"></i> Importar para Meu Portfólio
                        </button>
                    </div>
                `;

                accountCard.appendChild(detailsSection);
            }

            // Add account actions
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'account-actions';
            actionsDiv.innerHTML = `
                <button type="button" class="view-transactions-btn" data-id="${account.id}">
                    <i class="fas fa-list"></i> Transações
                </button>
                ${account.type === 'INVESTMENT' ? `
                    <button type="button" class="view-investments-btn" data-id="${account.id}">
                        <i class="fas fa-chart-pie"></i> Investimentos
                    </button>
                ` : ''}
                ${account.type === 'CREDIT' ? `
                    <button type="button" class="view-statement-btn" data-id="${account.id}">
                        <i class="fas fa-file-invoice-dollar"></i> Fatura
                    </button>
                ` : ''}
            `;

            accountCard.appendChild(actionsDiv);

            // Add event listeners
            const viewTransactionsBtn = accountCard.querySelector('.view-transactions-btn');
            if (viewTransactionsBtn) {
                viewTransactionsBtn.addEventListener('click', () => {
                    this.viewTransactions(account.id);
                });
            }

            const viewInvestmentsBtn = accountCard.querySelector('.view-investments-btn');
            if (viewInvestmentsBtn) {
                viewInvestmentsBtn.addEventListener('click', () => {
                    this.viewInvestments(account.id);
                });
            }

            const viewStatementBtn = accountCard.querySelector('.view-statement-btn');
            if (viewStatementBtn) {
                viewStatementBtn.addEventListener('click', () => {
                    window.showNotification('Visualização de fatura em desenvolvimento', 'info');
                });
            }

            // Add refresh button event listener
            const refreshBtn = accountCard.querySelector('.refresh-btn');
            if (refreshBtn) {
                refreshBtn.addEventListener('click', () => {
                    // Add animation class
                    refreshBtn.classList.add('rotating');

                    // Refresh account data
                    if (window.PluggyManager) {
                        window.PluggyManager.fetchAccounts()
                            .then(() => {
                                window.showNotification('Conta atualizada com sucesso!', 'success');
                            })
                            .catch(error => {
                                console.error('Error refreshing account:', error);
                                window.showNotification('Erro ao atualizar conta', 'error');
                            })
                            .finally(() => {
                                // Remove animation class after 1 second
                                setTimeout(() => {
                                    refreshBtn.classList.remove('rotating');
                                }, 1000);
                            });
                    } else {
                        // Remove animation class after 1 second
                        setTimeout(() => {
                            refreshBtn.classList.remove('rotating');
                        }, 1000);
                    }
                });
            }

            // Add details toggle functionality
            const detailsHeader = accountCard.querySelector('.account-details-header');
            if (detailsHeader) {
                detailsHeader.addEventListener('click', () => {
                    const content = detailsHeader.nextElementSibling;
                    content.classList.toggle('expanded');
                    const icon = detailsHeader.querySelector('.fa-chevron-down');
                    if (icon) {
                        icon.classList.toggle('fa-chevron-up');
                        icon.classList.toggle('fa-chevron-down');
                    }
                });
            }

            // Add import investments button event listener
            const importBtn = accountCard.querySelector('.import-investments-btn');
            if (importBtn) {
                importBtn.addEventListener('click', () => {
                    this.importInvestmentsToPortfolio(account.id);
                });
            }

            // Add the card to the container
            connectedAccounts.appendChild(accountCard);
        });

        // Add disconnect button
        const disconnectContainer = document.createElement('div');
        disconnectContainer.className = 'disconnect-container';
        disconnectContainer.style.textAlign = 'center';
        disconnectContainer.style.marginTop = '1.5rem';

        const disconnectBtn = document.createElement('button');
        disconnectBtn.className = 'connect-bank-btn';
        disconnectBtn.style.backgroundColor = '#6c757d';
        disconnectBtn.innerHTML = '<i class="fas fa-unlink"></i> Desconectar Banco';
        disconnectBtn.addEventListener('click', () => {
            if (confirm('Tem certeza que deseja desconectar esta instituição financeira? Todos os dados associados serão removidos.')) {
                if (window.PluggyManager) {
                    window.PluggyManager.disconnectItem();
                }
            }
        });

        disconnectContainer.appendChild(disconnectBtn);
        connectedAccounts.appendChild(disconnectContainer);
    }

    /**
     * View transactions for an account
     * @param {string} accountId - The account ID
     */
    viewTransactions(accountId) {
        console.log('View transactions for account:', accountId);

        // Store the current account ID
        this.currentAccountId = accountId;

        // Get the modal and related elements
        const modal = document.getElementById('transactions-modal');
        const accountNameElement = document.getElementById('transaction-account-name');
        const accountBalanceElement = document.getElementById('transaction-account-balance');
        const tableBody = document.getElementById('transactions-table-body');
        const loadingIndicator = document.getElementById('transactions-loading');
        const emptyState = document.getElementById('transactions-empty');
        const paginationElement = document.getElementById('transactions-pagination');

        // Clear previous data
        tableBody.innerHTML = '';

        // Initialize pagination state
        this.transactionsPagination = {
            currentPage: 1,
            totalPages: 1,
            pageSize: 50,
            totalTransactions: 0
        };

        // Initialize filters
        this.transactionsFilters = {
            period: '30', // Default to last 30 days
            startDate: null,
            endDate: null,
            type: 'all'
        };

        // Set default dates for the date inputs
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);

        document.getElementById('transaction-start-date').value = thirtyDaysAgo.toISOString().split('T')[0];
        document.getElementById('transaction-end-date').value = today.toISOString().split('T')[0];

        // Reset period selector
        document.getElementById('transaction-period').value = '30';
        document.getElementById('transaction-type').value = 'all';
        document.getElementById('transaction-search').value = '';

        // Hide custom date range by default
        document.getElementById('custom-date-range').classList.add('hidden');

        // Find the account in the accounts data
        let account = null;
        const accountsData = this.lastAccountsData;

        if (accountsData && accountsData.results) {
            account = accountsData.results.find(acc => acc.id === accountId);
        }

        if (account) {
            // Set account name and balance
            accountNameElement.textContent = account.name;
            accountBalanceElement.textContent = `R$ ${this.formatCurrency(account.balance)}`;
        } else {
            accountNameElement.textContent = 'Conta';
            accountBalanceElement.textContent = 'R$ 0,00';
        }

        // Show the modal
        modal.classList.remove('hidden');

        // Show loading indicator
        loadingIndicator.classList.remove('hidden');
        emptyState.classList.add('hidden');

        // Fetch transactions
        this.fetchAndRenderTransactions(accountId);

        // Set up event listeners for the modal
        this.setupTransactionsModalEventListeners();
    }

    /**
     * View investments for an account
     * @param {string} accountId - The account ID
     */
    viewInvestments(accountId) {
        console.log('View investments for account:', accountId);
        // This would typically open a modal or navigate to an investments page
        window.showNotification('Funcionalidade em desenvolvimento', 'info');
    }

    /**
     * Import investments from Pluggy to the portfolio
     * @param {string} accountId - The account ID
     */
    importInvestmentsToPortfolio(accountId) {
        console.log('Importing investments from account:', accountId);

        // Show a loading notification
        window.showNotification('Importando investimentos...', 'info');

        // Check if PluggyManager is available
        if (!window.PluggyManager) {
            console.error('PluggyManager not available');
            window.showNotification('Erro ao importar investimentos: serviço indisponível', 'error');
            return;
        }

        // Fetch investments from Pluggy API
        window.PluggyManager.fetchInvestments(accountId)
            .then(data => {
                console.log('Fetched investments for import:', data);
                this.importInvestmentsFromData(data);
            })
            .catch(error => {
                console.error('Error fetching investments for import:', error);
                window.showNotification('Erro ao importar investimentos. Tente novamente mais tarde.', 'error');
            });
    }

    /**
     * Import investments directly from investment data
     * @param {Object} data - The investments data from Pluggy
     */
    importInvestmentsFromData(data) {
        console.log('Importing investments from data:', data);

        if (!data.results || data.results.length === 0) {
            window.showNotification('Nenhum investimento encontrado para importar', 'warning');
            return;
        }

        // Map Pluggy investment types to our asset classes
        const typeToClassMap = {
            'FIXED_INCOME': 'bond',
            'GOVERNMENT_BOND': 'bond',
            'EQUITY': 'stock',
            'MUTUAL_FUND': 'etf',
            'ETF': 'etf',
            'CRYPTO': 'crypto',
            'REAL_ESTATE': 'reit',
            'OTHER': 'other'
        };

        // Convert Pluggy investments to our portfolio format
        const investments = data.results.map(inv => {
            // Generate a symbol if not available
            const symbol = inv.code || inv.number || inv.name.replace(/\s+/g, '_').toUpperCase();

            // Map investment type to asset class
            const assetClass = typeToClassMap[inv.type] || 'other';

            // Use balance as current value and amount as purchase price
            const purchasePrice = inv.amount || inv.balance;

            // Default quantity to 1 for most investments
            const quantity = inv.quantity || 1;

            // Use investment date if available, otherwise use today
            const purchaseDate = inv.date ?
                new Date(inv.date).toISOString().split('T')[0] :
                new Date().toISOString().split('T')[0];

            return {
                id: this.generateId(),
                symbol: symbol,
                name: inv.name,
                assetClass: assetClass,
                quantity: quantity,
                purchasePrice: purchasePrice / quantity, // Price per unit
                purchaseDate: purchaseDate,
                notes: `Importado automaticamente da plataforma de investimentos em ${new Date().toLocaleDateString()}`
            };
        });

        // Add each investment to the portfolio
        investments.forEach(investment => {
            // Check if this investment already exists in the portfolio
            const existingIndex = this.portfolio.assets.findIndex(
                a => a.symbol === investment.symbol && a.name === investment.name
            );

            if (existingIndex !== -1) {
                // Update existing investment
                this.portfolio.assets[existingIndex] = {
                    ...this.portfolio.assets[existingIndex],
                    ...investment,
                    id: this.portfolio.assets[existingIndex].id // Keep the original ID
                };
            } else {
                // Add new investment
                this.portfolio.assets.push(investment);
            }
        });

        // Save the updated portfolio
        this.savePortfolio();

        // Generate new mock prices
        this.generateMockPrices();

        // Re-render the portfolio
        this.renderPortfolio();

        // Show success notification
        window.showNotification(`${investments.length} investimentos importados com sucesso!`, 'success');
    }

    /**
     * Get a friendly name for an account type
     * @param {string} type - The account type
     * @returns {string} - The friendly name
     */
    getAccountTypeName(type) {
        const typeNames = {
            'CHECKING': 'Conta Corrente',
            'SAVINGS': 'Conta Poupança',
            'CREDIT': 'Cartão de Crédito',
            'INVESTMENT': 'Investimentos',
            'LOAN': 'Empréstimo',
            'PENSION': 'Previdência',
            'INVOICE': 'Fatura',
            'OTHER': 'Outra'
        };

        return typeNames[type] || 'Conta';
    }

    /**
     * Format an account number for display
     * @param {string} number - The account number
     * @returns {string} - The formatted account number
     */
    formatAccountNumber(number) {
        if (!number) return '';

        // If the number contains a branch, format it as 'branch / number'
        if (number.includes('/')) {
            return number;
        }

        // If it's just a number, mask part of it for privacy
        if (number.length > 4) {
            const lastFour = number.slice(-4);
            const masked = '*'.repeat(number.length - 4);
            return masked + lastFour;
        }

        return number;
    }

    /**
     * Set up event listeners for the transactions modal
     */
    setupTransactionsModalEventListeners() {
        // Close button
        const closeBtn = document.getElementById('close-transactions-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideTransactionsModal());
        }

        // Close button in footer
        const closeFooterBtn = document.getElementById('close-transactions-btn');
        if (closeFooterBtn) {
            closeFooterBtn.addEventListener('click', () => this.hideTransactionsModal());
        }

        // Period selector
        const periodSelector = document.getElementById('transaction-period');
        if (periodSelector) {
            periodSelector.addEventListener('change', (e) => {
                const customDateRange = document.getElementById('custom-date-range');
                if (e.target.value === 'custom') {
                    customDateRange.classList.remove('hidden');
                } else {
                    customDateRange.classList.add('hidden');
                    this.transactionsFilters.period = e.target.value;
                    this.transactionsFilters.startDate = null;
                    this.transactionsFilters.endDate = null;
                }
            });
        }

        // Apply filters button
        const applyFiltersBtn = document.getElementById('apply-filters-btn');
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', () => {
                // Get filter values
                const period = document.getElementById('transaction-period').value;
                const type = document.getElementById('transaction-type').value;

                // Update filters
                this.transactionsFilters.period = period;
                this.transactionsFilters.type = type;

                // If custom period, get date range
                if (period === 'custom') {
                    const startDate = document.getElementById('transaction-start-date').value;
                    const endDate = document.getElementById('transaction-end-date').value;

                    if (startDate && endDate) {
                        this.transactionsFilters.startDate = startDate;
                        this.transactionsFilters.endDate = endDate;
                    }
                } else {
                    this.transactionsFilters.startDate = null;
                    this.transactionsFilters.endDate = null;
                }

                // Reset pagination
                this.transactionsPagination.currentPage = 1;

                // Fetch transactions with new filters
                this.fetchAndRenderTransactions(this.currentAccountId);
            });
        }

        // Search input
        const searchInput = document.getElementById('transaction-search');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(() => {
                // Filter transactions based on search term
                this.filterTransactionsBySearch();
            }, 300));
        }

        // Pagination buttons
        const prevPageBtn = document.getElementById('prev-page-btn');
        const nextPageBtn = document.getElementById('next-page-btn');

        if (prevPageBtn) {
            prevPageBtn.addEventListener('click', () => {
                if (this.transactionsPagination.currentPage > 1) {
                    this.transactionsPagination.currentPage--;
                    this.fetchAndRenderTransactions(this.currentAccountId);
                }
            });
        }

        if (nextPageBtn) {
            nextPageBtn.addEventListener('click', () => {
                if (this.transactionsPagination.currentPage < this.transactionsPagination.totalPages) {
                    this.transactionsPagination.currentPage++;
                    this.fetchAndRenderTransactions(this.currentAccountId);
                }
            });
        }

        // Export button
        const exportBtn = document.getElementById('export-transactions-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportTransactions());
        }

        // Close modal when clicking outside
        const modal = document.getElementById('transactions-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideTransactionsModal();
                }
            });
        }
    }

    /**
     * Hide the transactions modal
     */
    hideTransactionsModal() {
        const modal = document.getElementById('transactions-modal');
        if (modal) {
            modal.classList.add('hidden');
        }

        // Clear current account ID
        this.currentAccountId = null;
    }

    /**
     * Fetch and render transactions for an account
     * @param {string} accountId - The account ID
     */
    fetchAndRenderTransactions(accountId) {
        if (!accountId) return;

        // Get elements
        const tableBody = document.getElementById('transactions-table-body');
        const loadingIndicator = document.getElementById('transactions-loading');
        const emptyState = document.getElementById('transactions-empty');
        const currentPageElement = document.getElementById('current-page');
        const totalPagesElement = document.getElementById('total-pages');
        const prevPageBtn = document.getElementById('prev-page-btn');
        const nextPageBtn = document.getElementById('next-page-btn');

        // Show loading indicator
        loadingIndicator.classList.remove('hidden');
        emptyState.classList.add('hidden');

        // Clear table
        tableBody.innerHTML = '';

        // Prepare options for fetching transactions
        const options = {
            page: this.transactionsPagination.currentPage,
            pageSize: this.transactionsPagination.pageSize
        };

        // Add date filters if needed
        if (this.transactionsFilters.startDate && this.transactionsFilters.endDate) {
            options.from = this.transactionsFilters.startDate;
            options.to = this.transactionsFilters.endDate;
        } else if (this.transactionsFilters.period !== 'all') {
            // Calculate date range based on period
            const today = new Date();
            const startDate = new Date();
            startDate.setDate(today.getDate() - parseInt(this.transactionsFilters.period));

            options.from = startDate.toISOString().split('T')[0];
            options.to = today.toISOString().split('T')[0];
        }

        // Fetch transactions
        if (window.PluggyManager) {
            window.PluggyManager.fetchTransactions(accountId, options)
                .then(data => {
                    console.log('Transactions fetched:', data);

                    // Store the transactions data
                    this.lastTransactionsData = data;

                    // Update pagination info
                    if (data.total) {
                        this.transactionsPagination.totalTransactions = data.total;
                        this.transactionsPagination.totalPages = data.totalPages || Math.ceil(data.total / this.transactionsPagination.pageSize);
                    } else {
                        this.transactionsPagination.totalTransactions = data.results ? data.results.length : 0;
                        this.transactionsPagination.totalPages = 1;
                    }

                    // Update pagination UI
                    currentPageElement.textContent = this.transactionsPagination.currentPage;
                    totalPagesElement.textContent = this.transactionsPagination.totalPages;

                    // Enable/disable pagination buttons
                    prevPageBtn.disabled = this.transactionsPagination.currentPage <= 1;
                    nextPageBtn.disabled = this.transactionsPagination.currentPage >= this.transactionsPagination.totalPages;

                    // Hide loading indicator
                    loadingIndicator.classList.add('hidden');

                    // Check if we have transactions
                    if (!data.results || data.results.length === 0) {
                        emptyState.classList.remove('hidden');
                        return;
                    }

                    // Filter transactions by type if needed
                    let transactions = data.results;
                    if (this.transactionsFilters.type !== 'all') {
                        transactions = transactions.filter(tx => tx.type === this.transactionsFilters.type);
                    }

                    // If we have no transactions after filtering
                    if (transactions.length === 0) {
                        emptyState.classList.remove('hidden');
                        return;
                    }

                    // Group transactions by date
                    const groupedTransactions = this.groupTransactionsByDate(transactions);

                    // Render transactions
                    this.renderTransactionsTable(groupedTransactions);

                    // Apply search filter if there's a search term
                    const searchTerm = document.getElementById('transaction-search').value.trim();
                    if (searchTerm) {
                        this.filterTransactionsBySearch();
                    }
                })
                .catch(error => {
                    console.error('Error fetching transactions:', error);

                    // Hide loading indicator
                    loadingIndicator.classList.add('hidden');

                    // Show empty state with error message
                    emptyState.innerHTML = `
                        <i class="fas fa-exclamation-circle"></i>
                        <p>Erro ao carregar transações</p>
                        <p>Tente novamente mais tarde</p>
                    `;
                    emptyState.classList.remove('hidden');

                    // Show notification
                    window.showNotification('Erro ao carregar transações. Tente novamente mais tarde.', 'error');
                });
        } else {
            // If PluggyManager is not available, show error
            loadingIndicator.classList.add('hidden');
            emptyState.innerHTML = `
                <i class="fas fa-exclamation-circle"></i>
                <p>Erro ao carregar transações</p>
                <p>Serviço indisponível</p>
            `;
            emptyState.classList.remove('hidden');
        }
    }

    /**
     * Group transactions by date
     * @param {Array} transactions - The transactions to group
     * @returns {Object} - Transactions grouped by date
     */
    groupTransactionsByDate(transactions) {
        const grouped = {};

        transactions.forEach(transaction => {
            // Get date part only
            const date = transaction.date.split('T')[0];

            if (!grouped[date]) {
                grouped[date] = [];
            }

            grouped[date].push(transaction);
        });

        return grouped;
    }

    /**
     * Render transactions table
     * @param {Object} groupedTransactions - Transactions grouped by date
     */
    renderTransactionsTable(groupedTransactions) {
        const tableBody = document.getElementById('transactions-table-body');

        // Clear table
        tableBody.innerHTML = '';

        // Sort dates in descending order (newest first)
        const sortedDates = Object.keys(groupedTransactions).sort((a, b) => new Date(b) - new Date(a));

        // Render each date group
        sortedDates.forEach(date => {
            // Add date header
            const dateHeader = document.createElement('tr');
            dateHeader.className = 'date-header';
            dateHeader.innerHTML = `<td colspan="5">${this.formatDate(date)}</td>`;
            tableBody.appendChild(dateHeader);

            // Sort transactions within the day (newest first, or by ID if same time)
            const sortedTransactions = groupedTransactions[date].sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return dateB - dateA || b.id.localeCompare(a.id);
            });

            // Add transactions for this date
            sortedTransactions.forEach(transaction => {
                const row = document.createElement('tr');
                row.className = 'transaction-row';
                row.dataset.id = transaction.id;

                // Format date to show time
                const dateObj = new Date(transaction.date);
                const timeStr = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                // Determine amount class
                const amountClass = transaction.type === 'CREDIT' ? 'positive' : 'negative';

                // Format amount with sign
                const amount = transaction.amount;
                const formattedAmount = transaction.type === 'CREDIT' ?
                    `+${this.formatCurrency(Math.abs(amount))}` :
                    `-${this.formatCurrency(Math.abs(amount))}`;

                // Get category display
                const category = transaction.category || 'Não categorizado';

                // Get balance if available
                const balance = transaction.balance !== undefined ?
                    `R$ ${this.formatCurrency(transaction.balance)}` :
                    '';

                row.innerHTML = `
                    <td class="transaction-date">${timeStr}</td>
                    <td class="transaction-description">${transaction.description}</td>
                    <td><span class="transaction-category">${category}</span></td>
                    <td class="transaction-amount ${amountClass}">R$ ${formattedAmount}</td>
                    <td class="transaction-balance">${balance}</td>
                `;

                tableBody.appendChild(row);
            });
        });
    }

    /**
     * Filter transactions by search term
     */
    filterTransactionsBySearch() {
        const searchTerm = document.getElementById('transaction-search').value.trim().toLowerCase();
        const rows = document.querySelectorAll('.transaction-row');
        const emptyState = document.getElementById('transactions-empty');
        let visibleCount = 0;

        // If no search term, show all rows
        if (!searchTerm) {
            rows.forEach(row => {
                row.style.display = '';
                visibleCount++;
            });

            // Show date headers
            document.querySelectorAll('.date-header').forEach(header => {
                header.style.display = '';
            });

            // Hide empty state
            emptyState.classList.add('hidden');
            return;
        }

        // Track which date headers should be visible
        const visibleDates = new Set();

        // Filter rows based on search term
        rows.forEach(row => {
            const description = row.querySelector('.transaction-description').textContent.toLowerCase();
            const category = row.querySelector('.transaction-category').textContent.toLowerCase();

            if (description.includes(searchTerm) || category.includes(searchTerm)) {
                row.style.display = '';
                visibleCount++;

                // Get the date header for this row
                let currentElement = row.previousElementSibling;
                while (currentElement && !currentElement.classList.contains('date-header')) {
                    currentElement = currentElement.previousElementSibling;
                }

                if (currentElement) {
                    visibleDates.add(currentElement);
                }
            } else {
                row.style.display = 'none';
            }
        });

        // Show/hide date headers based on visible transactions
        document.querySelectorAll('.date-header').forEach(header => {
            if (visibleDates.has(header)) {
                header.style.display = '';
            } else {
                header.style.display = 'none';
            }
        });

        // Show empty state if no visible transactions
        if (visibleCount === 0) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
        }
    }

    /**
     * Export transactions to CSV
     */
    exportTransactions() {
        // Check if we have transactions data
        if (!this.lastTransactionsData || !this.lastTransactionsData.results || this.lastTransactionsData.results.length === 0) {
            window.showNotification('Não há transações para exportar', 'warning');
            return;
        }

        // Get account name
        const accountName = document.getElementById('transaction-account-name').textContent;

        // Create CSV content
        let csvContent = 'Data,Hora,Descrição,Categoria,Tipo,Valor,Saldo\n';

        this.lastTransactionsData.results.forEach(transaction => {
            // Format date and time
            const dateObj = new Date(transaction.date);
            const dateStr = dateObj.toLocaleDateString('pt-BR');
            const timeStr = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

            // Format description (escape commas and quotes)
            const description = `"${transaction.description.replace(/"/g, '""')}"`;

            // Get category
            const category = transaction.category || 'Não categorizado';

            // Get type
            const type = transaction.type === 'CREDIT' ? 'Entrada' : 'Saída';

            // Format amount
            const amount = this.formatCurrency(Math.abs(transaction.amount)).replace('.', '');

            // Get balance if available
            const balance = transaction.balance !== undefined ?
                this.formatCurrency(transaction.balance).replace('.', '') :
                '';

            // Add row to CSV
            csvContent += `${dateStr},${timeStr},${description},${category},${type},${amount},${balance}\n`;
        });

        // Create download link
        const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `extrato_${accountName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);

        // Trigger download
        link.click();

        // Clean up
        document.body.removeChild(link);

        // Show notification
        window.showNotification('Extrato exportado com sucesso!', 'success');
    }

    /**
     * Format a date for display
     * @param {string} dateStr - The date string in ISO format
     * @returns {string} - The formatted date
     */
    formatDate(dateStr) {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Check if it's today
        if (date.toDateString() === today.toDateString()) {
            return 'Hoje, ' + date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
        }

        // Check if it's yesterday
        if (date.toDateString() === yesterday.toDateString()) {
            return 'Ontem, ' + date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
        }

        // Otherwise, return the full date
        return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }

    /**
     * Debounce function to limit how often a function can be called
     * @param {Function} func - The function to debounce
     * @param {number} wait - The debounce wait time in milliseconds
     * @returns {Function} - The debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }
}

// Initialize the portfolio manager when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.portfolioManager = new PortfolioManager();
});
