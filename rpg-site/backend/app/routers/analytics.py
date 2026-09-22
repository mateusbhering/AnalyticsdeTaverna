"""Dashboard Analytics (entregável 9).

  GET  /analytics/resumo         — números de topo (cards do dashboard)
  GET  /analytics/classes        — quantas vezes cada classe foi gerada
  GET  /analytics/atributos      — média de cada atributo e dimensão
  GET  /analytics/batalhas       — atributos mais escolhidos, taxa de empate
  GET  /analytics/taxa-vitoria   — taxa de vitória por classe
  GET  /analytics/insight        — a frase de efeito do PDF, calculada
  POST /analytics/evento         — registra uma etapa do funil de conversão
  GET  /analytics/funil          — funil foto → quiz → avatar → card → duelo

Por que agregar em Python e não no SQL? O Supabase expõe a tabela via
PostgREST, que não faz AVG/GROUP BY direto. Para a escala do projeto (alguns
milhares de linhas) puxar e agregar aqui é simples e rápido. Se um dia crescer
muito, a evolução natural é criar views/RPCs no Postgres — o resto da API não
precisaria mudar, só o `repo.py`.
"""

from __future__ import annotations

from collections import Counter, defaultdict

from fastapi import APIRouter, Depends

from ..domain.personagem import ATRIBUTOS, DIMENSOES
from ..repo import Repositorio, get_repo
from ..schemas import EventoFunilRequest

router = APIRouter(prefix="/analytics", tags=["analytics"])


def _media(valores: list[float]) -> float:
    return round(sum(valores) / len(valores), 2) if valores else 0.0


@router.get("/resumo")
async def resumo(repo: Repositorio = Depends(get_repo)):
    """Os números grandes do topo do dashboard."""
    jogadores = await repo.jogadores_para_analytics()
    batalhas = await repo.batalhas_para_analytics()

    classes = Counter(j.get("classe") for j in jogadores if j.get("classe"))
    mais_comum = classes.most_common(1)

    return {
        "total_jogadores": len(jogadores),
        "total_batalhas": len(batalhas),
        "classes_distintas": len(classes),
        "classe_mais_comum": mais_comum[0][0] if mais_comum else None,
        "classe_mais_comum_total": mais_comum[0][1] if mais_comum else 0,
    }


@router.get("/classes")
async def distribuicao_de_classes(repo: Repositorio = Depends(get_repo)):
    """Quantas vezes cada classe foi gerada — gráfico de barras do dashboard."""
    jogadores = await repo.jogadores_para_analytics()
    contagem = Counter(j.get("classe") for j in jogadores if j.get("classe"))
    total = sum(contagem.values())

    return {
        "total": total,
        "classes": [
            {
                "classe": classe,
                "quantidade": qtd,
                "percentual": round(qtd / total * 100, 1) if total else 0.0,
            }
            for classe, qtd in contagem.most_common()
        ],
    }


@router.get("/atributos")
async def medias_de_atributos(repo: Repositorio = Depends(get_repo)):
    """Média de cada atributo do card e de cada dimensão do quiz."""
    jogadores = await repo.jogadores_para_analytics()

    def medias(campos) -> dict[str, float]:
        return {
            campo: _media([float(j[campo]) for j in jogadores if j.get(campo) is not None])
            for campo in campos
        }

    return {
        "base": len(jogadores),
        "atributos": medias(ATRIBUTOS),
        "dimensoes": medias(DIMENSOES),
    }


