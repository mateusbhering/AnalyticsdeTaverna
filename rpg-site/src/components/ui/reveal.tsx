"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Fade + slide-up quando entra na viewport (uma vez). */
export function Reveal({
  children,
  delay = 0,
  y = 40,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15, margin: "0px 0px -30px 0px" }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

const groupVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.08 } },
};

/** Contêiner que revela os StaggerItem filhos em sequência. */
export function Stagger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={groupVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1, margin: "0px 0px -20px 0px" }}
    >
      {children}
    </motion.div>
  );
}

/** Item do Stagger. `rotate` inicial dá o efeito "carta de baralho". */
export function StaggerItem({
  children,
  className,
  y = 36,
  rotate = 0,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
  rotate?: number;
}) {
  const itemVariants: Variants = {
    hidden: { opacity: 0, y, rotate },
    show: {
      opacity: 1,
      y: 0,
      rotate: 0,
      transition: { duration: 0.6, ease: EASE },
    },
  };
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}
