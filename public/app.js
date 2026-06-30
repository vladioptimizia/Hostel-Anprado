const app = document.querySelector('#app');
let activeView = null;
let activeRole = null;
let S = null; // server state

const esc = v => String(v).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

// ── State API ─────────────────────────────────────────────────
const fetchState = async () => { S = await fetch('/api/state').then(r => r.json()); return S; };
const patchState = async patch => { S = await fetch('/api/state', {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(patch)}).then(r=>r.json()); return S; };
const closeCycle = async body => { S = await fetch('/api/cycle/close', {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(body)}).then(r=>r.json()); return S; };

// ── Helpers ───────────────────────────────────────────────────
const activeCycle = () => S?.cycles?.find(c => c.status === 'active') || { tasks: [], name: '', period: '', days: 0 };
const saveTasks = () => patchState({ cycles: S.cycles });

const STATUS = {
  backlog:              { label:'Backlog',              cls:'chip-muted' },
  em_execucao:          { label:'Em execução',          cls:'chip-gold'  },
  bloqueado:            { label:'Bloqueado',            cls:'chip-red'   },
  aguardando_aprovacao: { label:'Aguardando aprovação', cls:'chip-gold'  },
  concluido:            { label:'Concluído',            cls:'chip-green' }
};
const chip = s => { const x = STATUS[s] || STATUS.backlog; return `<span class="chip ${x.cls}">${x.label}</span>`; };

// ── Navigation ────────────────────────────────────────────────
const andersonNav = [['overview','Visão geral'],['cycle','Ciclo'],['infra','Infraestrutura'],['growth','Marketing & SEO'],['campaigns','Campanhas & Site'],['referencias','Referências Vladi'],['monthly','Ciclos mensais'],['risks','Decisões & riscos']];
const vladiNav    = [['exec','Em execução'],['backlog','Backlog'],['approve','Aprovações'],['evidence','Evidências'],['campaigns','Campanhas'],['referencias','Referências'],['situacao','Situação'],['close','Fechar ciclo']];

function header(title, desc) {
  const isV = activeRole === 'vladi';
  const cycle = activeCycle();
  return `<section class="hero">
    <div class="hero-top">
      <p class="eyebrow">${isV?'Executor':'Proprietário'} · ${esc(cycle.name||cycle.period)}</p>
      <span class="health">● ${isV?'operacional':'em execução'}</span>
    </div>
    <h1>${title}</h1>
    <p class="hero-desc">${desc}</p>
  </section>`;
}

// ═══════════════════════════════════════════
//  ANDERSON VIEWS
// ═══════════════════════════════════════════
function aTaskRows(list) {
  return list.map(t => `
    <label class="task ${t.andersonDone?'done':''}">
      <input type="checkbox" data-atask="${t.id}" ${t.andersonDone?'checked':''}>
      <span>
        <b>${esc(t.title)}</b>
        <small>${esc(t.owner)}${t.prazo?' · prazo '+esc(t.prazo):''}</small>
        <em>${t.andersonDone?'Evidência concluída':esc(t.proof||'')}</em>
      </span>
    </label>`).join('');
}

function overview() {
  const tasks = activeCycle().tasks;
  const done = tasks.filter(t => t.andersonDone).length;
  return `${header('Anderson, acompanhe o lançamento em um só lugar.','O ciclo activo organiza o que precisa estar pronto antes de investir em tráfego e escalar reservas.')}
<section class="stats">
  <article><strong>${tasks.length}</strong><span>entregas</span></article>
  <article><strong>${done}/${tasks.length}</strong><span>concluídas</span></article>
  <article><strong>${tasks.filter(t=>t.vladStatus==='bloqueado').length}</strong><span>bloqueadas</span></article>
  <article><strong>${activeCycle().days||'—'}</strong><span>dias do ciclo</span></article>
</section>
<section class="layout two">
  <article class="panel">
    <div class="panel-head"><h2>Prioridades do ciclo</h2><span>${esc(activeCycle().period)}</span></div>
    ${aTaskRows(tasks)}
  </article>
  <article class="panel">
    <h2>Próxima decisão</h2>
    <div class="focus">
      <p class="eyebrow">Antes de campanhas</p>
      <h3>Validar a estrutura de conversão.</h3>
      <p>A landing, o domínio, o WhatsApp e a medição precisam estar prontos para que cada clique em anúncio possa virar contato rastreável.</p>
    </div>
    <h2 class="spaced">Sinal de saúde</h2>
    <div class="signal">
      <b>${done===tasks.length?'Ciclo pronto para revisão':'Ciclo em preparação'}</b>
      <span>${done} das ${tasks.length} entregas têm evidência marcada.</span>
    </div>
  </article>
</section>`;
}

function cycle() {
  const tasks = activeCycle().tasks;
  return `${header('Ciclo activo — plano de execução','Cada ação tem uma pessoa responsável, um prazo e uma prova de que foi realmente concluída.')}
<section class="panel full">
  <div class="panel-head"><h2>Plano de execução</h2><span>${esc(activeCycle().period)}</span></div>
  ${aTaskRows(tasks)}
</section>
<section class="layout two">
  <article class="panel">
    <h2>Fechamento do ciclo</h2>
    <ol class="steps">
      <li>Reunir evidências e resultados.</li>
      <li>Listar bloqueios e decisões pendentes.</li>
      <li>Definir até três metas para o próximo ciclo.</li>
      <li>Aprovar orçamento e rotina de acompanhamento.</li>
    </ol>
  </article>
  <article class="panel">
    <h2>Regra de execução</h2>
    <p class="muted">Atividade sem responsável, prazo e evidência não conta como entrega. O painel serve para provar avanço, não para criar mais uma lista.</p>
  </article>
</section>`;
}

