import { API_BASE } from "./batalha-api";

/**
 * Cliente do funil de conversão (foto → quiz → avatar). Fogo-e-esquece: uma
 * métrica nunca pode atrasar ou quebrar o quiz de verdade, então toda falha
 * — rede, CORS, backend hibernando — morre num `console.error` e segue.
 *
 * As etapas de DEPOIS do cadastro (personagem salvo, duelou) não passam por
 * aqui: já são deriváveis de `jogadores`/`batalhas` no backend
 * (`GET /analytics/funil`), então não duplicamos o dado.
 */

export type EventoFunil = "inicio" | "foto_capturada" | "quiz_concluido" | "avatar_gerado" | "avatar_falhou";

const CHAVE_SESSAO = "taverna:funilSessaoId";

function gerarId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Abre uma sessão nova: chamado pelo `QuizForm` ao montar e a cada "Jogar
 * Novamente". Um id por PASSADA pelo quiz, não por aba nem por aparelho — de
 * propósito. Reaproveitar o id da aba fazia a segunda partida sumir do topo
 * do funil (o `inicio` repetido não conta duas vezes) e os dois personagens
 * caírem na mesma sessão, onde o backend só enxerga um.
 */
export function iniciarSessaoFunil(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(CHAVE_SESSAO, gerarId());
  } catch {
    // Storage bloqueado: `obterSessaoFunil` já cai num id avulso por evento.
  }
}

/**
 * Id da passada atual. Vive em `sessionStorage` e não é recriado a cada
 * evento: as 4 etapas de uma mesma partida precisam bater na mesma sessão
 * para o funil contar uma entrada só no topo.
 */
export function obterSessaoFunil(): string {
  if (typeof window === "undefined") return "servidor";
  try {
    const existente = sessionStorage.getItem(CHAVE_SESSAO);
    if (existente) return existente;
    const novo = gerarId();
    sessionStorage.setItem(CHAVE_SESSAO, novo);
    return novo;
  } catch {
    // Modo privado / storage bloqueado: um id novo a cada chamada ainda
    // registra a etapa (só não amarra com as outras da mesma sessão).
    return `sem-storage-${Math.random().toString(36).slice(2)}`;
  }
}

/** Dispara um evento do funil. Nunca lança — ver docstring do módulo. */
export function registrarEventoFunil(evento: EventoFunil): void {
  void fetch(`${API_BASE}/analytics/evento`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessao_id: obterSessaoFunil(), evento }),
    keepalive: true, // sobrevive à navegação/troca de step, se o browser suportar
  }).catch((erro) => {
    console.error(`[funil] falha ao registrar '${evento}'`, erro);
  });
}
