"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// URL do backend Python (FastAPI). Em produção, defina NEXT_PUBLIC_AVATAR_API_URL
// para o host do serviço de avatar. Padrão: dev local em :8000.
export const AVATAR_API_BASE =
  process.env.NEXT_PUBLIC_AVATAR_API_URL ?? "http://localhost:8000";

/* Polling em duas velocidades. A geração leva ~12–15s quando não há fila, então
   um intervalo fixo de 2,5s desperdiçava até 2,5s no fim — justo onde a pessoa
   está olhando a tela esperando. Perto de 1,2s no começo o avatar aparece
   praticamente assim que fica pronto; passada a janela rápida, o ritmo afrouxa
   porque aí a espera é de fila e checar de segundo em segundo só gera tráfego. */
const INTERVALO_RAPIDO_MS = 1200;
const INTERVALO_NORMAL_MS = 2500;
const JANELA_RAPIDA_MS = 30_000;

/* Teto por TEMPO, não por número de tentativas: com intervalo variável, contar
   tentativas faria o prazo mudar junto: 72 × 1,2s daria 1min26 em vez de 3min. */
const PRAZO_MS = 180_000;

export type AvatarStatus = "idle" | "processing" | "done" | "error";

/* Códigos de falha que o backend publica em `/avatar/status` (ver
   `MOTIVO_*` em backend/app/workers/avatar_worker.py), mais os dois que só o
   navegador sabe: não alcançou a API, e desistiu de esperar. */
export type AvatarErrorReason =
  | "billing"
  | "quota_exhausted"
  | "upstream_unavailable"
  | "no_image"
  | "upload_failed"
  | "generation_failed"
  | "unreachable"
  | "timeout";

export interface AvatarGeneration {
  status: AvatarStatus;
  /** URL do avatar no Storage do Supabase, ou null enquanto indisponível. */
  avatarUrl: string | null;
  /** Por que falhou, quando `status === "error"`. Serve tanto à mensagem na
   *  tela quanto ao diagnóstico — antes todo erro era indistinguível. */
  errorReason: AvatarErrorReason | null;
  /** id do job — usado no QR code para buscar o avatar em /personagem. */
  jobId: string | null;
  /** Dispara a geração a partir da foto (data URL) e da classe de RPG.
   *  Idempotente até `reset()`. */
  start: (photoDataUrl: string, className?: string) => void;
  /** Limpa o estado e permite uma nova geração (usado ao reiniciar o quiz). */
  reset: () => void;
}

/** Converte um data URL (ex.: da webcam) em Blob para envio multipart e para
 *  o download do avatar (Blob URL). Síncrono de propósito: no clique de baixar
 *  um await perderia o gesto do usuário. */
export function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, b64] = dataUrl.split(",");
  const mime = /:(.*?);/.exec(meta)?.[1] ?? "image/jpeg";
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

function extFor(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

/** Traduz o motivo técnico na frase que aparece na tela.
 *
 *  Os códigos (`billing`, `quota_exhausted`, …) existem para o log e para o
 *  `/avatar/status`; quem está esperando o avatar não tem o que fazer com eles.
 *  O que muda aqui é só a expectativa: "volte depois" é diferente de "tente
 *  outra foto", e antes as duas coisas viravam a mesma mensagem genérica. */
export function mensagemDeFalha(motivo: AvatarErrorReason | null): string {
  switch (motivo) {
    case "billing":
    case "quota_exhausted":
      return "A forja de avatares atingiu o limite por hoje";
    case "upstream_unavailable":
    case "unreachable":
      return "A forja está fora de alcance — tente de novo em instantes";
    case "timeout":
      return "A conjuração demorou demais e foi interrompida";
    case "no_image":
      return "Não conseguimos retratar esta foto — tente outra";
    default:
      return "Não foi possível conjurar seu avatar";
  }
}

export function useAvatarGeneration(): AvatarGeneration {
  const [status, setStatus] = useState<AvatarStatus>("idle");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [errorReason, setErrorReason] = useState<AvatarErrorReason | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedRef = useRef(false);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearTimeout(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  // Encerra o polling se o componente desmontar.
  useEffect(() => stopPolling, [stopPolling]);

  const reset = useCallback(() => {
    stopPolling();
    startedRef.current = false;
    setStatus("idle");
    setAvatarUrl(null);
    setErrorReason(null);
    setJobId(null);
  }, [stopPolling]);

  const start = useCallback(
    (photoDataUrl: string, className = "") => {
      if (startedRef.current) return; // dispara uma única vez até reset()
      startedRef.current = true;
      setStatus("processing");
      setErrorReason(null);

      (async () => {
        try {
          const blob = dataUrlToBlob(photoDataUrl);
          const form = new FormData();
          form.append("file", blob, `face.${extFor(blob.type)}`);
          form.append("classe", className);

          const res = await fetch(`${AVATAR_API_BASE}/avatar/generate`, {
            method: "POST",
            body: form,
          });
          if (!res.ok) throw new Error(`generate: ${res.status}`);
          const { job_id: id } = (await res.json()) as { job_id: string };
          setJobId(id);

          /* `setTimeout` reagendado a cada volta, e não `setInterval`: o
             intervalo muda com o tempo decorrido, e um intervalo fixo não
             comporta isso. De quebra, evita empilhar chamadas se uma resposta
             demorar mais que o intervalo. */
          const inicio = Date.now();
          const agendar = () => {
            const decorrido = Date.now() - inicio;
            const intervalo =
              decorrido < JANELA_RAPIDA_MS ? INTERVALO_RAPIDO_MS : INTERVALO_NORMAL_MS;
            pollRef.current = setTimeout(consultar, intervalo);
          };

          const consultar = async () => {
            if (Date.now() - inicio > PRAZO_MS) {
              stopPolling();
              setErrorReason("timeout");
              setStatus("error");
              return;
            }
            try {
              const s = await fetch(`${AVATAR_API_BASE}/avatar/status/${id}`);
              if (!s.ok) {
                agendar(); // transiente — continua tentando
                return;
              }
              const data = (await s.json()) as {
                status: AvatarStatus;
                /** Motivo da falha — só vem quando `status === "error"`. */
                error?: AvatarErrorReason;
                public_url?: string;
                /** Formato antigo: a imagem inteira em base64. Ver abaixo. */
                image?: string;
                mime?: string;
              };
              if (data.status === "done" && (data.public_url || data.image)) {
                stopPolling();
                /* A URL do Storage é o caminho normal. O `data:` continua aqui
                   só para os resultados que já estavam no Redis no formato
                   antigo — eles vencem em 24h e então este ramo morre. */
                setAvatarUrl(
                  data.public_url ??
                    `data:${data.mime ?? "image/png"};base64,${data.image}`,
                );
                setStatus("done");
                // NÃO apagamos o resultado aqui: o avatar precisa sobreviver o
                // TTL de 24h para ser buscado pelo QR code em /personagem.
              } else if (data.status === "error") {
                stopPolling();
                setErrorReason(data.error ?? "generation_failed");
                setStatus("error");
              } else {
                agendar(); // ainda processando
              }
            } catch {
              agendar(); // erro de rede transiente — mantém o polling
            }
          };

          agendar();
        } catch {
          /* Não chegamos nem a ter um job: ou a API não respondeu, ou recusou o
             upload. Nos dois casos o servidor não tem motivo nenhum a informar. */
          setErrorReason("unreachable");
          setStatus("error");
        }
      })();
    },
    [stopPolling],
  );

  return { status, avatarUrl, errorReason, jobId, start, reset };
}
