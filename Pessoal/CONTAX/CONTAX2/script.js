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
  resetAll() { localStorage.clear(); }
};

let state = { role: null, user: null };
const screenLogin = document.getElementById('screenLogin');
const screenApp = document.getElementById('screenApp');
const navTabs = document.getElementById('navTabs');
const who = document.getElementById('who');
const btnLogout = document.getElementById('btnLogout');
const loginAdmin = document.getElementById('loginAdmin');
const loginEmpresa = document.getElementById('loginEmpresa');
const empresaSelect = document.getElementById('empresaSelect');

function updateEmpresaSelects() {
  const companies = LS.getCompanies();
  [empresaSelect, document.getElementById('filtroEmpresa'), document.getElementById('empresaNF')].forEach(sel => {
    if(sel) sel.innerHTML = companies.map(c=>`<option value="${c.nome}">${c.nome}</option>`).join('');
  });
}

document.getElementById('role').addEventListener('change', e=>{
  if(e.target.value==='empresa') {
    loginAdmin.classList.add('hide');
    loginEmpresa.classList.remove('hide');
  } else {
    loginAdmin.classList.remove('hide');
    loginEmpresa.classList.add('hide');
  }
});

document.getElementById('formLogin').addEventListener('submit', e=>{
  e.preventDefault();
  const role = document.getElementById('role').value;
  if(role==='admin'){
    const pass = document.getElementById('adminPass').value;
    if(pass===LS.getAdminPass()){
      state = {role:'admin', user:'Administrador'};
      enterApp();
    } else { alert('Senha do administrador incorreta!'); }
  } else {
    const empresaNome = empresaSelect.value;
    const empresaPass = document.getElementById('empresaPass').value;
    const emp = LS.getCompanies().find(c=>c.nome===empresaNome);
    if(emp && emp.senha === empresaPass){
      state = {role:'empresa', user:empresaNome};
      enterApp();
    } else { alert('Empresa ou senha incorretos!'); }
  }
});

function enterApp(){
  screenLogin.classList.add('hide');
  screenApp.classList.remove('hide');
  navTabs.classList.remove('hide');
  btnLogout.classList.remove('hide');
  who.textContent = state.user;
  updateEmpresaSelects();
}

btnLogout.addEventListener('click', ()=>{
  state = {role:null, user:null};
  screenLogin.classList.remove('hide');
  screenApp.classList.add('hide');
  navTabs.classList.add('hide');
  btnLogout.classList.add('hide');
  document.getElementById('role').value='admin';
  loginAdmin.classList.remove('hide');
  loginEmpresa.classList.add('hide');
});

document.getElementById('btnSeed').addEventListener('click', ()=>{
  LS.resetAll();
  LS.setAdminPass('admin123');
  LS.setCompanies([
    {nome:'Acme LTDA', tipo:'ME', limite:10000, senha:'acme123'},
    {nome:'Beta MEI', tipo:'MEI', limite:6750, senha:'beta123'}
  ]);
  LS.setInvoices([
    {data:'2025-08-01', empresa:'Acme LTDA', desc:'Serviço X', valor:1200},
    {data:'2025-08-05', empresa:'Beta MEI', desc:'Produto Y', valor:600}
  ]);
  alert('Dados de exemplo populados!');
  updateEmpresaSelects();
});
