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
            <p className="text-[rgba(240,226,189,0.6)] text-lg max-w-2xl mx-auto italic">
              5 perguntas de um banco de 120 pontuam 10 dimensões que se transformam em 7 atributos e 1 entre 16 classes únicas.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Ficha de personagem — página do diário */}
          <Reveal>
            <div className="paper-card paper-frame arcane-corners p-8">
              <span className="ac-bl" /><span className="ac-br" />
              <h3
                className="text-[var(--ink)] text-xl mb-7 flex items-center gap-3"
                style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
              >
                <BarChart3 size={20} strokeWidth={1.6} className="text-[var(--foil)]" /> 7 Atributos RPG
              </h3>
              <div className="space-y-4">
                {attributes.map((attr, i) => (
                  <div key={attr.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <attr.Icon size={18} strokeWidth={1.6} className="text-[var(--seal)]" />
                        <div>
                          <div
                            className="text-[var(--foil)] text-[.7rem] uppercase tracking-[.15em]"
                            style={{ fontFamily: "var(--font-cinzel), serif" }}
                          >
                            {attr.name}
                          </div>
                          <div className="text-[var(--ink-50)] text-[.65rem]">{attr.desc}</div>
                        </div>
                      </div>
                      <span
                        className="text-[var(--ink)] text-[.85rem] font-bold"
                        style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
                      >
                        {attr.value}
                      </span>
                    </div>
                    <div className="h-1.5 bg-[rgba(96,66,26,0.15)] border border-[rgba(96,66,26,0.25)] overflow-hidden">
                      <AnimatedBar pct={attr.value} delay={i * 0.08} className="stat-bar-fill stat-bar" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-[rgba(140,35,24,0.08)] border-l-[3px] border-[rgba(140,35,24,0.55)]">
                <div
                  className="text-[.6rem] tracking-[.25em] uppercase text-[var(--seal)] opacity-80 mb-1"
                  style={{ fontFamily: "var(--font-cinzel), serif" }}
                >
                  Pipeline de Cálculo
                </div>
                <code
                  className="text-[var(--ink-70)] text-[.75rem] tracking-[.05em]"
                  style={{ fontFamily: "var(--font-cinzel), serif" }}
                >
                  Respostas → 10 Dimensões → 7 Atributos → Classe
                </code>
              </div>
            </div>
          </Reveal>

          {/* Classes grid — cartas do baralho em pergaminho */}
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
                    <div className="card-hover paper-card paper-frame p-4 h-full">
                      <div className="icon-frame w-11 h-11 mb-2.5">
                        <cls.Icon size={20} strokeWidth={1.5} />
                      </div>
                      <h4
                        className="text-[var(--ink)] text-[.75rem] tracking-[.06em] mb-2 leading-snug"
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
                {/* Página em branco — "atividades em preparação", como no diário */}
                <div className="border border-dashed border-[rgba(201,151,63,0.35)] bg-[rgba(238,221,179,0.05)] p-4 flex items-center justify-center text-center h-full">
                  <div>
                    <Sparkles size={28} strokeWidth={1.4} className="text-[var(--gold-light)] mx-auto mb-2" />
                    <div
                      className="text-[rgba(230,188,106,0.75)] text-[.7rem] tracking-[.1em]"
                      style={{ fontFamily: "var(--font-cinzel), serif" }}
                    >
                      + 8 classes
                    </div>
                    <div className="text-[rgba(240,226,189,0.4)] text-[.75rem] italic mt-1">
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
