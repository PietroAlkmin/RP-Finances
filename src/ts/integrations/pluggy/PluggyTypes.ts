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

// ===== RESUMO DO PORTFOLIO =====
export interface PortfolioSummary {
  totalBalance: number;
  totalInvestments: number;
  totalProfit: number;
  profitPercentage: number;
  
  byType: {
    [key in InvestmentType]?: {
      count: number;
      balance: number;
      percentage: number;
    };
  };
  
  accounts: Account[];
  investments: Investment[];
  lastUpdated: string;
}
