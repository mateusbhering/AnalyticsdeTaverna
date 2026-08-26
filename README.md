# Analytics de Taverna

Site institucional e experiência interativa de gamificação comportamental. O usuário tira uma foto, responde um quiz, recebe uma classe de RPG determinística, um avatar gerado por IA e um card digital compartilhável por link/QR Code. Escaneando o QR de outro aventureiro, os dois duelam pelos próprios atributos e sobem no ranking global.

🌐 **Produção:** [analyticsdetaverna.com.br](https://www.analyticsdetaverna.com.br)  
📦 **Repositório:** [github.com/mateusbhering/AnalyticsdeTaverna](https://github.com/mateusbhering/AnalyticsdeTaverna)

---

## Arquitetura em Três Peças

O projeto não é só o Next.js: são três serviços com responsabilidades separadas.

```
                     ┌──────────────────────────────────────┐
    Navegador ──────►│  Next.js (Vercel)                    │
                     │  landing, quiz, card, duelo, ranking │
                     └───────┬───────────────────────┬──────┘
                             │                       │
     foto (multipart) e      │                       │  insert / select
     duelo (POST) saem       │                       │  (chave anon)
     por /taverna-api;       │                       │
     o ranking é buscado     │                       │
     no servidor             ▼                       ▼
                 ┌────────────────────┐   ┌───────────────────────────┐
                 │ FastAPI (Render)   │   │ Supabase                  │
                 │ avatar-api         │   │ • tabela `jogadores`      │
                 │ + worker arq       │──►│ • tabela `batalhas`       │
                 │ + Redis (fila/TTL) │   │ • Storage bucket `avatars`│
                 └─────────┬──────────┘   └───────────────────────────┘
                           │ service_role
                           ▼
                    Google Gemini (imagem)
```

O navegador **nunca chama a Render pelo endereço dela**: o duelo sai para
`/taverna-api/*`, um rewrite do Next para o FastAPI. O ranking nem passa pelo
navegador — é buscado no servidor, pela URL absoluta. Ver
[Proxy de mesma origem](#proxy-de-mesma-origem).

| Peça | Onde roda | Responsabilidade |
|---|---|---|
| `rpg-site/` | Vercel | Landing, quiz, card do personagem, duelo, ranking, área admin |
| `rpg-site/backend/` | Render | Geração de avatar (Gemini), cadastro, batalha, ranking, analytics |
| Supabase | — | Postgres (`jogadores`, `batalhas`) + Storage dos avatares |

**Ciclo completo, ligado ponta a ponta:** quiz → classificação → `POST /avatar/generate` →
insert em `jogadores` pela chave anon → card por link único → QR do card →
`/batalha?oponenteId=…` → escolha de 3 atributos → `POST /batalha` → XP
distribuído → `/ranking` atualizado no mesmo instante.

**O que existe na API mas ainda não é consumido pelo front:** `/jogadores`,
`/personagem/gerar` e as rotas de `/analytics`. O cadastro do jogador continua
sendo feito pelo frontend direto no Supabase (chave anon), e a classificação
também — o backend já tem as duas coisas e é a fonte da verdade das regras,
mas a troca ainda não foi feita.

---

## Stack

### Frontend (`rpg-site/`)

| Tecnologia | Versão | Papel |
|---|---|---|
| Next.js | 16.2.6 | Framework (App Router, Turbopack) |
| React | 19.2.4 | UI |
| TypeScript | ^5 | Tipagem estática |
| Tailwind CSS | v4 | Estilização (plugin PostCSS) |
| motion | ^12.42 | Animações (reveal, count-up, tilt, scroll progress) |
| lucide-react | ^1.27 | Ícones (inclusive os dos 7 atributos) |
| @supabase/supabase-js | ^2.111 | Client do banco (anon, browser + servidor) |
| NextAuth.js | 5.0.0-beta.31 | Autenticação GitHub OAuth (área admin) |
| qrcode.react | 4.2.0 | QR Code SVG client-side (gera o do card) |
| jsqr | ^1.4 | Leitura do QR pela câmera (inicia o duelo) |

### Backend (`rpg-site/backend/`)

| Tecnologia | Versão | Papel |
|---|---|---|
| Python | 3.12.7 | Runtime (fixado em `.python-version`) |
| FastAPI | >=0.115 | API HTTP + docs automáticas em `/docs` |
| arq | >=0.26 | Fila de jobs sobre Redis |
| Redis | >=5.0 | Fila + cache do avatar (TTL 24h) |
| google-genai | >=1.0 | Cliente do Gemini (geração de imagem) |
| supabase | >=2.0 | Client Python (service_role) |
| pytest + fakeredis | — | Testes sem Redis/Gemini reais |

---

## Estrutura de Diretórios

```
AnalyticsdeTaverna/
├── README.md
├── render.yaml                       # Blueprint da Render (api + worker + redis)
└── rpg-site/
    ├── next.config.ts
    ├── package.json
    ├── public/
    │   ├── logo.png
    │   ├── guild/                    # Fotos dos membros
    │   └── textures/                 # dark-wood.png, black-linen.png
    ├── next.config.ts                # Rewrite /taverna-api/* → FastAPI
    ├── src/
    │   ├── auth.ts                   # NextAuth config + allowlist de admins
    │   ├── proxy.ts                  # Middleware — protege /admin/*
    │   ├── app/
    │   │   ├── layout.tsx            # Root layout (Cinzel, Crimson Pro, metadata)
    │   │   ├── globals.css           # Tokens, utilitárias e keyframes do tema
    │   │   ├── page.tsx              # Landing — compõe as seções
    │   │   ├── dashboard/page.tsx    # /dashboard — números ao vivo (server-side)
    │   │   ├── jogar/page.tsx        # /jogar — wrapper do <QuizForm>
    │   │   ├── personagem/
    │   │   │   ├── page.tsx          # /personagem — Suspense + skeleton
    │   │   │   └── PersonagemCard.tsx# Card compartilhado (lê ?id= ou query params)
    │   │   ├── batalha/
    │   │   │   ├── page.tsx          # /batalha — moldura + Suspense
    │   │   │   ├── DesafioScanner.tsx# QR + máquina de fases do duelo
    │   │   │   ├── EscolhaAtributos.tsx # Grade dos 7, até 3 marcados
    │   │   │   └── ResultadoBatalha.tsx # Rodadas reveladas + XP
    │   │   ├── ranking/
    │   │   │   ├── page.tsx          # /ranking — quadro de feitos (dados reais)
    │   │   │   └── loading.tsx       # Esqueleto na mesma moldura
    │   │   ├── admin/                # /admin e /admin/login (protegidos)
    │   │   └── api/auth/[...nextauth]/route.ts
    │   ├── lib/
    │   │   ├── classes.ts            # CLASS_LIST — as 16 classes (fonte única)
    │   │   ├── atributos.ts          # Os 7 do card: chave, rótulo e ícone
    │   │   ├── backend-url.ts        # URL absoluta do FastAPI (só servidor)
    │   │   ├── batalha-api.ts        # Cliente do duelo (browser, via /taverna-api)
    │   │   ├── ranking.ts            # Leitura do ranking (server-only, cacheada)
    │   │   ├── ranking-actions.ts    # Server Action: expira o cache do ranking
    │   │   ├── stats.ts              # Agregação server-only p/ o dashboard
    │   │   ├── stats-actions.ts      # Server Action: expira o cache do dashboard
    │   │   ├── cache-tags.ts         # Tags compartilhadas entre cache e actions
    │   │   ├── supabase.ts           # Client anon, inicializado preguiçosamente
    │   │   └── useAvatarGeneration.ts# Hook: POST + polling do avatar
    │   └── components/
    │       ├── questions-data.ts     # Banco de 120 perguntas + tipos
    │       ├── QuizForm.tsx          # Máquina de estados (photo→quiz→result)
    │       ├── CharacterResult.tsx   # Atributos, classificação, avatar, link único
    │       ├── WebcamCapture.tsx     # Captura de frame via getUserMedia
    │       ├── QrScanner.tsx         # Leitor de QR pela câmera (jsQR)
    │       ├── TelaCarregando.tsx    # Tela cheia do duelo (pixel art, celular)
    │       ├── PersonagemCard/Navbar/Hero/… # Seções da landing
    │       ├── AdminCalendar.tsx     # Calendário da área admin
    │       └── ui/                   # reveal, count-up, animated-bar, tilt-card, magnetic
    └── backend/
        ├── README.md                 # Documentação detalhada do serviço Python
        ├── requirements.txt
        ├── sql/schema.sql            # Schema idempotente (jogadores, batalhas, RLS)
        ├── render.yaml               # (removido — o blueprint vive na raiz do repo)
        ├── app/
        │   ├── main.py               # App FastAPI: lifespan do Redis, CORS, routers
        │   ├── config.py             # Settings via env (pydantic-settings)
        │   ├── schemas.py            # Modelos de entrada/saída
        │   ├── repo.py               # Acesso ao Supabase (Protocol + impl)
        │   ├── domain/               # Regras puras: personagem.py, batalha.py
        │   ├── routers/              # avatar, jogadores, personagem, batalha, ranking, analytics
        │   └── workers/avatar_worker.py  # Job do Gemini + upload no Storage
        └── tests/                    # pytest (repo em memória, fakeredis, Gemini mockado)
            └── fixture_classes_ts.json  # Casos gerados pelo motor TypeScript real
```

---

## Rotas do Frontend

| Rota | Render | Descrição |
|---|---|---|
| `/` | Estática | Landing (conceito, atributos, guilda, chamada) |
| `/dashboard` | Estática (revalida 5min) | Números ao vivo — agregados no servidor |
| `/jogar` | Estática | Quiz completo (foto → perguntas → resultado) |
| `/personagem` | Estática + Suspense | Card do personagem por `?id=` ou por query params |
| `/batalha` | Estática + Suspense | Leitor de QR, card do oponente e arena do duelo |
| `/ranking` | **Dinâmica** | Quadro de feitos com os dados do `GET /ranking` |
| `/admin` | Dinâmica | Painel protegido (links do projeto + calendário) |
| `/admin/login` | Dinâmica | Início do fluxo OAuth |
| `/api/auth/[...nextauth]` | Node | Handler do NextAuth |

> `/ranking` é dinâmica **de propósito**. Prerenderizada, o build congelaria o
> resultado — e o build não alcança o backend, então o que iria ao ar seria a
> tela de erro. Quem segura a carga é o cache de dados (`unstable_cache`), não o
> HTML estático.

---

## Proxy de Mesma Origem

O `next.config.ts` reescreve `/taverna-api/*` para o FastAPI:

```ts
async rewrites() {
  return [{ source: "/taverna-api/:caminho*", destination: `${BACKEND_URL}/:caminho*` }];
}
```

Chamar `avatar-api-*.onrender.com` direto do navegador funciona — **quando a rede
de quem joga deixa**. Bloqueador de anúncios, filtro de DNS no roteador e Wi-Fi
corporativo derrubam domínios de hospedagem gratuita, e o `fetch` cai com
`Failed to fetch` sem dizer o porquê: a pessoa lê "o servidor está fora do ar"
enquanto ele está de pé.

Passando pelo rewrite, o pedido é para a **mesma origem** da página: não há
terceiro para bloquear, não há preflight de CORS e não há como cair em conteúdo
misto. O custo é um salto a mais pela Vercel.

| Quem chama | Base usada | Por quê |
|---|---|---|
| Navegador (duelo) | `/taverna-api` | Mesma origem — `src/lib/batalha-api.ts` |
| Servidor (ranking) | URL absoluta | `fetch` do Node não resolve caminho relativo — `src/lib/backend-url.ts` |

`BACKEND_URL` fica **sem** `NEXT_PUBLIC_`: o endereço da Render não vai para o
bundle. Ele é lido de `BACKEND_URL`, `NEXT_PUBLIC_API_URL` ou
`NEXT_PUBLIC_AVATAR_API_URL`, nessa ordem, caindo em `http://localhost:8000`.

---

## Arquitetura do Quiz

### Modelo de dados

```ts
// questions-data.ts
type DimKey =
  | "lideranca" | "estrategia" | "disciplina" | "persistencia"
  | "sociabilidade" | "empatia" | "adaptabilidade" | "criatividade"
  | "impulsividade" | "percepcao";

interface Option {
  text: string;
  dimMain: DimKey | null;   // recebe +2 ao ser escolhida
  dimSec:  DimKey | null;   // recebe pesoSec (+1 ou -1)
  pesoSec: 1 | -1;
  tag: string;              // acumulada para classificação (ex: "PERFECCIONISTA")
}

interface Question {
  id: number;
  text: string;
  options: Option[];        // sempre 4 alternativas (A/B/C/D)
}
```

### Pipeline de pontuação

```
Para cada resposta escolhida pelo usuário:
  dims[opt.dimMain] += 2
  dims[opt.dimSec]   = max(0, dims[opt.dimSec] + opt.pesoSec)
  tags.push(opt.tag)
```

`dimSec` pode ser `null` (ignorado) ou uma dimensão com peso `+1` / `-1`. O floor em `max(0, …)` impede valores negativos.

### Sorteio das perguntas

```ts
const QUIZ_SIZE = 5;
```

**Fisher-Yates parcial**: para cada uma das `QUIZ_SIZE` primeiras posições, troca com uma posição sorteada entre ela e o fim — todas as 120 perguntas têm a mesma chance, e o embaralhamento para no tamanho do quiz.

> O `sort(() => Math.random() - 0.5)` usado antes não servia: o comparador é inconsistente, então o resultado dependia do algoritmo de ordenação do motor e as perguntas do começo do banco saíam com frequência muito maior.

### Máquina de estados (`QuizForm`)

```
"photo" ──(foto capturada + clique)──► "quiz" ──(última resposta)──► "result"
   ▲                                                                      │
   └──────────────────────────(restart())────────────────────────────────┘
```

Estado local: `step`, `photo` (data URL), `questions` (array de 5), `current`, `dims`, `tags`.

---

## Cálculo de Atributos

Executado em `useMemo` dentro de `CharacterResult` — e replicado em `backend/app/domain/personagem.py`.

```ts
function calcAttributes(dims: Dimensions) {
  return {
    forca:        dims.persistencia + dims.lideranca + Math.round(dims.impulsividade * 0.5),
    inteligencia: dims.estrategia   + dims.percepcao,
    agilidade:    dims.adaptabilidade + Math.round(dims.impulsividade * 0.5),
    resistencia:  dims.disciplina   + dims.persistencia,
    carisma:      dims.sociabilidade + dims.lideranca,
    sabedoria:    dims.empatia      + dims.percepcao,
    caos:         dims.criatividade + dims.impulsividade,
  };
}
```

> **Arredondamento é contrato.** `Math.round(0.5)` em JS é `1`; `round(0.5)` em
> Python é `0` — o embutido usa arredondamento bancário (para o par mais
> próximo). Como força e agilidade somam **metade da impulsividade**, os dois
> motores davam valores diferentes sempre que ela caía em {1, 5, 9, 13, 17}. O
> Python usa `(valor + 1) // 2`, que é o meio para cima sem passar por float.
> `tests/fixture_atributos_ts.json` trava isso com casos gerados pelo
> `calcAttributes` real do componente.

### Por que alguns atributos ficam zerados

Não é bug, é aritmética do quiz. Sobre 200 mil partidas simuladas contra o banco
real, **63,8% dos cards têm ao menos um atributo em zero**:

| Atributo | Zera em | Soma de |
|---|---|---|
| Carisma | 27,8% | sociabilidade + liderança |
| Caos | 17,7% | criatividade + impulsividade |
| Força | 12,6% | persistência + liderança + ½ impulsividade |
| Resistência | 11,0% | disciplina + persistência |
| Agilidade | 9,5% | adaptabilidade + ½ impulsividade |
| Inteligência | 7,3% | estratégia + percepção |
| Sabedoria | 5,3% | empatia + percepção |

São **5 perguntas para 10 dimensões**: cada resposta dá `+2` a uma e `±1` a no
máximo outra, então **pelo menos 5 dimensões terminam em zero por construção**.
Um atributo zera quando todas as dimensões que o alimentam ficaram de fora.

O banco desbalanceado decide quais: liderança tem 36 alternativas e persistência
35, contra 61 de estratégia. Liderança fica em zero em 56,2% das partidas e
sociabilidade em 51,9% — e o carisma precisa das duas, daí os 27,8%.

Para reduzir, há três caminhos, todos com custo: aumentar o `QUIZ_SIZE` (quiz
mais longo), rebalancear o banco a favor das dimensões raras, ou dar um piso de 1
a cada atributo (cosmético, não estrutural).

**Normalização para exibição:** as barras são relativas ao atributo mais alto do próprio jogador.

```ts
const maxAttr = Math.max(...Object.values(attrs), 1);
const barPct  = (v: number) => Math.round((v / maxAttr) * 100); // sempre 0–100%
```

---

## Classificação em Classes

### Tags secretas

Cada alternativa carrega uma tag. Ao longo das 5 respostas as tags se acumulam num array, e `tc(tag)` conta ocorrências:

```ts
const tc = (tag: string) => tags.filter(t => t === tag).length;
```

### Forma das regras

```ts
const match = (dim, minDim, a, b, minSum) =>
  dim >= minDim && tc(a) >= 1 && tc(a) + tc(b) >= minSum;
```

A tag-assinatura da classe é **obrigatória**; a segunda tag **soma** afinidade. Exigir as duas simultaneamente (`tc(a) >= x && tc(b) >= y`) é inviável num quiz de 5 respostas — nessa forma cada regra alcançava de 1,7% a 15% dos jogadores.

Os limiares foram calibrados por simulação contra o banco real (300 mil partidas): cada regra captura de **2,4% a 7,7%** dos jogadores e **73%** do total é classificado por regra. **Mexer nas perguntas muda essa distribuição — recalibre se editar o banco.**

### Regras (ordem = prioridade)

Classes raras primeiro: as que dividem uma tag com outra (ANSIOSO, FURTIVO, DOPAMINA…) precisam escolher antes de a genérica levar tudo.

| # | Classe | Dimensão ≥ | Tag assinatura | Tag de apoio | Soma ≥ |
|---|---|---|---|---|---|
| 1 | Mago do ChatGPT | estrategia 4 | TECNOLÓGICO | NERD | 1 |
| 2 | Ninja do Visto por Último | adaptabilidade 4 | FURTIVO | PROCRASTINADOR | 1 |
| 3 | Berserker do Crossfit | impulsividade 3 | ATLETA | DOPAMINA | 1 |
| 4 | Ladino do Home Office | adaptabilidade 3 | INTROVERTIDO | FURTIVO | 1 |
| 5 | Invocador de iFood | impulsividade 3 | DOPAMINA | PROCRASTINADOR | 1 |
| 6 | Bardo do Karaokê | sociabilidade 3 | EXTROVERTIDO | DOPAMINA | 1 |
| 7 | Ilusionista de Call | sociabilidade 2 | MALANDRO | EXTROVERTIDO | 1 |
| 8 | Paladino do Grupo | lideranca 3 | LÍDER | JUSTICEIRO | 1 |
| 9 | Warlock do Boleto | persistencia 2 | ANSIOSO | RESOLUTIVO | 1 |
| 10 | Vidente da Ansiedade | percepcao 2 | ANSIOSO | OVERTHINKING | 1 |
| 11 | Xamã das Criptomoedas | estrategia 3 | CAÓTICO | MALANDRO | 1 |
| 12 | Necromante de Planilha | disciplina 3 | PERFECCIONISTA | NERD | 2 |
| 13 | Artífice da Gambiarra | criatividade 2 | GAMBIARRA | RESOLUTIVO | 2 |
| 14 | Domador de Pet | empatia 2 | CURADOR | ZEN | 2 |
| 15 | Druida de Varanda | empatia 2 | ZEN | INTROVERTIDO | 2 |
| 16 | Ranger da Faxina | disciplina 3 | ZEN | RESOLUTIVO | 1 |

### Fallback por dimensão dominante

Se nenhuma regra bate, a classe vem da dimensão com maior pontuação:

```ts
const FALLBACK = {
  lideranca:      "Paladino do Grupo",      estrategia:     "Mago do ChatGPT",
  disciplina:     "Necromante de Planilha", persistencia:   "Warlock do Boleto",
  sociabilidade:  "Bardo do Karaokê",       empatia:        "Domador de Pet",
  adaptabilidade: "Ladino do Home Office",  criatividade:   "Artífice da Gambiarra",
  impulsividade:  "Invocador de iFood",     percepcao:      "Vidente da Ansiedade",
};
```

**~28% das partidas empatam no topo**, então o desempate decide muita coisa. São dois critérios, nessa ordem:

1. **Afinidade com as tags** da classe candidata (cada dimensão do fallback carrega as duas tags da sua classe).
2. **Hash FNV-1a do estado** (dimensões + tags ordenadas) `% n`. Continua determinístico — a mesma partida sempre dá a mesma classe, o que o link compartilhado exige — mas nenhuma dimensão é favorecida pela posição na lista.

> Pegar o primeiro do objeto (o que um `reduce` faz) transformava a posição na lista em critério: `lideranca` ganhava 100% dos empates de que participava e `percepcao`, 0%.

### Os dois motores estão sincronizados — e há teste provando

`backend/app/domain/personagem.py` espelha `determineClass` do
`CharacterResult.tsx` por inteiro: as 16 regras na mesma ordem e com os mesmos
limiares, o fallback com desempate por afinidade de tag e o **mesmo hash FNV-1a**
(porte exato, incluindo a avalanche e o mascaramento em 32 bits).

Antes o Python trazia a versão antiga das regras — limiares altos
(`estrategia >= 15`, `tc("TECNOLÓGICO") >= 3 && tc("NERD") >= 2`) e desempate por
ordem fixa de `DIMENSOES`. O mesmo quiz virava classes diferentes conforme quem
classificasse.

**Como a igualdade foi verificada:** o `determineClass` foi extraído do próprio
`.tsx`, executado no Node sobre **200 mil quizzes aleatórios**, e cada resultado
comparado com o do Python — **zero divergências** (68,7% classificados por regra,
31,3% pelo fallback, dos quais 22.798 passaram pelo desempate por hash).

Uma amostra estratificada desses casos ficou em
`backend/tests/fixture_classes_ts.json`, e `tests/test_sincronia_classes.py`
roda os 276 casos a cada `pytest` — cobrindo as 16 regras e os três caminhos do
fallback (dominante única, desempate por afinidade, desempate por hash).

> Se esse teste quebrar, foi mudança de regra em **um** dos lados só. Ajuste o
> outro e regenere a fixture — não relaxe a asserção.

**Detalhe de porte que importa:** `charCodeAt` do JS devolve unidades UTF-16 e
`ord` do Python devolve code points. Os valores coincidem em todo o BMP, que é
onde vivem as tags acentuadas (LÍDER, TECNOLÓGICO, CAÓTICO) — por isso o hash
bate. Fora do BMP eles divergiriam.

---

## Banco de Perguntas

Extraído da planilha `questionário_deterministico_final2.0.xlsx` (aba `Banco_120_Perguntas`).

**120 perguntas**, cada uma com 4 alternativas — 480 alternativas no total, todas com `dimMain` preenchida. Distribuição das alternativas por dimensão principal:

| Dimensão | Alternativas |
|---|---|
| Estratégia | 61 |
| Adaptabilidade | 57 |
| Percepção | 53 |
| Impulsividade | 50 |
| Empatia | 50 |
| Criatividade | 49 |
| Disciplina | 48 |
| Sociabilidade | 41 |
| Liderança | 36 |
| Persistência | 35 |

**21 tags secretas:** ANSIOSO · ATLETA · CAÓTICO · COMPETITIVO · CURADOR · DOPAMINA · EXTROVERTIDO · FURTIVO · GAMBIARRA · INTROVERTIDO · JUSTICEIRO · LÍDER · MALANDRO · NERD · OVERTHINKING · PERFECCIONISTA · PROCRASTINADOR · RESOLUTIVO · SOCIAL · TECNOLÓGICO · ZEN

---

## Geração de Avatar (IA)

A foto da webcam vira um avatar no estilo da classe. A geração começa **no resultado**, não durante o quiz — só ali a classe é conhecida.

```
CharacterResult
    │  POST {AVATAR_API_BASE}/avatar/generate   (multipart: file + classe)
    ▼
FastAPI ── valida content-type + tamanho (≤8MB) → enfileira no arq/Redis
    │  responde { job_id, status: "processing" }
    ▼
Worker arq → Gemini → sobe no Storage `avatars` → SET avatar_result:{job_id} (TTL 24h)
                                                    ↑ só a URL, nunca a imagem
    ▼
Frontend faz polling em duas velocidades (1,2s nos primeiros 30s, 2,5s depois;
    prazo de 3min por TEMPO, não por número de tentativas)
    GET /avatar/status/{job_id} → "processing" | "done" + public_url | "error"
```

> **O Redis guarda um ponteiro, não a imagem.** Ela já vive no Storage do
> Supabase, permanente. Gravar o base64 no Redis também custava ~925 KB por
> avatar (o base64 infla um terço sobre os ~675 KB do arquivo) e enchia os 25 MB
> da instância free em menos de 30 gerações. Com `maxmemoryPolicy noeviction`,
> cheio significa que TODO `SET` passa a falhar — inclusive o do marcador de
> erro, e aí o job termina sem resposta nenhuma e o front gira os 3 minutos
> inteiros antes de desistir. Foi exatamente o que derrubou a geração em
> produção. O ponteiro ocupa ~125 bytes.

`GET /avatar/image/{job_id}` **redireciona** (307) para o Storage, montando o
caminho a partir do id (`{job_id}.jpg|png`) quando o Redis não tem nada. Assim
TTL vencido, instância reiniciada ou `SET` recusado por memória cheia deixam de
derrubar o avatar de quem já o gerou.

O worker também não deixa um Redis indisponível virar falha de geração: se o
avatar subiu, o job termina em paz e registra o aviso. Sem isso o arq reagenda e
o Gemini é pago de novo — por um resultado que já existe.

| Var | Onde | Padrão |
|---|---|---|
| `NEXT_PUBLIC_AVATAR_API_URL` | Vercel | `http://localhost:8000` |
| `GEMINI_API_KEY` | Render (secreta) | — |
| `GEMINI_IMAGE_MODEL` | Render | `gemini-3.1-flash-image` |
| `GEMINI_MAX_RPM` | Render | `8` |

**Retenção:** a foto original **nunca é persistida** — trafega só como payload do job (`keep_result = 0` no arq) e vive em memória durante a execução. O avatar gerado fica permanente no bucket `avatars`; o Redis guarda por 24h apenas a URL dele. Há testes de invariante para isso em `tests/test_privacy.py`, incluindo um que falha se alguém voltar a gravar bytes de imagem no Redis.

**Rate limit:** o worker tem um limitador global que espaça as chamadas ao Gemini (inclusive os retries) para não estourar `GEMINI_MAX_RPM`. O excedente espera na fila em vez de tomar `429`. Detalhes e como ajustar a cota: [`backend/README.md`](rpg-site/backend/README.md#rate-limit--capacidade-do-gemini).

**Vazão em evento.** Três tetos, em ordem de quem morde primeiro:

| Teto | Onde se ajusta | Efeito |
|---|---|---|
| `GEMINI_MAX_RPM` | env da Render | Espaça os inícios de chamada |
| `max_jobs` do worker | `avatar_worker.py` (20) | Jobs simultâneos |
| Cota do Gemini | Google AI Studio | 100 RPM e **1.000 RPD** no Nível 1 |

A latência de uma geração é do Gemini, não nossa: medimos **13s a 65s** em
produção. Mexer no RPM não a encurta — o que ele resolve é a espera de FILA.

**Orçamento de um job.** Nosso retry interno são 4 chamadas com backoff de 3+6+12s:
no pior caso ~281s. O `job_timeout` do arq fica em **420s** para isso caber, e o
`max_tries` em **2** (o padrão, 5, daria até 20 chamadas ao Gemini por avatar).

> Quando o arq mata um job por timeout, o que sobe é `CancelledError` — que herda
> de `BaseException` e passava direto por um `except Exception`. O marcador de
> erro não era gravado, o status ficava `processing` para sempre e a pessoa
> esperava os 3 minutos do front por um job já morto. O handler captura
> `BaseException` e re-levanta o cancelamento depois de gravar.

O RPD é o limite real de um dia de evento — nem o RPM nem a concorrência
adiantam depois dele, e cada retry consome uma unidade. Confira em
**AI Studio → Limite de taxa**; deixe o `GEMINI_MAX_RPM` com margem abaixo do
RPM da sua conta, porque os retries também passam pelo limitador.

Se a geração falhar, o card mostra "Não foi possível conjurar seu avatar" — sem imagem de placeholder.

---

## Persistência (Supabase)

O Supabase é usado de **dois lados, com chaves diferentes**:

| Lado | Chave | Papel |
|---|---|---|
| Backend (worker Python, Render) | `service_role` (`sb_secret_…`) | Sobe o avatar no Storage |
| Frontend (Next, Vercel) | `anon` (`sb_publishable_…`) | Insere e lê `jogadores` |

> ⚠️ Nunca troque as chaves de lado: a `service_role` bypassa o RLS e ficaria exposta no bundle.

### Tabelas

`sql/schema.sql` é idempotente e cria/estende tudo:

- **`jogadores`** — classe, os 7 atributos, `foto_url`, as 10 dimensões brutas do quiz, as `tags` acumuladas, placar (`xp`, `vitorias`, `derrotas`, `empates`) e `nome`. Índices em `xp desc`, `criado_em desc` e `classe`.
- **`batalhas`** — uma linha por confronto, guardando os **valores** disputados (não só o vencedor), `resultado` (`a`/`b`/`empate`), `vencedor_id`, o XP de cada lado e `rodadas` (jsonb) com o detalhe dos 3 atributos disputados.

> **`rodadas` é coluna nova.** Se o `sql/schema.sql` não tiver sido rodado no
> Supabase, o insert falha com `column batalhas.rodadas does not exist`. O
> backend contorna e avisa no log, mas o histórico fica sem o detalhe até a
> migração rodar:
> ```sql
> alter table public.batalhas add column if not exists rodadas jsonb;
> ```

> Por que jsonb e não três trios de colunas: o número de rodadas é regra de jogo,
> não de banco. Se o formato virar 5 rodadas, nada no schema muda.

> **`jogadores.tags` também é coluna nova.** Sem a migração, o insert do card
> volta `42703` — `CharacterResult` percebe, avisa no console e regrava no
> formato antigo, então o jogo não para; as tags só ficam no espelho do
> aparelho até a migração rodar:
> ```sql
> alter table public.jogadores add column if not exists tags text[];
> ```
> As 10 colunas de dimensão já existiam mas nunca eram preenchidas — o insert
> passou a gravá-las.

**RLS é obrigatório** — sem as policies de `insert`/`select` para `anon`, o insert do frontend falha com `new row violates row-level security policy`. Os comandos estão em `sql/schema.sql` e em [`backend/README.md`](rpg-site/backend/README.md#2-tabela-jogadores-usada-pelo-frontend).

### Variáveis

```env
NEXT_PUBLIC_SUPABASE_URL=        # Vercel
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Vercel
SUPABASE_URL=                    # Render
SUPABASE_SERVICE_ROLE_KEY=       # Render (secreta)
```

`src/lib/supabase.ts` inicializa o client **preguiçosamente** (só quando chamado): sem as env vars o build não quebra, o card só não grava.

---

## Card do Personagem (`/personagem`)

Duas formas de abrir a mesma página:

| Formato | Origem dos dados |
|---|---|
| `/personagem?id=123` | Linha da tabela `jogadores` (link único, gerado após salvar) |
| `/personagem?classe=…&for=12&int=8&…&avatar={job_id}` | Query params — fallback quando o insert falha, e links antigos |

**Parâmetros do formato legado:** `classe`, `for`, `int`, `agi`, `res`, `car`, `sab`, `cao`, `avatar`.

O retrato tenta, em ordem: `foto_url` do banco → mesma URL trocando `.jpg` por `.png` → `GET /avatar/image/{job_id}` na API → a ilustração da classe (`ClassInfo.photo`, que hoje aponta para `/fotos_cartas/…`, pasta ausente do repositório).

O QR Code do card aponta para `/batalha?oponenteId={id}` — quem escanear cai
direto no duelo contra esse personagem. Ver [Tela do Duelo](#tela-do-duelo-batalha).

**Salvamento:** `CharacterResult` grava o jogador quando o avatar chega a um estado terminal (`done` ou `error`), com dedup por `sessionStorage` para não inserir duas vezes em remontagens.

### Visão do dono vs. visão pública

A mesma rota serve as duas, e o que muda é **quem está olhando**: se o `?id=` da
URL bate com o `taverna:jogadorId` guardado no aparelho, `PersonagemCard` marca
`ehDono` e revela as tags e os botões **Jogar Novamente** / **Desafiar Alguém**.
Qualquer outra pessoa vê o card público de sempre. O gate é cosmético, não de
segurança — as ações são links públicos e o RLS não dá `update` para `anon`.

É isso que permite **voltar do duelo para o próprio card**: `/batalha` mostra um
`← Voltar para o meu card` (`LinkMeuCard`, no rodapé da página para cobrir as
oito fases do scanner) apontando para `/personagem?id={meuId}`.

> **O card do dono é uma leitura, nunca uma remontagem de `CharacterResult`.**
> Aquele componente é um *pipeline de criação*: ao montar com uma `photo` ele
> dispara a geração do avatar e um `insert` novo. Revivê-lo para "voltar ao
> card" queimaria cota da API de avatar e duplicaria a linha em `jogadores`.
> Tudo que o card desenha já é derivável do `id` — menos as tags, daí a coluna.

---

## Dashboard ao Vivo

Vive em `/dashboard` (saiu da landing) e lê o Supabase **no servidor**
(`src/lib/stats.ts`):

- Pagina a tabela de 1000 em 1000 linhas (teto de 200 páginas) e agrega em memória.
- A agregação pura (`aggregate`) é exportada separada do acesso ao banco para ser testável.
- Percentuais usam como base as linhas **com classe**; cada média de atributo ignora colunas nulas em vez de contá-las como zero.
- Cacheado com `unstable_cache` por **5 minutos** (`revalidate: 300`, tag `player-stats`) — sem isso a página viraria dinâmica e bateria no Supabase a cada visita.
- A atualização de verdade é por evento: ao salvar um personagem novo, `CharacterResult` chama `avisarNovoJogador()` e a tag expira na hora. É o mesmo mecanismo do ranking.
- Sem credenciais, `getPlayerStats()` devolve `null` e a seção exibe o estado vazio. A landing continua de pé.

Importar `stats.ts` de um Client Component mandaria a tabela inteira para o navegador — por isso `DashboardSection` recebe os números prontos por prop e importa só o **tipo**.

---

## Tela do Duelo (`/batalha`)

Três fases numa página só (`DesafioScanner` é a máquina de estados):

```
QR do card do oponente          ou   /batalha?oponenteId=42 direto
        │
        ▼  jsQR lê pela câmera → extrai o id
  1. REVELAÇÃO — card do oponente (Supabase, chave anon)
        │  "⚔ Escolher atributos"
        ▼
  2. ESCOLHA — grade dos 7 atributos, até 3 marcados
        │  ← aqui um GET /health acorda a Render enquanto a pessoa decide
        │  "⚔️ Confirmar escolha"
        ▼  POST /taverna-api/batalha { ids + atributos }
  3. RESULTADO — rodadas reveladas uma a uma, XP contando no fim
        │
        ▼  Server Action expira o cache do ranking
```

O id do desafiante vem do `localStorage` (`taverna:jogadorId`), gravado ao fim do
quiz. Sem ele não há duelo — a tela oferece o quiz.

**Grade de escolha** (`EscolhaAtributos`): os 7 atributos do card em dois por
linha, com o Caos sozinho no fim. Marcar o quarto é ignorado, e o botão de
confirmar só aparece com os 3 completos — assim não existe estado inválido para
o backend recusar. Os ícones e a ordem vivem em `src/lib/atributos.ts`, com as
mesmas chaves de `ATRIBUTOS_VALIDOS` no Python.

**Encenação** (`ResultadoBatalha`, motion/react): o backend já devolveu tudo
pronto; a espera na tela é dramaturgia, não latência. As rodadas aparecem uma a
uma, os dois valores entram de cada borda, o troféu/caveira surge com um spring, e
o veredito só fecha depois da terceira — revelar o placar antes tiraria a graça
de ler linha a linha.

Quem pede `prefers-reduced-motion` percorre **as mesmas etapas com espera zero**.
Ramificar o estado inicial em `useReducedMotion` quebrava a hidratação: o servidor
não conhece a preferência do aparelho, então o HTML dele e a primeira renderização
do cliente divergiam.

**Erros com nome:** o `fetch` falha do mesmo jeito para servidor fora do ar, CORS
e endereço errado, então o console recebe o endereço tentado e as causas
prováveis. O `detail` do FastAPI vem como string nas exceções nossas — inclusive
as de escolha inválida, que aparecem direto na tela — e como **lista** quando o
Pydantic recusa o corpo (422); o cliente lê as duas formas e nomeia o campo
recusado. Os ids e a escolha são validados antes do envio: um id não numérico
viraria `NaN`, que `JSON.stringify` grava como `null`, e a pessoa leria "não foi
possível realizar o duelo" sem pista de que o problema é o cadastro dela naquele
aparelho.

**Teto de 75s** no POST, com mensagem própria para "demorou demais" — a Render
hiberna quando fica ociosa e a primeira requisição espera o processo subir. Sem
repetição automática de propósito: `POST /batalha` grava a batalha e distribui XP,
então repetir sozinho poderia contar o duelo duas vezes.

---

## Ranking Global (`/ranking`)

Quadro de feitos no estilo do pergaminho pendurado da taverna: parede de tábuas, roletes de madeira, moldura entalhada com florões, fita dourada com o título e prateleiras de canecas nas laterais (só em telas `xl`). Tudo em CSS — nenhum asset novo.

Lê o `GET /ranking?limite=10` do FastAPI **no servidor**, na mesma arquitetura do
dashboard: Server Component → módulo em `lib` → `unstable_cache` com tag → Server
Action que invalida.

| Coluna | Origem |
|---|---|
| Posto | `posicao` em numeral romano; medalha só no pódio |
| Aventureiro | `nome`, ou `Aventureiro #{id}` para quem não digitou |
| Classe | `classe` (com o ícone da `CLASS_LIST`) |
| Feitos | `xp`, com `V · D · E` embaixo |

Quem calcula posição, total de batalhas e taxa de vitória é o backend
(`routers/ranking.py`) — a tela só desenha, então o critério de desempate mora num
lugar só.

**Atualiza por evento.** Ao fim de um duelo o `DesafioScanner` chama
`avisarBatalhaConcluida()`, que faz `updateTag(RANKING_TAG)`. Sem isso, quem ganha
30 XP e clica em "Ver o ranking" segundos depois encontraria o placar de antes — e
esse é justamente o momento em que a pessoa vai olhar. Os 60s de `revalidate` são
rede de segurança para o que não passa pelo app.

> `updateTag` e não `revalidateTag`: o segundo ainda serviria o número velho para
> quem chegasse primeiro.

**Quatro estados**, e "vazio" é separado de "erro":

| Estado | Tela |
|---|---|
| Dados | Linhas reais, pódio com medalhas |
| Vazio | "O pergaminho ainda está em branco" + CTA para o quiz |
| Erro | "A tinta borrou no pergaminho" + tentar de novo |
| Carregando | `loading.tsx` — esqueleto pulsando na mesma moldura |

Colapsar vazio e erro num só faria a taverna anunciar pergaminho em branco toda
vez que o backend hibernasse, apagando da vista feitos que continuam gravados.

---

## API Python

Documentação interativa em `/docs` quando o serviço está no ar.

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/health` | Status + se Redis e banco estão configurados |
| `POST` | `/avatar/generate` | Enfileira a geração (multipart: `file`, `classe`) |
| `GET` | `/avatar/status/{job_id}` | `processing` \| `done` + `public_url` \| `error` |
| `GET` | `/avatar/image/{job_id}` | Redirect (307) para o avatar no Storage |
| `DELETE` | `/avatar/result/{job_id}` | Limpeza antecipada do resultado |
| `POST` | `/jogadores` | Cadastra e devolve o registro com `id` |
| `GET` | `/jogadores/{id}` · `/jogadores` | Consulta e listagem paginada |
| `POST` | `/personagem/gerar` | Classe + atributos a partir das dimensões |
| `GET` | `/personagem/classes` | Catálogo de classes |
| `GET` | `/batalha/atributos` | Os 7 atributos escolhíveis, quantos escolher e XP por resultado |
| `POST` | `/batalha/parear` | Matchmaking por XP próximo (para duelar sem QR) |
| `POST` | `/batalha` | Resolve o confronto e registra tudo — corpo: dois ids + os 3 atributos |
| `GET` | `/batalha/{id}` · `/batalha/historico/{id}` | Detalhe e histórico |
| `GET` | `/ranking` · `/ranking/{jogador_id}` | Top N por XP · posição de um jogador |
| `GET` | `/analytics/resumo` · `/classes` · `/atributos` · `/batalhas` · `/taxa-vitoria` · `/insight` | Dashboard analytics |

### Camadas

```
routers/  →  HTTP: valida, chama o domínio, grava pelo repo
domain/   →  regras puras (sem FastAPI, sem banco, sem rede)
repo.py   →  todo acesso ao Supabase; os testes injetam um repo em memória
```

O client do Supabase é síncrono, então toda chamada passa por `run_in_threadpool` para não travar o event loop do FastAPI.

### Sistema de Batalha — melhor de 3

O desafiante **escolhe 3 dos 7 atributos** do card antes de lutar. Cada rodada
compara o **mesmo atributo** dos dois lados:

```
POST /batalha { jogador_a_id, jogador_b_id, atributos: ["forca","carisma","caos"] }

   Força        18  ×  12   → desafiante
   Carisma       9  ×  14   → oponente
   Caos         21  ×   7   → desafiante
   ─────────────────────────────────────
   Vitória por 2 a 1              +30 XP
```

A escolha é a única decisão do jogo — e é o que o torna um jogo, e não um
sorteio: quem conhece o próprio card aposta onde é forte. O oponente não escolhe
nada e entra com os valores que tem nos atributos apontados; a vantagem de
escolher é o prêmio por ter lançado o desafio.

**Assíncrona e instantânea:** o desafiante escaneia o QR, escolhe e o resultado
sai na hora. O oponente **não tem ação ativa nem estado pendente** — não existe
convite para aceitar nem partida esperando resposta. O placar dele muda junto,
porque o duelo aconteceu de verdade; senão o ranking premiaria quem nunca é
escaneado.

**Validação da escolha** (`validar_escolha`), com três mensagens distintas
porque o front mostra o texto direto na tela: quantidade diferente de 3,
atributo repetido (triplicaria o peso do melhor — vira melhor-de-1) e nome fora
dos 7 do card. A grade da UI impede as três, mas a UI não é a fronteira de
confiança: o pedido chega por HTTP e qualquer um pode montá-lo à mão.

**XP:** vitória `30`, empate `15`, derrota `5`. Derrota dá XP de propósito — quem
perde continua tendo motivo para jogar.

**Pareamento** (`POST /batalha/parear`, para achar adversário sem QR): XP mais
próximo, com sorteio entre os igualmente próximos para duas partidas seguidas não
caírem sempre no mesmo adversário.

**Ordem de gravação:** a batalha é registrada **antes** de o XP ser distribuído.
Se o insert falhar, ninguém ganha XP — melhor uma batalha perdida do que XP
fantasma.

**Como fica no banco:** o detalhe das 3 rodadas vai em `rodadas` (jsonb). As
colunas antigas `atributo`/`valor_a`/`valor_b`, que são `not null`, guardam os
três escolhidos separados por vírgula (`forca,carisma,caos`) e o **placar de
rodadas** — assim as linhas do formato antigo continuam legíveis e o histórico
novo não perde informação.

> Num banco que ainda não rodou o `sql/schema.sql` mais recente, o insert falharia
> inteiro com `column batalhas.rodadas does not exist` — e o duelo devolveria 500
> sem gravar nada. O `repo.criar_batalha` regrava sem a coluna e avisa no log
> apontando para a migração: perder o detalhe das rodadas é ruim, perder a batalha
> é pior. O remendo é estreito de propósito — só vale para colunas listadas em
> `COLUNAS_OPCIONAIS` e só para erro de coluna inexistente; erro de rede,
> credencial errada ou coluna obrigatória faltando continuam estourando.

### Testes

```bash
cd rpg-site/backend
pip install -r requirements-dev.txt
pytest -q
```

**550 testes.** Distribuição:

| Arquivo | Testes | Cobre |
|---|---|---|
| `test_sincronia_classes.py` | 437 | Igualdade com o TypeScript: classes, hash FNV-1a e atributos |
| `test_api_rotas.py` | 34 | Rotas da API com repositório em memória |
| `test_batalha_motor.py` | 31 | Validação da escolha, confronto, XP, narrativa, pareamento |
| `test_avatar_endpoint.py` | 15 | Validação de upload, polling, limpeza |
| `test_avatar_worker.py` | 15 | Job do Gemini (mockado), retries, rate limit |
| `test_repo_coluna_ausente.py` | 8 | Gravação com o banco atrasado no schema |
| `test_personagem.py` | 7 | Atributos, determinismo, fallback |
| `test_privacy.py` | 3 | Invariantes de retenção da foto original |

Nada exige Redis, Supabase ou Gemini reais: o repositório é injetado por
`dependency_overrides`, o Redis é `fakeredis` e o Gemini é mockado.

---

## Autenticação — Área Admin

### Fluxo OAuth

```
/admin/* (sem sessão)
    │
    ▼ middleware (proxy.ts)
/admin/login
    │ clique "Entrar com GitHub"
    ▼
GitHub OAuth → callback /api/auth/callback/github
    │
    ▼ NextAuth signIn callback
ADMIN_USERNAMES.includes(profile.login) ?
    ├── true  → JWT criado → redirect /admin
    └── false → erro → /admin/login?error=AccessDenied
```

### Allowlist (`src/auth.ts`)

```ts
const ADMIN_USERNAMES = [
  "mateusbhering", "juliacrws", "Tsunokaway",
  "oipimenta", "marianakuramitsu", "Ladeira26",
];
```

Adicionar um admin = adicionar o GitHub username nesse array e fazer push.

### Middleware (`src/proxy.ts`)

```ts
export const config = { matcher: ["/admin/:path*"] };
```

Redireciona para `/admin/login` sem sessão ativa, e de volta para `/admin` se um usuário já autenticado tentar abrir o login.

### Variáveis de ambiente

```env
AUTH_SECRET=          # openssl rand -hex 32  (obrigatório em produção)
GITHUB_CLIENT_ID=     # GitHub OAuth App
GITHUB_CLIENT_SECRET= # GitHub OAuth App
AUTH_URL=             # URL base (ex: https://www.analyticsdetaverna.com.br)
```

---

## Deploy e CI/CD

| Serviço | Plataforma | Gatilho |
|---|---|---|
| Frontend | Vercel | Push em `main` → deploy de produção |
| API + worker + Redis | Render | Blueprint `render.yaml` na raiz do repo |
| Banco + Storage | Supabase | — |

**Vercel:** build `next build`, output `.next/` (functions + assets estáticos); middleware no runtime Edge.

**Render:** o `render.yaml` cria `avatar-api` (web), `avatar-worker` (worker) e `avatar-redis` (Key Value), todos com `rootDir: rpg-site/backend`. O worker exige plano pago — background workers não existem no tier free. O `GEMINI_API_KEY` fica no grupo `avatar-config`, marcado `sync:false` (não versionado).

O CORS da API libera `localhost:3000`, `site-ic-orcin.vercel.app` e o domínio de
produção com e sem `www` — domínio novo precisa entrar em `app/config.py`. Com o
proxy de mesma origem o CORS deixou de valer para o duelo em produção, mas
continua necessário para desenvolvimento e para qualquer chamada direta.

Deploy manual do frontend:
```bash
vercel --prod
```

---

## Desenvolvimento Local

### Frontend

```bash
cd rpg-site
npm install

# .env.local com: AUTH_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, AUTH_URL,
# NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
# NEXT_PUBLIC_AVATAR_API_URL (opcional — padrão http://localhost:8000)
# BACKEND_URL (opcional — destino do proxy /taverna-api; mesmo padrão)

npm run dev      # http://localhost:3000
npm run build    # build de produção local
npm run lint     # ESLint (`next lint` foi removido no Next 16)
```

Para o OAuth funcionar localmente, adicione `http://localhost:3000/api/auth/callback/github` como Authorized Callback URL no GitHub OAuth App.

### Backend

Requer um Redis local (`docker run -p 6379:6379 redis` ou `brew install redis && redis-server`).

```bash
cd rpg-site/backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env      # preencha GEMINI_API_KEY

uvicorn app.main:app --reload --port 8000   # terminal 1
arq app.workers.avatar_worker.WorkerSettings # terminal 2
```

Sem Redis a API sobe assim mesmo — só as rotas de avatar ficam desativadas (o
`lifespan` registra um aviso). Cadastro, duelo, ranking e analytics funcionam.

Duelo e ranking **precisam** do Supabase configurado (`SUPABASE_URL` e
`SUPABASE_SERVICE_ROLE_KEY` no `.env` do backend); sem isso respondem `503` com a
mensagem explicando o que falta.

Se o duelo mostrar "a taverna não respondeu", o `fetch` nem chegou ao servidor:
confira se o `uvicorn` está no ar na porta do `BACKEND_URL`. O console traz o
endereço tentado.

---

## Design System

Tema **"Diário Mágico"**: mesa de mogno na penumbra, luz de vela âmbar; o conteúdo são páginas de pergaminho com tinta sépia, folha de ouro e lacres de cera.

### Tokens (`globals.css`)

| Token | Valor | Uso |
|---|---|---|
| `--desk` / `--desk2` | `#170d06` / `#241408` | Mesa, fundo global |
| `--paper` / `--paper2` / `--paper3` | `#eeddb3` / `#e2cb96` / `#d2b47e` | Superfícies de papel |
| `--ink` | `#3c2a18` | Tinta sépia (texto sobre papel) |
| `--foil` / `--gold` / `--gold-light` | `#8a6428` / `#c9973f` / `#e6bc6a` | Ouro sobre papel e sobre madeira |
| `--seal` | `#8c2318` | Cera de lacre — ação primária |
| `--leather` / `--copper` | `#521a10` / `#b87333` | Couro de capa, acentos |

### Fontes

| Variável | Fonte | Uso |
|---|---|---|
| `--font-cinzel-decorative` | Cinzel Decorative | Títulos |
| `--font-cinzel` | Cinzel | Labels, botões, eyebrows |
| `--font-crimson-pro` | Crimson Pro | Corpo de texto |
| `--font-geist-mono` | Geist Mono | Mono |

### Utilitárias principais

| Grupo | Utilitárias |
|---|---|
| Papel e moldura | `paper-card` · `paper-frame` · `arcane-corners` · `polaroid` · `divider` |
| Quadro do ranking | `plank-wall` · `scroll-rod` · `wood-frame` · `scroll-sheet` · `tavern-banner` · `banner-tail` · `frame-flower` · `tavern-shelf` |
| Ação e selo | `btn-seal` · `btn-parchment` · `btn-glow` · `press` · `wax-seal` |
| Texto e acento | `section-eyebrow` · `gold-grad` · `tag-pill` · `icon-frame` · `stat-bar` / `stat-bar-fill` |
| Fundo | `bg-dark-wood` · `bg-black-linen` · `bg-grid` · `arcane-blob` · `glass` · `dark-card` |
| Quiz e duelo | `quiz-progress-track` / `-fill` · `qr-reticle` · `qr-corner` · `qr-beam` · `barra-duelo` |

**Animações:** `float`, `shimmer`, `pulse-wine`, `candle-flicker`, `arcane-drift`, `bounce-down`, `qr-sweep`, `barra-duelo` — todas desligadas ou reduzidas sob `prefers-reduced-motion` (via `MotionProvider` e media queries no CSS).

**Convenções:** seções da landing são Server Components; a interatividade fica isolada em `QuizForm`, `CharacterResult`, `PersonagemCard`, `WebcamCapture`, `QrScanner`, `DesafioScanner`, `EscolhaAtributos`, `ResultadoBatalha`, `DashboardSection`, `Navbar`, `AdminCalendar` e nos componentes de `ui/`. No mobile os blobs de blur são desligados (custo de GPU) e a navbar usa fundo sólido — `backdrop-filter` em barra fixa causa glitches em navegadores móveis.

**Regra que vale para toda tela nova:** nada que dependa de `prefers-reduced-motion`,
`localStorage` ou `matchMedia` pode entrar no estado inicial de um componente
renderizado no servidor — o servidor não conhece nada disso, e o HTML dele
divergiria da primeira renderização do cliente. O padrão do projeto é começar
igual nos dois lados e ajustar depois da montagem (`useSyncExternalStore` no
`DesafioScanner`, espera zerada no `ResultadoBatalha`).

---

## Equipe

**Orientador:** Fernando Nemec

| Membro | GitHub |
|---|---|
| Julia de Moraes Barbosa | [@juliacrws](https://github.com/juliacrws) |
| Mariana Ayumi Dantas Kuramitsu | [@marianakuramitsu](https://github.com/marianakuramitsu) |
| Yasmin Yumi Tsunokawa | [@Tsunokaway](https://github.com/Tsunokaway) |
| Lucas Amaral da Silva Barros | [@LucasAmaral1306](https://github.com/LucasAmaral1306) |
| Mateus Bhering Beltrão Santos | [@mateusbhering](https://github.com/mateusbhering) |
| Guilherme Ladeira Correa Santos | [@Ladeira26](https://github.com/Ladeira26) |
