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


TRIO = ["forca", "carisma", "caos"]


async def test_batalha_completa_atualiza_placar_e_registra(api, repo):
    """Ana vence as 3 rodadas: 30 XP pra ela, 5 pro Beto, tudo registrado."""
    repo.semear_jogador(nome="Ana", forca=30, carisma=28, caos=26)
    repo.semear_jogador(nome="Beto", forca=5, carisma=4, caos=3)

    resposta = await api.post(
        "/batalha", json={"jogador_a_id": 1, "jogador_b_id": 2, "atributos": TRIO}
    )
    assert resposta.status_code == 201

    corpo = resposta.json()
    assert corpo["resultado"] == "a"
    assert corpo["vencedor_id"] == 1
    assert corpo["vitorias_a"] == 3
    assert corpo["vitorias_b"] == 0
    assert corpo["atributos"] == TRIO
    assert len(corpo["rodadas"]) == 3
    assert corpo["desafiante"]["nome"] == "Ana"
    assert corpo["oponente"]["nome"] == "Beto"

    # XP do desafiante — o que a tela de resultado mostra.
    assert corpo["xp_a"] == XP_VITORIA
    assert corpo["xp_b"] == XP_DERROTA

    # placar dos dois jogadores
    assert repo.jogadores[0]["xp"] == XP_VITORIA
    assert repo.jogadores[0]["vitorias"] == 1
    assert repo.jogadores[1]["xp"] == XP_DERROTA
    assert repo.jogadores[1]["derrotas"] == 1

    # batalha registrada no banco, com o detalhe das 3 rodadas
    assert len(repo.batalhas) == 1
    registro = repo.batalhas[0]
    assert registro["atributo"] == "forca,carisma,caos"
    assert (registro["valor_a"], registro["valor_b"]) == (3, 0)
    assert len(registro["rodadas"]) == 3


async def test_cada_rodada_compara_o_mesmo_atributo(api, repo):
    repo.semear_jogador(nome="Ana", forca=18, carisma=9, caos=21)
    repo.semear_jogador(nome="Beto", forca=12, carisma=14, caos=7)

    corpo = (
        await api.post(
            "/batalha", json={"jogador_a_id": 1, "jogador_b_id": 2, "atributos": TRIO}
        )
    ).json()

    primeira = corpo["rodadas"][0]
    assert primeira["atributo"] == "forca"
    assert primeira["rotulo"] == "Força"
    assert (primeira["valor_a"], primeira["valor_b"]) == (18, 12)
    assert primeira["vencedor"] == "a"
    assert [r["vencedor"] for r in corpo["rodadas"]] == ["a", "b", "a"]


async def test_batalha_exige_a_escolha_de_atributos(api, repo):
    """Sem `atributos` o Pydantic recusa antes de a rota rodar."""
    repo.semear_jogador()
    repo.semear_jogador()
    resposta = await api.post("/batalha", json={"jogador_a_id": 1, "jogador_b_id": 2})
    assert resposta.status_code == 422


async def test_batalha_recusa_quantidade_errada_de_atributos(api, repo):
    repo.semear_jogador()
    repo.semear_jogador()
    for escolha in ([], ["forca"], ["forca", "caos", "carisma", "agilidade"]):
        resposta = await api.post(
            "/batalha",
            json={"jogador_a_id": 1, "jogador_b_id": 2, "atributos": escolha},
        )
        assert resposta.status_code == 422, escolha


async def test_batalha_recusa_atributo_repetido_com_mensagem_legivel(api, repo):
    """A mensagem vai direto pra tela, então precisa dizer o que houve."""
    repo.semear_jogador()
    repo.semear_jogador()
    resposta = await api.post(
        "/batalha",
        json={"jogador_a_id": 1, "jogador_b_id": 2, "atributos": ["forca", "forca", "caos"]},
    )
    assert resposta.status_code == 422
    assert "duas vezes" in resposta.json()["detail"]


