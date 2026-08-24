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
# Espelho fiel de `determineClass` em `src/components/CharacterResult.tsx`.
# As duas implementações PRECISAM concordar: o front classifica na hora de
# mostrar o card e o backend classifica ao cadastrar/recalcular. Se divergirem,
# o mesmo quiz vira duas classes diferentes dependendo de quem respondeu.
#
# Forma de cada regra — `dim >= min_dim and tc(a) >= 1 and tc(a) + tc(b) >= min_soma`:
# a tag-assinatura da classe é obrigatória e a segunda tag *soma* afinidade.
# Exigir as duas simultaneamente é inviável num quiz de 5 respostas.
#
# Os limiares foram calibrados por simulação contra o banco real de perguntas
# (300 mil partidas): cada regra captura de 2,4% a 7,7% dos jogadores e 73% do
# total é classificado por regra. Mexer nas perguntas muda essa distribuição —
# recalibre nos DOIS lados se editar o banco.
# ─────────────────────────────────────────────────────────────────────────────

# (classe, dimensão, mínimo da dimensão, tag-assinatura, tag de apoio, mínimo da soma)
# A ORDEM É A PRIORIDADE. Classes raras primeiro: as que dividem uma tag com
# outra (ANSIOSO, FURTIVO, DOPAMINA…) precisam escolher antes de a genérica
# levar tudo.
REGRAS_CLASSE: tuple[tuple[str, str, int, str, str, int], ...] = (
    ("Mago do ChatGPT",           "estrategia",     4, "TECNOLÓGICO",    "NERD",           1),
    ("Ninja do Visto por Último", "adaptabilidade", 4, "FURTIVO",        "PROCRASTINADOR", 1),
    ("Berserker do Crossfit",     "impulsividade",  3, "ATLETA",         "DOPAMINA",       1),
    ("Ladino do Home Office",     "adaptabilidade", 3, "INTROVERTIDO",   "FURTIVO",        1),
    ("Invocador de iFood",        "impulsividade",  3, "DOPAMINA",       "PROCRASTINADOR", 1),
    ("Bardo do Karaokê",          "sociabilidade",  3, "EXTROVERTIDO",   "DOPAMINA",       1),
    ("Ilusionista de Call",       "sociabilidade",  2, "MALANDRO",       "EXTROVERTIDO",   1),
    ("Paladino do Grupo",         "lideranca",      3, "LÍDER",          "JUSTICEIRO",     1),
    ("Warlock do Boleto",         "persistencia",   2, "ANSIOSO",        "RESOLUTIVO",     1),
    ("Vidente da Ansiedade",      "percepcao",      2, "ANSIOSO",        "OVERTHINKING",   1),
    ("Xamã das Criptomoedas",     "estrategia",     3, "CAÓTICO",        "MALANDRO",       1),
    ("Necromante de Planilha",    "disciplina",     3, "PERFECCIONISTA", "NERD",           2),
    ("Artífice da Gambiarra",     "criatividade",   2, "GAMBIARRA",      "RESOLUTIVO",     2),
    ("Domador de Pet",            "empatia",        2, "CURADOR",        "ZEN",            2),
    ("Druida de Varanda",         "empatia",        2, "ZEN",            "INTROVERTIDO",   2),
    ("Ranger da Faxina",          "disciplina",     3, "ZEN",            "RESOLUTIVO",     1),
)

# Fallback: classe de cada dimensão quando nenhuma regra bate, junto das tags
# que aquela classe usa na sua regra — elas desempatam dimensões empatadas no
# topo. A ordem das chaves é a de DIMENSOES e faz parte do contrato do hash.
FALLBACK_POR_DIMENSAO: dict[str, tuple[str, tuple[str, str]]] = {
    "lideranca":      ("Paladino do Grupo",      ("LÍDER", "JUSTICEIRO")),
    "estrategia":     ("Mago do ChatGPT",        ("TECNOLÓGICO", "NERD")),
    "disciplina":     ("Necromante de Planilha", ("PERFECCIONISTA", "NERD")),
    "persistencia":   ("Warlock do Boleto",      ("ANSIOSO", "RESOLUTIVO")),
    "sociabilidade":  ("Bardo do Karaokê",       ("EXTROVERTIDO", "DOPAMINA")),
    "empatia":        ("Domador de Pet",         ("CURADOR", "ZEN")),
    "adaptabilidade": ("Ladino do Home Office",  ("INTROVERTIDO", "FURTIVO")),
    "criatividade":   ("Artífice da Gambiarra",  ("GAMBIARRA", "RESOLUTIVO")),
    "impulsividade":  ("Invocador de iFood",     ("DOPAMINA", "PROCRASTINADOR")),
    "percepcao":      ("Vidente da Ansiedade",   ("ANSIOSO", "OVERTHINKING")),
}