function infra() {
  const tasks = activeCycle().tasks.slice(1, 4);
  return `${header('Infraestrutura e propriedade','O Hostel deve controlar suas contas, domínio, acessos e histórico técnico.')}
<section class="layout two">
  <article class="panel"><h2>Contas e acessos</h2>${aTaskRows(tasks)}</article>
  <article class="panel">
    <h2>Checklist de segurança</h2>
    <ul class="checklist">
      <li>Conta oficial da empresa com 2FA</li>
      <li>Gestor de palavras-passe e e-mail de recuperação</li>
      <li>Registro.br sob controlo do hostel</li>
      <li>Netlify, DNS e SSL documentados</li>
      <li>Backup do código e histórico de deploy</li>
    </ul>
  </article>
</section>
<section class="notice"><b>Informação necessária do Anderson</b><span>E-mail oficial, responsável técnico, acesso ao Registro.br e definição de quem aprova cobranças e campanhas.</span></section>`;
}

function growth() {
  const tasks = activeCycle().tasks.slice(3);
  return `${header('Marketing, conversão e SEO local','Tráfego pago só entra depois de a medição estar preparada.')}
<section class="layout two">
  <article class="panel"><h2>Preparação de medição</h2>${aTaskRows(tasks)}</article>
  <article class="panel">
    <h2>Eventos que serão medidos</h2>
    <ul class="checklist">
      <li>Clique em WhatsApp e telefone</li>
      <li>Consulta de quartos e localização</li>
      <li>Abertura do Google Maps</li>
      <li>Origem de campanha, anúncio e UTM</li>
      <li>Contato convertido em reserva</li>
    </ul>
  </article>
</section>
<section class="panel"><h2>SEO local</h2><div class="chips"><span>Guarulhos</span><span>Aeroporto GRU</span><span>Hospedagem próxima ao aeroporto</span><span>Conexão e voo cedo</span><span>Avaliações Google</span></div></section>`;
}

function monthly() {
  const cycles = S?.cycles || [];
  return `${header('Ciclos mensais','Cada ciclo encerra com resultados que alimentam as acções do próximo — retroalimentação contínua.')}
<section class="cycles-timeline">
  ${cycles.map((c, i) => {
    const isActive = c.status === 'active';
    const isDone = c.status === 'closed';
    const doneTasks = c.tasks.filter(t => t.andersonDone).length;
    return `<div class="cycle-card ${isActive?'cycle-active':isDone?'cycle-done':'cycle-planned'}">
      <div class="cycle-card-head">
        <div><b>${esc(c.name)}</b><small>${esc(c.period)} · ${c.days||30} dias</small></div>
        <span class="chip ${isActive?'chip-green':isDone?'chip-muted':'chip-gold'}">${isActive?'Activo':isDone?'Fechado':'Planeado'}</span>
      </div>
      ${c.tasks.length ? `<div class="cycle-progress">
        <div class="cycle-bar"><div class="cycle-fill" style="width:${Math.round(doneTasks/c.tasks.length*100)}%"></div></div>
        <span>${doneTasks}/${c.tasks.length} concluídas</span>
      </div>` : '<p class="muted" style="font-size:12px;margin:8px 0 0">Tarefas a definir no fecho do ciclo anterior.</p>'}
      ${isDone && c.results ? `<div class="cycle-results"><b>Resultados:</b> ${esc(c.results.substring(0,120))}${c.results.length>120?'…':''}</div>` : ''}
      ${isActive && i < cycles.length-1 ? `<div class="cycle-arrow">↓ alimenta → <b>${esc(cycles[i+1]?.name||'próximo ciclo')}</b></div>` : ''}
    </div>`;
  }).join('')}
</section>
<section class="panel" style="margin-top:20px">
  <h2>Ritual mensal</h2>
  <div class="ritual"><span>1. Evidências</span><span>2. Resultados</span><span>3. Bloqueios</span><span>4. Metas do próximo ciclo</span></div>
</section>`;
}

function risks() {
  return `${header('Decisões e riscos em aberto','Onde a decisão do Anderson desbloqueia a próxima etapa.')}
<section class="risk"><b>Risco 01 · Conta pessoal</b><span>Transferir o projeto e os acessos para a empresa evita perda de domínio, deploy ou histórico.</span></section>
<section class="risk"><b>Risco 02 · Investir sem medição</b><span>Campanhas sem eventos e UTMs impedem saber o que gera contatos e reservas.</span></section>
<section class="risk"><b>Risco 03 · Versão visual não aprovada</b><span>Fotos, galeria, botões e experiência mobile precisam ser aprovados antes do lançamento de mídia.</span></section>
<section class="panel"><h2>Decisão necessária agora</h2><p class="muted">Anderson confirma o responsável pelas contas, o acesso ao domínio e a data de início das campanhas.</p></section>`;
}

