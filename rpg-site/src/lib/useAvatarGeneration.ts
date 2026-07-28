"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// URL do backend Python (FastAPI). Em produção, defina NEXT_PUBLIC_AVATAR_API_URL
// para o host do serviço de avatar. Padrão: dev local em :8000.
export const AVATAR_API_BASE =
  process.env.NEXT_PUBLIC_AVATAR_API_URL ?? "http://localhost:8000";

// Polling: intervalo e teto de tentativas (2.5s × 72 ≈ 3min antes de desistir).
const POLL_INTERVAL_MS = 2500;
const MAX_POLLS = 72;

export type AvatarStatus = "idle" | "processing" | "done" | "error";

export interface AvatarGeneration {
  status: AvatarStatus;
  /** data URL do avatar gerado (image/...;base64), ou null enquanto indisponível. */
  avatarUrl: string | null;
  /** id do job — usado no QR code para buscar o avatar em /personagem. */
  jobId: string | null;
  /** Dispara a geração a partir da foto (data URL) e da classe de RPG.
   *  Idempotente até `reset()`. */
  start: (photoDataUrl: string, className?: string) => void;
  /** Limpa o estado e permite uma nova geração (usado ao reiniciar o quiz). */
  reset: () => void;
}

/** Converte um data URL (ex.: da webcam) em Blob para envio multipart. */
function dataUrlToBlob(dataUrl: string): Blob {
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

export function useAvatarGeneration(): AvatarGeneration {
  const [status, setStatus] = useState<AvatarStatus>("idle");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedRef = useRef(false);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
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
    setJobId(null);
  }, [stopPolling]);

  const start = useCallback(
    (photoDataUrl: string, className = "") => {
      if (startedRef.current) return; // dispara uma única vez até reset()
      startedRef.current = true;
      setStatus("processing");

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

          let polls = 0;
          pollRef.current = setInterval(async () => {
            polls += 1;
            if (polls > MAX_POLLS) {
              stopPolling();
              setStatus("error");
              return;
            }
            try {
              const s = await fetch(`${AVATAR_API_BASE}/avatar/status/${id}`);
              if (!s.ok) return; // transiente — continua tentando
              const data = (await s.json()) as {
                status: AvatarStatus;
                image?: string;
                mime?: string;
              };
              if (data.status === "done" && data.image) {
                stopPolling();
                setAvatarUrl(`data:${data.mime ?? "image/png"};base64,${data.image}`);
                setStatus("done");
                // NÃO apagamos o resultado aqui: o avatar precisa sobreviver o
                // TTL de 24h para ser buscado pelo QR code em /personagem.
              } else if (data.status === "error") {
                stopPolling();
                setStatus("error");
              }
            } catch {
              // erro de rede transiente — mantém o polling
            }
          }, POLL_INTERVAL_MS);
        } catch {
          setStatus("error");
        }
      })();
    },
    [stopPolling],
  );

  return { status, avatarUrl, jobId, start, reset };
}
