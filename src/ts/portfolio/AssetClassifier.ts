/**
 * Sistema Avançado de Classificação de Ativos
 * Classifica investimentos em categorias e subcategorias detalhadas
 * Baseado nas melhores práticas de gestão de portfolio
 */

export interface AssetCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  subcategories: AssetSubcategory[];
}

export interface AssetSubcategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  riskLevel: 'Conservador' | 'Moderado' | 'Arrojado';
  liquidityLevel: 'Alta' | 'Média' | 'Baixa';
  minimumTerm: string;
  typicalReturn: string;
}

export interface ClassifiedAsset {
  id: string;
  name: string;
  balance: number;
  category: AssetCategory;
  subcategory: AssetSubcategory;
  weight: number; // Percentual do portfolio
  performance: {
    currentValue: number;
    cost: number;
    profit: number;
    profitPercentage: number;
    annualReturn?: number;
  };
  metadata: {
    institution: string;
    lastUpdate: Date;
    currency: string;
  };
}

export interface PortfolioClassification {
  totalValue: number;
  assetCount: number;
  categories: CategorySummary[];
  riskProfile: RiskProfile;
  diversificationScore: number;
  insights: PortfolioInsight[];
}

export interface CategorySummary {
  category: AssetCategory;
  totalValue: number;
  assetCount: number;
  weight: number;
  performance: {
    totalProfit: number;
    averageReturn: number;
    bestPerformer: ClassifiedAsset;
    worstPerformer: ClassifiedAsset;
  };
  subcategories: SubcategorySummary[];
}

export interface SubcategorySummary {
  subcategory: AssetSubcategory;
  totalValue: number;
  assetCount: number;
  weight: number;
  averageReturn: number;
}

export interface RiskProfile {
  level: 'Conservador' | 'Moderado' | 'Arrojado' | 'Agressivo';
  score: number; // 0-100
  breakdown: {
    conservative: number;
    moderate: number;
    aggressive: number;
  };
  recommendation: string;
}

export interface PortfolioInsight {
  type: 'warning' | 'opportunity' | 'success' | 'info';
  category: string;
  title: string;
  description: string;
  action?: string;
  impact: 'Alto' | 'Médio' | 'Baixo';
}

