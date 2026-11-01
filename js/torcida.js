import { CLUBES_TORCIDA, REGIAO_UF, DOZE_GRANDES, DEZ_MAIORES_TORCIDAS } from './data/torcida.js';
import { CLUBES } from './data/times.js';

// Modo "Para qual time você torce?": adivinhação no estilo Akinator.
// Cada clube começa com uma probabilidade (torcidas maiores pesam mais). Cada resposta multiplica a
// probabilidade de cada clube pela chance de alguém daquele clube responder aquilo. A próxima pergunta
// é a que mais reduz a incerteza (entropia esperada). Dados desconhecidos (null) não pesam.

// Modo fácil: pergunta até ter certeza. O teto só existe para não ficar infinito.
export const MAX_PERGUNTAS = 40;
export const EXTRA_APOS_ERRO = 6;
export const MAX_PALPITES = 3;
const CERTEZA_PARA_CHUTAR = 0.85;
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
  cat('regiao', 'Mapa', 'Em que região do Brasil fica o seu time?',
    [['N', 'Norte'], ['NE', 'Nordeste'], ['CO', 'Centro-Oeste'], ['SE', 'Sudeste'], ['S', 'Sul']],
    (c) => REGIAO_UF[c.uf]),
  cat('serie', 'Divisão', 'Em que divisão do Brasileirão o seu time joga em 2026?',
    [['A', 'Série A'], ['B', 'Série B'], ['C', 'Série C'], ['D', 'Série D']], doCampo('serie')),
  cat('mascote-tipo', 'Mascote', 'O mascote do seu time é…',
    [['ave', 'Uma ave'], ['felino', 'Um felino (leão, tigre, onça…)'], ['bicho', 'Outro bicho'],
      ['pessoa', 'Uma pessoa ou personagem'], ['outro', 'Outra coisa (fantasma, furacão…)']], doCampo('mascoteTipo')),
  cat('cor-principal', 'Camisa', 'Qual cor mais aparece na camisa principal do seu time?',
    [['vermelho', 'Vermelho'], ['preto', 'Preto'], ['branco', 'Branco'], ['verde', 'Verde'], ['azul', 'Azul'],
      ['amarelo', 'Amarelo'], ['grena', 'Grená']], doCampo('principal')),

  sn('capital', 'Mapa', 'O seu time é de uma capital?', doCampo('capital')),
  sn('litoral', 'Mapa', 'A cidade do seu time tem praia?', doCampo('litoral')),
  sn('nome-lugar', 'Nome', 'O nome do seu time também é o nome de uma cidade, estado ou região?', doCampo('nomeLugar')),
  sn('centenario', 'História', 'O seu time já passou dos 100 anos?', (c) => (c.fundacao ? c.fundacao <= 1926 : null)),
  sn('jovem', 'História', 'O seu time foi fundado depois de 1970?', (c) => (c.fundacao ? c.fundacao > 1970 : null)),
  sn('doze-grandes', 'Tamanho', 'O seu time é um dos 12 grandes do futebol brasileiro?', (c) => DOZE_GRANDES.includes(c.id)),
  sn('top10', 'Torcida', 'O seu time tem uma das 10 maiores torcidas do Brasil?', (c) => DEZ_MAIORES_TORCIDAS.includes(c.id)),
  sn('brasileiro', 'Títulos', 'O seu time já foi campeão brasileiro da primeira divisão?', doCampo('br')),
  sn('libertadores', 'Títulos', 'O seu time já ganhou a Libertadores?', doCampo('lib')),
  sn('copa-brasil', 'Títulos', 'O seu time já ganhou a Copa do Brasil?', doCampo('cb')),
  sn('nordestao', 'Títulos', 'O seu time já ganhou a Copa do Nordeste?', doCampo('ne')),
  sn('arena', 'Estádio', 'O seu time manda jogos num estádio que recebeu a Copa do Mundo de 2014?', doCampo('arena')),
  sn('rival-cidade', 'Rivalidade', 'O maior rival do seu time é da mesma cidade?', doCampo('rivalCidade')),
  sn('listrada', 'Camisa', 'A camisa principal do seu time é listrada?', doCampo('listrada')),
  sn('tricolor', 'Cores', 'O seu time tem três cores (é tricolor)?', (c) => (c.cores ? c.cores.length >= 3 : null)),
  sn('alvinegro', 'Cores', 'O seu time é alvinegro (só preto e branco)?',
    (c) => (c.cores ? c.cores.length === 2 && c.cores.includes('preto') && c.cores.includes('branco') : null)),
  sn('rubro-negro', 'Cores', 'O seu time é rubro-negro (vermelho e preto)?',
    (c) => (c.cores ? c.cores.includes('vermelho') && c.cores.includes('preto') : null)),
  sn('cor-vermelho', 'Cores', 'Tem vermelho nas cores do seu time?', temCor('vermelho')),
  sn('cor-verde', 'Cores', 'Tem verde nas cores do seu time?', temCor('verde')),
  sn('cor-azul', 'Cores', 'Tem azul (de qualquer tom) nas cores do seu time?', temCor('azul')),
  sn('cor-amarelo', 'Cores', 'Tem amarelo nas cores do seu time?', temCor('amarelo')),
  sn('cor-preto', 'Cores', 'Tem preto nas cores do seu time?', temCor('preto')),
  sn('cor-grena', 'Cores', 'O seu time usa grená (vinho)?', temCor('grena')),
];

