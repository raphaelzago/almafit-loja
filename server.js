require('dotenv').config();
const express = require('express');
const session = require('express-session');
const fetch = require('node-fetch');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const EDGE_URL = process.env.EDGE_URL;
const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASS = process.env.ADMIN_PASS;
const SESSION_SECRET = process.env.SESSION_SECRET || 'change-me-securely';

if (!SUPABASE_URL || !SUPABASE_KEY || !ADMIN_USER || !ADMIN_PASS || !EDGE_URL) {
  console.warn('Warning: Missing required environment variables. Check .env.example.');
}

const app = express();
app.use(express.json());
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax' }
}));
app.use(express.static(path.join(__dirname)));

function auth(req, res, next) {
  if (req.session && req.session.auth) return next();
  res.status(401).json({ error: 'Não autorizado' });
}

async function supabaseFetch(endpoint, method = 'GET', body = null) {
  const headers = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation'
  };
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, options);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || response.statusText);
  }
  return response.status === 204 ? null : response.json();
}

app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.auth = true;
    return res.json({ ok: true });
  }
  res.status(401).json({ error: 'Usuário ou senha inválidos' });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get('/api/admin/check', auth, (req, res) => {
  res.json({ ok: true });
});

app.get('/api/produtos', async (req, res) => {
  try {
    const data = await supabaseFetch('produtos?select=*&ativo=eq.true&order=criado_em.asc');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/produtos/admin', auth, async (req, res) => {
  try {
    const data = await supabaseFetch('produtos?select=*&order=criado_em.desc');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/produtos', auth, async (req, res) => {
  try {
    const data = await supabaseFetch('produtos', 'POST', req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/produtos/:id', auth, async (req, res) => {
  try {
    const data = await supabaseFetch(`produtos?id=eq.${req.params.id}`, 'PATCH', req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/produtos/:id', auth, async (req, res) => {
  try {
    await supabaseFetch(`produtos?id=eq.${req.params.id}`, 'DELETE');
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/pedidos', auth, async (req, res) => {
  try {
    const data = await supabaseFetch('pedidos?select=*&order=criado_em.desc');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/pedidos/:id', auth, async (req, res) => {
  try {
    const data = await supabaseFetch(`pedidos?id=eq.${req.params.id}`, 'PATCH', req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/pedidos', async (req, res) => {
  try {
    const data = await supabaseFetch('pedidos', 'POST', req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/pay', async (req, res) => {
  try {
    const body = req.body || {};
    const response = await fetch(EDGE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: SUPABASE_KEY },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.error || 'Erro no pagamento' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
