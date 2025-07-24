/**
 * Gerenciador de Charts com Chart.js
 * Cria visualizações estilo NexaVerse com design moderno
 */

import {
  Chart,
  ChartConfiguration,
  ChartData,
  ChartOptions,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  DoughnutController,
  BarController,
  LineController,
  RadarController,
  RadialLinearScale
} from 'chart.js';

import type { 
  PortfolioClassification
} from '../portfolio/AssetClassifier.js';

// Registrar componentes do Chart.js
Chart.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  DoughnutController,
  BarController,
  LineController,
  RadarController,
  RadialLinearScale
);

export interface ChartTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  gridLines: string;
  gradients: {
    primary: string[];
    secondary: string[];
    accent: string[];
  };
}

export class ChartManager {
  private theme: ChartTheme;
  private charts: Map<string, Chart> = new Map();

  constructor() {
    this.theme = {
      primary: '#3B82F6',
      secondary: '#8B5CF6',
      accent: '#10B981',
      background: '#F8FAFC',
      text: '#1E293B',
      gridLines: '#E2E8F0',
      gradients: {
        primary: ['#3B82F6', '#1D4ED8'],
        secondary: ['#8B5CF6', '#7C3AED'],
        accent: ['#10B981', '#059669']
      }
    };
  }

  /**
   * Cria gráfico de distribuição de categorias (Doughnut)
   */
  createCategoryDistributionChart(
    canvasId: string, 
    classification: PortfolioClassification
  ): Chart {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) throw new Error(`Canvas ${canvasId} não encontrado`);

    // Destroi chart existente se houver
    this.destroyChart(canvasId);

    const data: ChartData<'doughnut'> = {
      labels: classification.categories.map(cat => cat.category.name),
      datasets: [{
        data: classification.categories.map(cat => cat.totalValue),
        backgroundColor: classification.categories.map(cat => cat.category.color),
        borderColor: '#FFFFFF',
        borderWidth: 3,
        hoverBorderWidth: 4,
        hoverBorderColor: '#FFFFFF'
      }]
    };

