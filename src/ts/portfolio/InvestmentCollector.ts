/**
 * Coletor principal de investimentos
 * Funcionalidade core: buscar e consolidar todos os investimentos do usuário
 */

import { PluggyClient } from '../integrations/pluggy/PluggyClient.js';
import type { Investment, PortfolioSummary, InvestmentType, PluggyConfig } from '../integrations/pluggy/PluggyTypes.js';

export class InvestmentCollector {
  private client: PluggyClient;

  constructor(config: PluggyConfig) {
    this.client = new PluggyClient(config);
  }

  /**
   * FUNÇÃO PRINCIPAL: Coleta todos os investimentos
   * Recebe uma lista de itemIds (conexões bancárias) e retorna todos os investimentos
   */
  async collectAllInvestments(itemIds: string[]): Promise<Investment[]> {
    console.log('🚀 === INICIANDO COLETA DE INVESTIMENTOS ===');
    console.log(`📋 Itens a processar: ${itemIds.join(', ')}`);

    try {
      // Busca todos os investimentos usando o cliente Pluggy
      const investments = await this.client.getAllInvestments(itemIds);

      console.log('📊 === RESUMO DA COLETA ===');
      console.log(`✅ Total de investimentos: ${investments.length}`);
      
      // Debug: Log dos primeiros investimentos para análise
      if (investments.length > 0) {
        console.log('🔍 === ANÁLISE DOS DADOS RECEBIDOS ===');
        investments.slice(0, 3).forEach((inv, index) => {
          console.log(`📈 Investimento ${index + 1}: ${inv.name}`);
          console.log('   Dados de rentabilidade:', {
            annualRate: inv.annualRate,
            lastMonthRate: inv.lastMonthRate,
            lastTwelveMonthsRate: inv.lastTwelveMonthsRate,
            amountProfit: inv.amountProfit,
            amountOriginal: inv.amountOriginal,
            rate: inv.rate,
            rateType: inv.rateType,
            taxes: inv.taxes,
            taxes2: inv.taxes2
          });
          console.log('   Dados básicos:', {
            balance: inv.balance,
            amount: inv.amount,
            value: inv.value,
            quantity: inv.quantity,
            type: inv.type,
            subtype: inv.subtype
          });
        });
      }
      
      // Mostra resumo por tipo
      const summary = this.generateSummary(investments);
      this.logSummary(summary);

      return investments;

    } catch (error) {
      console.error('❌ Erro na coleta de investimentos:', error);
      throw error;
    }
  }

