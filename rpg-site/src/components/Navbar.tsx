"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Swords, BarChart3, Trophy } from "@/components/ui/illustrated-icons";

const links = [
  { label: "Conceito", href: "#conceito" },
  { label: "Fluxo", href: "#fluxo" },
  { label: "Atributos", href: "#atributos" },
  { label: "Diferenciais", href: "#diferenciais" },
  { label: "Tecnologia", href: "#tecnologia" },
  { label: "Guilda", href: "#guilda" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const sections = links
      .map(({ href }) => document.getElementById(href.slice(1)))
      .filter((section): section is HTMLElement => section !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        const current = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (current) setActiveSection(current.target.id);
      },
      { rootMargin: "-24% 0px -62% 0px", threshold: [0, 0.2, 0.5] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      className={`rpg-navbar fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass border-b border-[rgba(201,151,63,0.25)] shadow-[0_4px_40px_rgba(0,0,0,0.5)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="#" className="flex items-center gap-3 group">
          {/* Mobile: logo sempre visível. Desktop: brasão + wordmark. */}
          <Image
            src="/logo.png"
            alt="Analytics de Taverna"
            width={512}
            height={512}
            className="h-9 w-auto object-contain sm:hidden drop-shadow-[0_0_10px_rgba(255,176,80,0.4)]"
            priority
          />
          <div className="hidden sm:block">
            <div className="icon-frame w-9 h-9 group-hover:border-[var(--gold)]">
              <Swords size={18} strokeWidth={1.6} />
            </div>
          </div>
          <span
            className="text-sm tracking-[.08em] leading-tight hidden sm:block"
            style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
          >
            <span className="gold-grad">Analytics de</span>
            <br />
            <span className="text-[var(--parchment)] opacity-80">Taverna</span>
          </span>
        </a>

        <div className="hidden xl:flex items-center gap-6">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`relative pb-1 text-[.65rem] transition-colors duration-200 tracking-[.2em] uppercase after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:bg-[var(--gold-light)] after:transition-transform ${activeSection === l.href.slice(1) ? "text-[var(--gold-light)] after:scale-x-100" : "text-[rgba(240,226,189,0.6)] after:scale-x-0 hover:text-[var(--gold-light)] hover:after:scale-x-100"}`}
              style={{ fontFamily: "var(--font-cinzel), serif" }}
            >
              {l.label}
            </a>
          ))}
          {/* Ação secundária antes da principal: "Iniciar Jornada" fica na
              última posição, que é a de maior peso na barra. Dashboard e
              Ranking têm o mesmo tratamento visual dos links de âncora —
              texto simples, sem caixa — pra sobrar um único botão de
              verdade na régua: o CTA. */}
          <Link
            href="/dashboard"
            className="press whitespace-nowrap text-[.65rem] text-[rgba(240,226,189,0.6)] hover:text-[var(--gold-light)] transition-colors duration-200 tracking-[.2em] uppercase inline-flex items-center gap-1.5"
            style={{ fontFamily: "var(--font-cinzel), serif" }}
          >
            <BarChart3 size={11} strokeWidth={1.8} /> Dashboard
          </Link>
          <Link
            href="/ranking"
            className="press whitespace-nowrap text-[.65rem] text-[rgba(240,226,189,0.6)] hover:text-[var(--gold-light)] transition-colors duration-200 tracking-[.2em] uppercase inline-flex items-center gap-1.5"
            style={{ fontFamily: "var(--font-cinzel), serif" }}
          >
            <Trophy size={11} strokeWidth={1.8} /> Ranking
          </Link>
          <a
            href="#jornada"
            className="press btn-seal whitespace-nowrap px-4 py-2 text-[.6rem] tracking-[.2em] uppercase"
            style={{ fontFamily: "var(--font-cinzel), serif", borderWidth: "1px" }}
          >
            Iniciar Jornada
          </a>
        </div>

        <button
          className="xl:hidden text-[rgba(240,226,189,0.65)] hover:text-[var(--gold-light)]"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
          aria-expanded={menuOpen}
          aria-controls="menu-jornada"
        >
          <div className="w-6 space-y-1.5">
            <span className={`block h-px bg-current transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block h-px bg-current transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block h-px bg-current transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </div>
        </button>
      </div>

      <AnimatePresence initial={false}>
        {menuOpen && (
        <motion.div
          id="menu-jornada"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="xl:hidden glass overflow-hidden border-b border-[rgba(201,151,63,0.25)] px-6 pb-6"
        >
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className={`block border-b border-[rgba(201,151,63,0.12)] py-3 text-[.65rem] tracking-[.2em] uppercase transition-colors ${activeSection === l.href.slice(1) ? "text-[var(--gold-light)]" : "text-[rgba(240,226,189,0.6)] hover:text-[var(--gold-light)]"}`}
              style={{ fontFamily: "var(--font-cinzel), serif" }}
            >
              {l.label}
            </a>
          ))}
          <Link
            href="/dashboard"
            className="press mt-4 flex items-center justify-center gap-1.5 text-center px-5 py-3 bg-[rgba(82,26,16,0.45)] border border-[rgba(201,151,63,0.35)] text-[rgba(240,226,189,0.75)] text-[.65rem] tracking-[.15em] uppercase"
            style={{ fontFamily: "var(--font-cinzel), serif" }}
            onClick={() => setMenuOpen(false)}
          >
            <BarChart3 size={11} strokeWidth={1.8} /> Dashboard
          </Link>
          <Link
            href="/ranking"
            className="press mt-2 flex items-center justify-center gap-1.5 text-center px-5 py-3 bg-[rgba(82,26,16,0.45)] border border-[rgba(201,151,63,0.35)] text-[rgba(240,226,189,0.75)] text-[.65rem] tracking-[.15em] uppercase"
            style={{ fontFamily: "var(--font-cinzel), serif" }}
            onClick={() => setMenuOpen(false)}
          >
            <Trophy size={11} strokeWidth={1.8} /> Ranking
          </Link>
          <a
            href="#jornada"
            className="press btn-seal mt-2 block text-center px-5 py-3 text-[.65rem] tracking-[.15em] uppercase"
            style={{ fontFamily: "var(--font-cinzel), serif", borderWidth: "1px" }}
            onClick={() => setMenuOpen(false)}
          >
            Iniciar Jornada
          </a>
        </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
