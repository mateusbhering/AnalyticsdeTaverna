"""Testes do compartilhamento do card (`GET /analytics/compartilhamento`)."""

from __future__ import annotations


async def _evento(api, sessao, evento, origem=None, ref=None):
    corpo = {"sessao_id": sessao, "evento": evento}
    if origem:
        corpo["origem"] = origem
    if ref:
        corpo["ref_jogador_id"] = ref
    return await api.post("/analytics/evento", json=corpo)


async def test_evento_compartilhou_com_canal_devolve_202(api):
    assert (await _evento(api, "s1", "compartilhou", "whatsapp")).status_code == 202


async def test_origem_invalida_devolve_422(api):
    for ruim in ("Whats App", "<script>", "x" * 31, ""):
        resposta = await api.post(
            "/analytics/evento",
            json={"sessao_id": "s1", "evento": "compartilhou", "origem": ruim},
        )
        assert resposta.status_code == 422, ruim


async def test_ref_invalido_devolve_422(api):
    resposta = await api.post(
        "/analytics/evento",
        json={"sessao_id": "s1", "evento": "visita_compartilhada", "ref_jogador_id": 0},
    )
    assert resposta.status_code == 422


async def test_sem_dado_fica_vazio(api):
    corpo = (await api.get("/analytics/compartilhamento")).json()
    assert corpo["sem_eventos"] is True
    assert corpo["canais"] == []
    assert corpo["taxa_visita_para_quiz"] is None


async def test_conversao_por_canal(api):
    # WhatsApp: 3 compartilhamentos, 2 visitas, 1 virou quiz concluído.
    for _ in range(3):
        await _evento(api, "dono", "compartilhou", "whatsapp")
    for sessao in ("v1", "v2"):
        await _evento(api, sessao, "visita_compartilhada", "whatsapp", ref=7)
    await _evento(api, "q1", "inicio", "whatsapp")
    await _evento(api, "q1", "quiz_concluido", "whatsapp")
    # X: 1 compartilhamento, 1 visita, ninguém jogou.
    await _evento(api, "dono", "compartilhou", "x")
    await _evento(api, "v3", "visita_compartilhada", "x", ref=9)
    # Tráfego direto (sem origem) não entra na conta.
    await _evento(api, "d1", "inicio")

    corpo = (await api.get("/analytics/compartilhamento")).json()
    por_canal = {c["canal"]: c for c in corpo["canais"]}

    assert por_canal["whatsapp"]["compartilhamentos"] == 3
    assert por_canal["whatsapp"]["visitas"] == 2
    assert por_canal["whatsapp"]["concluiram_quiz"] == 1
    assert por_canal["whatsapp"]["taxa_visita_para_quiz"] == 50.0
    assert por_canal["x"]["taxa_visita_para_quiz"] == 0.0
    assert corpo["total_compartilhamentos"] == 4
    assert corpo["total_visitas"] == 3
    assert corpo["taxa_visita_para_quiz"] == 33.3
    assert corpo["canais"][0]["canal"] == "whatsapp"  # ordenado por visitas
    assert corpo["cards_mais_visitados"][0] == {"jogador_id": 7, "visitas": 2}


async def test_visita_repetida_na_mesma_sessao_conta_uma_vez(api):
    for _ in range(3):
        await _evento(api, "v1", "visita_compartilhada", "telegram")
    corpo = (await api.get("/analytics/compartilhamento")).json()
    assert corpo["canais"][0]["visitas"] == 1


async def test_taxa_nunca_passa_de_100(api):
    await _evento(api, "v1", "visita_compartilhada", "x")
    for sessao in ("q1", "q2"):  # duas partidas pela mesma visita
        await _evento(api, sessao, "quiz_concluido", "x")
    corpo = (await api.get("/analytics/compartilhamento")).json()
    assert corpo["canais"][0]["taxa_visita_para_quiz"] == 100.0


async def test_eventos_de_compartilhamento_nao_mexem_no_funil(api):
    await _evento(api, "s1", "inicio")
    await _evento(api, "s1", "compartilhou", "x")
    await _evento(api, "s2", "visita_compartilhada", "x")
    funil = (await api.get("/analytics/funil")).json()
    topo = {e["etapa"]: e["total"] for e in funil["etapas"]}
    assert topo["inicio"] == 1
