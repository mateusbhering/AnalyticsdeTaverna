"""Aplicação FastAPI — Analytics de Taverna.

Ponto de entrada da API. Só faz três coisas: liga o Redis, libera o CORS e
registra os routers. Toda a lógica mora em `app/domain/` e `app/routers/`.

Rodar local:  uvicorn app.main:app --reload --port 8000
Documentação: http://localhost:8000/docs
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from arq import create_pool
from arq.connections import RedisSettings
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routers import analytics, avatar, batalha, jogadores, personagem, ranking

log = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Sobe e desce recursos compartilhados junto com a aplicação."""
    try:
        redis_settings = RedisSettings.from_dsn(settings.redis_url)
        redis_settings.conn_retries = 2
        redis_settings.conn_retry_delay = 1
        app.state.arq_redis = await create_pool(redis_settings)
    except Exception as erro:  # noqa: BLE001
        app.state.arq_redis = None
        log.warning("Redis indisponível (%s). Rotas de avatar desativadas.", erro)

    try:
        yield
    finally:
        if getattr(app.state, "arq_redis", None) is not None:
            await app.state.arq_redis.aclose()


app = FastAPI(
    title="Analytics de Taverna — API",
    description=(
        "Backend do projeto de IC: cadastro de jogadores, geração de personagem, "
        "sistema de batalha, ranking global e dashboard analytics."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.cors_origins),
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["*"],
)

# Cada router cuida de um assunto.
app.include_router(avatar.router)
app.include_router(jogadores.router)
app.include_router(personagem.router)
app.include_router(batalha.router)
app.include_router(ranking.router)
app.include_router(analytics.router)


@app.get("/health", tags=["infra"])
async def health():
    """Health check — a Render usa isto para saber se o serviço está de pé."""
    return {
        "status": "ok",
        "redis": getattr(app.state, "arq_redis", None) is not None,
        "banco_configurado": bool(settings.supabase_url and settings.supabase_service_role_key),
    }