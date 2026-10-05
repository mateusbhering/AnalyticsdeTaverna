"use client";

import { Compass } from "lucide-react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";

/** Barra de progresso de leitura fixa no topo, acompanhando o scroll da página. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.2,
  });
  const markerX = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-4" aria-hidden="true">
      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[rgba(201,151,63,0.25)]" />
      <motion.div
        style={{ scaleX }}
        className="absolute inset-x-0 top-1/2 h-[2px] origin-left -translate-y-1/2 bg-gradient-to-r from-[var(--gold)] via-[var(--copper)] to-[var(--seal)] shadow-[0_0_10px_rgba(230,188,106,0.5)]"
      />
      <motion.div
        style={{ left: markerX, x: "-50%" }}
        className="absolute top-0 flex h-4 w-4 items-center justify-center rounded-full border border-[var(--gold-light)] bg-[var(--desk)] text-[var(--gold-light)] shadow-[0_0_12px_rgba(230,188,106,0.55)]"
      >
        <Compass size={10} strokeWidth={1.8} />
      </motion.div>
    </div>
  );
}
