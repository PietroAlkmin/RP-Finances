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
    lastUpdate: null,
    displayLimit: 10, // Número inicial de ativos a serem exibidos
    totalDisplayed: 0  // Contador de ativos exibidos atualmente
};

// Inicializar a página quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Configurar filtros
    setupFilters();

    // Atualizar data atual
    updateCurrentDate();

    // Configurar botão de tentar novamente
    setupRetryButton();

    // Configurar botão "Mostrar Mais"
    setupShowMoreButton();

    // Inicializar preferências do usuário
    UserPreferences.init();

    // Inicializar gerenciador de autenticação
    AuthManager.init();

    // Limpar todo o cache para garantir dados frescos com a nova chave de API
    console.log('Limpando todo o cache para usar a nova chave de API...');
    CacheManager.clearAllCache();

    // Carregar dados iniciais usando o carregador aprimorado
    loadEnhancedBestAssetsData(bestAssetsData.period, bestAssetsData.assetType);

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

            // Resetar o limite de exibição
            bestAssetsData.displayLimit = 10;
            bestAssetsData.totalDisplayed = 0;

            // Recarregar dados com novo período
            loadEnhancedBestAssetsData(bestAssetsData.period, bestAssetsData.assetType);
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

            // Resetar o limite de exibição
            bestAssetsData.displayLimit = 10;
            bestAssetsData.totalDisplayed = 0;

            // Recarregar dados com novo tipo
            loadEnhancedBestAssetsData(bestAssetsData.period, bestAssetsData.assetType);
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
            loadEnhancedBestAssetsData(bestAssetsData.period, bestAssetsData.assetType);
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
 * Configura o botão "Mostrar Mais"
 */
