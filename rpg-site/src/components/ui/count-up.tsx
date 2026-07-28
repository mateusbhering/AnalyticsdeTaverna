"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useMotionValueEvent, useSpring } from "motion/react";

/**
 * Número com count-up animado ao entrar na viewport.
 * Se `value` mudar depois (ex.: stats ao vivo), anima suavemente até o novo valor.
 */
export default function CountUp({
  value,
  decimals = 0,
  className,
}: {
  value: number;
  decimals?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const spring = useSpring(0, { stiffness: 55, damping: 18 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (inView) spring.set(value);
  }, [inView, value, spring]);

  useMotionValueEvent(spring, "change", (v) => setDisplay(v));

  return (
    <span ref={ref} className={className}>
      {display.toLocaleString("pt-BR", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
    </span>
  );
}
