/**
 * Configurações de ambiente para RP-Finances
 * Carrega variáveis de ambiente do .env
 */

// Debug das variáveis de ambiente disponíveis
console.log('🔍 Vite Environment Variables:', import.meta.env);

// Configurações de ambiente
export const ENVIRONMENT_CONFIG = {
  // Modo de desenvolvimento
  isDevelopment: import.meta.env.DEV || false,
  isProduction: import.meta.env.PROD || false,
  
  // Debug mode
  debug: import.meta.env.VITE_DEBUG === 'true',
  
  // URLs base para APIs
  apiUrls: {
    pluggy: 'https://api.pluggy.ai',
    binance: 'http://localhost:3009/api/binance'
  },
  
  // Configurações Pluggy - acesso direto às variáveis
  pluggy: {
    clientId: import.meta.env.VITE_PLUGGY_CLIENT_ID || '',
    clientSecret: import.meta.env.VITE_PLUGGY_CLIENT_SECRET || '',
    baseUrl: 'https://api.pluggy.ai'
  },
  
  // Configurações de localStorage
  storage: {
    prefix: 'rp_finances_',
    version: '1.0'
  },
  
  // Configurações de logging
  logging: {
    level: import.meta.env.VITE_LOG_LEVEL || 'info',
    enableConsole: true
  }
};

// Debug detalhado
console.log('🔍 VITE_PLUGGY_CLIENT_ID:', import.meta.env.VITE_PLUGGY_CLIENT_ID);
console.log('🔍 VITE_PLUGGY_CLIENT_SECRET present:', !!import.meta.env.VITE_PLUGGY_CLIENT_SECRET);
console.log('� Pluggy config:', ENVIRONMENT_CONFIG.pluggy);

// Validação básica
if (!ENVIRONMENT_CONFIG.pluggy.clientId || !ENVIRONMENT_CONFIG.pluggy.clientSecret) {
  console.warn('⚠️ Credenciais Pluggy não configuradas. Verifique o arquivo .env');
  console.warn('⚠️ CLIENT_ID:', ENVIRONMENT_CONFIG.pluggy.clientId || 'VAZIO');
  console.warn('⚠️ CLIENT_SECRET:', ENVIRONMENT_CONFIG.pluggy.clientSecret ? 'PRESENTE' : 'VAZIO');
}

export default ENVIRONMENT_CONFIG;
