# ⚔️ Analytics de Taverna

Site institucional do projeto **Analytics de Taverna** — uma experiência interativa que transforma dados comportamentais em personagens de RPG únicos, com gamificação e muito estilo.

🌐 **Deploy:** [site-ic-orcin.vercel.app](https://site-ic-orcin.vercel.app)

---

## 📋 Sobre o Projeto

O Analytics de Taverna combina **psicologia comportamental** e **gamificação real** numa experiência de evento presencial:

1. O usuário tira uma foto pela webcam
2. Responde **5 perguntas aleatórias** sorteadas de um banco de 120
3. Cada resposta pontua uma das **10 dimensões psicológicas** (Adaptabilidade, Estratégia, Disciplina…)
4. As dimensões são convertidas em **7 atributos de RPG** por fórmulas determinísticas
5. **Tags secretas** de comportamento (PERFECCIONISTA, FURTIVO, ZEN…) definem qual das **16 classes** o usuário recebe
6. Um **card digital** com QR Code é gerado e leva a uma página própria compartilhável

---

## 🧠 Sistema de Classes

### Pipeline completo

```
Respostas (5 perguntas) → 10 Dimensões → 7 Atributos RPG → 16 Classes
```

### 10 Dimensões psicológicas

| Dimensão | Contribui para |
|---|---|
| Liderança | Força, Carisma |
| Estratégia | Inteligência |
| Disciplina | Resistência |
| Persistência | Força, Resistência |
| Sociabilidade | Carisma |
| Empatia | Sabedoria |
| Adaptabilidade | Agilidade |
| Criatividade | Caos |
| Impulsividade | Força, Agilidade, Caos |
| Percepção | Inteligência, Sabedoria |

### 7 Atributos e suas fórmulas

| Atributo | Fórmula |
|---|---|
| 💪 Força | Persistência + Liderança + Impulsividade × 0.5 |
| 🧠 Inteligência | Estratégia + Percepção |
| ⚡ Agilidade | Adaptabilidade + Impulsividade × 0.5 |
| 🛡️ Resistência | Disciplina + Persistência |
| ✨ Carisma | Sociabilidade + Liderança |
| 👁️ Sabedoria | Empatia + Percepção |
| 🌪️ Caos | Criatividade + Impulsividade |

### 16 Classes (determinísticas)

| Classe | Regra principal |
|---|---|
| 🔮 Mago do ChatGPT | Estratégia ≥ 15 + tags TECNOLÓGICO + NERD |
| 👁️ Ninja do Visto por Último | Adaptabilidade ≥ 12 + tags FURTIVO + PROCRASTINADOR |
| 💪 Berserker do Crossfit | Impulsividade ≥ 14 + tags ATLETA + DOPAMINA |
| 📊 Necromante de Planilha | Disciplina ≥ 15 + tags PERFECCIONISTA + NERD |
| 🏠 Ladino do Home Office | Adaptabilidade ≥ 13 + tags FURTIVO + PROCRASTINADOR + Sociabilidade < 10 |
| 💸 Warlock do Boleto | Persistência ≥ 14 + tags ANSIOSO + RESOLUTIVO |
| 🎭 Ilusionista de Call | Sociabilidade ≥ 14 + tags EXTROVERTIDO + MALANDRO |
| 🔧 Artífice da Gambiarra | Criatividade ≥ 15 + tags GAMBIARRA + RESOLUTIVO |
| 🍕 Invocador de iFood | Impulsividade ≥ 12 + tags DOPAMINA + PROCRASTINADOR |
| 🌿 Druida de Varanda | Empatia ≥ 14 + tags ZEN + INTROVERTIDO |
| 🧹 Ranger da Faxina | Disciplina ≥ 14 + tags ZEN + RESOLUTIVO |
| 🎤 Bardo do Karaokê | Sociabilidade ≥ 15 + tags EXTROVERTIDO + DOPAMINA |
| 📈 Xamã das Criptomoedas | Estratégia ≥ 12 + tags CAÓTICO + MALANDRO |
| 🔭 Vidente da Ansiedade | Percepção ≥ 15 + tags ANSIOSO + OVERTHINKING |
| 🏰 Paladino do Grupo | Liderança ≥ 15 + tags LÍDER + JUSTICEIRO |
| 🐾 Domador de Pet | Empatia ≥ 13 + tags CURADOR + ZEN |

Se nenhuma regra for satisfeita, a **dimensão dominante** do jogador define a classe via fallback.

---

## 🛠️ Stack

| Tecnologia | Versão | Uso |
|---|---|---|
| Next.js | 16.2.6 | Framework principal (App Router) |
| React | 19.2.4 | UI |
| Tailwind CSS | v4 | Estilização |
| NextAuth.js | v5 beta | Autenticação GitHub OAuth |
| qrcode.react | 4.2.0 | Geração de QR Code |
| TypeScript | ^5 | Tipagem estática |
| Vercel | — | Deploy e hospedagem |

---

## 📁 Estrutura de Arquivos

```
rpg-site/
└── src/
    ├── app/
    │   ├── page.tsx                    # Landing page
    │   ├── layout.tsx                  # Layout global
    │   ├── globals.css                 # Estilos globais + animações
    │   ├── jogar/
    │   │   └── page.tsx                # Página do quiz (/jogar)
    │   ├── personagem/
    │   │   ├── page.tsx                # Card compartilhável por QR Code (/personagem)
    │   │   └── PersonagemCard.tsx      # Componente do card (lê URL params)
    │   ├── admin/
    │   │   ├── page.tsx                # Dashboard admin (protegido)
    │   │   └── login/
    │   │       └── page.tsx            # Login admin
    │   └── api/
    │       └── auth/[...nextauth]/
    │           └── route.ts            # Handler NextAuth
    ├── components/
    │   ├── QuizForm.tsx                # Fluxo completo: foto → quiz → resultado
    │   ├── CharacterResult.tsx         # Tela de resultado com classe, atributos e QR
    │   ├── WebcamCapture.tsx           # Captura de foto via webcam
    │   ├── questions-data.ts           # Banco de 120 perguntas com dimensões e tags
    │   ├── Navbar.tsx
    │   ├── Hero.tsx
    │   ├── ConceptSection.tsx
    │   ├── FlowSection.tsx
    │   ├── AttributesSection.tsx
    │   ├── WhyDifferent.tsx
    │   ├── TechSection.tsx
    │   ├── DashboardSection.tsx
    │   ├── GuildSection.tsx
    │   ├── CTASection.tsx
    │   └── Footer.tsx
    ├── auth.ts                         # NextAuth config + lista de admins
    └── proxy.ts                        # Middleware de proteção de rotas
```

---

## 🃏 QR Code e Página de Compartilhamento

Ao terminar o quiz, um QR Code é gerado apontando para `/personagem` com todos os dados do personagem codificados na URL:

```
/personagem?classe=Artífice+da+Gambiarra&for=12&int=8&agi=10&res=9&car=6&sab=7&cao=14
```

A página `/personagem` lê esses parâmetros e exibe o card completo — sem banco de dados. Qualquer pessoa que escanear o QR vê o mesmo resultado.

> A foto da webcam não é incluída no QR (muito grande para uma URL). Apenas classe e atributos são compartilhados.

---

## 🎨 Seções da Landing Page

| Seção | Descrição |
|---|---|
| **Hero** | Partículas animadas, canvas de estrelas, stats: 16 classes / 7 atributos / 5 perguntas |
| **Conceito Central** | Os 4 pilares: Foto, Quiz Comportamental, Card Digital e Batalha |
| **Fluxo da Experiência** | 5 etapas: Atração → Entrada → Captura → Processamento → Apresentação |
| **Atributos & Classes** | 7 atributos com fórmulas reais + 8 das 16 classes exibidas |
| **Diferenciais** | Psicologia Aplicada, IA Generativa, Viral por Design, Gamificação Real |
| **Estrutura Técnica** | Frontend, Backend, IA, Lógica Própria (10 dimensões / 7 atributos / 16 classes) |
| **Dashboard ao Vivo** | Contador animado, distribuição das 16 classes, insights comportamentais |
| **Guilda** | Cards com foto e nome de cada membro da equipe |
| **CTA Final** | Botões "Jogar Sozinho" e "Desafiar Alguém" |

---

## ⚜️ Guilda — Membros da Equipe

| Membro | Foto |
|---|---|
| Julia de Moraes Barbosa | ✅ |
| Mariana Ayumi Dantas Kuramitsu | ✅ |
| Yasmin Yumi Tsunokawa | ✅ |
| Lucas Luna Pimentel | ✅ |
| Lucas Amaral da Silva Barros | — |
| Mateus Bhering Beltrão Santos | ✅ |
| Guilherme Ladeira Correa Santos | ✅ |

Fotos em `rpg-site/public/guild/`. Membros sem foto recebem ícone placeholder.

**Orientador:** Fernando Nemec

---

## 🔒 Área Admin

Área protegida por **GitHub OAuth** via NextAuth.

- URL: `/admin/login`
- Apenas GitHub usernames autorizados em `src/auth.ts` conseguem entrar

### Variáveis de ambiente

```env
AUTH_SECRET=          # openssl rand -hex 32
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
AUTH_URL=             # URL base em produção
```

### Configurar GitHub OAuth App

1. [github.com/settings/developers](https://github.com/settings/developers) → **OAuth Apps** → **New OAuth App**
2. **Homepage URL:** `https://site-ic-orcin.vercel.app`
3. **Callback URL:** `https://site-ic-orcin.vercel.app/api/auth/callback/github`

---

## 🚀 Rodando Localmente

**Pré-requisitos:** Node.js 18+

```bash
cd rpg-site
npm install
cp .env.local.example .env.local   # preencher variáveis
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

> Para o admin funcionar localmente, adicione `http://localhost:3000/api/auth/callback/github` como callback URL no GitHub OAuth App.

---

## 📦 Deploy

Deploy automático na **Vercel** a cada push em `main`.

```bash
vercel --prod   # deploy manual
```

---

## 🎨 Design

- **Tema:** Dark gaming (`#050010`)
- **Cores:** Roxo `#7c3aed` · Dourado `#f59e0b` · Ciano `#06b6d4`
- **Animações:** Partículas flutuantes, canvas de estrelas, shimmer, glow pulsante
- **Responsivo:** Mobile e desktop