  /**
   * Gera resumo consolidado do portfolio
   */
  generateSummary(investments: Investment[]): PortfolioSummary {
    // Usa apenas dados reais do Pluggy
    const enrichedInvestments = investments;
    
    const totalBalance = enrichedInvestments.reduce((sum, inv) => sum + inv.balance, 0);
    const totalProfit = enrichedInvestments.reduce((sum, inv) => sum + (inv.amountProfit || 0), 0);
    const totalOriginal = enrichedInvestments.reduce((sum, inv) => sum + (inv.amountOriginal || inv.amount || inv.balance), 0);
    const totalTaxes = enrichedInvestments.reduce((sum, inv) => sum + (inv.taxes || 0) + (inv.taxes2 || 0), 0);
    
    const profitPercentage = totalOriginal > 0 ? (totalProfit / totalOriginal) * 100 : 0;

    // Calcula rentabilidade média ponderada (apenas com dados reais)
    let weightedAnnualRate = 0;
    let totalWeightedBalance = 0;
    
    enrichedInvestments.forEach(investment => {
      if (investment.annualRate && investment.balance > 0) {
        weightedAnnualRate += investment.annualRate * investment.balance;
        totalWeightedBalance += investment.balance;
      }
    });
    
    const averageAnnualRate = totalWeightedBalance > 0 ? weightedAnnualRate / totalWeightedBalance : 0;

    // Agrupa por tipo de investimento
    const byType: PortfolioSummary['byType'] = {};
    
    enrichedInvestments.forEach(investment => {
      const investmentType = investment.type as InvestmentType;
      if (!byType[investmentType]) {
        byType[investmentType] = {
          count: 0,
          balance: 0,
          percentage: 0,
          profit: 0,
          profitPercentage: 0,
        };
      }

      byType[investmentType]!.count++;
      byType[investmentType]!.balance += investment.balance;
      byType[investmentType]!.profit += investment.amountProfit || 0;
    });

    // Calcula percentuais e rentabilidade por tipo
    Object.keys(byType).forEach(type => {
      const typeKey = type as InvestmentType;
      const typeData = byType[typeKey]!;
      typeData.percentage = totalBalance > 0 ? (typeData.balance / totalBalance) * 100 : 0;
      
      // Calcula rentabilidade do tipo baseada no investimento original
      const typeOriginal = enrichedInvestments
        .filter(inv => inv.type === typeKey)
        .reduce((sum, inv) => sum + (inv.amountOriginal || inv.amount || 0), 0);
      
      typeData.profitPercentage = typeOriginal > 0 ? (typeData.profit / typeOriginal) * 100 : 0;
    });

    return {
      totalBalance,
      totalInvestments: enrichedInvestments.length,
      totalProfit,
      profitPercentage,
      totalTaxes,
      averageAnnualRate,
      byType,
      accounts: [], // Será preenchido quando implementarmos contas
      investments: enrichedInvestments, // Retorna dados enriquecidos
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Exibe resumo detalhado no console
   */
  private logSummary(summary: PortfolioSummary): void {
    console.log('\n💰 === RESUMO DO PORTFOLIO ===');
    console.log(`💎 Valor Total: R$ ${summary.totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    console.log(`📈 Lucro/Prejuízo: R$ ${summary.totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${summary.profitPercentage.toFixed(2)}%)`);
    console.log(`📊 Total de Investimentos: ${summary.totalInvestments}`);

    console.log('\n📋 === POR TIPO DE INVESTIMENTO ===');
    Object.entries(summary.byType).forEach(([type, data]) => {
      console.log(`${this.getTypeEmoji(type as InvestmentType)} ${this.getTypeName(type as InvestmentType)}: ${data!.count} itens - R$ ${data!.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${data!.percentage.toFixed(1)}%)`);
    });

    console.log('\n📝 === INVESTIMENTOS DETALHADOS ===');
    summary.investments.forEach((investment, index) => {
      const profit = investment.amountProfit || 0;
      const profitIcon = profit >= 0 ? '📈' : '📉';
      const profitText = profit >= 0 ? '+' : '';
      
      console.log(`${index + 1}. ${investment.name}`);
      console.log(`   💰 Saldo: R$ ${investment.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
      console.log(`   ${profitIcon} Resultado: ${profitText}R$ ${profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
      console.log(`   🏷️ Tipo: ${this.getTypeName(investment.type)} (${investment.subtype || 'N/A'})`);
      console.log(`   🏦 Instituição: ${investment.institution?.name || 'N/A'}`);
      console.log('');
    });
  }

  /**
   * Utilitários para formatação
   */
  private getTypeEmoji(type: InvestmentType): string {
    const emojis = {
      FIXED_INCOME: '🏛️',
      EQUITY: '📈',
      MUTUAL_FUND: '🎯',
      SECURITY: '🔒',
      ETF: '🌐',
      COE: '⚡',
    };
    return emojis[type] || '💼';
  }

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
   * Filtra investimentos por tipo (útil para análises específicas)
   */
  filterByType(investments: Investment[], type: InvestmentType): Investment[] {
    return investments.filter(inv => inv.type === type);
  }

  /**
   * Calcula valor total de um tipo específico
   */
  getTotalByType(investments: Investment[], type: InvestmentType): number {
    return this.filterByType(investments, type)
      .reduce((sum, inv) => sum + inv.balance, 0);
  }

  /**
   * NOVA FUNCIONALIDADE: Busca transações de investimentos
   * Método público para acessar transações via cliente Pluggy
   */
  async getAllInvestmentTransactions(itemIds: string[]) {
    return await this.client.getAllInvestmentTransactions(itemIds);
  }

  /**
   * NOVA FUNCIONALIDADE: Analisa cobertura histórica de dados
   * Verifica qual é a data limite para coleta de transações
   */
  async analyzeDataCoverage(itemIds: string[]): Promise<{
    oldestTransactionDate: Date | null;
    newestTransactionDate: Date | null;
    totalTransactions: number;
    coverageByInvestment: Array<{
      investmentName: string;
      investmentId: string;
      oldestTransaction: Date | null;
      newestTransaction: Date | null;
      transactionCount: number;
    }>;
  }> {
    console.log('📊 === ANALISANDO COBERTURA HISTÓRICA ===');

    try {
      // Busca todas as transações
      const transactionsByInvestment = await this.client.getAllInvestmentTransactions(itemIds);
      
      // Busca informações dos investimentos para correlacionar
      const allInvestments = await this.client.getAllInvestments(itemIds);
      
      let oldestDate: Date | null = null;
      let newestDate: Date | null = null;
      let totalTransactions = 0;
      const coverageByInvestment: Array<{
        investmentName: string;
        investmentId: string;
        oldestTransaction: Date | null;
        newestTransaction: Date | null;
        transactionCount: number;
      }> = [];

      // Analisa cada investimento
      for (const investment of allInvestments) {
        const transactions = transactionsByInvestment.get(investment.id) || [];
        
        let investmentOldest: Date | null = null;
        let investmentNewest: Date | null = null;

        if (transactions.length > 0) {
          // Ordena transações por data para encontrar a mais antiga e mais recente
          const sortedTransactions = transactions.sort((a, b) => 
            new Date(a.date).getTime() - new Date(b.date).getTime()
          );

          investmentOldest = new Date(sortedTransactions[0].date);
          investmentNewest = new Date(sortedTransactions[sortedTransactions.length - 1].date);

          // Atualiza dados globais
          if (!oldestDate || investmentOldest < oldestDate) {
            oldestDate = investmentOldest;
          }
          if (!newestDate || investmentNewest > newestDate) {
            newestDate = investmentNewest;
          }

          totalTransactions += transactions.length;
        }

        coverageByInvestment.push({
          investmentName: investment.name,
          investmentId: investment.id,
          oldestTransaction: investmentOldest,
          newestTransaction: investmentNewest,
          transactionCount: transactions.length
        });
      }

      // Log dos resultados
      console.log('\n📈 === RESULTADO DA ANÁLISE ===');
      console.log(`📅 Data mais antiga: ${oldestDate ? oldestDate.toLocaleDateString('pt-BR') : 'N/A'}`);
      console.log(`📅 Data mais recente: ${newestDate ? newestDate.toLocaleDateString('pt-BR') : 'N/A'}`);
      console.log(`📊 Total de transações: ${totalTransactions}`);
      
      if (oldestDate && newestDate) {
        const daysDifference = Math.ceil((newestDate.getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24));
        console.log(`⏰ Período coberto: ${daysDifference} dias`);
      }

      console.log('\n📋 === COBERTURA POR INVESTIMENTO ===');
      coverageByInvestment
        .filter(item => item.transactionCount > 0)
        .sort((a, b) => b.transactionCount - a.transactionCount)
        .forEach((item, index) => {
          console.log(`${index + 1}. ${item.investmentName}`);
          console.log(`   📅 Período: ${item.oldestTransaction?.toLocaleDateString('pt-BR')} até ${item.newestTransaction?.toLocaleDateString('pt-BR')}`);
          console.log(`   📊 Transações: ${item.transactionCount}`);
        });

      const investmentsWithoutTransactions = coverageByInvestment.filter(item => item.transactionCount === 0);
      if (investmentsWithoutTransactions.length > 0) {
        console.log('\n⚠️ === INVESTIMENTOS SEM TRANSAÇÕES ===');
        investmentsWithoutTransactions.forEach((item, index) => {
          console.log(`${index + 1}. ${item.investmentName}`);
        });
      }

      return {
        oldestTransactionDate: oldestDate,
        newestTransactionDate: newestDate,
        totalTransactions,
        coverageByInvestment
      };

    } catch (error) {
      console.error('❌ Erro ao analisar cobertura de dados:', error);
      throw error;
    }
  }

}