// ═══════════════════════════════════════════
//  VLADI VIEWS
// ═══════════════════════════════════════════
function vtaskCard(t, actionsHtml) {
  const blocked = t.vladStatus === 'bloqueado';
  const done = t.vladStatus === 'concluido';
  return `<div class="vtask ${blocked?'vtask-blocked':done?'vtask-done':''}">
    <div class="vtask-head"><b>${esc(t.title)}</b>${chip(t.vladStatus)}</div>
    <div class="vtask-meta"><span>${esc(t.owner)}</span>${t.prazo?`<span>Prazo: ${esc(t.prazo)}</span>`:''}</div>
    ${blocked?`<div class="vtask-blocker">⚠ <input class="blocker-input" data-blocker="${t.id}" placeholder="Descreva o bloqueio..." value="${esc(t.blocker||'')}"></div>`:''}
    ${t.evidencia&&!blocked?`<div class="vtask-evidence">📋 ${esc(t.evidencia)}</div>`:''}
    <div class="vtask-actions">${actionsHtml}</div>
  </div>`;
}

function exec() {
  const tasks = activeCycle().tasks;
  const active = tasks.filter(t => ['em_execucao','bloqueado'].includes(t.vladStatus));
  const byS = s => tasks.filter(t => t.vladStatus === s).length;
  return `${header('Ações em execução','O que está ativo agora — tarefas em andamento e bloqueios.')}
<section class="stats">
  <article><strong>${active.length}</strong><span>ativas</span></article>
  <article><strong>${byS('bloqueado')}</strong><span>bloqueadas</span></article>
  <article><strong>${byS('concluido')}</strong><span>concluídas</span></article>
  <article><strong>${byS('aguardando_aprovacao')}</strong><span>aguardando aprovação</span></article>
</section>
<section class="panel full">
  <div class="panel-head"><h2>Ativas e bloqueadas</h2><span>${esc(activeCycle().period)}</span></div>
  <div class="vtask-list">${active.length ? active.map(t => {
    const blocked = t.vladStatus === 'bloqueado';
    return vtaskCard(t, `
      <button class="btn-sm btn-gold" data-vstatus="${t.id}" data-status="aguardando_aprovacao">Enviar para aprovação</button>
      ${blocked
        ? `<button class="btn-sm btn-muted" data-vstatus="${t.id}" data-status="em_execucao">Desbloquear</button>`
        : `<button class="btn-sm btn-red" data-vstatus="${t.id}" data-status="bloqueado">Marcar bloqueado</button>`}
    `);
  }).join('') : '<p class="muted">Nenhuma ação em execução no momento.</p>'}</div>
</section>`;
}

function backlogView() {
  const tasks = activeCycle().tasks;
  const bl = tasks.filter(t => t.vladStatus === 'backlog');
  return `${header('Backlog técnico','Itens em fila. Puxe para execução quando houver capacidade.')}
<section class="panel full">
  <div class="panel-head"><h2>Entregas não iniciadas</h2><span>${bl.length} itens</span></div>
  <div class="vtask-list">${bl.length ? bl.map(t => `
    <div class="vtask">
      <div class="vtask-head"><b>${esc(t.title)}</b>${chip('backlog')}</div>
      <div class="vtask-meta"><span>${esc(t.owner)}</span>${t.prazo?`<span>Prazo: ${esc(t.prazo)}</span>`:''}</div>
      <div class="vtask-actions"><button class="btn-sm btn-gold" data-vstatus="${t.id}" data-status="em_execucao">Iniciar</button></div>
    </div>`).join('') : '<p class="muted">Todas as entregas iniciadas.</p>'}</div>
</section>`;
}

function approveView() {
  const tasks = activeCycle().tasks;
  const pending = tasks.filter(t => t.vladStatus === 'aguardando_aprovacao');
  return `${header('Aguardando aprovação','Entregas prontas que precisam da confirmação do Anderson.')}
<section class="panel full">
  <div class="panel-head"><h2>Pendentes de aprovação</h2><span>${pending.length} itens</span></div>
  <div class="vtask-list">${pending.length ? pending.map(t => vtaskCard(t, `
    <button class="btn-sm btn-green" data-vstatus="${t.id}" data-status="concluido">Marcar concluído</button>
    <button class="btn-sm btn-muted" data-vstatus="${t.id}" data-status="em_execucao">Voltar para execução</button>
  `)).join('') : '<p class="muted">Nenhuma entrega aguardando aprovação.</p>'}</div>
</section>
<section class="notice"><b>Fluxo</b><span>Após Anderson confirmar, marque como concluído. O painel do Anderson reflecte automaticamente.</span></section>`;
}

function evidenceView() {
  const tasks = activeCycle().tasks;
  return `${header('Evidências','Registe as provas de conclusão de cada entrega.')}
<section class="panel full">
  <div class="panel-head"><h2>Evidências</h2><span>${tasks.filter(t=>t.evidencia).length} de ${tasks.length}</span></div>
  <div class="vtask-list">${tasks.map(t => `
    <div class="vtask ${t.vladStatus==='concluido'?'vtask-done':''}">
      <div class="vtask-head"><b>${esc(t.title)}</b>${chip(t.vladStatus)}</div>
      <div class="vtask-meta"><span>${esc(t.owner)}</span>${t.prazo?`<span>Prazo: ${esc(t.prazo)}</span>`:''}</div>
      <input class="evidence-input" data-evidence="${t.id}" placeholder="${esc(t.proof||'Descreva a evidência...')}" value="${esc(t.evidencia||'')}">
    </div>`).join('')}
  </div>
  <button class="btn-primary" id="save-evidence">Salvar evidências</button>
</section>`;
}

