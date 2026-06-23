const app = document.querySelector('#app');
let activeView = null;
let activeRole = null;
const esc = v => String(v).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

// Anderson state (backward compatible)
const aKey = 'anprado-owner-progress';
let aState = JSON.parse(localStorage.getItem(aKey) || '{}');
const saveA = () => localStorage.setItem(aKey, JSON.stringify(aState));

// Vladi state
const vKey = 'anprado-vladi-state';
let vState = JSON.parse(localStorage.getItem(vKey) || 'null') || {
  tasks: {
    0:{status:'em_execucao',blocker:'',evidencia:''},
    1:{status:'aguardando_aprovacao',blocker:'',evidencia:'Conta criada — aguardando Anderson confirmar 2FA'},
    2:{status:'em_execucao',blocker:'',evidencia:''},
    3:{status:'bloqueado',blocker:'Aguardando acesso ao e-mail oficial do hostel',evidencia:''},
    4:{status:'backlog',blocker:'',evidencia:''},
    5:{status:'backlog',blocker:'',evidencia:''}
  },
  situacao: '',
  campaigns: {
    google: {verba:'1349.10',impressoes:'392107',cliques:'4231',ctr:'1.08',cpc:'0.32',contatos:'',reservas:'',periodo:'Nov 2023 – Jun 2026 (histórico)'},
    meta:   {verba:'',impressoes:'',cliques:'',cpm:'',contatos:'',reservas:'',periodo:''}
  },
  backlog: [
    {id:'b1',title:'Configurar GA4 com eventos personalizados',prioridade:'alta'},
    {id:'b2',title:'Google Tag Manager + rastreio de cliques WhatsApp',prioridade:'alta'},
    {id:'b3',title:'SEO on-page: meta tags, sitemap.xml, robots.txt',prioridade:'alta'},
    {id:'b4',title:'Google Meu Negócio + estratégia de avaliações',prioridade:'media'},
    {id:'b5',title:'Campanha Google Ads — pesquisa local Guarulhos/GRU',prioridade:'media'},
    {id:'b6',title:'Pixel Meta + campanha de reconhecimento',prioridade:'baixa'}
  ]
};
const saveV = () => localStorage.setItem(vKey, JSON.stringify(vState));
const vt = id => (vState.tasks[id] || (vState.tasks[id] = {status:'backlog',blocker:'',evidencia:''}));

// Shared task definitions
const tasks = [
  {id:0,title:'Validar landing: fotos, galerias, WhatsApp, links e versão mobile',owner:'Anderson + Optimizia',prazo:'18 Jun',proof:'Checklist e capturas aprovadas'},
  {id:1,title:'Criar ou confirmar conta oficial do Hostel na Netlify + 2FA',owner:'Anderson',prazo:'20 Jun',proof:'Proprietário e recuperação documentados'},
  {id:2,title:'Confirmar domínio principal, SSL e redirecionamento',owner:'Anderson + Optimizia',prazo:'23 Jun',proof:'hostelanprado.com.br abre com HTTPS'},
  {id:3,title:'Entregar acessos: GA4, Tag Manager, Search Console e Meta',owner:'Anderson',prazo:'25 Jun',proof:'Contas compartilhadas com a equipa'},
  {id:4,title:'Aplicar SEO técnico e SEO local',owner:'Optimizia',prazo:'28 Jun',proof:'Sitemap, canonical e perfil local validados'},
  {id:5,title:'Aprovar plano de tráfego: orçamento, público, criativos e conversões',owner:'Anderson + Optimizia',prazo:'30 Jun',proof:'Plano de mídia aprovado'}
];

// Status system
const STATUS = {
  backlog:{label:'Backlog',cls:'chip-muted'},
  em_execucao:{label:'Em execução',cls:'chip-blue'},
  bloqueado:{label:'Bloqueado',cls:'chip-red'},
  aguardando_aprovacao:{label:'Aguardando aprovação',cls:'chip-gold'},
  concluido:{label:'Concluído',cls:'chip-green'}
};
const chip = s => { const x = STATUS[s] || STATUS.backlog; return `<span class="chip ${x.cls}">${x.label}</span>`; };

// Navigation
const andersonNav = [['overview','Visão geral'],['cycle','Ciclo Jun'],['infra','Infraestrutura'],['growth','Marketing & SEO'],['campaigns','Campanhas & Site'],['monthly','Ciclos mensais'],['risks','Decisões & riscos']];
const vladiNav = [['exec','Ações em execução'],['backlog','Backlog técnico'],['approve','Aguardando aprovação'],['evidence','Evidências'],['campaigns','Campanhas'],['situacao','Ponto de situação'],['close','Fechar ciclo']];

