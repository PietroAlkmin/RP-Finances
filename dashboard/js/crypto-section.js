/**
 * Módulo para renderização da seção de criptomoedas
 */
const CryptoSection = {
    /**
     * Renderiza a seção de criptomoedas no dashboard
     */
    render: function() {
        if (!dashboardData.dataLoaded || !dashboardData.cryptoMarket || dashboardData.cryptoMarket.length === 0) {
            console.log('Dados de criptomoedas não disponíveis');
            return;
        }

        console.log('Renderizando seção de criptomoedas...');

        // Verificar se já existe uma seção de criptomoedas
        let cryptoSection = document.getElementById('crypto-section');

        // Se não existir, criar a seção
        if (!cryptoSection) {
            // Encontrar o elemento antes do qual inserir a seção de criptomoedas
            const correlationsSection = document.querySelector('.correlations-card');

            if (correlationsSection) {
                // Criar a seção de criptomoedas
                cryptoSection = document.createElement('section');
                cryptoSection.id = 'crypto-section';
                cryptoSection.className = 'card';

                // Inserir antes da seção de correlações
                correlationsSection.parentNode.insertBefore(cryptoSection, correlationsSection);
            } else {
                // Se não encontrar a seção de correlações, adicionar ao final do conteúdo principal
                const mainContent = document.querySelector('.main-content');
                if (mainContent) {
                    cryptoSection = document.createElement('section');
                    cryptoSection.id = 'crypto-section';
                    cryptoSection.className = 'card';

                    mainContent.appendChild(cryptoSection);
                } else {
                    console.error('Não foi possível encontrar o conteúdo principal');
                    return;
                }
            }
        }

        // Obter dados de criptomoedas
        const cryptoData = dashboardData.cryptoMarket;

        // Criar HTML para a seção de criptomoedas
        cryptoSection.innerHTML = this.generateHTML(cryptoData);

        // Renderizar sparklines para cada criptomoeda
        this.renderSparklines(cryptoData);

        // Adicionar evento ao botão "Ver todas as criptomoedas"
        const viewAllButton = document.getElementById('view-all-crypto');
        if (viewAllButton) {
            viewAllButton.addEventListener('click', function() {
                // Mostrar modal ou redirecionar para página de criptomoedas
                CryptoSection.showModal();
            });
        }
    },

    /**
     * Gera o HTML para a seção de criptomoedas
     * @param {Array} cryptoData - Dados de criptomoedas
     * @returns {string} - HTML da seção de criptomoedas
     */
    generateHTML: function(cryptoData) {
        let html = `
            <div class="section-header">
                <h2>Mercado de Criptomoedas</h2>
            </div>
            <div class="crypto-grid">
        `;

        // Adicionar as principais criptomoedas
        cryptoData.slice(0, 6).forEach(crypto => {
            const priceChangeClass = crypto.priceChangePercentage24h >= 0 ? 'positive' : 'negative';
            const priceChangeIcon = crypto.priceChangePercentage24h >= 0 ? '▲' : '▼';

            html += `
                <div class="crypto-item">
                    <div class="crypto-header">
                        <img src="${crypto.image || 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png'}" alt="${crypto.name}" class="crypto-icon">
                        <div class="crypto-name">
                            <h3>${crypto.name || 'Criptomoeda'}</h3>
                            <span class="crypto-symbol">${crypto.symbol ? crypto.symbol.toUpperCase() : '---'}</span>
                        </div>
                    </div>
                    <div class="crypto-price">
                        ${formatCurrency(crypto.currentPrice || 0)}
                        <span class="price-change ${priceChangeClass}">
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

        html += `
            </div>
            <div class="section-footer">
                <p>Dados fornecidos por múltiplas APIs de criptomoedas</p>
                <button id="view-all-crypto" class="btn btn-primary">Ver todas as criptomoedas</button>
            </div>
        `;

        return html;
    },

    /**
     * Renderiza os gráficos de linha para cada criptomoeda
     * @param {Array} cryptoData - Dados de criptomoedas
     */
    renderSparklines: function(cryptoData) {
        cryptoData.slice(0, 6).forEach(crypto => {
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
            const color = isPositive ? '#16c784' : '#ea3943';

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
                        backgroundColor: isPositive ? 'rgba(22, 199, 132, 0.1)' : 'rgba(234, 57, 67, 0.1)',
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
    },

    /**
     * Mostra um modal com informações detalhadas sobre criptomoedas
     */
    showModal: function() {
        // Verificar se já existe um modal
        let modal = document.getElementById('crypto-modal');

        // Se não existir, criar o modal
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'crypto-modal';
            modal.className = 'modal';

            // Adicionar HTML do modal
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Mercado de Criptomoedas</h2>
                        <span class="close-modal">&times;</span>
                    </div>
                    <div class="modal-body">
                        <div class="crypto-list">
                            ${this.generateCryptoListHTML(dashboardData.cryptoMarket)}
                        </div>
                    </div>
                </div>
            `;

            // Adicionar o modal ao corpo do documento
            document.body.appendChild(modal);

            // Adicionar evento para fechar o modal
            const closeBtn = modal.querySelector('.close-modal');
            if (closeBtn) {
                closeBtn.addEventListener('click', function() {
                    modal.style.display = 'none';
                });
            }

            // Fechar o modal ao clicar fora dele
            window.addEventListener('click', function(event) {
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }

        // Exibir o modal
        modal.style.display = 'block';
    },

    /**
     * Gera o HTML para a lista de criptomoedas no modal
     * @param {Array} cryptoData - Dados de criptomoedas
     * @returns {string} - HTML da lista de criptomoedas
     */
    generateCryptoListHTML: function(cryptoData) {
        if (!cryptoData || cryptoData.length === 0) {
            return '<p>Nenhuma criptomoeda disponível no momento.</p>';
        }

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

        cryptoData.forEach((crypto, index) => {
            const priceChangeClass = crypto.priceChangePercentage24h >= 0 ? 'positive' : 'negative';
            const priceChangeIcon = crypto.priceChangePercentage24h >= 0 ? '▲' : '▼';

            html += `
                <tr>
                    <td>${index + 1}</td>
                    <td>
                        <div class="crypto-name-cell">
                            <img src="${crypto.image || 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png'}" alt="${crypto.name}" class="crypto-icon-small">
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
};
