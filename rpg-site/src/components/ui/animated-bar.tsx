"use client";

import { motion } from "motion/react";

/** Barra de progresso que cresce de 0 até `pct`% ao entrar na viewport. */
export default function AnimatedBar({
  pct,
  className = "",
  delay = 0,
}: {
  pct: number;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={`h-full ${className}`}
      initial={{ width: 0 }}
      whileInView={{ width: `${pct}%` }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] }}
    />
  );
}
