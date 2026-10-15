"""Rotas de cadastro de jogador (entregável 1 — "rotas para cadastro").

  POST /jogadores        — cadastra o jogador e devolve o id
  GET  /jogadores/{id}   — consulta um jogador
  GET  /jogadores        — lista os mais recentes
"""

from __future__ import annotations

import re

from fastapi import APIRouter, Depends, HTTPException, Query

from ..domain.personagem import DIMENSOES, gerar_personagem
from ..repo import Repositorio, get_repo
from ..schemas import CadastroRequest, JogadorResponse

router = APIRouter(prefix="/jogadores", tags=["jogadores"])

NOME_MAX = 30  # o mesmo limite do campo do quiz (src/lib/nome-jogador.ts)
_INVISIVEIS = re.compile(r"[\x00-\x1f\x7f-\x9f\u200b-\u200f\u202a-\u202e\u2066-\u2069]")


def limpar_nome(bruto: str | None) -> str | None:
    """Mesma regra do front, refeita aqui: o servidor não confia no navegador.

    Tira controle/direção invisível, colapsa espaços e corta no limite. Vazio
    vira `None` (o ranking mostra `#id`).
    """
    if not bruto:
        return None
    limpo = " ".join(_INVISIVEIS.sub("", bruto).split())[:NOME_MAX].strip()
    return limpo or None


@router.post("", status_code=201, response_model=JogadorResponse)
async def cadastrar(payload: CadastroRequest, repo: Repositorio = Depends(get_repo)):
    """Cadastra um jogador e devolve o registro criado (com o id).

    O id é a chave de tudo depois: batalha, ranking e card usam ele.
    """
    dados: dict = {
        "nome": limpar_nome(payload.nome),
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

    # As tags não são deriváveis do resto (a classe sai delas, mas o caminho
    # não volta): sem gravar, quem reabre /personagem?id= perde as tags.
    tags = list(dict.fromkeys(t.strip()[:40] for t in payload.tags if t.strip()))
    if tags:
        dados["tags"] = tags
    if payload.sessao_funil_id:
        dados["sessao_funil_id"] = payload.sessao_funil_id

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
