"""Camada lúdica: junta níveis, conquistas, missões e raridade em respostas.

As regras puras moram em `domain/` (testáveis sem banco). Aqui só orquestramos
com o repositório. Tudo é DERIVADO ou idempotente: ler o perfil várias vezes
não muda nada além de gravar, uma vez, conquistas que o jogador já merecia
(retroativo para quem jogou antes de elas existirem).
"""

from __future__ import annotations

import logging

from .domain import conquistas as cq
from .domain import missoes as ms
from .domain import progressao as pg
from .domain import raridade as rr
from .domain.personagem import CLASSE_POR_DIMENSAO, REGRAS_CLASSE
from .repo import Repositorio

log = logging.getLogger(__name__)


def classes_conhecidas() -> list[str]:
    return sorted({regra[0] for regra in REGRAS_CLASSE} | set(CLASSE_POR_DIMENSAO.values()))


async def _estado_da_missao(repo: Repositorio, jogador: dict) -> dict:
    dia = ms.hoje()
    missao = ms.missao_do_dia(dia)
    batalhas = ms.batalhas_do_dia(await repo.listar_batalhas(jogador["id"], limite=100), dia)

    classes: dict[int, str | None] = {}
    for b in ms._meus_duelos(batalhas, jogador["id"]):
        oponente_id = b.get("jogador_b_id")
        if oponente_id is not None and oponente_id not in classes:
            oponente = await repo.obter_jogador(oponente_id)
            classes[oponente_id] = (oponente or {}).get("classe")

    estado = ms.calcular(missao, batalhas, classes, jogador["id"])
    estado["dia"] = dia.isoformat()
    estado["recompensa_paga"] = (await repo.missao_concluida(jogador["id"], dia.isoformat())) is not None
    return estado


async def _conquistas(repo: Repositorio, jogador: dict) -> tuple[list[dict], list[str]]:
    """(catálogo com o estado de cada uma, códigos desbloqueados)."""
    contexto = {"missoes_concluidas": await repo.contar_missoes_concluidas(jogador["id"])}
    merecidas = cq.avaliar(jogador, contexto)
    await repo.registrar_conquistas(jogador["id"], merecidas)  # retroativo e idempotente

    guardadas = {c["codigo"]: c.get("desbloqueada_em") for c in await repo.conquistas_do_jogador(jogador["id"])}
    # Sem a tabela nada fica guardado: mostra o que o estado atual já merece.
    desbloqueadas = dict.fromkeys(merecidas)
    desbloqueadas.update(guardadas)

    catalogo = [
        {
            "codigo": c.codigo,
            "nome": c.nome,
            "descricao": c.descricao,
            "titulo": c.titulo,
            "desbloqueada": c.codigo in desbloqueadas,
            "desbloqueada_em": desbloqueadas.get(c.codigo),
        }
        for c in cq.CATALOGO
    ]
    return catalogo, list(desbloqueadas)


async def montar_perfil(repo: Repositorio, jogador: dict) -> dict:
    catalogo, codigos = await _conquistas(repo, jogador)
    jogadores = await repo.jogadores_para_analytics()
    raridades = rr.raridades(classes_conhecidas(), jogadores)
    classe = jogador.get("classe")

    return {
        "id": jogador["id"],
        "nome": jogador.get("nome"),
        "classe": classe,
        "progressao": pg.progressao(jogador.get("xp")),
        "titulo": cq.titulo_do_jogador(codigos),
        "raridade": {
            "nivel": raridades["classes"].get(classe, {}).get("raridade", rr.COMUM),
            "percentual": raridades["classes"].get(classe, {}).get("percentual", 0.0),
            "amostra_suficiente": raridades["amostra_suficiente"],
        },
        "conquistas": catalogo,
        "conquistas_desbloqueadas": len(codigos),
        "conquistas_total": len(catalogo),
        "missao_hoje": await _estado_da_missao(repo, jogador),
    }


async def pos_batalha(repo: Repositorio, jogador_a_id: int, jogador_b_id: int, xp_antes_a: int) -> dict | None:
    """O que aconteceu de lúdico por causa deste duelo, para o DESAFIANTE.

    Nunca derruba a batalha: o resultado já foi gravado, então qualquer falha
    aqui vira log e `None` — a tela só não mostra o brinde.
    """
    try:
        extras: dict = {"conquistas_novas": [], "missao": None, "nivel": None}

        # Missão primeiro: o bônus de XP pode subir o nível e destravar conquistas.
        jogador_a = await repo.obter_jogador(jogador_a_id)
        if jogador_a is None:
            return None
        estado = await _estado_da_missao(repo, jogador_a)
        if estado["cumprida"] and not estado["recompensa_paga"]:
            if await repo.registrar_missao(jogador_a_id, estado["dia"], estado["codigo"], estado["recompensa_xp"]):
                await repo.adicionar_xp(jogador_a_id, estado["recompensa_xp"])
                extras["missao"] = {
                    "codigo": estado["codigo"],
                    "nome": estado["nome"],
                    "recompensa_xp": estado["recompensa_xp"],
                }

        for jid in (jogador_a_id, jogador_b_id):
            jogador = await repo.obter_jogador(jid)
            if jogador is None:
                continue
            contexto = {"missoes_concluidas": await repo.contar_missoes_concluidas(jid)}
            novas = await repo.registrar_conquistas(jid, cq.avaliar(jogador, contexto))
            if jid == jogador_a_id:
                extras["conquistas_novas"] = [cq.descrever(c) for c in novas]
                depois = pg.progressao(jogador.get("xp"))
                antes = pg.progressao(xp_antes_a)
                extras["nivel"] = {
                    "antes": antes["nivel"],
                    "depois": depois["nivel"],
                    "subiu": depois["nivel"] > antes["nivel"],
                    "titulo_nivel": depois["titulo_nivel"],
                }
        return extras
    except Exception:  # noqa: BLE001 — a batalha já foi gravada, ver docstring
        log.exception("Falha ao calcular os brindes lúdicos do duelo.")
        return None
