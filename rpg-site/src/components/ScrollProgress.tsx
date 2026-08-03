"use client";

import { motion, useScroll, useSpring } from "motion/react";

/** Barra de progresso de leitura fixa no topo, acompanhando o scroll da página. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.2,
  });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[3px] origin-left z-[60] bg-gradient-to-r from-[var(--gold)] via-[var(--copper)] to-[var(--seal)] shadow-[0_0_10px_rgba(230,188,106,0.5)]"
      aria-hidden
    />
  );
}
