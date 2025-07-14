/**
 * 🎨 UI Manager - Gerenciador de Interface do Usuário
 * 
 * Responsável por:
 * - Gerenciar elementos visuais da interface
 * - Mostrar/esconder indicadores de carregamento
 * - Exibir notificações e mensagens de erro
 * - Controlar estados visuais da aplicação
 */

/**
 * 🎯 Classe principal para gerenciamento da interface
 * Centraliza todas as operações visuais e de UX
 */
export class UIManager {
    private loadingIndicator: HTMLElement | null = null;
    private notificationContainer: HTMLElement | null = null;

    constructor() {
        console.log('🎨 UIManager inicializado');
    }

    /**
     * 🚀 Inicializa o gerenciador de interface
     * Configura elementos base e event listeners
     */
    init(): void {
        console.log('🚀 Inicializando UI Manager...');

        try {
            // Criar elementos base da UI
            this.createLoadingIndicator();
            this.createNotificationContainer();
            
            // Configurar event listeners globais
            this.setupGlobalEventListeners();
            
            console.log('✅ UI Manager inicializado com sucesso');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar UI Manager:', error);
        }
    }

    /**
     * ⏳ Cria indicador de carregamento
     */
    private createLoadingIndicator(): void {
        // Verificar se já existe
        this.loadingIndicator = document.getElementById('loading-indicator');
        
        if (!this.loadingIndicator) {
            // Criar novo indicador de carregamento
            this.loadingIndicator = document.createElement('div');
            this.loadingIndicator.id = 'loading-indicator';
            this.loadingIndicator.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden';
            
            this.loadingIndicator.innerHTML = `
                <div class="bg-white rounded-lg p-8 flex items-center space-x-4">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <div class="text-gray-900 font-medium">Carregando...</div>
                </div>
            `;
            
            document.body.appendChild(this.loadingIndicator);
            console.log('⏳ Indicador de carregamento criado');
        }
    }

    /**
     * 🔔 Cria container para notificações
     */
    private createNotificationContainer(): void {
        // Verificar se já existe
        this.notificationContainer = document.getElementById('notification-container');
        
        if (!this.notificationContainer) {
            // Criar novo container de notificações
            this.notificationContainer = document.createElement('div');
            this.notificationContainer.id = 'notification-container';
            this.notificationContainer.className = 'fixed top-4 right-4 z-50 space-y-2';
            
            document.body.appendChild(this.notificationContainer);
            console.log('🔔 Container de notificações criado');
        }
    }

    /**
     * 🎯 Configura event listeners globais
     */
    private setupGlobalEventListeners(): void {
        // Listener para tecla ESC (fechar modais)
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Listener para cliques fora de modais
        document.addEventListener('click', (event) => {
            const target = event.target as HTMLElement;
            if (target.classList.contains('modal-overlay')) {
                this.closeAllModals();
            }
        });

        console.log('🎯 Event listeners globais configurados');
    }

    /**
     * ⏳ Mostra indicador de carregamento
     */
    showLoading(message: string = 'Carregando...'): void {
        if (this.loadingIndicator) {
            const messageElement = this.loadingIndicator.querySelector('.text-gray-900');
            if (messageElement) {
                messageElement.textContent = message;
            }
            
            this.loadingIndicator.classList.remove('hidden');
            console.log('⏳ Carregamento mostrado:', message);
        }
    }

    /**
     * ✅ Esconde indicador de carregamento
     */
    hideLoading(): void {
        if (this.loadingIndicator) {
            this.loadingIndicator.classList.add('hidden');
            console.log('✅ Carregamento escondido');
        }
    }

    /**
     * ❌ Mostra mensagem de erro
     */
    showError(message: string, duration: number = 5000): void {
        console.log('❌ Mostrando erro:', message);
        this.showNotification(message, 'error', duration);
    }

    /**
     * ✅ Mostra mensagem de sucesso
     */
    showSuccess(message: string, duration: number = 3000): void {
        console.log('✅ Mostrando sucesso:', message);
        this.showNotification(message, 'success', duration);
    }

    /**
     * ℹ️ Mostra mensagem informativa
     */
    showInfo(message: string, duration: number = 4000): void {
        console.log('ℹ️ Mostrando info:', message);
        this.showNotification(message, 'info', duration);
    }

    /**
     * ⚠️ Mostra mensagem de aviso
     */
    showWarning(message: string, duration: number = 4000): void {
        console.log('⚠️ Mostrando aviso:', message);
        this.showNotification(message, 'warning', duration);
    }

    /**
     * 🔔 Mostra notificação genérica
     */
    private showNotification(message: string, type: 'success' | 'error' | 'info' | 'warning', duration: number): void {
        if (!this.notificationContainer) return;

        // Criar elemento de notificação
        const notification = document.createElement('div');
        const id = `notification-${Date.now()}`;
        notification.id = id;
        
        // Definir classes baseadas no tipo
        const baseClasses = 'max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 transform transition-all duration-300';
        const typeClasses = {
            success: 'border-l-4 border-green-400',
            error: 'border-l-4 border-red-400',
            info: 'border-l-4 border-blue-400',
            warning: 'border-l-4 border-yellow-400'
        };
        
        notification.className = `${baseClasses} ${typeClasses[type]} translate-x-full opacity-0`;
        
        // Definir ícones para cada tipo
        const icons = {
            success: '✅',
            error: '❌',
            info: 'ℹ️',
            warning: '⚠️'
        };
        
        // Conteúdo da notificação
        notification.innerHTML = `
            <div class="flex-1 w-0 p-4">
                <div class="flex items-start">
                    <div class="flex-shrink-0">
                        <span class="text-lg">${icons[type]}</span>
                    </div>
                    <div class="ml-3 w-0 flex-1">
                        <p class="text-sm font-medium text-gray-900">${message}</p>
                    </div>
                </div>
            </div>
            <div class="flex border-l border-gray-200">
                <button class="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none" onclick="document.getElementById('${id}').remove()">
                    ✕
                </button>
            </div>
        `;
        
        // Adicionar ao container
        this.notificationContainer.appendChild(notification);
        
        // Animar entrada
        setTimeout(() => {
            notification.classList.remove('translate-x-full', 'opacity-0');
            notification.classList.add('translate-x-0', 'opacity-100');
        }, 100);
        
        // Remover automaticamente após duração especificada
        setTimeout(() => {
            this.removeNotification(id);
        }, duration);
    }

