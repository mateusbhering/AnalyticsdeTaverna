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
| Vercel | — | Deploy, CDN, CI/CD |

---

## Estrutura de Diretórios

```
IC-SITE/
├── README.md
└── rpg-site/                          # Raiz do projeto Next.js
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

O resultado do quiz é serializado como query string e codificado no QR Code. **Sem banco de dados.**

**Formato da URL:**
```
/personagem?classe=Artífice+da+Gambiarra&for=12&int=8&agi=10&res=9&car=6&sab=7&cao=14
```

**Parâmetros:**

| Param | Tipo | Descrição |
|---|---|---|
| `classe` | string | Nome exato da classe (usado para lookup na `CLASS_LIST`) |
| `for` | number | Força |
| `int` | number | Inteligência |
| `agi` | number | Agilidade |
| `res` | number | Resistência |
| `car` | number | Carisma |
| `sab` | number | Sabedoria |
| `cao` | number | Caos |

**Renderização:** `PersonagemCard` é um Client Component que usa `useSearchParams()`. A foto da webcam **não é incluída** (data URL em base64 seria inviável em query string). O QR Code na página `/personagem` aponta para a própria URL da página.

**Suspense boundary:** `page.tsx` envolve `<PersonagemCard>` em `<Suspense>` para compatibilidade com o comportamento de `useSearchParams` no App Router.

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
| Lucas Luna Pimentel | [@oipimenta](https://github.com/oipimenta) |
| Lucas Amaral da Silva Barros | — |
| Mateus Bhering Beltrão Santos | [@mateusbhering](https://github.com/mateusbhering) |
| Guilherme Ladeira Correa Santos | — |
