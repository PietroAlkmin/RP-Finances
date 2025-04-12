/**
 * Funcionalidades específicas para a página de melhores ativos
 * Responsável pela interatividade e visualização dos melhores ativos
 */

// Objeto global para armazenar dados da página de melhores ativos
const bestAssetsData = {
    assets: null,
    categories: null,
    period: CONFIG.display.defaultPeriod,
    assetType: CONFIG.display.defaultAssetType,
    dataLoaded: false,
    lastUpdate: null
};

// Inicializar a página quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Configurar filtros
    setupFilters();

    // Atualizar data atual
    updateCurrentDate();

    // Configurar botão de tentar novamente
    setupRetryButton();

    // Inicializar preferências do usuário
    UserPreferences.init();

    // Inicializar gerenciador de autenticação
    AuthManager.init();

    // Limpar todo o cache para garantir dados frescos com a nova chave de API
    console.log('Limpando todo o cache para usar a nova chave de API...');
    CacheManager.clearAllCache();

    // Carregar dados iniciais
    loadBestAssetsData(bestAssetsData.period, bestAssetsData.assetType);

    // Configurar eventos de autenticação
    setupAuthEvents();
});

// Quando os dados forem carregados
document.addEventListener('bestAssetsDataLoaded', function() {
    renderBestAssetsTable();
    renderBestAssetsChart();
    renderCategoryPerformance();
    setupComparisonTool();
});

/**
 * Configura os filtros de período e tipo de ativo
 */
function setupFilters() {
    // Filtros de período
    const periodButtons = document.querySelectorAll('.period-filter .filter-button');
    periodButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remover classe active de todos os botões
            periodButtons.forEach(btn => btn.classList.remove('active'));

            // Adicionar classe active ao botão clicado
            this.classList.add('active');

            // Atualizar período selecionado
            bestAssetsData.period = this.dataset.period;

            // Recarregar dados com novo período
            loadBestAssetsData(bestAssetsData.period, bestAssetsData.assetType);
        });
    });

    // Filtros de tipo de ativo
    const typeButtons = document.querySelectorAll('.asset-type-filter .filter-button');
    typeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remover classe active de todos os botões
            typeButtons.forEach(btn => btn.classList.remove('active'));

            // Adicionar classe active ao botão clicado
            this.classList.add('active');

            // Atualizar tipo de ativo selecionado
            bestAssetsData.assetType = this.dataset.type;

            // Recarregar dados com novo tipo
            loadBestAssetsData(bestAssetsData.period, bestAssetsData.assetType);
        });
    });
}

/**
 * Atualiza a data no cabeçalho
 */
function updateCurrentDate() {
    const dateElement = document.getElementById('current-date');
    const currentDate = new Date();
    dateElement.textContent = `Atualizado em: ${currentDate.toLocaleDateString('pt-BR')} às ${currentDate.toLocaleTimeString('pt-BR')}`;
}

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
            loadBestAssetsData(bestAssetsData.period, bestAssetsData.assetType);
        });
    }
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
 * Renderiza a tabela de melhores ativos
 */
function renderBestAssetsTable() {
    if (!bestAssetsData.assets || !bestAssetsData.dataLoaded) {
        console.warn('Dados de ativos não disponíveis para renderização da tabela');
        return;
    }

    const tableBody = document.getElementById('best-assets-tbody');
    const assets = bestAssetsData.assets;
    const period = bestAssetsData.period;

    // Campo de retorno baseado no período selecionado
    const returnField = period === 'week' ? 'week_return' : period === 'month' ? 'month_return' : 'year_return';

    let tableHTML = '';

    assets.forEach(asset => {
        const assetTypeLabel = getAssetTypeLabel(asset.type);
        const volumeDisplay = asset.volume ? formatLargeNumber(asset.volume) : 'N/A';

        tableHTML += `
            <tr>
                <td>
                    <div class="asset-name">${asset.name}</div>
                    <div class="asset-symbol">${asset.symbol}</div>
                </td>
                <td><span class="asset-type-badge ${asset.type}">${assetTypeLabel}</span></td>
                <td>${formatCurrency(asset.last_price)}</td>
                <td class="${getValueClass(asset[returnField])}">${formatPercentage(asset[returnField])}</td>
                <td>${volumeDisplay}</td>
                <td>${getTrendIcon(asset.trend)} ${asset.trend}</td>
            </tr>
        `;
    });

    tableBody.innerHTML = tableHTML;
}

/**
 * Renderiza o gráfico de melhores ativos
 */