// Shared header
function header(title, desc) {
  const isV = activeRole === 'vladi';
  return `<section class="hero"><div><p class="eyebrow">Hostel Anprado · ${isV?'executor':'proprietário'}</p><h1>${title}</h1><p>${desc}</p></div><span class="health">${isV?'● operacional':'● ciclo em execução'}</span></section>`;
}

// ─── ANDERSON VIEWS ────────────────────────────────────────────

const aDone = () => tasks.filter(t => aState[t.id]).length;
const aTaskRows = list => list.map(t => {
  const d = aState[t.id];
  return `<label class="task ${d?'done':''}"><input type="checkbox" data-task="${t.id}" ${d?'checked':''}><span><b>${esc(t.title)}</b><small>${esc(t.owner)} · prazo ${esc(t.prazo)}</small><em>${d?'Evidência concluída':esc(t.proof)}</em></span></label>`;
}).join('');

function overview() {
  const d = aDone();
  return `${header('Anderson, acompanhe o lançamento em um só lugar.','O primeiro ciclo organiza o que precisa estar pronto antes de investir em tráfego e escalar reservas.')}
<section class="stats"><article><strong>15</strong><span>dias iniciais</span></article><article><strong>${tasks.length}</strong><span>entregas críticas</span></article><article><strong>${d}/${tasks.length}</strong><span>evidências concluídas</span></article><article><strong>30 Jun</strong><span>fechamento do ciclo</span></article></section>
<section class="layout two"><article class="panel"><div class="panel-head"><h2>Prioridades desta quinzena</h2><span>atualizável</span></div>${aTaskRows(tasks)}</article><article class="panel"><h2>Próxima decisão</h2><div class="focus"><p class="eyebrow">Antes de campanhas</p><h3>Validar a estrutura de conversão.</h3><p>A landing, o domínio, o WhatsApp e a medição precisam estar prontos para que cada clique em anúncio possa virar contato rastreável.</p></div><h2 class="spaced">Sinal de saúde</h2><div class="signal"><b>${d===tasks.length?'Ciclo pronto para revisão':'Ciclo em preparação'}</b><span>${d} das ${tasks.length} entregas têm evidência marcada.</span></div></article></section>`;
}

function cycle() {
  return `${header('Ciclo inicial · 16 a 30 de junho','Cada ação tem uma pessoa responsável, um prazo e uma prova de que foi realmente concluída.')}
<section class="panel full"><div class="panel-head"><h2>Plano de execução</h2><span>Renova em 01 Jul</span></div>${aTaskRows(tasks)}</section>
<section class="layout two"><article class="panel"><h2>Fechamento em 30 de junho</h2><ol class="steps"><li>Reunir evidências e resultados.</li><li>Listar bloqueios e decisões pendentes.</li><li>Definir até três metas para julho.</li><li>Aprovar orçamento e rotina de acompanhamento.</li></ol></article><article class="panel"><h2>Regra de execução</h2><p class="muted">Atividade sem responsável, prazo e evidência não conta como entrega. O painel serve para provar avanço, não para criar mais uma lista.</p></article></section>`;
}

function infra() {
  return `${header('Infraestrutura e propriedade','O Hostel deve controlar suas contas, domínio, acessos e histórico técnico — sem dependência de uma conta pessoal.')}
<section class="layout two"><article class="panel"><h2>Contas e acessos</h2>${aTaskRows(tasks.slice(1,4))}</article><article class="panel"><h2>Checklist de segurança</h2><ul class="checklist"><li>Conta oficial da empresa com 2FA</li><li>Gestor de palavras-passe e e-mail de recuperação</li><li>Registro.br sob controlo do hostel</li><li>Netlify, DNS e SSL documentados</li><li>Backup do código e histórico de deploy</li></ul></article></section>
<section class="notice"><b>Informação necessária do Anderson</b><span>E-mail oficial, responsável técnico, acesso ao Registro.br e definição de quem aprova cobranças e campanhas.</span></section>`;
}

