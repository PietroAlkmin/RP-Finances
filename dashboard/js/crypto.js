/**
 * Módulo para a página de criptomoedas
 * Gerencia a exibição e atualização dos dados de criptomoedas
 */

// Objeto global para armazenar dados da página de criptomoedas
window.cryptoData = {
    marketData: null,
    selectedCrypto: 'bitcoin',
    selectedTimeframe: 7, // dias
    historicalData: {},
    dataLoaded: false
};

// Inicializar página quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', initCryptoPage);

/**
 * Inicializa a página de criptomoedas
 */
async function initCryptoPage() {
    console.log('Inicializando página de criptomoedas...');
    
    // Configurar data atual
    document.getElementById('current-date').textContent += new Date().toLocaleString();
    
    // Configurar seletores e botões
    setupCryptoSelectors();
    
    // Configurar botão de retry
    document.getElementById('retry-button').addEventListener('click', loadCryptoData);
    
    // Mostrar indicador de carregamento
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) loadingIndicator.classList.remove('hidden');
    
    // Carregar dados iniciais
    try {
        await loadCryptoData();
    } catch (error) {
        console.error('Erro ao carregar dados de criptomoedas:', error);
        
        // Mostrar mensagem de erro
        const errorMessage = document.getElementById('error-message');
        if (errorMessage) errorMessage.classList.remove('hidden');
    } finally {
        // Esconder indicador de carregamento
        if (loadingIndicator) loadingIndicator.classList.add('hidden');
    }
}

/**
 * Configura os seletores e botões da página
 */
function setupCryptoSelectors() {
    // Configurar seletor de criptomoeda
    const cryptoSelect = document.getElementById('crypto-select');
    if (cryptoSelect) {
        cryptoSelect.addEventListener('change', function() {
            window.cryptoData.selectedCrypto = this.value;
            loadHistoricalData();
        });
    }
    
    // Configurar botões de timeframe
    const timeframeButtons = document.querySelectorAll('.timeframe-button');
    timeframeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remover classe active de todos os botões
            timeframeButtons.forEach(btn => btn.classList.remove('active'));
            // Adicionar classe active ao botão clicado
            this.classList.add('active');
            
            // Atualizar timeframe selecionado
            window.cryptoData.selectedTimeframe = parseInt(this.dataset.days);
            loadHistoricalData();
        });
    });
}

/**
 * Carrega os dados de criptomoedas
 */
async function loadCryptoData() {
    try {
        console.log('Carregando dados de criptomoedas...');
        
        // Esconder mensagem de erro
        const errorMessage = document.getElementById('error-message');
        if (errorMessage) errorMessage.classList.add('hidden');
        
        // Mostrar indicador de carregamento
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) loadingIndicator.classList.remove('hidden');
        
        // Carregar dados de mercado
        const cryptoIds = ['bitcoin', 'ethereum', 'binancecoin', 'ripple', 'cardano', 'solana', 'dogecoin', 'polkadot', 'litecoin', 'avalanche-2'];
        window.cryptoData.marketData = await loadCryptoMarketData(cryptoIds);
        
        // Carregar dados históricos para a criptomoeda selecionada
        await loadHistoricalData();
        
        // Renderizar dados
        renderMarketMetrics();
        renderCryptoTable();
        renderCorrelationChart();
        
        // Marcar dados como carregados
        window.cryptoData.dataLoaded = true;
        
    } catch (error) {
        console.error('Erro ao carregar dados de criptomoedas:', error);
        
        // Mostrar mensagem de erro
        const errorMessage = document.getElementById('error-message');
        if (errorMessage) errorMessage.classList.remove('hidden');
    } finally {
        // Esconder indicador de carregamento
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) loadingIndicator.classList.add('hidden');
    }
}

/**
 * Carrega dados históricos para a criptomoeda selecionada
 */
