"""Testes do motor de geração de personagem.

Regra de ouro: teste o COMPORTAMENTO ("mesma entrada → mesma saída"), não a
implementação. Assim, se alguém refatorar o código sem mudar as regras, os
testes continuam passando.
"""

from __future__ import annotations

from app.domain.personagem import (
    ATRIBUTOS,
    DIMENSOES,
    calcular_atributos,
    classificar,
    gerar_personagem,
    normalizar_dimensoes,
)


def test_normalizar_preenche_dimensoes_faltantes_com_zero():
    dims = normalizar_dimensoes({"estrategia": 5})
    assert set(dims) == set(DIMENSOES)
    assert dims["estrategia"] == 5
    assert dims["carisma" if "carisma" in dims else "empatia"] == 0


def test_normalizar_nunca_devolve_negativo():
    assert normalizar_dimensoes({"empatia": -7})["empatia"] == 0


def test_atributos_seguem_a_formula_do_projeto():
    dims = {
        "persistencia": 4,
        "lideranca": 3,
        "impulsividade": 5,   # metade arredondada = 3 (meio para cima, como o JS)
        "estrategia": 6,
        "percepcao": 2,
        "adaptabilidade": 1,
        "disciplina": 7,
        "sociabilidade": 8,
        "empatia": 9,
        "criatividade": 3,
    }
    attrs = calcular_atributos(dims)

    assert set(attrs) == set(ATRIBUTOS)
    assert attrs["forca"] == 4 + 3 + 3
    assert attrs["inteligencia"] == 6 + 2
    assert attrs["carisma"] == 8 + 3
    assert attrs["caos"] == 3 + 5


def test_e_deterministico():
    """O mesmo quiz precisa gerar sempre o mesmo personagem."""
    dims = {"estrategia": 16, "percepcao": 4}
    tags = ["TECNOLÓGICO"] * 3 + ["NERD"] * 2

    primeiro = gerar_personagem(dims, tags)
    for _ in range(20):
        assert gerar_personagem(dims, tags) == primeiro


def test_regra_especifica_tem_prioridade_sobre_o_fallback():
    resultado = classificar(
        {"estrategia": 16},
        ["TECNOLÓGICO", "TECNOLÓGICO", "TECNOLÓGICO", "NERD", "NERD"],
    )
    assert resultado["classe"] == "Mago do ChatGPT"
    assert resultado["origem"] == "regra"


def test_sem_tags_cai_na_dimensao_dominante():
    """Cenário comum: quiz de 5 perguntas raramente satisfaz uma regra."""
    resultado = classificar({"criatividade": 9, "disciplina": 2}, [])
    assert resultado["origem"] == "dimensao_dominante"
    assert resultado["classe"] == "Artífice da Gambiarra"


def test_quiz_totalmente_zerado_ainda_devolve_uma_classe():
    """Nunca pode sobrar jogador sem classe — quebraria o card e o dashboard."""
    personagem = gerar_personagem({}, [])
    assert personagem["classe"]
    assert all(v == 0 for v in personagem["atributos"].values())
