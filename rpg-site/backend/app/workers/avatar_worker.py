"""Worker arq — geração do avatar de RPG via Google Gemini.

╔══════════════════════════════════════════════════════════════════════════╗
║  PRIVACIDADE — LEIA ANTES DE ALTERAR ESTE ARQUIVO                         ║
║                                                                          ║
║  A foto ORIGINAL da pessoa (`image_b64`) NUNCA pode ser persistida.       ║
║                                                                          ║
║   • Ela chega como argumento do job (trafega pelo Redis como payload da   ║
║     fila — isso é inerente ao arq) e é consumida aqui, em memória.        ║
║   • `WorkerSettings.keep_result = 0` garante que o arq NÃO retém os        ║
║     argumentos/resultado do job após a execução.                          ║
║   • NÃO faça `redis.set(...)`, log, nem grave em disco a `image_b64` ou    ║
║     os `image_bytes`. A única coisa que persistimos é o avatar GERADO,     ║
║     na chave `avatar_result:{job_id}`, com TTL de 24h.                     ║
╚══════════════════════════════════════════════════════════════════════════╝
"""

from __future__ import annotations

import base64
import json
import logging

from arq.connections import RedisSettings

from ..config import result_key, settings

logger = logging.getLogger("avatar.worker")

# Prompt de estilização. Preserva traços reconhecíveis do rosto e aplica o
# tema de RPG fantasia medieval.
AVATAR_PROMPT = (
    "Transform the person in this photo into a stylized fantasy RPG character "
    "avatar. Use painterly digital art (NOT photorealistic). It is essential to "
    "preserve the person's recognizable facial features, expression, hair and "
    "skin tone so they are clearly identifiable. Add medieval fantasy RPG "
    "elements: light leather-and-metal armor on the shoulders, dramatic "
    "cinematic lighting, and a softly blurred tavern / dungeon background. "
    "Head-and-shoulders portrait composition, warm torch-lit color palette."
)


def _extract_image(response) -> tuple[str, str]:
    """Extrai a imagem gerada (inline_data) das parts da resposta do Gemini.

    Retorna (imagem_base64, mime_type). Levanta ValueError se não houver imagem.
    """
    candidates = getattr(response, "candidates", None) or []
    for candidate in candidates:
        content = getattr(candidate, "content", None)
        parts = getattr(content, "parts", None) or []
        for part in parts:
            inline = getattr(part, "inline_data", None)
            if inline is not None and getattr(inline, "data", None):
                data = inline.data
                # O SDK entrega bytes; normalizamos para base64 (str).
                if isinstance(data, bytes):
                    image_b64 = base64.b64encode(data).decode("ascii")
                else:  # já é str base64
                    image_b64 = data
                mime = getattr(inline, "mime_type", None) or "image/png"
                return image_b64, mime
    raise ValueError("Nenhuma imagem (inline_data) na resposta do Gemini")


async def _run_gemini(image_bytes: bytes) -> tuple[str, str]:
    """Chama o Gemini para gerar o avatar. Isolado para facilitar o mock em testes.

    Import do SDK é feito aqui (lazy) para não exigir a dependência em ambientes
    que só rodam os testes com mock.
    """
    from google import genai  # noqa: PLC0415  (import lazy proposital)
    from google.genai import types

    client = genai.Client(api_key=settings.gemini_api_key)
    response = await client.aio.models.generate_content(
        model=settings.gemini_image_model,
        contents=[
            AVATAR_PROMPT,
            types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
        ],
    )
    return _extract_image(response)


async def generate_avatar_task(ctx, job_id: str, image_b64: str) -> None:
    """Job arq: gera o avatar e salva o resultado em `avatar_result:{job_id}`.

    Em caso de sucesso salva {"status": "done", "image": <b64>, "mime": ...}.
    Em caso de falha salva um marcador {"status": "error", ...}. Ambos com TTL.

    PRIVACIDADE: `image_b64` / `image_bytes` só existem em memória durante esta
    função. Nunca são gravados em nenhuma chave, log ou disco. Não adicione isso.
    """
    redis = ctx["redis"]
    key = result_key(job_id)

    try:
        image_bytes = base64.b64decode(image_b64)
        image_out_b64, mime = await _run_gemini(image_bytes)
        payload = {"status": "done", "image": image_out_b64, "mime": mime}
    except Exception:
        # NUNCA logamos a foto original nem os bytes — apenas o job_id e o traço.
        logger.exception("Falha ao gerar avatar para job %s", job_id)
        payload = {"status": "error", "error": "generation_failed"}

    # Persistimos APENAS o resultado (avatar gerado ou marcador de erro), com TTL.
    await redis.set(key, json.dumps(payload), ex=settings.result_ttl_seconds)


class WorkerSettings:
    """Configuração do worker arq. Rode com: `arq app.workers.avatar_worker.WorkerSettings`."""

    functions = [generate_avatar_task]
    redis_settings = RedisSettings.from_dsn(settings.redis_url)

    # PRIVACIDADE (crítico): 0 = o arq NÃO guarda os argumentos/resultado do job
    # após a execução. Isso impede que a `image_b64` original fique retida em
    # `arq:result:*`. NÃO aumente este valor.
    keep_result = 0

    max_jobs = 10
