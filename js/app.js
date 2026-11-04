import { EIXOS, EIXOS_TATICOS, EIXO_ROTACAO, REGIOES, ATUALIZADO_EM } from './data/eixos.js';
import { FORMACOES, ZONAS } from './data/perguntas.js';
import { TREINADORES, TIPO_TREINADOR } from './data/treinadores.js';
import { TIMES, TIPO_TIME } from './data/times.js';
import { montarQuiz, TAMANHO, TEMAS, avaliar, vetorUsuario, ranquear, codificar, decodificar } from './engine.js';
import { campo, jogadores } from './campo.js';
import { gerarCard } from './card.js';
import { escudoSVG } from './escudos.js';
import { abrirFeedback, enviarAvaliacao } from './feedback.js';
import {
  CLUBES_TORCIDA, RESPOSTAS_SN, EXTRA_APOS_ERRO, MAX_PALPITES, MAX_PERGUNTAS, TOTAL_DIFICIL,
  posterior, proximaPergunta, horaDeChutar, escudoDoClube, titulosDoClube, clubePorId,
  montarDificil, perguntasFinaisDificil, ranquearTorcida, opostoDe, RIVAL, nomeSerie,
} from './torcida.js';
import { gerarCardTorcida } from './card.js';
import { ADSENSE } from './config.js';

const app = document.getElementById('app');

const MODOS = {
  treinador: { rotulo: 'Qual treinador você seria?', curto: 'Treinador', num: 3 },
  time: { rotulo: 'Qual time tem a sua cara?', curto: 'Time', num: 2 },
  torcida: { rotulo: 'Qual time você está pensando?', curto: 'Adivinhação', num: 1 },
};

const ESCALA = [
  { v: 2, texto: 'Concordo totalmente' },
  { v: 1, texto: 'Concordo' },
  { v: 0, texto: 'Depende' },
  { v: -1, texto: 'Discordo' },
  { v: -2, texto: 'Discordo totalmente' },
];

const estado = {
  modo: null,
  versao: null,
  tema: 'futebol',
  perguntas: [],
  idx: 0,
  respostas: [], // por índice: { valor, delta, max, regiao? }
  rascunho: null, // valor ainda não confirmado (formação, zona, slider)
  resultado: null,
  cardUrl: null,
  // modo torcida
  torcida: null, // { historico: [{ pergunta, resposta, rotulo }], atual, eliminados: Set, palpites, limite, palpite }
  dificil: null, // { perguntas, idx, historico, rascunho }
  jogo: null, // jogo aberto na tela de escolha
};

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const num = (n) => String(n).padStart(2, '0');

// ---------------------------------------------------------------- Início

// Os 3 jogos: apresentados na página inicial e detalhados na tela de escolha.
const JOGOS = {
  torcida: {
    num: 1,
    nome: 'Qual time você está pensando?',
    resumo: 'Pense em um clube e responda às perguntas. A Prancheta tenta adivinhar em qual você pensou.',
    detalhe: 'Perguntas sobre história, títulos, torcida, comunidade e rivais de clubes das Séries A, B, C e D. Escolha entre a adivinhação, que pergunta até acertar, e o quiz de 15 perguntas.',
    qtd: () => `${CLUBES_TORCIDA.length} clubes`,
  },
  time: {
    num: 2,
    nome: 'Qual time tem a sua cara?',
    resumo: 'Diga como gosta que um time jogue, que elenco quer ter e que clube combina com você, e veja qual time tem a sua cara.',
    detalhe: 'Tática, perfil de elenco e identidade do clube: torcida, história e gestão. Entram os 20 clubes da Série A 2026 e times históricos, do Santos de 1962 ao Santo André de 2004.',
    qtd: () => `${TIMES.length} times`,
  },
  treinador: {
    num: 3,
    nome: 'Qual treinador você seria?',
    resumo: 'Responda como você montaria e comandaria um time e descubra com qual treinador do futebol brasileiro você mais combina.',
    detalhe: 'Situações de jogo, formação, linha de defesa e gestão do elenco. No fim, o seu estilo é comparado com treinadores atuais, lendas e estrangeiros que marcaram o Brasil, de Telê Santana a Abel Ferreira.',
    qtd: () => `${TREINADORES.length} treinadores`,
  },
};

function telaInicio() {
  const jogoCard = (modo) => {
    const j = JOGOS[modo];
    return `
    <article class="modo jogo">
      <div class="modo-bug">
        <span class="bug-n">${j.num}</span>
        <span class="bug-t">Jogo ${j.num}</span>
        <span class="bug-q">${j.qtd()}</span>
      </div>
      <h2>${j.nome}</h2>
      <p>${j.resumo}</p>
      <button class="btn-pri jogo-btn" data-acao="escolher-jogo" data-modo="${modo}">Jogar →</button>
    </article>`;
  };

  const eixosLista = [...EIXOS_TATICOS, EIXO_ROTACAO].map((e) => `
    <li class="eixo-item">
      <span class="eixo-nome">${e.nome}</span>
      <span class="eixo-polos"><span>${e.esq}</span><i aria-hidden="true"></i><span>${e.dir}</span></span>
    </li>`).join('');

  const nomesT = TREINADORES.map((t) => `<li>${esc(t.nome)}</li>`).join('');
  const nomesH = TIMES.filter((t) => t.tipo === 'historico').map((t) => `<li>${esc(t.nome)}</li>`).join('');

  return `
    ${topo()}
    <main>
      <section class="hero hero-simples wrap">
        <div class="hero-txt">
          <p class="eyebrow">Futebol brasileiro · tática e fundamentos</p>
          <h1>Monte a sua <em>prancheta</em></h1>
          <p class="lead">Três jogos sobre o futebol brasileiro. Escolha um para começar.</p>
        </div>
      </section>

      <section class="modos jogos wrap" id="jogar">
        ${jogoCard('torcida')}
        ${jogoCard('time')}
        ${jogoCard('treinador')}
      </section>

      ${anuncio('inicio')}

      <section class="bloco wrap" id="eixos">
        <div class="bloco-cab">
          <p class="eyebrow">Como funciona</p>
          <h2>Os eixos da prancheta</h2>
          <p>Cada resposta move você em oito eixos de estilo de jogo. Cada treinador e cada time tem uma nota de 0 a 100 em cada um. O resultado é quem fica mais perto de você. No modo time, entram também o perfil do elenco (estrelas, idade, centroavante) e a identidade do clube (torcida, história e gestão).</p>
          <p>Não quer falar de futebol? Responda com <b>cultura pop</b>: música, cinema, games, arquitetura, engenharia, cidade, política e comportamento. As perguntas são só sobre os seus gostos. O resto é com a gente.</p>
        </div>
        <ul class="eixo-lista">${eixosLista}</ul>
      </section>

      <section class="bloco wrap" id="base">
        <div class="bloco-cab">
          <p class="eyebrow">A base de dados</p>
          <h2>Quem está na prancheta</h2>
          <p>Notas curadas a partir de números públicos de posse, pressão (PPDA), passes longos, altura da linha e finalizações em <a href="https://www.sofascore.com" target="_blank" rel="noopener">Sofascore</a>, <a href="https://fbref.com" target="_blank" rel="noopener">FBref</a>, <a href="https://www.ogol.com.br" target="_blank" rel="noopener">ogol</a> e <a href="https://www.transfermarkt.com.br" target="_blank" rel="noopener">Transfermarkt</a>, mais análises das campanhas. Técnicos e classificação conferidos até a ${esc(ATUALIZADO_EM)}.</p>
        </div>
        <div class="base-grid">
          <div class="base-col">
            <h3><span class="tabnum">${TREINADORES.length}</span> treinadores</h3>
            <ul class="nomes">${nomesT}</ul>
          </div>
          <div class="base-col">
            <h3><span class="tabnum">20</span> clubes da Série A 2026</h3>
            <ul class="nomes">${TIMES.filter((t) => t.tipo === 'atual').map((t) => `<li>${esc(t.nome)}</li>`).join('')}</ul>
            <h3><span class="tabnum">${TIMES.length - 20}</span> times históricos</h3>
            <ul class="nomes">${nomesH}</ul>
          </div>
        </div>
      </section>
    </main>
    ${rodape()}`;
}

// Tela de escolha de um jogo: tema e versão (jogos 1 e 2) ou dificuldade (jogo 3).
function telaJogo() {
  const modo = estado.jogo;
  const j = JOGOS[modo];
  const TEXTO_TEMA = {
    futebol: 'Situações de jogo, tática e seleções, com ações no campinho: escolher a formação, arrastar a linha de defesa e tocar na zona do gol.',
    cultura: 'Música, cinema, games, arquitetura, cidade e comportamento. Você fala só dos seus gostos; a Prancheta traduz as respostas para o futebol.',
  };
  const opcoes = modo === 'torcida' ? `
      <article class="escolha">
        <p class="eyebrow">Modo fácil</p>
        <h2>Adivinhação</h2>
        <p>Cada pergunta é escolhida pela sua resposta anterior, e a Prancheta pergunta até ter certeza. Ela tem até 3 palpites.</p>
        <button class="btn-pri" data-acao="torcida-iniciar">Jogar no modo fácil →</button>
      </article>
      <article class="escolha">
        <p class="eyebrow">Modo difícil</p>
        <h2>Quiz de ${TOTAL_DIFICIL} perguntas</h2>
        <p>Perguntas fixas, com mapa, camisa para pintar e tamanho da torcida. No fim, aparecem o time, os mais parecidos e o seu oposto.</p>
        <button class="btn-pri" data-acao="dificil-iniciar">Jogar no modo difícil →</button>
      </article>`
    : Object.entries(TEMAS).map(([tema, t]) => `
      <article class="escolha">
        <p class="eyebrow">Responder com ${t.nome.toLowerCase()}</p>
        <h2>${t.nome}</h2>
        <p>${TEXTO_TEMA[tema]}</p>
        <div class="versoes">
          <button class="versao versao-forte" data-acao="iniciar" data-modo="${modo}" data-versao="curta" data-tema="${tema}">
            <b>Curta</b><span>${TAMANHO.curta} perguntas · 3 min</span>
          </button>
          <button class="versao" data-acao="iniciar" data-modo="${modo}" data-versao="completa" data-tema="${tema}">
            <b>Completa</b><span>${TAMANHO.completa} perguntas · 6 min</span>
          </button>
        </div>
      </article>`).join('');

  return `
    ${topo()}
    <main class="tela-jogo wrap">
      <button class="btn-link voltar-jogos" data-acao="inicio">← Todos os jogos</button>
      <p class="eyebrow">Jogo ${j.num} · ${j.qtd()}</p>
      <h1>${j.nome}</h1>
      <p class="lead">${j.detalhe}</p>
      <h2 class="tela-jogo-pergunta">${modo === 'torcida' ? 'Escolha a dificuldade' : 'Como você quer responder?'}</h2>
      <div class="escolhas">${opcoes}</div>
    </main>
    ${rodape()}`;
}

