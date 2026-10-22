"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import MagicTable, { AdvantageSigilIcon } from "@/components/MagicTable";
import PixelQuestBackdrop from "@/components/PixelQuestBackdrop";
import { Pause, Play } from "@/components/ui/illustrated-icons";
import { Reveal } from "@/components/ui/reveal";

const advantages = ["Psicologia Aplicada", "IA Generativa", "Viral por Design", "Gamificação Real"];

export default function WhyDifferent() {
  const [{ active, revision }, setSelection] = useState({ active: 0, revision: 0 });
  const setActive = (update: (index: number) => number) => setSelection(previous => {
    const next = update(previous.active);
    return next === previous.active ? previous : { active: next, revision: previous.revision + 1 };
  });
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .2 });
    if (root.current) observer.observe(root.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (paused || hovered || focused || interacting || !visible || reducedMotion) return;
    const timer = window.setInterval(() => { if (!document.hidden) setActive(index => (index + 1) % advantages.length); }, 6500);
    return () => window.clearInterval(timer);
  }, [paused, hovered, focused, interacting, visible, reducedMotion, active]);
  const go = (direction: number) => setActive(index => (index + direction + advantages.length) % advantages.length);

  return (
    <div className="bg-dark-wood pixel-quest-realm">
      <PixelQuestBackdrop showScenery={false} />
      <section id="diferenciais" className="py-28 px-6 relative max-w-7xl mx-auto">
        <Reveal><div className="text-center mb-12">
          <span className="section-eyebrow">Por que é diferente</span>
          <h2 className="text-5xl text-[var(--parchment)] mb-4">Nossa <span className="gold-grad">Vantagem</span></h2>

        </div></Reveal>
        <div ref={root} data-animation-paused={!visible || paused || reducedMotion ? "true" : "false"} className="advantage-table-carousel" role="region" aria-roledescription="carrossel" aria-label="Vantagens do jogo" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
          <div className="advantage-table-composition">
            <ul className="advantage-emblems advantage-emblems-left" aria-label="Vantagens à esquerda">
              {advantages.slice(0, 2).map((title, index) => <li key={title} className={`advantage-emblem emblem-${index} ${active === index ? "is-active" : ""}`}><button type="button" className="advantage-emblem-select" onClick={() => setActive(() => index)} aria-pressed={active === index} aria-label={`Selecionar ${title}`}><AdvantageSigilIcon variant={index} /><span>{title}</span></button></li>)}
            </ul>
            <div className="advantage-table-center">
              <div className="ritual-host">
                <div role="img" aria-label="Mago do ChatGPT piscando e gesticulando como um personagem de RPG" className="ritual-host-character ritual-host-sprite" />
                <p className="ritual-host-speech">Arraste o símbolo para o lado e descubra outras vantagens do nosso reino!</p>
              </div>
              <MagicTable simulation={active} transition={revision} onNavigate={go} onInteractionChange={setInteracting} /></div>
            <ul className="advantage-emblems advantage-emblems-right" aria-label="Vantagens à direita">
              {advantages.slice(2).map((title, offset) => { const index = offset + 2; return <li key={title} className={`advantage-emblem emblem-${index} ${active === index ? "is-active" : ""}`}><button type="button" className="advantage-emblem-select" onClick={() => setActive(() => index)} aria-pressed={active === index} aria-label={`Selecionar ${title}`}><AdvantageSigilIcon variant={index} /><span>{title}</span></button></li>; })}
            </ul>
          </div>
          <p className="sr-only" aria-live={paused || focused || hovered || reducedMotion ? "polite" : "off"}>Vantagem selecionada: {advantages[active]}</p>
          {!reducedMotion && <div className="advantage-table-playback"><button type="button" className="advantage-table-pause" aria-pressed={paused} aria-label={`${paused ? "Retomar" : "Pausar"} troca automática das vantagens`} onClick={() => setPaused(value => !value)}>{paused ? <Play size={16} /> : <Pause size={16} />}</button></div>}
        </div>

      </section>
    </div>
  );
}