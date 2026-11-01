import { EIXOS, EIXOS_TATICOS, EIXO_ROTACAO, REGIOES, ATUALIZADO_EM } from './data/eixos.js';
import { FORMACOES, ZONAS } from './data/perguntas.js';
import { TREINADORES, TIPO_TREINADOR } from './data/treinadores.js';
import { TIMES, TIPO_TIME } from './data/times.js';
import { montarQuiz, TAMANHO, TEMAS, avaliar, vetorUsuario, ranquear, codificar, decodificar } from './engine.js';
import { campo, jogadores } from './campo.js';
import { gerarCard } from './card.js';
import { escudoSVG } from './escudos.js';
import { abrirFeedback, enviarAvaliacao } from './feedback.js';

const app = document.getElementById('app');

const MODOS = {
  treinador: { rotulo: 'Qual treinador você seria?', curto: 'Treinador', num: 1 },
  time: { rotulo: 'Qual time você escolheria?', curto: 'Time', num: 2 },
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
};

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const num = (n) => String(n).padStart(2, '0');

// ---------------------------------------------------------------- Início

function telaInicio() {
  const modoCard = (modo, titulo, texto, qtd) => `
    <article class="modo">
      <div class="modo-bug">
        <span class="bug-n">${MODOS[modo].num}</span>
        <span class="bug-t">Modo ${MODOS[modo].curto.toLowerCase()}</span>
        <span class="bug-q">${qtd}</span>
      </div>
      <h2>${titulo}</h2>
      <p>${texto}</p>
      ${Object.entries(TEMAS).map(([tema, t]) => `
        <div class="tema">
          <p class="tema-cab"><b>Responder com ${t.nome.toLowerCase()}</b><span>${t.desc}</span></p>
          <div class="versoes">
            <button class="versao${tema === 'futebol' ? ' versao-forte' : ''}" data-acao="iniciar" data-modo="${modo}" data-versao="curta" data-tema="${tema}">
              <b>Curta</b><span>${TAMANHO.curta} perguntas · 3 min</span>
            </button>
            <button class="versao" data-acao="iniciar" data-modo="${modo}" data-versao="completa" data-tema="${tema}">
              <b>Completa</b><span>${TAMANHO.completa} perguntas · 6 min</span>
            </button>
          </div>
        </div>`).join('')}
    </article>`;

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
      <section class="hero wrap">
        <div class="hero-txt">
          <p class="eyebrow">Futebol brasileiro · tática e fundamentos</p>
          <h1>Monte a sua <em>prancheta</em></h1>
          <p class="lead">Responda a situações de jogo, escolha a formação e posicione a linha de defesa. No fim, a gente compara o seu estilo com ${TREINADORES.length} treinadores e ${TIMES.length} times do futebol brasileiro.</p>
        </div>
        <figure class="hero-campo" aria-hidden="true">
          ${campo(heroDesenho(), 'campo-hero')}
          <figcaption><span>4-2-2-2</span> o quadrado mágico</figcaption>
        </figure>
      </section>

      <section class="modos wrap" id="jogar">
        ${modoCard('treinador', 'Qual treinador você seria?', 'De Telê Santana a Abel Ferreira, de Zagallo a Filipe Luís. Treinadores atuais, lendas e estrangeiros que marcaram o futebol brasileiro.', `${TREINADORES.length} treinadores`)}
        ${modoCard('time', 'Qual time você escolheria?', 'Os 20 clubes da Série A 2026, esquadrões como o Santos de 1962 e campanhas inesquecíveis como o Santo André de 2004 e o Paysandu de 2003. Conta tática, elenco e identidade do clube.', `${TIMES.length} times`)}
      </section>

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

function heroDesenho() {
  const f = FORMACOES.find((x) => x.id === '4-2-2-2');
  return `
    <g class="setas">
      <path d="M40 24 Q 55 12 70 18" /><path d="M40 44 Q 58 58 74 50" />
      <path d="M60 24 L 84 30" /><path d="M78 44 Q 88 40 92 34" />
    </g>
    ${jogadores(f)}`;
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
      </div>
    </footer>`;
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
          <p class="aviso" id="aviso" role="status"></p>
          <div class="botoes botoes-fim">
            <button class="btn-sec" data-acao="iniciar" data-modo="${outro}" data-versao="curta" data-tema="${estado.tema}">Jogar o modo ${MODOS[outro].curto.toLowerCase()} →</button>
            <button class="btn-link" data-acao="iniciar" data-modo="${modo}" data-versao="completa" data-tema="${estado.tema}">Refazer na versão completa</button>
            <button class="btn-link" data-acao="iniciar" data-modo="${modo}" data-versao="curta" data-tema="${estado.tema === 'cultura' ? 'futebol' : 'cultura'}">Refazer respondendo com ${estado.tema === 'cultura' ? 'futebol' : 'cultura pop'}</button>
          </div>
        </div>
      </section>

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

// ---------------------------------------------------------------- Fluxo

function render(tela, rolar = true) {
  estado.tela = tela;
  app.innerHTML = tela === 'quiz' ? telaQuiz() : tela === 'resultado' ? telaResultado() : telaInicio();
  document.title = tela === 'resultado' ? `${estado.resultado.ranking[0].perfil.nome} · Prancheta` : 'Prancheta';
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
  const el = document.getElementById('aviso');
  if (el) el.textContent = txt;
}

function linkResultado() {
  const { modo, user } = estado.resultado;
  return `${location.origin}${location.pathname}?r=${codificar(modo, user)}`;
}

async function compartilhar() {
  const { modo, ranking } = estado.resultado;
  const p = ranking[0];
  const texto = modo === 'treinador'
    ? `Na Prancheta, meu estilo é ${p.match}% ${p.perfil.nome}. Qual treinador você seria?`
    : `Na Prancheta, meu time é o ${p.perfil.nome} (${p.match}%). Qual time você escolheria?`;
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
  a.download = `prancheta-${estado.resultado.ranking[0].perfil.id}.png`;
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
    case 'responder': {
      const q = estado.perguntas[estado.idx];
      const v = q.tipo === 'regiao' ? el.dataset.valor : Number(el.dataset.valor);
      el.classList.add('sel');
      setTimeout(() => registrar(v), 160);
      break;
    }
    case 'rascunho':
      estado.rascunho = Number(el.dataset.valor);
      render('quiz', false);
      break;
    case 'confirmar':
      if (estado.rascunho !== null) registrar(estado.rascunho);
      break;
    case 'voltar':
      if (estado.idx > 0) {
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

app.addEventListener('input', (ev) => {
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
  if (estado.tela !== 'quiz' || ev.altKey || ev.ctrlKey || ev.metaKey) return;
  if (ev.target.matches('input, textarea') || document.querySelector('dialog[open]')) return;
  const q = estado.perguntas[estado.idx];
  const n = Number(ev.key);
  if (q.tipo === 'escala' && n >= 1 && n <= 5) registrar(ESCALA[n - 1].v);
  else if (q.tipo === 'escolha' && n >= 1 && n <= q.opcoes.length) registrar(n - 1);
  else if (ev.key === 'Enter' && precisaConfirmar(q) && estado.rascunho !== null) registrar(estado.rascunho);
});

// ---------------------------------------------------------------- Início da página

function boot() {
  let code = null;
  try {
    code = new URLSearchParams(location.search).get('r');
  } catch { /* ignora */ }
  const dec = decodificar(code);
  if (dec) mostrarResultado(dec.modo, dec, true);
  else render('inicio', false);
}

boot();
