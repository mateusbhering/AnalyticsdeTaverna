import { Camera, Brain, Swords, WalletCards, Feather, type LucideIcon } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import TiltCard from "@/components/ui/tilt-card";

const pillars: { Icon: LucideIcon; title: string; desc: string }[] = [
  {
    Icon: Camera,
    title: "Foto Criativa",
    desc: "Uma webcam de alta resolução captura sua imagem. Essa foto é a semente para o Google Gemini gerar um avatar de RPG único que reflete sua essência.",
  },
  {
    Icon: Brain,
    title: "Quiz Comportamental",
    desc: "5 perguntas comportamentais sorteadas do banco de 120 pontuam 10 dimensões psicológicas — de Adaptabilidade a Liderança — que moldam seus 7 atributos de RPG.",
  },
  {
    Icon: Swords,
    title: "Simulação de Batalha",
    desc: "Sistema automático simula batalhas entre jogadores com base em atributos, vantagens de classe e um leve fator aleatório para emoção.",
  },
  {
    Icon: WalletCards,
    title: "Card Digital",
    desc: "Sua jornada imortalizada em um card digital exclusivo — nome, classe, atributos, avatar e resultado. Mecanismo de viralização orgânica.",
  },
];

export default function ConceptSection() {
  return (
    <div className="bg-dark-wood">
      <section id="conceito" className="py-28 px-6 relative max-w-7xl mx-auto">
        <div className="section-line-top" />

        <Reveal>
          <div className="text-center mb-16">
            <span className="section-eyebrow">O Coração da Aventura</span>
            <h2 className="text-5xl text-[var(--parchment)] mb-4">
              Conceito <span className="gold-grad">Central</span>
            </h2>
            <p className="text-[rgba(240,226,189,0.6)] text-lg max-w-2xl mx-auto italic">
              A fusão perfeita entre tradução de comportamento em dados e gamificação imersiva.
            </p>
          </div>
        </Reveal>

        {/* Página do diário: citação manuscrita com lacre de cera */}
        <Reveal delay={0.1}>
          <div className="paper-card paper-frame arcane-corners p-12 pb-14 text-center mb-12">
            <span className="ac-bl" /><span className="ac-br" />
            <p className="text-2xl md:text-3xl italic leading-relaxed" style={{ color: "var(--ink)" }}>
              &quot;A maioria das experiências com dados é fria e técnica. Aqui,{" "}
              <strong className="text-[var(--seal)] not-italic">o dado vira identidade</strong> —
              e identidade gera{" "}
              <strong className="text-[var(--foil)] not-italic">engajamento</strong>.&quot;
            </p>
            <div className="mt-7 flex justify-center">
              <div className="wax-seal">
                <Feather size={22} strokeWidth={1.6} />
              </div>
            </div>
          </div>
        </Reveal>

        {/* Pillars — folhas de pergaminho */}
        <Stagger className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {pillars.map((p) => (
            <StaggerItem key={p.title}>
              <TiltCard className="h-full">
                <div className="card-hover paper-card paper-frame p-8 h-full">
                  <div className="icon-frame w-[52px] h-[52px] mb-5">
                    <p.Icon size={24} strokeWidth={1.5} />
                  </div>
                  <h3
                    className="text-[var(--seal)] text-base mb-3"
                    style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
                  >
                    {p.title}
                  </h3>
                  <p className="text-sm leading-relaxed">{p.desc}</p>
                </div>
              </TiltCard>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </div>
  );
}
