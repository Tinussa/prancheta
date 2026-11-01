// Para onde vão os relatos de bug, sugestões e correções enviados pelo site.
//
// endpoint: URL que recebe POST em JSON (por exemplo um formulário do Formspree,
//           https://formspree.io/f/SEU_ID). Se estiver preenchido, o envio é direto.
// email:    endereço que abre o app de e-mail do visitante com o relato já escrito.
//           Usado quando não há endpoint (ou se o endpoint falhar).
//
// Com os dois vazios, o site mostra o relato pronto para copiar.
export const FEEDBACK = {
  endpoint: 'https://formspree.io/f/mdeewvrp',
  email: '',
};
