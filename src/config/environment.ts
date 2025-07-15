/**
 * Configurações de ambiente
 * Este arquivo pode conter credenciais reais e ser mantido fora do controle de versão
 */

export interface EnvironmentConfig {
  pluggy: {
    clientId: string;
    clientSecret: string;
    baseUrl: string;
    sandbox: boolean;
  };
  supabase?: {
    url: string;
    anonKey: string;
  };
}

/**
 * Configuração padrão (desenvolvimento/sandbox)
 */
export const DEFAULT_CONFIG: EnvironmentConfig = {
  pluggy: {
    clientId: 'YOUR_CLIENT_ID',
    clientSecret: 'YOUR_CLIENT_SECRET',
    baseUrl: 'https://api.pluggy.ai',
    sandbox: true
  }
};

/**
 * Configuração atual do ambiente
 * Substitua as credenciais aqui quando receber suas credenciais da Pluggy
 */
export const ENVIRONMENT_CONFIG: EnvironmentConfig = {
  pluggy: {
    clientId: 'a1488e28-362b-4ce5-9ea6-fc33ca0be83a', // Client ID da Pluggy
    clientSecret: '90ac0f9e-5a30-4689-8160-222e4ca639f7', // Client Secret da Pluggy
    baseUrl: 'https://api.pluggy.ai',
    sandbox: true // Use true para ambiente de desenvolvimento/sandbox
  }
};
