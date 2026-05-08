"use client";

import { useState, useEffect } from "react";

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
          ? "bg-[#050010]/90 backdrop-blur-xl border-b border-purple-800/40 shadow-lg shadow-purple-900/20"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="#" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-xl font-bold glow-purple transition-all group-hover:scale-110">
            ⚔
          </div>
          <span className="text-xl font-bold tracking-tight">
            <span className="text-gradient-purple">RPG</span>
            <span className="text-white"> Data</span>
          </span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-purple-300 hover:text-white transition-colors duration-200"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#jornada"
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold hover:from-purple-500 hover:to-indigo-500 transition-all duration-200 glow-purple"
          >
            Iniciar Jornada
          </a>
          <a
            href="/admin"
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-700 to-red-600 text-white text-sm font-semibold hover:from-red-600 hover:to-red-500 transition-all duration-200 border border-red-500/40"
          >
            🔒 Admin
          </a>
        </div>

        <button
          className="md:hidden text-purple-300 hover:text-white"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <div className="w-6 space-y-1.5">
            <span className={`block h-0.5 bg-current transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block h-0.5 bg-current transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 bg-current transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </div>
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-[#0a0020]/95 backdrop-blur-xl border-b border-purple-800/40 px-6 pb-6">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="block py-3 text-purple-300 hover:text-white border-b border-purple-900/30 transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#jornada"
            className="mt-4 block text-center px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold"
            onClick={() => setMenuOpen(false)}
          >
            Iniciar Jornada
          </a>
          <a
            href="/admin"
            className="mt-2 block text-center px-5 py-3 rounded-xl bg-gradient-to-r from-red-700 to-red-600 text-white font-semibold border border-red-500/40"
            onClick={() => setMenuOpen(false)}
          >
            🔒 Admin
          </a>
        </div>
      )}
    </nav>
  );
}
