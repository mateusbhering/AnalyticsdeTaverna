"""Motor da batalha — pareamento, confronto de atributos escolhidos e XP.

É PURO: recebe dicionários de jogador, devolve o resultado. Quem grava no
banco é o router (`app/routers/batalha.py`). Essa separação é o que permite
testar toda a regra do jogo sem Supabase, sem rede, sem nada.

Regra do confronto (MELHOR DE 3):
  1. O desafiante ESCOLHE 3 dos 7 atributos do card antes de lutar. É a única
     decisão do jogo — e é o que o torna um jogo, e não um sorteio: quem
     conhece o próprio card aposta onde é forte.
  2. Cada rodada compara o MESMO atributo dos dois lados. Maior valor vence a
     rodada; iguais empatam.
  3. Quem vencer mais rodadas vence a batalha. Três rodadas nunca dão 1½ a 1½,
     mas rodadas empatadas podem levar o placar a um empate geral.

A batalha é assíncrona e instantânea: o desafiante escaneia o QR, escolhe os
atributos e o resultado sai na hora. O oponente não tem ação ativa nem estado
pendente — não existe convite para aceitar, nem partida esperando resposta.

O oponente não escolhe nada, e isso é assimétrico de propósito: ele entra com
os valores que tem nos atributos que o desafiante apontou. A vantagem de
escolher é o prêmio por ser quem lançou o desafio.
"""

from __future__ import annotations

import random
from typing import Mapping, Sequence

from .personagem import ATRIBUTOS

# Os atributos disputáveis são os 7 do card — os mesmos que o jogador vê no
# próprio personagem, e as mesmas chaves de `src/lib/atributos.ts` no front.
ATRIBUTOS_BATALHA: tuple[str, ...] = ATRIBUTOS
ATRIBUTOS_VALIDOS: tuple[str, ...] = ATRIBUTOS_BATALHA

# Quantos atributos o desafiante escolhe — e, portanto, quantas rodadas há.
RODADAS = 3

# XP por resultado. Derrota também dá XP (pouco) de propósito: quem perde
# continua tendo motivo pra jogar de novo — é design de gamificação, não
# generosidade.
XP_VITORIA = 30
XP_EMPATE = 15
XP_DERROTA = 5

XP_POR_RESULTADO: dict[str, int] = {
    "vitoria": XP_VITORIA,
    "empate": XP_EMPATE,
    "derrota": XP_DERROTA,
}

RÓTULOS: dict[str, str] = {
    "forca": "Força",
    "inteligencia": "Inteligência",
    "agilidade": "Agilidade",
    "resistencia": "Resistência",
    "carisma": "Carisma",
    "sabedoria": "Sabedoria",
    "caos": "Caos",
}

# Alias do nome antigo (grafia com underscore não existia; o router usava
# `motor._RÓTULOS`). Mantido para não quebrar import de terceiros.
_RÓTULOS = RÓTULOS


class AtributoInvalido(ValueError):
    """Atributo pedido não está entre os disputáveis."""


def valor_do_atributo(jogador: Mapping, atributo: str) -> int:
    """Lê o valor que o jogador leva para o confronto naquele atributo.

    Jogador sem a coluna preenchida (cadastro antigo, campo nulo) vale 0 em vez
    de quebrar a batalha inteira.
    """
    if atributo not in ATRIBUTOS_BATALHA:
        raise AtributoInvalido(
            f"Atributo '{atributo}' não é válido. "
            f"Use um destes: {', '.join(ATRIBUTOS_VALIDOS)}."
        )
    return int(jogador.get(atributo) or 0)


class EscolhaInvalida(ValueError):
    """A escolha de atributos não fecha a regra (quantidade, repetição ou nome)."""


def validar_escolha(atributos: Sequence[str]) -> list[str]:
    """Confere a escolha do desafiante e devolve a lista normalizada.

    Três checagens, três mensagens distintas — o front mostra o texto direto na
    tela, então "atributos inválidos" não serve para nada. A UI já impede as
    três, mas a UI não é a fronteira de confiança: o pedido chega por HTTP e
    qualquer um pode montá-lo à mão.
    """
    escolha = list(atributos)

    if len(escolha) != RODADAS:
        raise EscolhaInvalida(
            f"Escolha exatamente {RODADAS} atributos (vieram {len(escolha)})."
        )

    if len(set(escolha)) != len(escolha):
        repetidos = sorted({a for a in escolha if escolha.count(a) > 1})
        raise EscolhaInvalida(
            f"Não dá para escolher o mesmo atributo duas vezes: {', '.join(repetidos)}."
        )

    desconhecidos = [a for a in escolha if a not in ATRIBUTOS_BATALHA]
    if desconhecidos:
        raise EscolhaInvalida(
            f"Atributo inválido: {', '.join(desconhecidos)}. "
            f"Use estes: {', '.join(ATRIBUTOS_VALIDOS)}."
        )

    return escolha


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

    Continua valendo para o modo "achar alguém pra batalhar". No fluxo do QR o
    adversário já vem escolhido pelo card escaneado.
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


