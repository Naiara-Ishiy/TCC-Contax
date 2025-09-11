/********************
 * CONTAX — Storage *
 ********************/
const LS = {
  companiesKey: 'contax_companies',
  invoicesKey: 'contax_invoices',
  adminPassKey: 'contax_admin_pass',
  getCompanies() { return JSON.parse(localStorage.getItem(this.companiesKey) || '[]'); },
  setCompanies(list) { localStorage.setItem(this.companiesKey, JSON.stringify(list)); },
  getInvoices() { return JSON.parse(localStorage.getItem(this.invoicesKey) || '[]'); },
  setInvoices(list) { localStorage.setItem(this.invoicesKey, JSON.stringify(list)); },
  getAdminPass() { return localStorage.getItem(this.adminPassKey) || 'admin123'; },
  setAdminPass(v) { localStorage.setItem(this.adminPassKey, v); },
  resetAll() { localStorage.removeItem(this.companiesKey); localStorage.removeItem(this.invoicesKey); }
};

/********************
 * Utils            *
 ********************/
const fmt = {
  money(v) { return Number(v || 0).toLocaleString('pt-BR', { style:'currency', currency:'BRL' }); },
  dateISO(d=new Date()) {
    const pad = n => String(n).padStart(2,'0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  },
  ym(d) {
    if (typeof d === 'string') d = new Date(d);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  },
  byMonth(list, yymm) { return list.filter(n => fmt.ym(n.date) === yymm); },
};

const state = {
  user: null, // { role: 'admin' } | { role:'empresa', empresaId }
  filterYM: fmt.ym(new Date()),
  filterEmpresa: 'all',
};

/********************
 * Boot & Login     *
 ********************/
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

function showLogin() {
  $('#screenLogin').classList.remove('hide');
  $('#screenApp').classList.add('hide');
  $('#navTabs').classList.add('hide');
  $('#btnLogout').classList.add('hide');
  $('#who').textContent = '';
  // populate empresaSelect
  const companies = LS.getCompanies();
  const sel = $('#empresaSelect');
  sel.innerHTML = companies.map(c=>`<option value="${c.id}">${c.nome}</option>`).join('');
  if (!companies.length) sel.innerHTML = '<option value="">Nenhuma empresa cadastrada</option>';
}

function getCompany(id){ return LS.getCompanies().find(c=>c.id===id); }

function showApp() {
  $('#screenLogin').classList.add('hide');
  $('#screenApp').classList.remove('hide');
  $('#navTabs').classList.remove('hide');
  $('#btnLogout').classList.remove('hide');
  const name = state.user.role === 'admin' ? 'Administrador' : getCompany(state.user.empresaId)?.nome;
  $('#who').textContent = name ? `Acesso: ${name}` : '';

  // Role gating
  $('#tabEmpresas').classList.toggle('hide', state.user.role !== 'admin');
  $('#tabNotas').classList.toggle('hide', state.user.role !== 'admin');
  $('[data-tab="empresas"]').classList.toggle('hide', state.user.role !== 'admin');
  $('[data-tab="notas"]').classList.toggle('hide', state.user.role !== 'admin');

  // Abas por categoria
  $$('#navTabs .tab').forEach(tab => tab.classList.add('hide'));
  $('[data-tab="dashboard"]').classList.remove('hide');
  if (state.user.role === 'admin') {
    $('[data-tab="empresas"]').classList.remove('hide');
    $('[data-tab="notas"]').classList.remove('hide');
  } else {
    const empresa = getCompany(state.user.empresaId);
    if (empresa?.tipo === 'ME') {
      $('[data-tab="caixa"]').classList.remove('hide');
      $('[data-tab="despesas"]').classList.remove('hide');
      $('[data-tab="faturamento"]').classList.remove('hide');
      $('[data-tab="imposto"]').classList.remove('hide');
      $('[data-tab="notas-emitidas-me"]').classList.remove('hide');
    } else if (empresa?.tipo === 'MEI') {
      $('[data-tab="imposto-das"]').classList.remove('hide');
      $('[data-tab="notas-emitidas-mei"]').classList.remove('hide');
      $('[data-tab="controle-mensal"]').classList.remove('hide');
    }
  }

  // Ativa dashboard por padrão
  $$('button.tab').forEach(b=>b.classList.remove('active'));
  $('[data-tab="dashboard"]').classList.add('active');
  [
    'dashboard','empresas','notas','caixa','despesas','faturamento','imposto','notas-emitidas-me',
    'imposto-das','notas-emitidas-mei','controle-mensal'
  ].forEach(t => $('#tab-'+t).classList.toggle('hide', t!=='dashboard'));

  // Filtro empresa: admin pode "todas"; empresa vê apenas a sua
  const filtroEmp = $('#filtroEmpresa');
  const companies = LS.getCompanies();
  if (state.user.role === 'admin') {
    filtroEmp.innerHTML = '<option value="all">Todas</option>' + companies.map(c=>`<option value="${c.id}">${c.nome}</option>`).join('');
    $('#filtroEmpresaWrap').style.display = '';
  } else {
    filtroEmp.innerHTML = companies.filter(c=>c.id===state.user.empresaId).map(c=>`<option value="${c.id}">${c.nome}</option>`).join('');
    $('#filtroEmpresaWrap').style.display = 'none';
    state.filterEmpresa = state.user.empresaId;
  }
  $('#mes').value = state.filterYM;
  $('#monthLabel').textContent = new Date(state.filterYM+'-01').toLocaleDateString('pt-BR', {month:'long', year:'numeric'});

  refreshEmpresas();
  refreshNotas();
  refreshDashboard();
}

// Login form logic
$('#role').addEventListener('change', e => {
  const role = e.target.value;
  $('#loginAdmin').classList.toggle('hide', role !== 'admin');
  $('#loginEmpresa').classList.toggle('hide', role !== 'empresa');
});

$('#formLogin').addEventListener('submit', e => {
  e.preventDefault();
  const role = $('#role').value;
  if (role === 'admin') {
    const pass = $('#adminPass').value || '';
    if (pass !== LS.getAdminPass()) { alert('Senha de administrador incorreta.'); return; }
    state.user = { role: 'admin' };
  } else {
    const id = $('#empresaSelect').value;
    if (!id) { alert('Nenhuma empresa disponível. Contate o administrador.'); return; }
    state.user = { role: 'empresa', empresaId: id };
  }
  showApp();
});

$('#btnLogout').addEventListener('click', () => { state.user = null; showLogin(); });

// Seed demo data
$('#btnSeed').addEventListener('click', () => {
  if (!confirm('Popular com dados de exemplo? Isso substituirá os dados atuais.')) return;
  LS.resetAll();
  const companies = [
    { id: crypto.randomUUID(), nome: 'Bluewave MEI', cnpj: '12.345.678/0001-00', tipo:'MEI', limite: 6750 },
    { id: crypto.randomUUID(), nome: 'Alfa Tech ME', cnpj: '98.765.432/0001-00', tipo:'ME', limite: 20000 }
  ];
  LS.setCompanies(companies);
  const today = new Date();
  const ym = fmt.ym(today);
  const prev = new Date(today.getFullYear(), today.getMonth()-1, 15);
  const invoices = [
    { id: crypto.randomUUID(), empresaId: companies[0].id, date: ym+'-05', desc: 'Serviços web', valor: 2200 },
    { id: crypto.randomUUID(), empresaId: companies[0].id, date: ym+'-12', desc: 'Venda de produto', valor: 900 },
    { id: crypto.randomUUID(), empresaId: companies[1].id, date: ym+'-08', desc: 'Consultoria', valor: 3500 },
    { id: crypto.randomUUID(), empresaId: companies[1].id, date: fmt.dateISO(prev), desc: 'Treinamento (mês anterior)', valor: 4800 },
  ];
  LS.setInvoices(invoices);
  alert('Pronto! Dados de exemplo carregados.');
  showLogin();
});

/********************
 * Empresas (Admin) *
 ********************/
function refreshEmpresas(){
  const list = LS.getCompanies();
  // tabela
  const tbody = $('#tEmpresas');
  if (!list.length) { tbody.innerHTML = '<tr><td colspan="4" class="muted">Nenhuma empresa cadastrada.</td></tr>'; }
  else {
    tbody.innerHTML = list.map(c => `
      <tr>
        <td>
          <div style="font-weight:800">${c.nome}</div>
          <div class="muted" style="font-size:12px">${c.cnpj || ''}</div>
        </td>
        <td><span class="pill ${c.tipo==='MEI'?'ok':'warn'}">${c.tipo}</span></td>
        <td>${fmt.money(c.limite)}</td>
        <td class="right">
          <button class="secondary" onclick="editEmpresa('${c.id}')">Editar</button>
          <button onclick="deleteEmpresa('${c.id}')">Excluir</button>
        </td>
      </tr>
    `).join('');
  }
  // selects dependentes
  const selNF = $('#empresaNF');
  selNF.innerHTML = list.map(c=>`<option value="${c.id}">${c.nome}</option>`).join('');
  const selLogin = $('#empresaSelect');
  selLogin.innerHTML = list.map(c=>`<option value="${c.id}">${c.nome}</option>`).join('');
}

function editEmpresa(id){
  const c = getCompany(id); if (!c) return;
  $('#nomeEmp').value = c.nome;
  $('#cnpjEmp').value = c.cnpj || '';
  $('#tipoEmp').value = c.tipo;
  $('#limiteMensal').value = c.limite;
  $('#formEmpresa').dataset.editing = id;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deleteEmpresa(id){
  if (!confirm('Excluir esta empresa? As notas associadas serão mantidas.')) return;
  const list = LS.getCompanies().filter(c=>c.id!==id);
  LS.setCompanies(list);
  refreshEmpresas();
  refreshDashboard();
  refreshNotas();
}

$('#formEmpresa').addEventListener('submit', e => {
  e.preventDefault();
  const nome = $('#nomeEmp').value.trim();
  const cnpj = $('#cnpjEmp').value.trim();
  const tipo = $('#tipoEmp').value;
  const limite = Number($('#limiteMensal').value || 0);
  if (!nome) return alert('Informe o nome.');
  if (!limite) return alert('Informe o limite mensal.');
  const list = LS.getCompanies();
  const editing = e.target.dataset.editing;
  if (editing) {
    const idx = list.findIndex(c=>c.id===editing);
    list[idx] = { ...list[idx], nome, cnpj, tipo, limite };
    delete e.target.dataset.editing;
  } else {
    list.push({ id: crypto.randomUUID(), nome, cnpj, tipo, limite });
  }
  LS.setCompanies(list);
  e.target.reset();
  refreshEmpresas();
  refreshDashboard();
  refreshNotas();
  alert('Empresa salva com sucesso.');
});

/********************
 * Notas (Admin)    *
 ********************/
function refreshNotas(){
  const inv = LS.getInvoices();
  const companies = LS.getCompanies();
  const tbody = $('#tNotas');
  if (!inv.length) tbody.innerHTML = '<tr><td colspan="5" class="muted">Nenhuma nota lançada.</td></tr>';
  else tbody.innerHTML = inv.sort((a,b)=>a.date>b.date? -1:1).map(n=>{
    const comp = companies.find(c=>c.id===n.empresaId);
    return `
    <tr>
      <td>${new Date(n.date).toLocaleDateString('pt-BR')}</td>
      <td>${comp?comp.nome:'—'}</td>
      <td>${n.desc || ''}</td>
      <td class="right">${fmt.money(n.valor)}</td>
      <td class="right"><button onclick="deleteNota('${n.id}')">Excluir</button></td>
    </tr>`;
  }).join('');

  // Notas do período (dashboard table)
  const ym = state.filterYM;
  const selected = inv.filter(n => fmt.ym(n.date) === ym && (state.filterEmpresa==='all' || n.empresaId===state.filterEmpresa));
  const tPer = $('#tNotasPeriodo');
  if (!selected.length) tPer.innerHTML = '<tr><td colspan="4" class="muted">Sem notas neste período.</td></tr>';
  else tPer.innerHTML = selected.sort((a,b)=>a.date>b.date? -1:1).map(n=>{
    const comp = companies.find(c=>c.id===n.empresaId);
    return `
      <tr>
        <td>${new Date(n.date).toLocaleDateString('pt-BR')}</td>
        <td>${comp?comp.nome:'—'}</td>
        <td>${n.desc || ''}</td>
        <td class="right">${fmt.money(n.valor)}</td>
      </tr>
    `;
  }).join('');
}

function deleteNota(id){
  if (!confirm('Excluir esta nota fiscal?')) return;
  const list = LS.getInvoices().filter(n=>n.id!==id);
  LS.setInvoices(list);
  refreshNotas();
  refreshDashboard();
}

$('#formNota').addEventListener('submit', e => {
  e.preventDefault();
  const empresaId = $('#empresaNF').value;
  const date = $('#dataNF').value || fmt.dateISO(new Date());
  const valor = Number($('#valorNF').value || 0);
  const desc = $('#descNF').value.trim();
  if (!empresaId) return alert('Selecione uma empresa.');
  if (!valor) return alert('Informe um valor válido.');
  const list = LS.getInvoices();
  list.push({ id: crypto.randomUUID(), empresaId, date, valor, desc });
  LS.setInvoices(list);
  e.target.reset();
  refreshNotas();
  refreshDashboard();
  alert('Nota lançada com sucesso.');
});

/********************
 * Dashboard        *
 ********************/
function computeResumo(ym, empresaId='all'){
  const companies = LS.getCompanies();
  const inv = LS.getInvoices();
  const scope = empresaId==='all' ? companies.map(c=>c.id) : [empresaId];
  const rows = scope.map(id => {
    const comp = companies.find(c=>c.id===id);
    const notas = inv.filter(n => n.empresaId===id && fmt.ym(n.date)===ym);
    const gasto = notas.reduce((s,n)=>s+Number(n.valor||0),0);
    const limite = Number(comp?.limite || 0);
    const restante = limite - gasto;
    const pct = limite>0 ? Math.min(100, Math.max(0, (gasto/limite)*100)) : 0;
    let status = 'ok';
    if (pct >= 85 && pct < 100) status = 'warn';
    if (pct >= 100) status = 'bad';
    return { id, nome: comp?.nome || '—', tipo: comp?.tipo || '—', limite, gasto, restante, pct, notas };
  });
  return rows;
}

function renderResumo(){
  const ym = state.filterYM;
  const empresaId = state.filterEmpresa;
  const rows = computeResumo(ym, empresaId);
  const el = $('#dashboardResumo');
  if (!rows.length) { el.innerHTML = '<div class="muted">Cadastre empresas para visualizar o resumo.</div>'; return; }
  el.innerHTML = rows.map(r=>`
    <div class="card" style="margin-bottom:12px">
      <div class="content">
        <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap">
          <div>
            <div class="chips" style="margin-bottom:8px">
              <span class="chip">${r.tipo}</span>
              <span class="chip">${new Date(ym+'-01').toLocaleDateString('pt-BR', {month:'long', year:'numeric'})}</span>
            </div>
            <div class="kpi"><span class="dot"></span><b>${r.nome}</b></div>
            <div class="muted">Limite: <b>${fmt.money(r.limite)}</b> • Utilizado: <b>${fmt.money(r.gasto)}</b> • Restante: <b>${fmt.money(r.restante)}</b></div>
          </div>
          <div style="min-width:220px; flex:1">
            <div class="progress" aria-label="Progresso de consumo"><i style="width:${r.pct.toFixed(1)}%"></i></div>
            <div style="display:flex; justify-content:space-between; margin-top:6px; font-weight:700">
              <span>${r.pct.toFixed(1)}%</span>
              <span class="pill ${r.pct>=100?'bad':(r.pct>=85?'warn':'ok')}">${r.pct>=100?'Estourou':(r.pct>=85?'Quase no limite':'Saudável')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function refreshDashboard(){
  $('#monthLabel').textContent = new Date(state.filterYM+'-01').toLocaleDateString('pt-BR', {month:'long', year:'numeric'});
  renderResumo();
  refreshNotas(); // atualiza tabela do período
}

// Filtro
$('#formFiltro').addEventListener('submit', e => {
  e.preventDefault();
  const ym = $('#mes').value || fmt.ym(new Date());
  state.filterYM = ym;
  state.filterEmpresa = state.user.role==='admin' ? ($('#filtroEmpresa').value || 'all') : state.user.empresaId;
  refreshDashboard();
});

/********************
 * Tabs/Nav         *
 ********************/
$$('#navTabs .tab').forEach(btn => btn.addEventListener('click', () => {
  $$('#navTabs .tab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  const id = btn.dataset.tab;
  [
    'dashboard','empresas','notas','caixa','despesas','faturamento','imposto','notas-emitidas-me',
    'imposto-das','notas-emitidas-mei','controle-mensal'
  ].forEach(t => $('#tab-'+t).classList.toggle('hide', t!==id));
}));

// Init
(function init(){
  // default month
  $('#mes').value = state.filterYM;
  showLogin();
  // default dates
  $('#dataNF').value = fmt.dateISO(new Date());
})();