/**
 * Proxy server simplificado para contornar CORS da API Binance
 */

import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import crypto from 'crypto';
import dotenv from 'dotenv';

// Carrega variáveis de ambiente do arquivo .env
dotenv.config();

const app = express();
const PORT = 3009;

// Middleware
app.use(cors());
app.use(express.json());

// Configuração da API Binance
const BINANCE_BASE_URL = 'https://api.binance.com';

/**
 * Gera assinatura HMAC-SHA256 para autenticação Binance
 */
function generateSignature(queryString, apiSecret) {
  return crypto
    .createHmac('sha256', apiSecret)
    .update(queryString)
    .digest('hex');
}

/**
 * Middleware para adicionar headers de autenticação Binance
 */
function addBinanceAuth(req, res, next) {
  // Usa credenciais do arquivo .env, não do frontend
  const apiKey = process.env.BINANCE_API_KEY;
  const apiSecret = process.env.BINANCE_API_SECRET;
  
  if (!apiKey || !apiSecret) {
    console.error('❌ BINANCE_API_KEY ou BINANCE_API_SECRET não encontradas no .env');
    return res.status(500).json({ 
      error: 'Credenciais Binance não configuradas no servidor',
      hint: 'Configure BINANCE_API_KEY e BINANCE_API_SECRET no arquivo .env'
    });
  }
  
  console.log(`🔑 Usando API Key: ${apiKey.substring(0, 8)}...`);
  
  // Gera nova assinatura no servidor com as credenciais corretas
  if (req.query.timestamp) {
    // Primeiro, cria a query string SEM a assinatura
    const queryString = new URLSearchParams(req.query).toString();
    // Depois, gera a assinatura baseada na query string
    const signature = generateSignature(queryString, apiSecret);
    
    // IMPORTANTE: Salva os parâmetros + assinatura em um objeto customizado
    req.binanceQuery = {
      ...req.query,
      signature: signature
    };
    
    console.log(`🔐 Query string original: ${queryString}`);
    console.log(`🔐 Assinatura gerada: ${signature.substring(0, 16)}...`);
    console.log(`🔐 Query params finais:`, Object.keys(req.binanceQuery));
  } else {
    // Se não tem timestamp, apenas copia os params originais
    req.binanceQuery = { ...req.query };
  }
  
  req.binanceHeaders = {
    'X-MBX-APIKEY': apiKey,
    'Content-Type': 'application/json'
  };
  
  next();
}

/**
 * Rotas específicas para evitar problemas com wildcards
 */

