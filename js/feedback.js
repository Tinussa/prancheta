import { FEEDBACK } from './config.js';

// Janela para relatar bug, sugerir melhoria ou corrigir uma informação.

const TIPOS = {
  bug: { nome: 'Relatar bug', dica: 'O que aconteceu e o que você esperava que acontecesse?' },
  melhoria: { nome: 'Sugerir melhoria', dica: 'Que ideia você tem para o jogo?' },
  correcao: { nome: 'Corrigir informação', dica: 'O que está errado e qual é a informação certa? Se puder, mande a fonte.' },
};

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

let dlg = null;

function montar() {
  dlg = document.createElement('dialog');
  dlg.className = 'feedback';
  dlg.setAttribute('aria-labelledby', 'fb-titulo');
  dlg.innerHTML = `
    <form method="dialog" class="fb-form" id="fb-form">
      <div class="fb-cab">
        <h2 id="fb-titulo">Fale com a Prancheta</h2>
        <button type="button" class="fb-fechar" data-fb="fechar" aria-label="Fechar">✕</button>
      </div>
      <fieldset class="fb-tipos">
        <legend>O que você quer fazer?</legend>
        ${Object.entries(TIPOS).map(([id, t]) => `
          <label class="fb-tipo"><input type="radio" name="fb-tipo" id="fb-tipo-${id}" value="${id}"><span>${t.nome}</span></label>`).join('')}
      </fieldset>
      <label class="fb-campo" for="fb-sobre">Sobre o quê
        <input id="fb-sobre" name="sobre" type="text" maxlength="200" placeholder="Ex.: pergunta sobre escanteio, foto do Tite, tela de resultado">
      </label>
      <label class="fb-campo" for="fb-msg"><span id="fb-dica">Mensagem</span>
        <textarea id="fb-msg" name="mensagem" rows="5" maxlength="3000" required></textarea>
      </label>
      <label class="fb-campo" for="fb-contato">Contato para resposta (opcional)
        <input id="fb-contato" name="contato" type="text" maxlength="120" placeholder="E-mail ou @ do Instagram">
      </label>
      <p class="fb-status" id="fb-status" role="status"></p>
      <div class="fb-acoes">
        <button type="button" class="btn-sec" data-fb="fechar">Cancelar</button>
        <button type="submit" class="btn-pri" id="fb-enviar">Enviar</button>
      </div>
    </form>`;
  document.body.appendChild(dlg);

  dlg.addEventListener('click', (ev) => {
    if (ev.target === dlg || ev.target.closest('[data-fb="fechar"]')) dlg.close();
  });
  dlg.addEventListener('change', (ev) => {
    if (ev.target.name === 'fb-tipo') dlg.querySelector('#fb-dica').textContent = TIPOS[ev.target.value].dica;
  });
  dlg.querySelector('#fb-form').addEventListener('submit', enviar);
}

export function abrirFeedback({ tipo = 'bug', sobre = '' } = {}) {
  if (!dlg) montar();
  dlg.querySelector(`#fb-tipo-${tipo}`).checked = true;
  dlg.querySelector('#fb-dica').textContent = TIPOS[tipo].dica;
  dlg.querySelector('#fb-sobre').value = sobre;
  dlg.querySelector('#fb-msg').value = '';
  dlg.querySelector('#fb-status').textContent = '';
  dlg.querySelector('#fb-enviar').disabled = false;
  if (dlg.showModal) dlg.showModal();
  else dlg.setAttribute('open', '');
  dlg.querySelector('#fb-msg').focus();
}

// Nota de 1 a 5 para o resultado. Vai para o mesmo endpoint do feedback, sem incomodar a pessoa
// se falhar ou se o envio não estiver configurado.
export function enviarAvaliacao(dados) {
  if (!FEEDBACK.endpoint) return;
  fetch(FEEDBACK.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      tipo: 'avaliacao',
      ...dados,
      pagina: location.href,
      data: new Date().toISOString(),
      _subject: dados._subject || `Prancheta · Avaliação ${dados.nota}/5 · ${dados.perfil}`,
    }),
  }).catch(() => {});
}

function textoDoRelato(r) {
  return [
    `Tipo: ${TIPOS[r.tipo].nome}`,
    `Sobre: ${r.sobre || '-'}`,
    `Contato: ${r.contato || '-'}`,
    `Página: ${r.pagina}`,
    '',
    r.mensagem,
  ].join('\n');
}

async function enviar(ev) {
  ev.preventDefault();
  const f = ev.target;
  const status = dlg.querySelector('#fb-status');
  const botao = dlg.querySelector('#fb-enviar');
  const r = {
    tipo: f.querySelector('input[name="fb-tipo"]:checked')?.value || 'bug',
    sobre: f.sobre.value.trim(),
    mensagem: f.mensagem.value.trim(),
    contato: f.contato.value.trim(),
    pagina: location.href,
    navegador: navigator.userAgent,
    data: new Date().toISOString(),
  };
  if (!r.mensagem) {
    status.textContent = 'Escreva uma mensagem antes de enviar.';
    return;
  }
  botao.disabled = true;

  if (FEEDBACK.endpoint) {
    status.textContent = 'Enviando…';
    try {
      const resp = await fetch(FEEDBACK.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...r, _subject: `Prancheta · ${TIPOS[r.tipo].nome}` }),
      });
      if (!resp.ok) throw new Error(resp.status);
      status.textContent = 'Recebido. Obrigado por ajudar a melhorar a Prancheta!';
      setTimeout(() => dlg.close(), 1800);
      return;
    } catch {
      status.textContent = 'Não conseguimos enviar agora.';
    }
  }

  if (FEEDBACK.email) {
    const assunto = encodeURIComponent(`Prancheta · ${TIPOS[r.tipo].nome}`);
    const corpo = encodeURIComponent(textoDoRelato(r));
    location.href = `mailto:${FEEDBACK.email}?subject=${assunto}&body=${corpo}`;
    status.textContent = `Abrimos o seu app de e-mail com o relato pronto. Se ele não abriu, escreva para ${FEEDBACK.email}.`;
    botao.disabled = false;
    return;
  }

  try {
    await navigator.clipboard.writeText(textoDoRelato(r));
    status.textContent = 'O envio direto ainda não está ativo. O relato foi copiado para você colar e mandar ao responsável pelo site.';
  } catch {
    status.innerHTML = `O envio direto ainda não está ativo. Copie o relato abaixo:<textarea class="fb-copia" readonly rows="6">${esc(textoDoRelato(r))}</textarea>`;
  }
  botao.disabled = false;
}
