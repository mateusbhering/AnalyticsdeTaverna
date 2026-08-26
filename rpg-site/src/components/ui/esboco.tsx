/**
 * Esboço mágico — os espaços reservados enquanto o conteúdo não chega.
 *
 * A ideia é um pergaminho sendo revelado sob luz de vela, e não o "skeleton"
 * cinza da web moderna: cada traço é desenhado da esquerda para a direita como
 * tinta escorrendo, as pontas se esgarçam como pincel seco, e um clarão quente
 * atravessa devagar por cima. A pintura toda vive em `globals.css` (`.esboco`).
 *
 * Server Component de propósito: sem `"use client"`, sem motion, sem hidratação.
 * O esboço é justamente o que aparece ANTES de o JS chegar.
 *
 * Os atrasos são explícitos e nunca sorteados — isto renderiza no servidor, e
 * um `Math.random()` aqui daria um desenho no HTML e outro na hidratação.
 */

/** Um traço de tinta. `largura` aceita qualquer valor CSS (%, rem, px). */
export function Traco({
  largura = "100%",
  altura = 12,
  atraso = 0,
  className = "",
}: {
  largura?: string;
  altura?: number;
  atraso?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={`esboco block ${className}`}
      style={{ width: largura, height: altura, "--esboco-atraso": `${atraso}s` } as React.CSSProperties}
    />
  );
}

/** Mancha redonda: retrato, brasão ou lacre ainda por revelar. */
export function Selo({
  tamanho = 80,
  atraso = 0,
  className = "",
}: {
  tamanho?: number;
  atraso?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={`esboco-selo block ${className}`}
      style={{ width: tamanho, height: tamanho, "--esboco-atraso": `${atraso}s` } as React.CSSProperties}
    />
  );
}

/**
 * Uma linha do quadro de feitos por revelar: posto, nome, classe e feitos.
 *
 * As larguras variam por posição em vez de serem iguais — nomes de aventureiro
 * não têm todos o mesmo tamanho, e um esboço de linhas idênticas denuncia o
 * placeholder. O pódio recebe traços mais largos: quem está no topo ocupa mais
 * espaço no pergaminho.
 */
export function LinhaDoQuadro({ posicao }: { posicao: number }) {
  const podio = posicao <= 3;
  // Ondulação estável entre servidor e cliente: a largura vem da posição.
  const larguraNome = `${[72, 58, 66, 51, 62][(posicao - 1) % 5]}%`;
  const atraso = posicao * 0.09;

  return (
    <li className="grid grid-cols-[3rem_1fr_auto] sm:grid-cols-[4rem_1fr_10rem_5rem] items-center gap-3 border-b border-dashed border-[rgba(96,66,26,0.22)] py-4">
      <Traco largura={podio ? "2.1rem" : "1.4rem"} altura={podio ? 15 : 13} atraso={atraso} />
      <Traco largura={larguraNome} altura={podio ? 15 : 13} atraso={atraso + 0.06} />
      <Traco largura="72%" altura={12} atraso={atraso + 0.12} className="hidden sm:block" />
      <Traco largura="2.6rem" altura={13} atraso={atraso + 0.18} className="justify-self-end" />
    </li>
  );
}
