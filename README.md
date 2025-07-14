# RP-Finances - Portfolio Inteligente

## 🎯 Sobre o Projeto

RP-Finances é uma plataforma moderna e inteligente para gestão de investimentos que permite aos usuários visualizar todos os seus investimentos em um só lugar através da integração com a API Pluggy.

## ✨ Funcionalidades

- **Dashboard Premium**: Interface moderna com design glassmorphism e animações suaves
- **Integração Pluggy**: Conecta de forma segura com contas bancárias e corretoras
- **Visualização Inteligente**: Agrupa investimentos por instituição com cards interativos
- **Métricas Avançadas**: Mostra saldo, rentabilidade e performance de cada investimento
- **Responsivo**: Funciona perfeitamente em desktop e mobile

## 🛠️ Tecnologias

- **Frontend**: TypeScript, HTML5, CSS3
- **Styling**: Tailwind CSS com componentes customizados
- **Build**: Vite (desenvolvimento e produção)
- **Integração**: Pluggy API para dados bancários
- **Fonts**: Inter (Google Fonts)

## 🚀 Como Executar

### Pré-requisitos
- Node.js (versão 18 ou superior)
- NPM ou Yarn
- Credenciais da API Pluggy

### Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/rp-finances.git
cd rp-finances
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
# Crie o arquivo src/config/environment.ts com suas credenciais Pluggy
cp src/config/environment.example.ts src/config/environment.ts
```

4. **Execute em modo desenvolvimento**
```bash
npm run dev
```

5. **Acesse a aplicação**
```
http://localhost:3000
```

## 🎨 Interface Modernizada

### Header Premium
- Gradiente escuro elegante
- Logo com ícone de diamante
- Botão de conexão com hover elegante
- Background pattern sutil

### Cards de Resumo
- 4 cards principais com métricas importantes
- Animações hover com rotação e elevação
- Gradientes únicos para cada métrica
- Ícones SVG modernos

### Lista de Investimentos
- Agrupamento por instituição financeira
- Cards interativos com hover states
- Indicadores visuais de performance
- Ícones específicos por tipo de investimento
- Botões de ação em hover

### Componentes Visuais
- **Glass effect**: Backgrounds translúcidos com blur
- **Smooth animations**: Transições de 300-500ms
- **Hover states**: Transformações elegantes
- **Color coding**: Cores semânticas para ganhos/perdas
- **Typography**: Fonte Inter com pesos variados

## 📊 Tipos de Investimento Suportados

| Tipo | Subtipo | Ícone |
|------|---------|-------|
| Renda Fixa | CDB, LCI, LCA, Tesouro | 💎 🏛️ 🌾 |
| Ações | Ações, BDRs, FIIs | 📈 |
| Fundos | Multimercado, Ações | 📊 |
| Previdência | PGBL, VGBL | 🎯 |
| Poupança | Conta Poupança | 🐷 |

## 🔧 Estrutura do Projeto

```
src/
├── ts/                          # TypeScript
│   ├── integrations/pluggy/     # Integração Pluggy
│   ├── portfolio/               # Gestão de portfolio
│   └── main.ts                  # Arquivo principal
├── styles/                      # CSS/Tailwind
│   └── main.css                 # Estilos principais
├── config/                      # Configurações
│   └── environment.ts           # Variáveis de ambiente
└── index.html                   # HTML principal
```

## 🎯 Próximos Passos

- [ ] **Gráficos**: Charts.js para visualizações avançadas
- [ ] **Backend**: Integração com Supabase
- [ ] **Autenticação**: Sistema de login
- [ ] **Histórico**: Acompanhamento temporal
- [ ] **Alertas**: Notificações de performance
- [ ] **Export**: PDF e Excel dos relatórios
- [ ] **Mobile App**: React Native ou PWA

## 🧪 Dados de Demonstração

A aplicação inclui dados de exemplo para demonstrar a interface:
- 5 investimentos fictícios
- 3 instituições diferentes
- Mixagem de tipos (Renda Fixa, Ações, Fundos)
- Performance positiva e negativa

## 🔒 Segurança

- **Sandbox Mode**: Testes seguros com dados fictícios
- **API Keys**: Nunca expostas no frontend
- **HTTPS**: Comunicação criptografada
- **Tokens**: Autenticação via tokens temporários

## 📱 Responsividade

- **Desktop**: Layout completo com 4 colunas
- **Tablet**: 2 colunas adaptadas
- **Mobile**: 1 coluna com stack vertical
- **Hover**: Desabilitado em touch devices

## 🎨 Paleta de Cores

```css
/* Principais */
--slate: #64748b
--blue: #3b82f6  
--purple: #8b5cf6
--indigo: #6366f1

/* Status */
--emerald: #10b981 (ganhos)
--red: #ef4444 (perdas)
--orange: #f59e0b (neutro)
```

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor, leia o guia de contribuição antes de submeter pull requests.

## 📞 Suporte

Para suporte e dúvidas:
- Email: suporte@rp-finances.com
- Issues: GitHub Issues
- Docs: [Documentação Pluggy](https://docs.pluggy.ai)

---

**RP-Finances** - Transformando a gestão de investimentos com tecnologia moderna.
