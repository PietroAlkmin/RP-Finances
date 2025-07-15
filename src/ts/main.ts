/**
 * Arquivo principal da aplicação RP-Finances
 * Responsável por inicializar a aplicação e coordenar os módulos
 */

import { InvestmentCollector } from './portfolio/InvestmentCollector.js';
import type { PluggyConfig, Investment, PortfolioSummary, InvestmentType } from './integrations/pluggy/PluggyTypes.js';
import { ENVIRONMENT_CONFIG } from '../config/environment.js';
import { BinanceInvestmentCollector } from './integrations/binance/BinanceInvestmentCollector.js';
import { BINANCE_CONFIG, validateBinanceConfig } from '../config/binance.js';
import { StateManager } from './utils/StateManager.js';

/**
 * Configuração da aplicação
 */
const APP_CONFIG = {
  // Configuração Pluggy (vem do arquivo de ambiente)
  pluggy: ENVIRONMENT_CONFIG.pluggy as PluggyConfig,

  // IDs dos itens conectados (em produção, vir do Supabase)
  connectedItems: [] as string[],
};

/**
 * Classe principal da aplicação
 */
class PortfolioApp {
  private collector: InvestmentCollector;
  private binanceCollector: BinanceInvestmentCollector | null = null;
  private currentInvestments: Investment[] = [];

  constructor() {
    this.collector = new InvestmentCollector(APP_CONFIG.pluggy);
    
    // Inicializar Binance se configurado
    if (validateBinanceConfig()) {
      this.binanceCollector = new BinanceInvestmentCollector(BINANCE_CONFIG);
      console.log('🟠 Binance configurado e pronto para uso');
    }
    
    // Carrega estado anterior se existir
    this.loadPreviousState();
  }

  /**
   * Inicializa a aplicação
   */
  async init(): Promise<void> {
    console.log('🚀 Inicializando RP-Finances...');

    try {
      // Setup dos event listeners
      this.setupEventListeners();

      // Atualiza UI inicial
      this.updateLastUpdateTime();

      // Mostra mensagem de boas-vindas
      this.showWelcomeMessage();

      console.log('✅ RP-Finances inicializado com sucesso');

    } catch (error) {
      console.error('❌ Erro ao inicializar aplicação:', error);
      this.showError('Erro ao inicializar aplicação');
    }
  }

