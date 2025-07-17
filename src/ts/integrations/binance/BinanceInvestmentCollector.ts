/**
 * Coletor de investimentos para Binance
 * Converte dados da Binance para o formato padrão do RP-Finances
 */

import { BinanceClient } from './BinanceClient.js';
import { BinanceTransactionCollector } from './BinanceTransactionCollector.js';
import type { 
  BinanceConfig, 
  BinancePortfolioSummary,
  BinancePortfolioAsset,
  BinanceAveragePriceCalculation
} from './BinanceTypes.js';
import type { Investment, InvestmentType, InvestmentSubtype } from '../pluggy/PluggyTypes.js';
import { currencyConverter } from '../../utils/CurrencyConverter.js';

export class BinanceInvestmentCollector {
  private client: BinanceClient;
  private transactionCollector: BinanceTransactionCollector;

  constructor(config: BinanceConfig) {
    this.client = new BinanceClient(config);
    this.transactionCollector = new BinanceTransactionCollector(config);
  }

  /**
   * Testa a conexão com a API Binance
   */
  async testConnection(): Promise<boolean> {
    return this.client.testConnection();
  }

  /**
   * Coleta todos os investimentos da Binance e converte para formato padrão
   */
  async collectInvestments(): Promise<Investment[]> {
    console.log('🚀 Binance: Coletando investimentos...');

    try {
      const portfolio = await this.client.getPortfolioSummary();
      const investments = await this.convertToInvestments(portfolio);

      console.log(`✅ Binance: ${investments.length} investimentos coletados`);
      return investments;

    } catch (error) {
      console.error('❌ Binance: Erro ao coletar investimentos:', error);
      throw error;
    }
  }

  /**
   * Converte portfolio Binance para formato Investment do RP-Finances
   */
  private async convertToInvestments(portfolio: BinancePortfolioSummary): Promise<Investment[]> {
    const investments: Investment[] = [];
    
    for (const asset of portfolio.assets) {
      const investment = await this.convertAssetToInvestment(asset, portfolio.lastUpdate);
      investments.push(investment);
    }
    
    return investments;
  }

  /**
   * Converte um ativo Binance para Investment
   */
  private async convertAssetToInvestment(asset: BinancePortfolioAsset, portfolioTimestamp: number): Promise<Investment> {
    // Determina o tipo de investimento baseado no ativo
    const type = this.determineInvestmentType(asset.asset);
    
    // Converte valores de USD para BRL
    const balanceBRL = await currencyConverter.convert(asset.usdValue, 'USD', 'BRL');
    const priceBRL = await currencyConverter.convert(asset.price, 'USD', 'BRL');
    
    // Calcula rentabilidade baseada na variação de 24h
    const dayChangeValue = balanceBRL * (asset.priceChangePercent / 100);
    const originalValue = balanceBRL - dayChangeValue;

    console.log(`💱 ${asset.asset}: $${asset.usdValue.toFixed(2)} → R$ ${balanceBRL.toFixed(2)}`);

    return {
      // Identificação
      id: `binance_${asset.asset}`,
      itemId: 'binance_account',
      
      // Informações básicas
      name: `${asset.asset} (Binance)`,
      number: asset.asset,
      type: type,
      subtype: this.determineSubtype(asset.asset),
      
      // Valores financeiros (convertidos para BRL)
      balance: balanceBRL,
      amount: asset.total,
      value: priceBRL,
      quantity: asset.total,
      
      // Dados de rentabilidade (baseados na variação de 24h em BRL)
      amountOriginal: originalValue,
      amountProfit: dayChangeValue,
      annualRate: undefined, // Binance não fornece taxa anual
      lastMonthRate: undefined,
      lastTwelveMonthsRate: undefined,
      rate: asset.priceChangePercent / 100, // Variação de 24h como taxa
      rateType: '24h',
      
      // Moeda e impostos
      currencyCode: 'BRL', // Agora convertido para BRL
      taxes: 0, // Binance não calcula impostos automaticamente
      taxes2: 0,
      
      // Dados adicionais para referência
      institution: {
        name: 'Binance',
        number: 'BINANCE'
      },
      
      // Datas e status
      date: new Date(portfolioTimestamp).toISOString(),
      dueDate: undefined,
      status: 'ACTIVE'
    } as Investment;
  }

  /**
   * Determina o tipo de investimento baseado no ativo
   */
  private determineInvestmentType(asset: string): InvestmentType {
    // Stablecoins - considera como renda fixa
    if (['USDT', 'USDC', 'BUSD', 'DAI', 'TUSD', 'USDP'].includes(asset)) {
      return 'FIXED_INCOME';
    }
    
    // Como não existe tipo 'crypto' no sistema, vamos usar 'ETF' para criptomoedas
    // (pensando que são como ETFs de crypto ou fundos digitais)
    return 'ETF';
  }

  /**
   * Determina o subtipo baseado no ativo
   */
  private determineSubtype(asset: string): InvestmentSubtype {
    // Stablecoins
    if (['USDT', 'USDC', 'BUSD', 'DAI', 'TUSD', 'USDP'].includes(asset)) {
      return 'CDB'; // Usando CDB como proxy para stablecoins
    }
    
    // Para criptomoedas, usando 'ETF' como subtipo padrão
    return 'ETF';
  }

