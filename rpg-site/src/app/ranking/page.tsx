import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Beer } from "lucide-react";

export const metadata: Metadata = {
  title: "Ranking Global — Analytics de Taverna",
  description:
    "O quadro de feitos da taverna: os aventureiros que mais se destacaram em suas jornadas.",
};

/* Colunas do quadro. Ainda não há dados — o ranking será ligado ao Supabase
   depois; por ora a página mostra só a estrutura e os lugares vagos. */
const COLUNAS = ["Posto", "Aventureiro", "Classe", "Feitos"];

/** Lugares vagos do pódio — desenham a forma do quadro enquanto ninguém pontuou. */
const VAGOS = [
  { posto: "I", medalha: "🥇" },
  { posto: "II", medalha: "🥈" },
  { posto: "III", medalha: "🥉" },
  { posto: "IV", medalha: "" },
  { posto: "V", medalha: "" },
];

/* Canecas nas prateleiras laterais, como no quadro pendurado da taverna. */
const CANECAS_ESQ = ["🍷", "🫖", "☕", "🍶", "🍸"];
const CANECAS_DIR = ["🍺", "🧃", "🍹", "🥂", "🧉"];

export default function RankingPage() {
  return (
    <div className="plank-wall min-h-screen relative overflow-hidden px-4 py-14 sm:py-20">
      <div className="relative mx-auto w-full max-w-3xl">
        <Prateleiras lado="esquerda" canecas={CANECAS_ESQ} />
        <Prateleiras lado="direita" canecas={CANECAS_DIR} />

        {/* Rolete de cima */}
        <div className="scroll-rod mx-2" />

        <div className="wood-frame relative mx-6 -mt-1">
          <Florao pos="tl" />
          <Florao pos="tr" />
          <Florao pos="bl" />
          <Florao pos="br" />
          <div className="scroll-sheet px-5 pt-16 pb-10 sm:px-10 sm:pt-20 sm:pb-14">
            {/* Faixa dourada pendurada sobre o topo do papel */}
            <div className="absolute left-1/2 -top-2 -translate-x-1/2 z-10">
              <div className="tavern-banner">
                <span className="banner-tail left" />
                <span className="banner-tail right" />
                <h1
                  className="relative whitespace-nowrap text-[1rem] sm:text-[1.35rem] font-bold tracking-[.16em] uppercase"
                  style={{
                    fontFamily: "var(--font-cinzel-decorative), serif",
                    textShadow: "0 1px 0 rgba(255,240,205,.55)",
                  }}
                >
                  Ranking Global
                </h1>
              </div>
            </div>

            <p
              className="text-center text-[.72rem] sm:text-[.8rem] font-semibold tracking-[.28em] uppercase text-[rgba(60,42,24,0.7)]"
              style={{ fontFamily: "var(--font-cinzel), serif" }}
            >
              Quadro de feitos da taverna
            </p>

            {/* Cabeçalho das colunas */}
            <div
              className="mt-8 grid grid-cols-[3rem_1fr_auto] sm:grid-cols-[4rem_1fr_10rem_5rem] gap-3 border-b border-[rgba(96,66,26,0.4)] pb-3 text-[.68rem] sm:text-[.78rem] font-bold tracking-[.2em] uppercase text-[rgba(60,42,24,0.85)]"
              style={{ fontFamily: "var(--font-cinzel), serif" }}
            >
              <span>{COLUNAS[0]}</span>
              <span>{COLUNAS[1]}</span>
              <span className="hidden sm:block">{COLUNAS[2]}</span>
              <span className="text-right">{COLUNAS[3]}</span>
            </div>

            {/* Lugares vagos */}
            <ul>
              {VAGOS.map((v) => (
                <li
                  key={v.posto}
                  className="grid grid-cols-[3rem_1fr_auto] sm:grid-cols-[4rem_1fr_10rem_5rem] items-center gap-3 border-b border-dashed border-[rgba(96,66,26,0.22)] py-4"
                >
                  <span
                    className="flex items-center gap-1.5 text-[1rem] sm:text-[1.1rem] font-bold text-[rgba(60,42,24,0.75)]"
                    style={{ fontFamily: "var(--font-cinzel), serif" }}
                  >
                    {v.medalha && <span aria-hidden>{v.medalha}</span>}
                    {v.posto}
                  </span>
                  <span className="italic text-[1.05rem] sm:text-[1.15rem] font-semibold text-[rgba(60,42,24,0.5)]">
                    lugar vago
                  </span>
                  <span className="hidden sm:block text-[1.1rem] font-semibold text-[rgba(60,42,24,0.38)]">—</span>
                  <span className="text-right text-[1.1rem] font-semibold text-[rgba(60,42,24,0.38)]">—</span>
                </li>
              ))}
            </ul>

            {/* Estado vazio */}
            <div className="mt-10 text-center">
              <div className="wax-seal mx-auto mb-5" aria-hidden>
                <Beer size={24} strokeWidth={1.5} />
              </div>
              <h2
                className="text-balance text-2xl sm:text-3xl font-bold text-[rgba(60,42,24,0.92)]"
                style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
              >
                O pergaminho ainda está em branco
              </h2>
              <p className="mx-auto mt-4 max-w-md text-balance text-[1.05rem] sm:text-[1.15rem] font-semibold italic text-[rgba(60,42,24,0.72)]">
                Nenhum feito foi cantado até agora. Assim que as primeiras
                jornadas forem registradas, os nomes aparecerão aqui.
              </p>

              <Link
                href="/jogar"
                className="press btn-seal mt-7 inline-block whitespace-nowrap px-6 sm:px-8 py-3.5 text-[.72rem] sm:text-[.8rem] font-bold tracking-[.12em] sm:tracking-[.18em] uppercase"
                style={{ fontFamily: "var(--font-cinzel), serif", borderWidth: "1px" }}
              >
                ⚔️ Iniciar jornada
              </Link>
            </div>
          </div>
        </div>

        {/* Rolete de baixo */}
        <div className="scroll-rod mx-2 -mt-1" />

        <div className="mt-10 flex flex-col items-center gap-5">
          <Link href="/" className="inline-flex">
            <Image
              src="/logo.png"
              alt="Analytics de Taverna"
              width={56}
              height={56}
              className="drop-shadow-[0_0_18px_rgba(255,176,80,0.45)]"
            />
          </Link>
          <Link
            href="/"
            className="text-[.78rem] font-semibold tracking-[.18em] uppercase text-[rgba(230,188,106,0.7)] transition-colors hover:text-[var(--gold-light)]"
            style={{ fontFamily: "var(--font-cinzel), serif" }}
          >
            ← Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}

/** Florão de quatro pétalas: o ornamento dourado nos cantos da moldura. */
function Florao({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  return (
    <svg
      className={`frame-flower ${pos}`}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 1.6c1.8 2.4 2.7 4.3 2.7 6 0 .9-.3 1.8-.8 2.5.7-.5 1.6-.8 2.5-.8 1.7 0 3.6.9 6 2.7-2.4 1.8-4.3 2.7-6 2.7-.9 0-1.8-.3-2.5-.8.5.7.8 1.6.8 2.5 0 1.7-.9 3.6-2.7 6-1.8-2.4-2.7-4.3-2.7-6 0-.9.3-1.8.8-2.5-.7.5-1.6.8-2.5.8-1.7 0-3.6-.9-6-2.7 2.4-1.8 4.3-2.7 6-2.7.9 0 1.8.3 2.5.8-.5-.7-.8-1.6-.8-2.5 0-1.7.9-3.6 2.7-6Z" />
      <circle cx="12" cy="12" r="2.2" fill="#7c5316" />
    </svg>
  );
}

/** Prateleirinhas de canecas que ladeiam o quadro (só em telas largas). */
function Prateleiras({
  lado,
  canecas,
}: {
  lado: "esquerda" | "direita";
  canecas: string[];
}) {
  return (
    <div
      aria-hidden
      className={`absolute top-10 bottom-16 hidden xl:flex flex-col justify-between ${
        lado === "esquerda" ? "-left-32" : "-right-32"
      }`}
    >
      {canecas.map((c, i) => (
        <div key={i} className="flex flex-col items-center">
          <span className="text-2xl drop-shadow-[0_3px_6px_rgba(0,0,0,0.55)]">{c}</span>
          <div className="tavern-shelf mt-1" />
        </div>
      ))}
    </div>
  );
}
