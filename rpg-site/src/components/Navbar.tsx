"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

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

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0e0e0e]/93 backdrop-blur-xl border-b border-[rgba(184,134,11,0.2)] shadow-[0_4px_40px_rgba(0,0,0,0.5)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="#" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-gradient-to-br from-[var(--wine)] to-[var(--wood)] border border-[rgba(184,134,11,0.4)] flex items-center justify-center text-lg transition-all group-hover:border-[var(--gold)]">
            ⚔
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

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[.65rem] text-[rgba(244,228,188,0.55)] hover:text-[var(--gold)] transition-colors duration-200 tracking-[.2em] uppercase"
              style={{ fontFamily: "var(--font-cinzel), serif" }}
            >
              {l.label}
            </a>
          ))}
          <a
            href="#jornada"
            className="px-5 py-2 bg-[var(--wine)] border border-[rgba(184,134,11,0.5)] text-[var(--parchment)] text-[.6rem] tracking-[.2em] uppercase hover:border-[var(--gold)] hover:bg-[rgba(74,14,14,0.7)] transition-all duration-200"
            style={{ fontFamily: "var(--font-cinzel), serif" }}
          >
            Iniciar Jornada
          </a>
          <a
            href="/admin"
            className="px-5 py-2 bg-[rgba(74,14,14,0.6)] border border-[rgba(184,134,11,0.35)] text-[rgba(244,228,188,0.7)] text-[.6rem] tracking-[.2em] uppercase hover:border-[var(--gold)] transition-all duration-200"
            style={{ fontFamily: "var(--font-cinzel), serif" }}
          >
            🔒 Admin
          </a>
        </div>

        <button
          className="md:hidden text-[rgba(244,228,188,0.6)] hover:text-[var(--gold)]"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <div className="w-6 space-y-1.5">
            <span className={`block h-px bg-current transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block h-px bg-current transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block h-px bg-current transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </div>
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-[#0e0e0e]/97 backdrop-blur-xl border-b border-[rgba(184,134,11,0.2)] px-6 pb-6">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="block py-3 text-[rgba(244,228,188,0.55)] hover:text-[var(--gold)] border-b border-[rgba(184,134,11,0.1)] transition-colors text-[.65rem] tracking-[.2em] uppercase"
              style={{ fontFamily: "var(--font-cinzel), serif" }}
            >
              {l.label}
            </a>
          ))}
          <a
            href="#jornada"
            className="mt-4 block text-center px-5 py-3 bg-[var(--wine)] border border-[rgba(184,134,11,0.5)] text-[var(--parchment)] text-[.65rem] tracking-[.15em] uppercase"
            style={{ fontFamily: "var(--font-cinzel), serif" }}
            onClick={() => setMenuOpen(false)}
          >
            Iniciar Jornada
          </a>
          <a
            href="/admin"
            className="mt-2 block text-center px-5 py-3 bg-[rgba(74,14,14,0.4)] border border-[rgba(184,134,11,0.3)] text-[rgba(244,228,188,0.7)] text-[.65rem] tracking-[.15em] uppercase"
            style={{ fontFamily: "var(--font-cinzel), serif" }}
            onClick={() => setMenuOpen(false)}
          >
            🔒 Admin
          </a>
        </div>
      )}
    </nav>
  );
}
