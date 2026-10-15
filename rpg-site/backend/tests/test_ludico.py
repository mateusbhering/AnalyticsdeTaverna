"""Níveis, raridade, conquistas e missão do dia (camada lúdica)."""

from __future__ import annotations

from datetime import date, datetime, timezone

import pytest

from app import ludico
from app.domain import conquistas as cq
from app.domain import missoes as ms
from app.domain import progressao as pg
from app.domain import raridade as rr

TRIO = ["carisma", "forca", "caos"]


# ── níveis ───────────────────────────────────────────────────────────

@pytest.mark.parametrize(
    ("xp", "nivel"),
    [(0, 1), (39, 1), (40, 2), (119, 2), (120, 3), (400, 5), (1800, 10), (10**9, pg.NIVEL_MAXIMO)],
)
def test_nivel_pelo_xp(xp, nivel):
    assert pg.progressao(xp)["nivel"] == nivel


def test_progressao_da_barra():
    p = pg.progressao(60)  # nível 2 começa em 40, nível 3 em 120
    assert (p["nivel"], p["xp_no_nivel"], p["xp_para_proximo"], p["progresso_pct"]) == (2, 20, 60, 25.0)


def test_xp_negativo_ou_nulo_nao_quebra():
    assert pg.progressao(None)["nivel"] == 1
    assert pg.progressao(-50)["nivel"] == 1


def test_titulo_por_faixa_de_nivel():
    assert pg.titulo_do_nivel(1) == "Aprendiz"
    assert pg.titulo_do_nivel(5) == "Veterano"
    assert pg.titulo_do_nivel(30) == "Lenda da Taverna"


# ── raridade ─────────────────────────────────────────────────────────

CLASSES = ["A", "B", "C", "D"]


def test_amostra_pequena_deixa_tudo_comum():
    r = rr.raridades(CLASSES, [{"classe": "A"}] * 5)
    assert not r["amostra_suficiente"]
    assert {c["raridade"] for c in r["classes"].values()} == {"comum"}


def test_classe_sem_ninguem_e_lendaria_e_a_mais_cheia_e_comum():
    jogadores = [{"classe": "A"}] * 20 + [{"classe": "B"}] * 8 + [{"classe": "C"}] * 4
    r = rr.raridades(CLASSES, jogadores)["classes"]
    assert r["D"]["raridade"] == "lendaria"
    assert r["A"]["raridade"] == "comum"
    assert r["C"]["raridade"] == "epica"  # 4/32 = 12,5% ≈ 0,5× o uniforme (25%)


# ── conquistas ───────────────────────────────────────────────────────

def test_invicto_exige_cinco_vitorias_sem_derrota():
    assert "invicto" in cq.avaliar({"vitorias": 5, "derrotas": 0})
    assert "invicto" not in cq.avaliar({"vitorias": 5, "derrotas": 1})


def test_titulo_vale_a_conquista_de_maior_prioridade():
    assert cq.titulo_do_jogador(["primeira_vitoria", "invicto"]) == "o Imbatível"
    assert cq.titulo_do_jogador(["batizado"]) is None


def test_caotico_so_quando_o_caos_e_o_maior_atributo():
    assert "caotico" in cq.avaliar({"caos": 20, "forca": 10, "carisma": 20})
    assert "caotico" not in cq.avaliar({"caos": 5, "forca": 10})


# ── missão do dia ────────────────────────────────────────────────────

def test_missao_do_dia_e_a_mesma_para_todos_e_muda_com_a_data():
    d = date(2026, 10, 13)
    assert ms.missao_do_dia(d) is ms.missao_do_dia(d)
    assert len({ms.missao_do_dia(date.fromordinal(d.toordinal() + i)).codigo for i in range(len(ms.MISSOES))}) == len(ms.MISSOES)


def test_dia_vira_no_horario_de_brasilia():
    # 02:30 UTC de 14/10 ainda é 23:30 de 13/10 em Brasília.
    b = {"criado_em": "2026-10-14T02:30:00+00:00"}
    assert ms.dia_da_batalha(b) == date(2026, 10, 13)
    assert ms.hoje(datetime(2026, 10, 14, 2, 30, tzinfo=timezone.utc)) == date(2026, 10, 13)


# ── rotas ────────────────────────────────────────────────────────────