  /**
   * Configura os event listeners da interface
   */
  private setupEventListeners(): void {
    // Botões de conectar contas - agora abrem modal de seleção
    const connectBtn = document.getElementById('connectBtn');
    const connectBtn2 = document.getElementById('connectBtn2');

    if (connectBtn) {
      connectBtn.addEventListener('click', () => this.showIntegrationModal());
    }
    if (connectBtn2) {
      connectBtn2.addEventListener('click', () => this.showIntegrationModal());
    }

    // Botão de limpar cache
    const clearCacheBtn = document.getElementById('clearCacheBtn');
    if (clearCacheBtn) {
      clearCacheBtn.addEventListener('click', () => this.clearCache());
    }

    // Modal de seleção de integrações
    const closeModal = document.getElementById('closeModal');
    const integrationModal = document.getElementById('integrationModal');
    const connectPluggy = document.getElementById('connectPluggy');
    const connectBinance = document.getElementById('connectBinance');

    if (closeModal) {
      closeModal.addEventListener('click', () => this.hideIntegrationModal());
    }

    if (integrationModal) {
      integrationModal.addEventListener('click', (e) => {
        if (e.target === integrationModal) {
          this.hideIntegrationModal();
        }
      });
    }

    if (connectPluggy) {
      connectPluggy.addEventListener('click', () => {
        this.hideIntegrationModal();
        this.handleConnectPluggy();
      });
    }

    if (connectBinance) {
      connectBinance.addEventListener('click', () => {
        this.hideIntegrationModal();
        this.handleConnectBinance();
      });
    }

    // Event listener dinâmico para botões criados na renderização
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target && target.classList.contains('btn-premium')) {
        this.showIntegrationModal();
      }
    });
  }

  /**
   * FUNÇÃO PRINCIPAL: Coleta todos os investimentos
   */
  async collectInvestments(): Promise<void> {
    if (APP_CONFIG.connectedItems.length === 0) {
      this.showError('Nenhuma conta conectada. Conecte suas contas primeiro.');
      return;
    }

    try {
      // Mostra status de carregamento
      this.showStatus('Coletando seus investimentos...', true);

      console.log('🎯 Iniciando coleta de investimentos...');

      // Coleta investimentos usando o InvestmentCollector
      this.currentInvestments = await this.collector.collectAllInvestments(APP_CONFIG.connectedItems);

      // Gera resumo
      const summary = this.collector.generateSummary(this.currentInvestments);

      // Atualiza interface
      this.updateUI(summary);

      // Salva investimentos no cache
      this.saveInvestmentsToCache();

      // Remove status de carregamento
      this.hideStatus();

      console.log('🎉 Coleta concluída com sucesso!');

    } catch (error) {
      console.error('❌ Erro na coleta:', error);
      this.hideStatus();
      this.showError('Erro ao coletar investimentos: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    }
  }

  /**
   * Atualiza a interface com os dados coletados
   */
  private updateUI(summary: PortfolioSummary): void {
    // Atualiza cards de resumo com cores dinâmicas
    this.updateElement('totalValue', `R$ ${summary.totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    this.updateElement('totalCount', summary.totalInvestments.toString());
    
    // Card de resultado com cor dinâmica
    const profitElement = document.getElementById('totalProfit');
    if (profitElement) {
      profitElement.textContent = `R$ ${Math.abs(summary.totalProfit).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
      const profitCard = profitElement.closest('.group');
      if (profitCard) {
        // Remove classes antigas
        profitCard.classList.remove('from-emerald-500', 'via-emerald-600', 'to-teal-600', 'from-red-500', 'via-red-600', 'to-pink-600');
        // Adiciona novas classes baseadas no resultado
        if (summary.totalProfit >= 0) {
          profitCard.classList.add('from-emerald-500', 'via-emerald-600', 'to-teal-600');
        } else {
          profitCard.classList.add('from-red-500', 'via-red-600', 'to-pink-600');
        }
      }
    }
    
    // Card de rentabilidade com dados reais
    const percentElement = document.getElementById('profitPercent');
    if (percentElement) {
      if (summary.averageAnnualRate > 0) {
        percentElement.innerHTML = `
          <div class="space-y-1">
            <div class="text-2xl font-bold">${summary.profitPercentage.toFixed(2)}%</div>
            <div class="text-xs opacity-80">Resultado</div>
            <div class="text-sm font-medium">${summary.averageAnnualRate.toFixed(2)}% a.a.</div>
          </div>
        `;
      } else {
        percentElement.textContent = `${summary.profitPercentage.toFixed(2)}%`;
      }
    }

    // Atualiza contadores adicionais
    this.updateElement('investmentCount', `${summary.totalInvestments} itens`);

    // Atualiza lista de investimentos
    this.updateInvestmentsList(summary.investments);

    // Atualiza análise do portfolio
    this.updatePortfolioAnalysis(summary);

    // Atualiza timestamp
    this.updateLastUpdateTime();

    // Log do resumo melhorado
    console.log('💰 === RESUMO FINANCEIRO ATUALIZADO ===');
    console.log(`💎 Patrimônio Total: R$ ${summary.totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    console.log(`📈 Resultado: R$ ${summary.totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${summary.profitPercentage.toFixed(2)}%)`);
    console.log(`📊 Rentabilidade Média: ${summary.averageAnnualRate.toFixed(2)}% ao ano`);
    console.log(`🧾 Impostos Totais: R$ ${summary.totalTaxes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);

    // Atualiza análise do portfólio
    this.updatePortfolioAnalysis(summary);
  }

  /**
   * Atualiza a seção de análise do portfolio
   */
  private updatePortfolioAnalysis(summary: PortfolioSummary): void {
    const analysisSection = document.getElementById('portfolioAnalysis');
    const metricsContainer = document.getElementById('portfolioMetrics');
    
    if (!analysisSection || !metricsContainer || summary.totalInvestments === 0) {
      analysisSection?.classList.add('hidden');
      return;
    }

    // Mostra a seção
    analysisSection.classList.remove('hidden');

    // Calcula métricas avançadas
    const bestPerformingType = this.getBestPerformingType(summary.byType);
    const diversificationScore = this.calculateDiversificationScore(summary.byType);

    metricsContainer.innerHTML = `
      <!-- Diversificação -->
      <div class="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
            <span class="text-2xl">🎯</span>
          </div>
          <span class="text-3xl font-bold text-blue-700">${diversificationScore.toFixed(0)}%</span>
        </div>
        <h3 class="font-semibold text-blue-900 mb-2">Diversificação</h3>
        <p class="text-sm text-blue-700">${this.getDiversificationMessage(diversificationScore)}</p>
      </div>

      <!-- Melhor Categoria -->
      <div class="bg-gradient-to-br from-emerald-50 to-green-100 rounded-xl p-6 border border-emerald-200">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
            <span class="text-2xl">🏆</span>
          </div>
          <span class="text-lg font-bold text-emerald-700">${bestPerformingType.profit >= 0 ? '+' : ''}${bestPerformingType.profitPercentage.toFixed(1)}%</span>
        </div>
        <h3 class="font-semibold text-emerald-900 mb-2">Melhor Categoria</h3>
        <p class="text-sm text-emerald-700">${this.getTypeName(bestPerformingType.type)}</p>
      </div>

      <!-- Impostos -->
      <div class="bg-gradient-to-br from-orange-50 to-red-100 rounded-xl p-6 border border-orange-200">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
            <span class="text-2xl">🧾</span>
          </div>
          <span class="text-lg font-bold text-orange-700">R$ ${summary.totalTaxes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
        <h3 class="font-semibold text-orange-900 mb-2">Impostos</h3>
        <p class="text-sm text-orange-700">${((summary.totalTaxes / summary.totalBalance) * 100).toFixed(1)}% do patrimônio</p>
      </div>

      <!-- Rentabilidade Média -->
      <div class="bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl p-6 border border-purple-200">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
            <span class="text-2xl">📊</span>
          </div>
          <span class="text-lg font-bold text-purple-700">${summary.averageAnnualRate.toFixed(1)}%</span>
        </div>
        <h3 class="font-semibold text-purple-900 mb-2">Rent. Média</h3>
        <p class="text-sm text-purple-700">Taxa anual ponderada</p>
      </div>
    `;
  }

  /**
   * Calcula score de diversificação (0-100%)
   */
  private calculateDiversificationScore(byType: PortfolioSummary['byType']): number {
    const types = Object.keys(byType);
    const typeCount = types.length;
    
    if (typeCount <= 1) return 0;
    if (typeCount >= 4) return 100;
    
    // Calcula concentração (quanto mais equilibrado, melhor)
    const percentages = types.map(type => {
      const typeData = byType[type as keyof typeof byType];
      return typeData ? typeData.percentage : 0;
    });
    const maxConcentration = Math.max(...percentages);
    
    // Score baseado na quantidade de tipos e distribuição
    const diversityScore = (typeCount / 4) * 100; // Máximo 4 tipos principais
    const distributionScore = (1 - maxConcentration / 100) * 100; // Penaliza concentração
    
    return Math.min(100, (diversityScore + distributionScore) / 2);
  }

  /**
   * Encontra o tipo de investimento com melhor performance
   */
  private getBestPerformingType(byType: PortfolioSummary['byType']): { type: InvestmentType; profit: number; profitPercentage: number } {
    let bestType: InvestmentType = 'FIXED_INCOME';
    let bestProfit = -Infinity;
    let bestProfitPercentage = -Infinity;

    Object.entries(byType).forEach(([type, data]) => {
      if (data!.profitPercentage > bestProfitPercentage) {
        bestType = type as InvestmentType;
        bestProfit = data!.profit;
        bestProfitPercentage = data!.profitPercentage;
      }
    });

    return { type: bestType, profit: bestProfit, profitPercentage: bestProfitPercentage };
  }

  /**
   * Retorna mensagem baseada no score de diversificação
   */
  private getDiversificationMessage(score: number): string {
    if (score >= 80) return 'Excelente diversificação!';
    if (score >= 60) return 'Boa diversificação';
    if (score >= 40) return 'Diversificação moderada';
    return 'Portfolio concentrado';
  }

  /**
   * Atualiza a lista de investimentos na interface
   */
  private updateInvestmentsList(investments: Investment[]): void {
    const container = document.getElementById('investmentsList');
    if (!container) return;

    if (investments.length === 0) {
      container.innerHTML = `
        <div class="text-center py-16">
          <div class="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-full flex items-center justify-center shadow-lg">
            <svg class="w-16 h-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-slate-900 mb-3">Conecte suas contas</h3>
          <p class="text-slate-600 mb-8 max-w-lg mx-auto text-lg leading-relaxed">
            Visualize todos os seus investimentos em um só lugar. Conecte suas contas bancárias de forma segura para começar.
          </p>
          <button class="btn-premium px-8 py-4">
            <span class="flex items-center space-x-3">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
              </svg>
              <span>Conectar Contas Agora</span>
            </span>
          </button>
        </div>
      `;
      return;
    }

    // Agrupa investimentos por instituição
    const byInstitution = this.groupInvestmentsByInstitution(investments);

    container.innerHTML = Object.entries(byInstitution).map(([institutionName, instInvestments]) => {
      const institutionTotal = instInvestments.reduce((sum, inv) => sum + inv.balance, 0);
      const institutionCount = instInvestments.length;

      return `
        <div class="institution-group mb-8 animate-fade-in">
          <!-- Header da Instituição -->
          <div class="bg-gradient-to-r from-slate-50 to-blue-50 rounded-t-xl px-6 py-4 border-b border-slate-200">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                </div>
                <div>
                  <h3 class="font-bold text-slate-900 text-lg">${institutionName}</h3>
                  <span class="text-sm text-slate-600">${institutionCount} investimentos</span>
                </div>
              </div>
              <div class="text-right">
                <p class="text-2xl font-bold text-slate-900">R$ ${institutionTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <span class="text-sm text-slate-600">Total na instituição</span>
              </div>
            </div>
          </div>

          <!-- Lista de Investimentos da Instituição -->
          <div class="bg-white border-x border-b border-slate-200 rounded-b-xl">
            ${instInvestments.map((investment, index) => {
              // Usa apenas dados reais do Pluggy
              const profit = investment.amountProfit || 0;
              const originalAmount = investment.amountOriginal || investment.amount || investment.balance;
              const profitPercent = originalAmount > 0 ? ((profit / originalAmount) * 100) : 0;
              
              // Dados de rentabilidade da Pluggy (apenas dados reais)
              const annualRate = investment.annualRate || 0;
              const monthlyRate = investment.lastMonthRate || 0;
              const yearRate = investment.lastTwelveMonthsRate || 0;
              const taxes = (investment.taxes || 0) + (investment.taxes2 || 0);
              
              // Debug: Log dos dados de rentabilidade reais
              if (investment.name) {
                console.log(`🔍 [${investment.name}] Dados Reais:`, {
                  annualRate: investment.annualRate,
                  monthlyRate: investment.lastMonthRate,
                  yearRate: investment.lastTwelveMonthsRate,
                  amountProfit: investment.amountProfit,
                  amountOriginal: investment.amountOriginal,
                  taxes: investment.taxes,
                  taxes2: investment.taxes2
                });
              }
              
              // Determina cor baseada no lucro/prejuízo
              const isPositive = profit > 0;
              const isNegative = profit < 0;
              const profitClass = isPositive ? 'text-emerald-600' : isNegative ? 'text-red-600' : 'text-slate-600';
              const profitBgClass = isPositive ? 'bg-emerald-50 border-emerald-200' : isNegative ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200';
              const profitIconSymbol = isPositive ? '↗️' : isNegative ? '↘️' : '➡️';

              const typeIcon = this.getInvestmentTypeIcon(investment.type);
              const borderClass = index === instInvestments.length - 1 ? '' : 'border-b border-slate-100';

              return `
                <div class="group p-6 ${borderClass} hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-300">
                  <div class="flex items-center justify-between">
                    <!-- Informações do Investimento -->
                    <div class="flex items-center space-x-4 flex-1">
                      <div class="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-sm">
                        <span class="text-2xl">${typeIcon}</span>
                      </div>
                      <div class="flex-1">
                        <h4 class="font-semibold text-slate-900 text-lg mb-1 group-hover:text-blue-600 transition-colors duration-200">
                          ${investment.name}
                        </h4>
                        <p class="text-slate-600 text-sm mb-1">
                          ${investment.type}${investment.subtype ? ` • ${investment.subtype}` : ''}
                        </p>
                        ${investment.code ? `<p class="text-slate-500 text-xs font-mono">${investment.code}</p>` : ''}
                      </div>
                    </div>

                    <!-- Métricas do Investimento -->
                    <div class="flex items-center space-x-6">
                      <!-- Saldo Atual -->
                      <div class="text-right">
                        <p class="text-2xl font-bold text-slate-900 group-hover:scale-105 transition-transform duration-200">
                          R$ ${investment.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p class="text-sm text-slate-600">Saldo atual</p>
                      </div>

                      <!-- Resultado -->
                      ${profit !== 0 ? `
                        <div class="text-right">
                          <div class="inline-flex items-center space-x-2 px-3 py-2 rounded-lg border ${profitBgClass}">
                            <span class="text-lg">${profitIconSymbol}</span>
                            <div class="text-right">
                              <p class="font-semibold ${profitClass}">
                                R$ ${Math.abs(profit).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </p>
                              <p class="text-xs ${profitClass}">
                                ${profitPercent > 0 ? '+' : ''}${profitPercent.toFixed(2)}%
                              </p>
                            </div>
                          </div>
                        </div>
                      ` : ''}

                      <!-- Rentabilidade (se disponível) -->
                      ${(annualRate > 0 || monthlyRate > 0 || yearRate > 0) ? `
                        <div class="text-right">
                          <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p class="text-xs text-blue-600 font-medium mb-2">📊 Rentabilidade</p>
                            ${annualRate > 0 ? `<p class="text-sm text-blue-700"><span class="font-medium">${annualRate.toFixed(2)}%</span> <span class="text-xs">anual</span></p>` : ''}
                            ${monthlyRate > 0 ? `<p class="text-sm text-blue-700"><span class="font-medium">${monthlyRate.toFixed(2)}%</span> <span class="text-xs">mês</span></p>` : ''}
                            ${yearRate > 0 ? `<p class="text-sm text-blue-700"><span class="font-medium">${yearRate.toFixed(2)}%</span> <span class="text-xs">12m</span></p>` : ''}
                            ${taxes > 0 ? `<p class="text-xs text-slate-500">IR: R$ ${taxes.toFixed(2)}</p>` : ''}
                          </div>
                        </div>
                      ` : ''}

                      <!-- Botão de Ações -->
                      <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button class="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors duration-200">
                          <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Obtém connect token da API Pluggy
   */
  private async getConnectToken(): Promise<string> {
    try {
      console.log('🔑 Obtendo connect token...');
      
      const response = await fetch(`${APP_CONFIG.pluggy.baseUrl}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: APP_CONFIG.pluggy.clientId,
          clientSecret: APP_CONFIG.pluggy.clientSecret
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na autenticação: ${response.status}`);
      }

      const authData = await response.json();
      const apiKey = authData.apiKey || authData.accessToken;
      
      // Agora cria o connect token
      const connectResponse = await fetch(`${APP_CONFIG.pluggy.baseUrl}/connect_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': apiKey
        },
        body: JSON.stringify({
          options: {
            clientUserId: 'rp-finances-user'
          }
        })
      });

      if (!connectResponse.ok) {
        throw new Error(`Erro ao criar connect token: ${connectResponse.status}`);
      }

      const connectData = await connectResponse.json();
      console.log('✅ Connect token obtido com sucesso');
      
      return connectData.accessToken;
      
    } catch (error) {
      console.error('❌ Erro ao obter connect token:', error);
      throw error;
    }
  }

  /**
   * Obtém o token de conexão da API Pluggy
   */
  /*
  // @ts-ignore - Função será removida
  private async getConnectToken(): Promise<string> {
    try {
      console.log('� Obtendo token de conexão...');
      
      const response = await fetch(`${APP_CONFIG.pluggy.baseUrl}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: APP_CONFIG.pluggy.clientId,
          clientSecret: APP_CONFIG.pluggy.clientSecret
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na autenticação: ${response.status}`);
      }

      const authData = await response.json();
      console.log('✅ Token obtido com sucesso');
      
      return authData.apiKey;
      
    } catch (error) {
      console.error('❌ Erro ao obter token:', error);
      throw error;
    }
  }
  */

  /**
   * Callback executado quando uma conta é conectada
   */
  private async onAccountConnected(itemData: any): Promise<void> {
    console.log('🎉 Nova conta conectada:', itemData);
    
    try {
      // Adiciona o item conectado à configuração
      APP_CONFIG.connectedItems.push(itemData.item.id);
      
      // Salva estado da conexão Pluggy
      StateManager.addPluggyItem(itemData.item.id);
      
      // Mostra sucesso
      this.showSuccess(`Conta ${itemData.item.connector.name} conectada com sucesso!`);
      
      // Inicia coleta automática dos investimentos
      await this.collectInvestments();
      
    } catch (error) {
      console.error('❌ Erro após conectar conta:', error);
      this.showError('Conta conectada, mas erro ao coletar investimentos');
    }
  }

  /**
   * Utilitários da interface
   */
  private updateElement(id: string, text: string): void {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = text;
    }
  }

  private showStatus(message: string, show: boolean): void {
    const statusCard = document.getElementById('statusCard');
    const statusText = document.getElementById('statusText');
    
    if (statusCard && statusText) {
      statusText.textContent = message;
      statusCard.classList.toggle('hidden', !show);
    }
  }

  private hideStatus(): void {
    this.showStatus('', false);
  }

  private showError(message: string): void {
    console.error('❌', message);
    alert('Erro: ' + message);
  }

  private showSuccess(message: string): void {
    // Remove mensagens anteriores
    const existingSuccess = document.querySelector('.success-message');
    if (existingSuccess) {
      existingSuccess.remove();
    }

    // Cria elemento de sucesso
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message fixed top-4 right-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg z-50';
    successDiv.innerHTML = `
      <div class="flex items-center">
        <span class="text-green-600 mr-2">✅</span>
        <span>${message}</span>
        <button class="ml-4 text-green-600 hover:text-green-800" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;

    document.body.appendChild(successDiv);

    // Remove automaticamente após 5 segundos
    setTimeout(() => {
      if (successDiv.parentNode) {
        successDiv.remove();
      }
    }, 5000);
  }

  private updateLastUpdateTime(): void {
    const element = document.getElementById('lastUpdate');
    if (element) {
      element.textContent = `Atualizado em ${new Date().toLocaleTimeString('pt-BR')}`;
    }
  }

  private showWelcomeMessage(): void {
    console.log('👋 Bem-vindo ao RP-Finances!');
    console.log('📋 Para começar:');
    console.log('1. Configure suas credenciais Pluggy em APP_CONFIG');
    console.log('2. Conecte suas contas bancárias');
    console.log('3. Os investimentos serão coletados automaticamente');
  }

  /**
   * Agrupa investimentos por instituição
   */
  private groupInvestmentsByInstitution(investments: Investment[]): Record<string, Investment[]> {
    return investments.reduce((groups: Record<string, Investment[]>, investment) => {
      const institutionName = investment.institution?.name || 'Instituição não identificada';
      if (!groups[institutionName]) {
        groups[institutionName] = [];
      }
      groups[institutionName].push(investment);
      return groups;
    }, {});
  }

  /**
   * Retorna o ícone apropriado para o tipo de investimento
   */
  private getInvestmentTypeIcon(type: string): string {
    const iconMap: Record<string, string> = {
      'BANK_ACCOUNT': '🏦',
      'CREDIT_CARD': '💳',
      'INVESTMENT': '📈',
      'LOAN': '💰',
      'FINANCING': '🏠',
      'CDB': '💎',
      'LCI': '🏛️',
      'LCA': '🌾',
      'FUND': '📊',
      'STOCK': '📈',
      'FIXED_INCOME': '💰',
      'PENSION': '🎯',
      'SAVINGS': '🐷',
      'COE': '⚖️',
      'TESOURO_DIRETO': '🏛️'
    };
    
    return iconMap[type] || iconMap[type.toUpperCase()] || '💼';
  }

  /**
   * Retorna nome amigável do tipo de investimento
   */
  private getTypeName(type: InvestmentType): string {
    const names = {
      FIXED_INCOME: 'Renda Fixa',
      EQUITY: 'Ações',
      MUTUAL_FUND: 'Fundos',
      SECURITY: 'Previdência',
      ETF: 'ETFs',
      COE: 'COE',
    };
    return names[type] || type;
  }

  /**
   * Gera dados de rentabilidade realistas quando os dados reais não estão disponíveis
   */

  /**
   * Mostra modal de seleção de integrações
   */
  private showIntegrationModal(): void {
    const modal = document.getElementById('integrationModal');
    const modalContent = document.getElementById('modalContent');
    
    if (modal && modalContent) {
      modal.classList.remove('hidden');
      // Força repaint antes da animação
      requestAnimationFrame(() => {
        modalContent.classList.remove('scale-95', 'opacity-0');
        modalContent.classList.add('scale-100', 'opacity-100');
      });
    }
  }

  /**
   * Esconde modal de seleção de integrações
   */
  private hideIntegrationModal(): void {
    const modal = document.getElementById('integrationModal');
    const modalContent = document.getElementById('modalContent');
    
    if (modal && modalContent) {
      modalContent.classList.remove('scale-100', 'opacity-100');
      modalContent.classList.add('scale-95', 'opacity-0');
      
      // Aguarda animação antes de esconder
      setTimeout(() => {
        modal.classList.add('hidden');
      }, 300);
    }
  }

  /**
   * Manipula conexão via Pluggy (método original renomeado)
   */
  private async handleConnectPluggy(): Promise<void> {
    console.log('🔗 Iniciando Pluggy Connect Widget...');
    
    try {
      this.showStatus('Obtendo token de conexão...', true);
      
      // Obtém connect token da API Pluggy
      const connectToken = await this.getConnectToken();
      
      this.showStatus('', false);
      
      // Configura e abre o Pluggy Connect Widget oficial
      const pluggyConnect = new (window as any).PluggyConnect({
        connectToken: connectToken,
        includeSandbox: true, // Inclui contas sandbox do Pluggy
        onSuccess: (itemData: any) => {
          console.log('✅ Conta conectada com sucesso:', itemData);
          this.onAccountConnected(itemData);
        },
        onError: (error: any) => {
          console.error('❌ Erro ao conectar conta:', error);
          this.showError('Erro ao conectar conta: ' + (error.message || 'Erro desconhecido'));
        },
        onOpen: () => {
          console.log('📱 Widget Pluggy aberto');
        },
        onClose: () => {
          console.log('📱 Widget Pluggy fechado');
        }
      });

      // Abre o widget
      pluggyConnect.init();
      
    } catch (error) {
      console.error('❌ Erro ao conectar conta:', error);
      this.showError('Erro ao conectar conta');
    }
  }

  /**
   * Manipula conexão via Binance
   */
  private async handleConnectBinance(): Promise<void> {
    console.log('🟠 Iniciando conexão Binance...');
    
    if (!this.binanceCollector) {
      this.showError('Binance não configurado. Configure suas credenciais no arquivo .env');
      return;
    }

    try {
      this.showStatus('Testando conexão Binance...', true);

      // Testa conexão
      const connected = await this.binanceCollector.testConnection();
      
      if (!connected) {
        this.showStatus('', false);
        this.showError('Falha ao conectar com Binance. Verifique suas credenciais.');
        return;
      }

      this.showStatus('Coletando investimentos Binance...', true);

      // Coleta investimentos
      const binanceInvestments = await this.binanceCollector.collectInvestments();
      
      // Adiciona aos investimentos atuais
      this.currentInvestments = [...this.currentInvestments, ...binanceInvestments];
      
      // Salva estado da conexão Binance
      StateManager.setBinanceConnected(true);
      
      // Salva investimentos no cache
      this.saveInvestmentsToCache();
      
      this.showStatus('', false);

      // Calcula resumo e atualiza interface
      const summary = this.collector.generateSummary(this.currentInvestments);
      this.updateUI(summary);

      this.showSuccess(`✅ ${binanceInvestments.length} investimentos Binance conectados com sucesso!`);

    } catch (error) {
      console.error('❌ Erro ao conectar Binance:', error);
      this.showStatus('', false);
      this.showError('Erro ao conectar Binance: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    }
  }

  /**
   * Carrega estado anterior da sessão
   */
  private loadPreviousState(): void {
    const state = StateManager.loadState();
    
    // Restaura os IDs das contas conectadas
    if (state.pluggyItemIds.length > 0) {
      APP_CONFIG.connectedItems = [...state.pluggyItemIds];
      console.log(`🔗 Restaurando ${state.pluggyItemIds.length} contas Pluggy conectadas`);
    }
    
    if (state.investments.length > 0) {
      console.log(`📂 Restaurando ${state.investments.length} investimentos do cache`);
      this.currentInvestments = state.investments;
      
      // Atualiza interface imediatamente com dados do cache
      const summary = this.collector.generateSummary(this.currentInvestments);
      this.updateUI(summary);
      
      // Atualiza status das conexões na interface
      this.updateConnectionStatus(state);
    }
    
    if (StateManager.hasActiveConnections()) {
      console.log('🔗 Conexões ativas detectadas:', {
        pluggy: state.pluggyConnected,
        binance: state.binanceConnected
      });
    }
  }

  /**
   * Atualiza status visual das conexões
   */
  private updateConnectionStatus(state: any): void {
    // Atualiza botões de conexão
    if (state.pluggyConnected || state.binanceConnected) {
      const connectButtons = document.querySelectorAll('.connect-button');
      connectButtons.forEach(btn => {
        const button = btn as HTMLElement;
        button.innerHTML = '🔗 Reconectar Contas';
        button.classList.add('connected');
      });
    }

    // Mostra status no header
    if (state.pluggyConnected && state.binanceConnected) {
      this.showSuccess('✅ Pluggy e Binance conectados');
    } else if (state.pluggyConnected) {
      this.showSuccess('✅ Pluggy conectado');
    } else if (state.binanceConnected) {
      this.showSuccess('✅ Binance conectado');
    }
  }

  /**
   * Salva investimentos no cache
   */
  private saveInvestmentsToCache(): void {
    StateManager.updateInvestments(this.currentInvestments);
  }

  /**
   * Limpa o cache e recarrega a página
   */
  private clearCache(): void {
    if (confirm('Tem certeza que deseja limpar todas as conexões e dados salvos?')) {
      StateManager.clearState();
      this.currentInvestments = [];
      APP_CONFIG.connectedItems = [];
      this.showSuccess('Cache limpo com sucesso! Recarregando página...');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  }
}

/**
 * Inicialização da aplicação quando o DOM estiver pronto
 */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const app = new PortfolioApp();
    await app.init();

    // Expõe funções globais para debug
    (window as any).app = app;
    (window as any).collectInvestments = () => app.collectInvestments();

    console.log('🎯 Digite collectInvestments() no console para coletar dados');

  } catch (error) {
    console.error('❌ Erro fatal na inicialização:', error);
  }
});