    const options: ChartOptions<'doughnut'> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 20,
            font: {
              family: 'Inter, sans-serif',
              size: 12,
              weight: 500
            },
            color: this.theme.text
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#FFFFFF',
          bodyColor: '#FFFFFF',
          borderColor: this.theme.primary,
          borderWidth: 1,
          cornerRadius: 8,
          callbacks: {
            label: (context) => {
              const total = classification.totalValue;
              const value = context.parsed;
              const percentage = ((value / total) * 100).toFixed(1);
              return `${context.label}: R$ ${value.toLocaleString('pt-BR')} (${percentage}%)`;
            }
          }
        }
      },
      cutout: '65%',
      animation: {
        animateRotate: true,
        animateScale: true,
        duration: 1000,
        easing: 'easeOutQuart'
      }
    };

    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data,
      options
    };

    const chart = new Chart(canvas, config);
    this.charts.set(canvasId, chart);
    return chart;
  }

  /**
   * Cria gráfico de performance por categoria (Bar)
   */
  createPerformanceChart(
    canvasId: string, 
    classification: PortfolioClassification
  ): Chart {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) throw new Error(`Canvas ${canvasId} não encontrado`);

    this.destroyChart(canvasId);

    const categories = classification.categories
      .filter(cat => cat.performance.averageReturn > 0)
      .sort((a, b) => b.performance.averageReturn - a.performance.averageReturn);

    const data: ChartData<'bar'> = {
      labels: categories.map(cat => cat.category.name),
      datasets: [{
        label: 'Retorno Médio (%)',
        data: categories.map(cat => cat.performance.averageReturn),
        backgroundColor: categories.map(cat => cat.category.color + '80'),
        borderColor: categories.map(cat => cat.category.color),
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }]
    };

    const options: ChartOptions<'bar'> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#FFFFFF',
          bodyColor: '#FFFFFF',
          borderColor: this.theme.primary,
          borderWidth: 1,
          cornerRadius: 8,
          callbacks: {
            label: (context) => `Retorno: ${context.parsed.y.toFixed(2)}% a.a.`
          }
        }
      },
      scales: {
        x: {
          border: {
            display: false
          },
          grid: {
            display: false
          },
          ticks: {
            font: {
              family: 'Inter, sans-serif',
              size: 11,
              weight: 500
            },
            color: this.theme.text
          }
        },
        y: {
          border: {
            display: false
          },
          grid: {
            color: this.theme.gridLines,
            drawTicks: false
          },
          ticks: {
            font: {
              family: 'Inter, sans-serif',
              size: 11
            },
            color: this.theme.text,
            callback: (value) => `${value}%`
          }
        }
      },
      animation: {
        duration: 1500,
        easing: 'easeOutQuart'
      }
    };

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data,
      options
    };

    const chart = new Chart(canvas, config);
    this.charts.set(canvasId, chart);
    return chart;
  }

  /**
   * Cria gráfico de evolução temporal (Line)
   */
  createTimeSeriesChart(
    canvasId: string, 
    timeSeriesData: Array<{ date: Date; value: number; category?: string }>
  ): Chart {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) throw new Error(`Canvas ${canvasId} não encontrado`);

    this.destroyChart(canvasId);

    const data: ChartData<'line'> = {
      labels: timeSeriesData.map(point => point.date.toLocaleDateString('pt-BR')),
      datasets: [{
        label: 'Valor do Portfolio',
        data: timeSeriesData.map(point => point.value),
        borderColor: this.theme.primary,
        backgroundColor: this.theme.primary + '20',
        borderWidth: 3,
        pointBackgroundColor: this.theme.primary,
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.4,
        fill: true
      }]
    };

    const options: ChartOptions<'line'> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#FFFFFF',
          bodyColor: '#FFFFFF',
          borderColor: this.theme.primary,
          borderWidth: 1,
          cornerRadius: 8,
          callbacks: {
            label: (context) => `R$ ${context.parsed.y.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
          }
        }
      },
      scales: {
        x: {
          border: {
            display: false
          },
          grid: {
            display: false
          },
          ticks: {
            font: {
              family: 'Inter, sans-serif',
              size: 11
            },
            color: this.theme.text,
            maxTicksLimit: 6
          }
        },
        y: {
          border: {
            display: false
          },
          grid: {
            color: this.theme.gridLines,
            drawTicks: false
          },
          ticks: {
            font: {
              family: 'Inter, sans-serif',
              size: 11
            },
            color: this.theme.text,
            callback: (value) => `R$ ${(value as number).toLocaleString('pt-BR', { notation: 'compact' })}`
          }
        }
      },
      animation: {
        duration: 2000,
        easing: 'easeOutQuart'
      }
    };

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data,
      options
    };

    const chart = new Chart(canvas, config);
    this.charts.set(canvasId, chart);
    return chart;
  }

  /**
   * Cria gráfico de alocação de risco (Radar)
   */
  createRiskAllocationChart(
    canvasId: string, 
    classification: PortfolioClassification
  ): Chart {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) throw new Error(`Canvas ${canvasId} não encontrado`);

    this.destroyChart(canvasId);

    const riskData = classification.riskProfile.breakdown;

    const data: ChartData<'radar'> = {
      labels: ['Conservador', 'Moderado', 'Arrojado'],
      datasets: [{
        label: 'Alocação de Risco',
        data: [riskData.conservative, riskData.moderate, riskData.aggressive],
        backgroundColor: this.theme.primary + '30',
        borderColor: this.theme.primary,
        borderWidth: 3,
        pointBackgroundColor: this.theme.primary,
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      }]
    };

    const options: ChartOptions<'radar'> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#FFFFFF',
          bodyColor: '#FFFFFF',
          borderColor: this.theme.primary,
          borderWidth: 1,
          cornerRadius: 8,
          callbacks: {
            label: (context) => `${context.parsed.r.toFixed(1)}%`
          }
        }
      },
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          grid: {
            color: this.theme.gridLines
          },
          angleLines: {
            color: this.theme.gridLines
          },
          pointLabels: {
            font: {
              family: 'Inter, sans-serif',
              size: 12,
              weight: 500
            },
            color: this.theme.text
          },
          ticks: {
            display: false
          }
        }
      },
      animation: {
        duration: 1500,
        easing: 'easeOutQuart'
      }
    };

    const config: ChartConfiguration<'radar'> = {
      type: 'radar',
      data,
      options
    };

    const chart = new Chart(canvas, config);
    this.charts.set(canvasId, chart);
    return chart;
  }

  /**
   * Atualiza dados de um gráfico existente
   */
  updateChart(canvasId: string, newData: any): void {
    const chart = this.charts.get(canvasId);
    if (chart) {
      chart.data = newData;
      chart.update('active');
    }
  }

  /**
   * Destroi um gráfico específico
   */
  destroyChart(canvasId: string): void {
    const chart = this.charts.get(canvasId);
    if (chart) {
      chart.destroy();
      this.charts.delete(canvasId);
    }
  }

  /**
   * Destroi todos os gráficos
   */
  destroyAllCharts(): void {
    this.charts.forEach(chart => chart.destroy());
    this.charts.clear();
  }

  /**
   * Altera o tema dos gráficos
   */
  updateTheme(newTheme: Partial<ChartTheme>): void {
    this.theme = { ...this.theme, ...newTheme };
    
    // Atualiza todos os gráficos existentes
    this.charts.forEach(chart => {
      this.updateChartTheme(chart);
      chart.update();
    });
  }

  private updateChartTheme(chart: Chart): void {
    const options = chart.options;
    
    // Atualiza cores do texto
    if (options.plugins?.legend?.labels) {
      options.plugins.legend.labels.color = this.theme.text;
    }
    
    // Atualiza cores das escalas
    if (options.scales) {
      Object.values(options.scales).forEach(scale => {
        if (scale && typeof scale === 'object' && 'ticks' in scale && scale.ticks) {
          scale.ticks.color = this.theme.text;
        }
        if (scale && typeof scale === 'object' && 'grid' in scale && scale.grid) {
          scale.grid.color = this.theme.gridLines;
        }
      });
    }
  }

  /**
   * Redimensiona todos os gráficos
   */
  resizeAllCharts(): void {
    this.charts.forEach(chart => chart.resize());
  }

  /**
   * Obtém referência de um gráfico
   */
  getChart(canvasId: string): Chart | undefined {
    return this.charts.get(canvasId);
  }
}
