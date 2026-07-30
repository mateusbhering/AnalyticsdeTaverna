"""Testes das rotas HTTP — o caminho completo que o frontend vai percorrer.

Usam a fixture `api` (cliente HTTP + repositório em memória), definida no
conftest.py. Nenhum Supabase é tocado.
"""

from __future__ import annotations

from app.domain.batalha import XP_DERROTA, XP_EMPATE, XP_VITORIA


# ── infra ────────────────────────────────────────────────────────────

async def test_health_responde_ok(api):
    resposta = await api.get("/health")
    assert resposta.status_code == 200
    assert resposta.json()["status"] == "ok"


# ── geração de personagem ────────────────────────────────────────────

async def test_gerar_personagem_devolve_atributos_e_classe(api):
    resposta = await api.post(
        "/personagem/gerar",
        json={"dimensoes": {"estrategia": 16, "percepcao": 4}, "tags": ["NERD"]},
    )
    assert resposta.status_code == 200

    corpo = resposta.json()
    assert corpo["classe"]
    assert corpo["atributos"]["inteligencia"] == 20  # estrategia + percepcao


async def test_listar_classes(api):
    corpo = (await api.get("/personagem/classes")).json()
    assert corpo["total"] == 16
    assert len(corpo["dimensoes"]) == 10


# ── cadastro ─────────────────────────────────────────────────────────

async def test_cadastro_com_dimensoes_calcula_o_personagem(api):
    resposta = await api.post(
        "/jogadores",
        json={"nome": "Julia", "dimensoes": {"criatividade": 12}, "tags": []},
    )
    assert resposta.status_code == 201

    corpo = resposta.json()
    assert corpo["id"] == 1
    assert corpo["nome"] == "Julia"
    assert corpo["classe"] == "Artífice da Gambiarra"
    assert corpo["xp"] == 0


async def test_cadastro_aceita_atributos_prontos(api):
    """Compatibilidade com o fluxo atual, em que o front já calculou tudo."""
    resposta = await api.post(
        "/jogadores",
        json={
            "nome": "Yasmin",
            "classe": "Bardo do Karaokê",
            "atributos": {
                "forca": 1, "inteligencia": 2, "agilidade": 3, "resistencia": 4,
                "carisma": 5, "sabedoria": 6, "caos": 7,
            },
        },
    )
    assert resposta.status_code == 201
    assert resposta.json()["carisma"] == 5


async def test_cadastro_sem_dados_suficientes_e_recusado(api):
    resposta = await api.post("/jogadores", json={"nome": "Ninguém"})
    assert resposta.status_code == 422


async def test_cadastro_ignora_xp_enviado_pelo_cliente(api, repo):
    """Segurança: ninguém começa com XP. O placar só muda batalhando."""
    await api.post("/jogadores", json={"nome": "Esperta", "dimensoes": {"lideranca": 5}, "xp": 9999})
    assert repo.jogadores[0]["xp"] == 0


async def test_jogador_inexistente_devolve_404(api):
    assert (await api.get("/jogadores/999")).status_code == 404


# ── batalha ──────────────────────────────────────────────────────────

async def test_pareamento_encontra_adversario(api, repo):
    repo.semear_jogador(nome="A", xp=100)
    repo.semear_jogador(nome="B", xp=98)
    repo.semear_jogador(nome="C", xp=0)

    corpo = (await api.post("/batalha/parear", json={"jogador_id": 1})).json()
    assert corpo["oponente"]["nome"] == "B"  # XP mais próximo


async def test_pareamento_sem_adversario_devolve_404(api, repo):
    repo.semear_jogador(nome="Sozinha")
    resposta = await api.post("/batalha/parear", json={"jogador_id": 1})
    assert resposta.status_code == 404


async def test_batalha_completa_atualiza_placar_e_registra(api, repo):
    repo.semear_jogador(nome="Ana", carisma=30)
    repo.semear_jogador(nome="Beto", carisma=5)

    resposta = await api.post(
        "/batalha",
        json={"jogador_a_id": 1, "jogador_b_id": 2, "atributo": "carisma"},
    )
    assert resposta.status_code == 201

    corpo = resposta.json()
    assert corpo["resultado"] == "a"
    assert corpo["vencedor_id"] == 1

    # placar dos dois jogadores
    assert repo.jogadores[0]["xp"] == XP_VITORIA
    assert repo.jogadores[0]["vitorias"] == 1
    assert repo.jogadores[1]["xp"] == XP_DERROTA
    assert repo.jogadores[1]["derrotas"] == 1

    # batalha registrada no banco
    assert len(repo.batalhas) == 1
    assert repo.batalhas[0]["atributo"] == "carisma"


async def test_empate_conta_para_os_dois(api, repo):
    repo.semear_jogador(inteligencia=10)
    repo.semear_jogador(inteligencia=10)

    corpo = (
        await api.post(
            "/batalha",
            json={"jogador_a_id": 1, "jogador_b_id": 2, "atributo": "inteligencia"},
        )
    ).json()

    assert corpo["resultado"] == "empate"
    assert corpo["vencedor_id"] is None
    assert repo.jogadores[0]["empates"] == repo.jogadores[1]["empates"] == 1
    assert repo.jogadores[0]["xp"] == XP_EMPATE


async def test_batalha_contra_si_mesmo_e_recusada(api, repo):
    repo.semear_jogador()
    resposta = await api.post(
        "/batalha", json={"jogador_a_id": 1, "jogador_b_id": 1, "atributo": "carisma"}
    )
    assert resposta.status_code == 422


