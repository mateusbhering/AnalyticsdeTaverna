export default function Footer() {
  return (
    <footer
      className="border-t border-[rgba(201,151,63,0.2)] py-10 px-6"
      style={{ background: "rgba(16, 9, 4, 0.97)" }}
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-5">
        <div className="flex items-center gap-2.5">
          <div className="wax-seal !w-8 !h-8 text-[.8rem]">⚔</div>
          <span
            className="text-[rgba(240,226,189,0.55)] text-[.75rem] tracking-[.1em]"
            style={{ fontFamily: "var(--font-cinzel), serif" }}
          >
            Analytics de Taverna
          </span>
        </div>

        <p className="text-[rgba(240,226,189,0.35)] text-[.8rem] italic text-center">
          Projeto Experimental · Gamificação + IA Generativa
        </p>

        <div className="flex items-center gap-4">
          {["🧠 Psicologia", "🤖 IA", "🎮 RPG"].map((tag) => (
            <span
              key={tag}
              className="text-[.6rem] text-[rgba(230,188,106,0.45)] tracking-[.15em]"
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
