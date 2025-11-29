/********************
 * CONTAX — Storage *
 ********************/
const LS = {
  companiesKey: 'contax_companies',
  invoicesKey: 'contax_invoices',
  adminPassKey: 'contax_admin_pass',
  dasKey: 'contax_das',
  getCompanies() { return JSON.parse(localStorage.getItem(this.companiesKey) || '[]'); },
  setCompanies(list) { localStorage.setItem(this.companiesKey, JSON.stringify(list)); },
  getInvoices() { return JSON.parse(localStorage.getItem(this.invoicesKey) || '[]'); },
  setInvoices(list) { localStorage.setItem(this.invoicesKey, JSON.stringify(list)); },
  getDAS() { return JSON.parse(localStorage.getItem(this.dasKey) || '{}'); },
  setDAS(data) { localStorage.setItem(this.dasKey, JSON.stringify(data)); },
  getAdminPass() { return localStorage.getItem(this.adminPassKey) || 'admin123'; },
  setAdminPass(v) { localStorage.setItem(this.adminPassKey, v); },
  resetAll() { 
    localStorage.removeItem(this.companiesKey);
    localStorage.removeItem(this.invoicesKey);
    localStorage.removeItem(this.dasKey);
  }
};

/********************
 * Formatação       *
 ********************/
