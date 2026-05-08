import Image from "next/image";

const advisor = {
  name: "Fernando Nemec",
  role: "Orientador",
  icon: "👑",
  photo: "/guild/fernando-nemec.png",
};

const members = [
  { name: "Julia de Moraes Barbosa", icon: "🧙‍♀️", photo: "/guild/julia-moraes.png" },
  { name: "Mariana Ayumi Dantas Kuramitsu", icon: "⚔️", photo: "/guild/mariana-ayumi.png" },
  { name: "Yasmin Yumi Tsunokawa", icon: "🏹", photo: "/guild/yasmin-yumi.png" },
  { name: "Lucas Luna Pimentel", icon: "🛡️", photo: "/guild/lucas-luna.png" },
  { name: "Lucas Amaral da Silva Barros", icon: "🗡️", photo: null },
  { name: "Mateus Bhering Beltrão Santos", icon: "🔮", photo: "/guild/mateus-bhering.png" },
  { name: "Guilherme Ladeira Correa Santos", icon: "⚡", photo: "/guild/guilherme-ladeira.png" },
];

export default function GuildSection() {
  return (
    <section id="guilda" className="py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(245,158,11,0.1)_0%,_transparent_70%)]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-600/40 to-transparent" />

      <div className="max-w-5xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-20">
          <span className="text-amber-400 text-sm font-semibold uppercase tracking-widest">Os Aventureiros</span>
          <h2 className="text-5xl font-black text-white mt-3 mb-4">
            Nossa <span className="text-gradient-gold">Guilda</span>
          </h2>
          <p className="text-purple-300/70 text-lg max-w-xl mx-auto">
            Os heróis por trás da experiência. Unidos por dados, batalhas e muita criatividade.
          </p>
        </div>

        {/* Advisor */}
        <div className="mb-8">
          <div className="card-hover group rounded-2xl bg-gradient-to-r from-amber-900/30 to-amber-800/10 border border-amber-500/40 p-6 backdrop-blur-sm flex items-center gap-5 max-w-sm mx-auto">
            <div className="flex-shrink-0 w-16 h-16 rounded-full overflow-hidden border-2 border-amber-500/60 group-hover:border-amber-400 transition-all duration-200">
              <Image
                src={advisor.photo}
                alt={advisor.name}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="text-amber-400 text-xs font-semibold uppercase tracking-widest">{advisor.role}</span>
              <p className="text-white font-bold text-base leading-snug mt-0.5">{advisor.name}</p>
            </div>
          </div>
        </div>

        {/* Members grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {members.map((member) => (
            <div
              key={member.name}
              className="card-hover group rounded-2xl bg-white/3 border border-amber-700/20 hover:border-amber-600/50 p-6 backdrop-blur-sm flex items-center gap-4"
            >
              {/* Avatar */}
              <div className="flex-shrink-0 w-14 h-14 rounded-full overflow-hidden border-2 border-amber-600/30 group-hover:border-amber-500/60 transition-all duration-200">
                {member.photo ? (
                  <Image
                    src={member.photo}
                    alt={member.name}
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-amber-700/40 to-amber-900/40 flex items-center justify-center text-2xl">
                    {member.icon}
                  </div>
                )}
              </div>

              {/* Name */}
              <div>
                <p className="text-white font-semibold text-sm leading-snug">
                  {member.name}
                </p>
                <p className="text-amber-500/50 text-xs mt-0.5">Membro da Guilda</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom decoration */}
        <div className="mt-16 flex items-center justify-center gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-800/40" />
          <span className="text-amber-600/50 text-2xl">⚜️</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-800/40" />
        </div>
      </div>
    </section>
  );
}