// Ping endpoint (sem auth)
app.get('/api/binance/api/v3/ping', async (req, res) => {
  try {
    console.log('🌐 Proxy Binance: GET /api/v3/ping');
    const response = await fetch(`${BINANCE_BASE_URL}/api/v3/ping`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('❌ Proxy Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Time endpoint (sem auth)
app.get('/api/binance/api/v3/time', async (req, res) => {
  try {
    console.log('🌐 Proxy Binance: GET /api/v3/time');
    const response = await fetch(`${BINANCE_BASE_URL}/api/v3/time`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('❌ Proxy Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Account endpoint (com auth)
app.get('/api/binance/api/v3/account', addBinanceAuth, async (req, res) => {
  try {
    const url = new URL('/api/v3/account', BINANCE_BASE_URL);
    
    console.log(`🔍 Debug - req.binanceQuery:`, req.binanceQuery);
    console.log(`🔍 Debug - signature em binanceQuery:`, req.binanceQuery.signature ? 'PRESENTE' : 'AUSENTE');
    
    // Adiciona query parameters incluindo a assinatura gerada pelo middleware
    Object.keys(req.binanceQuery).forEach(key => {
      url.searchParams.append(key, req.binanceQuery[key]);
      console.log(`🔍 Adicionando param: ${key} = ${req.binanceQuery[key].substring ? req.binanceQuery[key].substring(0, 16) + '...' : req.binanceQuery[key]}`);
    });
    
    console.log(`🌐 Proxy Binance: GET ${url.toString()}`);
    console.log(`🔐 Query params incluem signature: ${url.searchParams.has('signature')}`);
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: req.binanceHeaders
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Binance API Error:', data);
      return res.status(response.status).json(data);
    }
    
    console.log('✅ Binance API Success');
    res.json(data);
    
  } catch (error) {
    console.error('❌ Proxy Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Price endpoints (sem auth)
app.get('/api/binance/api/v3/ticker/price', async (req, res) => {
  try {
    const url = new URL('/api/v3/ticker/price', BINANCE_BASE_URL);
    
    // Adiciona query parameters
    Object.keys(req.query).forEach(key => {
      url.searchParams.append(key, req.query[key]);
    });
    
    console.log(`🌐 Proxy Binance: GET ${url.toString()}`);
    const response = await fetch(url.toString());
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('❌ Proxy Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 24hr ticker statistics endpoint (sem auth)
app.get('/api/binance/api/v3/ticker/24hr', async (req, res) => {
  try {
    const url = new URL('/api/v3/ticker/24hr', BINANCE_BASE_URL);
    
    // Adiciona query parameters
    Object.keys(req.query).forEach(key => {
      url.searchParams.append(key, req.query[key]);
    });
    
    console.log(`🌐 Proxy Binance: GET ${url.toString()}`);
    const response = await fetch(url.toString());
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('❌ Proxy Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// My trades endpoint (com auth)
app.get('/api/binance/api/v3/myTrades', addBinanceAuth, async (req, res) => {
  try {
    const url = new URL('/api/v3/myTrades', BINANCE_BASE_URL);
    
    console.log(`🔍 Debug myTrades - req.binanceQuery:`, req.binanceQuery);
    console.log(`🔍 Debug myTrades - signature em binanceQuery:`, req.binanceQuery.signature ? 'PRESENTE' : 'AUSENTE');
    
    // Adiciona query parameters incluindo a assinatura gerada pelo middleware
    Object.keys(req.binanceQuery).forEach(key => {
      url.searchParams.append(key, req.binanceQuery[key]);
      console.log(`🔍 myTrades - Adicionando param: ${key} = ${req.binanceQuery[key].substring ? req.binanceQuery[key].substring(0, 16) + '...' : req.binanceQuery[key]}`);
    });
    
    console.log(`🌐 Proxy Binance: GET ${url.toString()}`);
    console.log(`🔐 myTrades - Query params incluem signature: ${url.searchParams.has('signature')}`);
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: req.binanceHeaders
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Binance API Error:', data);
      return res.status(response.status).json(data);
    }
    
    console.log('✅ myTrades Binance API Success');
    res.json(data);
    
  } catch (error) {
    console.error('❌ myTrades Proxy Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Deposit history endpoint (com auth)
app.get('/api/binance/sapi/v1/capital/deposit/hisrec', addBinanceAuth, async (req, res) => {
  try {
    const url = new URL('/sapi/v1/capital/deposit/hisrec', BINANCE_BASE_URL);
    
    console.log(`🔍 Debug depositHistory - req.binanceQuery:`, req.binanceQuery);
    console.log(`🔍 Debug depositHistory - signature em binanceQuery:`, req.binanceQuery.signature ? 'PRESENTE' : 'AUSENTE');
    
    // Adiciona query parameters incluindo a assinatura gerada pelo middleware
    Object.keys(req.binanceQuery).forEach(key => {
      url.searchParams.append(key, req.binanceQuery[key]);
      console.log(`🔍 depositHistory - Adicionando param: ${key} = ${req.binanceQuery[key].substring ? req.binanceQuery[key].substring(0, 16) + '...' : req.binanceQuery[key]}`);
    });
    
    console.log(`🌐 Proxy Binance: GET ${url.toString()}`);
    console.log(`🔐 depositHistory - Query params incluem signature: ${url.searchParams.has('signature')}`);
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: req.binanceHeaders
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Binance API Error:', data);
      return res.status(response.status).json(data);
    }
    
    console.log('✅ depositHistory Binance API Success');
    res.json(data);
    
  } catch (error) {
    console.error('❌ depositHistory Proxy Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Withdrawal history endpoint (com auth)
app.get('/api/binance/sapi/v1/capital/withdraw/history', addBinanceAuth, async (req, res) => {
  try {
    const url = new URL('/sapi/v1/capital/withdraw/history', BINANCE_BASE_URL);
    
    console.log(`🔍 Debug withdrawHistory - req.binanceQuery:`, req.binanceQuery);
    console.log(`🔍 Debug withdrawHistory - signature em binanceQuery:`, req.binanceQuery.signature ? 'PRESENTE' : 'AUSENTE');
    
    // Adiciona query parameters incluindo a assinatura gerada pelo middleware
    Object.keys(req.binanceQuery).forEach(key => {
      url.searchParams.append(key, req.binanceQuery[key]);
      console.log(`🔍 withdrawHistory - Adicionando param: ${key} = ${req.binanceQuery[key].substring ? req.binanceQuery[key].substring(0, 16) + '...' : req.binanceQuery[key]}`);
    });
    
    console.log(`🌐 Proxy Binance: GET ${url.toString()}`);
    console.log(`🔐 withdrawHistory - Query params incluem signature: ${url.searchParams.has('signature')}`);
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: req.binanceHeaders
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Binance API Error:', data);
      return res.status(response.status).json(data);
    }
    
    console.log('✅ withdrawHistory Binance API Success');
    res.json(data);
    
  } catch (error) {
    console.error('❌ withdrawHistory Proxy Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Convert trade flow endpoint (com auth) - ESTE É ONDE SUAS COMPRAS PODEM ESTAR!
app.get('/api/binance/sapi/v1/convert/tradeFlow', addBinanceAuth, async (req, res) => {
  try {
    const url = new URL('/sapi/v1/convert/tradeFlow', BINANCE_BASE_URL);
    
    console.log(`🔍 Debug convertTradeFlow - req.binanceQuery:`, req.binanceQuery);
    console.log(`🔍 Debug convertTradeFlow - signature em binanceQuery:`, req.binanceQuery.signature ? 'PRESENTE' : 'AUSENTE');
    
    // Adiciona query parameters incluindo a assinatura gerada pelo middleware
    Object.keys(req.binanceQuery).forEach(key => {
      url.searchParams.append(key, req.binanceQuery[key]);
      console.log(`🔍 convertTradeFlow - Adicionando param: ${key} = ${req.binanceQuery[key].substring ? req.binanceQuery[key].substring(0, 16) + '...' : req.binanceQuery[key]}`);
    });
    
    console.log(`🌐 Proxy Binance: GET ${url.toString()}`);
    console.log(`🔐 convertTradeFlow - Query params incluem signature: ${url.searchParams.has('signature')}`);
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: req.binanceHeaders
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Binance API Error:', data);
      return res.status(response.status).json(data);
    }
    
    console.log('✅ convertTradeFlow Binance API Success');
    res.json(data);
    
  } catch (error) {
    console.error('❌ convertTradeFlow Proxy Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Rota de health check
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Inicia o servidor proxy
 */
app.listen(PORT, () => {
  console.log(`🚀 Binance Proxy Server rodando em http://localhost:${PORT}`);
  console.log(`🔗 Endpoint base: http://localhost:${PORT}/api/binance`);
  console.log(`💡 Exemplo: http://localhost:${PORT}/api/binance/api/v3/ping`);
});

export default app;
