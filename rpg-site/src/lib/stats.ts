import { unstable_cache } from "next/cache";
import { BACKEND_URL } from "./backend-url";
import { PLAYER_STATS_TAG } from "./cache-tags";

/**
 * Agregação das partidas para o dashboard da landing. SÓ SERVIDOR — importar
 * isto de um Client Component mandaria a URL do backend para o navegador.
 *
 * Até aqui este módulo reimplementava, direto contra o Supabase (paginação
 * manual incluída), a MESMA agregação que `/analytics/resumo`, `/classes` e
 * `/atributos` já fazem no backend (ver `routers/analytics.py`) — duas
 * fontes de verdade pro mesmo número. Agora só busca as três rotas e
 * remonta no formato que `DashboardSection.tsx` já espera, então esse
 * componente não precisou mudar uma linha.
 */

export interface AttributeAverages {
  forca: number;
  inteligencia: number;
  agilidade: number;
  resistencia: number;
  carisma: number;
  sabedoria: number;
  caos: number;
}

export interface ClassCount {
  name: string;
  count: number;
  pct: number;
}

export interface PlayerStats {
  total: number;
  /** Classes ordenadas da mais gerada para a menos. Só as que apareceram. */
  byClass: ClassCount[];
  averages: AttributeAverages;
}

const ATTR_KEYS = [
  "forca", "inteligencia", "agilidade", "resistencia", "carisma", "sabedoria", "caos",
] as const;

interface RespostaResumo {
  total_jogadores: number;
}

interface RespostaClasses {
  classes: { classe: string; quantidade: number; percentual: number }[];
}

interface RespostaAtributos {
  atributos: Record<string, number>;
}

async function buscar<T>(caminho: string): Promise<T | null> {
  try {
    const resposta = await fetch(`${BACKEND_URL}${caminho}`, {
      headers: { Accept: "application/json" },
      cache: "no-store", // quem cacheia é o unstable_cache abaixo, não o fetch
    });
    if (!resposta.ok) {
      console.error(`[stats] ${resposta.status} ${resposta.statusText} em ${caminho}`);
      return null;
    }
    return (await resposta.json()) as T;
  } catch (erro) {
    console.error(`[stats] falha ao consultar ${BACKEND_URL}${caminho}`, erro);
    return null;
  }
}

async function fetchStats(): Promise<PlayerStats | null> {
  // As três rotas leem a MESMA tabela (`jogadores`) da mesma forma que este
  // módulo lia antes — se uma cair, misturar as outras duas dá um dashboard
  // inconsistente (ex.: total de um jeito, classes de outro). Por isso aqui
  // é tudo ou nada, diferente de `lib/analytics.ts` (onde cada card é
  // independente e pode faltar sozinho).
  const [resumo, classesResp, atributosResp] = await Promise.all([
    buscar<RespostaResumo>("/analytics/resumo"),
    buscar<RespostaClasses>("/analytics/classes"),
    buscar<RespostaAtributos>("/analytics/atributos"),
  ]);

  if (!resumo || !classesResp || !atributosResp) return null;
  if (resumo.total_jogadores === 0) return null; // dashboard some, landing continua de pé

  const byClass: ClassCount[] = classesResp.classes
    .map((c) => ({ name: c.classe, count: c.quantidade, pct: c.percentual }))
    // O backend ordena só por contagem (`Counter.most_common`), que em caso de
    // empate cai na ordem de inserção — não determinística o bastante pra uma
    // UI. Desempata por nome aqui, como a versão antiga (direto no Supabase)
    // já fazia, pra não trocar a ordem visual à toa entre uma visita e outra.
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "pt-BR"));

  const averages = {} as AttributeAverages;
  for (const chave of ATTR_KEYS) {
    averages[chave] = atributosResp.atributos[chave] ?? 0;
  }

  return { total: resumo.total_jogadores, byClass, averages };
}

/**
 * Sem `cacheComponents` ligado no next.config, `use cache` não existe — a via
 * documentada para cachear é `unstable_cache`. Sem isso a landing viraria
 * dinâmica e bateria no backend a cada visita.
 *
 * A atualização de verdade é por evento: ao salvar um personagem novo, o
 * CharacterResult chama `avisarNovoJogador()`, que expira esta tag na hora.
 * Os 5 minutos ficam como rede de segurança para o que não passa pelo app, e
 * para o caso de a action falhar.
 */
export const getPlayerStats = unstable_cache(fetchStats, ["player-stats"], {
  revalidate: 300,
  tags: [PLAYER_STATS_TAG],
});
