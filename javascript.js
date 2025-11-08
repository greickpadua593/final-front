const tabuleiro = document.getElementById("tabuleiro");
const resultado = document.getElementById("resultado");
const comecar = document.getElementById("comecar");

// NOVO: elemento de placar (será criado dinamicamente se não existir)
let tentativas = 0; // tentativas no jogo atual (cada par tentado conta 1)
let vitorias = JSON.parse(localStorage.getItem("vitorias_memoria")) || []; // array com número de tentativas por vitória

function garantirPlacar() {
  const controle = document.getElementById("controle");
  if (!document.getElementById("placar")) {
    const div = document.createElement("div");
    div.id = "placar";
    div.style.marginLeft = "12px";
    div.style.fontWeight = "600";
    controle.appendChild(div);
  }
}

function atualizarPlacar() {
  garantirPlacar();
  const placar = document.getElementById("placar");
  const total = vitorias.length;
  const melhor = total ? Math.min(...vitorias) : "-";
  const ultima = total ? vitorias[vitorias.length - 1] : "-";
  placar.textContent = `Vitórias: ${total} • Última: ${ultima} tentativas • Melhor: ${melhor}`;
  // também mostrar tentativas atuais junto ao resultado
  resultado.textContent = paresEncontrados + " pares encontrados" + (tentativas ? ` • Tentativas: ${tentativas}` : "");
}

const cartas = [
  { id: 1, nome: "Java" },
  { id: 2, nome: "JS" },
  { id: 3, nome: "Kotlin" },
  { id: 4, nome: "React" }
];

// use caminhos relativos (coloque as imagens dentro da pasta "img" ou ajuste os caminhos)
const imagensMap = {
  1: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='280'><rect fill='%23f8981d' width='100%25' height='100%25'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='40' fill='white'>Java</text></svg>",
  2: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='280'><rect fill='%23f0db4f' width='100%25' height='100%25'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='48' fill='%23000'>JS</text></svg>",
  3: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='280'><rect fill='%237f52ff' width='100%25' height='100%25'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='32' fill='white'>Kotlin</text></svg>",
  4: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='280'><rect fill='%2361dafb' width='100%25' height='100%25'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='32' fill='%23000'>React</text></svg>"
};

// imagem do verso (fundo) como data URI SVG
const verso = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='280'><rect fill='%23ddd' width='100%25' height='100%25'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='48' fill='%23666'>?</text></svg>";

let baralho = [];         // cartas duplicadas e embaralhadas
let primeiro = null;      // índice da primeira carta virada
let travado = false;      // evita clicar enquanto verifica
let paresEncontrados = 0; // contador de pares

function embaralhar(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function criarBaralho() {
  // duplica as cartas para formar pares e embaralha
  baralho = embaralhar([...cartas, ...cartas].map((c, idx) => ({ ...c, _idx: idx })));
  primeiro = null;
  travado = false;
  paresEncontrados = 0;
  tentativas = 0; // reinicia tentativas no início do jogo
  resultado.textContent = "0 pares encontrados";
  atualizarPlacar();
}

function criarTabuleiro() {
  tabuleiro.innerHTML = "";
  baralho.forEach((carta, i) => {
    const img = document.createElement("img");
    img.src = verso; // usa data URI do verso
    img.dataset.index = i;
    img.className = "carta";
    img.addEventListener("click", virarCarta);
    tabuleiro.appendChild(img);
  });
}

function virarCarta(e) {
  if (travado) return;
  const img = e.currentTarget;
  const idx = Number(img.dataset.index);

  // se já estiver virada (classe acertou) ou for a mesma carta, ignora
  if (img.classList.contains("acertou") || primeiro === idx) return;

  // mostra imagem real
  img.src = imagensMap[baralho[idx].id];

  if (primeiro === null) {
    primeiro = idx;
    return;
  }

  // segunda carta escolhida
  travado = true;
  const segundo = idx;
  const primeiraCarta = baralho[primeiro];
  const segundaCarta = baralho[segundo];

  // NOVO: conta uma tentativa (um par tentado)
  tentativas += 1;
  atualizarPlacar();

  setTimeout(() => {
    const imgs = tabuleiro.querySelectorAll("img");

    if (primeiraCarta.id === segundaCarta.id) {
      // acerto: marca as duas cartas
      imgs[primeiro].classList.add("acertou");
      imgs[segundo].classList.add("acertou");
      paresEncontrados++;
      resultado.textContent = `${paresEncontrados} pares encontrados`;
    } else {
      // erro: vira as duas de volta
      imgs[primeiro].src = verso;
      imgs[segundo].src = verso;
    }

    // resetar estados
    primeiro = null;
    travado = false;

    // vitória
    if (paresEncontrados === cartas.length) {
      // registra vitória com o número de tentativas deste jogo
      vitorias.push(tentativas);
      localStorage.setItem("vitorias_memoria", JSON.stringify(vitorias));
      resultado.textContent = "Parabéns! Você encontrou todas as cartas.";
      atualizarPlacar();
    } else {
      atualizarPlacar();
    }
  }, 700);
}

comecar.addEventListener("click", () => {
  criarBaralho();
  criarTabuleiro();
});

document.addEventListener("DOMContentLoaded", () => {
  criarBaralho();
  criarTabuleiro();
  atualizarPlacar();
});

