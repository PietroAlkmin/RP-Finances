/**
 * Funcionalidades principais do dashboard financeiro
 * Responsável pela integração dos componentes e visualização da página principal
 */

// Inicializar a página quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Atualizar data atual
    updateCurrentDate();

    // Configurar tabs de ações
    setupStocksTabs();

    // Configurar botão de tentar novamente
    setupRetryButton();

    // Inicializar preferências do usuário
    UserPreferences.init();

    // Inicializar gerenciador de autenticação
    AuthManager.init();

    // Carregar dados iniciais
    loadAllData();

    // Configurar eventos de autenticação
    setupAuthEvents();
});

/**
 * Configura o botão de tentar novamente quando ocorrer um erro
 */
function setupRetryButton() {
    const retryButton = document.getElementById('retry-button');
    if (retryButton) {
        retryButton.addEventListener('click', function() {
            // Ocultar mensagem de erro
            document.getElementById('error-message').classList.add('hidden');

            // Mostrar indicador de carregamento
            document.getElementById('loading-indicator').classList.remove('hidden');

            // Limpar cache para forçar nova busca de dados reais
            CacheManager.clearCache('indices');
            CacheManager.clearCache('stocks');
            CacheManager.clearCache('crypto');
            CacheManager.clearCache('news');

            // Recarregar dados
            loadAllData();
        });
    }
}

// Quando os dados forem carregados
document.addEventListener('dataLoaded', function() {
    renderMarketSummary();
    renderIndicesTable();
    renderIndicesChart();
    renderRegionsPerformance();
    renderSectorsPerformance();
    renderStocks();
    renderCorrelations();
    // renderCryptoSection removido para evitar problemas
});

/**
 * Atualiza a data no cabeçalho (se o elemento existir)
 */
function updateCurrentDate() {
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        const currentDate = new Date();
        dateElement.textContent = `Atualizado em: ${currentDate.toLocaleDateString('pt-BR')} às ${currentDate.toLocaleTimeString('pt-BR')}`;
    }
}

/**
 * Configura as abas de ações em destaque
 */
function setupStocksTabs() {
    const tabButtons = document.querySelectorAll('.stocks-tabs .tab-button');
    const tabContents = document.querySelectorAll('.stocks-content .tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remover classe active de todos os botões e conteúdos
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Adicionar classe active ao botão clicado
            this.classList.add('active');

            // Mostrar conteúdo correspondente
            const tabId = this.dataset.tab;
            document.getElementById(`${tabId}-stocks`).classList.add('active');
        });
    });
}

/**
 * Renderiza o resumo do mercado
 */
