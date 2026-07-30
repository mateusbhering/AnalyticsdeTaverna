"""Rotas de cadastro de jogador (entregável 1 — "rotas para cadastro").

  POST /jogadores        — cadastra o jogador e devolve o id
  GET  /jogadores/{id}   — consulta um jogador
  GET  /jogadores        — lista os mais recentes
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query

from ..domain.personagem import DIMENSOES, gerar_personagem
from ..repo import Repositorio, get_repo
from ..schemas import CadastroRequest, JogadorResponse

router = APIRouter(prefix="/jogadores", tags=["jogadores"])


@router.post("", status_code=201, response_model=JogadorResponse)
async def cadastrar(payload: CadastroRequest, repo: Repositorio = Depends(get_repo)):
    """Cadastra um jogador e devolve o registro criado (com o id).

    O id é a chave de tudo depois: batalha, ranking e card usam ele.
    """
    dados: dict = {
        "nome": (payload.nome or "").strip() or None,
        "foto_url": payload.foto_url,
        # Placar sempre começa zerado — nunca aceite XP vindo do cliente.
        "xp": 0,
        "vitorias": 0,
        "derrotas": 0,
        "empates": 0,
    }

    if payload.dimensoes is not None:
        # Caminho recomendado: a API é a fonte da verdade do personagem.
        personagem = gerar_personagem(payload.dimensoes.model_dump(), payload.tags)
        dados["classe"] = personagem["classe"]
        dados.update(personagem["atributos"])
        dados.update(personagem["dimensoes"])
    elif payload.atributos is not None and payload.classe:
        # Caminho de compatibilidade: o front já calculou tudo.
        dados["classe"] = payload.classe
        dados.update(payload.atributos.model_dump())
    else:
        raise HTTPException(
            status_code=422,
            detail="Envie `dimensoes` (recomendado) ou `atributos` + `classe`.",
        )

    return await repo.criar_jogador(dados)


@router.get("/{jogador_id}", response_model=JogadorResponse)
async def obter(jogador_id: int, repo: Repositorio = Depends(get_repo)):
    jogador = await repo.obter_jogador(jogador_id)
    if jogador is None:
        raise HTTPException(status_code=404, detail="Jogador não encontrado.")
    return jogador


@router.get("", response_model=list[JogadorResponse])
async def listar(
    limite: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    repo: Repositorio = Depends(get_repo),
):
    """Lista os jogadores mais recentes. Paginado para não puxar a tabela toda."""
    return await repo.listar_jogadores(limite=limite, offset=offset)


# Exportado para os testes conferirem que o cadastro grava as 10 dimensões.
__all__ = ["router", "DIMENSOES"]
