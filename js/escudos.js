// Escudos em SVG desenhados a partir da silhueta, das cores e dos elementos característicos
// de cada brasão oficial (estrelas, anéis, cruz, coroa…). Letras e iniciais ficam de fora:
// os textos descritos em js/data/brasoes.js são ignorados no desenho. São desenhos
// estilizados, não as marcas registradas dos clubes. As descrições ficam em js/data/brasoes.js.
//
// Área: viewBox 0 -16 100 136. A silhueta ocupa x 0–100, y 0–120; a faixa y −16–0 fica para o
// que vem acima do escudo (estrelas, coroa, texto).

function engrenagem(cx = 50, cy = 60, rExt = 50, rInt = 42, dentes = 10) {
  const pts = [];
  for (let i = 0; i < dentes * 4; i++) {
    const a = (Math.PI * 2 * i) / (dentes * 4) - Math.PI / 2;
    const r = i % 4 < 2 ? rExt : rInt;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return `<polygon points="${pts.join(' ')}"/>`;
}

const FORMAS = {
  classico: '<path d="M4 2 H96 V60 C96 90 74 108 50 118 C26 108 4 90 4 60 Z"/>',
  cantos: '<path d="M16 2 H84 Q96 2 96 14 V60 C96 90 74 108 50 118 C26 108 4 90 4 60 V14 Q4 2 16 2 Z"/>',
  arredondado: '<path d="M6 2 H94 V66 C94 96 74 118 50 118 C26 118 6 96 6 66 Z"/>',
  triangular: '<path d="M2 2 H98 C96 46 78 88 50 118 C22 88 4 46 2 2 Z"/>',
  bico: '<path d="M4 2 H96 V76 L50 118 L4 76 Z"/>',
  lobulado: '<path d="M4 12 Q27 -4 50 10 Q73 -4 96 12 V60 C96 90 74 108 50 118 C26 108 4 90 4 60 Z"/>',
  redondo: '<circle cx="50" cy="60" r="48"/>',
  quadrado: '<path d="M18 6 H82 Q96 6 96 20 V84 Q96 110 50 118 Q4 110 4 84 V20 Q4 6 18 6 Z"/>',
  athletico: '<path d="M6 38 L94 4 L94 82 L54 118 L6 98 Z"/>',
  leque: '<path d="M2 26 L50 4 L98 26 L88 100 L12 100 Z"/>',
  engrenagem: engrenagem(),
  trevo: '<circle cx="50" cy="27" r="25"/><circle cx="25" cy="60" r="25"/><circle cx="75" cy="60" r="25"/><circle cx="50" cy="93" r="25"/><rect x="28" y="36" width="44" height="48"/>',
};


function estrela(cx, cy, r, cor) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 ? r * 0.42 : r;
    return `${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
  return `<polygon points="${pts}" fill="${cor}"/>`;
}

function faixas(cores, horizontal, n) {
  const qtd = n || (cores.length > 2 ? cores.length : 7);
  const tam = (horizontal ? 120 : 100) / qtd;
  return Array.from({ length: qtd }, (_, i) => {
    const cor = cores[i % cores.length];
    return horizontal
      ? `<rect x="0" y="${(i * tam).toFixed(2)}" width="100" height="${(tam + 0.4).toFixed(2)}" fill="${cor}"/>`
      : `<rect x="${(i * tam).toFixed(2)}" y="0" width="${(tam + 0.4).toFixed(2)}" height="120" fill="${cor}"/>`;
  }).join('');
}

function fundo(f) {
  const [a, b] = f.cores;
  switch (f.tipo) {
    case 'vertical': return faixas(f.cores, false, f.n);
    case 'horizontal': return faixas(f.cores, true, f.n);
    case 'diagonal': {
      const w = f.largura || 12;
      const listras = [];
      for (let x = -120, i = 0; x < 220; x += w, i++) listras.push(`<rect x="${x}" y="-60" width="${w + 0.4}" height="260" fill="${f.cores[i % f.cores.length]}"/>`);
      return `<g transform="rotate(${f.angulo ?? -35} 50 60)">${listras.join('')}</g>`;
    }
    case 'faixa':
      return `<rect width="100" height="120" fill="${a}"/><polygon points="0,10 0,36 100,104 100,78" fill="${b}"/>`;
    case 'xis':
      return `<rect width="100" height="120" fill="${a}"/><g stroke="${b}" stroke-width="20"><line x1="0" y1="0" x2="100" y2="120"/><line x1="100" y1="0" x2="0" y2="120"/></g>`;
    case 'metade':
      return `<rect width="50" height="120" fill="${a}"/><rect x="50" width="50" height="120" fill="${b}"/>`;
    case 'diagonal-metade':
      return `<rect width="100" height="120" fill="${b}"/><polygon points="0,0 100,0 0,120" fill="${a}"/>`;
    case 'liso':
    default:
      return `<rect width="100" height="120" fill="${a}"/>`;
  }
}


function ancora(x, y, s, cor) {
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${cor}" stroke-width="4" stroke-linecap="round">
    <circle cx="0" cy="-22" r="5"/><line x1="0" y1="-17" x2="0" y2="20"/><line x1="-12" y1="-8" x2="12" y2="-8"/>
    <path d="M-20 8 Q-18 24 0 22 Q18 24 20 8"/></g>`;
}

