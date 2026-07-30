"""Fixtures de teste.

Usamos `fakeredis` (Redis em memória) para inspecionar exatamente o que é
gravado — essencial para os testes de privacidade. A parte de fila do arq
(`enqueue_job`) é substituída por um stub que apenas registra as chamadas,
já que não subimos um worker real nos testes.
"""

from __future__ import annotations

import pytest
import pytest_asyncio
from fakeredis import aioredis as fake_aioredis
from httpx import ASGITransport, AsyncClient

from app.main import app


class FakeArqRedis(fake_aioredis.FakeRedis):
    """FakeRedis + um enqueue_job que registra as chamadas (sem worker real)."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.enqueued: list[tuple] = []

    async def enqueue_job(self, function, *args, _job_id=None, **kwargs):
        # Registramos a chamada. NÃO gravamos o payload em nenhuma chave —
        # espelha o comportamento do endpoint (que só enfileira).
        self.enqueued.append((function, args, _job_id))
        return None


@pytest_asyncio.fixture
async def fake_redis():
    r = FakeArqRedis(decode_responses=False)
    await r.flushall()
    yield r
    await r.aclose()


@pytest_asyncio.fixture
async def client(fake_redis):
    # Injeta o redis falso direto no app.state (o lifespan real não roda aqui).
    app.state.arq_redis = fake_redis
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


# ─────────────────────────────────────────────────────────────────────────────
# Fixtures das rotas novas (cadastro, personagem, batalha, ranking, analytics)
#
# Aqui trocamos o banco real por um repositório em memória usando o mecanismo
# de dependency override do FastAPI. Nenhuma linha de código de produção muda.
# ─────────────────────────────────────────────────────────────────────────────

from app.repo import get_repo  # noqa: E402
from tests.repo_memoria import RepoMemoria  # noqa: E402


@pytest.fixture
def repo():
    return RepoMemoria()


@pytest_asyncio.fixture
async def api(repo):
    app.dependency_overrides[get_repo] = lambda: repo
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c
    app.dependency_overrides.clear()
