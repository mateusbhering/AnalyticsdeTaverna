"""Modelos de entrada e saída da API (Pydantic).

Para que servem: o FastAPI usa estas classes para (1) validar o que chega —
se o front mandar texto onde era número, a resposta é um 422 explicando o
erro, e nada quebra dentro da rota; e (2) gerar a documentação automática em
/docs, que é o contrato que Mateus vai consumir no frontend.
"""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

from .domain.batalha import ATRIBUTOS_VALIDOS, RODADAS

# Os 7 atributos do card. Literal em vez de `str` para o /docs listar as opções
# e o 422 sair antes de a rota rodar.
AtributoCard = Literal[
    "forca", "inteligencia", "agilidade", "resistencia", "carisma", "sabedoria", "caos"
]


# ─────────────────────────────────────────────────────────────────────────────
# Geração de personagem
# ─────────────────────────────────────────────────────────────────────────────

class Dimensoes(BaseModel):
    """As 10 dimensões que o quiz produz. Tudo opcional (default 0)."""

    lideranca: int = 0
    estrategia: int = 0
    disciplina: int = 0
    persistencia: int = 0
    sociabilidade: int = 0
    empatia: int = 0
    adaptabilidade: int = 0
    criatividade: int = 0
    impulsividade: int = 0
    percepcao: int = 0


class GerarPersonagemRequest(BaseModel):
    dimensoes: Dimensoes
    tags: list[str] = Field(
        default_factory=list,
        description="Tags acumuladas nas respostas (ex.: ['NERD', 'ZEN']).",
    )


class Atributos(BaseModel):
    forca: int
    inteligencia: int
    agilidade: int
    resistencia: int
    carisma: int
    sabedoria: int
    caos: int


class PersonagemResponse(BaseModel):
    classe: str
    origem_classificacao: Literal["regra", "dimensao_dominante"]
    atributos: Atributos
    dimensoes: Dimensoes


# ─────────────────────────────────────────────────────────────────────────────
# Cadastro de jogador
# ─────────────────────────────────────────────────────────────────────────────

class CadastroRequest(BaseModel):
    """Cadastro do jogador.

    O front pode mandar as `dimensoes` e deixar a API calcular atributos e
    classe (recomendado — uma fonte da verdade só), ou mandar `atributos` e
    `classe` já prontos. Se mandar os dois, as dimensões vencem.
    """

    nome: str | None = Field(default=None, max_length=60)
    dimensoes: Dimensoes | None = None
    tags: list[str] = Field(default_factory=list)
    atributos: Atributos | None = None
    classe: str | None = None
    foto_url: str | None = None


class JogadorResponse(BaseModel):
    id: int
    nome: str | None = None
    classe: str | None = None
    xp: int = 0
    vitorias: int = 0
    derrotas: int = 0
    empates: int = 0
    foto_url: str | None = None
    criado_em: str | None = None

    forca: int | None = None
    inteligencia: int | None = None
    agilidade: int | None = None
    resistencia: int | None = None
    carisma: int | None = None
    sabedoria: int | None = None
    caos: int | None = None


# ─────────────────────────────────────────────────────────────────────────────
# Batalha
# ─────────────────────────────────────────────────────────────────────────────

class PareamentoRequest(BaseModel):
    jogador_id: int


class OponenteResponse(BaseModel):
    jogador_id: int
    oponente: JogadorResponse
    atributos_disponiveis: list[str] = Field(default=list(ATRIBUTOS_VALIDOS))


class BatalhaRequest(BaseModel):
    """Pedido de batalha. O desafiante é sempre o lado A — quem escolheu.

    `atributos` são os 3 do card que ele apontou. A repetição é barrada no
    motor (`validar_escolha`), não aqui: o Pydantic garante a quantidade e os
    nomes, mas a mensagem de "escolheu o mesmo duas vezes" fica melhor vinda de
    um lugar só, junto das outras regras de escolha.
    """

    jogador_a_id: int
    jogador_b_id: int
    atributos: list[AtributoCard] = Field(min_length=RODADAS, max_length=RODADAS)


class RodadaResponse(BaseModel):
    """Uma das 3 rodadas — o MESMO atributo dos dois lados."""

    atributo: str
    rotulo: str
    valor_a: int
    valor_b: int
    vencedor: Literal["a", "b", "empate"]
    diferenca: int


class LadoBatalha(BaseModel):
    """Quem lutou — o suficiente pro front montar a tela sem outra chamada."""

    id: int
    nome: str | None = None
    classe: str | None = None
    foto_url: str | None = None


class BatalhaResponse(BaseModel):
    id: int | None = None
    jogador_a_id: int
    jogador_b_id: int
    desafiante: LadoBatalha | None = None
    oponente: LadoBatalha | None = None
    atributos: list[str] = Field(min_length=RODADAS, max_length=RODADAS)
    rodadas: list[RodadaResponse] = Field(min_length=RODADAS, max_length=RODADAS)
    vitorias_a: int
    vitorias_b: int
    empates_rodada: int
    resultado: Literal["a", "b", "empate"]
    vencedor_id: int | None = None
    xp_a: int
    xp_b: int
    narrativa: str


# ─────────────────────────────────────────────────────────────────────────────
# Ranking
# ─────────────────────────────────────────────────────────────────────────────

class ItemRanking(BaseModel):
    posicao: int
    id: int
    nome: str | None = None
    classe: str | None = None
    xp: int = 0
    vitorias: int = 0
    derrotas: int = 0
    empates: int = 0
    total_batalhas: int = 0
    taxa_vitoria: float = 0.0
    foto_url: str | None = None


# ─────────────────────────────────────────────────────────────────────────────
# Funil de conversão (entregável 9 — analytics)
#
# Só cobre as etapas ANTES do cadastro em `jogadores`: uma vez que o jogador
# existe, "personagem salvo" e "duelou ao menos uma vez" já são deriváveis de
# `jogadores`/`batalhas` (ver `routers/analytics.py::funil`). Rastrear de novo
# duplicaria dado que o banco já tem.
# ─────────────────────────────────────────────────────────────────────────────

EventoFunil = Literal["inicio", "foto_capturada", "quiz_concluido", "avatar_gerado", "avatar_falhou"]


class EventoFunilRequest(BaseModel):
    """Um evento do funil, disparado pelo frontend em cada etapa do fluxo.

    `sessao_id` é gerado no navegador (sessionStorage) e não identifica a
    pessoa — só amarra os eventos de UMA passada pelo quiz, para o funil
    contar sessões distintas por etapa em vez de linhas soltas. Uma pessoa que
    tenta duas vezes gera duas sessões, e isso é o comportamento certo: cada
    tentativa é uma entrada nova no topo do funil.
    """

    sessao_id: str = Field(min_length=1, max_length=100)
    evento: EventoFunil

