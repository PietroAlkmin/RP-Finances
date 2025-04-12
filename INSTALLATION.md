# Guia de Instalação do Dashboard Financeiro

Este guia fornece instruções passo a passo para configurar e executar o Dashboard Financeiro com suas chaves de API.

## Pré-requisitos

- Node.js (versão 14 ou superior)
- NPM (gerenciador de pacotes do Node.js)
- Navegador web moderno (Chrome, Firefox, Edge, etc.)

## Passo 1: Instalar Dependências

Abra um terminal na pasta raiz do projeto e execute:

```bash
npm install
```

Isso instalará todas as dependências necessárias, incluindo:
- Express (servidor web)
- Axios (cliente HTTP)
- CORS (para lidar com problemas de Cross-Origin Resource Sharing)

## Passo 2: Verificar Configuração de API

As chaves de API já foram configuradas no arquivo `dashboard/js/config.js`:

- Alpha Vantage API: `AW76YEYYVF2XFURD`
- News API: `611c5757a6014311912d7e2063ee524c`

Se você precisar alterar essas chaves no futuro, edite o arquivo `dashboard/js/config.js`.

## Passo 3: Iniciar o Servidor Proxy

O servidor proxy é necessário para contornar problemas de CORS ao fazer chamadas de API diretamente do navegador.

Execute o seguinte comando na pasta raiz do projeto:

```bash
npm start
```

Você deverá ver uma mensagem indicando que o servidor está em execução:
```
Proxy server running on http://localhost:3000
Dashboard available at http://localhost:3000
```

## Passo 4: Acessar o Dashboard

Abra seu navegador e acesse:

```
http://localhost:3000
```

Você deverá ver o Dashboard Financeiro carregado com dados reais das APIs configuradas.

## Solução de Problemas

### Limites de API

As APIs gratuitas têm limites de requisições:

- **Alpha Vantage**: Limite de 5 requisições por minuto e 500 por dia
- **News API**: Limite de 100 requisições por dia no plano gratuito

Se você encontrar erros relacionados a limites excedidos, o dashboard usará dados simulados como fallback.

### Problemas de CORS

Se você encontrar erros de CORS mesmo usando o servidor proxy, verifique:

1. Se o servidor proxy está em execução
2. Se as URLs no arquivo `config.js` estão corretas
3. Se o parâmetro `useProxy` está definido como `true`

### Dados Não Aparecem

Se os dados não aparecerem:

1. Verifique o console do navegador para erros
2. Confirme que suas chaves de API são válidas
3. Verifique se o servidor proxy está em execução

## Personalização

### Alterar Símbolos de Ações

Para alterar os símbolos de ações monitorados, edite o arquivo `dashboard/js/config.js` na seção `assetTypes`.

### Alterar Fontes de Notícias

Para alterar as fontes de notícias, edite o arquivo `dashboard/js/config.js` na seção `newsSources`.

### Alterar Intervalo de Atualização

Para alterar a frequência de atualização dos dados, edite o arquivo `dashboard/js/config.js` na seção `realtime`.
