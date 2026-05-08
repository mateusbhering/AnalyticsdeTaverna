export default function Footer() {
  return (
    <footer className="border-t border-purple-900/40 py-12 px-6 bg-[#030008]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-sm font-bold">
            ⚔
          </div>
          <span className="text-purple-300 font-semibold">RPG Data Experience</span>
        </div>
        <p className="text-purple-500/60 text-sm text-center">
          Projeto Experimental · Gamificação + IA Generativa
        </p>
        <div className="flex items-center gap-4">
          {["🧠 Psicologia", "🤖 IA", "🎮 RPG"].map((tag) => (
            <span key={tag} className="text-xs text-purple-500/50">{tag}</span>
          ))}
        </div>
      </div>
    </footer>
  );
}