function renderBestAssetsChart() {
    if (!bestAssetsData.assets || !bestAssetsData.dataLoaded) {
        console.warn('Dados de ativos não disponíveis para renderização do gráfico');
        return;
    }

    const ctx = document.getElementById('best-assets-chart').getContext('2d');
    const assets = bestAssetsData.assets;
    const period = bestAssetsData.period;

    // Campo de retorno baseado no período selecionado
    const returnField = period === 'week' ? 'week_return' : period === 'month' ? 'month_return' : 'year_return';

    // Limitar a 10 ativos para melhor visualização
    const topAssets = assets.slice(0, 10);

    const labels = topAssets.map(asset => asset.name);
    const returns = topAssets.map(asset => asset[returnField]);

    // Determinar cores com base no valor (positivo/negativo)
    const backgroundColors = returns.map(value =>
        value >= 0 ? 'rgba(16, 185, 129, 0.7)' : 'rgba(239, 68, 68, 0.7)'
    );

    const borderColors = returns.map(value =>
        value >= 0 ? 'rgba(16, 185, 129, 1)' : 'rgba(239, 68, 68, 1)'
    );

    // Verificar se já existe um gráfico e destruí-lo
    if (window.bestAssetsChart instanceof Chart) {
        window.bestAssetsChart.destroy();
    }

    // Criar novo gráfico
    window.bestAssetsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: `Retorno (${getPeriodLabel(period)})`,
                data: returns,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
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
 * Renderiza o desempenho por categoria
 */
function renderCategoryPerformance() {
    if (!bestAssetsData.categories || !bestAssetsData.dataLoaded) {
        console.warn('Dados de categorias não disponíveis para renderização');
        return;
    }

    const categoriesGrid = document.getElementById('categories-grid');
    const categories = bestAssetsData.categories;

    // Renderizar gráfico de categorias
    renderCategoryChart();

    // Renderizar grid de categorias
    let gridHTML = '';

    Object.entries(categories).forEach(([type, data]) => {
        const typeLabel = getAssetTypeLabel(type);

        gridHTML += `
            <div class="category-item">
                <div class="category-name">${typeLabel}</div>
                <div class="category-return ${getValueClass(data.avg_return)}">${formatPercentage(data.avg_return)}</div>
                <div class="category-count">${data.count} ativos</div>
            </div>
        `;
    });

    categoriesGrid.innerHTML = gridHTML;
}

/**
 * Renderiza o gráfico de desempenho por categoria
 */
function renderCategoryChart() {
    if (!bestAssetsData.categories || !bestAssetsData.dataLoaded) {
        return;
    }

    const ctx = document.getElementById('category-performance-chart').getContext('2d');
    const categories = bestAssetsData.categories;

    const categoryNames = Object.keys(categories).map(type => getAssetTypeLabel(type));
    const categoryReturns = Object.values(categories).map(data => data.avg_return);

    // Determinar cores com base no valor (positivo/negativo)
    const backgroundColors = categoryReturns.map((value, index) =>
        value >= 0 ? CONFIG.display.chartColors[index % CONFIG.display.chartColors.length] : 'rgba(239, 68, 68, 0.7)'
    );

    // Verificar se já existe um gráfico e destruí-lo
    if (window.categoryChart instanceof Chart) {
        window.categoryChart.destroy();
    }

    // Criar novo gráfico
    window.categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categoryNames,
            datasets: [{
                data: categoryReturns.map(Math.abs), // Usar valor absoluto para tamanho
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
                            const categoryName = context.label;
                            const categoryType = Object.keys(categories)[context.dataIndex];
                            const value = categories[categoryType].avg_return;
                            return `${categoryName}: ${formatPercentage(value)}`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Configura a ferramenta de comparação de ativos
 */
function setupComparisonTool() {
    if (!bestAssetsData.assets || !bestAssetsData.dataLoaded) {
        console.warn('Dados de ativos não disponíveis para configurar ferramenta de comparação');
        return;
    }

    const asset1Select = document.getElementById('asset1');
    const asset2Select = document.getElementById('asset2');
    const compareButton = document.getElementById('compare-button');

    // Preencher selects com opções de ativos
    populateAssetSelect(asset1Select);
    populateAssetSelect(asset2Select);

    // Configurar evento de clique no botão de comparação
    compareButton.addEventListener('click', function() {
        const asset1Symbol = asset1Select.value;
        const asset2Symbol = asset2Select.value;

        if (asset1Symbol && asset2Symbol) {
            compareAssets(asset1Symbol, asset2Symbol);
        } else {
            alert('Por favor, selecione dois ativos para comparar.');
        }
    });
}

/**
 * Preenche um select com opções de ativos
 */
function populateAssetSelect(selectElement) {
    if (!bestAssetsData.assets) return;

    // Limpar opções existentes (exceto a primeira)
    while (selectElement.options.length > 1) {
        selectElement.remove(1);
    }

    // Adicionar opções de ativos
    bestAssetsData.assets.forEach(asset => {
        const option = document.createElement('option');
        option.value = asset.symbol;
        option.textContent = `${asset.name} (${asset.symbol})`;
        selectElement.appendChild(option);
    });
}

/**
 * Compara dois ativos e exibe o resultado
 */
function compareAssets(asset1Symbol, asset2Symbol) {
    if (!bestAssetsData.assets) return;

    // Encontrar ativos pelos símbolos
    const asset1 = bestAssetsData.assets.find(asset => asset.symbol === asset1Symbol);
    const asset2 = bestAssetsData.assets.find(asset => asset.symbol === asset2Symbol);

    if (!asset1 || !asset2) {
        console.error('Ativos não encontrados para comparação');
        return;
    }

    // Renderizar gráfico de comparação
    renderComparisonChart(asset1, asset2);

    // Renderizar métricas de comparação
    renderComparisonMetrics(asset1, asset2);
}

/**
 * Renderiza o gráfico de comparação de ativos
 */
function renderComparisonChart(asset1, asset2) {
    const ctx = document.getElementById('comparison-chart').getContext('2d');
    const period = bestAssetsData.period;

    // Dados para o gráfico
    const labels = ['Semana', 'Mês', 'Ano'];

    const asset1Data = [
        asset1.week_return,
        asset1.month_return,
        asset1.year_return
    ];

    const asset2Data = [
        asset2.week_return,
        asset2.month_return,
        asset2.year_return
    ];

    // Verificar se já existe um gráfico e destruí-lo
    if (window.comparisonChart instanceof Chart) {
        window.comparisonChart.destroy();
    }

    // Criar novo gráfico
    window.comparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: asset1.name,
                    data: asset1Data,
                    backgroundColor: 'rgba(37, 99, 235, 0.7)',
                    borderColor: 'rgba(37, 99, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: asset2.name,
                    data: asset2Data,
                    backgroundColor: 'rgba(139, 92, 246, 0.7)',
                    borderColor: 'rgba(139, 92, 246, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${formatPercentage(context.raw)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
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
 * Renderiza as métricas de comparação de ativos
 */
function renderComparisonMetrics(asset1, asset2) {
    const metricsContainer = document.getElementById('comparison-metrics');
    const period = bestAssetsData.period;

    // Campo de retorno baseado no período selecionado
    const returnField = period === 'week' ? 'week_return' : period === 'month' ? 'month_return' : 'year_return';

    // Calcular diferença de desempenho
    const returnDiff = asset1[returnField] - asset2[returnField];
    const betterAsset = returnDiff > 0 ? asset1 : asset2;
    const worseTrend = asset1.trend === 'Baixa' && asset2.trend === 'Baixa';

    let metricsHTML = `
        <div class="comparison-header">
            <h3>Análise Comparativa</h3>
            <p>Período: ${getPeriodLabel(period)}</p>
        </div>

        <div class="comparison-grid">
            <div class="comparison-metric">
                <div class="metric-label">Preço Atual</div>
                <div class="metric-values">
                    <div class="metric-value">${asset1.name}: ${formatCurrency(asset1.last_price)}</div>
                    <div class="metric-value">${asset2.name}: ${formatCurrency(asset2.last_price)}</div>
                </div>
            </div>

            <div class="comparison-metric">
                <div class="metric-label">Retorno (${getPeriodLabel(period)})</div>
                <div class="metric-values">
                    <div class="metric-value ${getValueClass(asset1[returnField])}">${asset1.name}: ${formatPercentage(asset1[returnField])}</div>
                    <div class="metric-value ${getValueClass(asset2[returnField])}">${asset2.name}: ${formatPercentage(asset2[returnField])}</div>
                </div>
            </div>

            <div class="comparison-metric">
                <div class="metric-label">Tendência</div>
                <div class="metric-values">
                    <div class="metric-value">${asset1.name}: ${getTrendIcon(asset1.trend)} ${asset1.trend}</div>
                    <div class="metric-value">${asset2.name}: ${getTrendIcon(asset2.trend)} ${asset2.trend}</div>
                </div>
            </div>
        </div>

        <div class="comparison-conclusion">
            <h4>Conclusão</h4>
            <p>
                ${worseTrend
                    ? `Ambos os ativos estão em tendência de baixa no momento.`
                    : `<strong>${betterAsset.name}</strong> apresenta melhor desempenho no período, com uma diferença de <span class="${getValueClass(Math.abs(returnDiff))}">${formatPercentage(Math.abs(returnDiff))}</span> em relação ao outro ativo.`
                }
            </p>
        </div>
    `;

    metricsContainer.innerHTML = metricsHTML;
}

// ===== Funções utilitárias =====

/**
 * Retorna o rótulo do tipo de ativo
 */
function getAssetTypeLabel(type) {
    const typeLabels = {
        'stocks': 'Ações',
        'crypto': 'Criptomoedas',
        'reits': 'Fundos Imobiliários',
        'fixed-income': 'Renda Fixa',
        'etfs': 'ETFs',
        'gold': 'Ouro'
    };

    return typeLabels[type] || type;
}

/**
 * Retorna o rótulo do período
 */
function getPeriodLabel(period) {
    const periodLabels = {
        'week': 'Semana',
        'month': 'Mês',
        'year': 'Ano'
    };

    return periodLabels[period] || period;
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
    return num.toString();
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
