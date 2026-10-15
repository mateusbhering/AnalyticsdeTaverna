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

# Colunas de `jogadores` que vieram depois da tabela original. Um banco que
# ainda não rodou o `sql/schema.sql` recusa o insert com "column ... does not
# exist"; o cadastro então grava o formato antigo em vez de perder o jogador.
COLUNAS_JOGADOR_OPCIONAIS = (
    "tags",
    "sessao_funil_id",
    "lideranca",
    "estrategia",
    "disciplina",
    "persistencia",
    "sociabilidade",
    "empatia",
    "adaptabilidade",
    "criatividade",
    "impulsividade",
    "percepcao",
)

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
    async def registrar_evento_funil(self, dados: dict) -> dict: ...
    async def eventos_funil_para_analytics(self) -> list[dict]: ...
    async def adicionar_xp(self, jogador_id: int, xp: int) -> dict | None: ...
    async def conquistas_do_jogador(self, jogador_id: int) -> list[dict]: ...
    async def registrar_conquistas(self, jogador_id: int, codigos: list[str]) -> list[str]: ...
    async def missao_concluida(self, jogador_id: int, dia: str) -> dict | None: ...
    async def registrar_missao(self, jogador_id: int, dia: str, codigo: str, xp: int) -> bool: ...
    async def contar_missoes_concluidas(self, jogador_id: int) -> int: ...


