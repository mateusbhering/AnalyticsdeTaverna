"""Camada de acesso ao banco (Supabase / Postgres).

Todo SQL/PostgREST do projeto passa por aqui. Os routers NUNCA falam com o
Supabase direto. Vantagens:

  • Se o banco mudar (Supabase → Postgres puro), muda só este arquivo.
  • Os testes injetam um repositório em memória e rodam sem banco nenhum.
  • Fica um lugar só pra Yasmin revisar as queries.

O client do Supabase é SÍNCRONO. Chamar direto dentro de uma rota `async`
travaria o event loop do FastAPI (a API pararia de responder outros pedidos
durante a consulta). Por isso toda chamada vai via `run_in_threadpool`.
"""

from __future__ import annotations

import logging
from typing import Any, Protocol

from fastapi import HTTPException
from starlette.concurrency import run_in_threadpool

from .config import settings

log = logging.getLogger(__name__)

# Colunas que a batalha grava mas que podem não existir num banco que ainda não
# rodou o `sql/schema.sql` mais recente. Ver `criar_batalha`.
COLUNAS_OPCIONAIS = ("rodadas",)

# Teto de linhas lidas nas rotas de análise. O dashboard agrega em Python;
# sem um limite, uma tabela grande derrubaria a memória do plano da Render.
LIMITE_ANALYTICS = 5000


class Repositorio(Protocol):
    """Contrato que os routers usam. O repo de teste implementa o mesmo."""

    async def criar_jogador(self, dados: dict) -> dict: ...
    async def obter_jogador(self, jogador_id: int) -> dict | None: ...
    async def listar_jogadores(self, limite: int, offset: int) -> list[dict]: ...
    async def candidatos_para_pareamento(self, jogador_id: int, limite: int) -> list[dict]: ...
    async def aplicar_resultado(self, jogador_id: int, xp: int, resultado: str) -> dict | None: ...
    async def criar_batalha(self, dados: dict) -> dict: ...
    async def obter_batalha(self, batalha_id: int) -> dict | None: ...
    async def listar_batalhas(self, jogador_id: int | None, limite: int) -> list[dict]: ...
    async def ranking(self, limite: int) -> list[dict]: ...
    async def contar_jogadores(self) -> int: ...
    async def contar_batalhas(self) -> int: ...
    async def jogadores_para_analytics(self) -> list[dict]: ...
    async def batalhas_para_analytics(self) -> list[dict]: ...


