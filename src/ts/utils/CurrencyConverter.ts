/**
 * Serviço de conversão de moedas
 * Converte valores entre diferentes moedas usando taxas de câmbio atuais
 */

export interface ExchangeRate {
  base: string;
  target: string;
  rate: number;
  timestamp: number;
}

export class CurrencyConverter {
  private static instance: CurrencyConverter;
  private exchangeRates: Map<string, ExchangeRate> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  private constructor() {}

  static getInstance(): CurrencyConverter {
    if (!CurrencyConverter.instance) {
      CurrencyConverter.instance = new CurrencyConverter();
    }
    return CurrencyConverter.instance;
  }

  /**
   * Converte valor de uma moeda para outra
   */
  async convert(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    const rate = await this.getExchangeRate(fromCurrency, toCurrency);
    return amount * rate;
  }

  /**
   * Obtém taxa de câmbio entre duas moedas
   */
  private async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
    const cacheKey = `${fromCurrency}_${toCurrency}`;
    const cached = this.exchangeRates.get(cacheKey);

    // Verifica se tem cache válido
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      return cached.rate;
    }

    try {
      // Tenta obter taxa de câmbio de uma API gratuita
      const rate = await this.fetchExchangeRate(fromCurrency, toCurrency);
      
      // Cache da taxa
      this.exchangeRates.set(cacheKey, {
        base: fromCurrency,
        target: toCurrency,
        rate,
        timestamp: Date.now()
      });

      return rate;

    } catch (error) {
      console.warn(`⚠️ Erro ao obter taxa de câmbio ${fromCurrency}→${toCurrency}:`, error);
      
      // Fallback: usar taxa aproximada conhecida
      return this.getFallbackRate(fromCurrency, toCurrency);
    }
  }

  /**
   * Busca taxa de câmbio em API externa
   */
  private async fetchExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
    // Usando API gratuita do exchangerate-api.com
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const rate = data.rates[toCurrency];

    if (!rate) {
      throw new Error(`Taxa para ${toCurrency} não encontrada`);
    }

    console.log(`💱 Taxa ${fromCurrency}→${toCurrency}: ${rate}`);
    return rate;
  }

  /**
   * Retorna taxa de câmbio aproximada como fallback
   */
  private getFallbackRate(fromCurrency: string, toCurrency: string): number {
    // Taxas aproximadas conhecidas (atualizadas periodicamente)
    const fallbackRates: Record<string, Record<string, number>> = {
      'USD': {
        'BRL': 5.50, // Dólar para Real (aproximado)
        'EUR': 0.85,
        'GBP': 0.73
      },
      'BRL': {
        'USD': 0.18, // Real para Dólar (aproximado)
        'EUR': 0.15,
        'GBP': 0.13
      },
      'EUR': {
        'USD': 1.18,
        'BRL': 6.50,
        'GBP': 0.86
      }
    };

    const rate = fallbackRates[fromCurrency]?.[toCurrency];
    
    if (rate) {
      console.log(`💰 Usando taxa fallback ${fromCurrency}→${toCurrency}: ${rate}`);
      return rate;
    }

    // Se não tem fallback, assume 1:1 (não é ideal, mas evita crash)
    console.warn(`⚠️ Taxa não encontrada ${fromCurrency}→${toCurrency}, usando 1:1`);
    return 1;
  }

  /**
   * Formata valor monetário para exibição
   */
  formatCurrency(amount: number, currency: string, locale: string = 'pt-BR'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Limpa cache de taxas de câmbio
   */
  clearCache(): void {
    this.exchangeRates.clear();
    console.log('💱 Cache de taxas de câmbio limpo');
  }
}

// Instância singleton
export const currencyConverter = CurrencyConverter.getInstance();
