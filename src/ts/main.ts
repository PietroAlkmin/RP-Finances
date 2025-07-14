/**
 * Arquivo principal da aplicação RP-Finances
 * Responsável por inicializar a aplicação e coordenar os módulos
 */

import { InvestmentCollector } from './portfolio/InvestmentCollector.js';
import type { PluggyConfig, Investment, PortfolioSummary } from './integrations/pluggy/PluggyTypes.js';
import { ENVIRONMENT_CONFIG } from '../config/environment.js';

/**
 * Configuração da aplicação
 */
const APP_CONFIG = {
  // Configuração Pluggy (vem do arquivo de ambiente)
  pluggy: ENVIRONMENT_CONFIG.pluggy as PluggyConfig,

  // IDs de exemplo para teste (em produção, vir do Supabase)
  connectedItems: [] as string[],
};

/**
 * Classe principal da aplicação
 */
class PortfolioApp {
  private collector: InvestmentCollector;
  private currentInvestments: Investment[] = [];

  constructor() {
    this.collector = new InvestmentCollector(APP_CONFIG.pluggy);
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

      // Adiciona dados de exemplo para demonstração da UI
      // TODO: Remover em produção
      this.addSampleData();

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
    // Botões de conectar contas
    const connectBtn = document.getElementById('connectBtn');
    const connectBtn2 = document.getElementById('connectBtn2');

    if (connectBtn) {
      connectBtn.addEventListener('click', () => this.handleConnectAccounts());
    }
    if (connectBtn2) {
      connectBtn2.addEventListener('click', () => this.handleConnectAccounts());
    }

    // Event listener dinâmico para botões criados na renderização
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target && target.classList.contains('btn-premium')) {
        this.handleConnectAccounts();
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
    // Atualiza cards de resumo
    this.updateElement('totalValue', `R$ ${summary.totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    this.updateElement('totalCount', summary.totalInvestments.toString());
    this.updateElement('totalProfit', `R$ ${summary.totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    this.updateElement('profitPercent', `${summary.profitPercentage.toFixed(2)}%`);

    // Atualiza lista de investimentos
    this.updateInvestmentsList(summary.investments);

    // Atualiza timestamp
    this.updateLastUpdateTime();
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
              const profit = investment.amountProfit || 0;
              const originalAmount = investment.amountOriginal || investment.amount || investment.balance;
              const profitPercent = originalAmount > 0 ? ((profit / originalAmount) * 100) : 0;
              
              const isPositive = profit > 0;
              const isNegative = profit < 0;
              
              const profitClass = isPositive ? 'text-emerald-600' : isNegative ? 'text-red-600' : 'text-slate-600';
              const profitBgClass = isPositive ? 'bg-emerald-50 border-emerald-200' : isNegative ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200';
              const profitIcon = isPositive ? '↗️' : isNegative ? '↘️' : '➡️';

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
                            <span class="text-lg">${profitIcon}</span>
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
   * Manipula o clique no botão de conectar contas
   */
  /**
   * Manipula o clique no botão de conectar contas
   */
  private async handleConnectAccounts(): Promise<void> {
    console.log('🔗 Iniciando Pluggy Connect Widget...');
    
    try {
      this.showStatus('Obtendo token de conexão...', true);
      
      // Obtém connect token da API Pluggy
      const connectToken = await this.getConnectToken();
      
      this.showStatus('', false);
      
      // Configura e abre o Pluggy Connect Widget oficial
      const pluggyConnect = new (window as any).PluggyConnect({
        connectToken: connectToken,
        includeSandbox: true, // Para testes
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
      console.error('❌ Erro ao inicializar Pluggy Connect:', error);
      this.showStatus('', false);
      this.showError('Erro ao inicializar conexão de contas');
    }
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
   * Dados de exemplo para demonstração da UI
   */
  private addSampleData(): void {
    // Simula dados de investimentos para demonstração
    const sampleInvestments: Investment[] = [
      {
        id: '1',
        name: 'CDB Banco ABC',
        code: 'CDB001',
        type: 'FIXED_INCOME',
        subtype: 'CDB',
        balance: 15750.00,
        currencyCode: 'BRL',
        value: 100.50,
        quantity: 156.72,
        amount: 15000.00,
        amountProfit: 750.00,
        amountOriginal: 15000.00,
        date: '2024-01-15',
        dueDate: '2025-01-15',
        status: 'ACTIVE',
        institution: {
          name: 'Banco ABC',
          number: '001'
        },
        itemId: 'item1'
      },
      {
        id: '2',
        name: 'Tesouro IPCA+ 2035',
        code: 'NTNB350035',
        type: 'FIXED_INCOME',
        subtype: 'TREASURY',
        balance: 5420.30,
        currencyCode: 'BRL',
        value: 2710.15,
        quantity: 2,
        amount: 5200.00,
        amountProfit: 220.30,
        amountOriginal: 5200.00,
        date: '2024-02-01',
        dueDate: '2035-05-15',
        status: 'ACTIVE',
        institution: {
          name: 'Tesouro Nacional',
          number: '000'
        },
        itemId: 'item2'
      },
      {
        id: '3',
        name: 'Fundo Multimercado XYZ',
        code: 'FUND001',
        type: 'MUTUAL_FUND',
        subtype: 'MULTIMARKET_FUND',
        balance: 8935.67,
        currencyCode: 'BRL',
        value: 2.1589,
        quantity: 4140.23,
        amount: 8500.00,
        amountProfit: 435.67,
        amountOriginal: 8500.00,
        date: '2024-01-20',
        status: 'ACTIVE',
        institution: {
          name: 'Corretora XYZ',
          number: '123'
        },
        itemId: 'item3'
      },
      {
        id: '4',
        name: 'LCI Banco ABC',
        code: 'LCI002',
        type: 'FIXED_INCOME',
        subtype: 'LCI',
        balance: 12100.00,
        currencyCode: 'BRL',
        value: 100.83,
        quantity: 120.00,
        amount: 12000.00,
        amountProfit: 100.00,
        amountOriginal: 12000.00,
        date: '2024-03-01',
        dueDate: '2026-03-01',
        status: 'ACTIVE',
        institution: {
          name: 'Banco ABC',
          number: '001'
        },
        itemId: 'item1'
      },
      {
        id: '5',
        name: 'Ações PETR4',
        code: 'PETR4',
        type: 'EQUITY',
        subtype: 'STOCK',
        balance: 3456.00,
        currencyCode: 'BRL',
        value: 28.80,
        quantity: 120,
        amount: 3600.00,
        amountProfit: -144.00,
        amountOriginal: 3600.00,
        date: '2024-02-15',
        status: 'ACTIVE',
        institution: {
          name: 'Corretora XYZ',
          number: '123'
        },
        itemId: 'item3'
      }
    ];

    // Atualiza a interface com os dados de exemplo
    const totalBalance = sampleInvestments.reduce((sum, inv) => sum + inv.balance, 0);
    const totalProfit = sampleInvestments.reduce((sum, inv) => sum + (inv.amountProfit || 0), 0);
    const totalOriginal = sampleInvestments.reduce((sum, inv) => sum + (inv.amountOriginal || inv.amount), 0);
    
    const summary: PortfolioSummary = {
      totalBalance: totalBalance,
      totalProfit: totalProfit,
      profitPercentage: totalOriginal > 0 ? (totalProfit / totalOriginal) * 100 : 0,
      totalInvestments: sampleInvestments.length,
      investments: sampleInvestments,
      lastUpdated: new Date().toISOString(),
      byType: {
        FIXED_INCOME: {
          count: 3,
          balance: 33270.30,
          percentage: 75.2
        },
        EQUITY: {
          count: 1,
          balance: 3456.00,
          percentage: 7.8
        },
        MUTUAL_FUND: {
          count: 1,
          balance: 8935.67,
          percentage: 17.0
        }
      },
      accounts: []
    };

    this.updatePortfolioSummary(summary);
    this.updateInvestmentsList(sampleInvestments);
  }

  /**
   * Atualiza o resumo do portfólio na interface
   */
  private updatePortfolioSummary(summary: PortfolioSummary): void {
    // Atualiza informações gerais
    this.updateElement('totalValue', `R$ ${summary.totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    this.updateElement('totalProfit', `R$ ${summary.totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    this.updateElement('totalCount', summary.totalInvestments.toString());

    // Atualiza porcentagem de lucro
    const profitPercentage = (summary.totalProfit / summary.totalBalance) * 100;
    this.updateElement('profitPercent', `${profitPercentage.toFixed(2)}%`);

    // Atualiza timestamp
    this.updateLastUpdateTime();
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

    console.log('🎯 Digite collectInvestments() no console para testar a coleta');

  } catch (error) {
    console.error('❌ Erro fatal na inicialização:', error);
  }
});
