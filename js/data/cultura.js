// Perguntas do tema "cultura pop e sociedade".
// O jogador responde sobre música, cinema, arquitetura, engenharia, games, cidade, política e
// comportamento. Por trás, cada resposta move os mesmos eixos de futebol das perguntas táticas:
//
//   posse      paciência e controle         ↔  ritmo rápido e direto
//   linha      ocupar espaço, proximidade   ↔  recuo e cautela
//   pressao    intensidade sem trégua       ↔  esperar e recompor
//   saida      construir passo a passo      ↔  atalhos e grandes saltos
//   corredor   amplitude, visão panorâmica  ↔  foco no centro
//   risco      ousadia e experimentação     ↔  segurança
//   liberdade  improviso                    ↔  roteiro e estrutura
//   rotacao    variedade e revezamento      ↔  fidelidade ao mesmo
//   estrelas / juventude / referencia / massa / tradicao / modelo  (modo time)
//
// Mesmo formato de js/data/perguntas.js. Escolhas sempre com 4 alternativas.
// As perguntas falam só dos gostos da pessoa: nada de time, jogo, bola ou bordões de futebol
// no texto. A ligação com o futebol fica apenas nos efeitos.

const AMBOS = ['treinador', 'time'];
const T = ['treinador'];
const TM = ['time'];

