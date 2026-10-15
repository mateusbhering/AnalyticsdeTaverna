"""Missão do dia: uma por dia, igual para todos, com bônus de XP.

A missão é escolhida pela data (sem sorteio guardado): o mesmo dia dá a mesma
missão para qualquer um. O progresso é CONTADO dos duelos de hoje em que o
jogador foi o desafiante — quem só foi desafiado não ganha missão passivamente.
O banco guarda apenas a conclusão (`missoes_concluidas`), para pagar o bônus
uma vez só.

"Dia" é o dia no horário de Brasília (UTC−3, sem horário de verão desde 2019).
"""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from datetime import date, datetime, timedelta, timezone

FUSO = timezone(timedelta(hours=-3))


@dataclass(frozen=True)
class Missao:
    codigo: str
    nome: str
    descricao: str
    meta: int
    recompensa_xp: int
    # (duelos de hoje como desafiante, classe do oponente por id) -> progresso
    progresso: Callable[[list[dict], dict[int, str | None], int], int]


def _meus_duelos(batalhas: list[dict], jogador_id: int) -> list[dict]:
    return [b for b in batalhas if b.get("jogador_a_id") == jogador_id]


def _venceu(b: dict, jogador_id: int) -> bool:
    return b.get("vencedor_id") == jogador_id


def _usou_caos(b: dict) -> bool:
    if "caos" in str(b.get("atributo") or "").split(","):
        return True
    return any(r.get("atributo") == "caos" for r in (b.get("rodadas") or []))


MISSOES: tuple[Missao, ...] = (
    Missao("duelar_1", "Aquecimento", "Duele 1 vez hoje.", 1, 20,
           lambda bs, cl, jid: len(_meus_duelos(bs, jid))),
    Missao("vencer_1", "Pé Direito", "Vença 1 duelo hoje.", 1, 30,
           lambda bs, cl, jid: sum(_venceu(b, jid) for b in _meus_duelos(bs, jid))),
    Missao("duelar_3", "Noite Agitada", "Duele 3 vezes hoje.", 3, 40,
           lambda bs, cl, jid: len(_meus_duelos(bs, jid))),
    Missao("classes_2", "Mundo Pequeno", "Enfrente 2 classes diferentes hoje.", 2, 35,
           lambda bs, cl, jid: len({cl.get(b.get("jogador_b_id")) for b in _meus_duelos(bs, jid)} - {None})),
    Missao("caos_1", "Dê Uma de Doido", "Leve o Caos para um duelo hoje.", 1, 25,
           lambda bs, cl, jid: sum(_usou_caos(b) for b in _meus_duelos(bs, jid))),
)

POR_CODIGO: dict[str, Missao] = {m.codigo: m for m in MISSOES}


def hoje(agora: datetime | None = None) -> date:
    return (agora or datetime.now(timezone.utc)).astimezone(FUSO).date()


def missao_do_dia(dia: date) -> Missao:
    return MISSOES[dia.toordinal() % len(MISSOES)]


def dia_da_batalha(batalha: dict) -> date | None:
    bruto = batalha.get("criado_em")
    if not bruto:
        return None
    try:
        return datetime.fromisoformat(str(bruto).replace("Z", "+00:00")).astimezone(FUSO).date()
    except ValueError:
        return None


def batalhas_do_dia(batalhas: list[dict], dia: date) -> list[dict]:
    return [b for b in batalhas if dia_da_batalha(b) == dia]


def calcular(missao: Missao, batalhas_hoje: list[dict], classes: dict[int, str | None], jogador_id: int) -> dict:
    feito = min(missao.meta, int(missao.progresso(batalhas_hoje, classes, jogador_id)))
    return {
        "codigo": missao.codigo,
        "nome": missao.nome,
        "descricao": missao.descricao,
        "meta": missao.meta,
        "progresso": feito,
        "recompensa_xp": missao.recompensa_xp,
        "cumprida": feito >= missao.meta,
    }
