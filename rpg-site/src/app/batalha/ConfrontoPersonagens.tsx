"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { CLASS_ARTWORK } from "@/lib/class-artwork";
import type { ClassInfo } from "@/lib/classes";
import type { Rodada } from "@/lib/batalha-api";
import AtorBatalha from "./AtorBatalha";
import styles from "./ConfrontoPersonagens.module.css";

type Lado = "a" | "b";
interface Props {
  classes: [ClassInfo, ClassInfo]; nomes: [string, string]; rodada: Rodada | null;
  indice: number; impacto: boolean; pronto: boolean; finalizado: boolean;
  vencedor: Lado | "empate"; onAbrirGrimorio: () => void; totalRodadas: number;
}
export function estiloGolpe(classe: ClassInfo) {
  if (/Mago|Warlock|Necromante|Ilusionista|Vidente/.test(classe.name)) return { cor: "#c4a0ff", nome: "Rajada arcana", simbolo: "✦", distancia: true };
  if (/Druida|Domador|Invocador|Xamã/.test(classe.name)) return { cor: "#a7efad", nome: "Invocação selvagem", simbolo: "❋", distancia: true };
  if (/Bardo/.test(classe.name)) return { cor: "#ffcc74", nome: "Acorde estrondoso", simbolo: "♫", distancia: true };
  return { cor: "#ffb772", nome: "Investida heroica", simbolo: "⚔", distancia: false };
}

