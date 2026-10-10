"use client";

import { CANAIS_REDES, linkComOrigem, registrarCompartilhamento, urlDaRede } from "@/lib/compartilhar";
import type { CanalCompartilhar } from "@/lib/compartilhar";

interface Props {
  /** Link do card, sem UTM (a origem é somada por botão). */
  link: string;
  jogadorId: number | null;
  classe: string;
  className: string;
}

/**
 * Um botão por rede. É um link comum (abre em nova aba), não um `onClick` +
 * `window.open`: bloqueador de popup não pega e o toque longo/“abrir em nova
 * aba” continua funcionando. O compartilhamento é contado no clique.
 */
export default function CompartilharRedes({ link, jogadorId, classe, className }: Props) {
  const texto = `Sou ${classe} na Taverna! Descubra a sua classe:`;

  return (
    <div role="group" aria-label="Compartilhar nas redes" className="flex flex-wrap justify-center gap-2">
      {CANAIS_REDES.map(({ canal, rotulo }) => (
        <a
          key={canal}
          href={urlDaRede(canal as CanalCompartilhar, linkComOrigem(link, canal, jogadorId), texto)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => registrarCompartilhamento(canal, jogadorId)}
          className={className}
          style={{ fontFamily: "var(--font-cinzel), serif" }}
          aria-label={`Compartilhar no ${rotulo}`}
        >
          {rotulo}
        </a>
      ))}
    </div>
  );
}
