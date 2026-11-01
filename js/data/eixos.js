// Cada eixo vai de 0 (polo esquerdo) a 100 (polo direito).
// O peso define quanto o eixo conta na distância entre o jogador e um perfil.

export const EIXOS_TATICOS = [
  { id: 'posse', nome: 'Controle de bola', esq: 'Transição', dir: 'Posse', peso: 1.2 },
  { id: 'linha', nome: 'Altura da defesa', esq: 'Bloco baixo', dir: 'Linha alta', peso: 1 },
  { id: 'pressao', nome: 'Sem a bola', esq: 'Recomposição', dir: 'Pressão pós-perda', peso: 1 },
  { id: 'saida', nome: 'Construção', esq: 'Bola longa', dir: 'Saída curta', peso: 1 },
  { id: 'corredor', nome: 'Zona de ataque', esq: 'Pelo meio', dir: 'Pelos lados', peso: 0.8 },
  { id: 'risco', nome: 'Mentalidade', esq: 'Pragmático', dir: 'Ofensivo', peso: 1.2 },
  { id: 'liberdade', nome: 'Organização', esq: 'Sistema rígido', dir: 'Liberdade criativa', peso: 1 },
];

export const EIXO_ROTACAO = { id: 'rotacao', nome: 'Gestão do elenco', esq: 'Time-base', dir: 'Rodízio', peso: 0.8 };

export const EIXOS_ELENCO = [
  { id: 'estrelas', nome: 'Elenco', esq: 'Operários', dir: 'Estrelas', peso: 0.8 },
  { id: 'juventude', nome: 'Idade', esq: 'Experiência', dir: 'Juventude e base', peso: 0.7 },
  { id: 'referencia', nome: 'Centroavante', esq: 'Ataque móvel', dir: 'Referência na área', peso: 0.7 },
];

export const EIXOS_IDENTIDADE = [
  { id: 'massa', nome: 'Torcida', esq: 'Clube pequeno', dir: 'Gigante de massa', peso: 1.1 },
  { id: 'tradicao', nome: 'História', esq: 'Projeto novo', dir: 'Tradição e títulos', peso: 1 },
  { id: 'modelo', nome: 'Gestão', esq: 'Associativo', dir: 'SAF / empresa', peso: 0.9 },
];

export const EIXOS = {
  treinador: [...EIXOS_TATICOS, EIXO_ROTACAO],
  time: [...EIXOS_TATICOS, ...EIXOS_ELENCO, ...EIXOS_IDENTIDADE],
};

export const REGIOES = {
  rj: 'Rio de Janeiro',
  sp: 'São Paulo',
  mg: 'Minas Gerais',
  sul: 'Sul',
  ne: 'Nordeste e Norte',
};

// Situação da base: 33ª rodada do Brasileirão 2026 (31/10/2026).
export const ATUALIZADO_EM = '33ª rodada do Brasileirão 2026 · 31/10/2026';
