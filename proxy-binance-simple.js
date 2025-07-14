/**
 * Proxy server simplificado para contornar CORS da API Binance
 */

import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import crypto from 'crypto';

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
  const apiKey = req.headers['x-api-key'];
  const apiSecret = req.headers['x-api-secret'];
  
  if (!apiKey || !apiSecret) {
    return res.status(401).json({ error: 'API Key e Secret são obrigatórios' });
  }
  
  // Adiciona timestamp se necessário
  if (req.query.timestamp) {
    const queryString = new URLSearchParams(req.query).toString();
    const signature = generateSignature(queryString, apiSecret);
    req.query.signature = signature;
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
    
    // Adiciona query parameters
    Object.keys(req.query).forEach(key => {
      url.searchParams.append(key, req.query[key]);
    });
    
    console.log(`🌐 Proxy Binance: GET ${url.toString()}`);
    
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
    
    // Adiciona query parameters
    Object.keys(req.query).forEach(key => {
      url.searchParams.append(key, req.query[key]);
    });
    
    console.log(`🌐 Proxy Binance: GET ${url.toString()}`);
    
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
