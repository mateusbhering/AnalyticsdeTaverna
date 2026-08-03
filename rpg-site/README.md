# Analytics de Taverna

Site institucional e experiência interativa de gamificação comportamental. Usuários respondem um quiz, recebem uma classe de RPG determinística e um card digital compartilhável via QR Code.

🌐 **Produção:** [site-ic-orcin.vercel.app](https://site-ic-orcin.vercel.app)  
📦 **Repositório:** [github.com/mateusbhering/site_ic](https://github.com/mateusbhering/site_ic)

---

## Stack

| Tecnologia | Versão | Papel |
|---|---|---|
| Next.js | 16.2.6 | Framework (App Router, SSR/SSG) |
| React | 19.2.4 | UI |
| TypeScript | ^5 | Tipagem estática |
| Tailwind CSS | v4 | Estilização (PostCSS plugin) |
| NextAuth.js | 5.0.0-beta.31 | Autenticação GitHub OAuth (área admin) |
| qrcode.react | 4.2.0 | Geração de QR Code SVG client-side |
| Vercel | — | Deploy do frontend, CDN, CI/CD |
| Python / FastAPI | 3.12 | Backend/API (avatar, batalha, ranking, analytics) |
| arq + Redis | — | Fila assíncrona da geração de avatar |
| Supabase | — | Postgres (jogadores/batalhas) + Storage (avatares) |
| Google Gemini | `gemini-3.1-flash-image` | Geração do avatar de IA |
| Render | — | Deploy do backend (API + worker + Redis) |

---

## Estrutura de Diretórios

```
IC-SITE/
├── README.md
└── rpg-site/                          # Raiz do projeto Next.js
    ├── backend/                       # API Python (FastAPI): avatar + jogadores + batalha + ranking + analytics
    │   ├── app/
    │   │   ├── config.py              # Settings via env (Redis, Gemini, Supabase, rate limit, TTL)
    │   │   ├── main.py                # App FastAPI + lifespan (pool arq) + CORS + registra routers
    │   │   ├── schemas.py             # Modelos Pydantic (contrato do /docs)
    │   │   ├── repo.py                # Acesso ao banco (Supabase; testes usam repo em memória)
    │   │   ├── domain/                # Regras puras: personagem.py, batalha.py
    │   │   ├── routers/               # avatar, personagem, jogadores, batalha, ranking, analytics
    │   │   └── workers/avatar_worker.py  # generate_avatar_task + rate limiter + WorkerSettings
    │   ├── sql/schema.sql             # Schema do banco (jogadores, batalhas, RLS, RPC de placar)
    │   ├── tests/                     # pytest (repo em memória + mocks; sem Redis/Gemini/Supabase reais)
    │   ├── render.yaml                # Blueprint da Render (raiz do repo git também tem um)
    │   └── requirements.txt
    ├── next.config.ts
    ├── tsconfig.json
    ├── package.json
    ├── public/
    │   ├── logo.png
    │   └── guild/                     # Fotos dos membros (PNG, exibidas em avatar circular)
    └── src/
        ├── auth.ts                    # NextAuth config + allowlist de admins
        ├── proxy.ts                   # Edge Middleware — protege /admin/*
        ├── app/
        │   ├── layout.tsx             # Root layout (fontes Geist, metadata global)
        │   ├── globals.css            # Tailwind import + keyframes custom
        │   ├── page.tsx               # Landing page — compõe as seções
        │   ├── jogar/
        │   │   └── page.tsx           # /jogar — wrapper que renderiza <QuizForm>
        │   ├── personagem/
        │   │   ├── page.tsx           # /personagem — Suspense wrapper + skeleton
        │   │   └── PersonagemCard.tsx # Client component — lê useSearchParams e renderiza card
        │   ├── admin/
        │   │   ├── page.tsx           # /admin — dashboard (protegido por middleware)
        │   │   └── login/
        │   │       └── page.tsx       # /admin/login — trigger do fluxo OAuth
        │   └── api/
        │       └── auth/[...nextauth]/
        │           └── route.ts       # Catch-all handler do NextAuth
        └── components/
            ├── questions-data.ts      # Banco de 120 perguntas + tipos exportados
            ├── QuizForm.tsx           # Máquina de estados do quiz (photo→quiz→result)
            ├── CharacterResult.tsx    # Cálculo de atributos, classificação e card final
            ├── WebcamCapture.tsx      # Captura de frame via getUserMedia
            ├── Navbar.tsx
            ├── Hero.tsx
            ├── ConceptSection.tsx
            ├── FlowSection.tsx
            ├── AttributesSection.tsx
            ├── WhyDifferent.tsx
            ├── TechSection.tsx
            ├── DashboardSection.tsx
            ├── GuildSection.tsx
            ├── CTASection.tsx
            └── Footer.tsx
```

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

// QuizForm.tsx
interface Dimensions {
  lideranca: number; estrategia: number; disciplina: number;
  persistencia: number; sociabilidade: number; empatia: number;
  adaptabilidade: number; criatividade: number;
  impulsividade: number; percepcao: number;
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

### Seleção aleatória de perguntas

```ts
const QUIZ_SIZE = 5;

function pickRandom(): Question[] {
  return [...ALL_QUESTIONS]
    .sort(() => Math.random() - 0.5)
    .slice(0, QUIZ_SIZE);
}
```

Executado em `useState(pickRandom)` — uma vez na montagem. Re-executado ao chamar `restart()`.

### Máquina de estados (`QuizForm`)

```
"photo" ──(foto capturada + clique)──► "quiz" ──(última resposta)──► "result"
   ▲                                                                      │
   └──────────────────────────(restart())────────────────────────────────┘
```

Estado local: `step`, `photo` (data URL), `questions` (array de 5), `current` (índice), `dims`, `tags`.

---

## Cálculo de Atributos

Executado em `useMemo` dentro de `CharacterResult` após o quiz.

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

Cada alternativa carrega uma tag. Ao longo das 5 respostas, as tags se acumulam num array. A função `tc(tag)` conta ocorrências:

```ts
const tc = (tag: string) => tags.filter(t => t === tag).length;
```

### Regras (ordem de prioridade)

| # | Classe | Condição |
|---|---|---|
| 1 | Mago do ChatGPT | `estrategia≥15 && tc("TECNOLÓGICO")≥3 && tc("NERD")≥2` |
| 2 | Ninja do Visto por Último | `adaptabilidade≥12 && tc("FURTIVO")≥3 && tc("PROCRASTINADOR")≥2` |
| 3 | Berserker do Crossfit | `impulsividade≥14 && tc("ATLETA")≥3 && tc("DOPAMINA")≥2` |
| 4 | Necromante de Planilha | `disciplina≥15 && tc("PERFECCIONISTA")≥3 && tc("NERD")≥2` |
| 5 | Ladino do Home Office | `adaptabilidade≥13 && tc("FURTIVO")≥2 && tc("PROCRASTINADOR")≥2 && sociabilidade<10` |
| 6 | Warlock do Boleto | `persistencia≥14 && tc("ANSIOSO")≥3 && tc("RESOLUTIVO")≥2` |
| 7 | Ilusionista de Call | `sociabilidade≥14 && tc("EXTROVERTIDO")≥3 && tc("MALANDRO")≥2` |
| 8 | Artífice da Gambiarra | `criatividade≥15 && tc("GAMBIARRA")≥3 && tc("RESOLUTIVO")≥2` |
| 9 | Invocador de iFood | `impulsividade≥12 && tc("DOPAMINA")≥3 && tc("PROCRASTINADOR")≥2` |
| 10 | Druida de Varanda | `empatia≥14 && tc("ZEN")≥3 && tc("INTROVERTIDO")≥2` |
| 11 | Ranger da Faxina | `disciplina≥14 && tc("ZEN")≥2 && tc("RESOLUTIVO")≥3` |
| 12 | Bardo do Karaokê | `sociabilidade≥15 && tc("EXTROVERTIDO")≥3 && tc("DOPAMINA")≥2` |
| 13 | Xamã das Criptomoedas | `estrategia≥12 && tc("CAÓTICO")≥3 && tc("MALANDRO")≥2` |
| 14 | Vidente da Ansiedade | `percepcao≥15 && tc("ANSIOSO")≥4 && tc("OVERTHINKING")≥3` |
| 15 | Paladino do Grupo | `lideranca≥15 && tc("LÍDER")≥3 && tc("JUSTICEIRO")≥2` |
| 16 | Domador de Pet | `empatia≥13 && tc("CURADOR")≥3 && tc("ZEN")≥2` |

**Fallback:** se nenhuma regra for satisfeita (comum com apenas 5 perguntas), a **dimensão com maior pontuação** mapeia para a classe primária daquela dimensão:

```ts
const dominant = Object.entries(dims).reduce((a, b) => b[1] > a[1] ? b : a)[0];
const fallback: Record<DimKey, string> = {
  lideranca: "Paladino do Grupo", estrategia: "Mago do ChatGPT",
  disciplina: "Necromante de Planilha", persistencia: "Warlock do Boleto",
  sociabilidade: "Bardo do Karaokê", empatia: "Domador de Pet",
  adaptabilidade: "Ladino do Home Office", criatividade: "Artífice da Gambiarra",
  impulsividade: "Invocador de iFood", percepcao: "Vidente da Ansiedade",
};
```

---

## Banco de Perguntas

Extraído da planilha `questionário_deterministico_final2.0.xlsx` (aba `Banco_120_Perguntas`).

**120 perguntas**, cada uma com 4 alternativas. Distribuição aproximada por dimensão principal:

| Dimensão | Questões |
|---|---|
| Disciplina | 23 |
| Estratégia | 17 |
| Empatia | 14 |
| Impulsividade | 13 |
| Adaptabilidade | 12 |
| Percepção | 11 |
| Criatividade | 11 |
| Liderança | 9 |
| Persistência | 6 |
| Sociabilidade | 3 |

**21 tags secretas:** FURTIVO · MALANDRO · ATLETA · CAÓTICO · PERFECCIONISTA · ANSIOSO · TECNOLÓGICO · SOCIAL · LÍDER · ZEN · GAMBIARRA · DOPAMINA · INTROVERTIDO · EXTROVERTIDO · JUSTICEIRO · PROCRASTINADOR · COMPETITIVO · CURADOR · NERD · OVERTHINKING · RESOLUTIVO

---

## Página de Compartilhamento (`/personagem`)

Cada jogador ganha um **link único, curto e permanente** ao terminar o quiz:

```
/personagem?id=42
```

Ao concluir o quiz (em `CharacterResult`), o jogador é salvo na tabela `jogadores` do Supabase e o `id` retornado vira o link (mostrado como QR + botão "Copiar link"). Abrir `/personagem?id={id}` faz o `PersonagemCard` **ler o jogador do banco** (classe, atributos, `foto_url`) e renderizar o card com o **avatar de IA** — carregado direto do **Supabase Storage** (permanente, via CDN). Estados de "invocando…" e "não encontrado".

**Compatibilidade:** links antigos por query string (`?classe=…&for=…&avatar={jobId}`) continuam funcionando — se não houver `id`, o card renderiza a partir dos params.

**Renderização:** `PersonagemCard` é um Client Component; `page.tsx` o envolve em `<Suspense>` (exigência do `useSearchParams` no App Router). A foto original da webcam nunca aparece aqui — só o avatar gerado.

---

## Backend / API (`backend/`)

Serviço Python **separado** do Next.js. Começou como a geração de avatar e cresceu para a **API completa** do projeto: cadastro de jogadores, geração de personagem, sistema de batalha, ranking e dashboard analytics.

**Stack:** FastAPI · **arq** (fila sobre Redis, só para o avatar) · Redis · Supabase (Postgres + Storage) · `google-genai` (`gemini-3.1-flash-image`, configurável).

**Camadas** (os routers nunca falam com Gemini/Supabase direto):
- `app/routers/` — HTTP (validação + I/O). `app/domain/` — regras puras (personagem, batalha). `app/repo.py` — todo acesso ao banco (Supabase via PostgREST, em threadpool; os testes injetam um repo em memória e rodam sem banco). `app/schemas.py` — modelos Pydantic (contrato do `/docs`).
- Documentação automática (OpenAPI): **`/docs`**. Health: **`/health`**.

### Endpoints

| Área | Método & rota | O que faz |
|---|---|---|
| **Avatar** | `POST /avatar/generate` | Valida a foto (jpeg/png/webp, ≤8MB) e enfileira o job; devolve `job_id`. |
| | `GET /avatar/status/{id}` | Polling: `processing` \| `done`+imagem \| `error`. |
| | `GET /avatar/image/{id}` | Imagem crua (bytes) — enquanto durar o TTL de 24h no Redis. |
| | `DELETE /avatar/result/{id}` | Limpeza antecipada do resultado no Redis. |
| **Personagem** | `POST /personagem/gerar` | Dimensões do quiz → atributos + classe (determinístico, não grava). |
| | `GET /personagem/classes` | Catálogo de classes/dimensões/atributos. |
| **Jogadores** | `POST /jogadores` | Cadastra o jogador (placar zera no servidor) e devolve o `id`. |
| | `GET /jogadores/{id}` · `GET /jogadores` | Consulta um / lista paginada. |
| **Batalha** | `POST /batalha/parear` | Matchmaking por XP próximo. |
| | `POST /batalha` | Resolve o confronto, registra e atualiza o placar dos dois. |
| | `GET /batalha/atributos` · `GET /batalha/{id}` · `GET /batalha/historico/{id}` | Atributos disputáveis / detalhe / histórico. |
| **Ranking** | `GET /ranking` · `GET /ranking/{id}` | Top N por XP / posição de um jogador. |
| **Analytics** | `GET /analytics/{resumo,classes,atributos,batalhas,taxa-vitoria,insight}` | Números do dashboard, agregados em Python. |

### Avatar — fluxo assíncrono e retenção

```
POST /avatar/generate ─► valida ─► enfileira base64(foto) no arq→Redis ─► { job_id, "processing" }
Worker arq ─► Gemini (pacing p/ não estourar o rate limit) ─► upload no Supabase Storage
           ─► SET avatar_result:{job_id} = { status, image, mime, public_url }  (TTL 24h)
```

| Dado | Retenção |
|---|---|
| **Foto original** | **Nunca persistida.** Só em memória durante o job; trafega no Redis apenas como payload da fila e é consumida pelo worker. `keep_result = 0`. Sem chave durável, log ou disco. |
| **Avatar gerado** | Redis `avatar_result:{id}` (TTL 24h) **+ Supabase Storage** (bucket `avatars`, **permanente**, servido por CDN — é o que o `/personagem` usa). |

**Rate limit:** o modelo de imagem tem RPM baixo; o worker tem um rate limiter (`GEMINI_MAX_RPM`) que espaça as chamadas para não estourar a cota. Detalhes em [`backend/README.md`](backend/README.md).

### Banco (Supabase / Postgres)

Schema idempotente em [`backend/sql/schema.sql`](backend/sql/schema.sql):
- **`jogadores`** — classe, 7 atributos, 10 dimensões, `foto_url`, placar (`xp/vitorias/derrotas/empates`).
- **`batalhas`** — uma linha por confronto (atributo, valores, resultado, XP).
- **RLS:** frontend (chave anon) pode **inserir e ler** jogadores; **escrita do placar e das batalhas é só do backend** (chave service_role) — impede alguém dar XP a si mesmo pelo console. Função `aplicar_resultado_batalha` soma XP atomicamente (evita lost update).

Execução, variáveis de ambiente, deploy e o que o Supabase espera (bucket + tabela + RLS + chaves): [`backend/README.md`](backend/README.md).

### Integração com o frontend

```
/jogar → foto (webcam) → quiz → CharacterResult:
   dispara avatar.start(photo, classe)  ─► POST /avatar/generate  ─► polling status (~2.5s, teto ~3min)
   ao terminar: salva o jogador na tabela `jogadores` e gera um LINK ÚNICO
   /personagem?id={id}  (QR + "Copiar link"). Avatar do Supabase (permanente).

/personagem?id={id} → lê o jogador do banco → renderiza card + avatar.
```

Hook: [`src/lib/useAvatarGeneration.ts`](src/lib/useAvatarGeneration.ts). Enquanto gera, o card mostra "Conjurando seu avatar…"; em erro, uma mensagem (sem placeholder de classe).

**Env vars do frontend** (`.env.local` / Vercel):

```env
NEXT_PUBLIC_AVATAR_API_URL=http://localhost:8000            # host do backend Python
NEXT_PUBLIC_SUPABASE_URL=https://<projeto>.supabase.co      # avatar permanente + tabela jogadores
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...            # chave pública (RLS protege)
```

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

### Allowlist de admins (`src/auth.ts`)

```ts
const ADMIN_USERNAMES = [
  "mateusbhering", "juliacrws", "Tsunokaway", "oipimenta", "marianakuramitsu"
];
```

Adicionar um admin = adicionar o GitHub username nesse array e fazer push.

### Middleware (`src/proxy.ts`)

```ts
export const config = { matcher: ["/admin/:path*"] };
```

Roda na Edge Runtime do Vercel. Redireciona para `/admin/login` se não houver sessão ativa, e redireciona de volta para `/admin` se já autenticado tentar acessar `/admin/login`.

### Variáveis de ambiente

```env
AUTH_SECRET=          # openssl rand -hex 32  (obrigatório em produção)
GITHUB_CLIENT_ID=     # GitHub OAuth App
GITHUB_CLIENT_SECRET= # GitHub OAuth App
AUTH_URL=             # URL base (ex: https://site-ic-orcin.vercel.app)
```

---

## Deploy e CI/CD

O repositório está conectado à Vercel. Todo push em `main` dispara um deploy automático de produção.

**Build command:** `next build` (padrão Vercel)  
**Output:** `.next/` (serverless functions + static assets)  
**Runtime das rotas de API:** Node.js serverless  
**Runtime do middleware:** Edge

Deploy manual:
```bash
vercel --prod
```

---

## Desenvolvimento Local

```bash
cd rpg-site
npm install

# Variáveis de ambiente (mínimo para o quiz funcionar sem admin)
# Criar .env.local com AUTH_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, AUTH_URL

npm run dev      # http://localhost:3000
npm run build    # build de produção local
npm run lint     # ESLint
```

Para o OAuth funcionar localmente, adicionar `http://localhost:3000/api/auth/callback/github` como Authorized Callback URL no GitHub OAuth App.

---

## Design System

**Paleta:**

| Token | Valor | Uso |
|---|---|---|
| `--background` | `#050010` | Fundo global |
| `--foreground` | `#f0e6ff` | Texto |
| purple | `#7c3aed` | Cor primária, glows, gradientes |
| gold | `#f59e0b` | Destaques, valores numéricos |
| cyan | `#06b6d4` | Acentos técnicos |

**Animações CSS custom (`globals.css`):** `float`, `pulse-glow`, `shimmer`, `stat-bar`

**Convenções de componente:** seções da landing são Server Components puros (sem `"use client"`). Interatividade isolada em `QuizForm`, `CharacterResult`, `PersonagemCard`, `WebcamCapture`, `DashboardSection`, `Navbar`.

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
