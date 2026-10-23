"use client";

import Link from "next/link";
import { useMeuId } from "@/lib/jogador-local";
import PersonagemCard from "@/app/personagem/PersonagemCard";

export default function MinhaJornada() {
  const id = useMeuId();
  if (id === undefined) return <p role="status" className="text-center">Procurando seu herói…</p>;
  if (!id) return <div className="saved-journey-empty"><h2>Seu grimório ainda está vazio</h2><p>Descubra sua classe para guardar aqui seu personagem. O último herói salvo fica disponível neste navegador.</p><Link href="/jogar" className="btn-seal inline-flex px-6 py-3 mt-5">Criar meu personagem</Link></div>;
  return <><p className="saved-journey-note">Personagem recuperado neste navegador. O QR de batalha fica na frente. Vire a carta para ler sua história.</p><PersonagemCard key={id} playerId={id} /></>;
}
