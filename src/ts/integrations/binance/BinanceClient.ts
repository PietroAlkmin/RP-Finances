/**
 * Cliente Binance para integração com API
 * Implementa autenticação HMAC-SHA256 e métodos principais para portfolio
 * Baseado na biblioteca oficial binance-connector-typescript
 */

import * as CryptoJS from 'crypto-js';
import type {
  BinanceConfig,
  AccountInfo,
  SymbolPrice,
  Ticker24hr,
  MyTrade,
  DepositHistory,
  WithdrawHistory,
  BinancePortfolioSummary,
  BinancePortfolioAsset,
  GetAccountOptions,
  GetMyTradesOptions,
  GetDepositHistoryOptions,
  GetWithdrawHistoryOptions,
  BinanceError
} from './BinanceTypes.js';

export class BinanceClient {
  private config: BinanceConfig;
  private baseUrl: string;
  private serverTimeOffset: number = 0;

  constructor(config: BinanceConfig) {
    this.config = config;
    // Usa proxy local para evitar CORS
    this.baseUrl = 'http://localhost:3009/api/binance';
  }

  /**
   * Sincroniza tempo com servidor Binance
   */
  private async syncServerTime(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v3/time`, {
        headers: {
          'X-API-Key': this.config.apiKey,
          'X-API-Secret': this.config.apiSecret
        }
      });
      if (response.ok) {
        const data = await response.json();
        const serverTime = data.serverTime;
        const localTime = Date.now();
        this.serverTimeOffset = serverTime - localTime;
        console.log(`🕐 Binance: Offset de tempo: ${this.serverTimeOffset}ms`);
      }
    } catch (error) {
      console.warn('⚠️ Binance: Falha na sincronização de tempo, usando tempo local');
    }
  }

  /**
   * Obtém timestamp sincronizado com servidor
   */
  private getTimestamp(): number {
    return Date.now() + this.serverTimeOffset;
  }

  /**
   * Gera assinatura HMAC-SHA256 para autenticação
   */
  private generateSignature(queryString: string): string {
    return CryptoJS.HmacSHA256(queryString, this.config.apiSecret).toString(CryptoJS.enc.Hex);
  }

  /**
   * Cria query string com timestamp e assinatura
   */
  private createSignedQueryString(params: Record<string, any> = {}): string {
    const timestamp = this.getTimestamp();
    const queryParams: Record<string, string> = {
      ...params,
      timestamp: timestamp.toString(),
      recvWindow: (params.recvWindow || 5000).toString()
    };

    // Remove parâmetros undefined
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === undefined || queryParams[key] === 'undefined') {
        delete queryParams[key];
      }
    });

    const queryString = new URLSearchParams(queryParams).toString();
    const signature = this.generateSignature(queryString);
    
    return `${queryString}&signature=${signature}`;
  }

  /**
   * Faz requisição HTTP para API Binance via proxy local
   */
  private async makeRequest<T>(
    method: 'GET' | 'POST' | 'DELETE',
    endpoint: string,
    params: Record<string, any> = {},
    requiresAuth: boolean = false
  ): Promise<T> {
    // Constrói URL completa concatenando baseUrl + endpoint
    const fullUrl = `${this.baseUrl}${endpoint}`;
    const url = new URL(fullUrl);
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Adiciona credenciais para o proxy se requer autenticação
    if (requiresAuth) {
      headers['X-API-Key'] = this.config.apiKey;
      headers['X-API-Secret'] = this.config.apiSecret;
    }

    let body: string | undefined;
    
    if (method === 'GET') {
      const queryString = requiresAuth ? this.createSignedQueryString(params) : new URLSearchParams(params).toString();
      if (queryString) {
        url.search = queryString;
      }
    } else {
      if (requiresAuth) {
        body = this.createSignedQueryString(params);
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
      } else {
        body = JSON.stringify(params);
      }
    }

    console.log(`🌐 Binance API Request: ${method} ${url.toString()}`);

    try {
      const response = await fetch(url.toString(), {
        method,
        headers,
        body
      });

      if (!response.ok) {
        const errorData: BinanceError = await response.json().catch(() => ({
          code: response.status,
          msg: response.statusText
        }));
        
        console.error('❌ Binance API Error:', errorData);
        throw new Error(`Binance API Error ${errorData.code}: ${errorData.msg}`);
      }

      const data = await response.json();
      console.log(`✅ Binance API Response received`);
      return data;

    } catch (error) {
      console.error('❌ Binance API Request failed:', error);
      throw error;
    }
  }

  /**
   * Obtém informações da conta (saldos, permissões, etc.)
   */
  async getAccountInfo(options: GetAccountOptions = {}): Promise<AccountInfo> {
    return this.makeRequest<AccountInfo>('GET', '/api/v3/account', options, true);
  }

  /**
   * Obtém preços atuais de todos os símbolos ou símbolo específico
   */
  async getSymbolPrices(symbols?: string[]): Promise<SymbolPrice[]> {
    const params = symbols && symbols.length > 0 ? { symbols: JSON.stringify(symbols) } : {};
    return this.makeRequest<SymbolPrice[]>('GET', '/api/v3/ticker/price', params);
  }

  /**
   * Obtém estatísticas de 24h para todos os símbolos ou símbolos específicos
   */
  async get24hrTickers(symbols?: string[]): Promise<Ticker24hr[]> {
    const params = symbols && symbols.length > 0 ? { symbols: JSON.stringify(symbols) } : {};
    return this.makeRequest<Ticker24hr[]>('GET', '/api/v3/ticker/24hr', params);
  }

  /**
   * Obtém histórico de trades da conta
   */
  async getMyTrades(options: GetMyTradesOptions): Promise<MyTrade[]> {
    return this.makeRequest<MyTrade[]>('GET', '/api/v3/myTrades', options, true);
  }

  /**
   * Obtém histórico de depósitos
   */
  async getDepositHistory(options: GetDepositHistoryOptions = {}): Promise<DepositHistory[]> {
    return this.makeRequest<DepositHistory[]>('GET', '/sapi/v1/capital/deposit/hisrec', options, true);
  }

  /**
   * Obtém histórico de saques
   */
  async getWithdrawHistory(options: GetWithdrawHistoryOptions = {}): Promise<WithdrawHistory[]> {
    return this.makeRequest<WithdrawHistory[]>('GET', '/sapi/v1/capital/withdraw/history', options, true);
  }

  /**
   * MÉTODO PRINCIPAL: Gera resumo completo do portfolio Binance
   * Combina saldos, preços e estatísticas para criar visão consolidada
   */
  async getPortfolioSummary(): Promise<BinancePortfolioSummary> {
    console.log('🚀 Binance: Iniciando coleta de portfolio...');

    try {
      // 1. Busca informações da conta (saldos)
      console.log('📊 Binance: Obtendo informações da conta...');
      const accountInfo = await this.getAccountInfo();
      
      // Filtra apenas saldos com valor > 0
      const nonZeroBalances = accountInfo.balances.filter(balance => 
        parseFloat(balance.free) > 0 || parseFloat(balance.locked) > 0
      );

      if (nonZeroBalances.length === 0) {
        console.log('ℹ️ Binance: Nenhum saldo encontrado');
        return {
          totalUsdValue: 0,
          totalBtcValue: 0,
          assets: [],
          topGainers: [],
          topLosers: [],
          lastUpdate: Date.now()
        };
      }

      // 2. Busca preços atuais para os ativos com saldo
      console.log('💰 Binance: Obtendo preços atuais...');
      const allPrices = await this.getSymbolPrices();
      const priceMap = new Map(allPrices.map(p => [p.symbol, parseFloat(p.price)]));
      
      // 3. Busca estatísticas de 24h para cálculo de variação
      console.log('📈 Binance: Obtendo estatísticas de 24h...');
      const tickers24h = await this.get24hrTickers();
      const tickerMap = new Map(tickers24h.map(t => [t.symbol, t]));

      // 4. Processa cada ativo
      const assets: BinancePortfolioAsset[] = [];
      let totalUsdValue = 0;
      let totalBtcValue = 0;

      // Preços de referência (BTC para conversões)
      const btcPrice = priceMap.get('BTCUSDT') || 0;

      for (const balance of nonZeroBalances) {
        const asset = balance.asset;
        const free = parseFloat(balance.free);
        const locked = parseFloat(balance.locked);
        const total = free + locked;

        if (total <= 0) continue;

        // Determina preço do ativo em USDT
        let usdValue = 0;
        let price = 0;
        let priceChangePercent = 0;

        if (asset === 'USDT' || asset === 'BUSD' || asset === 'USDC') {
          // Stablecoins = 1 USD
          price = 1;
          usdValue = total;
        } else {
          // Tenta encontrar par com USDT primeiro, depois BTC, depois ETH
          const usdtSymbol = `${asset}USDT`;
          const btcSymbol = `${asset}BTC`;
          const ethSymbol = `${asset}ETH`;

          if (priceMap.has(usdtSymbol)) {
            price = priceMap.get(usdtSymbol)!;
            usdValue = total * price;
            const ticker = tickerMap.get(usdtSymbol);
            priceChangePercent = ticker ? parseFloat(ticker.priceChangePercent) : 0;
          } else if (priceMap.has(btcSymbol) && btcPrice > 0) {
            const btcPairPrice = priceMap.get(btcSymbol)!;
            price = btcPairPrice * btcPrice;
            usdValue = total * price;
            const ticker = tickerMap.get(btcSymbol);
            priceChangePercent = ticker ? parseFloat(ticker.priceChangePercent) : 0;
          } else if (priceMap.has(ethSymbol)) {
            const ethPrice = priceMap.get('ETHUSDT') || 0;
            const ethPairPrice = priceMap.get(ethSymbol)!;
            price = ethPairPrice * ethPrice;
            usdValue = total * price;
            const ticker = tickerMap.get(ethSymbol);
            priceChangePercent = ticker ? parseFloat(ticker.priceChangePercent) : 0;
          } else {
            console.warn(`⚠️ Binance: Preço não encontrado para ${asset}`);
            continue;
          }
        }

        const btcValue = btcPrice > 0 ? usdValue / btcPrice : 0;

        assets.push({
          symbol: asset,
          asset,
          free,
          locked,
          total,
          usdValue,
          btcValue,
          price,
          priceChangePercent,
          allocation: 0 // Será calculado após somar total
        });

        totalUsdValue += usdValue;
        totalBtcValue += btcValue;
      }

      // 5. Calcula alocação percentual e ordena por valor
      assets.forEach(asset => {
        asset.allocation = totalUsdValue > 0 ? (asset.usdValue / totalUsdValue) * 100 : 0;
      });

      assets.sort((a, b) => b.usdValue - a.usdValue);

      // 6. Identifica top gainers e losers
      const assetsWithChange = assets.filter(a => a.priceChangePercent !== 0);
      const topGainers = assetsWithChange
        .filter(a => a.priceChangePercent > 0)
        .sort((a, b) => b.priceChangePercent - a.priceChangePercent)
        .slice(0, 5);
      
      const topLosers = assetsWithChange
        .filter(a => a.priceChangePercent < 0)
        .sort((a, b) => a.priceChangePercent - b.priceChangePercent)
        .slice(0, 5);

      console.log('✅ Binance: Portfolio coletado com sucesso');
      console.log(`💰 Total USD: $${totalUsdValue.toFixed(2)}`);
      console.log(`₿ Total BTC: ${totalBtcValue.toFixed(8)} BTC`);
      console.log(`📊 Ativos: ${assets.length}`);

      return {
        totalUsdValue,
        totalBtcValue,
        assets,
        topGainers,
        topLosers,
        lastUpdate: Date.now()
      };

    } catch (error) {
      console.error('❌ Binance: Erro ao obter portfolio:', error);
      throw error;
    }
  }

  /**
   * Testa conexão com API Binance
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 Binance: Testando conexão...');
      
      // Sincronizar tempo com servidor primeiro
      await this.syncServerTime();
      
      // Testa endpoint público primeiro
      await this.makeRequest<any>('GET', '/api/v3/ping');
      console.log('✅ Binance: Endpoint público OK');
      
      // Testa autenticação
      const accountInfo = await this.getAccountInfo();
      console.log('✅ Binance: Autenticação OK');
      console.log(`📋 Conta: ${accountInfo.accountType}, Permissões: ${accountInfo.permissions.join(', ')}`);
      
      return true;
    } catch (error) {
      console.error('❌ Binance: Falha na conexão:', error);
      return false;
    }
  }
}
