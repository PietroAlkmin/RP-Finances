import sys
sys.path.append('/opt/.manus/.sandbox-runtime')
from data_api import ApiClient
import json
import os

client = ApiClient()

# Lista de índices globais importantes
indices = [
    {"symbol": "^GSPC", "name": "S&P 500", "region": "US"},           # S&P 500 (EUA)
    {"symbol": "^DJI", "name": "Dow Jones", "region": "US"},          # Dow Jones (EUA)
    {"symbol": "^IXIC", "name": "Nasdaq", "region": "US"},            # Nasdaq (EUA)
    {"symbol": "^FTSE", "name": "FTSE 100", "region": "GB"},          # FTSE 100 (Reino Unido)
    {"symbol": "^GDAXI", "name": "DAX", "region": "DE"},              # DAX (Alemanha)
    {"symbol": "^FCHI", "name": "CAC 40", "region": "FR"},            # CAC 40 (França)
    {"symbol": "^N225", "name": "Nikkei 225", "region": "US"},        # Nikkei 225 (Japão)
    {"symbol": "^HSI", "name": "Hang Seng", "region": "HK"},          # Hang Seng (Hong Kong)
    {"symbol": "^BVSP", "name": "Ibovespa", "region": "BR"},          # Ibovespa (Brasil)
    {"symbol": "000001.SS", "name": "SSE Composite", "region": "US"}  # SSE Composite (China)
]

# Lista de ações importantes globalmente
stocks = [
    {"symbol": "AAPL", "name": "Apple", "region": "US"},
    {"symbol": "MSFT", "name": "Microsoft", "region": "US"},
    {"symbol": "AMZN", "name": "Amazon", "region": "US"},
    {"symbol": "GOOGL", "name": "Alphabet", "region": "US"},
    {"symbol": "META", "name": "Meta Platforms", "region": "US"},
    {"symbol": "TSLA", "name": "Tesla", "region": "US"},
    {"symbol": "NVDA", "name": "NVIDIA", "region": "US"},
    {"symbol": "JPM", "name": "JPMorgan Chase", "region": "US"},
    {"symbol": "BABA", "name": "Alibaba", "region": "US"},
    {"symbol": "PETR4.SA", "name": "Petrobras", "region": "BR"}
]

# Coletar dados de índices
print("Coletando dados de índices globais...")
indices_data = []
for index in indices:
    try:
        data = client.call_api('YahooFinance/get_stock_chart', query={
            'symbol': index["symbol"],
            'region': index["region"],
            'interval': '1d',
            'range': '1mo',
            'includeAdjustedClose': True
        })
        
        if data and 'chart' in data and 'result' in data['chart'] and data['chart']['result']:
            result = data['chart']['result'][0]
            index_data = {
                'symbol': index["symbol"],
                'name': index["name"],
                'region': index["region"],
                'meta': result.get('meta', {}),
                'timestamp': result.get('timestamp', []),
                'indicators': result.get('indicators', {})
            }
            indices_data.append(index_data)
            print(f"Dados coletados para {index['name']}")
        else:
            print(f"Falha ao coletar dados para {index['name']}")
    except Exception as e:
        print(f"Erro ao coletar dados para {index['name']}: {str(e)}")

# Salvar dados de índices
with open('data/indices_data.json', 'w') as f:
    json.dump(indices_data, f)
print("Dados de índices salvos em data/indices_data.json")

# Coletar dados de ações
print("Coletando dados de ações importantes...")
stocks_data = []
stocks_insights = []
for stock in stocks:
    try:
        # Dados de preços
        data = client.call_api('YahooFinance/get_stock_chart', query={
            'symbol': stock["symbol"],
            'region': stock["region"],
            'interval': '1d',
            'range': '1mo',
            'includeAdjustedClose': True
        })
        
        if data and 'chart' in data and 'result' in data['chart'] and data['chart']['result']:
            result = data['chart']['result'][0]
            stock_data = {
                'symbol': stock["symbol"],
                'name': stock["name"],
                'region': stock["region"],
                'meta': result.get('meta', {}),
                'timestamp': result.get('timestamp', []),
                'indicators': result.get('indicators', {})
            }
            stocks_data.append(stock_data)
            
            # Insights
            insights = client.call_api('YahooFinance/get_stock_insights', query={
                'symbol': stock["symbol"]
            })
            
            if insights and 'finance' in insights and 'result' in insights['finance']:
                stocks_insights.append({
                    'symbol': stock["symbol"],
                    'name': stock["name"],
                    'insights': insights['finance']['result']
                })
            
            print(f"Dados coletados para {stock['name']}")
        else:
            print(f"Falha ao coletar dados para {stock['name']}")
    except Exception as e:
        print(f"Erro ao coletar dados para {stock['name']}: {str(e)}")

# Salvar dados de ações
with open('data/stocks_data.json', 'w') as f:
    json.dump(stocks_data, f)
print("Dados de ações salvos em data/stocks_data.json")

# Salvar insights de ações
with open('data/stocks_insights.json', 'w') as f:
    json.dump(stocks_insights, f)
print("Insights de ações salvos em data/stocks_insights.json")

print("Coleta de dados concluída!")
