"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { byName } from "@/lib/classes";
import { CLASS_ARTWORK } from "@/lib/class-artwork";
import type { ResultadoBatalha as Resultado } from "@/lib/batalha-api";
import type { Oponente } from "./DesafioScanner";
import BrindesDoDuelo from "@/components/BrindesDoDuelo";
import TintaViva from "@/components/ui/tinta-viva";
import { useTavernFeedback } from "@/lib/useTavernFeedback";
import ConfrontoPersonagens from "./ConfrontoPersonagens";
import EntradaBatalha from "./EntradaBatalha";
import styles from "./ResultadoBatalha.module.css";

interface Props {
  resultado: Resultado;
  meuJogador: { nome: string | null; classe: string | null };
  oponente: Oponente;
  onBatalharDeNovo: () => void;
  onEscanearOutro: () => void;
}
const FASE_ARENA = 3;
const PRIMEIRA_RODADA = 4;
const DURACAO_RODADA = 3600;
const MOMENTOS_IMPACTO = [1150, 2200];
const noop = () => () => {};
const noCliente = () => true;
const noServidor = () => false;
const consulta = "(prefers-reduced-motion: reduce)";
function assinarMovimento(callback: () => void) {
  const media = window.matchMedia(consulta);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
const lerMovimento = () => window.matchMedia(consulta).matches;

/** A API já resolveu a batalha. Reassistir e pular alteram somente a encenação. */
export default function ResultadoBatalha({ resultado, meuJogador, oponente, onBatalharDeNovo, onEscanearOutro }: Props) {
  const montado = useSyncExternalStore(noop, noCliente, noServidor);
  const reduzido = useSyncExternalStore(assinarMovimento, lerMovimento, noServidor);
  const [fase, setFase] = useState(0);
  const [impacto, setImpacto] = useState(false);
  const [reprise, setReprise] = useState(0);
  const raiz = useRef<HTMLDivElement>(null);
  const foco = useRef<HTMLHeadingElement>(null);
  const { playClash, playStamp, playPageTurn } = useTavernFeedback();
  const faseFinal = PRIMEIRA_RODADA + resultado.rodadas.length;
  const livro = reduzido || fase > faseFinal;
  const finalizado = fase >= faseFinal;
  const rodadaAtual = fase - PRIMEIRA_RODADA;
  const rodada = rodadaAtual >= 0 && rodadaAtual < resultado.rodadas.length ? resultado.rodadas[rodadaAtual] : null;
  const classes = [byName(meuJogador.classe ?? ""), byName(oponente.classe ?? "")] as const;
  const nomes: [string, string] = [meuJogador.nome || "Você", oponente.nome || "Oponente"];
  const titulo = resultado.resultado === "a" ? "Vitória!" : resultado.resultado === "b" ? "Derrota" : "Empate";

  useEffect(() => {
    if (!montado || livro) return;
    const espera = fase < 2 ? 1800 : fase === 2 ? 1500 : fase === FASE_ARENA ? 1000 : fase === faseFinal ? 4200 : DURACAO_RODADA;
    const timer = window.setTimeout(() => setFase(f => f + 1), espera);
    return () => window.clearTimeout(timer);
  }, [fase, faseFinal, montado, livro, reprise]);

  useEffect(() => {
    if (!montado || livro || !rodada) return;
    const timers = MOMENTOS_IMPACTO.flatMap(tempo => [
      window.setTimeout(() => { setImpacto(true); playClash(); }, tempo),
      window.setTimeout(() => setImpacto(false), tempo + 500),
    ]);
    return () => timers.forEach(window.clearTimeout);
  }, [fase, rodada, montado, livro, playClash, reprise]);

  useEffect(() => {
    if (montado && finalizado && !livro) playStamp();
  }, [montado, finalizado, livro, playStamp]);
  useEffect(() => {
    if (montado && livro) playPageTurn();
  }, [montado, livro, playPageTurn]);

  // O portal escapa dos transforms e da largura do card da página de batalha.
  useEffect(() => {
    if (!montado || !raiz.current) return;
    const anterior = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const elementos = Array.from(document.body.children).filter((e): e is HTMLElement => e instanceof HTMLElement && !e.contains(raiz.current));
    const estados = elementos.map(e => e.inert);
    elementos.forEach(e => { e.inert = true; });
    raiz.current.focus();
    return () => {
      document.body.style.overflow = overflow;
      elementos.forEach((e, i) => { e.inert = estados[i]; });
      if (anterior?.isConnected) anterior.focus();
    };
  }, [montado]);
  useEffect(() => {
    if (!montado) return;
    const timer = window.setTimeout(() => {
      if (livro) foco.current?.focus();
      else raiz.current?.focus();
    }, 450);
    return () => window.clearTimeout(timer);
  }, [livro, montado]);

  function abrirLivro() { setImpacto(false); setFase(faseFinal + 1); }
  function entrarNaArena() { setImpacto(false); setFase(FASE_ARENA); }
  function reassistir() { setImpacto(false); setReprise(n => n + 1); setFase(0); }
  function teclado(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape" && !livro) { event.preventDefault(); abrirLivro(); }
    if (event.key !== "Tab") return;
    const itens = raiz.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex="0"]');
    if (!itens?.length) return;
    const primeiro = itens[0], ultimo = itens[itens.length - 1];
    if (event.shiftKey && (document.activeElement === primeiro || document.activeElement === raiz.current || document.activeElement === foco.current)) { event.preventDefault(); ultimo.focus(); }
    else if (!event.shiftKey && document.activeElement === ultimo) { event.preventDefault(); primeiro.focus(); }
  }
  if (!montado) return null;
  return createPortal(<div ref={raiz} className={styles.experiencia} role="dialog" aria-modal="true" aria-label={livro ? "Grimório de resultados da batalha" : "Batalha entre os aventureiros"} tabIndex={-1} onKeyDown={teclado}>
    <AnimatePresence mode="wait" initial={false}>
      {!livro ? <motion.div key={`cena-${reprise}`} className={styles.cena} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.04 }} transition={{ duration: .4 }}>
        <AnimatePresence mode="wait" initial={false}>
          {fase < FASE_ARENA ? <motion.div key="entrada" className={styles.cena} exit={{ opacity: 0, scale: 1.1 }} transition={{ duration: .25 }}>
            <EntradaBatalha fase={fase} classes={[...classes]} nomes={nomes} onEntrar={entrarNaArena}/>
          </motion.div> : <motion.div key="arena" className={styles.cena} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .3 }}>
            <ConfrontoPersonagens classes={[...classes]} nomes={nomes} rodada={rodada} indice={rodadaAtual} impacto={impacto} pronto={fase >= FASE_ARENA} finalizado={finalizado} vencedor={resultado.resultado} totalRodadas={resultado.rodadas.length} onAbrirGrimorio={abrirLivro}/>
          </motion.div>}
        </AnimatePresence>
      </motion.div> : <motion.div key="grimorio" className={styles.biblioteca} initial={reduzido ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .5 }}>
        <div className={styles.legenda}>A TAVERNA GUARDA TODAS AS HISTÓRIAS</div>
        <motion.article className={styles.livro} initial={reduzido ? false : { opacity: 0, y: 80, rotateX: 22, scale: .8 }} animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }} transition={{ duration: reduzido ? 0 : .85, type: "spring", damping: 22 }}>
          <section className={styles.pagina}>
            <span className={styles.sobretitulo}>GRIMÓRIO DOS CONFRONTOS</span>
            <div className={styles.selo} aria-hidden="true">{resultado.resultado === "empate" ? "⚖" : "⚔"}</div>
            <h2 ref={foco} tabIndex={-1}>{titulo}</h2>
            <p className={styles.placar}>{resultado.vitorias_a} <span>×</span> {resultado.vitorias_b}</p>
            <div className={styles.retratos}>{classes.map((classe, i) => <div key={i}><Image src={CLASS_ARTWORK[classe.name] ? `/classes/${CLASS_ARTWORK[classe.name]}.png` : classe.photo} width={130} height={130} alt={classe.name} unoptimized/><strong>{nomes[i]}</strong><small>{classe.name}</small><b>{resultado.resultado === "empate" ? "Empate" : resultado.resultado === (i ? "b" : "a") ? "Vencedor" : "Derrotado"}</b></div>)}</div>
            <p className={styles.narrativa}>{reduzido ? resultado.narrativa : <TintaViva texto={resultado.narrativa} atraso={.3}/>}</p>
            <span className={styles.numeroPagina}>I · A LENDA</span>
          </section>
          <section className={`${styles.pagina} ${styles.paginaDireita}`}>
            <span className={styles.sobretitulo}>O REGISTRO DO DUELO</span><h3>Atributos em confronto</h3>
            <table className={styles.tabela}><caption className="sr-only">Comparação de cada atributo e vencedor da rodada</caption><thead><tr><th>Atributo</th><th>Você</th><th>Rival</th><th>Venceu</th></tr></thead><tbody>{resultado.rodadas.map(r => <tr key={r.atributo}><th scope="row">{r.rotulo}</th><td data-vence={r.vencedor === "a"}>{r.valor_a}</td><td data-vence={r.vencedor === "b"}>{r.valor_b}</td><td>{r.vencedor === "empate" ? "Empate" : r.vencedor === "a" ? "Você" : "Rival"}</td></tr>)}</tbody></table>
            <h3>Espólios da aventura</h3>
            <div className={styles.xp}><span>Você <b>+{resultado.xp_a} XP</b></span><span>Oponente <b>+{resultado.xp_b} XP</b></span></div>
            <BrindesDoDuelo extras={resultado.extras}/>
            <div className={styles.acoes}><button onClick={onBatalharDeNovo}>Batalhar de novo</button><button onClick={onEscanearOutro}>Escanear outro oponente</button>{!reduzido && <button className={styles.reassistir} onClick={reassistir}>↻ Reassistir à batalha</button>}</div>
            <span className={styles.numeroPagina}>II · AS CONQUISTAS</span>
          </section>
        </motion.article>
      </motion.div>}
    </AnimatePresence>
  </div>, document.body);
}
