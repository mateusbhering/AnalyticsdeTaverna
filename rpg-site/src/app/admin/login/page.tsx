import { GithubMark } from "@/components/ui/illustrated-icons";
import { IconText } from "@/components/ui/illustrated-icons";
import { signIn } from "@/auth";
import Link from "next/link";

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
            <div className="wax-seal !w-16 !h-16 mx-auto text-2xl mb-4">{<IconText text={"🔒"} />}</div>
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
              <GithubMark size={24} />
              Entrar com GitHub
            </button>
          </form>

          <p className="text-center text-[var(--ink-50)] text-xs mt-6">
            Acesso restrito ao administrador
          </p>
        </div>

        {/* Back link */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-[rgba(230,188,106,0.55)] hover:text-[var(--gold-light)] text-sm transition-colors"
            style={{ fontFamily: "var(--font-cinzel), serif" }}
          >
            ← Voltar ao site
          </Link>
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
