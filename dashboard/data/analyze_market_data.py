import json
import numpy as np
import pandas as pd
from datetime import datetime
import os

print("Iniciando análise dos dados do mercado financeiro global...")

# Carregar dados de índices
with open('data/indices_data.json', 'r') as f:
    indices_data = json.load(f)

# Carregar dados de ações
with open('data/stocks_data.json', 'r') as f:
    stocks_data = json.load(f)

# Carregar insights de ações
with open('data/stocks_insights.json', 'r') as f:
    stocks_insights = json.load(f)

# Criar diretório para resultados da análise
os.makedirs('data/analysis', exist_ok=True)

# Análise de índices globais
print("Analisando índices globais...")
indices_analysis = []

for index in indices_data:
    symbol = index['symbol']
    name = index['name']
    region = index['region']
    
    # Extrair dados de preço e volume
    timestamps = index.get('timestamp', [])
    
    # Verificar se há dados de indicadores
    if 'indicators' in index and 'quote' in index['indicators'] and index['indicators']['quote']:
        quote = index['indicators']['quote'][0]
        
        # Extrair preços de fechamento
        close_prices = quote.get('close', [])
        
        # Calcular retornos se houver pelo menos 2 preços
        if len(close_prices) >= 2 and None not in close_prices:
            # Último preço disponível
            last_price = next((p for p in reversed(close_prices) if p is not None), None)
            
            # Primeiro preço disponível
            first_price = next((p for p in close_prices if p is not None), None)
            
            # Preço de uma semana atrás (aproximadamente 5 dias de negociação)
            week_ago_idx = max(0, len(close_prices) - 6)
            week_ago_price = close_prices[week_ago_idx] if week_ago_idx < len(close_prices) else first_price
            
            # Calcular variações
            if first_price and last_price:
                period_return = ((last_price / first_price) - 1) * 100
                
                # Variação de uma semana
                week_return = ((last_price / week_ago_price) - 1) * 100 if week_ago_price else 0
                
                # Calcular volatilidade (desvio padrão dos retornos diários)
                daily_returns = []
                for i in range(1, len(close_prices)):
                    if close_prices[i] is not None and close_prices[i-1] is not None:
                        daily_return = (close_prices[i] / close_prices[i-1]) - 1
                        daily_returns.append(daily_return)
                
                volatility = np.std(daily_returns) * 100 if daily_returns else 0
                
                # Tendência (média móvel de 5 dias vs média móvel de 20 dias)
                ma5 = np.mean(close_prices[-5:]) if len(close_prices) >= 5 else last_price
                ma20 = np.mean(close_prices[-20:]) if len(close_prices) >= 20 else last_price
                trend = "Alta" if ma5 > ma20 else "Baixa" if ma5 < ma20 else "Lateral"
                
                # Adicionar à análise
                indices_analysis.append({
                    'symbol': symbol,
                    'name': name,
                    'region': region,
                    'last_price': last_price,
                    'period_return': round(period_return, 2),
                    'week_return': round(week_return, 2),
                    'volatility': round(volatility, 2),
                    'trend': trend
                })
                
                print(f"Análise concluída para {name}")
            else:
                print(f"Dados insuficientes para análise de {name}")
        else:
            print(f"Dados insuficientes para análise de {name}")
    else:
        print(f"Sem dados de indicadores para {name}")

# Salvar análise de índices
with open('data/analysis/indices_analysis.json', 'w') as f:
    json.dump(indices_analysis, f)
print("Análise de índices salvos em data/analysis/indices_analysis.json")

# Análise de ações
print("Analisando ações importantes...")
stocks_analysis = []