export const CULTURA = [
  {
    id: 'c-show', tipo: 'escolha', tag: 'Música', nucleo: AMBOS,
    texto: 'Que show você não perderia de jeito nenhum?',
    opcoes: [
      { texto: 'Orquestra sinfônica: cada nota exatamente no lugar.', efeito: { liberdade: -2, posse: 1 } },
      { texto: 'Roda de samba ou jazz, tudo no improviso.', efeito: { liberdade: 2 } },
      { texto: 'Festival com 50 bandas em três palcos.', efeito: { rotacao: 2, corredor: 1 } },
      { texto: 'Banda punk num lugar pequeno, pogo do começo ao fim.', efeito: { pressao: 2, posse: -1, risco: 1 } },
    ],
  },
  {
    id: 'c-games', tipo: 'escolha', tag: 'Games', nucleo: AMBOS,
    texto: 'Qual é o seu estilo nos games?',
    opcoes: [
      { texto: 'Estratégia por turnos: penso cada jogada.', efeito: { posse: 2, saida: 1 } },
      { texto: 'Tiro em primeira pessoa, frenético.', efeito: { pressao: 2, posse: -1 } },
      { texto: 'Mundo aberto, explorando cada canto do mapa.', efeito: { liberdade: 2, corredor: 1 } },
      { texto: 'Speedrun: atalhos para chegar ao fim o mais rápido possível.', efeito: { saida: -2, posse: -1, risco: 1 } },
    ],
  },
  {
    id: 'c-morar-centro', tipo: 'escala', tag: 'Cidade', nucleo: AMBOS,
    texto: 'Prefiro morar no centro, perto de tudo, mesmo que seja apertado.',
    eixos: { linha: 1.5, risco: 0.5 },
  },
  {
    id: 'c-volume', tipo: 'slider', tag: 'Música', nucleo: AMBOS, visual: 'numero',
    texto: 'Sua música preferida começa a tocar no carro. Até onde vai o volume?',
    rotulos: ['Baixinho', 'No talo'], passos: ['2', '4', '6', '8', '10'], unidade: 'de 10 no volume',
    eixos: { pressao: 2, risco: 0.5 },
  },
  {
    id: 'c-assalto', tipo: 'escolha', tag: 'Cinema', nucleo: AMBOS,
    texto: 'Num filme de assalto, que papel seria o seu?',
    opcoes: [
      { texto: 'O cérebro que planeja cada passo do golpe.', efeito: { saida: 2, liberdade: -1 } },
      { texto: 'O motorista da fuga, rápido e direto.', efeito: { posse: -2, pressao: 1, saida: -1 } },
      { texto: 'O infiltrado que improvisa quando tudo dá errado.', efeito: { liberdade: 2, risco: 1 } },
      { texto: 'O hacker que controla tudo de longe, sem pressa.', efeito: { posse: 2, linha: -1 } },
    ],
  },
  {
    id: 'c-foto', tipo: 'escolha', tag: 'Fotografia', nucleo: AMBOS,
    texto: 'Qual foto você penduraria na parede?',
    opcoes: [
      { texto: 'Uma panorâmica que mostra a paisagem inteira.', efeito: { corredor: 2 } },
      { texto: 'Um retrato de perto, com todo o foco no rosto.', efeito: { corredor: -2 } },
      { texto: 'Uma foto de ação congelando o movimento.', efeito: { pressao: 1, posse: -1 } },
      { texto: 'Uma foto posada, com cada detalhe no lugar.', efeito: { liberdade: -2 } },
    ],
  },
  {
    id: 'c-ponte', tipo: 'escolha', tag: 'Engenharia', nucleo: AMBOS,
    texto: 'Você vai projetar uma ponte. Qual?',
    opcoes: [
      { texto: 'Uma ponte estaiada ousada, que vira cartão-postal.', efeito: { risco: 2, linha: 1 } },
      { texto: 'Uma ponte em arco de pedra, feita para durar séculos.', efeito: { risco: -2, tradicao: 1 } },
      { texto: 'Várias pontes pequenas ligando todos os bairros.', efeito: { corredor: 2, rotacao: 1 } },
      { texto: 'Um túnel. Ninguém vê, mas resolve o problema.', efeito: { risco: -1, liberdade: -1, posse: -0.5 } },
    ],
  },
  {
    id: 'c-predio', tipo: 'escolha', tag: 'Arquitetura',
    texto: 'Que prédio você assinaria?',
    opcoes: [
      { texto: 'Curvas livres de concreto, como Niemeyer.', efeito: { liberdade: 2, risco: 1 } },
      { texto: 'Um vão livre enorme para o povo ocupar, como o MASP de Lina Bo Bardi.', efeito: { corredor: 1, linha: 1, massa: 1 } },
      { texto: 'Casa modular, simples, barata e eficiente.', efeito: { liberdade: -1, risco: -1, saida: 1 } },
      { texto: 'A restauração de um casarão colonial.', efeito: { tradicao: 2, risco: -1 } },
    ],
  },
  {
    id: 'c-diretor', tipo: 'escolha', tag: 'Cinema',
    texto: 'Se você fosse diretor de cinema, seu estilo seria…',
    opcoes: [
      { texto: 'Perfeccionista, planejando cada plano como Kubrick.', efeito: { liberdade: -2, posse: 1 } },
      { texto: 'Diálogos longos e uma explosão no final, como Tarantino.', efeito: { posse: 1, risco: 1 } },
      { texto: 'Câmera na mão e ritmo frenético, como em Cidade de Deus.', efeito: { pressao: 2, posse: -1, liberdade: 1 } },
      { texto: 'Blockbuster que lota cinema no mundo todo, como Spielberg.', efeito: { risco: -0.5, massa: 1, estrelas: 1 } },
    ],
  },
  {
    id: 'c-trilha', tipo: 'escolha', tag: 'Música',
    texto: 'Qual seria a trilha sonora da sua vida?',
    opcoes: [
      { texto: 'Bossa nova: toque suave e muita paciência.', efeito: { posse: 2, risco: -0.5 } },
      { texto: 'Samba-enredo: a bateria inteira pulsando junto.', efeito: { pressao: 1, corredor: 1 } },
      { texto: 'Rock nacional dos anos 80: atitude e volume.', efeito: { risco: 1.5, pressao: 0.5 } },
      { texto: 'Forró pé de serra: simples, direto e para dançar.', efeito: { saida: -1, liberdade: 1 } },
    ],
  },
  {
    id: 'c-banda-papel', tipo: 'escolha', tag: 'Música',
    texto: 'Numa banda, você seria…',
    opcoes: [
      { texto: 'O baterista que segura o ritmo para todo mundo.', efeito: { liberdade: -1, risco: -1 } },
      { texto: 'O guitarrista que faz o solo.', efeito: { liberdade: 2, estrelas: 1 } },
      { texto: 'O baixista que liga tudo sem aparecer.', efeito: { saida: 2, posse: 1 } },
      { texto: 'O vocalista que incendeia a plateia.', efeito: { pressao: 1, referencia: 1 } },
    ],
  },
  {
    id: 'c-viagem', tipo: 'escolha', tag: 'Viagem',
    texto: 'Como é a sua viagem ideal?',
    opcoes: [
      { texto: 'Roteiro detalhado, hora por hora.', efeito: { liberdade: -2, saida: 1 } },
      { texto: 'Mochilão sem plano nenhum.', efeito: { liberdade: 2, risco: 1 } },
      { texto: 'A mesma praia de sempre, todo ano.', efeito: { rotacao: -2, risco: -1 } },
      { texto: 'Dez cidades em dez dias.', efeito: { rotacao: 2, pressao: 1 } },
    ],
  },
  {
    id: 'c-cozinha', tipo: 'escolha', tag: 'Cozinha',
    texto: 'Na cozinha, você é de…',
    opcoes: [
      { texto: 'Seguir a receita à risca, grama por grama.', efeito: { liberdade: -2 } },
      { texto: 'Improvisar com o que tem na geladeira.', efeito: { liberdade: 2, risco: 0.5 } },
      { texto: 'Fazer o prato de domingo da avó, sempre igual.', efeito: { rotacao: -2, tradicao: 1 } },
      { texto: 'Cozinhar devagar, horas de fogo baixo.', efeito: { posse: 2, saida: 1 } },
    ],
  },
  {
    id: 'c-livro', tipo: 'escolha', tag: 'Livros',
    texto: 'Qual livro fica na sua cabeceira?',
    opcoes: [
      { texto: 'Um policial cheio de pistas, montando o quebra-cabeça.', efeito: { saida: 1, posse: 1 } },
      { texto: 'Poesia sem métrica e sem regra.', efeito: { liberdade: 2 } },
      { texto: 'A biografia de um grande líder.', efeito: { liberdade: -0.5, referencia: 1, estrelas: 1 } },
      { texto: 'Ficção científica ousada sobre o futuro.', efeito: { risco: 2, juventude: 1 } },
    ],
  },
  {
    id: 'c-grupo-escola', tipo: 'escolha', tag: 'Comportamento',
    texto: 'No trabalho em grupo da escola, você era quem…',
    opcoes: [
      { texto: 'Organizava tudo e dividia as tarefas.', efeito: { liberdade: -1, saida: 1 } },
      { texto: 'Fazia a apresentação brilhante no final.', efeito: { liberdade: 1, estrelas: 1 } },
      { texto: 'Cobrava todo mundo para entregar no prazo.', efeito: { pressao: 2 } },
      { texto: 'Fazia a parte mais difícil sozinho.', efeito: { referencia: 1, posse: -1 } },
    ],
  },
  {
    id: 'c-transito', tipo: 'escolha', tag: 'Cidade',
    texto: 'Para resolver o trânsito de uma cidade grande, a melhor aposta é…',
    opcoes: [
      { texto: 'Metrô e trem ligando o centro.', efeito: { corredor: -1, saida: 1 } },
      { texto: 'Ciclovias e ônibus espalhados por todos os bairros.', efeito: { corredor: 2 } },
      { texto: 'Avenidas largas e expressas.', efeito: { posse: -1, saida: -1 } },
      { texto: 'Trabalho remoto e menos gente na rua.', efeito: { linha: -1, risco: -1 } },
    ],
  },
  {
    id: 'c-governante', tipo: 'escolha', tag: 'Política',
    texto: 'Para você, um bom governante é quem…',
    opcoes: [
      { texto: 'Cumpre o plano de governo à risca.', efeito: { liberdade: -2 } },
      { texto: 'Se adapta a cada crise que aparece.', efeito: { risco: -1, liberdade: 0.5 } },
      { texto: 'Ouve a população o tempo todo e muda de rumo se preciso.', efeito: { rotacao: 1, liberdade: 1 } },
      { texto: 'Faz obras grandes e ousadas.', efeito: { risco: 2 } },
    ],
  },
  {
    id: 'c-bairro', tipo: 'escolha', tag: 'Sociedade',
    texto: 'Você quer mudar algo no seu bairro. O que faz?',
    opcoes: [
      { texto: 'Organizo reuniões e um abaixo-assinado, passo a passo.', efeito: { saida: 2, posse: 1 } },
      { texto: 'Vou direto à prefeitura cobrar.', efeito: { pressao: 2, linha: 1 } },
      { texto: 'Espero a próxima eleição para votar diferente.', efeito: { pressao: -1, risco: -1 } },
      { texto: 'Resolvo por conta própria com os vizinhos.', efeito: { liberdade: 2 } },
    ],
  },
  {
    id: 'c-decisao', tipo: 'escolha', tag: 'Sociedade',
    texto: 'Num grupo, decisões importantes devem ser tomadas…',
    opcoes: [
      { texto: 'Em assembleia, até chegar a um consenso.', efeito: { posse: 1, rotacao: 1 } },
      { texto: 'Pela pessoa mais experiente.', efeito: { liberdade: -1, rotacao: -1, juventude: -1 } },
      { texto: 'Com base em dados e especialistas.', efeito: { liberdade: -1, risco: -1 } },
      { texto: 'Rápido, por votação, e sem voltar atrás.', efeito: { pressao: 1, posse: -1 } },
    ],
  },
  {
    id: 'c-planejamento', tipo: 'slider', tag: 'Engenharia', visual: 'numero',
    texto: 'Antes de começar um projeto, quanto tempo você passa planejando?',
    rotulos: ['Começo já', 'Planejo muito'], passos: ['0 h', '1 h', '3 h', '1 dia', '1 semana'], unidade: 'de planejamento',
    eixos: { liberdade: -1.5, saida: 1 },
  },
  {
    id: 'c-equipe', tipo: 'slider', tag: 'Trabalho', visual: 'numero',
    texto: 'Quantas pessoas você chama para tocar um projeto importante?',
    rotulos: ['Só eu', 'Muita gente'], passos: ['1', '2', '4', '8', '15'], unidade: 'pessoas na equipe',
    eixos: { corredor: 1, rotacao: 1, posse: 0.5 },
  },
  {
    id: 'c-gradual', tipo: 'escala', tag: 'Sociedade',
    texto: 'Mudanças na sociedade devem ser graduais, não bruscas.',
    eixos: { risco: -1.5, saida: 0.5 },
  },
  {
    id: 'c-regras', tipo: 'escala', tag: 'Comportamento',
    texto: 'Regras existem para serem seguidas, mesmo quando ninguém está olhando.',
    eixos: { liberdade: -1.5 },
  },
  {
    id: 'c-surpresas', tipo: 'escala', tag: 'Comportamento',
    texto: 'Gosto de surpresas, mesmo quando dão errado.',
    eixos: { risco: 1.5, liberdade: 0.5 },
  },
  {
    id: 'c-equipe-sozinho', tipo: 'escala', tag: 'Trabalho',
    texto: 'Prefiro trabalhar em equipe a trabalhar sozinho, mesmo que demore mais.',
    eixos: { posse: 1, liberdade: -0.5, estrelas: -0.5 },
  },
  {
    id: 'c-90-pronto', tipo: 'escala', tag: 'Engenharia',
    texto: 'Melhor um projeto 90% pronto hoje do que 100% daqui a um ano.',
    eixos: { risco: 1, saida: -1, pressao: 0.5 },
  },
  {
    id: 'c-xadrez', tipo: 'escala', tag: 'Jogos',
    texto: 'No xadrez, prefiro atacar o rei cedo a controlar o centro com calma.',
    eixos: { risco: 1, posse: -1, pressao: 1 },
  },
  {
    id: 'c-maratona', tipo: 'escala', tag: 'Séries',
    texto: 'Prefiro maratonar uma temporada inteira num fim de semana a ver um episódio por semana.',
    eixos: { pressao: 1, posse: -0.5 },
  },
  {
    id: 'c-debate', tipo: 'escala', tag: 'Política',
    texto: 'Um debate acalorado vale mais do que um consenso morno.',
    eixos: { pressao: 1, risco: 1 },
  },
  {
    id: 'c-servicos', tipo: 'escala', tag: 'Cidade',
    texto: 'Uma cidade só funciona quando os serviços chegam também aos bairros mais distantes.',
    eixos: { corredor: 1.5 },
  },
  {
    id: 'c-comunidade', tipo: 'escala', tag: 'Sociedade',
    texto: 'Uma comunidade forte depende mais de cada um cumprir seu papel do que de grandes líderes.',
    eixos: { liberdade: -1, estrelas: -1 },
  },
];

