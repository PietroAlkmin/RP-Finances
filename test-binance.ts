/**
 * Teste TypeScript direto da integração Binance
 */

// Carregar variáveis de ambiente
import 'dotenv/config';

import { BinanceInvestmentCollector } from './src/ts/integrations/binance/BinanceInvestmentCollector';
import { BINANCE_CONFIG, validateBinanceConfig } from './src/config/binance';

async function testeRapido() {
  console.log('🚀 === TESTE BINANCE (TypeScript) ===\n');
  
  // 1. Verificar configuração
  console.log('📋 Verificando configuração...');
  console.log(`API Key: ${BINANCE_CONFIG.apiKey?.substring(0, 10)}...`);
  console.log(`Secret Key: ${BINANCE_CONFIG.apiSecret?.substring(0, 10)}...`);
  console.log(`Testnet: ${BINANCE_CONFIG.testnet}`);
  
  if (!validateBinanceConfig()) {
    console.log('❌ Configuração inválida!');
    return;
  }
  
  // 2. Criar coletor
  const collector = new BinanceInvestmentCollector(BINANCE_CONFIG);
  
  try {
    // 3. Testar conexão
    console.log('\n🔍 Testando conexão...');
    const connected = await collector.testConnection();
    
    if (!connected) {
      console.log('❌ Falha na conexão');
      return;
    }
    
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // 4. Coletar dados
    console.log('\n📊 Coletando investimentos...');
    const investments = await collector.collectInvestments();
    
    console.log(`✅ ${investments.length} investimentos encontrados:`);
    
    investments.slice(0, 5).forEach((inv, i) => {
      console.log(`${i + 1}. ${inv.name}: $${inv.balance.toFixed(2)} (${inv.quantity} ${inv.currencyCode})`);
    });
    
    // 5. Resumo do portfolio
    console.log('\n📈 Resumo do Portfolio:');
    const summary = await collector.getPortfolioSummary();
    console.log(`💰 Total USD: $${summary.totalUsdValue.toFixed(2)}`);
    console.log(`₿ Total BTC: ${summary.totalBtcValue.toFixed(8)} BTC`);
    console.log(`📊 Ativos: ${summary.assets.length}`);
    
  } catch (error) {
    console.error('❌ Erro durante teste:', error);
  }
}

// Executar teste
testeRapido().catch(console.error);