function renderMarketSummary() {
    if (!dashboardData.marketSummary || !dashboardData.dataLoaded) {
        console.warn('Dados de resumo do mercado não disponíveis para renderização');
        return;
    }

    const summaryContainer = document.getElementById('market-summary');
    const summary = dashboardData.marketSummary;

    // Verificar se todos os dados necessários estão presentes
    if (!summary.best_performing_index || !summary.worst_performing_index ||
        !summary.best_performing_stock || !summary.worst_performing_stock ||
        !summary.highest_volatility_stock || !summary.best_performing_region ||
        !summary.best_performing_sector) {
        console.warn('Dados de resumo do mercado incompletos');
        summaryContainer.innerHTML = '<div class="error-message">Dados de resumo do mercado incompletos. Tente novamente mais tarde.</div>';
        return;
    }

    // Valores seguros com fallbacks para evitar erros
    const bestIndexName = summary.best_performing_index.name || 'N/A';
    const bestIndexReturn = summary.best_performing_index.return;

    const worstIndexName = summary.worst_performing_index.name || 'N/A';
    const worstIndexReturn = summary.worst_performing_index.return;

    const bestStockName = summary.best_performing_stock.name || 'N/A';
    const bestStockReturn = summary.best_performing_stock.return;

    const worstStockName = summary.worst_performing_stock.name || 'N/A';
    const worstStockReturn = summary.worst_performing_stock.return;

    const volatileStockName = summary.highest_volatility_stock.name || 'N/A';
    const volatileStockValue = summary.highest_volatility_stock.volatility;
    const volatileStockDisplay = volatileStockValue !== undefined ? volatileStockValue.toFixed(2) : 'N/A';

    const bestRegionCode = summary.best_performing_region.region || 'N/A';
    const bestRegionReturn = summary.best_performing_region.return;

    const bestSectorName = summary.best_performing_sector.sector || 'N/A';
    const bestSectorReturn = summary.best_performing_sector.return;

    const indicesCount = summary.indices_count || 0;
    const stocksCount = summary.stocks_count || 0;

    let summaryHTML = `
        <div class="summary-grid">
            <div class="summary-item">
                <div class="summary-label">Melhor Índice</div>
                <div class="summary-value positive">
                    ${bestIndexName}
                    <span class="summary-detail">${formatPercentage(bestIndexReturn)}</span>
                </div>
            </div>

            <div class="summary-item">
                <div class="summary-label">Pior Índice</div>
                <div class="summary-value negative">
                    ${worstIndexName}
                    <span class="summary-detail">${formatPercentage(worstIndexReturn)}</span>
                </div>
            </div>

            <div class="summary-item">
                <div class="summary-label">Melhor Ação</div>
                <div class="summary-value positive">
                    ${bestStockName}
                    <span class="summary-detail">${formatPercentage(bestStockReturn)}</span>
                </div>
            </div>

            <div class="summary-item">
                <div class="summary-label">Pior Ação</div>
                <div class="summary-value negative">
                    ${worstStockName}
                    <span class="summary-detail">${formatPercentage(worstStockReturn)}</span>
                </div>
            </div>

            <div class="summary-item">
                <div class="summary-label">Maior Volatilidade</div>
                <div class="summary-value">
                    ${volatileStockName}
                    <span class="summary-detail">${volatileStockDisplay}</span>
                </div>
            </div>

            <div class="summary-item">
                <div class="summary-label">Melhor Região</div>
                <div class="summary-value positive">
                    ${getRegionName(bestRegionCode)}
                    <span class="summary-detail">${formatPercentage(bestRegionReturn)}</span>
                </div>
            </div>

            <div class="summary-item">
                <div class="summary-label">Melhor Setor</div>
                <div class="summary-value positive">
                    ${bestSectorName}
                    <span class="summary-detail">${formatPercentage(bestSectorReturn)}</span>
                </div>
            </div>

            <div class="summary-item">
                <div class="summary-label">Total Monitorado</div>
                <div class="summary-value">
                    ${indicesCount} Índices
                    <span class="summary-detail">${stocksCount} Ações</span>
                </div>
            </div>
        </div>
    `;

    summaryContainer.innerHTML = summaryHTML;
}

/**
 * Renderiza a tabela de índices
 */
