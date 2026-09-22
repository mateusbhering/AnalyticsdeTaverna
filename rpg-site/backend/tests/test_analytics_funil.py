"""Testes do funil de conversão (`POST /analytics/evento`, `GET /analytics/funil`).

Usam a fixture `api` (cliente HTTP + repositório em memória), definida no
conftest.py. Nenhum Supabase é tocado.
"""

from __future__ import annotations


async def test_registrar_evento_devolve_202(api):
    resposta = await api.post(
        "/analytics/evento", json={"sessao_id": "sess-1", "evento": "inicio"}
    )
    assert resposta.status_code == 202
    assert resposta.json()["status"] == "registrado"


async def test_registrar_evento_com_tipo_invalido_devolve_422(api):
    resposta = await api.post(
        "/analytics/evento", json={"sessao_id": "sess-1", "evento": "etapa_que_nao_existe"}
    )
    assert resposta.status_code == 422


async def test_funil_sem_dado_nenhum_fica_todo_zerado(api):
    corpo = (await api.get("/analytics/funil")).json()
    assert corpo["sem_eventos"] is True
    assert all(e["total"] == 0 for e in corpo["etapas"])


async def test_funil_conta_sessoes_distintas_por_etapa(api, repo):
    # Três sessões abrem o quiz; só duas tiram foto; só uma termina o quiz.
    for sessao in ("s1", "s2", "s3"):
        await api.post("/analytics/evento", json={"sessao_id": sessao, "evento": "inicio"})
    for sessao in ("s1", "s2"):
        await api.post(
            "/analytics/evento", json={"sessao_id": sessao, "evento": "foto_capturada"}
        )
    await api.post("/analytics/evento", json={"sessao_id": "s1", "evento": "quiz_concluido"})

    # A mesma sessão manda o mesmo evento duas vezes (retry, remontagem) — não
    # pode contar como duas sessões diferentes na mesma etapa.
    await api.post("/analytics/evento", json={"sessao_id": "s1", "evento": "inicio"})

    corpo = (await api.get("/analytics/funil")).json()
    por_etapa = {e["etapa"]: e for e in corpo["etapas"]}

    assert por_etapa["inicio"]["total"] == 3
    assert por_etapa["foto_capturada"]["total"] == 2
    assert por_etapa["quiz_concluido"]["total"] == 1
    assert por_etapa["avatar_gerado"]["total"] == 0

    # Percentual do topo e da etapa anterior.
    assert por_etapa["foto_capturada"]["percentual_do_topo"] == 66.7
    assert por_etapa["quiz_concluido"]["percentual_da_etapa_anterior"] == 50.0
    assert por_etapa["inicio"]["percentual_da_etapa_anterior"] is None
    assert corpo["sem_eventos"] is False


async def test_funil_personagem_salvo_so_conta_jogador_ligado_a_sessao(api, repo):
    # Sem `sessao_funil_id`: jogador "solto", de antes da coluna existir.
    repo.semear_jogador()

    # Com `sessao_funil_id`, mas a sessão nunca mandou nenhum evento de funil
    # (ex.: versão antiga do frontend que já grava a coluna mas ainda não
    # dispara os eventos) — ainda assim entra no funil, porque o que importa
    # aqui é a LIGAÇÃO jogador↔sessão, não ter passado pelas 4 etapas antes.
    ligado = repo.semear_jogador(sessao_funil_id="sess-ligada")

    corpo = (await api.get("/analytics/funil")).json()
    por_etapa = {e["etapa"]: e for e in corpo["etapas"]}

    assert por_etapa["personagem_salvo"]["total"] == 1
    assert corpo["sessoes_ligadas"] == 1
    assert por_etapa["duelou"]["total"] == 0

    # Agora essa sessão duela — e passa a contar em "duelou" também.
    outro = repo.semear_jogador()
    await api.post(
        "/batalha",
        json={
            "jogador_a_id": ligado["id"],
            "jogador_b_id": outro["id"],
            "atributos": ["forca", "carisma", "caos"],
        },
    )
    corpo = (await api.get("/analytics/funil")).json()
    por_etapa = {e["etapa"]: e for e in corpo["etapas"]}
    assert por_etapa["duelou"]["total"] == 1


async def test_funil_por_pessoa_encadeia_evento_e_jogador_da_mesma_sessao(api, repo):
    # A mesma sessão passa pelas 4 etapas de evento E vira um jogador salvo —
    # cenário completo, ponta a ponta.
    for evento in ("inicio", "foto_capturada", "quiz_concluido", "avatar_gerado"):
        await api.post("/analytics/evento", json={"sessao_id": "s1", "evento": evento})
    repo.semear_jogador(sessao_funil_id="s1")

    # Uma segunda sessão abandona depois de tirar a foto — nunca vira jogador.
    await api.post("/analytics/evento", json={"sessao_id": "s2", "evento": "inicio"})
    await api.post(
        "/analytics/evento", json={"sessao_id": "s2", "evento": "foto_capturada"}
    )

    corpo = (await api.get("/analytics/funil")).json()
    por_etapa = {e["etapa"]: e for e in corpo["etapas"]}

    assert por_etapa["inicio"]["total"] == 2
    assert por_etapa["foto_capturada"]["total"] == 2
    assert por_etapa["quiz_concluido"]["total"] == 1
    assert por_etapa["avatar_gerado"]["total"] == 1
    assert por_etapa["personagem_salvo"]["total"] == 1
    assert corpo["sem_eventos"] is False