export class AssetClassifier {
  private categories: AssetCategory[] = [
    {
      id: 'renda-fixa',
      name: 'Renda Fixa',
      description: 'Investimentos com rentabilidade previsível',
      icon: '💎',
      color: '#3B82F6', // blue-500
      subcategories: [
        {
          id: 'cdb',
          name: 'CDB',
          description: 'Certificado de Depósito Bancário',
          icon: '🏦',
          riskLevel: 'Conservador',
          liquidityLevel: 'Média',
          minimumTerm: '30 dias - 5 anos',
          typicalReturn: '90% - 120% CDI'
        },
        {
          id: 'lci-lca',
          name: 'LCI/LCA',
          description: 'Letras de Crédito Imobiliário/Agronegócio',
          icon: '🏠',
          riskLevel: 'Conservador',
          liquidityLevel: 'Baixa',
          minimumTerm: '90 dias - 3 anos',
          typicalReturn: '85% - 100% CDI'
        },
        {
          id: 'tesouro',
          name: 'Tesouro Direto',
          description: 'Títulos públicos do governo federal',
          icon: '🏛️',
          riskLevel: 'Conservador',
          liquidityLevel: 'Alta',
          minimumTerm: '1 mês - 35 anos',
          typicalReturn: '100% CDI + prêmio'
        },
        {
          id: 'debentures',
          name: 'Debêntures',
          description: 'Títulos de dívida corporativa',
          icon: '🏢',
          riskLevel: 'Moderado',
          liquidityLevel: 'Média',
          minimumTerm: '1 - 10 anos',
          typicalReturn: 'CDI + 1% - 5%'
        }
      ]
    },
    {
      id: 'renda-variavel',
      name: 'Renda Variável',
      description: 'Investimentos com rentabilidade variável',
      icon: '📈',
      color: '#10B981', // green-500
      subcategories: [
        {
          id: 'acoes-nacionais',
          name: 'Ações Nacionais',
          description: 'Ações de empresas brasileiras',
          icon: '🇧🇷',
          riskLevel: 'Arrojado',
          liquidityLevel: 'Alta',
          minimumTerm: '3+ anos',
          typicalReturn: '8% - 15% a.a.'
        },
        {
          id: 'bdrs',
          name: 'BDRs',
          description: 'Brazilian Depositary Receipts',
          icon: '🌎',
          riskLevel: 'Arrojado',
          liquidityLevel: 'Alta',
          minimumTerm: '3+ anos',
          typicalReturn: '5% - 12% a.a.'
        },
        {
          id: 'fiis',
          name: 'FIIs',
          description: 'Fundos de Investimento Imobiliário',
          icon: '🏢',
          riskLevel: 'Moderado',
          liquidityLevel: 'Alta',
          minimumTerm: '2+ anos',
          typicalReturn: '6% - 12% a.a.'
        },
        {
          id: 'etfs',
          name: 'ETFs',
          description: 'Exchange Traded Funds',
          icon: '📊',
          riskLevel: 'Moderado',
          liquidityLevel: 'Alta',
          minimumTerm: '2+ anos',
          typicalReturn: '6% - 14% a.a.'
        }
      ]
    },
    {
      id: 'fundos',
      name: 'Fundos de Investimento',
      description: 'Investimentos coletivos geridos profissionalmente',
      icon: '🎯',
      color: '#8B5CF6', // purple-500
      subcategories: [
        {
          id: 'multimercado',
          name: 'Multimercado',
          description: 'Fundos com estratégias diversificadas',
          icon: '🔄',
          riskLevel: 'Moderado',
          liquidityLevel: 'Média',
          minimumTerm: '1+ anos',
          typicalReturn: 'CDI + 2% - 8%'
        },
        {
          id: 'acoes-fundos',
          name: 'Fundos de Ações',
          description: 'Fundos focados em renda variável',
          icon: '📈',
          riskLevel: 'Arrojado',
          liquidityLevel: 'Média',
          minimumTerm: '3+ anos',
          typicalReturn: '8% - 20% a.a.'
        },
        {
          id: 'renda-fixa-fundos',
          name: 'Fundos de Renda Fixa',
          description: 'Fundos focados em títulos de renda fixa',
          icon: '💰',
          riskLevel: 'Conservador',
          liquidityLevel: 'Alta',
          minimumTerm: '6 meses+',
          typicalReturn: '90% - 110% CDI'
        }
      ]
    },
    {
      id: 'criptomoedas',
      name: 'Criptomoedas',
      description: 'Ativos digitais descentralizados',
      icon: '₿',
      color: '#F59E0B', // yellow-500
      subcategories: [
        {
          id: 'bitcoin',
          name: 'Bitcoin',
          description: 'Primeira e maior criptomoeda',
          icon: '₿',
          riskLevel: 'Arrojado',
          liquidityLevel: 'Alta',
          minimumTerm: '2+ anos',
          typicalReturn: 'Altamente volátil'
        },
        {
          id: 'altcoins',
          name: 'Altcoins',
          description: 'Criptomoedas alternativas',
          icon: '🪙',
          riskLevel: 'Arrojado',
          liquidityLevel: 'Média',
          minimumTerm: '1+ anos',
          typicalReturn: 'Extremamente volátil'
        },
        {
          id: 'stablecoins',
          name: 'Stablecoins',
          description: 'Criptomoedas atreladas a moedas fiduciárias',
          icon: '🔒',
          riskLevel: 'Conservador',
          liquidityLevel: 'Alta',
          minimumTerm: 'Sem prazo mínimo',
          typicalReturn: '2% - 8% a.a.'
        }
      ]
    },
    {
      id: 'previdencia',
      name: 'Previdência',
      description: 'Investimentos para aposentadoria',
      icon: '🎯',
      color: '#EC4899', // pink-500
      subcategories: [
        {
          id: 'pgbl',
          name: 'PGBL',
          description: 'Plano Gerador de Benefício Livre',
          icon: '📋',
          riskLevel: 'Moderado',
          liquidityLevel: 'Baixa',
          minimumTerm: '10+ anos',
          typicalReturn: '4% - 10% a.a.'
        },
        {
          id: 'vgbl',
          name: 'VGBL',
          description: 'Vida Gerador de Benefício Livre',
          icon: '📄',
          riskLevel: 'Moderado',
          liquidityLevel: 'Baixa',
          minimumTerm: '10+ anos',
          typicalReturn: '4% - 10% a.a.'
        }
      ]
    },
    {
      id: 'outros',
      name: 'Outros',
      description: 'Demais investimentos e aplicações',
      icon: '📦',
      color: '#6B7280', // gray-500
      subcategories: [
        {
          id: 'poupanca',
          name: 'Poupança',
          description: 'Caderneta de poupança tradicional',
          icon: '🐷',
          riskLevel: 'Conservador',
          liquidityLevel: 'Alta',
          minimumTerm: 'Sem prazo mínimo',
          typicalReturn: '70% SELIC'
        },
        {
          id: 'commodities',
          name: 'Commodities',
          description: 'Investimentos em matérias-primas',
          icon: '🌾',
          riskLevel: 'Arrojado',
          liquidityLevel: 'Média',
          minimumTerm: '1+ anos',
          typicalReturn: 'Variável'
        }
      ]
    }
  ];

