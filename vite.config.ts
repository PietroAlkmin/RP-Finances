/**
 * Configuração do Vite - Build tool moderno para desenvolvimento
 * 
 * Vite oferece:
 * - Hot Module Replacement (HMR) super rápido
 * - Build otimizado para produção
 * - Suporte nativo ao TypeScript
 * - Integração perfeita com Tailwind CSS
 */

import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Diretório raiz do projeto
  root: './src',
  
  // Diretório onde estão os arquivos .env (diretório raiz do projeto)
  envDir: '../',
  
  // Definir variáveis globais para evitar erros de Node.js no browser
  define: {
    global: 'globalThis',
    'process.env': {}
  },
  
  // Diretório de build/output
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    // Configuração para múltiplas páginas HTML
    rollupOptions: {
      input: {
        // Página principal: Portfolio
        main: resolve(__dirname, 'src/index.html'),
        // Outras páginas podem ser adicionadas aqui conforme necessário
      }
    }
  },
  
  // Configuração do servidor de desenvolvimento
  server: {
    port: 3000,
    open: true, // Abre o navegador automaticamente
    host: true  // Permite acesso de outros dispositivos na rede
  },
  
  // Resolver aliases para imports mais limpos
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@ts': resolve(__dirname, 'src/ts'),
      '@styles': resolve(__dirname, 'src/styles'),
      '@assets': resolve(__dirname, 'src/assets')
    }
  }
});
