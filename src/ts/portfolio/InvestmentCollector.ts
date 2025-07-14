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
    const totalBalance = investments.reduce((sum, inv) => sum + inv.balance, 0);
    const totalProfit = investments.reduce((sum, inv) => sum + (inv.amountProfit || 0), 0);
    const totalOriginal = investments.reduce((sum, inv) => sum + (inv.amountOriginal || inv.amount || 0), 0);
    
    const profitPercentage = totalOriginal > 0 ? (totalProfit / totalOriginal) * 100 : 0;

    // Agrupa por tipo de investimento
    const byType: PortfolioSummary['byType'] = {};
    
    investments.forEach(investment => {
      if (!byType[investment.type]) {
        byType[investment.type] = {
          count: 0,
          balance: 0,
          percentage: 0,
        };
      }

      byType[investment.type]!.count++;
      byType[investment.type]!.balance += investment.balance;
    });

    // Calcula percentuais
    Object.keys(byType).forEach(type => {
      const typeKey = type as InvestmentType;
      byType[typeKey]!.percentage = totalBalance > 0 ? (byType[typeKey]!.balance / totalBalance) * 100 : 0;
    });

    return {
      totalBalance,
      totalInvestments: investments.length,
      totalProfit,
      profitPercentage,
      byType,
      accounts: [], // Será preenchido quando implementarmos contas
      investments,
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
}
