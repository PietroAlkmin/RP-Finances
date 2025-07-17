/**
 * Coletor de transações para cálculo de preço médio na Binance
 * Coleta histórico de trades, depósitos e saques para análise de investimentos
 */

import { BinanceClient } from './BinanceClient.js';
import type { 
  BinanceConfig, 
  BinancePortfolioAsset,
  BinanceAveragePriceCalculation,
  BinanceTransaction,
  MyTrade
} from './BinanceTypes.js';

export class BinanceTransactionCollector {
  private client: BinanceClient;

  constructor(config: BinanceConfig) {
    this.client = new BinanceClient(config);
  }

  /**
   * Calcula preços médios para múltiplos ativos
   */
  async calculateMultipleAveragePrices(assets: BinancePortfolioAsset[]): Promise<BinanceAveragePriceCalculation[]> {
    const calculations: BinanceAveragePriceCalculation[] = [];

    for (const asset of assets) {
      console.log(`🔍 Analisando ${asset.asset}...`);
      
      try {
        const calculation = await this.calculateAveragePrice(asset);
        calculations.push(calculation);
        
        if (calculation.transactionCount > 0) {
          console.log(`✅ ${asset.asset}: ${calculation.transactionCount} transações, preço médio $${calculation.averagePrice.toFixed(2)}`);
        } else {
          console.log(`⚠️ ${asset.asset}: Nenhuma transação encontrada`);
        }
      } catch (error) {
        console.error(`❌ Erro ao analisar ${asset.asset}:`, error);
        
        // Criar resultado básico para ativo com erro
        calculations.push({
          asset: asset.asset,
          symbol: asset.asset,
          totalQuantity: asset.total,
          totalInvested: 0,
          averagePrice: 0,
          currentPrice: asset.price,
          currentValue: asset.usdValue,
          profit: 0,
          profitPercentage: 0,
          transactionCount: 0,
          transactions: []
        });
      }
    }

    return calculations;
  }

  /**
   * Calcula preço médio para um ativo específico
   */
  async calculateAveragePrice(asset: BinancePortfolioAsset): Promise<BinanceAveragePriceCalculation> {
    console.log(`📊 Calculando preço médio para ${asset.asset}...`);

    // 1. Coletar todas as transações do ativo
    const transactions = await this.getAssetTransactions(asset.asset);
    
    if (transactions.length === 0) {
      console.log(`⚠️ ${asset.asset}: Nenhuma transação encontrada`);
      return {
        asset: asset.asset,
        symbol: asset.asset,
        totalQuantity: asset.total,
        totalInvested: 0,
        averagePrice: 0,
        currentPrice: asset.price,
        currentValue: asset.usdValue,
        profit: 0,
        profitPercentage: 0,
        transactionCount: 0,
        transactions: []
      };
    }

    // 2. Calcular preço médio ponderado
    let totalInvested = 0;
    let totalQuantity = 0;

    for (const transaction of transactions) {
      if (transaction.type === 'BUY' || transaction.type === 'DEPOSIT') {
        totalInvested += transaction.amount;
        totalQuantity += transaction.quantity;
      } else if (transaction.type === 'SELL' || transaction.type === 'WITHDRAW') {
        // Para vendas, reduzir proporcionalmente o valor investido
        const saleRatio = transaction.quantity / totalQuantity;
        totalInvested -= totalInvested * saleRatio;
        totalQuantity -= transaction.quantity;
      }
    }

    const averagePrice = totalQuantity > 0 ? totalInvested / totalQuantity : 0;
    const currentValue = asset.usdValue;
    const profit = currentValue - totalInvested;
    const profitPercentage = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;

    console.log(`💰 ${asset.asset}: Investido $${totalInvested.toFixed(2)}, Atual $${currentValue.toFixed(2)}`);

    return {
      asset: asset.asset,
      symbol: asset.asset,
      totalQuantity: asset.total,
      totalInvested,
      averagePrice,
      currentPrice: asset.price,
      currentValue,
      profit,
      profitPercentage,
      transactionCount: transactions.length,
      transactions
    };
  }

  /**
   * Coleta todas as transações de um ativo (trades + depósitos + saques + conversões)
   */
  async getAssetTransactions(asset: string): Promise<BinanceTransaction[]> {
    const transactions: BinanceTransaction[] = [];

    try {
      // 1. Buscar trades do ativo
      const symbolTransactions = await this.getSymbolTransactions(asset);
      transactions.push(...symbolTransactions);

      // 2. Buscar depósitos e saques diretos do ativo
      const depositWithdrawals = await this.getAssetDepositsAndWithdrawals(asset);
      transactions.push(...depositWithdrawals);

      // 3. Buscar transações de conversão (Convert Trade Flow) - NOVO!
      console.log(`🔄 ${asset}: Buscando transações de conversão...`);
      const convertTransactions = await this.getAssetConvertTransactions(asset);
      transactions.push(...convertTransactions);

      // 4. Ordenar por data
      transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      console.log(`📋 ${asset}: ${transactions.length} transações encontradas (${symbolTransactions.length} trades, ${depositWithdrawals.length} dep/saq, ${convertTransactions.length} conversões)`);
      return transactions;

    } catch (error) {
      console.error(`❌ Erro ao buscar transações de ${asset}:`, error);
      return [];
    }
  }