class SupabaseRepo:
    """Implementação real, em cima do Supabase."""

    def __init__(self, client: Any):
        self.client = client

    # ── jogadores ────────────────────────────────────────────────────

    async def criar_jogador(self, dados: dict) -> dict:
        def _exec():
            return self.client.table("jogadores").insert(dados).execute()

        resposta = await run_in_threadpool(_exec)
        if not resposta.data:
            raise HTTPException(status_code=500, detail="Falha ao cadastrar o jogador.")
        return resposta.data[0]

    async def obter_jogador(self, jogador_id: int) -> dict | None:
        def _exec():
            return (
                self.client.table("jogadores")
                .select("*")
                .eq("id", jogador_id)
                .limit(1)
                .execute()
            )

        resposta = await run_in_threadpool(_exec)
        return resposta.data[0] if resposta.data else None

    async def listar_jogadores(self, limite: int = 50, offset: int = 0) -> list[dict]:
        def _exec():
            return (
                self.client.table("jogadores")
                .select("*")
                .order("criado_em", desc=True)
                .range(offset, offset + limite - 1)
                .execute()
            )

        return (await run_in_threadpool(_exec)).data or []

    async def candidatos_para_pareamento(self, jogador_id: int, limite: int = 50) -> list[dict]:
        """Pool de adversários possíveis.

        Traz os mais recentes e deixa o motor de batalha escolher o de XP mais
        próximo. Buscar TODO mundo seria caro; 50 recentes é suficiente e
        mantém o pareamento com gente ativa.
        """

        def _exec():
            return (
                self.client.table("jogadores")
                .select("*")
                .neq("id", jogador_id)
                .order("criado_em", desc=True)
                .limit(limite)
                .execute()
            )

        return (await run_in_threadpool(_exec)).data or []

    async def aplicar_resultado(self, jogador_id: int, xp: int, resultado: str) -> dict | None:
        """Soma XP e incrementa vitórias/derrotas/empates.

        Tenta primeiro a função RPC `aplicar_resultado_batalha` (soma atômica,
        feita dentro do Postgres). Se ela não existir no projeto, cai no modo
        lê-soma-grava, que funciona mas pode perder XP se duas batalhas do
        mesmo jogador terminarem no mesmo instante. Rode o `sql/schema.sql`
        para ter a versão boa.
        """
        try:
            def _rpc():
                return self.client.rpc(
                    "aplicar_resultado_batalha",
                    {"p_jogador_id": jogador_id, "p_xp": xp, "p_resultado": resultado},
                ).execute()

            resposta = await run_in_threadpool(_rpc)
            if resposta.data:
                return resposta.data if isinstance(resposta.data, dict) else resposta.data[0]
        except Exception:  # noqa: BLE001 — RPC ausente/indisponível: usa o plano B
            pass

        jogador = await self.obter_jogador(jogador_id)
        if jogador is None:
            return None

        campo = {"vitoria": "vitorias", "derrota": "derrotas", "empate": "empates"}[resultado]
        novos = {
            "xp": int(jogador.get("xp") or 0) + xp,
            campo: int(jogador.get(campo) or 0) + 1,
        }

        def _update():
            return self.client.table("jogadores").update(novos).eq("id", jogador_id).execute()

        resposta = await run_in_threadpool(_update)
        return resposta.data[0] if resposta.data else {**jogador, **novos}

    # ── batalhas ─────────────────────────────────────────────────────

    async def criar_batalha(self, dados: dict) -> dict:
        """Grava a batalha, tolerando um banco atrasado em relação ao schema.

        `rodadas` (jsonb) é coluna nova. Num projeto onde o `sql/schema.sql`
        ainda não foi rodado, o insert inteiro falha com "column
        batalhas.rodadas does not exist" — e aí o duelo devolve 500, apesar de
        o resultado já estar calculado e de as colunas antigas darem conta do
        placar. Perder o detalhe das rodadas é ruim; perder a batalha é pior.

        Então: tenta com tudo, e se o banco reclamar de uma coluna opcional,
        regrava sem ela e AVISA no log. O aviso é de propósito barulhento —
        isto é remendo até alguém rodar a migração, não um modo de operação.
        """

        def _exec(payload: dict):
            return self.client.table("batalhas").insert(payload).execute()

        try:
            resposta = await run_in_threadpool(_exec, dados)
        except Exception as erro:  # noqa: BLE001 — reclassificado logo abaixo
            ausente = _coluna_ausente(erro, dados)
            if ausente is None:
                raise
            log.warning(
                "Coluna '%s' não existe em `batalhas`: a batalha foi registrada SEM ela. "
                "Rode `sql/schema.sql` no Supabase para parar de perder esse dado.",
                ausente,
            )
            resposta = await run_in_threadpool(
                _exec, {k: v for k, v in dados.items() if k != ausente}
            )

        if not resposta.data:
            raise HTTPException(status_code=500, detail="Falha ao registrar a batalha.")
        return resposta.data[0]

    async def obter_batalha(self, batalha_id: int) -> dict | None:
        def _exec():
            return (
                self.client.table("batalhas")
                .select("*")
                .eq("id", batalha_id)
                .limit(1)
                .execute()
            )

        resposta = await run_in_threadpool(_exec)
        return resposta.data[0] if resposta.data else None

    async def listar_batalhas(self, jogador_id: int | None = None, limite: int = 20) -> list[dict]:
        def _exec():
            consulta = self.client.table("batalhas").select("*")
            if jogador_id is not None:
                # `or_` = jogador pode ter sido o lado A ou o lado B.
                consulta = consulta.or_(
                    f"jogador_a_id.eq.{jogador_id},jogador_b_id.eq.{jogador_id}"
                )
            return consulta.order("criado_em", desc=True).limit(limite).execute()

        return (await run_in_threadpool(_exec)).data or []

    # ── ranking e métricas ───────────────────────────────────────────

    async def ranking(self, limite: int = 10) -> list[dict]:
        def _exec():
            return (
                self.client.table("jogadores")
                .select("id,nome,classe,xp,vitorias,derrotas,empates,foto_url")
                .order("xp", desc=True)
                .order("vitorias", desc=True)
                .limit(limite)
                .execute()
            )

        return (await run_in_threadpool(_exec)).data or []

    async def contar_jogadores(self) -> int:
        def _exec():
            return self.client.table("jogadores").select("id", count="exact").limit(1).execute()

        return (await run_in_threadpool(_exec)).count or 0

    async def contar_batalhas(self) -> int:
        def _exec():
            return self.client.table("batalhas").select("id", count="exact").limit(1).execute()

        return (await run_in_threadpool(_exec)).count or 0

    async def jogadores_para_analytics(self) -> list[dict]:
        def _exec():
            return (
                self.client.table("jogadores")
                .select("*")
                .limit(LIMITE_ANALYTICS)
                .execute()
            )

        return (await run_in_threadpool(_exec)).data or []

    async def batalhas_para_analytics(self) -> list[dict]:
        def _exec():
            return (
                self.client.table("batalhas")
                .select("*")
                .limit(LIMITE_ANALYTICS)
                .execute()
            )

        return (await run_in_threadpool(_exec)).data or []


def _coluna_ausente(erro: Exception, dados: dict) -> str | None:
    """Descobre se `erro` é "essa coluna não existe" de uma coluna opcional.

    O PostgREST devolve 42703 com a mensagem do Postgres ("column X does not
    exist") ou PGRST204 quando o cache de schema dele está desatualizado. A
    checagem é pelo texto porque o tipo da exceção varia com a versão do
    supabase-py — e um erro de rede não pode ser confundido com este.
    """
    texto = str(erro).lower()
    if "does not exist" not in texto and "schema cache" not in texto:
        return None
    return next((c for c in COLUNAS_OPCIONAIS if c in dados and c in texto), None)


# ─────────────────────────────────────────────────────────────────────────────
# Dependência do FastAPI
# ─────────────────────────────────────────────────────────────────────────────

_repo_singleton: SupabaseRepo | None = None


def get_repo() -> Repositorio:
    """Injetado nas rotas com `Depends(get_repo)`.

    Nos testes, sobrescrevemos com `app.dependency_overrides[get_repo] = ...`
    e nenhuma linha de rota precisa mudar.
    """
    global _repo_singleton

    if _repo_singleton is not None:
        return _repo_singleton

    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise HTTPException(
            status_code=503,
            detail=(
                "Banco não configurado. Defina SUPABASE_URL e "
                "SUPABASE_SERVICE_ROLE_KEY no ambiente (veja .env.example)."
            ),
        )

    from supabase import create_client  # import tardio: só quando há config

    client = create_client(settings.supabase_url, settings.supabase_service_role_key)
    _repo_singleton = SupabaseRepo(client)
    return _repo_singleton