# Mantido para quem só precisa do nome (catálogo de classes, filtros do front).
CLASSE_POR_DIMENSAO: dict[str, str] = {
    dim: nome for dim, (nome, _) in FALLBACK_POR_DIMENSAO.items()
}

_MASCARA_32 = 0xFFFFFFFF


def hash_estado(texto: str) -> int:
    """FNV-1a 32 bits + avalanche — porte exato do `hashState` do TypeScript.

    Serve só para desempatar de forma estável: a mesma partida precisa render
    sempre a mesma classe (o card é compartilhado por link), então sortear aqui
    não serve.

    A avalanche no fim protege o consumo como `hash % n`, que lê os bits baixos
    — os mais fracos do FNV-1a, já que multiplicar por uma constante ímpar
    preserva o bit menos significativo.

    O `charCodeAt` do JS devolve unidades UTF-16 e o `ord` do Python devolve
    code points: os valores coincidem para todo o BMP, que cobre as tags
    acentuadas do quiz (LÍDER, TECNOLÓGICO, CAÓTICO).
    """
    h = 0x811C9DC5
    for caractere in texto:
        h ^= ord(caractere)
        h = (h * 0x01000193) & _MASCARA_32
    h ^= h >> 16
    h = (h * 0x7FEB352D) & _MASCARA_32
    h ^= h >> 15
    h = (h * 0x846CA68B) & _MASCARA_32
    h ^= h >> 16
    return h


def classificar(dims: Mapping[str, int], tags: Iterable[str] | None = None) -> dict:
    """Devolve a classe do jogador e COMO ela foi decidida.

    O campo `origem` ('regra' ou 'dimensao_dominante') existe para o dashboard
    e para a banca: dá pra mostrar quantos resultados vieram de uma regra
    específica e quantos caíram no fallback.
    """
    d = normalizar_dimensoes(dims)
    lista_tags = [t for t in (tags or []) if t]
    contagem = Counter(lista_tags)

    def tc(tag: str) -> int:
        return contagem[tag]

    for nome, dimensao, min_dim, tag_a, tag_b, min_soma in REGRAS_CLASSE:
        if d[dimensao] >= min_dim and tc(tag_a) >= 1 and tc(tag_a) + tc(tag_b) >= min_soma:
            return {"classe": nome, "origem": "regra", "regra": nome}

    # Nenhuma regra bateu: a classe vem da dimensão dominante.
    maior = max(d[k] for k in DIMENSOES)
    empatadas = [k for k in DIMENSOES if d[k] == maior]

    # ~28% das partidas empatam no topo, então o desempate decide muita coisa.
    # Pegar a primeira da lista faria a posição valer como critério: `lideranca`
    # ganharia 100% dos empates de que participa e `percepcao`, 0%.
    # Critério 1 — afinidade com as tags da classe candidata.
    if len(empatadas) > 1:
        def afinidade(k: str) -> int:
            return sum(tc(t) for t in FALLBACK_POR_DIMENSAO[k][1])

        topo = max(afinidade(k) for k in empatadas)
        empatadas = [k for k in empatadas if afinidade(k) == topo]

    # Critério 2 — hash do estado. Continua determinístico (a mesma partida
    # sempre dá a mesma classe), mas nenhuma dimensão é favorecida pela posição.
    if len(empatadas) == 1:
        dominante = empatadas[0]
    else:
        semente = (
            ",".join(str(d[k]) for k in DIMENSOES) + "|" + ",".join(sorted(lista_tags))
        )
        dominante = empatadas[hash_estado(semente) % len(empatadas)]

    return {
        "classe": FALLBACK_POR_DIMENSAO[dominante][0],
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
