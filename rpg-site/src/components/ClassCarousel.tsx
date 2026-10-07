"use client";
import { IconText } from "@/components/ui/illustrated-icons";


import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "@/components/ui/illustrated-icons";

const classes = [
  { name: "Mago do ChatGPT", image: "mago-chatgpt", traits: ["Estratégia", "NERD", "TECNOLÓGICO"] },
  { name: "Artífice da Gambiarra", image: "artifice", traits: ["Criatividade", "GAMBIARRA"] },
  { name: "Ladino do Home Office", image: "ladino", traits: ["Adaptabilidade", "FURTIVO"] },
  { name: "Necromante de Planilha", image: "necromante", traits: ["Disciplina", "PERFECCIONISTA"] },
  { name: "Vidente da Ansiedade", image: "vidente", traits: ["Percepção", "OVERTHINKING"] },
  { name: "Invocador de iFood", image: "invocador", traits: ["Impulsividade", "DOPAMINA"] },
  { name: "Paladino do Grupo", image: "paladino", traits: ["Liderança", "LÍDER"] },
  { name: "Druida de Varanda", image: "druida", traits: ["Empatia", "ZEN"] },
];

export default function ClassCarousel() {
  const [active, setActive] = useState(0);
  const move = (direction: number) => setActive((current) => (current + direction + classes.length) % classes.length);

  return (
    <div className="class-showcase" role="region" aria-roledescription="carrossel" aria-label="Miniaturas das classes de RPG" onKeyDown={(event) => {
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); move(event.key === "ArrowRight" ? 1 : -1); }
    }}>
      <div className="class-table">
        <div className="class-table-runes" aria-hidden="true">{<IconText text={"✧"} />}</div>
        {classes.map((item, index) => {
          let offset = (index - active + classes.length) % classes.length;
          if (offset > classes.length / 2) offset -= classes.length;
          const nearby = Math.abs(offset) <= 1;
          const position = offset === 0 ? "is-selected" : offset === -1 ? "is-previous" : offset === 1 ? "is-next" : offset < 0 ? "is-off-left" : "is-off-right";
          const content = <>
            <div className="class-card-number">Analytics de Taverna <span aria-hidden="true">{<IconText text={"✦"} />}</span></div>
            <div className="class-card-art"><Image className="class-card-scene" src="/classes/tavern-card-scene-v2.png" alt="" width={1024} height={1536} loading="eager" unoptimized /><Image src={`/classes/${item.image}.png`} alt={offset === 0 ? `Miniatura de ${item.name}` : ""} width={384} height={384} sizes="(max-width: 640px) 210px, 240px" loading="eager" unoptimized={item.image === "mago-chatgpt"} /></div>
            <div className="class-card-caption">
              {offset === 0 ? <h4 id="selected-class-name" aria-live="polite" aria-atomic="true">{item.name}</h4> : <span className="class-card-title">{item.name}</span>}
              <div className="class-card-traits">{item.traits.map((trait) => <span key={trait}>{trait}</span>)}</div>
            </div>
          </>;
          return <button key={item.image} type="button" className={`class-playing-card ${position}`} aria-label={`Selecionar ${item.name}`} aria-current={offset === 0 ? "true" : undefined} aria-hidden={!nearby} tabIndex={nearby ? 0 : -1} onClick={() => setActive(index)}>{content}</button>;
        })}
        <button type="button" className="class-table-arrow class-table-prev" aria-label="Classe anterior" onClick={() => move(-1)}><ChevronLeft size={22} /></button>
        <button type="button" className="class-table-arrow class-table-next" aria-label="Próxima classe" onClick={() => move(1)}><ChevronRight size={22} /></button>
      </div>
      <div className="class-pagination" role="group" aria-label="Escolha uma classe">
        {classes.map((item, index) => <button key={item.image} type="button" aria-label={`Ver ${item.name}`} aria-current={index === active ? "true" : undefined} onClick={() => setActive(index)}><span aria-hidden="true" /></button>)}
      </div>
      <p className="class-discovery">{active + 1} de 8 em destaque · Mais 8 classes para descobrir jogando</p>
    </div>
  );
}






