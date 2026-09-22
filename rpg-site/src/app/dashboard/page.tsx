import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import DashboardSection from "@/components/DashboardSection";
import TavernaInsightsSection from "@/components/TavernaInsightsSection";
import MotionProvider from "@/components/MotionProvider";
import { getPlayerStats } from "@/lib/stats";
import { getAnalyticsExtra } from "@/lib/analytics";

export const metadata: Metadata = {
  title: "Dashboard ao Vivo — Analytics de Taverna",
  description:
    "Os números da taverna: quantos heróis já foram forjados, quais classes mais aparecem e a média de cada atributo arcano.",
};

export default async function DashboardPage() {
  // Agregado no servidor: o navegador recebe os números prontos, não a tabela.
  // O cache cai sozinho quando alguém termina o quiz (lib/stats-actions.ts).
  const stats = await getPlayerStats();

  // Métricas que já existiam no backend (`/analytics/*`) mas nenhuma tela
  // consumia: taxa de empate, atributos mais escolhidos em duelo, taxa de
  // vitória por classe e o insight sobre as 10 dimensões.
  const analyticsExtra = await getAnalyticsExtra();

  return (
    // MotionProvider também aqui: fora da landing, nada faria as animações do
    // Reveal/Stagger respeitarem o prefers-reduced-motion do sistema.
    <MotionProvider>
      <div className="bg-black-linen min-h-screen flex flex-col">
        <div className="pt-14 flex justify-center">
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

        <DashboardSection stats={stats} />
        <TavernaInsightsSection dados={analyticsExtra} />

        <div className="text-center pb-20 mt-auto">
          <Link
            href="/"
            className="text-[rgba(230,188,106,0.5)] hover:text-[var(--gold-light)] text-sm transition-colors"
            style={{ fontFamily: "var(--font-cinzel), serif" }}
          >
            ← Voltar ao início
          </Link>
        </div>
      </div>
    </MotionProvider>
  );
}
