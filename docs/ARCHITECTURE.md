# 📖 Documentação Técnica - RP-Finances

## 🏗️ Arquitetura do Sistema

### Stack Tecnológico
- **Frontend:** TypeScript + Vite + Tailwind CSS
- **APIs:** Pluggy (bancos) + Binance (crypto)
- **Autenticação:** HMAC-SHA256 (Binance) + OAuth (Pluggy)
- **Estado:** LocalStorage + StateManager personalizado

### Estrutura de Diretórios
```
RP-Finances/
├── docs/                     # Documentação
├── src/
│   ├── config/              # Configurações
│   │   ├── environment.js   # Variáveis de ambiente
│   │   └── binance.ts       # Config Binance
│   ├── ts/
│   │   ├── integrations/    # Integrações externas
│   │   │   ├── binance/     # Cliente Binance
│   │   │   ├── pluggy/      # Cliente Pluggy
│   │   │   └── supabase/    # Cliente Supabase
│   │   ├── portfolio/       # Lógica de portfólio
│   │   ├── ui/              # Interface do usuário
│   │   └── utils/           # Utilitários
│   └── styles/              # Estilos CSS
└── proxy-binance-simple.js  # Proxy para Binance API
```

## 🔧 Setup e Configuração

### 1. Variáveis de Ambiente
Criar arquivo `.env` na raiz:
```env
# Pluggy API
VITE_PLUGGY_CLIENT_ID=seu_client_id
VITE_PLUGGY_CLIENT_SECRET=seu_client_secret

# Binance API
VITE_BINANCE_API_KEY=sua_api_key
VITE_BINANCE_SECRET_KEY=sua_secret_key

# Supabase (opcional)
VITE_SUPABASE_URL=sua_url
VITE_SUPABASE_ANON_KEY=sua_key
```

### 2. Instalação
```bash
npm install
npm run dev
```

### 3. Proxy Binance
Em terminal separado:
```bash
node proxy-binance-simple.js
```

## 🔌 Integrações

### Pluggy Integration
**Arquivo:** `src/ts/integrations/pluggy/PluggyClient.ts`
- Conecta contas bancárias brasileiras
- Coleta investimentos, saldos, transações
- Autenticação via API Key + Connect Token

**Endpoints principais:**
- `/auth` - Obter API Key
- `/connect_token` - Token para widget
- `/accounts` - Listar contas
- `/investments` - Listar investimentos

### Binance Integration
**Arquivo:** `src/ts/integrations/binance/BinanceInvestmentCollector.ts`
- Coleta histórico completo de transações crypto
- Implementa chunking para limitações de API
- Calcula preços médios de compra

**Endpoints cobertos:**
- Trades spot
- Depósitos/Saques
- Conversões de moeda
- Transações P2P
- Dividendos de ativos
- Transações fiat

### Chunking Strategy
```typescript
// Diferentes limitações por endpoint
const ENDPOINT_LIMITS = {
  trades: 7,           // 7 dias
  deposits: 89,        // 89 dias
  withdrawals: 89,     // 89 dias
  conversions: 30,     // 30 dias
  p2p: 30,            // 30 dias
  fiat: 30            // 30 dias
};
```

## 📊 Fluxo de Dados

### 1. Coleta de Dados
```
Pluggy API ──→ InvestmentCollector ──→ Investment[]
Binance API ──→ BinanceCollector ──→ BinanceTransaction[]
```

### 2. Processamento
```
Raw Data ──→ StateManager ──→ LocalStorage
                ↓
         PortfolioManager ──→ Summary/Analytics
```

### 3. Exibição
```
Processed Data ──→ UIManager ──→ HTML/CSS Updates
```

## 🔐 Segurança

### Binance API
- **HMAC-SHA256:** Todas as requisições assinadas
- **Timestamp:** Sincronização obrigatória
- **Proxy Local:** Evita exposição de chaves no frontend

### Pluggy API
- **OAuth Flow:** Autenticação segura
- **API Keys:** Renovação automática
- **HTTPS Only:** Comunicação criptografada

### Dados Sensíveis
- **LocalStorage:** Apenas IDs de conexão
- **Environment:** Chaves em variáveis de ambiente
- **No Logging:** Dados financeiros não são logados

## 🧪 Testes e Debug

### Debug Mode
```javascript
// Ativar no environment.js
debug: true

// Logs detalhados aparecerão no console
```

### Testes Manuais
```javascript
// No console do browser
await app.testPluggyConnection();
await app.testBinanceConnection();
await app.calculateBinanceAveragePrices();
```

### Endpoints de Teste
```javascript
// Verificar configuração
console.log(ENVIRONMENT_CONFIG);
console.log(BINANCE_CONFIG);

// Testar APIs
fetch('http://localhost:3009/api/binance/account');
```

## 🔄 State Management

### StateManager
**Arquivo:** `src/ts/utils/StateManager.ts`
- Persiste estado no localStorage
- Gerencia IDs de conexões ativas
- Backup/restore de dados

### Estrutura do Estado
```typescript
interface AppState {
  pluggyItemIds: string[];
  lastUpdate: string;
  portfolioCache: PortfolioSummary;
  binanceLastSync: string;
}
```

## 🎨 UI Components

### Responsive Design
- **Mobile First:** Tailwind CSS classes
- **Dark/Light Mode:** Suporte completo
- **Modular:** Componentes reutilizáveis

### Key UI Elements
- Portfolio Dashboard
- Connection Manager
- Transaction History
- Analytics Charts (futuro)

## 🚀 Performance

### Otimizações Implementadas
- **Lazy Loading:** Módulos carregados sob demanda
- **Caching:** LocalStorage para dados estáticos
- **Debouncing:** Requisições de API otimizadas
- **Chunking:** Requisições grandes divididas

### Métricas Alvo
- **TTI:** < 2s (Time to Interactive)
- **API Response:** < 5s para dados completos
- **Memory Usage:** < 50MB no browser

## 🔮 Roadmap Futuro

### Funcionalidades Planejadas
- [ ] Gráficos interativos (Chart.js)
- [ ] Alertas de preço
- [ ] Exportação para Excel/PDF
- [ ] Análise de rentabilidade avançada
- [ ] Integração com mais exchanges
- [ ] Mobile app (PWA)

### Melhorias Técnicas
- [ ] Testes automatizados
- [ ] CI/CD pipeline
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring
- [ ] Database migration (Supabase)

---

*Esta documentação é viva e deve ser atualizada conforme o projeto evolui.*
