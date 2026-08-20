# Analytics de Taverna

Site institucional e experiência interativa de gamificação comportamental. O usuário tira uma foto, responde um quiz, recebe uma classe de RPG determinística, um avatar gerado por IA e um card digital compartilhável por link/QR Code.

🌐 **Produção:** [analyticsdetaverna.com.br](https://www.analyticsdetaverna.com.br)  
📦 **Repositório:** [github.com/mateusbhering/AnalyticsdeTaverna](https://github.com/mateusbhering/AnalyticsdeTaverna)

---

## Arquitetura em Três Peças

O projeto não é só o Next.js: são três serviços com responsabilidades separadas.

```
                    ┌──────────────────────────────┐
   Navegador ──────►│  Next.js (Vercel)            │
                    │  landing, quiz, card, ranking│
                    └──────┬───────────────┬───────┘
                           │               │
         multipart da foto │               │ insert / select (chave anon)
                           ▼               ▼
              ┌────────────────────┐  ┌──────────────────────────┐
              │ FastAPI (Render)   │  │ Supabase                 │
              │ avatar-api         │  │ • tabela `jogadores`     │
              │ + worker arq       │─►│ • tabela `batalhas`      │
              │ + Redis (fila/TTL) │  │ • Storage bucket `avatars`│
              └─────────┬──────────┘  └──────────────────────────┘
                        │ service_role
                        ▼
                 Google Gemini (imagem)
```

| Peça | Onde roda | Responsabilidade |
|---|---|---|
| `rpg-site/` | Vercel | Landing, quiz, card do personagem, ranking, área admin |
| `rpg-site/backend/` | Render | Geração de avatar (Gemini), cadastro, batalha, ranking, analytics |
| Supabase | — | Postgres (`jogadores`, `batalhas`) + Storage dos avatares |

**O que já está ligado ponta a ponta:** quiz → classificação no front → `POST /avatar/generate` no backend → insert em `jogadores` pela chave anon → card por link único. O dashboard da landing lê o Supabase pelo servidor.

**O que existe mas ainda não é consumido pelo front:** as rotas Python de `/jogadores`, `/personagem`, `/batalha`, `/ranking` e `/analytics`. O QR do card já aponta para `/batalha?oponenteId=…`, uma rota que **ainda não existe** no Next.

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
| lucide-react | ^1.27 | Ícones |
| @supabase/supabase-js | ^2.111 | Client do banco (anon, browser + servidor) |
| NextAuth.js | 5.0.0-beta.31 | Autenticação GitHub OAuth (área admin) |
| qrcode.react | 4.2.0 | QR Code SVG client-side |

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
    ├── src/
    │   ├── auth.ts                   # NextAuth config + allowlist de admins
    │   ├── proxy.ts                  # Middleware — protege /admin/*
    │   ├── app/
    │   │   ├── layout.tsx            # Root layout (Cinzel, Crimson Pro, metadata)
    │   │   ├── globals.css           # Tokens, utilitárias e keyframes do tema
    │   │   ├── page.tsx              # Landing — busca stats no servidor e compõe as seções
    │   │   ├── jogar/page.tsx        # /jogar — wrapper do <QuizForm>
    │   │   ├── personagem/
    │   │   │   ├── page.tsx          # /personagem — Suspense + skeleton
    │   │   │   └── PersonagemCard.tsx# Card compartilhado (lê ?id= ou query params)
    │   │   ├── ranking/page.tsx      # /ranking — quadro de feitos (sem dados ainda)
    │   │   ├── admin/                # /admin e /admin/login (protegidos)
    │   │   └── api/auth/[...nextauth]/route.ts
    │   ├── lib/
    │   │   ├── classes.ts            # CLASS_LIST — as 16 classes (fonte única)
    │   │   ├── stats.ts              # Agregação server-only p/ o dashboard
    │   │   ├── supabase.ts           # Client anon, inicializado preguiçosamente
    │   │   └── useAvatarGeneration.ts# Hook: POST + polling do avatar
    │   └── components/
    │       ├── questions-data.ts     # Banco de 120 perguntas + tipos
    │       ├── QuizForm.tsx          # Máquina de estados (photo→quiz→result)
    │       ├── CharacterResult.tsx   # Atributos, classificação, avatar, link único
    │       ├── WebcamCapture.tsx     # Captura de frame via getUserMedia
    │       ├── PersonagemCard/Navbar/Hero/… # Seções da landing
    │       ├── AdminCalendar.tsx     # Calendário da área admin
    │       └── ui/                   # reveal, count-up, animated-bar, tilt-card, magnetic
    └── backend/
        ├── README.md                 # Documentação detalhada do serviço Python
        ├── requirements.txt
        ├── sql/schema.sql            # Schema idempotente (jogadores, batalhas, RLS)
        ├── app/
        │   ├── main.py               # App FastAPI: lifespan do Redis, CORS, routers
        │   ├── config.py             # Settings via env (pydantic-settings)
        │   ├── schemas.py            # Modelos de entrada/saída
        │   ├── repo.py               # Acesso ao Supabase (Protocol + impl)
        │   ├── domain/               # Regras puras: personagem.py, batalha.py
        │   ├── routers/              # avatar, jogadores, personagem, batalha, ranking, analytics
        │   └── workers/avatar_worker.py  # Job do Gemini + upload no Storage
        └── tests/                    # pytest (repo em memória, fakeredis, Gemini mockado)
```

---

## Rotas do Frontend

| Rota | Render | Descrição |
|---|---|---|
| `/` | Estática (revalida 5min) | Landing com o dashboard ao vivo |
| `/jogar` | Estática | Quiz completo (foto → perguntas → resultado) |
| `/personagem` | Estática + Suspense | Card do personagem por `?id=` ou por query params |
| `/ranking` | Estática | Quadro de feitos da taverna — **ainda sem dados** |
| `/admin` | Dinâmica | Painel protegido (links do projeto + calendário) |
| `/admin/login` | Dinâmica | Início do fluxo OAuth |
| `/api/auth/[...nextauth]` | Node | Handler do NextAuth |

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

### ⚠️ Os dois motores estão fora de sincronia

`backend/app/domain/personagem.py` implementa a **versão antiga** das regras — limiares altos (`estrategia >= 15`, `tc("TECNOLÓGICO") >= 3 && tc("NERD") >= 2`) e desempate do fallback por ordem fixa de `DIMENSOES`. O docstring dele diz que a lógica é a mesma do `CharacterResult.tsx`, mas a recalibração descrita acima só aconteceu no TypeScript.

Hoje isso não afeta o usuário: quem classifica é o frontend, e `POST /personagem/gerar` e `POST /jogadores` (com `dimensoes`) ainda não são chamados. Vira um problema no momento em que o backend passar a ser a fonte da verdade — as mesmas respostas dariam classes diferentes de cada lado.

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
    ▼
Frontend faz polling a cada 2.5s (≤72 tentativas ≈ 3min)
    GET /avatar/status/{job_id} → "processing" | "done" + image | "error"
```

| Var | Onde | Padrão |
|---|---|---|
| `NEXT_PUBLIC_AVATAR_API_URL` | Vercel | `http://localhost:8000` |
| `GEMINI_API_KEY` | Render (secreta) | — |
| `GEMINI_IMAGE_MODEL` | Render | `gemini-3.1-flash-image` |
| `GEMINI_MAX_RPM` | Render | `8` |

**Retenção:** a foto original **nunca é persistida** — trafega só como payload do job (`keep_result = 0` no arq) e vive em memória durante a execução. O avatar gerado fica 24h no Redis e no bucket `avatars`. Há testes de invariante para isso em `tests/test_privacy.py`.

**Rate limit:** o worker tem um limitador global que espaça as chamadas ao Gemini (inclusive os retries) para não estourar `GEMINI_MAX_RPM`. O excedente espera na fila em vez de tomar `429`. Detalhes e como ajustar a cota: [`backend/README.md`](rpg-site/backend/README.md#rate-limit--capacidade-do-gemini).

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

- **`jogadores`** — classe, os 7 atributos, `foto_url`, as 10 dimensões brutas do quiz, placar (`xp`, `vitorias`, `derrotas`, `empates`) e `nome`. Índices em `xp desc`, `criado_em desc` e `classe`.
- **`batalhas`** — uma linha por confronto, guardando os **valores** disputados (não só o vencedor), `resultado` (`a`/`b`/`empate`), `vencedor_id` e o XP de cada lado.

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

O QR Code do card aponta para `/batalha?oponenteId={id}` — a tela de batalha ainda não foi implementada no Next.

**Salvamento:** `CharacterResult` grava o jogador quando o avatar chega a um estado terminal (`done` ou `error`), com dedup por `sessionStorage` para não inserir duas vezes em remontagens.

---

## Dashboard ao Vivo

A seção final da landing lê o Supabase **no servidor** (`src/lib/stats.ts`):

- Pagina a tabela de 1000 em 1000 linhas (teto de 200 páginas) e agrega em memória.
- A agregação pura (`aggregate`) é exportada separada do acesso ao banco para ser testável.
- Percentuais usam como base as linhas **com classe**; cada média de atributo ignora colunas nulas em vez de contá-las como zero.
- Cacheado com `unstable_cache` por **5 minutos** (`revalidate: 300`, tag `player-stats`) — sem isso a landing viraria dinâmica e bateria no Supabase a cada visita.
- Sem credenciais, `getPlayerStats()` devolve `null` e a seção exibe o estado vazio. A landing continua de pé.

Importar `stats.ts` de um Client Component mandaria a tabela inteira para o navegador — por isso `DashboardSection` recebe os números prontos por prop e importa só o **tipo**.

---

## Ranking Global (`/ranking`)

Quadro de feitos no estilo do pergaminho pendurado da taverna: parede de tábuas, roletes de madeira, moldura entalhada com florões, fita dourada com o título e prateleiras de canecas nas laterais (só em telas `xl`). Tudo em CSS — nenhum asset novo.

**Ainda sem dados.** A página mostra a estrutura das colunas (Posto · Aventureiro · Classe · Feitos), cinco lugares vagos com as medalhas do pódio e o estado vazio com CTA para o quiz. A ligação com o backend (`GET /ranking`, que já existe e ordena por XP) é o próximo passo.

---

## API Python

Documentação interativa em `/docs` quando o serviço está no ar.

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/health` | Status + se Redis e banco estão configurados |
| `POST` | `/avatar/generate` | Enfileira a geração (multipart: `file`, `classe`) |
| `GET` | `/avatar/status/{job_id}` | `processing` \| `done` + imagem \| `error` |
| `GET` | `/avatar/image/{job_id}` | Bytes do avatar gerado |
| `DELETE` | `/avatar/result/{job_id}` | Limpeza antecipada do resultado |
| `POST` | `/jogadores` | Cadastra e devolve o registro com `id` |
| `GET` | `/jogadores/{id}` · `/jogadores` | Consulta e listagem paginada |
| `POST` | `/personagem/gerar` | Classe + atributos a partir das dimensões |
| `GET` | `/personagem/classes` | Catálogo de classes |
| `GET` | `/batalha/atributos` | Atributos disputáveis + XP por resultado |
| `POST` | `/batalha/parear` | Matchmaking por XP próximo |
| `POST` | `/batalha` | Resolve o confronto e registra tudo |
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

### Sistema de Batalha

Os dois jogadores disputam **um** atributo escolhido; maior valor vence, iguais empatam.

| Atributo de batalha | Coluna principal | Reserva (jogadores antigos) |
|---|---|---|
| `inteligencia` | `inteligencia` | `inteligencia` |
| `carisma` | `carisma` | `carisma` |
| `estrategia` | `estrategia` (dimensão) | `inteligencia` |
| `criatividade` | `criatividade` (dimensão) | `caos` |

> "Criatividade" e "Estratégia" são **dimensões do quiz**, não atributos do card. Jogadores cadastrados antes do schema novo não têm as dimensões salvas e caem na coluna de reserva — ninguém fica de fora. Para mudar o mapeamento, mexa só nesse dicionário.

**XP:** vitória `30`, empate `15`, derrota `5`. Derrota dá XP de propósito — quem perde continua tendo motivo para jogar.

**Pareamento:** XP mais próximo, com sorteio entre os igualmente próximos para duas partidas seguidas não caírem sempre no mesmo adversário.

**Ordem de gravação:** a batalha é registrada **antes** de o XP ser distribuído. Se o insert falhar, ninguém ganha XP — melhor uma batalha perdida do que XP fantasma.

### Testes

```bash
cd rpg-site/backend
pip install -r requirements-dev.txt
pytest -q
```

Cobrem: motor de batalha, geração de personagem, rotas da API (com repo em memória), endpoint e worker de avatar (Gemini mockado, `fakeredis`) e os invariantes de privacidade.

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

O CORS da API já libera `localhost:3000`, o domínio de produção e o `.vercel.app` — domínio novo precisa entrar em `app/config.py`.

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

Sem Redis a API sobe assim mesmo — só as rotas de avatar ficam desativadas (o `lifespan` registra um aviso).

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

`paper-card` · `paper-frame` · `arcane-corners` · `wax-seal` · `polaroid` · `tag-pill` · `btn-seal` · `btn-parchment` · `icon-frame` · `section-eyebrow` · `gold-grad` · `bg-dark-wood` · `bg-black-linen` · `plank-wall` · `scroll-rod` · `wood-frame` · `scroll-sheet` · `tavern-banner`

**Animações:** `float`, `shimmer`, `pulse-wine`, `candle-flicker`, `arcane-drift`, `bounce-down` — todas desligadas ou reduzidas sob `prefers-reduced-motion` (via `MotionProvider` e media queries no CSS).

**Convenções:** seções da landing são Server Components; a interatividade fica isolada em `QuizForm`, `CharacterResult`, `PersonagemCard`, `WebcamCapture`, `DashboardSection`, `Navbar`, `AdminCalendar` e nos componentes de `ui/`. No mobile os blobs de blur são desligados (custo de GPU) e a navbar usa fundo sólido — `backdrop-filter` em barra fixa causa glitches em navegadores móveis.

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