  /**
   * Classifica um investimento baseado em seu tipo e nome
   */
  classifyAsset(investment: any): { category: AssetCategory; subcategory: AssetSubcategory } {
    const type = investment.type?.toLowerCase() || '';
    const name = investment.name?.toLowerCase() || '';
    const code = investment.code?.toLowerCase() || '';

    // Renda Fixa
    if (type.includes('cdb') || name.includes('cdb')) {
      return {
        category: this.categories[0],
        subcategory: this.categories[0].subcategories[0] // CDB
      };
    }

    if (type.includes('lci') || type.includes('lca') || name.includes('lci') || name.includes('lca')) {
      return {
        category: this.categories[0],
        subcategory: this.categories[0].subcategories[1] // LCI/LCA
      };
    }

    if (type.includes('tesouro') || name.includes('tesouro') || name.includes('selic') || name.includes('ipca')) {
      return {
        category: this.categories[0],
        subcategory: this.categories[0].subcategories[2] // Tesouro
      };
    }

    if (type.includes('debenture') || name.includes('debenture')) {
      return {
        category: this.categories[0],
        subcategory: this.categories[0].subcategories[3] // Debêntures
      };
    }

    // Renda Variável
    if (type.includes('stock') || type.includes('acao') || type.includes('ações')) {
      return {
        category: this.categories[1],
        subcategory: this.categories[1].subcategories[0] // Ações
      };
    }

    if (type.includes('bdr') || name.includes('bdr') || code?.match(/\d{2}$/)) {
      return {
        category: this.categories[1],
        subcategory: this.categories[1].subcategories[1] // BDRs
      };
    }

    if (type.includes('fii') || type.includes('real_estate') || name.includes('fii')) {
      return {
        category: this.categories[1],
        subcategory: this.categories[1].subcategories[2] // FIIs
      };
    }

    if (type.includes('etf') || name.includes('etf')) {
      return {
        category: this.categories[1],
        subcategory: this.categories[1].subcategories[3] // ETFs
      };
    }

    // Fundos
    if (type.includes('fund') || type.includes('fundo')) {
      if (name.includes('multimercado')) {
        return {
          category: this.categories[2],
          subcategory: this.categories[2].subcategories[0] // Multimercado
        };
      }
      if (name.includes('ações') || name.includes('acoes')) {
        return {
          category: this.categories[2],
          subcategory: this.categories[2].subcategories[1] // Fundos de Ações
        };
      }
      return {
        category: this.categories[2],
        subcategory: this.categories[2].subcategories[2] // Fundos RF (padrão)
      };
    }

    // Criptomoedas
    if (type.includes('crypto') || type.includes('cryptocurrency')) {
      if (name.includes('btc') || name.includes('bitcoin')) {
        return {
          category: this.categories[3],
          subcategory: this.categories[3].subcategories[0] // Bitcoin
        };
      }
      if (name.includes('usdt') || name.includes('usdc') || name.includes('busd')) {
        return {
          category: this.categories[3],
          subcategory: this.categories[3].subcategories[2] // Stablecoins
        };
      }
      return {
        category: this.categories[3],
        subcategory: this.categories[3].subcategories[1] // Altcoins
      };
    }

    // Previdência
    if (type.includes('pension') || type.includes('previdencia') || name.includes('pgbl') || name.includes('vgbl')) {
      if (name.includes('pgbl')) {
        return {
          category: this.categories[4],
          subcategory: this.categories[4].subcategories[0] // PGBL
        };
      }
      return {
        category: this.categories[4],
        subcategory: this.categories[4].subcategories[1] // VGBL
      };
    }

    // Poupança
    if (type.includes('savings') || type.includes('poupanca') || name.includes('poupança')) {
      return {
        category: this.categories[5],
        subcategory: this.categories[5].subcategories[0] // Poupança
      };
    }

    // Padrão: Outros
    return {
      category: this.categories[5],
      subcategory: this.categories[5].subcategories[1] // Commodities/Outros
    };
  }

