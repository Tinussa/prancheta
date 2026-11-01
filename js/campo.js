// Campo de futebol em SVG, 105 × 68 m, atacando para a direita.

export function marcacoes() {
  const faixas = Array.from({ length: 10 }, (_, i) =>
    `<rect x="${i * 10.5}" y="0" width="10.5" height="68" class="faixa${i % 2}"/>`).join('');
  return `
    ${faixas}
    <g class="giz">
      <rect x="0.4" y="0.4" width="104.2" height="67.2"/>
      <line x1="52.5" y1="0.4" x2="52.5" y2="67.6"/>
      <circle cx="52.5" cy="34" r="9.15"/>
      <circle cx="52.5" cy="34" r="0.4" class="ponto"/>
      <rect x="0.4" y="13.84" width="16.1" height="40.32"/>
      <rect x="0.4" y="24.84" width="5.1" height="18.32"/>
      <rect x="88.5" y="13.84" width="16.1" height="40.32"/>
      <rect x="99.5" y="24.84" width="5.1" height="18.32"/>
      <circle cx="11" cy="34" r="0.4" class="ponto"/>
      <circle cx="94" cy="34" r="0.4" class="ponto"/>
      <path d="M16.5 26.7 A9.15 9.15 0 0 1 16.5 41.3"/>
      <path d="M88.5 26.7 A9.15 9.15 0 0 0 88.5 41.3"/>
    </g>`;
}

export function campo(conteudo = '', classe = '') {
  return `<svg class="campo ${classe}" viewBox="0 0 105 68" role="img" aria-label="Campo de futebol">${marcacoes()}${conteudo}</svg>`;
}

// Posições dos jogadores de uma formação: goleiro + linhas.
export function posicoes(formacao) {
  const pts = [[5, 34]];
  for (const [x, n] of formacao.linhas) {
    for (let i = 0; i < n; i++) {
      const y = n === 1 ? 34 : n <= 3 ? (68 * (i + 1)) / (n + 1) : 8 + (52 * i) / (n - 1);
      pts.push([x, y]);
    }
  }
  return pts;
}

export function jogadores(formacao) {
  return posicoes(formacao)
    .map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="2.3" class="jogador${i === 0 ? ' goleiro' : ''}"/>`)
    .join('');
}
