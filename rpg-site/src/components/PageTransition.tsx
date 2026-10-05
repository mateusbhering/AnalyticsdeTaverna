"use client";

import { motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();

  return (
    <div className="journey-scene" data-rpg-theme={pathname.startsWith("/admin") ? undefined : "illustrated"}>
      <motion.div
        key={pathname ?? "inicio"}
        initial={{ opacity: 0, y: reducedMotion ? 0 : 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reducedMotion ? 0.1 : 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
      {!reducedMotion && <div key={`portal-${pathname}`} className="journey-portal" aria-hidden="true" />}
    </div>
  );
}
