/**
 * Configuração e renderização de gráficos para o dashboard financeiro
 * Utiliza Chart.js para criar visualizações dos dados financeiros
 */

// Cores para os gráficos
const chartColors = [
    'rgba(37, 99, 235, 0.8)',   // Azul primário
    'rgba(79, 70, 229, 0.8)',   // Azul secundário
    'rgba(139, 92, 246, 0.8)',  // Roxo
    'rgba(16, 185, 129, 0.8)',  // Verde
    'rgba(239, 68, 68, 0.8)',   // Vermelho
    'rgba(245, 158, 11, 0.8)',  // Laranja
    'rgba(14, 165, 233, 0.8)',  // Azul claro
    'rgba(168, 85, 247, 0.8)',  // Roxo claro
    'rgba(236, 72, 153, 0.8)',  // Rosa
    'rgba(34, 197, 94, 0.8)'    // Verde claro
];

// Cores para os gráficos com transparência
const chartColorsTransparent = chartColors.map(color => color.replace('0.8', '0.2'));

/**
 * Ordena índices por retorno do período (do maior para o menor)
 */
function getSortedIndicesByReturn() {
    if (!dashboardData.indices) return [];

    // Criar uma cópia para não modificar os dados originais
    const indices = [...dashboardData.indices];

    // Ordenar por retorno do período (do maior para o menor)
    return indices.sort((a, b) => b.period_return - a.period_return);
}

// Função para criar gráfico de barras para índices
function createIndicesChart() {
    if (!dashboardData.indices) return;

    // Verificar se o elemento existe antes de tentar acessá-lo
    const canvas = document.getElementById('indices-chart');
    if (!canvas) {
        // Apenas registrar em log se estivermos na página do dashboard
        if (window.location.pathname.includes('index.html') ||
            window.location.pathname.endsWith('/') ||
            window.location.pathname.endsWith('/dashboard')) {
            console.error('Canvas para gráfico de índices não encontrado');
        }
        return;
    }
    const ctx = canvas.getContext('2d');

    // Ordenar índices por retorno (do maior para o menor)
    const sortedIndices = getSortedIndicesByReturn();

    // Limitar a 8 índices para melhor visualização
    const displayIndices = sortedIndices.slice(0, 8);

    const labels = displayIndices.map(index => index.name);
    const returns = displayIndices.map(index => index.period_return);

    // Determinar cores com base no valor (positivo/negativo)
    const backgroundColors = returns.map(value =>
        value >= 0 ? 'rgba(16, 185, 129, 0.7)' : 'rgba(239, 68, 68, 0.7)'
    );

    const borderColors = returns.map(value =>
        value >= 0 ? 'rgba(16, 185, 129, 1)' : 'rgba(239, 68, 68, 1)'
    );

    // Verificar se já existe um gráfico e destruí-lo
    if (window.indicesChartGlobal instanceof Chart) {
        window.indicesChartGlobal.destroy();
    }

    // Verificar se o canvas está sendo usado por outro gráfico
    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
        existingChart.destroy();
    }

    // Criar novo gráfico
    window.indicesChartGlobal = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Retorno no Período (%)',
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

// Função para criar gráfico de setores
function createSectorsChart() {
    if (!dashboardData.sectors) return;

    // Verificar se o elemento existe antes de tentar acessá-lo
    const canvas = document.getElementById('sectors-chart');
    if (!canvas) {
        // Apenas registrar em log se estivermos na página do dashboard
        if (window.location.pathname.includes('index.html') ||
            window.location.pathname.endsWith('/') ||
            window.location.pathname.endsWith('/dashboard')) {
            console.error('Canvas para gráfico de setores não encontrado');
        }
        return;
    }
    const ctx = canvas.getContext('2d');

    const sectorNames = Object.keys(dashboardData.sectors);
    const sectorReturns = sectorNames.map(name => dashboardData.sectors[name].avg_return);

    // Determinar cores com base no valor (positivo/negativo)
    const backgroundColors = sectorReturns.map((value, index) =>
        value >= 0 ? chartColors[index % chartColors.length] : 'rgba(239, 68, 68, 0.7)'
    );

    // Verificar se o canvas está sendo usado por outro gráfico
    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
        existingChart.destroy();
    }

    // Criar novo gráfico
    window.sectorsChartGlobal = new Chart(ctx, {
        type: 'polarArea',
        data: {
            labels: sectorNames,
            datasets: [{
                data: sectorReturns.map(Math.abs), // Usar valor absoluto para tamanho
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
                            const value = dashboardData.sectors[sectorName].avg_return;
                            return `${sectorName}: ${formatPercentage(value)}`;
                        }
                    }
                }
            }
        }
    });
}

// Função para criar gráfico de correlações
function createCorrelationsChart() {
    // Esta função pode ser implementada se necessário
    // Por enquanto, usamos uma visualização baseada em HTML para correlações
}

// Inicializar gráficos quando os dados estiverem carregados
document.addEventListener('dataLoaded', function() {
    // Verificar se estamos na página do dashboard antes de criar os gráficos
    const isDashboardPage = window.location.pathname.includes('index.html') ||
                           window.location.pathname.endsWith('/') ||
                           window.location.pathname.endsWith('/dashboard');

    if (isDashboardPage) {
        createIndicesChart();
        createSectorsChart();
    }
});
