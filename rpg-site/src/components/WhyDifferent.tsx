const differentials = [
  {
    icon: "🧬",
    title: "Psicologia Aplicada",
    desc: "O quiz mapeia traços reais de personalidade e os traduz em atributos de jogo — ciência virando diversão.",
  },
  {
    icon: "🤖",
    title: "IA Generativa",
    desc: "Google Gemini transforma foto e texto em avatar e narrativa únicos — cada resultado é genuinamente personalizado.",
  },
  {
    icon: "🌐",
    title: "Viral por Design",
    desc: "O card digital é feito para ser compartilhado. Cada usuário vira embaixador da experiência.",
  },
  {
    icon: "🎮",
    title: "Gamificação Real",
    desc: "Não é só pontos e badges — é uma jornada completa com começo, meio e recompensa emocional.",
  },
];

export default function WhyDifferent() {
  return (
    <div
      style={{ background: "url('https://www.transparenttextures.com/patterns/dark-wood.png'), var(--charcoal)" }}
    >
      <section id="diferenciais" className="py-28 px-6 relative max-w-7xl mx-auto overflow-hidden">
        <div className="section-line-top" />

        <div className="text-center mb-16">
          <span className="section-eyebrow">Por Que É Diferente</span>
          <h2 className="text-5xl text-[var(--parchment)] mb-4">
            Nossa <span className="gold-grad">Vantagem</span>
          </h2>
          <p className="text-[rgba(244,228,188,0.55)] text-lg max-w-2xl mx-auto italic">
            Não somos mais um quiz de personalidade. Somos uma análise de comportamento coletivo em tempo real.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {differentials.map((d) => (
            <div
              key={d.title}
              className="card-hover arcane-corners relative bg-[rgba(15,8,4,0.85)] border border-[rgba(184,134,11,0.15)] p-10 overflow-hidden"
            >
              <span className="ac-bl" /><span className="ac-br" />
              <div className="absolute bottom-[-20px] right-[-10px] text-[7rem] opacity-[.06] pointer-events-none transform -rotate-[10deg]">
                {d.icon}
              </div>
              <div className="text-[2.8rem] mb-5">{d.icon}</div>
              <h3
                className="text-[var(--parchment)] text-xl mb-3"
                style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
              >
                {d.title}
              </h3>
              <p className="text-[rgba(244,228,188,0.6)] leading-relaxed text-base">{d.desc}</p>
            </div>
          ))}
        </div>

        <div className="arcane-corners border border-[rgba(184,134,11,0.2)] bg-[radial-gradient(ellipse_at_center,_rgba(74,14,14,0.15)_0%,_transparent_70%)] text-center p-8">
          <span className="ac-bl" /><span className="ac-br" />
          <p className="text-lg italic text-[var(--parchment)]">
            &quot;Não é apenas um jogo. Ele transforma{" "}
            <strong className="text-[var(--gold)] not-italic">decisões comportamentais</strong> em{" "}
            <strong className="text-[var(--copper)] not-italic">dados quantificáveis</strong>.&quot;
          </p>
        </div>
      </section>
    </div>
  );
}
