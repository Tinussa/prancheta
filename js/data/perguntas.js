// Banco de perguntas.
//
// tipo 'escala'   : afirmação com 5 níveis (-2 a +2). `eixos` = { eixo: peso } (peso negativo inverte).
// tipo 'escolha'  : cenário com alternativas; cada uma tem `efeito` = { eixo: delta }.
// tipo 'formacao' : escolher o desenho tático no campinho.
// tipo 'zona'     : tocar numa zona do campo; cada zona tem `efeito`.
// tipo 'slider'   : arrastar um controle de 0 a 1, convertido em -2 a +2 nos `eixos`.
// tipo 'regiao'   : região do clube (bônus no modo time).
//
// `nucleo` lista os modos em que a pergunta sempre entra (garante que todos os eixos sejam medidos).
// O resto do quiz é sorteado do banco: 15 perguntas na versão curta, 30 na completa.
// `modos` restringe a pergunta a um modo (sem ele, vale para os dois).

const AMBOS = ['treinador', 'time'];
const T = ['treinador'];
const TM = ['time'];

export const TATICAS = [
  {
    id: 'virada', tipo: 'escolha', tag: 'Ataque',
    texto: 'Minuto 80. Seu time perde por 1 a 0 em casa. O que você faz?',
    opcoes: [
      { texto: 'Tiro um volante, ponho mais um atacante e mando a zaga subir.', efeito: { risco: 2, linha: 1 } },
      { texto: 'Mantenho o desenho. O gol sai trocando passes, com paciência.', efeito: { posse: 2, saida: 1, risco: -0.5 } },
      { texto: 'Coloco um centroavante alto e mando cruzar na área.', efeito: { corredor: 2, saida: -1, risco: 1 } },
      { texto: 'Seguro o time compacto. Perder de dois é pior.', efeito: { risco: -2, linha: -1 } },
    ],
  },
  {
    id: 'formacao', nucleo: AMBOS, tipo: 'formacao', tag: 'Desenho tático',
    texto: 'Escolha a formação base do seu time.',
  },
  {
    id: 'posse-defende', tipo: 'escala', tag: 'Controle de bola',
    texto: 'Um time que fica com a bola não precisa se defender.',
    eixos: { posse: 1.5, saida: 0.5 },
  },
  {
    id: 'linha-defensiva', nucleo: AMBOS, tipo: 'slider', tag: 'Zaga', visual: 'linha',
    texto: 'Arraste a linha de defesa para onde ela deve ficar quando o adversário tem a bola no campo dele.',
    rotulos: ['Na entrada da área', 'Perto do meio-campo'],
    eixos: { linha: 2 },
  },
  {
    id: 'perdeu-bola', nucleo: AMBOS, tipo: 'escolha', tag: 'Transição defensiva',
    texto: 'Seu time acabou de perder a bola no campo de ataque. A primeira reação deve ser:',
    opcoes: [
      { texto: 'Os mais próximos atacam a bola na hora, em até 5 segundos.', efeito: { pressao: 2, linha: 1 } },
      { texto: 'Falta tática se for preciso, e todo mundo se reorganiza.', efeito: { pressao: 0.5, risco: -1 } },
      { texto: 'Todos correm para trás da linha da bola e fecham o meio.', efeito: { pressao: -2, linha: -1 } },
      { texto: 'Só o meio-campo recua; os atacantes ficam esperando o contra-ataque.', efeito: { pressao: -1, risco: 1 } },
    ],
  },
  {
    id: 'tiro-de-meta', nucleo: AMBOS, tipo: 'escolha', tag: 'Construção',
    texto: 'Tiro de meta a seu favor. O adversário pressiona alto com três jogadores.',
    opcoes: [
      { texto: 'Goleiro toca curto, o volante desce entre os zagueiros e saímos jogando.', efeito: { saida: 2, risco: 1 } },
      { texto: 'Bola longa no centroavante e briga pela segunda bola.', efeito: { saida: -2, posse: -1 } },
      { texto: 'Lançamento diagonal para o ponta veloz nas costas do lateral.', efeito: { saida: -1, corredor: 1, posse: -1 } },
      { texto: 'Atraio a pressão com toques curtos e só depois procuro o lançamento.', efeito: { saida: 1, posse: 1 } },
    ],
  },
  {
    id: 'zona-gol', nucleo: AMBOS, tipo: 'zona', tag: 'Ataque',
    texto: 'Onde nasce a maioria dos gols do seu time? Toque na zona do campo.',
  },
  {
    id: 'um-a-zero', nucleo: AMBOS, tipo: 'escala', tag: 'Mentalidade',
    texto: 'Prefiro ganhar de 1 a 0 jogando mal a perder de 3 a 2 jogando bonito.',
    eixos: { risco: -2 },
  },
  {
    id: 'laterais', tipo: 'escala', tag: 'Lado do campo',
    texto: 'Meus laterais devem passar mais tempo no campo de ataque do que no de defesa.',
    eixos: { corredor: 1.2, risco: 1 },
  },
  {
    id: 'pressao-inicio', tipo: 'slider', tag: 'Pressão', visual: 'pressao',
    texto: 'Sem a bola, a partir de onde seu time começa a pressionar?',
    rotulos: ['Só no nosso campo', 'Já na área deles'],
    eixos: { pressao: 2, linha: 0.6 },
  },
  {
    id: 'ponta-rapido', tipo: 'escolha', tag: 'Zaga',
    texto: 'O adversário tem um ponta muito rápido. Qual é o seu plano?',
    opcoes: [
      { texto: 'Dobrar a marcação e baixar a linha para tirar o espaço nas costas.', efeito: { linha: -2, risco: -1 } },
      { texto: 'Atacar pelo lado dele e obrigá-lo a defender.', efeito: { risco: 2, corredor: 1 } },
      { texto: 'Um marcador colado nele o jogo inteiro.', efeito: { pressao: 1, liberdade: -1 } },
      { texto: 'Pressionar quem passa a bola para ele e cortar na origem.', efeito: { pressao: 2, linha: 1 } },
    ],
  },
  {
    id: 'liberdade-craque', nucleo: T, tipo: 'escala', tag: 'Criação',
    texto: 'Jogador bom tem que ter liberdade para sair da posição.',
    eixos: { liberdade: 2 },
  },
  {
    id: 'gol-sonho', nucleo: T, tipo: 'escolha', tag: 'Ataque',
    texto: 'O gol dos sonhos do seu time é…',
    opcoes: [
      { texto: 'Vinte passes seguidos até alguém empurrar para o gol vazio.', efeito: { posse: 2, saida: 1 } },
      { texto: 'Roubada no meio e três toques até a rede.', efeito: { posse: -2, pressao: 1 } },
      { texto: 'Cruzamento na medida e cabeçada do centroavante.', efeito: { corredor: 2 } },
      { texto: 'Um craque que dribla três e toca na saída do goleiro.', efeito: { liberdade: 2 } },
    ],
  },
  {
    id: 'libertadores-altitude', tipo: 'escolha', tag: 'Estratégia',
    texto: 'Jogo de ida da final de Libertadores, fora de casa, a 3.600 metros de altitude.',
    opcoes: [
      { texto: 'Jogo o meu jogo. Ideia não muda com o lugar.', efeito: { risco: 1, posse: 1 } },
      { texto: 'Bloco baixo, segurar o placar e decidir em casa.', efeito: { risco: -2, linha: -2 } },
      { texto: 'Pressão forte no começo para fazer um gol cedo, depois administro.', efeito: { pressao: 1 } },
      { texto: 'Escalo os reservas e poupo os titulares para a volta.', efeito: { rotacao: 2, risco: -1 } },
    ],
  },
  {
    id: 'zagueiro-bola', tipo: 'escala', tag: 'Zaga',
    texto: 'Zagueiro tem que saber jogar com a bola tanto quanto saber marcar.',
    eixos: { saida: 1.5 },
  },
  {
    id: 'camisa-10', tipo: 'escolha', tag: 'Criação',
    texto: 'Seu camisa 10 recebe de costas no meio-campo. Você quer que ele…',
    opcoes: [
      { texto: 'Gire e encare a marcação. O talento resolve.', efeito: { liberdade: 2 } },
      { texto: 'Devolva de primeira e siga a movimentação treinada.', efeito: { liberdade: -2, posse: 1 } },
      { texto: 'Abra no lado e ataque a área.', efeito: { corredor: 1.5 } },
      { texto: 'Procure o lançamento em profundidade.', efeito: { posse: -1, risco: 1 } },
    ],
  },
  {
    id: 'contra-ataque', tipo: 'escala', tag: 'Transição ofensiva',
    texto: 'O contra-ataque é a arma mais perigosa do futebol.',
    eixos: { posse: -1.5 },
  },
  {
    id: 'marcacao-individual', tipo: 'escala', tag: 'Zaga',
    texto: 'Marcação individual, homem a homem, ainda funciona no futebol de hoje.',
    eixos: { pressao: 1, risco: 0.5 },
  },
  {
    id: 'escanteio', tipo: 'escolha', tag: 'Bola parada',
    texto: 'Escanteio a favor. Como você quer cobrar?',
    opcoes: [
      { texto: 'Na cabeça do zagueiro, primeira trave, jogada ensaiada.', efeito: { liberdade: -1, corredor: 1 } },
      { texto: 'Curto, para tirar a marcação do lugar e trabalhar a bola.', efeito: { posse: 1, saida: 1 } },
      { texto: 'Fechado no goleiro, com gente na pequena área.', efeito: { corredor: 1, risco: 1 } },
      { texto: 'Tanto faz. O importante é ter um bom batedor.', efeito: { liberdade: 1 } },
    ],
  },
  {
    id: 'passe-para-tras', tipo: 'escala', tag: 'Controle de bola',
    texto: 'Um passe para trás também é uma jogada de ataque.',
    eixos: { posse: 1.5, saida: 0.5 },
  },
  {
    id: 'cruzamento', tipo: 'escala', tag: 'Ataque',
    texto: 'Cruzar bola na área é desperdiçar a posse.',
    eixos: { corredor: -1.5, posse: 0.5 },
  },
  {
    id: 'defender-perto', tipo: 'escala', tag: 'Zaga',
    texto: 'Defender perto da própria área é sinal de fraqueza.',
    eixos: { linha: 1.5, risco: 0.5 },
  },
  {
    id: 'trinta-posse', tipo: 'escala', tag: 'Controle de bola',
    texto: 'Ter 30% de posse e vencer é tão bonito quanto ter 70%.',
    eixos: { posse: -1.5 },
  },
  {
    id: 'posicional', tipo: 'escala', tag: 'Organização',
    texto: 'Cada jogador deve saber exatamente onde estar em cada fase do jogo.',
    eixos: { liberdade: -2 },
  },
  {
    id: 'volante', tipo: 'escolha', tag: 'Meio-campo',
    texto: 'Qual é o volante ideal para o seu time?',
    opcoes: [
      { texto: 'Primeiro volante que só marca e protege a zaga.', efeito: { risco: -1, saida: -1 } },
      { texto: 'Volante construtor, que desce entre os zagueiros para sair jogando.', efeito: { saida: 2, posse: 1 } },
      { texto: 'Box-to-box, que pressiona e pisa na área.', efeito: { pressao: 1, risco: 1 } },
      { texto: 'Dois volantes fixos para o time ficar seguro.', efeito: { risco: -2 } },
    ],
  },
  {
    id: 'plano-adversario', tipo: 'escala', tag: 'Estratégia',
    texto: 'O plano de jogo deve mudar conforme o adversário.',
    eixos: { risco: -1, liberdade: -0.5 },
  },
  {
    id: 'atras-da-bola', tipo: 'slider', tag: 'Equilíbrio', visual: 'numero',
    texto: 'Quando seu time ataca, quantos jogadores de linha ficam atrás da bola?',
    rotulos: ['2 jogadores', '6 jogadores'], passos: [2, 3, 4, 5, 6],
    eixos: { risco: -1.5, linha: -0.5 },
  },
  {
    id: 'corre-ou-toca', tipo: 'escala', tag: 'Intensidade',
    texto: 'Prefiro um time que corre muito a um time que toca muito.',
    eixos: { pressao: 1, posse: -1 },
  },
];