const fmt = {
  money(v) { return Number(v || 0).toLocaleString('pt-BR', { style:'currency', currency:'BRL' }); },
  dateISO(d=new Date()) {
    const pad = n => String(n).padStart(2,'0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  },
  date(d) {
    if (!d) return '';
    if (typeof d === 'string') d = new Date(d);
    return d.toLocaleDateString('pt-BR');
  },
  ym(d) {
    if (typeof d === 'string') d = new Date(d);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  },
  byMonth(list, yymm) { return list.filter(n => fmt.ym(n.date) === yymm); }
};

/********************
 * Estado Global    *
 ********************/
const state = {
  user: null,
  filterYM: fmt.ym(new Date()),
  filterEmpresa: 'all',
  impersonateCompanyId: null
};

/********************
 * DOM Helpers      *
 ********************/
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const isAdmin = () => state.user && state.user.role === 'admin';

function getCompany(id) { 
  return LS.getCompanies().find(c => c.id === id); 
}

function effectiveCompanyId() {
  if (!state.user) return null;
  if (state.user.role === 'empresa') return state.user.empresaId;
  if (state.user.role === 'admin' && state.impersonateCompanyId) return state.impersonateCompanyId;
  return null;
}

/********************
 * UI Principal     *
 ********************/
function showLogin() {
  $('#screenLogin').classList.remove('hide');
  $('#screenApp').classList.add('hide');
  $('#navTabs').classList.add('hide');
  $('#btnLogout').classList.add('hide');
  $('#btnStopAccess').classList.add('hide');
  $('#who').textContent = '';
  
  const companies = LS.getCompanies();
  const sel = $('#empresaSelect');
  if (sel) {
    sel.innerHTML = companies.length ? 
      companies.map(c=>`<option value="${c.id}">${c.nome}</option>`).join('') : 
      '<option value="">Nenhuma empresa cadastrada</option>';
  }
  
  if ($('#empresaPass')) $('#empresaPass').value = '';
  state.impersonateCompanyId = null;
}

function showApp() {
  $('#screenLogin').classList.add('hide');
  $('#screenApp').classList.remove('hide');
  $('#navTabs').classList.remove('hide');
  $('#btnLogout').classList.remove('hide');

  if (state.user.role === 'admin' && state.impersonateCompanyId) {
    $('#btnStopAccess').classList.remove('hide');
  } else {
    $('#btnStopAccess').classList.add('hide');
  }

  const effId = effectiveCompanyId();
  const name = state.user.role === 'admin' ? 
    (effId ? `${getCompany(effId)?.nome} (impersonando)` : 'Administrador') : 
    getCompany(state.user.empresaId)?.nome;
  $('#who').textContent = name ? `Acesso: ${name}` : '';

  // Esconder todas as abas primeiro
  $$('#navTabs .tab').forEach(tab => tab.classList.add('hide'));
  $('[data-tab="dashboard"]').classList.remove('hide');

  // Mostrar abas apropriadas
if (state.user.role === 'admin') {
  // Abas visíveis apenas para administradores
  [
    'dashboard', 'empresas', 'notas', 'empresas-me', 'empresas-mei'
  ].forEach(tab => $(`[data-tab="${tab}"]`).classList.remove('hide'));

} else {
  // Abas visíveis para empresas
  const empresa = getCompany(effectiveCompanyId());

  if (empresa?.tipo === 'ME') {
    // Empresa ME
    [
      'dashboard', 'caixa', 'despesas', 'faturamento', 'imposto', 'notas-emitidas-me'
    ].forEach(tab => $(`[data-tab="${tab}"]`).classList.remove('hide'));
  } 
  else if (empresa?.tipo === 'MEI') {
    // Empresa MEI
    [
      'dashboard', 'imposto-das', 'notas-emitidas-mei', 'controle-mensal'
    ].forEach(tab => $(`[data-tab="${tab}"]`).classList.remove('hide'));
  }

  // Esconde abas de admin
  [
    'empresas', 'notas', 'empresas-me', 'empresas-mei'
  ].forEach(tab => $(`[data-tab="${tab}"]`).classList.add('hide'));
}


  // Aba padrão ativa
  $$('button.tab').forEach(b => b.classList.remove('active'));
  $('[data-tab="dashboard"]').classList.add('active');

  // Esconder todas as seções exceto dashboard
  [
    'dashboard','empresas','notas','caixa','despesas','faturamento','imposto',
    'notas-emitidas-me','imposto-das','notas-emitidas-mei','controle-mensal',
    'empresas-me','empresas-mei'
  ].forEach(t => {
    const el = $('#tab-'+t);
    if (el) el.classList.toggle('hide', t !== 'dashboard');
  });

  // Atualizar filtros de empresa
  const filtroEmp = $('#filtroEmpresa');
  const companies = LS.getCompanies();
  if (state.user.role === 'admin' && !state.impersonateCompanyId) {
    if (filtroEmp) {
      filtroEmp.innerHTML = '<option value="all">Todas</option>' + 
        companies.map(c=>`<option value="${c.id}">${c.nome}</option>`).join('');
    }
    $('#filtroEmpresaWrap').style.display = '';
    state.filterEmpresa = 'all';
  } else {
    const eid = effectiveCompanyId();
    if (filtroEmp) {
      filtroEmp.innerHTML = companies
        .filter(c=>c.id===eid)
        .map(c=>`<option value="${c.id}">${c.nome}</option>`)
        .join('');
    }
    $('#filtroEmpresaWrap').style.display = 'none';
    state.filterEmpresa = eid || 'all';
  }

  $('#mes').value = state.filterYM;
  $('#monthLabel').textContent = new Date(state.filterYM+'-01')
    .toLocaleDateString('pt-BR', {month:'long', year:'numeric'});

  setAppEditable(isAdmin());
  refreshAll();
}

function setAppEditable(editable) {
  const container = $('#screenApp');
  if (!container) return;
  const controls = container.querySelectorAll('input, select, textarea, button');
  controls.forEach(el => {
    if (el.id === 'btnLogout' || el.id === 'btnStopAccess') return;
    if (el.closest('.nav')) return;
    el.disabled = !editable;
  });

  if (!isAdmin()) {
  document.querySelectorAll('.admin-only').forEach(el => el.classList.add('hide'));
} else {
  document.querySelectorAll('.admin-only').forEach(el => el.classList.remove('hide'));
}

}

/********************
 * Atualizações UI  *
 ********************/
function refreshAll() {
  refreshEmpresas();
  refreshNotas();
  refreshDashboard();
  refreshDAS();
  refreshDASForm();
  refreshCompanyGroupSelects();
}

function refreshEmpresas() {
  const list = LS.getCompanies();
  const tbody = $('#tEmpresas');
  if (!tbody) return;
  
  if (!list.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="muted">Nenhuma empresa cadastrada.</td></tr>';
    return;
  }

  tbody.innerHTML = list.map(c => `
    <tr>
      <td>
        <div style="font-weight:800">${c.nome}</div>
        <div class="muted" style="font-size:12px">${c.cnpj || ''}</div>
      </td>
      <td><span class="pill ${c.tipo==='MEI'?'ok':'warn'}">${c.tipo}</span></td>
      <td>${fmt.money(c.limite)}</td>
      <td class="right">
        ${isAdmin() ? `
          <button class="secondary" onclick="editEmpresa('${c.id}')">Editar</button>
          <button onclick="deleteEmpresa('${c.id}')">Excluir</button>
          <button onclick="accessCompany('${c.id}')">Acessar</button>
        ` : ''}
      </td>
    </tr>
  `).join('');

  refreshCompanySelects();
}

function refreshCompanySelects() {
  const companies = LS.getCompanies();
  
  // Atualizar select de NF
  const selNF = $('#empresaNF');
  if (selNF) {
    selNF.innerHTML = companies.map(c => 
      `<option value="${c.id}">${c.nome}</option>`
    ).join('');
  }

  // Atualizar select de login
  const selLogin = $('#empresaSelect');
  if (selLogin) {
    selLogin.innerHTML = companies.map(c =>
      `<option value="${c.id}">${c.nome}</option>`
    ).join('');
  }

  refreshCompanyGroupSelects();
}

function refreshCompanyGroupSelects() {
  const companies = LS.getCompanies();
  const meList = companies.filter(c => c.tipo === 'ME');
  const meiList = companies.filter(c => c.tipo === 'MEI');

  const selME = $('#selectEmpresaME');
  if (selME) {
    selME.innerHTML = `<option value="">-- selecione --</option>` + 
      meList.map(c=>`<option value="${c.id}">${c.nome}</option>`).join('');
  }
  
  const selMEI = $('#selectEmpresaMEI');
  if (selMEI) {
    selMEI.innerHTML = `<option value="">-- selecione --</option>` + 
      meiList.map(c=>`<option value="${c.id}">${c.nome}</option>`).join('');
  }
}

function refreshDashboard() {
  const el = $('#dashboardResumo');
  if (!el) return;

  const companies = LS.getCompanies();
  const invoices = LS.getInvoices();
  const thisMonth = fmt.byMonth(invoices, state.filterYM);
  
  if (!companies.length) {
    el.innerHTML = '<div class="muted">Nenhuma empresa cadastrada.</div>';
    return;
  }

  if (!thisMonth.length) {
    el.innerHTML = '<div class="muted">Nenhuma nota fiscal no período.</div>';
    return;
  }

  const total = thisMonth.reduce((sum, nf) => sum + nf.valor, 0);
  const byCompany = {};
  thisMonth.forEach(nf => {
    byCompany[nf.empresaId] = (byCompany[nf.empresaId] || 0) + nf.valor;
  });

  el.innerHTML = `
    <div class="stat">
      <div class="value">${fmt.money(total)}</div>
      <div class="label">Total do Período</div>
    </div>
    <hr/>
    <div class="list">
      ${Object.entries(byCompany).map(([id, valor]) => `
        <div class="item">
          <div class="name">${getCompany(id)?.nome}</div>
          <div class="value">${fmt.money(valor)}</div>
        </div>
      `).join('')}
    </div>
  `;

  // Atualizar tabela de notas do período
  const tbody = $('#tNotasPeriodo');
  if (tbody) {
    tbody.innerHTML = thisMonth.map(nf => `
      <tr>
        <td>${fmt.date(nf.date)}</td>
        <td>${getCompany(nf.empresaId)?.nome}</td>
        <td>${nf.desc}</td>
        <td class="right">${fmt.money(nf.valor)}</td>
      </tr>
    `).join('');
  }
}

function refreshNotas() {
  const tbody = $('#tNotas');
  if (!tbody) return;

  const list = LS.getInvoices();
  if (!list.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="muted">Nenhuma nota fiscal lançada.</td></tr>';
    return;
  }

  tbody.innerHTML = list.map(nf => `
    <tr>
      <td>${fmt.date(nf.date)}</td>
      <td>${getCompany(nf.empresaId)?.nome}</td>
      <td>${nf.desc}</td>
      <td class="right">${fmt.money(nf.valor)}</td>
      <td class="right">
        ${isAdmin() ? `<button onclick="deleteNota('${nf.id}')">Excluir</button>` : ''}
      </td>
    </tr>
  `).join('');
}

function refreshDAS() {
  const el = $('#dasResumo');
  if (!el) return;

  const das = LS.getDAS();
  const effId = effectiveCompanyId();
  const entries = Object.entries(das)
    .filter(([k]) => !effId || k.startsWith(effId))
    .sort((a,b) => b[0].localeCompare(a[0]));

  if (!entries.length) {
    el.innerHTML = '<div class="muted">Nenhum DAS registrado.</div>';
    return;
  }

  el.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Empresa</th>
          <th>Competência</th>
          <th>Vencimento</th>
          <th>Valor</th>
          <th>Status</th>
          <th>Observações</th>
        </tr>
      </thead>
      <tbody>
        ${entries.map(([k,v]) => `
          <tr>
            <td>${getCompany(v.empresaId)?.nome}</td>
            <td>${v.competencia}</td>
            <td>${fmt.date(v.vencimento)}</td>
            <td class="right">${fmt.money(v.valor)}</td>
            <td><span class="pill ${v.status==='pago'?'ok':'warn'}">${v.status}</span></td>
            <td>${v.obs || ''}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function refreshDASForm() {
  const form = $('#formDAS');
  if (!form) return;

  const effId = effectiveCompanyId();
  if (!effId) {
    form.classList.add('hide');
    return;
  }

  form.classList.remove('hide');
  const sel = $('#dasEmpresaSelect');
  if (sel) {
    const companies = LS.getCompanies();
    sel.innerHTML = companies
      .filter(c => c.tipo === 'MEI')
      .map(c => `<option value="${c.id}">${c.nome}</option>`)
      .join('');
    sel.value = effId;
  }
}

/********************
 * Event Handlers   *
 ********************/
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
    if (pass !== LS.getAdminPass()) {
      alert('Senha de administrador incorreta.');
      return;
    }
    state.user = { role: 'admin' };
  } else {
  const cnpj = ($('#empresaCnpj').value || '').trim();
  const pass = $('#empresaPass').value || '';
  const errorBox = $('#loginError');

  // Função para exibir mensagens de erro elegantes
  function showLoginError(msg) {
    if (!errorBox) return;
    errorBox.textContent = msg;
    errorBox.classList.remove('hide');
    setTimeout(() => errorBox.classList.add('hide'), 4000);
  }

  // Procurar empresa pelo CNPJ digitado (ignora pontos e traços)
  const empresa = LS.getCompanies().find(c => c.cnpj.replace(/\D/g, '') === cnpj.replace(/\D/g, ''));

  if (!empresa) {
    showLoginError('❌ Empresa não encontrada. Verifique o CNPJ digitado.');
    return;
  }
  if (pass !== empresa.senha) {
    showLoginError('🔒 Senha incorreta. Tente novamente.');
    return;
  }

  state.user = { role: 'empresa', empresaId: empresa.id };
}

  showApp();
});

// Navegação por abas
$$('#navTabs .tab').forEach(btn => {
  btn.addEventListener('click', e => {
    const tab = e.target.dataset.tab;
    if (!tab) return;

    $$('button.tab').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');

    $$('section[id^="tab-"]').forEach(section => {
      section.classList.toggle('hide', section.id !== `tab-${tab}`);
    });
  });
});

// Sub-abas de empresa
$$('.subtab').forEach(btn => {
  btn.addEventListener('click', e => {
    const tab = e.target.dataset.companyTab;
    if (!tab) return;

    $$('.subtab').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');

    const section = $(`#tab-${tab}`);
    if (section) {
      section.classList.remove('hide');
      section.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Logout
$('#btnLogout').addEventListener('click', () => {
  state.user = null;
  state.impersonateCompanyId = null;
  showLogin();
});

$('#btnStopAccess').addEventListener('click', () => {
  state.impersonateCompanyId = null;
  showApp();
});

// Filtros
$('#formFiltro').addEventListener('submit', e => {
  e.preventDefault();
  state.filterYM = $('#mes').value;
  state.filterEmpresa = $('#filtroEmpresa').value;
  refreshAll();
});

// Formulário de empresa
$('#formEmpresa').addEventListener('submit', e => {
  e.preventDefault();
  
  const company = {
    id: crypto.randomUUID(),
    nome: $('#nomeEmp').value,
    cnpj: $('#cnpjEmp').value,
    tipo: $('#tipoEmp').value,
    limite: Number($('#limiteMensal').value),
    senha: $('#senhaEmp').value
  };

  const companies = LS.getCompanies();
  companies.push(company);
  LS.setCompanies(companies);
  
  e.target.reset();
  refreshAll();
});

// Formulário de nota fiscal
$('#formNota').addEventListener('submit', e => {
  e.preventDefault();
const fileInput = $('#anexoNF');
let fileData = null;

if (fileInput && fileInput.files.length > 0) {
  const file = fileInput.files[0];
  // Armazena o PDF como Base64 (limitado pelo tamanho permitido do localStorage)
  const reader = new FileReader();
  reader.onload = function(e) {
    const base64 = e.target.result;
    const invoice = {
      id: crypto.randomUUID(),
      empresaId: $('#empresaNF').value,
      date: $('#dataNF').value,
      desc: $('#descNF').value,
      valor: Number($('#valorNF').value),
      pdf: base64  // <---- aqui vai o conteúdo da nota
    };

    const invoices = LS.getInvoices();
    invoices.push(invoice);
    LS.setInvoices(invoices);

    e.target.form.reset();
    $('#dataNF').value = fmt.dateISO(new Date());
    refreshAll();
  };

  
  reader.readAsDataURL(file);
  return; // sai do listener para evitar salvar duas vezes
}


  const invoices = LS.getInvoices();
  invoices.push(invoice);
  LS.setInvoices(invoices);

  e.target.reset();
  $('#dataNF').value = fmt.dateISO(new Date());
  refreshAll();
});

// Formulário DAS
$('#formDAS')?.addEventListener('submit', e => {
  e.preventDefault();

  const das = {
    empresaId: $('#dasEmpresaSelect').value,
    competencia: $('#dasCompetencia').value,
    valor: Number($('#dasValor').value),
    vencimento: $('#dasVencimento').value,
    pagamento: $('#dasPagamento').value,
    status: $('#dasStatus').value,
    obs: $('#dasObs').value
  };

  const allDAS = LS.getDAS();
  allDAS[`${das.empresaId}_${das.competencia}`] = das;
  LS.setDAS(allDAS);

  e.target.reset();
  refreshDAS();
});

// Mostrar/ocultar senha do administrador
$('#toggleAdminPass')?.addEventListener('change', e => {
  const input = $('#adminPass');
  if (!input) return;
  input.type = e.target.checked ? 'text' : 'password';
});


// Operações de empresa
function editEmpresa(id) {
  const company = getCompany(id);
  if (!company) return;
  
  $('#nomeEmp').value = company.nome;
  $('#cnpjEmp').value = company.cnpj;
  $('#tipoEmp').value = company.tipo;
  $('#limiteMensal').value = company.limite;
  $('#senhaEmp').value = company.senha;
  
  $('[data-tab="empresas"]').click();
}

function deleteEmpresa(id) {
  if (!confirm('Tem certeza que deseja excluir esta empresa?')) return;
  
  const companies = LS.getCompanies().filter(c => c.id !== id);
  LS.setCompanies(companies);
  refreshAll();
}

function accessCompany(id) {
  state.impersonateCompanyId = id;
  showApp();
}

// Operações de nota fiscal
function deleteNota(id) {
  if (!confirm('Tem certeza que deseja excluir esta nota fiscal?')) return;
  
  const invoices = LS.getInvoices().filter(nf => nf.id !== id);
  LS.setInvoices(invoices);
  refreshAll();
}

/********************
 * Inicialização    *
 ********************/
(function init(){
  $('#mes').value = state.filterYM;
  $('#dataNF').value = fmt.dateISO(new Date());
  refreshAll();
  showLogin();
})();

// Controle de tema (claro/escuro)
const themeBtn = $('#toggleTheme');
if (themeBtn) {
  // Verifica tema salvo
  const savedTheme = localStorage.getItem('contax_theme') || 'light';
  document.body.classList.toggle('dark', savedTheme === 'dark');
  themeBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

  themeBtn.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark');
    localStorage.setItem('contax_theme', isDark ? 'dark' : 'light');
    themeBtn.textContent = isDark ? '☀️' : '🌙';
  });
}