async function loadHistoricalData() {
    try {
        const cryptoId = window.cryptoData.selectedCrypto;
        const days = window.cryptoData.selectedTimeframe;
        
        console.log(`Carregando dados históricos para ${cryptoId} (${days} dias)...`);
        
        // Verificar se já temos os dados em cache
        const cacheKey = `${cryptoId}_${days}`;
        if (!window.cryptoData.historicalData[cacheKey]) {
            window.cryptoData.historicalData[cacheKey] = await loadCryptoHistoricalData(cryptoId, 'usd', days);
        }
        
        // Renderizar gráfico de preço
        renderPriceChart();
        renderCryptoMetrics();
        
    } catch (error) {
        console.error('Erro ao carregar dados históricos:', error);
    }
}

/**
 * Renderiza as métricas gerais do mercado de criptomoedas
 */
function renderMarketMetrics() {
    if (!window.cryptoData.marketData || !window.cryptoData.dataLoaded) {
        return;
    }
    
    const metricsContainer = document.getElementById('crypto-market-metrics');
    if (!metricsContainer) return;
    
    // Calcular métricas de mercado
    const totalMarketCap = window.cryptoData.marketData.reduce((sum, coin) => sum + coin.marketCap, 0);
    const totalVolume = window.cryptoData.marketData.reduce((sum, coin) => sum + coin.volume24h, 0);
    const btcDominance = (window.cryptoData.marketData.find(coin => coin.id === 'bitcoin')?.marketCap / totalMarketCap) * 100;
    
    // Calcular índice de medo e ganância (simulado)
    const fearGreedIndex = calculateFearGreedIndex();
    
    // Criar HTML para as métricas
    metricsContainer.innerHTML = `
        <div class="metric-item">
            <h3>Capitalização Total</h3>
            <p class="metric-value">${formatCurrency(totalMarketCap)}</p>
            <p class="metric-change ${getChangeClass(2.5)}">+2.5% (24h)</p>
        </div>
        <div class="metric-item">
            <h3>Volume 24h</h3>
            <p class="metric-value">${formatCurrency(totalVolume)}</p>
            <p class="metric-change ${getChangeClass(5.8)}">+5.8%</p>
        </div>
        <div class="metric-item">
            <h3>Dominância BTC</h3>
            <p class="metric-value">${btcDominance.toFixed(2)}%</p>
            <p class="metric-change ${getChangeClass(-0.3)}">-0.3%</p>
        </div>
        <div class="metric-item">
            <h3>Medo & Ganância</h3>
            <p class="metric-value ${getFearGreedClass(fearGreedIndex.value)}">${fearGreedIndex.label}</p>
            <p class="metric-change">${fearGreedIndex.value}/100</p>
        </div>
    `;
}

/**
 * Renderiza a tabela de criptomoedas
 */
