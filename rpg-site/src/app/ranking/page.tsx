import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Beer } from "lucide-react";
import { byName } from "@/lib/classes";
import { getRanking, type ItemRanking } from "@/lib/ranking";

/**
 * Renderiza a cada visita, em vez de virar HTML fixo no build.
 *
 * Sem isto o Next prerenderiza o quadro durante o build — e o build não
 * alcança o backend (na Vercel a Render pode estar hibernando, ou a rede do
 * builder simplesmente não vai até lá). O resultado seria publicar a tela de
 * "a tinta borrou" congelada e servi-la aos primeiros visitantes mesmo com a
 * API de pé.
 *
 * Não é um convite a martelar o FastAPI: quem segura a carga é o
 * `unstable_cache` dentro de `getRanking`, que guarda a resposta por 60s e cai
 * na hora quando um duelo termina. A página é dinâmica; os dados, cacheados.
 *
 * `dynamic` continua valendo porque o projeto está no modelo de cache
 * anterior — ele só deixa de existir com `cacheComponents` ligado.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ranking Global — Analytics de Taverna",
  description:
    "O quadro de feitos da taverna: os aventureiros que mais se destacaram em suas jornadas.",
};

/* Colunas do quadro. Os dados vêm do `GET /ranking` do FastAPI (lib/ranking.ts). */
const COLUNAS = ["Posto", "Aventureiro", "Classe", "Feitos"];

/** Numeral romano do posto — o quadro é de taverna, não planilha. */
const ROMANOS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
function romano(posicao: number): string {
  return ROMANOS[posicao - 1] ?? String(posicao);
}

/** Só o pódio ganha medalha; do quarto em diante, o número basta. */
const MEDALHAS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

/** Lugares vagos — desenham a forma do quadro enquanto ninguém pontuou. */
const VAGOS = [1, 2, 3, 4, 5];

/* Canecas nas prateleiras laterais, como no quadro pendurado da taverna. */
const CANECAS_ESQ = ["🍷", "🫖", "☕", "🍶", "🍸"];
const CANECAS_DIR = ["🍺", "🧃", "🍹", "🥂", "🧉"];

