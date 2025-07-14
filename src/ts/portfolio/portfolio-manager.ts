/**
 * 📊 Portfolio Manager - Gerenciador Principal do Portfolio
 * 
 * Responsável por:
 * - Integrar dados de múltiplas fontes financeiras
 * - Calcular métricas e performance do portfolio
 * - Gerenciar contas conectadas
 * - Consolidar informações financeiras
 */

import { SupabaseClient } from '../integrations/supabase-client.js';

// Interfaces para tipagem dos dados
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
 * 🎯 Classe principal para gerenciamento do portfolio
 * Centraliza toda a lógica de negócio relacionada aos investimentos
 */
export class PortfolioManager {
    // private _supabaseClient: SupabaseClient; // Para uso futuro
    private portfolioCache: PortfolioData | null = null;
    private lastCacheUpdate: number = 0;
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

    constructor(_supabaseClient: SupabaseClient) {
        // this._supabaseClient = supabaseClient; // Para uso futuro
        console.log('📊 PortfolioManager inicializado');
    }

    /**
     * 🎯 Método principal para obter dados consolidados do portfolio
     * Verifica cache antes de buscar dados atualizados
     */
    async getPortfolioData(): Promise<PortfolioData> {
        console.log('📊 Obtendo dados do portfolio...');

        try {
            // Verificar se existe cache válido
            if (this.isValidCache()) {
                console.log('💾 Usando dados do cache');
                return this.portfolioCache!;
            }

            // Buscar dados atualizados
            const portfolioData = await this.fetchPortfolioData();
            
            // Atualizar cache
            this.updateCache(portfolioData);
            
            return portfolioData;

        } catch (error) {
            console.error('❌ Erro ao obter dados do portfolio:', error);
            
            // Se houver erro, retornar dados de exemplo para desenvolvimento
            return this.getExamplePortfolioData();
        }
    }

    /**
     * 🔄 Busca dados atualizados do portfolio de todas as fontes
     * Integra bancos, corretoras e outras instituições financeiras
     */
    private async fetchPortfolioData(): Promise<PortfolioData> {
        console.log('🔄 Buscando dados atualizados do portfolio...');

        // Array para armazenar todas as promessas de dados
        const dataPromises = [
            this.fetchBankAccounts(),
            this.fetchBrokerageAccounts(),
            this.fetchCryptoAccounts(),
            this.fetchInvestmentFunds()
        ];

        try {
            // Executar todas as buscas em paralelo
            const [bankData, brokerageData, cryptoData, fundsData] = await Promise.allSettled(dataPromises);

            // Consolidar dados de todas as fontes
            const connectedAccounts = this.consolidateAccounts([
                this.extractDataFromPromise(bankData),
                this.extractDataFromPromise(brokerageData),
                this.extractDataFromPromise(cryptoData),
                this.extractDataFromPromise(fundsData)
            ]);

            // Calcular métricas consolidadas
            const totalAssets = this.calculateTotalAssets(connectedAccounts);
            const monthlyReturn = await this.calculateMonthlyReturn(connectedAccounts);
            const assetDistribution = this.calculateAssetDistribution(connectedAccounts);

            return {
                totalAssets,
                monthlyReturn,
                lastUpdate: new Date().toISOString(),
                connectedAccounts,
                assetDistribution
            };

        } catch (error) {
            console.error('❌ Erro ao buscar dados do portfolio:', error);
            throw error;
        }
    }

    /**
     * 🏦 Busca dados de contas bancárias via Pluggy/Open Banking
     */
    private async fetchBankAccounts(): Promise<ConnectedAccount[]> {
        console.log('🏦 Buscando contas bancárias...');

        try {
            // Aqui seria a integração real com Pluggy ou outras APIs de Open Banking
            // Por enquanto, retornamos dados simulados
            return [
                {
                    id: 'bank-001',
                    institutionName: 'Banco do Brasil',
                    accountType: 'Conta Corrente',
                    balance: 15750.30,
                    currency: 'BRL',
                    lastSync: new Date().toISOString()
                },
                {
                    id: 'bank-002',
                    institutionName: 'Nubank',
                    accountType: 'Conta Digital',
                    balance: 8250.45,
                    currency: 'BRL',
                    lastSync: new Date().toISOString()
                }
            ];

        } catch (error) {
            console.error('❌ Erro ao buscar contas bancárias:', error);
            return [];
        }
    }

