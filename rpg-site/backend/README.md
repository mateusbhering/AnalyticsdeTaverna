# Backend — Geração de Avatar com IA

Serviço Python que transforma a foto da webcam num avatar de RPG usando o
Google Gemini. Arquitetura assíncrona: **FastAPI** (API) + **arq** (fila sobre
Redis) + **Redis** (fila e cache de resultado).

> ⚠️ **Serviço separado do Next.js.** Roda em outro processo/host. O frontend
> chama a API via HTTP (CORS liberado para `localhost:3000` e o domínio de
> produção — ajuste em `app/config.py` / env).

## Fluxo assíncrono

```
Frontend (webcam)
    │  POST /avatar/generate  (multipart: file)
    ▼
FastAPI ── valida content-type + tamanho (≤8MB)
    │  base64(foto) enfileirado como argumento do job (arq → Redis)
    │  responde { job_id, status: "processing" }
    ▼
Worker arq (processo separado)
    │  decodifica a foto (em memória) → chama Gemini → extrai inline_data
    │  SET avatar_result:{job_id} = { status, image, mime }   TTL 24h
    ▼
Frontend faz polling:
    GET /avatar/status/{job_id}  → "processing" | "done"+image | "error"
    DELETE /avatar/result/{job_id}  (limpeza antecipada, opcional)
```

## Política de retenção de dados

| Dado | Onde | Retenção |
|---|---|---|
| **Foto original** | Só em memória durante o job. Trafega pelo Redis apenas como *payload* da fila arq e é consumida pelo worker. | **Nunca persistida** por nós — sem chave durável, sem log, sem disco. `keep_result = 0` garante que o arq não retém os argumentos após a execução. |
| **Avatar gerado** | Chave `avatar_result:{job_id}` no Redis | **24h** (TTL) — ou até o frontend chamar `DELETE /avatar/result/{job_id}`. |

> **Por que a foto passa pelo Redis?** É inerente a qualquer fila sobre Redis:
> o argumento do job precisa trafegar pelo broker. A garantia é de **não
> retenção** — nada é gravado por nós numa chave durável e `keep_result = 0`
> impede o arq de guardar os argumentos/resultado depois da execução. Veja o
> bloco de comentário no topo de `app/workers/avatar_worker.py`.

## Rodando localmente

Requer um Redis rodando (ex.: `docker run -p 6379:6379 redis` ou `brew install redis && redis-server`).

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env      # preencha GEMINI_API_KEY

# Terminal 1 — API
uvicorn app.main:app --reload --port 8000

# Terminal 2 — worker
arq app.workers.avatar_worker.WorkerSettings
```

## Testes

Não exigem Redis nem Gemini reais (usam `fakeredis` + mock):

```bash
pip install -r requirements-dev.txt
pytest -q
```

Cobrem: validação de content-type/tamanho no endpoint, fluxo do worker
(sucesso e falha) com mock do Gemini, e os invariantes de privacidade
(`keep_result == 0`; a foto original nunca aparece em nenhuma chave do Redis).

## Variáveis de ambiente

| Var | Obrigatória | Padrão | Descrição |
|---|---|---|---|
| `GEMINI_API_KEY` | sim (prod) | — | Chave do Google Gemini. Nunca hardcoded. |
| `REDIS_URL` | não | `redis://localhost:6379` | Fila arq + cache de resultado. |
| `GEMINI_IMAGE_MODEL` | não | `gemini-3.1-flash-image` | Modelo de imagem (Nano Banana 2, jul/2026). `gemini-2.5-flash-image` é legado. |
| `SUPABASE_URL` | sim (prod) | — | URL do projeto Supabase (armazenamento do avatar). |
| `SUPABASE_SERVICE_ROLE_KEY` | sim (prod) | — | Chave **secreta** (`sb_secret_…`). Só backend — nunca no frontend. |

O nome do modelo muda com frequência — confira o disponível para a sua key em
<https://ai.google.dev/gemini-api/docs/image-generation>.

## Produção (Render)

O worker arq é um **processo de longa duração** (fica escutando a fila 24/7), então
**não roda em serverless** (Vercel/Lambda). O backend Python precisa de um host com
processos persistentes + um Redis gerenciado. O frontend Next.js continua na Vercel.

```
Vercel (Next) ──HTTPS──► Render: avatar-api (web) + avatar-worker (worker)
                                        │
                                        ▼
                                 Render: avatar-redis (Key Value)
                                        │
                                        ▼
                                 Google Gemini
```

O blueprint [`../../render.yaml`](../../render.yaml) (na raiz do repo git) já define os
3 recursos. Passo a passo:

1. **Deploy na Render.** New → Blueprint → conecte o repositório. A Render lê o
   `render.yaml` e cria `avatar-api`, `avatar-worker` e `avatar-redis`.
