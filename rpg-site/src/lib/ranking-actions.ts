"use server";

import { updateTag } from "next/cache";
import { RANKING_TAG } from "./cache-tags";

/**
 * Derruba o cache do ranking assim que um duelo termina.
 *
 * `updateTag` e não `revalidateTag`, pelo mesmo motivo de `stats-actions.ts`:
 * o segundo ainda serviria o número velho para quem chegasse primeiro. Aqui
 * isso seria bem visível — a arena mostra "+30 XP" e oferece "Ver o ranking"
 * na tela seguinte; encontrar o XP antigo faria o duelo parecer não ter
 * contado.
 */
export async function avisarBatalhaConcluida() {
  updateTag(RANKING_TAG);
}