@pytest.fixture
def missao_fixa(monkeypatch):
    """Trava a missão do dia em 'Aquecimento' (duele 1 vez) para o teste ser estável."""
    monkeypatch.setattr(ludico.ms, "missao_do_dia", lambda dia: ms.POR_CODIGO["duelar_1"])


async def test_perfil_de_jogador_inexistente_da_404(api):
    assert (await api.get("/jogadores/999/perfil")).status_code == 404


async def test_perfil_traz_nivel_catalogo_e_missao(api, repo, missao_fixa):
    repo.semear_jogador(nome="Ju", xp=60)
    corpo = (await api.get("/jogadores/1/perfil")).json()

    assert corpo["progressao"]["nivel"] == 2
    assert corpo["missao_hoje"]["codigo"] == "duelar_1"
    assert corpo["missao_hoje"]["cumprida"] is False
    assert corpo["conquistas_total"] == len(cq.CATALOGO)
    por_codigo = {c["codigo"]: c for c in corpo["conquistas"]}
    assert por_codigo["batizado"]["desbloqueada"] is True  # tem nome
    assert por_codigo["invicto"]["desbloqueada"] is False


async def test_perfil_grava_conquistas_retroativas_uma_vez(api, repo):
    repo.semear_jogador(nome="Ju", vitorias=1)
    await api.get("/jogadores/1/perfil")
    await api.get("/jogadores/1/perfil")
    codigos = [c["codigo"] for c in repo.conquistas]
    assert sorted(codigos) == sorted(set(codigos))
    assert "primeira_vitoria" in codigos


async def test_batalha_devolve_extras_com_conquista_nova(api, repo, missao_fixa):
    repo.semear_jogador(nome="Ju", carisma=30)
    repo.semear_jogador(nome="Rival", carisma=5)
    corpo = (await api.post("/batalha", json={"jogador_a_id": 1, "jogador_b_id": 2, "atributos": TRIO})).json()

    novas = {c["codigo"] for c in corpo["extras"]["conquistas_novas"]}
    assert {"primeiro_duelo", "primeira_vitoria"} <= novas
    assert corpo["extras"]["missao"]["codigo"] == "duelar_1"


async def test_missao_paga_o_bonus_uma_vez_por_dia(api, repo, missao_fixa):
    repo.semear_jogador(nome="Ju", carisma=30)
    repo.semear_jogador(nome="Rival", carisma=5)

    primeira = (await api.post("/batalha", json={"jogador_a_id": 1, "jogador_b_id": 2, "atributos": TRIO})).json()
    xp_depois_da_primeira = repo.jogadores[0]["xp"]
    segunda = (await api.post("/batalha", json={"jogador_a_id": 1, "jogador_b_id": 2, "atributos": TRIO})).json()

    assert primeira["extras"]["missao"]["recompensa_xp"] == 20
    assert segunda["extras"]["missao"] is None
    assert len(repo.missoes) == 1
    # A segunda batalha soma só o XP do duelo (30), sem novo bônus.
    assert repo.jogadores[0]["xp"] == xp_depois_da_primeira + segunda["xp_a"]


async def test_quem_so_foi_desafiado_nao_cumpre_missao(api, repo, missao_fixa):
    repo.semear_jogador(carisma=30)
    repo.semear_jogador(carisma=5)
    await api.post("/batalha", json={"jogador_a_id": 1, "jogador_b_id": 2, "atributos": TRIO})
    assert not any(m["jogador_id"] == 2 for m in repo.missoes)


async def test_falha_na_camada_ludica_nao_derruba_a_batalha(api, repo, monkeypatch):
    async def quebrado(*_a, **_k):
        raise RuntimeError("boom")

    monkeypatch.setattr(repo, "conquistas_do_jogador", quebrado)
    repo.semear_jogador(carisma=30)
    repo.semear_jogador(carisma=5)
    resposta = await api.post("/batalha", json={"jogador_a_id": 1, "jogador_b_id": 2, "atributos": TRIO})
    assert resposta.status_code == 201
    assert resposta.json()["extras"] is None


async def test_ranking_traz_nivel_e_titulo(api, repo):
    repo.semear_jogador(xp=130)
    item = (await api.get("/ranking")).json()[0]
    assert (item["nivel"], item["titulo_nivel"]) == (3, "Aventureiro")


async def test_endpoint_de_raridade_lista_todas_as_classes(api, repo):
    corpo = (await api.get("/analytics/raridade-classes")).json()
    assert corpo["total"] == 0
    assert set(corpo["classes"]) == set(ludico.classes_conhecidas())