@router.get("/batalhas")
async def metricas_de_batalha(repo: Repositorio = Depends(get_repo)):
    """Atributos mais levados ao confronto e proporção de empates.

    Agora o desafiante escolhe 3 atributos, então esta métrica volta a medir
    escolha de verdade — quais atributos a taverna acha que ganham batalha.
    Linhas do formato antigo, que gravavam um atributo único, continuam
    contando por ele.
    """
    batalhas = await repo.batalhas_para_analytics()
    total = len(batalhas)

    escolhas: Counter[str] = Counter()
    for b in batalhas:
        rodadas = b.get("rodadas")
        if rodadas:
            for rodada in rodadas:
                if rodada.get("atributo"):
                    escolhas[rodada["atributo"]] += 1
        elif b.get("atributo"):
            # O formato de transição gravava os três separados por vírgula.
            for atributo in str(b["atributo"]).split(","):
                if atributo:
                    escolhas[atributo] += 1

    empates = sum(1 for b in batalhas if b.get("resultado") == "empate")
    # O percentual é sobre o total de escolhas, não sobre o de batalhas: cada
    # batalha coloca 3 atributos em jogo.
    aparicoes = sum(escolhas.values())

    return {
        "total_batalhas": total,
        "empates": empates,
        "taxa_empate": round(empates / total * 100, 1) if total else 0.0,
        "atributos_escolhidos": [
            {
                "atributo": atributo,
                "quantidade": qtd,
                "percentual": round(qtd / aparicoes * 100, 1) if aparicoes else 0.0,
            }
            for atributo, qtd in escolhas.most_common()
        ],
    }


@router.get("/taxa-vitoria")
async def taxa_de_vitoria_por_classe(repo: Repositorio = Depends(get_repo)):
    """Taxa de vitória por classe — mostra se alguma classe está desbalanceada.

    Usa os contadores já mantidos em `jogadores`, então não precisa varrer a
    tabela de batalhas.
    """
    jogadores = await repo.jogadores_para_analytics()
    por_classe: dict[str, dict[str, int]] = defaultdict(
        lambda: {"jogadores": 0, "vitorias": 0, "derrotas": 0, "empates": 0}
    )

    for j in jogadores:
        classe = j.get("classe")
        if not classe:
            continue
        linha = por_classe[classe]
        linha["jogadores"] += 1
        linha["vitorias"] += int(j.get("vitorias") or 0)
        linha["derrotas"] += int(j.get("derrotas") or 0)
        linha["empates"] += int(j.get("empates") or 0)

    resultado = []
    for classe, linha in por_classe.items():
        batalhas = linha["vitorias"] + linha["derrotas"] + linha["empates"]
        resultado.append(
            {
                "classe": classe,
                **linha,
                "total_batalhas": batalhas,
                "taxa_vitoria": round(linha["vitorias"] / batalhas * 100, 1) if batalhas else 0.0,
            }
        )

    resultado.sort(key=lambda x: (-x["taxa_vitoria"], -x["total_batalhas"]))
    return {"total_classes": len(resultado), "classes": resultado}


@router.get("/insight")
async def insight(repo: Repositorio = Depends(get_repo)):
    """O "insight final" previsto no PDF, agora calculado de verdade.

    Ex.: "A maioria apresentou perfil mais impulsivo do que estratégico."
    Compara as médias das 10 dimensões e monta a frase com a mais alta e a
    mais baixa.
    """
    jogadores = await repo.jogadores_para_analytics()
    if not jogadores:
        return {"frase": None, "base": 0}

    medias = {
        d: _media([float(j[d]) for j in jogadores if j.get(d) is not None]) for d in DIMENSOES
    }
    if not any(medias.values()):
        return {
            "frase": None,
            "base": len(jogadores),
            "detalhe": "Ainda não há dimensões salvas nos jogadores.",
        }

    dominante = max(medias, key=lambda k: medias[k])
    fraca = min(medias, key=lambda k: medias[k])

    rotulos = {
        "lideranca": "líder",
        "estrategia": "estratégico",
        "disciplina": "disciplinado",
        "persistencia": "persistente",
        "sociabilidade": "sociável",
        "empatia": "empático",
        "adaptabilidade": "adaptável",
        "criatividade": "criativo",
        "impulsividade": "impulsivo",
        "percepcao": "perceptivo",
    }

    return {
        "frase": (
            f"A maioria das pessoas apresentou perfil mais "
            f"{rotulos[dominante]} do que {rotulos[fraca]}."
        ),
        "base": len(jogadores),
        "dimensao_dominante": dominante,
        "dimensao_mais_fraca": fraca,
        "medias": medias,
    }


# ─────────────────────────────────────────────────────────────────────────────
# Funil de conversão
#
# Cobre foto → quiz → avatar com eventos que o frontend dispara; as duas
# últimas etapas (personagem salvo, duelou) já são deriváveis de `jogadores` e
# `batalhas` — rastrear de novo duplicaria dado que o banco já tem.
# ─────────────────────────────────────────────────────────────────────────────

