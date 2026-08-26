"use client";

import { motion, useReducedMotion } from "motion/react";
import { useId } from "react";

/* Tinta não aparece: ela ESCORRE. O texto entra de baixo, ainda borrado, e vai
   ganhando nitidez enquanto assenta — como quem escreve e a fibra do papel
   absorve. O `filter: blur` é o que separa isto de um fade comum. */
const POR_LETRA = 0.028;

export default function TintaViva({
  texto,
  className = "",
  style,
  atraso = 0,
  /** Palavra a palavra em textos longos: letra a letra viraria uma máquina de escrever. */
  porPalavra,
}: {
  texto: string;
  className?: string;
  style?: React.CSSProperties;
  atraso?: number;
  porPalavra?: boolean;
}) {
  const semMovimento = useReducedMotion();
  const id = useId();

  // Acima de ~40 caracteres, letra a letra fica lento e mecânico.
  const emPalavras = porPalavra ?? texto.length > 40;
  const pedacos = emPalavras ? texto.split(/(\s+)/) : Array.from(texto);

  if (semMovimento) {
    return (
      <span className={className} style={style}>
        {texto}
      </span>
    );
  }

  return (
    <span className={className} style={style} aria-label={texto}>
      {pedacos.map((p, i) => (
        <motion.span
          key={`${id}-${i}`}
          aria-hidden
          className="inline-block whitespace-pre"
          initial={{ opacity: 0, y: "0.28em", filter: "blur(5px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            duration: 0.5,
            delay: atraso + i * POR_LETRA,
            ease: [0.2, 0.7, 0.3, 1],
          }}
        >
          {p}
        </motion.span>
      ))}
    </span>
  );
}
