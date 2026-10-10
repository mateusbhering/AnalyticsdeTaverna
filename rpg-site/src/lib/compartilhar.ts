import { lerMeuId } from "./jogador-local";
import { guardarOrigem, registrarEventoFunil } from "./funil-tracking";

/**
 * Compartilhamento do card com atribuição. Todo link que sai daqui carrega
 * `utm_source=<canal>` e `ref=<id do dono>`; quem chega por ele é capturado por
 * `capturarOrigemDaUrl` (montado no layout), e a origem passa a marcar os
 * eventos do funil — é isso que `GET /analytics/compartilhamento` usa para
 * calcular quantas visitas de cada canal viraram personagem.
 */

export type CanalCompartilhar = "whatsapp" | "x" | "facebook" | "telegram";
/** Canais sem botão de rede: o link copiado, o QR do card e a folha nativa. */
export type CanalOutro = "link" | "qr" | "nativo" | "download";
export type Canal = CanalCompartilhar | CanalOutro;

export const CANAIS_REDES: { canal: CanalCompartilhar; rotulo: string }[] = [
  { canal: "whatsapp", rotulo: "WhatsApp" },
  { canal: "x", rotulo: "X" },
  { canal: "facebook", rotulo: "Facebook" },
  { canal: "telegram", rotulo: "Telegram" },
];

const CANAL_VALIDO = /^[a-z0-9_-]{1,30}$/; // mesmo padrão do backend (schemas.py)

/** Soma ao link do card os parâmetros que dizem de onde o clique veio. */
export function linkComOrigem(link: string, canal: Canal, refJogadorId?: number | null): string {
  try {
    const url = new URL(link);
    url.searchParams.set("utm_source", canal);
    url.searchParams.set("utm_medium", canal === "qr" ? "card" : "share");
    if (refJogadorId != null) url.searchParams.set("ref", String(refJogadorId));
    return url.toString();
  } catch {
    return link; // link relativo/vazio: melhor sem UTM do que quebrado
  }
}

/** URL de "compartilhar" de cada rede (intent pública, sem SDK nem cookie). */
export function urlDaRede(canal: CanalCompartilhar, link: string, texto: string): string {
  const l = encodeURIComponent(link);
  const t = encodeURIComponent(texto);
  switch (canal) {
    case "whatsapp":
      return `https://wa.me/?text=${encodeURIComponent(`${texto} ${link}`)}`;
    case "x":
      return `https://twitter.com/intent/tweet?text=${t}&url=${l}`;
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${l}`;
    case "telegram":
      return `https://t.me/share/url?url=${l}&text=${t}`;
  }
}

/** Conta um compartilhamento (clique no botão, link copiado, card baixado…). */
export function registrarCompartilhamento(canal: Canal, refJogadorId?: number | null): void {
  registrarEventoFunil("compartilhou", { origem: canal, refJogadorId });
}

/**
 * Lê `utm_source`/`ref` da URL de entrada. Chamado uma vez por carregamento de
 * página (ver `CapturaOrigem`). Guarda a origem para os eventos seguintes e
 * registra UMA visita por link — recarregar a página não conta de novo, e o
 * dono do card abrindo o próprio link não conta como visita.
 */
export function capturarOrigemDaUrl(): void {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const origem = params.get("utm_source")?.toLowerCase() ?? "";
  if (!CANAL_VALIDO.test(origem)) return;

  const refBruto = params.get("ref");
  const ref = refBruto && /^\d{1,12}$/.test(refBruto) ? Number(refBruto) : null;
  if (ref !== null && lerMeuId() === String(ref)) return;

  const chaveVisita = `taverna:visita:${origem}:${ref ?? "-"}`;
  try {
    if (sessionStorage.getItem(chaveVisita)) return;
    sessionStorage.setItem(chaveVisita, "1");
  } catch {
    /* sem storage: pode contar a visita duas vezes, não quebra nada */
  }
  guardarOrigem(origem);
  registrarEventoFunil("visita_compartilhada", { origem, refJogadorId: ref });
}