export default function ConfrontoPersonagens({ classes, nomes, rodada, indice, impacto, pronto, finalizado, vencedor, onAbrirGrimorio, totalRodadas }: Props) {
  const atacante = rodada?.vencedor;
  const magia = estiloGolpe(classes[atacante === "b" ? 1 : 0]);
  const texto = finalizado ? vencedor === "empate" ? "À altura da lenda. Nenhum dos dois se rendeu!" : `${nomes[vencedor === "a" ? 0 : 1]} venceu o confronto!`
    : rodada ? atacante === "empate" ? "Forças iguais! As defesas resistem ao confronto." : `${nomes[atacante === "a" ? 0 : 1]} usa ${magia.nome.toLowerCase()}!`
    : pronto ? "Armas em punho. Que comece o duelo!" : "Dois aventureiros. Uma história para contar.";
  return <section className={styles.arena} aria-label="Cena de batalha">
    <div className={styles.cenario} aria-hidden="true"/>
    <div className={styles.vinheta} aria-hidden="true"/>
    <header className={styles.hud}>
      {classes.map((classe, i) => <div className={`${styles.jogadorHud} ${i ? styles.hudRival : ""}`} key={i}>
        <Image src={CLASS_ARTWORK[classe.name] ? `/classes/${CLASS_ARTWORK[classe.name]}.png` : classe.photo} width={70} height={70} alt="" unoptimized/>
        <div><small>{i ? "OPONENTE" : "VOCÊ"}</small><strong>{nomes[i]}</strong><span>{classe.name}</span>
          <div className={styles.selos} aria-label={`${Math.min(Math.max(indice, 0), totalRodadas)} de ${totalRodadas} rodadas encenadas`}>{Array.from({ length: totalRodadas }, (_, j) => <i key={j} data-ativo={finalizado || j < indice}/>)}</div>
        </div>
      </div>)}
    </header>
    <div className={styles.cabecalho} key={`titulo-${indice}-${finalizado}`}>
      <span>{finalizado ? "O GRANDE DESFECHO" : rodada ? `RODADA ${indice + 1} DE ${totalRodadas}` : "ARENA DA TAVERNA"}</span>
      <motion.strong initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>{finalizado ? vencedor === "empate" ? "HONRA PRESERVADA" : vencedor === "a" ? "VOCÊ VENCEU!" : "RIVAL VENCEU!" : rodada ? rodada.rotulo : "O confronto"}</motion.strong>
      {rodada && !finalizado && <span className={styles.comparacao}>{rodada.valor_a} <em>{rodada.valor_a === rodada.valor_b ? "=" : rodada.valor_a > rodada.valor_b ? ">" : "<"}</em> {rodada.valor_b}</span>}
    </div>
    <motion.div className={styles.palco} animate={impacto ? { x: [0, -7, 6, -3, 0], y: [0, 3, -2, 0] } : { x: 0, y: 0 }} transition={{ duration: .3 }}>
      <div className={styles.chao} aria-hidden="true"/><div className={styles.circulo} aria-hidden="true"/>
      {classes.map((classe, i) => {
        const lado: Lado = i === 0 ? "a" : "b";
        const direcao = i === 0 ? 1 : -1;
        const ataca = !finalizado && atacante === lado;
        const recebe = !finalizado && impacto && !!rodada && atacante !== lado && atacante !== "empate";
        const ganhou = finalizado && vencedor === lado;
        const perdeu = finalizado && vencedor !== lado && vencedor !== "empate";
        const empate = !!rodada && atacante === "empate";
        const expressao = ganhou ? "vitoria" : perdeu ? "derrota" : recebe ? "dor" : ataca ? "ataque" : "pronto";
        return <div key={lado} className={`${styles.lutador} ${i ? styles.rival : ""}`} style={{ zIndex: ataca ? 4 : 3 }}>
          <div className={styles.sombra}/>
          <motion.div initial={{ opacity: 0, x: -direcao * 160 }} animate={{ opacity: pronto ? 1 : 0, x: pronto ? 0 : -direcao * 160 }} transition={{ type: "spring", damping: 18 }}>
            <motion.div key={`${indice}-${finalizado}`} className={styles.corpo} initial={{ x: 0, y: 0, rotate: 0 }}
              animate={perdeu ? { x: direcao * 22, y: 14, rotate: direcao * 58, opacity: .7 }
                : ganhou ? { y: [0, -72, 0, -55, 0], rotate: [0, -6, 0, 6, 0], scale: 1.06 }
                : ataca && !magia.distancia ? { x: ["0%", `${-direcao * 8}%`, `${direcao * 62}%`, "0%", `${direcao * 62}%`, "0%", "0%"], y: [0, -12, -38, 0, -28, 0, 0], rotate: [0, -direcao * 12, direcao * 15, 0, direcao * 15, 0, 0] }
                : ataca ? { y: [0, -18, 0, -12, 0], rotate: [0, -direcao * 8, direcao * 5, 0, 0] }
                : { y: [0, -7, 0] }}
              transition={{ duration: ganhou ? 1.5 : ataca ? 3.3 : perdeu ? .75 : 2, times: ataca && !magia.distancia ? [0, .15, .35, .49, .67, .85, 1] : undefined, repeat: ganhou || (!ataca && !finalizado) ? Infinity : 0 }}>
              <motion.div className={styles.marionete} animate={recebe ? { x: [0, -direcao * 32, direcao * 8, 0], rotate: [0, -direcao * 16, 4, 0] } : { x: 0, rotate: 0 }} transition={{ duration: .45 }}>
                <AtorBatalha classe={classe} expressao={expressao} lado={lado}/>
                {empate && impacto && <motion.div className={styles.escudo} initial={{ scale: .3, opacity: 0 }} animate={{ scale: 1.2, opacity: [0, .9, 0] }} transition={{ duration: .5 }}/>} 
              </motion.div>
            </motion.div>
          </motion.div>
          <AnimatePresence>{recebe && <motion.b className={styles.dano} initial={{ opacity: 0, y: 0, scale: .5 }} animate={{ opacity: [0, 1, 1, 0], y: -90, scale: 1.4 }} exit={{ opacity: 0 }} transition={{ duration: .65 }}>−{rodada?.diferenca}<small>DE VANTAGEM</small></motion.b>}</AnimatePresence>
          {ganhou && <motion.div className={styles.balao} initial={{ scale: 0 }} animate={{ scale: 1, rotate: [-4, 4, -4] }} transition={{ rotate: { repeat: Infinity, duration: 1 } }}>Essa vai para o grimório!</motion.div>}
          {perdeu && <motion.div className={styles.estrelas} animate={{ rotate: [0, 12, -12, 0] }} transition={{ repeat: Infinity, duration: 1 }}>✦ · ✧ · ✦</motion.div>}
        </div>;
      })}
      <AnimatePresence>
        {rodada && !finalizado && atacante !== "empate" && magia.distancia && [0, 1].map(tiro => <motion.div key={`${indice}-${tiro}`} aria-hidden="true" className={styles.projetil} style={{ color: magia.cor }} initial={{ left: atacante === "a" ? "33%" : "67%", opacity: 0, scale: .3 }} animate={{ left: atacante === "a" ? ["33%", "38%", "72%"] : ["67%", "62%", "28%"], opacity: [0, 1, 0], scale: [.3, 1.6, 1], rotate: atacante === "a" ? 160 : -160 }} transition={{ delay: .55 + tiro * 1.05, duration: .6, times: [0, .15, 1] }}><span className={styles.rastro}/>{magia.simbolo}</motion.div>)}
        {impacto && <motion.div key={`impacto-${indice}`} aria-hidden="true" className={styles.impacto} style={{ color: atacante === "empate" ? "#ffe4a6" : magia.cor, left: atacante === "a" ? "71%" : atacante === "b" ? "29%" : "50%" }} initial={{ scale: .2, opacity: 1 }} animate={{ scale: 2.6, opacity: 0, rotate: 65 }} exit={{ opacity: 0 }} transition={{ duration: .45 }}>✷</motion.div>}
        {finalizado && vencedor !== "empate" && <motion.div className={styles.coroa} aria-hidden="true" style={{ left: vencedor === "a" ? "26%" : "74%" }} initial={{ y: -70, opacity: 0, scale: 2 }} animate={{ y: [0, -12, 0], opacity: 1, scale: 1 }} transition={{ y: { repeat: Infinity, duration: 1.5 }, default: { duration: .5 } }}>♛</motion.div>}
      </AnimatePresence>
      {finalizado && vencedor !== "empate" && <div className={styles.confete} aria-hidden="true">{Array.from({ length: 24 }, (_, i) => <motion.i key={i} style={{ left: `${(i * 17) % 100}%`, background: ["#ffd57f", "#c9a4ff", "#8ceac2"][i % 3] }} initial={{ y: -100, opacity: 0 }} animate={{ y: [0, 650], x: [0, (i % 2 ? 1 : -1) * 70], rotate: i * 55, opacity: [0, 1, 1, 0] }} transition={{ duration: 3, delay: i * .045, repeat: Infinity }}/>)}</div>}
    </motion.div>
    <footer className={styles.rodape}><p role="status" aria-live="polite">{texto}</p><button type="button" onClick={onAbrirGrimorio}>{finalizado ? "Abrir grimório →" : "Pular para o resultado →"}</button></footer>
  </section>;
}