function topo() {
  return `
    <header class="topo">
      <div class="wrap topo-in">
        <a class="marca" href="./" data-acao="inicio">Prancheta</a>
        <nav class="topo-nav">
          <a href="#jogar" data-acao="ancora">Jogar</a>
          <a href="#eixos" data-acao="ancora">Eixos</a>
          <a href="#base" data-acao="ancora">Base de dados</a>
          <button class="topo-fb" data-acao="feedback" data-tipo="bug">Feedback</button>
        </nav>
      </div>
    </header>`;
}

function rodape() {
  return `
    <footer class="rodape">
      <div class="wrap rodape-in">
        <span class="marca">Prancheta</span>
        <p>Jogo de fã, sem vínculo com clubes, CBF ou treinadores. Notas táticas são interpretações curadas, atualizadas na ${esc(ATUALIZADO_EM)}. Escudos são desenhos estilizados, não as marcas oficiais.</p>
        <p>Fotos dos treinadores: <a href="https://commons.wikimedia.org" target="_blank" rel="noopener">Wikimedia Commons</a>, sob licenças livres. Cada foto no resultado leva ao arquivo original, com autoria e licença.</p>
        <div class="rodape-fb">
          <button class="btn-sec" data-acao="feedback" data-tipo="bug">Relatar bug</button>
          <button class="btn-sec" data-acao="feedback" data-tipo="melhoria">Sugerir melhoria</button>
          <button class="btn-sec" data-acao="feedback" data-tipo="correcao">Corrigir informação</button>
        </div>
        <p><a href="privacidade">Política de privacidade</a></p>
      </div>
    </footer>`;
}

// Bloco de anúncio do AdSense. Só aparece quando a conta e o bloco estão configurados em config.js.
// Nunca fica dentro das perguntas, para não atrapalhar quem está jogando.
function anuncio(local) {
  const bloco = ADSENSE.blocos[local];
  if (!ADSENSE.cliente || !bloco) return '';
  return `
    <aside class="anuncio wrap" aria-label="Publicidade">
      <span class="anuncio-rotulo">Publicidade</span>
      <ins class="adsbygoogle" style="display:block" data-ad-client="${esc(ADSENSE.cliente)}" data-ad-slot="${esc(bloco)}"
        data-ad-format="auto" data-full-width-responsive="true"></ins>
    </aside>`;
}