function growth() {
  return `${header('Marketing, conversão e SEO local','Tráfego pago só entra depois de a medição estar preparada. O objetivo é gerar contatos com origem rastreável, não apenas visitas.')}
<section class="layout two"><article class="panel"><h2>Preparação de medição</h2>${aTaskRows(tasks.slice(3))}</article><article class="panel"><h2>Eventos que serão medidos</h2><ul class="checklist"><li>Clique em WhatsApp e telefone</li><li>Consulta de quartos e localização</li><li>Abertura do Google Maps</li><li>Origem de campanha, anúncio e UTM</li><li>Contato convertido em reserva</li></ul></article></section>
<section class="panel"><h2>SEO local</h2><div class="chips"><span>Guarulhos</span><span>Aeroporto GRU</span><span>Hospedagem próxima ao aeroporto</span><span>Conexão e voo cedo</span><span>Avaliações Google</span></div></section>`;
}

function monthly() {
  return `${header('Ciclos mensais renováveis','A quinzena de junho cria a base. A partir de julho, o painel passa a operar em ciclos mensais de meta, evidência, resultado e melhoria.')}
<section class="months"><article class="current"><b>16–30 Jun</b><span>Lançamento, acessos, domínio e medição.</span></article><article><b>Julho</b><span>Primeiras campanhas, SEO local e rotina de contatos.</span></article><article><b>Agosto</b><span>Otimização de conversão, criativos e avaliações.</span></article><article><b>Setembro+</b><span>Pré-reserva, disponibilidade e evolução do funil.</span></article></section>
<section class="panel"><h2>Ritual mensal com Anderson</h2><div class="ritual"><span>1. Evidências</span><span>2. Resultados</span><span>3. Bloqueios</span><span>4. Próximas metas</span></div></section>`;
}

function risks() {
  return `${header('Decisões e riscos em aberto','Esta é a área para o Anderson saber exatamente onde sua decisão desbloqueia a próxima etapa.')}
<section class="risk"><b>Risco 01 · Conta pessoal</b><span>Transferir o projeto e os acessos para a empresa evita perda de domínio, deploy ou histórico.</span></section>
<section class="risk"><b>Risco 02 · Investir sem medição</b><span>Campanhas sem eventos e UTMs impedem saber o que gera contatos e reservas.</span></section>
<section class="risk"><b>Risco 03 · Versão visual não aprovada</b><span>Fotos, galeria, botões e experiência mobile precisam ser aprovados antes do lançamento de mídia.</span></section>
<section class="panel"><h2>Decisão necessária agora</h2><p class="muted">Anderson confirma o responsável pelas contas, o acesso ao domínio e a data de início das campanhas. A equipa transforma isso em execução e evidência.</p></section>`;
}

// ─── VLADI VIEWS ───────────────────────────────────────────────

function vtaskCard(t, actionsHtml) {
  const vs = vt(t.id);
  const blocked = vs.status === 'bloqueado';
  const done = vs.status === 'concluido';
  return `<div class="vtask ${blocked?'vtask-blocked':done?'vtask-done':''}">
    <div class="vtask-head"><b>${esc(t.title)}</b>${chip(vs.status)}</div>
    <div class="vtask-meta"><span>${esc(t.owner)}</span><span>Prazo: ${esc(t.prazo)}</span></div>
    ${blocked?`<div class="vtask-blocker">⚠ <input class="blocker-input" data-blocker="${t.id}" placeholder="Descreva o bloqueio..." value="${esc(vs.blocker||'')}"></div>`:''}
    ${vs.evidencia&&!blocked?`<div class="vtask-evidence">📋 ${esc(vs.evidencia)}</div>`:''}
    <div class="vtask-actions">${actionsHtml}</div>
  </div>`;
}

function exec() {
  const active = tasks.filter(t => ['em_execucao','bloqueado'].includes(vt(t.id).status));
  const byS = s => tasks.filter(t => vt(t.id).status === s).length;
  const cards = active.length ? active.map(t => {
    const blocked = vt(t.id).status === 'bloqueado';
    return vtaskCard(t, `
      <button class="btn-sm btn-gold" data-vstatus="${t.id}" data-status="aguardando_aprovacao">Enviar para aprovação</button>
      ${blocked
        ? `<button class="btn-sm btn-muted" data-vstatus="${t.id}" data-status="em_execucao">Desbloquear</button>`
        : `<button class="btn-sm btn-red" data-vstatus="${t.id}" data-status="bloqueado">Marcar bloqueado</button>`}
    `);
  }).join('') : '<p class="muted">Nenhuma ação em execução no momento.</p>';
  return `${header('Ações em execução','O que está ativo agora — tarefas em andamento e bloqueios que precisam de resolução.')}
<section class="stats"><article><strong>${active.length}</strong><span>ativas</span></article><article><strong>${byS('bloqueado')}</strong><span>bloqueadas</span></article><article><strong>${byS('concluido')}</strong><span>concluídas</span></article><article><strong>${byS('aguardando_aprovacao')}</strong><span>aguardando aprovação</span></article></section>
<section class="panel full"><div class="panel-head"><h2>Ativas e bloqueadas</h2><span>ciclo Jun</span></div><div class="vtask-list">${cards}</div></section>`;
}

