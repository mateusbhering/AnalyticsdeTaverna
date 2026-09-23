"""Testes da ferramenta de validação estatística em `analysis/`.

Cobre só a mecânica (carregamento do banco de perguntas, uma partida
simulada, alinhamento das tabelas observado/esperado) — não os números
específicos da simulação de 300 mil partidas, que é determinística por seed
mas cara demais pra rodar em todo `pytest`. Não precisa de scipy instalado:
`chisquare` só é importado dentro de `main()`, lazy, então esses testes
seguem rodando mesmo sem `requirements-analysis.txt`.
"""

from __future__ import annotations

import random
from collections import Counter

from analysis.simular_calibracao import carregar_perguntas, simular_uma_partida
from analysis.validar_classes import montar_tabelas
from app.domain.personagem import FALLBACK_POR_DIMENSAO, REGRAS_CLASSE

CLASSES_VALIDAS = {nome for nome, *_ in REGRAS_CLASSE} | {
    nome for nome, _ in FALLBACK_POR_DIMENSAO.values()
}


def test_carrega_120_perguntas_com_4_opcoes():
    perguntas = carregar_perguntas()
    assert len(perguntas) == 120
    assert all(len(p["options"]) == 4 for p in perguntas)


def test_uma_partida_simulada_devolve_classe_valida():
    perguntas = carregar_perguntas()
    rng = random.Random(1)
    for _ in range(50):
        resultado = simular_uma_partida(perguntas, rng)
        assert resultado["classe"] in CLASSES_VALIDAS
        assert resultado["origem"] in ("regra", "dimensao_dominante")


def test_partida_e_deterministica_pra_mesma_seed():
    perguntas = carregar_perguntas()
    a = simular_uma_partida(perguntas, random.Random(7))
    b = simular_uma_partida(perguntas, random.Random(7))
    assert a == b


def test_montar_tabelas_alinha_categorias_e_soma_bate():
    observado = Counter({"Mago do ChatGPT": 30, "Domador de Pet": 20})
    proporcao_nula = {"Mago do ChatGPT": 0.5, "Domador de Pet": 0.3, "Bardo do Karaokê": 0.2}

    classes, f_obs, f_exp = montar_tabelas(observado, proporcao_nula)

    assert set(classes) == {"Mago do ChatGPT", "Domador de Pet", "Bardo do Karaokê"}
    assert sum(f_obs) == 50
    # scipy.chisquare exige que as somas batam quase exatamente.
    assert abs(sum(f_exp) - sum(f_obs)) < 1e-6
    # Classe nunca observada entra com f_obs=0, não desaparece da tabela.
    idx = classes.index("Bardo do Karaokê")
    assert f_obs[idx] == 0
    assert f_exp[idx] > 0
