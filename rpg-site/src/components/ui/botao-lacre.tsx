"use client";

import { useCallback, useRef, useState } from "react";
import { motion, useReducedMotion, type HTMLMotionProps, type Variants } from "motion/react";
import type { ReactNode } from "react";

/* ── Física da prensa ──────────────────────────────────────────────────
   Cera quente não quica ao ser prensada: ela cede rápido e para. Mas o
   carimbo, ao ser solto, salta um pouco antes de assentar — é a mão que
   levanta, não o material. Daí duas transições diferentes: a descida é curta e
   amortecida, a subida é uma mola com damping baixo, que dá o solavanco. */
const DESCIDA = { type: "spring", stiffness: 900, damping: 34, mass: 0.6 } as const;
const SUBIDA = { type: "spring", stiffness: 420, damping: 11, mass: 0.9 } as const;

const variantes: Variants = {
  repouso: {
    scale: 1,
    y: 0,
    boxShadow:
      "inset 0 1px 0 rgba(255,190,140,.32), 0 6px 18px rgba(0,0,0,.5), 0 1px 0 rgba(230,188,106,.25)",
    transition: SUBIDA,
  },
  prensado: {
    scale: 0.963,
    y: 3,
    /* A sombra projetada quase some — o objeto encostou na mesa — e a sombra
       interna cresce, como cera comprimida sob o carimbo. */
    boxShadow:
      "inset 0 3px 8px rgba(56,8,0,.6), inset 0 -1px 0 rgba(255,190,140,.18), 0 1px 2px rgba(0,0,0,.6)",
    transition: DESCIDA,
  },
};

/* ── Faíscas ───────────────────────────────────────────────────────────
   Poeira de cera e brasa saltando de sob a borda no instante do impacto. Saem
   em leque para baixo (de -20° a 200°), porque é por baixo que o material
   escapa quando algo é prensado. */
const QTD_FAISCAS = 14;
const VIDA_FAISCA_MS = 620;

interface Faisca {
  id: number;
  x: number;
  y: number;
  tamanho: number;
  atraso: number;
  brasa: boolean;
}

function sortearFaiscas(id: number): Faisca[] {
  return Array.from({ length: QTD_FAISCAS }, (_, i) => {
    const angulo = (-20 + Math.random() * 220) * (Math.PI / 180);
    const distancia = 26 + Math.random() * 46;
    return {
      id: id * 100 + i,
      x: Math.cos(angulo) * distancia,
      // Metade da distância na vertical: o leque é achatado, não circular.
      y: Math.sin(angulo) * distancia * 0.55,
      tamanho: 2 + Math.random() * 3.5,
      atraso: Math.random() * 0.06,
      brasa: Math.random() > 0.65,
    };
  });
}

/* `HTMLMotionProps` e não `ComponentPropsWithoutRef<"button">`: os handlers de
   drag do React e os do motion têm assinaturas diferentes e colidem no tipo. */
type Props = {
  children: ReactNode;
  /** Ocupa a largura toda — é como o botão aparece na maioria das telas. */
  bloco?: boolean;
} & Omit<HTMLMotionProps<"button">, "children">;

/**
 * Botão primário: o lacre de cera do Diário Mágico.
 *
 * Herda a pintura do `.btn-seal` (globals.css) e acrescenta a materialidade: a
 * prensa afunda o carimbo, a sombra projetada colapsa e uma chuva de brasa
 * escapa por baixo da borda.
 *
 * As faíscas nascem só na interação, então nunca existem no HTML do servidor —
 * é por isso que o `Math.random()` aqui não cria divergência de hidratação.
 */
export default function BotaoLacre({
  children,
  bloco = true,
  className = "",
  disabled,
  onPointerDown,
  onKeyDown,
  ...resto
}: Props) {
  const semMovimento = useReducedMotion();
  const [bursts, setBursts] = useState<{ id: number; faiscas: Faisca[] }[]>([]);
  const proximo = useRef(0);

  const soltarFaiscas = useCallback(() => {
    if (semMovimento || disabled) return;
    const id = ++proximo.current;
    setBursts((atuais) => [...atuais, { id, faiscas: sortearFaiscas(id) }]);
    // Limpeza por tempo: o burst inteiro morre junto, sem depender de o
    // onAnimationComplete de 14 elementos disparar.
    window.setTimeout(
      () => setBursts((atuais) => atuais.filter((b) => b.id !== id)),
      VIDA_FAISCA_MS + 120,
    );
  }, [semMovimento, disabled]);

  return (
    <motion.button
      {...resto}
      disabled={disabled}
      variants={variantes}
      initial="repouso"
      animate="repouso"
      whileTap={disabled ? undefined : "prensado"}
      onPointerDown={(e) => {
        soltarFaiscas();
        onPointerDown?.(e);
      }}
      onKeyDown={(e) => {
        // O teclado ativa o botão mas não dispara whileTap: as faíscas
        // precisam vir daqui para quem não usa ponteiro.
        if (e.key === "Enter" || e.key === " ") soltarFaiscas();
        onKeyDown?.(e);
      }}
      className={`btn-seal relative ${bloco ? "block w-full" : "inline-block"} cursor-pointer
        disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      style={{ fontFamily: "var(--font-cinzel-decorative), serif", ...resto.style }}
    >
      {/* Brilho que atravessa o lacre no momento da prensa: a cera reflete a
          vela quando é comprimida. `pointer-events-none` para não roubar o
          clique do próprio botão. */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
        variants={{
          repouso: { opacity: 0 },
          prensado: { opacity: 1, transition: { duration: 0.12 } },
        }}
      >
        <span
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 120% at 50% -10%, rgba(255,214,150,.34) 0%, transparent 62%)",
          }}
        />
      </motion.span>

      <span className="relative z-10">{children}</span>

      {/* Brasa escapando por baixo da borda */}
      <span aria-hidden className="pointer-events-none absolute inset-0 overflow-visible">
        {bursts.map((burst) =>
          burst.faiscas.map((f) => (
            <motion.span
              key={f.id}
              className="absolute left-1/2 top-1/2 rounded-full"
              style={{
                width: f.tamanho,
                height: f.tamanho,
                background: f.brasa ? "var(--gold-light)" : "rgba(255,224,178,.85)",
                boxShadow: f.brasa
                  ? "0 0 6px 1px rgba(230,188,106,.75)"
                  : "0 0 4px rgba(255,200,140,.5)",
              }}
              initial={{ x: 0, y: 0, opacity: 0.95, scale: 1 }}
              animate={{
                x: f.x,
                // O segundo ponto puxa para baixo: a brasa perde força e cai.
                y: [f.y * 0.7, f.y + 14],
                opacity: [0.95, 0],
                scale: [1, 0.3],
              }}
              transition={{
                duration: VIDA_FAISCA_MS / 1000,
                delay: f.atraso,
                ease: [0.16, 0.8, 0.3, 1],
              }}
            />
          )),
        )}
      </span>
    </motion.button>
  );
}
