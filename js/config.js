// Para onde vão os relatos de bug, sugestões e correções enviados pelo site.
//
// endpoint: URL que recebe POST em JSON (por exemplo um formulário do Formspree,
//           https://formspree.io/f/SEU_ID). Se estiver preenchido, o envio é direto.
// email:    endereço que abre o app de e-mail do visitante com o relato já escrito.
//           Usado quando não há endpoint (ou se o endpoint falhar).
//
// Com os dois vazios, o site mostra o relato pronto para copiar.
// Endereço oficial do site (também usado no card quando ele é gerado fora do site publicado,
// como no computador, em testes).
export const SITE = 'pranchetabrasileirao.vercel.app';

export const FEEDBACK = {
  endpoint: 'https://formspree.io/f/mdeewvrp',
  email: '',
};

// Google AdSense. Com `cliente` vazio, nenhum anúncio aparece.
// cliente: código da conta (ca-pub-...), mostrado no painel do AdSense.
// blocos:  IDs das unidades de anúncio criadas no painel (Anúncios → Por bloco de anúncios).
//          inicio = página inicial; resultado = telas de resultado. Bloco vazio = sem anúncio ali.
export const ADSENSE = {
  cliente: 'ca-pub-6247859370935570',
  blocos: { inicio: '', resultado: '' },
};
