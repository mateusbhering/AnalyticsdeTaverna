"use client";

import Link from "next/link";
import { useMeuId } from "@/lib/jogador-local";

/**
 * "Voltar para o meu card" no rodapé do duelo.
 *
 * Vive na página e não no `DesafioScanner` de propósito: o scanner tem oito
 * ramos de `return` (revelação, escolha, resultado, auto-desafio, sem-personagem,
 * carregando, oponente, leitor) e o botão precisa existir em todos. Daqui, uma
 * inserção cobre as oito fases.
 *
 * O card do dono é `/personagem?id={meuId}` — a mesma rota do link público, que
 * reconhece o dono pelo id guardado no aparelho e revela as ações.
 */
export default function LinkMeuCard() {
  const meuId = useMeuId();

  // `undefined` = ainda não lemos o aparelho; `null` = não tem personagem.
  // Nos dois casos não há card para onde voltar.
  if (typeof meuId !== "string") return null;

  return (
    <Link
      href={`/personagem?id=${meuId}`}
      className="block text-[rgba(230,188,106,0.55)] hover:text-[var(--gold-light)] text-[.7rem] tracking-[.15em] uppercase transition-colors"
      style={{ fontFamily: "var(--font-cinzel), serif" }}
    >
      ← Voltar para o meu card
    </Link>
  );
}