ETAPAS_EVENTO: tuple[str, ...] = ("inicio", "foto_capturada", "quiz_concluido", "avatar_gerado")

ROTULOS_ETAPA = {
    "inicio": "Abriu o quiz",
    "foto_capturada": "Tirou a foto",
    "quiz_concluido": "Terminou o quiz",
    "avatar_gerado": "Avatar gerado",
    "personagem_salvo": "Personagem salvo",
    "duelou": "Duelou ao menos uma vez",
}


@router.post("/evento", status_code=202)
async def registrar_evento(payload: EventoFunilRequest, repo: Repositorio = Depends(get_repo)):
    """Registra uma etapa do funil. Chamado pelo frontend em fogo-e-esquece —
    nunca deve bloquear nem atrapalhar o quiz se falhar."""
    await repo.registrar_evento_funil(payload.model_dump())
    return {"status": "registrado"}


@router.get("/funil")
async def funil(repo: Repositorio = Depends(get_repo)):
    """Funil foto → quiz → avatar → personagem salvo → duelo, por SESSÃO.

    Desde que `jogadores.sessao_funil_id` existe (liga o jogador salvo à
    sessão que o gerou — ver `sql/schema.sql`), as duas últimas etapas não são
    mais totais soltos: são a contagem de sessões que, além de terem os
    eventos anteriores, também geraram um jogador (`personagem_salvo`) e cujo
    jogador apareceu em algum duelo (`duelou`). É um funil por pessoa de
    verdade, não só uma contagem por etapa desconectada.

    Jogadores sem `sessao_funil_id` (salvos antes desta coluna existir, ou
    com o quiz rodando numa versão antiga do frontend) não entram no funil —
    não têm como ser ligados a uma sessão que nunca existiu. Isso é esperado
    logo após o deploy: o funil relata só o que a instrumentação viu.
    """
    eventos = await repo.eventos_funil_para_analytics()
    jogadores = await repo.jogadores_para_analytics()
    batalhas = await repo.batalhas_para_analytics()

    sessoes_por_evento: dict[str, set[str]] = defaultdict(set)
    for e in eventos:
        sessao, evento = e.get("sessao_id"), e.get("evento")
        if sessao and evento:
            sessoes_por_evento[evento].add(sessao)

    # Sessão → jogador: só entra quem tem a coluna preenchida.
    jogador_id_por_sessao: dict[str, int] = {
        j["sessao_funil_id"]: j["id"]
        for j in jogadores
        if j.get("sessao_funil_id") and j.get("id") is not None
    }

    jogadores_com_duelo = {
        jid
        for b in batalhas
        for jid in (b.get("jogador_a_id"), b.get("jogador_b_id"))
        if jid is not None
    }
    sessoes_que_duelaram = {
        sessao for sessao, jid in jogador_id_por_sessao.items() if jid in jogadores_com_duelo
    }

    etapas = [
        {
            "etapa": etapa,
            "rotulo": ROTULOS_ETAPA[etapa],
            "total": len(sessoes_por_evento.get(etapa, set())),
        }
        for etapa in ETAPAS_EVENTO
    ]
    etapas.append(
        {
            "etapa": "personagem_salvo",
            "rotulo": ROTULOS_ETAPA["personagem_salvo"],
            "total": len(jogador_id_por_sessao),
        }
    )
    etapas.append(
        {"etapa": "duelou", "rotulo": ROTULOS_ETAPA["duelou"], "total": len(sessoes_que_duelaram)}
    )

    topo = etapas[0]["total"]
    for i, etapa in enumerate(etapas):
        etapa["percentual_do_topo"] = round(etapa["total"] / topo * 100, 1) if topo else 0.0
        anterior = etapas[i - 1]["total"] if i > 0 else None
        etapa["percentual_da_etapa_anterior"] = (
            round(etapa["total"] / anterior * 100, 1) if anterior else None
        )

    return {"etapas": etapas, "sem_eventos": not eventos, "sessoes_ligadas": len(jogador_id_por_sessao)}
