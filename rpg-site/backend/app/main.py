"""Aplicação FastAPI — Analytics de Taverna (backend de avatar)."""

from __future__ import annotations

from contextlib import asynccontextmanager

from arq import create_pool
from arq.connections import RedisSettings
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routers import avatar

"""Importando variáveis de ambiente do arquivo .env local."""
import os
from dotenv import load_dotenv

load_dotenv()  # Carrega as variáveis do arquivo .env local

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Pool arq compartilhado para enfileirar jobs e ler/escrever resultados.
    app.state.arq_redis = await create_pool(RedisSettings.from_dsn(settings.redis_url))
    try:
        yield
    finally:
        await app.state.arq_redis.aclose()


app = FastAPI(title="Analytics de Taverna — Avatar API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.cors_origins),
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["*"],
)

app.include_router(avatar.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
