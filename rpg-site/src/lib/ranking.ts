import { unstable_cache } from "next/cache";
import { BACKEND_URL } from "./backend-url";
import { RANKING_TAG } from "./cache-tags";

/**
 * Leitura do ranking global. SÓ SERVIDOR.
 *
 * Vai direto ao FastAPI pela URL absoluta, sem passar pelo rewrite: o proxy
 * existe para tirar o navegador de uma requisição entre origens, e aqui não há
 * navegador nenhum. É um salto a menos e uma origem a menos para dar errado.
 *
 * Quem calcula posição, total de batalhas e taxa de vitória é o backend
 * (`routers/ranking.py`) — a tela só desenha. Assim o critério de desempate
 * mora num lugar só.
 */

/** Espelha `ItemRanking` do backend (`app/schemas.py`). */
export interface ItemRanking {
  posicao: number;
  id: number;
  nome: string | null;
  classe: string | null;
  xp: number;
  vitorias: number;
  derrotas: number;
  empates: number;
  total_batalhas: number;
  taxa_vitoria: number;
  foto_url: string | null;
}

/**
 * Três desfechos, não dois: "ninguém pontuou ainda" e "a API caiu" pedem telas
 * diferentes. Colapsar os dois em `null` faria a taverna anunciar pergaminho
 * em branco toda vez que o backend hibernasse — mentira contada com confiança.
 */
export type ResultadoRanking =
  | { estado: "ok"; itens: ItemRanking[] }
  | { estado: "vazio" }
  | { estado: "erro" };

/** Quantos postos o quadro mostra. */
export const LIMITE_RANKING = 10;

async function buscarRanking(): Promise<ResultadoRanking> {
  try {
    const resposta = await fetch(`${BACKEND_URL}/ranking?limite=${LIMITE_RANKING}`, {
      headers: { Accept: "application/json" },
      // O cache de dados do Next é o `unstable_cache` lá embaixo; deixar o
      // fetch cachear também esconderia a invalidação por tag.
      cache: "no-store",
    });

    if (!resposta.ok) {
      console.error(`[ranking] ${resposta.status} ${resposta.statusText} em ${BACKEND_URL}/ranking`);
      return { estado: "erro" };
    }

    const itens = (await resposta.json()) as ItemRanking[];
    if (!Array.isArray(itens)) {
      console.error("[ranking] resposta não é uma lista:", itens);
      return { estado: "erro" };
    }

    return itens.length ? { estado: "ok", itens } : { estado: "vazio" };
  } catch (erro) {
    // Backend fora do ar, hibernando ou DNS falhando. A página continua de pé
    // e diz que o problema é nosso — nunca que a taverna está vazia.
    console.error(`[ranking] falha ao consultar ${BACKEND_URL}/ranking`, erro);
    return { estado: "erro" };
  }
}

/**
 * O `revalidate` é rede de segurança, não o mecanismo principal: a atualização
 * de verdade vem por evento, quando um duelo termina e a Server Action expira
 * a tag (lib/ranking-actions.ts). Os 60s cobrem o que não passa pelo app — uma
 * batalha feita direto na API, por exemplo — e o caso de a action falhar.
 *
 * Um erro também fica cacheado por até 60s. É de propósito: se o backend está
 * hibernando, martelar a cada visita não o acorda mais rápido.
 */
export const getRanking = unstable_cache(buscarRanking, ["ranking"], {
  revalidate: 60,
  tags: [RANKING_TAG],
});