class SupabaseRepo:
    """Implementação real, em cima do Supabase."""

    def __init__(self, client: Any):
        self.client = client

    # ── jogadores ────────────────────────────────────────────────────

    async def criar_jogador(self, dados: dict) -> dict:
        def _exec(linha: dict):
            return self.client.table("jogadores").insert(linha).execute()

        try:
            resposta = await run_in_threadpool(_exec, dados)
        except Exception as erro:  # noqa: BLE001 — só tolera coluna ausente
            texto = str(erro).lower()
            ausentes = [c for c in COLUNAS_JOGADOR_OPCIONAIS if c in dados]
            if ("does not exist" not in texto and "schema cache" not in texto) or not ausentes:
                raise
            log.warning(
                "`jogadores` sem colunas novas — rode sql/schema.sql. Cadastrando sem: %s",
                ", ".join(ausentes),
            )
            sem_novas = {k: v for k, v in dados.items() if k not in COLUNAS_JOGADOR_OPCIONAIS}
            resposta = await run_in_threadpool(_exec, sem_novas)
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

    # ── funil de conversão ───────────────────────────────────────────

    async def registrar_evento_funil(self, dados: dict) -> dict:
        """Grava um evento do funil, tolerando um banco sem a tabela ainda.

        Mesmo espírito de `criar_batalha` com `rodadas`: `eventos_funil` é
        tabela nova, e um projeto que ainda não rodou o `sql/schema.sql` não
        pode ter o quiz inteiro quebrando por causa de uma métrica. Se a
        tabela não existir, avisa no log e segue — o funil fica sem dado até
        a migração rodar, mas ninguém trava no meio do jogo por isso.
        """

        def _exec(linha: dict):
            return self.client.table("eventos_funil").insert(linha).execute()

        try:
            try:
                resposta = await run_in_threadpool(_exec, dados)
            except Exception as erro:  # noqa: BLE001 — decide abaixo se é tolerável
                texto = str(erro).lower()
                colunas_novas = [c for c in COLUNAS_EVENTO_OPCIONAIS if c in dados and c in texto]
                if ("does not exist" in texto or "schema cache" in texto) and colunas_novas:
                    # Banco sem as colunas de compartilhamento: grava o evento
                    # sem elas (perde a atribuição, mantém o funil).
                    log.warning(
                        "Colunas %s ausentes em `eventos_funil` — rode sql/schema.sql.", colunas_novas
                    )
                    sem_colunas = {k: v for k, v in dados.items() if k not in COLUNAS_EVENTO_OPCIONAIS}
                    resposta = await run_in_threadpool(_exec, sem_colunas)
                elif "check constraint" in texto:
                    # CHECK antigo ainda não conhece os eventos de compartilhamento.
                    log.warning(
                        "CHECK de `eventos_funil` desatualizado: evento '%s' não gravado. "
                        "Rode `sql/schema.sql` no Supabase.",
                        dados.get("evento"),
                    )
                    return dados
                else:
                    raise
        except Exception as erro:  # noqa: BLE001 — log e segue, ver docstring
            texto = str(erro).lower()
            if "does not exist" not in texto and "schema cache" not in texto:
                raise
            log.warning(
                "Tabela `eventos_funil` não existe ainda: evento '%s' não foi gravado. "
                "Rode `sql/schema.sql` no Supabase para habilitar o funil.",
                dados.get("evento"),
            )
            return dados

        return resposta.data[0] if resposta.data else dados

    async def eventos_funil_para_analytics(self) -> list[dict]:
        def _exec(colunas: str):
            return (
                self.client.table("eventos_funil")
                .select(colunas)
                .limit(LIMITE_ANALYTICS)
                .execute()
            )

        # Banco sem as colunas de compartilhamento: cai para o select antigo
        # (o funil segue; só a atribuição por origem fica vazia).
        for colunas in ("sessao_id,evento,origem,ref_jogador_id", "sessao_id,evento"):
            try:
                return (await run_in_threadpool(_exec, colunas)).data or []
            except Exception as erro:  # noqa: BLE001 — tabela/coluna ausente
                texto = str(erro).lower()
                if "does not exist" not in texto and "schema cache" not in texto:
                    raise
        return []


    # ── ludificação: XP bônus, conquistas, missões ───────────────────

    async def adicionar_xp(self, jogador_id: int, xp: int) -> dict | None:
        """Soma XP sem mexer em vitórias/derrotas (bônus de missão)."""
        jogador = await self.obter_jogador(jogador_id)
        if jogador is None:
            return None

        def _update():
            return (
                self.client.table("jogadores")
                .update({"xp": int(jogador.get("xp") or 0) + xp})
                .eq("id", jogador_id)
                .execute()
            )

        resposta = await run_in_threadpool(_update)
        return resposta.data[0] if resposta.data else None

    async def conquistas_do_jogador(self, jogador_id: int) -> list[dict]:
        def _exec():
            return (
                self.client.table("conquistas")
                .select("codigo,desbloqueada_em")
                .eq("jogador_id", jogador_id)
                .execute()
            )

        try:
            return (await run_in_threadpool(_exec)).data or []
        except Exception as erro:  # noqa: BLE001 — tabela ausente = sem conquistas gravadas
            if not _tabela_ausente(erro):
                raise
            return []

    async def registrar_conquistas(self, jogador_id: int, codigos: list[str]) -> list[str]:
        """Grava as conquistas que o jogador ainda não tinha; devolve só as NOVAS.

        Sem a tabela (banco que não rodou o schema) devolve `[]`: nada é
        anunciado como novo, porque não haveria como lembrar que já foi.
        """
        ja_tem = {c["codigo"] for c in await self.conquistas_do_jogador(jogador_id)}
        novas = [c for c in dict.fromkeys(codigos) if c not in ja_tem]
        if not novas:
            return []

        def _exec():
            return (
                self.client.table("conquistas")
                .insert([{"jogador_id": jogador_id, "codigo": c} for c in novas])
                .execute()
            )

        try:
            await run_in_threadpool(_exec)
        except Exception as erro:  # noqa: BLE001
            if _tabela_ausente(erro):
                log.warning("Tabela `conquistas` não existe — rode sql/schema.sql.")
                return []
            raise
        return novas

    async def missao_concluida(self, jogador_id: int, dia: str) -> dict | None:
        def _exec():
            return (
                self.client.table("missoes_concluidas")
                .select("codigo,xp,dia")
                .eq("jogador_id", jogador_id)
                .eq("dia", dia)
                .limit(1)
                .execute()
            )

        try:
            dados = (await run_in_threadpool(_exec)).data or []
        except Exception as erro:  # noqa: BLE001
            if not _tabela_ausente(erro):
                raise
            return None
        return dados[0] if dados else None

    async def registrar_missao(self, jogador_id: int, dia: str, codigo: str, xp: int) -> bool:
        """Marca a missão do dia como cumprida. `False` = já estava (ou sem tabela).

        A unicidade (jogador, dia) fica no banco: duas batalhas simultâneas não
        pagam o bônus duas vezes — a segunda inserção falha e devolve `False`.
        """

        def _exec():
            return (
                self.client.table("missoes_concluidas")
                .insert({"jogador_id": jogador_id, "dia": dia, "codigo": codigo, "xp": xp})
                .execute()
            )

        try:
            await run_in_threadpool(_exec)
        except Exception as erro:  # noqa: BLE001
            texto = str(erro).lower()
            if _tabela_ausente(erro):
                log.warning("Tabela `missoes_concluidas` não existe — rode sql/schema.sql.")
                return False
            if "duplicate" in texto or "unique" in texto or "23505" in texto:
                return False
            raise
        return True

    async def contar_missoes_concluidas(self, jogador_id: int) -> int:
        def _exec():
            return (
                self.client.table("missoes_concluidas")
                .select("dia", count="exact")
                .eq("jogador_id", jogador_id)
                .execute()
            )

        try:
            resposta = await run_in_threadpool(_exec)
        except Exception as erro:  # noqa: BLE001
            if not _tabela_ausente(erro):
                raise
            return 0
        return int(resposta.count or len(resposta.data or []))


COLUNAS_EVENTO_OPCIONAIS = ("origem", "ref_jogador_id")


def _tabela_ausente(erro: Exception) -> bool:
    texto = str(erro).lower()
    return "does not exist" in texto or "schema cache" in texto or "could not find the table" in texto


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
