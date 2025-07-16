/**
 * Calculadora de Preço Médio de Ações
 * Implementa a lógica para calcular o preço médio baseado no histórico de transações
 */

import type { 
  Investment, 
  InvestmentTransaction, 
  AveragePriceCalculation 
} from '../integrations/pluggy/PluggyTypes.js';

export class AveragePriceCalculator {
  
  /**
   * Método principal: Calcula o preço médio de uma ação baseado em suas transações
   * Exatamente como você pediu: soma todas as compras e divide pela quantidade total
   */
  static calculateAveragePrice(
    investment: Investment, 
    transactions: InvestmentTransaction[]
  ): AveragePriceCalculation {
    
    console.log(`🔢 Calculando preço médio para ${investment.name} (${investment.code})...`);
    
    // Filtra apenas transações de compra (BUY)
    const buyTransactions = transactions.filter(t => t.type === 'BUY');
    
    if (buyTransactions.length === 0) {
      console.warn(`⚠️ Nenhuma transação de compra encontrada para ${investment.name}`);
      return this.createEmptyCalculation(investment);
    }

    // ALGORITMO PRINCIPAL: Soma valor total e quantidade total
    let totalInvested = 0;
    let totalQuantity = 0;

    console.log(`📊 Processando ${buyTransactions.length} transações de compra:`);
    
    buyTransactions.forEach((transaction, index) => {
      const transactionValue = transaction.amount; // Valor total da operação
      const transactionQuantity = transaction.quantity; // Quantidade comprada
      
      totalInvested += transactionValue;
      totalQuantity += transactionQuantity;
      
      console.log(`  ${index + 1}. ${transaction.date}: ${transactionQuantity} ações x R$ ${transaction.value.toFixed(2)} = R$ ${transactionValue.toFixed(2)}`);
    });

    // CÁLCULO DO PREÇO MÉDIO: Total investido ÷ Quantidade total
    const averagePrice = totalQuantity > 0 ? totalInvested / totalQuantity : 0;
    
    // Valores atuais para comparação
    const currentPrice = investment.value || 0;
    const currentValue = investment.balance || 0;
    
    // Cálculo de ganho/perda
    const theoreticalValue = averagePrice * investment.quantity;
    const gainLoss = currentValue - theoreticalValue;
    const gainLossPercent = theoreticalValue > 0 ? (gainLoss / theoreticalValue) * 100 : 0;

    console.log(`✅ Resultado do cálculo:`);
    console.log(`   📈 Preço médio: R$ ${averagePrice.toFixed(2)}`);
    console.log(`   📊 Total investido: R$ ${totalInvested.toFixed(2)}`);
    console.log(`   🔢 Quantidade total: ${totalQuantity}`);
    console.log(`   💰 Preço atual: R$ ${currentPrice.toFixed(2)}`);
    console.log(`   ${gainLoss >= 0 ? '📈' : '📉'} Resultado: R$ ${gainLoss.toFixed(2)} (${gainLossPercent.toFixed(2)}%)`);

    return {
      stockCode: investment.code || investment.name,
      stockName: investment.name,
      averagePrice,
      totalQuantity,
      totalInvested,
      currentPrice,
      currentValue,
      gainLoss,
      gainLossPercent,
      transactions: buyTransactions,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Calcula preço médio para múltiplas ações
   * Agrupa transações por código/nome da ação
   */
  static calculateMultipleAverages(
    investments: Investment[], 
    transactionsByInvestment: Map<string, InvestmentTransaction[]>
  ): AveragePriceCalculation[] {
    
    console.log(`🎯 Calculando preço médio para ${investments.length} investimentos...`);
    
    const results: AveragePriceCalculation[] = [];
    
    // Filtra apenas ações (EQUITY/STOCK)
    const stockInvestments = investments.filter(inv => 
      inv.type === 'EQUITY' && 
      inv.subtype === 'STOCK' &&
      inv.quantity > 0
    );
    
    console.log(`📊 Encontradas ${stockInvestments.length} ações para análise`);
    
    stockInvestments.forEach(investment => {
      const transactions = transactionsByInvestment.get(investment.id) || [];
      const calculation = this.calculateAveragePrice(investment, transactions);
      results.push(calculation);
    });
    
    // Ordena por valor atual (maior para menor)
    results.sort((a, b) => b.currentValue - a.currentValue);
    
    console.log(`✅ Calculados preços médios para ${results.length} ações`);
    
    return results;
  }

  /**
   * Resumo geral do portfolio de ações
   */
  static generatePortfolioSummary(calculations: AveragePriceCalculation[]) {
    const totalInvested = calculations.reduce((sum, calc) => sum + calc.totalInvested, 0);
    const totalCurrentValue = calculations.reduce((sum, calc) => sum + calc.currentValue, 0);
    const totalGainLoss = totalCurrentValue - totalInvested;
    const totalGainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;
    
    const winners = calculations.filter(calc => calc.gainLoss > 0);
    const losers = calculations.filter(calc => calc.gainLoss < 0);
    
    return {
      totalStocks: calculations.length,
      totalInvested,
      totalCurrentValue,
      totalGainLoss,
      totalGainLossPercent,
      winners: winners.length,
      losers: losers.length,
      topWinner: winners.length > 0 ? winners.sort((a, b) => b.gainLossPercent - a.gainLossPercent)[0] : null,
      topLoser: losers.length > 0 ? losers.sort((a, b) => a.gainLossPercent - b.gainLossPercent)[0] : null
    };
  }

  /**
   * Método auxiliar para casos sem transações
   */
  private static createEmptyCalculation(investment: Investment): AveragePriceCalculation {
    return {
      stockCode: investment.code || investment.name,
      stockName: investment.name,
      averagePrice: 0,
      totalQuantity: investment.quantity || 0,
      totalInvested: investment.amount || 0,
      currentPrice: investment.value || 0,
      currentValue: investment.balance || 0,
      gainLoss: 0,
      gainLossPercent: 0,
      transactions: [],
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Utilitário para debug - mostra detalhes de uma calculação
   */
  static logCalculationDetails(calculation: AveragePriceCalculation): void {
    console.log(`\n📊 === DETALHES: ${calculation.stockName} (${calculation.stockCode}) ===`);
    console.log(`💰 Preço médio: R$ ${calculation.averagePrice.toFixed(2)}`);
    console.log(`🔢 Quantidade: ${calculation.totalQuantity}`);
    console.log(`💵 Total investido: R$ ${calculation.totalInvested.toFixed(2)}`);
    console.log(`📈 Preço atual: R$ ${calculation.currentPrice.toFixed(2)}`);
    console.log(`💎 Valor atual: R$ ${calculation.currentValue.toFixed(2)}`);
    console.log(`${calculation.gainLoss >= 0 ? '📈' : '📉'} Resultado: R$ ${calculation.gainLoss.toFixed(2)} (${calculation.gainLossPercent.toFixed(2)}%)`);
    console.log(`🕒 Última atualização: ${new Date(calculation.lastUpdated).toLocaleString('pt-BR')}`);
    console.log(`📋 Transações analisadas: ${calculation.transactions.length}`);
  }
}
