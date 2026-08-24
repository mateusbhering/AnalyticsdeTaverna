/**
 * Estado de carregamento do quadro.
 *
 * A busca do ranking acontece no servidor, então o Next mostra isto enquanto a
 * página transmite. Vale a pena: quando o backend está hibernando na Render, a
 * primeira leitura demora — sem este passo a navegação ficaria parada na
 * página anterior, sem sinal nenhum de que algo está acontecendo.
 *
 * A moldura é a mesma da página pronta (roletes, madeira, pergaminho) para o
 * conteúdo real entrar no lugar sem a página saltar.
 */
export default function CarregandoRanking() {
  return (
    <div className="plank-wall min-h-screen relative overflow-hidden px-4 py-14 sm:py-20">
      <div className="relative mx-auto w-full max-w-3xl">
        <div className="scroll-rod mx-2" />

        <div className="wood-frame relative mx-6 -mt-1">
          <div className="scroll-sheet px-5 pt-16 pb-10 sm:px-10 sm:pt-20 sm:pb-14">
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
              Consultando o quadro de feitos…
            </p>

            {/* Linhas fantasmas pulsando: a forma do quadro antes do conteúdo. */}
            <div className="mt-8 border-b border-[rgba(96,66,26,0.4)] pb-3">
              <div className="h-3 w-40 bg-[rgba(96,66,26,0.18)]" />
            </div>
            <ul className="animate-pulse" aria-hidden>
              {[1, 2, 3, 4, 5].map((i) => (
                <li
                  key={i}
                  className="grid grid-cols-[3rem_1fr_auto] sm:grid-cols-[4rem_1fr_10rem_5rem] items-center gap-3 border-b border-dashed border-[rgba(96,66,26,0.22)] py-5"
                >
                  <div className="h-4 w-6 bg-[rgba(96,66,26,0.16)]" />
                  <div className="h-4 w-40 bg-[rgba(96,66,26,0.16)]" />
                  <div className="hidden sm:block h-4 w-28 bg-[rgba(96,66,26,0.12)]" />
                  <div className="h-4 w-10 justify-self-end bg-[rgba(96,66,26,0.12)]" />
                </li>
              ))}
            </ul>

            <p className="sr-only" role="status">
              Carregando o ranking global.
            </p>
          </div>
        </div>

        <div className="scroll-rod mx-2 -mt-1" />
      </div>
    </div>
  );
}
