"""Testes do motor da batalha (regra pura, sem banco).

Melhor de 3: o desafiante escolhe 3 atributos e cada rodada compara o MESMO
atributo dos dois lados.
"""

from __future__ import annotations

import random

import pytest

from app.domain import batalha as motor


def jogador(id_: int, **campos) -> dict:
    """Jogador com os 7 atributos do card, todos iguais salvo o que o teste mudar."""
    base = {"id": id_, "nome": f"J{id_}", "xp": 0}
    base.update({a: 10 for a in motor.ATRIBUTOS_BATALHA})
    base.update(campos)
    return base


# ── leitura de atributo ──────────────────────────────────────────────

def test_atributo_fora_do_card_e_rejeitado():
    """'estrategia' é dimensão do quiz, não atributo do card."""
    with pytest.raises(motor.AtributoInvalido):
        motor.valor_do_atributo(jogador(1), "estrategia")


def test_jogador_sem_nenhum_valor_vale_zero_em_vez_de_quebrar():
    assert motor.valor_do_atributo({"id": 9}, "carisma") == 0


def test_coluna_nula_vale_zero():
    assert motor.valor_do_atributo(jogador(1, caos=None), "caos") == 0


# ── validação da escolha ─────────────────────────────────────────────

def test_escolha_precisa_ter_exatamente_tres():
    for escolha in ([], ["forca"], ["forca", "caos"], ["forca", "caos", "carisma", "agilidade"]):
        with pytest.raises(motor.EscolhaInvalida, match="exatamente 3"):
            motor.validar_escolha(escolha)


def test_escolha_nao_aceita_repetido():
    """Repetir triplicaria o peso do melhor atributo — vira melhor-de-1."""
    with pytest.raises(motor.EscolhaInvalida, match="duas vezes"):
        motor.validar_escolha(["forca", "forca", "caos"])


def test_escolha_nao_aceita_dimensao_do_quiz():
    """'estrategia' é dimensão do quiz, não atributo do card."""
    with pytest.raises(motor.EscolhaInvalida, match="inválido"):
        motor.validar_escolha(["forca", "estrategia", "caos"])


def test_escolha_valida_passa_e_preserva_a_ordem():
    """A ordem é a que o jogador clicou — é como as rodadas saem na tela."""
    escolha = ["caos", "forca", "sabedoria"]
    assert motor.validar_escolha(escolha) == escolha


def test_os_sete_atributos_do_card_sao_escolhiveis():
    for atributo in motor.ATRIBUTOS_BATALHA:
        outros = [a for a in motor.ATRIBUTOS_BATALHA if a != atributo][:2]
        assert motor.validar_escolha([atributo, *outros])


# ── confronto ────────────────────────────────────────────────────────

TRIO = ["forca", "carisma", "caos"]


def test_cada_rodada_compara_o_mesmo_atributo_dos_dois_lados():
    a = jogador(1, forca=18, carisma=9, caos=21)
    b = jogador(2, forca=12, carisma=14, caos=7)

    rodadas = motor.resolver(a, b, TRIO)["rodadas"]

    assert [r["atributo"] for r in rodadas] == TRIO
    assert [(r["valor_a"], r["valor_b"]) for r in rodadas] == [(18, 12), (9, 14), (21, 7)]
    assert [r["vencedor"] for r in rodadas] == ["a", "b", "a"]


def test_rodadas_saem_na_ordem_escolhida():
    a, b = jogador(1), jogador(2)
    escolha = ["sabedoria", "agilidade", "inteligencia"]
    assert [r["atributo"] for r in motor.resolver(a, b, escolha)["rodadas"]] == escolha


def test_atributos_escolhidos_voltam_no_resultado():
    """O front usa isso para rotular a tela sem refazer a conta."""
    assert motor.resolver(jogador(1), jogador(2), TRIO)["atributos"] == TRIO


def test_vence_quem_leva_mais_rodadas():
    a = jogador(1, forca=18, carisma=9, caos=21)
    b = jogador(2, forca=12, carisma=14, caos=7)

    resultado = motor.resolver(a, b, TRIO)

    assert (resultado["vitorias_a"], resultado["vitorias_b"]) == (2, 1)
    assert resultado["resultado"] == "a"
    assert resultado["vencedor_id"] == 1


def test_placar_das_rodadas_sempre_fecha_em_tres():
    a = jogador(1, forca=9, carisma=8, caos=7)
    b = jogador(2, forca=9, carisma=5, caos=9)
    r = motor.resolver(a, b, TRIO)
    assert r["vitorias_a"] + r["vitorias_b"] + r["empates_rodada"] == motor.RODADAS


def test_varrer_as_tres_rodadas_e_vitoria_do_lado_a():
    a = jogador(1, **{atr: 30 for atr in motor.ATRIBUTOS_BATALHA})
    b = jogador(2, **{atr: 1 for atr in motor.ATRIBUTOS_BATALHA})

    resultado = motor.resolver(a, b, TRIO)

    assert resultado["vitorias_a"] == 3
    assert resultado["resultado"] == "a"
    assert resultado["vencedor_id"] == 1


def test_valores_iguais_dao_empate_sem_vencedor():
    resultado = motor.resolver(jogador(1), jogador(2), TRIO)

    assert resultado["empates_rodada"] == 3
    assert resultado["resultado"] == "empate"
    assert resultado["vencedor_id"] is None


