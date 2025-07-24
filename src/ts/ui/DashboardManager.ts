/**
 * Dashboard Manager - Interface Principal Estilo NexaVerse
 * Integra classificação de ativos com visualizações modernas
 */

import { AssetClassifier, type PortfolioClassification } from '../portfolio/AssetClassifier.js';
import { ChartManager } from './ChartManager.js';
import type { Investment } from '../integrations/pluggy/PluggyTypes.js';

export interface DashboardConfig {
  enableAnimations: boolean;
  autoRefresh: boolean;
  refreshInterval: number; // em segundos
  theme: 'light' | 'dark' | 'auto';
}

export class DashboardManager {
  private classifier: AssetClassifier;
  private chartManager: ChartManager;
  private currentClassification: PortfolioClassification | null = null;

  constructor(config: Partial<DashboardConfig> = {}) {
    this.classifier = new AssetClassifier();
    this.chartManager = new ChartManager();
    
    // Não precisa armazenar config se não for usado
    console.log('📊 DashboardManager inicializado com configurações:', config);
  }

  /**
   * Inicializa o dashboard com dados de investimentos
   */
  async initializeDashboard(investments: Investment[]): Promise<void> {
    console.log('🚀 Inicializando Dashboard NexaVerse...');
    
    try {
      // Classifica o portfolio
      this.currentClassification = this.classifier.classifyPortfolio(investments);
      
      // Cria a estrutura da interface
      this.createDashboardStructure();
      
      // Renderiza KPIs
      this.renderKPICards();
      
      // Renderiza gráficos
      await this.renderCharts();
      
      // Renderiza insights
      this.renderInsights();
      
      // Renderiza tabela de ativos
      this.renderAssetsTable();
      
      console.log('✅ Dashboard inicializado com sucesso!');
      
    } catch (error) {
      console.error('❌ Erro ao inicializar dashboard:', error);
      throw error;
    }
  }

  /**
   * Cria a estrutura HTML do dashboard estilo NexaVerse
   */
  private createDashboardStructure(): void {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) {
      console.error('Container main-content não encontrado');
      return;
    }

    mainContent.innerHTML = `
      <!-- Dashboard NexaVerse -->
      <div class="min-h-screen bg-gray-50">
        
        <!-- Header com KPIs -->
        <div class="bg-white shadow-sm border-b border-gray-200">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div class="flex items-center justify-between mb-8">
              <div>
                <h1 class="text-3xl font-bold text-gray-900">Portfolio Overview</h1>
                <p class="text-gray-600 mt-1">Análise completa dos seus investimentos</p>
              </div>
              <div class="flex items-center space-x-4">
                <button id="refresh-dashboard" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  Atualizar
                </button>
              </div>
            </div>

            <!-- KPI Cards -->
            <div id="kpi-cards" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <!-- KPIs serão inseridos aqui -->
            </div>
          </div>
        </div>

        <!-- Main Dashboard Content -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          <!-- Charts Row -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            
            <!-- Distribuição por Categoria -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-semibold text-gray-900">Distribuição por Categoria</h3>
                <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
              <div class="relative h-80">
                <canvas id="category-distribution-chart"></canvas>
              </div>
            </div>

            <!-- Performance por Categoria -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-semibold text-gray-900">Performance por Categoria</h3>
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <div class="relative h-80">
                <canvas id="performance-chart"></canvas>
              </div>
            </div>

          </div>

          <!-- Second Row -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            
            <!-- Perfil de Risco -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-semibold text-gray-900">Perfil de Risco</h3>
                <div class="w-2 h-2 bg-purple-500 rounded-full"></div>
              </div>
              <div class="relative h-64">
                <canvas id="risk-allocation-chart"></canvas>
              </div>
            </div>

            <!-- Insights -->
            <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-semibold text-gray-900">Insights do Portfolio</h3>
                <div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
              </div>
              <div id="insights-container" class="space-y-4">
                <!-- Insights serão inseridos aqui -->
              </div>
            </div>

          </div>

          <!-- Assets Table -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900">Detalhes dos Ativos</h3>
                <div class="flex items-center space-x-2">
                  <select id="category-filter" class="text-sm border border-gray-300 rounded px-3 py-1">
                    <option value="">Todas as categorias</option>
                  </select>
                </div>
              </div>
            </div>
            <div id="assets-table-container" class="overflow-x-auto">
              <!-- Tabela será inserida aqui -->
            </div>
          </div>

        </div>
      </div>
    `;

