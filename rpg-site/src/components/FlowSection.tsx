const steps = [
  {
    num: "01",
    icon: "🎯",
    title: "Atração",
    color: "from-purple-600 to-purple-800",
    border: "border-purple-600/50",
    description:
      "Telas vibrantes com batalhas épicas e ranking ao vivo capturam o olhar. A frase 'Descubra sua classe de RPG' é o convite irresistível.",
    tags: ["Visual Impactante", "Ranking Live"],
  },
  {
    num: "02",
    icon: "🚪",
    title: "Entrada",
    color: "from-indigo-600 to-indigo-800",
    border: "border-indigo-600/50",
    description:
      "O usuário escolhe seu destino: jogar sozinho contra a IA ou desafiar um amigo para uma batalha lado a lado.",
    tags: ["Solo vs IA", "Multiplayer"],
  },
  {
    num: "03",
    icon: "📸",
    title: "Captura",
    color: "from-cyan-600 to-cyan-800",
    border: "border-cyan-600/50",
    description:
      "Webcam de alta resolução captura sua foto. Quiz de 5–8 perguntas estratégicas revela seus traços comportamentais.",
    tags: ["Foto + Avatar", "Quiz 5–8 Q's"],
  },
  {
    num: "04",
    icon: "⚗️",
    title: "Processamento",
    color: "from-amber-600 to-amber-800",
    border: "border-amber-600/50",
    description:
      "O sistema converte respostas em atributos numéricos, classifica a classe de RPG e a IA gera seu avatar personalizado.",
    tags: ["Atributos", "Classificação", "IA Gemini"],
  },
  {
    num: "05",
    icon: "🏆",
    title: "Apresentação",
    color: "from-rose-600 to-rose-800",
    border: "border-rose-600/50",
    description:
      "O momento 'uau'! Avatar, classe e atributos revelados. Batalha simulada. Card digital gerado com QR Code exclusivo.",
    tags: ["Batalha", "Card Digital", "QR Code"],
  },
];

export default function FlowSection() {
  return (
    <section id="fluxo" className="py-32 px-6 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(124,58,237,0.15)_0%,_transparent_70%)]" />
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-20">
          <span className="text-amber-400 text-sm font-semibold uppercase tracking-widest">Jornada Completa</span>
          <h2 className="text-5xl font-black text-white mt-3 mb-4">
            Fluxo da <span className="text-gradient-purple">Experiência</span>
          </h2>
          <p className="text-purple-300/70 text-lg max-w-2xl mx-auto">
            Cada etapa foi cuidadosamente desenhada para engajar e surpreender — do primeiro olhar ao compartilhamento viral.
          </p>
        </div>

        <div className="relative">
          <div className="hidden lg:block absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-800/0 via-purple-600/50 to-purple-800/0 mx-16" />
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {steps.map((step, i) => (
              <div
                key={i}
                className={`relative card-hover rounded-2xl bg-white/3 backdrop-blur-sm border ${step.border} p-6 shadow-xl`}
              >
                <div className={`inline-flex w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} items-center justify-center text-2xl mb-4 shadow-lg`}>
                  {step.icon}
                </div>
                <div className={`absolute top-4 right-4 text-5xl font-black bg-gradient-to-br ${step.color} bg-clip-text text-transparent opacity-20`}>
                  {step.num}
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-purple-300/70 text-sm leading-relaxed mb-4">{step.description}</p>
                <div className="flex flex-wrap gap-1">
                  {step.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded-full text-xs bg-white/5 border border-white/10 text-purple-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