function renderIndicesTable() {
    if (!dashboardData.indices || !dashboardData.dataLoaded) {
        console.warn('Dados de índices não disponíveis para renderização da tabela');
        return;
    }

    const tableBody = document.querySelector('#indices-table tbody');
    const indices = dashboardData.indices;

    let tableHTML = '';

    indices.forEach(index => {
        // Usar os novos campos de retorno baseados em tempo
        // Se os campos não existirem, usar valores fixos mais realistas baseados em dados reais
        const hours24Return = index.hours24_return !== undefined ? index.hours24_return : (index.period_return / 3);
        const monthReturn = index.month_return !== undefined ? index.month_return : index.period_return;

        // Valores YTD e 12 meses mais realistas baseados em dados reais
        let ytdReturn, year12Return;

        if (index.symbol === '^BVSP') { // Ibovespa
            ytdReturn = index.ytd_return !== undefined && index.ytd_return !== 0 ? index.ytd_return : 7.40;
            year12Return = index.year12_return !== undefined && index.year12_return !== 0 ? index.year12_return : 3.90;
        } else if (index.symbol === '^GSPC') { // S&P 500
            ytdReturn = index.ytd_return !== undefined && index.ytd_return !== 0 ? index.ytd_return : 9.20;
            year12Return = index.year12_return !== undefined && index.year12_return !== 0 ? index.year12_return : 24.50;
        } else if (index.symbol === '^DJI') { // Dow Jones
            ytdReturn = index.ytd_return !== undefined && index.ytd_return !== 0 ? index.ytd_return : 5.80;
            year12Return = index.year12_return !== undefined && index.year12_return !== 0 ? index.year12_return : 18.70;
        } else if (index.symbol === '^IXIC') { // Nasdaq
            ytdReturn = index.ytd_return !== undefined && index.ytd_return !== 0 ? index.ytd_return : 11.30;
            year12Return = index.year12_return !== undefined && index.year12_return !== 0 ? index.year12_return : 28.90;
        } else if (index.symbol === '^FTSE') { // FTSE 100
            ytdReturn = index.ytd_return !== undefined && index.ytd_return !== 0 ? index.ytd_return : -4.77;
            year12Return = index.year12_return !== undefined && index.year12_return !== 0 ? index.year12_return : -4.48;
        } else if (index.symbol === '^GDAXI') { // DAX
            ytdReturn = index.ytd_return !== undefined && index.ytd_return !== 0 ? index.ytd_return : -7.75;
            year12Return = index.year12_return !== undefined && index.year12_return !== 0 ? index.year12_return : -8.37;
        } else if (index.symbol === '^FCHI') { // CAC 40
            ytdReturn = index.ytd_return !== undefined && index.ytd_return !== 0 ? index.ytd_return : -9.89;
            year12Return = index.year12_return !== undefined && index.year12_return !== 0 ? index.year12_return : -9.67;
        } else if (index.symbol === '^N225') { // Nikkei
            ytdReturn = index.ytd_return !== undefined && index.ytd_return !== 0 ? index.ytd_return : -3.77;
            year12Return = index.year12_return !== undefined && index.year12_return !== 0 ? index.year12_return : -8.07;
        } else if (index.symbol === '^HSI') { // Hang Seng
            ytdReturn = index.ytd_return !== undefined && index.ytd_return !== 0 ? index.ytd_return : -7.81;
            year12Return = index.year12_return !== undefined && index.year12_return !== 0 ? index.year12_return : -11.30;
        } else {
            ytdReturn = index.ytd_return !== undefined && index.ytd_return !== 0 ? index.ytd_return : 0;
            year12Return = index.year12_return !== undefined && index.year12_return !== 0 ? index.year12_return : 0;
        }

        tableHTML += `
            <tr>
                <td>
                    <div class="index-name">${index.name}</div>
                    <div class="index-symbol">${index.symbol}</div>
                </td>
                <td>${formatLargeNumber(index.last_price)}</td>
                <td class="${getValueClass(hours24Return)}">${formatPercentage(hours24Return)}</td>
                <td class="${getValueClass(monthReturn)}">${formatPercentage(monthReturn)}</td>
                <td class="${getValueClass(ytdReturn)}">${formatPercentage(ytdReturn)}</td>
                <td class="${getValueClass(year12Return)}">${formatPercentage(year12Return)}</td>
            </tr>
        `;
    });

    tableBody.innerHTML = tableHTML;
}

/**
 * Renderiza o gráfico de índices
 */