  /**
   * Classifica um portfolio completo
   */
  classifyPortfolio(investments: any[]): PortfolioClassification {
    const classifiedAssets: ClassifiedAsset[] = investments.map(investment => {
      const { category, subcategory } = this.classifyAsset(investment);
      
      return {
        id: investment.id,
        name: investment.name,
        balance: investment.balance || 0,
        category,
        subcategory,
        weight: 0, // Será calculado depois
        performance: {
          currentValue: investment.balance || 0,
          cost: investment.amountOriginal || investment.balance || 0,
          profit: investment.amountProfit || 0,
          profitPercentage: this.calculateProfitPercentage(investment),
          annualReturn: investment.annualRate
        },
        metadata: {
          institution: investment.bankName || investment.institutionName || 'N/A',
          lastUpdate: new Date(investment.lastUpdatedAt || Date.now()),
          currency: investment.currencyCode || 'BRL'
        }
      };
    });

    const totalValue = classifiedAssets.reduce((sum, asset) => sum + asset.balance, 0);

    // Calcula pesos
    classifiedAssets.forEach(asset => {
      asset.weight = totalValue > 0 ? (asset.balance / totalValue) * 100 : 0;
    });

    const categories = this.buildCategorySummaries(classifiedAssets, totalValue);
    const riskProfile = this.calculateRiskProfile(classifiedAssets);
    const diversificationScore = this.calculateDiversificationScore(categories);
    const insights = this.generateInsights(categories, riskProfile, diversificationScore);

    return {
      totalValue,
      assetCount: classifiedAssets.length,
      categories,
      riskProfile,
      diversificationScore,
      insights
    };
  }

  private calculateProfitPercentage(investment: any): number {
    const original = investment.amountOriginal || investment.balance;
    const profit = investment.amountProfit || 0;
    return original > 0 ? (profit / original) * 100 : 0;
  }

  private buildCategorySummaries(assets: ClassifiedAsset[], totalValue: number): CategorySummary[] {
    const categoryMap = new Map<string, ClassifiedAsset[]>();
    
    assets.forEach(asset => {
      const key = asset.category.id;
      if (!categoryMap.has(key)) {
        categoryMap.set(key, []);
      }
      categoryMap.get(key)!.push(asset);
    });

    return Array.from(categoryMap.entries()).map(([, categoryAssets]) => {
      const category = categoryAssets[0].category;
      const categoryTotalValue = categoryAssets.reduce((sum, asset) => sum + asset.balance, 0);
      const totalProfit = categoryAssets.reduce((sum, asset) => sum + asset.performance.profit, 0);
      const averageReturn = categoryAssets.reduce((sum, asset) => sum + (asset.performance.annualReturn || 0), 0) / categoryAssets.length;

      const sortedByPerformance = [...categoryAssets].sort((a, b) => b.performance.profitPercentage - a.performance.profitPercentage);

      // Subcategorias
      const subcategoryMap = new Map<string, ClassifiedAsset[]>();
      categoryAssets.forEach(asset => {
        const key = asset.subcategory.id;
        if (!subcategoryMap.has(key)) {
          subcategoryMap.set(key, []);
        }
        subcategoryMap.get(key)!.push(asset);
      });

      const subcategories: SubcategorySummary[] = Array.from(subcategoryMap.entries()).map(([, subAssets]) => ({
        subcategory: subAssets[0].subcategory,
        totalValue: subAssets.reduce((sum, asset) => sum + asset.balance, 0),
        assetCount: subAssets.length,
        weight: totalValue > 0 ? (subAssets.reduce((sum, asset) => sum + asset.balance, 0) / totalValue) * 100 : 0,
        averageReturn: subAssets.reduce((sum, asset) => sum + (asset.performance.annualReturn || 0), 0) / subAssets.length
      }));

      return {
        category,
        totalValue: categoryTotalValue,
        assetCount: categoryAssets.length,
        weight: totalValue > 0 ? (categoryTotalValue / totalValue) * 100 : 0,
        performance: {
          totalProfit,
          averageReturn,
          bestPerformer: sortedByPerformance[0],
          worstPerformer: sortedByPerformance[sortedByPerformance.length - 1]
        },
        subcategories
      };
    });
  }

