let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
let notas = JSON.parse(localStorage.getItem("notas")) || [];
let usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado")) || null;

// Troca de abas
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-content").forEach(sec => sec.classList.remove("active"));
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

// Cadastro
document.getElementById("formCadastro").addEventListener("submit", e => {
  e.preventDefault();
  const nome = document.getElementById("nome").value;
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  usuarios.push({ nome, email, senha });
  localStorage.setItem("usuarios", JSON.stringify(usuarios));

  alert("Usuário cadastrado com sucesso!");
  e.target.reset();
});

// Login
document.getElementById("formLogin").addEventListener("submit", e => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const senha = document.getElementById("loginSenha").value;

  const user = usuarios.find(u => u.email === email && u.senha === senha);
  if (user) {
    usuarioLogado = user;
    localStorage.setItem("usuarioLogado", JSON.stringify(user));
    alert("Login realizado!");
    document.getElementById("dashboard").classList.add("active");
  } else {
    alert("Usuário ou senha incorretos.");
  }
});

// Notas
function atualizarNotas() {
  const ul = document.getElementById("notasUl");
  ul.innerHTML = "";
  let total = 0;

  notas.forEach((nota, i) => {
    const li = document.createElement("li");
    li.innerHTML = `${nota.descricao} - R$ ${nota.valor.toFixed(2)} 
      ${nota.pdf ? `<a href="${nota.pdf}" target="_blank">[PDF]</a>` : ""}`;
    const btn = document.createElement("button");
    btn.textContent = "X";
    btn.onclick = () => {
      notas.splice(i, 1);
      localStorage.setItem("notas", JSON.stringify(notas));
      atualizarNotas();
    };
    li.appendChild(btn);
    ul.appendChild(li);
    total += nota.valor;
  });

  document.getElementById("totalNotas").textContent = notas.length;
  document.getElementById("valorTotal").textContent = total.toFixed(2);
}

document.getElementById("formNota").addEventListener("submit", e => {
  e.preventDefault();
  const descricao = document.getElementById("descricao").value;
  const valor = parseFloat(document.getElementById("valor").value);
  const pdfFile = document.getElementById("pdfUpload").files[0];
  let pdfUrl = null;

  if (pdfFile) {
    pdfUrl = URL.createObjectURL(pdfFile);
  }

  notas.push({ descricao, valor, pdf: pdfUrl });
  localStorage.setItem("notas", JSON.stringify(notas));

  atualizarNotas();
  e.target.reset();
});

// Login ADM
if (email === "admin@contax.com" && senha === "123456") {
    localStorage.setItem("adminLogado", "true");
    window.location.href = "admin.html"; // redireciona pro painel
}


// Exportar dados
document.getElementById("btnExportar").addEventListener("click", () => {
  const dados = { usuario: usuarioLogado, notas };
  const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "dados-contax.json";
  a.click();
});

atualizarNotas();