function ativarAnuncios() {
  if (!ADSENSE.cliente) return;
  const vazios = app.querySelectorAll('ins.adsbygoogle:not([data-adsbygoogle-status])');
  if (!vazios.length) return;
  if (!document.querySelector('script[src*="adsbygoogle.js"]')) {
    const s = document.createElement('script');
    s.async = true;
    s.crossOrigin = 'anonymous';
    s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(ADSENSE.cliente)}`;
    document.head.appendChild(s);
  }
  vazios.forEach(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch { /* bloqueador de anúncios: segue sem anúncio */ }
  });
}

// ---------------------------------------------------------------- Quiz

function telaQuiz() {
  const q = estado.perguntas[estado.idx];
  const total = estado.perguntas.length;
  const minuto = Math.round((estado.idx / total) * 90);
  const resp = estado.respostas[estado.idx];
  const pct = (estado.idx / total) * 100;
  if (estado.rascunho === null && precisaConfirmar(q)) {
    if (resp) estado.rascunho = resp.valor;
    else if (q.tipo === 'slider') estado.rascunho = 0.5;
  }

  return `
    <div class="placar">
      <div class="wrap placar-in">
        <button class="placar-sair" data-acao="inicio" aria-label="Sair do jogo">✕</button>
        <span class="placar-modo">${MODOS[estado.modo].curto}${estado.tema === 'cultura' ? ' · Cultura pop' : ''}</span>
        <span class="placar-min tabnum" aria-label="Pergunta ${estado.idx + 1} de ${total}">${num(minuto)}'</span>
        <div class="placar-barra" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${estado.idx}"><i style="width:${pct}%"></i></div>
        <span class="placar-cont tabnum">${num(estado.idx + 1)}/${num(total)}</span>
      </div>
    </div>
    <main class="quiz wrap">
      <article class="pergunta" data-tipo="${q.tipo}">
        <p class="tag">${esc(q.tag)}</p>
        <h1 class="pergunta-txt">${esc(q.texto)}</h1>
        <div class="resposta">${respostaHTML(q, resp)}</div>
        <div class="quiz-nav">
          <button class="btn-sec" data-acao="voltar" ${estado.idx === 0 ? 'disabled' : ''}>← Voltar</button>
          ${precisaConfirmar(q) ? `<button class="btn-pri" data-acao="confirmar" ${estado.rascunho === null ? 'disabled' : ''}>Confirmar →</button>` : ''}
        </div>
        <button class="btn-link reportar" data-acao="feedback" data-tipo="correcao" data-sobre="Pergunta ${esc(q.id)}: ${esc(q.texto)}">Reportar problema nesta pergunta</button>
      </article>
    </main>`;
}

const precisaConfirmar = (q) => ['formacao', 'zona', 'slider'].includes(q.tipo);

function respostaHTML(q, resp) {
  const atual = resp ? resp.valor : null;
  switch (q.tipo) {
    case 'escala':
      return `<div class="escala">${ESCALA.map((o, i) => `
        <button class="op-escala${atual === o.v ? ' sel' : ''}" data-acao="responder" data-valor="${o.v}" data-nivel="${i}">
          <i aria-hidden="true"></i><span>${o.texto}</span>
        </button>`).join('')}</div>`;

    case 'escolha':
      return `<div class="opcoes">${q.opcoes.map((o, i) => `
        <button class="op${atual === i ? ' sel' : ''}" data-acao="responder" data-valor="${i}">
          <span class="op-letra">${'ABCD'[i]}</span><span>${esc(o.texto)}</span>
        </button>`).join('')}</div>`;

    case 'regiao': {
      const ops = q.opcoes
        ? q.opcoes.map((o) => [o.valor, esc(o.texto)])
        : [...Object.entries(REGIOES), ['qualquer', 'Tanto faz']];
      return `<div class="opcoes opcoes-grade">${ops.map(([id, nome]) => `
        <button class="op${atual === id ? ' sel' : ''}" data-acao="responder" data-valor="${id}"><span>${nome}</span></button>`).join('')}</div>`;
    }

    case 'formacao': {
      const sel = estado.rascunho ?? atual;
      const f = FORMACOES[sel ?? 2];
      return `
        <div class="acao-formacao">
          <div class="campo-box">${campo(jogadores(f), sel === null ? 'campo-apagado' : '')}
            <p class="campo-legenda">${sel === null ? 'Escolha um desenho' : `<b>${f.id}</b> ${esc(f.nota)}`}</p>
          </div>
          <div class="formacoes">${FORMACOES.map((x, i) => `
            <button class="chip-form${sel === i ? ' sel' : ''}" data-acao="rascunho" data-valor="${i}">${x.id}</button>`).join('')}</div>
        </div>`;
    }

    case 'zona': {
      const sel = estado.rascunho ?? atual;
      const zonas = ZONAS.map((z, i) => z.rects.map(([x, y, w, h]) =>
        `<rect x="${x}" y="${y}" width="${w}" height="${h}" class="zona${sel === i ? ' sel' : ''}" data-acao="rascunho" data-valor="${i}" tabindex="-1"/>`).join('')).join('');
      return `
        <div class="acao-zona">
          <div class="campo-box">${campo(zonas, 'campo-zonas')}
            <p class="campo-legenda">${sel === null ? 'Toque numa zona do campo' : `<b>${esc(ZONAS[sel].nome)}</b>`}</p>
          </div>
          <div class="formacoes">${ZONAS.map((z, i) => `
            <button class="chip-form${sel === i ? ' sel' : ''}" data-acao="rascunho" data-valor="${i}">${esc(z.nome)}</button>`).join('')}</div>
        </div>`;
    }

    case 'slider': {
      const v = estado.rascunho ?? atual ?? 0.5;
      const passos = q.passos;
      const step = passos ? 1 / (passos.length - 1) : 0.01;
      return `
        <div class="acao-slider">
          ${sliderVisual(q, v)}
          <input type="range" id="slider-${q.id}" class="slider" min="0" max="1" step="${step}" value="${v}"
            aria-label="${esc(q.texto)}" data-acao="slider">
          <div class="slider-rotulos"><span>${esc(q.rotulos[0])}</span><span>${esc(q.rotulos[1])}</span></div>
        </div>`;
    }
    default:
      return '';
  }
}

// Sliders no campo: a linha pode ser arrastada direto no gramado (ou pelo controle abaixo).
const sliderX = (visual, v) => (visual === 'linha' ? 18 + v * 36 : 92 - v * 62);
const sliderV = (visual, x) => Math.min(1, Math.max(0, visual === 'linha' ? (x - 18) / 36 : (92 - x) / 62));

function sliderDinamico(visual, v) {
  const x = sliderX(visual, v);
  const pegador = `<g class="pegador"><rect x="${x - 3.2}" y="28.5" width="6.4" height="11" rx="1.6"/>
    <path d="M${x - 1.2} 34 l-1.3 -1.6 v3.2 z M${x + 1.2} 34 l1.3 -1.6 v3.2 z"/></g>`;
  if (visual === 'linha') {
    return `<rect x="${x}" y="0" width="${105 - x}" height="68" class="zona-sombra"/>
      <line x1="${x}" y1="2" x2="${x}" y2="66" class="linha-def"/>
      ${[8, 22, 46, 60].map((y) => `<circle cx="${x}" cy="${y}" r="2.3" class="jogador"/>`).join('')}
      <circle cx="5" cy="34" r="2.3" class="jogador goleiro"/>${pegador}`;
  }
  return `<rect x="${x}" y="0" width="${105 - x}" height="68" class="zona-pressao"/>
    <line x1="${x}" y1="2" x2="${x}" y2="66" class="linha-def"/>${pegador}`;
}

function sliderLegenda(visual, v) {
  const x = sliderX(visual, v);
  return visual === 'linha'
    ? `<b>${Math.round(x)} m</b> do próprio gol`
    : `Pressão a partir de <b>${Math.round(105 - x)} m</b> do gol adversário`;
}

function sliderVisual(q, v) {
  if (q.visual === 'linha' || q.visual === 'pressao') {
    return `<div class="campo-box campo-arrastavel" data-visual="${q.visual}">
      ${campo(`<rect width="105" height="68" class="alvo-arraste"/><g class="dinamico">${sliderDinamico(q.visual, v)}</g>`)}
      <p class="campo-legenda tabnum"><span class="legenda-valor">${sliderLegenda(q.visual, v)}</span>
        <span class="dica-arraste">Arraste a linha no campo</span></p></div>`;
  }
  const n = q.passos[Math.round(v * (q.passos.length - 1))];
  return `<div class="numero-grande"><span class="tabnum">${esc(n)}</span><small>${esc(q.unidade || 'jogadores atrás da bola')}</small></div>`;
}

function atualizarSlider(v, moverControle = true) {
  const q = estado.perguntas[estado.idx];
  estado.rascunho = Math.round(v * 100) / 100;
  const box = app.querySelector('.acao-slider');
  if (!box) return;
  if (q.visual === 'numero') {
    box.querySelector('.numero-grande').outerHTML = sliderVisual(q, estado.rascunho);
  } else {
    box.querySelector('.dinamico').innerHTML = sliderDinamico(q.visual, estado.rascunho);
    box.querySelector('.legenda-valor').innerHTML = sliderLegenda(q.visual, estado.rascunho);
  }
  if (moverControle) box.querySelector('.slider').value = estado.rascunho;
  const ok = app.querySelector('[data-acao="confirmar"]');
  if (ok) ok.disabled = false;
}

// ---------------------------------------------------------------- Resultado

function telaResultado() {
  const { modo, user, ranking, compartilhado } = estado.resultado;
  const top = ranking[0];
  const p = top.perfil;
  const oposto = ranking[ranking.length - 1];
  const eixos = EIXOS[modo].filter((e) => user.cobertura[e.id]);
  const outro = modo === 'treinador' ? 'time' : 'treinador';

  const sub = modo === 'treinador'
    ? [p.pais, p.clube, p.formacao]
    : [p.tecnico ? `Técnico: ${p.tecnico}` : null, p.formacao, p.tipo === 'atual' ? REGIOES[p.regiao] : null];
  const tipo = modo === 'treinador' ? TIPO_TREINADOR[p.tipo] : TIPO_TIME[p.tipo];

  const barras = eixos.map((e) => {
    const u = user.vet[e.id];
    const m = p.eixos[e.id];
    return `
      <li class="barra">
        <div class="barra-cab"><span class="barra-nome">${e.nome}</span><span class="barra-val tabnum">${u}</span></div>
        <div class="barra-trilho">
          <i class="barra-meio" aria-hidden="true"></i>
          <i class="barra-seg" style="left:${Math.min(u, m)}%;width:${Math.abs(u - m)}%"></i>
          <i class="marca-perfil" style="left:${m}%" title="${esc(p.nome)}: ${m}"></i>
          <i class="marca-voce" style="left:${u}%" title="Você: ${u}"></i>
        </div>
        <div class="barra-polos"><span>${e.esq}</span><span>${e.dir}</span></div>
      </li>`;
  }).join('');

  const lista = ranking.slice(1, 6).map((r, i) => `
    <li class="rank-item">
      <span class="rank-pos tabnum">${i + 2}</span>
      ${escudo(r.perfil, modo)}
      <span class="rank-nome"><b>${esc(r.perfil.nome)}</b><small>${esc(modo === 'treinador' ? r.perfil.clube : (r.perfil.tecnico || ''))}</small></span>
      <span class="rank-pct tabnum">${r.match}%</span>
      <i class="rank-barra" style="--w:${r.match}%" aria-hidden="true"></i>
    </li>`).join('');

  return `
    ${topo()}
    <main class="resultado">
      <section class="res-hero wrap">
        <div class="res-txt">
          <p class="eyebrow">${compartilhado ? 'Resultado compartilhado · ' : ''}${modo === 'treinador' ? 'Seu treinador' : 'Seu time'}${estado.resultado.tema === 'cultura' ? ' · traduzido da cultura pop' : ''}</p>
          <div class="res-nome-linha">
            <figure class="res-retrato">${escudo(p, modo, true)}${creditoFoto(p)}</figure>
            <h1>${esc(p.nome)}</h1>
          </div>
          <p class="res-meta">${sub.filter(Boolean).map(esc).join(' · ')} <span class="pill">${tipo}</span></p>
          <p class="res-titulos">${esc(p.titulos)}${p.destaque ? ` · ${esc(p.destaque)}` : ''}</p>
          <p class="res-estilo">${esc(p.estilo)}</p>
          ${estrelasHTML(p)}
          <div class="botoes res-acoes">
            <button class="btn-pri" data-acao="baixar-card">Baixar card</button>
            <button class="btn-sec" data-acao="compartilhar">Compartilhar</button>
          </div>
          <p class="aviso" role="status"></p>
        </div>
        <div class="res-placar" aria-label="${top.match}% de compatibilidade">
          <span class="res-pct tabnum">${top.match}<small>%</small></span>
          <span class="res-pct-rot">compatível</span>
        </div>
      </section>

      <section class="bloco wrap">
        <div class="res-colunas">
          <div class="res-eixos">
            <div class="bloco-cab bloco-cab-linha">
              <h2>Seu estilo, eixo por eixo</h2>
              <p class="legenda"><span class="leg-voce">Você</span><span class="leg-perfil">${esc(p.nome)}</span></p>
            </div>
            <ul class="barras">${barras}</ul>
          </div>
          <div class="res-rank">
            <h2>Também combinam com você</h2>
            <ol class="rank">${lista}</ol>
            <div class="oposto">
              <p class="eyebrow">Seu oposto</p>
              <div class="oposto-in">
                ${escudo(oposto.perfil, modo)}
                <span class="rank-nome"><b>${esc(oposto.perfil.nome)}</b><small>${esc(oposto.perfil.estilo)}</small></span>
                <span class="rank-pct tabnum">${oposto.match}%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="bloco wrap compartilhar">
        <div class="card-preview">
          ${estado.cardUrl ? `<img src="${estado.cardUrl}" alt="Card do resultado: ${esc(p.nome)}, ${top.match}% compatível">` : '<div class="card-carregando">Gerando o card…</div>'}
        </div>
        <div class="compartilhar-txt">
          <p class="eyebrow">Compartilhe</p>
          <h2>Seu card de resultado</h2>
          <p>Formato Stories (1080 × 1920). No celular, você também pode tocar e segurar a imagem para salvar.</p>
          <div class="botoes">
            <button class="btn-pri" data-acao="baixar-card">Baixar card</button>
            <button class="btn-sec" data-acao="compartilhar">Compartilhar</button>
            <button class="btn-sec" data-acao="copiar-link">Copiar link</button>
          </div>
          <p class="aviso" role="status"></p>
          <div class="botoes botoes-fim">
            <button class="btn-sec" data-acao="iniciar" data-modo="${outro}" data-versao="curta" data-tema="${estado.tema}">Jogar o modo ${MODOS[outro].curto.toLowerCase()} →</button>
            <button class="btn-link" data-acao="iniciar" data-modo="${modo}" data-versao="completa" data-tema="${estado.tema}">Refazer na versão completa</button>
            <button class="btn-link" data-acao="iniciar" data-modo="${modo}" data-versao="curta" data-tema="${estado.tema === 'cultura' ? 'futebol' : 'cultura'}">Refazer respondendo com ${estado.tema === 'cultura' ? 'futebol' : 'cultura pop'}</button>
          </div>
        </div>
      </section>

      ${anuncio('resultado')}

      <section class="wrap res-correcao">
        <button class="btn-link reportar" data-acao="feedback" data-tipo="correcao" data-sobre="${esc(p.nome)} (${esc(p.id)})">Algo errado sobre ${esc(p.nome)}? Corrigir informação</button>
      </section>
    </main>
    ${rodape()}`;
}

// Avaliação do resultado: o quanto a pessoa concorda com o nome que saiu (1 a 5 estrelas).
const ROTULOS_NOTA = ['', 'Nada a ver comigo', 'Pouco parecido', 'Mais ou menos', 'Bem parecido', 'Sou eu!'];

function chaveNota(p) {
  return `prancheta-nota-${estado.resultado.modo}-${p.id}`;
}

function lerNota(p) {
  try {
    return Number(localStorage.getItem(chaveNota(p))) || 0;
  } catch {
    return 0;
  }
}

function estrelasHTML(p) {
  const nota = lerNota(p);
  return `
    <div class="avaliacao" role="radiogroup" aria-label="O quanto você concorda com ${esc(p.nome)}?">
      <p class="avaliacao-cab">Você concorda com o resultado?</p>
      <div class="estrelas">
        ${[1, 2, 3, 4, 5].map((n) => `
          <button class="estrela${n <= nota ? ' on' : ''}" role="radio" aria-checked="${n === nota}" aria-label="${n} de 5: ${ROTULOS_NOTA[n]}"
            data-acao="avaliar" data-nota="${n}">★</button>`).join('')}
        <span class="avaliacao-rotulo" id="avaliacao-rotulo">${nota ? `${ROTULOS_NOTA[nota]} · obrigado!` : ''}</span>
      </div>
    </div>`;
}

function avaliarResultado(nota) {
  const { ranking, modo, tema } = estado.resultado;
  const p = ranking[0].perfil;
  try {
    localStorage.setItem(chaveNota(p), String(nota));
  } catch { /* sem armazenamento: só não lembra a nota */ }
  app.querySelectorAll('.estrela').forEach((b) => {
    const n = Number(b.dataset.nota);
    b.classList.toggle('on', n <= nota);
    b.setAttribute('aria-checked', String(n === nota));
  });
  app.querySelector('#avaliacao-rotulo').textContent = `${ROTULOS_NOTA[nota]} · obrigado!`;
  enviarAvaliacao({ nota, perfil: p.nome, id: p.id, match: ranking[0].match, modo, tema });
}

const iniciais = (nome) => nome.split(' ').filter((s) => s.length > 2 || s === nome).slice(0, 2).map((s) => s[0]).join('');

// Escudo (modo time) ou foto do treinador (modo treinador), com iniciais quando não há foto.
function escudo(p, modo, grande = false) {
  if (modo === 'time') return escudoSVG(p.escudo, `escudo${grande ? ' escudo-g' : ''}`);
  const classe = `avatar${grande ? ' avatar-g' : ''}`;
  const ini = esc(iniciais(p.nome));
  if (p.foto) {
    return `<img class="${classe}" src="${esc(p.foto.src)}" alt="" loading="lazy" decoding="async" data-ini="${ini}">`;
  }
  return `<span class="${classe} iniciais" aria-hidden="true">${ini}</span>`;
}

function creditoFoto(p) {
  if (!p.foto) return '';
  const [base, nome] = p.foto.wiki === 'pt'
    ? ['https://pt.wikipedia.org/wiki/Ficheiro:', 'Wikipédia']
    : ['https://commons.wikimedia.org/wiki/File:', 'Wikimedia Commons'];
  return `<a class="credito" href="${base}${encodeURIComponent(p.foto.arquivo)}" target="_blank" rel="noopener">Foto: ${nome}</a>`;
}

// ---------------------------------------------------------------- Modo torcida

function placarTorcida(n, limite, certeza) {
  const minuto = Math.min(90, Math.round((n / limite) * 90));
  return `
    <div class="placar">
      <div class="wrap placar-in">
        <button class="placar-sair" data-acao="inicio" aria-label="Sair do jogo">✕</button>
        <span class="placar-modo">Adivinhação</span>
        <span class="placar-min tabnum" aria-label="Pergunta ${n + 1}">${num(minuto)}'</span>
        <div class="placar-barra placar-certeza" role="meter" aria-label="Certeza do palpite" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(certeza * 100)}"><i style="width:${Math.round(certeza * 100)}%"></i></div>
        <span class="placar-cont tabnum">${num(n + 1)}</span>
      </div>
    </div>`;
}

function fraseCerteza(p) {
  if (p >= 0.7) return 'Já tenho um palpite forte.';
  if (p >= 0.4) return 'Estou chegando perto…';
  if (p >= 0.15) return 'Começando a desconfiar.';
  return 'Ainda sem pistas suficientes.';
}

function telaTorcida() {
  const t = estado.torcida;
  const q = t.atual;
  const dist = posterior(t.historico, t.eliminados);
  const resposta = q.tipo === 'sn'
    ? `<div class="escala escala-sn">${RESPOSTAS_SN.map((r, i) => `
        <button class="op-escala" data-acao="torcida-responder" data-valor="${r.id}" data-nivel="${i}">
          <i aria-hidden="true"></i><span>${r.texto}</span>
        </button>`).join('')}</div>`
    : `<div class="opcoes">${q.opcoes.map(([id, texto], i) => `
        <button class="op" data-acao="torcida-responder" data-valor="${esc(id)}">
          <span class="op-letra">${'ABCDEFGH'[i]}</span><span>${esc(texto)}</span>
        </button>`).join('')}
        <button class="op op-neutra" data-acao="torcida-responder" data-valor="nao-sei"><span class="op-letra">?</span><span>Não sei</span></button>
      </div>`;
  return `
    ${placarTorcida(t.historico.length, t.limite, dist[0].p)}
    <main class="quiz wrap">
      <article class="pergunta" data-tipo="torcida-${q.tipo}">
        <p class="tag">${esc(q.tag)}</p>
        <h1 class="pergunta-txt">${esc(q.texto)}</h1>
        <div class="resposta">${resposta}</div>
        <p class="certeza-txt">${fraseCerteza(dist[0].p)}</p>
        <div class="quiz-nav">
          <button class="btn-sec" data-acao="torcida-voltar" ${t.historico.length === 0 ? 'disabled' : ''}>← Voltar</button>
          ${t.historico.length >= 5 ? '<button class="btn-sec" data-acao="torcida-chutar">Chutar agora</button>' : ''}
        </div>
        <button class="btn-link reportar" data-acao="feedback" data-tipo="correcao" data-sobre="Modo torcida, pergunta: ${esc(q.texto)}">Reportar problema nesta pergunta</button>
      </article>
    </main>`;
}

function telaPalpite() {
  const t = estado.torcida;
  const c = t.palpite;
  return `
    ${placarTorcida(Math.max(0, t.historico.length - 1), t.limite, 1)}
    <main class="quiz wrap palpite">
      <p class="eyebrow">Palpite ${t.palpites} de ${MAX_PALPITES}</p>
      <div class="palpite-cartao">
        ${escudoSVG(escudoDoClube(c), 'escudo escudo-g')}
        <div class="palpite-txt">
          <p class="palpite-pergunta">Você está pensando em…</p>
          <h1>${esc(c.nome)}?</h1>
          <p class="res-meta">${esc(c.cidade)} · ${esc(c.uf)}${c.apelido ? ` · ${esc(c.apelido)}` : ''}</p>
        </div>
      </div>
      <div class="botoes">
        <button class="btn-pri" data-acao="palpite-sim">Acertou!</button>
        <button class="btn-sec" data-acao="palpite-nao">Não é esse</button>
      </div>
    </main>`;
}

function telaEscolher() {
  const t = estado.torcida;
  const dist = posterior(t.historico, new Set());
  const sugestoes = dist.filter((d) => !t.eliminados.has(d.clube.id)).slice(0, 8);
  return `
    ${topo()}
    <main class="quiz wrap escolher">
      <p class="eyebrow">Dessa vez você venceu</p>
      <h1 class="pergunta-txt">Não consegui adivinhar. Em qual time você estava pensando?</h1>
      <p class="lead">Sua resposta ajuda a Prancheta a acertar da próxima vez.</p>
      <div class="escolher-grade">
        ${sugestoes.map(({ clube }) => `
          <button class="escolher-item" data-acao="torcida-escolher" data-id="${clube.id}">
            ${escudoSVG(escudoDoClube(clube))}<span>${esc(clube.nome)}</span>
          </button>`).join('')}
      </div>
      <label class="fb-campo escolher-busca" for="escolher-busca">Ou digite o nome do time
        <input id="escolher-busca" type="search" autocomplete="off" autocapitalize="words" maxlength="60" placeholder="Nome, apelido ou cidade" data-acao="escolher-busca">
      </label>
      <ul class="busca-lista" id="busca-lista" aria-label="Times encontrados"></ul>
      <div class="botoes">
        <button class="btn-pri" data-acao="torcida-escolher-texto">Confirmar</button>
      </div>
      <p class="aviso" role="status"></p>
    </main>
    ${rodape()}`;
}

// Busca sem acento e sem diferenciar maiúsculas, por nome, apelido ou cidade.
const normalizar = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

function buscarClubes(texto) {
  const q = normalizar(texto);
  if (q.length < 2) return [];
  const pontos = (c) => {
    const nome = normalizar(c.nome);
    if (nome === q) return 0;
    if (nome.startsWith(q)) return 1;
    if (nome.split(' ').some((p) => p.startsWith(q))) return 2;
    if (normalizar(c.apelido).includes(q)) return 3;
    if (normalizar(c.cidade).startsWith(q)) return 4;
    return nome.includes(q) ? 5 : 9;
  };
  return CLUBES_TORCIDA.map((c) => [pontos(c), c]).filter(([p]) => p < 9)
    .sort((a, b) => a[0] - b[0] || b[1].massa - a[1].massa).slice(0, 8).map(([, c]) => c);
}

function listaBusca(texto) {
  const achados = buscarClubes(texto);
  const box = app.querySelector('#busca-lista');
  if (!box) return;
  box.innerHTML = achados.map((c) => `
    <li><button class="escolher-item" data-acao="torcida-escolher" data-id="${c.id}">
      ${escudoSVG(escudoDoClube(c))}<span>${esc(c.nome)}<small>${esc(c.cidade)} · ${esc(c.uf)}</small></span>
    </button></li>`).join('')
    + (achados.length ? `<li><button class="btn-link" data-acao="torcida-fora-lista">Não é nenhum desses: enviar "${esc(texto.trim())}"</button></li>` : '')
    || (normalizar(texto).length >= 2 ? `<li class="busca-vazia">Não achamos "${esc(texto)}" na base. Toque em Confirmar para nos contar mesmo assim.</li>` : '');
}

function telaForaDaLista() {
  return `
    ${topo()}
    <main class="quiz wrap escolher">
      <p class="eyebrow">Valeu pela ajuda</p>
      <h1 class="pergunta-txt">${esc(estado.torcida.foraDaLista)} ainda não está na base da Prancheta.</h1>
      <p class="lead">Anotamos o nome para incluir o clube nas próximas atualizações. Quer tentar de novo com outro time?</p>
      <div class="botoes">
        <button class="btn-pri" data-acao="torcida-iniciar">Jogar de novo</button>
        <button class="btn-sec" data-acao="dificil-iniciar">Tentar o modo difícil</button>
        <button class="btn-link" data-acao="inicio">Voltar ao início</button>
      </div>
    </main>
    ${rodape()}`;
}

function itemClube(r, extra = '') {
  return `
    <li class="rank-item">
      ${escudoSVG(escudoDoClube(r.clube))}
      <span class="rank-nome"><b>${esc(r.clube.nome)}</b><small>${esc(r.clube.cidade)} · ${esc(r.clube.uf)}${extra}</small></span>
      <span class="rank-pct tabnum">${r.match}%</span>
      <i class="rank-barra" style="--w:${r.match}%" aria-hidden="true"></i>
    </li>`;
}

function telaResultadoTorcida() {
  const { clube: c, acertou, perguntas, compartilhado, variante, match, similares, oposto } = estado.resultado;
  const dificil = variante === 'dificil';
  const fatos = [
    ['Cidade', `${c.cidade} (${c.uf})`],
    ['Divisão em 2026', nomeSerie(c)],
    ['Apelido', c.apelido],
    ['Mascote', c.mascote],
    ['Estádio', c.estadio],
    ['Maior rival', c.rival],
    ['Ídolo', c.idolo],
    ['Fundação', c.fundacao],
    ['Grandes títulos', titulosDoClube(c).join(', ')],
  ].filter(([, v]) => v);
  const frase = compartilhado
    ? `Resultado compartilhado${dificil ? ' · modo difícil' : ''}`
    : dificil
      ? `Modo difícil: ${TOTAL_DIFICIL} perguntas, sem chute no meio do caminho.`
      : acertou
        ? `A Prancheta acertou em ${perguntas} pergunta${perguntas === 1 ? '' : 's'}`
        : 'Dessa vez a Prancheta errou. Obrigado por ensinar!';
  const placar = dificil
    ? `<div class="res-placar" aria-label="${match}% compatível"><span class="res-pct tabnum">${match}<small>%</small></span><span class="res-pct-rot">compatível</span></div>`
    : !compartilhado && acertou
      ? `<div class="res-placar" aria-label="Acertou em ${perguntas} perguntas"><span class="res-pct tabnum">${perguntas}</span><span class="res-pct-rot">pergunta${perguntas === 1 ? '' : 's'}</span></div>`
      : '';
  const comparacao = dificil && (similares?.length || oposto) ? `
      <section class="bloco wrap">
        <div class="res-colunas">
          ${similares?.length ? `<div class="res-rank">
            <h2>Também combinam com você</h2>
            <ol class="rank rank-torcida">${similares.map((r) => itemClube(r)).join('')}</ol>
          </div>` : ''}
          ${oposto ? `<div class="res-rank">
            <div class="oposto">
              <p class="eyebrow">${oposto.rival ? 'Seu oposto: o rival direto' : 'Seu oposto'}</p>
              <div class="oposto-in">
                ${escudoSVG(escudoDoClube(oposto.clube))}
                <span class="rank-nome"><b>${esc(oposto.clube.nome)}</b><small>${oposto.rival ? `O maior rival do ${esc(c.nome)}` : 'O clube mais diferente das suas respostas'}</small></span>
                ${oposto.match !== undefined ? `<span class="rank-pct tabnum">${oposto.match}%</span>` : ''}
              </div>
            </div>
          </div>` : ''}
        </div>
      </section>` : '';
  return `
    ${topo()}
    <main class="resultado">
      <section class="res-hero wrap">
        <div class="res-txt">
          <p class="eyebrow">${dificil ? 'Pelas suas respostas, você está pensando em' : 'Você estava pensando em'}</p>
          <div class="res-nome-linha">
            <figure class="res-retrato">${escudoSVG(escudoDoClube(c), 'escudo escudo-g')}</figure>
            <h1>${esc(c.nome)}</h1>
          </div>
          <p class="res-meta">${esc(c.cidade)} · ${esc(c.uf)} <span class="pill">${c.serie === 'E' ? 'Fora das séries nacionais' : `Série ${c.serie}`} em 2026</span></p>
          <p class="res-estilo">${esc(frase)}</p>
          <div class="botoes res-acoes">
            <button class="btn-pri" data-acao="baixar-card">Baixar card</button>
            <button class="btn-sec" data-acao="compartilhar">Compartilhar</button>
          </div>
          <p class="aviso" role="status"></p>
        </div>
        ${placar}
      </section>
