"""Raridade da classe, medida pelos jogadores de verdade.

Quanto menos gente caiu numa classe, mais rara ela é. A régua é relativa à
distribuição uniforme (se as N classes fossem igualmente comuns, cada uma teria
1/N dos jogadores): a raridade vem de quão abaixo disso a classe está. Assim a
escala continua justa se o catálogo de classes crescer.

Com poucos jogadores qualquer classe parece rara por acaso, então abaixo de
`AMOSTRA_MINIMA` tudo é "comum" — o card não ganha brilho por falta de dado.
"""

from __future__ import annotations

from collections import Counter

AMOSTRA_MINIMA = 30

# (limite superior da razão share/uniforme, rótulo) — a primeira faixa que serve.
FAIXAS: tuple[tuple[float, str], ...] = (
    (0.30, "lendaria"),
    (0.60, "epica"),
    (0.90, "rara"),
)
COMUM = "comum"


def classificar(razao: float) -> str:
    for limite, nome in FAIXAS:
        if razao < limite:
            return nome
    return COMUM


def raridades(classes_conhecidas: list[str], jogadores: list[dict]) -> dict:
    contagem = Counter(j.get("classe") for j in jogadores if j.get("classe"))
    total = sum(contagem.values())
    n = max(1, len(classes_conhecidas))
    suficiente = total >= AMOSTRA_MINIMA

    itens = {}
    for classe in classes_conhecidas:
        qtd = contagem.get(classe, 0)
        percentual = round(qtd / total * 100, 1) if total else 0.0
        razao = (qtd / total) / (1 / n) if total else 1.0
        itens[classe] = {
            "raridade": classificar(razao) if suficiente else COMUM,
            "percentual": percentual,
            "quantidade": qtd,
        }
    return {"total": total, "amostra_minima": AMOSTRA_MINIMA, "amostra_suficiente": suficiente, "classes": itens}
