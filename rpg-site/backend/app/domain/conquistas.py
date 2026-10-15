"""Catálogo de conquistas e a regra de cada uma.

Cada conquista é uma função pura do estado do jogador — sem banco. O banco só
guarda QUANDO foi desbloqueada (tabela `conquistas`), porque algumas podem
deixar de ser verdade depois (o "Invicto" some na primeira derrota) e uma
medalha ganha não pode ser tirada.

Algumas conquistas dão um TÍTULO, que aparece ao lado do nome no card. Vale o
de maior `prioridade` entre as desbloqueadas.
"""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass

from .personagem import ATRIBUTOS
from .progressao import progressao


@dataclass(frozen=True)
class Conquista:
    codigo: str
    nome: str
    descricao: str
    regra: Callable[[dict, dict], bool]
    titulo: str | None = None
    prioridade: int = 0


def _total(j: dict) -> int:
    return int(j.get("vitorias") or 0) + int(j.get("derrotas") or 0) + int(j.get("empates") or 0)


def _caos_domina(j: dict) -> bool:
    valores = {a: int(j.get(a) or 0) for a in ATRIBUTOS}
    return bool(valores) and valores.get("caos", 0) > 0 and valores["caos"] == max(valores.values())


CATALOGO: tuple[Conquista, ...] = (
    Conquista("batizado", "Batizado na Taverna", "Escolheu um nome para o ranking.",
              lambda j, c: bool((j.get("nome") or "").strip())),
    Conquista("primeiro_duelo", "Primeiro Duelo", "Participou de um duelo.",
              lambda j, c: _total(j) >= 1),
    Conquista("primeira_vitoria", "Sabor da Vitória", "Venceu o primeiro duelo.",
              lambda j, c: int(j.get("vitorias") or 0) >= 1, titulo="o Vitorioso", prioridade=10),
    Conquista("veterano", "Veterano de Taverna", "Participou de 10 duelos.",
              lambda j, c: _total(j) >= 10, titulo="o Veterano", prioridade=30),
    Conquista("invicto", "Invicto", "5 vitórias sem nenhuma derrota.",
              lambda j, c: int(j.get("vitorias") or 0) >= 5 and int(j.get("derrotas") or 0) == 0,
              titulo="o Imbatível", prioridade=60),
    Conquista("persistente", "Quem Cai, Levanta", "Perdeu 5 duelos e continuou jogando.",
              lambda j, c: int(j.get("derrotas") or 0) >= 5, titulo="o Persistente", prioridade=25),
    Conquista("diplomata", "Diplomata", "Empatou 3 duelos.",
              lambda j, c: int(j.get("empates") or 0) >= 3, titulo="o Diplomata", prioridade=20),
    Conquista("caotico", "Agente do Caos", "O Caos é o atributo mais alto do herói.",
              lambda j, c: _caos_domina(j), titulo="o Caótico", prioridade=40),
    Conquista("nivel_5", "Nível 5", "Chegou ao nível 5.",
              lambda j, c: progressao(j.get("xp"))["nivel"] >= 5),
    Conquista("nivel_10", "Nível 10", "Chegou ao nível 10.",
              lambda j, c: progressao(j.get("xp"))["nivel"] >= 10, titulo="o Mestre", prioridade=70),
    Conquista("missionario", "Missionário", "Cumpriu 3 missões do dia.",
              lambda j, c: int(c.get("missoes_concluidas") or 0) >= 3, titulo="o Dedicado", prioridade=50),
)

POR_CODIGO: dict[str, Conquista] = {c.codigo: c for c in CATALOGO}


def avaliar(jogador: dict, contexto: dict | None = None) -> list[str]:
    """Códigos das conquistas que o estado ATUAL do jogador satisfaz."""
    contexto = contexto or {}
    return [c.codigo for c in CATALOGO if c.regra(jogador, contexto)]


def titulo_do_jogador(codigos_desbloqueados: list[str]) -> str | None:
    """Título de maior prioridade entre as conquistas já ganhas."""
    com_titulo = [POR_CODIGO[c] for c in codigos_desbloqueados if c in POR_CODIGO and POR_CODIGO[c].titulo]
    if not com_titulo:
        return None
    return max(com_titulo, key=lambda c: c.prioridade).titulo


def descrever(codigo: str) -> dict:
    c = POR_CODIGO[codigo]
    return {"codigo": c.codigo, "nome": c.nome, "descricao": c.descricao, "titulo": c.titulo}
