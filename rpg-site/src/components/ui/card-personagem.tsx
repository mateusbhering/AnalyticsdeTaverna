"use client";

import { useRef, useState } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "motion/react";
import type { ReactNode } from "react";

/* ── Luz de vela ───────────────────────────────────────────────────────
   Chama não pulsa em senoide: ela treme irregular. Dois ciclos de períodos
   primos entre si (3,1s e 4,7s) se sobrepõem, então o padrão só se repete a
   cada ~15s — tempo suficiente para o olho não perceber o loop.

   Amplitude curta de propósito. Uma sombra que pisca vira distração; o que se
   quer é a dúvida de ter visto algo mexer. */
/* Sem `as const`: ele torna os arrays readonly e o motion não aceita. */
const TREMOR_SOMBRA = {
  opacity: [0.62, 0.78, 0.55, 0.71, 0.6, 0.62],
  scaleX: [1, 1.035, 0.985, 1.02, 0.995, 1],
};

/* Quanto a lanterna atrasa em relação ao cursor. Damping alto: a luz acompanha
   sem oscilar — uma lanterna balançando enjoa. */
const MOLA_LUZ = { stiffness: 180, damping: 26, mass: 0.5 } as const;

export default function CardPersonagem({
  children,
  className = "",
  /** Raio da lanterna, em px. Menor = feixe mais concentrado. */
  raio = 260,
}: {
  children: ReactNode;
  className?: string;
  raio?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  /* Motion values e não estado: o gradiente segue o cursor sem disparar um
     único re-render do React. Com estado, cada pixel de movimento remontaria a
     árvore inteira do card. */
  const x = useMotionValue(-9999);
  const y = useMotionValue(-9999);
  const sx = useSpring(x, MOLA_LUZ);
  const sy = useSpring(y, MOLA_LUZ);

  /* `acesa` é estado porque muda raramente (entra/sai) e precisa alternar a
     opacidade das camadas. Começa `false` no servidor e no cliente — só um
     ponteiro de mouse real acende, o que exclui toque sem nenhuma media query
     e, portanto, sem risco de divergência na hidratação. */
  const [acesa, setAcesa] = useState(false);

  /* A PENUMBRA é o efeito, não o brilho.
     Uma lanterna lê pela escuridão em volta: sobre pergaminho, que já está a
     ~92% de luminância, `overlay` e `soft-light` quase não movem o pixel — a
     primeira versão disto era invisível. Aqui um `multiply` sépia tira luz
     conforme se afasta do cursor, e a diferença aparece.
     Tom quente (58,36,14) e não cinza: sombra de vela puxa para o âmbar.

     A opacidade máxima é 25% e não mais: o card tem TEXTO no canto que fica
     longe do cursor. Com 42% o clima ficava ótimo e "0 derrotas" ficava
     ilegível — em card informativo, a atmosfera não pode comer o conteúdo. */
  const penumbra = useMotionTemplate`radial-gradient(${raio}px circle at ${sx}px ${sy}px, rgba(255,255,255,0) 0%, rgba(120,84,40,.07) 48%, rgba(58,36,14,.25) 100%)`;

  /* A poça de luz, por cima da penumbra: dá a COR da chama sobre o que sobrou
     iluminado. Sozinha não bastaria; junto do multiply, é o que faz o papel
     parecer aquecido em vez de só menos escuro. */
  const chama = useMotionTemplate`radial-gradient(${raio * 0.72}px circle at ${sx}px ${sy}px, rgba(255,196,116,.5) 0%, rgba(255,166,74,.18) 40%, transparent 72%)`;

  return (
    <div className={`relative ${className}`}>
      {/* Sombra projetada, viva. Fica FORA do card e atrás dele: assim o tremor
          anima só opacity/scale (compostos na GPU) em vez de repintar um
          box-shadow a cada quadro. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-3 bottom-1 top-6 -z-10 rounded-[2px]"
        style={{
          background: "rgba(0,0,0,.72)",
          filter: "blur(22px)",
          transformOrigin: "50% 100%",
        }}
        animate={TREMOR_SOMBRA}
        transition={{
          opacity: { duration: 3.1, repeat: Infinity, ease: "easeInOut" },
          scaleX: { duration: 4.7, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      <div
        ref={ref}
        onPointerMove={(e) => {
          // Só ponteiro de mouse: dedo não carrega lanterna.
          if (e.pointerType !== "mouse") return;
          const r = e.currentTarget.getBoundingClientRect();
          x.set(e.clientX - r.left);
          y.set(e.clientY - r.top);
          if (!acesa) setAcesa(true);
        }}
        onPointerLeave={() => setAcesa(false)}
        className="paper-card paper-frame arcane-corners relative overflow-hidden"
      >
        <span className="ac-bl" />
        <span className="ac-br" />

        {/* Camada 1 — a penumbra que recua diante da luz.
            `multiply` sobre o papel: o que está longe do cursor perde luz e o
            grão de feTurbulence do .paper-card fica visível na sombra. */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[2]"
          style={{ backgroundImage: penumbra, mixBlendMode: "multiply" }}
          animate={{ opacity: acesa ? 1 : 0 }}
          transition={{ duration: acesa ? 0.25 : 0.55 }}
        />

        {/* Camada 2 — a poça de luz âmbar.
            `soft-light` mantém a tinta sépia legível: `screen` lavaria o texto
            e o card viraria um borrão claro sob o cursor. */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[3]"
          style={{ backgroundImage: chama, mixBlendMode: "soft-light" }}
          animate={{ opacity: acesa ? 1 : 0 }}
          transition={{ duration: acesa ? 0.25 : 0.55 }}
        />

        <div className="relative z-[4]">{children}</div>
      </div>
    </div>
  );
}