function backlogView() {
  const bl = tasks.filter(t => vt(t.id).status === 'backlog');
  const tb = vState.backlog || [];
  const pc = {alta:'chip-red',media:'chip-gold',baixa:'chip-muted'};
  return `${header('Backlog técnico','Itens em fila, não iniciados. Puxe para execução quando houver capacidade.')}
<section class="layout two">
  <article class="panel"><div class="panel-head"><h2>Entregas do ciclo não iniciadas</h2><span>${bl.length} itens</span></div>
    <div class="vtask-list">${bl.length ? bl.map(t => `<div class="vtask"><div class="vtask-head"><b>${esc(t.title)}</b>${chip('backlog')}</div><div class="vtask-meta"><span>${esc(t.owner)}</span><span>Prazo: ${esc(t.prazo)}</span></div><div class="vtask-actions"><button class="btn-sm btn-blue" data-vstatus="${t.id}" data-status="em_execucao">Iniciar</button></div></div>`).join('') : '<p class="muted">Todas as entregas do ciclo iniciadas.</p>'}</div>
  </article>
  <article class="panel"><div class="panel-head"><h2>Backlog técnico</h2><span>${tb.length} itens</span></div>
    <div class="vtask-list">${tb.map(b => `<div class="vtask"><div class="vtask-head"><b>${esc(b.title)}</b><span class="chip ${pc[b.prioridade]||'chip-muted'}">${b.prioridade}</span></div></div>`).join('')}</div>
  </article>
</section>`;
}

function approveView() {
  const pending = tasks.filter(t => vt(t.id).status === 'aguardando_aprovacao');
  return `${header('Aguardando aprovação','Entregas prontas que precisam da confirmação do Anderson para serem encerradas.')}
<section class="panel full"><div class="panel-head"><h2>Pendentes de aprovação</h2><span>${pending.length} itens</span></div>
  <div class="vtask-list">${pending.length ? pending.map(t => vtaskCard(t, `
    <button class="btn-sm btn-green" data-vstatus="${t.id}" data-status="concluido">Marcar concluído</button>
    <button class="btn-sm btn-muted" data-vstatus="${t.id}" data-status="em_execucao">Voltar para execução</button>
  `)).join('') : '<p class="muted">Nenhuma entrega aguardando aprovação.</p>'}</div>
</section>
<section class="notice"><b>Fluxo de aprovação</b><span>Após Anderson confirmar, marque como concluído aqui. O painel do Anderson refletirá o avanço automaticamente.</span></section>`;
}

function evidenceView() {
  const withEvidence = tasks.filter(t => vt(t.id).evidencia).length;
  return `${header('Evidências','Registe as provas de conclusão de cada entrega do ciclo.')}
<section class="panel full"><div class="panel-head"><h2>Evidências registradas</h2><span>${withEvidence} de ${tasks.length}</span></div>
  <div class="vtask-list">${tasks.map(t => {
    const vs = vt(t.id);
    return `<div class="vtask ${vs.status==='concluido'?'vtask-done':''}"><div class="vtask-head"><b>${esc(t.title)}</b>${chip(vs.status)}</div><div class="vtask-meta"><span>${esc(t.owner)}</span><span>Prazo: ${esc(t.prazo)}</span></div><input class="evidence-input" data-evidence="${t.id}" placeholder="${esc(t.proof)}" value="${esc(vs.evidencia||'')}"></div>`;
  }).join('')}</div>
  <button class="btn-primary" id="save-evidence">Salvar evidências</button>
</section>`;
}