    // Adiciona event listeners
    this.setupEventListeners();
  }

  /**
   * Renderiza os cards de KPIs no topo
   */
  private renderKPICards(): void {
    if (!this.currentClassification) return;

    const container = document.getElementById('kpi-cards');
    if (!container) return;

    const { totalValue, assetCount, riskProfile, diversificationScore } = this.currentClassification;
    const totalProfit = this.currentClassification.categories.reduce((sum, cat) => sum + cat.performance.totalProfit, 0);
    const profitPercentage = totalValue > 0 ? (totalProfit / (totalValue - totalProfit)) * 100 : 0;

    container.innerHTML = `
      <!-- Patrimônio Total -->
      <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-blue-600 text-sm font-medium">Patrimônio Total</p>
            <p class="text-2xl font-bold text-blue-900 mt-1">R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            <p class="text-blue-700 text-sm mt-1">${assetCount} ativos</p>
          </div>
          <div class="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
            </svg>
          </div>
        </div>
      </div>

      <!-- Performance -->
      <div class="bg-gradient-to-br from-${profitPercentage >= 0 ? 'green' : 'red'}-50 to-${profitPercentage >= 0 ? 'green' : 'red'}-100 rounded-xl p-6 border border-${profitPercentage >= 0 ? 'green' : 'red'}-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-${profitPercentage >= 0 ? 'green' : 'red'}-600 text-sm font-medium">Performance Total</p>
            <p class="text-2xl font-bold text-${profitPercentage >= 0 ? 'green' : 'red'}-900 mt-1">${profitPercentage >= 0 ? '+' : ''}${profitPercentage.toFixed(2)}%</p>
            <p class="text-${profitPercentage >= 0 ? 'green' : 'red'}-700 text-sm mt-1">R$ ${totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div class="w-12 h-12 bg-${profitPercentage >= 0 ? 'green' : 'red'}-500 rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
            </svg>
          </div>
        </div>
      </div>

      <!-- Perfil de Risco -->
      <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-purple-600 text-sm font-medium">Perfil de Risco</p>
            <p class="text-2xl font-bold text-purple-900 mt-1">${riskProfile.level}</p>
            <p class="text-purple-700 text-sm mt-1">Score: ${riskProfile.score.toFixed(0)}/100</p>
          </div>
          <div class="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H9a2 2 0 00-2 2z"></path>
            </svg>
          </div>
        </div>
      </div>

      <!-- Diversificação -->
      <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-yellow-600 text-sm font-medium">Diversificação</p>
            <p class="text-2xl font-bold text-yellow-900 mt-1">${diversificationScore.toFixed(0)}%</p>
            <p class="text-yellow-700 text-sm mt-1">${this.getDiversificationLabel(diversificationScore)}</p>
          </div>
          <div class="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
            </svg>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Renderiza todos os gráficos
   */
  private async renderCharts(): Promise<void> {
    if (!this.currentClassification) return;

    try {
      // Gráfico de distribuição por categoria
      this.chartManager.createCategoryDistributionChart(
        'category-distribution-chart',
        this.currentClassification
      );

      // Gráfico de performance por categoria
      this.chartManager.createPerformanceChart(
        'performance-chart',
        this.currentClassification
      );

      // Gráfico de alocação de risco
      this.chartManager.createRiskAllocationChart(
        'risk-allocation-chart',
        this.currentClassification
      );

    } catch (error) {
      console.error('Erro ao renderizar gráficos:', error);
    }
  }

  /**
   * Renderiza insights do portfolio
   */
  private renderInsights(): void {
    if (!this.currentClassification) return;

    const container = document.getElementById('insights-container');
    if (!container) return;

    const insights = this.currentClassification.insights;

    if (insights.length === 0) {
      container.innerHTML = `
        <div class="text-center text-gray-500 py-8">
          <svg class="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
          </svg>
          <p>Nenhum insight disponível no momento</p>
        </div>
      `;
      return;
    }

    const insightsHTML = insights.map(insight => {
      const iconMap = {
        warning: '⚠️',
        opportunity: '💡',
        success: '✅',
        info: 'ℹ️'
      };

      const colorMap = {
        warning: 'border-l-yellow-400 bg-yellow-50',
        opportunity: 'border-l-blue-400 bg-blue-50',
        success: 'border-l-green-400 bg-green-50',
        info: 'border-l-gray-400 bg-gray-50'
      };

      return `
        <div class="border-l-4 ${colorMap[insight.type]} p-4 rounded-r-lg">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <span class="text-xl mr-3">${iconMap[insight.type]}</span>
              <div>
                <h4 class="font-semibold text-gray-900">${insight.title}</h4>
                <p class="text-gray-700 text-sm mt-1">${insight.description}</p>
                ${insight.action ? `<p class="text-xs text-gray-600 mt-2"><strong>Ação:</strong> ${insight.action}</p>` : ''}
              </div>
            </div>
            <span class="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700">${insight.impact}</span>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = insightsHTML;
  }

  /**
   * Renderiza tabela de ativos
   */
  private renderAssetsTable(): void {
    if (!this.currentClassification) return;

    const container = document.getElementById('assets-table-container');
    const filterSelect = document.getElementById('category-filter') as HTMLSelectElement;
    if (!container || !filterSelect) return;

    // Popula filtro de categorias
    const categories = this.classifier.getCategories();
    filterSelect.innerHTML = '<option value="">Todas as categorias</option>' +
      categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');

    // Coleta todos os ativos classificados (placeholder para expansão futura)
    // const allAssets: ClassifiedAsset[] = [];
    // this.currentClassification.categories.forEach(catSummary => {
    //   // Nota: Precisaríamos ter acesso aos ativos individuais aqui
    //   // Por simplicidade, vou mostrar um resumo por categoria
    // });

    const tableHTML = `
      <table class="min-w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peso</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ativos</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          ${this.currentClassification.categories.map(cat => `
            <tr class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <span class="text-2xl mr-3">${cat.category.icon}</span>
                  <div>
                    <div class="text-sm font-medium text-gray-900">${cat.category.name}</div>
                    <div class="text-sm text-gray-500">${cat.category.description}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                R$ ${cat.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${cat.weight.toFixed(1)}%
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span class="text-${cat.performance.averageReturn >= 0 ? 'green' : 'red'}-600">
                  ${cat.performance.averageReturn >= 0 ? '+' : ''}${cat.performance.averageReturn.toFixed(2)}%
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${cat.assetCount} ativo${cat.assetCount !== 1 ? 's' : ''}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    container.innerHTML = tableHTML;
  }

  /**
   * Configura event listeners
   */
  private setupEventListeners(): void {
    // Botão de refresh
    const refreshBtn = document.getElementById('refresh-dashboard');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.refreshDashboard();
      });
    }

    // Filtro de categoria
    const categoryFilter = document.getElementById('category-filter') as HTMLSelectElement;
    if (categoryFilter) {
      categoryFilter.addEventListener('change', (e) => {
        const target = e.target as HTMLSelectElement;
        this.filterAssetsByCategory(target.value);
      });
    }

    // Redimensionamento de janela
    window.addEventListener('resize', () => {
      this.chartManager.resizeAllCharts();
    });
  }

  /**
   * Atualiza o dashboard
   */
  private async refreshDashboard(): Promise<void> {
    console.log('🔄 Atualizando dashboard...');
    // Aqui você pode re-executar a coleta de dados
    // Por ora, apenas redefine os gráficos
    if (this.currentClassification) {
      await this.renderCharts();
      console.log('✅ Dashboard atualizado!');
    }
  }

  /**
   * Filtra ativos por categoria
   */
  private filterAssetsByCategory(categoryId: string): void {
    // Implementar filtro da tabela
    console.log('Filtrar por categoria:', categoryId);
  }

  /**
   * Obtém label de diversificação
   */
  private getDiversificationLabel(score: number): string {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Boa';
    if (score >= 40) return 'Regular';
    return 'Baixa';
  }

  /**
   * Destroi o dashboard e limpa recursos
   */
  destroy(): void {
    this.chartManager.destroyAllCharts();
  }

  /**
   * Obtém classificação atual
   */
  getCurrentClassification(): PortfolioClassification | null {
    return this.currentClassification;
  }
}
