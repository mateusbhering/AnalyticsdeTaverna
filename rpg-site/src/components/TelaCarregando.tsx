/**
 * Tela cheia de carregamento do duelo — a cena de pixel art do protótipo.
 *
 * Componente burro de propósito: só desenha. Quem decide quando aparece e por
 * quanto tempo é o DesafioScanner, que precisa cruzar o tempo mínimo de
 * exibição com a chegada do oponente do banco.
 *
 * O fundo entra como `background-image`, e não via next/image: o otimizador
 * reencodava a arte para 127px de largura a q=75, o que numa pixel art
 * full-bleed só destrói detalhe — não há ganho de banda que compense.
 *
 * ATENÇÃO — `carregando.png` é provisório: é o próprio frame do Figma, a 392px
 * de largura e com o brasão e a barra já embutidos na arte. Serve para ver a
 * tela de pé, mas fica mole num celular 3x. Quando sair a exportação limpa (a
 * cena sem o brasão e sem a barra, em 2x ou 3x), é só trocar o arquivo — e aí
 * o brasão vira um <Image> de verdade aqui em cima.
 */

/* Medidas tiradas do frame do protótipo (396x852):
   barra de 7,8% a 90,9% da largura, 11px de altura, base a 7,6% do rodapé;
   preenchimento #ddd7b6 sobre trilho #4c334a; texto a 94,1% da altura. */
const BARRA_LARGURA = "83.1%";
const BARRA_ALTURA = 11;

export default function TelaCarregando() {
  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-[#111e13] bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/batalha/carregando.png')" }}
      role="status"
      aria-live="polite"
    >
      <div className="absolute inset-x-0 bottom-[4.2%] flex flex-col items-center gap-2.5">
        <div
          className="overflow-hidden bg-[#4c334a]"
          style={{ width: BARRA_LARGURA, height: BARRA_ALTURA }}
        >
          <div className="h-full bg-[#ddd7b6] barra-duelo" />
        </div>
        <p
          className="text-[#fdfbcd] text-[.95rem] tracking-[.03em]"
          style={{ textShadow: "0 1px 3px rgba(0,0,0,0.75)" }}
        >
          Carregando…
        </p>
      </div>
    </div>
  );
}