function situacaoView() {
  const placeholder = `📋 PONTO DE SITUAÇÃO — Hostel Anprado\n\n✅ O que foi feito:\n— \n\n⚠ Bloqueios:\n— \n\n🔑 Decisões necessárias do Anderson:\n— \n\n📅 Próximos passos:\n— `;
  const byS = s => tasks.filter(t => vt(t.id).status === s).length;
  const blockers = tasks.filter(t => vt(t.id).status === 'bloqueado');
  return `${header('Ponto de situação','Relatório para atualizar o Anderson sobre o andamento do ciclo.')}
<section class="panel full"><div class="panel-head"><h2>Relatório do ciclo atual</h2><span>editável</span></div>
  <textarea class="situacao-editor" id="situacao-text" placeholder="${esc(placeholder)}">${esc(vState.situacao||'')}</textarea>
  <div class="situacao-actions"><button class="btn-primary" id="save-situacao">Salvar rascunho</button></div>
</section>
<section class="layout two">
  <article class="panel"><h2>Resumo do ciclo</h2><ul class="checklist"><li>Em execução: <b>${byS('em_execucao')}</b></li><li>Bloqueadas: <b>${byS('bloqueado')}</b></li><li>Aguardando aprovação: <b>${byS('aguardando_aprovacao')}</b></li><li>Concluídas: <b>${byS('concluido')}</b></li><li>Backlog: <b>${byS('backlog')}</b></li></ul></article>
  <article class="panel"><h2>Bloqueios ativos</h2>${blockers.length ? blockers.map(t => `<div class="vtask-blocker-card">⚠ <span>${esc(vt(t.id).blocker||t.title)}</span></div>`).join('') : '<p class="muted">Sem bloqueios ativos.</p>'}</article>
</section>`;
}

function closeView() {
  const byS = s => tasks.filter(t => vt(t.id).status === s);
  const done = byS('concluido');
  const ready = done.length === tasks.length;
  return `${header('Fechar ciclo','Encerramento oficial do ciclo de junho e preparação para julho.')}
<section class="stats"><article><strong>${done.length}/${tasks.length}</strong><span>concluídas</span></article><article><strong>${tasks.filter(t=>vt(t.id).evidencia).length}</strong><span>com evidência</span></article><article><strong>${byS('bloqueado').length}</strong><span>bloqueios</span></article><article><strong>${byS('aguardando_aprovacao').length}</strong><span>pendentes aprovação</span></article></section>
<section class="panel full"><div class="panel-head"><h2>Status final — todas as entregas</h2><span>ciclo 16–30 Jun</span></div>
  <div class="vtask-list">${tasks.map(t => {
    const vs = vt(t.id);
    return `<div class="vtask ${vs.status==='concluido'?'vtask-done':''}"><div class="vtask-head"><b>${esc(t.title)}</b>${chip(vs.status)}</div>${vs.evidencia?`<div class="vtask-evidence">📋 ${esc(vs.evidencia)}</div>`:''}</div>`;
  }).join('')}</div>
</section>
${!ready?`<section class="notice"><b>Atenção</b><span>${tasks.length-done.length} entrega(s) ainda não concluída(s). Conclua ou registe como pendente antes de fechar.</span></section>`:''}
<div class="close-actions"><button class="btn-primary ${!ready?'btn-disabled':''}" id="close-cycle" ${!ready?'disabled':''}>Fechar ciclo de junho</button></div>`;
}

// ─── SHARED: CAMPAIGNS DATA ────────────────────────────────────

const LEADS_URL = 'https://docs.google.com/spreadsheets/d/1od0uktyo_b1a_jH0x2Cu69lV_1kjDPTQfMVT9WBTUw0/edit?gid=2032513944';
const SITE_URL = 'https://hostelanprado.com.br';
const WHATSAPP = '(11) 98309-6540';
const MAPS_URL = 'https://maps.google.com/?q=Hostel+Anprado+Guarulhos';
const GADS_URL = 'https://ads.google.com';
const META_URL = 'https://business.facebook.com';

function metricCard(label, value, unit='') {
  const empty = !value || value === '';
  return `<div class="metric-card"><span class="metric-label">${label}</span><strong class="metric-value ${empty?'metric-empty':''}">${empty?'—':esc(value)+unit}</strong></div>`;
}

