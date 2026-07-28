"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/** Faz todas as animações motion respeitarem prefers-reduced-motion do usuário. */
export default function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
