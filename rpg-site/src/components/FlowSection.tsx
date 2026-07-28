import {
  Target,
  DoorOpen,
  Camera,
  FlaskConical,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import TiltCard from "@/components/ui/tilt-card";

const steps: {
  num: string;
  Icon: LucideIcon;
  title: string;
  description: string;
  tags: string[];
}[] = [
  {
    num: "01",
    Icon: Target,
    title: "Atração",
    description: "Telas vibrantes com batalhas épicas e ranking ao vivo capturam o olhar.",
    tags: ["Visual Impactante", "Ranking Live"],
  },
  {
    num: "02",
    Icon: DoorOpen,
    title: "Entrada",
    description: "O usuário escolhe seu destino: jogar sozinho contra a IA ou desafiar um amigo.",
    tags: ["Solo vs IA", "Multiplayer"],
  },
  {
    num: "03",
    Icon: Camera,
    title: "Captura",
    description: "Webcam captura sua foto. Quiz de 5 perguntas revela sua personalidade.",
    tags: ["Foto + Avatar", "Quiz 5 Q's"],
  },
  {
    num: "04",
    Icon: FlaskConical,
    title: "Processamento",
    description: "Dimensões viram 7 atributos RPG. Tags secretas definem sua classe entre 16.",
    tags: ["7 Atributos", "16 Classes"],
  },
  {
    num: "05",
    Icon: Trophy,
    title: "Apresentação",
    description: "O momento «uau»! Avatar, classe, batalha simulada e card digital com QR Code.",
    tags: ["Batalha", "Card Digital", "QR Code"],
  },
];

export default function FlowSection() {
  return (
    <div className="bg-black-linen">
      <section id="fluxo" className="py-28 px-6 relative max-w-7xl mx-auto">
        <Reveal>
          <div className="text-center mb-16">
            <span className="section-eyebrow">Jornada Completa</span>
            <h2 className="text-5xl text-[var(--parchment)] mb-4">
              Fluxo da <span className="gold-grad">Experiência</span>
            </h2>
            <p className="text-[rgba(244,228,188,0.55)] text-lg max-w-2xl mx-auto italic">
              Cada etapa cuidadosamente desenhada para engajar e surpreender — do primeiro olhar ao compartilhamento viral.
            </p>
          </div>
        </Reveal>

        <div className="relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-[60px] left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-[rgba(184,134,11,0.3)] to-transparent pointer-events-none" />

          <Stagger className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {steps.map((step) => (
              <StaggerItem key={step.num} className="h-full">
                <TiltCard className="h-full">
                  <div className="card-hover arcane-corners relative bg-[rgba(20,12,6,0.85)] border border-[rgba(184,134,11,0.15)] p-7 text-center h-full">
                    <span className="ac-bl" /><span className="ac-br" />
                    {/* Ghost number */}
                    <span
                      className="absolute top-2.5 right-3 text-[2.5rem] font-black text-[rgba(184,134,11,0.08)] pointer-events-none leading-none"
                      style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
                    >
                      {step.num}
                    </span>
                    <div className="icon-frame w-14 h-14 mx-auto mb-4">
                      <step.Icon size={26} strokeWidth={1.5} />
                    </div>
                    <h3
                      className="text-[var(--gold)] text-[.85rem] mb-2"
                      style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
                    >
                      {step.title}
                    </h3>
                    <p className="text-[rgba(244,228,188,0.55)] text-[.85rem] leading-relaxed mb-3">
                      {step.description}
                    </p>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {step.tags.map((tag) => (
                        <span key={tag} className="tag-pill">{tag}</span>
                      ))}
                    </div>
                  </div>
                </TiltCard>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
    </div>
  );
}
