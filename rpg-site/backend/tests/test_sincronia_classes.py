"""Trava de sincronia: o motor Python precisa concordar com o TypeScript.

O front classifica na hora de mostrar o card (`determineClass` em
`src/components/CharacterResult.tsx`) e o backend classifica ao cadastrar. Se
os dois divergirem, o MESMO quiz vira duas classes diferentes dependendo de
quem respondeu — e o card compartilhado por link contradiz o do jogador.

`fixture_classes_ts.json` foi gerado rodando o TypeScript de verdade (extraído
do componente e executado no Node) sobre 200 mil quizzes aleatórios; o backend
bateu 100% deles. O arquivo guarda uma amostra estratificada: as 16 regras e os
três caminhos do fallback (dominante única, desempate por afinidade de tag e
desempate por hash).

Se um destes testes quebrar, foi mudança de regra em UM dos lados só. Ajuste o
outro e regenere a fixture — não relaxe a asserção.
"""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

import pytest

from app.domain.personagem import (
    DIMENSOES,
    FALLBACK_POR_DIMENSAO,
    REGRAS_CLASSE,
    _metade_arredondada,
    calcular_atributos,
    classificar,
    hash_estado,
)

FIXTURE = json.loads(
    (Path(__file__).parent / "fixture_classes_ts.json").read_text(encoding="utf-8")
)

FIXTURE_ATRIBUTOS = json.loads(
    (Path(__file__).parent / "fixture_atributos_ts.json").read_text(encoding="utf-8")
)


@pytest.mark.parametrize(
    "caso", FIXTURE, ids=[f"caso{i:03d}" for i in range(len(FIXTURE))]
)
def test_classe_bate_com_o_typescript(caso):
    assert classificar(caso["dims"], caso["tags"])["classe"] == caso["classe"]


def test_fixture_cobre_todas_as_regras_e_os_desempates():
    """Guarda contra alguém regenerar a fixture com uma amostra pobre."""
    classes = Counter(c["classe"] for c in FIXTURE)
    origens = Counter(classificar(c["dims"], c["tags"])["origem"] for c in FIXTURE)

    assert len(FIXTURE) >= 200
    assert len(classes) == 16, "as 16 classes precisam aparecer"
    assert origens["regra"] >= 50
    assert origens["dimensao_dominante"] >= 100


# ── o hash de desempate ──────────────────────────────────────────────

def test_hash_estado_e_o_fnv1a_do_typescript():
    """Valores conferidos contra o `hashState` do TS rodando no Node."""
    assert hash_estado("") == 1947474976
    assert hash_estado("0,0,0,0,0,0,0,0,0,0|") == 1835264984


def test_hash_estado_cabe_em_32_bits():
    for texto in ("", "a", "LÍDER,ZEN", "1,2,3,4,5,6,7,8,9,10|NERD"):
        assert 0 <= hash_estado(texto) <= 0xFFFFFFFF


def test_hash_estado_lida_com_tags_acentuadas():
    """LÍDER, TECNOLÓGICO e CAÓTICO passam pelo hash sem divergir do JS.

    `charCodeAt` devolve unidades UTF-16 e `ord` devolve code points — iguais
    em todo o BMP, que é onde essas tags vivem.
    """
    assert hash_estado("TECNOLÓGICO") == 401634824
    assert hash_estado("LÍDER") == 2120431850
    assert hash_estado("CAÓTICO") == 1954843015


# ── invariantes das regras ───────────────────────────────────────────

def test_toda_regra_aponta_para_uma_dimensao_conhecida():
    for _, dimensao, *_ in REGRAS_CLASSE:
        assert dimensao in DIMENSOES


def test_fallback_cobre_exatamente_as_dez_dimensoes():
    assert tuple(FALLBACK_POR_DIMENSAO) == DIMENSOES


def test_toda_classe_do_fallback_tem_regra_propria():
    """Se a classe existe no fallback, ela precisa ser alcançável por regra também."""
    por_regra = {regra[0] for regra in REGRAS_CLASSE}
    for nome, _ in FALLBACK_POR_DIMENSAO.values():
        assert nome in por_regra


def test_classificar_e_deterministico():
    dims = {"lideranca": 3, "estrategia": 3, "criatividade": 3}
    tags = ["ZEN", "NERD", "LÍDER"]
    primeiro = classificar(dims, tags)
    for _ in range(50):
        assert classificar(dims, tags) == primeiro


def test_quiz_vazio_ainda_devolve_uma_classe():
    """Todas as dimensões em 0 empatam as 10 — o desempate precisa resolver."""
    resultado = classificar({}, [])
    assert resultado["classe"]
    assert resultado["origem"] == "dimensao_dominante"


# ── atributos: a mesma trava, para `calcAttributes` ──────────────────
#
# Os 7 atributos do card também são calculados dos dois lados, e também
# divergiam: `round` do Python arredonda para o par mais próximo, `Math.round`
# do JS arredonda o meio para cima. Força e agilidade somam metade da
# impulsividade, então davam valores diferentes sempre que ela caía em
# {1, 5, 9, 13, 17}. A fixture veio do `calcAttributes` real do componente.


@pytest.mark.parametrize(
    "caso", FIXTURE_ATRIBUTOS, ids=[f"attr{i:04d}" for i in range(len(FIXTURE_ATRIBUTOS))]
)
def test_atributos_batem_com_o_typescript(caso):
    assert calcular_atributos(caso["dims"]) == caso["attrs"]


def test_metade_da_impulsividade_arredonda_o_meio_para_cima():
    """O caso exato que divergia. `round` embutido daria 0, 2 e 4 aqui."""
    assert [_metade_arredondada(i) for i in (1, 5, 9)] == [1, 3, 5]


def test_fixture_de_atributos_cobre_os_impares_problematicos():
    """Guarda contra alguém regenerar a fixture sem os casos que pegam o bug."""
    impares = {c["dims"]["impulsividade"] for c in FIXTURE_ATRIBUTOS}
    assert {1, 5, 9, 13, 17} <= impares