function situacaoView() {
  const cycle = activeCycle();
  const tasks = cycle.tasks;
  const byS = s => tasks.filter(t => t.vladStatus === s).length;
  const blockers = tasks.filter(t => t.vladStatus === 'bloqueado');
  const placeholder = `📋 PONTO DE SITUAÇÃO — Hostel Anprado\n\n✅ O que foi feito:\n— \n\n⚠ Bloqueios:\n— \n\n🔑 Decisões necessárias do Anderson:\n— \n\n📅 Próximos passos:\n— `;
  return `${header('Ponto de situação','Relatório para actualizar o Anderson sobre o andamento do ciclo.')}
<section class="panel full">
  <div class="panel-head"><h2>Relatório — ${esc(cycle.period)}</h2><span>editável</span></div>
  <textarea class="situacao-editor" id="situacao-text" placeholder="${esc(placeholder)}">${esc(cycle.situacao||'')}</textarea>
  <div class="situacao-actions"><button class="btn-primary" id="save-situacao">Salvar rascunho</button></div>
</section>
<section class="layout two">
  <article class="panel">
    <h2>Resumo do ciclo</h2>
    <ul class="checklist">
      <li>Em execução: <b>${byS('em_execucao')}</b></li>
      <li>Bloqueadas: <b>${byS('bloqueado')}</b></li>
      <li>Aguardando aprovação: <b>${byS('aguardando_aprovacao')}</b></li>
      <li>Concluídas: <b>${byS('concluido')}</b></li>
      <li>Backlog: <b>${byS('backlog')}</b></li>
    </ul>
  </article>
  <article class="panel">
    <h2>Bloqueios ativos</h2>
    ${blockers.length ? blockers.map(t=>`<div class="vtask-blocker-card">⚠ <span>${esc(t.blocker||t.title)}</span></div>`).join('') : '<p class="muted">Sem bloqueios ativos.</p>'}
  </article>
</section>`;
}

function closeView() {
  const cycle = activeCycle();
  const tasks = cycle.tasks;
  const done = tasks.filter(t => t.vladStatus === 'concluido');
  const nextCycle = S?.cycles?.find(c => c.status === 'planned');
  return `${header('Fechar ciclo','Registe os resultados e defina os objectivos que alimentarão o próximo ciclo.')}
<section class="stats">
  <article><strong>${done.length}/${tasks.length}</strong><span>concluídas</span></article>
  <article><strong>${tasks.filter(t=>t.evidencia).length}</strong><span>com evidência</span></article>
  <article><strong>${tasks.filter(t=>t.vladStatus==='bloqueado').length}</strong><span>bloqueios</span></article>
  <article><strong>${tasks.filter(t=>t.vladStatus==='aguardando_aprovacao').length}</strong><span>pendentes aprovação</span></article>
</section>
<section class="panel">
  <div class="panel-head"><h2>Status final — ${esc(cycle.period)}</h2></div>
  <div class="vtask-list">${tasks.map(t=>`
    <div class="vtask ${t.vladStatus==='concluido'?'vtask-done':''}">
      <div class="vtask-head"><b>${esc(t.title)}</b>${chip(t.vladStatus)}</div>
      ${t.evidencia?`<div class="vtask-evidence">📋 ${esc(t.evidencia)}</div>`:''}
    </div>`).join('')}
  </div>
</section>
<section class="panel" style="margin-top:16px">
  <div class="panel-head"><h2>Resultados do ciclo</h2><span>preenchido por Vladi</span></div>
  <textarea class="situacao-editor" id="close-results" placeholder="Resuma o que foi entregue, o que ficou pendente e os principais aprendizados deste ciclo..." style="min-height:140px">${esc(cycle.results||cycle.situacao||'')}</textarea>
</section>
${nextCycle ? `
<section class="panel" style="margin-top:16px">
  <div class="panel-head">
    <h2>🔄 Objetivos para ${esc(nextCycle.name)}</h2>
    <span>${esc(nextCycle.period)}</span>
  </div>
  <p class="muted" style="margin-bottom:14px">Estes objetivos tornam-se as tarefas-base do próximo ciclo. Baseie-se nos resultados acima.</p>
  <div class="camp-form">
    ${[0,1,2,3,4].map(i => `<div class="field-row"><label>Objetivo ${i+1}${i>=3?' (opcional)':''}</label><input class="camp-input goal-input" data-goal="${i}" placeholder="Ex: Lançar primeira campanha Google Ads com tracking" value="${esc((nextCycle.goals||[])[i]||'')}"></div>`).join('')}
  </div>
</section>` : ''}
${done.length < tasks.length ? `<section class="notice" style="margin-top:16px"><b>Atenção</b><span>${tasks.length-done.length} entrega(s) ainda não concluída(s). Pode fechar na mesma — registe o motivo nos resultados.</span></section>` : ''}
<div class="close-actions">
  <button class="btn-primary" id="close-cycle-btn">Fechar ${esc(cycle.name)} e iniciar ${esc(nextCycle?.name||'próximo ciclo')}</button>
</div>`;
}

