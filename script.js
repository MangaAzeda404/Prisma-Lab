const $ = (selector) => document.querySelector(selector);
const panels = {
  oracle: $("#oraclePanel"),
  idea: $("#ideaPanel"),
  creative: $("#creativePanel")
};
const workspace = $("#estudio");
const modeCard = $('[data-action="creative"]');
const dialog = $("#terminalDialog");
const terminalInput = $("#terminalInput");
let currentPanel = "";
let lastIdea = -1;
let lastAnswer = -1;
let ideaCount = 0;

const ideas = [
  { theme: "ambiente", title: "Horta que conversa com você", description: "Crie sensores simples que acompanham a umidade do solo e avisam quando cada planta precisa de água." },
  { theme: "ambiente", title: "Mapa vivo do bairro", description: "Monte um mapa colaborativo de árvores, sombra e pontos de reciclagem para inspirar pequenas ações locais." },
  { theme: "ambiente", title: "Energia à vista", description: "Imagine um painel que transforma o consumo de energia de casa em desafios semanais de economia." },
  { theme: "educacao", title: "Matéria vira missão", description: "Transforme um conteúdo escolar em desafios curtos, com dicas progressivas e conquistas compartilháveis." },
  { theme: "educacao", title: "Museu de histórias próximas", description: "Crie uma coleção digital de relatos e fotografias da comunidade, contados por quem vive nela." },
  { theme: "educacao", title: "Explique do seu jeito", description: "Faça uma ferramenta em que estudantes ensinam um conceito por desenho, áudio ou pequenas animações." },
  { theme: "cotidiano", title: "Troca boa", description: "Desenhe uma rede de bairro para emprestar objetos pouco usados e reduzir compras desnecessárias." },
  { theme: "cotidiano", title: "Minutos que importam", description: "Projete um organizador que sugere pausas criativas e pequenas tarefas de acordo com o tempo disponível." },
  { theme: "cotidiano", title: "Rota acessível", description: "Crie um mapa onde moradores registram calçadas acessíveis, rampas e obstáculos do trajeto." }
];
const answers = [
  "Comece com uma versão pequena e descubra o que ela pode ensinar.",
  "Converse com alguém que vê esse desafio por outro ângulo.",
  "Troque a pergunta: o que aconteceria se a solução fosse mais simples?",
  "Observe o que já funciona e experimente mudar apenas uma parte.",
  "Seu próximo passo pode ser fazer um teste, não encontrar a resposta perfeita.",
  "Imagine três possibilidades improváveis. Uma delas pode surpreender você."
];

