"""Motor da batalha — pareamento, cálculo do vencedor e XP.

Também é PURO: recebe dicionários de jogador, devolve o resultado. Quem grava
no banco é o router (`app/routers/batalha.py`). Essa separação é o que permite
testar toda a regra do jogo sem Supabase, sem rede, sem nada.

Regra do confronto (entregável 5): os dois jogadores disputam UM atributo
escolhido. Maior valor vence. Valores iguais = empate.
"""

from __future__ import annotations

import random
from typing import Mapping, Sequence

# ─────────────────────────────────────────────────────────────────────────────
# Atributos disputáveis
#
# ATENÇÃO — ponto que precisa de alinhamento com o time:
# a especificação da batalha pede Inteligência, Criatividade, Estratégia e
# Carisma. Mas o card do personagem tem outros 7 atributos (força, agilidade,
# resistência, caos...). "Criatividade" e "Estratégia" são DIMENSÕES do quiz,
# não atributos do card.
#
# Solução: cada atributo de batalha aponta para uma coluna principal e uma
# coluna de reserva. Jogadores novos têm as dimensões salvas (coluna
# principal); jogadores antigos, cadastrados antes desse schema, caem na
# reserva derivada dos atributos do card. Ninguém fica de fora do jogo.
#
# Se o time decidir outro mapeamento, muda SÓ este dicionário.
# ─────────────────────────────────────────────────────────────────────────────
ATRIBUTOS_BATALHA: dict[str, tuple[str, str]] = {
    #  atributo        → (coluna principal, coluna de reserva)
    "inteligencia": ("inteligencia", "inteligencia"),
    "carisma": ("carisma", "carisma"),
    "estrategia": ("estrategia", "inteligencia"),
    "criatividade": ("criatividade", "caos"),
}

ATRIBUTOS_VALIDOS: tuple[str, ...] = tuple(ATRIBUTOS_BATALHA)

# XP por resultado. Derrota também dá XP (pouco) de propósito: quem perde
# continua tendo motivo pra jogar de novo — é design de gamificação, não
# generosidade.
XP_VITORIA = 30
XP_EMPATE = 15
XP_DERROTA = 5


class AtributoInvalido(ValueError):
    """Atributo pedido não está entre os disputáveis."""


def valor_do_atributo(jogador: Mapping, atributo: str) -> int:
    """Lê o valor que o jogador leva para o confronto naquele atributo."""
    if atributo not in ATRIBUTOS_BATALHA:
        raise AtributoInvalido(
            f"Atributo '{atributo}' não é válido. "
            f"Use um destes: {', '.join(ATRIBUTOS_VALIDOS)}."
        )

    principal, reserva = ATRIBUTOS_BATALHA[atributo]

    valor = jogador.get(principal)
    if valor is None:
        valor = jogador.get(reserva)

    return int(valor or 0)


def parear(
    jogador: Mapping,
    candidatos: Sequence[Mapping],
    aleatorio: random.Random | None = None,
) -> dict | None:
    """Matchmaking: escolhe o adversário do jogador.

    Critério: XP mais próximo. Partida equilibrada é partida divertida — jogador
    novo contra o líder do ranking só frustra os dois.

    Entre candidatos igualmente próximos, sorteia — assim duas partidas
    seguidas não caem sempre no mesmo adversário.

    Devolve None se não houver ninguém disponível (ex.: primeiro jogador
    cadastrado). O router transforma isso num 404 explicativo.
    """
    rng = aleatorio or random

    elegiveis = [c for c in candidatos if c.get("id") != jogador.get("id")]
    if not elegiveis:
        return None

    xp_jogador = int(jogador.get("xp") or 0)

    def distancia(c: Mapping) -> int:
        return abs(int(c.get("xp") or 0) - xp_jogador)

    menor = min(distancia(c) for c in elegiveis)
    empatados = [c for c in elegiveis if distancia(c) == menor]

    return dict(rng.choice(empatados))


def resolver(jogador_a: Mapping, jogador_b: Mapping, atributo: str) -> dict:
    """Calcula o resultado do confronto. NÃO grava nada — só decide.

    Devolve tudo o que o banco precisa registrar e o front precisa exibir.
    """
    valor_a = valor_do_atributo(jogador_a, atributo)
    valor_b = valor_do_atributo(jogador_b, atributo)

    if valor_a > valor_b:
        resultado = "a"
        vencedor_id = jogador_a.get("id")
        xp_a, xp_b = XP_VITORIA, XP_DERROTA
    elif valor_b > valor_a:
        resultado = "b"
        vencedor_id = jogador_b.get("id")
        xp_a, xp_b = XP_DERROTA, XP_VITORIA
    else:
        resultado = "empate"
        vencedor_id = None
        xp_a = xp_b = XP_EMPATE

    return {
        "atributo": atributo,
        "valor_a": valor_a,
        "valor_b": valor_b,
        "resultado": resultado,
        "vencedor_id": vencedor_id,
        "xp_a": xp_a,
        "xp_b": xp_b,
        "diferenca": abs(valor_a - valor_b),
        "narrativa": _narrar(jogador_a, jogador_b, atributo, valor_a, valor_b, resultado),
    }


def resultado_para(resultado: str, lado: str) -> str:
    """Traduz 'a'/'b'/'empate' para o ponto de vista de um lado.

    Usado para saber qual contador incrementar (vitórias/derrotas/empates).
    """
    if resultado == "empate":
        return "empate"
    return "vitoria" if resultado == lado else "derrota"


_RÓTULOS = {
    "inteligencia": "Inteligência",
    "criatividade": "Criatividade",
    "estrategia": "Estratégia",
    "carisma": "Carisma",
}


def _narrar(
    jogador_a: Mapping,
    jogador_b: Mapping,
    atributo: str,
    valor_a: int,
    valor_b: int,
    resultado: str,
) -> str:
    """Uma frase de resumo pro card e pra tela de resultado."""
    nome_a = jogador_a.get("nome") or jogador_a.get("classe") or "Jogador A"
    nome_b = jogador_b.get("nome") or jogador_b.get("classe") or "Jogador B"
    rotulo = _RÓTULOS.get(atributo, atributo.capitalize())
    diferenca = abs(valor_a - valor_b)

    if resultado == "empate":
        return f"{nome_a} e {nome_b} empataram em {rotulo} ({valor_a} × {valor_b}). A taverna ficou em silêncio."

    vencedor, perdedor = (nome_a, nome_b) if resultado == "a" else (nome_b, nome_a)
    if diferenca >= 8:
        intensidade = "dominou"
    elif diferenca >= 3:
        intensidade = "levou a melhor sobre"
    else:
        intensidade = "venceu por pouco"

    return f"{vencedor} {intensidade} {perdedor} em {rotulo} ({valor_a} × {valor_b})."
