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
 * Atualiza a data no cabeçalho
 */
function updateCurrentDate() {
    const dateElement = document.getElementById('current-date');
    const currentDate = new Date();
    dateElement.textContent = `Atualizado em: ${currentDate.toLocaleDateString('pt-BR')} às ${currentDate.toLocaleTimeString('pt-BR')}`;
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

    let summaryHTML = `
        <div class="summary-grid">
            <div class="summary-item">
                <div class="summary-label">Melhor Índice</div>
                <div class="summary-value positive">
                    ${summary.best_performing_index.name}
                    <span class="summary-detail">${formatPercentage(summary.best_performing_index.return)}</span>
                </div>
            </div>

            <div class="summary-item">
                <div class="summary-label">Pior Índice</div>
                <div class="summary-value negative">
                    ${summary.worst_performing_index.name}
                    <span class="summary-detail">${formatPercentage(summary.worst_performing_index.return)}</span>
                </div>
            </div>

            <div class="summary-item">
                <div class="summary-label">Melhor Ação</div>
                <div class="summary-value positive">
                    ${summary.best_performing_stock.name}
                    <span class="summary-detail">${formatPercentage(summary.best_performing_stock.return)}</span>
                </div>
            </div>

            <div class="summary-item">
                <div class="summary-label">Pior Ação</div>
                <div class="summary-value negative">
                    ${summary.worst_performing_stock.name}
                    <span class="summary-detail">${formatPercentage(summary.worst_performing_stock.return)}</span>
                </div>
            </div>

            <div class="summary-item">
                <div class="summary-label">Maior Volatilidade</div>
                <div class="summary-value">
                    ${summary.highest_volatility_stock.name}
                    <span class="summary-detail">${summary.highest_volatility_stock.volatility.toFixed(2)}</span>
                </div>
            </div>

            <div class="summary-item">
                <div class="summary-label">Melhor Região</div>
                <div class="summary-value positive">
                    ${getRegionName(summary.best_performing_region.region)}
                    <span class="summary-detail">${formatPercentage(summary.best_performing_region.return)}</span>
                </div>
            </div>

            <div class="summary-item">
                <div class="summary-label">Melhor Setor</div>
                <div class="summary-value positive">
                    ${summary.best_performing_sector.sector}
                    <span class="summary-detail">${formatPercentage(summary.best_performing_sector.return)}</span>
                </div>
            </div>

            <div class="summary-item">
                <div class="summary-label">Total Monitorado</div>
                <div class="summary-value">
                    ${summary.indices_count} Índices
                    <span class="summary-detail">${summary.stocks_count} Ações</span>
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
        tableHTML += `
            <tr>
                <td>
                    <div class="index-name">${index.name}</div>
                    <div class="index-symbol">${index.symbol}</div>
                </td>
                <td>${formatLargeNumber(index.last_price)}</td>
                <td class="${getValueClass(index.period_return)}">${formatPercentage(index.period_return)}</td>
                <td class="${getValueClass(index.week_return)}">${formatPercentage(index.week_return)}</td>
                <td>${index.volatility.toFixed(2)}</td>
                <td>${getTrendIcon(index.trend)} ${index.trend}</td>
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
    const returns = topIndices.map(index => index.period_return);

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
                label: 'Retorno do Período',
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

    // Ordenar ações por retorno (do maior para o menor)
    const sortedByReturn = [...stocks].sort((a, b) => b.period_return - a.period_return);

    // Ordenar ações por retorno (do menor para o maior)
    const sortedByReturnReverse = [...stocks].sort((a, b) => a.period_return - b.period_return);

    // Ordenar ações por volatilidade (do maior para o menor)
    const sortedByVolatility = [...stocks].sort((a, b) => b.volatility - a.volatility);

    // Renderizar as melhores ações
    renderStocksList('best-stocks', sortedByReturn.slice(0, 5));

    // Renderizar as piores ações
    renderStocksList('worst-stocks', sortedByReturnReverse.slice(0, 5));

    // Renderizar as ações mais voláteis
    renderStocksList('volatile-stocks', sortedByVolatility.slice(0, 5));
}

/**
 * Renderiza uma lista de ações
 */
function renderStocksList(containerId, stocks) {
    const container = document.getElementById(containerId);

    let html = '<div class="stocks-list">';

    stocks.forEach(stock => {
        const returnClass = getValueClass(stock.period_return);

        html += `
            <div class="stock-item">
                <div class="stock-info">
                    <div class="stock-name">${stock.name}</div>
                    <div class="stock-symbol">${stock.symbol}</div>
                    <div class="stock-sector">${stock.sector}</div>
                </div>
                <div class="stock-data">
                    <div class="stock-price">${formatCurrency(stock.last_price)}</div>
                    <div class="stock-return ${returnClass}">${formatPercentage(stock.period_return)}</div>
                    <div class="stock-volatility">Vol: ${stock.volatility.toFixed(2)}</div>
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
