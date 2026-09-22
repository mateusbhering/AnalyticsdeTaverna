import { unstable_cache } from "next/cache";
import { BACKEND_URL } from "./backend-url";
import { ANALYTICS_EXTRA_TAG } from "./cache-tags";

/**
 * Leitura das rotas `/analytics/*` que o backend já expõe (`routers/analytics.py`)
 * mas que, até aqui, nenhuma tela consumia — `/dashboard` reimplementava só a
 * distribuição de classes e as médias de atributos direto no Supabase
 * (`lib/stats.ts`). Este módulo cobre o que faltava: taxa de empate e
 * atributos mais escolhidos em duelo, taxa de vitória por classe, o "insight"
 * calculado sobre as 10 dimensões, e o funil de conversão foto → quiz →
 * avatar → card → duelo. SÓ SERVIDOR, mesma razão de `lib/ranking.ts` — os
 * números vão prontos para o navegador.
 */

/** Espelha o item de `atributos_escolhidos` em `GET /analytics/batalhas`. */
export interface AtributoEscolhido {
  atributo: string;
  quantidade: number;
  percentual: number;
}

/** Espelha `GET /analytics/batalhas`. */
export interface MetricasBatalha {
  total_batalhas: number;
  empates: number;
  taxa_empate: number;
  atributos_escolhidos: AtributoEscolhido[];
}

/** Espelha o item de `classes` em `GET /analytics/taxa-vitoria`. */
export interface ClasseTaxaVitoria {
  classe: string;
  jogadores: number;
  vitorias: number;
  derrotas: number;
  empates: number;
  total_batalhas: number;
  taxa_vitoria: number;
}

/** Espelha `GET /analytics/taxa-vitoria`. Já vem ordenado por taxa desc. */
export interface TaxaVitoria {
  total_classes: number;
  classes: ClasseTaxaVitoria[];
}

/** Espelha `GET /analytics/insight`. `frase` é `null` sem dados suficientes. */
export interface Insight {
  frase: string | null;
  base: number;
  dimensao_dominante?: string;
  dimensao_mais_fraca?: string;
  medias?: Record<string, number>;
}

/** Uma etapa do funil, como `GET /analytics/funil` devolve cada item de `etapas`. */
export interface EtapaFunil {
  etapa: string;
  rotulo: string;
  total: number;
  percentual_do_topo: number;
  percentual_da_etapa_anterior: number | null;
}

/** Espelha `GET /analytics/funil`. */
export interface Funil {
  etapas: EtapaFunil[];
  sem_eventos: boolean;
  sessoes_ligadas: number;
}

/**
 * Cada peça falha (ou não) de forma independente: o backend pode responder
 * `/batalhas` e cair em `/insight`, por exemplo. Fica `null` a que falhar, e a
 * tela desenha só o que veio — em vez de um erro só derrubar as três seções.
 */
export interface AnalyticsExtra {
  batalhas: MetricasBatalha | null;
  taxaVitoria: TaxaVitoria | null;
  insight: Insight | null;
  funil: Funil | null;
}

async function buscar<T>(caminho: string): Promise<T | null> {
  try {
    const resposta = await fetch(`${BACKEND_URL}${caminho}`, {
      headers: { Accept: "application/json" },
      // Mesmo motivo de lib/ranking.ts: quem cacheia é o unstable_cache lá
      // embaixo, não o fetch.
      cache: "no-store",
    });
    if (!resposta.ok) {
      console.error(`[analytics] ${resposta.status} ${resposta.statusText} em ${caminho}`);
      return null;
    }
    return (await resposta.json()) as T;
  } catch (erro) {
    console.error(`[analytics] falha ao consultar ${BACKEND_URL}${caminho}`, erro);
    return null;
  }
}

async function buscarAnalyticsExtra(): Promise<AnalyticsExtra> {
  const [batalhas, taxaVitoria, insight, funil] = await Promise.all([
    buscar<MetricasBatalha>("/analytics/batalhas"),
    buscar<TaxaVitoria>("/analytics/taxa-vitoria"),
    buscar<Insight>("/analytics/insight"),
    buscar<Funil>("/analytics/funil"),
  ]);
  return { batalhas, taxaVitoria, insight, funil };
}

/**
 * `revalidate: 60` como rede de segurança (mesmo valor do ranking, mesma
 * razão): a invalidação de verdade é por evento, em `stats-actions.ts` e
 * `ranking-actions.ts`.
 */
export const getAnalyticsExtra = unstable_cache(buscarAnalyticsExtra, ["analytics-extra"], {
  revalidate: 60,
  tags: [ANALYTICS_EXTRA_TAG],
});
