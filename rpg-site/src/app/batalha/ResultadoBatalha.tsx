"use client";
import ConfrontoPersonagens from "./ConfrontoPersonagens";
import { IconText } from "@/components/ui/illustrated-icons";


import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  AnimatePresence,
  motion,
  useAnimate,
  useMotionValueEvent,
  useSpring,
} from "motion/react";
import { byName, type ClassInfo } from "@/lib/classes";
import type { ResultadoBatalha as Resultado, Rodada } from "@/lib/batalha-api";
import type { Oponente } from "./DesafioScanner";
import BrindesDoDuelo from "@/components/BrindesDoDuelo";
import TintaViva from "@/components/ui/tinta-viva";
import { useTavernFeedback } from "@/lib/useTavernFeedback";

interface Props {
  resultado: Resultado;
  meuJogador: { nome: string | null; classe: string | null };
  oponente: Oponente;
  onBatalharDeNovo: () => void;
  onEscanearOutro: () => void;
}

/* ═══════════════════════════════════════════════════════════════════════
   Preferência de movimento, segura para hidratação

   `useReducedMotion` do motion NÃO serve aqui. Ele devolve `null` no servidor
   e o valor real já na PRIMEIRA renderização do cliente — e como esta tela
   troca a ESTRUTURA (arena 3D inteira × versão chapada), a árvore do servidor
   e a da hidratação divergiriam.

   `useSyncExternalStore` resolve porque o React usa `getServerSnapshot` durante
   o hydrate e só depois re-renderiza com o valor do cliente. Para animação pura
   o hook do motion continua ótimo; para estrutura, não.
   ═══════════════════════════════════════════════════════════════════════ */
const CONSULTA = "(prefers-reduced-motion: reduce)";

function assinarMovimento(aoMudar: () => void) {
  const mq = window.matchMedia(CONSULTA);
  mq.addEventListener("change", aoMudar);
  return () => mq.removeEventListener("change", aoMudar);
}
const lerMovimento = () => window.matchMedia(CONSULTA).matches;
const movimentoNoServidor = () => false;

function usePrefereMenosMovimento() {
  return useSyncExternalStore(assinarMovimento, lerMovimento, movimentoNoServidor);
}

/* ═══════════════════════════════════════════════════════════════════════
   Ritmo da encenação
   ═══════════════════════════════════════════════════════════════════════ */

/** Fases: 0 = mesa vazia · 1 = cartas compradas · 2..4 = rodadas · 5 = desfecho */
const FASE_CARTAS = 1;
const PRIMEIRA_RODADA = 2;

const DURACAO = {
  compra: 1000,
  rodada: 2200,
  desfecho: 750,
};

/** Quando, dentro de uma rodada, os corpos se encontram. */
const MOMENTO_DO_IMPACTO = 650;
const DURACAO_DO_FLASH = 600;

const COPY = {
  vitoria: { titulo: "Vitória!", selo: "🏆", cor: "var(--seal)" },
  derrota: { titulo: "Derrota", selo: "💀", cor: "var(--ink-70)" },
  empate: { titulo: "Empate", selo: "⚖️", cor: "var(--foil)" },
} as const;

/* ═══════════════════════════════════════════════════════════════════════
   Componente principal
   ═══════════════════════════════════════════════════════════════════════ */

/**
 * Jogador A é sempre "eu" — quem escolheu os atributos e chamou a API. Por isso
 * `resultado.resultado === "a"` já É a minha vitória, sem descobrir lado.
 */
