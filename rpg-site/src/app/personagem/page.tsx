import { Suspense } from "react";
import Image from "next/image";
import PersonagemCard from "./PersonagemCard";

export default function PersonagemPage() {
  return (
    <div
      className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-16"
      style={{
        background:
          "radial-gradient(60% 40% at 50% 0%, rgba(255,176,80,.13) 0%, transparent 70%), url('/textures/dark-wood.png'), linear-gradient(180deg, #2a180a 0%, #170d06 90%)",
      }}
    >
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
            className="btn-seal block w-full py-4 text-[.75rem] tracking-[.12em] uppercase"
            style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
          >
            ⚔️ Descobrir minha classe
          </a>
          <a
            href="/"
            className="block text-[rgba(230,188,106,0.55)] hover:text-[var(--gold-light)] text-[.7rem] tracking-[.15em] uppercase transition-colors"
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
    <div className="paper-card paper-frame arcane-corners p-8 animate-pulse">
      <span className="ac-bl" /><span className="ac-br" />
      <div className="flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-[rgba(96,66,26,0.15)]" />
        <div className="h-6 w-48 bg-[rgba(96,66,26,0.15)]" />
        <div className="h-4 w-64 bg-[rgba(96,66,26,0.1)]" />
      </div>
    </div>
  );
}
