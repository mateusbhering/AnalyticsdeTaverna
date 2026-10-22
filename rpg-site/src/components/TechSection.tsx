"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import AnimatedClassCharacter from "@/components/AnimatedClassCharacter";
import { Reveal } from "@/components/ui/reveal";

const modules = [
  { name: "Frontend", part: "O portão da aventura", short: "Portão", character: "Paladino do Grupo", image: "paladino", speech: "Eu cuido do frontend: mostro as telas e recebo suas escolhas. Pode entrar! Aqui, até quem tira 1 no dado encontra o botão certo." },
  { name: "Backend", part: "A forja do reino", short: "Forja", character: "Artífice da Gambiarra", image: "artifice", speech: "Na forja do backend, recebo os pedidos e coordeno quiz, personagem e batalha. Se ouvir marteladas, está funcionando. Se ouvir um goblin… melhor investigar." },
  { name: "IA Generativa", part: "A torre arcana", short: "Torre arcana", character: "Mago do ChatGPT", image: "mago-chatgpt", speech: "Nesta torre, o Google Gemini transforma sua foto em avatar e cria sua narrativa. Magia personalizada! Só não peça para aumentar o carisma por decreto real." },
  { name: "Lógica Própria", part: "O grimório de regras", short: "Grimório", character: "Vidente da Ansiedade", image: "vidente", speech: "Meu grimório converte suas respostas em 7 atributos e uma entre 16 classes. Não é adivinhação: são regras e fórmulas. Já conferi três vezes… por garantia." },
  { name: "Banco de Dados", part: "O arquivo do reino", short: "Arquivo", character: "Necromante de Planilha", image: "necromante", speech: "Guardo respostas e métricas no banco de dados para alimentar o dashboard. Aqui, registro antigo não morre: vira histórico. Necromancia? Prefiro chamar de organização." },
];
const pieceAreas = [
  { left: 3, top: 45, width: 30, height: 44, shape: "polygon(0 22%,18% 0,42% 8%,58% 27%,76% 29%,98% 56%,100% 91%,70% 100%,37% 78%,0 65%)" },
  { left: 6, top: 6, width: 27, height: 38, shape: "polygon(0 42%,31% 28%,39% 0,62% 0,68% 28%,87% 39%,100% 55%,100% 78%,49% 100%,0 76%)" },
  { left: 76, top: 0, width: 18, height: 48, shape: "polygon(16% 0,88% 0,100% 26%,94% 91%,48% 100%,0 79%,0 38%)" },
  { left: 71, top: 56, width: 27, height: 32, shape: "polygon(12% 25%,43% 0,66% 8%,91% 26%,100% 52%,100% 79%,57% 100%,0 73%,0 47%)" },
  { left: 36, top: 69, width: 30, height: 30, shape: "polygon(0 30%,45% 0,82% 13%,91% 53%,100% 66%,100% 84%,49% 100%,0 75%)" },
];

