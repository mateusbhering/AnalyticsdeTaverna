export default function Footer() {
  return (
    <footer
      className="border-t border-[rgba(184,134,11,0.15)] py-10 px-6"
      style={{ background: "rgba(10,6,3,0.95)" }}
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[var(--wine)] to-[var(--wood)] border border-[rgba(184,134,11,0.3)] flex items-center justify-center text-sm">
            ⚔
          </div>
          <span
            className="text-[rgba(244,228,188,0.5)] text-[.75rem] tracking-[.1em]"
            style={{ fontFamily: "var(--font-cinzel), serif" }}
          >
            Analytics de Taverna
          </span>
        </div>

        <p className="text-[rgba(244,228,188,0.3)] text-[.8rem] italic text-center">
          Projeto Experimental · Gamificação + IA Generativa
        </p>

        <div className="flex items-center gap-4">
          {["🧠 Psicologia", "🤖 IA", "🎮 RPG"].map((tag) => (
            <span
              key={tag}
              className="text-[.6rem] text-[rgba(184,134,11,0.35)] tracking-[.15em]"
              style={{ fontFamily: "var(--font-cinzel), serif" }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
