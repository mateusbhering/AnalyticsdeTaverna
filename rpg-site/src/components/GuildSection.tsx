import Image from "next/image";

const advisor = {
  name: "Fernando Nemec",
  role: "Orientador",
  icon: "👑",
  photo: "/guild/fernando-nemec.png",
};

const members = [
  { name: "Julia de Moraes Barbosa",           icon: "🧙‍♀️", photo: "/guild/julia-moraes.png" },
  { name: "Mariana Ayumi Dantas Kuramitsu",    icon: "⚔️",  photo: "/guild/mariana-ayumi.png" },
  { name: "Yasmin Yumi Tsunokawa",             icon: "🏹",  photo: "/guild/yasmin-yumi.png" },
  { name: "Lucas Luna Pimentel",               icon: "🛡️",  photo: "/guild/lucas-luna.png" },
  { name: "Lucas Amaral da Silva Barros",      icon: "🗡️",  photo: null },
  { name: "Mateus Bhering Beltrão Santos",     icon: "🔮",  photo: "/guild/mateus-bhering.png" },
  { name: "Guilherme Ladeira Correa Santos",   icon: "⚡",  photo: "/guild/guilherme-ladeira.png" },
];

export default function GuildSection() {
  return (
    <div
      style={{ background: "url('https://www.transparenttextures.com/patterns/dark-wood.png'), var(--charcoal)" }}
    >
      <section id="guilda" className="py-28 px-6 relative max-w-5xl mx-auto overflow-hidden">
        <div className="section-line-top" />

        <div className="text-center mb-16">
          <span className="section-eyebrow">Os Aventureiros</span>
          <h2 className="text-5xl text-[var(--parchment)] mb-4">
            Nossa <span className="gold-grad">Guilda</span>
          </h2>
          <p className="text-[rgba(244,228,188,0.55)] text-lg max-w-xl mx-auto italic">
            Os heróis por trás da experiência. Unidos por dados, batalhas e muita criatividade.
          </p>
        </div>

        {/* Advisor */}
        <div className="mb-8 flex justify-center">
          <div className="card-hover arcane-corners group bg-[rgba(184,134,11,0.06)] border border-[rgba(184,134,11,0.3)] p-5 px-7 flex items-center gap-4 max-w-[380px] w-full">
            <span className="ac-bl" /><span className="ac-br" />
            <div className="flex-shrink-0 w-15 h-15 rounded-full overflow-hidden border-2 border-[rgba(184,134,11,0.4)] group-hover:border-[var(--gold)] transition-all duration-200 w-[60px] h-[60px]">
              <Image
                src={advisor.photo}
                alt={advisor.name}
                width={60}
                height={60}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span
                className="text-[var(--gold)] text-[.55rem] tracking-[.25em] uppercase"
                style={{ fontFamily: "var(--font-cinzel), serif" }}
              >
                {advisor.role}
              </span>
              <p
                className="text-[var(--parchment)] text-[.9rem] tracking-[.06em] mt-0.5"
                style={{ fontFamily: "var(--font-cinzel), serif" }}
              >
                {advisor.name}
              </p>
            </div>
          </div>
        </div>

        {/* Members grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <div
              key={member.name}
              className="card-hover arcane-corners group bg-[rgba(15,9,5,0.8)] border border-[rgba(184,134,11,0.1)] p-5 flex items-center gap-4"
            >
              <span className="ac-bl" /><span className="ac-br" />
              <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden border border-[rgba(184,134,11,0.25)] group-hover:border-[rgba(184,134,11,0.5)] transition-all duration-200">
                {member.photo ? (
                  <Image
                    src={member.photo}
                    alt={member.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[rgba(74,14,14,0.3)] flex items-center justify-center text-2xl">
                    {member.icon}
                  </div>
                )}
              </div>
              <div>
                <p
                  className="text-[var(--parchment)] text-[.78rem] tracking-[.05em] leading-snug"
                  style={{ fontFamily: "var(--font-cinzel), serif" }}
                >
                  {member.name}
                </p>
                <p className="text-[rgba(184,134,11,0.5)] text-xs mt-0.5">Membro da Guilda</p>
              </div>
            </div>
          ))}
        </div>

        {/* Fleur decoration */}
        <div className="mt-14 flex items-center gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[rgba(184,134,11,0.3)]" />
          <span className="text-[rgba(184,134,11,0.4)] text-2xl">⚜</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[rgba(184,134,11,0.3)]" />
        </div>
      </section>
    </div>
  );
}