export default function TechSection() {
  const [active, setActive] = useState(0);
  const [sparkle, setSparkle] = useState<{ index: number; sequence: number } | null>(null);
  function selectPiece(index: number) {
    setActive(index);
    setSparkle(previous => ({ index, sequence: (previous?.sequence ?? 0) + 1 }));
  }
  const sparkleArea = sparkle ? pieceAreas[sparkle.index] : null;
  const outlinePoints = sparkleArea?.shape.match(/[\d.]+/g)?.map(Number) ?? [];
  const sparklePoints = Array.from({ length: outlinePoints.length }, (_, index) => {
    const vertex = Math.floor(index / 2) * 2;
    const next = (vertex + 2) % outlinePoints.length;
    const blend = index % 2 ? .5 : 0;
    return { x: outlinePoints[vertex] * (1 - blend) + outlinePoints[next] * blend, y: outlinePoints[vertex + 1] * (1 - blend) + outlinePoints[next + 1] * blend };
  });
  const selected = modules[active];
  return (
    <div className="bg-black-linen">
      <section id="tecnologia" className="py-28 px-6 relative max-w-7xl mx-auto">
        <Reveal>
          <div className="text-center mb-12">
            <span className="section-eyebrow">A construção do nosso reino</span>
            <h2 className="text-5xl text-[var(--parchment)] mb-4">Estrutura <span className="gold-grad">Técnica</span></h2>
            <p className="text-[rgba(240,226,189,0.75)] text-lg max-w-2xl mx-auto italic">Uma taverna, cinco peças essenciais. Explore a montagem e descubra o papel de cada sistema na sua aventura.</p>
          </div>
        </Reveal>
        <div className="rpg-assembly">
          <div className="rpg-assembly-visual">
            <p className="rpg-assembly-caption">Vista da montagem · Selecione uma peça</p>
            <div className="rpg-assembly-diagram">
              <Image src="/scenery/tavern-exploded-assembly-v1.png" alt="" width={1536} height={1024} unoptimized className="rpg-assembly-art" />
              {modules.map((part, index) => {
                const area = pieceAreas[index];
                return <button key={part.name} type="button" className={`rpg-assembly-piece ${active === index ? "is-active" : ""}`} style={{ left: `${area.left}%`, top: `${area.top}%`, width: `${area.width}%`, height: `${area.height}%`, clipPath: area.shape }} onClick={() => selectPiece(index)} aria-label={`${index + 1}. ${part.part}: ${part.name}`} aria-pressed={active === index} aria-controls="assembly-detail">
                  <span className="rpg-assembly-piece-art" aria-hidden="true" style={{ backgroundSize: `${10000 / area.width}% ${10000 / area.height}%`, backgroundPosition: `${area.left / (100 - area.width) * 100}% ${area.top / (100 - area.height) * 100}%` }} />
                  <span className="rpg-assembly-piece-marker" aria-hidden="true"><b>{String(index + 1).padStart(2, "0")}</b><span>{part.short}</span></span>
                </button>;
              })}
              {modules.map((part, index) => {
                const area = pieceAreas[index];
                return <button key={`resident-${part.name}`} type="button" className={`rpg-assembly-resident ${active === index ? "is-active" : ""}`} style={{ left: `${area.left + area.width * .7}%`, top: `${area.top + area.height * .75}%` }} aria-label={`Conversar com ${part.character}: ${part.short}`} aria-controls="assembly-detail" aria-pressed={active === index} onClick={() => selectPiece(index)}><AnimatedClassCharacter index={index} /></button>;
              })}
              {sparkle && sparkleArea && <div key={sparkle.sequence} className="rpg-piece-sparkles" aria-hidden="true" style={{ left: `${sparkleArea.left}%`, top: `${sparkleArea.top}%`, width: `${sparkleArea.width}%`, height: `${sparkleArea.height}%` }}>
                {sparklePoints.map((point, index) => <span key={index} className="rpg-piece-spark" style={{ left: `${point.x}%`, top: `${point.y}%`, "--spark-x": `${(point.x - 50) * .16}px`, "--spark-y": `${-9 - (index % 4) * 3}px`, "--spark-delay": `${(index % 6) * 65}ms`, "--spark-duration": `${1800 + (index % 5) * 120}ms`, "--spark-size": `${2 + index % 3}px` } as CSSProperties} />)}
              </div>}
            </div>
            <div className="rpg-assembly-selector" role="group" aria-label="Peças da estrutura técnica">
              {modules.map((part, index) => <button key={part.name} type="button" onClick={() => selectPiece(index)} aria-pressed={active === index} aria-controls="assembly-detail"><span>{String(index + 1).padStart(2, "0")}</span>{part.name}</button>)}
            </div>
          </div>
          <div id="assembly-detail" className="rpg-assembly-dialogue" aria-live="polite" aria-atomic="true">
            <div key={active} className="rpg-assembly-speaker">
              <div className="rpg-assembly-speech">
                <span className="rpg-assembly-speaker-place">{selected.part} · {selected.name}</span>
                <h3>{selected.character}</h3>
                <p>{selected.speech}</p>
              </div>
              <AnimatedClassCharacter index={active} label={selected.character} className="rpg-assembly-speaker-art" />
            </div>
          </div>
        </div>
        <p className="rpg-assembly-footer">Peças diferentes. Um só reino funcionando em conjunto.</p>
      </section>
    </div>
  );
}