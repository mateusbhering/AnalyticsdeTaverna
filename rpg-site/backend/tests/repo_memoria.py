"""Repositório em memória — o "banco de mentirinha" dos testes.

Implementa o mesmo contrato do `SupabaseRepo`, mas guardando tudo em listas
Python. Assim a suíte roda em milissegundos, sem Supabase, sem internet e sem
sujar o banco real com dados de teste.
"""

from __future__ import annotations

from datetime import datetime, timezone


class RepoMemoria:
    def __init__(self):
        self.jogadores: list[dict] = []
        self.batalhas: list[dict] = []
        self._proximo_jogador = 1
        self._proxima_batalha = 1

    # ── helpers de teste ─────────────────────────────────────────────

    def semear_jogador(self, **campos) -> dict:
        """Cria um jogador direto, sem passar pela API. Útil para preparar cenário."""
        base = {
            "nome": f"Jogador {self._proximo_jogador}",
            "classe": "Mago do ChatGPT",
            "xp": 0,
            "vitorias": 0,
            "derrotas": 0,
            "empates": 0,
            "inteligencia": 10,
            "carisma": 10,
            "estrategia": 10,
            "criatividade": 10,
            "caos": 10,
        }
        base.update(campos)
        return self._inserir_jogador(base)

    def _inserir_jogador(self, dados: dict) -> dict:
        registro = {
            "id": self._proximo_jogador,
            "criado_em": datetime.now(timezone.utc).isoformat(),
            **dados,
        }
        self._proximo_jogador += 1
        self.jogadores.append(registro)
        return registro

    # ── contrato Repositorio ─────────────────────────────────────────

    async def criar_jogador(self, dados: dict) -> dict:
        return self._inserir_jogador(dados)

    async def obter_jogador(self, jogador_id: int) -> dict | None:
        return next((j for j in self.jogadores if j["id"] == jogador_id), None)

    async def listar_jogadores(self, limite: int = 20, offset: int = 0) -> list[dict]:
        return list(reversed(self.jogadores))[offset : offset + limite]

    async def candidatos_para_pareamento(self, jogador_id: int, limite: int = 50) -> list[dict]:
        return [j for j in self.jogadores if j["id"] != jogador_id][:limite]

    async def aplicar_resultado(self, jogador_id: int, xp: int, resultado: str) -> dict | None:
        jogador = await self.obter_jogador(jogador_id)
        if jogador is None:
            return None
        campo = {"vitoria": "vitorias", "derrota": "derrotas", "empate": "empates"}[resultado]
        jogador["xp"] = int(jogador.get("xp") or 0) + xp
        jogador[campo] = int(jogador.get(campo) or 0) + 1
        return jogador

    async def criar_batalha(self, dados: dict) -> dict:
        registro = {
            "id": self._proxima_batalha,
            "criado_em": datetime.now(timezone.utc).isoformat(),
            **dados,
        }
        self._proxima_batalha += 1
        self.batalhas.append(registro)
        return registro

    async def obter_batalha(self, batalha_id: int) -> dict | None:
        return next((b for b in self.batalhas if b["id"] == batalha_id), None)

    async def listar_batalhas(self, jogador_id: int | None = None, limite: int = 20) -> list[dict]:
        itens = list(reversed(self.batalhas))
        if jogador_id is not None:
            itens = [
                b
                for b in itens
                if jogador_id in (b.get("jogador_a_id"), b.get("jogador_b_id"))
            ]
        return itens[:limite]

    async def ranking(self, limite: int = 10) -> list[dict]:
        ordenado = sorted(
            self.jogadores,
            key=lambda j: (int(j.get("xp") or 0), int(j.get("vitorias") or 0)),
            reverse=True,
        )
        return ordenado[:limite]

    async def contar_jogadores(self) -> int:
        return len(self.jogadores)

    async def contar_batalhas(self) -> int:
        return len(self.batalhas)

    async def jogadores_para_analytics(self) -> list[dict]:
        return list(self.jogadores)

    async def batalhas_para_analytics(self) -> list[dict]:
        return list(self.batalhas)
