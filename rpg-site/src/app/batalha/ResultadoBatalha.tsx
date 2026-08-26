"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  AnimatePresence,
  motion,
  useAnimate,
  useMotionValueEvent,
  useSpring,
  type Variants,
} from "motion/react";
import { byName, type ClassInfo } from "@/lib/classes";
import type { ResultadoBatalha as Resultado, Rodada } from "@/lib/batalha-api";
import type { Oponente } from "./DesafioScanner";
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
  rodada: 1250,
  desfecho: 750,
};

/** Quando, dentro de uma rodada, os corpos se encontram. */
const MOMENTO_DO_IMPACTO = 400;
const DURACAO_DO_FLASH = 220;

/* Mola do avanço: rígida e pouco amortecida — a carta salta, não desliza. */
const MOLA_GOLPE = { type: "spring", stiffness: 520, damping: 16, mass: 1 } as const;
/* Mola do troféu caindo: massa alta para ter peso de queda. */
const MOLA_QUEDA = { type: "spring", stiffness: 150, damping: 12, mass: 2.6 } as const;

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
      {/* ── A ARENA ──────────────────────────────────────────────────────
          `perspective` no pai e `preserve-3d` nos filhos: sem os dois, todo
          translateZ vira nada e o tabuleiro fica chapado. */}
      <div
        className="relative"
        style={{ perspective: "1200px", perspectiveOrigin: "50% 42%" }}
      >
        <motion.div
          className="relative mx-auto h-[15.5rem] w-full"
          style={{ transformStyle: "preserve-3d" }}
          initial={{ rotateX: 32, opacity: 0 }}
          animate={{ rotateX: 17, opacity: 1 }}
          transition={{ duration: 0.9, ease: [0.2, 0.7, 0.3, 1] }}
        >
          <Tabuleiro rachar={fechado} />

          <div className="absolute inset-0 flex items-center justify-center gap-5"
            style={{ transformStyle: "preserve-3d" }}>
            <BattleCard
              classe={minhaClasse}
              rotulo="Você"
              lado="a"
              naMesa={fase >= FASE_CARTAS}
              atacando={golpe?.vencedor === "a"}
              sofrendo={impacto !== null && golpe?.vencedor === "b"}
              vencendo={fechado && resultado.resultado === "a"}
              dano={impacto !== null && golpe?.vencedor === "b" ? golpe.diferenca : null}
            />
            <BattleCard
              classe={classeRival}
              rotulo="Oponente"
              lado="b"
              naMesa={fase >= FASE_CARTAS}
              atacando={golpe?.vencedor === "b"}
              sofrendo={impacto !== null && golpe?.vencedor === "a"}
              vencendo={fechado && resultado.resultado === "b"}
              dano={impacto !== null && golpe?.vencedor === "a" ? golpe.diferenca : null}
            />
          </div>
        </motion.div>

        <AnimatePresence>{fechado && <TrofeuQueCai selo={copy.selo} />}</AnimatePresence>
      </div>

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

/** O tabuleiro sob as cartas, com a rachadura que o troféu abre ao cair. */
function Tabuleiro({ rachar }: { rachar: boolean }) {
  return (
    <div
      aria-hidden
      className="absolute inset-x-2 bottom-2 top-8 rounded-sm"
      style={{
        transform: "translateZ(-40px)",
        background:
          "radial-gradient(70% 90% at 50% 40%, rgba(88,58,26,.55) 0%, rgba(28,16,7,.85) 100%)",
        boxShadow: "inset 0 0 60px rgba(0,0,0,.7)",
        border: "1px solid rgba(138,100,40,.22)",
      }}
    >
      {/* A rachadura: nasce do ponto de queda e se abre. Escala + opacidade
          apenas, para o navegador compor na GPU em vez de repintar. */}
      <motion.span
        className="absolute left-1/2 top-[22%] h-[2px] w-3/4 -translate-x-1/2"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,196,116,.85), rgba(255,120,60,.5), transparent)",
          filter: "blur(1px)",
          transformOrigin: "50% 50%",
        }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={rachar ? { scaleX: [0, 1.1, 1], opacity: [0, 1, 0.28] } : {}}
        transition={{ duration: 0.7, times: [0, 0.3, 1], delay: 0.12 }}
      />
    </div>
  );
}

/* A carta pousa girando: 180° mostra o verso, 0° mostra a frente. */
const variantesCarta: Variants = {
  // Entra de fora da tela, de costas e girada — como carta comprada do baralho.
  baralho: (lado: "a" | "b") => ({
    x: lado === "a" ? -220 : 220,
    y: -60,
    z: 90,
    rotateY: 180,
    rotateZ: lado === "a" ? -18 : 18,
    opacity: 0,
  }),
  mesa: {
    x: 0,
    y: 0,
    z: 0,
    rotateY: 0,
    rotateZ: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 120, damping: 14, mass: 1.2 },
  },
};

interface CartaProps {
  classe: ClassInfo;
  rotulo: string;
  lado: "a" | "b";
  naMesa: boolean;
  atacando: boolean;
  sofrendo: boolean;
  vencendo: boolean;
  dano: number | null;
}

/**
 * A carta física do lutador.
 *
 * Três estados de altura, e a SOMBRA acompanha cada um: quanto mais alto o
 * `translateZ`, mais larga e difusa ela fica. É a sombra que informa a altura —
 * sem ela, `translateZ` sozinho parece só um `scale`.
 */
