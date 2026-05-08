"use client";

import { useEffect, useRef } from "react";

const floatingIcons = [
  { icon: "⚔️", x: "10%", y: "20%", delay: "0s", size: "text-3xl" },
  { icon: "🧙", x: "85%", y: "15%", delay: "1s", size: "text-4xl" },
  { icon: "🛡️", x: "5%", y: "65%", delay: "2s", size: "text-3xl" },
  { icon: "💎", x: "90%", y: "60%", delay: "0.5s", size: "text-2xl" },
  { icon: "🔮", x: "75%", y: "80%", delay: "1.5s", size: "text-3xl" },
  { icon: "⚡", x: "20%", y: "80%", delay: "2.5s", size: "text-2xl" },
];

const particles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: `${(i * 17 + 5) % 100}%`,
  top: `${(i * 23 + 10) % 100}%`,
  size: `${(i % 5) + 2}px`,
  delay: `${(i * 0.4) % 6}s`,
  duration: `${(i % 4) + 4}s`,
  opacity: 0.2 + (i % 5) * 0.1,
}));

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
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
        ctx.fillStyle = `rgba(180, 130, 255, ${0.3 + Math.sin(s.a) * 0.3})`;
        ctx.fill();
        s.a += s.speed * 0.02;
      });
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-grid">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(124,58,237,0.25)_0%,_rgba(5,0,16,0)_70%)]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-700/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-700/20 rounded-full blur-3xl" />

      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" />

      {floatingIcons.map((f, i) => (
        <div
          key={i}
          className={`absolute ${f.size} animate-float select-none pointer-events-none`}
          style={{
            left: f.x,
            top: f.y,
            animationDelay: f.delay,
            filter: "drop-shadow(0 0 12px rgba(124,58,237,0.8))",
          }}
        >
          {f.icon}
        </div>
      ))}

      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-purple-500 animate-float pointer-events-none"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}

      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-900/50 border border-purple-700/50 text-purple-300 text-sm mb-8 backdrop-blur-sm">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Projeto Experimental · Gamificação + IA
        </div>

        <h1 className="text-6xl md:text-8xl font-black mb-6 leading-none tracking-tight">
          <span className="animate-shimmer block">Analytics de</span>
          <span className="text-white block mt-2">Taverna</span>
        </h1>

        <p className="text-xl md:text-2xl text-purple-200/80 max-w-3xl mx-auto mb-4 leading-relaxed">
          Uma experiência interativa que transforma
          <strong className="text-amber-400"> dados comportamentais</strong> em
          <strong className="text-cyan-400"> personagens de RPG únicos</strong>
        </p>
        <p className="text-lg text-purple-300/60 mb-12 italic">
          &quot;Descubra qual é sua classe de RPG com base no seu perfil&quot;
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <a
            href="#jornada"
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-lg hover:from-purple-500 hover:to-indigo-500 transition-all duration-300 animate-pulse-glow transform hover:scale-105"
          >
            ⚔️ Iniciar Aventura
          </a>
          <a
            href="#conceito"
            className="px-8 py-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-purple-700/50 text-purple-200 font-semibold text-lg hover:bg-white/10 hover:border-purple-500 transition-all duration-300"
          >
            🔮 Como Funciona
          </a>
        </div>

        <div className="mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto">
          {[
            { val: "5+", label: "Classes" },
            { val: "5", label: "Atributos" },
            { val: "IA", label: "Generativa" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-black text-gradient-gold">{s.val}</div>
              <div className="text-xs text-purple-400 uppercase tracking-widest mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-purple-400/60 text-xs animate-bounce">
        <span>Role para baixo</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
}