// Anderson campaigns view
function campaigns() {
  const g = vState.campaigns?.google || {};
  const m = vState.campaigns?.meta || {};
  const totalVerba = (parseFloat(g.verba)||0) + (parseFloat(m.verba)||0);
  const totalContatos = (parseInt(g.contatos)||0) + (parseInt(m.contatos)||0);
  const totalReservas = (parseInt(g.reservas)||0) + (parseInt(m.reservas)||0);
  const custoReserva = totalReservas>0 ? 'R$ '+(totalVerba/totalReservas).toFixed(2) : '—';
  return `${header('Campanhas & Site','Resultados de mídia paga e estado do site. Dados actualizados pela Optimizia.')}

<section class="risk" style="border-left-color:#f0a500;background:rgba(240,165,0,.07);margin-bottom:20px">
  <b style="color:#f0c040">⚠ Ação urgente — Regularizar saldo em atraso no Google Ads</b>
  <span>Sem regularizar a faturação, nenhuma campanha entrega. Confirmar com Anderson antes de qualquer ajuste de orçamento.</span>
</section>

<section class="stats">
  <article><strong>R$ ${totalVerba>0?totalVerba.toFixed(2):'—'}</strong><span>verba investida</span></article>
  <article><strong>${g.impressoes?Number(g.impressoes).toLocaleString('pt-BR'):'—'}</strong><span>impressões Google</span></article>
  <article><strong>${g.cliques||'—'}</strong><span>cliques Google</span></article>
  <article><strong>${g.ctr?g.ctr+'%':'—'}</strong><span>CTR médio</span></article>
</section>

<section class="panel full">
  <div class="panel-head"><h2>Campanhas Google Ads</h2><span>${esc(g.periodo||'—')}</span></div>
  <div class="camp-rows">
    <div class="camp-row camp-active">
      <div class="camp-row-head"><b>Hostel aeroporto de guarulhos</b><span class="chip chip-green">Qualificada · ativa</span></div>
      <div class="metrics-grid">
        ${metricCard('Budget/dia','R$ 3,00')}${metricCard('Impressões','296.608')}${metricCard('Cliques','3.947')}${metricCard('CTR','1,33%')}${metricCard('CPC médio','R$ 0,33')}${metricCard('Custo total','R$ 1.299,01')}
      </div>
      <small class="camp-note">Tipo: Smart · Estratégia: Maximizar cliques · Campanha contínua</small>
    </div>
    <div class="camp-row">
      <div class="camp-row-head"><b>Hotel Proximo ao aeroporto de guarulhos</b><span class="chip chip-muted">Finalizada</span></div>
      <div class="metrics-grid">
        ${metricCard('Budget total','R$ 300,00')}${metricCard('Impressões','95.499')}${metricCard('Cliques','284')}${metricCard('CTR','0,30%')}${metricCard('CPC médio','R$ 0,18')}${metricCard('Custo total','R$ 50,09')}
      </div>
      <small class="camp-note">Tipo: Performance Max · Nov 2025 – Fev 2026</small>
    </div>
    <div class="camp-row camp-warn">
      <div class="camp-row-head"><b>Hostel Anprado - WhatsApp - GRU</b><span class="chip chip-gold">Sem anúncios</span></div>
      <div class="metrics-grid">
        ${metricCard('Budget/dia','R$ 20,00')}${metricCard('Impressões','0')}${metricCard('Cliques','0')}${metricCard('Custo','R$ 0,00')}
      </div>
      <small class="camp-note">Tipo: Pesquisa · Orçamento alocado mas sem anúncios criados — precisa de atenção</small>
    </div>
  </div>
  <a class="ext-link" href="${GADS_URL}" target="_blank">Abrir Google Ads →</a>
</section>

<section class="layout two">
  <article class="panel">
    <div class="panel-head"><h2>Meta Ads</h2><span>${esc(m.periodo||'não configurado')}</span></div>
    ${m.verba ? `<div class="metrics-grid">${metricCard('Verba','R$ '+m.verba)}${metricCard('Impressões',m.impressoes)}${metricCard('Cliques',m.cliques)}${metricCard('CPM',m.cpm?'R$ '+m.cpm:'')}${metricCard('Contatos',m.contatos)}${metricCard('Reservas',m.reservas)}</div>` : '<p class="muted">Sem dados ainda. Vladi atualiza na vista Campanhas.</p>'}
    <a class="ext-link" href="${META_URL}" target="_blank">Abrir Meta Ads →</a>
  </article>
  <article class="panel">
    <div class="panel-head"><h2>Site & canais</h2></div>
    <div class="site-links">
      <a class="site-link" href="${SITE_URL}" target="_blank"><span class="site-link-icon">🌐</span><div><b>hostelanprado.com.br</b><small>Site oficial</small></div></a>
      <a class="site-link" href="${MAPS_URL}" target="_blank"><span class="site-link-icon">📍</span><div><b>Google Maps</b><small>4.8★ · 145 avaliações</small></div></a>
      <a class="site-link" href="https://wa.me/5511983096540" target="_blank"><span class="site-link-icon">💬</span><div><b>WhatsApp</b><small>${WHATSAPP}</small></div></a>
      <a class="site-link" href="${LEADS_URL}" target="_blank"><span class="site-link-icon">📊</span><div><b>Planilha de leads</b><small>controle de contatos e reservas</small></div></a>
    </div>
  </article>
</section>`;
}

