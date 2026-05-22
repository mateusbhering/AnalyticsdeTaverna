const attributes = [
  { name: "Força",        icon: "💪", value: 78, color: "from-red-500 to-red-700",      desc: "Persistência + Liderança + Impulsividade × 0.5" },
  { name: "Inteligência", icon: "🧠", value: 65, color: "from-blue-500 to-blue-700",    desc: "Estratégia + Percepção" },
  { name: "Agilidade",    icon: "⚡", value: 58, color: "from-yellow-500 to-yellow-700",desc: "Adaptabilidade + Impulsividade × 0.5" },
  { name: "Resistência",  icon: "🛡️", value: 82, color: "from-green-500 to-green-700", desc: "Disciplina + Persistência" },
  { name: "Carisma",      icon: "✨", value: 71, color: "from-pink-500 to-pink-700",    desc: "Sociabilidade + Liderança" },
  { name: "Sabedoria",    icon: "👁️", value: 60, color: "from-indigo-500 to-indigo-700",desc: "Empatia + Percepção" },
  { name: "Caos",         icon: "🌪️", value: 45, color: "from-orange-500 to-orange-700",desc: "Criatividade + Impulsividade" },
];

const classes = [
  { name: "Mago do ChatGPT",          icon: "🔮", color: "from-blue-700 to-violet-900",    border: "border-blue-600/40",    traits: ["Estratégia", "NERD", "TECNOLÓGICO"] },
  { name: "Artífice da Gambiarra",    icon: "🔧", color: "from-orange-700 to-amber-900",   border: "border-orange-600/40",  traits: ["Criatividade", "GAMBIARRA"] },
  { name: "Ladino do Home Office",    icon: "🏠", color: "from-slate-700 to-slate-900",    border: "border-slate-500/40",   traits: ["Adaptabilidade", "FURTIVO"] },
  { name: "Necromante de Planilha",   icon: "📊", color: "from-emerald-800 to-teal-900",   border: "border-emerald-600/40", traits: ["Disciplina", "PERFECCIONISTA"] },
  { name: "Vidente da Ansiedade",     icon: "🔭", color: "from-indigo-700 to-purple-900",  border: "border-indigo-600/40",  traits: ["Percepção", "OVERTHINKING"] },
  { name: "Invocador de iFood",       icon: "🍕", color: "from-red-600 to-red-900",        border: "border-red-500/40",     traits: ["Impulsividade", "DOPAMINA"] },
  { name: "Paladino do Grupo",        icon: "🏰", color: "from-amber-600 to-yellow-800",   border: "border-amber-500/40",   traits: ["Liderança", "LÍDER"] },
  { name: "Druida de Varanda",        icon: "🌿", color: "from-green-700 to-emerald-900",  border: "border-green-600/40",   traits: ["Empatia", "ZEN"] },
];

const moreCount = 8;

export default function AttributesSection() {
  return (
    <section id="atributos" className="py-32 px-6 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(245,158,11,0.08)_0%,_transparent_70%)]" />
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-20">
          <span className="text-amber-400 text-sm font-semibold uppercase tracking-widest">Alquimia dos Dados</span>
          <h2 className="text-5xl font-black text-white mt-3 mb-4">
            Atributos & <span className="text-gradient-gold">Classes</span>
          </h2>
          <p className="text-purple-300/70 text-lg max-w-2xl mx-auto">
            5 perguntas aleatórias de um banco de 120 pontuam 10 dimensões que se transformam em 7 atributos de RPG e revelam 1 entre 16 classes únicas.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Attributes panel */}
          <div className="rounded-3xl bg-white/3 border border-purple-800/30 p-8 backdrop-blur-sm">
            <h3 className="text-white font-bold text-2xl mb-8 flex items-center gap-3">
              <span className="text-3xl">📊</span>
              7 Atributos RPG
            </h3>
            <div className="space-y-5">
              {attributes.map((attr) => (
                <div key={attr.name}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{attr.icon}</span>
                      <div>
                        <div className="text-white font-semibold text-sm">{attr.name}</div>
                        <div className="text-purple-400/60 text-xs font-mono">{attr.desc}</div>
                      </div>
                    </div>
                    <span className="text-amber-400 font-bold text-lg">{attr.value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${attr.color} stat-bar`}
                      style={{ width: `${attr.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 p-4 rounded-xl bg-purple-900/20 border border-purple-700/30">
              <div className="text-purple-400 text-xs font-semibold uppercase tracking-widest mb-2">Pipeline de Cálculo</div>
              <code className="text-purple-300 text-xs font-mono leading-relaxed">
                Respostas → 10 Dimensões → 7 Atributos → Classe
              </code>
            </div>
          </div>

          {/* Classes grid */}
          <div>
            <h3 className="text-white font-bold text-2xl mb-8 flex items-center gap-3">
              <span className="text-3xl">🎭</span>
              16 Classes de RPG
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {classes.map((cls) => (
                <div
                  key={cls.name}
                  className={`card-hover rounded-2xl bg-white/3 border ${cls.border} p-5 backdrop-blur-sm`}
                >
                  <div className={`inline-flex w-12 h-12 rounded-xl bg-gradient-to-br ${cls.color} items-center justify-center text-2xl mb-3`}>
                    {cls.icon}
                  </div>
                  <h4 className="text-white font-bold text-sm mb-2 leading-snug">{cls.name}</h4>
                  <div className="flex flex-wrap gap-1">
                    {cls.traits.map((t) => (
                      <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-purple-300">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              <div className="card-hover rounded-2xl bg-purple-900/20 border border-purple-700/30 p-5 flex items-center justify-center text-center">
                <div>
                  <div className="text-4xl mb-2">✨</div>
                  <div className="text-purple-300 font-semibold text-sm">+ {moreCount} classes</div>
                  <div className="text-purple-400/50 text-xs mt-1">Descubra jogando</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
