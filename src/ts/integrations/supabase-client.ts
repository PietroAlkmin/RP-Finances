/**
 * 🗄️ Supabase Client - Cliente para integração com Supabase
 * 
 * Responsável por:
 * - Configurar conexão com Supabase
 * - Gerenciar autenticação de usuários
 * - Executar operações de banco de dados
 * - Configurar real-time subscriptions
 */

import { createClient, SupabaseClient as SupabaseJSClient, User } from '@supabase/supabase-js';

// Configurações do Supabase (em produção, usar variáveis de ambiente)
const SUPABASE_URL = 'https://your-project.supabase.co'; // Será configurado depois
const SUPABASE_ANON_KEY = 'your-anon-key'; // Será configurado depois

/**
 * 🎯 Cliente principal para integração com Supabase
 * Centraliza todas as operações de backend
 */
export class SupabaseClient {
    private client: SupabaseJSClient;
    private currentUser: User | null = null;

    constructor() {
        // Por enquanto, vamos usar configuração mock para desenvolvimento
        // Em produção, as credenciais virão de variáveis de ambiente
        console.log('🗄️ Inicializando cliente Supabase...');
        
        try {
            // Verificar se as credenciais estão configuradas
            if (SUPABASE_URL === 'https://your-project.supabase.co') {
                console.log('⚠️ Supabase não configurado, usando modo desenvolvimento');
                this.client = this.createMockClient();
            } else {
                // Criar cliente real do Supabase
                this.client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                console.log('✅ Cliente Supabase real inicializado');
            }
            
        } catch (error) {
            console.error('❌ Erro ao inicializar Supabase:', error);
            this.client = this.createMockClient();
        }
    }

    /**
     * 🎭 Cria um cliente mock para desenvolvimento
     * Simula as operações do Supabase sem conexão real
     */
    private createMockClient(): any {
        console.log('🎭 Usando cliente Supabase mock para desenvolvimento');
        
        return {
            auth: {
                getUser: async () => ({ data: { user: null }, error: null }),
                signIn: async () => ({ data: null, error: null }),
                signOut: async () => ({ data: null, error: null }),
                onAuthStateChange: () => ({ data: { subscription: null } })
            },
            from: () => ({
                select: () => ({
                    eq: () => ({
                        single: async () => ({ data: null, error: null })
                    })
                }),
                insert: async () => ({ data: null, error: null }),
                update: async () => ({ data: null, error: null }),
                delete: async () => ({ data: null, error: null })
            }),
            channel: () => ({
                on: () => ({}),
                subscribe: () => ({})
            })
        };
    }

    /**
     * 👤 Obtém o usuário atual autenticado
     */
    async getCurrentUser(): Promise<User | null> {
        try {
            console.log('👤 Verificando usuário atual...');
            
            const { data, error } = await this.client.auth.getUser();
            
            if (error) {
                console.error('❌ Erro ao obter usuário:', error);
                return null;
            }
            
            this.currentUser = data.user;
            
            if (this.currentUser) {
                console.log('✅ Usuário autenticado:', this.currentUser.email);
            } else {
                console.log('ℹ️ Nenhum usuário autenticado');
            }
            
            return this.currentUser;
            
        } catch (error) {
            console.error('❌ Erro na verificação de usuário:', error);
            return null;
        }
    }

