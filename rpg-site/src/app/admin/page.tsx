import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";

const links = [
  {
    title: "Google Drive do Projeto",
    description: "Arquivos, documentos e recursos do projeto",
    icon: "📁",
    color: "border-amber-600/40",
    bg: "bg-amber-500/10",
    href: "https://drive.google.com/drive/folders/1hVIqEiTIHc-hS5ySMF-wN5AlDW-ew7Ht",
  },
];

export default async function AdminPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-[#050010] px-6 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(124,58,237,0.15)_0%,_transparent_70%)]" />
      <div className="absolute inset-0 bg-grid" />

      <div className="relative max-w-3xl mx-auto">
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
              <h1 className="text-2xl font-black text-white">Painel Admin 🔒</h1>
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

        {/* Links */}
        <div className="space-y-4">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-5 rounded-2xl ${link.bg} border ${link.color} p-6 backdrop-blur-sm hover:brightness-125 transition-all duration-200 group`}
            >
              <div className="text-4xl">{link.icon}</div>
              <div className="flex-1">
                <div className="text-white font-bold text-lg">{link.title}</div>
                <div className="text-purple-400/70 text-sm">{link.description}</div>
              </div>
              <svg
                className="w-5 h-5 text-purple-400/50 group-hover:text-white transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