// Perguntas inspiradas em seleções nacionais e Copas do Mundo.
export const SELECOES = [
  {
    id: 'selecao-treinar', tipo: 'escolha', tag: 'Seleções',
    texto: 'Qual seleção histórica você gostaria de ter treinado?',
    opcoes: [
      { texto: 'Brasil 1970: cinco camisas 10 em campo e liberdade total.', efeito: { liberdade: 2, risco: 1 } },
      { texto: 'Holanda 1974: o Carrossel, em que todo mundo ataca e todo mundo defende.', efeito: { pressao: 2, linha: 2 } },
      { texto: 'Itália 2006: defesa quase perfeita, só dois gols sofridos na Copa.', efeito: { risco: -2, linha: -1 } },
      { texto: 'Espanha 2010: tiki-taka e posse de bola sufocante.', efeito: { posse: 2, saida: 2 } },
    ],
  },
  {
    id: 'brasil-82', tipo: 'escolha', tag: 'Seleções',
    texto: 'A Seleção de 1982 encantou o mundo e caiu para a Itália no Sarriá. O que faltou?',
    opcoes: [
      { texto: 'Nada. Era o jeito certo de jogar, mesmo sem a taça.', efeito: { risco: 2, liberdade: 1 } },
      { texto: 'Um centroavante matador na área.', efeito: { referencia: 1.5, corredor: 1 } },
      { texto: 'Equilíbrio: com o empate bastando, o time continuou se expondo.', efeito: { risco: -2 } },
      { texto: 'Marcação mais forte no meio-campo.', efeito: { pressao: 1, risco: -1 } },
    ],
  },
  {
    id: 'tetra-94', tipo: 'escala', tag: 'Seleções',
    texto: 'O tetra de 1994, com Dunga e Mauro Silva protegendo a zaga, foi tão bonito quanto o tri de 1970.',
    eixos: { risco: -1.5 },
  },
  {
    id: 'carrossel', tipo: 'escala', tag: 'Seleções',
    texto: 'Os jogadores deveriam trocar de posição o tempo todo, como no Carrossel Holandês de 1974.',
    eixos: { liberdade: 1.5, pressao: 0.5 },
  },
  {
    id: 'espanha-2010', tipo: 'escala', tag: 'Seleções',
    texto: 'A Espanha de 2010 provou que ter a bola é a melhor forma de se defender.',
    eixos: { posse: 2 },
  },
  {
    id: 'sete-a-um', tipo: 'escolha', tag: 'Seleções',
    texto: 'Brasil 1 x 7 Alemanha, Copa de 2014. Qual lição você tira?',
    opcoes: [
      { texto: 'Faltou organização tática: o time ficou desmontado em campo.', efeito: { liberdade: -2 } },
      { texto: 'Faltou meio-campo para segurar a bola e esfriar o jogo.', efeito: { posse: 2 } },
      { texto: 'A linha subiu demais e ficou exposta.', efeito: { linha: -2, risco: -1 } },
      { texto: 'Foi emocional. Faltou gestão de grupo.', efeito: { liberdade: 1, rotacao: -1 } },
    ],
  },
  {
    id: 'marrocos-2022', tipo: 'escala', tag: 'Seleções',
    texto: 'Contra um time mais forte, o certo é bloco baixo e contra-ataque, como Marrocos fez em 2022.',
    eixos: { linha: -1.5, posse: -1 },
  },
  {
    id: 'argentina-messi', tipo: 'escala', tag: 'Seleções',
    texto: 'Vale montar o time inteiro para liberar um gênio, como a Argentina fez com Messi em 2022.',
    eixos: { liberdade: 1.5, estrelas: 1 },
  },
  {
    id: 'desenho-selecao', tipo: 'escolha', tag: 'Seleções',
    texto: 'Que desenho de seleção campeã você copiaria?',
    opcoes: [
      { texto: '4-2-4 do Brasil de 1958, com Garrincha e Pelé.', efeito: { risco: 2, corredor: 1 } },
      { texto: '3-5-2 do Brasil de 2002, com Cafu e Roberto Carlos de alas.', efeito: { corredor: 2 } },
      { texto: '4-3-3 posicional da Espanha de 2010.', efeito: { posse: 2, liberdade: -1 } },
      { texto: '4-4-2 em duas linhas da Itália de 2006.', efeito: { risco: -2, linha: -1 } },
    ],
  },
  {
    id: 'maracanazo', tipo: 'escala', tag: 'Seleções',
    texto: 'Garra vence técnica em jogo decisivo, como o Uruguai mostrou no Maracanazo de 1950.',
    eixos: { pressao: 1, posse: -1 },
  },
  {
    id: 'franca-2018', tipo: 'escolha', tag: 'Seleções',
    texto: 'A França campeã de 2018 tinha pouca posse e muita velocidade com Mbappé. Você…',
    opcoes: [
      { texto: 'Faria igual. Título é o que importa.', efeito: { posse: -2, risco: -1 } },
      { texto: 'Ficaria com o mesmo time, mas com mais a bola.', efeito: { posse: 1 } },
      { texto: 'Preferia a Croácia de Modrić, que dominava o meio-campo.', efeito: { posse: 2, saida: 1 } },
      { texto: 'Preferia a Bélgica, mais ofensiva, mesmo sem título.', efeito: { risco: 2 } },
    ],
  },
  {
    id: 'japao-2022', tipo: 'escala', tag: 'Seleções',
    texto: 'O Japão venceu Alemanha e Espanha na Copa de 2022 com menos de 30% de posse. Isso também é bom futebol.',
    eixos: { posse: -1.5, risco: -0.5 },
  },
  {
    id: 'cinco-camisas-10', tipo: 'escolha', tag: 'Seleções',
    texto: 'Você tem cinco camisas 10 no elenco, como Zagallo em 1970. O que faz?',
    opcoes: [
      { texto: 'Escalo todos e ajusto as funções. Craque sempre joga.', efeito: { liberdade: 2, risco: 1, estrelas: 1 } },
      { texto: 'Escolho dois e completo o meio com marcadores.', efeito: { risco: -1, liberdade: -1 } },
      { texto: 'Faço rodízio entre eles conforme o adversário.', efeito: { rotacao: 2, risco: -0.5 } },
      { texto: 'Monto três meias e nenhum centroavante fixo.', efeito: { referencia: -2, posse: 1 } },
    ],
  },
  {
    id: 'convite-selecao', tipo: 'escolha', tag: 'Seleções', modos: T,
    texto: 'A CBF te chama para a Seleção a seis meses da Copa. Você…',
    opcoes: [
      { texto: 'Aceito e levo a base do time que joga melhor no Brasil.', efeito: { rotacao: -1, liberdade: -0.5 } },
      { texto: 'Aceito e convoco os melhores, cada um vindo do seu clube.', efeito: { liberdade: 1 } },
      { texto: 'Aceito e mudo tudo: novo esquema e nova geração.', efeito: { risco: 1, rotacao: 1 } },
      { texto: 'Recuso. Seleção se prepara em quatro anos, não em seis meses.', efeito: { liberdade: -1, risco: -0.5 } },
    ],
  },
];