export default async function RankingPage() {
  /* Buscado no servidor, como o dashboard: o navegador recebe as linhas
     prontas e nenhuma credencial. O cache cai quando um duelo termina
     (lib/ranking-actions.ts). */
  const ranking = await getRanking();

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

            {ranking.estado === "ok" ? (
              <ul>
                {ranking.itens.map((item) => (
                  <Linha key={item.id} item={item} />
                ))}
              </ul>
            ) : (
              <>
                <ul aria-hidden>
                  {VAGOS.map((posto) => (
                    <LinhaVaga key={posto} posto={posto} />
                  ))}
                </ul>
                {ranking.estado === "erro" ? <QuadroIlegivel /> : <QuadroEmBranco />}
              </>
            )}
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

/** Uma linha do quadro, com os dados que vieram da API. */
function Linha({ item }: { item: ItemRanking }) {
  const classe = byName(item.classe ?? "");
  const medalha = MEDALHAS[item.posicao];

  /* Nem todo mundo digita o nome no quiz. Repetir a classe aqui — que já ocupa
     a coluna ao lado — faz a linha parecer defeito, então quem não se
     identificou entra como anônimo mesmo, em itálico para não passar por nome
     próprio de alguém. */
  const nome = item.nome?.trim();

  return (
    <li className="grid grid-cols-[3rem_1fr_auto] sm:grid-cols-[4rem_1fr_10rem_5rem] items-center gap-3 border-b border-dashed border-[rgba(96,66,26,0.22)] py-4">
      <span
        className="flex items-center gap-1.5 text-[1rem] sm:text-[1.1rem] font-bold text-[rgba(60,42,24,0.75)]"
        style={{ fontFamily: "var(--font-cinzel), serif" }}
      >
        {medalha && <span aria-hidden>{medalha}</span>}
        {romano(item.posicao)}
      </span>

      <span className="flex min-w-0 items-center gap-2">
        <span aria-hidden className="shrink-0 text-[1.15rem]">
          {classe.icon}
        </span>
        <span className="min-w-0">
          <span
            className={`block truncate text-[1.05rem] sm:text-[1.15rem] font-semibold ${
              nome ? "text-[rgba(60,42,24,0.92)]" : "italic text-[rgba(60,42,24,0.6)]"
            }`}
          >
            {nome ?? "aventureiro sem nome"}
          </span>
          {/* Em telas estreitas a coluna Classe some; aqui ela vira legenda. */}
          <span className="block truncate text-[.8rem] italic text-[rgba(60,42,24,0.55)] sm:hidden">
            {classe.name}
          </span>
        </span>
      </span>

      <span className="hidden min-w-0 sm:block truncate text-[1.05rem] font-semibold text-[rgba(60,42,24,0.7)]">
        {classe.name}
      </span>

      <span className="text-right">
        <span
          className="block text-[1.15rem] font-bold text-[rgba(60,42,24,0.92)] tabular-nums"
          style={{ fontFamily: "var(--font-cinzel), serif" }}
        >
          {item.xp}
        </span>
        <span className="block text-[.65rem] tracking-[.12em] uppercase text-[rgba(60,42,24,0.5)]">
          {item.total_batalhas > 0
            ? `${item.vitorias}V · ${item.derrotas}D · ${item.empates}E`
            : "sem duelos"}
        </span>
      </span>
    </li>
  );
}

/** Linha fantasma: mantém a forma do quadro quando não há o que mostrar. */
function LinhaVaga({ posto }: { posto: number }) {
  return (
    <li className="grid grid-cols-[3rem_1fr_auto] sm:grid-cols-[4rem_1fr_10rem_5rem] items-center gap-3 border-b border-dashed border-[rgba(96,66,26,0.22)] py-4">
      <span
        className="flex items-center gap-1.5 text-[1rem] sm:text-[1.1rem] font-bold text-[rgba(60,42,24,0.75)]"
        style={{ fontFamily: "var(--font-cinzel), serif" }}
      >
        {MEDALHAS[posto] && <span aria-hidden>{MEDALHAS[posto]}</span>}
        {romano(posto)}
      </span>
      <span className="italic text-[1.05rem] sm:text-[1.15rem] font-semibold text-[rgba(60,42,24,0.5)]">
        lugar vago
      </span>
      <span className="hidden sm:block text-[1.1rem] font-semibold text-[rgba(60,42,24,0.38)]">—</span>
      <span className="text-right text-[1.1rem] font-semibold text-[rgba(60,42,24,0.38)]">—</span>
    </li>
  );
}

/** Moldura comum dos dois avisos do rodapé do pergaminho. */
function Aviso({
  icone,
  titulo,
  children,
  acao,
}: {
  icone: React.ReactNode;
  titulo: string;
  children: React.ReactNode;
  acao: { href: string; texto: string };
}) {
  return (
    <div className="mt-10 text-center">
      <div className="wax-seal mx-auto mb-5" aria-hidden>
        {icone}
      </div>
      <h2
        className="text-balance text-2xl sm:text-3xl font-bold text-[rgba(60,42,24,0.92)]"
        style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
      >
        {titulo}
      </h2>
      <p className="mx-auto mt-4 max-w-md text-balance text-[1.05rem] sm:text-[1.15rem] font-semibold italic text-[rgba(60,42,24,0.72)]">
        {children}
      </p>
      <Link
        href={acao.href}
        className="press btn-seal mt-7 inline-block whitespace-nowrap px-6 sm:px-8 py-3.5 text-[.72rem] sm:text-[.8rem] font-bold tracking-[.12em] sm:tracking-[.18em] uppercase"
        style={{ fontFamily: "var(--font-cinzel), serif", borderWidth: "1px" }}
      >
        {acao.texto}
      </Link>
    </div>
  );
}

/** Ninguém pontuou ainda — o banco respondeu, e respondeu vazio. */
function QuadroEmBranco() {
  return (
    <Aviso
      icone={<Beer size={24} strokeWidth={1.5} />}
      titulo="O pergaminho ainda está em branco"
      acao={{ href: "/jogar", texto: "⚔️ Iniciar jornada" }}
    >
      Nenhum feito foi cantado até agora. Assim que as primeiras jornadas forem
      registradas, os nomes aparecerão aqui.
    </Aviso>
  );
}

/**
 * A API não respondeu.
 *
 * O texto diz que o problema é NOSSO. Reaproveitar aqui o "pergaminho em
 * branco" seria cômodo e mentiroso: anunciaria taverna vazia toda vez que o
 * backend hibernasse, e quem acabou de vencer um duelo veria o próprio feito
 * sumir do quadro.
 */
function QuadroIlegivel() {
  return (
    <Aviso
      icone={<Beer size={24} strokeWidth={1.5} />}
      titulo="A tinta borrou no pergaminho"
      acao={{ href: "/ranking", texto: "🕯️ Tentar ler de novo" }}
    >
      O escriba da taverna não conseguiu ler o quadro de feitos agora. Os
      nomes continuam gravados — volte em alguns instantes.
    </Aviso>
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
