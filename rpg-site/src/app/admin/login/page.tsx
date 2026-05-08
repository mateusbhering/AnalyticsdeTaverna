import { signIn } from "@/auth";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <div className="min-h-screen bg-[#050010] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(124,58,237,0.2)_0%,_transparent_70%)]" />
      <div className="absolute inset-0 bg-grid" />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="rounded-3xl bg-white/3 border border-purple-800/40 p-10 backdrop-blur-xl shadow-2xl shadow-purple-900/30">
          {/* Logo */}
          <div className="text-center mb-10">
            <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-red-700 to-red-900 items-center justify-center text-3xl mb-4 shadow-lg border border-red-600/40">
              🔒
            </div>
            <h1 className="text-2xl font-black text-white mb-1">Área Admin</h1>
            <p className="text-purple-400/70 text-sm">RPG Data Experience</p>
          </div>

          {/* Error message */}
          <ErrorBanner searchParams={searchParams} />

          {/* Login form */}
          <form
            action={async () => {
              "use server";
              await signIn("github", { redirectTo: "/admin" });
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-[#24292e] hover:bg-[#2f363d] border border-white/10 text-white font-semibold text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] group"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              Entrar com GitHub
            </button>
          </form>

          <p className="text-center text-purple-500/50 text-xs mt-6">
            Acesso restrito ao administrador
          </p>
        </div>

        {/* Back link */}
        <div className="text-center mt-6">
          <a href="/" className="text-purple-400/60 hover:text-purple-300 text-sm transition-colors">
            ← Voltar ao site
          </a>
        </div>
      </div>
    </div>
  );
}

async function ErrorBanner({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  if (!params.error) return null;

  const messages: Record<string, string> = {
    AccessDenied: "Acesso negado. Apenas @mateusbhering pode entrar.",
    Default: "Erro ao autenticar. Tente novamente.",
  };

  return (
    <div className="mb-6 px-4 py-3 rounded-xl bg-red-900/30 border border-red-700/50 text-red-300 text-sm text-center">
      {messages[params.error] ?? messages.Default}
    </div>
  );
}