async def test_batalha_recusa_atributo_que_nao_e_do_card(api, repo):
    """'estrategia' é dimensão do quiz — o Literal do schema barra."""
    repo.semear_jogador()
    repo.semear_jogador()
    resposta = await api.post(
        "/batalha",
        json={"jogador_a_id": 1, "jogador_b_id": 2, "atributos": ["forca", "estrategia", "caos"]},
    )
    assert resposta.status_code == 422


async def test_oponente_nao_fica_com_batalha_pendente(api, repo):
    """Não existe convite a aceitar: a batalha já nasce resolvida e registrada."""
    repo.semear_jogador(nome="Ana", forca=30)
    repo.semear_jogador(nome="Beto", forca=1)

    corpo = (
        await api.post(
            "/batalha", json={"jogador_a_id": 1, "jogador_b_id": 2, "atributos": TRIO}
        )
    ).json()

    assert corpo["resultado"] in ("a", "b", "empate")
    assert corpo["id"] is not None
    assert repo.batalhas[0]["resultado"] == corpo["resultado"]
    # o placar do oponente já foi aplicado, sem ele ter feito nada
    assert repo.jogadores[1]["xp"] > 0


async def test_empate_conta_para_os_dois(api, repo):
    """Atributos iguais: 3 rodadas empatadas → empate geral, 15 XP pra cada."""
    repo.semear_jogador()
    repo.semear_jogador()

    corpo = (
        await api.post(
            "/batalha", json={"jogador_a_id": 1, "jogador_b_id": 2, "atributos": TRIO}
        )
    ).json()

    assert corpo["resultado"] == "empate"
    assert corpo["vencedor_id"] is None
    assert corpo["empates_rodada"] == 3
    assert repo.jogadores[0]["empates"] == repo.jogadores[1]["empates"] == 1
    assert repo.jogadores[0]["xp"] == repo.jogadores[1]["xp"] == XP_EMPATE


async def test_batalha_contra_si_mesmo_e_recusada(api, repo):
    repo.semear_jogador()
    resposta = await api.post(
        "/batalha", json={"jogador_a_id": 1, "jogador_b_id": 1, "atributos": TRIO}
    )
    assert resposta.status_code == 422


async def test_batalha_com_jogador_inexistente_devolve_404(api, repo):
    repo.semear_jogador()
    resposta = await api.post(
        "/batalha", json={"jogador_a_id": 1, "jogador_b_id": 77, "atributos": TRIO}
    )
    assert resposta.status_code == 404


async def test_historico_traz_batalhas_dos_dois_lados(api, repo):
    repo.semear_jogador(carisma=30)
    repo.semear_jogador(carisma=5)
    await api.post("/batalha", json={"jogador_a_id": 1, "jogador_b_id": 2, "atributos": TRIO})
    await api.post("/batalha", json={"jogador_a_id": 2, "jogador_b_id": 1, "atributos": TRIO})

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
    """Conta os atributos que apareceram no pódio dos dois lados."""
    repo.semear_jogador(carisma=30)
    repo.semear_jogador(carisma=5)
    await api.post("/batalha", json={"jogador_a_id": 1, "jogador_b_id": 2, "atributos": TRIO})

    corpo = (await api.get("/analytics/batalhas")).json()
    assert corpo["total_batalhas"] == 1
    assert corpo["taxa_empate"] == 0.0

    # Uma batalha põe em jogo os 3 atributos escolhidos.
    contagem = {a["atributo"]: a["quantidade"] for a in corpo["atributos_escolhidos"]}
    assert sum(contagem.values()) == 3
    assert set(contagem) == set(TRIO)


async def test_metricas_de_batalha_ainda_leem_o_formato_antigo(api, repo):
    """Linhas gravadas antes do posicional não somem do dashboard."""
    repo.semear_jogador()
    repo.semear_jogador()
    await repo.criar_batalha(
        {
            "jogador_a_id": 1,
            "jogador_b_id": 2,
            "atributo": "estrategia",
            "valor_a": 12,
            "valor_b": 9,
            "resultado": "a",
            "vencedor_id": 1,
            "xp_a": 30,
            "xp_b": 5,
        }
    )

    corpo = (await api.get("/analytics/batalhas")).json()
    assert corpo["atributos_escolhidos"][0]["atributo"] == "estrategia"


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
