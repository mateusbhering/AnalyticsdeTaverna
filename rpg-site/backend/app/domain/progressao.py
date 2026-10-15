"""Nível do herói, derivado do XP — nada novo é gravado.

O XP já é a fonte da verdade (vitória 30, empate 15, derrota 5). O nível é só
uma leitura dele: subir de nível não muda placar nenhum, apenas dá um marco
visível. Por ser derivado, qualquer jogador antigo já nasce com nível certo.

Curva triangular: para chegar ao nível n precisa de `20·n·(n−1)` de XP —
nível 2 em 40, 3 em 120, 5 em 400, 10 em 1.800. Duas vitórias já viram o
nível 2 (a primeira recompensa vem rápido); depois o ritmo desacelera.
"""

from __future__ import annotations

NIVEL_MAXIMO = 30

# Faixas de nível → título. Ordem crescente; vale a última faixa já alcançada.
TITULOS_NIVEL: tuple[tuple[int, str], ...] = (
    (1, "Aprendiz"),
    (3, "Aventureiro"),
    (5, "Veterano"),
    (8, "Herói"),
    (12, "Mestre"),
    (20, "Lenda da Taverna"),
)


def xp_para_nivel(nivel: int) -> int:
    """XP total necessário para ALCANÇAR `nivel` (nível 1 = 0)."""
    n = max(1, min(int(nivel), NIVEL_MAXIMO))
    return 20 * n * (n - 1)


def titulo_do_nivel(nivel: int) -> str:
    titulo = TITULOS_NIVEL[0][1]
    for minimo, nome in TITULOS_NIVEL:
        if nivel >= minimo:
            titulo = nome
    return titulo


def progressao(xp: int | None) -> dict:
    """Tudo que a barra de nível precisa a partir do XP."""
    xp = max(0, int(xp or 0))
    nivel = 1
    while nivel < NIVEL_MAXIMO and xp >= xp_para_nivel(nivel + 1):
        nivel += 1

    base = xp_para_nivel(nivel)
    if nivel >= NIVEL_MAXIMO:
        return {
            "nivel": nivel,
            "titulo_nivel": titulo_do_nivel(nivel),
            "xp": xp,
            "xp_no_nivel": xp - base,
            "xp_para_proximo": 0,
            "progresso_pct": 100.0,
            "nivel_maximo": True,
        }

    faixa = xp_para_nivel(nivel + 1) - base
    no_nivel = xp - base
    return {
        "nivel": nivel,
        "titulo_nivel": titulo_do_nivel(nivel),
        "xp": xp,
        "xp_no_nivel": no_nivel,
        "xp_para_proximo": faixa - no_nivel,
        "progresso_pct": round(no_nivel / faixa * 100, 1),
        "nivel_maximo": False,
    }
