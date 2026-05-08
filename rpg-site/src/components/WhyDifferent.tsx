const differentials = [
  {
    icon: "🧬",
    title: "Psicologia Aplicada",
    border: "border-purple-600/40",
    bg: "bg-purple-500/10",
    accent: "text-purple-400",
    desc: "O quiz mapeia traços reais de personalidade e os traduz em atributos de jogo — ciência virando diversão.",
  },
  {
    icon: "🤖",
    title: "IA Generativa",
    border: "border-cyan-600/40",
    bg: "bg-cyan-500/10",
    accent: "text-cyan-400",
    desc: "Google Gemini transforma foto e texto em avatar e narrativa únicos — cada resultado é genuinamente personalizado.",
  },
  {
    icon: "🌐",
    title: "Viral por Design",
    border: "border-pink-600/40",
    bg: "bg-pink-500/10",
    accent: "text-pink-400",
    desc: "O card digital é feito para ser compartilhado. Cada usuário vira embaixador da experiência.",
  },
  {
    icon: "🎮",
    title: "Gamificação Real",
    border: "border-amber-600/40",
    bg: "bg-amber-500/10",
    accent: "text-amber-400",
    desc: "Não é só pontos e badges — é uma jornada completa com começo, meio e recompensa emocional.",
  },
];

export default function WhyDifferent() {
  return (
    <section id="diferenciais" className="py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(124,58,237,0.15)_0%,_transparent_60%)]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-600/40 to-transparent" />

      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-20">
          <span className="text-pink-400 text-sm font-semibold uppercase tracking-widest">Por Que É Diferente</span>
          <h2 className="text-5xl font-black text-white mt-3 mb-4">
            Nossa <span className="text-gradient-purple">Vantagem</span>
          </h2>
          <p className="text-purple-300/70 text-lg max-w-2xl mx-auto">
            Não somos mais um quiz de personalidade. Somos uma análise de comportamento coletivo em tempo real.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {differentials.map((d) => (
            <div
              key={d.title}
              className={`card-hover rounded-3xl ${d.bg} border ${d.border} p-10 backdrop-blur-sm relative overflow-hidden`}
            >
              <div className="absolute -bottom-4 -right-4 text-9xl opacity-10 select-none">{d.icon}</div>
              <div className="relative">
                <div className="text-5xl mb-6">{d.icon}</div>
                <h3 className="text-white font-black text-2xl mb-3">{d.title}</h3>
                <p className="text-purple-200/70 leading-relaxed text-base">{d.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <div className="inline-block rounded-2xl bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border border-purple-700/40 px-8 py-6 backdrop-blur-sm">
            <p className="text-xl font-bold text-white">
              &quot;Não é apenas um jogo. Ele transforma{" "}
              <span className="text-amber-400">decisões comportamentais</span> em{" "}
              <span className="text-cyan-400">dados quantificáveis</span>.&quot;
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
