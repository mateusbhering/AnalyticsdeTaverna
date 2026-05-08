const members = [
  { name: "Julia de Moraes Barbosa", icon: "🧙‍♀️" },
  { name: "Mariana Ayumi Dantas Kuramitsu", icon: "⚔️" },
  { name: "Yasmin Yumi Tsunokawa", icon: "🏹" },
  { name: "Lucas Luna Pimentel", icon: "🛡️" },
  { name: "Lucas Amaral da Silva Barros", icon: "🗡️" },
  { name: "Mateus Bhering Beltrão Santos", icon: "🔮" },
  { name: "Guilherme Ladeira Correa Santos", icon: "⚡" },
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

        {/* Members grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {members.map((member, i) => (
            <div
              key={member.name}
              className="card-hover group rounded-2xl bg-white/3 border border-amber-700/20 hover:border-amber-600/50 p-6 backdrop-blur-sm flex items-center gap-4"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              {/* Icon badge */}
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-amber-700/40 to-amber-900/40 border border-amber-600/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-200">
                {member.icon}
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
