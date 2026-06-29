import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { join, extname, normalize } from 'node:path';

const root = process.cwd();
const publicDir = join(root, 'public');
const port = Number(process.env.PORT || 4174);
const host = process.env.HOST || '0.0.0.0';
const andersonPwd = process.env.ANPRADO_ANDERSON_PASSWORD || '';
const vladPwd     = process.env.ANPRADO_VLADI_PASSWORD || '';
const SUPA_URL    = process.env.SUPABASE_URL || '';
const SUPA_KEY    = process.env.SUPABASE_KEY || '';
const STATE_KEY   = 'hostel_anprado';

const sessions = new Map();
const cookieName = 'anprado_session';
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};

const json = (res, status, body, extra = {}) => {
  res.writeHead(status, {'content-type':'application/json; charset=utf-8','cache-control':'no-store',...extra});
  res.end(JSON.stringify(body));
};
const cookies = req => Object.fromEntries((req.headers.cookie||'').split(';').map(v=>v.trim().split('=').map(decodeURIComponent)).filter(([k])=>k));
const readBody = async req => { let v=''; for await(const p of req)v+=p; if(v.length>200000)throw Error('Pedido demasiado grande'); return v?JSON.parse(v):{}; };
const same = (a,b) => { if(!a||!b)return false; const x=Buffer.from(a),y=Buffer.from(b); return x.length===y.length&&timingSafeEqual(x,y); };

// ── Supabase helpers ──────────────────────────────────────────
const supaHeaders = {
  'apikey': SUPA_KEY,
  'Authorization': `Bearer ${SUPA_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal'
};

async function loadState() {
  if (SUPA_URL && SUPA_KEY) {
    try {
      const r = await fetch(`${SUPA_URL}/rest/v1/panel_state?key=eq.${STATE_KEY}&select=value`, { headers: supaHeaders });
      if (r.ok) {
        const rows = await r.json();
        if (rows[0]?.value?.cycles?.length) {
          console.log('State loaded from Supabase');
          return rows[0].value;
        }
      } else {
        console.error('Supabase loadState HTTP error:', r.status);
      }
    } catch (e) {
      console.error('Supabase loadState failed:', e.message);
    }
  }
  try {
    const s = JSON.parse(await readFile(join(root, 'data', 'state.json'), 'utf8'));
    console.log('State loaded from file');
    return s;
  } catch {
    console.log('State initialized empty');
    return { cycles: [], campaigns: { google: {}, meta: {} } };
  }
}

async function saveState(state) {
  if (!SUPA_URL || !SUPA_KEY) return;
  try {
    const r = await fetch(`${SUPA_URL}/rest/v1/panel_state?key=eq.${STATE_KEY}`, {
      method: 'PATCH',
      headers: supaHeaders,
      body: JSON.stringify({ value: state, updated_at: new Date().toISOString() })
    });
    if (!r.ok) {
      const err = await r.text();
      console.error('Supabase saveState error:', r.status, err);
    }
  } catch (e) {
    console.error('Supabase saveState failed:', e.message);
  }
}

// ── In-memory cache ───────────────────────────────────────────
let appState = null;

// ── HTTP server ───────────────────────────────────────────────
createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const token = cookies(req)[cookieName];
  const role = sessions.get(token);

  if (url.pathname === '/api/me')
    return json(res, 200, { authenticated: Boolean(role), role: role||null, configured: Boolean(andersonPwd||vladPwd) });

  if (url.pathname === '/api/login' && req.method === 'POST') {
    const data = await readBody(req);
    if (!andersonPwd && !vladPwd) return json(res, 503, { error: 'Nenhuma senha configurada.' });
    let matched = null;
    if (andersonPwd && same(data.password, andersonPwd)) matched = 'anderson';
    else if (vladPwd && same(data.password, vladPwd)) matched = 'vladi';
    if (!matched) return json(res, 401, { error: 'Palavra-passe inválida.' });
    const id = randomBytes(24).toString('base64url');
    sessions.set(id, matched);
    return json(res, 200, { ok: true, role: matched }, { 'set-cookie': `${cookieName}=${id}; HttpOnly; SameSite=Strict; Path=/` });
  }

  if (url.pathname === '/api/logout' && req.method === 'POST') {
    sessions.delete(token);
    return json(res, 204, {}, { 'set-cookie': `${cookieName}=; Max-Age=0; Path=/` });
  }

  if (url.pathname.startsWith('/api/') && !role)
    return json(res, 401, { error: 'Não autenticado' });

  if (url.pathname === '/api/state' && req.method === 'GET') {
    if (!appState) appState = await loadState();
    return json(res, 200, appState);
  }

  if (url.pathname === '/api/state' && req.method === 'POST') {
    const data = await readBody(req);
    if (!appState) appState = await loadState();
    if (data.cycles !== undefined) appState.cycles = data.cycles;
    if (data.campaigns !== undefined) appState.campaigns = data.campaigns;
    if (data.referencias !== undefined) appState.referencias = data.referencias;
    await saveState(appState);
    return json(res, 200, appState);
  }

  if (url.pathname === '/api/cycle/close' && req.method === 'POST') {
    if (role !== 'vladi') return json(res, 403, { error: 'Apenas Vladi pode fechar ciclos.' });
    const data = await readBody(req);
    if (!appState) appState = await loadState();
    const active = appState.cycles.find(c => c.status === 'active');
    if (!active) return json(res, 400, { error: 'Nenhum ciclo activo.' });
    active.status = 'closed';
    active.results = data.results || '';
    active.situacao = data.situacao || active.situacao || '';
    active.closedAt = new Date().toISOString();
    let next = appState.cycles.find(c => c.status === 'planned');
    if (!next) {
      const months = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
      const now = new Date(); const m = now.getMonth(); const y = now.getFullYear();
      const nm = (m + 1) % 12; const ny = nm === 0 ? y + 1 : y;
      const mName = months[nm].charAt(0).toUpperCase() + months[nm].slice(1);
      const lastDay = new Date(ny, nm + 1, 0).getDate();
      next = { id:`${months[nm]}-${ny}`, name:`Ciclo ${mName}`, period:`1–${lastDay} ${mName} ${ny}`, days:30, status:'planned', tasks:[], goals:[], situacao:'', results:'', closedAt:null };
      appState.cycles.push(next);
    }
    const goals = (data.goals || []).filter(g => g && g.trim());
    next.goals = goals;
    next.tasks = goals.map((g, i) => ({
      id:`${next.id}-t${i}`, title:g, owner:'Optimizia', prazo:'', proof:'',
      andersonDone:false, vladStatus:'backlog', blocker:'', evidencia:''
    }));
    next.status = 'active';
    await saveState(appState);
    return json(res, 200, appState);
  }

  const path = url.pathname === '/' ? '/index.html' : url.pathname;
  const file = normalize(join(publicDir, path));
  if (!file.startsWith(publicDir)) { res.writeHead(403); return res.end(); }
  try {
    res.writeHead(200, { 'content-type': mime[extname(file)] || 'application/octet-stream' });
    res.end(await readFile(file));
  } catch { res.writeHead(404); res.end('Não encontrado'); }

}).listen(port, host, () => console.log(`Painel: http://${host}:${port}`));

// Pre-load state on startup
appState = await loadState();
console.log(`State loaded: ${appState.cycles?.length || 0} ciclos`);