export const TREINADOR = [
  {
    id: 'tres-jogos', nucleo: T, tipo: 'escolha', tag: 'Gestão',
    texto: 'Semana com três jogos em sete dias. Como fica a escalação?',
    opcoes: [
      { texto: 'Rodo o elenco inteiro. Todo mundo joga.', efeito: { rotacao: 2 } },
      { texto: 'Poupo dois ou três titulares mais desgastados.', efeito: { rotacao: 0.5 } },
      { texto: 'Vou com os melhores sempre. Descanso é depois.', efeito: { rotacao: -2 } },
      { texto: 'Poupo todos os titulares no campeonato e uso força máxima na copa.', efeito: { rotacao: 1, risco: -0.5 } },
    ],
  },
  {
    id: 'time-ganhando', tipo: 'escala', tag: 'Gestão',
    texto: 'Time que está ganhando não se mexe.',
    eixos: { rotacao: -2 },
  },
  {
    id: 'craque-veterano', tipo: 'escolha', tag: 'Vestiário',
    texto: 'Seu craque de 33 anos quer jogar todas, mas caiu de rendimento.',
    opcoes: [
      { texto: 'Banco. Quem está melhor joga.', efeito: { rotacao: 1, liberdade: -1 } },
      { texto: 'Converso e mantenho. Ele decide jogo grande.', efeito: { liberdade: 1.5, rotacao: -1 } },
      { texto: 'Mudo a função dele para poupar o físico.', efeito: { liberdade: -0.5, posse: 0.5 } },
      { texto: 'Uso só nos jogos grandes e deixo ele descansar nos outros.', efeito: { rotacao: 1.5 } },
    ],
  },
  {
    id: 'garoto-base', tipo: 'escolha', tag: 'Base',
    texto: 'Um garoto de 17 anos da base está voando nos treinos.',
    opcoes: [
      { texto: 'Jogo ele já no próximo clássico.', efeito: { risco: 1, rotacao: 1, liberdade: 1 } },
      { texto: 'Coloco aos poucos, 15 minutos por jogo.', efeito: { rotacao: 0.5 } },
      { texto: 'Só quando estiver pronto. Base é para formar.', efeito: { risco: -1, rotacao: -1 } },
      { texto: 'Empresto para outro clube da Série A ganhar rodagem.', efeito: { rotacao: -0.5, risco: -0.5 } },
    ],
  },
  {
    id: 'intervalo', tipo: 'escolha', tag: 'Beira do campo',
    texto: 'Intervalo, 0 a 0 contra um time mais fraco que o seu.',
    opcoes: [
      { texto: 'Duas substituições já, para mudar o jogo.', efeito: { risco: 1, rotacao: 1 } },
      { texto: 'Mudo o desenho tático sem trocar ninguém.', efeito: { liberdade: -1 } },
      { texto: 'Nada muda. O gol vai sair.', efeito: { rotacao: -1, posse: 1 } },
      { texto: 'Cobro atitude no vestiário. Falta vontade.', efeito: { pressao: 1, liberdade: 1 } },
    ],
  },
  {
    id: 'titulo-sonho', tipo: 'escolha', tag: 'Carreira',
    texto: 'Que título você trocaria por todos os outros?',
    opcoes: [
      { texto: 'Libertadores invicta com o time que menos sofreu gols.', efeito: { risco: -2 } },
      { texto: 'Brasileirão com o melhor ataque da história.', efeito: { risco: 2 } },
      { texto: 'Copa do Brasil com um time de garotos da base.', efeito: { rotacao: 1, liberdade: 1 } },
      { texto: 'Copa do Mundo, com a Seleção.', efeito: { risco: -0.5, rotacao: -0.5 } },
    ],
  },
  {
    id: 'treino-bola', tipo: 'escala', tag: 'Treino',
    texto: 'Treino bom é treino com bola, em campo reduzido, todo dia.',
    eixos: { posse: 1, pressao: 0.5 },
  },
  {
    id: 'grupo-nas-maos', tipo: 'escala', tag: 'Vestiário',
    texto: 'Ter o grupo nas mãos vale mais do que ter uma ideia de jogo.',
    eixos: { liberdade: 1, rotacao: -0.5 },
  },
  {
    id: 'substituicao', tipo: 'escala', tag: 'Beira do campo',
    texto: 'Substituição boa é feita antes dos 60 minutos.',
    eixos: { rotacao: 1, risco: 0.5 },
  },
  {
    id: 'estuda-adversario', tipo: 'escala', tag: 'Estratégia',
    texto: 'Estudo mais o adversário do que o meu próprio time.',
    eixos: { risco: -1, liberdade: -0.5 },
  },
  {
    id: 'rodizio-desculpa', tipo: 'escala', tag: 'Gestão',
    texto: 'Rodízio é desculpa de quem não sabe qual é o seu time.',
    eixos: { rotacao: -2 },
  },
];

