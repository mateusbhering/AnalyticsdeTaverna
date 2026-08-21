import Image from "next/image";
import { UserRound } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";

const advisor = {
  name: "Fernando Nemec",
  role: "Orientador",
  photo: "/guild/fernando-nemec.png",
};

interface Member {
  name: string;
  photo: string;
  github: string;
  /** Nem todo mundo tem — o ícone só aparece para quem passou o link. */
  linkedin?: string;
}

const members: Member[] = [
  { name: "Julia de Moraes Barbosa",           photo: "/guild/julia-moraes.png",      github: "juliacrws" },
  { name: "Mariana Ayumi Dantas Kuramitsu",    photo: "/guild/mariana-ayumi.png",     github: "marianakuramitsu" },
  { name: "Yasmin Yumi Tsunokawa",             photo: "/guild/yasmin-yumi.png",       github: "Tsunokaway",      linkedin: "https://www.linkedin.com/in/yasmin-yumi-tsunokawa-359569303/" },
  { name: "Lucas Amaral da Silva Barros",      photo: "/guild/lucas-amaral.jpg",      github: "LucasAmaral1306" },
  { name: "Mateus Bhering Beltrão Santos",     photo: "/guild/mateus-bhering.png",    github: "mateusbhering",   linkedin: "https://www.linkedin.com/in/mateus-bhering/" },
  { name: "Guilherme Ladeira Correa Santos",   photo: "/guild/guilherme-ladeira.png", github: "Ladeira26",       linkedin: "https://www.linkedin.com/in/guilherme-l-1898383b3/" },
];

/** Mark oficial do GitHub. O lucide não traz ícones de marca. */
function GithubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden className={className}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

/** Mark oficial do LinkedIn — mesmo motivo do GithubMark. */
function LinkedinMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0Z" />
    </svg>
  );
}

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
                <div className="mt-1.5 flex items-center justify-center gap-2.5">
                  <a
                    href={`https://github.com/${member.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`GitHub de ${member.name} (@${member.github})`}
                    className="inline-flex items-center gap-1.5 text-[var(--foil)] text-[.68rem] hover:text-[var(--seal)] transition-colors"
                  >
                    <GithubMark className="w-3.5 h-3.5 flex-shrink-0" />
                    @{member.github}
                  </a>
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="LinkedIn"
                      aria-label={`LinkedIn de ${member.name}`}
                      className="inline-flex items-center text-[var(--foil)] hover:text-[var(--seal)] transition-colors"
                    >
                      <LinkedinMark className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
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
