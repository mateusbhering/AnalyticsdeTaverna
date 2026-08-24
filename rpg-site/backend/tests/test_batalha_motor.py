"""Testes do motor da batalha posicional (regra pura, sem banco)."""

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


# ── pódio: os 3 maiores de cada um ───────────────────────────────────

def test_podio_traz_os_tres_maiores_em_ordem_decrescente():
    j = jogador(1, forca=1, inteligencia=9, agilidade=2, resistencia=8,
                carisma=3, sabedoria=7, caos=4)
    podio = motor.tres_maiores(j)

    assert [p["atributo"] for p in podio] == ["inteligencia", "resistencia", "sabedoria"]
    assert [p["valor"] for p in podio] == [9, 8, 7]


def test_podio_tem_sempre_tres_posicoes():
    assert len(motor.tres_maiores(jogador(1))) == motor.RODADAS
    assert len(motor.tres_maiores({"id": 1})) == motor.RODADAS


def test_podio_desempata_pela_ordem_fixa_dos_atributos():
    """Todos iguais: o critério é posicional e SEMPRE o mesmo (auditabilidade)."""
    podio = motor.tres_maiores(jogador(1))
    assert [p["atributo"] for p in podio] == list(motor.ATRIBUTOS_BATALHA[:3])
    for _ in range(10):
        assert motor.tres_maiores(jogador(1)) == podio


# ── confronto posicional ─────────────────────────────────────────────

def test_compara_posicao_a_posicao_e_nao_atributo_a_atributo():
    """O 1º maior de A encara o 1º maior de B, ainda que sejam atributos diferentes."""
    a = jogador(1, caos=20, forca=15, sabedoria=12, inteligencia=1,
                agilidade=1, resistencia=1, carisma=1)
    b = jogador(2, inteligencia=18, carisma=16, agilidade=14, forca=1,
                resistencia=1, sabedoria=1, caos=1)

    rodadas = motor.resolver(a, b)["rodadas"]

    assert len(rodadas) == 3
    # posição 1: caos 20 (A) × inteligência 18 (B) → A
    assert (rodadas[0]["atributo_a"], rodadas[0]["valor_a"]) == ("caos", 20)
    assert (rodadas[0]["atributo_b"], rodadas[0]["valor_b"]) == ("inteligencia", 18)
    assert rodadas[0]["resultado"] == "a"
    # posição 2: força 15 (A) × carisma 16 (B) → B
    assert (rodadas[1]["valor_a"], rodadas[1]["valor_b"]) == (15, 16)
    assert rodadas[1]["resultado"] == "b"
    # posição 3: sabedoria 12 (A) × agilidade 14 (B) → B
    assert (rodadas[2]["valor_a"], rodadas[2]["valor_b"]) == (12, 14)
    assert rodadas[2]["resultado"] == "b"


def test_vence_quem_leva_mais_rodadas():
    a = jogador(1, caos=20, forca=15, sabedoria=12, inteligencia=1,
                agilidade=1, resistencia=1, carisma=1)
    b = jogador(2, inteligencia=18, carisma=16, agilidade=14, forca=1,
                resistencia=1, sabedoria=1, caos=1)

    resultado = motor.resolver(a, b)

    assert (resultado["vitorias_a"], resultado["vitorias_b"]) == (1, 2)
    assert resultado["resultado"] == "b"
    assert resultado["vencedor_id"] == 2


def test_placar_das_rodadas_sempre_fecha_em_tres():
    a = jogador(1, forca=9, inteligencia=8, agilidade=7)
    b = jogador(2, carisma=9, sabedoria=5, caos=7)
    r = motor.resolver(a, b)
    assert r["vitorias_a"] + r["vitorias_b"] + r["empates_rodada"] == motor.RODADAS


def test_varrer_todas_as_rodadas_e_vitoria_do_lado_a():
    a = jogador(1, **{atr: 30 for atr in motor.ATRIBUTOS_BATALHA})
    b = jogador(2, **{atr: 1 for atr in motor.ATRIBUTOS_BATALHA})

    resultado = motor.resolver(a, b)

    assert resultado["vitorias_a"] == 3
    assert resultado["resultado"] == "a"
    assert resultado["vencedor_id"] == 1


def test_podios_identicos_dao_empate_sem_vencedor():
    resultado = motor.resolver(jogador(1), jogador(2))

    assert resultado["empates_rodada"] == 3
    assert resultado["resultado"] == "empate"
    assert resultado["vencedor_id"] is None


def test_empate_geral_com_uma_vitoria_para_cada_lado():
    """1 × 1 e uma rodada empatada: ninguém vence a batalha."""
    a = jogador(1, forca=20, inteligencia=10, agilidade=5,
                resistencia=0, carisma=0, sabedoria=0, caos=0)
    b = jogador(2, forca=10, inteligencia=10, agilidade=15,
                resistencia=0, carisma=0, sabedoria=0, caos=0)

    resultado = motor.resolver(a, b)

    # pódio A = 20, 10, 5 | pódio B = 15, 10, 10 → A vence a 1ª, empata a 2ª, perde a 3ª
    assert (resultado["vitorias_a"], resultado["vitorias_b"]) == (1, 1)
    assert resultado["empates_rodada"] == 1
    assert resultado["resultado"] == "empate"
    assert resultado["vencedor_id"] is None


def test_confronto_e_deterministico():
    a = jogador(1, forca=13, caos=13, sabedoria=13)
    b = jogador(2, carisma=13, agilidade=13, inteligencia=13)
    primeiro = motor.resolver(a, b)
    for _ in range(20):
        assert motor.resolver(a, b) == primeiro


def test_inverter_os_lados_inverte_o_resultado():
    a = jogador(1, forca=30, caos=25, sabedoria=20)
    b = jogador(2, carisma=5, agilidade=4, inteligencia=3)

    direto = motor.resolver(a, b)
    invertido = motor.resolver(b, a)

    assert direto["resultado"] == "a" and invertido["resultado"] == "b"
    assert direto["vencedor_id"] == invertido["vencedor_id"] == 1
    assert direto["vitorias_a"] == invertido["vitorias_b"]


# ── XP ───────────────────────────────────────────────────────────────

def test_xp_da_vitoria_e_da_derrota():
    a = jogador(1, **{atr: 30 for atr in motor.ATRIBUTOS_BATALHA})
    b = jogador(2, **{atr: 1 for atr in motor.ATRIBUTOS_BATALHA})

    resultado = motor.resolver(a, b)

    assert (motor.XP_VITORIA, motor.XP_DERROTA) == (30, 5)
    assert resultado["xp_a"] == motor.XP_VITORIA == 30
    assert resultado["xp_b"] == motor.XP_DERROTA == 5


def test_xp_do_empate_e_igual_para_os_dois():
    resultado = motor.resolver(jogador(1), jogador(2))
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

    narrativa = motor.resolver(a, b)["narrativa"]

    assert "Ana" in narrativa and "Beto" in narrativa
    assert "3 a 0" in narrativa


def test_narrativa_do_empate_nao_declara_vencedor():
    narrativa = motor.resolver(jogador(1, nome="Ana"), jogador(2, nome="Beto"))["narrativa"]
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
