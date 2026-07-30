"""Testes do motor da batalha (regra pura, sem banco)."""

from __future__ import annotations

import random

import pytest

from app.domain import batalha as motor


def jogador(id_: int, **campos) -> dict:
    base = {
        "id": id_,
        "nome": f"J{id_}",
        "xp": 0,
        "inteligencia": 10,
        "carisma": 10,
        "estrategia": 10,
        "criatividade": 10,
        "caos": 10,
    }
    base.update(campos)
    return base


# ── valor do atributo ────────────────────────────────────────────────

def test_atributo_invalido_e_rejeitado():
    with pytest.raises(motor.AtributoInvalido):
        motor.valor_do_atributo(jogador(1), "forca")


def test_usa_a_coluna_de_reserva_quando_a_dimensao_nao_foi_salva():
    """Jogador cadastrado antes do schema novo não tem `criatividade`."""
    antigo = jogador(1, criatividade=None, caos=42)
    assert motor.valor_do_atributo(antigo, "criatividade") == 42


def test_jogador_sem_nenhum_valor_vale_zero_em_vez_de_quebrar():
    assert motor.valor_do_atributo({"id": 9}, "carisma") == 0


# ── resolução do confronto ───────────────────────────────────────────

def test_maior_atributo_vence():
    resultado = motor.resolver(jogador(1, carisma=20), jogador(2, carisma=5), "carisma")
    assert resultado["resultado"] == "a"
    assert resultado["vencedor_id"] == 1
    assert resultado["xp_a"] == motor.XP_VITORIA
    assert resultado["xp_b"] == motor.XP_DERROTA


def test_lado_b_tambem_pode_vencer():
    resultado = motor.resolver(jogador(1, estrategia=1), jogador(2, estrategia=30), "estrategia")
    assert resultado["resultado"] == "b"
    assert resultado["vencedor_id"] == 2


def test_valores_iguais_dao_empate_sem_vencedor():
    resultado = motor.resolver(jogador(1, inteligencia=7), jogador(2, inteligencia=7), "inteligencia")
    assert resultado["resultado"] == "empate"
    assert resultado["vencedor_id"] is None
    assert resultado["xp_a"] == resultado["xp_b"] == motor.XP_EMPATE


def test_narrativa_menciona_os_dois_jogadores():
    resultado = motor.resolver(
        jogador(1, nome="Ana", carisma=20), jogador(2, nome="Beto", carisma=5), "carisma"
    )
    assert "Ana" in resultado["narrativa"] and "Beto" in resultado["narrativa"]


def test_resultado_para_traduz_o_ponto_de_vista():
    assert motor.resultado_para("a", "a") == "vitoria"
    assert motor.resultado_para("a", "b") == "derrota"
    assert motor.resultado_para("empate", "a") == "empate"


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
