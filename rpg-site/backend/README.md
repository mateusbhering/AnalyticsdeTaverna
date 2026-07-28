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