    /**
     * 📈 Busca dados de contas de corretoras
     */
    private async fetchBrokerageAccounts(): Promise<ConnectedAccount[]> {
        console.log('📈 Buscando contas de corretoras...');

        try {
            // Integração com APIs de corretoras (Rico, XP, etc.)
            return [
                {
                    id: 'broker-001',
                    institutionName: 'Rico Investimentos',
                    accountType: 'Conta Investimento',
                    balance: 125000.75,
                    currency: 'BRL',
                    lastSync: new Date().toISOString()
                },
                {
                    id: 'broker-002',
                    institutionName: 'XP Investimentos',
                    accountType: 'Conta Investimento',
                    balance: 89500.20,
                    currency: 'BRL',
                    lastSync: new Date().toISOString()
                }
            ];

        } catch (error) {
            console.error('❌ Erro ao buscar contas de corretoras:', error);
            return [];
        }
    }

    /**
     * ₿ Busca dados de contas de criptomoedas
     */
    private async fetchCryptoAccounts(): Promise<ConnectedAccount[]> {
        console.log('₿ Buscando contas de criptomoedas...');

        try {
            // Integração com exchanges (Binance, Coinbase, etc.)
            return [
                {
                    id: 'crypto-001',
                    institutionName: 'Binance',
                    accountType: 'Exchange Crypto',
                    balance: 45000.00,
                    currency: 'BRL',
                    lastSync: new Date().toISOString()
                }
            ];

        } catch (error) {
            console.error('❌ Erro ao buscar contas crypto:', error);
            return [];
        }
    }

    /**
     * 🏛️ Busca dados de fundos de investimento
     */
    private async fetchInvestmentFunds(): Promise<ConnectedAccount[]> {
        console.log('🏛️ Buscando fundos de investimento...');

        try {
            // Integração com gestoras de fundos
            return [
                {
                    id: 'fund-001',
                    institutionName: 'BTG Pactual',
                    accountType: 'Fundo de Investimento',
                    balance: 67500.50,
                    currency: 'BRL',
                    lastSync: new Date().toISOString()
                }
            ];

        } catch (error) {
            console.error('❌ Erro ao buscar fundos:', error);
            return [];
        }
    }

    /**
     * 🔧 Consolida dados de múltiplas fontes em uma única lista
     */
    private consolidateAccounts(accountArrays: ConnectedAccount[][]): ConnectedAccount[] {
        const allAccounts: ConnectedAccount[] = [];
        
        accountArrays.forEach(accounts => {
            if (Array.isArray(accounts)) {
                allAccounts.push(...accounts);
            }
        });

        console.log(`📊 ${allAccounts.length} contas consolidadas`);
        return allAccounts;
    }

    /**
     * 💰 Calcula o patrimônio total do portfolio
     */
    private calculateTotalAssets(accounts: ConnectedAccount[]): number {
        const total = accounts.reduce((sum, account) => sum + account.balance, 0);
        console.log(`💰 Patrimônio total: R$ ${total.toLocaleString('pt-BR')}`);
        return total;
    }

    /**
     * 📈 Calcula a rentabilidade mensal do portfolio
     */
    private calculateMonthlyReturn(_accounts: ConnectedAccount[]): Promise<number> {
        try {
            // TODO: Implementar cálculo real baseado em dados históricos
            // Por enquanto, retorna 0 até implementar a lógica real
            console.log('📈 Cálculo de rentabilidade será implementado em versão futura');
            return Promise.resolve(0);

        } catch (error) {
            console.error('❌ Erro ao calcular rentabilidade:', error);
            return Promise.resolve(0);
        }
    }

    /**
     * 🥧 Calcula a distribuição de ativos por categoria
     */
    private calculateAssetDistribution(accounts: ConnectedAccount[]): AssetDistribution[] {
        const distribution: { [key: string]: number } = {};
        const total = this.calculateTotalAssets(accounts);

        // Categorizar contas por tipo
        accounts.forEach(account => {
            const category = this.categorizeAccount(account);
            distribution[category] = (distribution[category] || 0) + account.balance;
        });

        // Converter para array com percentuais
        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];
        let colorIndex = 0;

