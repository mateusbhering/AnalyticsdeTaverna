"""Rotas de geração de personagem (entregável 1 — "rotas para geração").

  POST /personagem/gerar   — dimensões do quiz → atributos + classe
  GET  /personagem/classes — catálogo de classes (para telas e filtros)

Não grava nada. É cálculo puro: serve para o front mostrar a prévia do
resultado antes de o jogador confirmar o cadastro.
"""

from __future__ import annotations

from fastapi import APIRouter

from ..domain.personagem import (
    ATRIBUTOS,
    CLASSE_POR_DIMENSAO,
    DIMENSOES,
    REGRAS_CLASSE,
    gerar_personagem,
)
from ..schemas import GerarPersonagemRequest, PersonagemResponse

router = APIRouter(prefix="/personagem", tags=["personagem"])


@router.post("/gerar", response_model=PersonagemResponse)
async def gerar(payload: GerarPersonagemRequest):
    """Converte as dimensões do quiz em atributos e classe.

    Determinístico: as mesmas dimensões sempre devolvem o mesmo personagem.
    """
    return gerar_personagem(payload.dimensoes.model_dump(), payload.tags)


@router.get("/classes")
async def listar_classes():
    """Todas as classes possíveis, mais os nomes de dimensões e atributos.

    O frontend usa isto para montar filtros e legendas sem hardcodar a lista.
    """
    classes = sorted({nome for nome, _ in REGRAS_CLASSE} | set(CLASSE_POR_DIMENSAO.values()))
    return {
        "classes": classes,
        "total": len(classes),
        "dimensoes": list(DIMENSOES),
        "atributos": list(ATRIBUTOS),
    }
