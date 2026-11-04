import { CLUBES_TORCIDA, REGIAO_UF, DOZE_GRANDES, DEZ_MAIORES_TORCIDAS } from './data/torcida.js';
import { CLUBES, TIMES } from './data/times.js';
import { BRASOES } from './data/brasoes.js';

// Modo "Qual time você está pensando?": adivinhação no estilo Akinator.
// Cada clube começa com uma probabilidade (torcidas maiores pesam mais). Cada resposta multiplica a
// probabilidade de cada clube pela chance de alguém daquele clube responder aquilo. A próxima pergunta
// é a que mais reduz a incerteza (entropia esperada). Dados desconhecidos (null) não pesam.

// Modo fácil: pergunta até ter certeza. O teto só existe para não ficar infinito.
export const MAX_PERGUNTAS = 40;
export const EXTRA_APOS_ERRO = 6;
export const MAX_PALPITES = 3;
const CERTEZA_PARA_CHUTAR = 0.9;
const MIN_PERGUNTAS = 5;

export const RESPOSTAS_SN = [
  { id: 'sim', texto: 'Sim', v: 1 },
  { id: 'acho-sim', texto: 'Acho que sim', v: 0.75 },
  { id: 'nao-sei', texto: 'Não sei', v: null },
  { id: 'acho-nao', texto: 'Acho que não', v: 0.25 },
  { id: 'nao', texto: 'Não', v: 0 },
];

const temCor = (cor) => (c) => (c.cores ? c.cores.includes(cor) : null);
const doCampo = (campo) => (c) => (c[campo] === null || c[campo] === undefined ? null : c[campo]);

const sn = (id, tag, texto, valor) => ({ id, tipo: 'sn', tag, texto, valor });
const cat = (id, tag, texto, opcoes, valor) => ({ id, tipo: 'cat', tag, texto, opcoes, valor });

const PERGUNTAS = [
  cat('regiao', 'Mapa', 'Em que região do Brasil fica o time?',
    [['N', 'Norte'], ['NE', 'Nordeste'], ['CO', 'Centro-Oeste'], ['SE', 'Sudeste'], ['S', 'Sul']],
    (c) => REGIAO_UF[c.uf]),
  cat('serie', 'Divisão', 'Em que divisão do Brasileirão o time joga em 2026?',
    [['A', 'Série A'], ['B', 'Série B'], ['C', 'Série C'], ['D', 'Série D'], ['E', 'Nenhuma, só o estadual']], doCampo('serie')),
  cat('mascote-tipo', 'Mascote', 'O mascote do time é…',
    [['ave', 'Uma ave'], ['felino', 'Um felino (leão, tigre, onça…)'], ['bicho', 'Outro bicho'],
      ['pessoa', 'Uma pessoa ou personagem'], ['outro', 'Outra coisa (fantasma, furacão…)']], doCampo('mascoteTipo')),
  cat('cor-principal', 'Camisa', 'Qual cor mais aparece na camisa principal do time?',
    [['vermelho', 'Vermelho'], ['preto', 'Preto'], ['branco', 'Branco'], ['verde', 'Verde'], ['azul', 'Azul'],
      ['amarelo', 'Amarelo'], ['grena', 'Grená']], doCampo('principal')),

  sn('capital', 'Mapa', 'O time é de uma capital?', doCampo('capital')),
  sn('litoral', 'Mapa', 'A cidade do time tem praia?', doCampo('litoral')),
  sn('nome-lugar', 'Nome', 'O nome do time também é o nome de uma cidade, estado ou região?', doCampo('nomeLugar')),
  sn('doze-grandes', 'Tamanho', 'O time é um dos 12 grandes do futebol brasileiro?', (c) => DOZE_GRANDES.includes(c.id)),
  sn('top10', 'Torcida', 'O time tem uma das 10 maiores torcidas do Brasil?', (c) => DEZ_MAIORES_TORCIDAS.includes(c.id)),
  sn('brasileiro', 'Títulos', 'O time já foi campeão brasileiro da primeira divisão?', doCampo('br')),
  sn('libertadores', 'Títulos', 'O time já ganhou a Libertadores?', doCampo('lib')),
  sn('copa-brasil', 'Títulos', 'O time já ganhou a Copa do Brasil?', doCampo('cb')),
  sn('nordestao', 'Títulos', 'O time já ganhou a Copa do Nordeste?', doCampo('ne')),
  sn('arena', 'Estádio', 'O time manda jogos num estádio que recebeu a Copa do Mundo de 2014?', doCampo('arena')),
  sn('rival-cidade', 'Rivalidade', 'O maior rival do time é da mesma cidade?', doCampo('rivalCidade')),
  sn('listrada', 'Camisa', 'A camisa principal do time é listrada?', doCampo('listrada')),
  sn('tricolor', 'Cores', 'O time tem três cores (é tricolor)?', (c) => (c.cores ? c.cores.length >= 3 : null)),
  sn('alvinegro', 'Cores', 'O time é alvinegro (só preto e branco)?',
    (c) => (c.cores ? c.cores.length === 2 && c.cores.includes('preto') && c.cores.includes('branco') : null)),
  sn('rubro-negro', 'Cores', 'O time é rubro-negro (vermelho e preto)?',
    (c) => (c.cores ? c.cores.includes('vermelho') && c.cores.includes('preto') : null)),
  sn('cor-vermelho', 'Cores', 'Tem vermelho nas cores do time?', temCor('vermelho')),
  sn('cor-verde', 'Cores', 'Tem verde nas cores do time?', temCor('verde')),
  sn('cor-azul', 'Cores', 'Tem azul (de qualquer tom) nas cores do time?', temCor('azul')),
  sn('cor-amarelo', 'Cores', 'Tem amarelo nas cores do time?', temCor('amarelo')),
  sn('cor-preto', 'Cores', 'Tem preto nas cores do time?', temCor('preto')),
  sn('cor-grena', 'Cores', 'O time usa grená (vinho)?', temCor('grena')),
];