export const CULTURA_TREINADOR = [
  {
    id: 'c-playlist', tipo: 'escolha', tag: 'Música', nucleo: T,
    texto: 'Como você ouve música?',
    opcoes: [
      { texto: 'A mesma playlist há anos.', efeito: { rotacao: -2 } },
      { texto: 'No aleatório, sempre algo diferente.', efeito: { rotacao: 2 } },
      { texto: 'Muda conforme o humor do dia.', efeito: { rotacao: 1, liberdade: 0.5 } },
      { texto: 'O álbum inteiro, na ordem, do começo ao fim.', efeito: { rotacao: -1, posse: 1 } },
    ],
  },
  {
    id: 'c-liderar', tipo: 'escolha', tag: 'Trabalho',
    texto: 'Liderando uma equipe de trabalho, você…',
    opcoes: [
      { texto: 'Dá uma função fixa para cada um.', efeito: { rotacao: -1, liberdade: -1 } },
      { texto: 'Troca as funções para todos aprenderem tudo.', efeito: { rotacao: 2 } },
      { texto: 'Deixa o grupo se organizar sozinho.', efeito: { liberdade: 2 } },
      { texto: 'Cobra resultado de perto, todo dia.', efeito: { pressao: 1, liberdade: -1 } },
    ],
  },
  {
    id: 'c-restaurante', tipo: 'escolha', tag: 'Cozinha',
    texto: 'No seu restaurante favorito, você…',
    opcoes: [
      { texto: 'Pede sempre o mesmo prato.', efeito: { rotacao: -2 } },
      { texto: 'Pede algo diferente a cada visita.', efeito: { rotacao: 2 } },
      { texto: 'Pede o que o chef recomendar.', efeito: { liberdade: -1, risco: 0.5 } },
      { texto: 'Pede vários pratos para a mesa dividir.', efeito: { corredor: 1, rotacao: 1 } },
    ],
  },
  {
    id: 'c-montar-equipe', tipo: 'escolha', tag: 'Trabalho',
    texto: 'Para um projeto novo, quem você chama?',
    opcoes: [
      { texto: 'Os mesmos de sempre, de confiança.', efeito: { rotacao: -2 } },
      { texto: 'Gente nova a cada projeto.', efeito: { rotacao: 2, risco: 0.5 } },
      { texto: 'Os mais talentosos, mesmo que sejam difíceis.', efeito: { liberdade: 1, risco: 1 } },
      { texto: 'Um grupo grande, para revezar conforme a fase.', efeito: { rotacao: 1, corredor: 0.5 } },
    ],
  },
  {
    id: 'c-ganhando', tipo: 'escala', tag: 'Comportamento',
    texto: 'Se uma coisa está dando certo, não vejo motivo para mudar.',
    eixos: { rotacao: -2 },
  },
  {
    id: 'c-series-varias', tipo: 'escala', tag: 'Séries',
    texto: 'Gosto de acompanhar várias séries ao mesmo tempo.',
    eixos: { rotacao: 1.5 },
  },
];

