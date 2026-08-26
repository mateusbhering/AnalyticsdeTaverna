"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, useAnimationControls, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/* ── Tremor ────────────────────────────────────────────────────────────
   Deslocamentos em pixel inteiro e sem easing suave: impacto é abrupto. Uma
   sequência interpolada daria "balanço", não "pancada". Amplitude decrescente
   porque a estrutura absorve a energia. */
const TREMOR = {
  x: [0, -7, 6, -4, 3, -1, 0],
  y: [0, 4, -3, 2, -1, 0, 0],
};
const TREMOR_MS = 380;
const FLASH_MS = 320;

export interface Impacto {
  /** Dispara tremor + clarão. Chame no instante em que os valores colidem. */
  bater: () => void;
}

/**
 * Envolve a arena e dá a ela reação física.
 *
 * O clarão é irmão do conteúdo e usa `position: fixed` para cobrir a tela
 * inteira — o embate ilumina a sala, não só o card. `mix-blend-mode: plus-lighter`
 * soma luz em vez de pintar por cima: o que já estava claro estoura, o que
 * estava escuro só clareia, que é como um flash se comporta.
 */
export default function ArenaImpacto({
  children,
  aoMontar,
  className = "",
}: {
  children: ReactNode;
  /** Recebe o controle de impacto assim que a arena existe. */
  aoMontar?: (impacto: Impacto) => void;
  className?: string;
}) {
  const semMovimento = useReducedMotion();
  const tremor = useAnimationControls();
  const [flash, setFlash] = useState(0);

  const bater = useCallback(() => {
    if (semMovimento) return;
    tremor.start({
      ...TREMOR,
      transition: { duration: TREMOR_MS / 1000, ease: "linear" },
    });
    setFlash((n) => n + 1);
  }, [tremor, semMovimento]);

  /* Entrega o controle uma vez, depois da montagem. Passar por callback e não
     por ref imperativa deixa o pai disparar o impacto de dentro de um efeito
     ou de um handler, sem precisar de `useImperativeHandle`. */
  useEffect(() => {
    aoMontar?.({ bater });
  }, [aoMontar, bater]);

  return (
    <>
      {/* Clarão em tela cheia. `key` remonta o elemento a cada impacto, então a
          animação reinicia mesmo em pancadas seguidas. */}
      {flash > 0 && (
        <motion.div
          key={flash}
          aria-hidden
          className="pointer-events-none fixed inset-0 z-50"
          style={{
            background:
              "radial-gradient(70% 55% at 50% 45%, rgba(255,232,190,.42) 0%, rgba(255,180,104,.2) 48%, transparent 80%)",
            mixBlendMode: "plus-lighter",
          }}
          initial={{ opacity: 0.42 }}
          animate={{ opacity: 0 }}
          transition={{ duration: FLASH_MS / 1000, ease: "easeOut" }}
        />
      )}

      <motion.div className={className} animate={tremor}>
        {children}
      </motion.div>
    </>
  );
}
