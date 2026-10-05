"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, Map, Castle, Swords, Trophy, BarChart3 } from "lucide-react";

const chapters = [
  { id: "conceito", label: "Conceito" },
  { id: "fluxo", label: "Fluxo" },
  { id: "atributos", label: "Atributos" },
  { id: "diferenciais", label: "Diferenciais" },
  { id: "tecnologia", label: "Tecnologia" },
  { id: "guilda", label: "Guilda" },
  { id: "jornada", label: "Iniciar Jornada" },
];

/** Barra persistente de navegação; não representa progresso do jogo. */
export default function JourneyNavigation() {
  const pathname = usePathname();
  const [active, setActive] = useState(-1);
  const [open, setOpen] = useState(false);
  const mapButton = useRef<HTMLButtonElement>(null);
  const mapPanel = useRef<HTMLElement>(null);

  useEffect(() => {
    if (pathname !== "/") return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        let current = -1;
        chapters.forEach(({ id }, index) => {
          const section = document.getElementById(id);
          if (section && section.getBoundingClientRect().top <= window.innerHeight * 0.45) current = index;
        });
        setActive(current);
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    mapPanel.current?.querySelector<HTMLAnchorElement>("a")?.focus({ preventScroll: true });
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        mapButton.current?.focus({ preventScroll: true });
      }
    };
    document.addEventListener("keydown", dismiss);
    return () => document.removeEventListener("keydown", dismiss);
  }, [open]);

  if (pathname.startsWith("/admin")) return null;
  return (
    <aside className="game-navigation" aria-label="Navegação da taverna">
      {open && <>
        <button className="game-map-backdrop" aria-label="Fechar mapa" tabIndex={-1} onClick={() => { setOpen(false); mapButton.current?.focus(); }} />
        <nav ref={mapPanel} id="journey-map" className="journey-map game-map" aria-label="Seções do site">
          <p className="journey-eyebrow">Mapa da jornada</p>
          <p className="journey-description">Explore os capítulos da taverna</p>
          <ol className="journey-chapters">
            {chapters.map((chapter, index) => (
              <li key={chapter.id}>
                <Link href={`/#${chapter.id}`} onClick={() => setOpen(false)}
                  className={pathname === "/" && index === active ? "is-current" : pathname === "/" && index < active ? "is-past" : ""}
                  aria-current={pathname === "/" && index === active ? "location" : undefined}>
                  <span className="journey-node">{pathname === "/" && index < active ? <Check size={12} /> : String(index + 1).padStart(2, "0")}</span>
                  {chapter.label}
                  {pathname === "/" && index === active && <span className="journey-current">Atual</span>}
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      </>}
      <nav className="game-dock" aria-label="Menu principal">
        <button ref={mapButton} className={`game-dock-item ${open ? "is-active" : ""}`} aria-expanded={open} aria-controls="journey-map" onClick={() => setOpen(!open)}>
          <Map aria-hidden="true" /><span>Mapa</span>
        </button>
        <Link href="/ranking" className={`game-dock-item ${pathname === "/ranking" ? "is-active" : ""}`} aria-current={pathname === "/ranking" ? "page" : undefined} onClick={() => setOpen(false)}>
          <Trophy aria-hidden="true" /><span>Ranking</span>
        </Link>
        <Link href="/" className={`game-dock-item game-dock-home ${pathname === "/" ? "is-active" : ""}`} aria-current={pathname === "/" ? "page" : undefined} onClick={() => setOpen(false)}>
          <span className="game-home-emblem"><Castle aria-hidden="true" /></span><span>Taverna</span>
        </Link>
        <Link href="/#jornada" className={`game-dock-item ${pathname === "/jogar" || pathname === "/personagem" || pathname === "/batalha" ? "is-active" : ""}`} onClick={() => setOpen(false)}>
          <Swords aria-hidden="true" /><span>Jornada</span>
        </Link>
        <Link href="/dashboard" className={`game-dock-item ${pathname === "/dashboard" ? "is-active" : ""}`} aria-current={pathname === "/dashboard" ? "page" : undefined} onClick={() => setOpen(false)}>
          <BarChart3 aria-hidden="true" /><span>Dashboard</span>
        </Link>
      </nav>
    </aside>
  );
}
