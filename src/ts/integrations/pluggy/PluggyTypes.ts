/**
 * Tipos TypeScript para integração com API Pluggy
 * Baseado na documentação oficial: https://docs.pluggy.ai/
 */

// ===== CONFIGURAÇÃO =====
export interface PluggyConfig {
  clientId: string;
  clientSecret: string;
  baseUrl: string;
  sandbox?: boolean;
}

// ===== AUTENTICAÇÃO =====
export interface ApiKeyResponse {
  apiKey: string;
  expiresAt: string;
}

export interface ConnectTokenResponse {
  accessToken: string;
  expiresIn: number;
}

// ===== ITEM (CONEXÃO BANCÁRIA) =====
export interface Item {
  id: string;
  connector: {
    id: number;
    name: string;
  };
  status: 'UPDATED' | 'UPDATING' | 'WAITING_USER_INPUT' | 'LOGIN_ERROR';
  executionStatus: 'SUCCESS' | 'ERROR' | 'PARTIAL_SUCCESS';
  createdAt: string;
  updatedAt: string;
  clientUserId?: string;
}

// ===== CONTA =====
export interface Account {
  id: string;
  type: 'BANK' | 'CREDIT';
  subtype: 'CHECKING_ACCOUNT' | 'SAVINGS_ACCOUNT' | 'CREDIT_CARD' | 'INVESTMENT';
  number: string;
  name: string;
  balance: number;
  currencyCode: string;
  owner?: string;
  itemId: string;
  bankData?: BankData;
  creditData?: CreditData;
}

export interface BankData {
  transferNumber: string;
  closingBalance: number;
  automaticallyInvestedBalance?: number;
}

export interface CreditData {
  availableCreditLimit: number;
  creditLimit: number;
  minimumPayment: number;
  balanceDueDate: string;
}

// ===== INVESTIMENTO =====
export interface Investment {
  id: string;
  name: string;
  code?: string;
  number?: string;
  type: InvestmentType;
  subtype: InvestmentSubtype;
  balance: number;
  currencyCode: string;
  owner?: string;
  itemId: string;
  
  // Valores e quantidades
  value: number;           // Valor da cota
  quantity: number;        // Quantidade de cotas
  amount: number;          // Valor bruto investido
  
  // Performance
  annualRate?: number;     // Taxa anual
  lastMonthRate?: number;  // Taxa do último mês
  lastTwelveMonthsRate?: number; // Taxa dos últimos 12 meses
  rate?: number;           // Taxa fixa
  rateType?: string;       // Tipo da taxa (CDI, IPCA, etc)
  
  // Datas
  date: string;            // Data de referência
  dueDate?: string;        // Vencimento
  
  // Financeiro
  taxes?: number;          // IR
  taxes2?: number;         // IOF
  amountProfit?: number;   // Lucro/prejuízo
  amountOriginal?: number; // Valor original
  
  // Status e instituição
  status: 'ACTIVE' | 'PENDING' | 'TOTAL_WITHDRAWAL';
  institution?: {
    name: string;
    number: string;
  };
}

// ===== TIPOS DE INVESTIMENTO =====
export type InvestmentType = 
  | 'FIXED_INCOME'    // Renda Fixa
  | 'EQUITY'          // Ações
  | 'MUTUAL_FUND'     // Fundos
  | 'SECURITY'        // Previdência
  | 'ETF'             // ETFs
  | 'COE';            // COE

export type InvestmentSubtype = 
  // Renda Fixa
  | 'CDB' | 'LCI' | 'LCA' | 'TREASURY' | 'DEBENTURES' | 'LC'
  // Ações
  | 'STOCK' | 'BDR' | 'REAL_ESTATE_FUND'
  // Fundos
  | 'INVESTMENT_FUND' | 'STOCK_FUND' | 'MULTIMARKET_FUND'
  // Previdência
  | 'RETIREMENT' | 'PGBL' | 'VGBL'
  // ETF
  | 'ETF'
  // COE
  | 'STRUCTURED_NOTE';

// ===== RESPOSTA DA API =====
export interface InvestmentListResponse {
  total: number;
  totalPages: number;
  page: number;
  results: Investment[];
}

export interface AccountListResponse {
  total: number;
  totalPages: number;
  page: number;
  results: Account[];
}

// ===== ERROS =====
export interface PluggyError {
  message: string;
  code?: string;
  details?: any;
}

// ===== TRANSAÇÕES DE INVESTIMENTO =====
export interface InvestmentTransaction {
  id?: string;
  type: 'BUY' | 'SELL' | 'TAX' | 'TRANSFER' | 'DIVIDEND';
  date: string;
  tradeDate?: string;
  quantity: number;
  value: number;           // Preço unitário
  amount: number;          // Valor total da operação
  description?: string;
  brokerageNumber?: string;
  netAmount?: number;
  agreedRate?: number;
  expenses?: {
    serviceTax?: number;
    brokerageFee?: number;
    incomeTax?: number;
    other?: number;
    tradingAssetsNoticeFee?: number;
    maintenanceFee?: number;
    settlementFee?: number;
    clearingFee?: number;
    stockExchangeFee?: number;
    custodyFee?: number;
    operatingFee?: number;
  };
}

export interface InvestmentTransactionListResponse {
  total: number;
  totalPages: number;
  page: number;
  results: InvestmentTransaction[];
}

// ===== CÁLCULO DE PREÇO MÉDIO =====
export interface AveragePriceCalculation {
  stockCode: string;
  stockName: string;
  averagePrice: number;
  totalQuantity: number;
  totalInvested: number;
  currentPrice: number;
  currentValue: number;
  gainLoss: number;
  gainLossPercent: number;
  transactions: InvestmentTransaction[];
  lastUpdated: string;
}

// ===== RESUMO DO PORTFOLIO =====
export interface PortfolioSummary {
  totalBalance: number;
  totalInvestments: number;
  totalProfit: number;
  profitPercentage: number;
  totalTaxes: number;
  averageAnnualRate: number;
  
  byType: {
    [key in InvestmentType]?: {
      count: number;
      balance: number;
      percentage: number;
      profit: number;
      profitPercentage: number;
    };
  };
  
  accounts: Account[];
  investments: Investment[];
  lastUpdated: string;
}
