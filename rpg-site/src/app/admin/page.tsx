import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-[#050010] px-6 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(124,58,237,0.15)_0%,_transparent_70%)]" />
      <div className="absolute inset-0 bg-grid" />

      <div className="relative max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            {session.user?.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt="avatar"
                className="w-12 h-12 rounded-full border-2 border-red-600/60"
              />
            )}
            <div>
              <h1 className="text-2xl font-black text-white">
                Painel Admin 🔒
              </h1>
              <p className="text-purple-400/70 text-sm">
                Bem-vindo, <span className="text-red-400 font-semibold">@mateusbhering</span>
              </p>
            </div>
          </div>

          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-red-900/40 border border-red-700/50 text-red-300 text-sm font-semibold hover:bg-red-800/50 transition-all"
            >
              Sair
            </button>
          </form>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { label: "Participantes", value: "1.247", icon: "👥", color: "border-purple-600/40" },
            { label: "Batalhas Hoje", value: "342", icon: "⚔️", color: "border-amber-600/40" },
            { label: "Cards Gerados", value: "891", icon: "🃏", color: "border-cyan-600/40" },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl bg-white/3 border ${s.color} p-6 backdrop-blur-sm`}>
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-4xl font-black text-white mb-1">{s.value}</div>
              <div className="text-purple-400/70 text-sm">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Placeholder content */}
        <div className="rounded-2xl bg-white/3 border border-purple-800/30 p-8 backdrop-blur-sm">
          <h2 className="text-white font-bold text-lg mb-4">Área de Gerenciamento</h2>
          <p className="text-purple-400/60 text-sm">
            Aqui você pode gerenciar participantes, visualizar dados de batalha e exportar relatórios.
          </p>
        </div>
      </div>
    </div>
  );
}
