/**
 * 🎯 RP Finances - Arquivo Principal TypeScript
 * 
 * Este arquivo é o ponto de entrada da aplicação.
 * Responsável por:
 * - Inicializar a aplicação
 * - Configurar integrações com Supabase
 * - Gerenciar o estado global do portfolio
 * - Coordenar módulos de funcionalidades
 */

// Importações dos módulos da aplicação
import { PortfolioManager } from './portfolio/portfolio-manager.js';
import { SupabaseClient } from './integrations/supabase-client.js';
import { UIManager } from './ui/ui-manager.js';

// Tipos para estrutura de dados do portfolio
interface PortfolioData {
    totalAssets: number;
    monthlyReturn: number;
    lastUpdate: string;
    connectedAccounts: ConnectedAccount[];
    assetDistribution: AssetDistribution[];
}

interface ConnectedAccount {
    id: string;
    institutionName: string;
    accountType: string;
    balance: number;
    currency: string;
    lastSync: string;
}

interface AssetDistribution {
    category: string;
    value: number;
    percentage: number;
    color: string;
}

/**
 * 🚀 Classe principal da aplicação RP Finances
 * Coordena todos os módulos e gerencia o estado global
 */
class RPFinancesApp {
    private portfolioManager: PortfolioManager;
    private supabaseClient: SupabaseClient;
    private uiManager: UIManager;
    private portfolioData: PortfolioData | null = null;

    constructor() {
        // Inicialização dos gerenciadores principais
        this.supabaseClient = new SupabaseClient();
        this.portfolioManager = new PortfolioManager(this.supabaseClient);
        this.uiManager = new UIManager();
        
        console.log('🎯 RP Finances inicializado');
    }

    /**
     * 🏁 Método principal de inicialização da aplicação
     * Chama todos os métodos necessários para configurar a app
     */
    async init(): Promise<void> {
        try {
            console.log('🚀 Iniciando aplicação RP Finances...');
            
            // 1. Verificar autenticação do usuário
            await this.checkAuthentication();
            
            // 2. Inicializar interface do usuário
            this.initializeUI();
            
            // 3. Carregar dados do portfolio
            await this.loadPortfolioData();
            
            // 4. Configurar atualizações em tempo real
            this.setupRealTimeUpdates();
            
            console.log('✅ Aplicação inicializada com sucesso');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar aplicação:', error);
            this.uiManager.showError('Erro ao carregar a aplicação. Tente novamente.');
        }
    }

    /**
     * 🔐 Verifica se o usuário está autenticado
     * Se não estiver, redireciona para login
     */
    private async checkAuthentication(): Promise<void> {
        console.log('🔐 Verificando autenticação...');
        
        try {
            const user = await this.supabaseClient.getCurrentUser();
            
            if (!user) {
                console.log('⚠️ Usuário não autenticado');
                // Por enquanto, vamos permitir acesso sem autenticação
                // Em produção, redirecionaria para login
                return;
            }
            
            console.log('✅ Usuário autenticado:', user.email);
            
        } catch (error) {
            console.error('❌ Erro na verificação de autenticação:', error);
            // Por enquanto, continua sem autenticação
        }
    }

    /**
     * 🎨 Inicializa a interface do usuário
     * Configura eventos e componentes interativos
     */
    private initializeUI(): void {
        console.log('🎨 Inicializando interface...');
        
        // Inicializar gerenciador de UI
        this.uiManager.init();
        
        // Configurar eventos de botões
        this.setupEventListeners();
        
        // Atualizar data/hora atual
        this.updateCurrentTime();
        
        console.log('✅ Interface inicializada');
    }