  /**
   * Obtém resumo consolidado do portfolio Binance
   */
  async getPortfolioSummary(): Promise<BinancePortfolioSummary> {
    return this.client.getPortfolioSummary();
  }

  /**
   * NOVA FUNCIONALIDADE: Calcula preços médios dos ativos Binance
   * Implementa o mesmo algoritmo usado para Pluggy: soma transações ÷ quantidade total
   */
  async calculateAveragePrices(): Promise<BinanceAveragePriceCalculation[]> {
    console.log('🚀 Binance: Iniciando cálculo de preços médios...');

    try {
      // 1. Obtém portfolio atual
      const portfolio = await this.client.getPortfolioSummary();
      
      if (portfolio.assets.length === 0) {
        console.log('ℹ️ Binance: Nenhum ativo encontrado para calcular preço médio');
        return [];
      }

      console.log(`📊 Binance: Encontrados ${portfolio.assets.length} ativos para análise`);

      // 2. Calcula preços médios usando o coletor de transações
      const calculations = await this.transactionCollector.calculateMultipleAveragePrices(portfolio.assets);

      // 3. Log do resumo
      this.logAveragePricesResults(calculations);

      return calculations;

    } catch (error) {
      console.error('❌ Binance: Erro ao calcular preços médios:', error);
      throw error;
    }
  }

  /**
   * Exibe resumo dos resultados de preço médio
   */
  private logAveragePricesResults(calculations: BinanceAveragePriceCalculation[]): void {
    console.log('\n🎉 === RESULTADO BINANCE - PREÇOS MÉDIOS ===');

    const withTransactions = calculations.filter(calc => calc.transactionCount > 0);
    const withoutTransactions = calculations.filter(calc => calc.transactionCount === 0);

    console.log(`📊 Total de ativos analisados: ${calculations.length}`);
    console.log(`✅ Com transações: ${withTransactions.length}`);
    console.log(`⚠️ Sem transações: ${withoutTransactions.length}`);

    if (withTransactions.length > 0) {
      const totalInvested = withTransactions.reduce((sum, calc) => sum + calc.totalInvested, 0);
      const totalValue = withTransactions.reduce((sum, calc) => sum + calc.currentValue, 0);
      const totalProfit = totalValue - totalInvested;
      const totalProfitPercentage = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

      console.log(`💰 Total investido: $${totalInvested.toFixed(2)}`);
      console.log(`💎 Valor atual: $${totalValue.toFixed(2)}`);
      console.log(`📈 Resultado geral: $${totalProfit.toFixed(2)} (${totalProfitPercentage.toFixed(2)}%)`);

      // Top performers
      const topGainers = withTransactions
        .filter(calc => calc.profitPercentage > 0)
        .sort((a, b) => b.profitPercentage - a.profitPercentage);

      const topLosers = withTransactions
        .filter(calc => calc.profitPercentage < 0)
        .sort((a, b) => a.profitPercentage - b.profitPercentage);

      if (topGainers.length > 0) {
        console.log(`🥇 Melhor performance: ${topGainers[0].asset} (+${topGainers[0].profitPercentage.toFixed(2)}%)`);
      }
      if (topLosers.length > 0) {
        console.log(`📉 Pior performance: ${topLosers[0].asset} (${topLosers[0].profitPercentage.toFixed(2)}%)`);
      }

      // Detalhes por ativo
      console.log('\n📋 === DETALHES POR ATIVO ===');
      withTransactions.forEach((calc, index) => {
        const profitIcon = calc.profit >= 0 ? '📈' : '📉';
        const profitText = calc.profit >= 0 ? '+' : '';
        
        console.log(`\n${index + 1}. ${calc.asset} (${calc.symbol})`);
        console.log(`   💰 Preço médio: $${calc.averagePrice.toFixed(2)}`);
        console.log(`   📈 Preço atual: $${calc.currentPrice.toFixed(2)}`);
        console.log(`   🔢 Quantidade: ${calc.totalQuantity.toFixed(8)}`);
        console.log(`   💵 Investido: $${calc.totalInvested.toFixed(2)}`);
        console.log(`   💎 Valor atual: $${calc.currentValue.toFixed(2)}`);
        console.log(`   ${profitIcon} Resultado: ${profitText}$${calc.profit.toFixed(2)} (${calc.profitPercentage.toFixed(2)}%)`);
        console.log(`   📊 Transações: ${calc.transactionCount}`);
      });
    }

    if (withoutTransactions.length > 0) {
      console.log('\n⚠️ === ATIVOS SEM HISTÓRICO DE TRANSAÇÕES ===');
      withoutTransactions.forEach((calc, index) => {
        console.log(`${index + 1}. ${calc.asset} - Valor atual: $${calc.currentValue.toFixed(2)}`);
      });
      console.log('\n💡 Dica: Ativos sem transações podem ser de:');
      console.log('   - Depósitos externos não rastreados');
      console.log('   - Transferências de outras exchanges');
      console.log('   - Airdrops ou rewards');
      console.log('   - Período anterior ao histórico da API');
    }
  }
}