function pickIndex(length, previous) {
  if (length < 2) return 0;
  let index = Math.floor(Math.random() * (length - 1));
  if (index >= previous && previous >= 0) index++;
  return index;
}
function openPanel(name, { scroll = true, focus = false } = {}) {
  $("#placeholder").hidden = true;
  Object.entries(panels).forEach(([key, panel]) => { panel.hidden = key !== name; });
  currentPanel = name;
  $("#workspaceMode").textContent = { oracle: "ORÁCULO ATIVO", idea: "IDEA ENGINE ATIVO", creative: "CREATIVE MODE ATIVO" }[name];
  if (scroll) workspace.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "center" });
  if (focus) {
    const target = name === "oracle" ? $("#question") : name === "idea" ? $("#ideaTheme") : $("#modeToggle");
    setTimeout(() => target.focus({ preventScroll: true }), scroll ? 350 : 0);
  }
}
function generateIdea() {
  const theme = $("#ideaTheme").value;
  const choices = ideas.map((item, index) => ({ item, index })).filter(({ item }) => theme === "surpresa" || item.theme === theme);
  const available = choices.filter(({ index }) => index !== lastIdea);
  const pool = available.length ? available : choices;
  const selected = pool[Math.floor(Math.random() * pool.length)];
  lastIdea = selected.index;
  ideaCount++;
  $("#ideaCount").textContent = String(ideaCount).padStart(2, "0");
  $("#ideaTitle").textContent = selected.item.title;
  $("#ideaDescription").textContent = selected.item.description;
  $("#ideaResult").hidden = false;
  return selected.item.title;
}
function setCreative(active) {
  document.body.classList.toggle("creative", active);
  modeCard.setAttribute("aria-pressed", String(active));
  $("#modeCardLabel").firstChild.textContent = active ? "VOLTAR AO MODO ORIGINAL " : "ATIVAR NOVO MODO ";
  $("#creativeTitle").textContent = active ? "Uma nova perspectiva." : "De volta ao começo.";
  $("#creativeDescription").textContent = active ? "A atmosfera do laboratório mudou. Explore as cores e experimente voltar quando quiser." : "O laboratório voltou às cores originais. Você pode ativar o novo modo a qualquer momento.";
  $("#modeToggle").firstChild.textContent = active ? "VOLTAR AO MODO ORIGINAL ↗" : "ATIVAR NOVO MODO ↗";
  try { localStorage.setItem("nova-lab-mode", active ? "creative" : "original"); } catch {}
}
function toggleCreative() {
  const active = !document.body.classList.contains("creative");
  setCreative(active);
  openPanel("creative");
  return active;
}
function handleAction(action) {
  if (action === "creative") { toggleCreative(); return; }
  openPanel(action, { focus: true });
  if (action === "idea") generateIdea();
}
document.querySelectorAll("[data-action]").forEach(card => card.addEventListener("click", () => handleAction(card.dataset.action)));
$("#surpriseBtn").addEventListener("click", () => handleAction(["oracle", "idea", "creative"][Math.floor(Math.random() * 3)]));
$("#oracleForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const question = $("#question").value.trim();
  if (question.length < 3) { $("#question").setCustomValidity("Escreva uma pergunta com pelo menos 3 caracteres."); $("#question").reportValidity(); return; }
  $("#question").setCustomValidity("");
  lastAnswer = pickIndex(answers.length, lastAnswer);
  $("#oracleAnswer").textContent = answers[lastAnswer];
  $("#oracleQuestion").textContent = 'Sua pergunta: “' + question + '”';
  $("#oracleResult").hidden = false;
});
$("#question").addEventListener("input", () => $("#question").setCustomValidity(""));
$("#generateIdea").addEventListener("click", generateIdea);
$("#againBtn").addEventListener("click", generateIdea);
$("#modeToggle").addEventListener("click", toggleCreative);

function openTerminal() { if (!dialog.open) { dialog.showModal(); terminalInput.focus(); } }
function closeTerminal() { if (dialog.open) dialog.close(); }
$("#terminalBtn").addEventListener("click", openTerminal);
$("#closeTerminal").addEventListener("click", closeTerminal);
dialog.addEventListener("click", event => { if (event.target === dialog) closeTerminal(); });
document.addEventListener("keydown", event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); dialog.open ? closeTerminal() : openTerminal(); }
});
function log(command, response) {
  const entry = document.createElement("div");
  entry.className = "terminal-entry";
  const label = document.createElement("span");
  label.textContent = "> " + command;
  entry.append(label, document.createTextNode("\n" + response));
  $("#terminalLog").append(entry);
  $("#terminalLog").scrollTop = $("#terminalLog").scrollHeight;
}
$("#terminalForm").addEventListener("submit", event => {
  event.preventDefault();
  const command = terminalInput.value.trim().toLocaleLowerCase("pt-BR");
  terminalInput.value = "";
  if (!command) return;
  if (command === "limpar" || command === "clear") { $("#terminalLog").replaceChildren(); return; }
  if (command === "ajuda" || command === "help") { log(command, "Comandos: ajuda · ideia · oraculo · modo · sobre · limpar"); return; }
  if (command === "sobre") { log(command, "NOVA LAB — um espaço para explorar ideias, tecnologia e criatividade."); return; }
  if (command === "ideia") { openPanel("idea", { scroll: false }); const title = generateIdea(); log(command, 'Ideia gerada: ' + title + '. Veja o estúdio ao fechar o terminal.'); return; }
  if (command === "oraculo" || command === "oráculo") { openPanel("oracle", { scroll: false }); log(command, "Oráculo ativado. Faça sua pergunta no estúdio."); return; }
  if (command === "modo") { const active = !document.body.classList.contains("creative"); setCreative(active); openPanel("creative", { scroll: false }); log(command, active ? "Creative Mode ativado." : "Modo original restaurado."); return; }
  log(command, 'Comando não encontrado. Digite "ajuda".');
});
try { if (localStorage.getItem("nova-lab-mode") === "creative") setCreative(true); } catch {}
function clock() { $("#time").textContent = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }); }
clock();
setInterval(clock, 30000);
