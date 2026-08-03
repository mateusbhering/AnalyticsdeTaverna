import Image from "next/image";
import { UserRound } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";

const advisor = {
  name: "Fernando Nemec",
  role: "Orientador",
  photo: "/guild/fernando-nemec.png",
};

const members = [
  { name: "Julia de Moraes Barbosa",           photo: "/guild/julia-moraes.png" },
  { name: "Mariana Ayumi Dantas Kuramitsu",    photo: "/guild/mariana-ayumi.png" },
  { name: "Yasmin Yumi Tsunokawa",             photo: "/guild/yasmin-yumi.png" },
  { name: "Lucas Amaral da Silva Barros",      photo: null },
  { name: "Mateus Bhering Beltrão Santos",     photo: "/guild/mateus-bhering.png" },
  { name: "Guilherme Ladeira Correa Santos",   photo: "/guild/guilherme-ladeira.png" },
];

export default function GuildSection() {
  return (
    <div className="bg-dark-wood">
      <section id="guilda" className="py-28 px-6 relative max-w-5xl mx-auto overflow-hidden">
        <div className="section-line-top" />

        <Reveal>
          <div className="text-center mb-16">
            <span className="section-eyebrow">Os Aventureiros</span>
            <h2 className="text-5xl text-[var(--parchment)] mb-4">
              Nossa <span className="gold-grad">Guilda</span>
            </h2>
            <p className="text-[rgba(240,226,189,0.6)] text-lg max-w-xl mx-auto italic">
              Os heróis por trás da experiência. Unidos por dados, batalhas e muita criatividade.
            </p>
          </div>
        </Reveal>

        {/* Orientador — polaroid de destaque colada no diário */}
        <Reveal delay={0.05}>
          <div className="mb-12 flex justify-center">
            <div className="card-hover polaroid group w-[200px] -rotate-2 text-center">
              <div className="avatar-lift overflow-hidden border border-[rgba(96,66,26,0.35)] aspect-square">
                <Image
                  src={advisor.photo}
                  alt={advisor.name}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>
              <span
                className="mt-2.5 block text-[var(--seal)] text-[.55rem] tracking-[.28em] uppercase font-bold"
                style={{ fontFamily: "var(--font-cinzel), serif" }}
              >
                {advisor.role}
              </span>
              <p
                className="text-[var(--ink)] text-[.8rem] tracking-[.05em] mt-0.5 leading-snug font-bold"
                style={{ fontFamily: "var(--font-cinzel), serif" }}
              >
                {advisor.name}
              </p>
            </div>
          </div>
        </Reveal>

        {/* Membros — fotos reveladas sendo distribuídas sobre a mesa */}
        <Stagger className="grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-8 max-w-3xl mx-auto">
          {members.map((member, i) => (
            <StaggerItem key={member.name} rotate={i % 2 === 0 ? -5 : 5} className="h-full">
              <div
                className={`card-hover polaroid group h-full text-center ${
                  i % 3 === 0 ? "-rotate-1" : i % 3 === 1 ? "rotate-[1.5deg]" : "-rotate-[1.5deg]"
                }`}
              >
                <div className="avatar-lift overflow-hidden border border-[rgba(96,66,26,0.35)] aspect-square">
                  {member.photo ? (
                    <Image
                      src={member.photo}
                      alt={member.name}
                      width={220}
                      height={220}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[rgba(96,66,26,0.14)] flex items-center justify-center text-[var(--foil)]">
                      <UserRound size={44} strokeWidth={1.3} />
                    </div>
                  )}
                </div>
                <p
                  className="text-[var(--ink)] text-[.72rem] tracking-[.04em] leading-snug mt-2.5 font-bold"
                  style={{ fontFamily: "var(--font-cinzel), serif" }}
                >
                  {member.name}
                </p>
                <p className="text-[var(--ink-70)] text-[.62rem] italic mt-0.5 font-semibold">Membro da Guilda</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        {/* Fleur decoration */}
        <div className="mt-16 flex items-center gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[rgba(201,151,63,0.35)]" />
          <span className="text-[rgba(230,188,106,0.5)] text-2xl">⚜</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[rgba(201,151,63,0.35)]" />
        </div>
      </section>
    </div>
  );
}
