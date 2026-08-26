"""Testes do worker arq (com mock da chamada ao Gemini)."""

from __future__ import annotations

import asyncio
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


# ── Classificação de erro (o que vale retry, e o que o front recebe) ───
def test_429_de_saldo_nao_e_transitorio():
    """Créditos esgotados não melhoram com backoff.

    Foi assim que a geração caiu em produção: o 429 de saldo entrava na mesma
    lista de "transitórios" do 429 de ritmo, e cada avatar gastava 22s e 4
    chamadas para chegar ao erro que a primeira tentativa já tinha dado.
    """
    erro = RuntimeError(
        "429 RESOURCE_EXHAUSTED. {'error': {'code': 429, 'message': 'Your "
        "prepayment credits are depleted. Please go to AI Studio at "
        "https://ai.studio/projects to manage your project and billing.'}}"
    )
    motivo, vale_retry = avatar_worker._classificar_erro(erro)
    assert motivo == avatar_worker.MOTIVO_SALDO
    assert vale_retry is False


def test_429_de_ritmo_continua_transitorio():
    """O 429 de rate limit tem de continuar esperando — a distinção é a mensagem.

    A mensagem de rate limit do Gemini também cita "billing", por isso a
    palavra não serve de marcador para o caso de saldo.
    """
    erro = RuntimeError(
        "429 RESOURCE_EXHAUSTED: You exceeded your current quota, please check "
        "your plan and billing details."
    )
    motivo, vale_retry = avatar_worker._classificar_erro(erro)
    assert motivo == avatar_worker.MOTIVO_COTA
    assert vale_retry is True


def test_instabilidade_do_gemini_e_transitoria():
    motivo, vale_retry = avatar_worker._classificar_erro(RuntimeError("503 UNAVAILABLE"))
    assert motivo == avatar_worker.MOTIVO_INDISPONIVEL
    assert vale_retry is True


def test_erro_definitivo_nao_vira_transitorio_por_substring():
    """Um "500" no meio do texto não pode fazer um erro definitivo virar retry.

    A lista antiga casava "500" e "503" soltos contra o texto inteiro do erro.
    """
    motivo, vale_retry = avatar_worker._classificar_erro(
        ValueError("400 INVALID_ARGUMENT: image must be at most 500x500")
    )
    assert motivo == avatar_worker.MOTIVO_DESCONHECIDO
    assert vale_retry is False


def test_resposta_sem_imagem_tem_motivo_proprio():
    motivo, vale_retry = avatar_worker._classificar_erro(avatar_worker.SemImagem("vazio"))
    assert motivo == avatar_worker.MOTIVO_SEM_IMAGEM
    assert vale_retry is False


async def test_run_gemini_desiste_na_primeira_quando_falta_saldo(monkeypatch):
    """Sem retry: 1 chamada, não 4."""
    import google.genai as genai_mod
    from google.genai import types as gtypes

    calls = {"n": 0}

    class FakeModels:
        async def generate_content(self, model, contents):
            calls["n"] += 1
            raise RuntimeError("429 RESOURCE_EXHAUSTED: prepayment credits are depleted")

    class FakeClient:
        aio = SimpleNamespace(models=FakeModels())
        def __init__(self, api_key=None):
            pass

    monkeypatch.setattr(genai_mod, "Client", FakeClient)
    monkeypatch.setattr(gtypes.Part, "from_bytes", staticmethod(lambda data, mime_type: None))

    async def _no_wait():
        return
    monkeypatch.setattr(avatar_worker._gemini_limiter, "wait", _no_wait)

    with pytest.raises(RuntimeError):
        await avatar_worker._run_gemini(b"x", "prompt")
    assert calls["n"] == 1


async def test_marcador_de_erro_carrega_o_motivo(redis, monkeypatch):
    """O front (e você, no `/avatar/status`) precisa saber POR QUE falhou.

    Antes todo erro virava "generation_failed" e o motivo só existia no log do
    worker — diagnosticar exigia abrir o painel da Render.
    """

    async def sem_saldo(image_bytes, prompt):
        raise RuntimeError("429 RESOURCE_EXHAUSTED: prepayment credits are depleted")

    monkeypatch.setattr(avatar_worker, "_run_gemini", sem_saldo)
    await avatar_worker.generate_avatar_task(_ctx(redis), "job-saldo", ORIGINAL_B64)

    stored = json.loads(await redis.get(result_key("job-saldo")))
    assert stored["status"] == "error"
    assert stored["error"] == avatar_worker.MOTIVO_SALDO