// "O mascote é um leão?" etc., para mascotes que aparecem em mais de um clube.
const ARTIGO = { Águia: 'uma águia', Baleia: 'uma baleia', Macaca: 'uma macaca', Raposa: 'uma raposa' };
const contagem = {};
CLUBES_TORCIDA.forEach((c) => { if (c.mascote) contagem[c.mascote] = (contagem[c.mascote] || 0) + 1; });
Object.entries(contagem).filter(([, n]) => n >= 2).forEach(([m]) => {
  PERGUNTAS.push(sn(`mascote-${m}`, 'Mascote', `O mascote do seu time é ${ARTIGO[m] || `um ${m.toLowerCase()}`}?`,
    (c) => (c.mascote ? c.mascote === m : null)));
});

// Perguntas finais, montadas com os candidatos mais prováveis.
const DINAMICAS = [
  { campo: 'estadio', tag: 'Estádio', texto: 'Em qual destes estádios o seu time manda os jogos?' },
  { campo: 'idolo', tag: 'Ídolo', texto: 'Qual destes é um ídolo do seu time?' },
  { campo: 'apelido', tag: 'Apelido', texto: 'Qual destes apelidos é do seu time?' },
  { campo: 'rival', tag: 'Rivalidade', texto: 'Qual destes é o maior rival do seu time?' },
];

const PROB_CATEGORIA = 0.9;
const PROB_SN = 0.94;

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
  const notas = candidatas.map((q) => ({ q, h: entropiaEsperada(q, dist) })).sort((a, b) => a.h - b.h);
  if (hAtual - notas[0].h < 0.01) return null;
  // Um pouco de variedade entre perguntas quase tão boas quanto a melhor.
  const boas = notas.filter((n) => n.h <= notas[0].h + 0.08).slice(0, 3);
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

const DECADAS = Array.from({ length: 14 }, (_, i) => 1890 + i * 10);
const gauss = (d, s) => Math.exp(-((d / s) ** 2));

const ACOES_DIFICIL = [
  {
    id: 'mapa', tipo: 'cat', ui: 'mapa', tag: 'Mapa', texto: 'Toque no mapa: em que região fica a casa do seu time?',
    opcoes: [['N', 'Norte'], ['NE', 'Nordeste'], ['CO', 'Centro-Oeste'], ['SE', 'Sudeste'], ['S', 'Sul']],
    valor: (c) => REGIAO_UF[c.uf],
  },
  {
    id: 'camisa', tipo: 'cores', ui: 'cores', tag: 'Camisa', texto: 'Pinte a camisa: escolha as cores do seu time (até 3).',
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
    id: 'fundacao', tipo: 'slider', ui: 'ano', tag: 'História', texto: 'Arraste: em que época o seu time foi fundado?',
    passos: DECADAS.map((d) => `${d}`), rotulos: ['Século XIX', 'Anos 2020'], unidade: 'década de fundação',
    valor: (c) => c.fundacao,
    vero: (c, v) => (c.fundacao ? 0.08 + 0.92 * gauss(c.fundacao - (decadaDe(v) + 5), 14) : 1),
    conc: (c, v) => (c.fundacao ? gauss(c.fundacao - (decadaDe(v) + 5), 20) : null),
  },
  {
    id: 'tamanho-torcida', tipo: 'slider', ui: 'tamanho', tag: 'Torcida', texto: 'Arraste: qual é o tamanho da torcida do seu time?',
    rotulos: ['Pequena, todo mundo se conhece', 'Uma das maiores do país'],
    valor: (c) => c.massa,
    vero: (c, v) => 0.1 + 0.9 * gauss(c.massa - v * 100, 22),
    conc: (c, v) => gauss(c.massa - v * 100, 30),
  },
];

export const decadaDe = (v) => DECADAS[Math.round(v * (DECADAS.length - 1))];

const NUCLEO_DIFICIL = ['serie', 'mascote-tipo'];

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
  const fora = new Set(['regiao', 'cor-principal', ...NUCLEO_DIFICIL]);
  const resto = embaralhar(PERGUNTAS.filter((q) => !fora.has(q.id) && !q.id.startsWith('mascote-')));
  const n = TOTAL_DIFICIL - DINAMICAS_NO_FIM;
  return embaralhar([...nucleo, ...resto.slice(0, n - nucleo.length)]);
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
  const extras = embaralhar(PERGUNTAS.filter((q) => !feitas.has(q.id) && !q.id.startsWith('mascote-')));
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

export const clubePorId = (id) => CLUBES_TORCIDA.find((c) => c.id === id);
export { CLUBES_TORCIDA };