    /**
     * 🔐 Autentica usuário com email e senha
     */
    async signIn(email: string, password: string): Promise<boolean> {
        try {
            console.log('🔐 Fazendo login do usuário:', email);
            
            const { data, error } = await this.client.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) {
                console.error('❌ Erro no login:', error.message);
                return false;
            }
            
            this.currentUser = data.user;
            console.log('✅ Login realizado com sucesso');
            return true;
            
        } catch (error) {
            console.error('❌ Erro no processo de login:', error);
            return false;
        }
    }

    /**
     * 🚪 Faz logout do usuário atual
     */
    async signOut(): Promise<boolean> {
        try {
            console.log('🚪 Fazendo logout...');
            
            const { error } = await this.client.auth.signOut();
            
            if (error) {
                console.error('❌ Erro no logout:', error.message);
                return false;
            }
            
            this.currentUser = null;
            console.log('✅ Logout realizado com sucesso');
            return true;
            
        } catch (error) {
            console.error('❌ Erro no processo de logout:', error);
            return false;
        }
    }

    /**
     * 👥 Registra novo usuário
     */
    async signUp(email: string, password: string, metadata?: any): Promise<boolean> {
        try {
            console.log('👥 Registrando novo usuário:', email);
            
            const { error } = await this.client.auth.signUp({
                email,
                password,
                options: {
                    data: metadata
                }
            });
            
            if (error) {
                console.error('❌ Erro no registro:', error.message);
                return false;
            }
            
            console.log('✅ Usuário registrado com sucesso');
            return true;
            
        } catch (error) {
            console.error('❌ Erro no processo de registro:', error);
            return false;
        }
    }

    /**
     * 📊 Busca dados de portfolio do usuário no banco
     */
    async getPortfolioData(userId: string): Promise<any> {
        try {
            console.log('📊 Buscando dados de portfolio do usuário:', userId);
            
            const { data, error } = await this.client
                .from('portfolios')
                .select('*')
                .eq('user_id', userId)
                .single();
            
            if (error) {
                console.error('❌ Erro ao buscar portfolio:', error.message);
                return null;
            }
            
            console.log('✅ Dados de portfolio obtidos');
            return data;
            
        } catch (error) {
            console.error('❌ Erro na busca de portfolio:', error);
            return null;
        }
    }

    /**
     * 💾 Salva dados de portfolio no banco
     */
    async savePortfolioData(userId: string, portfolioData: any): Promise<boolean> {
        try {
            console.log('💾 Salvando dados de portfolio...');
            
            const { error } = await this.client
                .from('portfolios')
                .upsert({
                    user_id: userId,
                    data: portfolioData,
                    updated_at: new Date().toISOString()
                });
            
            if (error) {
                console.error('❌ Erro ao salvar portfolio:', error.message);
                return false;
            }
            
            console.log('✅ Portfolio salvo com sucesso');
            return true;
            
        } catch (error) {
            console.error('❌ Erro no salvamento de portfolio:', error);
            return false;
        }
    }

    /**
     * 🔗 Salva dados de conta conectada
     */
    async saveConnectedAccount(userId: string, accountData: any): Promise<boolean> {
        try {
            console.log('🔗 Salvando conta conectada...');
            
            const { error } = await this.client
                .from('connected_accounts')
                .upsert({
                    user_id: userId,
                    account_id: accountData.id,
                    institution_name: accountData.institutionName,
                    account_type: accountData.accountType,
                    balance: accountData.balance,
                    currency: accountData.currency,
                    last_sync: accountData.lastSync,
                    updated_at: new Date().toISOString()
                });
            
            if (error) {
                console.error('❌ Erro ao salvar conta:', error.message);
                return false;
            }
            
            console.log('✅ Conta salva com sucesso');
            return true;
            
        } catch (error) {
            console.error('❌ Erro no salvamento de conta:', error);
            return false;
        }
    }

    /**
     * 🔍 Busca contas conectadas do usuário
     */
    async getConnectedAccounts(userId: string): Promise<any[]> {
        try {
            console.log('🔍 Buscando contas conectadas...');
            
            const { data, error } = await this.client
                .from('connected_accounts')
                .select('*')
                .eq('user_id', userId);
            
            if (error) {
                console.error('❌ Erro ao buscar contas:', error.message);
                return [];
            }
            
            console.log(`✅ ${data?.length || 0} contas encontradas`);
            return data || [];
            
        } catch (error) {
            console.error('❌ Erro na busca de contas:', error);
            return [];
        }
    }

    /**
     * ⚡ Configura subscriptions em tempo real
     * Escuta mudanças no banco de dados e executa callback
     */
    subscribeToChanges(callback: (data: any) => void): void {
        try {
            console.log('⚡ Configurando subscriptions em tempo real...');
            
            // Subscription para mudanças em portfolios
            this.client
                .channel('portfolio_changes')
                .on('postgres_changes', 
                    { 
                        event: '*', 
                        schema: 'public', 
                        table: 'portfolios' 
                    }, 
                    (payload) => {
                        console.log('🔄 Mudança detectada em portfolio:', payload);
                        callback(payload);
                    }
                )
                .subscribe();

            // Subscription para mudanças em contas conectadas
            this.client
                .channel('accounts_changes')
                .on('postgres_changes', 
                    { 
                        event: '*', 
                        schema: 'public', 
                        table: 'connected_accounts' 
                    }, 
                    (payload) => {
                        console.log('🔄 Mudança detectada em contas:', payload);
                        callback(payload);
                    }
                )
                .subscribe();
                
            console.log('✅ Subscriptions configuradas');
            
        } catch (error) {
            console.error('❌ Erro ao configurar subscriptions:', error);
        }
    }

    /**
     * 📊 Executa query personalizada no banco
     */
    async executeQuery(table: string, query: any): Promise<any> {
        try {
            console.log(`📊 Executando query na tabela ${table}:`, query);
            
            const { data, error } = await this.client
                .from(table)
                .select(query.select || '*')
                .limit(query.limit || 100);
            
            if (error) {
                console.error('❌ Erro na query:', error.message);
                return null;
            }
            
            console.log(`✅ Query executada, ${data?.length || 0} registros retornados`);
            return data;
            
        } catch (error) {
            console.error('❌ Erro na execução de query:', error);
            return null;
        }
    }

    /**
     * 🔧 Configura as credenciais do Supabase
     * Usado quando as credenciais são obtidas dinamicamente
     */
    public configureSupabase(url: string, anonKey: string): void {
        try {
            console.log('🔧 Configurando credenciais do Supabase...');
            
            this.client = createClient(url, anonKey);
            console.log('✅ Cliente Supabase reconfigurado com sucesso');
            
        } catch (error) {
            console.error('❌ Erro ao reconfigurar Supabase:', error);
        }
    }

    /**
     * 🏥 Verifica se a conexão com Supabase está funcionando
     */
    async healthCheck(): Promise<boolean> {
        try {
            console.log('🏥 Verificando saúde da conexão Supabase...');
            
            // Tentar fazer uma query simples
            const { error } = await this.client
                .from('profiles')
                .select('id')
                .limit(1);
            
            if (error && !error.message.includes('relation "profiles" does not exist')) {
                console.error('❌ Erro na verificação de saúde:', error.message);
                return false;
            }
            
            console.log('✅ Conexão Supabase funcionando');
            return true;
            
        } catch (error) {
            console.error('❌ Erro na verificação de saúde:', error);
            return false;
        }
    }

    /**
     * 📤 Getter para acessar o cliente Supabase diretamente
     * Para casos especiais que precisam de acesso direto
     */
    public getClient(): SupabaseJSClient {
        return this.client;
    }

    /**
     * 👤 Getter para o usuário atual
     */
    public getCurrentUserData(): User | null {
        return this.currentUser;
    }

    /**
     * 🔄 Força recarregamento dos dados de usuário
     */
    async refreshUser(): Promise<User | null> {
        return await this.getCurrentUser();
    }
}