// "O mascote é um leão?" etc., para mascotes que aparecem em mais de um clube.
const ARTIGO = {
  Águia: 'uma águia', Baleia: 'uma baleia', Macaca: 'uma macaca', Raposa: 'uma raposa', Coruja: 'uma coruja', Pantera: 'uma pantera',
  Arara: 'uma arara', 'Onça-pintada': 'uma onça-pintada', Locomotiva: 'uma locomotiva', Hulk: 'o Hulk',
};
const contagem = {};
CLUBES_TORCIDA.forEach((c) => { if (c.mascote) contagem[c.mascote] = (contagem[c.mascote] || 0) + 1; });
Object.entries(contagem).filter(([, n]) => n >= 2).forEach(([m]) => {
  PERGUNTAS.push(sn(`mascote-${m}`, 'Mascote', `O mascote do time é ${ARTIGO[m] || `um ${m.toLowerCase()}`}?`,
    (c) => (c.mascote ? c.mascote === m : null)));
});

// História, títulos, estádio, comunidade, uniforme e patrocínio.
const ATUAL = Object.fromEntries(TIMES.filter((t) => t.tipo === 'atual').map((t) => [t.clube, t.eixos]));
const faixa = (v, alto, baixo) => (v === undefined ? null : v >= alto ? true : v <= baixo ? false : null);

PERGUNTAS.push(
  sn('mundial', 'Títulos', 'O time já foi campeão do mundo?', doCampo('mundial')),
  sn('mais5br', 'Títulos', 'O time tem mais de 5 títulos brasileiros?', (c) => (c.brasileiros === null ? null : c.brasileiros > 5)),
  sn('br-recente', 'Títulos', 'O time foi campeão brasileiro nos últimos 10 anos?', doCampo('brRecente')),
  sn('estadual', 'Títulos', 'O time já foi campeão estadual?', (c) => (c.estaduais === null || c.estaduais === undefined ? null : c.estaduais > 0)),
  sn('mais10estaduais', 'Títulos', 'O time tem mais de 10 títulos estaduais?', (c) => (c.estaduais === null || c.estaduais === undefined ? null : c.estaduais > 10)),
  sn('seculo21', 'História', 'O time foi fundado neste século, de 2000 para cá?', (c) => (c.fundacao ? c.fundacao >= 2000 : null)),
  sn('caiu', 'História', 'O time já caiu da Série A para a Série B alguma vez?', doCampo('caiu')),
  sn('final-conmebol', 'Títulos', 'O time já jogou uma final de Libertadores ou de Sul-Americana?', doCampo('finalConmebol')),
  sn('estadio-proprio', 'Estádio', 'O estádio onde o time joga pertence ao próprio clube?', doCampo('estadioProprio')),
  sn('imigrantes', 'Comunidade', 'O time foi fundado por uma colônia de imigrantes (italianos, portugueses, alemães…)?', doCampo('imigrantes')),
  sn('operarios', 'Comunidade', 'O time nasceu entre trabalhadores, como operários ou ferroviários?', doCampo('operarios')),
  sn('luta', 'Lutas', 'O time tem uma história marcante de luta contra o racismo ou pela democracia?', doCampo('luta')),
  sn('povo', 'Torcida', 'A torcida se orgulha de chamar o clube de "time do povo" ou "o mais querido"?', doCampo('povo')),
  sn('cruz', 'Uniforme', 'O escudo do time tem uma cruz?', doCampo('cruz')),
  sn('posse', 'Tática', 'Nesta temporada, o time costuma ficar mais com a bola do que o adversário?', (c) => faixa(ATUAL[c.id]?.posse, 60, 48)),
  sn('pressao', 'Tática', 'O time é conhecido por pressionar a saída de bola do adversário?', (c) => faixa(ATUAL[c.id]?.pressao, 70, 50)),
  cat('patrocinio', 'Patrocínio', 'Qual destas marcas estampou a camisa do time por muitos anos?',
    [['parmalat', 'Parmalat'], ['unimed', 'Unimed'], ['lubrax', 'Lubrax (Petrobras)'], ['banrisul', 'Banrisul'], ['nenhum', 'Nenhuma dessas']],
    doCampo('patrocinio')),
);

