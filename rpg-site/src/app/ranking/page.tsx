import type { Metadata } from "next";
import RankingBoard from "@/components/RankingBoard";
import { getRanking } from "@/lib/ranking";

// Consulta dinâmica; a camada de dados mantém o cache e a invalidação após duelos.
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Ranking Global — Analytics de Taverna",
  description: "O quadro de feitos da taverna: os aventureiros que mais se destacaram em suas jornadas.",
};
export default async function RankingPage() {
  return <RankingBoard ranking={await getRanking()} />;
}