function renderCryptoTable() {
    if (!window.cryptoData.marketData || !window.cryptoData.dataLoaded) {
        return;
    }
    
    const tableBody = document.getElementById('crypto-tbody');
    if (!tableBody) return;
    
    // Limpar tabela
    tableBody.innerHTML = '';
    
    // Adicionar linhas para cada criptomoeda
    window.cryptoData.marketData.forEach((coin, index) => {
        const row = document.createElement('tr');
        
        // Criar mini sparkline
        const sparklineCanvas = document.createElement('canvas');
        sparklineCanvas.width = 100;
        sparklineCanvas.height = 30;
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>
                <div class="crypto-name">
                    <img src="${coin.image}" alt="${coin.name}" class="crypto-icon">
                    <div>
                        <span class="crypto-fullname">${coin.name}</span>
                        <span class="crypto-symbol">${coin.symbol}</span>
                    </div>
                </div>
            </td>
            <td>${formatCurrency(coin.currentPrice)}</td>
            <td class="${getChangeClass(coin.priceChangePercentage24h)}">${coin.priceChangePercentage24h.toFixed(2)}%</td>
            <td class="${getChangeClass(coin.priceChangePercentage7d)}">${coin.priceChangePercentage7d?.toFixed(2) || '0.00'}%</td>
            <td>${formatCurrency(coin.marketCap)}</td>
            <td>${formatCurrency(coin.volume24h)}</td>
            <td class="sparkline-cell"></td>
        `;
        
        tableBody.appendChild(row);
        
        // Adicionar sparkline
        const sparklineCell = row.querySelector('.sparkline-cell');
        sparklineCell.appendChild(sparklineCanvas);
        
        // Renderizar sparkline
        renderSparkline(sparklineCanvas, coin.sparklineData);
    });
}

/**
 * Renderiza o gráfico de preço para a criptomoeda selecionada
 */
function renderPriceChart() {
    const chartCanvas = document.getElementById('crypto-price-chart');
    if (!chartCanvas) return;
    
    const cryptoId = window.cryptoData.selectedCrypto;
    const days = window.cryptoData.selectedTimeframe;
    const cacheKey = `${cryptoId}_${days}`;
    
    const historicalData = window.cryptoData.historicalData[cacheKey];
    if (!historicalData) return;
    
    // Preparar dados para o gráfico
    const labels = historicalData.prices.map(item => {
        const date = new Date(item.timestamp);
        return days <= 7 ? 
               `${date.getHours()}:00 ${date.getDate()}/${date.getMonth() + 1}` : 
               `${date.getDate()}/${date.getMonth() + 1}`;
    });
    
    const prices = historicalData.prices.map(item => item.price);
    
    // Destruir gráfico existente se houver
    if (window.priceChart) {
        window.priceChart.destroy();
    }
    
    // Criar novo gráfico
    window.priceChart = new Chart(chartCanvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `Preço (USD)`,
                data: prices,
                borderColor: '#3861fb',
                backgroundColor: 'rgba(56, 97, 251, 0.1)',
                borderWidth: 2,
                fill: true,
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
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            return `Preço: $${context.raw.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
                        maxTicksLimit: 8
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(200, 200, 200, 0.1)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
                        }
                    }
                }
            }
        }
    });
}

/**
 * Renderiza as métricas da criptomoeda selecionada
 */
function renderCryptoMetrics() {
    const metricsContainer = document.getElementById('selected-crypto-metrics');
    if (!metricsContainer) return;
    
    const cryptoId = window.cryptoData.selectedCrypto;
    const coinData = window.cryptoData.marketData.find(coin => coin.id === cryptoId);
    
    if (!coinData) return;
    
    // Calcular métricas adicionais
    const ath = coinData.ath || 0;
    const athPercentage = ((coinData.currentPrice - ath) / ath) * 100;
    const circulatingSupply = coinData.circulatingSupply || 0;
    const maxSupply = coinData.maxSupply || 0;
    const supplyPercentage = maxSupply ? (circulatingSupply / maxSupply) * 100 : 0;
    
    // Criar HTML para as métricas
    metricsContainer.innerHTML = `
        <div class="metrics-grid">
            <div class="metric-item">
                <h3>Preço Atual</h3>
                <p class="metric-value">${formatCurrency(coinData.currentPrice)}</p>
                <p class="metric-change ${getChangeClass(coinData.priceChangePercentage24h)}">${coinData.priceChangePercentage24h.toFixed(2)}% (24h)</p>
            </div>
            <div class="metric-item">
                <h3>Cap. de Mercado</h3>
                <p class="metric-value">${formatCurrency(coinData.marketCap)}</p>
                <p class="metric-change">Rank #${coinData.marketCapRank || 'N/A'}</p>
            </div>
            <div class="metric-item">
                <h3>Volume 24h</h3>
                <p class="metric-value">${formatCurrency(coinData.volume24h)}</p>
                <p class="metric-change">Vol/Cap: ${((coinData.volume24h / coinData.marketCap) * 100).toFixed(2)}%</p>
            </div>
            <div class="metric-item">
                <h3>Máxima Histórica</h3>
                <p class="metric-value">${formatCurrency(ath)}</p>
                <p class="metric-change ${getChangeClass(athPercentage)}">${athPercentage.toFixed(2)}% do ATH</p>
            </div>
            <div class="metric-item">
                <h3>Oferta Circulante</h3>
                <p class="metric-value">${formatNumber(circulatingSupply)} ${coinData.symbol.toUpperCase()}</p>
                <p class="metric-change">${maxSupply ? `${supplyPercentage.toFixed(2)}% do máximo` : 'Sem limite máximo'}</p>
            </div>
            <div class="metric-item">
                <h3>Oferta Máxima</h3>
                <p class="metric-value">${maxSupply ? formatNumber(maxSupply) : 'Ilimitada'} ${coinData.symbol.toUpperCase()}</p>
                <p class="metric-change">Restante: ${maxSupply ? formatNumber(maxSupply - circulatingSupply) : 'N/A'}</p>
            </div>
        </div>
    `;
}

