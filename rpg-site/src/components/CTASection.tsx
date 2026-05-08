export default function CTASection() {
  return (
    <section id="jornada" className="py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(124,58,237,0.3)_0%,_rgba(5,0,16,0)_70%)]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-600/40 to-transparent" />
      <div className="absolute top-1/2 left-10 -translate-y-1/2 text-8xl opacity-10 animate-float select-none">⚔️</div>
      <div className="absolute top-1/2 right-10 -translate-y-1/2 text-8xl opacity-10 animate-float select-none" style={{ animationDelay: "2s" }}>🔮</div>

      <div className="max-w-4xl mx-auto relative text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-900/30 border border-amber-700/50 text-amber-300 text-sm mb-8 backdrop-blur-sm">
          <span className="text-lg">🏆</span>
          Projeto Experimental · IC SITE
        </div>

        <h2 className="text-6xl md:text-7xl font-black text-white mb-6 leading-tight">
          Sua Aventura
          <br />
          <span className="animate-shimmer">Começa Aqui</span>
        </h2>

        <p className="text-xl text-purple-200/70 mb-12 max-w-2xl mx-auto leading-relaxed">
          Descubra qual é sua classe de RPG com base no seu perfil. Uma experiência de
          <strong className="text-amber-400"> gamificação real</strong> que usa
          <strong className="text-cyan-400"> IA generativa</strong> para criar seu personagem único.
        </p>

        <div className="flex flex-wrap gap-4 justify-center mb-16">
          <button className="px-10 py-5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xl hover:from-purple-500 hover:to-indigo-500 transition-all duration-300 animate-pulse-glow transform hover:scale-105 cursor-pointer">
            ⚔️ Jogar Sozinho
          </button>
          <button className="px-10 py-5 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-xl hover:from-amber-500 hover:to-orange-500 transition-all duration-300 glow-gold transform hover:scale-105 cursor-pointer">
            ⚡ Desafiar Alguém
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {["📸 Foto + Avatar IA", "🧠 Quiz Comportamental", "⚔️ Batalha Épica", "🃏 Card Digital", "📱 QR Code", "📊 Dashboard Live"].map((chip) => (
            <span key={chip} className="px-4 py-2 rounded-full bg-white/5 border border-purple-800/40 text-purple-300 text-sm backdrop-blur-sm">
              {chip}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