  /**
   * Busca trades de um ativo através dos símbolos de trading
   */
  async getSymbolTransactions(asset: string): Promise<BinanceTransaction[]> {
    const transactions: BinanceTransaction[] = [];
    const symbols = this.getAssetTradingPairs(asset);

    for (const symbol of symbols) {
      try {
        const trades = await this.client.getMyTrades({ symbol });
        
        for (const trade of trades) {
          const transaction = this.convertTradeToTransaction(trade, asset, symbol);
          if (transaction) {
            transactions.push(transaction);
          }
        }
      } catch (error) {
        console.log(`⚠️ Erro ao buscar trades de ${symbol}:`, error);
        // Continua para outros símbolos
      }
    }

    return transactions;
  }

  /**
   * Busca depósitos e saques diretos do ativo
   */
  async getAssetDepositsAndWithdrawals(asset: string): Promise<BinanceTransaction[]> {
    const transactions: BinanceTransaction[] = [];

    try {
      // Depósitos
      const deposits = await this.client.getDepositHistory({ coin: asset });
      for (const deposit of deposits) {
        if (deposit.status === 1) { // Sucesso
          transactions.push({
            symbol: asset,
            type: 'DEPOSIT',
            quantity: parseFloat(deposit.amount),
            price: 0, // Depósitos não têm preço de trade
            amount: 0, // Valor será calculado pelo preço atual ou histórico
            date: new Date(deposit.insertTime).toISOString(),
            id: `deposit_${deposit.id || deposit.txId}`,
            source: 'DEPOSIT'
          });
        }
      }

      // Saques
      const withdrawals = await this.client.getWithdrawHistory({ coin: asset });
      for (const withdrawal of withdrawals) {
        if (withdrawal.status === 6) { // Completo
          transactions.push({
            symbol: asset,
            type: 'WITHDRAW',
            quantity: parseFloat(withdrawal.amount),
            price: 0,
            amount: 0,
            date: new Date(withdrawal.applyTime).toISOString(),
            id: `withdrawal_${withdrawal.id}`,
            source: 'WITHDRAW'
          });
        }
      }
    } catch (error) {
      console.log(`⚠️ Erro ao buscar depósitos/saques de ${asset}:`, error);
    }

    return transactions;
  }

  /**
   * Busca transações de conversão do ativo (Convert Trade Flow)
   * ESTE É O MÉTODO CHAVE PARA ENCONTRAR SUAS COMPRAS DE BITCOIN!
   */
  async getAssetConvertTransactions(asset: string): Promise<BinanceTransaction[]> {
    const transactions: BinanceTransaction[] = [];

    try {
      // Buscar histórico de conversões dos últimos 90 dias
      const endTime = Date.now();
      const startTime = endTime - (90 * 24 * 60 * 60 * 1000); // 90 dias atrás
      
      console.log(`🔄 Buscando conversões de ${asset} dos últimos 90 dias...`);
      const convertTrades = await this.client.getConvertTradeFlow({ 
        startTime, 
        endTime, 
        limit: 1000 
      });

      console.log(`🔍 Convert API Response:`, convertTrades);

      // A resposta pode vir como array direto ou dentro de um objeto com propriedade list
      let tradesArray: any[] = [];
      if (Array.isArray(convertTrades)) {
        tradesArray = convertTrades;
      } else if (convertTrades && (convertTrades as any).list && Array.isArray((convertTrades as any).list)) {
        tradesArray = (convertTrades as any).list;
      } else if (convertTrades && typeof convertTrades === 'object') {
        // Pode ter outras estruturas, vamos verificar
        console.log(`🔍 Convert response keys:`, Object.keys(convertTrades));
      }

      console.log(`🔍 Processing ${tradesArray.length} convert trades for ${asset}`);

      for (const convert of tradesArray) {
        // Verificar se a conversão envolve o ativo alvo
        // Formato típico do Convert Trade Flow:
        // { fromAsset: 'USDT', toAsset: 'BTC', fromAmount: '1000', toAmount: '0.025', ... }
        
        let isRelevant = false;
        let type: 'BUY' | 'SELL' = 'BUY';
        let quantity = 0;
        let price = 0;

        if (convert.toAsset === asset) {
          // Comprando o ativo (ex: USDT -> BTC)
          isRelevant = true;
          type = 'BUY';
          quantity = parseFloat(convert.toAmount);
          price = parseFloat(convert.fromAmount) / quantity; // Preço em relação ao fromAsset
        } else if (convert.fromAsset === asset) {
          // Vendendo o ativo (ex: BTC -> USDT)
          isRelevant = true;
          type = 'SELL';
          quantity = parseFloat(convert.fromAmount);
          price = parseFloat(convert.toAmount) / quantity; // Preço em relação ao toAsset
        }

        if (isRelevant) {
          transactions.push({
            symbol: `${convert.fromAsset}${convert.toAsset}`,
            type,
            quantity,
            price,
            amount: parseFloat(convert.fromAmount),
            date: new Date(convert.createTime || convert.executeTime).toISOString(),
            id: `convert_${convert.orderId || convert.quoteId}`,
            source: 'CONVERT'
          });
          
          console.log(`🔄 Convert encontrado: ${type} ${quantity} ${asset} por ${price} (${convert.fromAsset} -> ${convert.toAsset})`);
        }
      }

      console.log(`🔄 ${asset}: ${transactions.length} conversões encontradas`);
      return transactions;

    } catch (error) {
      console.error(`❌ Erro ao buscar conversões de ${asset}:`, error);
      return [];
    }
  }

