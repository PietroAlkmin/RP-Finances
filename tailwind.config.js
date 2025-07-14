/**
 * Configuração do Tailwind CSS
 * 
 * Tailwind é um framework CSS utility-first que permite:
 * - Classes pré-definidas (text-blue-500, bg-gray-100, etc.)
 * - Design consistente e responsivo
 * - Customização completa de cores, espaçamentos, etc.
 * - Purge automático de CSS não utilizado
 */

/** @type {import('tailwindcss').Config} */
export default {
  // Arquivos que o Tailwind deve monitorar para classes CSS
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}",
    "./src/pages/**/*.html",
    "./src/ts/**/*.ts"
  ],
  
  theme: {
    extend: {
      // Cores personalizadas para a plataforma financeira
      colors: {
        // Cores principais da marca
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe', 
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          900: '#0c4a6e'
        },
        
        // Cores para dados financeiros
        finance: {
          gain: '#10b981',    // Verde para ganhos
          loss: '#ef4444',     // Vermelho para perdas
          neutral: '#6b7280'   // Cinza para neutro
        },
        
        // Cores de fundo para cards e seções
        surface: {
          primary: '#ffffff',
          secondary: '#f8fafc',
          tertiary: '#f1f5f9'
        }
      },
      
      // Fontes personalizadas
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      
      // Animações para transições suaves
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite'
      }
    },
  },
  
  // Plugins do Tailwind para funcionalidades extras
  plugins: [
    // Plugin para formulários estilizados
    // require('@tailwindcss/forms'),
    // Plugin para tipografia
    // require('@tailwindcss/typography'),
  ],
}
