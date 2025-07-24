/**
 * Sistema de Navegação NexaVerse
 * Gerencia a sidebar e navegação entre telas
 */

export interface NavigationItem {
  id: string;
  title: string;
  icon: string;
  active?: boolean;
  badge?: string;
}

export class NavigationManager {
  private currentScreen: string = 'accounts';
  private navigationItems: NavigationItem[] = [
    { id: 'overview', title: 'Overview', icon: '📊' },
    { id: 'accounts', title: 'Accounts', icon: '🏦', active: true },
    { id: 'portfolio', title: 'Portfolio', icon: '💼' },
    { id: 'transactions', title: 'Transactions', icon: '💸' },
    { id: 'analytics', title: 'Analytics', icon: '📈' },
    { id: 'settings', title: 'Settings', icon: '⚙️' }
  ];

  constructor() {
    this.createSidebar();
    this.setupEventListeners();
  }

  createSidebar(): void {
    const sidebar = document.createElement('div');
    sidebar.id = 'sidebar';
    sidebar.className = 'fixed left-0 top-0 h-full w-64 bg-gray-900 text-white z-50 transform transition-transform duration-300 ease-in-out shadow-2xl';
    
    sidebar.innerHTML = `
      <div class="flex flex-col h-full">
        <!-- Logo/Brand -->
        <div class="p-6 border-b border-gray-700">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <span class="text-white font-bold text-lg">RP</span>
            </div>
            <div>
              <h1 class="text-xl font-bold text-white">RP Finances</h1>
              <p class="text-gray-400 text-sm">NexaVerse Edition</p>
            </div>
          </div>
        </div>

        <!-- Navigation Items -->
        <nav class="flex-1 p-4">
          <ul class="space-y-2" id="navigation-list">
            ${this.navigationItems.map(item => this.createNavigationItem(item)).join('')}
          </ul>
        </nav>

        <!-- User Profile -->
        <div class="p-4 border-t border-gray-700">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
              <span class="text-white text-sm font-medium">PA</span>
            </div>
            <div class="flex-1">
              <p class="text-white text-sm font-medium">Pietro Alkmin</p>
              <p class="text-gray-400 text-xs">Investor</p>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(sidebar);
  }

  createNavigationItem(item: NavigationItem): string {
    const activeClass = item.active ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white';
    const badge = item.badge ? `<span class="ml-auto px-2 py-1 text-xs rounded-full bg-red-500 text-white">${item.badge}</span>` : '';
    
    return `
      <li>
        <button 
          class="w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 ${activeClass}"
          data-screen="${item.id}"
          onclick="navigationManager.navigateToScreen('${item.id}')"
        >
          <span class="mr-3 text-lg">${item.icon}</span>
          <span class="font-medium">${item.title}</span>
          ${badge}
        </button>
      </li>
    `;
  }

  navigateToScreen(screenId: string): void {
    console.log(`🔄 Navegando para: ${screenId}`);
    
    // Atualizar estado ativo na navegação
    this.updateActiveNavigation(screenId);
    
    // Esconder todas as telas
    this.hideAllScreens();
    
    // Mostrar tela selecionada
    this.showScreen(screenId);
    
    // Atualizar current screen
    this.currentScreen = screenId;
  }

  updateActiveNavigation(screenId: string): void {
    // Remover ativo de todos
    const navItems = document.querySelectorAll('#navigation-list button');
    navItems.forEach(item => {
      item.classList.remove('bg-blue-600', 'text-white');
      item.classList.add('text-gray-300', 'hover:bg-gray-800', 'hover:text-white');
    });

    // Adicionar ativo ao selecionado
    const activeItem = document.querySelector(`[data-screen="${screenId}"]`);
    if (activeItem) {
      activeItem.classList.remove('text-gray-300', 'hover:bg-gray-800', 'hover:text-white');
      activeItem.classList.add('bg-blue-600', 'text-white');
    }
  }

  hideAllScreens(): void {
    const screens = ['accounts-screen', 'portfolio-screen'];
    screens.forEach(screenId => {
      const screen = document.getElementById(screenId);
      if (screen) {
        screen.style.display = 'none';
      }
    });
  }

  showScreen(screenId: string): void {
    const screenElementId = `${screenId}-screen`;
    const screen = document.getElementById(screenElementId);
    
    if (screen) {
      screen.style.display = 'block';
    } else {
      // Criar tela se não existir
      this.createScreen(screenId);
    }
  }

  createScreen(screenId: string): void {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    const screen = document.createElement('div');
    screen.id = `${screenId}-screen`;
    screen.className = 'min-h-screen p-6';

    switch (screenId) {
      case 'accounts':
        screen.innerHTML = this.createAccountsScreen();
        break;
      case 'portfolio':
        screen.innerHTML = this.createPortfolioScreen();
        break;
      default:
        screen.innerHTML = `
          <div class="text-center py-12">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">🚧 ${screenId.charAt(0).toUpperCase() + screenId.slice(1)}</h2>
            <p class="text-gray-600">Esta tela está em desenvolvimento...</p>
          </div>
        `;
    }

    mainContent.appendChild(screen);
  }

  createAccountsScreen(): string {
    return `
      <div class="max-w-7xl mx-auto">
        <!-- Header da tela Accounts -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Accounts</h1>
          <p class="text-gray-600">Gerencie suas contas bancárias e corretoras conectadas</p>
        </div>

        <!-- Container para conteúdo original das contas -->
        <div id="accounts-content">
          <!-- O conteúdo original será movido para aqui -->
        </div>
      </div>
    `;
  }

  createPortfolioScreen(): string {
    return `
      <div class="max-w-7xl mx-auto">
        <!-- Header da tela Portfolio -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Portfolio Overview</h1>
          <p class="text-gray-600">Análise completa dos seus investimentos e performance</p>
        </div>

        <!-- Container para dashboard moderno -->
        <div id="portfolio-content">
          <!-- O dashboard moderno será carregado aqui -->
        </div>
      </div>
    `;
  }

  setupEventListeners(): void {
    // Event listener para keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.altKey) {
        switch (e.key) {
          case '1':
            this.navigateToScreen('overview');
            break;
          case '2':
            this.navigateToScreen('accounts');
            break;
          case '3':
            this.navigateToScreen('portfolio');
            break;
        }
      }
    });
  }

  // Método para integração com o sistema existente
  moveContentToScreen(contentId: string, targetScreen: string): void {
    const content = document.getElementById(contentId);
    const targetContainer = document.getElementById(`${targetScreen}-content`);
    
    if (content && targetContainer) {
      targetContainer.appendChild(content);
    }
  }

  getCurrentScreen(): string {
    return this.currentScreen;
  }
}

// Tornar disponível globalmente
declare global {
  interface Window {
    navigationManager: NavigationManager;
  }
}

export default NavigationManager;
