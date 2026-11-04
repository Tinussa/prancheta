import { EIXOS } from './data/eixos.js';
import { TIPO_TREINADOR } from './data/treinadores.js';
import { TIPO_TIME } from './data/times.js';
import { escudoSVG } from './escudos.js';
import { SITE } from './config.js';
import { escudoDoClube, nomeSerie } from './torcida.js';

// Card 1080 × 1920 (Stories) desenhado em canvas.
const W = 1080;
const H = 1920;
const COR = {
  fundo: '#0c1613',
  gramado: '#12261d',
  gramado2: '#0f2119',
  giz: 'rgba(238,242,234,0.16)',
  texto: '#eef2ea',
  suave: '#9aab9f',
  amarelo: '#ffd23f',
  trilho: '#24372f',
};
const DISPLAY = '"Big Shoulders Display", "Arial Narrow", Impact, sans-serif';
const CORPO = '"Barlow", system-ui, sans-serif';
const ROTULO = '"Barlow Condensed", "Arial Narrow", sans-serif';

async function carregarFontes() {
  if (!document.fonts) return;
  await Promise.all([
    document.fonts.load(`900 100px ${DISPLAY}`),
    document.fonts.load(`800 60px ${DISPLAY}`),
    document.fonts.load(`500 30px ${CORPO}`),
    document.fonts.load(`600 30px ${ROTULO}`),
  ]).catch(() => {});
}

function quebrar(ctx, texto, largura) {
  const palavras = texto.split(' ');
  const linhas = [];
  let linha = '';
  for (const p of palavras) {
    const teste = linha ? `${linha} ${p}` : p;
    if (ctx.measureText(teste).width > largura && linha) {
      linhas.push(linha);
      linha = p;
    } else linha = teste;
  }
  if (linha) linhas.push(linha);
  return linhas;
}

function carregar(src, cors) {
  return new Promise((ok) => {
    const img = new Image();
    if (cors) img.crossOrigin = 'anonymous';
    const t = setTimeout(() => ok(null), 6000);
    img.onload = () => { clearTimeout(t); ok(img); };
    img.onerror = () => { clearTimeout(t); ok(null); };
    img.src = src;
  });
}

