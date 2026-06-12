export default function CTASection() {
  return (
    <section
      id="jornada"
      className="py-32 px-6 relative overflow-hidden text-center"
      style={{ background: "radial-gradient(ellipse at center, rgba(74,14,14,.25) 0%, transparent 65%), var(--charcoal)" }}
    >
      <div className="section-line-top" />
      <div className="absolute top-1/2 left-10 -translate-y-1/2 text-[6rem] opacity-[.06] pointer-events-none select-none animate-float">⚔️</div>
      <div className="absolute top-1/2 right-10 -translate-y-1/2 text-[6rem] opacity-[.06] pointer-events-none select-none animate-float" style={{ animationDelay: "2s" }}>🔮</div>

      <div className="max-w-4xl mx-auto relative">
        <div
          className="inline-flex items-center gap-2 px-4 py-2 border border-[rgba(184,134,11,0.3)] bg-[rgba(184,134,11,0.06)] text-[rgba(184,134,11,0.7)] text-[.6rem] tracking-[.25em] uppercase mb-8 backdrop-blur-sm"
          style={{ fontFamily: "var(--font-cinzel), serif" }}
        >
          🏆 Projeto Experimental · IC SITE
        </div>

        <h2 className="text-6xl md:text-7xl text-[var(--parchment)] mb-6 leading-tight">
          Sua Aventura
          <br />
          <span className="animate-shimmer">Começa Aqui</span>
        </h2>

        <p className="text-xl text-[rgba(244,228,188,0.55)] mb-12 max-w-2xl mx-auto leading-relaxed italic">
          Descubra qual é sua classe de RPG com base no seu perfil. Uma experiência de
          <strong className="text-[var(--gold)] not-italic"> gamificação real</strong> que usa
          <strong className="text-[var(--copper)] not-italic"> IA generativa</strong> para criar seu personagem único.
        </p>

        <div className="flex flex-wrap gap-4 justify-center mb-12">
          <a
            href="/jogar"
            className="px-10 py-5 bg-[var(--wine)] border-2 border-[rgba(184,134,11,0.6)] text-[var(--parchment)] text-[.8rem] tracking-[.12em] uppercase flex items-center gap-2 hover:border-[var(--gold)] hover:bg-[rgba(74,14,14,0.7)] transition-all duration-300 animate-pulse-wine shadow-[0_0_20px_rgba(184,134,11,0.12)]"
            style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
          >
            ⚔️ Jogar Sozinho
          </a>
          <button
            className="px-10 py-5 bg-[rgba(45,27,13,0.8)] border-2 border-[rgba(184,134,11,0.3)] text-[var(--gold)] text-[.8rem] tracking-[.12em] uppercase flex items-center gap-2 hover:border-[var(--gold)] transition-all duration-300 cursor-pointer"
            style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
          >
            ⚡ Desafiar Alguém
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {["📸 Foto + Avatar IA", "🧠 Quiz Comportamental", "⚔️ Batalha Épica", "🃏 Card Digital", "📱 QR Code", "📊 Dashboard Live"].map((chip) => (
            <span key={chip} className="tag-pill">{chip}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