function setupShowMoreButton() {
    const showMoreButton = document.getElementById('show-more-button');
    if (showMoreButton) {
        showMoreButton.addEventListener('click', function() {
            // Aumentar o limite de exibição
            bestAssetsData.displayLimit += 10;

            // Renderizar a tabela novamente com o novo limite
            renderBestAssetsTable();

            // Verificar se todos os ativos já estão sendo exibidos
            if (bestAssetsData.totalDisplayed >= bestAssetsData.assets.length) {
                // Desabilitar o botão se todos os ativos já estiverem sendo exibidos
                showMoreButton.disabled = true;
                showMoreButton.textContent = 'Todos os ativos exibidos';
            }
        });
    }
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
    const showMoreButton = document.getElementById('show-more-button');
    const assets = bestAssetsData.assets;
    const period = bestAssetsData.period;

    // Campo de retorno baseado no período selecionado
    const returnField = period === 'week' ? 'week_return' : period === 'month' ? 'month_return' : 'year_return';

    let tableHTML = '';

    // Limitar o número de ativos exibidos
    const assetsToDisplay = assets.slice(0, bestAssetsData.displayLimit);
    bestAssetsData.totalDisplayed = assetsToDisplay.length;

    // Atualizar estado do botão "Mostrar Mais"
    if (showMoreButton) {
        if (bestAssetsData.totalDisplayed >= assets.length) {
            showMoreButton.disabled = true;
            showMoreButton.textContent = 'Todos os ativos exibidos';
        } else {
            showMoreButton.disabled = false;
            showMoreButton.textContent = `Mostrar Mais (${bestAssetsData.totalDisplayed} de ${assets.length})`;
        }
    }

    assetsToDisplay.forEach((asset, index) => {
        const assetTypeLabel = getAssetTypeLabel(asset.type);
        const volumeDisplay = asset.volume ? formatLargeNumber(asset.volume) : 'N/A';

        // Adicionar classe para animação apenas para os novos itens
        const animationClass = index >= bestAssetsData.totalDisplayed - 10 ? 'fade-in' : '';

        tableHTML += `
            <tr class="asset-row ${animationClass}">
                <td>
                    <div class="asset-symbol-main">${asset.symbol}</div>
                </td>
                <td>${formatCurrency(asset.last_price, asset.currency || 'USD', { is_crypto: asset.is_crypto })}</td>
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

    const labels = topAssets.map(asset => asset.symbol);
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
        option.textContent = `${asset.symbol} - ${asset.name}`;
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
                    label: asset1.symbol,
                    data: asset1Data,
                    backgroundColor: 'rgba(37, 99, 235, 0.7)',
                    borderColor: 'rgba(37, 99, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: asset2.symbol,
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
                    <div class="metric-value">${asset1.symbol}: ${formatCurrency(asset1.last_price, asset1.currency || 'USD', { is_crypto: asset1.is_crypto })}</div>
                    <div class="metric-value">${asset2.symbol}: ${formatCurrency(asset2.last_price, asset2.currency || 'USD', { is_crypto: asset2.is_crypto })}</div>
                </div>
            </div>

            <div class="comparison-metric">
                <div class="metric-label">Retorno (${getPeriodLabel(period)})</div>
                <div class="metric-values">
                    <div class="metric-value ${getValueClass(asset1[returnField])}">${asset1.symbol}: ${formatPercentage(asset1[returnField])}</div>
                    <div class="metric-value ${getValueClass(asset2[returnField])}">${asset2.symbol}: ${formatPercentage(asset2[returnField])}</div>
                </div>
            </div>

            <div class="comparison-metric">
                <div class="metric-label">Tendência</div>
                <div class="metric-values">
                    <div class="metric-value">${asset1.symbol}: ${getTrendIcon(asset1.trend)} ${asset1.trend}</div>
                    <div class="metric-value">${asset2.symbol}: ${getTrendIcon(asset2.trend)} ${asset2.trend}</div>
                </div>
            </div>
        </div>

        <div class="comparison-conclusion">
            <h4>Conclusão</h4>
            <p>
                ${worseTrend
                    ? `Ambos os ativos estão em tendência de baixa no momento.`
                    : `<strong>${betterAsset.symbol}</strong> apresenta melhor desempenho no período, com uma diferença de <span class="${getValueClass(Math.abs(returnDiff))}">${formatPercentage(Math.abs(returnDiff))}</span> em relação ao outro ativo.`
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
        'stocks': 'Ações Globais',
        'brazilian': 'Ações Brasileiras',
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
    if (num === null || num === undefined || isNaN(num)) return 'N/A';

    // Para valores muito grandes (bilhões)
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1) + 'B';
    }
    // Para valores grandes (milhões)
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    // Para valores médios (milhares)
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    // Para valores pequenos (criptomoedas de baixo valor)
    if (num < 1 && num > 0) {
        // Determinar quantas casas decimais são necessárias
        if (num < 0.0001) {
            return num.toFixed(8);
        } else if (num < 0.01) {
            return num.toFixed(6);
        } else {
            return num.toFixed(4);
        }
    }
    // Para outros valores
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
 * @param {number} value - Valor a ser formatado
 * @param {string} currency - Moeda (USD, BRL, etc.)
 * @param {Object} options - Opções adicionais
 * @returns {string} - Valor formatado
 */
function formatCurrency(value, currency = 'USD', options = {}) {
    // Verificar se o valor é válido
    if (value === null || value === undefined || isNaN(value)) {
        return 'N/A';
    }

    // Verificar se é uma criptomoeda
    const isCrypto = options.is_crypto === true;

    // Para criptomoedas, usar formatação especial
    if (isCrypto) {
        // Bitcoin e Ethereum usam formatação especial
        if (value >= 1000) {
            return currency === 'USD' ? '$' + formatLargeNumber(value) : 'R$ ' + formatLargeNumber(value);
        }
        // Para criptomoedas de baixo valor
        if (value < 1) {
            if (value < 0.0001) {
                return currency === 'USD' ? '$' + value.toFixed(8) : 'R$ ' + value.toFixed(8);
            } else if (value < 0.01) {
                return currency === 'USD' ? '$' + value.toFixed(6) : 'R$ ' + value.toFixed(6);
            } else {
                return currency === 'USD' ? '$' + value.toFixed(4) : 'R$ ' + value.toFixed(4);
            }
        }
    }

    // Para valores muito grandes, usar formatLargeNumber
    if (value > 10000) {
        return currency === 'USD' ? '$' + formatLargeNumber(value) : 'R$ ' + formatLargeNumber(value);
    }

    // Para valores normais, usar Intl.NumberFormat
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
