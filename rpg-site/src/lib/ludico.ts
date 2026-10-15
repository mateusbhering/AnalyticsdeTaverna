import { API_BASE } from "./batalha-api";

/**
 * Camada lúdica (nível, raridade, conquistas, missão do dia). Tudo é calculado
 * no backend (`app/ludico.py`); aqui só tipos e leitura. Falha em silêncio de
 * propósito: o brinde some, a tela principal continua.
 */

export type Raridade = "comum" | "rara" | "epica" | "lendaria";

export const ROTULO_RARIDADE: Record<Raridade, string> = {
  comum: "Comum",
  rara: "Rara",
  epica: "Épica",
  lendaria: "Lendária",
};

export interface Progressao {
  nivel: number;
  titulo_nivel: string;
  xp: number;
  xp_no_nivel: number;
  xp_para_proximo: number;
  progresso_pct: number;
  nivel_maximo: boolean;
}

export interface ConquistaItem {
  codigo: string;
  nome: string;
  descricao: string;
  titulo: string | null;
  desbloqueada: boolean;
  desbloqueada_em: string | null;
}

export interface MissaoHoje {
  codigo: string;
  nome: string;
  descricao: string;
  meta: number;
  progresso: number;
  recompensa_xp: number;
  cumprida: boolean;
  recompensa_paga: boolean;
}

/** Espelha `GET /jogadores/{id}/perfil`. */
export interface PerfilLudico {
  id: number;
  nome: string | null;
  classe: string | null;
  progressao: Progressao;
  titulo: string | null;
  raridade: { nivel: Raridade; percentual: number; amostra_suficiente: boolean };
  conquistas: ConquistaItem[];
  conquistas_desbloqueadas: number;
  conquistas_total: number;
  missao_hoje: MissaoHoje;
}

/** O que o duelo rendeu ao desafiante (`extras` da resposta de `POST /batalha`). */
export interface ExtrasBatalha {
  nivel: { antes: number; depois: number; subiu: boolean; titulo_nivel: string } | null;
  conquistas_novas: { codigo: string; nome: string; descricao: string; titulo: string | null }[];
  missao: { codigo: string; nome: string; recompensa_xp: number } | null;
}

export type RaridadesPorClasse = Record<string, { raridade: Raridade; percentual: number }>;

async function ler<T>(caminho: string, sinal?: AbortSignal): Promise<T | null> {
  try {
    const resposta = await fetch(`${API_BASE}${caminho}`, { cache: "no-store", signal: sinal });
    return resposta.ok ? ((await resposta.json()) as T) : null;
  } catch {
    return null;
  }
}

export function buscarPerfil(id: number | string, sinal?: AbortSignal) {
  return ler<PerfilLudico>(`/jogadores/${id}/perfil`, sinal);
}

export async function buscarRaridades(sinal?: AbortSignal): Promise<RaridadesPorClasse | null> {
  const dados = await ler<{ classes: RaridadesPorClasse }>("/analytics/raridade-classes", sinal);
  return dados?.classes ?? null;
}
