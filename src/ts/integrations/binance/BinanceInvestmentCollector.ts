/**
 * Coletor de investimentos para Binance
 * Converte dados da Binance para o formato padrão do RP-Finances
 */

import { BinanceClient } from './BinanceClient.js';
import type { 
  BinanceConfig, 
  BinancePortfolioSummary,
  BinancePortfolioAsset 
} from './BinanceTypes.js';
import type { Investment, InvestmentType, InvestmentSubtype } from '../pluggy/PluggyTypes.js';

export class BinanceInvestmentCollector {
  private client: BinanceClient;

  constructor(config: BinanceConfig) {
    this.client = new BinanceClient(config);
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
      const investments = this.convertToInvestments(portfolio);

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
  private convertToInvestments(portfolio: BinancePortfolioSummary): Investment[] {
    return portfolio.assets.map(asset => this.convertAssetToInvestment(asset, portfolio.lastUpdate));
  }

  /**
   * Converte um ativo Binance para Investment
   */
  private convertAssetToInvestment(asset: BinancePortfolioAsset, portfolioTimestamp: number): Investment {
    // Determina o tipo de investimento baseado no ativo
    const type = this.determineInvestmentType(asset.asset);
    
    // Calcula rentabilidade baseada na variação de 24h
    const dayChangeValue = asset.usdValue * (asset.priceChangePercent / 100);
    const originalValue = asset.usdValue - dayChangeValue;

    return {
      // Identificação
      id: `binance_${asset.asset}`,
      itemId: 'binance_account',
      
      // Informações básicas
      name: `${asset.asset} (Binance)`,
      number: asset.asset,
      type: type,
      subtype: this.determineSubtype(asset.asset),
      
      // Valores financeiros
      balance: asset.usdValue,
      amount: asset.total,
      value: asset.price,
      quantity: asset.total,
      
      // Dados de rentabilidade (baseados na variação de 24h)
      amountOriginal: originalValue,
      amountProfit: dayChangeValue,
      annualRate: undefined, // Binance não fornece taxa anual
      lastMonthRate: undefined,
      lastTwelveMonthsRate: undefined,
      rate: asset.priceChangePercent / 100, // Variação de 24h como taxa
      rateType: '24h',
      
      // Moeda e impostos
      currencyCode: 'USD',
      taxes: 0, // Binance não calcula impostos automaticamente
      taxes2: 0,
      
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
}
