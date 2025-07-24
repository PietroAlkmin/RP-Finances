# 🔧 Guia de Troubleshooting - RP-Finances

Este documento contém soluções para problemas comuns encontrados durante o desenvolvimento e uso da aplicação RP-Finances.

## 📋 Índice

- [Problemas de Ambiente](#problemas-de-ambiente)
- [Erros da API Binance](#erros-da-api-binance)
- [Problemas do Pluggy](#problemas-do-pluggy)
- [Erros de Configuração](#erros-de-configuração)
- [Problemas de Build/Desenvolvimento](#problemas-de-buildesenvolvimento)

---

## 🌍 Problemas de Ambiente

### ❌ Erro: "Cannot read properties of undefined (reading 'clientId')"

**Causa:** Variáveis de ambiente não estão sendo carregadas corretamente.

**Solução:**
1. Verificar se o arquivo `.env` existe na raiz do projeto
2. Confirmar se as variáveis têm o prefixo `VITE_`:
   ```env
   VITE_PLUGGY_CLIENT_ID=seu_client_id
   VITE_PLUGGY_CLIENT_SECRET=seu_client_secret
   ```
3. Verificar configuração do Vite em `vite.config.ts`:
   ```typescript
   export default defineConfig({
     envDir: '../', // Aponta para a raiz do projeto
     // ...
   });
   ```
4. Reiniciar o servidor de desenvolvimento

### ❌ Erro: "Module not found: environment.js"

**Causa:** Arquivo de configuração de ambiente não existe ou caminho incorreto.

**Solução:**
1. Criar o arquivo `src/config/environment.js`:
   ```javascript
   export const ENVIRONMENT_CONFIG = {
     pluggy: {
       clientId: import.meta.env.VITE_PLUGGY_CLIENT_ID || '',
       clientSecret: import.meta.env.VITE_PLUGGY_CLIENT_SECRET || '',
       baseUrl: 'https://api.pluggy.ai'
     }
   };
   ```
2. Verificar se o import no `main.ts` está correto:
   ```typescript
   import { ENVIRONMENT_CONFIG } from '../config/environment.js';
   ```

---

## ₿ Erros da API Binance

### ❌ Erro: "Time interval must be within 0-90 days"

**Causa:** APIs da Binance têm limitações de tempo diferentes para cada endpoint.

**Solução:** Implementar chunking inteligente:
```typescript
// Para deposits/withdrawals: chunks de 89 dias
const chunks = this.createTimeChunks(startTime, endTime, 89);

// Para conversions: chunks de 30 dias
const chunks = this.createTimeChunks(startTime, endTime, 30);
```

**Limitações por endpoint:**
- `/sapi/v1/capital/deposit/hisrec`: 90 dias
- `/sapi/v1/capital/withdraw/history`: 90 dias
- `/sapi/v1/asset/assetDividend`: 30 dias
- `/sapi/v1/convert/tradeFlow`: 30 dias

### ❌ Erro: "Invalid signature"

**Causa:** Problemas na geração da assinatura HMAC-SHA256.

**Solução:**
1. Verificar se a API Secret está correta no `.env`
2. Confirmar que o timestamp está sincronizado:
   ```typescript
   const timestamp = Date.now();
   const queryString = `timestamp=${timestamp}&${params}`;
   ```
3. Verificar se todos os parâmetros estão sendo incluídos na assinatura
4. Usar o proxy server para evitar problemas de CORS

### ❌ Erro: "Request timeout" ou "Network error"

**Causa:** APIs da Binance podem ser lentas ou instáveis.

**Solução:** Implementar retry com backoff:
```typescript
async makeApiCall(url: string, options: any, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

---

## 🏦 Problemas do Pluggy

### ❌ Erro: "Failed to fetch :3004/undefined/auth"

**Causa:** Configuração do `baseUrl` ausente na configuração do Pluggy.

**Solução:**
1. Adicionar `baseUrl` na configuração:
   ```javascript
   pluggy: {
     clientId: import.meta.env.VITE_PLUGGY_CLIENT_ID,
     clientSecret: import.meta.env.VITE_PLUGGY_CLIENT_SECRET,
     baseUrl: 'https://api.pluggy.ai' // ← Adicionar esta linha
   }
   ```

### ❌ Erro: "401 Unauthorized" na API Pluggy

**Causa:** Credenciais incorretas ou expiradas.

**Solução:**
1. Verificar credenciais no painel Pluggy
2. Confirmar se está usando o ambiente correto (sandbox vs produção)
3. Regenerar API Key se necessário
4. Verificar se o token de acesso não expirou

### ❌ Erro: "CORS policy" ao conectar com Pluggy

**Causa:** Restrições de CORS entre domínios.

**Solução:**
1. Usar proxy server local (como fizemos com Binance)
2. Ou configurar CORS no backend
3. Verificar se a URL do Pluggy Widget está correta

---

## ⚙️ Erros de Configuração

### ❌ Erro: "localStorage is not defined"

**Causa:** Tentativa de usar localStorage no server-side ou antes do DOM carregar.

**Solução:**
```typescript
// Verificar se está no browser
if (typeof window !== 'undefined' && window.localStorage) {
  // Usar localStorage aqui
}

// Ou aguardar DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Código que usa localStorage
});
```

### ❌ Erro: "Cannot import outside a module"

**Causa:** Problemas de configuração de módulos ES6.

**Solução:**
1. Verificar `package.json`:
   ```json
   {
     "type": "module"
   }
   ```
2. Usar extensões `.js` nos imports:
   ```typescript
   import { MyClass } from './MyClass.js'; // ← .js mesmo em arquivo .ts
   ```

---

## 🔨 Problemas de Build/Desenvolvimento

### ❌ Erro: "Port already in use"

**Causa:** Porta já está sendo usada por outro processo.

**Solução:**
1. O Vite automaticamente procura próxima porta disponível
2. Ou matar processo manualmente:
   ```powershell
   # Windows PowerShell
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

### ❌ Erro: "Module not found" após adicionar novo arquivo

**Causa:** Cache do Vite ou imports incorretos.

**Solução:**
1. Reiniciar o servidor de desenvolvimento
2. Limpar cache: `npm run dev -- --force`
3. Verificar se o caminho do import está correto
4. Verificar se o arquivo foi salvo

### ❌ Erro: "TypeScript errors" em produção

**Causa:** Configuração do TypeScript muito restritiva.

**Solução:**
1. Verificar `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "strict": true,
       "noImplicitAny": false, // Para desenvolvimento
       "skipLibCheck": true
     }
   }
   ```

---

## 🚀 Comandos Úteis para Debug

```bash
# Verificar portas em uso
netstat -ano | findstr :3000

# Limpar cache do npm
npm cache clean --force

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install

# Verificar variáveis de ambiente carregadas
# (no browser console)
console.log(import.meta.env);

# Testar API Binance manualmente
curl -X GET "http://localhost:3009/api/binance/account"

# Verificar logs detalhados do Vite
npm run dev -- --debug
```

---

## 📞 Quando Pedir Ajuda

Se você encontrar um erro não documentado aqui:

1. **Copie a mensagem de erro completa** (incluindo stack trace)
2. **Descreva os passos** que levaram ao erro
3. **Inclua informações do ambiente:**
   - Versão do Node.js: `node --version`
   - Versão do npm: `npm --version`
   - Sistema operacional
   - Browser usado

4. **Verifique primeiro:**
   - Console do browser (F12)
   - Terminal onde o servidor está rodando
   - Arquivos de log se existirem

---

## 🔄 Checklist de Troubleshooting Geral

Antes de procurar ajuda, tente:

- [ ] Reiniciar o servidor de desenvolvimento
- [ ] Verificar se todas as variáveis de ambiente estão configuradas
- [ ] Confirmar se o arquivo `.env` está na raiz do projeto
- [ ] Verificar se não há erros de sintaxe nos arquivos editados
- [ ] Limpar cache do browser (Ctrl+Shift+R)
- [ ] Verificar console do browser para erros JavaScript
- [ ] Confirmar se as dependências estão instaladas (`npm install`)
- [ ] Verificar se o proxy da Binance está rodando (porta 3009)

---

*Última atualização: 24 de Julho de 2025*
