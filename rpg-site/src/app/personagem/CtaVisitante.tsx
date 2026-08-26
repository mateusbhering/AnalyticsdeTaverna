"use client";

import { useSearchParams } from "next/navigation";
import { useMeuId } from "@/lib/jogador-local";

/**
 * O CTA do rodapé, escondido para quem já é dono do card na tela — ele tem
 * "Jogar Novamente" nas ações do card e veria dois botões para /jogar.
 */
export default function CtaVisitante() {
  const params = useSearchParams();
  const meuId = useMeuId();

  if (typeof meuId === "string" && params.get("id") === meuId) return null;

  return (
    <a
      href="/jogar"
      className="btn-seal block w-full py-4 text-[.75rem] tracking-[.12em] uppercase"
      style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
    >
      ⚔️ Descobrir minha classe
    </a>
  );
}