// ═══════════════════════════════════════════
//  REFERÊNCIAS
// ═══════════════════════════════════════════
const TIPOS = {
  marketing: {label:'Marketing', cls:'chip-gold'},
  instagram: {label:'Instagram', cls:'chip-red'},
  referencia:{label:'Referência', cls:'chip-green'},
  campanha:  {label:'Campanha',  cls:'chip-gold'},
  outro:     {label:'Outro',     cls:'chip-muted'}
};

// Vladi — lê referências enviadas pelo Anderson
function referenciasAnderson() {
  const refs = S?.referencias || [];
  return `${header('Referências do Anderson','Ideias e materiais enviados pelo Anderson para execução e análise.')}
<section class="panel full">
  <div class="panel-head"><h2>Materiais enviados</h2><span>${refs.length} item(ns)</span></div>
  ${refs.length === 0 ? '<p class="muted">Nenhuma referência enviada ainda.</p>' :
    `<div class="refs-list">${[...refs].reverse().map(r => `
      <div class="ref-card">
        <div class="ref-card-head">
          <span class="chip ${TIPOS[r.tipo]?.cls||'chip-muted'}">${TIPOS[r.tipo]?.label||r.tipo}</span>
          <b>${esc(r.titulo)}</b>
          <small class="ref-date">${esc(r.addedAt?.slice(0,10)||'')}</small>
        </div>
        ${r.descricao?`<p class="ref-desc">${esc(r.descricao)}</p>`:''}
        ${r.url?`<a class="ref-link" href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.url)}</a>`:''}
      </div>`).join('')}
    </div>`}
</section>`;
}

// Anderson — adiciona referências para o Vladi
function referenciasVladi() {
  const refs = S?.referencias || [];
  return `${header('Referências','Envia ideias, links e materiais para a Optimizia executar.')}
<section class="panel" style="margin-bottom:20px">
  <div class="panel-head"><h2>Nova referência</h2></div>
  <div class="ref-form">
    <div class="field-row"><label>Tipo</label>
      <select class="camp-input" id="ref-tipo">
        <option value="marketing">Ideia de Marketing</option>
        <option value="instagram">Instagram / Redes Sociais</option>
        <option value="referencia">Referência / Inspiração</option>
        <option value="campanha">Campanha / Anúncio</option>
        <option value="outro">Outro</option>
      </select>
    </div>
    <div class="field-row"><label>Título *</label><input class="camp-input" id="ref-titulo" placeholder="Ex: Ideia de reels para julho"></div>
    <div class="field-row"><label>Descrição</label><textarea class="camp-input ref-textarea" id="ref-desc" placeholder="Detalha a ideia ou contexto..."></textarea></div>
    <div class="field-row"><label>Link (URL)</label><input class="camp-input" id="ref-url" placeholder="https://instagram.com/..."></div>
  </div>
  <button class="btn-primary" id="add-ref">Enviar para Anderson</button>
</section>
<section class="panel full">
  <div class="panel-head"><h2>Enviadas</h2><span>${refs.length} item(ns)</span></div>
  ${refs.length === 0 ? '<p class="muted">Nenhuma referência enviada ainda.</p>' :
    `<div class="refs-list">${[...refs].reverse().map((r,i) => `
      <div class="ref-card">
        <div class="ref-card-head">
          <span class="chip ${TIPOS[r.tipo]?.cls||'chip-muted'}">${TIPOS[r.tipo]?.label||r.tipo}</span>
          <b>${esc(r.titulo)}</b>
          <small class="ref-date">${esc(r.addedAt?.slice(0,10)||'')}</small>
          <button class="btn-sm btn-red ref-del" data-refid="${r.id}" style="margin-left:auto">Remover</button>
        </div>
        ${r.descricao?`<p class="ref-desc">${esc(r.descricao)}</p>`:''}
        ${r.url?`<a class="ref-link" href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.url)}</a>`:''}
      </div>`).join('')}
    </div>`}
</section>`;
}

// ═══════════════════════════════════════════
//  CAMPANHAS
// ═══════════════════════════════════════════
const LEADS_URL = 'https://docs.google.com/spreadsheets/d/1od0uktyo_b1a_jH0x2Cu69lV_1kjDPTQfMVT9WBTUw0/edit?gid=2032513944';
const SITE_URL  = 'https://hostelanprado.com.br';
const WHATSAPP  = '(11) 98309-6540';
const MAPS_URL  = 'https://maps.google.com/?q=Hostel+Anprado+Guarulhos';
const GADS_URL  = 'https://ads.google.com';
const META_URL  = 'https://business.facebook.com';

const metricCard = (label, value) => {
  const empty = !value || value === '';
  return `<div class="metric-card"><span class="metric-label">${label}</span><strong class="metric-value ${empty?'metric-empty':''}">${empty?'—':esc(String(value))}</strong></div>`;
};

