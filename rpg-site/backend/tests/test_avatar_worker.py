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
async def test_worker_success(redis, monkeypatch):
    async def fake_run_gemini(image_bytes, prompt):
        # Recebe exatamente os bytes decodificados da foto original.
        assert image_bytes == ORIGINAL_PHOTO
        return base64.b64encode(GENERATED_PNG).decode(), "image/png"

    monkeypatch.setattr(avatar_worker, "_run_gemini", fake_run_gemini)

    await avatar_worker.generate_avatar_task(_ctx(redis), "job-ok", ORIGINAL_B64)

    stored = json.loads(await redis.get(result_key("job-ok")))
    assert stored["status"] == "done"
    assert base64.b64decode(stored["image"]) == GENERATED_PNG
    assert stored["mime"] == "image/png"
    # TTL de 24h aplicado.
    assert 0 < await redis.ttl(result_key("job-ok")) <= 86400


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
