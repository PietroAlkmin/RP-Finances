/**
 * Módulo simplificado para renderização da seção de criptomoedas
 */

// Função para renderizar a seção de criptomoedas
function renderCryptoSection() {
    console.log('Renderizando seção de criptomoedas (versão simplificada)...');
    
    // Verificar se os dados estão disponíveis
    if (!dashboardData || !dashboardData.cryptoMarket || dashboardData.cryptoMarket.length === 0) {
        console.log('Dados de criptomoedas não disponíveis');
        return;
    }
    
    // Encontrar ou criar a seção de criptomoedas
    let cryptoSection = document.getElementById('crypto-section');
    if (!cryptoSection) {
        const mainContent = document.querySelector('.main-content');
        if (!mainContent) {
            console.error('Não foi possível encontrar o conteúdo principal');
            return;
        }
        
        // Criar a seção após a seção de índices
        const indicesSection = document.querySelector('.indices-card');
        
        cryptoSection = document.createElement('section');
        cryptoSection.id = 'crypto-section';
        cryptoSection.className = 'card';
        
        if (indicesSection) {
            mainContent.insertBefore(cryptoSection, indicesSection.nextSibling);
        } else {
            mainContent.appendChild(cryptoSection);
        }
    }
    
    // Obter dados de criptomoedas
    const cryptoData = dashboardData.cryptoMarket.slice(0, 6);
    
    // Criar HTML básico para a seção
    let html = `
        <h2>Mercado de Criptomoedas</h2>
        <div class="crypto-grid">
    `;
    
    // Adicionar cards para cada criptomoeda
    cryptoData.forEach(crypto => {
        const priceChangeClass = crypto.priceChangePercentage24h >= 0 ? 'positive' : 'negative';
        const priceChangeIcon = crypto.priceChangePercentage24h >= 0 ? '▲' : '▼';
        
        html += `
            <div class="crypto-card">
                <div class="crypto-header">
                    <img src="${crypto.image || 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png'}" 
                         alt="${crypto.name}" class="crypto-icon">
                    <div>
                        <h3>${crypto.name || 'Criptomoeda'}</h3>
                        <span>${crypto.symbol ? crypto.symbol.toUpperCase() : '---'}</span>
                    </div>
                </div>
                <div class="crypto-price">
                    ${formatCurrency(crypto.currentPrice || 0)}
                    <span class="${priceChangeClass}">
                        ${priceChangeIcon} ${Math.abs(crypto.priceChangePercentage24h || 0).toFixed(2)}%
                    </span>
                </div>
                <div class="crypto-details">
                    <div>
                        <span>Cap. de Mercado:</span>
                        <span>${formatLargeNumber(crypto.marketCap || 0)}</span>
                    </div>
                    <div>
                        <span>Volume 24h:</span>
                        <span>${formatLargeNumber(crypto.volume24h || 0)}</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += `
        </div>
        <div class="crypto-footer">
            <p>Dados fornecidos por múltiplas APIs de criptomoedas</p>
            <button id="view-all-crypto" class="btn">Ver todas</button>
        </div>
    `;
    
    // Atualizar o conteúdo da seção
    cryptoSection.innerHTML = html;
    
    // Adicionar evento ao botão
    const viewAllButton = document.getElementById('view-all-crypto');
    if (viewAllButton) {
        viewAllButton.addEventListener('click', function() {
            alert('Funcionalidade em desenvolvimento');
        });
    }
}