        return Object.entries(distribution).map(([category, value]) => ({
            category,
            value,
            percentage: (value / total) * 100,
            color: colors[colorIndex++ % colors.length]
        }));
    }

    /**
     * 🏷️ Categoriza uma conta por tipo de ativo
     */
    private categorizeAccount(account: ConnectedAccount): string {
        if (account.accountType.includes('Corrente') || account.accountType.includes('Digital')) {
            return 'Conta Corrente';
        }
        if (account.accountType.includes('Investimento')) {
            return 'Ações e Fundos';
        }
        if (account.accountType.includes('Crypto')) {
            return 'Criptomoedas';
        }
        if (account.accountType.includes('Fundo')) {
            return 'Fundos de Investimento';
        }
        return 'Outros';
    }

    /**
     * 🔧 Extrai dados de uma Promise settled
     */
    private extractDataFromPromise(result: PromiseSettledResult<ConnectedAccount[]>): ConnectedAccount[] {
        if (result.status === 'fulfilled') {
            return result.value;
        } else {
            console.error('❌ Promise rejeitada:', result.reason);
            return [];
        }
    }

    /**
     * 💾 Verifica se o cache é válido
     */
    private isValidCache(): boolean {
        if (!this.portfolioCache) return false;
        
        const now = Date.now();
        const cacheAge = now - this.lastCacheUpdate;
        
        return cacheAge < this.CACHE_DURATION;
    }

    /**
     * 💾 Atualiza o cache com novos dados
     */
    private updateCache(data: PortfolioData): void {
        this.portfolioCache = data;
        this.lastCacheUpdate = Date.now();
        console.log('💾 Cache atualizado');
    }

    /**
     * 🎭 Retorna dados de exemplo para desenvolvimento
     */
    private getExamplePortfolioData(): PortfolioData {
        console.log('🎭 Usando dados de exemplo para desenvolvimento');
        
        return {
            totalAssets: 351501.20,
            monthlyReturn: 2.35,
            lastUpdate: new Date().toISOString(),
            connectedAccounts: [
                {
                    id: 'example-001',
                    institutionName: 'Rico Investimentos',
                    accountType: 'Conta Investimento',
                    balance: 125000.75,
                    currency: 'BRL',
                    lastSync: new Date().toISOString()
                },
                {
                    id: 'example-002',
                    institutionName: 'XP Investimentos',
                    accountType: 'Conta Investimento',
                    balance: 89500.20,
                    currency: 'BRL',
                    lastSync: new Date().toISOString()
                },
                {
                    id: 'example-003',
                    institutionName: 'Nubank',
                    accountType: 'Conta Digital',
                    balance: 15750.30,
                    currency: 'BRL',
                    lastSync: new Date().toISOString()
                }
            ],
            assetDistribution: [
                {
                    category: 'Ações e Fundos',
                    value: 214500.95,
                    percentage: 61.0,
                    color: '#3B82F6'
                },
                {
                    category: 'Renda Fixa',
                    value: 105250.15,
                    percentage: 30.0,
                    color: '#10B981'
                },
                {
                    category: 'Conta Corrente',
                    value: 31750.10,
                    percentage: 9.0,
                    color: '#F59E0B'
                }
            ]
        };
    }

    /**
     * 🔄 Força atualização dos dados (limpa cache)
     */
    public async refreshPortfolioData(): Promise<PortfolioData> {
        console.log('🔄 Forçando atualização do portfolio...');
        
        // Limpar cache
        this.portfolioCache = null;
        this.lastCacheUpdate = 0;
        
        // Buscar dados atualizados
        return await this.getPortfolioData();
    }

    /**
     * 📊 Obtém estatísticas específicas do portfolio
     */
    public async getPortfolioStats(): Promise<any> {
        const data = await this.getPortfolioData();
        
        return {
            totalAccounts: data.connectedAccounts.length,
            totalAssets: data.totalAssets,
            monthlyReturn: data.monthlyReturn,
            bestPerformingAsset: this.getBestPerformingAsset(data.assetDistribution),
            diversificationScore: this.calculateDiversificationScore(data.assetDistribution)
        };
    }

    /**
     * 🏆 Identifica o ativo com melhor performance
     */
    private getBestPerformingAsset(distribution: AssetDistribution[]): string {
        const sorted = distribution.sort((a, b) => b.percentage - a.percentage);
        return sorted[0]?.category || 'N/A';
    }

    /**
     * 📊 Calcula score de diversificação do portfolio
     */
    private calculateDiversificationScore(distribution: AssetDistribution[]): number {
        // Score simples baseado na quantidade de categorias e distribuição
        const categories = distribution.length;
        const maxPercentage = Math.max(...distribution.map(d => d.percentage));
        
        // Score de 0-100, melhor quando há mais categorias e distribuição mais equilibrada
        return Math.min(100, categories * 20 - maxPercentage);
    }
}