function campaigns() {
  const g = S?.campaigns?.google || {};
  const m = S?.campaigns?.meta || {};
  const RELATORIO_VIEW = 'https://drive.google.com/file/d/1KH7yisHkBF0GqPpBz__T83sz4P0C8aah/view?usp=drivesdk';
  const RELATORIO_DL   = 'https://drive.google.com/uc?export=download&id=1KH7yisHkBF0GqPpBz__T83sz4P0C8aah';
  return `${header('Campanhas & Site','Resultados de mídia paga. Dados actualizados pela Optimizia.')}

<section class="risk" style="border-left-color:#e05252;background:rgba(220,70,70,.07);margin-bottom:20px">
  <b style="color:#e07070">Prioridade #1 — Tracking de conversões inativo no site</b>
  <span>O código de acompanhamento do Google Ads no site ainda tem IDs de exemplo (AW-XXXXXXXXX). O Google não está a registar os cliques no WhatsApp como conversões. Vladi irá publicar a correção no Netlify.</span>
</section>

<section class="panel full" style="margin-bottom:20px">
  <div class="panel-head"><h2>Relatório Estratégico — Google Ads</h2><span>30 jun 2026 · Optimizia</span></div>
  <p style="color:var(--text-muted);margin:0 0 16px;font-size:14px">Documento completo com auditoria das campanhas, racional estratégico, resultados e plano de ação. Elaborado pela Optimizia para leitura e acompanhamento.</p>
  <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:20px">
    <a class="btn-primary" href="${RELATORIO_VIEW}" target="_blank" rel="noopener" style="text-decoration:none;display:inline-flex;align-items:center;gap:6px">Abrir documento</a>
    <a href="${RELATORIO_DL}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:6px;padding:10px 18px;border:1px solid var(--border);border-radius:8px;color:var(--text-muted);text-decoration:none;font-size:14px">Baixar .docx</a>
  </div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px">
    <div style="background:var(--surface2);border-radius:8px;padding:14px">
      <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Estrutura actual</div>
      <div style="font-size:13px;color:var(--text)">2 campanhas ativas: <b>Marca</b> (quem já conhece o hostel) e <b>Genérico</b> (quem procura hospedagem perto do GRU). As campanhas antigas foram pausadas.</div>
    </div>
    <div style="background:var(--surface2);border-radius:8px;padding:14px">
      <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Conta Google Ads</div>
      <div style="font-size:13px;color:var(--text)">657-277-6633 · Budget total: <b>R$ 26,00/dia</b><br>(R$ 18 Marca + R$ 8 Genérico)</div>
    </div>
    <div style="background:rgba(220,70,70,.1);border:1px solid rgba(220,70,70,.3);border-radius:8px;padding:14px">
      <div style="font-size:11px;color:#e07070;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Ação pendente</div>
      <div style="font-size:13px;color:var(--text)">Vladi publica a correção do tracking no Netlify (projeto "hostelanprado") — confirmar que o ID de conversão real está activo.</div>
    </div>
  </div>
</section>

<section class="panel full">
  <div class="panel-head"><h2>Google Ads</h2><span>Dados até 30 jun 2026</span></div>
  <div class="camp-rows">
    <div class="camp-row camp-active">
      <div class="camp-row-head"><b>Hostel Anprado [Marca]</b><span class="chip chip-green">Ativa</span></div>
      <p class="camp-note" style="margin:4px 0 10px;color:var(--text-muted);font-size:13px">Captura quem já pesquisa o nome do hostel — custo baixo, conversão alta.</p>
      <div class="metrics-grid">${metricCard('Budget/dia','R$ 18,00')}${metricCard('Impressões','4')}${metricCard('Cliques','0')}${metricCard('Custo acum.','R$ 0,00')}${metricCard('Estratégia','Max. conv.')}</div>
      <small class="camp-note">Volume baixo é esperado — a marca é recente. Cresce à medida que mais pessoas conhecerem o hostel.</small>
    </div>
    <div class="camp-row camp-active">
      <div class="camp-row-head"><b>Hostel Anprado [Genérico]</b><span class="chip chip-green">Ativa</span></div>
      <p class="camp-note" style="margin:4px 0 10px;color:var(--text-muted);font-size:13px">Captura quem procura "hospedagem perto do aeroporto de Guarulhos" — traz clientes novos.</p>
      <div class="metrics-grid">${metricCard('Budget/dia','R$ 8,00')}${metricCard('Impressões','91')}${metricCard('Cliques','3')}${metricCard('CTR','3,30%')}${metricCard('CPC médio','R$ 2,28')}${metricCard('Custo acum.','R$ 6,83')}</div>
      <small class="camp-note">Optimization score 93,4%. Aguarda correção do tracking para aprender com conversões reais.</small>
    </div>
  </div>
  <a class="ext-link" href="${GADS_URL}" target="_blank">Abrir Google Ads →</a>
</section>
<section class="layout two">
  <article class="panel">
    <div class="panel-head"><h2>Meta Ads</h2><span>${esc(m.periodo||'não configurado')}</span></div>
    ${m.verba ? `<div class="metrics-grid">${metricCard('Verba','R$ '+m.verba)}${metricCard('Impressões',m.impressoes)}${metricCard('Cliques',m.cliques)}${metricCard('CPM',m.cpm?'R$ '+m.cpm:'')}${metricCard('Contatos',m.contatos)}${metricCard('Reservas',m.reservas)}</div>` : '<p class="muted">Sem dados ainda. Vladi actualiza na vista Campanhas.</p>'}
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

function campaignInput() {
  const g = S?.campaigns?.google || {};
  const m = S?.campaigns?.meta || {};
  const fi  = (key, label, val, ph='') => `<div class="field-row"><label>${label}</label><input class="camp-input" data-camp="google" data-field="${key}" value="${esc(val||'')}" placeholder="${ph}"></div>`;
  const fim = (key, label, val, ph='') => `<div class="field-row"><label>${label}</label><input class="camp-input" data-camp="meta"   data-field="${key}" value="${esc(val||'')}" placeholder="${ph}"></div>`;
  return `${header('Actualizar campanhas','Insira os números dos dashboards. Ficam visíveis no painel do Anderson em tempo real.')}
<section class="layout two">
  <article class="panel">
    <div class="panel-head"><h2>Google Ads</h2><a class="ext-link-sm" href="${GADS_URL}" target="_blank">Abrir →</a></div>
    <div class="camp-form">
      ${fi('periodo','Período',g.periodo,'ex: Junho 2026')}${fi('verba','Verba investida (R$)',g.verba,'ex: 500.00')}${fi('impressoes','Impressões',g.impressoes,'ex: 12400')}${fi('cliques','Cliques',g.cliques,'ex: 340')}${fi('ctr','CTR (%)',g.ctr,'ex: 2.7')}${fi('cpc','CPC médio (R$)',g.cpc,'ex: 1.47')}${fi('contatos','Contatos gerados',g.contatos,'ex: 28')}${fi('reservas','Reservas fechadas',g.reservas,'ex: 8')}
    </div>
  </article>
  <article class="panel">
    <div class="panel-head"><h2>Meta Ads (Instagram)</h2><a class="ext-link-sm" href="${META_URL}" target="_blank">Abrir →</a></div>
    <div class="camp-form">
      ${fim('periodo','Período',m.periodo,'ex: Junho 2026')}${fim('verba','Verba investida (R$)',m.verba,'ex: 300.00')}${fim('impressoes','Impressões',m.impressoes,'ex: 24000')}${fim('cliques','Cliques',m.cliques,'ex: 210')}${fim('cpm','CPM (R$)',m.cpm,'ex: 12.50')}${fim('contatos','Contatos gerados',m.contatos,'ex: 15')}${fim('reservas','Reservas fechadas',m.reservas,'ex: 4')}
    </div>
  </article>
</section>
<button class="btn-primary" id="save-campaigns">Salvar e actualizar painel</button>
<section class="panel" style="margin-top:20px">
  <div class="panel-head"><h2>Acesso rápido</h2></div>
  <div class="site-links">
    <a class="site-link" href="${LEADS_URL}" target="_blank"><span class="site-link-icon">📊</span><div><b>Planilha de controle de leads</b><small>anprado-controle-leads</small></div></a>
    <a class="site-link" href="${SITE_URL}" target="_blank"><span class="site-link-icon">🌐</span><div><b>hostelanprado.com.br</b><small>Verificar o site ao vivo</small></div></a>
    <a class="site-link" href="${MAPS_URL}" target="_blank"><span class="site-link-icon">📍</span><div><b>Google Maps / Meu Negócio</b><small>4.8★ · 145 avaliações</small></div></a>
  </div>
</section>`;
}

// ═══════════════════════════════════════════
//  SHELL
// ═══════════════════════════════════════════
function appShell() {
  const isV = activeRole === 'vladi';
  const nav = isV ? vladiNav : andersonNav;
  const viewMap = isV
    ? { exec, backlog: backlogView, approve: approveView, evidence: evidenceView, campaigns: campaignInput, referencias: referenciasAnderson, situacao: situacaoView, close: closeView }
    : { overview, cycle, infra, growth, campaigns, referencias: referenciasVladi, monthly, risks };
  if (!activeView || !viewMap[activeView]) activeView = isV ? 'exec' : 'overview';
  const content = viewMap[activeView]();
  return `<div class="shell" data-role="${activeRole}">
    <aside class="sidebar">
      <div class="sidebar-top">
        <div class="brand">Hostel Anprado<small>painel ${isV?'executor':'do proprietário'}</small></div>
        <div class="mobile-user">
          <button id="logout-mobile" class="logout-btn-mobile">Sair</button>
        </div>
      </div>
      <nav>${nav.map(n=>`<button data-view="${n[0]}" class="${activeView===n[0]?'active':''}">${n[1]}</button>`).join('')}</nav>
      <div class="profile"><b>${isV?'Vladi · Optimizia':'Anderson'}</b><span>${isV?'Executor · gestão operacional':'Proprietário · acesso executivo'}</span><button id="logout">Sair</button></div>
    </aside>
    <main>
      ${content}
      <footer class="site-footer">Desenvolvido por <a href="http://www.optimizia.pt" target="_blank" rel="noopener">Optimizia Lda</a> · Hostel Anprado</footer>
    </main>
  </div>`;
}

// ═══════════════════════════════════════════
//  LOGIN
// ═══════════════════════════════════════════
async function loginScreen(msg = '') {
  app.innerHTML = `<section class="login"><form id="login-form"><p class="eyebrow">Hostel Anprado</p><h1>Painel de acompanhamento</h1><p>Acesso privado para Anderson e Optimizia.</p><label>Palavra-passe<input required name="password" type="password" autocomplete="current-password"></label>${msg?`<div class="error">${esc(msg)}</div>`:''}<button>Entrar no painel</button><small>O acesso é individual e protegido.</small></form></section>`;
  document.querySelector('#login-form').onsubmit = async e => {
    e.preventDefault();
    const pw = new FormData(e.currentTarget).get('password');
    const r = await fetch('/api/login', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({password:pw}) });
    if (!r.ok) { const x = await r.json(); return loginScreen(x.error); }
    const d = await r.json();
    activeRole = d.role; activeView = null;
    await fetchState();
    render();
  };
}

// ═══════════════════════════════════════════
//  RENDER
// ═══════════════════════════════════════════
async function render() {
  const me = await fetch('/api/me').then(r => r.json());
  if (!me.authenticated) { activeRole = null; return loginScreen(me.configured ? '' : 'Sem senha configurada no servidor.'); }
  activeRole = me.role;
  if (!S) await fetchState();
  app.innerHTML = appShell();

  document.querySelectorAll('[data-view]').forEach(b => b.onclick = () => { activeView = b.dataset.view; render(); });
  const doLogout = async () => {
    await fetch('/api/logout', {method:'POST'});
    activeRole = null; activeView = null; S = null; render();
  };
  document.querySelector('#logout')?.addEventListener('click', doLogout);
  document.querySelector('#logout-mobile')?.addEventListener('click', doLogout);

  // Anderson checkboxes → server
  document.querySelectorAll('[data-atask]').forEach(inp => inp.onchange = async () => {
    const task = activeCycle().tasks.find(t => t.id === inp.dataset.atask);
    if (task) { task.andersonDone = inp.checked; await saveTasks(); render(); }
  });

  // Vladi status → server
  document.querySelectorAll('[data-vstatus]').forEach(btn => btn.onclick = async () => {
    const task = activeCycle().tasks.find(t => t.id === btn.dataset.vstatus);
    if (task) { task.vladStatus = btn.dataset.status; await saveTasks(); render(); }
  });

  // Blocker inline
  document.querySelectorAll('.blocker-input').forEach(inp => inp.onchange = async () => {
    const task = activeCycle().tasks.find(t => t.id === inp.dataset.blocker);
    if (task) { task.blocker = inp.value; await saveTasks(); }
  });

  // Evidence
  const se = document.querySelector('#save-evidence');
  if (se) se.onclick = async () => {
    document.querySelectorAll('.evidence-input').forEach(inp => {
      const task = activeCycle().tasks.find(t => t.id === inp.dataset.evidence);
      if (task) task.evidencia = inp.value;
    });
    await saveTasks();
    se.textContent = 'Salvo ✓'; setTimeout(() => se.textContent = 'Salvar evidências', 2000);
  };

  // Situação
  const ss = document.querySelector('#save-situacao');
  if (ss) ss.onclick = async () => {
    activeCycle().situacao = document.querySelector('#situacao-text')?.value || '';
    await saveTasks();
    ss.textContent = 'Salvo ✓'; setTimeout(() => ss.textContent = 'Salvar rascunho', 2000);
  };

  // Close cycle
  const cc = document.querySelector('#close-cycle-btn');
  if (cc) cc.onclick = async () => {
    const results = document.querySelector('#close-results')?.value || '';
    const goals = [...document.querySelectorAll('.goal-input')].map(i => i.value).filter(v => v.trim());
    if (!results.trim()) { alert('Preencha os resultados do ciclo antes de fechar.'); return; }
    if (goals.length < 2) { alert('Define pelo menos 2 objetivos para o próximo ciclo.'); return; }
    if (!confirm('Fechar este ciclo e iniciar o próximo?')) return;
    await closeCycle({ results, goals, situacao: activeCycle().situacao });
    activeView = 'exec'; render();
  };

  // Adicionar referência (Vladi)
  const addRef = document.querySelector('#add-ref');
  if (addRef) addRef.onclick = async () => {
    const titulo = document.querySelector('#ref-titulo')?.value?.trim();
    if (!titulo) { alert('Título obrigatório.'); return; }
    const nova = {
      id: 'r' + Date.now(),
      tipo: document.querySelector('#ref-tipo')?.value || 'outro',
      titulo,
      descricao: document.querySelector('#ref-desc')?.value?.trim() || '',
      url: document.querySelector('#ref-url')?.value?.trim() || '',
      addedAt: new Date().toISOString()
    };
    if (!S.referencias) S.referencias = [];
    S.referencias.push(nova);
    await patchState({ referencias: S.referencias });
    render();
  };

  // Remover referência (Vladi)
  document.querySelectorAll('.ref-del').forEach(btn => btn.onclick = async () => {
    const id = btn.dataset.refid;
    S.referencias = (S.referencias || []).filter(r => r.id !== id);
    await patchState({ referencias: S.referencias });
    render();
  });

  // Campaigns
  const sc = document.querySelector('#save-campaigns');
  if (sc) sc.onclick = async () => {
    if (!S.campaigns) S.campaigns = { google: {}, meta: {} };
    document.querySelectorAll('.camp-input:not(.goal-input)').forEach(inp => {
      const camp = inp.dataset.camp; const field = inp.dataset.field;
      if (camp && field && S.campaigns[camp]) S.campaigns[camp][field] = inp.value;
    });
    await patchState({ campaigns: S.campaigns });
    sc.textContent = 'Salvo ✓'; setTimeout(() => sc.textContent = 'Salvar e actualizar painel', 2000);
  };
}

render();
