"use client";
import { Check } from "@/components/ui/illustrated-icons";

import { IconText } from "@/components/ui/illustrated-icons";


import { useRef, useState, useCallback, type ReactNode } from "react";

interface Props {
  onCapture: (photoDataUrl: string) => void;
  nameField?: ReactNode;
}

export default function WebcamCapture({ onCapture, nameField }: Props) {
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
    <div className="space-y-4 medieval-photo-capture">
      {/* A moldura é decorativa; o vídeo e a captura continuam independentes. */}
      <div className="medieval-photo-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/scenery/medieval-stone-photo-frame-v1.png" alt="Moldura medieval de pedra entalhada e pergaminho" className="medieval-photo-frame" />
        <span className="medieval-photo-ribbon">Seu herói</span>
        <div className={`medieval-photo-window${streaming || captured ? " is-filled" : ""}`}>
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
            <div className="medieval-photo-placeholder">
              <p
                className="text-[.65rem] tracking-[.2em] uppercase"
                style={{ fontFamily: "var(--font-cinzel), serif" }}
              >
                Seu retrato começa aqui
              </p>
            </div>
          )}

          {/* Face guide overlay */}
          {streaming && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="medieval-photo-face-guide" />
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <span
                  className="text-[rgba(240,226,189,0.75)] text-[.6rem] bg-[rgba(0,0,0,0.6)] px-3 py-1 tracking-[.1em] uppercase"
                  style={{ fontFamily: "var(--font-cinzel), serif" }}
                >
                  Centralize seu rosto
                </span>
              </div>
            </div>
          )}

          {/* Success badge — mini lacre de cera */}
          {captured && (
            <div className="absolute top-3 right-3 wax-seal !w-8 !h-8">
              <Check size={24} />
            </div>
          )}
        </div>
        <div className="medieval-photo-nameplate">
          {nameField || <span>Seu nome será inscrito aqui</span>}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* Error message */}
      {error && (
        <p className="text-[var(--seal)] text-sm text-center bg-[rgba(140,35,24,0.08)] border border-[rgba(140,35,24,0.35)] px-4 py-3 italic">
          {error}
        </p>
      )}

      {/* Buttons */}
      <div className="flex gap-3 justify-center flex-wrap">
        {!streaming && !captured && (
          <>
            <button
              onClick={startCamera}
              className="btn-seal press px-6 py-3 text-[.75rem] tracking-[.15em] uppercase cursor-pointer"
              style={{ fontFamily: "var(--font-cinzel), serif", borderWidth: "1px" }}
            >{<IconText text={"\r\n              📷 Abrir Câmera\r\n            "} />}</button>
            <label
              className="press px-6 py-3 bg-[rgba(60,42,24,0.06)] border border-[rgba(96,66,26,0.45)] text-[var(--ink)] text-[.75rem] tracking-[.15em] uppercase hover:border-[var(--seal)] hover:text-[var(--seal)] transition-all cursor-pointer"
              style={{ fontFamily: "var(--font-cinzel), serif" }}
            >{<IconText text={"\r\n              📁 Escolher Foto\r\n              "} />}<input
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
            className="btn-seal press px-8 py-3 text-[.8rem] tracking-[.15em] uppercase animate-pulse-wine cursor-pointer"
            style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
          >{<IconText text={"\r\n            ⚡ Tirar Foto\r\n          "} />}</button>
        )}
        {captured && (
          <button
            onClick={retake}
            className="press px-6 py-3 bg-transparent border border-[rgba(96,66,26,0.4)] text-[var(--ink-70)] text-[.75rem] tracking-[.15em] uppercase hover:border-[var(--seal)] hover:text-[var(--seal)] transition-all cursor-pointer"
            style={{ fontFamily: "var(--font-cinzel), serif" }}
          >{<IconText text={"\r\n            🔄 Refazer\r\n          "} />}</button>
        )}
      </div>
    </div>
  );
}