    /**
     * 🎯 Configura os event listeners da aplicação
     * Gerencia cliques e interações do usuário
     */
    private setupEventListeners(): void {
        // Botão de atualizar dados
        const refreshButton = document.querySelector('[data-action="refresh"]');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => {
                console.log('🔄 Atualizando dados do portfolio...');
                this.loadPortfolioData();
            });
        }

        // Botões de navegação (serão expandidos no futuro)
        const navButtons = document.querySelectorAll('nav button');
        navButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const target = event.target as HTMLElement;
                console.log('📍 Navegação:', target.textContent);
                // Navegação será implementada posteriormente
            });
        });
    }

    /**
     * 📊 Carrega todos os dados do portfolio do usuário
     * Integra dados de múltiplas fontes (bancos, corretoras, etc.)
     */
    private async loadPortfolioData(): Promise<void> {
        console.log('📊 Carregando dados do portfolio...');
        
        try {
            // Mostrar indicador de carregamento
            this.uiManager.showLoading();
            
            // Carregar dados do portfolio via PortfolioManager
            this.portfolioData = await this.portfolioManager.getPortfolioData();
            
            // Atualizar interface com os dados
            this.updatePortfolioUI();
            
            // Esconder indicador de carregamento
            this.uiManager.hideLoading();
            
            console.log('✅ Dados do portfolio carregados:', this.portfolioData);
            
        } catch (error) {
            console.error('❌ Erro ao carregar portfolio:', error);
            this.uiManager.showError('Erro ao carregar dados do portfolio');
            this.uiManager.hideLoading();
        }
    }

    /**
     * 🔄 Atualiza a interface com os dados do portfolio
     * Preenche cards, tabelas e gráficos
     */
    private updatePortfolioUI(): void {
        if (!this.portfolioData) return;

        console.log('🔄 Atualizando interface do portfolio...');

        // Atualizar cards de resumo
        this.updateSummaryCards();
        
        // Atualizar lista de contas conectadas
        this.updateConnectedAccounts();
        
        // Atualizar distribuição de ativos
        this.updateAssetDistribution();
    }

    /**
     * 💳 Atualiza os cards de resumo financeiro
     */
    private updateSummaryCards(): void {
        if (!this.portfolioData) return;

        // Patrimônio Total
        const totalAssetsElement = document.getElementById('total-assets');
        if (totalAssetsElement) {
            totalAssetsElement.textContent = this.formatCurrency(this.portfolioData.totalAssets);
        }

        // Rentabilidade Mensal
        const monthlyReturnElement = document.getElementById('monthly-return');
        if (monthlyReturnElement) {
            const returnText = this.formatPercentage(this.portfolioData.monthlyReturn);
            monthlyReturnElement.textContent = returnText;
            
            // Cor baseada na performance
            if (this.portfolioData.monthlyReturn >= 0) {
                monthlyReturnElement.className = 'text-2xl font-bold text-green-600';
            } else {
                monthlyReturnElement.className = 'text-2xl font-bold text-red-600';
            }
        }

        // Última Atualização
        const lastUpdateElement = document.getElementById('last-update');
        if (lastUpdateElement) {
            lastUpdateElement.textContent = this.formatDate(this.portfolioData.lastUpdate);
        }
    }

    /**
     * 🏦 Atualiza a lista de contas conectadas
     */
    private updateConnectedAccounts(): void {
        if (!this.portfolioData) return;

        const accountsContainer = document.getElementById('connected-accounts');
        if (!accountsContainer) return;

        // Limpar conteúdo atual
        accountsContainer.innerHTML = '';

        // Renderizar cada conta conectada
        this.portfolioData.connectedAccounts.forEach(account => {
            const accountElement = this.createAccountElement(account);
            accountsContainer.appendChild(accountElement);
        });
    }

    /**
     * 🏦 Cria elemento HTML para uma conta conectada
     */
    private createAccountElement(account: ConnectedAccount): HTMLElement {
        const div = document.createElement('div');
        div.className = 'flex items-center justify-between p-4 border border-gray-200 rounded-lg';
        
        div.innerHTML = `
            <div class="flex items-center">
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <span class="text-blue-600 font-semibold">${account.institutionName.charAt(0)}</span>
                </div>
                <div>
                    <h4 class="font-medium text-gray-900">${account.institutionName}</h4>
                    <p class="text-sm text-gray-600">${account.accountType}</p>
                </div>
            </div>
            <div class="text-right">
                <p class="font-semibold text-gray-900">${this.formatCurrency(account.balance)}</p>
                <p class="text-sm text-gray-600">Sincronizado: ${this.formatDate(account.lastSync)}</p>
            </div>
        `;
        
        return div;
    }

    /**
     * 📈 Atualiza a seção de distribuição de ativos
     */
    private updateAssetDistribution(): void {
        if (!this.portfolioData) return;

        const distributionContainer = document.getElementById('asset-distribution');
        if (!distributionContainer) return;

        // Limpar conteúdo atual
        distributionContainer.innerHTML = '';

        // Renderizar distribuição de ativos
        this.portfolioData.assetDistribution.forEach(asset => {
            const assetElement = this.createAssetDistributionElement(asset);
            distributionContainer.appendChild(assetElement);
        });
    }

    /**
     * 📊 Cria elemento HTML para distribuição de ativo
     */
    private createAssetDistributionElement(asset: AssetDistribution): HTMLElement {
        const div = document.createElement('div');
        div.className = 'flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0';
        
        div.innerHTML = `
            <div class="flex items-center">
                <div class="w-4 h-4 rounded-full mr-3" style="background-color: ${asset.color}"></div>
                <span class="font-medium text-gray-900">${asset.category}</span>
            </div>
            <div class="text-right">
                <p class="font-semibold text-gray-900">${this.formatCurrency(asset.value)}</p>
                <p class="text-sm text-gray-600">${this.formatPercentage(asset.percentage)}</p>
            </div>
        `;
        
        return div;
    }

    /**
     * ⚡ Configura atualizações em tempo real
     * Escuta mudanças no Supabase e atualiza a UI
     */
    private setupRealTimeUpdates(): void {
        console.log('⚡ Configurando atualizações em tempo real...');
        
        // Configurar WebSocket com Supabase para updates em tempo real
        this.supabaseClient.subscribeToChanges((data: any) => {
            console.log('🔄 Dados atualizados em tempo real:', data);
            this.loadPortfolioData();
        });
    }

    /**
     * 🕒 Atualiza o horário atual na interface
     */
    private updateCurrentTime(): void {
        // Atualizar a cada minuto
        setTimeout(() => this.updateCurrentTime(), 60000);
    }

    /**
     * 💰 Formata valores monetários para exibição
     */
    private formatCurrency(value: number): string {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    /**
     * 📈 Formata percentuais para exibição
     */
    private formatPercentage(value: number): string {
        const sign = value >= 0 ? '+' : '';
        return `${sign}${value.toFixed(2)}%`;
    }

    /**
     * 📅 Formata datas para exibição
     */
    private formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

/**
 * 🚀 Inicialização da aplicação quando DOM estiver pronto
 * Ponto de entrada principal da aplicação
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🌟 DOM carregado, inicializando RP Finances...');
    
    try {
        // Criar instância da aplicação
        const app = new RPFinancesApp();
        
        // Inicializar aplicação
        await app.init();
        
    } catch (error) {
        console.error('💥 Erro crítico na inicialização:', error);
        
        // Mostrar mensagem de erro na tela
        document.body.innerHTML = `
            <div class="min-h-screen flex items-center justify-center bg-gray-50">
                <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
                    <div class="text-red-500 text-5xl mb-4">⚠️</div>
                    <h1 class="text-xl font-bold text-gray-900 mb-2">Erro na Aplicação</h1>
                    <p class="text-gray-600 mb-4">Não foi possível carregar o RP Finances.</p>
                    <button onclick="location.reload()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                        Tentar Novamente
                    </button>
                </div>
            </div>
        `;
    }
});
