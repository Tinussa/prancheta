// Brasões estilizados de cada clube, desenhados a partir do escudo oficial (silhueta, cores,
// iniciais, estrelas e símbolos característicos). Referência: imagens dos escudos nas páginas
// dos clubes na Wikipédia em português (consultadas em 02/11/2026). Não reproduzem as marcas.
//
// forma:  classico | cantos | arredondado | triangular | bico | lobulado | redondo | quadrado |
//         athletico | leque | engrenagem | trevo
// fundo:  { tipo: liso | vertical | horizontal | diagonal | faixa | xis | metade | diagonal-metade, cores, n? }
// el:     elementos dentro do escudo (ver js/escudos.js)
// estrelas / coroa / textoAcima: o que fica acima do escudo
// borda:  cor do contorno

const VM = '#d6202a';
const PT = '#111111';
const BR = '#ffffff';
const VD = '#00843d';
const AZ = '#1f4fa3';
const AM = '#f7d117';
const GR = '#7a0026';
const OURO = '#e8b923';
const PRATA = '#c4c4c4';

export const BRASOES = {
  // ---------------- Série A ----------------
  flamengo: {
    forma: 'classico', borda: PT, fundo: { tipo: 'horizontal', cores: ['#c8102e', PT], n: 7 },
    el: [{ t: 'texto', txt: 'CRF', x: 26, y: 22, tam: 15, cor: BR, contorno: PT }],
  },
  palmeiras: {
    forma: 'redondo', borda: BR, fundo: { tipo: 'liso', cores: ['#006437'] }, estrelas: [VM],
    el: [
      { t: 'anel', r: 42, cor: BR, larg: 2 },
      { t: 'disco', x: 50, y: 44, r: 19, cor: BR },
      { t: 'texto', txt: 'P', y: 54, tam: 28, cor: '#006437' },
      { t: 'texto', txt: 'PALMEIRAS', y: 86, tam: 13, cor: BR },
    ],
  },
  corinthians: {
    forma: 'redondo', borda: PT, fundo: { tipo: 'liso', cores: [BR] },
    atras: [
      { t: 'poligono', pts: '8,0 14,-6 72,96 66,102', cor: VM },
      { t: 'poligono', pts: '92,0 86,-6 28,96 34,102', cor: VM },
      { t: 'ancora', x: 50, y: 99, s: 0.9, cor: VM },
    ],
    el: [
      { t: 'anel', r: 42, cor: PT, larg: 11, txt: 'CORINTHIANS PAULISTA', corTxt: BR },
      { t: 'disco', r: 22, cor: BR, listras: [PT, BR], horizontal: true, n: 9 },
      { t: 'texto', txt: 'SCCP', y: 64, tam: 11, cor: VM, contorno: BR, borda: 2 },
    ],
  },
  saopaulo: {
    forma: 'triangular', borda: PT, fundo: { tipo: 'vertical', cores: ['#e4002b', BR, PT] },
    el: [{ t: 'topo', alt: 30, cor: PT, txt: 'SPFC', corTxt: BR, tam: 21 }],
  },
  santos: {
    forma: 'lobulado', borda: PT, fundo: { tipo: 'vertical', cores: [BR, PT], n: 7 }, coroa: OURO,
    el: [{ t: 'topo', alt: 36, cor: BR, txt: 'S.F.C.', corTxt: PT, tam: 17 }],
  },
  vasco: {
    forma: 'classico', borda: BR, fundo: { tipo: 'faixa', cores: [PT, BR] },
    el: [
      { t: 'disco', x: 24, y: 16, r: 11, cor: BR },
      { t: 'cruz-patea', x: 24, y: 16, r: 9, cor: '#d81e2b' },
      { t: 'poligono', pts: '38,62 62,62 58,70 42,70', cor: PT },
    ],
  },
  fluminense: {
    forma: 'lobulado', borda: BR, fundo: { tipo: 'horizontal', cores: ['#7a0026', BR, '#00613c'] },
    el: [{ t: 'texto', txt: 'FFC', y: 72, tam: 30, cor: BR, contorno: '#00613c', borda: 2 }],
  },
  botafogo: {
    forma: 'cantos', borda: BR, fundo: { tipo: 'liso', cores: [PT] },
    el: [{ t: 'estrela', x: 50, y: 56, r: 28, cor: BR }],
  },
  cruzeiro: {
    forma: 'redondo', borda: BR, fundo: { tipo: 'liso', cores: ['#0033a0'] },
    el: [
      { t: 'anel', r: 42, cor: '#0033a0', larg: 11, txt: 'CRUZEIRO ESPORTE CLUBE', corTxt: BR },
      { t: 'disco', r: 34, contorno: BR, borda: 2 },
      { t: 'cruzeiro', cor: BR },
    ],
  },
  atletico: {
    forma: 'classico', borda: BR, fundo: { tipo: 'vertical', cores: [PT, BR], n: 7 }, estrelas: [OURO],
    el: [{ t: 'topo', alt: 30, cor: BR, txt: 'CAM', corTxt: PT, tam: 20 }, { t: 'contorno', cor: PT, larg: 4 }],
  },
  gremio: {
    forma: 'redondo', borda: PT, fundo: { tipo: 'vertical', cores: ['#0d80bf', PT, BR], n: 9 },
    estrelas: [OURO, PRATA, OURO],
    el: [
      { t: 'banda', y: 50, h: 22, cor: BR, txt: 'GRÊMIO', corTxt: PT, tam: 16 },
      { t: 'texto', txt: '1903', y: 40, tam: 9, cor: BR, contorno: PT },
      { t: 'texto', txt: 'FBPA', y: 86, tam: 9, cor: BR, contorno: PT },
    ],
  },
  inter: {
    forma: 'redondo', borda: BR, fundo: { tipo: 'liso', cores: ['#e30613'] },
    el: [
      { t: 'anel', r: 42, cor: '#e30613', larg: 11, txt: 'S.C. INTERNACIONAL', corTxt: BR },
      { t: 'disco', r: 34, contorno: BR, borda: 2 },
      { t: 'texto', txt: 'SCI', y: 70, tam: 28, cor: BR },
    ],
  },
  athletico: {
    forma: 'athletico', borda: PT, fundo: { tipo: 'diagonal', cores: ['#c8102e', PT], angulo: -32, largura: 13 },
    textoAcima: { txt: 'CAP', cor: '#eef2ea', tam: 13, x: 22 },
  },
  coritiba: {
    forma: 'redondo', borda: BR, fundo: { tipo: 'liso', cores: ['#00543c'] }, estrelas: [OURO],
    el: [
      { t: 'anel', r: 42, cor: '#00543c', larg: 11, txt: 'CORITIBA FOOT BALL CLUB', corTxt: BR },
      { t: 'disco', r: 34, contorno: BR, borda: 2 },
      { t: 'texto', txt: 'CFC', y: 69, tam: 25, cor: BR },
    ],
  },
  chapecoense: {
    forma: 'redondo', borda: BR, fundo: { tipo: 'liso', cores: [VD] }, estrelas: [PRATA],
    el: [
      { t: 'anel', r: 42, cor: VD, larg: 11, txt: 'ASSOCIAÇÃO CHAPECOENSE DE FUTEBOL', corTxt: BR },
      { t: 'texto', txt: 'ACF', y: 70, tam: 28, cor: BR },
    ],
  },
  bahia: {
    forma: 'redondo', borda: BR, fundo: { tipo: 'liso', cores: [BR] }, estrelas: [OURO, OURO],
    el: [
      { t: 'anel', r: 42, cor: '#0055a4', larg: 12, txt: 'ESPORTE CLUBE BAHIA', corTxt: BR },
      { t: 'disco', r: 25, cor: BR, listras: ['#0055a4', BR, '#e30613', BR, '#0055a4'] },
      { t: 'texto', txt: '1931', y: 95, tam: 8, cor: '#0055a4' },
    ],
  },
  vitoria: {
    forma: 'lobulado', borda: PT, fundo: { tipo: 'horizontal', cores: ['#e30613', PT], n: 7 }, estrelas: [OURO],
    el: [{ t: 'texto', txt: 'ECV', y: 66, tam: 26, cor: BR, contorno: PT, borda: 2 }],
  },
  remo: {
    forma: 'quadrado', borda: BR, fundo: { tipo: 'liso', cores: ['#002b5c'] },
    el: [{ t: 'disco', x: 50, y: 62, r: 32, contorno: BR, borda: 4 }, { t: 'texto', txt: 'CR', y: 76, tam: 36, cor: BR }],
  },
  bragantino: {
    forma: 'arredondado', borda: '#d6001c', fundo: { tipo: 'liso', cores: [BR] },
    el: [
      { t: 'texto', txt: 'RED BULL', y: 24, tam: 13, cor: '#d6001c' },
      { t: 'disco', x: 50, y: 56, r: 15, cor: AM },
      { t: 'poligono', pts: '6,62 30,44 42,60 20,74', cor: '#d6001c' },
      { t: 'poligono', pts: '94,62 70,44 58,60 80,74', cor: '#d6001c' },
      { t: 'texto', txt: 'BRAGANTINO', y: 96, tam: 10, cor: '#d6001c' },
    ],
  },
  mirassol: {
    forma: 'redondo', borda: '#006b3f', fundo: { tipo: 'liso', cores: [AM] }, estrelas: ['#2e9b5f', '#2e9b5f', '#2e9b5f'],
    el: [
      { t: 'anel', r: 42, cor: '#006b3f', larg: 3 },
      { t: 'texto', txt: 'MFC', y: 68, tam: 28, cor: '#006b3f' },
      { t: 'texto', txt: 'MIRASSOL', y: 92, tam: 9, cor: '#006b3f' },
    ],
  },

  // ---------------- Série B ----------------
  'america-mg': {
    forma: 'classico', borda: VD, fundo: { tipo: 'liso', cores: [BR] },
    el: [{ t: 'contorno', cor: VD, larg: 8 }, { t: 'texto', txt: 'AFC', y: 68, tam: 30, cor: VD }],
  },
  'athletic-mg': {
    forma: 'classico', borda: PT, fundo: { tipo: 'vertical', cores: [PT, BR], n: 7 },
    el: [{ t: 'topo', alt: 30, cor: BR, txt: 'ATHLETIC', corTxt: PT, tam: 12 }],
  },
  'atletico-go': {
    forma: 'bico', borda: PT, fundo: { tipo: 'vertical', cores: [VM, PT, VM, PT, VM] },
    el: [{ t: 'texto', txt: 'ACG', y: 58, tam: 28, cor: BR, contorno: PT, borda: 2 }],
  },
  avai: {
    forma: 'classico', borda: '#1f5fbf', fundo: { tipo: 'vertical', cores: ['#1f5fbf', BR], n: 7 }, estrelas: [OURO],
    el: [{ t: 'topo', alt: 28, cor: BR, txt: 'AVAÍ F.C.', corTxt: '#1f5fbf', tam: 13 }],
  },
  'botafogo-sp': {
    forma: 'classico', borda: PT, fundo: { tipo: 'vertical', cores: [VM, BR, PT, BR, VM] }, estrelas: [OURO],
    el: [{ t: 'topo', alt: 30, cor: BR, txt: 'B.F.C.', corTxt: PT, tam: 16 }],
  },
  ceara: {
    forma: 'classico', borda: BR, fundo: { tipo: 'vertical', cores: [PT, BR], n: 7 },
    el: [{ t: 'faixa-texto', y: 30, h: 22, ang: -16, cor: PT, txt: 'CEARÁ', corTxt: BR, tam: 16 }],
  },
  crb: {
    forma: 'arredondado', borda: VM, fundo: { tipo: 'liso', cores: [BR] },
    el: [{ t: 'cruz-sg', cor: VM, ate: 52, y: 18 }, { t: 'texto', txt: 'CRB', y: 92, tam: 32, cor: VM }],
  },
  criciuma: {
    forma: 'leque', borda: PT, fundo: { tipo: 'diagonal', cores: [AM, PT], angulo: 30, largura: 14 }, estrelas: [OURO, OURO, OURO],
    el: [{ t: 'banda', y: 80, h: 22, cor: PT, txt: 'CRICIÚMA', corTxt: AM, tam: 13 }],
  },
  cuiaba: {
    forma: 'bico', borda: '#006b3f', fundo: { tipo: 'horizontal', cores: [AM, '#006b3f'], n: 2 }, estrelas: ['#2e9b5f', '#2e9b5f'],
    el: [{ t: 'texto', txt: 'CUIABÁ', y: 54, tam: 16, cor: '#006b3f' }],
  },
  fortaleza: {
    forma: 'bico', borda: '#0057b8', fundo: { tipo: 'diagonal-metade', cores: ['#e30613', '#0057b8'] }, estrelas: [OURO],
    el: [{ t: 'topo', alt: 28, cor: BR, txt: 'FORTALEZA', corTxt: '#0057b8', tam: 12 }],
  },
  goias: {
    forma: 'redondo', borda: BR, fundo: { tipo: 'liso', cores: [VD] },
    el: [{ t: 'anel', r: 42, cor: VD, larg: 11, txt: 'GOIÁS ESPORTE CLUBE', corTxt: BR }, { t: 'texto', txt: 'G', y: 80, tam: 52, cor: BR }],
  },
  juventude: {
    forma: 'redondo', borda: BR, fundo: { tipo: 'liso', cores: [VD] }, estrelas: [OURO, OURO],
    el: [
      { t: 'texto', txt: 'E.C.', y: 34, tam: 11, cor: BR },
      { t: 'faixa-texto', y: 62, h: 24, ang: -18, cor: BR, txt: 'JUVENTUDE', corTxt: VD, tam: 14 },
      { t: 'texto', txt: '1913', y: 96, tam: 10, cor: BR },
    ],
  },
  londrina: {
    forma: 'classico', borda: BR, fundo: { tipo: 'liso', cores: ['#4fa3e0'] },
    el: [{ t: 'texto', txt: 'LONDRINA', y: 30, tam: 14, cor: BR }, { t: 'texto', txt: 'E C', y: 76, tam: 22, cor: BR }],
  },
  nautico: {
    forma: 'redondo', borda: VM, fundo: { tipo: 'vertical', cores: [VM, BR], n: 9 },
    el: [
      { t: 'anel', r: 44, cor: VM, larg: 8 },
      { t: 'texto', txt: 'CNC', y: 66, tam: 26, cor: BR, contorno: VM, borda: 2.5 },
      { t: 'banda', y: 88, h: 16, cor: VM, txt: '1901', corTxt: BR, tam: 11 },
    ],
  },
  novorizontino: {
    forma: 'quadrado', borda: PT, fundo: { tipo: 'vertical', cores: [PT, AM], n: 7 },
    el: [{ t: 'faixa-texto', y: 40, h: 18, ang: -14, cor: BR, txt: 'NOVORIZONTINO', corTxt: PT, tam: 10 }],
  },
  'operario-pr': {
    forma: 'redondo', borda: PT, fundo: { tipo: 'liso', cores: [BR] },
    el: [
      { t: 'anel', r: 42, cor: PT, larg: 11, txt: 'OPERÁRIO FERROVIÁRIO', corTxt: BR },
      { t: 'disco', r: 30, cor: BR, listras: [PT, BR], n: 9 },
      { t: 'banda', y: 54, h: 16, cor: BR, txt: 'O.F.E.C.', corTxt: PT, tam: 11 },
    ],
  },
  'ponte-preta': {
    forma: 'classico', borda: BR, fundo: { tipo: 'vertical', cores: [PT, BR], n: 7 },
    textoAcima: { txt: '11.08.1900', cor: '#eef2ea', tam: 10 },
    el: [{ t: 'banda', y: 50, h: 20, cor: BR, txt: 'AAPP', corTxt: PT, tam: 16 }, { t: 'contorno', cor: PT, larg: 4 }],
  },
  'sao-bernardo': {
    forma: 'quadrado', borda: AM, fundo: { tipo: 'liso', cores: [PT] },
    el: [
      { t: 'poligono', pts: '54,30 90,24 92,80 60,88 50,60', cor: AM },
      { t: 'bola', x: 34, y: 54, r: 16 },
      { t: 'texto', txt: 'SÃO BERNARDO', y: 104, tam: 8, cor: AM },
    ],
  },
  sport: {
    forma: 'classico', borda: PT, fundo: { tipo: 'diagonal', cores: ['#e30613', PT], angulo: 30, largura: 12 },
    estrelas: [OURO, BR, OURO],
  },
  'vila-nova': {
    forma: 'classico', borda: BR, fundo: { tipo: 'liso', cores: [VM] },
    el: [{ t: 'contorno', cor: BR, larg: 5 }, { t: 'texto', txt: 'VILA NOVA', y: 52, tam: 14, cor: BR, rot: -14 }, { t: 'texto', txt: 'F.C.', y: 70, tam: 12, cor: BR, rot: -14 }],
  },

  // ---------------- Série C ----------------
  amazonas: {
    forma: 'arredondado', borda: AM, fundo: { tipo: 'liso', cores: [PT] }, estrelas: [OURO, OURO, OURO],
    el: [
      { t: 'texto', txt: 'AMAZONAS', y: 26, tam: 13, cor: AM },
      { t: 'disco', x: 50, y: 68, r: 24, cor: AM },
      { t: 'disco', x: 42, y: 62, r: 3, cor: PT }, { t: 'disco', x: 58, y: 62, r: 3, cor: PT },
      { t: 'disco', x: 50, y: 76, r: 4, cor: PT }, { t: 'disco', x: 36, y: 76, r: 2.5, cor: PT }, { t: 'disco', x: 64, y: 76, r: 2.5, cor: PT },
    ],
  },
  anapolis: {
    forma: 'classico', borda: PT, fundo: { tipo: 'vertical', cores: [PT, BR], n: 7 }, estrelas: [OURO, PRATA],
    el: [{ t: 'topo', alt: 30, cor: BR, txt: 'A.F.C.', corTxt: VM, tam: 16 }],
  },
  'barra-sc': {
    forma: 'classico', fundo: { tipo: 'liso', cores: ['#4a5a52'] },
    el: [{ t: 'texto', txt: 'BARRA', y: 66, tam: 18, cor: BR }],
  },
  'botafogo-pb': {
    forma: 'classico', borda: BR, fundo: { tipo: 'liso', cores: [PT] },
    el: [{ t: 'estrela', x: 50, y: 56, r: 28, cor: VM }],
  },
  brusque: {
    forma: 'classico', borda: PT, fundo: { tipo: 'vertical', cores: [VD, AM, VM, AM, VM] }, estrelas: [OURO, OURO, OURO],
    el: [{ t: 'topo', alt: 30, cor: AM, txt: 'BRUSQUE', corTxt: PT, tam: 14 }],
  },
  caxias: {
    forma: 'engrenagem', borda: BR, fundo: { tipo: 'liso', cores: [GR] },
    el: [
      { t: 'disco', x: 50, y: 60, r: 30, cor: GR, contorno: BR, borda: 2 },
      { t: 'texto', txt: 'S.E.R.', y: 46, tam: 11, cor: BR },
      { t: 'banda', y: 52, h: 18, cor: AZ, txt: 'CAXIAS', corTxt: BR, tam: 14 },
      { t: 'texto', txt: 'DO SUL', y: 84, tam: 10, cor: BR },
    ],
  },
  ferroviaria: {
    forma: 'redondo', borda: BR, fundo: { tipo: 'liso', cores: [GR] }, estrelas: ['#a3103a', '#a3103a', '#a3103a'],
    el: [{ t: 'anel', r: 42, cor: BR, larg: 2 }, { t: 'texto', txt: 'AFE', y: 72, tam: 32, cor: BR }],
  },
  figueirense: {
    forma: 'lobulado', borda: PT, fundo: { tipo: 'vertical', cores: [PT, BR], n: 7 },
    el: [{ t: 'disco', x: 50, y: 40, r: 16, cor: BR, contorno: PT, borda: 2 }, { t: 'texto', txt: 'FFC', y: 44, tam: 11, cor: PT }],
  },
  floresta: {
    forma: 'arredondado', borda: BR, fundo: { tipo: 'liso', cores: [VD] },
    el: [{ t: 'banda', y: 34, h: 20, cor: BR, txt: 'FLORESTA', corTxt: VD, tam: 14 }],
  },
  guarani: {
    forma: 'redondo', borda: BR, fundo: { tipo: 'liso', cores: [VD] }, estrelas: [OURO, PRATA],
    el: [{ t: 'anel', r: 42, cor: VD, larg: 11, txt: 'GUARANI FUTEBOL CLUBE', corTxt: BR }, { t: 'disco', r: 34, contorno: BR, borda: 2 }, { t: 'texto', txt: 'GFC', y: 70, tam: 26, cor: BR }],
  },
  'inter-limeira': {
    forma: 'arredondado', borda: PT, fundo: { tipo: 'liso', cores: [BR] }, estrelas: [PRATA, OURO, PRATA],
    el: [
      { t: 'bola', x: 30, y: 30, r: 11 },
      { t: 'faixa-texto', y: 58, h: 18, ang: -22, cor: PT, txt: 'INTERNACIONAL', corTxt: BR, tam: 10 },
      { t: 'texto', txt: 'LIMEIRA', y: 98, tam: 10, cor: PT },
    ],
  },
  itabaiana: {
    forma: 'classico', borda: AZ, fundo: { tipo: 'liso', cores: [BR] }, estrelas: [OURO, VM, OURO],
    el: [{ t: 'contorno', cor: AZ, larg: 6 }, { t: 'disco', x: 50, y: 56, r: 26, contorno: VM, borda: 4 }, { t: 'texto', txt: 'A', y: 74, tam: 46, cor: AZ }],
  },
  ituano: {
    forma: 'classico', borda: PT, fundo: { tipo: 'vertical', cores: [VM, PT], n: 7 }, estrelas: [OURO, OURO],
    el: [{ t: 'faixa-texto', y: 34, h: 20, ang: -14, cor: PT, txt: 'ITUANO', corTxt: BR, tam: 15 }, { t: 'bola', x: 28, y: 14, r: 9 }],
  },
  maranhao: {
    forma: 'classico', borda: VM, fundo: { tipo: 'vertical', cores: [VM, AZ, VM, AZ, VM] },
    el: [{ t: 'topo', alt: 30, cor: AZ, txt: 'MAC', corTxt: BR, tam: 20 }],
  },
  maringa: {
    forma: 'classico', fundo: { tipo: 'liso', cores: ['#4a5a52'] },
    el: [{ t: 'texto', txt: 'MFC', y: 68, tam: 26, cor: BR }],
  },
  paysandu: {
    forma: 'classico', borda: BR, fundo: { tipo: 'liso', cores: ['#4fa8e0'] }, estrelas: [BR, OURO, BR],
    el: [{ t: 'texto', txt: 'PSC', y: 64, tam: 30, cor: BR }],
  },
  'santa-cruz': {
    forma: 'cantos', borda: PT, fundo: { tipo: 'vertical', cores: [PT, BR, VM] },
    el: [{ t: 'texto', txt: 'SCFC', y: 66, tam: 20, cor: BR, contorno: PT, borda: 2.5 }],
  },
  'volta-redonda': {
    forma: 'classico', borda: BR, fundo: { tipo: 'liso', cores: [PT] }, estrelas: [OURO, OURO],
    el: [{ t: 'texto', txt: 'VRFC', y: 26, tam: 17, cor: BR }, { t: 'raio', cor: AM }],
  },
  'ypiranga-rs': {
    forma: 'classico', borda: VD, fundo: { tipo: 'horizontal', cores: [AM, VD], n: 2 },
    el: [{ t: 'texto', txt: 'YFC', y: 66, tam: 26, cor: VD, contorno: AM, borda: 2 }],
  },
  confianca: {
    forma: 'redondo', borda: BR, fundo: { tipo: 'liso', cores: [BR] },
    el: [{ t: 'anel', r: 42, cor: AZ, larg: 12, txt: 'ASSOCIAÇÃO DESPORTIVA CONFIANÇA', corTxt: BR }, { t: 'texto', txt: 'ADC', y: 70, tam: 26, cor: AZ }],
  },

  // ---------------- Tradicionais da Série D ----------------
  abc: {
    forma: 'quadrado', borda: BR, fundo: { tipo: 'liso', cores: [PT] }, estrelas: [OURO],
    el: [{ t: 'texto', txt: 'ABC F.C.', y: 66, tam: 17, cor: BR, rot: -16 }, { t: 'estrela', x: 74, y: 92, r: 6, cor: OURO }],
  },
  'america-rn': {
    forma: 'redondo', borda: BR, fundo: { tipo: 'liso', cores: [BR] }, estrelas: [OURO, OURO],
    el: [{ t: 'anel', r: 42, cor: VM, larg: 12, txt: 'AMÉRICA FUTEBOL CLUBE', corTxt: BR }, { t: 'texto', txt: 'AFC', y: 70, tam: 26, cor: VM }],
  },
  treze: {
    forma: 'arredondado', borda: PT, fundo: { tipo: 'liso', cores: [BR] },
    el: [{ t: 'banda', y: 22, h: 18, cor: PT, txt: 'TREZE', corTxt: BR, tam: 13 }, { t: 'texto', txt: 'FC', y: 84, tam: 34, cor: PT }],
  },
  'sampaio-correa': {
    forma: 'classico', borda: PT, fundo: { tipo: 'vertical', cores: [VD, VM], n: 7 }, estrelas: [OURO, VM, VM, OURO],
    el: [{ t: 'topo', alt: 30, cor: AM, txt: 'SCFC', corTxt: VM, tam: 17 }],
  },
  'moto-club': {
    forma: 'redondo', borda: PT, fundo: { tipo: 'liso', cores: [VM] },
    el: [{ t: 'cruz-patea', x: 50, y: 60, r: 40, cor: PT }, { t: 'disco', x: 50, y: 60, r: 13, cor: BR, contorno: PT, borda: 2 }],
  },
  'tuna-luso': {
    forma: 'trevo', borda: VD, fundo: { tipo: 'liso', cores: [BR] },
    el: [
      { t: 'cruz-patea', x: 50, y: 60, r: 18, cor: VM },
      { t: 'texto', txt: 'L', x: 50, y: 32, tam: 15, cor: VD },
      { t: 'texto', txt: 'T', x: 22, y: 66, tam: 15, cor: VD },
      { t: 'texto', txt: 'B', x: 78, y: 66, tam: 15, cor: VD },
      { t: 'texto', txt: '1903', x: 50, y: 100, tam: 11, cor: VD },
    ],
  },
  csa: {
    forma: 'classico', borda: AZ, fundo: { tipo: 'diagonal', cores: [BR, AZ], angulo: -24, largura: 10 }, estrelas: [OURO],
    el: [{ t: 'disco', x: 30, y: 26, r: 14, cor: BR, contorno: AZ, borda: 2 }, { t: 'texto', txt: 'CSA', x: 30, y: 30, tam: 9, cor: AZ }],
  },
  asa: {
    forma: 'redondo', borda: PT, fundo: { tipo: 'liso', cores: [BR] },
    el: [
      { t: 'anel', r: 42, cor: PT, larg: 12, txt: 'AGREMIAÇÃO SPORTIVA ARAPIRAQUENSE', corTxt: BR },
      { t: 'disco', r: 28, cor: BR, listras: [PT, BR], n: 9 },
      { t: 'banda', y: 52, h: 16, cor: BR, txt: 'ASA', corTxt: PT, tam: 13 },
    ],
  },
  ferroviario: {
    forma: 'classico', borda: PT, fundo: { tipo: 'vertical', cores: [VM, PT, BR, PT, VM] },
    el: [{ t: 'texto', txt: 'FAC', y: 66, tam: 24, cor: BR, contorno: PT, borda: 2 }],
  },
  brasiliense: {
    forma: 'arredondado', borda: VD, fundo: { tipo: 'liso', cores: [AM] },
    el: [
      { t: 'topo', alt: 22, cor: VD, txt: 'BRASILIENSE', corTxt: AM, tam: 10 },
      { t: 'oval', x: 46, y: 62, rx: 24, ry: 14, cor: VD },
      { t: 'bola', x: 62, y: 92, r: 10 },
    ],
  },
  gama: {
    forma: 'classico', borda: BR, fundo: { tipo: 'vertical', cores: [VD, '#0a6b33'], n: 7 }, estrelas: [OURO],
    el: [{ t: 'topo', alt: 26, cor: BR, txt: 'GAMA', corTxt: VD, tam: 15 }, { t: 'bola', x: 50, y: 66, r: 18 }],
  },
  joinville: {
    forma: 'cantos', borda: PT, fundo: { tipo: 'horizontal', cores: [BR, BR, BR, VM, PT, VM, PT] }, estrelas: [OURO, OURO],
    el: [{ t: 'texto', txt: 'JEC', y: 48, tam: 26, cor: VM, contorno: PT, borda: 1.5 }],
  },
  'brasil-pelotas': {
    forma: 'cantos', borda: BR, fundo: { tipo: 'horizontal', cores: [VM, PT], n: 7 }, estrelas: [PRATA],
    el: [{ t: 'disco', x: 50, y: 60, r: 18, cor: PT, contorno: BR, borda: 2.5 }, { t: 'texto', txt: 'GEB', y: 65, tam: 13, cor: BR }],
  },
  portuguesa: {
    forma: 'classico', borda: VM, fundo: { tipo: 'liso', cores: [BR] },
    el: [{ t: 'contorno', cor: VD, larg: 5 }, { t: 'cruz-latina', x: 50, y: 62, h: 74, w: 50, l: 12, cor: VD }],
  },
  'xv-piracicaba': {
    forma: 'redondo', borda: PT, fundo: { tipo: 'liso', cores: [BR] },
    el: [{ t: 'anel', r: 44, cor: PT, larg: 7 }, { t: 'texto', txt: 'XV', y: 80, tam: 48, cor: PT }],
  },
  noroeste: {
    forma: 'classico', borda: VM, fundo: { tipo: 'vertical', cores: [VM, BR], n: 7 },
    textoAcima: { txt: 'BAURU', cor: '#ff6a5c', tam: 10 },
    el: [{ t: 'disco', x: 50, y: 56, r: 20, cor: BR, contorno: VM, borda: 2 }, { t: 'texto', txt: 'ECN', y: 61, tam: 13, cor: VM }],
  },
  'america-rj': {
    forma: 'redondo', borda: BR, fundo: { tipo: 'liso', cores: [BR] },
    el: [{ t: 'anel', r: 44, cor: VM, larg: 8 }, { t: 'texto', txt: 'AFC', y: 74, tam: 36, cor: VM }],
  },
  madureira: {
    forma: 'classico', borda: AM, fundo: { tipo: 'liso', cores: [AZ] },
    el: [{ t: 'disco', x: 50, y: 58, r: 28, cor: AM, contorno: VM, borda: 4 }, { t: 'texto', txt: 'MEC', y: 66, tam: 20, cor: AZ }],
  },
  'rio-branco-es': {
    forma: 'quadrado', borda: BR, fundo: { tipo: 'liso', cores: [PT] },
    el: [{ t: 'disco', x: 50, y: 62, r: 30, cor: BR }, { t: 'texto', txt: 'RBAC', y: 68, tam: 16, cor: PT }],
  },
  sergipe: {
    forma: 'classico', borda: VM, fundo: { tipo: 'liso', cores: [BR] }, estrelas: [VM, VM, VM],
    el: [{ t: 'ancora', x: 50, y: 60, s: 1.4, cor: VM }, { t: 'texto', txt: 'CSS', y: 104, tam: 11, cor: VM }],
  },
  uberlandia: {
    forma: 'classico', borda: VD, fundo: { tipo: 'vertical', cores: [VD, BR], n: 7 }, estrelas: [OURO],
    el: [{ t: 'topo', alt: 28, cor: BR, txt: 'U.E.C.', corTxt: VD, tam: 15 }],
  },

  // ---------------- Só nos times históricos ----------------
  bangu: {
    forma: 'classico', borda: VM, fundo: { tipo: 'diagonal', cores: [BR, VM], angulo: -35, largura: 10 },
    el: [{ t: 'disco', x: 50, y: 52, r: 20, cor: BR, contorno: VM, borda: 2 }, { t: 'texto', txt: 'BAC', y: 57, tam: 13, cor: VM }],
  },
  saocaetano: {
    forma: 'arredondado', borda: AM, fundo: { tipo: 'liso', cores: [AZ] }, estrelas: [OURO, OURO, OURO],
    el: [
      { t: 'banda', y: 18, h: 16, cor: AM, txt: 'SÃO CAETANO', corTxt: AZ, tam: 9 },
      { t: 'oval', x: 50, y: 70, rx: 30, ry: 24, cor: AM },
      { t: 'oval', x: 50, y: 70, rx: 21, ry: 16, cor: VD },
    ],
  },
  santoandre: {
    forma: 'classico', borda: VD, fundo: { tipo: 'xis', cores: [AM, VD] }, coroa: PRATA,
  },
  paulista: {
    forma: 'classico', borda: PT, fundo: { tipo: 'diagonal', cores: [BR, PT, VM], angulo: -35, largura: 9 }, estrelas: [OURO],
    el: [{ t: 'banda', y: 20, h: 18, cor: VM, txt: 'PAULISTA', corTxt: BR, tam: 13 }],
  },
};