export const TIME = [
  {
    id: 'centroavante', nucleo: TM, tipo: 'escolha', tag: 'Elenco',
    texto: 'Quem você quer como centroavante?',
    opcoes: [
      { texto: 'Camisa 9 de área, forte no cabeceio e no pivô.', efeito: { referencia: 2 } },
      { texto: 'Falso 9 que sai da área para tabelar.', efeito: { referencia: -2, posse: 1 } },
      { texto: 'Atacante veloz que ataca as costas da zaga.', efeito: { referencia: -1, posse: -1 } },
      { texto: 'Um artilheiro, não importa o estilo.', efeito: { referencia: 1 } },
    ],
  },
  {
    id: 'janela', nucleo: TM, tipo: 'escolha', tag: 'Elenco',
    texto: 'Na janela de transferências, seu clube deve…',
    opcoes: [
      { texto: 'Contratar estrelas consagradas, custe o que custar.', efeito: { estrelas: 2, juventude: -1 } },
      { texto: 'Comprar jovens promissores para valorizar e vender.', efeito: { juventude: 2, estrelas: -0.5, modelo: 1 } },
      { texto: 'Subir garotos da base e trazer poucos reforços.', efeito: { juventude: 2, estrelas: -1, modelo: -0.5 } },
      { texto: 'Trazer veteranos experientes e baratos.', efeito: { juventude: -2, estrelas: -1 } },
    ],
  },
  {
    id: 'operarios', tipo: 'escala', tag: 'Elenco',
    texto: 'Prefiro um time de operários unidos a um time cheio de estrelas.',
    eixos: { estrelas: -2 },
  },
  {
    id: 'arquibancada', nucleo: TM, tipo: 'escolha', tag: 'Identidade',
    texto: 'Que arquibancada você quer ver no dia do jogo?',
    opcoes: [
      { texto: 'Estádio gigante lotado. A maior torcida do país.', efeito: { massa: 2 } },
      { texto: 'Estádio de tradição, torcida apaixonada e fiel.', efeito: { massa: 1, tradicao: 1 } },
      { texto: 'Estádio pequeno, onde todo mundo se conhece.', efeito: { massa: -2 } },
      { texto: 'Arena moderna de um clube em crescimento.', efeito: { massa: -1, tradicao: -1, modelo: 1 } },
    ],
  },
  {
    id: 'camisa-pesada', tipo: 'escala', tag: 'Identidade',
    texto: 'Camisa pesada ganha jogo.',
    eixos: { tradicao: 2 },
  },
  {
    id: 'gestao', nucleo: TM, tipo: 'escolha', tag: 'Identidade',
    texto: 'Como seu clube deve ser administrado?',
    opcoes: [
      { texto: 'SAF com um dono investidor e dinheiro para gastar.', efeito: { modelo: 2 } },
      { texto: 'Clube associativo, dos sócios, mesmo com menos dinheiro.', efeito: { modelo: -2 } },
      { texto: 'Empresa multinacional com projeto global.', efeito: { modelo: 2, tradicao: -1 } },
      { texto: 'Associativo, com gestão profissional e contas em dia.', efeito: { modelo: -1 } },
    ],
  },
  {
    id: 'regiao', nucleo: TM, tipo: 'regiao', tag: 'Identidade',
    texto: 'De que região você quer que seja o seu clube?',
  },
  {
    id: 'camisa-10-time', tipo: 'escolha', tag: 'Elenco',
    texto: 'O jogador que mais representa o seu time ideal é…',
    opcoes: [
      { texto: 'Camisa 10 clássico, que pensa o jogo.', efeito: { estrelas: 1, liberdade: 1, posse: 1 } },
      { texto: 'Volante raçudo, que vibra com um desarme.', efeito: { pressao: 1, estrelas: -1 } },
      { texto: 'Ponta driblador, que decide no um contra um.', efeito: { corredor: 1, liberdade: 1 } },
      { texto: 'Zagueiro xerife, líder do vestiário.', efeito: { risco: -1, juventude: -1 } },
    ],
  },
  {
    id: 'vender-joia', tipo: 'escala', tag: 'Elenco',
    texto: 'Vale vender a maior joia da base para equilibrar as contas.',
    eixos: { modelo: 1, estrelas: -1 },
  },
  {
    id: 'veteranos', tipo: 'escala', tag: 'Elenco',
    texto: 'Um time precisa de veteranos para ganhar títulos.',
    eixos: { juventude: -2 },
  },
  {
    id: 'jogo-aereo', tipo: 'escala', tag: 'Elenco',
    texto: 'Jogo aéreo ainda decide campeonato.',
    eixos: { referencia: 1.5, corredor: 0.5 },
  },
  {
    id: 'historia-propria', tipo: 'escala', tag: 'Identidade',
    texto: 'Prefiro um time que está construindo a própria história a um que vive do passado.',
    eixos: { tradicao: -2 },
  },
  {
    id: 'conquista', tipo: 'escolha', tag: 'Identidade',
    texto: 'Qual conquista mais te emociona?',
    opcoes: [
      { texto: 'Título com estádio lotado em cima do rival.', efeito: { massa: 1, tradicao: 1 } },
      { texto: 'Acesso ou classificação histórica de um clube pequeno.', efeito: { massa: -2, tradicao: -1 } },
      { texto: 'Libertadores, a obsessão sul-americana.', efeito: { tradicao: 1, estrelas: 1 } },
      { texto: 'Revelar um craque que vira ídolo da Seleção.', efeito: { juventude: 2 } },
    ],
  },
  {
    id: 'torcida-dinheiro', tipo: 'escala', tag: 'Identidade',
    texto: 'Torcida grande importa mais do que dinheiro em caixa.',
    eixos: { massa: 1, modelo: -1 },
  },
];

