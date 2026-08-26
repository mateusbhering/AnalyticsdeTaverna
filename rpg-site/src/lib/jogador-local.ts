"use client";

import { useMemo, useSyncExternalStore } from "react";

/**
 * O que este aparelho sabe sobre o jogador que está usando ele.
 *
 * Só o `id` sobrevive a um QR escaneado, a uma aba fechada e a um link colado —
 * por isso ele é a única chave de recuperação de estado do jogo. Tudo que a
 * "visão do dono" precisa é derivável dele (classe, atributos, retrato vêm da
 * linha em `jogadores`); as tags são a exceção histórica, ver `lerTags`.
 */

/** Id do jogador deste aparelho, gravado ao terminar o quiz (CharacterResult). */
export const CHAVE_MEU_ID = "taverna:jogadorId";

/** Uma referência só para "sem tags": evita um array novo a cada render. */
const VAZIO: string[] = [];

/** Prefixo do espelho local das tags — `taverna:tags:{id}`. */
const CHAVE_TAGS = "taverna:tags";

/**
 * Guarda o id deste jogador no aparelho. A página /batalha precisa saber QUEM
 * está desafiando — sem isso não dá para impedir que alguém escaneie o próprio
 * QR nem para registrar a batalha depois. E /personagem precisa disso para
 * reconhecer o dono do card e mostrar os botões de ação.
 *
 * Fica em localStorage (e não em sessionStorage, como o dedup do save) porque a
 * pessoa fecha a aba e volta para desafiar alguém mais tarde no evento.
 *
 * As tags vão junto como ESPELHO: a coluna `jogadores.tags` é nova, e o RLS não
 * tem policy de update para `anon` — logo as linhas criadas antes da migração
 * não têm como ser preenchidas pelo frontend. Este espelho cobre o jogador
 * atual daquele aparelho enquanto as linhas novas não dominam.
 */
export function lembrarJogador(id: string, tags: string[] = []) {
  try {
    localStorage.setItem(CHAVE_MEU_ID, id);
    if (tags.length) localStorage.setItem(`${CHAVE_TAGS}:${id}`, JSON.stringify(tags));
  } catch {
    // Modo privado / storage bloqueado: seguimos sem lembrar.
  }
}

export function lerMeuId(): string | null {
  try {
    return localStorage.getItem(CHAVE_MEU_ID);
  } catch {
    return null; // modo privado / storage bloqueado
  }
}

/** O JSON cru das tags espelhadas, sem parse. Ver `useTagsEspelhadas`. */
function lerTagsCru(id: string): string | null {
  try {
    return localStorage.getItem(`${CHAVE_TAGS}:${id}`);
  } catch {
    return null;
  }
}

/* O localStorage não existe no servidor. Lendo por useSyncExternalStore, o
   primeiro render (servidor e hidratação) enxerga `undefined` — "ainda não
   sabemos" — e o valor real entra no reconcile seguinte, sem mismatch. */
const semInscricao = () => () => {};
const meuIdNoServidor = () => undefined;

/**
 * `undefined` = ainda não lemos o aparelho; `null` = não tem personagem;
 * `string` = o id.
 *
 * Só serve para valores primitivos: `useSyncExternalStore` compara snapshots com
 * `Object.is`, então uma função que devolvesse um objeto/array novo a cada
 * chamada (como `lerTags`) entraria em loop de render. Tags vão por useEffect.
 */
export function useMeuId(): string | null | undefined {
  return useSyncExternalStore<string | null | undefined>(
    semInscricao,
    lerMeuId,
    meuIdNoServidor,
  );
}

/**
 * Tags espelhadas deste jogador. Vazio quando não há espelho — o normal para as
 * linhas gravadas depois da migração, que trazem as tags do próprio banco.
 *
 * Passe `null` como id para não ler nada (ex.: quem olha não é o dono).
 *
 * O snapshot é a STRING crua, não o array: `useSyncExternalStore` compara
 * snapshots com `Object.is`, e devolver um `JSON.parse` novo a cada chamada
 * entraria em loop de render. O parse vem depois, memoizado.
 */
export function useTagsEspelhadas(id: string | null): string[] {
  const cru = useSyncExternalStore(
    semInscricao,
    () => (id ? lerTagsCru(id) : null),
    () => null,
  );

  return useMemo(() => {
    if (!cru) return VAZIO;
    try {
      const lido: unknown = JSON.parse(cru);
      return Array.isArray(lido) ? lido.filter((t): t is string => typeof t === "string") : VAZIO;
    } catch {
      return VAZIO;
    }
  }, [cru]);
}
