/**
 * Gerenciador de Estado Persistente
 * Responsável por salvar e recuperar o estado das conexões
 */

export interface ConnectionState {
  pluggyConnected: boolean;
  binanceConnected: boolean;
  pluggyItemIds: string[];
  lastUpdate: number;
  investments: any[];
}

export class StateManager {
  private static readonly STORAGE_KEY = 'rp-finances-state';
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  /**
   * Salva o estado atual no localStorage
   */
  static saveState(state: Partial<ConnectionState>): void {
    try {
      const currentState = this.loadState();
      const newState: ConnectionState = {
        ...currentState,
        ...state,
        lastUpdate: Date.now()
      };
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newState));
      console.log('💾 Estado salvo:', newState);
    } catch (error) {
      console.error('❌ Erro ao salvar estado:', error);
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
      
      // Verifica se o cache não expirou
      const isExpired = Date.now() - state.lastUpdate > this.CACHE_DURATION;
      if (isExpired) {
        console.log('🕐 Cache expirado, limpando estado');
        this.clearState();
        return this.getDefaultState();
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
}
