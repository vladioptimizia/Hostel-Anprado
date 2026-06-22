import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { join, extname, normalize } from 'node:path';

const root = process.cwd(); const publicDir = join(root, 'public');
const port = Number(process.env.PORT || 4174); const host = process.env.HOST || '0.0.0.0';
const password = process.env.ANPRADO_ANDERSON_PASSWORD || '';
const sessions = new Set(); const cookieName = 'anprado_session';
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
const json=(res,status,body,extra={})=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...extra});res.end(JSON.stringify(body));};
const cookies=req=>Object.fromEntries((req.headers.cookie||'').split(';').map(v=>v.trim().split('=').map(decodeURIComponent)).filter(([k])=>k));
const body=async req=>{let value='';for await(const part of req)value+=part;if(value.length>100000)throw Error('Pedido demasiado grande');return value?JSON.parse(value):{};};
const same=(a,b)=>{if(!a||!b)return false;const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y);};
createServer(async(req,res)=>{
  const url=new URL(req.url,'http://localhost'); const token=cookies(req)[cookieName];
  if(url.pathname==='/api/me') return json(res,200,{authenticated:sessions.has(token),name:'Anderson',configured:Boolean(password)});
  if(url.pathname==='/api/login'&&req.method==='POST'){const data=await body(req);if(!password)return json(res,503,{error:'Defina ANPRADO_ANDERSON_PASSWORD no servidor antes do primeiro acesso.'});if(!same(data.password,password))return json(res,401,{error:'Palavra-passe inválida.'});const id=randomBytes(24).toString('base64url');sessions.add(id);return json(res,200,{ok:true},{'set-cookie':`${cookieName}=${id}; HttpOnly; SameSite=Strict; Path=/`});}
  if(url.pathname==='/api/logout'&&req.method==='POST'){sessions.delete(token);return json(res,204,{}, {'set-cookie':`${cookieName}=; Max-Age=0; Path=/`});}
  const path=url.pathname==='/'?'/index.html':url.pathname;const file=normalize(join(publicDir,path));if(!file.startsWith(publicDir)){res.writeHead(403);return res.end();}
  try{res.writeHead(200,{'content-type':mime[extname(file)]||'application/octet-stream'});res.end(await readFile(file));}catch{res.writeHead(404);res.end('Não encontrado');}
}).listen(port,host,()=>console.log(`Painel: http://${host}:${port}`));