for stock in stocks_data:
    symbol = stock['symbol']
    name = stock['name']
    region = stock['region']
    
    # Extrair dados de preço e volume
    timestamps = stock.get('timestamp', [])
    
    # Verificar se há dados de indicadores
    if 'indicators' in stock and 'quote' in stock['indicators'] and stock['indicators']['quote']:
        quote = stock['indicators']['quote'][0]
        
        # Extrair preços de fechamento e volume
        close_prices = quote.get('close', [])
        volumes = quote.get('volume', [])
        
        # Calcular retornos se houver pelo menos 2 preços
        if len(close_prices) >= 2 and None not in close_prices:
            # Último preço disponível
            last_price = next((p for p in reversed(close_prices) if p is not None), None)
            
            # Primeiro preço disponível
            first_price = next((p for p in close_prices if p is not None), None)
            
            # Preço de uma semana atrás (aproximadamente 5 dias de negociação)
            week_ago_idx = max(0, len(close_prices) - 6)
            week_ago_price = close_prices[week_ago_idx] if week_ago_idx < len(close_prices) else first_price
            
            # Calcular variações
            if first_price and last_price:
                period_return = ((last_price / first_price) - 1) * 100
                
                # Variação de uma semana
                week_return = ((last_price / week_ago_price) - 1) * 100 if week_ago_price else 0
                
                # Calcular volatilidade (desvio padrão dos retornos diários)
                daily_returns = []
                for i in range(1, len(close_prices)):
                    if close_prices[i] is not None and close_prices[i-1] is not None:
                        daily_return = (close_prices[i] / close_prices[i-1]) - 1
                        daily_returns.append(daily_return)
                
                volatility = np.std(daily_returns) * 100 if daily_returns else 0
                
                # Volume médio
                avg_volume = np.mean([v for v in volumes if v is not None]) if volumes else 0
                
                # Tendência (média móvel de 5 dias vs média móvel de 20 dias)
                ma5 = np.mean(close_prices[-5:]) if len(close_prices) >= 5 else last_price
                ma20 = np.mean(close_prices[-20:]) if len(close_prices) >= 20 else last_price
                trend = "Alta" if ma5 > ma20 else "Baixa" if ma5 < ma20 else "Lateral"
                
                # Buscar insights adicionais
                stock_insight = next((si for si in stocks_insights if si['symbol'] == symbol), None)
                recommendation = None
                valuation = None
                
                if stock_insight and 'insights' in stock_insight:
                    insights = stock_insight['insights']
                    
                    # Recomendação
                    if 'recommendation' in insights and insights['recommendation']:
                        recommendation = {
                            'rating': insights['recommendation'].get('rating'),
                            'targetPrice': insights['recommendation'].get('targetPrice')
                        }
                    
                    # Avaliação
                    if 'instrumentInfo' in insights and 'valuation' in insights['instrumentInfo']:
                        valuation = {
                            'description': insights['instrumentInfo']['valuation'].get('description'),
                            'discount': insights['instrumentInfo']['valuation'].get('discount')
                        }
                
                # Adicionar à análise
                stocks_analysis.append({
                    'symbol': symbol,
                    'name': name,
                    'region': region,
                    'last_price': last_price,
                    'period_return': round(period_return, 2),
                    'week_return': round(week_return, 2),
                    'volatility': round(volatility, 2),
                    'avg_volume': int(avg_volume) if not np.isnan(avg_volume) else 0,
                    'trend': trend,
                    'recommendation': recommendation,
                    'valuation': valuation
                })
                
                print(f"Análise concluída para {name}")
            else:
                print(f"Dados insuficientes para análise de {name}")
        else:
            print(f"Dados insuficientes para análise de {name}")
    else:
        print(f"Sem dados de indicadores para {name}")

# Salvar análise de ações
with open('data/analysis/stocks_analysis.json', 'w') as f:
    json.dump(stocks_analysis, f)
print("Análise de ações salva em data/analysis/stocks_analysis.json")

# Análise de desempenho por região
print("Analisando desempenho por região...")
regions = {}

# Agrupar índices por região
for index in indices_analysis:
    region = index['region']
    if region not in regions:
        regions[region] = {'indices': [], 'avg_return': 0, 'count': 0}
    
    regions[region]['indices'].append(index)
    regions[region]['avg_return'] += index['period_return']
    regions[region]['count'] += 1

# Calcular retorno médio por região
for region in regions:
    if regions[region]['count'] > 0:
        regions[region]['avg_return'] = round(regions[region]['avg_return'] / regions[region]['count'], 2)

# Salvar análise por região
with open('data/analysis/regions_analysis.json', 'w') as f:
    json.dump(regions, f)
print("Análise por região salva em data/analysis/regions_analysis.json")

# Análise de correlação entre índices - CORRIGIDO
print("Analisando correlações entre índices...")
correlations = []

# Criar DataFrame com preços de fechamento dos índices
# Primeiro, encontrar o comprimento mínimo comum para todos os arrays
min_length = float('inf')
index_prices = {}

for index in indices_data:
    if 'indicators' in index and 'quote' in index['indicators'] and index['indicators']['quote']:
        close_prices = index['indicators']['quote'][0].get('close', [])
        # Remover valores None
        close_prices = [p for p in close_prices if p is not None]
        if close_prices:
            min_length = min(min_length, len(close_prices))
            index_prices[index['name']] = close_prices

# Truncar todos os arrays para o mesmo comprimento
for name in index_prices:
    index_prices[name] = index_prices[name][-min_length:] if min_length < len(index_prices[name]) else index_prices[name]