// Formações do seletor. `linhas` = [posição no comprimento (0–105), quantidade].
export const FORMACOES = [
  { id: '4-3-3', linhas: [[24, 4], [46, 3], [72, 3]], efeito: { posse: 1, corredor: 1, risco: 1, linha: 1 },
    nota: 'Pontas abertos e meio-campo com três.' },
  { id: '4-4-2', linhas: [[24, 4], [46, 4], [72, 2]], efeito: { posse: -1, corredor: 1, liberdade: -1, risco: -0.5 },
    nota: 'Duas linhas de quatro e dupla de ataque.' },
  { id: '4-2-3-1', linhas: [[24, 4], [40, 2], [58, 3], [76, 1]], efeito: { liberdade: 0.5 },
    nota: 'O padrão do futebol brasileiro atual.' },
  { id: '4-2-2-2', linhas: [[24, 4], [40, 2], [60, 2], [78, 2]], efeito: { liberdade: 2, corredor: -1, risco: 1 },
    nota: 'O quadrado mágico de Telê e Luxemburgo.' },
  { id: '3-5-2', linhas: [[24, 3], [46, 5], [74, 2]], efeito: { corredor: 2, risco: 0.5 },
    nota: 'Três zagueiros e alas fazendo o corredor todo.' },
  { id: '3-4-3', linhas: [[26, 3], [48, 4], [74, 3]], efeito: { risco: 2, linha: 2, pressao: 1 },
    nota: 'Muita gente na frente, como os times de Sampaoli.' },
  { id: '4-1-4-1', linhas: [[24, 4], [38, 1], [54, 4], [76, 1]], efeito: { posse: 1, risco: -1, liberdade: -1 },
    nota: 'Um volante de proteção e linhas bem próximas.' },
  { id: '5-3-2', linhas: [[22, 5], [44, 3], [70, 2]], efeito: { linha: -2, risco: -2, posse: -1 },
    nota: 'Cinco atrás, bloco baixo e contra-ataque.' },
];

// Zonas do campo (coordenadas no campo de 105 × 68, atacando para a direita).
export const ZONAS = [
  { id: 'contra', nome: 'Contra-ataque desde o nosso campo', rects: [[0, 0, 50, 68]],
    efeito: { posse: -2, risco: 0.5, saida: -0.5 } },
  { id: 'pontas', nome: 'Pelas pontas', rects: [[50, 0, 38.5, 13.8], [50, 54.2, 38.5, 13.8]],
    efeito: { corredor: 2 } },
  { id: 'entrelinhas', nome: 'Entrelinhas, pelo meio', rects: [[50, 13.8, 38.5, 40.4]],
    efeito: { corredor: -2, posse: 1, liberdade: 0.5 } },
  { id: 'area', nome: 'Na área, pelo alto', rects: [[88.5, 13.8, 16.5, 40.4]],
    efeito: { corredor: 1, saida: -1, referencia: 1 } },
];
