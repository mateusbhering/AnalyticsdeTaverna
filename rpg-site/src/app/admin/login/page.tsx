import { signIn } from "@/auth";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{
        background:
          "radial-gradient(55% 40% at 50% 30%, rgba(255,176,80,.13) 0%, transparent 70%), url('/textures/dark-wood.png'), linear-gradient(180deg, #241408 0%, #170d06 90%)",
      }}
    >
      <div className="relative w-full max-w-md">
        {/* Página do diário */}
        <div className="paper-card paper-frame arcane-corners p-10">
          <span className="ac-bl" /><span className="ac-br" />
          {/* Lacre */}
          <div className="text-center mb-10">
            <div className="wax-seal !w-16 !h-16 mx-auto text-2xl mb-4">🔒</div>
            <h1
              className="text-2xl text-[var(--ink)] mb-1"
              style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
            >
              Área Admin
            </h1>
            <p className="text-sm italic">Analytics de Taverna</p>
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
              className="press w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#241a12] hover:bg-[#31241a] border border-[rgba(201,151,63,0.4)] hover:border-[var(--gold)] text-[var(--parchment)] font-semibold text-base transition-all duration-200 cursor-pointer"
              style={{ fontFamily: "var(--font-cinzel), serif" }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              Entrar com GitHub
            </button>
          </form>

          <p className="text-center text-[var(--ink-50)] text-xs mt-6">
            Acesso restrito ao administrador
          </p>
        </div>

        {/* Back link */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-[rgba(230,188,106,0.55)] hover:text-[var(--gold-light)] text-sm transition-colors"
            style={{ fontFamily: "var(--font-cinzel), serif" }}
          >
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
    <div className="mb-6 px-4 py-3 bg-[rgba(140,35,24,0.1)] border border-[rgba(140,35,24,0.4)] text-[var(--seal)] text-sm text-center italic">
      {messages[params.error] ?? messages.Default}
    </div>
  );
}
