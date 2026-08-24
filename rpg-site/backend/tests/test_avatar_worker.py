"""Testes do worker arq (com mock da chamada ao Gemini)."""

from __future__ import annotations

import base64
import json
from types import SimpleNamespace

import pytest
import pytest_asyncio
from fakeredis import aioredis as fake_aioredis

from app.config import result_key
from app.workers import avatar_worker

ORIGINAL_PHOTO = b"original-face-bytes-should-never-persist"
ORIGINAL_B64 = base64.b64encode(ORIGINAL_PHOTO).decode()
GENERATED_PNG = b"generated-avatar-png-bytes"


@pytest_asyncio.fixture
async def redis():
    r = fake_aioredis.FakeRedis(decode_responses=False)
    await r.flushall()
    yield r
    await r.aclose()


def _ctx(redis):
    return {"redis": redis}


@pytest.fixture(autouse=True)
def _mock_upload(monkeypatch):
    """Evita conectar no Supabase real; registra o que seria enviado."""
    calls = []

    async def fake_upload(job_id, avatar_bytes, mime):
        calls.append({"job_id": job_id, "bytes": avatar_bytes, "mime": mime})
        return f"https://fake.supabase/avatars/{job_id}"

    monkeypatch.setattr(avatar_worker, "_upload_avatar", fake_upload)
    return calls


# ── _extract_image ─────────────────────────────────────────────────────
def test_extract_image_from_inline_data():
    response = SimpleNamespace(
        candidates=[
            SimpleNamespace(
                content=SimpleNamespace(
                    parts=[
                        SimpleNamespace(inline_data=None, text="algum texto"),
                        SimpleNamespace(
                            inline_data=SimpleNamespace(
                                data=GENERATED_PNG, mime_type="image/png"
                            )
                        ),
                    ]
                )
            )
        ]
    )
    image_b64, mime = avatar_worker._extract_image(response)
    assert base64.b64decode(image_b64) == GENERATED_PNG
    assert mime == "image/png"


def test_extract_image_raises_without_image():
    response = SimpleNamespace(
        candidates=[SimpleNamespace(content=SimpleNamespace(parts=[SimpleNamespace(inline_data=None)]))]
    )
    with pytest.raises(ValueError):
        avatar_worker._extract_image(response)


# ── Sucesso ────────────────────────────────────────────────────────────
async def test_worker_success(redis, monkeypatch, _mock_upload):
    async def fake_run_gemini(image_bytes, prompt):
        # Recebe exatamente os bytes decodificados da foto original.
        assert image_bytes == ORIGINAL_PHOTO
        return base64.b64encode(GENERATED_PNG).decode(), "image/png"

    monkeypatch.setattr(avatar_worker, "_run_gemini", fake_run_gemini)

    await avatar_worker.generate_avatar_task(_ctx(redis), "job-ok", ORIGINAL_B64)

    stored = json.loads(await redis.get(result_key("job-ok")))
    assert stored["status"] == "done"
    assert stored["mime"] == "image/png"
    assert stored["public_url"] == "https://fake.supabase/avatars/job-ok"
    # A imagem NÃO vai para o Redis — ela já está no Storage.
    assert "image" not in stored
    # TTL de 24h aplicado.
    assert 0 < await redis.ttl(result_key("job-ok")) <= 86400


async def test_worker_nao_refaz_o_gemini_quando_o_redis_recusa(redis, monkeypatch, _mock_upload):
    """Redis cheio (`noeviction`) não pode virar falha de geração.

    Foi o que derrubou o avatar em produção: o `SET` estourava com
    OutOfMemoryError, a exceção subia, o arq reagendava o job e o Gemini era
    pago de novo — sem nunca conseguir gravar nem o marcador de erro. A imagem
    já está no Storage a essa altura; o job precisa terminar em paz.
    """
    chamadas = []

    async def fake_run_gemini(image_bytes, prompt):
        chamadas.append(1)
        return base64.b64encode(GENERATED_PNG).decode(), "image/png"

    async def set_que_recusa(*args, **kwargs):
        raise Exception("OOM command not allowed when used memory > 'maxmemory'.")

    monkeypatch.setattr(avatar_worker, "_run_gemini", fake_run_gemini)
    monkeypatch.setattr(redis, "set", set_que_recusa)

    # Não levanta: o job termina, e é o `/avatar/image` que resolve pelo Storage.
    await avatar_worker.generate_avatar_task(_ctx(redis), "job-cheio", ORIGINAL_B64)
    assert len(chamadas) == 1


async def test_worker_uploads_generated_avatar_not_original(redis, monkeypatch, _mock_upload):
    """O que sobe pro Supabase é o avatar GERADO — nunca a foto original."""

    async def fake_run_gemini(image_bytes, prompt):
        return base64.b64encode(GENERATED_PNG).decode(), "image/png"

    monkeypatch.setattr(avatar_worker, "_run_gemini", fake_run_gemini)
    await avatar_worker.generate_avatar_task(_ctx(redis), "job-up", ORIGINAL_B64)

    assert len(_mock_upload) == 1
    uploaded = _mock_upload[0]["bytes"]
    assert uploaded == GENERATED_PNG
    assert ORIGINAL_PHOTO not in uploaded


