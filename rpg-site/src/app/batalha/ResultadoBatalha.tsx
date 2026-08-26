"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  type Variants,
} from "motion/react";
import { byName } from "@/lib/classes";
import type { ResultadoBatalha as Resultado, Rodada } from "@/lib/batalha-api";
import type { Oponente } from "./DesafioScanner";
import ArenaImpacto, { type Impacto } from "@/components/ui/arena-impacto";
import TintaViva from "@/components/ui/tinta-viva";
import { useTavernFeedback } from "@/lib/useTavernFeedback";

interface Props {
  resultado: Resultado;
  meuJogador: { nome: string | null; classe: string | null };
  oponente: Oponente;
  onBatalharDeNovo: () => void;
  onEscanearOutro: () => void;
}

/* ── Ritmo da encenação ────────────────────────────────────────────────
   O backend já devolveu tudo pronto: a espera aqui é dramaturgia, não
   latência. Revelar as três rodadas de uma vez entrega o placar antes de a
   pessoa ler a primeira linha. */
const ATRASO_PRIMEIRA_MS = 420;
const INTERVALO_RODADA_MS = 1100;
const ATRASO_VEREDITO_MS = 620;

const COPY = {
  vitoria: { titulo: "Vitória!", cor: "var(--seal)" },
  derrota: { titulo: "Derrota", cor: "var(--ink-70)" },
  empate: { titulo: "Empate", cor: "var(--foil)" },
} as const;

/* Mola pesada da consagração: `mass` alta é o que dá peso — o bloco desce com
   inércia e passa do ponto ao assentar. Damping 13 deixa esse excesso virar um
   solavanco só, não uma gangorra. */
const MOLA_PESADA = { type: "spring", stiffness: 190, damping: 13, mass: 2.1 } as const;

/* As rodadas que não decidiram nada recuam devagar — mais devagar que a
   consagração entra. Assim o olho é puxado para a frente, não empurrado para
   trás: quem recua não deve competir por atenção com quem chega. */
const RECUO = { duration: 0.85, ease: [0.4, 0, 0.2, 1], delay: 0.12 } as const;

/**
 * Jogador A é sempre "eu" — quem escolheu os atributos e chamou a API em
 * `EscolhaAtributos`. Por isso o veredito não precisa descobrir de que lado eu
 * estou: `resultado.resultado === "a"` já É a minha vitória.
 */