export const CULTURA_TIME = [
  {
    id: 'c-cinema-sessao', tipo: 'escolha', tag: 'Cinema', nucleo: TM,
    texto: 'Que sessão de cinema você escolhe?',
    opcoes: [
      { texto: 'O filme de super-herói com elenco estrelado.', efeito: { estrelas: 2, massa: 1 } },
      { texto: 'O independente premiado em festival.', efeito: { estrelas: -2, massa: -1 } },
      { texto: 'Um clássico restaurado em sessão especial.', efeito: { tradicao: 2, juventude: -1 } },
      { texto: 'A estreia de um diretor jovem brasileiro.', efeito: { juventude: 2, modelo: -1 } },
    ],
  },
  {
    id: 'c-banda-palco', tipo: 'escolha', tag: 'Música', nucleo: TM,
    texto: 'No palco, você prefere…',
    opcoes: [
      { texto: 'Um vocalista carismático no centro de tudo.', efeito: { referencia: 2 } },
      { texto: 'Uma orquestra em que ninguém aparece mais que ninguém.', efeito: { referencia: -2, estrelas: -1 } },
      { texto: 'Uma dupla, duas vozes juntas.', efeito: { referencia: 0.5, massa: 1 } },
      { texto: 'Um coletivo que troca de instrumento no meio do show.', efeito: { referencia: -1, liberdade: 1 } },
    ],
  },
  {
    id: 'c-empresa', tipo: 'escolha', tag: 'Mercado', nucleo: TM,
    texto: 'Em que empresa você gostaria de trabalhar?',
    opcoes: [
      { texto: 'Startup com investidor e crescimento acelerado.', efeito: { modelo: 2, juventude: 1 } },
      { texto: 'Cooperativa em que todos são donos.', efeito: { modelo: -2 } },
      { texto: 'Multinacional presente no mundo inteiro.', efeito: { modelo: 2, tradicao: -1 } },
      { texto: 'Empresa familiar de três gerações.', efeito: { modelo: -1, tradicao: 1 } },
    ],
  },
  {
    id: 'c-regiao', tipo: 'regiao', tag: 'Brasil', nucleo: TM,
    texto: 'Que paisagem tem a sua cara?',
    opcoes: [
      { valor: 'rj', texto: 'Praia, samba e o Cristo lá em cima.' },
      { valor: 'sp', texto: 'Metrópole que não dorme e trânsito na marginal.' },
      { valor: 'mg', texto: 'Montanha, pão de queijo e boteco.' },
      { valor: 'sul', texto: 'Chimarrão, frio e serra.' },
      { valor: 'ne', texto: 'Forró, calor o ano todo e açaí de verdade.' },
      { valor: 'qualquer', texto: 'Qualquer lugar, desde que a companhia seja boa.' },
    ],
  },
  {
    id: 'c-musica-nova', tipo: 'escolha', tag: 'Música',
    texto: 'Na música, você prefere…',
    opcoes: [
      { texto: 'Artistas que acabaram de surgir.', efeito: { juventude: 2 } },
      { texto: 'Lendas consagradas.', efeito: { juventude: -2, tradicao: 1 } },
      { texto: 'Revelações de festivais pequenos.', efeito: { juventude: 1, massa: -1 } },
      { texto: 'Bandas antigas em turnê de reencontro.', efeito: { juventude: -1, tradicao: 1, massa: 1 } },
    ],
  },
  {
    id: 'c-festa', tipo: 'escolha', tag: 'Cultura popular',
    texto: 'Qual festa você escolheria?',
    opcoes: [
      { texto: 'Carnaval com milhões de pessoas na rua.', efeito: { massa: 2 } },
      { texto: 'Festa junina do interior.', efeito: { massa: -1, tradicao: 1 } },
      { texto: 'Festival novo com atrações internacionais.', efeito: { tradicao: -1, estrelas: 1, modelo: 1 } },
      { texto: 'Lançamento de um coletivo independente.', efeito: { massa: -2, modelo: -1 } },
    ],
  },
  {
    id: 'c-estadio-80mil', tipo: 'escala', tag: 'Música',
    texto: 'Show bom é show em estádio com 80 mil pessoas.',
    eixos: { massa: 2 },
  },
  {
    id: 'c-restaurar', tipo: 'escala', tag: 'Arquitetura',
    texto: 'Prédio antigo deve ser restaurado, não demolido, mesmo que um novo seja mais útil.',
    eixos: { tradicao: 2 },
  },
  {
    id: 'c-investimento', tipo: 'escala', tag: 'Mercado',
    texto: 'Investimento privado é o melhor caminho para um projeto crescer.',
    eixos: { modelo: 2 },
  },
  {
    id: 'c-experiencia', tipo: 'escala', tag: 'Trabalho',
    texto: 'Experiência vale mais do que talento jovem.',
    eixos: { juventude: -2 },
  },
  {
    id: 'c-comunidade-grande', tipo: 'escala', tag: 'Sociedade',
    texto: 'Uma comunidade grande e barulhenta vale mais do que um grupo pequeno e organizado.',
    eixos: { massa: 1.5, liberdade: 0.5 },
  },
];
