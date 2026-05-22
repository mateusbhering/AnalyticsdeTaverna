const pillars = [
  {
    icon: "📸",
    title: "Foto Criativa",
    border: "border-cyan-500/40",
    iconBg: "bg-cyan-500/20",
    desc: "Uma webcam de alta resolução captura sua imagem. Essa foto é a semente para o Google Gemini gerar um avatar de RPG único que reflete sua essência.",
  },
  {
    icon: "🧠",
    title: "Quiz Comportamental",
    border: "border-purple-500/40",
    iconBg: "bg-purple-500/20",
    desc: "5 perguntas comportamentais sorteadas do banco de 120 pontuam 10 dimensões psicológicas — de Adaptabilidade a Liderança — que moldam seus 7 atributos de RPG.",
  },
  {
    icon: "⚔️",
    title: "Simulação de Batalha",
    border: "border-amber-500/40",
    iconBg: "bg-amber-500/20",
    desc: "Sistema automático simula batalhas entre jogadores com base em atributos, vantagens de classe e um leve fator aleatório para emoção.",
  },
  {
    icon: "🃏",
    title: "Card Digital",
    border: "border-rose-500/40",
    iconBg: "bg-rose-500/20",
    desc: "Sua jornada imortalizada em um card digital exclusivo — nome, classe, atributos, avatar e resultado. Mecanismo de viralização orgânica.",
  },
];

export default function ConceptSection() {
  return (
    <section id="conceito" className="py-32 px-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-600/50 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(6,182,212,0.1)_0%,_transparent_60%)]" />

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <span className="text-cyan-400 text-sm font-semibold uppercase tracking-widest">O Coração da Aventura</span>
          <h2 className="text-5xl font-black text-white mt-3 mb-4">
            Conceito <span className="text-gradient-purple">Central</span>
          </h2>
          <p className="text-purple-300/70 text-lg max-w-2xl mx-auto">
            A fusão perfeita entre tradução de comportamento em dados e gamificação imersiva.
          </p>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-700/30 p-10 md:p-16 mb-16 text-center backdrop-blur-sm glow-purple">
          <p className="text-2xl md:text-3xl font-bold text-white leading-relaxed">
            &quot;A maioria das experiências com dados é fria e técnica. Aqui,{" "}
            <span className="text-purple-300">o dado vira identidade</span> —
            e identidade gera{" "}
            <span className="text-amber-400">engajamento</span>.&quot;
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {pillars.map((p) => (
            <div
              key={p.title}
              className={`card-hover rounded-2xl bg-white/3 border ${p.border} p-8 backdrop-blur-sm`}
            >
              <div className={`w-14 h-14 rounded-2xl ${p.iconBg} flex items-center justify-center text-3xl mb-5`}>
                {p.icon}
              </div>
              <h3 className="text-white font-bold text-xl mb-3">{p.title}</h3>
              <p className="text-purple-300/70 text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