// Perguntas sobre o maior rival, sem dizer quem é ele.
const doRival = (f) => (c) => {
  const r = RIVAL[c.id] && CLUBES_TORCIDA.find((x) => x.id === RIVAL[c.id]);
  return r ? f(r) : null;
};
PERGUNTAS.push(
  sn('rival-mundial', 'Rivalidade', 'O maior rival do time já foi campeão do mundo?', doRival((r) => r.mundial)),
  sn('rival-alvinegro', 'Rivalidade', 'O maior rival do time é alvinegro?',
    doRival((r) => (r.cores ? r.cores.length === 2 && r.cores.includes('preto') && r.cores.includes('branco') : null))),
  sn('rival-br-recente', 'Rivalidade', 'O maior rival foi campeão brasileiro nos últimos 10 anos?', doRival((r) => r.brRecente)),
  sn('rival-mais5', 'Rivalidade', 'O maior rival tem mais de 5 títulos brasileiros?', doRival((r) => (r.brasileiros === null ? null : r.brasileiros > 5))),
  sn('rival-nunca-caiu', 'Rivalidade', 'O maior rival do time nunca caiu para a Série B?', doRival((r) => (r.caiu === null ? null : !r.caiu))),
  sn('rival-libertadores', 'Rivalidade', 'O maior rival já ganhou a Libertadores?', doRival((r) => r.lib)),
);

// Perguntas diretas demais: valem menos na escolha da próxima pergunta, para o jogo preferir as de
// história, títulos, comunidade e rivalidade quando o ganho for parecido.
const OBVIAS = new Set(['regiao', 'serie', 'cor-principal', 'mascote-tipo', 'capital', 'litoral', 'nome-lugar', 'listrada',
  'tricolor', 'alvinegro', 'rubro-negro', 'cor-vermelho', 'cor-verde', 'cor-azul', 'cor-amarelo', 'cor-preto', 'cor-grena']);
PERGUNTAS.forEach((q) => { q.obvia = OBVIAS.has(q.id) || q.id.startsWith('mascote-'); });

// Pergunta final, montada com os candidatos mais prováveis.
const DINAMICAS = [
  { campo: 'idolo', tag: 'Ídolo', texto: 'Qual destes craques é ídolo desse time?' },
  { campo: 'estadio', tag: 'Estádio', texto: 'Em qual destes estádios o time costuma mandar os jogos?' },
];

// Tolerância a erro: quem pensa num clube responde certo ~88–90% das vezes.
const PROB_CATEGORIA = 0.88;
const PROB_SN = 0.9;

function verossimilhanca(q, clube, resposta) {
  if (resposta === null || resposta === undefined) return 1;
  if (q.vero) return q.vero(clube, resposta);
  const t = q.valor(clube);
  if (t === null || t === undefined) return 1;
  if (q.tipo === 'sn') {
    const a = resposta;
    return t ? (1 - PROB_SN) + (2 * PROB_SN - 1) * a : PROB_SN - (2 * PROB_SN - 1) * a;
  }
  const k = q.opcoes.length;
  return t === resposta ? PROB_CATEGORIA : (1 - PROB_CATEGORIA) / (k - 1);
}

