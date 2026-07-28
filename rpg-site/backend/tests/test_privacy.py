"""Testes de privacidade — a foto ORIGINAL nunca pode ser persistida.

Estes testes são a guarda contra regressões do requisito crítico:
  1. keep_result = 0 no worker.
  2. Após o worker rodar, nenhuma chave do Redis contém a foto original.
  3. A única chave persistida é `avatar_result:{job_id}`, e ela contém o
     avatar GERADO — nunca a foto de entrada.
"""

from __future__ import annotations

import base64

import pytest_asyncio
from fakeredis import aioredis as fake_aioredis

from app.config import result_key
from app.workers import avatar_worker
from app.workers.avatar_worker import WorkerSettings

ORIGINAL_PHOTO = b"SECRET-original-face-pixels"
ORIGINAL_B64 = base64.b64encode(ORIGINAL_PHOTO).decode()
GENERATED_PNG = b"public-generated-avatar"


@pytest_asyncio.fixture
async def redis():
    r = fake_aioredis.FakeRedis(decode_responses=False)
    await r.flushall()
    yield r
    await r.aclose()


def test_keep_result_is_zero():
    # arq NÃO deve reter argumentos/resultado do job (que incluem a foto original).
    assert WorkerSettings.keep_result == 0


async def test_original_photo_never_persisted_in_redis(redis, monkeypatch):
    async def fake_run_gemini(image_bytes, prompt):
        return base64.b64encode(GENERATED_PNG).decode(), "image/png"

    monkeypatch.setattr(avatar_worker, "_run_gemini", fake_run_gemini)

    await avatar_worker.generate_avatar_task({"redis": redis}, "job-x", ORIGINAL_B64)

    # Só existe a chave do resultado.
    keys = await redis.keys("*")
    assert keys == [result_key("job-x").encode()]

    # Nenhum valor no Redis contém a foto original (nem em base64, nem em bytes).
    for key in keys:
        value = await redis.get(key)
        assert ORIGINAL_PHOTO not in value
        assert ORIGINAL_B64.encode() not in value

    # E o resultado contém o avatar gerado, não a entrada.
    import json

    stored = json.loads(await redis.get(result_key("job-x")))
    assert base64.b64decode(stored["image"]) == GENERATED_PNG


async def test_worker_never_calls_set_with_original_photo(redis, monkeypatch):
    """Intercepta todos os set() e garante que nenhum grava a foto original."""

    async def fake_run_gemini(image_bytes, prompt):
        return base64.b64encode(GENERATED_PNG).decode(), "image/png"

    monkeypatch.setattr(avatar_worker, "_run_gemini", fake_run_gemini)

    original_set = redis.set
    set_calls = []

    async def spy_set(name, value, *args, **kwargs):
        set_calls.append(value)
        return await original_set(name, value, *args, **kwargs)

    monkeypatch.setattr(redis, "set", spy_set)

    await avatar_worker.generate_avatar_task({"redis": redis}, "job-y", ORIGINAL_B64)

    assert set_calls, "esperado ao menos um set() com o resultado"
    for value in set_calls:
        blob = value if isinstance(value, bytes) else value.encode()
        assert ORIGINAL_PHOTO not in blob
        assert ORIGINAL_B64.encode() not in blob
