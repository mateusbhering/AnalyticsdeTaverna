import { VenetianMask } from "@/components/ui/illustrated-icons";
import { Reveal } from "@/components/ui/reveal";
import ClassCarousel from "@/components/ClassCarousel";

const attributes = [
  { name: "Força", value: 78, desc: "Persistência + Liderança" },
  { name: "Inteligência", value: 65, desc: "Estratégia + Percepção" },
  { name: "Agilidade", value: 58, desc: "Adaptabilidade + Impulsividade × 0.5" },
  { name: "Resistência", value: 82, desc: "Disciplina + Persistência" },
  { name: "Carisma", value: 71, desc: "Sociabilidade + Liderança" },
  { name: "Sabedoria", value: 60, desc: "Empatia + Percepção" },
  { name: "Caos", value: 45, desc: "Criatividade + Impulsividade" },
];

export default function AttributesSection() {
  return (
    <div className="bg-dark-wood">
      <section id="atributos" className="py-28 px-6 relative max-w-7xl mx-auto">
        <div className="section-line-top" />
        <Reveal>
          <div className="text-center mb-16">
            <span className="section-eyebrow">Alquimia dos Dados</span>
            <h2 className="text-5xl text-[var(--parchment)] mb-4">Atributos &amp; <span className="gold-grad">Classes</span></h2>
            <p className="text-[rgba(240,226,189,0.6)] text-lg max-w-2xl mx-auto italic">5 perguntas de um banco de 120 pontuam 10 dimensões que se transformam em 7 atributos e 1 entre 16 classes únicas.</p>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <Reveal>
            <div className="attribute-symbols">
              <h3 className="text-[var(--parchment)] text-xl mb-7">7 Atributos RPG</h3>
              <div className="attribute-symbol-grid">
                {attributes.map((attr, index) => (
                  <figure key={attr.name} className="attribute-symbol" aria-label={`${attr.name}: ${attr.value} de 100. ${attr.desc}`}>
                    <div className="attribute-gauge">
                      <svg className="attribute-arc" viewBox="0 0 100 100" aria-hidden="true">
                        <path className="attribute-arc-track" d="M18 76 A42 42 0 1 1 82 76" pathLength={100} />
                        <path className="attribute-arc-score" d="M18 76 A42 42 0 1 1 82 76" pathLength={100} strokeDasharray={`${attr.value} 100`} />
                      </svg>
                      <span className="attribute-drawn-icon" aria-hidden="true" style={{ backgroundPosition: `${(index % 4) * 100 / 3}% ${index < 4 ? 0 : 100}%` }} />
                      <span className="attribute-score" aria-hidden="true">{attr.value}</span>
                    </div>
                    <figcaption><h4>{attr.name}</h4><p>{attr.desc}</p></figcaption>
                  </figure>
                ))}
              </div>
              <p className="attribute-pipeline">Respostas → 10 Dimensões → 7 Atributos → Classe</p>
            </div>
          </Reveal>
          <div>
            <Reveal><h3 className="text-[var(--parchment)] text-xl mb-7 flex items-center gap-3"><VenetianMask size={20} strokeWidth={1.6} className="text-[var(--gold-light)]" /> 16 Classes de RPG</h3></Reveal>
            <ClassCarousel />
          </div>
        </div>
      </section>
    </div>
  );
}
