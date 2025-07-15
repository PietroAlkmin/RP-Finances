/**
 * Configuração para integração com Binance
 * IMPORTANTE: As chaves são processadas no servidor (proxy), não no frontend
 */

import type { BinanceConfig } from '../ts/integrations/binance/BinanceTypes';

// ===== CONFIGURAÇÃO BINANCE =====
// No frontend, usamos configuração vazia pois as chaves ficam no servidor
export const BINANCE_CONFIG: BinanceConfig = {
  // Chaves são processadas pelo proxy server (não expostas no frontend)
  apiKey: '',
  apiSecret: '',
  
  // URL base sempre será o proxy local
  baseUrl: 'http://localhost:3009',
  
  // Testnet (será configurado via proxy)
  testnet: true
};

// ===== VALIDAÇÃO =====
export function validateBinanceConfig(): boolean {
  // No frontend, a validação é feita pelo proxy
  console.log('✅ Configuração Binance carregada (chaves processadas no servidor)');
  return true;
}

// ===== CONFIGURAÇÕES DE SEGURANÇA =====
export const BINANCE_SECURITY = {
  // Permissões necessárias na API Key
  requiredPermissions: [
    'SPOT', // Trading spot
    'MARGIN', // Trading margin (opcional)
    'FUTURES' // Trading futures (opcional)
  ],
  
  // Configurações de rate limit
  rateLimits: {
    requestWeight: 6000, // Peso de requisição por minuto
    orderCount: 10, // Ordens por segundo
    rawRequests: 61000 // Requisições brutas por 5 minutos
  },
  
  // Recomendações de segurança
  securityRecommendations: [
    'Use apenas permissões necessárias (leitura)',
    'Configure IP whitelist na Binance',
    'Use testnet para desenvolvimento',
    'Armazene chaves em variáveis de ambiente',
    'Monitore logs de acesso regularmente'
  ]
};

// ===== MAPEAMENTO DE MOEDAS =====
export const CURRENCY_MAPPING = {
  // Principais stablecoins
  stablecoins: ['USDT', 'USDC', 'BUSD', 'DAI', 'TUSD', 'USDP', 'FRAX'],
  
  // Principais criptomoedas
  majorCryptos: ['BTC', 'ETH', 'BNB', 'ADA', 'DOT', 'SOL', 'AVAX', 'MATIC'],
  
  // Tokens DeFi
  defiTokens: ['UNI', 'SUSHI', 'COMP', 'AAVE', 'CRV', 'YFI', 'LINK', 'MKR'],
  
  // Conversão para display
  displayNames: {
    BTC: 'Bitcoin',
    ETH: 'Ethereum',
    BNB: 'Binance Coin',
    USDT: 'Tether USD',
    USDC: 'USD Coin',
    BUSD: 'Binance USD',
    ADA: 'Cardano',
    DOT: 'Polkadot',
    SOL: 'Solana',
    AVAX: 'Avalanche',
    MATIC: 'Polygon'
  }
};

// ===== INSTRUÇÕES DE SETUP =====
export const SETUP_INSTRUCTIONS = `
🚀 CONFIGURAÇÃO BINANCE - PASSO A PASSO

1. 📝 CRIAR API KEY:
   • Acesse: https://www.binance.com/en/my/settings/api-management
   • Clique em "Create API"
   • Nomeie sua API Key (ex: "RP-Finances")
   • IMPORTANTE: Marque apenas "Enable Reading" (não marque trading!)

2. 🔒 CONFIGURAR SEGURANÇA:
   • Configure IP Whitelist (recomendado)
   • Anote API Key e Secret Key
   • NUNCA compartilhe suas chaves!

3. 🛠️ CONFIGURAR NO PROJETO:
   • Crie arquivo .env na raiz do projeto
   • Adicione as linhas:
     BINANCE_API_KEY=sua_api_key_aqui
     BINANCE_API_SECRET=sua_secret_key_aqui
     NODE_ENV=development

4. 🧪 TESTAR (OPCIONAL - TESTNET):
   • Acesse: https://testnet.binance.vision/
   • Crie conta de teste
   • Configure BINANCE_BASE_URL=https://testnet.binance.vision
   • Use para desenvolvimento sem riscos

5. ✅ VALIDAR:
   • Execute o projeto
   • Verifique logs de conexão
   • Teste coleta de dados

⚠️ IMPORTANTES:
• Use apenas permissões de LEITURA
• Mantenha chaves seguras
• Configure IP whitelist
• Monitor logs de acesso
• Use testnet para desenvolvimento
`;
