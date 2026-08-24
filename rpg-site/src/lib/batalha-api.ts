/**
 * Cliente da API de batalha (FastAPI).
 *
 * O duelo NÃO passa pelo Supabase direto: o placar (xp/vitórias/derrotas) não
 * tem policy de UPDATE para a chave anon — de propósito, senão qualquer um
 * abriria o console e se daria 10.000 de XP. Quem escreve é o backend, com a
 * service_role. Ver `backend/sql/schema.sql`, seção RLS.
 */

/** URL do backend Python. Em produção, defina NEXT_PUBLIC_API_URL na Vercel. */
export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.NEXT_PUBLIC_AVATAR_API_URL ??
  "http://localhost:8000";

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
  let resposta: Response;
  try {
    resposta = await fetch(`${API_BASE}/batalha`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jogador_a_id: Number(desafianteId),
        jogador_b_id: Number(oponenteId),
      }),
      signal: sinal,
    });
  } catch (erro) {
    // AbortError sobe como está: quem cancelou sabe o que fazer com ele.
    if (erro instanceof DOMException && erro.name === "AbortError") throw erro;
    throw new ErroDeBatalha(
      "A taverna não respondeu. Verifique a conexão e tente de novo.",
    );
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
