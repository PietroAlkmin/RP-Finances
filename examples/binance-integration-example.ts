/**
 * Exemplo prático de uso da integração Binance
 * Demonstra como coletar e exibir dados de portfolio Binance
 */

import { BinanceInvestmentCollector } from '../src/ts/integrations/binance/BinanceInvestmentCollector';
import { BINANCE_CONFIG, validateBinanceConfig } from '../src/config/binance';

/**
 * Exemplo de uso básico da integração Binance
 */
async function exemploBasico() {
  console.log('🚀 === EXEMPLO BÁSICO BINANCE ===\n');
  
  // 1. Validar configuração
  if (!validateBinanceConfig()) {
    console.log('❌ Configure as credenciais Binance primeiro!');
    console.log('📖 Veja instruções em: src/config/binance.ts');
    return;
  }
  
  // 2. Criar coletor
  const collector = new BinanceInvestmentCollector(BINANCE_CONFIG);
  
  try {
    // 3. Testar conexão
    console.log('🔍 Testando conexão com Binance...');
    const connected = await collector.testConnection();
    
    if (!connected) {
      console.log('❌ Falha na conexão com Binance');
      return;
    }
    
    // 4. Coletar investimentos
    console.log('\n📊 Coletando investimentos...');
    const investments = await collector.collectInvestments();
    
    // 5. Exibir resultados
    console.log(`\n✅ ${investments.length} investimentos encontrados:`);
    investments.forEach((investment, index) => {
      console.log(`\n${index + 1}. ${investment.name}`);
      console.log(`   Tipo: ${investment.type} (${investment.subtype})`);
      console.log(`   Saldo: $${investment.balance.toFixed(2)}`);
      console.log(`   Quantidade: ${investment.quantity}`);
      console.log(`   Variação 24h: ${(investment.rate! * 100).toFixed(2)}%`);
    });
    
    // 6. Obter resumo do portfolio
    console.log('\n📈 Resumo do Portfolio:');
    const summary = await collector.getPortfolioSummary();
    console.log(`   Total USD: $${summary.totalUsdValue.toFixed(2)}`);
    console.log(`   Total BTC: ${summary.totalBtcValue.toFixed(8)} BTC`);
    console.log(`   Ativos: ${summary.assets.length}`);
    
    if (summary.topGainers.length > 0) {
      console.log('\n📈 Top Gainers:');
      summary.topGainers.slice(0, 3).forEach(asset => {
        console.log(`   ${asset.asset}: +${asset.priceChangePercent.toFixed(2)}%`);
      });
    }
    
    if (summary.topLosers.length > 0) {
      console.log('\n📉 Top Losers:');
      summary.topLosers.slice(0, 3).forEach(asset => {
        console.log(`   ${asset.asset}: ${asset.priceChangePercent.toFixed(2)}%`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

/**
 * Exemplo de integração com sistema RP-Finances
 */
async function exemploIntegracao() {
  console.log('\n🔗 === EXEMPLO INTEGRAÇÃO RP-FINANCES ===\n');
  
  if (!validateBinanceConfig()) {
    return;
  }
  
  const collector = new BinanceInvestmentCollector(BINANCE_CONFIG);
  
  try {
    // Simula integração com InvestmentCollector principal
    console.log('📊 Coletando dados Binance para integração...');
    const binanceInvestments = await collector.collectInvestments();
    
    // Aqui seria integrado com dados do Pluggy
    // const pluggyInvestments = await pluggyCollector.getAllInvestments(itemIds);
    // const allInvestments = [...pluggyInvestments, ...binanceInvestments];
    
    console.log(`✅ ${binanceInvestments.length} investimentos Binance prontos para integração`);
    
    // Exibe estrutura para debug
    if (binanceInvestments.length > 0) {
      console.log('\n🔍 Estrutura do primeiro investimento:');
      const first = binanceInvestments[0];
      console.log(JSON.stringify({
        id: first.id,
        name: first.name,
        type: first.type,
        subtype: first.subtype,
        balance: first.balance,
        rate: first.rate,
        rateType: first.rateType,
        currencyCode: first.currencyCode,
        date: first.date,
        itemId: first.itemId
      }, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Erro na integração:', error);
  }
}

/**
 * Exemplo de monitoramento em tempo real
 */
async function exemploMonitoramento() {
  console.log('\n⏱️ === EXEMPLO MONITORAMENTO REAL-TIME ===\n');
  
  if (!validateBinanceConfig()) {
    return;
  }
  
  const collector = new BinanceInvestmentCollector(BINANCE_CONFIG);
  
  // Simula monitoramento a cada 30 segundos
  let iteration = 1;
  const maxIterations = 3; // Para exemplo, apenas 3 iterações
  
  const monitor = setInterval(async () => {
    try {
      console.log(`\n🔄 Atualização ${iteration}/${maxIterations}`);
      console.log(`⏰ ${new Date().toLocaleTimeString()}`);
      
      const summary = await collector.getPortfolioSummary();
      
      console.log(`💰 Total: $${summary.totalUsdValue.toFixed(2)}`);
      
      if (summary.assets.length > 0) {
        const biggest = summary.assets[0];
        console.log(`🏆 Maior posição: ${biggest.asset} ($${biggest.usdValue.toFixed(2)})`);
      }
      
      iteration++;
      
      if (iteration > maxIterations) {
        clearInterval(monitor);
        console.log('\n✅ Monitoramento finalizado');
      }
      
    } catch (error) {
      console.error('❌ Erro no monitoramento:', error);
      clearInterval(monitor);
    }
  }, 10000); // 10 segundos para exemplo (produção: 30s)
}

// Executar exemplos - para uso em ambiente de desenvolvimento/teste
// Descomente as linhas abaixo para executar os exemplos:
/*
exemploBasico()
  .then(() => exemploIntegracao())
  .then(() => exemploMonitoramento())
  .catch(console.error);
*/

export {
  exemploBasico,
  exemploIntegracao,
  exemploMonitoramento
};
