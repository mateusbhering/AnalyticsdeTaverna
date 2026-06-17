import { Suspense } from "react";
import Image from "next/image";
import PersonagemCard from "./PersonagemCard";

export default function PersonagemPage() {
  return (
    <div
      className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-16"
      style={{ background: "var(--charcoal)" }}
    >
      <div className="bg-grid absolute inset-0 pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at top, rgba(74,14,14,0.18) 0%, transparent 65%)",
        }}
      />

      <div className="relative w-full max-w-sm">
        <div className="flex justify-center mb-10">
          <a href="/">
            <Image
              src="/logo.png"
              alt="Analytics de Taverna"
              width={72}
              height={72}
              className="ritual-glow"
            />
          </a>
        </div>

        <Suspense fallback={<CardSkeleton />}>
          <PersonagemCard />
        </Suspense>

        <div className="text-center mt-8 space-y-4">
          <a
            href="/jogar"
            className="block w-full py-4 border border-[rgba(184,134,11,0.5)] bg-[var(--wine)] text-[var(--parchment)] text-[.75rem] tracking-[.12em] uppercase hover:border-[var(--gold)] transition-all"
            style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
          >
            ⚔️ Descobrir minha classe
          </a>
          <a
            href="/"
            className="block text-[rgba(184,134,11,0.45)] hover:text-[rgba(184,134,11,0.8)] text-[.7rem] tracking-[.15em] uppercase transition-colors"
            style={{ fontFamily: "var(--font-cinzel), serif" }}
          >
            ← Voltar ao início
          </a>
        </div>
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div
      className="arcane-corners border-2 border-[rgba(184,134,11,0.2)] p-8 animate-pulse"
      style={{ background: "rgba(30,10,4,0.95)" }}
    >
      <span className="ac-bl" /><span className="ac-br" />
      <div className="flex flex-col items-center gap-4">
        <div className="w-20 h-20 bg-[rgba(184,134,11,0.08)]" />
        <div className="h-6 w-48 bg-[rgba(184,134,11,0.08)]" />
        <div className="h-4 w-64 bg-[rgba(184,134,11,0.05)]" />
      </div>
    </div>
  );
}
