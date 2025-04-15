/**
 * API Test Script
 * Este script testa as novas integrações de API adicionadas ao dashboard
 */

document.addEventListener('DOMContentLoaded', function() {
    // Criar container para resultados de teste
    const testContainer = document.createElement('div');
    testContainer.id = 'api-test-container';
    testContainer.style.padding = '20px';
    testContainer.style.backgroundColor = '#f5f5f5';
    testContainer.style.borderRadius = '8px';
    testContainer.style.margin = '20px';
    testContainer.style.maxWidth = '1200px';
    
    const heading = document.createElement('h2');
    heading.textContent = 'Teste de Integração de APIs';
    testContainer.appendChild(heading);
    
    const description = document.createElement('p');
    description.textContent = 'Este teste verifica se as novas APIs estão funcionando corretamente.';
    testContainer.appendChild(description);
    
    // Adicionar botões para testar cada API
    const apiButtons = document.createElement('div');
    apiButtons.style.display = 'flex';
    apiButtons.style.flexWrap = 'wrap';
    apiButtons.style.gap = '10px';
    apiButtons.style.marginBottom = '20px';
    
    // Lista de APIs para testar
    const apis = [
        { name: 'Finnhub', endpoint: '/api/finnhub/quote?symbol=AAPL' },
        { name: 'brapi.dev', endpoint: '/api/brapi/quote/PETR4' },
        { name: 'CoinGecko', endpoint: '/api/coingecko/coins/markets?vs_currency=usd&ids=bitcoin,ethereum&order=market_cap_desc' },
        { name: 'FRED', endpoint: '/api/fred/series/observations?series_id=GDP' },
        { name: 'GNews', endpoint: '/api/gnews/top-headlines?topic=business&lang=en' }
    ];
    
    // Criar botões para cada API
    apis.forEach(api => {
        const button = document.createElement('button');
        button.textContent = `Testar ${api.name}`;
        button.className = 'api-test-button';
        button.style.padding = '10px 15px';
        button.style.backgroundColor = '#3b82f6';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = '4px';
        button.style.cursor = 'pointer';
        
        button.addEventListener('click', () => testApi(api.name, api.endpoint));
        
        apiButtons.appendChild(button);
    });
    
    testContainer.appendChild(apiButtons);
    
    // Área para exibir resultados
    const resultsArea = document.createElement('div');
    resultsArea.id = 'api-test-results';
    resultsArea.style.backgroundColor = '#1e293b';
    resultsArea.style.color = '#e2e8f0';
    resultsArea.style.padding = '15px';
    resultsArea.style.borderRadius = '4px';
    resultsArea.style.fontFamily = 'monospace';
    resultsArea.style.whiteSpace = 'pre-wrap';
    resultsArea.style.overflow = 'auto';
    resultsArea.style.maxHeight = '500px';
    resultsArea.textContent = 'Clique em um botão acima para testar uma API...';
    
    testContainer.appendChild(resultsArea);
    
    // Adicionar container ao corpo do documento
    document.body.appendChild(testContainer);
    
    // Função para testar uma API
    async function testApi(apiName, endpoint) {
        const resultsArea = document.getElementById('api-test-results');
        resultsArea.textContent = `Testando ${apiName}...\nEndpoint: ${endpoint}\n\nAguarde...`;
        
        try {
            const startTime = performance.now();
            const response = await fetch(endpoint);
            const endTime = performance.now();
            const responseTime = (endTime - startTime).toFixed(2);
            
            if (!response.ok) {
                throw new Error(`Status: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            
            resultsArea.textContent = `✅ Teste de ${apiName} bem-sucedido!\nEndpoint: ${endpoint}\nTempo de resposta: ${responseTime}ms\n\nResultado:\n${JSON.stringify(data, null, 2)}`;
        } catch (error) {
            resultsArea.textContent = `❌ Erro ao testar ${apiName}!\nEndpoint: ${endpoint}\n\nErro: ${error.message}`;
            console.error(`Error testing ${apiName}:`, error);
        }
    }
});