function BattleCard({
  classe,
  rotulo,
  lado,
  naMesa,
  atacando,
  sofrendo,
  vencendo,
  dano,
}: CartaProps) {
  // Quem ataca avança para o meio da mesa; o eixo depende do lado.
  const avanco = lado === "a" ? 46 : -46;

  const altura = atacando ? 74 : vencendo ? 34 : 0;
  const sombra = atacando
    ? "0 34px 40px rgba(0,0,0,.62)"
    : vencendo
      ? "0 20px 26px rgba(0,0,0,.5)"
      : "0 8px 14px rgba(0,0,0,.55)";

  return (
    <motion.div
      className="relative w-[7.2rem]"
      style={{ transformStyle: "preserve-3d", zIndex: atacando ? 20 : 1 }}
      custom={lado}
      variants={variantesCarta}
      initial="baralho"
      animate={naMesa ? "mesa" : "baralho"}
    >
      <motion.div
        className="relative"
        style={{ transformStyle: "preserve-3d" }}
        animate={{
          z: altura,
          x: atacando ? avanco : 0,
          scale: atacando ? 1.1 : vencendo ? 1.04 : 1,
        }}
        transition={MOLA_GOLPE}
      >
        <motion.div
          className="rounded-[3px] border px-2 py-3 text-center"
          style={{
            borderColor: vencendo ? "var(--gold)" : "rgba(96,66,26,.5)",
            background: "linear-gradient(168deg, #f2e3ba 0%, var(--paper2) 60%, var(--paper3) 100%)",
          }}
          animate={{
            boxShadow: vencendo
              ? `${sombra}, 0 0 26px 4px var(--gold), inset 0 0 18px rgba(230,188,106,.5)`
              : sombra,
            /* O golpe recebido: vermelho por 220ms. O filtro é caro, mas dura
               pouco e é o que o olho lê como "levou dano". */
            filter: sofrendo
              ? "brightness(2) sepia(1) hue-rotate(-50deg) saturate(5)"
              : "none",
          }}
          transition={{ boxShadow: { duration: 0.35 }, filter: { duration: 0.08 } }}
        >
          <div className="wax-seal !w-11 !h-11 mx-auto text-lg mb-1.5">{classe.icon}</div>
          <p
            className="text-[.52rem] leading-tight text-[var(--ink-70)] line-clamp-2"
            style={{ fontFamily: "var(--font-cinzel), serif" }}
          >
            {classe.name}
          </p>
          <p
            className="mt-1 text-[.42rem] tracking-[.2em] uppercase text-[var(--foil)]"
            style={{ fontFamily: "var(--font-cinzel), serif" }}
          >
            {rotulo}
          </p>
        </motion.div>
      </motion.div>

      <AnimatePresence>{dano !== null && <FloatingDamage valor={dano} />}</AnimatePresence>
    </motion.div>
  );
}

/**
 * O número de dano saltando da carta.
 *
 * O valor é a DIFERENÇA entre os dois atributos: quanto o golpe foi maior que a
 * defesa. Um "-1" e um "-14" contam histórias diferentes, e é essa margem que o
 * placar de rodadas esconde.
 */
function FloatingDamage({ valor }: { valor: number }) {
  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2 tabular-nums"
      style={{
        fontFamily: "var(--font-cinzel-decorative), serif",
        fontSize: "1.5rem",
        color: "#e8503a",
        textShadow: "0 2px 8px rgba(0,0,0,.75), 0 0 14px rgba(232,80,58,.6)",
        zIndex: 30,
      }}
      initial={{ opacity: 0, y: 6, scale: 0.6 }}
      animate={{ opacity: [0, 1, 1, 0], y: -46, scale: [0.6, 1.25, 1, 0.95] }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.9, times: [0, 0.18, 0.6, 1], ease: "easeOut" }}
    >
      −{valor}
    </motion.span>
  );
}

/** O selo do desfecho caindo do alto e batendo na mesa. */
function TrofeuQueCai({ selo }: { selo: string }) {
  return (
    <motion.div
      aria-hidden
      /* Acima das cartas, não sobre elas: centralizado no eixo vertical o
         troféu tapava os dois nomes de classe. Ele pousa na borda de cima do
         tabuleiro, onde ainda parece ter caído na mesa sem esconder quem
         lutou. */
      className="pointer-events-none absolute inset-x-0 top-1 flex justify-center"
      style={{ perspective: "800px", zIndex: 40 }}
    >
      <motion.span
        className="flex h-16 w-16 items-center justify-center rounded-full text-3xl"
        style={{
          background:
            "radial-gradient(circle at 36% 30%, #b23a26 0%, var(--seal) 44%, #5e150d 100%)",
          boxShadow: "0 18px 32px rgba(0,0,0,.6), inset 0 2px 6px rgba(255,160,110,.4)",
        }}
        /* Cai de 500px de profundidade: começa enorme e distante, chega ao
           tamanho real. É o eixo Z que dá a sensação de queda, não o Y. */
        initial={{ z: 500, opacity: 0, rotate: -25 }}
        animate={{ z: 0, opacity: 1, rotate: 0 }}
        transition={MOLA_QUEDA}
      >
        {selo}
      </motion.span>
    </motion.div>
  );
}

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
        <span className="w-4 text-center">{selo}</span>
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
        <div className="wax-seal !w-16 !h-16 mx-auto text-3xl my-3">{copy.selo}</div>
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
                  {r.vencedor === "empate" ? "🤝" : r.vencedor === "a" ? "🏆" : "💀"}
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
      <div className="wax-seal !w-12 !h-12 mx-auto text-xl mb-1">{classe.icon}</div>
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
      >
        ⚔️ Batalhar de novo
      </button>
      <button
        onClick={onEscanearOutro}
        className="press btn-parchment block w-full py-3.5 text-[.72rem] tracking-[.12em] uppercase cursor-pointer"
        style={{ fontFamily: "var(--font-cinzel), serif" }}
      >
        📷 Escanear outro oponente
      </button>
    </>
  );
}