export default function ResultadoBatalha({
  resultado,
  meuJogador,
  oponente,
  onBatalharDeNovo,
  onEscanearOutro,
}: Props) {
  const semMovimento = useReducedMotion();
  const { playClash, playStamp } = useTavernFeedback();
  const total = resultado.rodadas.length;

  /* Começa SEMPRE em 0, inclusive para quem pediu menos movimento: o servidor
     não conhece a preferência do aparelho, então um estado inicial que
     dependesse dela faria o HTML dele divergir da primeira renderização do
     cliente. Quem pediu menos movimento percorre as mesmas etapas com espera
     zero, no efeito abaixo. */
  const [etapa, setEtapa] = useState(0);

  /* O impacto é disparado pelo efeito que revela cada rodada, então precisa ser
     estável entre renders — daí a ref, e não estado. */
  const impacto = useRef<Impacto | null>(null);
  const receberArena = useCallback((i: Impacto) => {
    impacto.current = i;
  }, []);

  useEffect(() => {
    if (etapa > total) return;
    const espera = semMovimento
      ? 0
      : etapa === 0
        ? ATRASO_PRIMEIRA_MS
        : etapa === total
          ? ATRASO_VEREDITO_MS
          : INTERVALO_RODADA_MS;
    const id = setTimeout(() => {
      setEtapa((e) => e + 1);
      /* Bate quando uma RODADA entra — não no veredito. É ali que os dois
         valores colidem, e é a colisão que sacode a sala. */
      if (etapa < total) {
        impacto.current?.bater();
        playClash();
      } else {
        playStamp(); // o veredito é carimbado
      }
    }, espera);
    return () => clearTimeout(id);
  }, [etapa, total, semMovimento, playClash, playStamp]);

  const fechado = etapa > total;

  const veredito =
    resultado.resultado === "a" ? "vitoria" : resultado.resultado === "b" ? "derrota" : "empate";
  const copy = COPY[veredito];

  const minhaClasse = byName(meuJogador.classe ?? "");
  const classeRival = byName(oponente.classe ?? "");

  /* Empate não consagra ninguém: sem vencedor, nenhuma linha recua e nenhum
     nome desliza — celebrar um lado seria mentir sobre o placar. */
  const temVencedor = resultado.resultado !== "empate";
  const euVenci = resultado.resultado === "a";
  const nomeVencedor = euVenci
    ? meuJogador.nome?.trim() || minhaClasse.name
    : oponente.nome?.trim() || classeRival.name;

  return (
    <ArenaImpacto aoMontar={receberArena} className="space-y-6">
      <div className="paper-card paper-frame arcane-corners p-6 sm:p-8 text-center">
        <span className="ac-bl" />
        <span className="ac-br" />

        <span
          className="section-eyebrow"
          style={{ fontSize: ".6rem", letterSpacing: ".35em", color: "var(--seal)", opacity: 0.9 }}
        >
          Resultado do Confronto
        </span>

        {/* Título e placar só quando as três rodadas já apareceram — senão o
            veredito entrega o final antes de a primeira linha ser lida. */}
        {/* `mode="wait"` faz a espera SAIR antes de o veredito entrar. Sem
            AnimatePresence o texto anterior simplesmente sumia, e a troca
            parecia um corte seco no meio da cena. */}
        <div className="min-h-[4.6rem] flex flex-col justify-center">
          <AnimatePresence mode="wait" initial={false}>
            {fechado ? (
              <motion.div
                key="veredito"
                initial={semMovimento ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              >
                <h2
                  className="text-[2rem] mt-2 mb-1"
                  style={{ fontFamily: "var(--font-cinzel-decorative), serif", color: copy.cor }}
                >
                  {copy.titulo}
                </h2>
                <p
                  className="text-[1.1rem] mb-4 tabular-nums"
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
                exit={semMovimento ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
              >
                As lâminas se cruzam…
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-center gap-3 mb-5">
          <Lutador classe={minhaClasse} />
          <span
            className="text-sm opacity-50"
            style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
          >
            vs
          </span>
          <Lutador classe={classeRival} />
        </div>

        <div className="divider mb-4" />

        {/* Rodada a rodada.
            `LayoutGroup` coordena o reflow: quando as linhas perdedoras
            encolhem, as que ficam sobem suavemente em vez de saltar. */}
        <LayoutGroup>
          <ol className="space-y-2 mb-5" aria-live="polite">
            <AnimatePresence initial={false}>
              {resultado.rodadas.map((r, i) =>
                etapa > i ? (
                  <LinhaRodada
                    key={r.atributo}
                    rodada={r}
                    semMovimento={!!semMovimento}
                    /* Recua quem NÃO decidiu a batalha. O que sobra em foco são
                       os golpes que ganharam — a lista vira o resumo do porquê,
                       não um extrato de três linhas iguais. */
                    recuada={fechado && temVencedor && r.vencedor !== resultado.resultado}
                  />
                ) : null,
              )}
            </AnimatePresence>
          </ol>
        </LayoutGroup>

        <AnimatePresence>
          {fechado && (
            <motion.div
              key="desfecho"
              layout
              initial={semMovimento ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              {temVencedor && (
                <Consagracao
                  nome={nomeVencedor}
                  xpMeu={resultado.xp_a}
                  xpOponente={resultado.xp_b}
                  euVenci={euVenci}
                  semMovimento={!!semMovimento}
                />
              )}

              <p className="text-[.85rem] italic leading-relaxed mb-4">
                <TintaViva texto={resultado.narrativa} atraso={0.18} />
              </p>

              {/* No empate não há consagração, então o XP aparece aqui. */}
              {!temVencedor && (
                <p
                  className="text-[.7rem] tracking-[.15em] uppercase"
                  style={{ fontFamily: "var(--font-cinzel), serif", color: "var(--foil)" }}
                >
                  +<ContagemXp valor={resultado.xp_a} instantaneo={!!semMovimento} /> XP
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {fechado && (
        <motion.div
          className="space-y-3"
          initial={semMovimento ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
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
        </motion.div>
      )}
    </ArenaImpacto>
  );
}

function Lutador({ classe }: { classe: { icon: string; name: string } }) {
  return (
    <div className="text-center flex-1 min-w-0">
      <div className="wax-seal !w-12 !h-12 mx-auto text-xl mb-1">{classe.icon}</div>
      <p className="text-[.62rem] truncate" style={{ fontFamily: "var(--font-cinzel), serif" }}>
        {classe.name}
      </p>
    </div>
  );
}

/* As placas dos dois lados entram de cada borda e se encontram no meio: é o
   embate. O overshoot do spring é o impacto — por isso damping baixo. */
const variantesLinha: Variants = {
  oculta: { opacity: 0, y: 10 },
  visivel: { opacity: 1, y: 0, transition: { duration: 0.32, when: "beforeChildren" } },
};
const variantesValor = (origem: -1 | 1): Variants => ({
  oculta: { opacity: 0, x: origem * 18 },
  visivel: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 340, damping: 17 } },
});

function LinhaRodada({
  rodada,
  semMovimento,
  recuada,
}: {
  rodada: Rodada;
  semMovimento: boolean;
  /** Não decidiu a batalha: sai de foco quando o veredito fecha. */
  recuada: boolean;
}) {
  const { vencedor } = rodada;
  const selo = vencedor === "empate" ? "🤝" : vencedor === "a" ? "🏆" : "💀";

  /* O recuo é opacidade + escala, nunca remoção: a linha continua legível para
     quem quiser conferir o placar, só deixa de disputar a atenção. Sob
     prefers-reduced-motion a escala sai e resta o esmaecer. */
  const recuo = recuada
    ? semMovimento
      ? { opacity: 0.34 }
      : { opacity: 0.32, scale: 0.94, filter: "blur(0.4px)" }
    : { opacity: 1, scale: 1, filter: "blur(0px)" };

  return (
    <motion.li
      layout
      variants={variantesLinha}
      initial={semMovimento ? false : "oculta"}
      animate="visivel"
      style={{ transformOrigin: "50% 50%" }}
      className="flex items-center justify-between text-[.78rem] py-1.5 border-b border-[rgba(96,66,26,0.12)] last:border-0"
    >
      <motion.span
        style={{ fontFamily: "var(--font-cinzel), serif", color: "var(--ink-70)" }}
        animate={recuo}
        transition={RECUO}
      >
        {rodada.rotulo}
      </motion.span>
      <motion.span
        className="flex items-center gap-2 tabular-nums"
        animate={recuo}
        transition={RECUO}
      >
        <motion.span
          variants={semMovimento ? undefined : variantesValor(-1)}
          style={{ color: vencedor === "a" ? "var(--seal)" : "var(--ink-50)" }}
        >
          {rodada.valor_a}
        </motion.span>
        <span className="opacity-40">×</span>
        <motion.span
          variants={semMovimento ? undefined : variantesValor(1)}
          style={{ color: vencedor === "b" ? "var(--seal)" : "var(--ink-50)" }}
        >
          {rodada.valor_b}
        </motion.span>
        <motion.span
          className="w-4 text-center"
          initial={semMovimento ? false : { scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.26, type: "spring", stiffness: 320, damping: 14 }}
        >
          {selo}
        </motion.span>
      </motion.span>
    </motion.li>
  );
}

/* ── Consagração ───────────────────────────────────────────────────────
   O nome do vencedor e a divisão do XP, deslizando para o centro com peso.
   O halo é uma camada própria em vez de `textShadow` animado: cor em
   `var(--gold)` não interpola entre keyframes, mas a OPACIDADE de uma camada
   dourada fixa interpola sem problema — e ainda é composta na GPU. */
function Consagracao({
  nome,
  xpMeu,
  xpOponente,
  euVenci,
  semMovimento,
}: {
  nome: string;
  xpMeu: number;
  xpOponente: number;
  euVenci: boolean;
  semMovimento: boolean;
}) {
  return (
    <motion.div
      layout
      className="relative mb-5"
      initial={semMovimento ? false : { opacity: 0, y: 30, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={semMovimento ? { duration: 0.25 } : MOLA_PESADA}
    >
      {/* Brilho dourado: acende forte e recua para uma brasa. */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -inset-y-4"
        style={{
          background:
            "radial-gradient(50% 60% at 50% 50%, var(--gold) 0%, transparent 70%)",
          filter: "blur(14px)",
        }}
        initial={semMovimento ? false : { opacity: 0 }}
        animate={{ opacity: semMovimento ? 0.14 : [0, 0.5, 0.16] }}
        transition={{ duration: 1.1, times: [0, 0.28, 1], delay: 0.1 }}
      />

      <div className="relative">
        <p
          className="text-[.5rem] tracking-[.3em] uppercase mb-1"
          style={{ fontFamily: "var(--font-cinzel), serif", color: "var(--foil)" }}
        >
          {euVenci ? "A taverna ergue o seu nome" : "A taverna ergue o nome"}
        </p>
        <p
          className="text-[1.35rem] leading-tight truncate"
          style={{
            fontFamily: "var(--font-cinzel-decorative), serif",
            color: "var(--ink)",
            textShadow: "0 0 18px rgba(201,151,63,.45)",
          }}
        >
          {nome}
        </p>

        {/* A distribuição inteira, não só o meu lado: o duelo move os dois
            placares, e esconder metade faz o ranking parecer arbitrário. */}
        <div className="mt-3 flex items-center justify-center gap-4">
          <LinhaXp rotulo="Você" valor={xpMeu} destaque={euVenci} semMovimento={semMovimento} />
          <span className="text-[var(--ink-50)] opacity-50">·</span>
          <LinhaXp
            rotulo="Oponente"
            valor={xpOponente}
            destaque={!euVenci}
            semMovimento={semMovimento}
          />
        </div>
      </div>
    </motion.div>
  );
}

function LinhaXp({
  rotulo,
  valor,
  destaque,
  semMovimento,
}: {
  rotulo: string;
  valor: number;
  destaque: boolean;
  semMovimento: boolean;
}) {
  return (
    <span className="text-center">
      <span
        className="block text-[.95rem] tabular-nums"
        style={{
          fontFamily: "var(--font-cinzel-decorative), serif",
          color: destaque ? "var(--gold)" : "var(--ink-50)",
        }}
      >
        +<ContagemXp valor={valor} instantaneo={semMovimento} /> XP
      </span>
      <span
        className="block text-[.5rem] tracking-[.2em] uppercase text-[var(--foil)]"
        style={{ fontFamily: "var(--font-cinzel), serif" }}
      >
        {rotulo}
      </span>
    </span>
  );
}

/**
 * Contagem crescente do XP. Diferente do `CountUp` da home, que dispara ao
 * entrar na viewport: aqui o número já nasce visível, então a contagem começa
 * na montagem — que é exatamente quando o veredito aparece.
 */
function ContagemXp({ valor, instantaneo }: { valor: number; instantaneo: boolean }) {
  const spring = useSpring(0, { stiffness: 60, damping: 20 });
  const [exibido, setExibido] = useState(instantaneo ? valor : 0);

  useEffect(() => {
    if (!instantaneo) spring.set(valor);
  }, [valor, instantaneo, spring]);

  useMotionValueEvent(spring, "change", (v) => setExibido(Math.round(v)));

  return <>{instantaneo ? valor : exibido}</>;
}
