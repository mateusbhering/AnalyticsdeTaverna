import { Dna, Bot, Globe, Gamepad2, type LucideIcon } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import TiltCard from "@/components/ui/tilt-card";

const differentials: { Icon: LucideIcon; title: string; desc: string }[] = [
  {
    Icon: Dna,
    title: "Psicologia Aplicada",
    desc: "O quiz mapeia traços reais de personalidade e os traduz em atributos de jogo — ciência virando diversão.",
  },
  {
    Icon: Bot,
    title: "IA Generativa",
    desc: "Google Gemini transforma foto e texto em avatar e narrativa únicos — cada resultado é genuinamente personalizado.",
  },
  {
    Icon: Globe,
    title: "Viral por Design",
    desc: "O card digital é feito para ser compartilhado. Cada usuário vira embaixador da experiência.",
  },
  {
    Icon: Gamepad2,
    title: "Gamificação Real",
    desc: "Não é só pontos e badges — é uma jornada completa com começo, meio e recompensa emocional.",
  },
];

export default function WhyDifferent() {
  return (
    <div className="bg-dark-wood">
      <section id="diferenciais" className="py-28 px-6 relative max-w-7xl mx-auto overflow-hidden">
        <div className="section-line-top" />

        <Reveal>
          <div className="text-center mb-16">
            <span className="section-eyebrow">Por Que É Diferente</span>
            <h2 className="text-5xl text-[var(--parchment)] mb-4">
              Nossa <span className="gold-grad">Vantagem</span>
            </h2>
            <p className="text-[rgba(240,226,189,0.6)] text-lg max-w-2xl mx-auto italic">
              Não somos mais um quiz de personalidade. Somos uma análise de comportamento coletivo em tempo real.
            </p>
          </div>
        </Reveal>

        <Stagger className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {differentials.map((d) => (
            <StaggerItem key={d.title} className="h-full">
              <TiltCard className="h-full">
                <div className="card-hover paper-card paper-frame relative p-10 overflow-hidden h-full">
                  {/* Marca-d'água em folha de ouro desbotada */}
                  <div className="absolute bottom-[-20px] right-[-10px] opacity-[.08] pointer-events-none transform -rotate-[10deg] text-[var(--foil)]">
                    <d.Icon size={150} strokeWidth={1} />
                  </div>
                  <div className="icon-frame w-16 h-16 mb-5">
                    <d.Icon size={30} strokeWidth={1.4} />
                  </div>
                  <h3
                    className="text-[var(--ink)] text-xl mb-3"
                    style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
                  >
                    {d.title}
                  </h3>
                  <p className="leading-relaxed text-base">{d.desc}</p>
                </div>
              </TiltCard>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal delay={0.1}>
          <div className="paper-card paper-frame arcane-corners text-center p-8">
            <span className="ac-bl" /><span className="ac-br" />
            <p className="text-lg italic" style={{ color: "var(--ink)" }}>
              &quot;Não é apenas um jogo. Ele transforma{" "}
              <strong className="text-[var(--seal)] not-italic">decisões comportamentais</strong> em{" "}
              <strong className="text-[var(--foil)] not-italic">dados quantificáveis</strong>.&quot;
            </p>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