function imagemDoPerfil(modo, p) {
  if (modo === 'time') {
    const svg = escudoSVG(p.escudo).replace('<svg ', '<svg width="200" height="240" ');
    return carregar(URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' })), false);
  }
  return p.foto ? carregar(p.foto.src, true) : Promise.resolve(null);
}

function fundo(ctx) {
  ctx.fillStyle = COR.fundo;
  ctx.fillRect(0, 0, W, H);
  // faixas do gramado na metade de baixo
  for (let i = 0; i < 12; i++) {
    ctx.fillStyle = i % 2 ? COR.gramado : COR.gramado2;
    ctx.fillRect(0, 1180 + i * 62, W, 62);
  }
  const g = ctx.createLinearGradient(0, 1100, 0, 1400);
  g.addColorStop(0, COR.fundo);
  g.addColorStop(1, 'rgba(12,22,19,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 1100, W, 300);
  // círculo central em giz
  ctx.strokeStyle = COR.giz;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(W / 2, 1920, 300, Math.PI, 0);
  ctx.stroke();
}

export async function gerarCard({ modo, user, ranking }) {
  await carregarFontes();
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext('2d');
  const top = ranking[0];
  const p = top.perfil;
  const M = 90;

  fundo(ctx);

  // marca
  ctx.fillStyle = COR.amarelo;
  ctx.font = `900 54px ${DISPLAY}`;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('PRANCHETA', M, 150);
  ctx.fillStyle = COR.suave;
  ctx.font = `600 30px ${ROTULO}`;
  ctx.textAlign = 'right';
  ctx.fillText((modo === 'treinador' ? 'QUAL TREINADOR VOCÊ SERIA?' : 'QUAL TIME TEM A SUA CARA?'), W - M, 146);
  ctx.textAlign = 'left';

  // rótulo
  ctx.fillStyle = COR.suave;
  ctx.font = `600 40px ${ROTULO}`;
  ctx.fillText(modo === 'treinador' ? 'MEU TREINADOR É' : 'MEU TIME É', M, 300);

  // foto do treinador (grande) ou escudo do time, no canto superior direito
  const img = await imagemDoPerfil(modo, p);
  const [iw, ih] = modo === 'time' ? [260, 312] : [400, 500];
  const fimImagem = img ? 200 + ih : 0;
  if (img) {
    if (modo === 'time') {
      ctx.drawImage(img, W - M - iw, 200, iw, ih);
    } else {
      const [ix, iy] = [W - M - iw, 200];
      ctx.save();
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(ix, iy, iw, ih, 14) : ctx.rect(ix, iy, iw, ih);
      ctx.clip();
      const escala = Math.max(iw / img.width, ih / img.height);
      const dw = img.width * escala;
      const dh = img.height * escala;
      ctx.drawImage(img, ix + (iw - dw) / 2, iy + (ih - dh) * 0.2, dw, dh);
      ctx.restore();
      ctx.fillStyle = COR.amarelo;
      ctx.fillRect(ix, iy + ih - 12, iw, 12);
    }
  }

  // nome (até 3 linhas na coluna ao lado da imagem)
  ctx.fillStyle = COR.texto;
  const nomeUp = p.nome.toUpperCase();
  const largNome = W - 2 * M - (img ? iw + 36 : 0);
  let tam = 146;
  let linhasNome;
  do {
    tam -= 6;
    ctx.font = `900 ${tam}px ${DISPLAY}`;
    linhasNome = quebrar(ctx, nomeUp, largNome);
  } while ((linhasNome.length > 3 || linhasNome.some((l) => ctx.measureText(l).width > largNome)) && tam > 64);
  linhasNome = linhasNome.slice(0, 3);
  let y = 300 + tam * 0.95;
  for (const l of linhasNome) {
    ctx.fillText(l, M, y);
    y += tam * 0.92;
  }

  // meta
  ctx.fillStyle = COR.suave;
  ctx.font = `500 34px ${CORPO}`;
  const tipo = modo === 'treinador' ? TIPO_TREINADOR[p.tipo] : TIPO_TIME[p.tipo];
  const meta = modo === 'treinador'
    ? `${p.pais} · ${p.clube.split(' · ')[0]} · ${tipo}`
    : `${p.tecnico ? `${p.tecnico} · ` : ''}${tipo}`;
  quebrar(ctx, meta, largNome).slice(0, 2).forEach((l, i) => ctx.fillText(l, M, y + 10 + i * 42));

  // placar de compatibilidade (abaixo da foto)
  y = Math.max(y + 100, fimImagem + 40);
  ctx.fillStyle = COR.amarelo;
  ctx.fillRect(M, y, 400, 172);
  ctx.fillStyle = '#1a1400';
  ctx.font = `900 150px ${DISPLAY}`;
  ctx.fillText(`${top.match}%`, M + 24, y + 145);
  ctx.fillStyle = COR.texto;
  ctx.font = `600 36px ${ROTULO}`;
  ctx.fillText('COMPATÍVEL', M + 430, y + 76);
  ctx.fillStyle = COR.suave;
  ctx.font = `500 30px ${CORPO}`;
  quebrar(ctx, p.formacao || '', 420).slice(0, 2).forEach((l, i) => ctx.fillText(l, M + 430, y + 120 + i * 38));

  // eixos
  y += 230;
  const eixos = EIXOS[modo].filter((e) => user.cobertura[e.id]).slice(0, modo === 'treinador' ? 8 : 7);
  ctx.fillStyle = COR.suave;
  ctx.font = `600 32px ${ROTULO}`;
  ctx.fillText('MEU ESTILO', M, y);
  y += 50;
  const larg = W - 2 * M;
  for (const e of eixos) {
    const v = user.vet[e.id];
    ctx.fillStyle = COR.texto;
    ctx.font = `600 30px ${ROTULO}`;
    ctx.fillText(e.esq.toUpperCase(), M, y);
    ctx.textAlign = 'right';
    ctx.fillText(e.dir.toUpperCase(), W - M, y);
    ctx.textAlign = 'left';
    ctx.fillStyle = COR.trilho;
    ctx.fillRect(M, y + 16, larg, 10);
    ctx.fillStyle = 'rgba(238,242,234,0.35)';
    ctx.fillRect(M + larg / 2 - 1, y + 10, 2, 22);
    ctx.fillStyle = COR.texto;
    ctx.beginPath();
    ctx.arc(M + (larg * p.eixos[e.id]) / 100, y + 21, 10, 0, Math.PI * 2);
    ctx.lineWidth = 4;
    ctx.strokeStyle = COR.texto;
    ctx.fillStyle = COR.fundo;
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = COR.amarelo;
    ctx.beginPath();
    ctx.arc(M + (larg * v) / 100, y + 21, 14, 0, Math.PI * 2);
    ctx.fill();
    y += 62;
  }

  // legenda
  ctx.font = `500 28px ${CORPO}`;
  ctx.fillStyle = COR.amarelo;
  ctx.beginPath(); ctx.arc(M + 12, y - 6, 12, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = COR.texto;
  ctx.fillText('Eu', M + 34, y + 3);
  ctx.strokeStyle = COR.texto; ctx.lineWidth = 4; ctx.fillStyle = COR.fundo;
  ctx.beginPath(); ctx.arc(M + 112, y - 6, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = COR.texto;
  ctx.fillText(p.nome, M + 132, y + 3);

  // top 3 seguintes
  y += 80;
  ctx.fillStyle = COR.suave;
  ctx.font = `600 32px ${ROTULO}`;
  ctx.fillText('TAMBÉM COMBINO COM', M, y);
  y += 56;
  ranking.slice(1, 4).forEach((r, i) => {
    if (y > H - 170) return;
    ctx.fillStyle = COR.texto;
    ctx.font = `800 46px ${DISPLAY}`;
    ctx.fillText(`${i + 2}. ${r.perfil.nome.toUpperCase()}`, M, y);
    ctx.textAlign = 'right';
    ctx.fillStyle = COR.amarelo;
    ctx.fillText(`${r.match}%`, W - M, y);
    ctx.textAlign = 'left';
    y += 62;
  });

  rodape(ctx, 'E VOCÊ? JOGUE EM');
  return paraUrl(cv);
}

function rodape(ctx, chamada) {
  ctx.fillStyle = COR.texto;
  ctx.font = `600 34px ${ROTULO}`;
  ctx.textAlign = 'center';
  const local = !/^https?:/.test(location.protocol) || /localhost|127\.0\.0\.1|claude/.test(location.host);
  const host = local ? SITE : location.host;
  ctx.fillText(`${chamada} ${host.toUpperCase()}`, W / 2, H - 90);
  ctx.textAlign = 'left';
}

const paraUrl = (cv) => new Promise((ok, erro) => cv.toBlob((b) => (b ? ok(URL.createObjectURL(b)) : erro(new Error('toBlob'))), 'image/png'));

// Card do modo adivinhação: escudo, o time pensado, quantas perguntas a Prancheta precisou e a ficha do clube.
export async function gerarCardTorcida({ clube: c, acertou, perguntas, variante, match, oposto }) {
  const dificil = variante === 'dificil';
  await carregarFontes();
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext('2d');
  const M = 90;
  fundo(ctx);

  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = COR.amarelo;
  ctx.font = `900 54px ${DISPLAY}`;
  ctx.fillText('PRANCHETA', M, 150);
  ctx.fillStyle = COR.suave;
  ctx.font = `600 30px ${ROTULO}`;
  ctx.textAlign = 'right';
  ctx.fillText(dificil ? 'QUAL TIME VOCÊ ESTÁ PENSANDO? · DIFÍCIL' : 'QUAL TIME VOCÊ ESTÁ PENSANDO?', W - M, 146);
  ctx.textAlign = 'center';

  // escudo
  const svg = escudoSVG(escudoDoClube(c)).replace('<svg ', '<svg width="300" height="360" ');
  const img = await new Promise((ok) => {
    const i = new Image();
    i.onload = () => ok(i);
    i.onerror = () => ok(null);
    i.src = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  });
  if (img) ctx.drawImage(img, W / 2 - 150, 220, 300, 360);

  ctx.fillStyle = COR.suave;
  ctx.font = `600 42px ${ROTULO}`;
  ctx.fillText('O TIME QUE EU PENSEI', W / 2, 670);

  // nome (até 2 linhas)
  const nome = c.nome.toUpperCase();
  let tam = 176;
  let linhas;
  do {
    tam -= 8;
    ctx.font = `900 ${tam}px ${DISPLAY}`;
    linhas = quebrar(ctx, nome, W - 2 * M);
  } while ((linhas.length > 2 || linhas.some((l) => ctx.measureText(l).width > W - 2 * M)) && tam > 72);
  ctx.fillStyle = COR.texto;
  let y = 670 + tam * 0.98;
  linhas.slice(0, 2).forEach((l) => { ctx.fillText(l, W / 2, y); y += tam * 0.92; });
  y += 70 - tam * 0.92;

  ctx.fillStyle = COR.suave;
  ctx.font = `500 36px ${CORPO}`;
  ctx.fillText([c.apelido, `${c.cidade} · ${c.uf}`].filter(Boolean).join('  ·  '), W / 2, y);

  // placar da adivinhação
  y += 70;
  ctx.fillStyle = COR.amarelo;
  ctx.fillRect(M, y, W - 2 * M, 190);
  ctx.fillStyle = '#1a1400';
  if (dificil) {
    ctx.font = `700 40px ${ROTULO}`;
    ctx.fillText(`MODO DIFÍCIL · ${perguntas} PERGUNTAS`, W / 2, y + 54);
    ctx.font = `900 98px ${DISPLAY}`;
    ctx.fillText(`${match}% COMPATÍVEL`, W / 2, y + 170);
  } else if (acertou && perguntas) {
    ctx.font = `700 40px ${ROTULO}`;
    ctx.fillText('A PRANCHETA ADIVINHOU EM', W / 2, y + 62);
    ctx.font = `900 110px ${DISPLAY}`;
    ctx.fillText(`${perguntas} PERGUNTA${perguntas === 1 ? '' : 'S'}`, W / 2, y + 168);
  } else {
    ctx.font = `700 40px ${ROTULO}`;
    ctx.fillText('DESSA VEZ', W / 2, y + 70);
    ctx.font = `900 92px ${DISPLAY}`;
    ctx.fillText('A PRANCHETA ERROU', W / 2, y + 160);
  }

  // ficha
  y += 270;
  ctx.textAlign = 'left';
  const ficha = [
    ['ESTÁDIO', c.estadio], ['MASCOTE', c.mascote], ['FUNDAÇÃO', c.fundacao],
    dificil && oposto ? ['MEU OPOSTO', oposto.clube.nome] : ['MAIOR RIVAL', c.rival],
    ['DIVISÃO EM 2026', nomeSerie(c)], ['ÍDOLO', c.idolo],
  ].filter(([, v]) => v).slice(0, 4);
  const colW = (W - 2 * M) / 2;
  ficha.forEach(([k, v], i) => {
    const x = M + (i % 2) * colW;
    const yy = y + Math.floor(i / 2) * 150;
    ctx.fillStyle = COR.suave;
    ctx.font = `600 30px ${ROTULO}`;
    ctx.fillText(k, x, yy);
    ctx.fillStyle = COR.texto;
    ctx.font = `800 48px ${DISPLAY}`;
    quebrar(ctx, String(v).toUpperCase(), colW - 30).slice(0, 2).forEach((l, j) => ctx.fillText(l, x, yy + 54 + j * 50));
  });

  rodape(ctx, 'PENSE EM UM TIME E JOGUE EM');
  return paraUrl(cv);
}