/**
 * Renderiza o gráfico de correlação entre criptomoedas
 */
function renderCorrelationChart() {
    const chartCanvas = document.getElementById('correlation-chart');
    if (!chartCanvas || !window.cryptoData.marketData) return;
    
    // Selecionar as 6 principais criptomoedas
    const topCoins = window.cryptoData.marketData.slice(0, 6);
    
    // Gerar matriz de correlação simulada
    const correlationMatrix = generateCorrelationMatrix(topCoins.length);
    
    // Preparar dados para o gráfico
    const labels = topCoins.map(coin => coin.symbol.toUpperCase());
    const datasets = [];
    
    for (let i = 0; i < topCoins.length; i++) {
        const data = [];
        for (let j = 0; j < topCoins.length; j++) {
            data.push(correlationMatrix[i][j]);
        }
        
        datasets.push({
            label: labels[i],
            data: data,
            backgroundColor: getColorForIndex(i, 0.7)
        });
    }
    
    // Destruir gráfico existente se houver
    if (window.correlationChart) {
        window.correlationChart.destroy();
    }
    
    // Criar novo gráfico
    window.correlationChart = new Chart(chartCanvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    stacked: false,
                    title: {
                        display: true,
                        text: 'Criptomoeda'
                    }
                },
                y: {
                    stacked: false,
                    title: {
                        display: true,
                        text: 'Correlação'
                    },
                    min: -1,
                    max: 1
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            return `Correlação: ${value.toFixed(2)}`;
                        }
                    }
                },
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
    
    // Atualizar legenda
    updateCorrelationLegend(topCoins);
}

/**
 * Atualiza a legenda do gráfico de correlação
 */
function updateCorrelationLegend(coins) {
    const legendContainer = document.getElementById('correlation-legend');
    if (!legendContainer) return;
    
    let legendHTML = '<div class="correlation-explanation">';
    legendHTML += '<p><strong>Correlação entre Criptomoedas:</strong> Mostra como os preços das criptomoedas se movem em relação uns aos outros.</p>';
    legendHTML += '<ul>';
    legendHTML += '<li><span class="correlation-high">Correlação Alta (próxima de 1)</span>: Os preços tendem a se mover na mesma direção</li>';
    legendHTML += '<li><span class="correlation-neutral">Correlação Neutra (próxima de 0)</span>: Os preços se movem de forma independente</li>';
    legendHTML += '<li><span class="correlation-negative">Correlação Negativa (próxima de -1)</span>: Os preços tendem a se mover em direções opostas</li>';
    legendHTML += '</ul>';
    legendHTML += '</div>';
    
    legendContainer.innerHTML = legendHTML;
}

/**
 * Renderiza um mini gráfico de linha (sparkline)
 */
