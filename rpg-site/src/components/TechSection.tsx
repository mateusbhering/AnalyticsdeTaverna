const techStack = [
  {
    icon: "🖥️",
    name: "Frontend",
    tag: "Interface",
    desc: "Interface interativa e envolvente. Telas vibrantes, ranking ao vivo e experiência fluida em web/app.",
    items: ["React / Next.js", "Tailwind CSS", "Animações Épicas"],
  },
  {
    icon: "⚙️",
    name: "Backend",
    tag: "Motor",
    desc: "Motor para processamento de dados e lógica de negócio. API robusta com endpoints para quiz, batalha e cards.",
    items: ["Node.js / Python", "REST API", "Lógica de Batalha"],
  },
  {
    icon: "🤖",
    name: "IA Generativa",
    tag: "Google Gemini",
    desc: "Google Gemini transforma foto em avatar de RPG e gera descrições narrativas únicas para cada personagem.",
    items: ["Google Gemini", "Geração de Imagem", "Narrativa IA"],
  },
  {
    icon: "📐",
    name: "Lógica Própria",
    tag: "Algoritmo",
    desc: "5 perguntas aleatórias (banco de 120) pontuam 10 dimensões psicológicas. Fórmulas convertem em 7 atributos RPG. Tags definem 1 entre 16 classes. 100% determinístico.",
    items: ["10 Dimensões", "7 Atributos RPG", "16 Classes"],
  },
  {
    icon: "🗄️",
    name: "Banco de Dados",
    tag: "Dados",
    desc: "Armazena respostas e métricas agregadas com segurança. Alimenta o dashboard ao vivo com dados reais.",
    items: ["PostgreSQL", "Redis Cache", "Analytics"],
  },
];

export default function TechSection() {
  return (
    <div className="bg-black-linen">
      <section id="tecnologia" className="py-28 px-6 relative max-w-7xl mx-auto overflow-hidden">
        <div className="section-line-top" />

        <div className="text-center mb-16">
          <span className="section-eyebrow">Espinha Dorsal</span>
          <h2 className="text-5xl text-[var(--parchment)] mb-4">
            Estrutura <span className="gold-grad">Técnica</span>
          </h2>
          <p className="text-[rgba(244,228,188,0.55)] text-lg max-w-2xl mx-auto italic">
            Tecnologias modernas integradas para uma experiência que escala e impacta.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-5">
          {techStack.slice(0, 3).map((tech) => (
            <div
              key={tech.name}
              className="card-hover arcane-corners bg-[rgba(15,9,5,0.9)] border border-[rgba(184,134,11,0.15)] p-8"
            >
              <span className="ac-bl" /><span className="ac-br" />
              <div className="w-13 h-13 bg-[rgba(74,14,14,0.4)] border border-[rgba(184,134,11,0.25)] flex items-center justify-center text-2xl mb-5 w-[52px] h-[52px]">
                {tech.icon}
              </div>
              <div className="flex items-center gap-3 mb-3">
                <h3
                  className="text-[var(--gold)] text-[.9rem]"
                  style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
                >
                  {tech.name}
                </h3>
                <span
                  className="px-2 py-0.5 border border-[rgba(184,134,11,0.25)] text-[rgba(244,228,188,0.5)] text-[.55rem] tracking-[.15em] uppercase"
                  style={{ fontFamily: "var(--font-cinzel), serif" }}
                >
                  {tech.tag}
                </span>
              </div>
              <p className="text-[rgba(244,228,188,0.55)] text-[.88rem] leading-relaxed mb-4">{tech.desc}</p>
              <div className="space-y-1.5">
                {tech.items.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-[.82rem] text-[rgba(244,228,188,0.5)]">
                    <div className="w-1 h-1 bg-[var(--gold)] opacity-50" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {techStack.slice(3).map((tech) => (
            <div
              key={tech.name}
              className="card-hover arcane-corners bg-[rgba(15,9,5,0.9)] border border-[rgba(184,134,11,0.15)] p-8"
            >
              <span className="ac-bl" /><span className="ac-br" />
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 w-[52px] h-[52px] bg-[rgba(74,14,14,0.4)] border border-[rgba(184,134,11,0.25)] flex items-center justify-center text-2xl">
                  {tech.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3
                      className="text-[var(--gold)] text-[.9rem]"
                      style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
                    >
                      {tech.name}
                    </h3>
                    <span
                      className="px-2 py-0.5 border border-[rgba(184,134,11,0.25)] text-[rgba(244,228,188,0.5)] text-[.55rem] tracking-[.15em] uppercase"
                      style={{ fontFamily: "var(--font-cinzel), serif" }}
                    >
                      {tech.tag}
                    </span>
                  </div>
                  <p className="text-[rgba(244,228,188,0.55)] text-[.88rem] leading-relaxed mb-4">{tech.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {tech.items.map((item) => (
                      <span key={item} className="tag-pill">{item}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
