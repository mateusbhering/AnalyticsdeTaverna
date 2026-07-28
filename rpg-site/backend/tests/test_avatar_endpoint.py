"""Testes dos endpoints /avatar/*."""

from __future__ import annotations

import base64
import json

from app.config import result_key, settings

PNG_BYTES = b"\x89PNG\r\n\x1a\n" + b"\x00" * 32


async def _post(client, content, content_type="image/png", filename="face.png"):
    return await client.post(
        "/avatar/generate",
        files={"file": (filename, content, content_type)},
    )


# ── Validação de content-type ──────────────────────────────────────────
async def test_rejects_unsupported_content_type(client):
    resp = await _post(client, b"hello", content_type="text/plain", filename="x.txt")
    assert resp.status_code == 415


async def test_accepts_jpeg_png_webp(client):
    for ct, name in [("image/jpeg", "a.jpg"), ("image/png", "a.png"), ("image/webp", "a.webp")]:
        resp = await _post(client, PNG_BYTES, content_type=ct, filename=name)
        assert resp.status_code == 200, ct


# ── Validação de tamanho ───────────────────────────────────────────────
async def test_rejects_oversize(client):
    too_big = b"\x00" * (settings.max_upload_bytes + 1)
    resp = await _post(client, too_big)
    assert resp.status_code == 413


async def test_accepts_at_size_limit(client):
    at_limit = b"\x00" * settings.max_upload_bytes
    resp = await _post(client, at_limit)
    assert resp.status_code == 200


async def test_rejects_empty_file(client):
    resp = await _post(client, b"")
    assert resp.status_code == 400


# ── Fluxo de enfileiramento ────────────────────────────────────────────
async def test_generate_enqueues_job(client, fake_redis):
    resp = await _post(client, PNG_BYTES)
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "processing"
    assert body["job_id"]

    # Um job foi enfileirado, com a função correta e a foto em base64 como arg.
    assert len(fake_redis.enqueued) == 1
    function, args, job_id = fake_redis.enqueued[0]
    assert function == "generate_avatar_task"
    assert job_id == body["job_id"]
    assert args[0] == body["job_id"]
    assert base64.b64decode(args[1]) == PNG_BYTES


# ── Status (polling) ───────────────────────────────────────────────────
async def test_status_processing_when_no_result(client):
    resp = await client.get("/avatar/status/unknown-id")
    assert resp.status_code == 200
    assert resp.json() == {"job_id": "unknown-id", "status": "processing"}


async def test_status_done_returns_image(client, fake_redis):
    payload = {"status": "done", "image": "QVZBVEFS", "mime": "image/png"}
    await fake_redis.set(result_key("job-1"), json.dumps(payload))

    resp = await client.get("/avatar/status/job-1")
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "done"
    assert body["image"] == "QVZBVEFS"
    assert body["mime"] == "image/png"


async def test_status_error_marker(client, fake_redis):
    await fake_redis.set(result_key("job-err"), json.dumps({"status": "error", "error": "generation_failed"}))
    resp = await client.get("/avatar/status/job-err")
    assert resp.json()["status"] == "error"


# ── Limpeza antecipada ─────────────────────────────────────────────────
async def test_delete_result(client, fake_redis):
    await fake_redis.set(result_key("job-2"), json.dumps({"status": "done", "image": "x"}))
    resp = await client.delete("/avatar/result/job-2")
    assert resp.status_code == 200
    assert resp.json()["deleted"] is True
    assert await fake_redis.get(result_key("job-2")) is None


async def test_delete_missing_result(client):
    resp = await client.delete("/avatar/result/nope")
    assert resp.json()["deleted"] is False
