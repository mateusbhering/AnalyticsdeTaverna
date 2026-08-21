"use server";

import { updateTag } from "next/cache";
import { PLAYER_STATS_TAG } from "./cache-tags";

/**
 * Derruba o cache do dashboard depois que um personagem novo entra no banco.
 *
 * `updateTag` e não `revalidateTag`: o segundo marca a entrada como velha e
 * ainda entrega o número antigo a quem chegar primeiro, buscando o novo por
 * baixo. Este expira na hora, então a próxima visita já lê o total atualizado
 * — que é o ponto de invalidar por evento em vez de por tempo. Em troca, essa
 * primeira visita espera a consulta ao Supabase.
 *
 * Só funciona dentro de uma Server Action; em Route Handler o Next lança.
 */
export async function avisarNovoJogador() {
  updateTag(PLAYER_STATS_TAG);
}
