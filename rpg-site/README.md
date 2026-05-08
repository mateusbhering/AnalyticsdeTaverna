# ⚔️ Analytics de Taverna

Site institucional do projeto **Analytics de Taverna** — uma experiência interativa que transforma dados comportamentais em personagens de RPG únicos, com gamificação, IA generativa e muito estilo.

🌐 **Deploy:** [site-ic-orcin.vercel.app](https://site-ic-orcin.vercel.app)

---

## 📋 Sobre o Projeto

O Analytics de Taverna é um projeto experimental que combina **psicologia comportamental**, **IA generativa (Google Gemini)** e **gamificação real** para criar uma experiência única:

1. O usuário tira uma foto e responde um quiz de 5–8 perguntas
2. As respostas são convertidas em atributos de RPG (Força, Inteligência, Agilidade, Carisma, Resistência)
3. A IA gera um avatar personalizado baseado na foto
4. O sistema classifica o usuário em uma classe (Guerreiro, Mago, Ladino, Paladino, Arqueiro...)
5. Uma batalha automática é simulada contra outro jogador ou a IA
6. Um card digital exclusivo é gerado com QR Code para compartilhamento

---

## 🛠️ Stack

| Tecnologia | Versão | Uso |
|---|---|---|
| Next.js | 16.2.6 | Framework principal (App Router) |
| React | 19.2.4 | UI |
| Tailwind CSS | v4 | Estilização |
| NextAuth.js | v5 beta | Autenticação GitHub OAuth |
| TypeScript | — | Tipagem estática |
| Vercel | — | Deploy e hospedagem |

---

## 📁 Estrutura de Arquivos

```
rpg-site/
└── src/
    ├── app/
    │   ├── page.tsx               # Página principal (landing page)
    │   ├── layout.tsx             # Layout global
    │   ├── globals.css            # Estilos globais + animações custom
    │   ├── admin/
    │   │   ├── page.tsx           # Dashboard admin (protegido)
    │   │   └── login/
    │   │       └── page.tsx       # Página de login admin
    │   └── api/
    │       └── auth/
    │           └── [...nextauth]/
    │               └── route.ts   # Handler do NextAuth
    ├── components/
    │   ├── Navbar.tsx             # Navbar fixa com scroll detection
    │   ├── Hero.tsx               # Seção hero com canvas de estrelas
    │   ├── ConceptSection.tsx     # Conceito central do projeto
    │   ├── FlowSection.tsx        # Fluxo em 5 etapas
    │   ├── AttributesSection.tsx  # Atributos e classes de RPG
    │   ├── WhyDifferent.tsx       # Diferenciais do projeto
    │   ├── TechSection.tsx        # Estrutura técnica
    │   ├── GuildSection.tsx       # Seção Guilda com membros da equipe
    │   ├── DashboardSection.tsx   # Dashboard ao vivo (simulado)
    │   ├── CTASection.tsx         # Call to action final
    │   └── Footer.tsx             # Rodapé
    ├── auth.ts                    # Configuração NextAuth + admins
    └── proxy.ts                   # Middleware de proteção de rotas
```

---

## 🎨 Seções do Site

| Seção | Descrição |
|---|---|
| **Hero** | Tela de entrada com partículas animadas, ícones flutuantes e canvas de estrelas |
| **Conceito Central** | Os 4 pilares: Foto, Quiz, Batalha e Card Digital |
| **Fluxo da Experiência** | 5 etapas: Atração → Entrada → Captura → Processamento → Apresentação |
| **Atributos & Classes** | Barras de atributos + 5 classes de RPG com descrições |
| **Diferenciais** | Psicologia Aplicada, IA Generativa, Viral por Design, Gamificação Real |
| **Estrutura Técnica** | Frontend, Backend, IA, Lógica Própria e Banco de Dados |
| **Dashboard ao Vivo** | Contador animado de participantes, distribuição de classes e insights |
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
| Lucas Amaral da Silva Barros | — (sem foto) |
| Mateus Bhering Beltrão Santos | ✅ |
| Guilherme Ladeira Correa Santos | ✅ |

As fotos ficam em `rpg-site/public/guild/` e são exibidas em formato circular. Membros sem foto recebem um ícone de RPG como placeholder.

---

## 🔒 Área Admin

O site possui uma área administrativa protegida por autenticação via **GitHub OAuth**.

### Acesso

- URL: `/admin/login`
- Apenas os usuários GitHub autorizados conseguem entrar

### Admins autorizados

| GitHub | 
|---|
| [@mateusbhering](https://github.com/mateusbhering) |
| [@juliacrws](https://github.com/juliacrws) |

### Como funciona

1. Usuário acessa `/admin/login` e clica em "Entrar com GitHub"
2. GitHub autentica e retorna o perfil
3. NextAuth verifica se o `login` está na lista de admins
4. Se autorizado → acesso ao dashboard em `/admin`
5. Se não autorizado → tela de "Acesso negado"
6. Qualquer rota `/admin/*` sem sessão ativa → redirecionado para `/admin/login`

### Variáveis de ambiente necessárias

```env
AUTH_SECRET=                  # Gerado com: openssl rand -hex 32
GITHUB_CLIENT_ID=             # GitHub OAuth App
GITHUB_CLIENT_SECRET=         # GitHub OAuth App
ADMIN_GITHUB_USERNAME=        # (legado, substituído pela lista em auth.ts)
AUTH_URL=                     # URL base do site em produção
```

### Configurar GitHub OAuth App

1. Acesse [github.com/settings/developers](https://github.com/settings/developers) → **OAuth Apps** → **New OAuth App**
2. Preencha:
   - **Homepage URL:** `https://site-ic-orcin.vercel.app`
   - **Authorization callback URL:** `https://site-ic-orcin.vercel.app/api/auth/callback/github`
3. Copie o `Client ID` e `Client Secret` para o `.env.local`

---

## 🚀 Rodando Localmente

**Pré-requisitos:** Node.js 18+

```bash
# Instalar dependências
npm install

# Criar arquivo de variáveis de ambiente
cp .env.local.example .env.local
# (preencher as variáveis no .env.local)

# Iniciar servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

> Para o login admin funcionar localmente, adicione `http://localhost:3000/api/auth/callback/github` como callback URL no seu GitHub OAuth App.

---

## 📦 Deploy

O projeto está conectado ao GitHub e faz deploy automático na **Vercel** a cada push na branch `main`.

Para fazer deploy manual via CLI:

```bash
vercel --prod
```

---

## 🎨 Design

- **Tema:** Dark gaming (`#050010`)
- **Cores principais:** Roxo (`#7c3aed`), Dourado (`#f59e0b`), Ciano (`#06b6d4`)
- **Animações:** Partículas flutuantes, canvas de estrelas, shimmer nos títulos, glow pulsante
- **Responsivo:** Mobile e desktop