  /**
   * Converte trade da Binance para formato padrão
   */
  private convertTradeToTransaction(trade: MyTrade, targetAsset: string, symbol: string): BinanceTransaction | null {
    const baseAsset = this.parseTradingPair(symbol).baseAsset;
    const quoteAsset = this.parseTradingPair(symbol).quoteAsset;

    // Verificar se o trade envolve o ativo alvo
    if (baseAsset !== targetAsset && quoteAsset !== targetAsset) {
      return null;
    }

    const quantity = parseFloat(trade.qty);
    const price = parseFloat(trade.price);
    const totalValue = parseFloat(trade.quoteQty);

    // Determinar tipo de transação baseado na perspectiva do ativo alvo
    let type: 'BUY' | 'SELL';
    let finalQuantity: number;
    let finalAmount: number;

    if (baseAsset === targetAsset) {
      // Ativo alvo é o base asset
      type = trade.isBuyer ? 'BUY' : 'SELL';
      finalQuantity = quantity;
      finalAmount = totalValue;
    } else {
      // Ativo alvo é o quote asset
      type = trade.isBuyer ? 'SELL' : 'BUY';
      finalQuantity = totalValue;
      finalAmount = quantity * price;
    }

    return {
      symbol: symbol,
      type: type,
      quantity: finalQuantity,
      price: baseAsset === targetAsset ? price : (1 / price),
      amount: finalAmount,
      date: new Date(trade.time).toISOString(),
      id: `trade_${trade.id}`,
      source: 'TRADE'
    };
  }

  /**
   * Obtém possíveis pares de trading para um ativo
   */
  private getAssetTradingPairs(asset: string): string[] {
    const commonQuotes = ['USDT', 'BUSD', 'BTC', 'ETH', 'BNB'];
    const pairs: string[] = [];

    // Asset como base (ex: BTCUSDT)
    for (const quote of commonQuotes) {
      if (asset !== quote) {
        pairs.push(`${asset}${quote}`);
      }
    }

    // Asset como quote (ex: ETHBTC se asset for BTC)
    for (const base of commonQuotes) {
      if (asset !== base) {
        pairs.push(`${base}${asset}`);
      }
    }

    // Pares especiais comuns
    const specialPairs: { [key: string]: string[] } = {
      'BTC': ['BTCUSDT', 'BTCBUSD', 'BTCETH'],
      'ETH': ['ETHUSDT', 'ETHBUSD', 'ETHBTC'],
      'BNB': ['BNBUSDT', 'BNBBUSD', 'BNBBTC'],
      'ADA': ['ADAUSDT', 'ADABUSD', 'ADABTC'],
      'DOT': ['DOTUSDT', 'DOTBUSD', 'DOTBTC'],
      'USDT': ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'],
      'BUSD': ['BTCBUSD', 'ETHBUSD', 'BNBBUSD']
    };

    if (specialPairs[asset]) {
      pairs.push(...specialPairs[asset]);
    }

    // Remover duplicatas e retornar
    return [...new Set(pairs)];
  }

  /**
   * Extrai base e quote asset de um símbolo de trading
   */
  private parseTradingPair(symbol: string): { baseAsset: string; quoteAsset: string } {
    const commonQuotes = ['USDT', 'BUSD', 'USDC', 'BTC', 'ETH', 'BNB'];
    
    for (const quote of commonQuotes) {
      if (symbol.endsWith(quote)) {
        return {
          baseAsset: symbol.slice(0, -quote.length),
          quoteAsset: quote
        };
      }
    }

    // Fallback para pares não reconhecidos
    console.warn(`⚠️ Não foi possível parsear o par ${symbol}`);
    return {
      baseAsset: symbol.slice(0, 3),
      quoteAsset: symbol.slice(3)
    };
  }
}
