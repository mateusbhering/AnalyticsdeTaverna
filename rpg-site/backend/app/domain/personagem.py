"""Motor de geração de personagem — atributos e classificação.

Regras determinísticas: as MESMAS respostas sempre produzem o MESMO
personagem. Isso é exigência do projeto ("modelo determinístico para
transparência") e é o que torna o resultado defensável numa banca.

Este módulo é PURO: não conhece FastAPI, não conhece banco, não faz I/O.
Só recebe números e devolve números. Por isso dá pra testar sem subir nada.

A lógica é a mesma de `src/components/CharacterResult.tsx` (frontend), agora
com o backend como fonte da verdade.
"""

from __future__ import annotations

from collections import Counter
from typing import Iterable, Mapping

# As 10 dimensões comportamentais medidas pelo quiz.
DIMENSOES: tuple[str, ...] = (
    "lideranca",
    "estrategia",
    "disciplina",
    "persistencia",
    "sociabilidade",
    "empatia",
    "adaptabilidade",
    "criatividade",
    "impulsividade",
    "percepcao",
)

# Os 7 atributos exibidos no card.
ATRIBUTOS: tuple[str, ...] = (
    "forca",
    "inteligencia",
    "agilidade",
    "resistencia",
    "carisma",
    "sabedoria",
    "caos",
)


def normalizar_dimensoes(dims: Mapping[str, int] | None) -> dict[str, int]:
    """Garante as 10 chaves, sem negativos, sem chave estranha.

    Nunca confie no que chega do frontend: se faltar uma dimensão, ela vira 0.
    """
    dims = dims or {}
    return {d: max(0, int(dims.get(d, 0) or 0)) for d in DIMENSOES}


def calcular_atributos(dims: Mapping[str, int]) -> dict[str, int]:
    """Converte as 10 dimensões do quiz nos 7 atributos do card."""
    d = normalizar_dimensoes(dims)
    meia_impulsividade = round(d["impulsividade"] * 0.5)

    return {
        "forca": d["persistencia"] + d["lideranca"] + meia_impulsividade,
        "inteligencia": d["estrategia"] + d["percepcao"],
        "agilidade": d["adaptabilidade"] + meia_impulsividade,
        "resistencia": d["disciplina"] + d["persistencia"],
        "carisma": d["sociabilidade"] + d["lideranca"],
        "sabedoria": d["empatia"] + d["percepcao"],
        "caos": d["criatividade"] + d["impulsividade"],
    }


# ─────────────────────────────────────────────────────────────────────────────
# Classificação em classes
#
# Cada regra é (nome_da_classe, condição). A condição recebe as dimensões (d)
# e um contador de tags (tc) e devolve True/False. A ORDEM IMPORTA: vale a
# primeira regra que bater — as mais específicas vêm antes.
# ─────────────────────────────────────────────────────────────────────────────