export default function ResultadoBatalha({
  resultado,
  meuJogador,
  oponente,
  onBatalharDeNovo,
  onEscanearOutro,
}: Props) {
  const reduzido = usePrefereMenosMovimento();
  const { playClash, playStamp } = useTavernFeedback();

  const rodadas = resultado.rodadas;
  const FASE_FINAL = PRIMEIRA_RODADA + rodadas.length;

  /* Começa em 0 no servidor E no cliente. Quem pede menos movimento não
     ramifica o estado inicial: percorre as mesmas fases com espera zero. */
  const [fase, setFase] = useState(0);
  /** Índice da rodada cujo impacto está acontecendo agora, ou null. */
  const [impacto, setImpacto] = useState<number | null>(null);

  const [escopo, animar] = useAnimate();

  /* Tremor caótico: deslocamentos em pixel inteiro, sem easing suave e sem
     simetria. Uma sequência interpolada daria balanço; pancada é abrupta e
     decai porque a estrutura absorve. */
  const tremer = useCallback(() => {
    if (reduzido || !escopo.current) return;
    void animar(
      escopo.current,
      { x: [0, -9, 7, -5, 4, -2, 1, 0], y: [0, 5, -4, 3, -2, 1, 0, 0] },
      { duration: 0.42, ease: "linear" },
    );
  }, [animar, escopo, reduzido]);

  // Avança as fases. Espera zero sob menos movimento → chega ao fim em quadros.
  useEffect(() => {
    if (fase > FASE_FINAL) return;

    const espera = reduzido
      ? 0
      : fase === 0
        ? 260
        : fase === FASE_CARTAS
          ? DURACAO.compra
          : fase === FASE_FINAL
            ? DURACAO.desfecho
            : DURACAO.rodada;

    const id = setTimeout(() => setFase((f) => f + 1), espera);
    return () => clearTimeout(id);
  }, [fase, FASE_FINAL, reduzido]);

  /* O impacto de cada rodada acontece DENTRO da fase dela, no meio do avanço —
     não na virada de fase. Separado do efeito acima porque tem relógio próprio. */
  useEffect(() => {
    const indice = fase - PRIMEIRA_RODADA;
    if (reduzido || indice < 0 || indice >= rodadas.length) return;

    const bater = setTimeout(() => {
      setImpacto(indice);
      tremer();
      playClash();
    }, MOMENTO_DO_IMPACTO);
    const limpar = setTimeout(
      () => setImpacto(null),
      MOMENTO_DO_IMPACTO + DURACAO_DO_FLASH,
    );
    return () => {
      clearTimeout(bater);
      clearTimeout(limpar);
    };
  }, [fase, rodadas.length, reduzido, tremer, playClash]);

  const fechado = fase > FASE_FINAL;

  // Carimba o veredito uma vez.
  const carimbado = useRef(false);
  useEffect(() => {
    if (fechado && !carimbado.current) {
      carimbado.current = true;
      playStamp();
    }
  }, [fechado, playStamp]);

  const veredito =
    resultado.resultado === "a" ? "vitoria" : resultado.resultado === "b" ? "derrota" : "empate";
  const copy = COPY[veredito];
  const minhaClasse = byName(meuJogador.classe ?? "");
  const classeRival = byName(oponente.classe ?? "");

  const rodadaAtual = fase - PRIMEIRA_RODADA;
  const emCombate = rodadaAtual >= 0 && rodadaAtual < rodadas.length;
  const golpe = emCombate ? rodadas[rodadaAtual] : null;

  /* ── Versão chapada ────────────────────────────────────────────────────
     Menos movimento não é "a mesma cena mais lenta": é o RESULTADO, direto.
     Sem perspectiva, sem cartas voando, sem impacto. */
  if (reduzido) {
    return (
      <Placar
        resultado={resultado}
        copy={copy}
        minhaClasse={minhaClasse}
        classeRival={classeRival}
        reduzido
        onBatalharDeNovo={onBatalharDeNovo}
        onEscanearOutro={onEscanearOutro}
      />
    );
  }

  return (
    <div ref={escopo} className="space-y-5">
      <ConfrontoPersonagens
        classes={[minhaClasse, classeRival]}
        nomes={[meuJogador.nome || "Você", oponente.nome || "Oponente"]}
        rodada={golpe}
        indice={rodadaAtual}
        impacto={impacto !== null}
        pronto={fase >= FASE_CARTAS}
        finalizado={fechado}
        vencedor={resultado.resultado}
      />

      {/* ── O REGISTRO ───────────────────────────────────────────────── */}
      <div className="paper-card paper-frame arcane-corners p-6 sm:p-8 text-center">
        <span className="ac-bl" />
        <span className="ac-br" />

        <div className="min-h-[3.4rem] flex flex-col justify-center">
          <AnimatePresence mode="wait" initial={false}>
            {fechado ? (
              <motion.div
                key="veredito"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <h2
                  className="text-[1.9rem]"
                  style={{ fontFamily: "var(--font-cinzel-decorative), serif", color: copy.cor }}
                >
                  {copy.titulo}
                </h2>
                <p
                  className="text-[1rem] tabular-nums"
                  style={{ fontFamily: "var(--font-cinzel-decorative), serif", color: "var(--ink)" }}
                >
                  {resultado.vitorias_a} × {resultado.vitorias_b}
                </p>
              </motion.div>
            ) : (
              <motion.p
                key="espera"
                className="text-[.7rem] tracking-[.25em] uppercase text-[var(--ink-50)] italic"
                style={{ fontFamily: "var(--font-cinzel), serif" }}
                aria-live="polite"
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {fase < FASE_CARTAS ? "As cartas são compradas…" : "As lâminas se cruzam…"}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="divider !my-4" />

        <ol className="space-y-2 mb-5" aria-live="polite">
          {rodadas.map((r, i) => (
            <AnimatePresence key={r.atributo}>
              {fase > PRIMEIRA_RODADA + i - 1 && (
                <LinhaRodada
                  rodada={r}
                  emFoco={i === rodadaAtual}
                  recuada={fechado && veredito !== "empate" && r.vencedor !== resultado.resultado}
                />
              )}
            </AnimatePresence>
          ))}
        </ol>

        <AnimatePresence>
          {fechado && (
            <motion.div
              key="desfecho"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <p className="text-[.85rem] italic leading-relaxed mb-5">
                <TintaViva texto={resultado.narrativa} atraso={0.55} />
              </p>
              <BarraXp meu={resultado.xp_a} oponente={resultado.xp_b} euVenci={veredito === "vitoria"} />
              <BrindesDoDuelo extras={resultado.extras} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {fechado && (
          <motion.div
            key="acoes"
            className="space-y-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.8 }}
          >
            <Acoes onBatalharDeNovo={onBatalharDeNovo} onEscanearOutro={onEscanearOutro} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Subcomponentes
   ═══════════════════════════════════════════════════════════════════════ */

/**
 * Barra de XP com contagem de moedas.
 *
 * A barra enche com `scaleX` (composto na GPU) enquanto o número sobe por uma
 * mola. Os dois lados aparecem: o duelo move os dois placares, e mostrar só o
 * meu faria o ranking parecer arbitrário.
 */
function BarraXp({ meu, oponente, euVenci }: { meu: number; oponente: number; euVenci: boolean }) {
  const maximo = Math.max(meu, oponente, 1);

  return (
    <div className="space-y-2.5">
      <FaixaXp rotulo="Você" valor={meu} maximo={maximo} destaque={euVenci} atraso={0.6} />
      <FaixaXp rotulo="Oponente" valor={oponente} maximo={maximo} destaque={!euVenci} atraso={0.78} />
    </div>
  );
}

function FaixaXp({
  rotulo,
  valor,
  maximo,
  destaque,
  atraso,
}: {
  rotulo: string;
  valor: number;
  maximo: number;
  destaque: boolean;
  atraso: number;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className="w-16 shrink-0 text-left text-[.5rem] tracking-[.2em] uppercase text-[var(--foil)]"
        style={{ fontFamily: "var(--font-cinzel), serif" }}
      >
        {rotulo}
      </span>
      <span className="relative h-2.5 flex-1 overflow-hidden border border-[rgba(96,66,26,.4)] bg-[rgba(96,66,26,.12)]">
        <motion.span
          className="absolute inset-y-0 left-0 w-full origin-left"
          style={{
            background: destaque
              ? "linear-gradient(90deg, var(--seal), var(--gold))"
              : "linear-gradient(90deg, rgba(96,66,26,.5), rgba(138,100,40,.7))",
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: valor / maximo }}
          transition={{ duration: 1.1, delay: atraso, ease: [0.2, 0.7, 0.3, 1] }}
        />
      </span>
      <span
        className="w-14 shrink-0 text-right text-[.8rem] tabular-nums"
        style={{
          fontFamily: "var(--font-cinzel-decorative), serif",
          color: destaque ? "var(--gold)" : "var(--ink-50)",
        }}
      >
        +<ContagemXp valor={valor} atraso={atraso} /> XP
      </span>
    </div>
  );
}

/** Contagem de moedas: o número sobe junto com a barra. */
function ContagemXp({ valor, atraso }: { valor: number; atraso: number }) {
  const mola = useSpring(0, { stiffness: 55, damping: 22 });
  const [exibido, setExibido] = useState(0);

  useEffect(() => {
    const id = setTimeout(() => mola.set(valor), atraso * 1000);
    return () => clearTimeout(id);
  }, [valor, atraso, mola]);

  useMotionValueEvent(mola, "change", (v) => setExibido(Math.round(v)));
  return <>{exibido}</>;
}

/* ── Linha do registro ──────────────────────────────────────────────── */

function LinhaRodada({
  rodada,
  emFoco,
  recuada,
}: {
  rodada: Rodada;
  emFoco: boolean;
  recuada: boolean;
}) {
  const { vencedor } = rodada;
  const selo = vencedor === "empate" ? "🤝" : vencedor === "a" ? "🏆" : "💀";

  return (
    <motion.li
      layout
      className="flex items-center justify-between text-[.78rem] py-1.5 border-b border-[rgba(96,66,26,0.12)] last:border-0"
      initial={{ opacity: 0, y: 10 }}
      animate={{
        opacity: recuada ? 0.32 : 1,
        y: 0,
        scale: recuada ? 0.94 : emFoco ? 1.03 : 1,
      }}
      transition={{ duration: recuada ? 0.85 : 0.35, ease: [0.4, 0, 0.2, 1] }}
    >
      <span style={{ fontFamily: "var(--font-cinzel), serif", color: "var(--ink-70)" }}>
        {rodada.rotulo}
      </span>
      <span className="flex items-center gap-2 tabular-nums">
        <span style={{ color: vencedor === "a" ? "var(--seal)" : "var(--ink-50)" }}>
          {rodada.valor_a}
        </span>
        <span className="opacity-40">×</span>
        <span style={{ color: vencedor === "b" ? "var(--seal)" : "var(--ink-50)" }}>
          {rodada.valor_b}
        </span>
        <span className="w-4 text-center">{<IconText text={selo} />}</span>
      </span>
    </motion.li>
  );
}

/* ── Versão chapada, para prefers-reduced-motion ─────────────────────── */

function Placar({
  resultado,
  copy,
  minhaClasse,
  classeRival,
  onBatalharDeNovo,
  onEscanearOutro,
}: {
  resultado: Resultado;
  copy: (typeof COPY)[keyof typeof COPY];
  minhaClasse: ClassInfo;
  classeRival: ClassInfo;
  reduzido: boolean;
  onBatalharDeNovo: () => void;
  onEscanearOutro: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="paper-card paper-frame arcane-corners p-6 sm:p-8 text-center">
        <span className="ac-bl" />
        <span className="ac-br" />
        <span
          className="section-eyebrow"
          style={{ fontSize: ".6rem", letterSpacing: ".35em", color: "var(--seal)", opacity: 0.9 }}
        >
          Resultado do Confronto
        </span>
        <div className="wax-seal !w-16 !h-16 mx-auto text-3xl my-3">{<IconText text={copy.selo} />}</div>
        <h2
          className="text-[1.9rem]"
          style={{ fontFamily: "var(--font-cinzel-decorative), serif", color: copy.cor }}
        >
          {copy.titulo}
        </h2>
        <p
          className="text-[1rem] mb-4 tabular-nums"
          style={{ fontFamily: "var(--font-cinzel-decorative), serif", color: "var(--ink)" }}
        >
          {resultado.vitorias_a} × {resultado.vitorias_b}
        </p>

        <div className="flex items-center justify-center gap-3 mb-4">
          <Retrato classe={minhaClasse} />
          <span className="text-sm opacity-50" style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}>
            vs
          </span>
          <Retrato classe={classeRival} />
        </div>

        <div className="divider !my-4" />

        <ol className="space-y-2 mb-5">
          {resultado.rodadas.map((r) => (
            <li
              key={r.atributo}
              className="flex items-center justify-between text-[.78rem] py-1.5 border-b border-[rgba(96,66,26,0.12)] last:border-0"
            >
              <span style={{ fontFamily: "var(--font-cinzel), serif", color: "var(--ink-70)" }}>
                {r.rotulo}
              </span>
              <span className="flex items-center gap-2 tabular-nums">
                <span style={{ color: r.vencedor === "a" ? "var(--seal)" : "var(--ink-50)" }}>
                  {r.valor_a}
                </span>
                <span className="opacity-40">×</span>
                <span style={{ color: r.vencedor === "b" ? "var(--seal)" : "var(--ink-50)" }}>
                  {r.valor_b}
                </span>
                <span className="w-4 text-center">
                  {<IconText text={r.vencedor === "empate" ? "🤝" : r.vencedor === "a" ? "🏆" : "💀"} />}
                </span>
              </span>
            </li>
          ))}
        </ol>

        <p className="text-[.85rem] italic leading-relaxed mb-4">{resultado.narrativa}</p>
        <p
          className="text-[.75rem] tracking-[.15em] uppercase"
          style={{ fontFamily: "var(--font-cinzel), serif", color: "var(--foil)" }}
        >
          Você +{resultado.xp_a} XP · Oponente +{resultado.xp_b} XP
        </p>
      </div>

      <div className="space-y-3">
        <Acoes onBatalharDeNovo={onBatalharDeNovo} onEscanearOutro={onEscanearOutro} />
      </div>
    </div>
  );
}

function Retrato({ classe }: { classe: ClassInfo }) {
  return (
    <div className="text-center flex-1 min-w-0">
      <div className="wax-seal !w-12 !h-12 mx-auto text-xl mb-1">{<IconText text={classe.icon} />}</div>
      <p className="text-[.62rem] truncate" style={{ fontFamily: "var(--font-cinzel), serif" }}>
        {classe.name}
      </p>
    </div>
  );
}

function Acoes({
  onBatalharDeNovo,
  onEscanearOutro,
}: {
  onBatalharDeNovo: () => void;
  onEscanearOutro: () => void;
}) {
  return (
    <>
      <button
        onClick={onBatalharDeNovo}
        className="press btn-seal block w-full py-4 text-[.75rem] tracking-[.12em] uppercase cursor-pointer"
        style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
      >{<IconText text={"\r\n        ⚔️ Batalhar de novo\r\n      "} />}</button>
      <button
        onClick={onEscanearOutro}
        className="press btn-parchment block w-full py-3.5 text-[.72rem] tracking-[.12em] uppercase cursor-pointer"
        style={{ fontFamily: "var(--font-cinzel), serif" }}
      >{<IconText text={"\r\n        📷 Escanear outro oponente\r\n      "} />}</button>
    </>
  );
}