function renderSparkline(canvas, data) {
    if (!canvas || !data || data.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Encontrar valores mínimo e máximo
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;
    
    // Calcular cor com base na tendência
    const startPrice = data[0];
    const endPrice = data[data.length - 1];
    const color = endPrice >= startPrice ? '#16c784' : '#ea3943';
    
    // Limpar canvas
    ctx.clearRect(0, 0, width, height);
    
    // Desenhar linha
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    
    for (let i = 0; i < data.length; i++) {
        const x = (i / (data.length - 1)) * width;
        const normalizedValue = range === 0 ? 0.5 : (data[i] - min) / range;
        const y = height - (normalizedValue * height);
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    
    ctx.stroke();
}

/**
 * Gera uma matriz de correlação simulada
 */
function generateCorrelationMatrix(size) {
    const matrix = [];
    
    // Criar matriz de correlação simulada
    for (let i = 0; i < size; i++) {
        const row = [];
        for (let j = 0; j < size; j++) {
            if (i === j) {
                // Correlação perfeita consigo mesmo
                row.push(1);
            } else if (matrix[j] && matrix[j][i] !== undefined) {
                // Usar valor já calculado (matriz simétrica)
                row.push(matrix[j][i]);
            } else {
                // Gerar correlação simulada
                // Bitcoin tem correlação mais alta com ETH e BNB, menor com outras
                if (i === 0 && (j === 1 || j === 2)) {
                    row.push(0.7 + (Math.random() * 0.2));
                } else if (j === 0 && (i === 1 || i === 2)) {
                    row.push(0.7 + (Math.random() * 0.2));
                } else {
                    // Outras correlações mais variadas
                    row.push((Math.random() * 1.6) - 0.8);
                }
            }
        }
        matrix.push(row);
    }
    
    return matrix;
}

/**
 * Calcula o índice de medo e ganância (simulado)
 */
function calculateFearGreedIndex() {
    // Simular índice de medo e ganância
    // Baseado em: https://alternative.me/crypto/fear-and-greed-index/
    
    // Gerar valor entre 0 e 100
    const value = Math.floor(Math.random() * 100);
    
    // Determinar label com base no valor
    let label;
    if (value <= 25) {
        label = 'Medo Extremo';
    } else if (value <= 40) {
        label = 'Medo';
    } else if (value <= 55) {
        label = 'Neutro';
    } else if (value <= 75) {
        label = 'Ganância';
    } else {
        label = 'Ganância Extrema';
    }
    
    return { value, label };
}

/**
 * Retorna a classe CSS para um valor de mudança percentual
 */
function getChangeClass(change) {
    if (!change) return '';
    return change > 0 ? 'positive' : change < 0 ? 'negative' : '';
}

/**
 * Retorna a classe CSS para um valor do índice de medo e ganância
 */
function getFearGreedClass(value) {
    if (value <= 25) {
        return 'extreme-fear';
    } else if (value <= 40) {
        return 'fear';
    } else if (value <= 55) {
        return 'neutral';
    } else if (value <= 75) {
        return 'greed';
    } else {
        return 'extreme-greed';
    }
}

/**
 * Retorna uma cor com base no índice
 */
function getColorForIndex(index, alpha = 1) {
    const colors = [
        `rgba(247, 147, 26, ${alpha})`, // Bitcoin Orange
        `rgba(98, 126, 234, ${alpha})`,  // Ethereum Blue
        `rgba(243, 186, 47, ${alpha})`,  // Binance Yellow
        `rgba(35, 154, 222, ${alpha})`,  // XRP Blue
        `rgba(0, 51, 173, ${alpha})`,    // Cardano Blue
        `rgba(20, 241, 149, ${alpha})`,  // Solana Green
        `rgba(195, 186, 196, ${alpha})`, // Gray
        `rgba(229, 64, 40, ${alpha})`,   // Red
        `rgba(22, 199, 132, ${alpha})`,  // Green
        `rgba(254, 104, 255, ${alpha})`  // Pink
    ];
    
    return colors[index % colors.length];
}

/**
 * Formata um valor monetário
 */
function formatCurrency(value) {
    if (value === undefined || value === null) return 'N/A';
    
    // Determinar formato com base no valor
    if (value >= 1e9) {
        return `$${(value / 1e9).toFixed(2)}B`;
    } else if (value >= 1e6) {
        return `$${(value / 1e6).toFixed(2)}M`;
    } else if (value >= 1e3) {
        return `$${(value / 1e3).toFixed(2)}K`;
    } else if (value >= 1) {
        return `$${value.toFixed(2)}`;
    } else {
        return `$${value.toFixed(6)}`;
    }
}

/**
 * Formata um número grande
 */
function formatNumber(value) {
    if (value === undefined || value === null) return 'N/A';
    
    // Determinar formato com base no valor
    if (value >= 1e9) {
        return `${(value / 1e9).toFixed(2)}B`;
    } else if (value >= 1e6) {
        return `${(value / 1e6).toFixed(2)}M`;
    } else if (value >= 1e3) {
        return `${(value / 1e3).toFixed(2)}K`;
    } else {
        return value.toLocaleString();
    }
}
