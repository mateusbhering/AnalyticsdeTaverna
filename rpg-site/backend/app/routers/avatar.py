"""Endpoints de geração de avatar.

  POST   /avatar/generate       — recebe a foto, enfileira o job, devolve job_id
  GET    /avatar/status/{id}    — polling do resultado
  DELETE /avatar/result/{id}    — limpeza antecipada (após o frontend exibir)
"""

from __future__ import annotations

import base64
import json
from uuid import uuid4

import logging

from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import RedirectResponse

from ..config import result_key, settings

log = logging.getLogger(__name__)

router = APIRouter(prefix="/avatar", tags=["avatar"])


def _redis(request: Request):
    """Pega o pool do Redis, ou devolve 503 se ele não subiu.

    Necessário porque a API agora sobe mesmo sem Redis (para permitir
    desenvolver as rotas de cadastro/batalha/ranking sem instalar Redis).
    Sem isto, uma chamada de avatar nessa situação viraria erro 500 feio.
    """
    redis = getattr(request.app.state, "arq_redis", None)
    if redis is None:
        raise HTTPException(
            status_code=503,
            detail="Serviço de avatar indisponível: Redis não conectado.",
        )
    return redis


@router.post("/generate")
async def generate_avatar(
    request: Request,
    file: UploadFile = File(...),
    classe: str = Form(""),
):
    """Valida a imagem, enfileira o job de geração e retorna o job_id.

    `classe` (opcional) é o nome da classe de RPG do jogador, usado para gerar
    um avatar com o estilo visual daquela classe.
    """
    # 1. Valida content-type.
    if file.content_type not in settings.allowed_content_types:
        raise HTTPException(
            status_code=415,
            detail=(
                "Tipo de arquivo não suportado. Aceitos: "
                + ", ".join(settings.allowed_content_types)
            ),
        )

    # 2. Lê no máximo (limite + 1) bytes para validar o tamanho sem carregar
    #    arquivos gigantes inteiros na memória.
    data = await file.read(settings.max_upload_bytes + 1)
    if len(data) > settings.max_upload_bytes:
        raise HTTPException(status_code=413, detail="Arquivo excede o limite de 8MB")
    if not data:
        raise HTTPException(status_code=400, detail="Arquivo vazio")

    # 3. Enfileira o job.
    job_id = str(uuid4())
    image_b64 = base64.b64encode(data).decode("ascii")

    # PRIVACIDADE: a foto original vai APENAS como argumento do job (payload da
    # fila arq). Ela é consumida pelo worker e nunca é gravada por nós em uma
    # chave durável, log ou disco. NÃO adicione um `redis.set(..., image_b64)`
    # aqui nem em qualquer outro lugar.
    redis = _redis(request)
    await redis.enqueue_job(
        "generate_avatar_task", job_id, image_b64, classe, _job_id=job_id
    )

    # Descarta as referências em memória assim que o job foi enfileirado.
    del data, image_b64

    return {"job_id": job_id, "status": "processing"}


@router.get("/status/{job_id}")
async def avatar_status(request: Request, job_id: str):
    """Polling: 'processing' enquanto não há resultado; 'done'/'error' quando pronto."""
    redis = _redis(request)
    raw = await redis.get(result_key(job_id))
    if raw is None:
        return {"job_id": job_id, "status": "processing"}

    payload = json.loads(raw)
    return {"job_id": job_id, **payload}


@router.get("/image/{job_id}")
async def avatar_image(request: Request, job_id: str):
    """Redireciona para o avatar no Storage do Supabase.

    Usada pela página de compartilhamento /personagem (via QR code). Antes esta
    rota devolvia os bytes lidos do Redis, o que amarrava a imagem ao TTL de 24h
    e obrigava o worker a guardar o base64 lá. Agora o Redis guarda só um
    ponteiro, e a imagem vive no Storage — permanente.

    O caminho no bucket é determinístico (`{job_id}.jpg|png`), então o redirect
    é montado a partir do id mesmo quando o Redis não tem nada: instância
    reiniciada, TTL vencido ou `SET` recusado por memória cheia deixam de
    derrubar o avatar de quem já o gerou.
    """
    # O ponteiro, quando existe, dá a extensão certa de graça.
    mime = None
    try:
        raw = await _redis(request).get(result_key(job_id))
        if raw:
            payload = json.loads(raw)
            if payload.get("status") == "error":
                raise HTTPException(status_code=404, detail="Avatar indisponível")
            if payload.get("public_url"):
                return RedirectResponse(payload["public_url"], status_code=307)
            mime = payload.get("mime")
    except HTTPException:
        raise
    except Exception:  # noqa: BLE001 — Redis fora do ar não derruba o avatar
        log.warning("Redis indisponível ao resolver o avatar %s; usando o Storage.", job_id)

    url = _url_no_storage(job_id, mime)
    if url is None:
        raise HTTPException(status_code=404, detail="Avatar não encontrado ou expirado")
    return RedirectResponse(url, status_code=307)


def _url_no_storage(job_id: str, mime: str | None) -> str | None:
    """Monta a URL pública do avatar no bucket a partir do id do job.

    Espelha o nome que `_upload_avatar` usa no worker — se um lado mudar, o
    outro para de achar a imagem. Sem `mime` assumimos `.png`, que é o que o
    Gemini devolve por padrão.
    """
    if not settings.supabase_url:
        return None
    ext = "jpg" if mime and "jpeg" in mime else "png"
    base = settings.supabase_url.rstrip("/")
    return f"{base}/storage/v1/object/public/avatars/{job_id}.{ext}"


@router.delete("/result/{job_id}")
async def delete_avatar_result(request: Request, job_id: str):
    """Limpeza antecipada — remove o avatar do Redis sem esperar o TTL de 24h.

    O frontend chama isto após baixar/exibir a imagem.
    """
    redis = _redis(request)
    deleted = await redis.delete(result_key(job_id))
    return {"job_id": job_id, "deleted": bool(deleted)}