async def test_batalha_com_atributo_invalido_e_recusada(api, repo):
    repo.semear_jogador()
    repo.semear_jogador()
    resposta = await api.post(
        "/batalha", json={"jogador_a_id": 1, "jogador_b_id": 2, "atributo": "forca"}
    )
    assert resposta.status_code == 422


async def test_batalha_com_jogador_inexistente_devolve_404(api, repo):
    repo.semear_jogador()
    resposta = await api.post(
        "/batalha", json={"jogador_a_id": 1, "jogador_b_id": 77, "atributo": "carisma"}
    )
    assert resposta.status_code == 404


async def test_historico_traz_batalhas_dos_dois_lados(api, repo):
    repo.semear_jogador(carisma=30)
    repo.semear_jogador(carisma=5)
    await api.post("/batalha", json={"jogador_a_id": 1, "jogador_b_id": 2, "atributo": "carisma"})
    await api.post("/batalha", json={"jogador_a_id": 2, "jogador_b_id": 1, "atributo": "carisma"})

    corpo = (await api.get("/batalha/historico/2")).json()
    assert corpo["total"] == 2


# ── ranking ──────────────────────────────────────────────────────────

async def test_top_10_ordena_por_xp_e_numera_as_posicoes(api, repo):
    repo.semear_jogador(nome="Bronze", xp=10)
    repo.semear_jogador(nome="Ouro", xp=300)
    repo.semear_jogador(nome="Prata", xp=150)

    ranking = (await api.get("/ranking")).json()
    assert [j["nome"] for j in ranking] == ["Ouro", "Prata", "Bronze"]
    assert [j["posicao"] for j in ranking] == [1, 2, 3]


async def test_ranking_respeita_o_limite(api, repo):
    for i in range(15):
        repo.semear_jogador(xp=i)
    assert len(((await api.get("/ranking")).json())) == 10
    assert len(((await api.get("/ranking?limite=3")).json())) == 3


async def test_ranking_calcula_taxa_de_vitoria(api, repo):
    repo.semear_jogador(nome="Heroína", xp=100, vitorias=3, derrotas=1, empates=0)
    item = (await api.get("/ranking")).json()[0]
    assert item["total_batalhas"] == 4
    assert item["taxa_vitoria"] == 75.0


async def test_posicao_individual_do_jogador(api, repo):
    repo.semear_jogador(nome="Primeira", xp=500)
    repo.semear_jogador(nome="Segunda", xp=100)
    assert (await api.get("/ranking/2")).json()["posicao"] == 2


async def test_ranking_vazio_nao_quebra(api):
    assert (await api.get("/ranking")).json() == []


# ── analytics ────────────────────────────────────────────────────────

async def test_resumo_do_dashboard(api, repo):
    repo.semear_jogador(classe="Mago do ChatGPT")
    repo.semear_jogador(classe="Mago do ChatGPT")
    repo.semear_jogador(classe="Druida de Varanda")

    corpo = (await api.get("/analytics/resumo")).json()
    assert corpo["total_jogadores"] == 3
    assert corpo["classe_mais_comum"] == "Mago do ChatGPT"
    assert corpo["classes_distintas"] == 2


async def test_distribuicao_de_classes_com_percentual(api, repo):
    repo.semear_jogador(classe="Bardo do Karaokê")
    repo.semear_jogador(classe="Bardo do Karaokê")
    repo.semear_jogador(classe="Ranger da Faxina")

    corpo = (await api.get("/analytics/classes")).json()
    assert corpo["classes"][0] == {
        "classe": "Bardo do Karaokê",
        "quantidade": 2,
        "percentual": 66.7,
    }


async def test_media_de_atributos(api, repo):
    repo.semear_jogador(inteligencia=10, carisma=4)
    repo.semear_jogador(inteligencia=20, carisma=6)

    corpo = (await api.get("/analytics/atributos")).json()
    assert corpo["atributos"]["inteligencia"] == 15.0
    assert corpo["base"] == 2


async def test_metricas_de_batalha(api, repo):
    repo.semear_jogador(carisma=30)
    repo.semear_jogador(carisma=5)
    await api.post("/batalha", json={"jogador_a_id": 1, "jogador_b_id": 2, "atributo": "carisma"})

    corpo = (await api.get("/analytics/batalhas")).json()
    assert corpo["total_batalhas"] == 1
    assert corpo["atributos_escolhidos"][0]["atributo"] == "carisma"
    assert corpo["taxa_empate"] == 0.0


async def test_taxa_de_vitoria_por_classe(api, repo):
    repo.semear_jogador(classe="Mago do ChatGPT", vitorias=3, derrotas=1)
    repo.semear_jogador(classe="Druida de Varanda", vitorias=0, derrotas=2)

    corpo = (await api.get("/analytics/taxa-vitoria")).json()
    assert corpo["classes"][0]["classe"] == "Mago do ChatGPT"
    assert corpo["classes"][0]["taxa_vitoria"] == 75.0


async def test_insight_compara_dimensoes(api, repo):
    repo.semear_jogador(impulsividade=20, estrategia=1)
    repo.semear_jogador(impulsividade=18, estrategia=2)

    corpo = (await api.get("/analytics/insight")).json()
    assert "impulsivo" in corpo["frase"]
    assert corpo["dimensao_dominante"] == "impulsividade"


async def test_analytics_com_banco_vazio_nao_quebra(api):
    """Dia da apresentação com base zerada não pode dar erro 500."""
    for rota in ("/analytics/resumo", "/analytics/classes", "/analytics/atributos",
                 "/analytics/batalhas", "/analytics/taxa-vitoria", "/analytics/insight"):
        assert (await api.get(rota)).status_code == 200
