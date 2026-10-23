"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { CLASS_ARTWORK } from "@/lib/class-artwork";
import type { ClassInfo } from "@/lib/classes";
import type { Rodada } from "@/lib/batalha-api";
import styles from "./ConfrontoPersonagens.module.css";

type Lado = "a" | "b";
interface Props {
  classes: [ClassInfo, ClassInfo];
  nomes: [string, string];
  rodada: Rodada | null;
  indice: number;
  impacto: boolean;
  pronto: boolean;
  finalizado: boolean;
  vencedor: Lado | "empate";
}

function estiloGolpe(classe: ClassInfo) {
  if (/Mago|Warlock|Necromante|Ilusionista|Vidente/.test(classe.name))
    return { cor: "#c4a0ff", nome: "Rajada arcana", simbolo: "✦" };
  if (/Druida|Domador|Invocador|Xamã/.test(classe.name))
    return { cor: "#a7efad", nome: "Invocação selvagem", simbolo: "❋" };
  if (/Bardo/.test(classe.name))
    return { cor: "#ffcc74", nome: "Acorde estrondoso", simbolo: "♫" };
  return { cor: "#ffb772", nome: "Investida heroica", simbolo: "⚔" };
}

/** Encena somente o resultado confirmado pela API; não resolve nem grava duelos. */
export default function ConfrontoPersonagens({ classes, nomes, rodada, indice, impacto, pronto, finalizado, vencedor }: Props) {
  const atacante = rodada?.vencedor;
  const magia = estiloGolpe(classes[atacante === "b" ? 1 : 0]);
  const texto = finalizado
    ? vencedor === "empate" ? "Empate! Os dois permanecem de pé." : `${nomes[vencedor === "a" ? 0 : 1]} venceu o confronto!`
    : rodada
      ? rodada.vencedor === "empate" ? `${rodada.rotulo}: forças iguais! As defesas se cruzam.`
        : `${nomes[atacante === "a" ? 0 : 1]} usa ${magia.nome.toLowerCase()}!`
      : "Os aventureiros entram na arena…";

  return <section className={styles.arena} aria-label="Confronto entre os personagens">
    <div className={styles.cabecalho}>
      <span>{finalizado ? "O GRANDE DESFECHO" : rodada ? `RODADA ${indice + 1} · ${rodada.rotulo}` : "QUE COMECE O DUELO"}</span>
      <strong>{rodada && !finalizado ? `${rodada.valor_a} × ${rodada.valor_b}` : finalizado ? "O destino está selado" : "Você × Oponente"}</strong>
    </div>
    <div className={styles.palco}>
      <div className={styles.circulo} aria-hidden="true" />
      {classes.map((classe, i) => {
        const lado: Lado = i === 0 ? "a" : "b";
        const direcao = i === 0 ? 1 : -1;
        const ataca = !finalizado && atacante === lado;
        const recebe = !finalizado && impacto && atacante !== lado && atacante !== "empate";
        const ganhou = finalizado && vencedor === lado;
        const perdeu = finalizado && vencedor !== lado && vencedor !== "empate";
        return <div key={lado} className={`${styles.lutador} ${i === 1 ? styles.rival : ""}`}>
          <motion.div initial={{ opacity: 0, x: -direcao * 65 }} animate={{ opacity: pronto ? 1 : 0, x: pronto ? 0 : -direcao * 65 }}>
            <motion.div key={`${indice}-${finalizado}`} className={styles.corpo}
              initial={{ x: 0, y: 0, rotate: 0 }}
              animate={perdeu ? { x: -direcao * 12, y: 25, rotate: -direcao * 65, opacity: 0.55 }
                : ganhou ? { y: [0, -24, 0, -12, 0], scale: 1.08 }
                : ataca ? { x: [0, -direcao * 14, direcao * 58, direcao * 58, 0], y: [0, -10, -22, -8, 0], rotate: [0, -direcao * 12, direcao * 14, 0, 0] }
                : { x: 0, y: [0, -4, 0] }}
              transition={{ duration: ataca ? 1.65 : ganhou ? 1.4 : perdeu ? 0.65 : 2, times: ataca ? [0, 0.2, 0.4, 0.55, 1] : undefined, repeat: !ataca && !finalizado ? Infinity : 0 }}>
              <motion.div animate={recebe ? { x: [0, -direcao * 24, direcao * 8, -direcao * 10, 0], rotate: [0, -direcao * 18, 8, 0], filter: ["brightness(1)", "brightness(2) sepia(1) saturate(4)", "brightness(1)"] } : { x: 0, rotate: 0, filter: "brightness(1)" }} transition={{ duration: 0.5 }}>
                <Image className={styles.personagem} src={`/classes/${CLASS_ARTWORK[classe.name] ?? "mago"}.png`} alt={classe.name} width={384} height={384} unoptimized loading="eager" />
              </motion.div>
            </motion.div>
          </motion.div>
          <div className={styles.identidade}><strong>{nomes[i]}</strong><span>{classe.name}</span>
            {finalizado && <b>{vencedor === "empate" ? "HONRA PRESERVADA" : ganhou ? "VENCEDOR" : "DERROTADO"}</b>}
          </div>
          <AnimatePresence>{recebe && <motion.b className={styles.dano} initial={{ opacity: 0, y: 0, scale: 0.5 }} animate={{ opacity: [0, 1, 1, 0], y: -60, scale: 1.3 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>−{rodada?.diferenca}</motion.b>}</AnimatePresence>
        </div>;
      })}
      <AnimatePresence>
        {rodada && !finalizado && atacante !== "empate" && <motion.div key={indice} aria-hidden="true" className={styles.projetil} style={{ color: magia.cor, left: atacante === "a" ? "28%" : "72%" }} initial={{ opacity: 0, x: 0, scale: 0.3 }} animate={{ left: atacante === "a" ? ["28%", "28%", "70%"] : ["72%", "72%", "30%"], opacity: [0, 1, 0], scale: [0.3, 1.4, 0.6], rotate: atacante === "a" ? 160 : -160 }} transition={{ duration: 0.8, times: [0, 0.3, 1] }}>{magia.simbolo}</motion.div>}
        {impacto && <motion.div key={`impacto-${indice}`} aria-hidden="true" className={styles.impacto} style={{ color: atacante === "empate" ? "#ffe4a6" : magia.cor, left: atacante === "a" ? "70%" : atacante === "b" ? "30%" : "50%" }} initial={{ scale: 0.2, opacity: 1 }} animate={{ scale: 2.4, opacity: 0, rotate: 65 }} exit={{ opacity: 0 }} transition={{ duration: 0.55 }}>✷</motion.div>}
        {finalizado && vencedor !== "empate" && <motion.div className={styles.coroa} aria-hidden="true" style={{ left: vencedor === "a" ? "27%" : "73%" }} initial={{ y: -60, opacity: 0, scale: 2 }} animate={{ y: 0, opacity: 1, scale: 1 }} transition={{ type: "spring", damping: 12 }}>♛</motion.div>}
      </AnimatePresence>
    </div>
    <p className={styles.narrador} role="status" aria-live="polite">{texto}</p>
  </section>;
}
