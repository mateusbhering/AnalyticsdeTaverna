"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import jsQR from "jsqr";

/* O BarcodeDetector é nativo no Chrome/Android e decodifica direto do vídeo,
   sem custo de JS. O Safari não o tem — e num evento metade dos celulares é
   iPhone —, então mantemos o jsQR como fallback: mesmo componente, mesma UX. */
interface BarcodeDetectorLike {
  detect(source: CanvasImageSource): Promise<{ rawValue: string }[]>;
}
interface BarcodeDetectorCtor {
  new (options?: { formats?: string[] }): BarcodeDetectorLike;
  getSupportedFormats?: () => Promise<string[]>;
}

const INTERVALO_MS = 120; // ~8 leituras/s: pega o código rápido sem fritar a bateria
const LADO_MAX = 640;     // frame reduzido antes de decodificar (o jsQR é O(pixels))

interface Props {
  /** Chamado uma única vez, com o texto bruto do QR. A câmera já foi desligada. */
  onScan: (texto: string) => void;
}

export default function QrScanner({ onScan }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const ultimoRef = useRef(0);
  const ocupadoRef = useRef(false);
  const achouRef = useRef(false);
  const detectorRef = useRef<BarcodeDetectorLike | null>(null);

  const [lendo, setLendo] = useState(false);
  const [abrindo, setAbrindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [manual, setManual] = useState("");

  const parar = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setLendo(false);
  }, []);

  /** Lê um frame e devolve o conteúdo do QR, ou null se não houver nenhum. */
  const lerFrame = useCallback(async (): Promise<string | null> => {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || !video.videoWidth) return null;

    const detector = detectorRef.current;
    if (detector) {
      try {
        const [codigo] = await detector.detect(video);
        return codigo?.rawValue ?? null;
      } catch {
        detectorRef.current = null; // desistiu no meio: segue no jsQR
      }
    }

    const canvas = canvasRef.current;
    if (!canvas) return null;
    const escala = Math.min(1, LADO_MAX / Math.max(video.videoWidth, video.videoHeight));
    const w = Math.round(video.videoWidth * escala);
    const h = Math.round(video.videoHeight * escala);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, w, h);
    const { data } = ctx.getImageData(0, 0, w, h);
    return jsQR(data, w, h, { inversionAttempts: "dontInvert" })?.data ?? null;
  }, []);

  /* O laço roda a ~8fps e o mesmo QR aparece em vários frames seguidos: sem o
     guard, `onScan` dispararia uma enxurrada de vezes entre a detecção e o
     `parar()`. Ele é re-armado a cada `iniciar()`, senão um código recusado
     pelo pai (QR de outro app, oponente inexistente) mataria o leitor de vez. */
  const aceitar = useCallback(
    (texto: string) => {
      if (achouRef.current) return;
      achouRef.current = true;
      parar();
      onScan(texto);
    },
    [parar, onScan],
  );

  /* A entrada manual é um envio deliberado, um por clique: não passa pelo
     guard, que existe só para conter a repetição do laço da câmera. */
  const enviarManual = useCallback(
    (texto: string) => {
      parar();
      onScan(texto);
    },
    [parar, onScan],
  );

  const iniciar = useCallback(async () => {
    setErro(null);
    setAbrindo(true);

    // A câmera só existe em contexto seguro; sem este aviso o erro vira um
    // "NotAllowedError" opaco quando alguém abre o site pelo IP da rede local.
    if (!window.isSecureContext) {
      setErro("A câmera só funciona em HTTPS. Abra o site pelo endereço seguro (https://) ou por localhost.");
      setAbrindo(false);
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setErro("Este navegador não permite acesso à câmera.");
      setAbrindo(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" }, // traseira: quem escaneia aponta pro outro
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      const video = videoRef.current;
      if (!video) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      streamRef.current = stream;
      video.srcObject = stream;
      await video.play();

      const Detector = (window as unknown as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector;
      if (Detector) {
        try {
          const formatos = await Detector.getSupportedFormats?.();
          if (!formatos || formatos.includes("qr_code")) {
            detectorRef.current = new Detector({ formats: ["qr_code"] });
          }
        } catch {
          detectorRef.current = null;
        }
      }

      /* Laço de leitura. Agenda o próximo frame ANTES de decodificar, para que
         uma decodificação lenta não engasgue o vídeo. */
      function tick(t: number) {
        rafRef.current = requestAnimationFrame(tick);
        if (achouRef.current || ocupadoRef.current) return;
        if (t - ultimoRef.current < INTERVALO_MS) return;
        ultimoRef.current = t;
        ocupadoRef.current = true;
        lerFrame()
          .then((texto) => {
            if (texto) aceitar(texto);
          })
          .catch(() => {})
          .finally(() => {
            ocupadoRef.current = false;
          });
      }

      setLendo(true);
      achouRef.current = false;
      ultimoRef.current = 0;
      rafRef.current = requestAnimationFrame(tick);
    } catch (e) {
      const nome = e instanceof DOMException ? e.name : "";
      setErro(
        nome === "NotAllowedError"
          ? "Permissão negada. Libere a câmera nas configurações do navegador e tente de novo."
          : nome === "NotFoundError" || nome === "OverconstrainedError"
            ? "Nenhuma câmera encontrada neste aparelho."
            : nome === "NotReadableError"
              ? "A câmera está sendo usada por outro app. Feche-o e tente de novo."
              : "Não foi possível abrir a câmera.",
      );
    } finally {
      setAbrindo(false);
    }
  }, [lerFrame, aceitar]);

  // Desliga a câmera ao sair da tela — sem isso a luz do celular fica acesa.
  useEffect(() => parar, [parar]);

  return (
    <div className="space-y-4">
      {/* Visor */}
      <div className="relative overflow-hidden bg-[rgba(23,13,6,0.92)] border border-[rgba(96,66,26,0.45)] aspect-square">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          style={{ display: lendo ? "block" : "none" }}
          muted
          playsInline
        />

        {!lendo && (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-[rgba(240,226,189,0.7)]">
            <div className="text-6xl">{abrindo ? "🕯️" : "📷"}</div>
            <p
              className="text-[.6rem] tracking-[.25em] uppercase"
              style={{ fontFamily: "var(--font-cinzel), serif" }}
            >
              {abrindo ? "Abrindo a câmera…" : "Câmera desligada"}
            </p>
          </div>
        )}

        {/* Mira: cantos arcanos + feixe varrendo */}
        {lendo && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="qr-reticle">
              <span className="qr-corner tl" />
              <span className="qr-corner tr" />
              <span className="qr-corner bl" />
              <span className="qr-corner br" />
              <span className="qr-beam" />
            </div>
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <span
                className="text-[rgba(240,226,189,0.8)] text-[.6rem] bg-[rgba(0,0,0,0.6)] px-3 py-1 tracking-[.1em] uppercase"
                style={{ fontFamily: "var(--font-cinzel), serif" }}
              >
                Aponte para o QR do oponente
              </span>
            </div>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {erro && (
        <p className="text-[var(--seal)] text-sm text-center bg-[rgba(140,35,24,0.08)] border border-[rgba(140,35,24,0.35)] px-4 py-3 italic">
          {erro}
        </p>
      )}

      <div className="flex gap-3 justify-center flex-wrap">
        {!lendo ? (
          <button
            onClick={iniciar}
            disabled={abrindo}
            className="btn-seal press px-8 py-3 text-[.75rem] tracking-[.15em] uppercase cursor-pointer disabled:opacity-60 disabled:cursor-wait"
            style={{ fontFamily: "var(--font-cinzel), serif", borderWidth: "1px" }}
          >
            📷 {erro ? "Tentar de novo" : "Abrir Câmera"}
          </button>
        ) : (
          <button
            onClick={parar}
            className="press px-6 py-3 bg-transparent border border-[rgba(230,188,106,0.35)] text-[rgba(240,226,189,0.7)] text-[.75rem] tracking-[.15em] uppercase hover:border-[var(--gold-light)] hover:text-[var(--gold-light)] transition-all cursor-pointer"
            style={{ fontFamily: "var(--font-cinzel), serif" }}
          >
            ✕ Parar
          </button>
        )}
      </div>

      {/* Saída de emergência: desktop sem webcam, câmera bloqueada, QR ilegível. */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const texto = manual.trim();
          if (texto) enviarManual(texto);
        }}
        className="pt-4 border-t border-[rgba(230,188,106,0.15)] flex flex-col gap-2"
      >
        <label
          className="text-[.55rem] tracking-[.3em] uppercase text-[rgba(230,188,106,0.55)] text-center"
          style={{ fontFamily: "var(--font-cinzel), serif" }}
        >
          Ou cole o link do oponente
        </label>
        <div className="flex gap-2">
          <input
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            placeholder="https://…/batalha?oponenteId=7"
            className="flex-1 min-w-0 bg-[rgba(23,13,6,0.6)] border border-[rgba(96,66,26,0.5)] px-3 py-2 text-[rgba(240,226,189,0.85)] text-sm outline-none focus:border-[var(--gold-light)] transition-colors"
          />
          <button
            type="submit"
            className="press btn-parchment px-4 py-2 text-[.65rem] tracking-[.12em] uppercase cursor-pointer"
            style={{ fontFamily: "var(--font-cinzel), serif" }}
          >
            Ir
          </button>
        </div>
      </form>
    </div>
  );
}