export function priori(clube) {
  return 3 + clube.massa;
}

export function posterior(historico, eliminados = new Set()) {
  const p = CLUBES_TORCIDA.map((c) => {
    if (eliminados.has(c.id)) return 0;
    let v = priori(c);
    for (const { pergunta, resposta } of historico) v *= verossimilhanca(pergunta, c, resposta);
    return v;
  });
  const soma = p.reduce((a, b) => a + b, 0) || 1;
  return CLUBES_TORCIDA.map((c, i) => ({ clube: c, p: p[i] / soma })).sort((a, b) => b.p - a.p);
}

const entropia = (ps) => -ps.reduce((s, x) => (x > 0 ? s + x * Math.log2(x) : s), 0);

function entropiaEsperada(q, dist) {
  const respostas = q.tipo === 'sn' ? [1, 0] : q.opcoes.map(([id]) => id);
  let total = 0;
  for (const r of respostas) {
    const pesos = dist.map(({ clube, p }) => p * verossimilhanca(q, clube, r));
    const pr = pesos.reduce((a, b) => a + b, 0);
    if (pr <= 0) continue;
    total += pr * entropia(pesos.map((w) => w / pr));
  }
  const norm = respostas.reduce((s, r) => s + dist.reduce((a, { clube, p }) => a + p * verossimilhanca(q, clube, r), 0), 0);
  return total / (norm || 1);
}

function perguntaDinamica(def, dist) {
  const candidatos = dist.filter((d) => d.p > 0.03 && d.clube[def.campo]).slice(0, 4);
  const valores = [...new Set(candidatos.map((d) => d.clube[def.campo]))];
  if (valores.length < 2) return null;
  // Completa com valores de outros clubes para ter pelo menos 3 nomes (4 opções com "Nenhum desses").
  const outros = dist.map((d) => d.clube[def.campo]).filter((v) => v && !valores.includes(v));
  while (valores.length < 3 && outros.length) {
    const v = outros.splice(Math.floor(Math.random() * outros.length), 1)[0];
    if (!valores.includes(v)) valores.push(v);
  }
  const opcoes = valores.sort(() => Math.random() - 0.5).map((v) => [v, v]);
  opcoes.push(['nenhum', 'Nenhum desses']);
  return cat(`din-${def.campo}`, def.tag, def.texto, opcoes, (c) => {
    if (!c[def.campo]) return null;
    return valores.includes(c[def.campo]) ? c[def.campo] : 'nenhum';
  });
}

// Escolhe a próxima pergunta (ou null quando não há o que perguntar).
export function proximaPergunta(historico, eliminados) {
  const dist = posterior(historico, eliminados);
  const feitas = new Set(historico.map((h) => h.pergunta.id));
  const candidatas = PERGUNTAS.filter((q) => !feitas.has(q.id));
  if (dist[0].p < 0.9 && historico.length >= 3) {
    for (const def of DINAMICAS) {
      if (feitas.has(`din-${def.campo}`)) continue;
      const q = perguntaDinamica(def, dist);
      if (q) candidatas.push(q);
    }
  }
  if (!candidatas.length) return null;
  const hAtual = entropia(dist.map((d) => d.p));
  const notas = candidatas.map((q) => {
    const ganho = hAtual - entropiaEsperada(q, dist);
    return { q, ganho, nota: ganho * (q.obvia ? 0.55 : 1.15) };
  }).filter((n) => n.ganho >= 0.01).sort((a, b) => b.nota - a.nota);
  if (!notas.length) return null;
  // Um pouco de variedade entre perguntas quase tão boas quanto a melhor.
  const boas = notas.filter((n) => n.nota >= notas[0].nota * 0.85).slice(0, 3);
  return boas[Math.floor(Math.random() * boas.length)].q;
}

export function horaDeChutar(historico, eliminados, limite) {
  const dist = posterior(historico, eliminados);
  return (dist[0].p >= CERTEZA_PARA_CHUTAR && historico.length >= MIN_PERGUNTAS) || historico.length >= limite;
}

// ---------------------------------------------------------------- Modo difícil
// 15 perguntas sorteadas de um banco (sem escolher a próxima pela resposta anterior): um núcleo de
// ações que sempre aparece, perguntas sorteadas e, no fim, duas perguntas montadas com os candidatos.

export const TOTAL_DIFICIL = 15;
const DINAMICAS_NO_FIM = 2;

const gauss = (d, s) => Math.exp(-((d / s) ** 2));

