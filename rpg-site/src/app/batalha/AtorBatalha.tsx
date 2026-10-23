"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { CLASS_ARTWORK } from "@/lib/class-artwork";
import type { ClassInfo } from "@/lib/classes";
import styles from "./ConfrontoPersonagens.module.css";

export type Expressao = "pronto" | "ataque" | "dor" | "vitoria" | "derrota";

/** Usa a mesma arte dos cards, sem reconstruir ou redesenhar o personagem. */
export default function AtorBatalha({ classe, expressao, espelhado }: { classe: ClassInfo; expressao: Expressao; espelhado: boolean }) {
  const arte = CLASS_ARTWORK[classe.name];
  const src = arte ? `/classes/${arte}.png` : classe.photo;
  return <motion.div
    className={styles.arteOriginal}
    data-classe={classe.name}
    data-expressao={expressao}
    style={{ scaleX: espelhado ? -1 : 1 }}
    animate={{
      filter: expressao === "dor"
        ? "drop-shadow(0 0 18px #ff7969) brightness(1.35)"
        : expressao === "vitoria"
          ? "drop-shadow(0 0 22px #ffd985) brightness(1.08)"
          : expressao === "derrota"
            ? "drop-shadow(0 6px 8px #0007) brightness(.8)"
            : "drop-shadow(0 6px 8px #0007) brightness(1)",
    }}
    transition={{ duration: .15 }}
  >
    <Image
      src={src}
      alt={`${classe.name}: ${expressao}`}
      width={640}
      height={640}
      unoptimized
      loading="eager"
      draggable={false}
      className={styles.imagemOriginal}
    />
  </motion.div>;
}
