const pillars = [
  {
    icon: "📸",
    title: "Foto Criativa",
    desc: "Uma webcam de alta resolução captura sua imagem. Essa foto é a semente para o Google Gemini gerar um avatar de RPG único que reflete sua essência.",
  },
  {
    icon: "🧠",
    title: "Quiz Comportamental",
    desc: "5 perguntas comportamentais sorteadas do banco de 120 pontuam 10 dimensões psicológicas — de Adaptabilidade a Liderança — que moldam seus 7 atributos de RPG.",
  },
  {
    icon: "⚔️",
    title: "Simulação de Batalha",
    desc: "Sistema automático simula batalhas entre jogadores com base em atributos, vantagens de classe e um leve fator aleatório para emoção.",
  },
  {
    icon: "🃏",
    title: "Card Digital",
    desc: "Sua jornada imortalizada em um card digital exclusivo — nome, classe, atributos, avatar e resultado. Mecanismo de viralização orgânica.",
  },
];

export default function ConceptSection() {
  return (
    <div className="bg-dark-wood">
      <section id="conceito" className="py-28 px-6 relative max-w-7xl mx-auto">
        <div className="section-line-top" />

        <div className="text-center mb-16">
          <span className="section-eyebrow">O Coração da Aventura</span>
          <h2 className="text-5xl text-[var(--parchment)] mb-4">
            Conceito <span className="gold-grad">Central</span>
          </h2>
          <p className="text-[rgba(244,228,188,0.55)] text-lg max-w-2xl mx-auto italic">
            A fusão perfeita entre tradução de comportamento em dados e gamificação imersiva.
          </p>
        </div>

        {/* Quote block */}
        <div className="arcane-corners border border-[rgba(184,134,11,0.2)] bg-[radial-gradient(ellipse_at_center,_rgba(74,14,14,0.2)_0%,_transparent_70%)] p-12 text-center mb-12">
          <span className="ac-bl" /><span className="ac-br" />
          <p className="text-2xl md:text-3xl italic text-[var(--parchment)] leading-relaxed">
            &quot;A maioria das experiências com dados é fria e técnica. Aqui,{" "}
            <strong className="text-[var(--gold)] not-italic">o dado vira identidade</strong> —
            e identidade gera{" "}
            <strong className="text-[var(--copper)] not-italic">engajamento</strong>.&quot;
          </p>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {pillars.map((p) => (
            <div
              key={p.title}
              className="card-hover arcane-corners bg-[rgba(20,12,6,0.8)] border border-[rgba(184,134,11,0.18)] p-8"
            >
              <span className="ac-bl" /><span className="ac-br" />
              <div className="w-13 h-13 bg-[rgba(74,14,14,0.5)] border border-[rgba(184,134,11,0.3)] flex items-center justify-center text-3xl mb-5 w-[52px] h-[52px]">
                {p.icon}
              </div>
              <h3
                className="text-[var(--gold)] text-base mb-3"
                style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
              >
                {p.title}
              </h3>
              <p className="text-[rgba(244,228,188,0.6)] text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