REGRAS_CLASSE: tuple[tuple[str, object], ...] = (
    ("Mago do ChatGPT",
     lambda d, tc: d["estrategia"] >= 15 and tc("TECNOLÓGICO") >= 3 and tc("NERD") >= 2),
    ("Ninja do Visto por Último",
     lambda d, tc: d["adaptabilidade"] >= 12 and tc("FURTIVO") >= 3 and tc("PROCRASTINADOR") >= 2),
    ("Berserker do Crossfit",
     lambda d, tc: d["impulsividade"] >= 14 and tc("ATLETA") >= 3 and tc("DOPAMINA") >= 2),
    ("Necromante de Planilha",
     lambda d, tc: d["disciplina"] >= 15 and tc("PERFECCIONISTA") >= 3 and tc("NERD") >= 2),
    ("Ladino do Home Office",
     lambda d, tc: d["adaptabilidade"] >= 13 and tc("FURTIVO") >= 2
     and tc("PROCRASTINADOR") >= 2 and d["sociabilidade"] < 10),
    ("Warlock do Boleto",
     lambda d, tc: d["persistencia"] >= 14 and tc("ANSIOSO") >= 3 and tc("RESOLUTIVO") >= 2),
    ("Ilusionista de Call",
     lambda d, tc: d["sociabilidade"] >= 14 and tc("EXTROVERTIDO") >= 3 and tc("MALANDRO") >= 2),
    ("Artífice da Gambiarra",
     lambda d, tc: d["criatividade"] >= 15 and tc("GAMBIARRA") >= 3 and tc("RESOLUTIVO") >= 2),
    ("Invocador de iFood",
     lambda d, tc: d["impulsividade"] >= 12 and tc("DOPAMINA") >= 3 and tc("PROCRASTINADOR") >= 2),
    ("Druida de Varanda",
     lambda d, tc: d["empatia"] >= 14 and tc("ZEN") >= 3 and tc("INTROVERTIDO") >= 2),
    ("Ranger da Faxina",
     lambda d, tc: d["disciplina"] >= 14 and tc("ZEN") >= 2 and tc("RESOLUTIVO") >= 3),
    ("Bardo do Karaokê",
     lambda d, tc: d["sociabilidade"] >= 15 and tc("EXTROVERTIDO") >= 3 and tc("DOPAMINA") >= 2),
    ("Xamã das Criptomoedas",
     lambda d, tc: d["estrategia"] >= 12 and tc("CAÓTICO") >= 3 and tc("MALANDRO") >= 2),
    ("Vidente da Ansiedade",
     lambda d, tc: d["percepcao"] >= 15 and tc("ANSIOSO") >= 4 and tc("OVERTHINKING") >= 3),
    ("Paladino do Grupo",
     lambda d, tc: d["lideranca"] >= 15 and tc("LÍDER") >= 3 and tc("JUSTICEIRO") >= 2),
    ("Domador de Pet",
     lambda d, tc: d["empatia"] >= 13 and tc("CURADOR") >= 3 and tc("ZEN") >= 2),
)

# Fallback: com só 5 perguntas é comum nenhuma regra bater. Aí a dimensão mais
# alta decide a classe.
CLASSE_POR_DIMENSAO: dict[str, str] = {
    "lideranca": "Paladino do Grupo",
    "estrategia": "Mago do ChatGPT",
    "disciplina": "Necromante de Planilha",
    "persistencia": "Warlock do Boleto",
    "sociabilidade": "Bardo do Karaokê",
    "empatia": "Domador de Pet",
    "adaptabilidade": "Ladino do Home Office",
    "criatividade": "Artífice da Gambiarra",
    "impulsividade": "Invocador de iFood",
    "percepcao": "Vidente da Ansiedade",
}


def classificar(dims: Mapping[str, int], tags: Iterable[str] | None = None) -> dict:
    """Devolve a classe do jogador e COMO ela foi decidida.

    O campo `origem` ('regra' ou 'dimensao_dominante') existe para o dashboard
    e para a banca: dá pra mostrar quantos resultados vieram de uma regra
    específica e quantos caíram no fallback.
    """
    d = normalizar_dimensoes(dims)
    contagem = Counter(t for t in (tags or []) if t)

    def tc(tag: str) -> int:
        return contagem[tag]

    for nome, condicao in REGRAS_CLASSE:
        if condicao(d, tc):
            return {"classe": nome, "origem": "regra", "regra": nome}

    # Empate na dimensão dominante? `max` com key resolve pela ordem de
    # DIMENSOES, que é fixa — mantém o determinismo.
    dominante = max(DIMENSOES, key=lambda k: d[k])
    return {
        "classe": CLASSE_POR_DIMENSAO[dominante],
        "origem": "dimensao_dominante",
        "regra": None,
        "dimensao_dominante": dominante,
    }


def gerar_personagem(dims: Mapping[str, int], tags: Iterable[str] | None = None) -> dict:
    """Pipeline completo: dimensões do quiz → atributos + classe."""
    dimensoes = normalizar_dimensoes(dims)
    atributos = calcular_atributos(dimensoes)
    resultado = classificar(dimensoes, tags)

    return {
        "classe": resultado["classe"],
        "origem_classificacao": resultado["origem"],
        "atributos": atributos,
        "dimensoes": dimensoes,
    }