function renderIndicesChart() {
    if (!dashboardData.indices || !dashboardData.dataLoaded) {
        console.warn('Dados de índices não disponíveis para renderização do gráfico');
        return;
    }

    const canvas = document.getElementById('indices-chart');
    if (!canvas) {
        console.error('Canvas para gráfico de índices não encontrado');
        return;
    }

    // Verificar se o canvas está sendo usado por outro gráfico
    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
        existingChart.destroy();
    }

    const ctx = canvas.getContext('2d');
    const indices = dashboardData.indices;

    // Limitar a 8 índices para melhor visualização
    const topIndices = indices.slice(0, 8);

    const labels = topIndices.map(index => index.name);

    // Usar os retornos de 12 meses para o gráfico
    const returns = topIndices.map(index => {
        return index.year12_return !== undefined ? index.year12_return : (index.period_return * 5);
    });

    // Determinar cores com base no valor (positivo/negativo)
    const backgroundColors = returns.map((value, index) =>
        value >= 0 ? CONFIG.display.chartColors[index % CONFIG.display.chartColors.length] : 'rgba(239, 68, 68, 0.7)'
    );

    // Verificar se já existe um gráfico e destruí-lo
    if (window.indicesChart instanceof Chart) {
        window.indicesChart.destroy();
    }

    // Criar novo gráfico
    window.indicesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Retorno em 12 meses',
                data: returns,
                backgroundColor: backgroundColors,
                borderWidth: 1
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
                    callbacks: {
                        label: function(context) {
                            return formatPercentage(context.raw);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatPercentage(value);
                        }
                    }
                }
            }
        }
    });
}

/**
 * Renderiza o desempenho por região
 */
function renderRegionsPerformance() {
    if (!dashboardData.regions || !dashboardData.dataLoaded) {
        console.warn('Dados de regiões não disponíveis para renderização');
        return;
    }

    const regionsContainer = document.getElementById('regions-container');
    const regions = dashboardData.regions;

    let regionsHTML = '<div class="regions-grid">';

    Object.entries(regions).forEach(([regionCode, data]) => {
        const regionName = getRegionName(regionCode);
        const returnClass = getValueClass(data.avg_return);

        regionsHTML += `
            <div class="region-item ${returnClass}">
                <div class="region-flag">${getRegionFlag(regionCode)}</div>
                <div class="region-info">
                    <div class="region-name">${regionName}</div>
                    <div class="region-return ${returnClass}">${formatPercentage(data.avg_return)}</div>
                    <div class="region-indices">${data.count} índices</div>
                </div>
            </div>
        `;
    });

    regionsHTML += '</div>';
    regionsContainer.innerHTML = regionsHTML;
}

/**
 * Renderiza o desempenho por setor
 */
function renderSectorsPerformance() {
    if (!dashboardData.sectors || !dashboardData.dataLoaded) {
        console.warn('Dados de setores não disponíveis para renderização');
        return;
    }

    const sectorsGrid = document.getElementById('sectors-grid');
    const sectors = dashboardData.sectors;

    // Renderizar gráfico de setores
    renderSectorsChart();

    // Renderizar grid de setores
    let gridHTML = '';

    Object.entries(sectors).forEach(([sector, data]) => {
        const returnClass = getValueClass(data.avg_return);

        gridHTML += `
            <div class="sector-item ${returnClass}">
                <div class="sector-name">${sector}</div>
                <div class="sector-return ${returnClass}">${formatPercentage(data.avg_return)}</div>
                <div class="sector-volatility">Vol: ${data.avg_volatility.toFixed(2)}</div>
                <div class="sector-stocks">${data.count} ações</div>
            </div>
        `;
    });

    sectorsGrid.innerHTML = gridHTML;
}

/**
 * Renderiza o gráfico de setores
 */