2. **Defina o segredo.** No grupo de env vars `avatar-config`, preencha
   `GEMINI_API_KEY` (marcado como `sync:false`, não versionado). O `REDIS_URL` é
   injetado automaticamente a partir do serviço Key Value.
3. **Pegue a URL da API** — algo como `https://avatar-api.onrender.com`. Teste:
   `curl https://avatar-api.onrender.com/health`.
4. **Configure a Vercel.** No projeto do frontend, adicione a env var
   `NEXT_PUBLIC_AVATAR_API_URL = https://avatar-api.onrender.com` e faça um redeploy.
5. **CORS.** O `cors_origins` em `app/config.py` já inclui `https://site-ic-orcin.vercel.app`.
   Se o domínio de produção for outro, adicione-o lá.

### Observações de produção

- **Planos.** O worker exige plano pago (`starter`, ~US$7/mês) — background workers
  não existem no tier free. A API pode ficar no free (hiberna após inatividade → cold
  start de ~30s no primeiro request). O Redis Key Value free tem 25MB.
- **HTTPS obrigatório.** O frontend em HTTPS precisa chamar a API em HTTPS (senão o
  navegador bloqueia por mixed-content). A Render já entrega HTTPS.
- **Memória do Redis.** Cada avatar em base64 ocupa ~1MB. A limpeza antecipada
  (`DELETE /avatar/result/{id}`, que o frontend dispara ao exibir) evita acúmulo; com
  o TTL de 24h como rede de segurança. Sob tráfego alto, considere um plano maior de
  Key Value ou mover a imagem para object storage guardando só a URL no Redis.
- **Python.** Fixado em `3.12.7` via `.python-version`.

## Supabase — o que o projeto espera

O Supabase é usado em **dois lugares distintos**, com **chaves diferentes**:

| Lado | Onde | Chave | Papel |
|---|---|---|---|
| **Backend** (worker, Python) | Render | **service_role** (`sb_secret_…`, secreta) | Sobe o avatar gerado ao **Storage** |
| **Frontend** (`/personagem`, Next) | Vercel | **anon/publishable** (`sb_publishable_…`, pública) | Grava o jogador na **tabela `jogadores`** |

> ⚠️ Nunca troque as chaves de lado. A `service_role` bypassa o RLS e **jamais** pode ir
> pro frontend (ficaria exposta no bundle). A `anon` é segura no browser (protegida por RLS).

### 1. Storage — bucket `avatars` (usado pelo backend)

O worker (`_upload_avatar` em `app/workers/avatar_worker.py`) sobe o avatar **gerado**
(nunca a foto original) e devolve a `public_url` no `GET /avatar/status/{id}`.

- Bucket **`avatars`**, marcado como **público** (o código usa `get_public_url`).
- Criar em: Supabase → Storage → New bucket → nome `avatars` → *Public bucket*.

### 2. Tabela `jogadores` (usada pelo frontend)

`PersonagemCard` (`src/app/personagem/PersonagemCard.tsx`) insere uma linha por jogador
via `src/lib/supabase.ts` (client anon). Estrutura esperada:

```sql
create table public.jogadores (
  id           bigint generated by default as identity primary key,
  classe       text,
  forca        integer,
  inteligencia integer,
  agilidade    integer,
  resistencia  integer,
  carisma      integer,
  sabedoria    integer,
  caos         integer,
  foto_url     text,
  criado_em    timestamp default now()
);
```

**RLS (obrigatório)** — sem estas policies o insert do frontend é bloqueado
(`new row violates row-level security policy`):

```sql
alter table public.jogadores enable row level security;

-- o frontend (chave anon) precisa INSERIR
create policy "jogadores_insert_anon"
  on public.jogadores for insert
  to anon, authenticated
  with check (true);

-- e LER de volta o id inserido (o código faz .insert().select())
create policy "jogadores_select_anon"
  on public.jogadores for select
  to anon, authenticated
  using (true);
```

> Isso deixa a tabela aberta pra escrita/leitura pela chave pública — ok para o projeto,
> mas passível de spam. Para endurecer: rate limit, captcha, ou mover a escrita para o
> backend com a service_role.

### 3. Variáveis de ambiente do Supabase

| Var | Onde configurar | Valor |
|---|---|---|
| `SUPABASE_URL` | **Render** (backend) | URL do projeto |
| `SUPABASE_SERVICE_ROLE_KEY` | **Render** (backend, secreta) | `sb_secret_…` |
| `NEXT_PUBLIC_SUPABASE_URL` | **Vercel** (frontend) | mesma URL do projeto |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Vercel** (frontend) | `sb_publishable_…` |

O `src/lib/supabase.ts` inicializa o client de forma **preguiçosa** (só no browser) — se as
`NEXT_PUBLIC_SUPABASE_*` faltarem, o build **não quebra**; o card carrega e apenas não grava.

