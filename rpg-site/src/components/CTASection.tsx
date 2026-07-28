import {
  Swords,
  WandSparkles,
  Zap,
  Camera,
  Brain,
  WalletCards,
  Smartphone,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import Magnetic from "@/components/ui/magnetic";

const chips: { Icon: LucideIcon; label: string }[] = [
  { Icon: Camera,      label: "Foto + Avatar IA" },
  { Icon: Brain,       label: "Quiz Comportamental" },
  { Icon: Swords,      label: "Batalha Épica" },
  { Icon: WalletCards, label: "Card Digital" },
  { Icon: Smartphone,  label: "QR Code" },
  { Icon: BarChart3,   label: "Dashboard Live" },
];

export default function CTASection() {
  return (
    <section
      id="jornada"
      className="py-32 px-6 relative overflow-hidden text-center"
      style={{ background: "radial-gradient(ellipse at center, rgba(74,14,14,.25) 0%, transparent 65%), var(--charcoal)" }}
    >
      <div className="section-line-top" />

      {/* Blobs de gradiente animado */}
      <div className="arcane-blob top-10 left-1/4 w-80 h-80 bg-[rgba(184,134,11,0.07)]" />
      <div
        className="arcane-blob bottom-10 right-1/4 w-72 h-72 bg-[rgba(124,58,237,0.07)]"
        style={{ animationDelay: "-8s" }}
      />

      <div className="absolute top-1/2 left-10 -translate-y-1/2 opacity-[.05] pointer-events-none select-none animate-float text-[var(--gold-light)]">
        <Swords size={110} strokeWidth={1} />
      </div>
      <div
        className="absolute top-1/2 right-10 -translate-y-1/2 opacity-[.05] pointer-events-none select-none animate-float text-[var(--gold-light)]"
        style={{ animationDelay: "2s" }}
      >
        <WandSparkles size={110} strokeWidth={1} />
      </div>

      <div className="max-w-4xl mx-auto relative">
        <Reveal>
          <h2 className="text-6xl md:text-7xl text-[var(--parchment)] mb-6 leading-tight">
            Sua Aventura
            <br />
            <span className="animate-shimmer">Começa Aqui</span>
          </h2>

          <p className="text-xl text-[rgba(244,228,188,0.55)] mb-12 max-w-2xl mx-auto leading-relaxed italic">
            Descubra qual é sua classe de RPG com base no seu perfil. Uma experiência de
            <strong className="text-[var(--gold)] not-italic"> gamificação real</strong> que usa
            <strong className="text-[var(--copper)] not-italic"> IA generativa</strong> para criar seu personagem único.
          </p>

          <div className="flex flex-wrap gap-4 justify-center mb-12">
            <Magnetic>
              <a
                href="/jogar"
                className="press btn-glow px-10 py-5 bg-[var(--wine)] border-2 border-[rgba(184,134,11,0.6)] text-[var(--parchment)] text-[.8rem] tracking-[.12em] uppercase flex items-center gap-2 hover:border-[var(--gold)] hover:bg-[rgba(74,14,14,0.7)] transition-all duration-300 animate-pulse-wine shadow-[0_0_20px_rgba(184,134,11,0.12)]"
                style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
              >
                <Swords size={16} strokeWidth={1.8} /> Jogar Sozinho
              </a>
            </Magnetic>
            <Magnetic>
              <button
                className="press btn-glow px-10 py-5 bg-[rgba(45,27,13,0.8)] border-2 border-[rgba(184,134,11,0.3)] text-[var(--gold)] text-[.8rem] tracking-[.12em] uppercase flex items-center gap-2 hover:border-[var(--gold)] transition-all duration-300 cursor-pointer"
                style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
              >
                <Zap size={16} strokeWidth={1.8} /> Desafiar Alguém
              </button>
            </Magnetic>
          </div>
        </Reveal>

        <Stagger className="flex flex-wrap justify-center gap-3">
          {chips.map((chip) => (
            <StaggerItem key={chip.label} y={16}>
              <span className="tag-pill inline-flex items-center gap-1.5">
                <chip.Icon size={11} strokeWidth={1.8} /> {chip.label}
              </span>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
