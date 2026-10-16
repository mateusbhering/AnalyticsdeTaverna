import {
  Target,
  DoorOpen,
  Camera,
  FlaskConical,
  Trophy,
  type LucideIcon,
} from "@/components/ui/illustrated-icons";
import { Reveal } from "@/components/ui/reveal";
import Image from "next/image";


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
            <p className="text-[rgba(240,226,189,0.6)] text-lg max-w-2xl mx-auto italic">
              Cada etapa cuidadosamente desenhada para engajar e surpreender — do primeiro olhar ao compartilhamento viral.
            </p>
          </div>
        </Reveal>

        <div className="world-journey" aria-label="Mapa da jornada, da atração à apresentação">
          <Image src="/scenery/rpg-world-journey-v1.png" alt="" fill unoptimized sizes="(max-width: 768px) 100vw, 1200px" className="world-journey-map" />
          <div className="world-journey-patina" aria-hidden="true" />
          <div className="world-journey-caption" aria-hidden="true">Carta de navegação · Os cinco marcos da jornada</div>
          <svg className="world-journey-route" viewBox="0 0 1200 660" preserveAspectRatio="none" aria-hidden="true">
            <path className="world-route-shadow" d="M120 310C170 310 230 120 360 120S510 320 600 320 730 135 840 135 930 325 1080 325" />
            <path className="world-route-ink" d="M120 310C170 310 230 120 360 120S510 320 600 320 730 135 840 135 930 325 1080 325" />
          </svg>
          <ol className="world-journey-stops">
            {steps.map((step) => <li key={step.num} className={`world-journey-stop stop-${step.num}`}>
              <span className="world-journey-pin" aria-hidden="true">{step.num}</span>
              <div className="world-journey-note">
                <span className="world-journey-step">Etapa {step.num}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
                <div className="world-journey-tags">{step.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
              </div>
            </li>)}
          </ol>
          <p className="world-journey-legend">Do primeiro chamado ao seu próprio herói.</p>
        </div>
      </section>
    </div>
  );
}
