"use client";

import { useRef, useState, useCallback } from "react";

interface Props {
  onCapture: (photoDataUrl: string) => void;
}

export default function WebcamCapture({ onCapture }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streaming, setStreaming] = useState(false);
  const [captured, setCaptured] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 480, height: 480 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setStreaming(true);
      }
    } catch {
      setError("Não foi possível acessar a câmera. Verifique as permissões do navegador.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setStreaming(false);
  }, []);

  const takePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setCaptured(dataUrl);
    stopCamera();
    onCapture(dataUrl);
  }, [stopCamera, onCapture]);

  const retake = () => {
    setCaptured(null);
    startCamera();
  };

  return (
    <div className="space-y-4">
      {/* Webcam frame with arcane corners */}
      <div className="relative arcane-corners overflow-hidden bg-[rgba(10,6,3,0.8)] border border-[rgba(184,134,11,0.2)] aspect-square max-w-sm mx-auto">
        <span className="ac-bl" /><span className="ac-br" />

        {/* Video feed */}
        {!captured && (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            style={{ transform: "scaleX(-1)", display: streaming ? "block" : "none" }}
            muted
            playsInline
          />
        )}

        {/* Captured photo */}
        {captured && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={captured} alt="Foto capturada" className="w-full h-full object-cover" />
        )}

        {/* Placeholder */}
        {!streaming && !captured && (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-[rgba(184,134,11,0.4)]">
            <div className="text-6xl">📷</div>
            <p
              className="text-[.65rem] tracking-[.2em] uppercase"
              style={{ fontFamily: "var(--font-cinzel), serif" }}
            >
              Câmera desligada
            </p>
          </div>
        )}

        {/* Face guide overlay */}
        {streaming && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-56 rounded-full border-2 border-dashed border-[rgba(184,134,11,0.5)] shadow-[0_0_0_9999px_rgba(0,0,0,0.3)]" />
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <span
                className="text-[rgba(244,228,188,0.7)] text-[.6rem] bg-[rgba(0,0,0,0.6)] px-3 py-1 tracking-[.1em] uppercase"
                style={{ fontFamily: "var(--font-cinzel), serif" }}
              >
                Centralize seu rosto
              </span>
            </div>
          </div>
        )}

        {/* Success badge */}
        {captured && (
          <div className="absolute top-3 right-3 bg-[var(--gold)] w-8 h-8 flex items-center justify-center shadow-lg">
            <svg className="w-4 h-4 text-[var(--wood)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* Error message */}
      {error && (
        <p
          className="text-[var(--copper)] text-sm text-center bg-[rgba(74,14,14,0.2)] border border-[rgba(184,134,11,0.2)] px-4 py-3 italic"
        >
          {error}
        </p>
      )}

      {/* Buttons */}
      <div className="flex gap-3 justify-center flex-wrap">
        {!streaming && !captured && (
          <>
            <button
              onClick={startCamera}
              className="px-6 py-3 bg-[var(--wine)] border border-[rgba(184,134,11,0.5)] text-[var(--parchment)] text-[.75rem] tracking-[.15em] uppercase hover:border-[var(--gold)] transition-all"
              style={{ fontFamily: "var(--font-cinzel), serif" }}
            >
              📷 Abrir Câmera
            </button>
            <label
              className="px-6 py-3 bg-[rgba(45,27,13,0.8)] border border-[rgba(184,134,11,0.3)] text-[var(--gold)] text-[.75rem] tracking-[.15em] uppercase hover:border-[var(--gold)] transition-all cursor-pointer"
              style={{ fontFamily: "var(--font-cinzel), serif" }}
            >
              📁 Escolher Foto
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    const url = ev.target?.result as string;
                    setCaptured(url);
                    onCapture(url);
                  };
                  reader.readAsDataURL(file);
                }}
              />
            </label>
          </>
        )}
        {streaming && (
          <button
            onClick={takePhoto}
            className="px-8 py-3 bg-[var(--wine)] border-2 border-[rgba(184,134,11,0.6)] text-[var(--parchment)] text-[.8rem] tracking-[.15em] uppercase hover:border-[var(--gold)] transition-all animate-pulse-wine"
            style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
          >
            ⚡ Tirar Foto
          </button>
        )}
        {captured && (
          <button
            onClick={retake}
            className="px-6 py-3 bg-transparent border border-[rgba(184,134,11,0.25)] text-[rgba(184,134,11,0.6)] text-[.75rem] tracking-[.15em] uppercase hover:border-[var(--gold)] hover:text-[var(--gold)] transition-all"
            style={{ fontFamily: "var(--font-cinzel), serif" }}
          >
            🔄 Refazer
          </button>
        )}
      </div>
    </div>
  );
}