${comparacao}
      <section class="bloco wrap">
        <div class="bloco-cab"><h2>Ficha do clube</h2></div>
        <dl class="ficha">
          ${fatos.map(([k, v]) => `<div class="ficha-item"><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}
        </dl>
      </section>

      <section class="bloco wrap compartilhar">
        <div class="card-preview">
          ${estado.cardUrl ? `<img src="${estado.cardUrl}" alt="Card: o time que eu pensei foi ${esc(c.nome)}">` : '<div class="card-carregando">Gerando o card…</div>'}
        </div>
        <div class="compartilhar-txt">
          <p class="eyebrow">Compartilhe</p>
          <h2>Seu card de adivinhação</h2>
          <p>Formato Stories (1080 × 1920). No celular, você também pode tocar e segurar a imagem para salvar.</p>
          <div class="botoes">
            <button class="btn-pri" data-acao="baixar-card">Baixar card</button>
            <button class="btn-sec" data-acao="compartilhar">Compartilhar</button>
            <button class="btn-sec" data-acao="copiar-link">Copiar link</button>
          </div>
          <p class="aviso" role="status"></p>
          <div class="botoes botoes-fim">
            <button class="btn-sec" data-acao="${dificil ? 'dificil-iniciar' : 'torcida-iniciar'}">Jogar de novo</button>
            <button class="btn-sec" data-acao="${dificil ? 'torcida-iniciar' : 'dificil-iniciar'}">Tentar o modo ${dificil ? 'fácil' : 'difícil'}</button>
            <button class="btn-link" data-acao="iniciar" data-modo="time" data-versao="curta" data-tema="futebol">Descobrir qual time tem a sua cara</button>
          </div>
        </div>
      </section>

      ${anuncio('resultado')}

      <section class="wrap res-correcao">
        ${dificil && !compartilhado ? `<button class="btn-link reportar" data-acao="feedback" data-tipo="correcao" data-sobre="Modo difícil errou: deu ${esc(c.nome)}">Não pensou em ${esc(c.nome)}? Conte em qual time você pensou</button>` : ''}
        <button class="btn-link reportar" data-acao="feedback" data-tipo="correcao" data-sobre="Modo torcida: ${esc(c.nome)} (${esc(c.id)})">Algo errado sobre ${esc(c.nome)}? Corrigir informação</button>
      </section>
    </main>
    ${rodape()}`;
}

function iniciarTorcida() {
  estado.modo = 'torcida';
  estado.torcida = { historico: [], atual: null, eliminados: new Set(), palpites: 0, limite: MAX_PERGUNTAS, palpite: null };
  limparUrl();
  avancarTorcida(true);
}

function avancarTorcida(rolar = false) {
  const t = estado.torcida;
  const proxima = horaDeChutar(t.historico, t.eliminados, t.limite) ? null : proximaPergunta(t.historico, t.eliminados);
  if (!proxima) return chutar();
  t.atual = proxima;
  render('torcida', rolar);
}

function chutar() {
  const t = estado.torcida;
  if (t.palpites >= MAX_PALPITES) return render('escolher');
  t.palpites += 1;
  t.palpite = posterior(t.historico, t.eliminados)[0].clube;
  render('palpite');
}

// Converte o valor do botão na resposta da pergunta; undefined quando o valor não é dela.
function respostaDe(q, valor) {
  if (valor === 'nao-sei') return null;
  if (q.tipo === 'sn') return RESPOSTAS_SN.find((r) => r.id === valor)?.v;
  if (q.opcoes) return q.opcoes.some(([id]) => id === valor) ? valor : undefined;
  return valor;
}

function responderTorcida(q, valor) {
  const t = estado.torcida;
  const resposta = respostaDe(q, valor);
  if (q !== t.atual || resposta === undefined) return render('torcida', false);
  t.historico.push({ pergunta: q, resposta, valor });
  try {
    avancarTorcida();
  } catch (e) {
    // Sem próxima pergunta possível: arrisca o palpite em vez de travar na tela.
    console.error(e);
    chutar();
  }
}

function resultadoTorcida(clube, acertou, compartilhado = false, perguntas = estado.torcida?.historico.length || 0) {
  estado.modo = 'torcida';
  estado.resultado = { modo: 'torcida', clube, acertou, perguntas, compartilhado };
  estado.cardUrl = null;
  render('resultadoTorcida');
  try {
    if (!compartilhado) history.replaceState(null, '', `?f=${clube.id}.${perguntas}.${acertou ? 1 : 0}`);
  } catch { /* ignora */ }
  gerarCardTorcida(estado.resultado).then((url) => {
    estado.cardUrl = url;
    const box = app.querySelector('.card-preview');
    if (box) box.innerHTML = `<img src="${url}" alt="Card: eu torço para ${esc(clube.nome)}">`;
  }).catch(() => {
    const box = app.querySelector('.card-preview');
    if (box) box.innerHTML = '<div class="card-carregando">Não foi possível gerar o card neste navegador.</div>';
  });
}

// ---------------------------------------------------------------- Modo torcida difícil

const COR_HEX = { vermelho: '#d6202a', preto: '#111111', branco: '#ffffff', verde: '#00843d', azul: '#1f4fa3', amarelo: '#f7d117', grena: '#7a0026' };
const COR_NOME = { vermelho: 'Vermelho', preto: 'Preto', branco: 'Branco', verde: 'Verde', azul: 'Azul', amarelo: 'Amarelo', grena: 'Grená' };

// Mapa estilizado do Brasil por região (viewBox 100 × 100).
const REGIOES_MAPA = [
  ['N', 'Norte', '8,22 30,8 54,10 62,24 58,42 40,48 22,46 8,36', 32, 28],
  ['NE', 'Nordeste', '62,24 74,18 92,30 96,42 86,54 72,60 64,52 58,42', 78, 38],
  ['CO', 'Centro-Oeste', '22,46 40,48 58,42 64,52 62,66 50,72 36,64 26,56', 44, 57],
  ['SE', 'Sudeste', '62,66 64,52 72,60 86,54 82,68 72,78 60,80 50,72', 69, 68],
  ['S', 'Sul', '50,72 60,80 56,92 48,98 42,90 44,78', 51, 86],
];

function mapaSVG(sel) {
  return `<svg class="mapa" viewBox="0 0 100 100" role="img" aria-label="Mapa do Brasil por região">
    ${REGIOES_MAPA.map(([id, nome, pts, x, y]) => `
      <g class="regiao${sel === id ? ' sel' : ''}" data-acao="dificil-rascunho" data-valor="${id}">
        <polygon points="${pts}"/>
        <text x="${x}" y="${y}">${nome}</text>
      </g>`).join('')}
  </svg>`;
}

function camisaSVG(cores) {
  const lista = cores.length ? cores.map((c) => COR_HEX[c]) : ['#2a3b33'];
  const w = 100 / lista.length;
  return `<svg class="camisa" viewBox="0 0 100 100" aria-hidden="true">
    <defs><clipPath id="camisa-clip"><path d="M30 12 L42 8 Q50 15 58 8 L70 12 L90 26 L81 41 L72 35 L72 93 L28 93 L28 35 L19 41 L10 26 Z"/></clipPath></defs>
    <g clip-path="url(#camisa-clip)">${lista.map((c, i) => `<rect x="${i * w}" y="0" width="${w + 0.5}" height="100" fill="${c}"/>`).join('')}</g>
    <path d="M30 12 L42 8 Q50 15 58 8 L70 12 L90 26 L81 41 L72 35 L72 93 L28 93 L28 35 L19 41 L10 26 Z" fill="none" stroke="rgba(238,242,234,0.6)" stroke-width="1.2"/>
  </svg>`;
}

function rotuloTamanho(v) {
  if (v < 0.2) return 'Pequena';
  if (v < 0.45) return 'Média';
  if (v < 0.7) return 'Grande';
  if (v < 0.9) return 'Muito grande';
  return 'Gigante';
}

function sliderDificilVisual(q, v) {
  return `<div class="numero-grande"><span class="tabnum">${rotuloTamanho(v)}</span><small>torcida</small></div>`;
}

function telaDificil() {
  const d = estado.dificil;
  const q = d.perguntas[d.idx];
  const resp = d.historico[d.idx];
  if (d.rascunho === null) {
    if (q.ui === 'cores') d.rascunho = resp ? [...resp.resposta] : [];
    else if (q.tipo === 'slider') d.rascunho = resp ? resp.resposta : 0.5;
    else if (q.ui === 'mapa' && resp) d.rascunho = resp.resposta;
  }
  const acao = ['mapa', 'cores'].includes(q.ui) || q.tipo === 'slider';
  let corpo = '';
  if (q.tipo === 'sn') {
    corpo = `<div class="escala escala-sn">${RESPOSTAS_SN.map((r, i) => `
      <button class="op-escala" data-acao="dificil-responder" data-valor="${r.id}" data-nivel="${i}"><i aria-hidden="true"></i><span>${r.texto}</span></button>`).join('')}</div>`;
  } else if (q.ui === 'mapa') {
    corpo = `<div class="acao-mapa">${mapaSVG(d.rascunho)}
      <div class="formacoes">${q.opcoes.map(([id, nome]) => `<button class="chip-form${d.rascunho === id ? ' sel' : ''}" data-acao="dificil-rascunho" data-valor="${id}">${nome}</button>`).join('')}</div>
      <button class="btn-link nao-sei" data-acao="dificil-responder" data-valor="nao-sei">Não sei, pular esta</button></div>`;
  } else if (q.ui === 'cores') {
    corpo = `<div class="acao-camisa">${camisaSVG(d.rascunho)}
      <div class="cores-grade">${Object.keys(COR_HEX).map((c) => `
        <button class="chip-cor${d.rascunho.includes(c) ? ' sel' : ''}" data-acao="dificil-cor" data-valor="${c}" style="--cor:${COR_HEX[c]}" aria-pressed="${d.rascunho.includes(c)}">
          <i aria-hidden="true"></i>${COR_NOME[c]}</button>`).join('')}</div>
      <p class="campo-legenda">${d.rascunho.length ? `${d.rascunho.length} de 3 cores` : 'Toque nas cores para pintar a camisa'}</p>
      <button class="btn-link nao-sei" data-acao="dificil-responder" data-valor="nao-sei">Não sei, pular esta</button></div>`;
  } else if (q.tipo === 'slider') {
    corpo = `<div class="acao-slider">${sliderDificilVisual(q, d.rascunho)}
      <input type="range" id="dificil-${q.id}" class="slider" min="0" max="1" step="0.01" value="${d.rascunho}" aria-label="${esc(q.texto)}" data-acao="dificil-slider">
      <div class="slider-rotulos"><span>${esc(q.rotulos[0])}</span><span>${esc(q.rotulos[1])}</span></div>
      <button class="btn-link nao-sei" data-acao="dificil-responder" data-valor="nao-sei">Não sei, pular esta</button></div>`;
  } else {
    corpo = `<div class="opcoes">${q.opcoes.map(([id, texto], i) => `
      <button class="op" data-acao="dificil-responder" data-valor="${esc(id)}"><span class="op-letra">${'ABCDEFGH'[i]}</span><span>${esc(texto)}</span></button>`).join('')}
      <button class="op op-neutra" data-acao="dificil-responder" data-valor="nao-sei"><span class="op-letra">?</span><span>Não sei</span></button></div>`;
  }
  const pronto = q.ui === 'cores' ? d.rascunho.length > 0 : d.rascunho !== null;
  return `
    <div class="placar">
      <div class="wrap placar-in">
        <button class="placar-sair" data-acao="inicio" aria-label="Sair do jogo">✕</button>
        <span class="placar-modo">Adivinhação · Difícil</span>
        <span class="placar-min tabnum">${num(Math.round((d.idx / TOTAL_DIFICIL) * 90))}'</span>
        <div class="placar-barra" role="progressbar" aria-valuemin="0" aria-valuemax="${TOTAL_DIFICIL}" aria-valuenow="${d.idx}"><i style="width:${(d.idx / TOTAL_DIFICIL) * 100}%"></i></div>
        <span class="placar-cont tabnum">${num(d.idx + 1)}/${TOTAL_DIFICIL}</span>
      </div>
    </div>
    <main class="quiz wrap">
      <article class="pergunta" data-tipo="dificil-${q.ui || q.tipo}">
        <p class="tag">${esc(q.tag)}</p>
        <h1 class="pergunta-txt">${esc(q.texto)}</h1>
        <div class="resposta">${corpo}</div>
        <div class="quiz-nav">
          <button class="btn-sec" data-acao="dificil-voltar" ${d.idx === 0 ? 'disabled' : ''}>← Voltar</button>
          ${acao ? `<button class="btn-pri" data-acao="dificil-confirmar" ${pronto ? '' : 'disabled'}>Confirmar →</button>` : ''}
        </div>
        <button class="btn-link reportar" data-acao="feedback" data-tipo="correcao" data-sobre="Modo torcida difícil, pergunta: ${esc(q.texto)}">Reportar problema nesta pergunta</button>
      </article>
    </main>`;
}

function iniciarDificil() {
  estado.modo = 'torcida';
  estado.dificil = { perguntas: montarDificil(), idx: 0, historico: [], rascunho: null };
  limparUrl();
  render('dificil');
}

function registrarDificil(resposta, valor) {
  const d = estado.dificil;
  d.historico[d.idx] = { pergunta: d.perguntas[d.idx], resposta, valor };
  d.historico.length = d.idx + 1;
  d.rascunho = null;
  d.idx += 1;
  if (d.idx === d.perguntas.length && d.perguntas.length < TOTAL_DIFICIL) {
    d.perguntas.push(...perguntasFinaisDificil(d.historico));
  }
  if (d.idx >= d.perguntas.length) return finalizarDificil();
  render('dificil', false);
}

function finalizarDificil() {
  const ranking = ranquearTorcida(estado.dificil.historico);
  const top = ranking[0];
  const similares = ranking.slice(1, 12).sort((a, b) => b.match - a.match).slice(0, 5);
  const oposto = opostoDe(top.clube, ranking);
  mostrarResultadoDificil(top.clube, top.match, similares, oposto, false);
}

function mostrarResultadoDificil(clube, match, similares, oposto, compartilhado) {
  estado.modo = 'torcida';
  estado.resultado = { modo: 'torcida', variante: 'dificil', clube, match, similares, oposto, compartilhado, perguntas: TOTAL_DIFICIL, acertou: null };
  estado.cardUrl = null;
  render('resultadoTorcida');
  try {
    if (!compartilhado) history.replaceState(null, '', `?d=${clube.id}.${match}`);
  } catch { /* ignora */ }
  gerarCardTorcida(estado.resultado).then((url) => {
    estado.cardUrl = url;
    const box = app.querySelector('.card-preview');
    if (box) box.innerHTML = `<img src="${url}" alt="Card: o time que eu pensei foi ${esc(clube.nome)}">`;
  }).catch(() => {
    const box = app.querySelector('.card-preview');
    if (box) box.innerHTML = '<div class="card-carregando">Não foi possível gerar o card neste navegador.</div>';
  });
}

// Quando a Prancheta erra, o relato vai para o feedback para corrigir a base.
function registrarErroTorcida(real, digitado = '') {
  const t = estado.torcida;
  const nome = real ? real.nome : `fora da lista: ${digitado || 'não informado'}`;
  enviarAvaliacao({
    tipo: 'torcida-erro',
    _subject: `Prancheta · Torcida: errou (era ${nome})`,
    nota: 0,
    perfil: nome,
    id: real ? real.id : 'outro',
    palpites: [...t.eliminados].join(', '),
    respostas: t.historico.map((h) => `${h.pergunta.id}=${h.valor}`).join('; '),
  });
}

// ---------------------------------------------------------------- Fluxo

const TELAS = {
  inicio: () => telaInicio(),
  quiz: () => telaQuiz(),
  resultado: () => telaResultado(),
  torcida: () => telaTorcida(),
  palpite: () => telaPalpite(),
  escolher: () => telaEscolher(),
  foraDaLista: () => telaForaDaLista(),
  dificil: () => telaDificil(),
  jogo: () => telaJogo(),
  resultadoTorcida: () => telaResultadoTorcida(),
};

// Cada tela aceita uma resposta só: o primeiro toque trava as outras opções até a próxima tela, e
// um toque que chega logo depois de a tela trocar (o segundo toque de um toque duplo) é ignorado
// para não responder a pergunta seguinte sem querer.
const TOQUE_DUPLO_MS = 300;
const toque = { tela: 0, em: 0, travado: false };

function podeTocar() {
  return !toque.travado && performance.now() - toque.em > TOQUE_DUPLO_MS;
}

function responderUmaVez(el, fn, ms) {
  if (!podeTocar()) return;
  toque.travado = true;
  el.classList.add('sel');
  const tela = toque.tela;
  setTimeout(() => {
    if (tela !== toque.tela) return; // a tela mudou antes (voltar, sair): descarta
    try {
      fn();
    } catch (e) {
      console.error(e);
      render(estado.tela, false);
    }
  }, ms);
}

// Redesenha a mesma pergunta (rascunho, cores): não conta como tela nova para o toque duplo.
function redesenhar(tela) {
  const em = toque.em;
  render(tela, false);
  toque.em = em;
}

function render(tela, rolar = true) {
  toque.tela += 1;
  toque.em = performance.now();
  toque.travado = false;
  estado.tela = tela;
  app.innerHTML = (TELAS[tela] || TELAS.inicio)();
  ativarAnuncios();
  document.title = tela === 'resultado' ? `${estado.resultado.ranking[0].perfil.nome} · Prancheta`
    : tela === 'resultadoTorcida' ? `${estado.resultado.clube.nome} · Prancheta`
      : 'Prancheta';
  if (rolar) window.scrollTo(0, 0);
}

function iniciar(modo, versao, tema = 'futebol') {
  Object.assign(estado, {
    modo, versao, tema, perguntas: montarQuiz(modo, versao, tema), idx: 0, respostas: [], rascunho: null, cardUrl: null,
  });
  limparUrl();
  render('quiz');
}

function registrar(valor) {
  const q = estado.perguntas[estado.idx];
  const r = { valor, ...avaliar(q, valor) };
  if (q.tipo === 'regiao') r.regiao = valor;
  estado.respostas[estado.idx] = r;
  estado.rascunho = null;
  if (estado.idx < estado.perguntas.length - 1) {
    estado.idx++;
    render('quiz', false);
    app.querySelector('.pergunta-txt')?.focus?.();
  } else {
    finalizar();
  }
}

function finalizar() {
  const user = vetorUsuario(estado.respostas, estado.modo);
  mostrarResultado(estado.modo, user, false, estado.tema);
  try {
    history.replaceState(null, '', `?r=${codificar(estado.modo, user)}`);
  } catch { /* ambiente sem history (prévia) */ }
}

function mostrarResultado(modo, user, compartilhado, tema = 'futebol') {
  estado.modo = modo;
  estado.resultado = { modo, user, ranking: ranquear(modo, user), compartilhado, tema };
  estado.cardUrl = null;
  render('resultado');
  gerarCard(estado.resultado).then((url) => {
    estado.cardUrl = url;
    const box = app.querySelector('.card-preview');
    if (box) box.innerHTML = `<img src="${url}" alt="Card do resultado">`;
  }).catch(() => {
    const box = app.querySelector('.card-preview');
    if (box) box.innerHTML = '<div class="card-carregando">Não foi possível gerar o card neste navegador.</div>';
  });
}

function limparUrl() {
  try {
    if (location.search) history.replaceState(null, '', location.pathname);
  } catch { /* ignora */ }
}

function aviso(txt) {
  app.querySelectorAll('.aviso').forEach((el) => { el.textContent = txt; });
}

function linkResultado() {
  const r = estado.resultado;
  if (r.variante === 'dificil') return `${location.origin}${location.pathname}?d=${r.clube.id}.${r.match}`;
  if (r.modo === 'torcida') return `${location.origin}${location.pathname}?f=${r.clube.id}.${r.perguntas}.${r.acertou ? 1 : 0}`;
  return `${location.origin}${location.pathname}?r=${codificar(r.modo, r.user)}`;
}

function textoCompartilhar() {
  const r = estado.resultado;
  if (r.variante === 'dificil') {
    return `Pensei em um time e, no modo difícil, a Prancheta disse ${r.clube.nome} (${r.match}% compatível). Pense em um time e veja se ela adivinha!`;
  }
  if (r.modo === 'torcida') {
    return r.acertou
      ? `Pensei em um time e a Prancheta adivinhou em ${r.perguntas} perguntas: ${r.clube.nome}. Pense em um time e veja se ela acerta!`
      : `Pensei em ${r.clube.nome} e a Prancheta não conseguiu adivinhar. Pense em um time e tente também!`;
  }
  const p = r.ranking[0];
  return r.modo === 'treinador'
    ? `Na Prancheta, meu estilo é ${p.match}% ${p.perfil.nome}. Qual treinador você seria?`
    : `Na Prancheta, meu time é o ${p.perfil.nome} (${p.match}%). Qual time tem a sua cara?`;
}

async function compartilhar() {
  const texto = textoCompartilhar();
  try {
    if (navigator.canShare && estado.cardUrl) {
      const blob = await (await fetch(estado.cardUrl)).blob();
      const file = new File([blob], 'prancheta.png', { type: 'image/png' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text: texto, url: linkResultado() });
        return;
      }
    }
    if (navigator.share) {
      await navigator.share({ title: 'Prancheta', text: texto, url: linkResultado() });
      return;
    }
    throw new Error('sem share');
  } catch (e) {
    if (e && e.name === 'AbortError') return;
    copiar(`${texto} ${linkResultado()}`, 'Texto e link copiados. É só colar onde quiser.');
  }
}