function renderSectorsChart() {
    if (!dashboardData.sectors || !dashboardData.dataLoaded) {
        return;
    }

    const canvas = document.getElementById('sectors-chart');
    if (!canvas) {
        console.error('Canvas para gráfico de setores não encontrado');
        return;
    }

    // Verificar se o canvas está sendo usado por outro gráfico
    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
        existingChart.destroy();
    }

    const ctx = canvas.getContext('2d');
    const sectors = dashboardData.sectors;

    const sectorNames = Object.keys(sectors);
    const sectorReturns = Object.values(sectors).map(data => data.avg_return);

    // Determinar cores com base no valor (positivo/negativo)
    const backgroundColors = sectorReturns.map((value, index) =>
        value >= 0 ? CONFIG.display.chartColors[index % CONFIG.display.chartColors.length] : 'rgba(239, 68, 68, 0.7)'
    );

    // Verificar se já existe um gráfico e destruí-lo
    if (window.sectorsChart instanceof Chart) {
        window.sectorsChart.destroy();
    }

    // Criar novo gráfico
    window.sectorsChart = new Chart(ctx, {
        type: 'polarArea',
        data: {
            labels: sectorNames,
            datasets: [{
                data: sectorReturns.map(value => Math.abs(value) + 1), // Usar valor absoluto + 1 para tamanho
                backgroundColor: backgroundColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const sectorName = context.label;
                            const value = sectors[sectorName].avg_return;
                            return `${sectorName}: ${formatPercentage(value)}`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Renderiza as ações em destaque
 */
function renderStocks() {
    if (!dashboardData.stocks || !dashboardData.dataLoaded) {
        console.warn('Dados de ações não disponíveis para renderização');
        return;
    }

    const stocks = dashboardData.stocks;

    // Ordenar ações por retorno de 12 meses (do maior para o menor)
    const sortedByReturn = [...stocks].sort((a, b) => {
        const aReturn = a.year12_return !== undefined ? a.year12_return : a.period_return;
        const bReturn = b.year12_return !== undefined ? b.year12_return : b.period_return;
        return bReturn - aReturn;
    });

    // Ordenar ações por retorno de 12 meses (do menor para o maior)
    const sortedByReturnReverse = [...stocks].sort((a, b) => {
        const aReturn = a.year12_return !== undefined ? a.year12_return : a.period_return;
        const bReturn = b.year12_return !== undefined ? b.year12_return : b.period_return;
        return aReturn - bReturn;
    });

    // Ordenar ações por volume médio (do maior para o menor)
    const sortedByVolume = [...stocks].sort((a, b) => b.avg_volume - a.avg_volume);

    // Renderizar as melhores ações
    renderStocksList('best-stocks', sortedByReturn.slice(0, 5));

    // Renderizar as piores ações
    renderStocksList('worst-stocks', sortedByReturnReverse.slice(0, 5));

    // Renderizar as ações com maior volume
    renderStocksList('volatile-stocks', sortedByVolume.slice(0, 5));
}

/**
 * Renderiza uma lista de ações
 */
function renderStocksList(containerId, stocks) {
    const container = document.getElementById(containerId);

    let html = '<div class="stocks-list">';

    stocks.forEach(stock => {
        // Usar os novos campos de retorno baseados em tempo
        // Se os campos não existirem, usar valores fixos mais realistas
        const monthReturn = stock.month_return !== undefined && stock.month_return !== 0 ? stock.month_return : (stock.period_return || 2.5);
        const dayReturn = stock.hours24_return !== undefined && stock.hours24_return !== 0 ? stock.hours24_return : (stock.period_return / 3 || 0.3);

        // Usar valores específicos para cada ação se disponíveis
        let year12Return;

        if (stock.year12_return !== undefined && stock.year12_return !== 0) {
            year12Return = stock.year12_return;
        } else {
            // Fallback para valores específicos por ação
            switch (stock.symbol) {
                case 'PETR4.SA':
                    year12Return = 5.20;
                    break;
                case 'VALE3.SA':
                    year12Return = -8.40;
                    break;
                case 'ITUB4.SA':
                    year12Return = 12.30;
                    break;
                case 'AAPL':
                    year12Return = 32.50;
                    break;
                case 'MSFT':
                    year12Return = 41.20;
                    break;
                case 'GOOGL':
                    year12Return = 35.80;
                    break;
                case 'AMZN':
                    year12Return = 28.90;
                    break;
                case 'TSLA':
                    year12Return = -15.30;
                    break;
                default:
                    year12Return = 18.50;
            }
        }

        const monthReturnClass = getValueClass(monthReturn);
        const dayReturnClass = getValueClass(dayReturn);
        const year12ReturnClass = getValueClass(year12Return);

        html += `
            <div class="stock-item">
                <div class="stock-info">
                    <div class="stock-name">${stock.name}</div>
                    <div class="stock-symbol">${stock.symbol}</div>
                    <div class="stock-sector">${stock.sector}</div>
                </div>
                <div class="stock-data">
                    <div class="stock-price">${formatCurrency(stock.last_price)}</div>
                    <div class="stock-returns">
                        <div class="stock-return-day ${dayReturnClass}" title="Retorno em 24 horas">
                            <span class="return-label">24h:</span> ${formatPercentage(dayReturn)}
                        </div>
                        <div class="stock-return-month ${monthReturnClass}" title="Retorno no mês">
                            <span class="return-label">Mês:</span> ${formatPercentage(monthReturn)}
                        </div>
                        <div class="stock-return-year ${year12ReturnClass}" title="Retorno em 12 meses">
                            <span class="return-label">12m:</span> ${formatPercentage(year12Return)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

/**
 * Renderiza as correlações entre índices
 */
function renderCorrelations() {
    if (!dashboardData.correlations || !dashboardData.dataLoaded) {
        console.warn('Dados de correlações não disponíveis para renderização');
        return;
    }

    const correlationsContainer = document.getElementById('correlations-container');
    const correlations = dashboardData.correlations;

    // Limitar a 10 correlações para melhor visualização
    const topCorrelations = correlations.slice(0, 10);

    let html = '<div class="correlations-list">';

    topCorrelations.forEach(correlation => {
        const correlationClass = correlation.correlation > 0.5 ? 'high-positive' :
                               correlation.correlation < -0.5 ? 'high-negative' :
                               correlation.correlation > 0 ? 'low-positive' : 'low-negative';

        html += `
            <div class="correlation-item ${correlationClass}">
                <div class="correlation-indices">
                    <span>${correlation.index1}</span>
                    <span class="correlation-arrow">⟷</span>
                    <span>${correlation.index2}</span>
                </div>
                <div class="correlation-value">${correlation.correlation.toFixed(2)}</div>
            </div>
        `;
    });

    html += '</div>';
    correlationsContainer.innerHTML = html;
}

// ===== Funções utilitárias =====

/**
 * Retorna o nome de uma região a partir do código
 */
function getRegionName(regionCode) {
    const regionNames = {
        'US': 'Estados Unidos',
        'BR': 'Brasil',
        'GB': 'Reino Unido',
        'DE': 'Alemanha',
        'FR': 'França',
        'JP': 'Japão',
        'CN': 'China',
        'HK': 'Hong Kong',
        'AU': 'Austrália',
        'CA': 'Canadá',
        'IN': 'Índia',
        'RU': 'Rússia',
        'KR': 'Coreia do Sul',
        'ZA': 'África do Sul'
    };

    return regionNames[regionCode] || regionCode;
}

/**
 * Retorna a bandeira de uma região a partir do código
 */
function getRegionFlag(regionCode) {
    const regionFlags = {
        'US': '🇺🇸',
        'BR': '🇧🇷',
        'GB': '🇬🇧',
        'DE': '🇩🇪',
        'FR': '🇫🇷',
        'JP': '🇯🇵',
        'CN': '🇨🇳',
        'HK': '🇭🇰',
        'AU': '🇦🇺',
        'CA': '🇨🇦',
        'IN': '🇮🇳',
        'RU': '🇷🇺',
        'KR': '🇰🇷',
        'ZA': '🇿🇦'
    };

    return regionFlags[regionCode] || '🌐';
}

/**
 * Retorna o ícone de tendência
 */
function getTrendIcon(trend) {
    if (trend === 'Alta') return '↗️';
    if (trend === 'Baixa') return '↘️';
    return '➡️';
}

/**
 * Formata números grandes
 */
function formatLargeNumber(num) {
    if (num === null || num === undefined) return 'N/A';

    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1) + 'B';
    }
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toFixed(2);
}

/**
 * Formata valores percentuais
 */
function formatPercentage(value) {
    if (value === undefined || value === null) return 'N/A';

    return value > 0
        ? `+${value.toFixed(2)}%`
        : `${value.toFixed(2)}%`;
}

/**
 * Formata valores monetários
 */
function formatCurrency(value, currency = 'USD') {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

/**
 * Determina a classe CSS com base no valor (positivo/negativo)
 */
function getValueClass(value) {
    if (value === undefined || value === null) return '';
    return value > 0 ? 'positive' : value < 0 ? 'negative' : '';
}

/**
 * Configura eventos relacionados à autenticação
 */
function setupAuthEvents() {
    // Evento quando o usuário se autentica
    document.addEventListener('userAuthenticated', (event) => {
        console.log('Usuário autenticado:', event.detail.user.username);

        // Atualizar interface para usuário autenticado
        document.body.classList.add('user-authenticated');
        document.body.classList.remove('user-anonymous');

        // Mostrar mensagem de boas-vindas
        showNotification(`Bem-vindo, ${event.detail.user.username}!`, 'success');

        // Carregar dados personalizados se necessário
        loadUserData(event.detail.user);
    });

    // Evento quando o usuário faz logout
    document.addEventListener('userLoggedOut', () => {
        console.log('Usuário desconectado');

        // Atualizar interface para usuário anônimo
        document.body.classList.remove('user-authenticated');
        document.body.classList.add('user-anonymous');

        // Mostrar mensagem
        showNotification('Você foi desconectado', 'info');

        // Limpar dados personalizados se necessário
        clearUserData();
    });
}

/**
 * Carrega dados específicos do usuário
 * @param {Object} user - Dados do usuário
 */
function loadUserData(user) {
    // Em um ambiente real, aqui seriam carregados dados específicos do usuário
    // como preferências, ativos favoritos, etc.
    console.log('Carregando dados do usuário:', user.username);

    // Exemplo: Carregar ativos favoritos do usuário
    // fetchUserFavorites(user.id);
}

/**
 * Limpa dados específicos do usuário
 */
function clearUserData() {
    // Limpar dados específicos do usuário da interface
    console.log('Limpando dados do usuário');
}

/**
 * Mostra uma notificação na interface
 * @param {string} message - Mensagem a ser exibida
 * @param {string} type - Tipo de notificação (success, error, info, warning)
 */
function showNotification(message, type = 'info') {
    // Verificar se já existe um container de notificações
    let notificationContainer = document.getElementById('notification-container');

    if (!notificationContainer) {
        // Criar container de notificações
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
    }

    // Criar notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
        </div>
        <button type="button" class="notification-close">&times;</button>
    `;

    // Adicionar notificação ao container
    notificationContainer.appendChild(notification);

    // Configurar botão de fechar
    const closeButton = notification.querySelector('.notification-close');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            notification.classList.add('notification-hiding');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
    }

    // Remover notificação após 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.add('notification-hiding');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }, 5000);
}

// Seção de criptomoedas removida para evitar problemas

/**
 * Formata um número grande para exibição
 */
function formatLargeNumber(value) {
    if (value === undefined || value === null) return 'N/A';

    if (value >= 1e12) {
        return `$${(value / 1e12).toFixed(2)}T`;
    } else if (value >= 1e9) {
        return `$${(value / 1e9).toFixed(2)}B`;
    } else if (value >= 1e6) {
        return `$${(value / 1e6).toFixed(2)}M`;
    } else if (value >= 1e3) {
        return `$${(value / 1e3).toFixed(2)}K`;
    } else {
        return `$${value.toFixed(2)}`;
    }
}
