import { Gem } from "lucide-react";
import { ROTULO_RARIDADE, type Raridade } from "@/lib/ludico";

/** Selo de raridade. Texto + ícone: a cor nunca é a única pista. */
export default function SeloRaridade({ raridade, className = "" }: { raridade: Raridade; className?: string }) {
  return (
    <span className={`raridade-selo raridade-${raridade} ${className}`}>
      <Gem size={12} strokeWidth={1.8} aria-hidden="true" />
      {ROTULO_RARIDADE[raridade]}
    </span>
  );
}