async function copiar(txt, ok = 'Link copiado.') {
  try {
    await navigator.clipboard.writeText(txt);
    aviso(ok);
  } catch {
    aviso(`Copie o link: ${txt}`);
  }
}

function baixarCard() {
  if (!estado.cardUrl) return aviso('O card ainda está sendo gerado.');
  const a = document.createElement('a');
  a.href = estado.cardUrl;
  const r = estado.resultado;
  a.download = `prancheta-${r.modo === 'torcida' ? r.clube.id : r.ranking[0].perfil.id}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  aviso('Se o download não começar, toque e segure a imagem para salvar.');
}

// ---------------------------------------------------------------- Eventos

app.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-acao]');
  if (!el || el.disabled) return;
  const acao = el.dataset.acao;
  if (acao === 'slider') return;
  if (acao !== 'ancora') ev.preventDefault();

  switch (acao) {
    case 'inicio':
      limparUrl();
      render('inicio');
      break;
    case 'ancora':
      break;
    case 'iniciar':
      iniciar(el.dataset.modo, el.dataset.versao, el.dataset.tema || 'futebol');
      break;
    case 'feedback':
      abrirFeedback({ tipo: el.dataset.tipo, sobre: el.dataset.sobre || '' });
      break;
    case 'avaliar':
      avaliarResultado(Number(el.dataset.nota));
      break;
    case 'escolher-jogo':
      estado.jogo = el.dataset.modo;
      render('jogo');
      break;
    case 'torcida-iniciar':
      iniciarTorcida();
      break;
    case 'dificil-iniciar':
      iniciarDificil();
      break;
    case 'dificil-responder': {
      const d = estado.dificil;
      const idx = d.idx;
      const v = el.dataset.valor;
      const resposta = respostaDe(d.perguntas[idx], v);
      if (resposta === undefined) break;
      responderUmaVez(el, () => { if (d === estado.dificil && d.idx === idx) registrarDificil(resposta, v); }, 140);
      break;
    }
    case 'dificil-rascunho':
      estado.dificil.rascunho = el.dataset.valor;
      redesenhar('dificil');
      break;
    case 'dificil-cor': {
      const d = estado.dificil;
      const c = el.dataset.valor;
      if (d.rascunho.includes(c)) d.rascunho = d.rascunho.filter((x) => x !== c);
      else if (d.rascunho.length < 3) d.rascunho = [...d.rascunho, c];
      redesenhar('dificil');
      break;
    }
    case 'dificil-confirmar': {
      if (!podeTocar()) break;
      const d = estado.dificil;
      const q = d.perguntas[d.idx];
      const r = q.ui === 'cores' ? [...d.rascunho] : d.rascunho;
      registrarDificil(r, Array.isArray(r) ? r.join('+') : String(r));
      break;
    }
    case 'dificil-voltar': {
      const d = estado.dificil;
      if (d.idx === 0 || !podeTocar()) break;
      d.idx -= 1;
      d.rascunho = null;
      if (d.perguntas.length > TOTAL_DIFICIL - 2 && d.idx < TOTAL_DIFICIL - 2) d.perguntas.length = TOTAL_DIFICIL - 2;
      render('dificil', false);
      break;
    }
    case 'torcida-responder': {
      const q = estado.torcida.atual;
      const v = el.dataset.valor;
      responderUmaVez(el, () => responderTorcida(q, v), 140);
      break;
    }
    case 'torcida-voltar': {
      // Volta para a pergunta anterior (e não para uma nova sorteada).
      if (!podeTocar()) break;
      const t = estado.torcida;
      const ultima = t.historico.pop();
      if (ultima) {
        t.atual = ultima.pergunta;
        render('torcida', false);
      }
      break;
    }
    case 'torcida-chutar':
      if (podeTocar()) chutar();
      break;
    case 'palpite-sim':
      if (podeTocar()) resultadoTorcida(estado.torcida.palpite, true);
      break;
    case 'palpite-nao': {
      if (!podeTocar()) break;
      const t = estado.torcida;
      t.eliminados.add(t.palpite.id);
      t.limite = Math.max(t.limite, t.historico.length + EXTRA_APOS_ERRO);
      if (t.palpites >= MAX_PALPITES) render('escolher');
      else avancarTorcida(true);
      break;
    }
    case 'torcida-escolher': {
      const clube = clubePorId(el.dataset.id);
      registrarErroTorcida(clube);
      resultadoTorcida(clube, false);
      break;
    }
    case 'torcida-escolher-texto':
      escolherDigitado();
      break;
    case 'torcida-fora-lista': {
      const texto = (app.querySelector('#escolher-busca')?.value || '').trim();
      if (texto) foraDaLista(texto);
      break;
    }
    case 'responder': {
      const idx = estado.idx;
      const q = estado.perguntas[idx];
      const v = q.tipo === 'regiao' ? el.dataset.valor : Number(el.dataset.valor);
      responderUmaVez(el, () => { if (estado.idx === idx && estado.perguntas[idx] === q) registrar(v); }, 160);
      break;
    }
    case 'rascunho':
      estado.rascunho = Number(el.dataset.valor);
      redesenhar('quiz');
      break;
    case 'confirmar':
      if (estado.rascunho !== null && podeTocar()) registrar(estado.rascunho);
      break;
    case 'voltar':
      if (estado.idx > 0 && podeTocar()) {
        estado.idx--;
        estado.rascunho = null;
        render('quiz', false);
      }
      break;
    case 'baixar-card':
      baixarCard();
      break;
    case 'compartilhar':
      compartilhar();
      break;
    case 'copiar-link':
      copiar(linkResultado());
      break;
    default:
      break;
  }
});

// Confirma o que foi digitado: o clube da base que bate com o texto ou, se não houver, o nome livre.
function escolherDigitado() {
  const campo = app.querySelector('#escolher-busca');
  const texto = (campo?.value || '').trim();
  if (normalizar(texto).length < 2) {
    aviso('Digite o nome do time (pelo menos 2 letras) ou toque num dos escudos.');
    campo?.focus();
    return;
  }
  const achados = buscarClubes(texto);
  const exato = achados.find((c) => normalizar(c.nome) === normalizar(texto) || normalizar(c.apelido) === normalizar(texto));
  const clube = exato || (achados.length === 1 ? achados[0] : null);
  if (clube) {
    registrarErroTorcida(clube);
    resultadoTorcida(clube, false);
  } else if (achados.length) {
    aviso('Toque no time certo na lista acima, ou em "Não é nenhum desses".');
  } else {
    foraDaLista(texto);
  }
}

function foraDaLista(texto) {
  estado.torcida.foraDaLista = texto;
  registrarErroTorcida(null, texto);
  render('foraDaLista');
}

app.addEventListener('keydown', (ev) => {
  if (ev.key === 'Enter' && ev.target.id === 'escolher-busca') {
    ev.preventDefault();
    escolherDigitado();
  }
});

app.addEventListener('input', (ev) => {
  if (ev.target.id === 'escolher-busca') {
    listaBusca(ev.target.value);
    aviso('');
    return;
  }
  if (ev.target.dataset.acao === 'dificil-slider') {
    const d = estado.dificil;
    d.rascunho = Number(ev.target.value);
    app.querySelector('.numero-grande').outerHTML = sliderDificilVisual(d.perguntas[d.idx], d.rascunho);
    return;
  }
  if (ev.target.dataset.acao !== 'slider') return;
  atualizarSlider(Number(ev.target.value), false);
});

let arraste = null;

function moverArraste(ev) {
  const r = arraste.svg.getBoundingClientRect();
  atualizarSlider(sliderV(arraste.visual, ((ev.clientX - r.left) / r.width) * 105));
}

app.addEventListener('pointerdown', (ev) => {
  const box = ev.target.closest('.campo-arrastavel');
  if (!box) return;
  const svg = box.querySelector('svg');
  arraste = { svg, visual: box.dataset.visual };
  svg.setPointerCapture?.(ev.pointerId);
  box.classList.add('arrastando');
  moverArraste(ev);
  ev.preventDefault();
});

app.addEventListener('pointermove', (ev) => {
  if (arraste) moverArraste(ev);
});

const soltar = () => {
  if (!arraste) return;
  arraste.svg.closest('.campo-arrastavel')?.classList.remove('arrastando');
  arraste = null;
};
app.addEventListener('pointerup', soltar);
app.addEventListener('pointercancel', soltar);

// Foto que não carregou vira iniciais.
document.addEventListener('error', (ev) => {
  const img = ev.target;
  if (img.tagName !== 'IMG' || !img.dataset.ini) return;
  const span = document.createElement('span');
  span.className = `${img.className} iniciais`;
  span.textContent = img.dataset.ini;
  img.replaceWith(span);
}, true);

document.addEventListener('keydown', (ev) => {
  if (ev.altKey || ev.ctrlKey || ev.metaKey) return;
  if (ev.target.matches('input, textarea, select') || document.querySelector('dialog[open]')) return;
  if (estado.tela === 'torcida' || estado.tela === 'dificil') {
    const botoes = app.querySelectorAll('.op[data-acao$="-responder"], .op-escala[data-acao$="-responder"]');
    const n = Number(ev.key);
    if (n >= 1 && n <= botoes.length) botoes[n - 1].click();
    return;
  }
  if (estado.tela !== 'quiz') return;
  const q = estado.perguntas[estado.idx];
  const n = Number(ev.key);
  if (!podeTocar()) return;
  if (q.tipo === 'escala' && n >= 1 && n <= 5) registrar(ESCALA[n - 1].v);
  else if (q.tipo === 'escolha' && n >= 1 && n <= q.opcoes.length) registrar(n - 1);
  else if (ev.key === 'Enter' && precisaConfirmar(q) && estado.rascunho !== null) registrar(estado.rascunho);
});

// ---------------------------------------------------------------- Início da página

function boot() {
  let code = null;
  let torcida = null;
  try {
    const params = new URLSearchParams(location.search);
    code = params.get('r');
    torcida = params.get('f');
    const dificil = params.get('d');
    if (dificil) {
      const [id, m] = dificil.split('.');
      const clube = clubePorId(id);
      if (clube) {
        const rival = RIVAL[clube.id] && clubePorId(RIVAL[clube.id]);
        return mostrarResultadoDificil(clube, Math.min(99, Number(m) || 0), [], rival ? { clube: rival, rival: true } : null, true);
      }
    }
  } catch { /* ignora */ }
  if (torcida) {
    const [id, n, ok] = torcida.split('.');
    const clube = clubePorId(id);
    if (clube) return resultadoTorcida(clube, ok === '1', true, Number(n) || 0);
  }
  const dec = decodificar(code);
  if (dec) mostrarResultado(dec.modo, dec, true);
  else render('inicio', false);
}

boot();