# ── Prompt por classe ──────────────────────────────────────────────────
def test_build_prompt_uses_class_style():
    p = avatar_worker.build_prompt("Mago do ChatGPT")
    assert "arcane wizard" in p
    assert "preserve the person's recognizable facial features" in p


def test_build_prompt_falls_back_when_unknown():
    p = avatar_worker.build_prompt("Classe Inexistente")
    assert "fantasy RPG adventurer" in p


async def test_worker_passes_class_style_to_gemini(redis, monkeypatch):
    seen = {}

    async def fake_run_gemini(image_bytes, prompt):
        seen["prompt"] = prompt
        return base64.b64encode(GENERATED_PNG).decode(), "image/png"

    monkeypatch.setattr(avatar_worker, "_run_gemini", fake_run_gemini)
    await avatar_worker.generate_avatar_task(_ctx(redis), "job-c", ORIGINAL_B64, "Paladino do Grupo")
    assert "paladin" in seen["prompt"]


# ── Rate limiter (pacing) ──────────────────────────────────────────────
async def test_rate_limiter_paces_calls():
    import time

    # 1200/min → 1 a cada 0.05s. A 1ª passa na hora; as seguintes esperam.
    limiter = avatar_worker._RateLimiter(1200)
    t0 = time.monotonic()
    for _ in range(4):
        await limiter.wait()
    elapsed = time.monotonic() - t0
    assert elapsed >= 3 * 0.05 * 0.9  # ~0.15s (com folga p/ jitter)


# ── Retry em erro transitório (rate limit 429) ─────────────────────────
async def test_run_gemini_retries_on_rate_limit(monkeypatch):
    import google.genai as genai_mod
    from google.genai import types as gtypes

    calls = {"n": 0}

    class FakeModels:
        async def generate_content(self, model, contents):
            calls["n"] += 1
            if calls["n"] < 3:
                raise RuntimeError("429 RESOURCE_EXHAUSTED: quota")
            return SimpleNamespace(
                candidates=[SimpleNamespace(content=SimpleNamespace(
                    parts=[SimpleNamespace(inline_data=SimpleNamespace(data=b"ok", mime_type="image/png"))]
                ))]
            )

    class FakeClient:
        aio = SimpleNamespace(models=FakeModels())
        def __init__(self, api_key=None):
            pass

    monkeypatch.setattr(genai_mod, "Client", FakeClient)
    monkeypatch.setattr(gtypes.Part, "from_bytes", staticmethod(lambda data, mime_type: None))

    async def _no_sleep(_):
        return
    monkeypatch.setattr(avatar_worker.asyncio, "sleep", _no_sleep)

    async def _no_wait():
        return
    monkeypatch.setattr(avatar_worker._gemini_limiter, "wait", _no_wait)

    b64, mime = await avatar_worker._run_gemini(b"x", "prompt")
    assert calls["n"] == 3  # 2 falhas transitórias + 1 sucesso
    assert mime == "image/png"


async def test_run_gemini_does_not_retry_permanent_error(monkeypatch):
    import google.genai as genai_mod
    from google.genai import types as gtypes
    calls = {"n": 0}

    class FakeModels:
        async def generate_content(self, model, contents):
            calls["n"] += 1
            raise ValueError("400 INVALID_ARGUMENT")

    class FakeClient:
        aio = SimpleNamespace(models=FakeModels())
        def __init__(self, api_key=None):
            pass

    monkeypatch.setattr(genai_mod, "Client", FakeClient)
    monkeypatch.setattr(gtypes.Part, "from_bytes", staticmethod(lambda data, mime_type: None))

    async def _no_wait():
        return
    monkeypatch.setattr(avatar_worker._gemini_limiter, "wait", _no_wait)

    import pytest as _pytest
    with _pytest.raises(ValueError):
        await avatar_worker._run_gemini(b"x", "prompt")
    assert calls["n"] == 1  # erro permanente → sem retry


# ── Falha ──────────────────────────────────────────────────────────────
async def test_worker_failure_stores_error_marker(redis, monkeypatch):
    async def boom(image_bytes, prompt):
        raise RuntimeError("gemini indisponível")

    monkeypatch.setattr(avatar_worker, "_run_gemini", boom)

    await avatar_worker.generate_avatar_task(_ctx(redis), "job-fail", ORIGINAL_B64)

    stored = json.loads(await redis.get(result_key("job-fail")))
    assert stored["status"] == "error"
    # Marcador de erro também com TTL.
    assert 0 < await redis.ttl(result_key("job-fail")) <= 86400
