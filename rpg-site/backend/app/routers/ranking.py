"""Ranking global (entregável 8).

  GET /ranking              — Top N (padrão 10) por XP
  GET /ranking/{jogador_id} — posição de um jogador específico

Consumido por Mateus na tela de Top 10.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query

from ..repo import Repositorio, get_repo
from ..schemas import ItemRanking

router = APIRouter(prefix="/ranking", tags=["ranking"])


def _montar_item(posicao: int, jogador: dict) -> dict:
    """Adiciona à linha do banco os campos calculados que a tela precisa."""
    vitorias = int(jogador.get("vitorias") or 0)
    derrotas = int(jogador.get("derrotas") or 0)
    empates = int(jogador.get("empates") or 0)
    total = vitorias + derrotas + empates

    return {
        "posicao": posicao,
        "id": jogador["id"],
        "nome": jogador.get("nome"),
        "classe": jogador.get("classe"),
        "xp": int(jogador.get("xp") or 0),
        "vitorias": vitorias,
        "derrotas": derrotas,
        "empates": empates,
        "total_batalhas": total,
        # Arredondado a 1 casa: "66.7%" lê melhor na tela que "66.66666%".
        "taxa_vitoria": round(vitorias / total * 100, 1) if total else 0.0,
        "foto_url": jogador.get("foto_url"),
    }


@router.get("", response_model=list[ItemRanking])
async def top(
    limite: int = Query(10, ge=1, le=100, description="Quantos colocados retornar."),
    repo: Repositorio = Depends(get_repo),
):
    """Top N por XP. Critério de desempate: número de vitórias."""
    jogadores = await repo.ranking(limite=limite)
    return [_montar_item(i, j) for i, j in enumerate(jogadores, start=1)]


@router.get("/{jogador_id}", response_model=ItemRanking)
async def posicao_do_jogador(jogador_id: int, repo: Repositorio = Depends(get_repo)):
    """Onde este jogador está no ranking.

    Percorre o ranking amplo procurando o jogador. Se ele estiver fora dessa
    faixa, devolvemos os dados dele com posição 0 — a tela mostra "fora do
    ranking" em vez de dar erro.
    """
    jogador = await repo.obter_jogador(jogador_id)
    if jogador is None:
        raise HTTPException(status_code=404, detail="Jogador não encontrado.")

    lista = await repo.ranking(limite=100)
    for posicao, linha in enumerate(lista, start=1):
        if linha["id"] == jogador_id:
            return _montar_item(posicao, linha)

    return _montar_item(0, jogador)
