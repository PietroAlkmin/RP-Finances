/**
 * Módulo para exibição do mercado de criptomoedas
 */

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se estamos na página de melhores ativos
    if (window.location.pathname.includes('best-assets.html')) {
        // Adicionar evento para quando os dados forem carregados
        document.addEventListener('dataLoaded', renderCryptoMarket);
        
        // Adicionar evento para o botão de filtro de criptomoedas
        const cryptoFilterButton = document.querySelector('.filter-button[data-type="crypto"]');
        if (cryptoFilterButton) {
            cryptoFilterButton.addEventListener('click', function() {
                // Rolar até a seção de criptomoedas
                const cryptoSection = document.querySelector('.crypto-market-card');
                if (cryptoSection) {
                    cryptoSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
    }
});

/**
 * Renderiza a seção de mercado de criptomoedas
 */
function renderCryptoMarket() {
    console.log('Renderizando mercado de criptomoedas...');
    
    // Verificar se os dados estão disponíveis
    if (!dashboardData || !dashboardData.cryptoMarket || dashboardData.cryptoMarket.length === 0) {
        console.log('Dados de criptomoedas não disponíveis');
        showCryptoError('Não foi possível carregar os dados de criptomoedas.');
        return;
    }
    
    // Obter o container
    const container = document.getElementById('crypto-market-container');
    if (!container) {
        console.error('Container de criptomoedas não encontrado');
        return;
    }
    
    // Adicionar botões de alternância de visualização
    const viewToggle = `
        <div class="crypto-view-toggle">
            <button class="view-button active" data-view="grid">Cartões</button>
            <button class="view-button" data-view="table">Tabela</button>
        </div>
    `;
    
    // Criar HTML para a visualização em grid
    const gridView = createCryptoGridView(dashboardData.cryptoMarket);
    
    // Criar HTML para a visualização em tabela
    const tableView = createCryptoTableView(dashboardData.cryptoMarket);
    
    // Combinar tudo
    container.innerHTML = `
        ${viewToggle}
        <div class="crypto-view crypto-grid-view">${gridView}</div>
        <div class="crypto-view crypto-table-view" style="display: none;">${tableView}</div>
    `;
    
    // Adicionar eventos aos botões de alternância
    setupViewToggle();
    
    // Renderizar gráficos para cada criptomoeda
    renderCryptoCharts();
}

/**
 * Cria a visualização em grid para criptomoedas
 * @param {Array} cryptoData - Dados de criptomoedas
 * @returns {string} - HTML da visualização em grid
 */
function createCryptoGridView(cryptoData) {
    let html = '<div class="crypto-grid">';
    
    // Limitar a 12 criptomoedas para melhor visualização
    cryptoData.slice(0, 12).forEach(crypto => {
        const priceChangeClass = crypto.priceChangePercentage24h >= 0 ? 'positive' : 'negative';
        const priceChangeIcon = crypto.priceChangePercentage24h >= 0 ? '▲' : '▼';
        
        html += `
            <div class="crypto-card">
                <div class="crypto-header">
                    <img src="${crypto.image || 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png'}" 
                         alt="${crypto.name}" class="crypto-icon">
                    <div class="crypto-name">
                        <h3>${crypto.name || 'Criptomoeda'}</h3>
                        <span class="crypto-symbol">${crypto.symbol ? crypto.symbol.toUpperCase() : '---'}</span>
                    </div>
                </div>
                <div class="crypto-price">
                    ${formatCurrency(crypto.currentPrice || 0)}
                    <span class="crypto-change ${priceChangeClass}">
                        ${priceChangeIcon} ${Math.abs(crypto.priceChangePercentage24h || 0).toFixed(2)}%
                    </span>
                </div>
                <div class="crypto-details">
                    <div class="crypto-detail">
                        <span class="label">Cap. de Mercado:</span>
                        <span class="value">${formatLargeNumber(crypto.marketCap || 0)}</span>
                    </div>
                    <div class="crypto-detail">
                        <span class="label">Volume 24h:</span>
                        <span class="value">${formatLargeNumber(crypto.volume24h || 0)}</span>
                    </div>
                </div>
                <div class="crypto-chart">
                    <canvas id="crypto-chart-${crypto.id || 'unknown'}" height="40"></canvas>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}

/**
 * Cria a visualização em tabela para criptomoedas
 * @param {Array} cryptoData - Dados de criptomoedas
 * @returns {string} - HTML da visualização em tabela
 */
function createCryptoTableView(cryptoData) {
    let html = `
        <table class="crypto-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Nome</th>
                    <th>Preço</th>
                    <th>24h %</th>
                    <th>Cap. de Mercado</th>
                    <th>Volume (24h)</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    // Mostrar todas as criptomoedas na tabela
    cryptoData.forEach((crypto, index) => {
        const priceChangeClass = crypto.priceChangePercentage24h >= 0 ? 'positive' : 'negative';
        const priceChangeIcon = crypto.priceChangePercentage24h >= 0 ? '▲' : '▼';
        
        html += `
            <tr>
                <td>${index + 1}</td>
                <td>
                    <div class="crypto-name-cell">
                        <img src="${crypto.image || 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png'}" 
                             alt="${crypto.name}" class="crypto-icon-small">
                        <div>
                            <span class="crypto-name-text">${crypto.name || 'Criptomoeda'}</span>
                            <span class="crypto-symbol-text">${crypto.symbol ? crypto.symbol.toUpperCase() : '---'}</span>
                        </div>
                    </div>
                </td>
                <td>${formatCurrency(crypto.currentPrice || 0)}</td>
                <td class="${priceChangeClass}">${priceChangeIcon} ${Math.abs(crypto.priceChangePercentage24h || 0).toFixed(2)}%</td>
                <td>${formatLargeNumber(crypto.marketCap || 0)}</td>
                <td>${formatLargeNumber(crypto.volume24h || 0)}</td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    return html;
}

/**
 * Configura os botões de alternância de visualização
 */
function setupViewToggle() {
    const gridViewButton = document.querySelector('.view-button[data-view="grid"]');
    const tableViewButton = document.querySelector('.view-button[data-view="table"]');
    const gridView = document.querySelector('.crypto-grid-view');
    const tableView = document.querySelector('.crypto-table-view');
    
    if (gridViewButton && tableViewButton && gridView && tableView) {
        gridViewButton.addEventListener('click', function() {
            gridViewButton.classList.add('active');
            tableViewButton.classList.remove('active');
            gridView.style.display = 'block';
            tableView.style.display = 'none';
        });
        
        tableViewButton.addEventListener('click', function() {
            tableViewButton.classList.add('active');
            gridViewButton.classList.remove('active');
            tableView.style.display = 'block';
            gridView.style.display = 'none';
        });
    }
}

/**
 * Renderiza gráficos para cada criptomoeda
 */
function renderCryptoCharts() {
    if (!dashboardData.cryptoMarket) return;
    
    // Limitar a 12 criptomoedas para melhor visualização
    dashboardData.cryptoMarket.slice(0, 12).forEach(crypto => {
        if (!crypto.sparklineData || crypto.sparklineData.length === 0) return;
        
        const canvasId = `crypto-chart-${crypto.id || 'unknown'}`;
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        // Verificar se já existe um gráfico e destruí-lo
        const existingChart = Chart.getChart(canvas);
        if (existingChart) {
            existingChart.destroy();
        }
        
        const ctx = canvas.getContext('2d');
        const isPositive = crypto.priceChangePercentage24h >= 0;
        const color = isPositive ? '#10b981' : '#ef4444';
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array(crypto.sparklineData.length).fill(''),
                datasets: [{
                    data: crypto.sparklineData,
                    borderColor: color,
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: true,
                    backgroundColor: isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    }
                },
                scales: {
                    x: {
                        display: false
                    },
                    y: {
                        display: false
                    }
                },
                animation: false
            }
        });
    });
}

/**
 * Exibe uma mensagem de erro na seção de criptomoedas
 * @param {string} message - Mensagem de erro
 */
function showCryptoError(message) {
    const container = document.getElementById('crypto-market-container');
    if (container) {
        container.innerHTML = `
            <div class="error-message">
                <div class="error-icon">⚠️</div>
                <p>${message}</p>
                <p>Tente novamente mais tarde ou verifique sua conexão com a internet.</p>
            </div>
        `;
    }
}
