"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import {
  Swords,
  WandSparkles,
  Shield,
  Gem,
  Sparkles,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { SpecialText } from "@/components/ui/special-text";
import Magnetic from "@/components/ui/magnetic";
import CountUp from "@/components/ui/count-up";

const floatingIcons: {
  Icon: LucideIcon;
  x: string;
  y: string;
  delay: string;
  size: number;
  depth: number;
}[] = [
  { Icon: Swords,       x: "10%", y: "20%", delay: "0s",   size: 34, depth: 26 },
  { Icon: WandSparkles, x: "85%", y: "15%", delay: "1s",   size: 40, depth: -32 },
  { Icon: Shield,       x: "5%",  y: "65%", delay: "2s",   size: 34, depth: 20 },
  { Icon: Gem,          x: "90%", y: "60%", delay: "0.5s", size: 28, depth: -18 },
  { Icon: Sparkles,     x: "75%", y: "80%", delay: "1.5s", size: 34, depth: 30 },
  { Icon: Zap,          x: "20%", y: "80%", delay: "2.5s", size: 28, depth: -22 },
];

const particles = Array.from({ length: 25 }, (_, i) => ({
  id: i,
  left:     `${(i * 17 + 5) % 100}%`,
  duration: `${6 + (i * 0.7) % 14}s`,
  delay:    `${(i * 0.4) % 10}s`,
  opacity:  0.1 + (i % 5) * 0.08,
  size:     `${1 + (i % 3)}px`,
}));

/** Ícone flutuante com parallax sutil seguindo o mouse. */
function FloatIcon({
  Icon,
  x,
  y,
  delay,
  size,
  depth,
  mx,
  my,
}: (typeof floatingIcons)[number] & {
  mx: MotionValue<number>;
  my: MotionValue<number>;
}) {
  const tx = useTransform(mx, (v) => v * depth);
  const ty = useTransform(my, (v) => v * depth);
  return (
    <div
      className="absolute animate-float select-none pointer-events-none"
      style={{ left: x, top: y, animationDelay: delay }}
    >
      <motion.div
        style={{
          x: tx,
          y: ty,
          color: "var(--gold-light)",
          opacity: 0.75,
          filter: "drop-shadow(0 0 12px rgba(184,134,11,0.55))",
        }}
      >
        <Icon size={size} strokeWidth={1.4} />
      </motion.div>
    </div>
  );
}

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Parallax do mouse (normalizado -0.5..0.5, com mola pra suavidade)
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mx = useSpring(rawX, { stiffness: 60, damping: 20 });
  const my = useSpring(rawY, { stiffness: 60, damping: 20 });

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
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        rawX.set((e.clientX - r.left) / r.width - 0.5);
        rawY.set((e.clientY - r.top) / r.height - 0.5);
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(74,14,14,0.35)_0%,_rgba(14,14,14,0)_70%)]" />

      {/* Blobs de gradiente animado (dourado + roxo arcano) */}
      <div className="arcane-blob top-1/4 left-1/4 w-96 h-96 bg-[rgba(184,134,11,0.09)]" />
      <div
        className="arcane-blob bottom-1/4 right-1/4 w-80 h-80 bg-[rgba(124,58,237,0.08)]"
        style={{ animationDelay: "-10s" }}
      />

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

      {/* Ícones medievais flutuando com parallax do mouse */}
      {floatingIcons.map((f, i) => (
        <FloatIcon key={i} {...f} mx={mx} my={my} />
      ))}

      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        {/* Logo */}
        <motion.div
          className="flex justify-center mb-6"
          initial={{ opacity: 0, y: 24, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src="/logo.png"
            alt="Analytics de Taverna"
            width={220}
            height={220}
            className="drop-shadow-[0_0_40px_rgba(184,134,11,0.5)] animate-float"
            priority
          />
        </motion.div>

        {/* Title */}
        <h1
          className="text-4xl sm:text-6xl md:text-8xl font-black mb-6 leading-none tracking-tight"
          style={{ textShadow: "0 0 60px rgba(184,134,11,0.2)" }}
        >
          <span className="block">
            <SpecialText className="animate-shimmer whitespace-nowrap" speed={28}>
              Analytics de
            </SpecialText>
          </span>
          <span className="block mt-2">
            <SpecialText className="text-[var(--parchment)] whitespace-nowrap" speed={28} delay={0.5}>
              Taverna
            </SpecialText>
          </span>
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
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
            <Magnetic>
              <a
                href="#jornada"
                className="press btn-glow px-8 py-4 bg-[var(--wine)] border-2 border-[rgba(184,134,11,0.6)] text-[var(--parchment)] text-[.8rem] tracking-[.12em] uppercase flex items-center gap-2 hover:border-[var(--gold)] hover:bg-[rgba(74,14,14,0.7)] transition-all duration-300 animate-pulse-wine shadow-[0_0_20px_rgba(184,134,11,0.12)]"
                style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
              >
                <Swords size={16} strokeWidth={1.8} /> Iniciar Aventura
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href="#conceito"
                className="press btn-glow px-8 py-4 bg-[rgba(45,27,13,0.8)] border-2 border-[rgba(184,134,11,0.3)] text-[var(--gold)] text-[.8rem] tracking-[.12em] uppercase flex items-center gap-2 hover:border-[var(--gold)] transition-all duration-300"
                style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
              >
                <WandSparkles size={16} strokeWidth={1.8} /> Como Funciona
              </a>
            </Magnetic>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-4 gap-8 max-w-xl mx-auto">
            {[
              { val: 16,  label: "Classes" },
              { val: 7,   label: "Atributos" },
              { val: 120, label: "Perguntas" },
              { val: 10,  label: "Dimensões" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div
                  className="text-3xl font-black text-gradient-gold"
                  style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
                >
                  <CountUp value={s.val} />
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
        </motion.div>
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
