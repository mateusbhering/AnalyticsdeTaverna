"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { CLASS_ARTWORK } from "@/lib/class-artwork";
import { BATTLE_RIGS, deveEspelhar } from "@/lib/battle-rigs";
import type { ClassInfo } from "@/lib/classes";
import styles from "./AtorBatalha.module.css";

export type Expressao = "entrada" | "pronto" | "ataque" | "dor" | "vitoria" | "derrota";

function Articulacao({ pivo, angulos, deslocamento = 0, duracao, repetir = false, children }: {
  pivo: [number, number]; angulos: number[]; deslocamento?: number; duracao: number; repetir?: boolean; children: ReactNode;
}) {
  const girar = useRef<SVGAnimateTransformElement>(null);
  const mover = useRef<SVGAnimateTransformElement>(null);
  const valores = angulos.map(angulo => `${angulo} ${pivo[0]} ${pivo[1]}`).join(";");
  // Pivôs explícitos em coordenadas da arte: não dependem da bounding box do recorte.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    girar.current?.beginElement();
    mover.current?.beginElement();
  }, [valores, deslocamento, duracao, repetir]);
  return <g>
    {deslocamento !== 0 && <animateTransform ref={mover} attributeName="transform" type="translate" begin="indefinite"
      values={`0 0;0 ${deslocamento};0 0;0 ${deslocamento};0 0`} dur={`${duracao}s`} repeatCount={repetir ? "indefinite" : "1"} fill="freeze"/>}
    <g>
      <animateTransform ref={girar} attributeName="transform" type="rotate" begin="indefinite" values={valores}
        dur={`${duracao}s`} repeatCount={repetir ? "indefinite" : "1"} fill="freeze"/>
      {children}
    </g>
  </g>;
}

/** Camadas recortadas em tempo de renderização da MESMA imagem usada nos cards. */
export default function AtorBatalha({ classe, expressao, lado }: { classe: ClassInfo; expressao: Expressao; lado: "a" | "b" }) {
  const id = `rig-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const arte = CLASS_ARTWORK[classe.name];
  const src = arte ? `/classes/${arte}.png` : classe.photo;
  const rig = BATTLE_RIGS[arte];
  const espelhado = deveEspelhar(arte, lado);
  const golpe = expressao === "ataque";
  const feliz = expressao === "vitoria";
  const entrando = expressao === "entrada";
  const machucado = expressao === "dor" || expressao === "derrota";
  const proporcao = rig ? rig.altura / rig.largura : 1;
  const classeEstado = expressao === "dor" ? styles.dor : feliz ? styles.vitoria : "";
  return <svg viewBox={`0 0 100 ${100 * proporcao}`} preserveAspectRatio="xMidYMax meet"
    role="img" aria-label={`${classe.name}: ${expressao}`} className={`${styles.ator} ${classeEstado}`}
    data-arte={src} data-lado={lado} data-espelhado={espelhado} data-olhar={lado === "a" ? "direita" : "esquerda"}>
    <defs>
      <image id={`${id}-arte`} href={src} width="100" height="100" preserveAspectRatio="none"/>
      {rig && <>
        <mask id={`${id}-corpo`} maskUnits="userSpaceOnUse" x="-50" y="-50" width="200" height="200">
          <rect x="-50" y="-50" width="200" height="200" fill="white"/>
          <path d={rig.cabeca.recorte} fill="black"/>
          {rig.partes.map(p => <path key={p.nome} d={p.recorte} fill="black"/>)}
          {/* Sobreposição no encaixe evita buracos quando o braço gira. */}
          {[rig.cabeca, ...rig.partes].map((p, i) => <circle key={i} cx={p.pivo[0]} cy={p.pivo[1]} r="3.3" fill="white"/>)}
        </mask>
        <clipPath id={`${id}-cabeca`}><path d={rig.cabeca.recorte}/></clipPath>
        {rig.partes.map((p, i) => <clipPath key={p.nome} id={`${id}-parte-${i}`}><path d={p.recorte}/></clipPath>)}
      </>}
    </defs>
    <g transform={`scale(1 ${proporcao})`}>
      <g transform={espelhado ? "translate(100 0) scale(-1 1)" : undefined}>
        {!rig ? <use href={`#${id}-arte`}/> : <Articulacao pivo={[50, 83]}
          angulos={machucado ? [0, -3, 2, 0] : golpe ? [0, -3, 2, -2, 0] : [0, 1.2, -1.2, 0]}
          duracao={golpe ? 3.3 : machucado ? .5 : 3.2} repetir={!golpe && !machucado}>
          <use href={`#${id}-arte`} mask={`url(#${id}-corpo)`}/>
          <Articulacao pivo={rig.cabeca.pivo} angulos={machucado ? [0, -8, 3, 0] : feliz ? [-3, 4, -3] : golpe ? [0, -4, 3, -4, 0] : [0, -1.5, 1.5, 0]} duracao={machucado ? .5 : golpe ? 3.3 : 2.8} repetir={!golpe && !machucado}>
            <g clipPath={`url(#${id}-cabeca)`}>
              <use href={`#${id}-arte`}/>
              <g className={styles.piscar} style={{ animationDelay: lado === "a" ? "-.45s" : "-1.75s" }}>
                {rig.olhos.map((olho, i) => <g key={i}>
                  <ellipse cx={olho.x} cy={olho.y} rx={olho.rx * 1.12} ry={olho.ry * 1.12} fill={olho.pele}/>
                  <path d={`M${olho.x - olho.rx} ${olho.y} Q${olho.x} ${olho.y + olho.ry * .7} ${olho.x + olho.rx} ${olho.y}`} fill="none" stroke="#332015" strokeWidth=".7" strokeLinecap="round"/>
                </g>)}
              </g>
            </g>
          </Articulacao>
          {rig.partes.map((p, i) => <Articulacao key={`${p.nome}-${expressao}`} pivo={p.pivo}
            angulos={golpe ? [0, p.levantar, p.levantar * .65, p.levantar, 0] : feliz ? [0, p.levantar * .55, 0] : entrando ? [0, p.levantar * .25, 0] : machucado ? [0, -p.levantar * .2, 0] : [0, (i % 2 ? -1 : 1) * 1.4, 0]}
            deslocamento={golpe ? p.deslocar : 0} duracao={golpe ? 3.3 : feliz ? .75 : entrando ? 1.2 : machucado ? .5 : 2.6} repetir={!golpe && !machucado}>
            <g clipPath={`url(#${id}-parte-${i})`}><use href={`#${id}-arte`}/></g>
            {golpe && <g className={styles.carga} aria-hidden="true">
              <circle cx={p.pivo[0] + (p.pivo[0] < 50 ? -12 : 13)} cy={p.pivo[1] - 9} r="5" fill="#e9c4ff" opacity=".55"/>
              <circle cx={p.pivo[0] + (p.pivo[0] < 50 ? -12 : 13)} cy={p.pivo[1] - 9} r="8" stroke="#ffe0a0" strokeWidth=".65" fill="none"/>
            </g>}
          </Articulacao>)}
        </Articulacao>}
      </g>
    </g>
  </svg>;
}