const ACOES_DIFICIL = [
  {
    id: 'mapa', tipo: 'cat', ui: 'mapa', tag: 'Sotaque', texto: 'Toque no mapa: de onde vem o sotaque da torcida desse time?',
    opcoes: [['N', 'Norte'], ['NE', 'Nordeste'], ['CO', 'Centro-Oeste'], ['SE', 'Sudeste'], ['S', 'Sul']],
    valor: (c) => REGIAO_UF[c.uf],
  },
  {
    id: 'camisa', tipo: 'cores', ui: 'cores', tag: 'Camisa', texto: 'Pinte a camisa: escolha as cores do time (até 3).',
    valor: (c) => c.cores,
    vero: (c, r) => {
      if (!c.cores || !r.length) return 1;
      const inter = r.filter((x) => c.cores.includes(x)).length;
      const uniao = new Set([...r, ...c.cores]).size;
      return 0.04 + 0.96 * (inter / uniao) ** 1.5;
    },
    conc: (c, r) => {
      if (!c.cores || !r.length) return null;
      return r.filter((x) => c.cores.includes(x)).length / new Set([...r, ...c.cores]).size;
    },
  },
  {
    id: 'tamanho-torcida', tipo: 'slider', ui: 'tamanho', tag: 'Torcida', texto: 'Arraste: qual é o tamanho da torcida do time?',
    rotulos: ['Pequena, todo mundo se conhece', 'Uma das maiores do país'],
    valor: (c) => c.massa,
    vero: (c, v) => 0.1 + 0.9 * gauss(c.massa - v * 100, 22),
    conc: (c, v) => gauss(c.massa - v * 100, 30),
  },
];

const NUCLEO_DIFICIL = [];

