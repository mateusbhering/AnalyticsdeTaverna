const attributes = [
  { name: "Força", icon: "💪", value: 85, color: "from-red-500 to-red-700", desc: "Poder físico e impacto direto em batalha" },
  { name: "Inteligência", icon: "🧠", value: 70, color: "from-blue-500 to-blue-700", desc: "Raciocínio lógico e sabedoria estratégica" },
  { name: "Agilidade", icon: "⚡", value: 60, color: "from-yellow-500 to-yellow-700", desc: "Velocidade de reação e esquiva" },
  { name: "Carisma", icon: "✨", value: 75, color: "from-pink-500 to-pink-700", desc: "Influência social e persuasão" },
  { name: "Resistência", icon: "🛡️", value: 90, color: "from-green-500 to-green-700", desc: "Capacidade de absorver dano e resistir" },
];

const classes = [
  {
    name: "Guerreiro",
    icon: "⚔️",
    color: "from-red-700 to-red-900",
    border: "border-red-600/40",
    traits: ["Alta Força", "Alta Resistência"],
    desc: "Combatente implacável que avança sem hesitar.",
  },
  {
    name: "Mago",
    icon: "🔮",
    color: "from-blue-700 to-blue-900",
    border: "border-blue-600/40",
    traits: ["Alta Inteligência", "Magia Arcana"],
    desc: "Mestre do arcano que dobra a realidade à sua vontade.",
  },
  {
    name: "Ladino",
    icon: "🗡️",
    color: "from-gray-700 to-gray-900",
    border: "border-gray-500/40",
    traits: ["Alta Agilidade", "Furtividade"],
    desc: "Nas sombras, aguarda o momento perfeito para agir.",
  },
  {
    name: "Paladino",
    icon: "🏰",
    color: "from-amber-700 to-amber-900",
    border: "border-amber-600/40",
    traits: ["Carisma", "Resistência"],
    desc: "Guardião da luz que protege os mais frágeis.",
  },
  {
    name: "Arqueiro",
    icon: "🏹",
    color: "from-green-700 to-green-900",
    border: "border-green-600/40",
    traits: ["Precisão", "Agilidade"],
    desc: "Nunca erra o alvo, mesmo na mais densa escuridão.",
  },
];

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
            Suas respostas se transformam em estatísticas de jogo que definem quem você é no universo do RPG.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Attributes panel */}
          <div className="rounded-3xl bg-white/3 border border-purple-800/30 p-8 backdrop-blur-sm">
            <h3 className="text-white font-bold text-2xl mb-8 flex items-center gap-3">
              <span className="text-3xl">📊</span>
              Seus Atributos
            </h3>
            <div className="space-y-6">
              {attributes.map((attr) => (
                <div key={attr.name}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{attr.icon}</span>
                      <div>
                        <div className="text-white font-semibold text-sm">{attr.name}</div>
                        <div className="text-purple-400/60 text-xs">{attr.desc}</div>
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
            <div className="mt-8 p-4 rounded-xl bg-amber-900/20 border border-amber-700/30">
              <div className="text-amber-400 text-xs font-semibold uppercase tracking-widest mb-2">Fórmula de Batalha</div>
              <code className="text-amber-300 text-sm font-mono">
                Dano = (Força + Agilidade/2) − Defesa
              </code>
            </div>
          </div>

          {/* Classes grid */}
          <div>
            <h3 className="text-white font-bold text-2xl mb-8 flex items-center gap-3">
              <span className="text-3xl">🎭</span>
              Classes de RPG
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
                  <h4 className="text-white font-bold text-lg mb-1">{cls.name}</h4>
                  <p className="text-purple-300/60 text-xs mb-3">{cls.desc}</p>
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
                  <div className="text-purple-300 font-semibold text-sm">e muito mais!</div>
                  <div className="text-purple-400/50 text-xs mt-1">Gerado por IA</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
