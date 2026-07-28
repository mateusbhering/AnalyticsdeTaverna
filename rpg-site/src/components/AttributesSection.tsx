import {
  BicepsFlexed,
  Brain,
  Zap,
  Shield,
  Sparkles,
  Eye,
  Tornado,
  WandSparkles,
  Wrench,
  House,
  BarChart3,
  Telescope,
  Pizza,
  Castle,
  Leaf,
  VenetianMask,
  type LucideIcon,
} from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import TiltCard from "@/components/ui/tilt-card";
import AnimatedBar from "@/components/ui/animated-bar";

const attributes: { name: string; Icon: LucideIcon; value: number; desc: string }[] = [
  { name: "Força",        Icon: BicepsFlexed, value: 78, desc: "Persistência + Liderança" },
  { name: "Inteligência", Icon: Brain,        value: 65, desc: "Estratégia + Percepção" },
  { name: "Agilidade",    Icon: Zap,          value: 58, desc: "Adaptabilidade + Impulsividade × 0.5" },
  { name: "Resistência",  Icon: Shield,       value: 82, desc: "Disciplina + Persistência" },
  { name: "Carisma",      Icon: Sparkles,     value: 71, desc: "Sociabilidade + Liderança" },
  { name: "Sabedoria",    Icon: Eye,          value: 60, desc: "Empatia + Percepção" },
  { name: "Caos",         Icon: Tornado,      value: 45, desc: "Criatividade + Impulsividade" },
];

const classes: { name: string; Icon: LucideIcon; traits: string[] }[] = [
  { name: "Mago do ChatGPT",         Icon: WandSparkles, traits: ["Estratégia", "NERD", "TECNOLÓGICO"] },
  { name: "Artífice da Gambiarra",   Icon: Wrench,       traits: ["Criatividade", "GAMBIARRA"] },
  { name: "Ladino do Home Office",   Icon: House,        traits: ["Adaptabilidade", "FURTIVO"] },
  { name: "Necromante de Planilha",  Icon: BarChart3,    traits: ["Disciplina", "PERFECCIONISTA"] },
  { name: "Vidente da Ansiedade",    Icon: Telescope,    traits: ["Percepção", "OVERTHINKING"] },
  { name: "Invocador de iFood",      Icon: Pizza,        traits: ["Impulsividade", "DOPAMINA"] },
  { name: "Paladino do Grupo",       Icon: Castle,       traits: ["Liderança", "LÍDER"] },
  { name: "Druida de Varanda",       Icon: Leaf,         traits: ["Empatia", "ZEN"] },
];

export default function AttributesSection() {
  return (
    <div className="bg-dark-wood">
      <section id="atributos" className="py-28 px-6 relative max-w-7xl mx-auto">
        <div className="section-line-top" />
        <Reveal>
          <div className="text-center mb-16">
            <span className="section-eyebrow">Alquimia dos Dados</span>
            <h2 className="text-5xl text-[var(--parchment)] mb-4">
              Atributos &amp; <span className="gold-grad">Classes</span>
            </h2>
            <p className="text-[rgba(244,228,188,0.55)] text-lg max-w-2xl mx-auto italic">
              5 perguntas de um banco de 120 pontuam 10 dimensões que se transformam em 7 atributos e 1 entre 16 classes únicas.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Attributes panel */}
          <Reveal>
            <div className="arcane-corners bg-[rgba(15,9,5,0.9)] border border-[rgba(184,134,11,0.15)] p-8">
              <span className="ac-bl" /><span className="ac-br" />
              <h3
                className="text-[var(--parchment)] text-xl mb-7 flex items-center gap-3"
                style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
              >
                <BarChart3 size={20} strokeWidth={1.6} className="text-[var(--gold-light)]" /> 7 Atributos RPG
              </h3>
              <div className="space-y-4">
                {attributes.map((attr, i) => (
                  <div key={attr.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <attr.Icon size={18} strokeWidth={1.6} className="text-[var(--gold-light)]" />
                        <div>
                          <div
                            className="text-[rgba(184,134,11,0.9)] text-[.7rem] uppercase tracking-[.15em]"
                            style={{ fontFamily: "var(--font-cinzel), serif" }}
                          >
                            {attr.name}
                          </div>
                          <div className="text-[rgba(244,228,188,0.4)] text-[.65rem]">{attr.desc}</div>
                        </div>
                      </div>
                      <span
                        className="text-[var(--parchment)] text-[.85rem] font-bold"
                        style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
                      >
                        {attr.value}
                      </span>
                    </div>
                    <div className="h-1.5 bg-[rgba(184,134,11,0.1)] border border-[rgba(184,134,11,0.15)] overflow-hidden">
                      <AnimatedBar pct={attr.value} delay={i * 0.08} className="stat-bar-fill stat-bar" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-[rgba(74,14,14,0.15)] border-l-[3px] border-[rgba(184,134,11,0.4)]">
                <div
                  className="text-[.6rem] tracking-[.25em] uppercase text-[var(--gold)] opacity-70 mb-1"
                  style={{ fontFamily: "var(--font-cinzel), serif" }}
                >
                  Pipeline de Cálculo
                </div>
                <code
                  className="text-[rgba(244,228,188,0.6)] text-[.75rem] tracking-[.05em]"
                  style={{ fontFamily: "var(--font-cinzel), serif" }}
                >
                  Respostas → 10 Dimensões → 7 Atributos → Classe
                </code>
              </div>
            </div>
          </Reveal>

          {/* Classes grid */}
          <div>
            <Reveal>
              <h3
                className="text-[var(--parchment)] text-xl mb-7 flex items-center gap-3"
                style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
              >
                <VenetianMask size={20} strokeWidth={1.6} className="text-[var(--gold-light)]" /> 16 Classes de RPG
              </h3>
            </Reveal>
            <Stagger className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {classes.map((cls) => (
                <StaggerItem key={cls.name} className="h-full">
                  <TiltCard className="h-full">
                    <div className="card-hover arcane-corners bg-[rgba(20,12,6,0.8)] border border-[rgba(184,134,11,0.15)] p-4 h-full">
                      <span className="ac-bl" /><span className="ac-br" />
                      <div className="icon-frame w-11 h-11 mb-2.5">
                        <cls.Icon size={20} strokeWidth={1.5} />
                      </div>
                      <h4
                        className="text-[var(--parchment)] text-[.75rem] tracking-[.06em] mb-2 leading-snug"
                        style={{ fontFamily: "var(--font-cinzel), serif" }}
                      >
                        {cls.name}
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {cls.traits.map((t) => (
                          <span key={t} className="tag-pill">{t}</span>
                        ))}
                      </div>
                    </div>
                  </TiltCard>
                </StaggerItem>
              ))}
              <StaggerItem className="h-full">
                <div className="arcane-corners bg-[rgba(74,14,14,0.1)] border border-dashed border-[rgba(184,134,11,0.2)] p-4 flex items-center justify-center text-center h-full">
                  <span className="ac-bl" /><span className="ac-br" />
                  <div>
                    <Sparkles size={28} strokeWidth={1.4} className="text-[var(--gold-light)] mx-auto mb-2" />
                    <div
                      className="text-[rgba(184,134,11,0.6)] text-[.7rem] tracking-[.1em]"
                      style={{ fontFamily: "var(--font-cinzel), serif" }}
                    >
                      + 8 classes
                    </div>
                    <div className="text-[rgba(244,228,188,0.3)] text-[.75rem] italic mt-1">
                      Descubra jogando
                    </div>
                  </div>
                </div>
              </StaggerItem>
            </Stagger>
          </div>
        </div>
      </section>
    </div>
  );
}
