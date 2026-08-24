"use client";

import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  type Variants,
} from "motion/react";
import { byName } from "@/lib/classes";
import {
  pontoDeVistaDoDesafiante,
  type LadoBatalha,
  type ResultadoBatalha,
  type Rodada,
} from "@/lib/batalha-api";

/* ── Ritmo da encenação ────────────────────────────────────────────────
   As rodadas são reveladas UMA A UMA. O backend já devolveu tudo pronto: a
   espera aqui é dramaturgia, não latência. Revelar as três de uma vez entrega
   o placar antes de o jogador ler a primeira linha. */
const ATRASO_PRIMEIRA_MS = 500;
const INTERVALO_RODADA_MS = 1250;
const ATRASO_VEREDITO_MS = 700;

/** Emoji de cada atributo — os mesmos do card do personagem. */
const ÍCONES: Record<string, string> = {
  forca: "💪",
  inteligencia: "🧠",
  agilidade: "⚡",
  resistencia: "🛡️",
  carisma: "✨",
  sabedoria: "👁️",
  caos: "🌪️",
};

const ORDINAIS = ["1º", "2º", "3º"];

export default function ArenaDuelo({
  resultado,
  onNovoDuelo,
}: {
  resultado: ResultadoBatalha;
  onNovoDuelo: () => void;
}) {
  const semMovimento = useReducedMotion();

  /* Quantas rodadas já apareceram. `etapa > rodadas.length` = veredito no ar.

     Começa SEMPRE em 0, inclusive para quem pediu menos movimento. O servidor
     não sabe a preferência do aparelho: se o estado inicial dependesse dela, o
     HTML do servidor viria com o placar escondido e a primeira renderização do
     cliente com ele à mostra — erro de hidratação. Quem pediu menos movimento
     pula para o fim no efeito abaixo, que roda logo após a montagem. */
  const total = resultado.rodadas.length;
  const [etapa, setEtapa] = useState(0);

  useEffect(() => {
    if (etapa > total) return;

    /* Quem pediu menos movimento percorre as mesmas etapas com espera zero:
       chega ao resultado completo em alguns quadros, sem encenação. Zerar o
       relógio (em vez de pular o estado direto) mantém um caminho de código só
       e evita mexer no estado durante o efeito. */
    const espera = semMovimento
      ? 0
      : etapa === 0
        ? ATRASO_PRIMEIRA_MS
        : etapa === total
          ? ATRASO_VEREDITO_MS
          : INTERVALO_RODADA_MS;

    const id = setTimeout(() => setEtapa((e) => e + 1), espera);
    return () => clearTimeout(id);
  }, [etapa, total, semMovimento]);

  const vereditoNoAr = etapa > total;
  const pontoDeVista = pontoDeVistaDoDesafiante(resultado);

  return (
    <div className="space-y-5">
      <Lutadores
        desafiante={resultado.desafiante}
        oponente={resultado.oponente}
        vitoriasA={resultado.vitorias_a}
        vitoriasB={resultado.vitorias_b}
        revelarPlacar={vereditoNoAr}
      />

      <div className="paper-card paper-frame arcane-corners p-5 sm:p-7">
        <span className="ac-bl" />
        <span className="ac-br" />

        <div className="text-center mb-5">
          <span
            className="section-eyebrow"
            style={{
              fontSize: ".6rem",
              letterSpacing: ".35em",
              color: "var(--seal)",
              opacity: 0.9,
              marginBottom: "6px",
            }}
          >
            O Embate
          </span>
          <p className="text-[.78rem] italic text-[var(--ink-50)] max-w-[19rem] mx-auto leading-relaxed">
            Cada um entra com os seus três maiores atributos. O maior de um
            enfrenta o maior do outro — e assim por diante.
          </p>
        </div>

        <ol className="space-y-3" aria-live="polite">
          {resultado.rodadas.map((rodada, i) =>
            etapa > i ? (
              <LinhaRodada
                key={rodada.posicao}
                rodada={rodada}
                indice={i}
                semMovimento={!!semMovimento}
              />
            ) : null,
          )}
        </ol>
      </div>

      <AnimatePresence>
        {vereditoNoAr && (
          <Veredito
            key="veredito"
            resultado={resultado}
            pontoDeVista={pontoDeVista}
            semMovimento={!!semMovimento}
            onNovoDuelo={onNovoDuelo}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Os dois retratos e o placar de rodadas ─────────────────────────── */

function Lutadores({
  desafiante,
  oponente,
  vitoriasA,
  vitoriasB,
  revelarPlacar,
}: {
  desafiante: LadoBatalha | null;
  oponente: LadoBatalha | null;
  vitoriasA: number;
  vitoriasB: number;
  revelarPlacar: boolean;
}) {
  return (
    <div className="paper-card paper-frame arcane-corners p-5">
      <span className="ac-bl" />
      <span className="ac-br" />
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <Retrato lado={desafiante} etiqueta="Você" origem="esquerda" />

        <div className="text-center px-1">
          <motion.div
            className="text-[1.6rem] leading-none"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.15 }}
          >
            ⚔
          </motion.div>
          <div
            className="mt-2 text-[1.05rem] text-[var(--ink)] tabular-nums"
            style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
          >
            {revelarPlacar ? `${vitoriasA} – ${vitoriasB}` : "— –—"}
          </div>
          <div
            className="text-[.45rem] tracking-[.2em] uppercase text-[var(--foil)] mt-0.5"
            style={{ fontFamily: "var(--font-cinzel), serif" }}
          >
            Rodadas
          </div>
        </div>

        <Retrato lado={oponente} etiqueta="Oponente" origem="direita" />
      </div>
    </div>
  );
}

function Retrato({
  lado,
  etiqueta,
  origem,
}: {
  lado: LadoBatalha | null;
  etiqueta: string;
  origem: "esquerda" | "direita";
}) {
  const classe = byName(lado?.classe ?? "");
  const retrato = lado?.foto_url ?? classe.photo;

  /* Duas quedas possíveis: o avatar gerado some do Storage e a ilustração da
     classe não está publicada. Na segunda, cai no emoji da classe — um ícone
     de imagem quebrada ao lado do nome do oponente estraga o duelo inteiro. */
  const [semImagem, setSemImagem] = useState(false);

  /* Primeira falha: tenta a ilustração da classe. Segunda: desiste e mostra o
     emoji. `dataset.fb` marca a tentativa no próprio elemento — sobrevive ao
     re-render sem virar mais um estado. */
  const aoFalhar = (img: HTMLImageElement) => {
    if (img.dataset.fb !== "1" && retrato !== classe.photo) {
      img.dataset.fb = "1";
      img.src = classe.photo;
    } else {
      setSemImagem(true);
    }
  };

  return (
    <motion.div
      className="text-center min-w-0"
      initial={{ opacity: 0, x: origem === "esquerda" ? -28 : 28 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      {semImagem ? (
        <div
          className="w-16 h-16 sm:w-20 sm:h-20 mx-auto flex items-center justify-center text-[1.9rem] border border-[rgba(96,66,26,0.45)] bg-[rgba(96,66,26,0.12)] shadow-[0_3px_8px_rgba(0,0,0,0.32)]"
          role="img"
          aria-label={classe.name}
        >
          {classe.icon}
        </div>
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={retrato}
          alt={classe.name}
          className="w-16 h-16 sm:w-20 sm:h-20 object-cover mx-auto border border-[rgba(96,66,26,0.45)] shadow-[0_3px_8px_rgba(0,0,0,0.32)]"
          /* O `onError` sozinho não basta: a tag vem no HTML do servidor e o
             navegador já tenta baixar durante o parse. Se falhar antes da
             hidratação, o evento acontece sem React escutando e o ícone de
             imagem quebrada fica na tela. O ref confere o estado final assim
             que o elemento existe — `complete` com `naturalWidth` 0 é
             exatamente "tentou e não veio". */
          ref={(img) => {
            if (img?.complete && img.naturalWidth === 0) aoFalhar(img);
          }}
          onError={(e) => aoFalhar(e.currentTarget)}
        />
      )}
      <div
        className="text-[.45rem] tracking-[.2em] uppercase text-[var(--foil)] mt-2"
        style={{ fontFamily: "var(--font-cinzel), serif" }}
      >
        {etiqueta}
      </div>
      <div
        className="text-[.72rem] text-[var(--ink)] truncate"
        style={{ fontFamily: "var(--font-cinzel), serif" }}
        title={lado?.nome ?? classe.name}
      >
        {lado?.nome ?? classe.name}
      </div>
    </motion.div>
  );
}

/* ── Uma rodada ─────────────────────────────────────────────────────── */

const variantesRodada: Variants = {
  oculta: { opacity: 0, y: 14 },
  visivel: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut", when: "beforeChildren" },
  },
};

/* As duas placas entram uma de cada lado e se encontram no meio: é o "embate".
   O overshoot do spring é o impacto — por isso damping baixo. */
const variantesPlaca = (origem: -1 | 1): Variants => ({
  oculta: { opacity: 0, x: origem * 34 },
  visivel: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 320, damping: 17 },
  },
});

function LinhaRodada({
  rodada,
  indice,
  semMovimento,
}: {
  rodada: Rodada;
  indice: number;
  semMovimento: boolean;
}) {
  const venceuA = rodada.resultado === "a";
  const venceuB = rodada.resultado === "b";

  return (
    <motion.li
      variants={variantesRodada}
      initial={semMovimento ? false : "oculta"}
      animate="visivel"
      className="border border-[rgba(96,66,26,0.28)] bg-[rgba(238,221,179,0.4)] px-3 py-2.5"
    >
      <div
        className="text-[.45rem] tracking-[.25em] uppercase text-[var(--foil)] text-center mb-1.5"
        style={{ fontFamily: "var(--font-cinzel), serif" }}
      >
        {ORDINAIS[indice]} maior atributo
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <Placa
          rotulo={rodada.rotulo_a}
          atributo={rodada.atributo_a}
          valor={rodada.valor_a}
          venceu={venceuA}
          perdeu={venceuB}
          origem={-1}
          alinhamento="text-left"
          semMovimento={semMovimento}
        />

        <motion.span
          className="text-[.6rem] text-[var(--ink-50)]"
          style={{ fontFamily: "var(--font-cinzel), serif" }}
          initial={semMovimento ? false : { scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.12, type: "spring", stiffness: 300, damping: 15 }}
        >
          ×
        </motion.span>

        <Placa
          rotulo={rodada.rotulo_b}
          atributo={rodada.atributo_b}
          valor={rodada.valor_b}
          venceu={venceuB}
          perdeu={venceuA}
          origem={1}
          alinhamento="text-right"
          semMovimento={semMovimento}
        />
      </div>

      <div
        className="text-center text-[.5rem] tracking-[.18em] uppercase mt-1.5"
        style={{
          fontFamily: "var(--font-cinzel), serif",
          color: rodada.resultado === "empate" ? "var(--ink-50)" : "var(--seal)",
        }}
      >
        {rodada.resultado === "empate"
          ? "Empate"
          : `+1 ${venceuA ? "para você" : "para o oponente"}`}
      </div>
    </motion.li>
  );
}

function Placa({
  rotulo,
  atributo,
  valor,
  venceu,
  perdeu,
  origem,
  alinhamento,
  semMovimento,
}: {
  rotulo: string;
  atributo: string;
  valor: number;
  venceu: boolean;
  perdeu: boolean;
  origem: -1 | 1;
  alinhamento: "text-left" | "text-right";
  semMovimento: boolean;
}) {
  return (
    <motion.div
      variants={semMovimento ? undefined : variantesPlaca(origem)}
      className={`min-w-0 ${alinhamento}`}
      style={{ opacity: perdeu ? 0.5 : 1 }}
    >
      <div
        className="text-[.55rem] tracking-[.12em] uppercase text-[var(--ink-50)] truncate"
        style={{ fontFamily: "var(--font-cinzel), serif" }}
      >
        <span aria-hidden="true">{ÍCONES[atributo] ?? "◆"}</span> {rotulo}
      </div>
      <motion.div
        className="text-[1.35rem] leading-tight tabular-nums"
        style={{
          fontFamily: "var(--font-cinzel-decorative), serif",
          color: venceu ? "var(--seal)" : "var(--ink)",
        }}
        /* O vencedor da rodada dá um "pulso" logo depois do impacto das placas. */
        animate={venceu && !semMovimento ? { scale: [1, 1.16, 1] } : undefined}
        transition={{ delay: 0.3, duration: 0.42 }}
      >
        {valor}
      </motion.div>
    </motion.div>
  );
}

/* ── Veredito e contagem de XP ──────────────────────────────────────── */

const COPY = {
  vitoria: { titulo: "Vitória", selo: "🏆", nota: "A taverna ergue as canecas." },
  derrota: { titulo: "Derrota", selo: "🥀", nota: "Ainda há XP em cada queda." },
  empate: { titulo: "Empate", selo: "⚖️", nota: "Nenhum dos dois cedeu." },
} as const;

function Veredito({
  resultado,
  pontoDeVista,
  semMovimento,
  onNovoDuelo,
}: {
  resultado: ResultadoBatalha;
  pontoDeVista: "vitoria" | "derrota" | "empate";
  semMovimento: boolean;
  onNovoDuelo: () => void;
}) {
  const copy = COPY[pontoDeVista];

  return (
    <motion.div
      initial={semMovimento ? false : { opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="space-y-4"
    >
      <div className="paper-card paper-frame arcane-corners p-6 text-center">
        <span className="ac-bl" />
        <span className="ac-br" />

        <motion.div
          className="wax-seal !w-16 !h-16 mx-auto text-3xl mb-4"
          initial={semMovimento ? false : { scale: 0, rotate: -25 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 240, damping: 13, delay: 0.1 }}
        >
          {copy.selo}
        </motion.div>

        <h2
          className="text-[1.6rem] text-[var(--seal)] mb-1"
          style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
        >
          {copy.titulo}
        </h2>
        <p className="text-[.8rem] italic text-[var(--ink-50)] mb-4">{copy.nota}</p>

        <div className="divider !my-4" />

        <div
          className="text-[.5rem] tracking-[.25em] uppercase text-[var(--foil)] mb-1"
          style={{ fontFamily: "var(--font-cinzel), serif" }}
        >
          XP conquistado
        </div>
        <div
          className="text-[2.6rem] leading-none gold-grad tabular-nums"
          style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
        >
          +<ContagemXp valor={resultado.xp_a} instantaneo={semMovimento} />
        </div>

        <p className="text-[.85rem] italic leading-relaxed mt-5 max-w-xs mx-auto">
          {resultado.narrativa}
        </p>
      </div>

      <div className="space-y-3">
        <button
          onClick={onNovoDuelo}
          className="press btn-seal block w-full py-4 text-[.75rem] tracking-[.12em] uppercase cursor-pointer"
          style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
        >
          ⚔ Desafiar outro aventureiro
        </button>
        <a
          href="/ranking"
          className="press btn-parchment block w-full py-3.5 text-center text-[.72rem] tracking-[.12em] uppercase"
          style={{ fontFamily: "var(--font-cinzel), serif" }}
        >
          🏅 Ver o ranking
        </a>
      </div>
    </motion.div>
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
