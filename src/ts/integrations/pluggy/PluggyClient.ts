/**
 * Cliente principal para integração com API Pluggy
 * Responsável por autenticação e comunicação com os endpoints
 */

import type { 
  PluggyConfig, 
  ApiKeyResponse, 
  ConnectTokenResponse,
  Investment,
  Account,
  InvestmentListResponse,
  AccountListResponse
} from './PluggyTypes.js';

export class PluggyClient {
  private config: PluggyConfig;
  private apiKey: string | null = null;
  private apiKeyExpiration: Date | null = null;

  constructor(config: PluggyConfig) {
    this.config = {
      ...config,
      baseUrl: config.baseUrl || 'https://api.pluggy.ai'
    };
  }

  /**
   * Autentica com a API Pluggy e obtém API Key
   * Válido por 2 horas conforme documentação
   */
  async authenticate(): Promise<string> {
    // Verifica se já temos uma API Key válida
    if (this.apiKey && this.apiKeyExpiration && new Date() < this.apiKeyExpiration) {
      console.log('💫 Usando API Key em cache');
      return this.apiKey;
    }

    console.log('🔐 Obtendo nova API Key da Pluggy...');

    try {
      const response = await fetch(`${this.config.baseUrl}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: this.config.clientId,
          clientSecret: this.config.clientSecret,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro na autenticação: ${response.status} ${response.statusText}`);
      }

      const data: ApiKeyResponse = await response.json();
      
      // Cache da API Key (expira em 2 horas)
      this.apiKey = data.apiKey;
      this.apiKeyExpiration = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 horas

      console.log('✅ API Key obtida com sucesso');
      return this.apiKey;

    } catch (error) {
      console.error('❌ Erro ao obter API Key:', error);
      throw new Error(`Falha na autenticação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Cria um Connect Token para frontend (válido por 30 minutos)
   */
  async createConnectToken(clientUserId?: string): Promise<ConnectTokenResponse> {
    const apiKey = await this.authenticate();

    console.log('🎫 Criando Connect Token...');

    try {
      const response = await fetch(`${this.config.baseUrl}/connect_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': apiKey,
        },
        body: JSON.stringify({
          clientUserId: clientUserId || `user-${Date.now()}`,
          options: {
            includeSandbox: this.config.sandbox || false,
            showAllConnectors: true,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro ao criar Connect Token: ${response.status}`);
      }

      const data: ConnectTokenResponse = await response.json();
      console.log('✅ Connect Token criado');
      return data;

    } catch (error) {
      console.error('❌ Erro ao criar Connect Token:', error);
      throw error;
    }
  }

  /**
   * Busca todas as contas de um item (conexão bancária)
   */
  async getAccounts(itemId: string): Promise<Account[]> {
    const apiKey = await this.authenticate();

    console.log(`📊 Buscando contas do item ${itemId}...`);

    try {
      const response = await fetch(`${this.config.baseUrl}/accounts?itemId=${itemId}`, {
        headers: {
          'X-API-KEY': apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar contas: ${response.status}`);
      }

      const data: AccountListResponse = await response.json();
      console.log(`✅ Encontradas ${data.results.length} contas`);
      return data.results;

    } catch (error) {
      console.error('❌ Erro ao buscar contas:', error);
      throw error;
    }
  }

  /**
   * Busca todos os investimentos de um item
   * FUNCIONALIDADE PRINCIPAL - Coleta de investimentos
   */
  async getInvestments(itemId: string): Promise<Investment[]> {
    const apiKey = await this.authenticate();

    console.log(`💰 Buscando investimentos do item ${itemId}...`);

    try {
      const response = await fetch(`${this.config.baseUrl}/investments?itemId=${itemId}`, {
        headers: {
          'X-API-KEY': apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar investimentos: ${response.status}`);
      }

      const data: InvestmentListResponse = await response.json();
      console.log(`✅ Encontrados ${data.results.length} investimentos`);
      
      // Log detalhado dos investimentos encontrados
      data.results.forEach((investment, index) => {
        console.log(`  ${index + 1}. ${investment.name} (${investment.type}): R$ ${investment.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
      });

      return data.results;

    } catch (error) {
      console.error('❌ Erro ao buscar investimentos:', error);
      throw error;
    }
  }

  /**
   * Busca TODOS os investimentos de TODOS os itens conectados
   * Função principal para consolidar portfolio completo
   */
  async getAllInvestments(itemIds: string[]): Promise<Investment[]> {
    console.log(`🎯 Coletando investimentos de ${itemIds.length} conexões...`);

    const allInvestments: Investment[] = [];

    for (const itemId of itemIds) {
      try {
        const investments = await this.getInvestments(itemId);
        allInvestments.push(...investments);
      } catch (error) {
        console.warn(`⚠️ Erro ao buscar investimentos do item ${itemId}:`, error);
        // Continua com os outros itens mesmo se um falhar
      }
    }

    console.log(`🎉 Total de investimentos coletados: ${allInvestments.length}`);
    
    // Calcula valor total
    const totalValue = allInvestments.reduce((sum, inv) => sum + inv.balance, 0);
    console.log(`💎 Valor total em investimentos: R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);

    return allInvestments;
  }
}
