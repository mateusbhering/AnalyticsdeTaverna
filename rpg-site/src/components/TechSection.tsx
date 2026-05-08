const techStack = [
  {
    icon: "🖥️",
    name: "Frontend",
    tag: "Interface",
    color: "from-cyan-600 to-cyan-800",
    border: "border-cyan-600/40",
    desc: "Interface interativa e envolvente. Telas vibrantes, ranking ao vivo e experiência fluida em web/app.",
    items: ["React / Next.js", "Tailwind CSS", "Animações Épicas"],
  },
  {
    icon: "⚙️",
    name: "Backend",
    tag: "Motor",
    color: "from-purple-600 to-purple-800",
    border: "border-purple-600/40",
    desc: "Motor para processamento de dados e lógica de negócio. API robusta com endpoints para quiz, batalha e cards.",
    items: ["Node.js / Python", "REST API", "Lógica de Batalha"],
  },
  {
    icon: "🤖",
    name: "IA Generativa",
    tag: "Google Gemini",
    color: "from-amber-600 to-amber-800",
    border: "border-amber-600/40",
    desc: "Google Gemini transforma foto em avatar de RPG e gera descrições narrativas únicas para cada personagem.",
    items: ["Google Gemini", "Geração de Imagem", "Narrativa IA"],
  },
  {
    icon: "📐",
    name: "Lógica Própria",
    tag: "Algoritmo",
    color: "from-green-600 to-green-800",
    border: "border-green-600/40",
    desc: "Sistema robusto de atributos, classificação de classes e simulação de batalha. Modelo determinístico para transparência.",
    items: ["Atributos RPG", "Classificador", "Simulador"],
  },
  {
    icon: "🗄️",
    name: "Banco de Dados",
    tag: "Dados",
    color: "from-rose-600 to-rose-800",
    border: "border-rose-600/40",
    desc: "Armazena respostas e métricas agregadas com segurança. Alimenta o dashboard ao vivo com dados reais.",
    items: ["PostgreSQL", "Redis Cache", "Analytics"],
  },
];

export default function TechSection() {
  return (
    <section id="tecnologia" className="py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(6,182,212,0.1)_0%,_transparent_60%)]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-600/40 to-transparent" />

      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-20">
          <span className="text-cyan-400 text-sm font-semibold uppercase tracking-widest">Espinha Dorsal</span>
          <h2 className="text-5xl font-black text-white mt-3 mb-4">
            Estrutura <span className="text-gradient-purple">Técnica</span>
          </h2>
          <p className="text-purple-300/70 text-lg max-w-2xl mx-auto">
            Tecnologias modernas integradas para uma experiência que escala e impacta.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
          {techStack.slice(0, 3).map((tech) => (
            <div key={tech.name} className={`card-hover rounded-2xl bg-white/3 border ${tech.border} p-8 backdrop-blur-sm`}>
              <div className={`inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br ${tech.color} items-center justify-center text-3xl mb-5 shadow-lg`}>
                {tech.icon}
              </div>
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-white font-bold text-xl">{tech.name}</h3>
                <span className="px-2 py-0.5 text-xs rounded-full bg-white/5 border border-white/10 text-purple-300">{tech.tag}</span>
              </div>
              <p className="text-purple-300/70 text-sm leading-relaxed mb-5">{tech.desc}</p>
              <div className="space-y-2">
                {tech.items.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-purple-200/60">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {techStack.slice(3).map((tech) => (
            <div key={tech.name} className={`card-hover rounded-2xl bg-white/3 border ${tech.border} p-8 backdrop-blur-sm`}>
              <div className="flex items-start gap-5">
                <div className={`flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${tech.color} flex items-center justify-center text-3xl shadow-lg`}>
                  {tech.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-white font-bold text-xl">{tech.name}</h3>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-white/5 border border-white/10 text-purple-300">{tech.tag}</span>
                  </div>
                  <p className="text-purple-300/70 text-sm leading-relaxed mb-4">{tech.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {tech.items.map((item) => (
                      <span key={item} className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-purple-300">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
