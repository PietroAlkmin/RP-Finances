/**
 * Tipos TypeScript para integração com API Binance
 * Baseado na biblioteca oficial: binance-connector-typescript
 * Documentação: https://developers.binance.com/docs/binance-spot-api-docs
 */

// ===== CONFIGURAÇÃO =====
export interface BinanceConfig {
  apiKey: string;
  apiSecret: string;
  baseUrl?: string;
  testnet?: boolean;
}

// ===== SALDO DA CONTA =====
export interface AccountBalance {
  asset: string;
  free: string;
  locked: string;
}

export interface AccountInfo {
  makerCommission: number;
  takerCommission: number;
  buyerCommission: number;
  sellerCommission: number;
  canTrade: boolean;
  canWithdraw: boolean;
  canDeposit: boolean;
  updateTime: number;
  accountType: string;
  balances: AccountBalance[];
  permissions: string[];
  uid: number;
}

// ===== PREÇOS E TICKERS =====
export interface SymbolPrice {
  symbol: string;
  price: string;
}

export interface Ticker24hr {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  prevClosePrice: string;
  lastPrice: string;
  lastQty: string;
  bidPrice: string;
  bidQty: string;
  askPrice: string;
  askQty: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openTime: number;
  closeTime: number;
  firstId: number;
  lastId: number;
  count: number;
}

// ===== ORDENS =====
export interface OrderSide {
  BUY: 'BUY';
  SELL: 'SELL';
}

export interface OrderType {
  LIMIT: 'LIMIT';
  MARKET: 'MARKET';
  STOP_LOSS: 'STOP_LOSS';
  STOP_LOSS_LIMIT: 'STOP_LOSS_LIMIT';
  TAKE_PROFIT: 'TAKE_PROFIT';
  TAKE_PROFIT_LIMIT: 'TAKE_PROFIT_LIMIT';
  LIMIT_MAKER: 'LIMIT_MAKER';
}

export interface OrderStatus {
  NEW: 'NEW';
  PARTIALLY_FILLED: 'PARTIALLY_FILLED';
  FILLED: 'FILLED';
  CANCELED: 'CANCELED';
  PENDING_CANCEL: 'PENDING_CANCEL';
  REJECTED: 'REJECTED';
  EXPIRED: 'EXPIRED';
  EXPIRED_IN_MATCH: 'EXPIRED_IN_MATCH';
}

export interface Order {
  symbol: string;
  orderId: number;
  orderListId: number;
  clientOrderId: string;
  price: string;
  origQty: string;
  executedQty: string;
  cummulativeQuoteQty: string;
  status: keyof OrderStatus;
  timeInForce: string;
  type: keyof OrderType;
  side: keyof OrderSide;
  stopPrice: string;
  icebergQty: string;
  time: number;
  updateTime: number;
  isWorking: boolean;
  workingTime: number;
  origQuoteOrderQty: string;
  strategyId?: number;
  strategyType?: number;
  trailingDelta?: number;
  trailingTime?: number;
  selfTradePreventionMode: string;
}

// ===== TRADES =====
export interface Trade {
  id: number;
  orderId: number;
  orderListId: number;
  price: string;
  qty: string;
  quoteQty: string;
  commission: string;
  commissionAsset: string;
  time: number;
  isBuyer: boolean;
  isMaker: boolean;
  isBestMatch: boolean;
}

// ===== HISTÓRICO DE TRADES =====
export interface MyTrade {
  symbol: string;
  id: number;
  orderId: number;
  orderListId: number;
  price: string;
  qty: string;
  quoteQty: string;
  commission: string;
  commissionAsset: string;
  time: number;
  isBuyer: boolean;
  isMaker: boolean;
  isBestMatch: boolean;
}

// ===== DEPÓSITOS E SAQUES =====
export interface DepositHistory {
  id: string;
  amount: string;
  coin: string;
  network: string;
  status: number;
  address: string;
  addressTag: string;
  txId: string;
  insertTime: number;
  transferType: number;
  unlockConfirm: string;
  confirmTimes: string;
}

export interface WithdrawHistory {
  id: string;
  amount: string;
  transactionFee: string;
  coin: string;
  status: number;
  address: string;
  addressTag: string;
  txId: string;
  applyTime: number;
  network: string;
  transferType: number;
  withdrawOrderId: string;
  info: string;
  confirmNo: number;
  walletType: number;
  txKey: string;
  completeTime: number;
}

// ===== ESTRUTURA PARA RP-FINANCES =====
export interface BinancePortfolioAsset {
  symbol: string;
  asset: string;
  free: number;
  locked: number;
  total: number;
  usdValue: number;
  btcValue: number;
  price: number;
  priceChangePercent: number;
  allocation: number; // % do portfolio
}

export interface BinancePortfolioSummary {
  totalUsdValue: number;
  totalBtcValue: number;
  assets: BinancePortfolioAsset[];
  topGainers: BinancePortfolioAsset[];
  topLosers: BinancePortfolioAsset[];
  lastUpdate: number;
}

// ===== FILTROS DE REQUISIÇÃO =====
export interface GetAccountOptions {
  recvWindow?: number;
  timestamp?: number;
}

export interface GetMyTradesOptions {
  symbol: string;
  orderId?: number;
  startTime?: number;
  endTime?: number;
  fromId?: number;
  limit?: number;
  recvWindow?: number;
  timestamp?: number;
}

export interface GetDepositHistoryOptions {
  coin?: string;
  status?: number;
  startTime?: number;
  endTime?: number;
  offset?: number;
  limit?: number;
  recvWindow?: number;
  timestamp?: number;
}

export interface GetWithdrawHistoryOptions {
  coin?: string;
  withdrawOrderId?: string;
  status?: number;
  startTime?: number;
  endTime?: number;
  offset?: number;
  limit?: number;
  recvWindow?: number;
  timestamp?: number;
}

// ===== RESPOSTAS DE ERRO =====
export interface BinanceError {
  code: number;
  msg: string;
}

// ===== TIPOS PARA CÁLCULO DE PREÇO MÉDIO =====
export interface BinanceTransaction {
  symbol: string;
  type: 'BUY' | 'SELL' | 'DEPOSIT' | 'WITHDRAW';
  quantity: number;
  price: number;
  amount: number;
  date: string;
  id: string;
  source: 'TRADE' | 'DEPOSIT' | 'WITHDRAW' | 'CONVERT' | 'P2P' | 'FIAT';
}

export interface BinanceAveragePriceCalculation {
  symbol: string;
  asset: string;
  averagePrice: number;
  totalInvested: number;
  totalQuantity: number;
  currentPrice: number;
  currentValue: number;
  profit: number;
  profitPercentage: number;
  transactionCount: number;
  transactions: BinanceTransaction[];
}