# Agora criar o DataFrame com arrays de mesmo comprimento
if index_prices and min_length < float('inf'):
    try:
        df = pd.DataFrame(index_prices)
        
        # Calcular matriz de correlação
        corr_matrix = df.corr().round(2)
        
        # Converter para formato de lista para JSON
        for idx, row in corr_matrix.iterrows():
            for col in corr_matrix.columns:
                if idx != col:  # Evitar autocorrelação
                    correlations.append({
                        'index1': idx,
                        'index2': col,
                        'correlation': row[col]
                    })
        
        # Salvar análise de correlação
        with open('data/analysis/correlations_analysis.json', 'w') as f:
            json.dump(correlations, f)
        print("Análise de correlações salva em data/analysis/correlations_analysis.json")
    except Exception as e:
        print(f"Erro ao calcular correlações: {str(e)}")
        # Criar um arquivo vazio para correlações
        with open('data/analysis/correlations_analysis.json', 'w') as f:
            json.dump([], f)
        print("Arquivo de correlações vazio criado devido a erro")
else:
    print("Dados insuficientes para análise de correlações")
    # Criar um arquivo vazio para correlações
    with open('data/analysis/correlations_analysis.json', 'w') as f:
        json.dump([], f)
    print("Arquivo de correlações vazio criado devido a dados insuficientes")

# Análise de setores (baseada em ações)
print("Analisando desempenho por setor...")
sectors = {
    'Tecnologia': ['AAPL', 'MSFT', 'GOOGL', 'META', 'NVDA'],
    'Comércio': ['AMZN', 'BABA'],
    'Automotivo': ['TSLA'],
    'Financeiro': ['JPM'],
    'Energia': ['PETR4.SA']
}

sectors_analysis = {}
for sector_name, symbols in sectors.items():
    sector_stocks = [s for s in stocks_analysis if s['symbol'] in symbols]
    
    if sector_stocks:
        avg_return = sum(s['period_return'] for s in sector_stocks) / len(sector_stocks)
        avg_volatility = sum(s['volatility'] for s in sector_stocks) / len(sector_stocks)
        
        sectors_analysis[sector_name] = {
            'stocks': [s['symbol'] for s in sector_stocks],
            'avg_return': round(avg_return, 2),
            'avg_volatility': round(avg_volatility, 2)
        }

# Salvar análise de setores
with open('data/analysis/sectors_analysis.json', 'w') as f:
    json.dump(sectors_analysis, f)
print("Análise de setores salva em data/analysis/sectors_analysis.json")

# Resumo geral do mercado
print("Gerando resumo geral do mercado...")
market_summary = {
    'date': datetime.now().strftime('%Y-%m-%d'),
    'indices_count': len(indices_analysis),
    'stocks_count': len(stocks_analysis),
    'best_performing_index': None,
    'worst_performing_index': None,
    'best_performing_stock': None,
    'worst_performing_stock': None,
    'highest_volatility_index': None,
    'highest_volatility_stock': None,
    'best_performing_region': None,
    'best_performing_sector': None
}

# Melhor e pior índice
if indices_analysis:
    best_index = max(indices_analysis, key=lambda x: x['period_return'])
    worst_index = min(indices_analysis, key=lambda x: x['period_return'])
    highest_vol_index = max(indices_analysis, key=lambda x: x['volatility'])
    
    market_summary['best_performing_index'] = {
        'name': best_index['name'],
        'return': best_index['period_return']
    }
    
    market_summary['worst_performing_index'] = {
        'name': worst_index['name'],
        'return': worst_index['period_return']
    }
    
    market_summary['highest_volatility_index'] = {
        'name': highest_vol_index['name'],
        'volatility': highest_vol_index['volatility']
    }

# Melhor e pior ação
if stocks_analysis:
    best_stock = max(stocks_analysis, key=lambda x: x['period_return'])
    worst_stock = min(stocks_analysis, key=lambda x: x['period_return'])
    highest_vol_stock = max(stocks_analysis, key=lambda x: x['volatility'])
    
    market_summary['best_performing_stock'] = {
        'name': best_stock['name'],
        'return': best_stock['period_return']
    }
    
    market_summary['worst_performing_stock'] = {
        'name': worst_stock['name'],
        'return': worst_stock['period_return']
    }
    
    market_summary['highest_volatility_stock'] = {
        'name': highest_vol_stock['name'],
        'volatility': highest_vol_stock['volatility']
    }

# Melhor região
if regions:
    best_region = max(regions.items(), key=lambda x: x[1]['avg_return'])
    market_summary['best_performing_region'] = {
        'region': best_region[0],
        'return': best_region[1]['avg_return']
    }

# Melhor setor
if sectors_analysis:
    best_sector = max(sectors_analysis.items(), key=lambda x: x[1]['avg_return'])
    market_summary['best_performing_sector'] = {
        'sector': best_sector[0],
        'return': best_sector[1]['avg_return']
    }

# Salvar resumo do mercado
with open('data/analysis/market_summary.json', 'w') as f:
    json.dump(market_summary, f)
print("Resumo do mercado salvo em data/analysis/market_summary.json")

print("Análise de dados concluída com sucesso!")
