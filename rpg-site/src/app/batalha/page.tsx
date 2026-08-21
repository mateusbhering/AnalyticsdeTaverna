import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import DesafioScanner from "./DesafioScanner";

export const metadata: Metadata = {
  title: "Desafiar Alguém — Analytics de Taverna",
  description:
    "Aponte a câmera para o QR code do card de outro aventureiro e lance o seu desafio.",
};

export default function BatalhaPage() {
  return (
    <div
      className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-14"
      style={{
        background:
          "radial-gradient(60% 40% at 50% 0%, rgba(255,176,80,.13) 0%, transparent 70%), url('/textures/dark-wood.png'), linear-gradient(180deg, #2a180a 0%, #170d06 90%)",
      }}
    >
      <div className="relative w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Analytics de Taverna"
              width={72}
              height={72}
              className="ritual-glow"
            />
          </Link>
        </div>

        <h1
          className="text-3xl text-center text-[var(--parchment)] mb-8"
          style={{
            fontFamily: "var(--font-cinzel-decorative), serif",
            textShadow: "0 0 30px rgba(255,176,80,0.2)",
          }}
        >
          Desafiar <span className="gold-grad">Alguém</span>
        </h1>

        <Suspense fallback={<PainelSkeleton />}>
          <DesafioScanner />
        </Suspense>

        <div className="text-center mt-8">
          <Link
            href="/"
            className="text-[rgba(230,188,106,0.5)] hover:text-[var(--gold-light)] text-sm transition-colors"
            style={{ fontFamily: "var(--font-cinzel), serif" }}
          >
            ← Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}

function PainelSkeleton() {
  return (
    <div className="paper-card paper-frame arcane-corners p-8 animate-pulse">
      <span className="ac-bl" />
      <span className="ac-br" />
      <div className="flex flex-col items-center gap-4">
        <div className="h-4 w-40 bg-[rgba(96,66,26,0.15)]" />
        <div className="w-full aspect-square bg-[rgba(96,66,26,0.12)]" />
        <div className="h-9 w-40 bg-[rgba(96,66,26,0.15)]" />
      </div>
    </div>
  );
}
