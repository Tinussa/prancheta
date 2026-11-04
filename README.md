# Prancheta

Jogo de escolhas sobre tática e fundamentos do futebol brasileiro, com dois modos:

- **Qual treinador você seria?** compara seu estilo com 69 treinadores que trabalharam no Brasil (Série A 2026, passagens recentes e lendas).
- **Qual time tem a sua cara?** compara com os 20 clubes da Série A 2026 e 26 times históricos (campeões, vices e zebras como Santo André 2004 e Paysandu 2003), somando tática, elenco e identidade do clube.

- **Qual time você está pensando?** descobre o time entre 275 clubes (Séries A, B e C de 2026, tradicionais da Série D e toda a primeira divisão dos 27 estaduais de 2026), sem perguntar o estado direto. Clubes que só disputam o estadual têm `serie: 'E'`. Tem dois modos:
  - **Modo fácil**: adivinhação estilo Akinator, perguntando quanto for preciso, com até 3 palpites. Depois de 3 palpites errados, o jogador digita o time (busca por nome, apelido ou cidade; se não estiver na base, o nome digitado é enviado ao Formspree).
  - **Modo difícil**: 15 perguntas fixas (quiz, mapa para tocar, camisa para pintar, sliders de fundação e tamanho da torcida, e duas perguntas finais com os candidatos). Mostra o time, os 5 mais parecidos e o oposto, que é o rival direto quando ele está na base (`RIVAL` em `js/torcida.js`). Dados em `js/data/torcida.js` (campos `null` = desconhecido, não pesam) e motor em `js/torcida.js`. Quando erra, o time certo é enviado ao Formspree para corrigir a base.

Nos dois primeiros modos, cada partida tem 15 perguntas (curta) ou 30 (completa), sorteadas do banco. O jogador escolhe responder com **futebol** (tática e seleções, mais de 50 perguntas por modo) ou com **cultura pop** (música, cinema, games, arquitetura, engenharia, cidade, política e comportamento, ~40 por modo). As perguntas de cultura pop movem os mesmos eixos de futebol; a tradução de cada tema está comentada no topo de `js/data/cultura.js`.

## Feedback (bug, melhoria, correção)

O botão **Feedback** no topo, os botões do rodapé e os links "Reportar problema nesta pergunta" e "Corrigir informação" abrem um formulário. Para onde ele envia é definido em `js/config.js`:

- `endpoint`: uma URL que recebe POST em JSON. O jeito mais simples é criar um formulário grátis no [Formspree](https://formspree.io) e colar a URL `https://formspree.io/f/...`. Os relatos chegam no seu e-mail.
- `email`: se preferir, um endereço; o site abre o app de e-mail do visitante com o relato pronto.

Com os dois vazios, o formulário mostra o relato pronto para o visitante copiar.

Site estático (HTML, CSS e JavaScript puro em módulos). Não há build nem dependências.

## Rodar no computador

Os módulos JavaScript não funcionam abrindo o `index.html` direto do disco. Use qualquer servidor estático na pasta, por exemplo:

```bash
npx serve .
```

ou

```bash
python -m http.server 8000
```

## Publicar na Vercel

1. Suba esta pasta para um repositório no GitHub.
2. Na Vercel, clique em **Add New → Project**, importe o repositório e deixe o framework como **Other** (sem comando de build, diretório de saída `.`).
3. Clique em **Deploy**. Domínio próprio em **Settings → Domains**.

Ou, com a CLI: `npx vercel` dentro da pasta.

## Onde ficam as coisas

| Arquivo | Conteúdo |
|---|---|
| `js/data/eixos.js` | Os eixos de estilo (0 a 100), pesos, regiões e data da última atualização |
| `js/data/treinadores.js` | Perfis de treinadores: notas por eixo, títulos, formação e descrição |
| `js/data/times.js` | Identidade dos clubes, times da Série A 2026 (com classificação) e esquadrões históricos |
| `js/data/perguntas.js` | Banco de perguntas de futebol (táticas, seleções, treinador, time), formações e zonas do campo |
| `js/data/cultura.js` | Banco de perguntas de cultura pop e sociedade, com a tradução para os eixos de futebol |
| `js/feedback.js` / `js/config.js` | Formulário de bug, melhoria e correção, e para onde ele envia |
| `js/data/fotos.js` | Fotos livres dos treinadores (Wikimedia), com o arquivo de origem para o crédito |
| `js/escudos.js` | Escudos estilizados em SVG: silhueta do escudo original + cores do clube |
| `js/engine.js` | Montagem do quiz, pontuação, ranking e link compartilhável (`?r=`) |
| `js/app.js` | Telas (início, quiz, resultado) e eventos |
| `js/card.js` | Card 1080 × 1920 para Stories, desenhado em canvas |
| `js/campo.js` | Campo de futebol em SVG |

## Como a pontuação funciona

Cada resposta soma pontos em um ou mais eixos. No fim, cada eixo vira uma nota de 0 a 100. A compatibilidade com cada perfil é `100 − 1,3 × distância`, onde a distância é a média ponderada (pela coluna `peso`) das diferenças ao quadrado entre as suas notas e as do perfil. No modo time, escolher a região do clube dá +5 aos clubes daquela região.

## Atualizar a base

- **Troca de técnico**: edite o time em `ATUAIS` (`js/data/times.js`) e, se for o caso, o `clube`/`tipo` do treinador em `js/data/treinadores.js`.
- **Nova rodada**: atualize `pos` e `pts` em `ATUAIS` e a constante `ATUALIZADO_EM` em `js/data/eixos.js`.
- **Notas táticas**: são curadas a partir de números públicos (Sofascore, FBref, ogol, Transfermarkt) e análise das campanhas. Ajuste os arrays `e`, `t` e `el`.
- **Nova pergunta**: adicione em `TATICAS`, `SELECOES`, `TREINADOR` ou `TIME`. Perguntas de escolha precisam de pelo menos 4 alternativas. Ela entra no sorteio automaticamente; `nucleo: [...]` faz ela aparecer sempre naquele modo (use só para garantir que todos os eixos sejam medidos) e `modos: [...]` restringe a um modo. Os tamanhos ficam em `TAMANHO` (`js/engine.js`).
- **Novo treinador com foto**: adicione o perfil em `treinadores.js` e a foto em `fotos.js` (use só imagens livres da Wikimedia e mantenha o nome do arquivo para o crédito). Sem foto, aparecem as iniciais.
- **Novo clube**: adicione em `CLUBES` com `escudo: [silhueta, padrão, cores]`. Silhuetas: `classico`, `arredondado`, `triangular`, `pentagono`, `redondo`. Padrões: `horizontal`, `vertical`, `vertical-topo`, `diagonal`, `faixa`, `estrela`, `cruzeiro`, `anel`, `metade`, `liso`.

Base conferida até a 33ª rodada do Brasileirão 2026 (31/10/2026).