function embaralhar(lista) {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// As 13 primeiras perguntas (as 2 últimas saem de perguntasFinaisDificil).
export function montarDificil() {
  const nucleo = [...ACOES_DIFICIL, ...PERGUNTAS.filter((q) => NUCLEO_DIFICIL.includes(q.id))];
  // Fora do sorteio: o que o núcleo já cobre (região, cor principal) e perguntas de mascote específico.
  // Fora: o que as ações já cobrem (região, cores, idade, tamanho da torcida).
  const fora = new Set(['regiao', 'cor-principal', 'top10', ...NUCLEO_DIFICIL]);
  const pool = PERGUNTAS.filter((q) => !fora.has(q.id) && !q.id.startsWith('mascote-'));
  // Prioridade para história, títulos, comunidade, tática e rivalidade; no máximo 1 pergunta direta
  // além do mapa e da camisa.
  const vagas = TOTAL_DIFICIL - DINAMICAS_NO_FIM - nucleo.length;
  const escolhidas = [
    ...embaralhar(pool.filter((q) => !q.obvia)).slice(0, vagas - 1),
    ...embaralhar(pool.filter((q) => q.obvia)).slice(0, 1),
  ];
  return embaralhar([...nucleo, ...escolhidas]);
}

export function perguntasFinaisDificil(historico) {
  const dist = posterior(historico);
  const lista = [];
  for (const def of embaralhar(DINAMICAS)) {
    const q = perguntaDinamica(def, dist);
    if (q) lista.push(q);
    if (lista.length === DINAMICAS_NO_FIM) break;
  }
  // Se os candidatos não tiverem dados para isso, completa com perguntas do banco.
  const feitas = new Set(historico.map((h) => h.pergunta.id));
  const repetidas = new Set(['top10']);
  const extras = embaralhar(PERGUNTAS.filter((q) => !feitas.has(q.id) && !q.obvia && !repetidas.has(q.id)));
  while (lista.length < DINAMICAS_NO_FIM && extras.length) lista.push(extras.shift());
  return lista;
}

// Concordância (0 a 1) entre uma resposta e um clube; null quando não dá para comparar.
function concordancia(q, clube, resposta) {
  if (resposta === null || resposta === undefined) return null;
  if (q.conc) return q.conc(clube, resposta);
  const t = q.valor(clube);
  if (t === null || t === undefined) return null;
  if (q.tipo === 'sn') return 1 - Math.abs(resposta - (t ? 1 : 0));
  return t === resposta ? 1 : 0;
}

// Ranking final: ordem pela probabilidade, % pela concordância média (com um leve puxão para 50%
// em clubes com poucos dados, para não darem 100% por acaso).
export function ranquearTorcida(historico) {
  return posterior(historico).map(({ clube, p }) => {
    let soma = 1;
    let n = 2;
    for (const { pergunta, resposta } of historico) {
      const c = concordancia(pergunta, clube, resposta);
      if (c === null) continue;
      soma += c;
      n += 1;
    }
    return { clube, p, match: Math.round((100 * soma) / n) };
  });
}

// Rival direto de cada clube (quando o rival está na base).
export const RIVAL = {
  flamengo: 'vasco', vasco: 'flamengo', fluminense: 'flamengo', botafogo: 'flamengo',
  palmeiras: 'corinthians', corinthians: 'palmeiras', saopaulo: 'corinthians', santos: 'corinthians',
  cruzeiro: 'atletico', atletico: 'cruzeiro', 'america-mg': 'atletico',
  gremio: 'inter', inter: 'gremio', athletico: 'coritiba', coritiba: 'athletico',
  bahia: 'vitoria', vitoria: 'bahia', remo: 'paysandu', paysandu: 'remo', 'tuna-luso': 'remo',
  ceara: 'fortaleza', fortaleza: 'ceara', ferroviario: 'ceara',
  sport: 'nautico', nautico: 'sport', 'santa-cruz': 'sport',
  goias: 'vila-nova', 'vila-nova': 'goias', 'atletico-go': 'goias',
  avai: 'figueirense', figueirense: 'avai', criciuma: 'figueirense', chapecoense: 'figueirense',
  'ponte-preta': 'guarani', guarani: 'ponte-preta', crb: 'csa', csa: 'crb', asa: 'csa',
  abc: 'america-rn', 'america-rn': 'abc', 'sampaio-correa': 'moto-club', 'moto-club': 'sampaio-correa', maranhao: 'sampaio-correa',
  juventude: 'caxias', caxias: 'juventude', brasiliense: 'gama', gama: 'brasiliense',
  confianca: 'sergipe', sergipe: 'confianca', itabaiana: 'confianca', 'botafogo-pb': 'treze', treze: 'botafogo-pb',
  londrina: 'operario-pr', 'operario-pr': 'londrina',
  'ypiranga-ap': 'macapa', 'macapa': 'ypiranga-ap', 'desportiva-ferroviaria': 'rio-branco-es', 'mixto': 'operario-vg', 'operario-vg': 'mixto', 'campinense': 'treze', 'atletico-roraima': 'bare', 'bare': 'atletico-roraima',
};

export function opostoDe(top, ranking) {
  const rival = RIVAL[top.id] && ranking.find((r) => r.clube.id === RIVAL[top.id]);
  if (rival) return { ...rival, rival: true };
  const menor = [...ranking].sort((a, b) => a.match - b.match)[0];
  return { ...menor, rival: false };
}

// ---------------------------------------------------------------- Apresentação

const HEX = {
  vermelho: '#d6202a', preto: '#111111', branco: '#ffffff', verde: '#00843d',
  azul: '#1f4fa3', amarelo: '#f7d117', grena: '#7a0026',
};

export function escudoDoClube(c) {
  if (BRASOES[c.id]) return BRASOES[c.id];
  if (CLUBES[c.id]) return CLUBES[c.id].escudo;
  if (!c.cores) return ['classico', 'liso', ['#4a5a52', '#eef2ea']];
  const cores = c.cores.map((x) => HEX[x]);
  if (c.listrada && cores.length >= 2) return ['classico', 'vertical', cores.length === 2 ? [...cores, ...cores, cores[0]] : cores];
  return ['classico', 'liso', [HEX[c.principal] || cores[0], cores.find((x) => x !== (HEX[c.principal] || cores[0])) || '#ffffff']];
}

export const NOME_REGIAO = { N: 'Norte', NE: 'Nordeste', CO: 'Centro-Oeste', SE: 'Sudeste', S: 'Sul' };

export function titulosDoClube(c) {
  const t = [];
  if (c.lib) t.push('Libertadores');
  if (c.br) t.push('Brasileirão');
  if (c.cb) t.push('Copa do Brasil');
  if (c.ne) t.push('Copa do Nordeste');
  return t;
}

// "Série B", ou "Só o estadual" para quem não disputa série nacional em 2026.
export const nomeSerie = (c) => (c.serie === 'E' ? 'Só o estadual' : `Série ${c.serie}`);

export const clubePorId = (id) => CLUBES_TORCIDA.find((c) => c.id === id);
export { CLUBES_TORCIDA };
