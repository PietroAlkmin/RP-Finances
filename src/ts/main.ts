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
        <div class="text-center text-gray-500 py-8">
          <p>Nenhum investimento encontrado</p>
        </div>
      `;
      return;
    }

    container.innerHTML = investments.map((investment) => {
      const profit = investment.amountProfit || 0;
      const profitClass = profit >= 0 ? 'text-green-600' : 'text-red-600';
      const profitIcon = profit >= 0 ? '📈' : '📉';

      return `
        <div class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <h3 class="font-semibold text-gray-900">${investment.name}</h3>
              <p class="text-sm text-gray-500">${investment.type} • ${investment.subtype || 'N/A'}</p>
              <p class="text-sm text-gray-500">${investment.institution?.name || 'N/A'}</p>
            </div>
            <div class="text-right">
              <p class="font-semibold text-gray-900">R$ ${investment.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p class="text-sm ${profitClass}">${profitIcon} R$ ${profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
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
