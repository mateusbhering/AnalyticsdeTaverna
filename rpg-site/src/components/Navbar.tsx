"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Swords, Lock } from "lucide-react";

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

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[.65rem] text-[rgba(240,226,189,0.6)] hover:text-[var(--gold-light)] transition-colors duration-200 tracking-[.2em] uppercase"
              style={{ fontFamily: "var(--font-cinzel), serif" }}
            >
              {l.label}
            </a>
          ))}
          <a
            href="#jornada"
            className="press btn-seal px-5 py-2 text-[.6rem] tracking-[.2em] uppercase"
            style={{ fontFamily: "var(--font-cinzel), serif", borderWidth: "1px" }}
          >
            Iniciar Jornada
          </a>
          <a
            href="/admin"
            className="press px-5 py-2 bg-[rgba(82,26,16,0.55)] border border-[rgba(201,151,63,0.4)] text-[rgba(240,226,189,0.75)] text-[.6rem] tracking-[.2em] uppercase hover:border-[var(--gold-light)] transition-all duration-200 inline-flex items-center gap-1.5"
            style={{ fontFamily: "var(--font-cinzel), serif" }}
          >
            <Lock size={11} strokeWidth={1.8} /> Admin
          </a>
        </div>

        <button
          className="md:hidden text-[rgba(240,226,189,0.65)] hover:text-[var(--gold-light)]"
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
        <div className="md:hidden glass border-b border-[rgba(201,151,63,0.25)] px-6 pb-6">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="block py-3 text-[rgba(240,226,189,0.6)] hover:text-[var(--gold-light)] border-b border-[rgba(201,151,63,0.12)] transition-colors text-[.65rem] tracking-[.2em] uppercase"
              style={{ fontFamily: "var(--font-cinzel), serif" }}
            >
              {l.label}
            </a>
          ))}
          <a
            href="#jornada"
            className="press btn-seal mt-4 block text-center px-5 py-3 text-[.65rem] tracking-[.15em] uppercase"
            style={{ fontFamily: "var(--font-cinzel), serif", borderWidth: "1px" }}
            onClick={() => setMenuOpen(false)}
          >
            Iniciar Jornada
          </a>
          <a
            href="/admin"
            className="press mt-2 flex items-center justify-center gap-1.5 text-center px-5 py-3 bg-[rgba(82,26,16,0.45)] border border-[rgba(201,151,63,0.35)] text-[rgba(240,226,189,0.75)] text-[.65rem] tracking-[.15em] uppercase"
            style={{ fontFamily: "var(--font-cinzel), serif" }}
            onClick={() => setMenuOpen(false)}
          >
            <Lock size={11} strokeWidth={1.8} /> Admin
          </a>
        </div>
      )}
    </nav>
  );
}
