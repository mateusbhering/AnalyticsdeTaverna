"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/* ── Física da queda ───────────────────────────────────────────────────
   `mass` é o que faz o objeto parecer pesado — mais que stiffness ou damping.
   Massa alta acelera devagar e resiste a parar, então o pergaminho desce com
   inércia e passa do ponto ao chegar. Damping 11 deixa esse excesso virar um
   solavanco só, não uma gangorra. */
const QUEDA = { type: "spring", stiffness: 240, damping: 11, mass: 1.7 } as const;

/* O impacto é o detalhe que vende o peso: o material se achata contra a mesa e
   volta. Roda em `times` desiguais — esmaga rápido, recupera devagar — e começa
   no instante em que a mola chega ao fim do curso. */
const BATIDA_MS = 340;

export default function QuedaPesada({
  children,
  /** De quanto acima ele cai. Mais alto = mais tempo de inércia visível. */
  altura = 140,
  atraso = 0,
  className = "",
}: {
  children: ReactNode;
  altura?: number;
  atraso?: number;
  className?: string;
}) {
  const semMovimento = useReducedMotion();

  if (semMovimento) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ y: -altura, opacity: 0, rotate: -1.2 }}
      animate={{ y: 0, opacity: 1, rotate: 0 }}
      transition={{ ...QUEDA, opacity: { duration: 0.18, delay: atraso }, delay: atraso }}
      style={{ transformOrigin: "50% 100%" }}
    >
      {/* Achatamento no impacto, num filho para não brigar com o `y` da mola.
          `scaleY` sozinho esticaria o conteúdo; o `scaleX` compensa, como um
          material que se espalha ao ser comprimido. */}
      <motion.div
        initial={{ scaleY: 1, scaleX: 1 }}
        animate={{ scaleY: [1, 0.94, 1.02, 1], scaleX: [1, 1.03, 0.99, 1] }}
        transition={{
          duration: BATIDA_MS / 1000,
          times: [0, 0.25, 0.6, 1],
          delay: atraso + BATIDA_MS / 1000,
          ease: "easeOut",
        }}
        style={{ transformOrigin: "50% 100%" }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
