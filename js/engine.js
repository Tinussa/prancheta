import { EIXOS } from './data/eixos.js';
import { TATICAS, SELECOES, TREINADOR, TIME, FORMACOES, ZONAS } from './data/perguntas.js';
import { CULTURA, CULTURA_TREINADOR, CULTURA_TIME } from './data/cultura.js';
import { TREINADORES } from './data/treinadores.js';
import { TIMES } from './data/times.js';

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export const TAMANHO = { curta: 15, completa: 30 };

const ACOES = ['formacao', 'zona', 'slider'];

function embaralhar(lista) {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// tema 'futebol': perguntas de tática e seleções. tema 'cultura': cultura pop e sociedade,
// traduzidas para os mesmos eixos de futebol.
export const TEMAS = {
  futebol: { nome: 'Futebol', desc: 'Situações de jogo, tática e seleções' },
  cultura: { nome: 'Cultura pop', desc: 'Música, cinema, arquitetura, cidade e sociedade' },
};

export function bancoDoModo(modo, tema = 'futebol') {
  const lista = tema === 'cultura'
    ? [...CULTURA, ...(modo === 'treinador' ? CULTURA_TREINADOR : CULTURA_TIME)]
    : [...TATICAS, ...SELECOES, ...(modo === 'treinador' ? TREINADOR : TIME)];
  return lista.filter((q) => !q.modos || q.modos.includes(modo));
}

// Núcleo fixo (cobre todos os eixos) + sorteio do resto do banco.
// A pergunta de região fica sempre por último; ações no campo não ficam coladas.
export function montarQuiz(modo, versao, tema = 'futebol') {
  const banco = bancoDoModo(modo, tema);
  const nucleo = banco.filter((q) => (q.nucleo || []).includes(modo));
  const resto = embaralhar(banco.filter((q) => !nucleo.includes(q)));
  const fim = nucleo.filter((q) => q.tipo === 'regiao');
  const lista = embaralhar([
    ...nucleo.filter((q) => q.tipo !== 'regiao'),
    ...resto.slice(0, TAMANHO[versao] - nucleo.length),
  ]);
  for (let i = 1; i < lista.length; i++) {
    if (ACOES.includes(lista[i].tipo) && ACOES.includes(lista[i - 1].tipo)) {
      const j = lista.findIndex((q, k) => k > i && !ACOES.includes(q.tipo));
      if (j > 0) [lista[i], lista[j]] = [lista[j], lista[i]];
    }
  }
  return [...lista, ...fim];
}

export const perfis = (modo) => (modo === 'treinador' ? TREINADORES : TIMES);

function opcoesDe(q) {
  if (q.tipo === 'formacao') return FORMACOES;
  if (q.tipo === 'zona') return ZONAS;
  return q.opcoes;
}

// Converte uma resposta em contribuição por eixo: { delta, max }.
// O vetor final é 50 + 50 × (soma dos deltas / soma dos máximos) em cada eixo.
export function avaliar(q, valor) {
  const delta = {};
  const max = {};
  if (q.tipo === 'escala' || q.tipo === 'slider') {
    const a = q.tipo === 'escala' ? valor : valor * 4 - 2;
    for (const [eixo, w] of Object.entries(q.eixos)) {
      delta[eixo] = a * w;
      max[eixo] = 2 * Math.abs(w);
    }
  } else if (q.tipo !== 'regiao') {
    const opcoes = opcoesDe(q);
    for (const op of opcoes) {
      for (const [eixo, v] of Object.entries(op.efeito)) max[eixo] = Math.max(max[eixo] || 0, Math.abs(v));
    }
    Object.assign(delta, opcoes[valor].efeito);
  }
  return { delta, max };
}

export function vetorUsuario(respostas, modo) {
  const S = {};
  const M = {};
  let regiao = null;
  for (const r of respostas) {
    if (!r) continue;
    if (r.regiao) regiao = r.regiao;
    for (const [k, v] of Object.entries(r.delta)) S[k] = (S[k] || 0) + v;
    for (const [k, v] of Object.entries(r.max)) M[k] = (M[k] || 0) + v;
  }
  const vet = {};
  const cobertura = {};
  for (const e of EIXOS[modo]) {
    const m = M[e.id] || 0;
    const x = m ? (S[e.id] || 0) / m : 0;
    // Expande levemente as respostas para longe do centro: muitas perguntas puxam a média para 50.
    vet[e.id] = Math.round(clamp(50 + 50 * Math.sign(x) * Math.abs(x) ** 0.8, 0, 100));
    cobertura[e.id] = m > 0;
  }
  return { vet, cobertura, regiao };
}

export function ranquear(modo, { vet, cobertura, regiao }) {
  const eixos = EIXOS[modo].filter((e) => cobertura[e.id]);
  return perfis(modo)
    .map((p) => {
      let num = 0;
      let den = 0;
      for (const e of eixos) {
        const d = vet[e.id] - p.eixos[e.id];
        num += e.peso * d * d;
        den += e.peso;
      }
      const dist = den ? Math.sqrt(num / den) : 50;
      let match = 100 - dist * 1.3;
      if (regiao && regiao !== 'qualquer' && p.regiao === regiao) match += 5;
      return { perfil: p, dist, match: Math.round(clamp(match, 1, 99)) };
    })
    .sort((a, b) => b.match - a.match || a.dist - b.dist);
}

// Resultado compartilhável em ?r=  →  t|c . valores em base 36 (2 dígitos) . região
const REG = ['qualquer', 'rj', 'sp', 'mg', 'sul', 'ne'];

export function codificar(modo, { vet, regiao }) {
  const vals = EIXOS[modo].map((e) => vet[e.id].toString(36).padStart(2, '0')).join('');
  return `${modo === 'treinador' ? 'c' : 't'}${vals}${Math.max(0, REG.indexOf(regiao || 'qualquer'))}`;
}

export function decodificar(code) {
  if (!code) return null;
  const modo = code[0] === 'c' ? 'treinador' : code[0] === 't' ? 'time' : null;
  if (!modo) return null;
  const eixos = EIXOS[modo];
  const corpo = code.slice(1);
  if (corpo.length < eixos.length * 2) return null;
  const vet = {};
  const cobertura = {};
  for (let i = 0; i < eixos.length; i++) {
    const v = parseInt(corpo.slice(i * 2, i * 2 + 2), 36);
    if (Number.isNaN(v) || v < 0 || v > 100) return null;
    vet[eixos[i].id] = v;
    cobertura[eixos[i].id] = true;
  }
  const regiao = REG[parseInt(corpo[eixos.length * 2], 10)] || 'qualquer';
  return { modo, vet, cobertura, regiao };
}
