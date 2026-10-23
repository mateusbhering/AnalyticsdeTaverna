"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ClassInfo } from "@/lib/classes";
import AtorBatalha from "./AtorBatalha";
import styles from "./EntradaBatalha.module.css";

interface Props { fase: number; classes: [ClassInfo, ClassInfo]; nomes: [string, string]; onEntrar: () => void }

/** Close em cada combatente, encontro em VS, corte para o campo de batalha. */
export default function EntradaBatalha({ fase, classes, nomes, onEntrar }: Props) {
  const versus = fase === 2;
  const indice = fase === 1 ? 1 : 0;
  return <section className={`${styles.entrada} ${fase === 1 ? styles.fria : ""}`} aria-label="Cutscene de entrada da batalha">
    <div className={styles.cenario} aria-hidden="true"/>
    <div className={styles.raios} aria-hidden="true"/>
    <div className={styles.barraSuperior} aria-hidden="true"/><div className={styles.barraInferior} aria-hidden="true"/>
    <AnimatePresence mode="wait">
      {versus ? <motion.div key="versus" className={styles.versus} initial={{ opacity: 0, scale: 1.12 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
        {[0, 1].map(i => <motion.div key={i} className={`${styles.painelVersus} ${i ? styles.painelRival : ""}`}
          initial={{ x: i ? "100%" : "-100%" }} animate={{ x: 0 }} transition={{ type: "spring", damping: 20, stiffness: 160 }}>
          <div className={styles.atorVersus}><AtorBatalha classe={classes[i]} expressao="entrada" lado={i ? "b" : "a"}/></div>
          <div className={styles.nomeVersus}><strong>{nomes[i]}</strong><span>{classes[i].name}</span></div>
        </motion.div>)}
        <motion.div className={styles.vs} initial={{ scale: 4, rotate: -18, opacity: 0 }} animate={{ scale: [1.4, 1, 1.08], rotate: 0, opacity: 1 }} transition={{ delay: .2, duration: .6 }}>VS</motion.div>
        <motion.p className={styles.chamado} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .65 }}>QUE COMECE O CONFRONTO!</motion.p>
      </motion.div> : <motion.div key={indice} className={`${styles.apresentacao} ${indice ? styles.apresentacaoRival : ""}`}
        initial={{ opacity: 0, x: indice ? 130 : -130 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: indice ? -100 : 100 }} transition={{ duration: .22 }}>
        <motion.div className={styles.close} initial={{ scale: .8, rotate: indice ? 7 : -7 }} animate={{ scale: [1, 1.06], rotate: 0 }} transition={{ duration: 1.4 }}>
          <AtorBatalha classe={classes[indice]} expressao="entrada" lado={indice ? "b" : "a"}/>
        </motion.div>
        <motion.div className={styles.cartela} initial={{ x: indice ? -90 : 90, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: .12, duration: .35 }}>
          <span>{indice ? "O ADVERSÁRIO SE APRESENTA" : "UM AVENTUREIRO ACEITA O DESAFIO"}</span>
          <h2>{nomes[indice]}</h2><p>{classes[indice].name}</p>
          <i aria-hidden="true">✦ ━━━━━━━━━ ✦</i>
          <small>{indice ? "Do outro lado da arena, uma nova lenda." : "Toda grande história começa com um duelo."}</small>
        </motion.div>
      </motion.div>}
    </AnimatePresence>
    <div className={styles.progresso} aria-hidden="true"><motion.span key={fase} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: versus ? 1.5 : 1.8, ease: "linear" }}/></div>
    <button type="button" className={styles.pular} onClick={onEntrar}>Entrar na arena →</button>
  </section>;
}