// Vladi campaigns input view
function campaignInput() {
  const g = vState.campaigns?.google || {};
  const m = vState.campaigns?.meta || {};
  const fi = (key, label, val, ph='') => `<div class="field-row"><label>${label}</label><input class="camp-input" data-camp="google" data-field="${key}" value="${esc(val||'')}" placeholder="${ph}"></div>`;
  const fim = (key, label, val, ph='') => `<div class="field-row"><label>${label}</label><input class="camp-input" data-camp="meta" data-field="${key}" value="${esc(val||'')}" placeholder="${ph}"></div>`;
  return `${header('Atualizar campanhas','Insira os números dos dashboards. Aparecem em tempo real no painel do Anderson.')}
<section class="layout two">
  <article class="panel">
    <div class="panel-head"><h2>Google Ads</h2><a class="ext-link-sm" href="${GADS_URL}" target="_blank">Abrir dashboard →</a></div>
    <div class="camp-form">
      ${fi('periodo','Período',g.periodo,'ex: Junho 2026')}
      ${fi('verba','Verba investida (R$)',g.verba,'ex: 500.00')}
      ${fi('impressoes','Impressões',g.impressoes,'ex: 12400')}
      ${fi('cliques','Cliques',g.cliques,'ex: 340')}
      ${fi('ctr','CTR (%)',g.ctr,'ex: 2.7')}
      ${fi('cpc','CPC médio (R$)',g.cpc,'ex: 1.47')}
      ${fi('contatos','Contatos gerados',g.contatos,'ex: 28')}
      ${fi('reservas','Reservas fechadas',g.reservas,'ex: 8')}
    </div>
  </article>
  <article class="panel">
    <div class="panel-head"><h2>Meta Ads (Instagram)</h2><a class="ext-link-sm" href="${META_URL}" target="_blank">Abrir dashboard →</a></div>
    <div class="camp-form">
      ${fim('periodo','Período',m.periodo,'ex: Junho 2026')}
      ${fim('verba','Verba investida (R$)',m.verba,'ex: 300.00')}
      ${fim('impressoes','Impressões',m.impressoes,'ex: 24000')}
      ${fim('cliques','Cliques',m.cliques,'ex: 210')}
      ${fim('cpm','CPM (R$)',m.cpm,'ex: 12.50')}
      ${fim('contatos','Contatos gerados',m.contatos,'ex: 15')}
      ${fim('reservas','Reservas fechadas',m.reservas,'ex: 4')}
    </div>
  </article>
</section>
<button class="btn-primary" id="save-campaigns">Salvar e atualizar painel</button>
<section class="panel" style="margin-top:20px">
  <div class="panel-head"><h2>Acesso rápido</h2></div>
  <div class="site-links">
    <a class="site-link" href="${LEADS_URL}" target="_blank"><span class="site-link-icon">📊</span><div><b>Planilha de controle de leads</b><small>anprado-controle-leads · Google Sheets</small></div></a>
    <a class="site-link" href="${SITE_URL}" target="_blank"><span class="site-link-icon">🌐</span><div><b>hostelanprado.com.br</b><small>Verificar o site ao vivo</small></div></a>
    <a class="site-link" href="${MAPS_URL}" target="_blank"><span class="site-link-icon">📍</span><div><b>Google Maps / Meu Negócio</b><small>4.8★ · 145 avaliações</small></div></a>
  </div>
</section>`;
}

// ─── SHELL ─────────────────────────────────────────────────────

