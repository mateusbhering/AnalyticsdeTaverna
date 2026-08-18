import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";

/**
 * Agregação das partidas para o dashboard da landing. SÓ SERVIDOR — importar
 * isto de um Client Component mandaria a tabela inteira para o navegador.
 *
 * Roda no servidor de propósito: o browser recebe só os números prontos, e não
 * as linhas de `jogadores`. Também evita que a base inteira trafegue a cada
 * visita conforme ela cresce.
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

/** O Supabase devolve no máximo 1000 linhas por consulta; paginamos até o fim. */
const PAGE_SIZE = 1000;

/** Teto de segurança: 200 páginas = 200 mil jogadores. */
const MAX_PAGES = 200;

export interface Row {
  classe: string | null;
  forca: number | null;
  inteligencia: number | null;
  agilidade: number | null;
  resistencia: number | null;
  carisma: number | null;
  sabedoria: number | null;
  caos: number | null;
}

/**
 * Parte pura da agregação — separada do acesso ao banco para ser testável.
 * Exportada por isso; em produção só `getPlayerStats` é usado.
 */
export function aggregate(rows: Row[]): PlayerStats | null {
  if (!rows.length) return null;

  // ── Classes mais geradas ────────────────────────────────────────────
  const contagem = new Map<string, number>();
  for (const r of rows) {
    if (!r.classe) continue;
    contagem.set(r.classe, (contagem.get(r.classe) ?? 0) + 1);
  }
  // A base é quem TEM classe, não o total de linhas: se alguma vier nula, os
  // percentuais ainda precisam fechar em 100%.
  const comClasse = [...contagem.values()].reduce((a, b) => a + b, 0);
  const byClass: ClassCount[] = [...contagem.entries()]
    .map(([name, count]) => ({
      name,
      count,
      pct: comClasse ? Math.round((count / comClasse) * 1000) / 10 : 0,
    }))
    // Desempate por nome para a ordem não oscilar entre builds com contagens iguais.
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "pt-BR"));

  // ── Atributos médios ────────────────────────────────────────────────
  // Cada atributo conta só as linhas em que ele existe: uma coluna nula não
  // deve puxar a média para baixo como se fosse zero.
  const averages = {} as AttributeAverages;
  for (const k of ATTR_KEYS) {
    let soma = 0, n = 0;
    for (const r of rows) {
      const v = r[k];
      if (typeof v === "number" && Number.isFinite(v)) { soma += v; n++; }
    }
    averages[k] = n ? Math.round((soma / n) * 10) / 10 : 0;
  }

  return { total: rows.length, byClass, averages };
}

async function fetchStats(): Promise<PlayerStats | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Sem credenciais o dashboard some, mas a landing continua de pé. O build da
  // Vercel já quebrou antes por avaliar Supabase sem as env vars definidas
  // (ver o comentário em lib/supabase.ts), e uma seção é motivo fraco demais
  // para derrubar a página inteira.
  if (!url || !anonKey) return null;

  try {
    // Client próprio do servidor: nada de persistir sessão ou ler a URL, que
    // são comportamentos de browser e não fazem sentido aqui.
    const supabase = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });

    const rows: Row[] = [];
    for (let page = 0; page < MAX_PAGES; page++) {
      const from = page * PAGE_SIZE;
      const { data, error } = await supabase
        .from("jogadores")
        .select("classe, forca, inteligencia, agilidade, resistencia, carisma, sabedoria, caos")
        .range(from, from + PAGE_SIZE - 1);

      if (error) throw error;
      if (!data?.length) break;
      rows.push(...(data as Row[]));
      if (data.length < PAGE_SIZE) break;
    }

    return aggregate(rows);
  } catch (e) {
    console.error("Falha ao agregar estatísticas dos jogadores:", e);
    return null;
  }
}

/**
 * Sem `cacheComponents` ligado no next.config, `use cache` não existe — a via
 * documentada para cachear consulta de banco é `unstable_cache`. Sem isso a
 * landing viraria dinâmica e bateria no Supabase a cada visita.
 *
 * 5 minutos: a seção se chama "ao Vivo", mas ninguém precisa do número ao
 * segundo, e a página continua servida do cache.
 */
export const getPlayerStats = unstable_cache(fetchStats, ["player-stats"], {
  revalidate: 300,
  tags: ["player-stats"],
});
