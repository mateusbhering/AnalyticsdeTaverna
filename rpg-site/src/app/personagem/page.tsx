import { Suspense } from "react";
import Image from "next/image";
import PersonagemCard from "./PersonagemCard";

export default function PersonagemPage() {
  return (
    <div className="min-h-screen bg-[#050010] relative overflow-hidden flex items-center justify-center px-4 py-16">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(124,58,237,0.2)_0%,_transparent_70%)]" />
      <div className="absolute inset-0 bg-grid" />

      <div className="relative w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <a href="/">
            <Image
              src="/logo.png"
              alt="Analytics de Taverna"
              width={72}
              height={72}
              className="drop-shadow-[0_0_20px_rgba(124,58,237,0.6)]"
            />
          </a>
        </div>

        <Suspense fallback={<CardSkeleton />}>
          <PersonagemCard />
        </Suspense>

        <div className="text-center mt-8 space-y-3">
          <a
            href="/jogar"
            className="block w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-lg hover:from-purple-500 hover:to-indigo-500 transition-all"
          >
            ⚔️ Descobrir minha classe
          </a>
          <a href="/" className="block text-purple-400/50 hover:text-purple-300 text-sm transition-colors">
            ← Voltar ao início
          </a>
        </div>
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-3xl bg-white/3 border border-purple-800/30 p-8 animate-pulse">
      <div className="flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-2xl bg-white/10" />
        <div className="h-8 w-48 rounded-lg bg-white/10" />
        <div className="h-4 w-64 rounded bg-white/10" />
      </div>
    </div>
  );
}
