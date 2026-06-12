"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

const floatingIcons = [
  { icon: "⚔️", x: "10%", y: "20%", delay: "0s",   size: "text-3xl" },
  { icon: "🧙", x: "85%", y: "15%", delay: "1s",   size: "text-4xl" },
  { icon: "🛡️", x: "5%",  y: "65%", delay: "2s",   size: "text-3xl" },
  { icon: "💎", x: "90%", y: "60%", delay: "0.5s", size: "text-2xl" },
  { icon: "🔮", x: "75%", y: "80%", delay: "1.5s", size: "text-3xl" },
  { icon: "⚡", x: "20%", y: "80%", delay: "2.5s", size: "text-2xl" },
];

const particles = Array.from({ length: 25 }, (_, i) => ({
  id: i,
  left:     `${(i * 17 + 5) % 100}%`,
  duration: `${6 + (i * 0.7) % 14}s`,
  delay:    `${(i * 0.4) % 10}s`,
  opacity:  0.1 + (i % 5) * 0.08,
  size:     `${1 + (i % 3)}px`,
}));

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();

    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5,
      a: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.3 + 0.1,
    }));

    let frame: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((s) => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(184, 134, 11, ${0.15 + Math.sin(s.a) * 0.2})`;
        ctx.fill();
        s.a += s.speed * 0.02;
      });
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-grid"
      style={{
        background:
          "url('https://www.transparenttextures.com/patterns/dark-wood.png'), radial-gradient(ellipse at 50% 40%, rgba(74,14,14,.35) 0%, transparent 70%), #0e0e0e",
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(74,14,14,0.35)_0%,_rgba(14,14,14,0)_70%)]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[rgba(74,14,14,0.2)] rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[rgba(184,134,11,0.07)] rounded-full blur-3xl" />

      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" />

      {/* Rising gold particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute pointer-events-none rounded-full bg-[var(--gold)]"
          style={{
            left:            p.left,
            bottom:          "0",
            width:           p.size,
            height:          p.size,
            opacity:         p.opacity,
            animationName:   "rise",
            animationDuration: p.duration,
            animationDelay:  p.delay,
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
          }}
        />
      ))}

      {floatingIcons.map((f, i) => (
        <div
          key={i}
          className={`absolute ${f.size} animate-float select-none pointer-events-none`}
          style={{
            left: f.x, top: f.y,
            animationDelay: f.delay,
            filter: "drop-shadow(0 0 12px rgba(184,134,11,0.6))",
          }}
        >
          {f.icon}
        </div>
      ))}

      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 border border-[rgba(184,134,11,0.3)] bg-[rgba(74,14,14,0.3)] text-[rgba(244,228,188,0.6)] text-[.6rem] tracking-[.25em] uppercase mb-8 backdrop-blur-sm"
          style={{ fontFamily: "var(--font-cinzel), serif" }}
        >
          <span className="w-1.5 h-1.5 bg-[var(--gold)] rounded-full animate-pulse-dot" />
          Projeto Experimental · Gamificação + IA
        </div>

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.png"
            alt="Analytics de Taverna"
            width={220}
            height={220}
            className="drop-shadow-[0_0_40px_rgba(184,134,11,0.5)] animate-float"
            priority
          />
        </div>

        {/* Title */}
        <h1
          className="text-6xl md:text-8xl font-black mb-6 leading-none tracking-tight"
          style={{ textShadow: "0 0 60px rgba(184,134,11,0.2)" }}
        >
          <span className="animate-shimmer block">Analytics de</span>
          <span className="text-[var(--parchment)] block mt-2">Taverna</span>
        </h1>

        <p className="text-xl md:text-2xl text-[rgba(244,228,188,0.6)] max-w-3xl mx-auto mb-4 leading-relaxed font-[var(--font-crimson-pro)] italic">
          Uma experiência interativa que transforma
          <strong className="text-[var(--gold)] not-italic"> dados comportamentais</strong> em
          <strong className="text-[var(--copper)] not-italic"> personagens de RPG únicos</strong>
        </p>
        <p className="text-lg text-[rgba(244,228,188,0.35)] mb-12 italic">
          &quot;Descubra qual é sua classe de RPG com base no seu perfil&quot;
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-4 justify-center">
          <a
            href="#jornada"
            className="px-8 py-4 bg-[var(--wine)] border-2 border-[rgba(184,134,11,0.6)] text-[var(--parchment)] text-[.8rem] tracking-[.12em] uppercase flex items-center gap-2 hover:border-[var(--gold)] hover:bg-[rgba(74,14,14,0.7)] transition-all duration-300 animate-pulse-wine shadow-[0_0_20px_rgba(184,134,11,0.12)]"
            style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
          >
            ⚔ Iniciar Aventura
          </a>
          <a
            href="#conceito"
            className="px-8 py-4 bg-[rgba(45,27,13,0.8)] border-2 border-[rgba(184,134,11,0.3)] text-[var(--gold)] text-[.8rem] tracking-[.12em] uppercase flex items-center gap-2 hover:border-[var(--gold)] transition-all duration-300"
            style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
          >
            🔮 Como Funciona
          </a>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-4 gap-8 max-w-xl mx-auto">
          {[
            { val: "16",  label: "Classes" },
            { val: "7",   label: "Atributos" },
            { val: "120", label: "Perguntas" },
            { val: "10",  label: "Dimensões" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div
                className="text-3xl font-black text-gradient-gold"
                style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
              >
                {s.val}
              </div>
              <div
                className="text-[.6rem] text-[rgba(244,228,188,0.4)] uppercase tracking-[.25em] mt-1"
                style={{ fontFamily: "var(--font-cinzel), serif" }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll hint */}
      <div
        className="absolute bottom-9 left-1/2 flex flex-col items-center gap-1.5 text-[rgba(244,228,188,0.3)] text-[.55rem] tracking-[.3em] uppercase animate-bounce-down"
        style={{ fontFamily: "var(--font-cinzel), serif" }}
      >
        Role para baixo
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
}
