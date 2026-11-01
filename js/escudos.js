// Escudos estilizados em SVG: silhueta do escudo original + cores e padrão do uniforme.
// viewBox 0 0 100 120 para todas as silhuetas.

const SILHUETAS = {
  classico: 'M4 4 H96 V58 C96 88 74 106 50 117 C26 106 4 88 4 58 Z',
  arredondado: 'M6 4 H94 V64 C94 92 74 116 50 116 C26 116 6 92 6 64 Z',
  triangular: 'M2 4 H98 C97 44 78 86 50 117 C22 86 3 44 2 4 Z',
  pentagono: 'M12 4 H88 L98 48 L50 117 L2 48 Z',
  redondo: 'M50 12 A48 48 0 1 1 49.99 12 Z',
};

let seq = 0;

function faixas(cores, horizontal, de = 0, ate = 120) {
  const n = cores.length > 2 ? cores.length : 7;
  const tam = ((horizontal ? ate - de : 100) / n);
  return Array.from({ length: n }, (_, i) => {
    const cor = cores[i % cores.length];
    return horizontal
      ? `<rect x="0" y="${de + i * tam}" width="100" height="${tam + 0.5}" fill="${cor}"/>`
      : `<rect x="${i * tam}" y="${de}" width="${tam + 0.5}" height="${ate - de}" fill="${cor}"/>`;
  }).join('');
}

function estrela(cx, cy, r, cor) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 ? r * 0.42 : r;
    return `${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
  return `<polygon points="${pts}" fill="${cor}"/>`;
}

function padrao(tipo, cores) {
  const [a, b, c] = cores;
  switch (tipo) {
    case 'horizontal': return faixas(cores, true);
    case 'vertical': return faixas(cores, false);
    case 'vertical-topo':
      return `<rect width="100" height="120" fill="${a}"/>${faixas([b, a, b, a, b], false, 34, 120)}`;
    case 'diagonal':
      return `<rect width="100" height="120" fill="${a}"/><g transform="rotate(-35 50 60)">${
        [-40, 0, 40, 80, 120].map((x) => `<rect x="${x}" y="-40" width="20" height="200" fill="${b}"/>`).join('')}</g>`;
    case 'faixa':
      return `<rect width="100" height="120" fill="${a}"/>
        <polygon points="0,18 0,40 100,100 100,78" fill="${b}"/>
        ${c ? `<path d="M70 14 h10 v10 h10 v10 h-10 v10 h-10 v-10 h-10 v-10 h10 z" fill="${c}"/>` : ''}`;
    case 'estrela':
      return `<rect width="100" height="120" fill="${a}"/>${estrela(50, 58, 26, b)}`;
    case 'cruzeiro':
      return `<rect width="100" height="120" fill="${a}"/>
        ${estrela(50, 34, 9, b)}${estrela(50, 88, 9, b)}${estrela(28, 60, 8, b)}${estrela(72, 56, 8, b)}${estrela(60, 72, 5, b)}`;
    case 'anel':
      return `<rect width="100" height="120" fill="${a}"/>
        <circle cx="50" cy="60" r="36" fill="none" stroke="${b}" stroke-width="5"/>
        <circle cx="50" cy="60" r="18" fill="${b}"/>`;
    case 'metade':
      return `<rect width="50" height="120" fill="${a}"/><rect x="50" width="50" height="120" fill="${b}"/>`;
    case 'liso':
    default:
      return `<rect width="100" height="120" fill="${a}"/><rect x="18" y="20" width="64" height="9" fill="${b}"/>`;
  }
}

export function escudoSVG(escudo, classe = 'escudo') {
  const [forma, tipo, cores] = escudo;
  const id = `esc${++seq}`;
  const d = SILHUETAS[forma] || SILHUETAS.classico;
  return `<svg class="${classe}" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs><clipPath id="${id}"><path d="${d}"/></clipPath></defs>
    <g clip-path="url(#${id})">${padrao(tipo, cores)}</g>
    <path d="${d}" fill="none" stroke="rgba(238,242,234,0.55)" stroke-width="3"/>
  </svg>`;
}
