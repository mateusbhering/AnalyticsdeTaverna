import { Suspense } from "react";
import Image from "next/image";
import PersonagemCard from "./PersonagemCard";
import CtaVisitante from "./CtaVisitante";
import { Selo, Traco } from "@/components/ui/esboco";

export default function PersonagemPage() {
  return (
    <div
      className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-16"
      style={{
        background:
          "radial-gradient(60% 40% at 50% 0%, rgba(255,176,80,.13) 0%, transparent 70%), url('/textures/dark-wood.png'), linear-gradient(180deg, #2a180a 0%, #170d06 90%)",
      }}
    >
      <div className="relative w-full max-w-sm">
        <div className="flex justify-center mb-10">
          <a href="/">
            <Image
              src="/logo.png"
              alt="Analytics de Taverna"
              width={72}
              height={72}
              className="ritual-glow"
            />
          </a>
        </div>

        <Suspense fallback={<CardSkeleton />}>
          <PersonagemCard />
        </Suspense>

        <div className="text-center mt-8 space-y-4">
          <Suspense fallback={null}>
            <CtaVisitante />
          </Suspense>
          <a
            href="/"
            className="block text-[rgba(230,188,106,0.55)] hover:text-[var(--gold-light)] text-[.7rem] tracking-[.15em] uppercase transition-colors"
            style={{ fontFamily: "var(--font-cinzel), serif" }}
          >
            ← Voltar ao início
          </a>
        </div>
      </div>
    </div>
  );
}

/**
 * O card ainda por revelar.
 *
 * Segue a ordem em que o card real se lê — lacre, nome da classe, descrição,
 * retrato, atributos — com atrasos crescentes, então o pergaminho parece estar
 * sendo escrito de cima para baixo em vez de piscar inteiro de uma vez.
 */
function CardSkeleton() {
  return (
    <div className="paper-card paper-frame arcane-corners p-8">
      <span className="ac-bl" /><span className="ac-br" />
      <div className="flex flex-col items-center gap-4">
        <Selo tamanho={64} />

        {/* Nome da classe */}
        <Traco largura="11rem" altura={19} atraso={0.1} />

        {/* Descrição: duas linhas, a segunda mais curta — como texto corrido
            que termina no meio da medida. */}
        <div className="flex w-full flex-col items-center gap-2">
          <Traco largura="86%" altura={11} atraso={0.18} />
          <Traco largura="62%" altura={11} atraso={0.24} />
        </div>

        {/* Retrato */}
        <div
          aria-hidden
          className="esboco mt-2 w-40 h-40 border border-[rgba(96,66,26,0.35)]"
          style={{ "--esboco-atraso": "0.3s" } as React.CSSProperties}
        />

        <div className="divider !my-4 w-full" />

        {/* Os quatro atributos do rodapé */}
        <div className="grid w-full grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <Traco largura="1.8rem" altura={15} atraso={0.4 + i * 0.05} />
              <Traco largura="2.6rem" altura={8} atraso={0.44 + i * 0.05} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
