"""Endpoints de geração de avatar.

  POST   /avatar/generate       — recebe a foto, enfileira o job, devolve job_id
  GET    /avatar/status/{id}    — polling do resultado
  DELETE /avatar/result/{id}    — limpeza antecipada (após o frontend exibir)
"""

from __future__ import annotations

import base64
import json
from uuid import uuid4

from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import Response

from ..config import result_key, settings

router = APIRouter(prefix="/avatar", tags=["avatar"])


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
    redis = request.app.state.arq_redis
    await redis.enqueue_job(
        "generate_avatar_task", job_id, image_b64, classe, _job_id=job_id
    )

    # Descarta as referências em memória assim que o job foi enfileirado.
    del data, image_b64

    return {"job_id": job_id, "status": "processing"}


@router.get("/status/{job_id}")
async def avatar_status(request: Request, job_id: str):
    """Polling: 'processing' enquanto não há resultado; 'done'/'error' quando pronto."""
    redis = request.app.state.arq_redis
    raw = await redis.get(result_key(job_id))
    if raw is None:
        return {"job_id": job_id, "status": "processing"}

    payload = json.loads(raw)
    return {"job_id": job_id, **payload}


@router.get("/image/{job_id}")
async def avatar_image(request: Request, job_id: str):
    """Retorna a imagem do avatar como bytes crus, para uso direto em `<img src>`.

    Usada pela página de compartilhamento /personagem (via QR code). Disponível
    enquanto durar o TTL de 24h; depois disso retorna 404 e o frontend cai no
    fallback da ilustração da classe.
    """
    redis = request.app.state.arq_redis
    raw = await redis.get(result_key(job_id))
    if raw is None:
        raise HTTPException(status_code=404, detail="Avatar não encontrado ou expirado")
    payload = json.loads(raw)
    if payload.get("status") != "done" or not payload.get("image"):
        raise HTTPException(status_code=404, detail="Avatar indisponível")

    data = base64.b64decode(payload["image"])
    return Response(
        content=data,
        media_type=payload.get("mime", "image/png"),
        headers={"Cache-Control": "public, max-age=86400"},
    )


@router.delete("/result/{job_id}")
async def delete_avatar_result(request: Request, job_id: str):
    """Limpeza antecipada — remove o avatar do Redis sem esperar o TTL de 24h.

    O frontend chama isto após baixar/exibir a imagem.
    """
    redis = request.app.state.arq_redis
    deleted = await redis.delete(result_key(job_id))
    return {"job_id": job_id, "deleted": bool(deleted)}