function elemento(e, id) {
  switch (e.t) {
    case 'texto':
      return '';
    case 'topo':
      return `<rect x="0" y="0" width="100" height="${e.alt}" fill="${e.cor}"/>`;
    case 'banda':
      return `<rect x="0" y="${e.y}" width="100" height="${e.h}" fill="${e.cor}"/>`;
    case 'faixa-texto':
      return `<g transform="rotate(${e.ang ?? -18} 50 ${e.y})"><rect x="-20" y="${e.y - e.h / 2}" width="140" height="${e.h}" fill="${e.cor}"/></g>`;
    case 'anel':
      return `<circle cx="50" cy="60" r="${e.r}" fill="none" stroke="${e.cor}" stroke-width="${e.larg}"/>
        ${e.txt ? `<circle cx="50" cy="60" r="${e.r}" fill="none" stroke="${e.corTxt}" stroke-width="1.2" stroke-dasharray="2 3" opacity="0.6"/>` : ''}`;
    case 'disco': {
      const clip = `${id}-d${Math.round(e.x ?? 50)}${Math.round(e.y ?? 60)}`;
      const listras = e.listras
        ? `<defs><clipPath id="${clip}"><circle cx="${e.x ?? 50}" cy="${e.y ?? 60}" r="${e.r}"/></clipPath></defs><g clip-path="url(#${clip})">${faixas(e.listras, e.horizontal, e.n)}</g>`
        : '';
      return `<circle cx="${e.x ?? 50}" cy="${e.y ?? 60}" r="${e.r}" fill="${e.cor || 'none'}" ${e.contorno ? `stroke="${e.contorno}" stroke-width="${e.borda ?? 3}"` : ''}/>${listras}`;
    }
    case 'oval':
      return `<ellipse cx="${e.x ?? 50}" cy="${e.y ?? 60}" rx="${e.rx}" ry="${e.ry}" fill="${e.cor}"/>`;
    case 'estrela':
      return estrela(e.x ?? 50, e.y ?? 60, e.r, e.cor);
    case 'cruzeiro':
      return [[50, 38, 7], [50, 84, 7], [32, 62, 6], [68, 58, 6], [60, 72, 4]].map(([x, y, r]) => estrela(x, y, r, e.cor)).join('');
    case 'cruz-patea': {
      const { x = 50, y = 60, r, cor } = e;
      const braco = (rot) => `<path d="M0 0 L${-r * 0.34} ${-r} L${r * 0.34} ${-r} Z" transform="translate(${x} ${y}) rotate(${rot})" fill="${cor}"/>`;
      return `${[0, 90, 180, 270].map(braco).join('')}<circle cx="${x}" cy="${y}" r="${r * 0.22}" fill="${cor}"/>`;
    }
    case 'cruz-latina': {
      const { x = 50, y = 60, h, w, cor, l = 9 } = e;
      return `<rect x="${x - l / 2}" y="${y - h / 2}" width="${l}" height="${h}" fill="${cor}"/><rect x="${x - w / 2}" y="${y - h / 2 + h * 0.24}" width="${w}" height="${l}" fill="${cor}"/>`;
    }
    case 'cruz-sg':
      return `<rect x="43" y="0" width="14" height="${e.ate ?? 120}" fill="${e.cor}"/><rect x="0" y="${e.y ?? 26}" width="100" height="14" fill="${e.cor}"/>`;
    case 'ancora':
      return ancora(e.x ?? 50, e.y ?? 64, e.s ?? 1, e.cor);
    case 'raio':
      return `<polyline points="58,30 40,62 56,62 38,96" fill="none" stroke="${e.cor}" stroke-width="5" stroke-linejoin="round"/>`;
    case 'bola':
      return `<circle cx="${e.x}" cy="${e.y}" r="${e.r}" fill="#ffffff" stroke="#111111" stroke-width="1.2"/>${estrela(e.x, e.y, e.r * 0.42, '#111111')}`;
    case 'poligono':
      return `<polygon points="${e.pts}" fill="${e.cor}"/>`;
    case 'contorno':
      return `<g fill="none" stroke="${e.cor}" stroke-width="${e.larg ?? 6}">${e.forma}</g>`;
    default:
      return '';
  }
}

function acima(spec) {
  const partes = [];
  const ests = spec.estrelas || [];
  const passo = 13;
  ests.forEach((cor, i) => partes.push(estrela(50 + (i - (ests.length - 1) / 2) * passo, -7, 5.5, cor)));
  if (spec.coroa) {
    partes.push(`<path d="M34 -2 L36 -14 L43 -7 L50 -15 L57 -7 L64 -14 L66 -2 Z" fill="${spec.coroa}"/>`);
  }
  return partes.join('');
}

// Converte o formato antigo [forma, padrão, cores] para o novo.
function normalizar(escudo) {
  if (!Array.isArray(escudo)) return escudo;
  const [forma, tipo, cores] = escudo;
  const t = { horizontal: 'horizontal', vertical: 'vertical', diagonal: 'diagonal', metade: 'metade', faixa: 'faixa' }[tipo] || 'liso';
  return { forma, fundo: { tipo: t, cores } };
}

let seq = 0;

export function escudoSVG(escudo, classe = 'escudo') {
  const spec = normalizar(escudo);
  const id = `esc${++seq}`;
  const forma = FORMAS[spec.forma] || FORMAS.classico;
  const borda = spec.borda || 'rgba(238,242,234,0.6)';
  const atras = (spec.atras || []).map((e) => elemento(e, id)).join('');
  const dentro = (spec.el || []).map((e) => elemento(e.t === 'contorno' ? { ...e, forma } : e, id)).join('');
  return `<svg class="${classe}" viewBox="0 -16 100 136" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs><clipPath id="${id}">${forma}</clipPath></defs>
    ${atras}
    <g fill="rgba(238,242,234,0.35)" stroke="rgba(238,242,234,0.35)" stroke-width="9">${forma}</g>
    <g fill="${borda}" stroke="${borda}" stroke-width="6">${forma}</g>
    <g clip-path="url(#${id})">${fundo(spec.fundo)}${dentro}</g>
    ${acima(spec)}
  </svg>`;
}
