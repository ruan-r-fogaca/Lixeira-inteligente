// ===============================
// 🌍 Lixeira Inteligente Front-end
// ===============================

// CONFIGURAÇÃO: substitua pelo ID do seu canal ThingSpeak
const CHANNEL_ID = "3151361";
const FIELD = "1";
const UPDATE_INTERVAL = 1500; // 5 segundos

const nivelEl = document.getElementById("nivel");
const mensagemEl = document.getElementById("mensagem");
const ctx = document.getElementById("grafico").getContext("2d");

let chart;

// Cria o gráfico
function criarGrafico() {
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: "Nível da lixeira (%)",
        data: [],
        borderColor: "#00e676",
        borderWidth: 3,
        fill: false,
        tension: 0.1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          title: { display: true, text: "Nível (%)" }
        },
        x: { title: { display: true, text: "Tempo" } }
      }
    }
  });
}

// Atualiza o gráfico e dados do ThingSpeak
async function atualizarDados() {
  try {
    const url = `https://api.thingspeak.com/channels/${CHANNEL_ID}/fields/${FIELD}.json?results=10`;
    const resposta = await fetch(url);
    const dados = await resposta.json();

    const valores = dados.feeds.map(feed => parseFloat(feed[`field${FIELD}`]));
    const horarios = dados.feeds.map(feed => {
      const t = new Date(feed.created_at);
      return `${t.getHours()}:${t.getMinutes().toString().padStart(2,"0")}`;
    });

    const nivelAtual = valores[valores.length - 1];
    nivelEl.textContent = `${nivelAtual.toFixed(1)}%`;

    // Define mensagem e cor
    if (nivelAtual >= 90) {
      mensagemEl.textContent = "⚠️ Lixeira cheia!";
      nivelEl.style.color = "#ff5252";
    } else if (nivelAtual >= 70) {
      mensagemEl.textContent = "🟡 Quase cheia";
      nivelEl.style.color = "#ffeb3b";
    } else {
      mensagemEl.textContent = "🟢 Nível normal";
      nivelEl.style.color = "#00e676";
    }

    // Atualiza gráfico
    chart.data.labels = horarios;
    chart.data.datasets[0].data = valores;
    chart.update();

  } catch (erro) {
    console.error("Erro ao buscar dados:", erro);
    mensagemEl.textContent = "Erro ao conectar à API 😢";
  }
}

// Inicializa
criarGrafico();
atualizarDados();
setInterval(atualizarDados, UPDATE_INTERVAL);
