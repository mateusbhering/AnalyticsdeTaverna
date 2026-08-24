"""Banco atrasado em relação ao `sql/schema.sql`: a batalha ainda tem de entrar.

Cenário real: `rodadas` (jsonb) foi adicionada ao schema mas a migração não
rodou no Supabase. O insert inteiro falhava com "column batalhas.rodadas does
not exist", o duelo devolvia 500 e NENHUMA batalha era gravada — mesmo com o
resultado já calculado e com as colunas antigas dando conta do placar.
"""

from __future__ import annotations

import logging

import pytest

from app.repo import SupabaseRepo, _coluna_ausente


class ErroPostgrest(Exception):
    """Imita o que o supabase-py levanta (o tipo muda conforme a versão)."""


class ClientFalso:
    """Recusa o insert enquanto vier a coluna que o banco não tem."""

    def __init__(self, colunas_ausentes: set[str], mensagem: str | None = None):
        self.colunas_ausentes = colunas_ausentes
        self.mensagem = mensagem
        self.tentativas: list[dict] = []

    def table(self, _nome):
        return self

    def insert(self, payload: dict):
        self.tentativas.append(payload)
        self._payload = payload
        return self

    def execute(self):
        faltando = self.colunas_ausentes & set(self._payload)
        if faltando:
            coluna = sorted(faltando)[0]
            raise ErroPostgrest(
                self.mensagem or f"column batalhas.{coluna} does not exist"
            )
        return type("Resposta", (), {"data": [{"id": 1, **self._payload}]})()


DADOS = {
    "jogador_a_id": 1,
    "jogador_b_id": 2,
    "atributo": "posicional",
    "valor_a": 2,
    "valor_b": 1,
    "rodadas": [{"posicao": 1}],
    "resultado": "a",
    "vencedor_id": 1,
    "xp_a": 30,
    "xp_b": 5,
}


async def test_grava_sem_rodadas_quando_a_coluna_nao_existe(caplog):
    cliente = ClientFalso({"rodadas"})
    repo = SupabaseRepo(cliente)

    with caplog.at_level(logging.WARNING):
        registro = await repo.criar_batalha(dict(DADOS))

    # A batalha entrou, sem o detalhe das rodadas mas com o placar inteiro.
    assert registro["id"] == 1
    assert "rodadas" not in registro
    assert (registro["valor_a"], registro["valor_b"]) == (2, 1)
    assert registro["resultado"] == "a" and registro["xp_a"] == 30

    # Tentou com a coluna antes de desistir dela.
    assert "rodadas" in cliente.tentativas[0]
    assert "rodadas" not in cliente.tentativas[1]

    # E avisou alto: isto é remendo, não modo de operação.
    assert any("rodadas" in r.message and "schema.sql" in r.message for r in caplog.records)


async def test_banco_em_dia_grava_as_rodadas_de_primeira():
    cliente = ClientFalso(set())
    registro = await SupabaseRepo(cliente).criar_batalha(dict(DADOS))

    assert registro["rodadas"] == [{"posicao": 1}]
    assert len(cliente.tentativas) == 1  # sem retentativa


async def test_erro_que_nao_e_de_coluna_continua_estourando():
    """Rede fora, credencial errada: não pode virar 'grava sem a coluna'."""
    cliente = ClientFalso({"rodadas"}, mensagem="connection refused")
    with pytest.raises(ErroPostgrest):
        await SupabaseRepo(cliente).criar_batalha(dict(DADOS))


async def test_coluna_obrigatoria_ausente_nao_e_silenciada():
    """Se faltar `resultado`, o banco está quebrado — tem de aparecer."""
    cliente = ClientFalso({"resultado"})
    with pytest.raises(ErroPostgrest):
        await SupabaseRepo(cliente).criar_batalha(dict(DADOS))


# ── o detector, isolado ──────────────────────────────────────────────

def test_detecta_a_mensagem_do_postgres():
    erro = Exception("column batalhas.rodadas does not exist")
    assert _coluna_ausente(erro, DADOS) == "rodadas"


def test_detecta_o_cache_de_schema_do_postgrest():
    erro = Exception("Could not find the 'rodadas' column of 'batalhas' in the schema cache")
    assert _coluna_ausente(erro, DADOS) == "rodadas"


def test_ignora_erro_sem_relacao():
    assert _coluna_ausente(Exception("timeout"), DADOS) is None


def test_ignora_coluna_que_nao_esta_no_payload():
    erro = Exception("column batalhas.rodadas does not exist")
    assert _coluna_ausente(erro, {"jogador_a_id": 1}) is None
