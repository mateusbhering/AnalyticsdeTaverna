const attributes = [
  { name: "Força",        icon: "💪", value: 78, desc: "Persistência + Liderança" },
  { name: "Inteligência", icon: "🧠", value: 65, desc: "Estratégia + Percepção" },
  { name: "Agilidade",    icon: "⚡", value: 58, desc: "Adaptabilidade + Impulsividade × 0.5" },
  { name: "Resistência",  icon: "🛡️", value: 82, desc: "Disciplina + Persistência" },
  { name: "Carisma",      icon: "✨", value: 71, desc: "Sociabilidade + Liderança" },
  { name: "Sabedoria",    icon: "👁️", value: 60, desc: "Empatia + Percepção" },
  { name: "Caos",         icon: "🌪️", value: 45, desc: "Criatividade + Impulsividade" },
];

const classes = [
  { name: "Mago do ChatGPT",         icon: "🔮", traits: ["Estratégia", "NERD", "TECNOLÓGICO"] },
  { name: "Artífice da Gambiarra",   icon: "🔧", traits: ["Criatividade", "GAMBIARRA"] },
  { name: "Ladino do Home Office",   icon: "🏠", traits: ["Adaptabilidade", "FURTIVO"] },
  { name: "Necromante de Planilha",  icon: "📊", traits: ["Disciplina", "PERFECCIONISTA"] },
  { name: "Vidente da Ansiedade",    icon: "🔭", traits: ["Percepção", "OVERTHINKING"] },
  { name: "Invocador de iFood",      icon: "🍕", traits: ["Impulsividade", "DOPAMINA"] },
  { name: "Paladino do Grupo",       icon: "🏰", traits: ["Liderança", "LÍDER"] },
  { name: "Druida de Varanda",       icon: "🌿", traits: ["Empatia", "ZEN"] },
];

export default function AttributesSection() {
  return (
    <div className="bg-dark-wood">
      <section id="atributos" className="py-28 px-6 relative max-w-7xl mx-auto">
        <div className="section-line-top" />
        <div className="text-center mb-16">
          <span className="section-eyebrow">Alquimia dos Dados</span>
          <h2 className="text-5xl text-[var(--parchment)] mb-4">
            Atributos &amp; <span className="gold-grad">Classes</span>
          </h2>
          <p className="text-[rgba(244,228,188,0.55)] text-lg max-w-2xl mx-auto italic">
            5 perguntas de um banco de 120 pontuam 10 dimensões que se transformam em 7 atributos e 1 entre 16 classes únicas.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Attributes panel */}
          <div className="arcane-corners bg-[rgba(15,9,5,0.9)] border border-[rgba(184,134,11,0.15)] p-8">
            <span className="ac-bl" /><span className="ac-br" />
            <h3
              className="text-[var(--parchment)] text-xl mb-7 flex items-center gap-3"
              style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
            >
              <span>📊</span> 7 Atributos RPG
            </h3>
            <div className="space-y-4">
              {attributes.map((attr) => (
                <div key={attr.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{attr.icon}</span>
                      <div>
                        <div
                          className="text-[rgba(184,134,11,0.9)] text-[.7rem] uppercase tracking-[.15em]"
                          style={{ fontFamily: "var(--font-cinzel), serif" }}
                        >
                          {attr.name}
                        </div>
                        <div className="text-[rgba(244,228,188,0.4)] text-[.65rem]">{attr.desc}</div>
                      </div>
                    </div>
                    <span
                      className="text-[var(--parchment)] text-[.85rem] font-bold"
                      style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
                    >
                      {attr.value}
                    </span>
                  </div>
                  <div className="h-1.5 bg-[rgba(184,134,11,0.1)] border border-[rgba(184,134,11,0.15)] overflow-hidden">
                    <div className="stat-bar-fill stat-bar" style={{ width: `${attr.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-[rgba(74,14,14,0.15)] border-l-[3px] border-[rgba(184,134,11,0.4)]">
              <div
                className="text-[.6rem] tracking-[.25em] uppercase text-[var(--gold)] opacity-70 mb-1"
                style={{ fontFamily: "var(--font-cinzel), serif" }}
              >
                Pipeline de Cálculo
              </div>
              <code
                className="text-[rgba(244,228,188,0.6)] text-[.75rem] tracking-[.05em]"
                style={{ fontFamily: "var(--font-cinzel), serif" }}
              >
                Respostas → 10 Dimensões → 7 Atributos → Classe
              </code>
            </div>
          </div>

          {/* Classes grid */}
          <div>
            <h3
              className="text-[var(--parchment)] text-xl mb-7 flex items-center gap-3"
              style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
            >
              <span>🎭</span> 16 Classes de RPG
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {classes.map((cls) => (
                <div
                  key={cls.name}
                  className="card-hover arcane-corners bg-[rgba(20,12,6,0.8)] border border-[rgba(184,134,11,0.15)] p-4"
                >
                  <span className="ac-bl" /><span className="ac-br" />
                  <div className="w-11 h-11 bg-[rgba(74,14,14,0.4)] border border-[rgba(184,134,11,0.2)] flex items-center justify-center text-xl mb-2.5">
                    {cls.icon}
                  </div>
                  <h4
                    className="text-[var(--parchment)] text-[.75rem] tracking-[.06em] mb-2 leading-snug"
                    style={{ fontFamily: "var(--font-cinzel), serif" }}
                  >
                    {cls.name}
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {cls.traits.map((t) => (
                      <span key={t} className="tag-pill">{t}</span>
                    ))}
                  </div>
                </div>
              ))}
              <div className="arcane-corners bg-[rgba(74,14,14,0.1)] border border-dashed border-[rgba(184,134,11,0.2)] p-4 flex items-center justify-center text-center">
                <span className="ac-bl" /><span className="ac-br" />
                <div>
                  <div className="text-3xl mb-2">✨</div>
                  <div
                    className="text-[rgba(184,134,11,0.6)] text-[.7rem] tracking-[.1em]"
                    style={{ fontFamily: "var(--font-cinzel), serif" }}
                  >
                    + 8 classes
                  </div>
                  <div className="text-[rgba(244,228,188,0.3)] text-[.75rem] italic mt-1">
                    Descubra jogando
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
