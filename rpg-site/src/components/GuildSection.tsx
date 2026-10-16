import { useId } from "react";
import { IconText } from "@/components/ui/illustrated-icons";
import Image from "next/image";
import { UserRound } from "@/components/ui/illustrated-icons";
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
  { name: "Julia de Moraes Barbosa",           photo: "/guild/julia-moraes.png",      github: "juliacrws", linkedin: "https://www.linkedin.com/in/julia-de-moraes-0536b7272" },
  { name: "Mariana Ayumi Dantas Kuramitsu",    photo: "/guild/mariana-ayumi.png",     github: "marianakuramitsu", linkedin: "https://www.linkedin.com/in/mariana-kuramitsu-b3b8263a7/" },
  { name: "Yasmin Yumi Tsunokawa",             photo: "/guild/yasmin-yumi.png",       github: "Tsunokaway",      linkedin: "https://www.linkedin.com/in/yasmin-yumi-tsunokawa-359569303/" },
  { name: "Mateus Bhering Beltrão Santos",     photo: "/guild/mateus-bhering.png",    github: "mateusbhering",   linkedin: "https://www.linkedin.com/in/mateus-bhering/" },
];

function GithubMark({ className }: { className?: string }) {
  return <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className={className}><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" /></svg>;
}
function LinkedinMark({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}><path d="M5.4 7.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM3.7 9h3.4v12H3.7Zm5.6 0h3.3v1.6c.7-1.3 1.8-1.9 3.4-1.9 3.2 0 4.3 2 4.3 5.5V21h-3.5v-6.2c0-1.8-.3-3-1.9-3s-2.1 1.2-2.1 2.9V21H9.3Z" /></svg>;
}

function GuildParchmentFrame() {
  const id = useId();
  return <svg className="guild-parchment-frame" viewBox="0 0 240 360" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <radialGradient id={id + "-paper"} cx="45%" cy="38%" r="75%"><stop offset="0" stopColor="#e2d3b4"/><stop offset=".65" stopColor="#d3bf96"/><stop offset="1" stopColor="#9d7d4a"/></radialGradient>
      <filter id={id + "-grain"} x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".65" numOctaves="3" seed="8"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".13"/></feComponentTransfer><feBlend in="SourceGraphic" mode="multiply"/></filter>
    </defs>
    <path d="m16 5 205 1 5 10 10 7-2 312-12 8-5 11-199-1-6-9-10-7 1-313 10-7Z" fill="#a78d61" stroke="#745b36" strokeWidth=".6" />
    <path d="m20 10 196 1 6 11 9 4-2 306-12 6-5 10-190-1-7-10-8-5 1-304 9-7Z" fill="#c6ae83" stroke="#8b7045" strokeWidth=".5" />
    <path d="M26 16h188q1 13 12 14l-2 298q-12 0-14 13H28q-1-12-14-15l2-295q12-2 10-15Z" fill={"url(#" + id + "-paper)"} filter={"url(#" + id + "-grain)"} stroke="#89714b" strokeWidth=".5" />
    <g fill="none" stroke="#806745" strokeWidth=".55" opacity=".7">
      <path d="M30 21h64m52 0h64q0 10 10 13v120m0 49v121q-12 1-14 12h-66m-44 0H32q-1-10-13-14V203m0-49V35q12-2 11-14Z" />
      <path d="M34 25h54m64 0h54m10 18v101m0 68v104M24 44v100m0 69v102m14 16h50m64 0h48" />
      <path d="M101 27h12V16h15v14h-11v-9h6v5h-3m-22-4H83m48 0h24M18 162v12h9v-16h-6v12m0 8v13h6v-9h-3m-10-28v-18m0 64v17m205-55v12h-9v-16h6v12m0 8v13h-6v-9h3m10-28v-18m0 64v17" />
      <path d="M91 328h18m22 0h18m-29-4c-12-6-11-13-9-13 4 0 9 8 9 13 0-5 5-13 9-13 3 0 3 7-9 13Zm0 0v9m-12-12-8-5m32 5 8-5m-34 12-8 3m36-3 8 3" />
    </g>
    <g fill="#c9a46e" opacity=".4"><circle cx="35" cy="74" r="1"/><circle cx="207" cy="265" r="1.2"/><circle cx="35" cy="293" r=".8"/><circle cx="204" cy="85" r=".8"/><circle cx="54" cy="334" r=".6"/></g>
  </svg>;
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

        {/* Orientador em pergaminho ornamentado. */}
        <Reveal delay={0.05}>
          <div className="mb-12 guild-guides">
            <div className="guild-guide guild-guide-mage" aria-hidden="true"><Image src="/classes/guild-presenters-v2.png" alt="" width={1776} height={888} unoptimized loading="eager" className="guild-guide-art" /></div>
            <div className="card-hover guild-parchment-card group guild-advisor w-[200px] text-center">
              <GuildParchmentFrame />
              <div className="guild-photo overflow-hidden border border-[rgba(96,66,26,0.35)] aspect-square">
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
            <div className="guild-guide guild-guide-paladin" aria-hidden="true"><Image src="/classes/guild-presenters-v2.png" alt="" width={1776} height={888} unoptimized loading="eager" className="guild-guide-art" /></div>
          </div>
        </Reveal>

        {/* Fotos originais em cards de pergaminho. */}
        <Stagger className="guild-member-grid grid grid-cols-2 gap-x-8 gap-y-10 max-w-3xl mx-auto">
          {members.map((member) => (
            <StaggerItem key={member.name} rotate={0} className="h-full">
              <div
                className="card-hover guild-parchment-card group h-full text-center"
              >
                <GuildParchmentFrame />
                <div className="guild-photo overflow-hidden border border-[rgba(96,66,26,0.35)] aspect-square">
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
                      className="guild-linkedin inline-flex items-center text-[var(--foil)] hover:text-[var(--seal)] transition-colors"
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
          <span className="text-[rgba(230,188,106,0.5)] text-2xl">{<IconText text={"⚜"} />}</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[rgba(201,151,63,0.35)]" />
        </div>
      </section>
    </div>
  );
}