def test_empate_geral_com_uma_vitoria_para_cada_lado():
    """1 × 1 e uma rodada empatada: ninguém vence a batalha."""
    a = jogador(1, forca=20, carisma=10, caos=5)
    b = jogador(2, forca=10, carisma=10, caos=15)

    resultado = motor.resolver(a, b, TRIO)

    assert (resultado["vitorias_a"], resultado["vitorias_b"]) == (1, 1)
    assert resultado["empates_rodada"] == 1
    assert resultado["resultado"] == "empate"
    assert resultado["vencedor_id"] is None


def test_escolher_onde_se_e_forte_muda_o_resultado():
    """O ponto do jogo: a mesma dupla, escolhas diferentes, vencedores opostos."""
    a = jogador(1, forca=30, carisma=1, caos=30, inteligencia=1, agilidade=1,
                resistencia=1, sabedoria=1)
    b = jogador(2, forca=1, carisma=30, caos=1, inteligencia=30, agilidade=30,
                resistencia=30, sabedoria=30)

    assert motor.resolver(a, b, ["forca", "caos", "carisma"])["resultado"] == "a"
    assert motor.resolver(a, b, ["carisma", "inteligencia", "agilidade"])["resultado"] == "b"


def test_confronto_e_deterministico():
    a = jogador(1, forca=13, caos=13, carisma=13)
    b = jogador(2, forca=12, caos=14, carisma=13)
    primeiro = motor.resolver(a, b, TRIO)
    for _ in range(20):
        assert motor.resolver(a, b, TRIO) == primeiro


def test_inverter_os_lados_inverte_o_resultado():
    a = jogador(1, forca=30, carisma=25, caos=20)
    b = jogador(2, forca=5, carisma=4, caos=3)

    direto = motor.resolver(a, b, TRIO)
    invertido = motor.resolver(b, a, TRIO)

    assert direto["resultado"] == "a" and invertido["resultado"] == "b"
    assert direto["vencedor_id"] == invertido["vencedor_id"] == 1
    assert direto["vitorias_a"] == invertido["vitorias_b"]


def test_resolver_rejeita_escolha_invalida():
    with pytest.raises(motor.EscolhaInvalida):
        motor.resolver(jogador(1), jogador(2), ["forca", "forca", "caos"])


# ── XP ───────────────────────────────────────────────────────────────

def test_xp_da_vitoria_e_da_derrota():
    a = jogador(1, **{atr: 30 for atr in motor.ATRIBUTOS_BATALHA})
    b = jogador(2, **{atr: 1 for atr in motor.ATRIBUTOS_BATALHA})

    resultado = motor.resolver(a, b, TRIO)

    assert (motor.XP_VITORIA, motor.XP_DERROTA) == (30, 5)
    assert resultado["xp_a"] == motor.XP_VITORIA == 30
    assert resultado["xp_b"] == motor.XP_DERROTA == 5


def test_xp_do_empate_e_igual_para_os_dois():
    resultado = motor.resolver(jogador(1), jogador(2), TRIO)
    assert motor.XP_EMPATE == 15
    assert resultado["xp_a"] == resultado["xp_b"] == motor.XP_EMPATE


def test_derrota_nunca_da_zero_xp():
    """Design de gamificação: quem perde precisa de motivo pra jogar de novo."""
    assert motor.XP_DERROTA > 0


def test_xp_de_traduz_o_ponto_de_vista_do_lado():
    assert motor.xp_de("a", "a") == motor.XP_VITORIA
    assert motor.xp_de("a", "b") == motor.XP_DERROTA
    assert motor.xp_de("empate", "a") == motor.XP_EMPATE


def test_resultado_para_traduz_o_ponto_de_vista():
    assert motor.resultado_para("a", "a") == "vitoria"
    assert motor.resultado_para("a", "b") == "derrota"
    assert motor.resultado_para("empate", "a") == "empate"


# ── narrativa ────────────────────────────────────────────────────────

def test_narrativa_menciona_os_dois_jogadores_e_o_placar():
    a = jogador(1, nome="Ana", **{atr: 30 for atr in motor.ATRIBUTOS_BATALHA})
    b = jogador(2, nome="Beto", **{atr: 1 for atr in motor.ATRIBUTOS_BATALHA})

    narrativa = motor.resolver(a, b, TRIO)["narrativa"]

    assert "Ana" in narrativa and "Beto" in narrativa
    assert "3 a 0" in narrativa


def test_narrativa_do_empate_nao_declara_vencedor():
    narrativa = motor.resolver(jogador(1, nome="Ana"), jogador(2, nome="Beto"), TRIO)["narrativa"]
    assert "dominou" not in narrativa and "levou a melhor" not in narrativa


# ── pareamento ───────────────────────────────────────────────────────

def test_pareamento_escolhe_o_xp_mais_proximo():
    eu = jogador(1, xp=100)
    candidatos = [jogador(2, xp=10), jogador(3, xp=95), jogador(4, xp=500)]
    assert motor.parear(eu, candidatos)["id"] == 3


def test_pareamento_nunca_devolve_o_proprio_jogador():
    eu = jogador(1, xp=50)
    assert motor.parear(eu, [jogador(1, xp=50)]) is None


def test_pareamento_sem_candidatos_devolve_none():
    """Primeiro jogador cadastrado: não há com quem batalhar ainda."""
    assert motor.parear(jogador(1), []) is None


def test_pareamento_sorteia_entre_empatados():
    """Dois adversários igualmente próximos: não pode cair sempre no mesmo."""
    eu = jogador(1, xp=100)
    candidatos = [jogador(2, xp=90), jogador(3, xp=110)]
    sorteados = {motor.parear(eu, candidatos, random.Random(s))["id"] for s in range(30)}
    assert sorteados == {2, 3}