    /**
     * 🗑️ Remove notificação específica
     */
    private removeNotification(id: string): void {
        const notification = document.getElementById(id);
        if (notification) {
            // Animar saída
            notification.classList.add('translate-x-full', 'opacity-0');
            
            // Remover do DOM após animação
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }

    /**
     * 🚪 Fecha todos os modais abertos
     */
    private closeAllModals(): void {
        const modals = document.querySelectorAll('.modal-overlay');
        modals.forEach(modal => {
            (modal as HTMLElement).classList.add('hidden');
        });
        console.log('🚪 Todos os modais fechados');
    }

    /**
     * 📱 Mostra modal customizado
     */
    showModal(title: string, content: string, buttons: Array<{text: string, action: () => void, style?: string}>): void {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        
        const buttonElements = buttons.map(button => {
            const buttonClass = button.style || 'bg-blue-600 hover:bg-blue-700 text-white';
            return `<button class="px-4 py-2 rounded-lg font-medium ${buttonClass}" onclick="this.closest('.modal-overlay').remove(); (${button.action.toString()})();">${button.text}</button>`;
        }).join('');
        
        modal.innerHTML = `
            <div class="bg-white rounded-lg max-w-md w-full mx-4 p-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-900">${title}</h3>
                    <button onclick="this.closest('.modal-overlay').remove();" class="text-gray-400 hover:text-gray-600">
                        <span class="sr-only">Fechar</span>
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                <div class="mb-6">
                    <p class="text-gray-600">${content}</p>
                </div>
                <div class="flex justify-end space-x-2">
                    ${buttonElements}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        console.log('📱 Modal mostrado:', title);
    }

    /**
     * 🔄 Atualiza elemento específico na tela
     */
    updateElement(elementId: string, content: string, animate: boolean = false): void {
        const element = document.getElementById(elementId);
        if (element) {
            if (animate) {
                // Animação de fade out
                element.style.opacity = '0';
                
                setTimeout(() => {
                    element.innerHTML = content;
                    // Animação de fade in
                    element.style.opacity = '1';
                }, 150);
            } else {
                element.innerHTML = content;
            }
            
            console.log(`🔄 Elemento ${elementId} atualizado`);
        }
    }

    /**
     * 📊 Mostra/esconde seções da página
     */
    toggleSection(sectionId: string, show: boolean): void {
        const section = document.getElementById(sectionId);
        if (section) {
            if (show) {
                section.classList.remove('hidden');
                console.log(`📊 Seção ${sectionId} mostrada`);
            } else {
                section.classList.add('hidden');
                console.log(`📊 Seção ${sectionId} escondida`);
            }
        }
    }

    /**
     * 🎨 Aplica tema escuro/claro
     */
    setTheme(isDark: boolean): void {
        const html = document.documentElement;
        
        if (isDark) {
            html.classList.add('dark');
            console.log('🌙 Tema escuro aplicado');
        } else {
            html.classList.remove('dark');
            console.log('☀️ Tema claro aplicado');
        }
        
        // Salvar preferência no localStorage
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }

    /**
     * 🔍 Carrega tema salvo do localStorage
     */
    loadSavedTheme(): void {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
        this.setTheme(isDark);
    }

    /**
     * 📱 Detecta se está em dispositivo móvel
     */
    isMobile(): boolean {
        return window.innerWidth < 768;
    }

    /**
     * 🔄 Força atualização da interface
     */
    refreshUI(): void {
        console.log('🔄 Forçando atualização da interface...');
        
        // Recarregar tema
        this.loadSavedTheme();
        
        // Recriar elementos dinâmicos se necessário
        if (!this.loadingIndicator) {
            this.createLoadingIndicator();
        }
        
        if (!this.notificationContainer) {
            this.createNotificationContainer();
        }
        
        console.log('✅ Interface atualizada');
    }

    /**
     * 🎯 Foca em elemento específico
     */
    focusElement(elementId: string): void {
        const element = document.getElementById(elementId);
        if (element) {
            element.focus();
            console.log(`🎯 Foco definido para ${elementId}`);
        }
    }

    /**
     * 📋 Copia texto para área de transferência
     */
    async copyToClipboard(text: string): Promise<boolean> {
        try {
            await navigator.clipboard.writeText(text);
            this.showSuccess('Texto copiado para área de transferência');
            console.log('📋 Texto copiado:', text.substring(0, 50) + '...');
            return true;
        } catch (error) {
            console.error('❌ Erro ao copiar texto:', error);
            this.showError('Erro ao copiar texto');
            return false;
        }
    }
}
