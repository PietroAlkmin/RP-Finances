# Dashboard Financeiro Global

Um dashboard interativo para visualização de dados financeiros globais, incluindo índices, ações, criptomoedas e notícias do mercado.

## Funcionalidades

- Visualização de índices globais e seu desempenho
- Análise de ações por setor e região
- Acompanhamento de criptomoedas e outros ativos
- Feed de notícias financeiras com análise de sentimento
- Atualização em tempo real dos dados

## Configuração

### Pré-requisitos

- Node.js (versão 14 ou superior)
- NPM (gerenciador de pacotes do Node.js)

### Instalação

1. Clone este repositório:
   ```
   git clone <url-do-repositorio>
   cd dashboard-financeiro
   ```

2. Instale as dependências:
   ```
   npm install
   ```

3. Configure suas chaves de API:
   - Abra o arquivo `dashboard/js/config.js`
   - Substitua as chaves de API de demonstração pelas suas chaves reais:
     - Obtenha uma chave da [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
     - Obtenha uma chave da [News API](https://newsapi.org/register)

### Executando o projeto

1. Inicie o servidor proxy:
   ```
   npm start
   ```

2. Acesse o dashboard no navegador:
   ```
   http://localhost:3000
   ```

## Estrutura do Projeto

- `dashboard/` - Arquivos do frontend
  - `index.html` - Página principal do dashboard
  - `best-assets.html` - Página de melhores ativos
  - `news.html` - Página de notícias financeiras
  - `css/` - Estilos CSS
  - `js/` - Scripts JavaScript
    - `config.js` - Configurações globais
    - `data-loader.js` - Carregamento de dados das APIs
    - `dashboard.js` - Lógica da página principal
    - `charts.js` - Configuração de gráficos
    - `realtime-updater.js` - Atualização em tempo real
- `proxy-server.js` - Servidor proxy para contornar problemas de CORS
- `package.json` - Configuração do projeto Node.js

## Uso de APIs

O dashboard utiliza as seguintes APIs:

- **Yahoo Finance** - Dados de índices e ações
- **Alpha Vantage** - Dados financeiros detalhados
- **News API** - Notícias financeiras

## Solução de Problemas

### Problemas de CORS

O projeto inclui um servidor proxy para contornar problemas de CORS ao fazer chamadas diretas às APIs. Certifique-se de que o servidor proxy esteja em execução antes de acessar o dashboard.

### Limites de API

As APIs gratuitas têm limites de requisições. Se você encontrar erros relacionados a limites excedidos, o dashboard usará dados simulados como fallback.

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.