async def test_falha_no_upload_nao_se_confunde_com_falha_de_geracao(redis, monkeypatch):
    """O avatar existe; quem recusou foi o Storage. O motivo tem de dizer isso."""

    async def fake_run_gemini(image_bytes, prompt):
        return base64.b64encode(GENERATED_PNG).decode(), "image/png"

    async def upload_que_recusa(job_id, avatar_bytes, mime):
        raise Exception("bucket avatars not found")

    monkeypatch.setattr(avatar_worker, "_run_gemini", fake_run_gemini)
    monkeypatch.setattr(avatar_worker, "_upload_avatar", upload_que_recusa)

    await avatar_worker.generate_avatar_task(_ctx(redis), "job-storage", ORIGINAL_B64)

    stored = json.loads(await redis.get(result_key("job-storage")))
    assert stored["error"] == avatar_worker.MOTIVO_UPLOAD


async def test_motivo_nunca_vaza_a_mensagem_do_gemini(redis, monkeypatch):
    """O marcador é um código nosso — a mensagem crua cita conta, cota e billing."""

    async def sem_saldo(image_bytes, prompt):
        raise RuntimeError(
            "429: Your prepayment credits are depleted. Go to "
            "https://ai.studio/projects to manage your project and billing."
        )

    monkeypatch.setattr(avatar_worker, "_run_gemini", sem_saldo)
    await avatar_worker.generate_avatar_task(_ctx(redis), "job-vaza", ORIGINAL_B64)

    bruto = (await redis.get(result_key("job-vaza"))).decode()
    assert "ai.studio" not in bruto
    assert "prepayment" not in bruto
    assert "credits" not in bruto


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


async def test_job_cancelado_ainda_grava_o_marcador(redis, monkeypatch, _mock_upload):
    """O arq mata o job por `job_timeout` levantando CancelledError.

    Ela herda de BaseException, então passava direto por um `except Exception`:
    nenhum marcador era gravado, o status ficava "processing" para sempre e a
    pessoa esperava os 3 minutos do front por um job que já estava morto. Foi o
    que deixou 3 de 5 gerações penduradas num teste de rajada.
    """

    async def gemini_cancelado(image_bytes, prompt):
        raise asyncio.CancelledError()

    monkeypatch.setattr(avatar_worker, "_run_gemini", gemini_cancelado)

    # O cancelamento precisa CONTINUAR subindo: o arq tem de saber que acabou.
    with pytest.raises(asyncio.CancelledError):
        await avatar_worker.generate_avatar_task(_ctx(redis), "job-morto", ORIGINAL_B64)

    # ...mas não sem deixar rastro para quem está esperando na tela.
    stored = json.loads(await redis.get(result_key("job-morto")))
    assert stored["status"] == "error"


async def test_orcamento_de_retry_cabe_no_job_timeout():
    """O teto do arq tem de comportar o pior caso das nossas tentativas.

    Se não couber, o job é cortado no meio da última chamada — que foi
    exatamente como os jobs morriam em silêncio.
    """
    from app.workers.avatar_worker import _GEMINI_MAX_ATTEMPTS, WorkerSettings

    backoff = sum(3.0 * 2**i for i in range(_GEMINI_MAX_ATTEMPTS - 1))  # 3 + 6 + 12
    pior_chamada = 65.0  # maior latência medida do Gemini em produção
    pior_caso = _GEMINI_MAX_ATTEMPTS * pior_chamada + backoff

    assert WorkerSettings.job_timeout > pior_caso, (
        f"job_timeout {WorkerSettings.job_timeout}s não cobre o pior caso de {pior_caso:.0f}s"
    )


def test_arq_nao_multiplica_o_gasto_de_gemini():
    """`max_tries` do arq × tentativas internas = chamadas por avatar.

    O padrão do arq (5) daria 20 chamadas por um único avatar — com 1.000
    requisições por dia de cota, um punhado de jobs ruins consome o dia.
    """
    from app.workers.avatar_worker import _GEMINI_MAX_ATTEMPTS, WorkerSettings

    assert WorkerSettings.max_tries * _GEMINI_MAX_ATTEMPTS <= 8
