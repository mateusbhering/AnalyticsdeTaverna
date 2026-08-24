/**
 * Cliente da API de batalha (FastAPI).
 *
 * O duelo NÃO passa pelo Supabase direto: o placar (xp/vitórias/derrotas) não
 * tem policy de UPDATE para a chave anon — de propósito, senão qualquer um
 * abriria o console e se daria 10.000 de XP. Quem escreve é o backend, com a
 * service_role. Ver `backend/sql/schema.sql`, seção RLS.
 */

/**
 * Base da API de batalha — um caminho do NOSSO domínio, não a URL da Render.
 *
 * O `/taverna-api` é reescrito pelo Next para o FastAPI (ver `next.config.ts`).
 * Falar com a própria origem tira do caminho tudo que costuma quebrar em
 * produção: CORS, conteúdo misto e — o motivo de existir — bloqueadores de
 * anúncio e filtros de DNS que derrubam domínios de hospedagem gratuita e
 * fazem o `fetch` falhar como se o servidor estivesse fora do ar.
 *
 * Dá pra apontar para outro lugar com NEXT_PUBLIC_API_URL (útil pra depurar
 * contra um backend específico), mas aí o pedido volta a ser entre origens.
 */
export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "/taverna-api";

/** Uma das 3 rodadas do confronto posicional. */
export interface Rodada {
  /** 1, 2 ou 3 — a posição no pódio de cada lutador. */
  posicao: number;
  /** Os atributos dos dois lados PODEM ser diferentes: compara-se a posição. */
  atributo_a: string;
  rotulo_a: string;
  valor_a: number;
  atributo_b: string;
  rotulo_b: string;
  valor_b: number;
  resultado: "a" | "b" | "empate";
  diferenca: number;
}

export interface LadoBatalha {
  id: number;
  nome: string | null;
  classe: string | null;
  foto_url: string | null;
}

export interface ResultadoBatalha {
  id: number | null;
  jogador_a_id: number;
  jogador_b_id: number;
  desafiante: LadoBatalha | null;
  oponente: LadoBatalha | null;
  rodadas: Rodada[];
  vitorias_a: number;
  vitorias_b: number;
  empates_rodada: number;
  /** Do ponto de vista da API: 'a' = desafiante, 'b' = oponente. */
  resultado: "a" | "b" | "empate";
  vencedor_id: number | null;
  /** XP do desafiante. */
  xp_a: number;
  /** XP do oponente. */
  xp_b: number;
  narrativa: string;
}

/* O backend fica na Render. Quando o serviço está ocioso ele hiberna, e a
   primeira requisição espera o processo subir — o que passa fácil dos 30s.
   Sem um teto explícito, o navegador é quem decide desistir, e cada um decide
   uma coisa (em rede móvel, mais cedo ainda). */
const ESPERA_MAXIMA_MS = 75_000;

/**
 * Cutuca o backend para ele sair da hibernação.
 *
 * Chamado quando o oponente aparece na tela: o tempo que a pessoa leva lendo o
 * card é o tempo que o servidor usa para acordar, então o duelo já encontra
 * tudo de pé. É um GET no /health — idempotente, barato e sem efeito nenhum
 * se o serviço já estiver acordado. Falha em silêncio de propósito: isto é
 * conforto, não requisito.
 */
export function aquecer(): void {
  void fetch(`${API_BASE}/health`, { cache: "no-store" }).catch(() => {});
}

export class ErroDeBatalha extends Error {}

/**
 * Dispara o duelo. Instantâneo e assíncrono: o oponente não precisa aceitar
 * nada — o backend resolve as 3 rodadas e já devolve o resultado gravado.
 *
 * `desafianteId` é sempre o lado A.
 */
export async function lutar(
  desafianteId: number | string,
  oponenteId: number | string,
  sinal?: AbortSignal,
): Promise<ResultadoBatalha> {
  /* Relógio próprio, encadeado no sinal de quem chamou: assim o cancelamento
     do componente continua funcionando e ainda existe um teto de espera. */
  const controle = new AbortController();
  const relogio = setTimeout(
    () => controle.abort(new DOMException("Tempo esgotado.", "TimeoutError")),
    ESPERA_MAXIMA_MS,
  );
  sinal?.addEventListener("abort", () => controle.abort(sinal.reason), { once: true });

  let resposta: Response;
  try {
    resposta = await fetch(`${API_BASE}/batalha`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jogador_a_id: Number(desafianteId),
        jogador_b_id: Number(oponenteId),
      }),
      signal: controle.signal,
    });
  } catch (erro) {
    // AbortError sobe como está: quem cancelou sabe o que fazer com ele.
    if (erro instanceof DOMException && erro.name === "AbortError") throw erro;

    /* Estourou o teto: o servidor existe, só não respondeu a tempo. Não
       tentamos de novo sozinhos — POST /batalha grava uma batalha e distribui
       XP, então uma repetição automática pode contar o duelo duas vezes se a
       primeira tiver chegado. Quem decide repetir é a pessoa, no botão. */
    if (erro instanceof DOMException && erro.name === "TimeoutError") {
      throw new ErroDeBatalha(
        "A taverna demorou demais para responder. Tente de novo em alguns instantes.",
      );
    }

    /* Aqui o pedido nem chegou a completar. São três causas bem diferentes
       com a mesma cara pro `fetch` — servidor fora do ar, CORS barrando, ou
       endereço errado — e nenhuma delas dá pra distinguir pelo objeto de erro.
       O texto na tela fica temático; o diagnóstico de verdade vai pro console,
       com o endereço tentado, senão não há como saber qual das três foi. */
    console.error(
      `[batalha] o pedido para ${API_BASE}/batalha não completou. ` +
        "Confira se o backend FastAPI está no ar nesse endereço, se ele " +
        "libera esta origem no CORS e se NEXT_PUBLIC_API_URL aponta pra ele.",
      erro,
    );
    throw new ErroDeBatalha(
      "A taverna não respondeu — o servidor da batalha parece estar fora do ar.",
    );
  } finally {
    clearTimeout(relogio);
  }

  if (!resposta.ok) {
    // O FastAPI devolve { detail: "..." }; se vier outra coisa, não quebra.
    const detalhe = await resposta
      .json()
      .then((c) => (typeof c?.detail === "string" ? c.detail : null))
      .catch(() => null);
    throw new ErroDeBatalha(detalhe ?? "Não foi possível realizar o duelo agora.");
  }

  return (await resposta.json()) as ResultadoBatalha;
}

/** XP que o desafiante levou — é o número que a tela de resultado destaca. */
export function xpDoDesafiante(resultado: ResultadoBatalha): number {
  return resultado.xp_a;
}

/** Traduz o resultado da API para o ponto de vista de quem está olhando a tela. */
export function pontoDeVistaDoDesafiante(
  resultado: ResultadoBatalha,
): "vitoria" | "derrota" | "empate" {
  if (resultado.resultado === "empate") return "empate";
  return resultado.resultado === "a" ? "vitoria" : "derrota";
}
