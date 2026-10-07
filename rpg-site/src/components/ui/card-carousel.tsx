"use client";

import { Children, useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";

import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useReducedMotion } from "motion/react";

export default function CardCarousel({ children, label }: { children: ReactNode; label: string }) {
  const slides = Children.toArray(children);
  const track = useRef<HTMLDivElement>(null);
  const id = useId();
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const update = () => {
      const first = element.firstElementChild as HTMLElement | null;
      const step = first ? first.offsetWidth + parseFloat(getComputedStyle(element).columnGap || "0") : element.clientWidth;
      if (step > 0) setActive(Math.min(slides.length - 1, Math.max(0, Math.round(element.scrollLeft / step))));
    };
    update();
    element.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => { element.removeEventListener("scroll", update); observer.disconnect(); };
  }, [slides.length]);

  const goTo = useCallback((index: number) => {
    const element = track.current;
    if (!element) return;
    const card = element.firstElementChild as HTMLElement | null;
    const step = card ? card.offsetWidth + parseFloat(getComputedStyle(element).columnGap || "0") : element.clientWidth;
    element.scrollTo({ left: ((index + slides.length) % slides.length) * step, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }, [slides.length]);

  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.25 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (paused || hovered || focused || !visible || reducedMotion || slides.length < 2) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) goTo(active + 1);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [active, paused, hovered, focused, visible, reducedMotion, slides.length, goTo]);

  return (
    <div className="tavern-carousel" role="region" aria-roledescription="carrossel" aria-label={label} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
      <div className="tavern-carousel-stage">
      <button type="button" className="tavern-carousel-arrow tavern-carousel-prev" aria-label={`Card anterior de ${label}`} aria-controls={id} onClick={() => goTo(active - 1)}><ChevronLeft size={22} /></button>
      <div ref={track} id={id} className="tavern-carousel-track" tabIndex={0} aria-label={`Cards de ${label}; use as setas para navegar`} onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); goTo(active + (event.key === "ArrowRight" ? 1 : -1)); }
      }}>
        {slides.map((slide, index) => <div key={index} className="tavern-carousel-slide" role="group" aria-roledescription="slide" aria-label={`${index + 1} de ${slides.length}`}>{slide}</div>)}
      </div>
      <button type="button" className="tavern-carousel-arrow tavern-carousel-next" aria-label={`Próximo card de ${label}`} aria-controls={id} onClick={() => goTo(active + 1)}><ChevronRight size={22} /></button>
      </div>
      <div className="tavern-carousel-dots" role="group" aria-label={`Selecionar card de ${label}`}>
        {slides.map((_, index) => <button key={index} type="button" className="tavern-carousel-dot" aria-label={`Ir para card ${index + 1} de ${label}`} aria-controls={id} aria-current={active === index ? "true" : undefined} onClick={() => goTo(index)}><span aria-hidden="true" /></button>)}
        {!reducedMotion && <button type="button" className="tavern-carousel-pause" aria-label={`${paused ? "Retomar" : "Pausar"} troca automática de ${label}`} onClick={() => setPaused(!paused)}>{paused ? <Play size={15} /> : <Pause size={15} />}</button>}
      </div>
    </div>
  );
}


