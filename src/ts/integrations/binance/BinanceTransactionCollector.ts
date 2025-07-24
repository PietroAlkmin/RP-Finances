/**
 * Coletor de transações para cálculo de preço médio na Binance
 * Coleta histórico de trades, depósitos e saques para análise de investimentos
 */

import { BinanceClient } from './BinanceClient.js';
import type { 
  BinanceConfig, 
  BinancePortfolioAsset,
  BinanceAveragePriceCalculation,
  BinanceTransaction
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
    const results: BinanceAveragePriceCalculation[] = [];

    for (const asset of assets) {
      console.log(`🔍 Analisando ${asset.asset}...`);
      try {
        const calculation = await this.calculateAveragePrice(asset);
        results.push(calculation);
      } catch (error) {
        console.error(`❌ Erro ao analisar ${asset.asset}:`, error);
        
        // Retorna resultado vazio em caso de erro
        results.push({
          asset: asset.asset,
          symbol: '',
          averagePrice: 0,
          currentPrice: asset.price,
          totalQuantity: asset.total,
          totalInvested: 0,
          currentValue: asset.usdValue,
          profit: 0,
          profitPercentage: 0,
          transactionCount: 0,
          transactions: []
        });
      }
    }

    return results;
  }

  /**
   * Calcula preço médio para um ativo específico
   */
  async calculateAveragePrice(asset: BinancePortfolioAsset): Promise<BinanceAveragePriceCalculation> {
    console.log(`📊 Calculando preço médio para ${asset.asset}...`);

    try {
      // Coletar todas as transações do ativo
      const transactions = await this.getAssetTransactions(asset.asset);

      if (transactions.length === 0) {
        console.log(`⚠️ ${asset.asset}: Nenhuma transação encontrada`);
        return {
          asset: asset.asset,
          symbol: '',
          averagePrice: 0,
          currentPrice: asset.price,
          totalQuantity: asset.total,
          totalInvested: 0,
          currentValue: asset.usdValue,
          profit: 0,
          profitPercentage: 0,
          transactionCount: 0,
          transactions: []
        };
      }

      // Calcular preço médio ponderado (somente compras)
      const buyTransactions = transactions.filter(t => t.type === 'BUY');
      const totalInvested = buyTransactions.reduce((sum, t) => sum + t.amount, 0);
      const totalQuantityBought = buyTransactions.reduce((sum, t) => sum + t.quantity, 0);
      const averagePrice = totalQuantityBought > 0 ? totalInvested / totalQuantityBought : 0;

      // Calcular rentabilidade
      const currentValue = asset.usdValue;
      const profit = currentValue - totalInvested;
      const profitPercentage = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;

      console.log(`✅ ${asset.asset}: Preço médio $${averagePrice.toFixed(2)} | Investido: $${totalInvested.toFixed(2)} | Atual: $${currentValue.toFixed(2)} | Lucro: ${profitPercentage.toFixed(2)}%`);

      return {
        asset: asset.asset,
        symbol: `${asset.asset}USD`,
        averagePrice,
        currentPrice: asset.price,
        totalQuantity: asset.total,
        totalInvested,
        currentValue,
        profit,
        profitPercentage,
        transactionCount: transactions.length,
        transactions: transactions.map(t => ({
          symbol: t.symbol,
          type: t.type,
          quantity: t.quantity,
          price: t.price,
          amount: t.amount,
          date: t.date,
          id: t.id,
          source: t.source
        }))
      };

    } catch (error) {
      console.error(`❌ Erro ao calcular preço médio para ${asset.asset}:`, error);
      throw error;
    }
  }

  /**
   * Coleta todas as transações de um ativo
   */
  async getAssetTransactions(asset: string): Promise<BinanceTransaction[]> {
    const allTransactions: BinanceTransaction[] = [];

    try {
      // 1. Trades de spot
      const tradeTransactions = await this.getSymbolTransactions(asset);
      allTransactions.push(...tradeTransactions);

      // 2. Depósitos e saques
      const depositWithdrawTransactions = await this.getDepositWithdrawTransactions(asset);
      allTransactions.push(...depositWithdrawTransactions);

      // 3. Conversões
      const convertTransactions = await this.getConvertTransactions(asset);
      allTransactions.push(...convertTransactions);

      // 4. P2P
      const p2pTransactions = await this.getP2PTransactions(asset);
      allTransactions.push(...p2pTransactions);

      // 5. Fiat (compras com dinheiro real)
      const fiatTransactions = await this.getAssetFiatTransactions(asset);
      allTransactions.push(...fiatTransactions);

      // Ordenar por data
      allTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      console.log(`📋 ${asset}: ${allTransactions.length} transações encontradas (${tradeTransactions.length} trades, ${depositWithdrawTransactions.length} dep/saq, ${convertTransactions.length} conversões, ${p2pTransactions.length} P2P, ${fiatTransactions.length} fiat)`);

      return allTransactions;

    } catch (error) {
      console.error(`❌ Erro ao coletar transações para ${asset}:`, error);
      return [];
    }
  }

  /**
   * Busca trades de spot para símbolos relacionados ao ativo
   */
  async getSymbolTransactions(asset: string): Promise<BinanceTransaction[]> {
    const transactions: BinanceTransaction[] = [];
    
    // Símbolos mais comuns para o ativo
    const baseSymbols = ['USDT', 'BUSD', 'ETH', 'BNB'];
    const reversedSymbols = ['USDT', 'BUSD', 'ETH', 'BNB'];
    
    const symbols = [
      ...baseSymbols.map(base => `${asset}${base}`),
      ...reversedSymbols.map(quote => `${quote}${asset}`)
    ];

    for (const symbol of symbols) {
      try {
        const trades = await this.client.getMyTrades({ symbol, limit: 1000 });
        
        if (trades && trades.length > 0) {
          console.log(`📈 ${symbol}: ${trades.length} trades encontrados`);
          
          for (const trade of trades) {
            const isBase = symbol.startsWith(asset);
            const quantity = parseFloat(trade.qty);
            const quoteQty = parseFloat(trade.quoteQty);
            
            // Determinar se é compra ou venda do ativo alvo
            let type: 'BUY' | 'SELL';
            let assetQuantity: number;
            let totalValue: number;
            
            if (isBase) {
              // Ativo é a base (ex: BTCUSDT)
              type = trade.isBuyer ? 'BUY' : 'SELL';
              assetQuantity = quantity;
              totalValue = quoteQty;
            } else {
              // Ativo é a quote (ex: USDTBTC)
              type = trade.isBuyer ? 'SELL' : 'BUY';
              assetQuantity = quoteQty;
              totalValue = quantity;
            }

            transactions.push({
              symbol,
              type,
              quantity: assetQuantity,
              price: totalValue / assetQuantity,
              amount: totalValue,
              date: new Date(trade.time).toISOString(),
              id: `trade_${trade.id}`,
              source: 'TRADE'
            });
          }
        }
      } catch (error) {
        console.log(`⚠️ Erro ao buscar trades de ${symbol}:`, (error as Error).message);
      }
    }

    return transactions;
  }

  /**
   * Busca depósitos e saques
   */
  async getDepositWithdrawTransactions(asset: string): Promise<BinanceTransaction[]> {
    const transactions: BinanceTransaction[] = [];

    try {
      // Buscar depósitos em chunks de 90 dias (limitação da API)
      const currentTime = Date.now();
      const twoYearsAgo = currentTime - (2 * 365 * 24 * 60 * 60 * 1000); // 2 anos atrás
      const chunkSize = 89 * 24 * 60 * 60 * 1000; // 89 dias em ms (seguro para API)
      
      console.log(`💰 ${asset}: Buscando depósitos dos últimos 2 anos (em chunks de 90 dias)...`);
      
      // Buscar todos os depósitos em chunks
      for (let startTime = twoYearsAgo; startTime < currentTime; startTime += chunkSize) {
        const endTime = Math.min(startTime + chunkSize, currentTime);
        
        console.log(`💰 Chunk depósitos: ${new Date(startTime).toLocaleDateString()} - ${new Date(endTime).toLocaleDateString()}`);
        
        try {
          const deposits = await this.client.getDepositHistory({ 
            coin: asset, 
            startTime, 
            endTime,
            status: 1 // 1 = success
          });

          if (deposits && deposits.length > 0) {
            for (const deposit of deposits) {
              transactions.push({
                symbol: `${asset}DEPOSIT`,
                type: 'BUY', // Depósito é como uma compra externa
                quantity: parseFloat(deposit.amount),
                price: 0, // Não sabemos o preço de custo do depósito
                amount: 0,
                date: new Date(deposit.insertTime).toISOString(),
                id: `deposit_${deposit.txId}`,
                source: 'DEPOSIT'
              });
            }
            console.log(`💰 ${asset}: ${deposits.length} depósitos encontrados no chunk`);
          }
        } catch (chunkError) {
          console.log(`⚠️ Erro no chunk depósitos:`, (chunkError as Error).message);
        }
      }

      // Buscar saques em chunks de 90 dias
      console.log(`💸 ${asset}: Buscando saques dos últimos 2 anos (em chunks de 90 dias)...`);
      
      for (let startTime = twoYearsAgo; startTime < currentTime; startTime += chunkSize) {
        const endTime = Math.min(startTime + chunkSize, currentTime);
        
        console.log(`💸 Chunk saques: ${new Date(startTime).toLocaleDateString()} - ${new Date(endTime).toLocaleDateString()}`);
        
        try {
          const withdraws = await this.client.getWithdrawHistory({ 
            coin: asset, 
            startTime, 
            endTime,
            status: 6 // 6 = completed
          });

          if (withdraws && withdraws.length > 0) {
            for (const withdraw of withdraws) {
              transactions.push({
                symbol: `${asset}WITHDRAW`,
                type: 'SELL', // Saque é como uma venda externa
                quantity: parseFloat(withdraw.amount),
                price: 0, // Não afeta o preço médio
                amount: 0,
                date: new Date(withdraw.applyTime).toISOString(),
                id: `withdraw_${withdraw.id}`,
                source: 'WITHDRAW'
              });
            }
            console.log(`💸 ${asset}: ${withdraws.length} saques encontrados no chunk`);
          }
        } catch (chunkError) {
          console.log(`⚠️ Erro no chunk saques:`, (chunkError as Error).message);
        }
      }

      console.log(`💰💸 ${asset}: Total ${transactions.length} dep/saques encontrados`);

    } catch (error) {
      console.error(`❌ Erro ao buscar depósitos/saques para ${asset}:`, error);
    }

    return transactions;
  }

  /**
   * Busca transações de conversão (Convert)
   */
  async getConvertTransactions(asset: string): Promise<BinanceTransaction[]> {
    const transactions: BinanceTransaction[] = [];

    try {
      console.log(`🔄 ${asset}: Buscando transações de conversão...`);
      
      // Buscar conversões em chunks de 30 dias (Convert API é mais restritiva)
      const currentTime = Date.now();
      const twoYearsAgo = currentTime - (2 * 365 * 24 * 60 * 60 * 1000); // 2 anos atrás
      const chunkSize = 30 * 24 * 60 * 60 * 1000; // 30 dias em ms (seguro para Convert API)
      
      console.log(`🔄 Buscando conversões de ${asset} dos últimos 2 anos (em chunks de 30 dias)...`);
      
      // Buscar todas as conversões em chunks
      for (let startTime = twoYearsAgo; startTime < currentTime; startTime += chunkSize) {
        const endTime = Math.min(startTime + chunkSize, currentTime);
        
        console.log(`🔄 Chunk conversões: ${new Date(startTime).toLocaleDateString()} - ${new Date(endTime).toLocaleDateString()}`);
        
        try {
          const convertTrades = await this.client.getConvertTradeFlow({
            startTime,
            endTime,
            limit: 1000
          });

          console.log(`🔍 Convert API Response (chunk):`, convertTrades);

          // A resposta pode vir como array direto ou dentro de um objeto
          let tradesArray: any[] = [];
          if (Array.isArray(convertTrades)) {
            tradesArray = convertTrades;
          } else if (convertTrades && (convertTrades as any).list && Array.isArray((convertTrades as any).list)) {
            tradesArray = (convertTrades as any).list;
          }

          console.log(`🔍 Processing ${tradesArray.length} convert trades for ${asset} no chunk`);

          for (const trade of tradesArray) {
            // Verificar se o trade envolve o ativo alvo
            const fromAsset = trade.fromAsset;
            const toAsset = trade.toAsset;
            
            if (fromAsset === asset) {
              // Vendendo o ativo
              const quantity = parseFloat(trade.fromAmount);
              const totalValue = parseFloat(trade.toAmount);
              
              transactions.push({
                symbol: `${asset}${toAsset}`,
                type: 'SELL',
                quantity,
                price: totalValue / quantity,
                amount: totalValue,
                date: new Date(trade.createTime).toISOString(),
                id: `convert_${trade.orderId}`,
                source: 'CONVERT'
              });
              
              console.log(`🔄 Convert encontrado: SELL ${quantity} ${asset} → ${totalValue} ${toAsset}`);
            }
            
            if (toAsset === asset) {
              // Comprando o ativo
              const quantity = parseFloat(trade.toAmount);
              const totalValue = parseFloat(trade.fromAmount);
              
              transactions.push({
                symbol: `${fromAsset}${asset}`,
                type: 'BUY',
                quantity,
                price: totalValue / quantity,
                amount: totalValue,
                date: new Date(trade.createTime).toISOString(),
                id: `convert_${trade.orderId}`,
                source: 'CONVERT'
              });
              
              console.log(`🔄 Convert encontrado: BUY ${quantity} ${asset} por ${totalValue} ${fromAsset}`);
            }
          }
        } catch (chunkError) {
          console.log(`⚠️ Erro no chunk conversões:`, (chunkError as Error).message);
        }
      }

      console.log(`🔄 ${asset}: ${transactions.length} conversões encontradas`);

    } catch (error) {
      console.error(`❌ Erro ao buscar conversões para ${asset}:`, error);
    }

    return transactions;
  }

  /**
   * Busca transações P2P
   */
  async getP2PTransactions(asset: string): Promise<BinanceTransaction[]> {
    const transactions: BinanceTransaction[] = [];

    try {
      console.log(`🤝 ${asset}: Buscando transações P2P...`);
      
      // Buscar P2P em chunks de 90 dias (limitação da API)
      const currentTime = Date.now();
      const twoYearsAgo = currentTime - (2 * 365 * 24 * 60 * 60 * 1000); // 2 anos atrás
      const chunkSize = 89 * 24 * 60 * 60 * 1000; // 89 dias em ms (seguro para API)
      
      console.log(`🤝 Buscando P2P de ${asset} dos últimos 2 anos (em chunks de 90 dias)...`);
      
      // Buscar todas as transações P2P em chunks
      for (let startTime = twoYearsAgo; startTime < currentTime; startTime += chunkSize) {
        const endTime = Math.min(startTime + chunkSize, currentTime);
        
        console.log(`🤝 Chunk P2P: ${new Date(startTime).toLocaleDateString()} - ${new Date(endTime).toLocaleDateString()}`);
        
        try {
          const p2pOrders = await this.client.getP2POrderHistory({
            startTime,
            endTime
          });

          console.log(`🔍 P2P API Response (chunk):`, p2pOrders);

          // A resposta pode vir como array direto ou dentro de um objeto
          let ordersArray: any[] = [];
          if (Array.isArray(p2pOrders)) {
            ordersArray = p2pOrders;
          } else if (p2pOrders && (p2pOrders as any).data && Array.isArray((p2pOrders as any).data)) {
            ordersArray = (p2pOrders as any).data;
          }

          console.log(`🔍 Processing ${ordersArray.length} P2P orders for ${asset} no chunk`);

          for (const order of ordersArray) {
            // Verificar se a ordem envolve o ativo alvo
            if (order.asset === asset || order.cryptoCurrency === asset) {
              const type = order.tradeType; // 'BUY' ou 'SELL'
              const quantity = parseFloat(order.amount || order.cryptoAmount || '0');
              const totalValue = parseFloat(order.totalPrice || order.fiatAmount || '0');
              const price = totalValue > 0 ? totalValue / quantity : 0;

              transactions.push({
                symbol: `${asset}P2P`,
                type: type.toUpperCase() as 'BUY' | 'SELL',
                quantity,
                price,
                amount: totalValue,
                date: new Date(order.createTime || order.orderCreateTime || Date.now()).toISOString(),
                id: `p2p_${order.orderNumber || order.orderId || Math.random()}`,
                source: 'P2P'
              });
              
              console.log(`🤝 P2P encontrado: ${type} ${quantity} ${asset} por ${price}`);
            }
          }
        } catch (chunkError) {
          console.log(`⚠️ Erro no chunk P2P:`, (chunkError as Error).message);
        }
      }

      console.log(`🤝 ${asset}: ${transactions.length} transações P2P encontradas`);

    } catch (error) {
      console.error(`❌ Erro ao buscar P2P para ${asset}:`, error);
    }

    return transactions;
  }

  /**
   * Busca compras via Fiat (cartão de crédito, PIX, etc.)
   */
  async getAssetFiatTransactions(asset: string): Promise<BinanceTransaction[]> {
    const transactions: BinanceTransaction[] = [];

    try {
      console.log(`💳 ${asset}: Buscando compras com dinheiro real...`);
      
      // Buscar Fiat em chunks de 90 dias (limitação da API)
      const currentTime = Date.now();
      const twoYearsAgo = currentTime - (2 * 365 * 24 * 60 * 60 * 1000); // 2 anos atrás
      const chunkSize = 89 * 24 * 60 * 60 * 1000; // 89 dias em ms (seguro para API)
      
      console.log(`💳 Buscando Fiat de ${asset} dos últimos 2 anos (em chunks de 90 dias)...`);
      
      // Buscar todas as ordens Fiat em chunks
      const successfulFiatDeposits: any[] = [];
      
      for (let startTime = twoYearsAgo; startTime < currentTime; startTime += chunkSize) {
        const endTime = Math.min(startTime + chunkSize, currentTime);
        
        console.log(`💳 Chunk Fiat: ${new Date(startTime).toLocaleDateString()} - ${new Date(endTime).toLocaleDateString()}`);
        
        try {
          const fiatOrders = await this.client.getFiatOrderHistory({ 
            transactionType: 0, // 0 = buy, 1 = sell
            startTime, 
            endTime
          });

          console.log(`🔍 Fiat API Response (chunk):`, fiatOrders);

          // A resposta pode vir como array direto ou dentro de um objeto
          let ordersArray: any[] = [];
          if (Array.isArray(fiatOrders)) {
            ordersArray = fiatOrders;
          } else if (fiatOrders && (fiatOrders as any).data && Array.isArray((fiatOrders as any).data)) {
            ordersArray = (fiatOrders as any).data;
          }

          console.log(`🔍 Processing ${ordersArray.length} Fiat orders no chunk`);

          // NOVA LÓGICA: As ordens Fiat não mostram qual crypto foi comprada
          // Vamos coletar apenas depósitos bem-sucedidos para correlacionar depois
          for (const order of ordersArray) {
            console.log(`🔍 Processando Fiat order:`, order);
            
            // Verificar se é um depósito bem-sucedido
            if (order.status === 'Successful') {
              const fiatAmount = parseFloat(order.amount || order.indicatedAmount || '0');
              const timestamp = order.createTime || order.updateTime;
              
              successfulFiatDeposits.push({
                orderNo: order.orderNo,
                fiatAmount,
                timestamp,
                fiatCurrency: order.fiatCurrency,
                method: order.method
              });
              
              console.log(`💰 Depósito Fiat bem-sucedido: ${order.fiatCurrency} ${fiatAmount} em ${new Date(timestamp).toLocaleString()}`);
            } else {
              console.log(`⚠️ Fiat order ${order.status}, ignorando`);
            }
          }
        } catch (chunkError) {
          console.log(`⚠️ Erro no chunk Fiat:`, (chunkError as Error).message);
        }
      }

      console.log(`💳 Encontrados ${successfulFiatDeposits.length} depósitos Fiat bem-sucedidos`);

      // Se há depósitos Fiat e estamos buscando BTC, vamos tentar correlacionar
      if (successfulFiatDeposits.length > 0 && asset === 'BTC') {
        console.log(`🔍 Tentando correlacionar depósitos Fiat com compras de ${asset}...`);
        
        // Para cada depósito Fiat, buscar trades próximos no tempo
        for (const deposit of successfulFiatDeposits) {
          await this.correlateFiatWithTrades(deposit, asset, transactions);
        }
      }

      console.log(`💳 ${asset}: ${transactions.length} transações Fiat encontradas`);
      return transactions;

    } catch (error) {
      console.error(`❌ Erro ao buscar Fiat orders para ${asset}:`, error);
      return [];
    }
  }

  /**
   * Correlaciona depósitos Fiat com trades subsequentes para identificar compras
   */
  private async correlateFiatWithTrades(deposit: any, asset: string, transactions: any[]): Promise<void> {
    try {
      console.log(`🔍 Correlacionando depósito de ${deposit.fiatCurrency} ${deposit.fiatAmount} (${new Date(deposit.timestamp).toLocaleString()})`);
      
      // Buscar trades que aconteceram até 7 dias após o depósito Fiat
      const depositTime = deposit.timestamp;
      const windowStart = depositTime;
      const windowEnd = depositTime + (7 * 24 * 60 * 60 * 1000); // +7 dias
      
      // Símbolos mais prováveis para BTC comprado com BRL via Fiat
      const possibleSymbols = ['BTCUSDT', 'BTCBUSD'];
      
      for (const symbol of possibleSymbols) {
        try {
          console.log(`🔍 Buscando trades ${symbol} entre ${new Date(windowStart).toLocaleString()} e ${new Date(windowEnd).toLocaleString()}`);
          
          // Binance API limita consultas a 24h máximo - vamos dividir em chunks
          const allTrades: any[] = [];
          const chunkSize = 24 * 60 * 60 * 1000; // 24 horas em ms
          
          for (let currentStart = windowStart; currentStart < windowEnd; currentStart += chunkSize) {
            const currentEnd = Math.min(currentStart + chunkSize, windowEnd);
            
            console.log(`🔍 Chunk: ${new Date(currentStart).toLocaleString()} - ${new Date(currentEnd).toLocaleString()}`);
            
            try {
              const chunkTrades = await this.client.getMyTrades({ 
                symbol,
                startTime: currentStart,
                endTime: currentEnd,
                limit: 100
              });
              
              if (chunkTrades && chunkTrades.length > 0) {
                allTrades.push(...chunkTrades);
                console.log(`📈 Encontrados ${chunkTrades.length} trades no chunk`);
              }
            } catch (chunkError) {
              console.log(`⚠️ Erro no chunk ${symbol}:`, (chunkError as Error).message);
            }
          }
          
          const trades = allTrades;

          if (trades && trades.length > 0) {
            console.log(`📊 Encontrados ${trades.length} trades em ${symbol} no período`);
            
            // Processar trades que podem estar relacionados ao depósito Fiat
            for (const trade of trades) {
              const tradeTime = trade.time;
              const tradeValue = parseFloat(trade.quoteQty); // Valor em USDT/BUSD
              const btcQuantity = parseFloat(trade.qty);
              const price = parseFloat(trade.price);
              
              console.log(`💱 Trade encontrado: ${btcQuantity} BTC por $${tradeValue} USDT/BUSD às ${new Date(tradeTime).toLocaleString()}`);
              
              // Verificar se o trade aconteceu no período correto
              if (tradeTime >= windowStart && tradeTime <= windowEnd) {
                console.log(`✅ Trade no período correto - adicionando correlação`);
                
                // Adicionar como transação correlacionada
                transactions.push({
                  symbol: `${asset}FIAT`,
                  type: 'BUY',
                  quantity: btcQuantity,
                  price: price, // Preço em USDT/BUSD
                  amount: tradeValue, // Valor total em USDT/BUSD
                  date: new Date(tradeTime).toISOString(),
                  id: `fiat_correlated_${deposit.orderNo}_${trade.id}`,
                  source: 'FIAT' as any,
                  originalFiatAmount: deposit.fiatAmount,
                  originalFiatCurrency: deposit.fiatCurrency,
                  correlatedTradeId: trade.id
                });
                
                console.log(`💳 Correlação criada: Depósito ${deposit.fiatCurrency} ${deposit.fiatAmount} → Compra ${btcQuantity} BTC por $${price}`);
              } else {
                console.log(`⏰ Trade fora do período: ${new Date(tradeTime).toLocaleString()} (janela: ${new Date(windowStart).toLocaleString()} - ${new Date(windowEnd).toLocaleString()})`);
              }
            }
          } else {
            console.log(`📭 Nenhum trade encontrado em ${symbol} no período de 7 dias após o depósito`);
          }
        } catch (error) {
          console.log(`⚠️ Erro ao buscar trades ${symbol}:`, (error as Error).message);
        }
      }

      // Se não encontrou trades nos 7 dias, vamos buscar TODOS os trades de BTC para análise
      console.log(`🔍 Buscando TODOS os trades de BTC (sem filtro de data) para análise...`);
      for (const symbol of possibleSymbols) {
        try {
          console.log(`📊 Analisando histórico completo de ${symbol}...`);
          
          const allTrades = await this.client.getMyTrades({ 
            symbol,
            limit: 1000  // Sem filtro de data - busca tudo
          });

          if (allTrades && allTrades.length > 0) {
            console.log(`📈 HISTÓRICO ${symbol}: ${allTrades.length} trades encontrados (total)`);
            
            // Mostrar os 5 trades mais recentes para análise
            const recentTrades = allTrades.slice(-5);
            console.log(`🔍 Últimos 5 trades de ${symbol}:`);
            
            for (let i = recentTrades.length - 1; i >= 0; i--) {
              const trade = recentTrades[i];
              const tradeTime = trade.time;
              const btcQuantity = parseFloat(trade.qty);
              const price = parseFloat(trade.price);
              const isBuy = trade.isBuyer;
              
              console.log(`   ${i + 1}. ${isBuy ? 'BUY' : 'SELL'} ${btcQuantity} BTC por $${price} em ${new Date(tradeTime).toLocaleString()}`);
            }
          } else {
            console.log(`📭 Nenhum trade encontrado em ${symbol} (histórico completo)`);
          }
        } catch (error) {
          console.log(`⚠️ Erro ao buscar histórico ${symbol}:`, (error as Error).message);
        }
      }
      
    } catch (error) {
      console.error(`❌ Erro na correlação Fiat:`, error);
    }
  }
}