def resolver(
    jogador_a: Mapping, jogador_b: Mapping, atributos: Sequence[str]
) -> dict:
    """Melhor de 3 nos atributos que o desafiante escolheu. NÃO grava nada.

    Devolve tudo o que o banco precisa registrar e o front precisa exibir.
    Levanta `EscolhaInvalida` se a escolha não fechar a regra.
    """
    escolha = validar_escolha(atributos)

    rodadas: list[dict] = []
    vitorias_a = vitorias_b = empates_rodada = 0

    for atributo in escolha:
        valor_a = valor_do_atributo(jogador_a, atributo)
        valor_b = valor_do_atributo(jogador_b, atributo)

        if valor_a > valor_b:
            vencedor = "a"
            vitorias_a += 1
        elif valor_b > valor_a:
            vencedor = "b"
            vitorias_b += 1
        else:
            vencedor = "empate"
            empates_rodada += 1

        rodadas.append(
            {
                "atributo": atributo,
                "rotulo": RÓTULOS[atributo],
                "valor_a": valor_a,
                "valor_b": valor_b,
                "vencedor": vencedor,
                "diferenca": abs(valor_a - valor_b),
            }
        )

    if vitorias_a > vitorias_b:
        resultado = "a"
        vencedor_id = jogador_a.get("id")
        xp_a, xp_b = XP_VITORIA, XP_DERROTA
    elif vitorias_b > vitorias_a:
        resultado = "b"
        vencedor_id = jogador_b.get("id")
        xp_a, xp_b = XP_DERROTA, XP_VITORIA
    else:
        resultado = "empate"
        vencedor_id = None
        xp_a = xp_b = XP_EMPATE

    return {
        "atributos": escolha,
        "rodadas": rodadas,
        "vitorias_a": vitorias_a,
        "vitorias_b": vitorias_b,
        "empates_rodada": empates_rodada,
        "resultado": resultado,
        "vencedor_id": vencedor_id,
        "xp_a": xp_a,
        "xp_b": xp_b,
        "narrativa": _narrar(jogador_a, jogador_b, rodadas, vitorias_a, vitorias_b, resultado),
    }


def resultado_para(resultado: str, lado: str) -> str:
    """Traduz 'a'/'b'/'empate' para o ponto de vista de um lado.

    Usado para saber qual contador incrementar (vitórias/derrotas/empates).
    """
    if resultado == "empate":
        return "empate"
    return "vitoria" if resultado == lado else "derrota"


def xp_de(resultado: str, lado: str) -> int:
    """XP que o `lado` leva desta batalha. Atalho de leitura para o front."""
    return XP_POR_RESULTADO[resultado_para(resultado, lado)]


def _nome(jogador: Mapping, padrao: str) -> str:
    return jogador.get("nome") or jogador.get("classe") or padrao


def _narrar(
    jogador_a: Mapping,
    jogador_b: Mapping,
    rodadas: list[dict],
    vitorias_a: int,
    vitorias_b: int,
    resultado: str,
) -> str:
    """Uma frase de resumo pro card e pra tela de resultado."""
    nome_a = _nome(jogador_a, "Desafiante")
    nome_b = _nome(jogador_b, "Oponente")

    if resultado == "empate":
        return (
            f"{nome_a} e {nome_b} trocaram golpes em três frentes e saíram "
            f"{vitorias_a} a {vitorias_b}. A taverna ficou em silêncio."
        )

    if resultado == "a":
        vencedor, perdedor = nome_a, nome_b
        placar, placar_perdedor = vitorias_a, vitorias_b
        lado = "a"
    else:
        vencedor, perdedor = nome_b, nome_a
        placar, placar_perdedor = vitorias_b, vitorias_a
        lado = "b"

    # A rodada decisiva é a de maior diferença entre as que o vencedor levou —
    # é a que rende a melhor frase.
    ganhas = [r for r in rodadas if r["vencedor"] == lado]
    decisiva = max(ganhas, key=lambda r: r["diferenca"])

    intensidade = "dominou" if placar_perdedor == 0 else "levou a melhor sobre"
    return (
        f"{vencedor} {intensidade} {perdedor} por {placar} a {placar_perdedor}, "
        f"decidindo no golpe de {decisiva['rotulo']}."
    )