  private calculateRiskProfile(assets: ClassifiedAsset[]): RiskProfile {
    const totalValue = assets.reduce((sum, asset) => sum + asset.balance, 0);
    
    let conservative = 0;
    let moderate = 0;
    let aggressive = 0;

    assets.forEach(asset => {
      const weight = asset.balance / totalValue;
      switch (asset.subcategory.riskLevel) {
        case 'Conservador':
          conservative += weight;
          break;
        case 'Moderado':
          moderate += weight;
          break;
        case 'Arrojado':
          aggressive += weight;
          break;
      }
    });

    const score = (conservative * 25) + (moderate * 50) + (aggressive * 100);
    
    let level: RiskProfile['level'];
    let recommendation: string;

    if (score < 30) {
      level = 'Conservador';
      recommendation = 'Portfolio muito conservador. Considere diversificar com ativos de maior rentabilidade.';
    } else if (score < 50) {
      level = 'Moderado';
      recommendation = 'Portfolio equilibrado entre segurança e rentabilidade.';
    } else if (score < 75) {
      level = 'Arrojado';
      recommendation = 'Portfolio com bom potencial de rentabilidade e risco controlado.';
    } else {
      level = 'Agressivo';
      recommendation = 'Portfolio com alto potencial de rentabilidade, mas também alto risco.';
    }

    return {
      level,
      score,
      breakdown: {
        conservative: conservative * 100,
        moderate: moderate * 100,
        aggressive: aggressive * 100
      },
      recommendation
    };
  }

  private calculateDiversificationScore(categories: CategorySummary[]): number {
    const categoryCount = categories.length;
    const maxCategories = this.categories.length;
    
    // Pontuação baseada na distribuição de pesos
    const weights = categories.map(cat => cat.weight);
    const idealWeight = 100 / categoryCount;
    const weightVariance = weights.reduce((sum, weight) => sum + Math.pow(weight - idealWeight, 2), 0) / categoryCount;
    
    // Pontuação de diversificação (0-100)
    const categoryScore = (categoryCount / maxCategories) * 50;
    const distributionScore = Math.max(0, 50 - (weightVariance / 10));
    
    return Math.min(100, categoryScore + distributionScore);
  }

  private generateInsights(categories: CategorySummary[], _riskProfile: RiskProfile, diversificationScore: number): PortfolioInsight[] {
    const insights: PortfolioInsight[] = [];

    // Insight de diversificação
    if (diversificationScore < 40) {
      insights.push({
        type: 'warning',
        category: 'Diversificação',
        title: 'Portfolio Pouco Diversificado',
        description: `Score de diversificação: ${diversificationScore.toFixed(1)}%. Considere incluir mais categorias de ativos.`,
        action: 'Diversificar em mais classes de ativos',
        impact: 'Alto'
      });
    } else if (diversificationScore > 80) {
      insights.push({
        type: 'success',
        category: 'Diversificação',
        title: 'Portfolio Bem Diversificado',
        description: `Excelente diversificação com score de ${diversificationScore.toFixed(1)}%.`,
        impact: 'Alto'
      });
    }

    // Insight de renda fixa vs variável
    const rendaFixa = categories.find(cat => cat.category.id === 'renda-fixa');
    const rendaVariavel = categories.find(cat => cat.category.id === 'renda-variavel');

    if (rendaFixa && rendaFixa.weight > 70) {
      insights.push({
        type: 'opportunity',
        category: 'Alocação',
        title: 'Excesso em Renda Fixa',
        description: `${rendaFixa.weight.toFixed(1)}% em renda fixa. Considere aumentar exposição à renda variável.`,
        action: 'Rebalancear portfolio',
        impact: 'Médio'
      });
    }

    if (rendaVariavel && rendaVariavel.weight > 80) {
      insights.push({
        type: 'warning',
        category: 'Risco',
        title: 'Alto Risco em Renda Variável',
        description: `${rendaVariavel.weight.toFixed(1)}% em renda variável pode ser muito arriscado.`,
        action: 'Considere reduzir exposição',
        impact: 'Alto'
      });
    }

    // Insight de performance
    const bestCategory = categories.reduce((best, cat) => 
      cat.performance.averageReturn > best.performance.averageReturn ? cat : best
    );
    
    if (bestCategory.performance.averageReturn > 10) {
      insights.push({
        type: 'success',
        category: 'Performance',
        title: 'Categoria com Boa Performance',
        description: `${bestCategory.category.name} com retorno médio de ${bestCategory.performance.averageReturn.toFixed(1)}% a.a.`,
        impact: 'Médio'
      });
    }

    return insights;
  }

  /**
   * Obtém todas as categorias disponíveis
   */
  getCategories(): AssetCategory[] {
    return this.categories;
  }

  /**
   * Obtém categoria por ID
   */
  getCategoryById(id: string): AssetCategory | undefined {
    return this.categories.find(cat => cat.id === id);
  }
}
