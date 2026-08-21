import {
  Swords,
  WandSparkles,
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
      style={{
        background:
          "radial-gradient(55% 45% at 50% 35%, rgba(255,176,80,.13) 0%, transparent 68%), url('/textures/dark-wood.png'), linear-gradient(180deg, #241408 0%, #170d06 90%)",
      }}
    >
      <div className="section-line-top" />

      {/* Poças de luz âmbar animadas */}
      <div className="arcane-blob top-10 left-1/4 w-80 h-80 bg-[rgba(255,176,80,0.09)]" />
      <div
        className="arcane-blob bottom-10 right-1/4 w-72 h-72 bg-[rgba(140,35,24,0.10)]"
        style={{ animationDelay: "-8s" }}
      />

      <div className="absolute top-1/2 left-10 -translate-y-1/2 opacity-[.06] pointer-events-none select-none animate-float text-[var(--gold-light)]">
        <Swords size={110} strokeWidth={1} />
      </div>
      <div
        className="absolute top-1/2 right-10 -translate-y-1/2 opacity-[.06] pointer-events-none select-none animate-float text-[var(--gold-light)]"
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

          <p className="text-xl text-[rgba(240,226,189,0.6)] mb-12 max-w-2xl mx-auto leading-relaxed italic">
            Descubra qual é sua classe de RPG com base no seu perfil. Uma experiência de
            <strong className="text-[var(--gold-light)] not-italic"> gamificação real</strong> que usa
            <strong className="text-[var(--copper)] not-italic"> IA generativa</strong> para criar seu personagem único.
          </p>

          <div className="flex justify-center mb-12">
            <Magnetic>
              <a
                href="/jogar"
                className="press btn-glow btn-seal px-10 py-5 text-[.8rem] tracking-[.12em] uppercase inline-flex items-center gap-2 animate-pulse-wine"
                style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
              >
                <Swords size={16} strokeWidth={1.8} /> Jogar
              </a>
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