---

# API do jogo — cadastro, batalha, ranking e analytics

Além da geração de avatar (documentada acima), o backend expõe as rotas do
jogo em si. Documentação interativa: **http://localhost:8000/docs**.

## Arquitetura em três camadas

```
routers/   → HTTP: recebe request, valida, devolve response. Sem regra de negócio.
domain/    → Regra pura: cálculo de atributos, classe, vencedor, XP. Sem banco, sem rede.
repo.py    → Banco: todo acesso ao Supabase. Único lugar com query.
```

Por que separar: a regra do jogo pode ser testada sem subir Supabase (a suíte
inteira roda em menos de 1 segundo), e trocar de banco um dia mexeria só no
`repo.py`.

## Rotas

### Cadastro

| Método | Rota | O que faz |
|---|---|---|
| `POST` | `/jogadores` | Cadastra o jogador, devolve o `id` |
| `GET` | `/jogadores/{id}` | Consulta um jogador |
| `GET` | `/jogadores?limite=20&offset=0` | Lista os mais recentes |

O `POST` aceita dois formatos. O recomendado manda as dimensões do quiz e
deixa a API calcular atributos e classe (uma fonte da verdade só):

```json
{ "nome": "Julia", "dimensoes": { "estrategia": 16, "percepcao": 4 }, "tags": ["NERD"] }
```

O de compatibilidade manda `atributos` + `classe` já calculados pelo frontend.

O XP sempre começa em 0 — valor enviado pelo cliente é ignorado de propósito.

### Geração de personagem

| Método | Rota | O que faz |
|---|---|---|
| `POST` | `/personagem/gerar` | Dimensões → atributos + classe (não grava nada) |
| `GET` | `/personagem/classes` | Catálogo das 16 classes |

Determinístico: as mesmas dimensões devolvem sempre o mesmo personagem.

### Batalha

| Método | Rota | O que faz |
|---|---|---|
| `GET` | `/batalha/atributos` | Os 4 atributos disputáveis + tabela de XP |
| `POST` | `/batalha/parear` | Matchmaking: acha adversário de XP próximo |
| `POST` | `/batalha` | Resolve o confronto, atualiza placar, registra |
| `GET` | `/batalha/{id}` | Detalhe de uma batalha |
| `GET` | `/batalha/historico/{jogador_id}` | Últimas batalhas do jogador |

Fluxo de uma partida:

```
1. POST /batalha/parear  { "jogador_id": 1 }        → devolve o oponente
2. (jogador escolhe o atributo na tela)
3. POST /batalha  { "jogador_a_id": 1,
                    "jogador_b_id": 2,
                    "atributo": "estrategia" }      → devolve o resultado
```

Maior valor vence; valores iguais empatam. XP: vitória 30, empate 15,
derrota 5 (perder também dá XP para não desestimular quem perdeu).

### Ranking

| Método | Rota | O que faz |
|---|---|---|
| `GET` | `/ranking?limite=10` | Top N por XP, desempate por vitórias |
| `GET` | `/ranking/{jogador_id}` | Posição de um jogador |

Cada item já vem com `posicao`, `total_batalhas` e `taxa_vitoria` calculados —
o frontend não precisa fazer conta.

### Dashboard analytics

| Método | Rota | O que faz |
|---|---|---|
| `GET` | `/analytics/resumo` | Totais e classe mais comum |
| `GET` | `/analytics/classes` | Distribuição das classes geradas |
| `GET` | `/analytics/atributos` | Média de cada atributo e dimensão |
| `GET` | `/analytics/batalhas` | Atributos mais escolhidos, taxa de empate |
| `GET` | `/analytics/taxa-vitoria` | Taxa de vitória por classe |
| `GET` | `/analytics/insight` | A frase do PDF, calculada dos dados |

As agregações são feitas em Python (o PostgREST do Supabase não faz
`AVG`/`GROUP BY` direto). Para a escala do projeto é rápido; se um dia crescer,
a evolução natural é criar views ou funções no Postgres — só o `repo.py`
mudaria.

## Banco

Rode `sql/schema.sql` no Supabase → SQL Editor. É idempotente: pode rodar de
novo sem quebrar nada. Ele cria a tabela `batalhas`, adiciona as colunas novas
em `jogadores` (nome, xp, vitórias, derrotas, empates e as 10 dimensões),
configura o RLS e cria a função de soma atômica de XP.

O RLS foi montado assim: leitura pública (ranking e dashboard são públicos),
mas **escrita no placar só pelo backend**. Isso impede alguém de abrir o
console do navegador e se dar 10.000 de XP.

## Testes

```bash
pip install -r requirements-dev.txt
pytest -q
```

72 testes, sem Supabase e sem Redis reais. O banco é substituído por um
repositório em memória (`tests/repo_memoria.py`) via dependency override do
FastAPI.
