import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import AdminCalendar from "@/components/AdminCalendar";

const links = [
  {
    title: "Google Drive do Projeto",
    description: "Arquivos, documentos e recursos do projeto",
    icon: "📁",
    href: "https://drive.google.com/drive/folders/1hVIqEiTIHc-hS5ySMF-wN5AlDW-ew7Ht",
  },
];

export default async function AdminPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  return (
    <div
      className="min-h-screen px-6 py-12 relative overflow-hidden"
      style={{
        background:
          "radial-gradient(60% 40% at 50% 0%, rgba(255,176,80,.12) 0%, transparent 70%), url('/textures/dark-wood.png'), linear-gradient(180deg, #241408 0%, #170d06 90%)",
      }}
    >
      <div className="relative max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            {session.user?.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt="avatar"
                className="w-12 h-12 rounded-full border-2 border-[rgba(201,151,63,0.6)]"
              />
            )}
            <div>
              <h1
                className="text-2xl text-[var(--parchment)]"
                style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
              >
                Painel Admin 🔒
              </h1>
              <p className="text-[rgba(240,226,189,0.6)] text-sm italic">
                Bem-vindo, <span className="text-[var(--gold-light)] font-semibold not-italic">@{(session.user as { login?: string })?.login ?? session.user?.name}</span>
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
              className="press btn-seal px-5 py-2 text-[.7rem] tracking-[.15em] uppercase cursor-pointer"
              style={{ fontFamily: "var(--font-cinzel), serif", borderWidth: "1px" }}
            >
              Sair
            </button>
          </form>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Links */}
          <div className="space-y-4">
            <h2 className="section-eyebrow">Links do Projeto</h2>
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="paper-card paper-frame card-hover flex items-center gap-5 p-6 transition-all duration-200 group"
              >
                <div className="text-4xl">{link.icon}</div>
                <div className="flex-1">
                  <div
                    className="text-[var(--ink)] font-bold text-lg"
                    style={{ fontFamily: "var(--font-cinzel), serif" }}
                  >
                    {link.title}
                  </div>
                  <div className="text-sm">{link.description}</div>
                </div>
                <svg
                  className="w-5 h-5 text-[var(--foil)] group-hover:text-[var(--seal)] transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ))}
          </div>

          {/* Calendar */}
          <div>
            <h2 className="section-eyebrow">Calendário</h2>
            <AdminCalendar />
          </div>
        </div>
      </div>
    </div>
  );
}
