/**
 * Gerenciador de Estado Persistente
 * Responsável por salvar e recuperar o estado das conexões
 */

export interface ConnectionState {
  pluggyConnected: boolean;
  binanceConnected: boolean;
  pluggyItemIds: string[];
  lastUpdate: number;
  connectionsLastUpdate: number; // Separamos a data das conexões dos dados temporários
  investments: any[];
}

export class StateManager {
  private static readonly STORAGE_KEY = 'rp-finances-state';
  private static readonly CONNECTION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 dias - conexões persistem por uma semana
  private static readonly DATA_CACHE_DURATION = 30 * 60 * 1000; // 30 minutos - dados dos investimentos

  /**
   * Salva o estado atual no localStorage
   */
  static saveState(state: Partial<ConnectionState>): void {
    try {
      const currentState = this.loadStateRaw(); // Novo método para evitar recursão
      const now = Date.now();
      
      // Se estamos salvando conexões, atualiza o timestamp de conexões
      const isUpdatingConnections = state.pluggyConnected !== undefined || 
        state.binanceConnected !== undefined || 
        state.pluggyItemIds !== undefined;
      
      const newState: ConnectionState = {
        ...currentState,
        ...state,
        lastUpdate: now,
        connectionsLastUpdate: isUpdatingConnections ? now : currentState.connectionsLastUpdate
      };
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newState));
      console.log('💾 Estado salvo:', newState);
    } catch (error) {
      console.error('❌ Erro ao salvar estado:', error);
    }
  }

  /**
   * Carrega estado sem verificação de expiração (para uso interno)
   */
  private static loadStateRaw(): ConnectionState {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        return this.getDefaultState();
      }
      return JSON.parse(stored);
    } catch (error) {
      console.error('❌ Erro ao carregar estado raw:', error);
      return this.getDefaultState();
    }
  }

  /**
   * Carrega o estado do localStorage
   */
  static loadState(): ConnectionState {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        return this.getDefaultState();
      }

      const state: ConnectionState = JSON.parse(stored);
      const now = Date.now();
      
      // Verifica se as CONEXÕES expiraram (7 dias)
      const connectionsExpired = state.connectionsLastUpdate > 0 && 
        (now - state.connectionsLastUpdate) > this.CONNECTION_DURATION;
      
      // Verifica se os DADOS expiraram (30 minutos)
      const dataExpired = state.lastUpdate > 0 && 
        (now - state.lastUpdate) > this.DATA_CACHE_DURATION;
      
      if (connectionsExpired) {
        console.log('🕐 Conexões expiraram (7 dias), limpando estado completo');
        this.clearState();
        return this.getDefaultState();
      }
      
      if (dataExpired) {
        console.log('🕐 Cache de dados expirado (30 min), mantendo conexões mas limpando investimentos');
        // Mantém conexões mas limpa dados temporários
        const cleanState = {
          ...state,
          investments: [],
          lastUpdate: 0
        };
        this.saveState(cleanState);
        return cleanState;
      }

      console.log('📂 Estado carregado:', state);
      return state;
    } catch (error) {
      console.error('❌ Erro ao carregar estado:', error);
      return this.getDefaultState();
    }
  }

  /**
   * Limpa o estado persistente
   */
  static clearState(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('🗑️ Estado limpo');
    } catch (error) {
      console.error('❌ Erro ao limpar estado:', error);
    }
  }

  /**
   * Atualiza apenas as conexões
   */
  static updateConnections(pluggyConnected: boolean, binanceConnected: boolean, pluggyItemIds: string[] = []): void {
    this.saveState({
      pluggyConnected,
      binanceConnected,
      pluggyItemIds
    });
  }

  /**
   * Atualiza os investimentos no cache
   */
  static updateInvestments(investments: any[]): void {
    this.saveState({
      investments
    });
  }

  /**
   * Verifica se há conexões ativas
   */
  static hasActiveConnections(): boolean {
    const state = this.loadState();
    return state.pluggyConnected || state.binanceConnected;
  }

  /**
   * Estado padrão
   */
  private static getDefaultState(): ConnectionState {
    return {
      pluggyConnected: false,
      binanceConnected: false,
      pluggyItemIds: [],
      lastUpdate: 0,
      connectionsLastUpdate: 0,
      investments: []
    };
  }

  /**
   * Adiciona item Pluggy conectado
   */
  static addPluggyItem(itemId: string): void {
    const state = this.loadState();
    if (!state.pluggyItemIds.includes(itemId)) {
      state.pluggyItemIds.push(itemId);
      this.saveState({
        pluggyConnected: true,
        pluggyItemIds: state.pluggyItemIds
      });
    }
  }

  /**
   * Remove item Pluggy
   */
  static removePluggyItem(itemId: string): void {
    const state = this.loadState();
    const filteredItems = state.pluggyItemIds.filter(id => id !== itemId);
    this.saveState({
      pluggyConnected: filteredItems.length > 0,
      pluggyItemIds: filteredItems
    });
  }

  /**
   * Marca Binance como conectado
   */
  static setBinanceConnected(connected: boolean): void {
    this.saveState({
      binanceConnected: connected
    });
  }

  /**
   * Obtém informações de debug sobre o estado atual
   */
  static getDebugInfo(): { 
    hasConnections: boolean; 
    connectionsAge: string; 
    dataAge: string; 
    state: ConnectionState 
  } {
    const state = this.loadStateRaw();
    const now = Date.now();
    
    const connectionsAge = state.connectionsLastUpdate > 0 
      ? `${Math.round((now - state.connectionsLastUpdate) / (1000 * 60))} min atrás`
      : 'nunca';
      
    const dataAge = state.lastUpdate > 0 
      ? `${Math.round((now - state.lastUpdate) / (1000 * 60))} min atrás`
      : 'nunca';
    
    return {
      hasConnections: state.pluggyConnected || state.binanceConnected,
      connectionsAge,
      dataAge,
      state
    };
  }
}
