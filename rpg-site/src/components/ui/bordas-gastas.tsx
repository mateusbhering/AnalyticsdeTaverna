"use client";

import { useId } from "react";
import type { ReactNode } from "react";

/**
 * Desgasta as bordas de um elemento, fugindo do retângulo perfeito da web.
 *
 * `feTurbulence` gera ruído e `feDisplacementMap` usa esse ruído para empurrar
 * cada pixel da borda — o resultado é um recorte irregular, como papel rasgado
 * à mão. `baseFrequency` controla o TAMANHO das mordidas (baixo = ondulações
 * largas; alto = serrilhado) e `scale`, a profundidade delas.
 *
 * Duas coisas que o filtro exige e não perdoam:
 *
 * 1. `seed` precisa ser FIXO. Sem ele o navegador escolhe um, e servidor e
 *    cliente escolhem diferente — o recorte muda na hidratação.
 * 2. O filtro custa caro e é recalculado a cada repintura do elemento. Por isso
 *    ele fica numa camada de MOLDURA irmã do conteúdo, e não sobre ele: assim
 *    texto e imagens não passam pelo displacement (ficariam ilegíveis) e a
 *    borda desgastada não é repintada quando o conteúdo anima.
 */
export default function BordasGastas({
  children,
  className = "",
  /** Tamanho das mordidas. Menor = ondulação mais larga. */
  frequencia = 0.028,
  /** Profundidade do desgaste, em px. */
  profundidade = 7,
  cor = "var(--paper)",
}: {
  children: ReactNode;
  className?: string;
  frequencia?: number;
  profundidade?: number;
  cor?: string;
}) {
  // `useId` dá um id estável entre servidor e cliente — dois cards na mesma
  // página não podem compartilhar o mesmo filtro.
  const id = `gasto-${useId().replace(/:/g, "")}`;

  return (
    <div className={`relative ${className}`}>
      <svg aria-hidden className="absolute h-0 w-0" focusable="false">
        <defs>
          <filter id={id} x="-8%" y="-8%" width="116%" height="116%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={frequencia}
              numOctaves={4}
              seed={7}
              result="ruido"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="ruido"
              scale={profundidade}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* A folha desgastada: só o preenchimento passa pelo filtro. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{ background: cor, filter: `url(#${id})` }}
      />

      {children}
    </div>
  );
}
