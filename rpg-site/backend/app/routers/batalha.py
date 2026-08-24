"""Rotas do sistema de batalha (entregável 5).

  POST /batalha/parear          — matchmaking: acha um adversário
  POST /batalha                 — resolve o confronto e registra tudo
  GET  /batalha/atributos       — atributos disputáveis
  GET  /batalha/{id}            — detalhe de uma batalha
  GET  /batalha/historico/{id}  — últimas batalhas de um jogador

Fluxo de uma partida (assíncrono e instantâneo):
  1. o desafiante escaneia o QR do card do oponente → /batalha?oponenteId=N
  2. front chama POST /batalha com os dois ids      → recebe o resultado pronto

Não há escolha de atributo nem convite a aceitar: o confronto é POSICIONAL
(os 3 maiores de cada um, 1º contra 1º) e o oponente não tem ação ativa nem
estado pendente. Quem quiser achar um adversário sem QR ainda usa /parear.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query

from ..domain import batalha as motor
from ..repo import Repositorio, get_repo
from ..schemas import BatalhaRequest, BatalhaResponse, OponenteResponse, PareamentoRequest

router = APIRouter(prefix="/batalha", tags=["batalha"])


@router.get("/atributos")
async def atributos_disputaveis():
    """Os atributos que entram no confronto e as regras de XP.

    O front usa isto para legendas e para a tela de regras — ninguém *escolhe*
    atributo, mas mostrar quais estão em jogo ajuda a explicar o resultado.
    """
    return {
        "atributos": [
            {"chave": chave, "rotulo": motor.RÓTULOS[chave]}
            for chave in motor.ATRIBUTOS_VALIDOS
        ],
        "rodadas": motor.RODADAS,
        "formato": "posicional",
        "xp": {
            "vitoria": motor.XP_VITORIA,
            "empate": motor.XP_EMPATE,
            "derrota": motor.XP_DERROTA,
        },
    }


@router.post("/parear", response_model=OponenteResponse)
async def parear(payload: PareamentoRequest, repo: Repositorio = Depends(get_repo)):
    """Matchmaking: escolhe um adversário com XP próximo ao do jogador."""
    jogador = await repo.obter_jogador(payload.jogador_id)
    if jogador is None:
        raise HTTPException(status_code=404, detail="Jogador não encontrado.")

    candidatos = await repo.candidatos_para_pareamento(payload.jogador_id, limite=50)
    oponente = motor.parear(jogador, candidatos)

    if oponente is None:
        raise HTTPException(
            status_code=404,
            detail="Ainda não há outro jogador disponível para batalhar.",
        )

    return {"jogador_id": payload.jogador_id, "oponente": oponente}


@router.post("", response_model=BatalhaResponse, status_code=201)
async def batalhar(payload: BatalhaRequest, repo: Repositorio = Depends(get_repo)):
    """Resolve o confronto posicional, atualiza o placar dos dois e registra.

    O lado A é o desafiante (quem escaneou o QR). Instantâneo: entra o pedido,
    sai o resultado — o oponente não precisa fazer nada.
    """
    if payload.jogador_a_id == payload.jogador_b_id:
        raise HTTPException(status_code=422, detail="Um jogador não pode batalhar contra si mesmo.")

    jogador_a = await repo.obter_jogador(payload.jogador_a_id)
    jogador_b = await repo.obter_jogador(payload.jogador_b_id)

    if jogador_a is None or jogador_b is None:
        faltando = payload.jogador_a_id if jogador_a is None else payload.jogador_b_id
        raise HTTPException(status_code=404, detail=f"Jogador {faltando} não encontrado.")

    # 1. Decide o vencedor (regra pura, sem banco).
    resultado = motor.resolver(jogador_a, jogador_b)

    # 2. Registra a batalha ANTES de mexer no placar. Se o insert falhar, o XP
    #    não foi distribuído — melhor uma batalha perdida do que XP fantasma.
    #
    #    As colunas `atributo`/`valor_a`/`valor_b` são do formato antigo (um
    #    atributo só) e continuam `not null` no schema. No formato posicional
    #    elas guardam o PLACAR de rodadas; o detalhe das 3 vai em `rodadas`
    #    (jsonb). Assim as linhas antigas seguem legíveis e o histórico novo
    #    não perde informação.
    registro = await repo.criar_batalha(
        {
            "jogador_a_id": payload.jogador_a_id,
            "jogador_b_id": payload.jogador_b_id,
            "atributo": "posicional",
            "valor_a": resultado["vitorias_a"],
            "valor_b": resultado["vitorias_b"],
            "rodadas": resultado["rodadas"],
            "resultado": resultado["resultado"],
            "vencedor_id": resultado["vencedor_id"],
            "xp_a": resultado["xp_a"],
            "xp_b": resultado["xp_b"],
        }
    )

    # 3. Atualiza XP e contadores dos dois lados. O oponente não age, mas o
    #    duelo aconteceu de verdade: o placar dele muda junto, senão o ranking
    #    premiaria quem nunca é escaneado.
    await repo.aplicar_resultado(
        payload.jogador_a_id,
        resultado["xp_a"],
        motor.resultado_para(resultado["resultado"], "a"),
    )
    await repo.aplicar_resultado(
        payload.jogador_b_id,
        resultado["xp_b"],
        motor.resultado_para(resultado["resultado"], "b"),
    )

    return {
        "id": registro.get("id"),
        "jogador_a_id": payload.jogador_a_id,
        "jogador_b_id": payload.jogador_b_id,
        "desafiante": _lado(jogador_a),
        "oponente": _lado(jogador_b),
        **{
            k: resultado[k]
            for k in (
                "rodadas",
                "vitorias_a",
                "vitorias_b",
                "empates_rodada",
                "resultado",
                "vencedor_id",
                "xp_a",
                "xp_b",
                "narrativa",
            )
        },
    }


def _lado(jogador: dict) -> dict:
    """Só o que a tela de resultado precisa mostrar de cada lutador."""
    return {
        "id": jogador["id"],
        "nome": jogador.get("nome"),
        "classe": jogador.get("classe"),
        "foto_url": jogador.get("foto_url"),
    }


@router.get("/historico/{jogador_id}")
async def historico(
    jogador_id: int,
    limite: int = Query(20, ge=1, le=100),
    repo: Repositorio = Depends(get_repo),
):
    """Últimas batalhas do jogador, tenha ele sido o lado A ou o lado B."""
    batalhas = await repo.listar_batalhas(jogador_id=jogador_id, limite=limite)
    return {"jogador_id": jogador_id, "total": len(batalhas), "batalhas": batalhas}


@router.get("/{batalha_id}")
async def detalhe(batalha_id: int, repo: Repositorio = Depends(get_repo)):
    registro = await repo.obter_batalha(batalha_id)
    if registro is None:
        raise HTTPException(status_code=404, detail="Batalha não encontrada.")
    return registro
