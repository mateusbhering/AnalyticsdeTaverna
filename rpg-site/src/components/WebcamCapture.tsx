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

    // Mirror the image (selfie mode)
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
      <div className="relative rounded-2xl overflow-hidden bg-black/40 border border-purple-800/40 aspect-square max-w-sm mx-auto">
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
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-purple-400/50">
            <div className="text-6xl">📷</div>
            <p className="text-sm">Câmera desligada</p>
          </div>
        )}

        {/* Face guide overlay */}
        {streaming && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-56 rounded-full border-2 border-dashed border-purple-400/60 shadow-[0_0_0_9999px_rgba(0,0,0,0.3)]" />
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <span className="text-white/80 text-xs bg-black/50 px-3 py-1 rounded-full">
                Centralize seu rosto dentro do círculo
              </span>
            </div>
          </div>
        )}

        {/* Success badge */}
        {captured && (
          <div className="absolute top-3 right-3 bg-green-500 rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {error && (
        <p className="text-red-400 text-sm text-center bg-red-900/20 border border-red-700/40 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex gap-3 justify-center">
        {!streaming && !captured && (
          <button
            onClick={startCamera}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-500 hover:to-indigo-500 transition-all"
          >
            📷 Abrir Câmera
          </button>
        )}
        {streaming && (
          <button
            onClick={takePhoto}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-lg hover:from-purple-500 hover:to-indigo-500 transition-all animate-pulse-glow"
          >
            ⚡ Tirar Foto
          </button>
        )}
        {captured && (
          <button
            onClick={retake}
            className="px-6 py-3 rounded-xl bg-white/5 border border-purple-700/40 text-purple-300 font-semibold hover:bg-white/10 transition-all"
          >
            🔄 Refazer
          </button>
        )}
      </div>
    </div>
  );
}