function appShell() {
  const isV = activeRole === 'vladi';
  const nav = isV ? vladiNav : andersonNav;
  const viewMap = isV
    ? {exec, backlog: backlogView, approve: approveView, evidence: evidenceView, campaigns: campaignInput, situacao: situacaoView, close: closeView}
    : {overview, cycle, infra, growth, campaigns, monthly, risks};
  if (!activeView || !viewMap[activeView]) activeView = isV ? 'exec' : 'overview';
  const content = viewMap[activeView]();
  return `<div class="shell" data-role="${activeRole}">
    <aside class="sidebar">
      <div class="brand">Hostel Anprado<small>painel ${isV?'executor':'do proprietário'}</small></div>
      <nav>${nav.map(n=>`<button data-view="${n[0]}" class="${activeView===n[0]?'active':''}">${n[1]}</button>`).join('')}</nav>
      <div class="profile"><b>${isV?'Vladi · Optimizia':'Anderson'}</b><span>${isV?'Executor · gestão operacional':'Proprietário · acesso executivo'}</span><button id="logout">Sair</button></div>
    </aside>
    <main>${content}</main>
  </div>`;
}

// ─── LOGIN ─────────────────────────────────────────────────────

async function loginScreen(msg = '') {
  app.innerHTML = `<section class="login"><form id="login-form"><p class="eyebrow">Hostel Anprado</p><h1>Painel de acompanhamento</h1><p>Acesso privado para Anderson e Optimizia acompanharem o progresso do hostel.</p><label>Palavra-passe<input required name="password" type="password" autocomplete="current-password"></label>${msg?`<div class="error">${esc(msg)}</div>`:''}<button>Entrar no painel</button><small>O acesso é individual e protegido.</small></form></section>`;
  document.querySelector('#login-form').onsubmit = async e => {
    e.preventDefault();
    const pw = new FormData(e.currentTarget).get('password');
    const r = await fetch('/api/login', {method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({password:pw})});
    if (!r.ok) { const x = await r.json(); return loginScreen(x.error); }
    const d = await r.json();
    activeRole = d.role;
    activeView = null;
    render();
  };
}

// ─── RENDER ────────────────────────────────────────────────────

async function render() {
  const me = await fetch('/api/me').then(r => r.json());
  if (!me.authenticated) { activeRole = null; return loginScreen(me.configured ? '' : 'Sem senha configurada no servidor.'); }
  activeRole = me.role;
  app.innerHTML = appShell();

  document.querySelectorAll('[data-view]').forEach(b => b.onclick = () => { activeView = b.dataset.view; render(); });
  document.querySelector('#logout').onclick = async () => {
    await fetch('/api/logout', {method:'POST'});
    activeRole = null; activeView = null; render();
  };

  document.querySelectorAll('[data-task]').forEach(inp => inp.onchange = () => {
    aState[Number(inp.dataset.task)] = !aState[Number(inp.dataset.task)]; saveA(); render();
  });

  document.querySelectorAll('[data-vstatus]').forEach(btn => btn.onclick = () => {
    vt(Number(btn.dataset.vstatus)).status = btn.dataset.status; saveV(); render();
  });

  document.querySelectorAll('.blocker-input').forEach(inp => inp.onchange = () => {
    vt(Number(inp.dataset.blocker)).blocker = inp.value; saveV();
  });

  // Campaigns save (Vladi)
  const sc = document.querySelector('#save-campaigns');
  if (sc) sc.onclick = () => {
    if (!vState.campaigns) vState.campaigns = {google:{},meta:{}};
    document.querySelectorAll('.camp-input').forEach(inp => {
      const camp = inp.dataset.camp;
      const field = inp.dataset.field;
      if (camp && field) vState.campaigns[camp][field] = inp.value;
    });
    saveV(); sc.textContent = 'Salvo ✓'; setTimeout(() => sc.textContent = 'Salvar e atualizar painel', 2000);
  };

  const se = document.querySelector('#save-evidence');
  if (se) se.onclick = () => {
    document.querySelectorAll('.evidence-input').forEach(inp => { vt(Number(inp.dataset.evidence)).evidencia = inp.value; });
    saveV(); se.textContent = 'Salvo ✓'; setTimeout(() => se.textContent = 'Salvar evidências', 2000);
  };

  const ss = document.querySelector('#save-situacao');
  if (ss) ss.onclick = () => {
    vState.situacao = document.querySelector('#situacao-text')?.value || '';
    saveV(); ss.textContent = 'Salvo ✓'; setTimeout(() => ss.textContent = 'Salvar rascunho', 2000);
  };

  const cc = document.querySelector('#close-cycle');
  if (cc && !cc.disabled) cc.onclick = () => {
    if (confirm('Fechar o ciclo de junho? Esta ação prepara o painel para julho.')) {
      vState.situacao = ''; saveV(); alert('Ciclo de junho fechado com sucesso.');
    }
  };
}

render();
