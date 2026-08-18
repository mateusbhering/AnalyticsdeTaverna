"use client";
import { getSupabaseClient } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { AVATAR_API_BASE } from "@/lib/useAvatarGeneration";
import { byName } from "@/lib/classes";


const ATTR_LABELS: [string, string, string][] = [
  ["for", "Força",        "💪"],
  ["int", "Inteligência", "🧠"],
  ["agi", "Agilidade",    "⚡"],
  ["res", "Resistência",  "🛡️"],
  ["car", "Carisma",      "✨"],
  ["sab", "Sabedoria",    "👁️"],
  ["cao", "Caos",         "🌪️"],
];

interface JogadorRow {
  id: number | string;
  classe: string;
  forca: number;
  inteligencia: number;
  agilidade: number;
  resistencia: number;
  carisma: number;
  sabedoria: number;
  caos: number;
  foto_url: string | null;
}

export default function PersonagemCard() {
  const params = useSearchParams();
  const idParam = params.get("id");
  const supabaseBase = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

  // Link único (/personagem?id=): lê o personagem salvo no banco.
  const [row, setRow] = useState<JogadorRow | null>(null);
  const [loading, setLoading] = useState<boolean>(!!idParam);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!idParam) return;
    let cancelled = false;
    (async () => {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from("jogadores")
          .select("*")
          .eq("id", idParam)
          .single();
        if (cancelled) return;
        if (error || !data) setNotFound(true);
        else setRow(data as JogadorRow);
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [idParam]);

  // ── Resolve os dados: do banco (via ?id=) OU dos query params (links antigos) ──
  const avatarId = params.get("avatar");
  const paramAvatar =
    avatarId && supabaseBase
      ? `${supabaseBase}/storage/v1/object/public/avatars/${avatarId}.jpg`
      : null;

  const className = row ? row.classe : params.get("classe") ?? "";
  const rpgClass = byName(className);

  const attrs: Record<string, number> = row
    ? {
        for: row.forca, int: row.inteligencia, agi: row.agilidade,
        res: row.resistencia, car: row.carisma, sab: row.sabedoria, cao: row.caos,
      }
    : Object.fromEntries(
        ATTR_LABELS.map(([key]) => [key, Number(params.get(key) ?? 0)])
      );

  const fotoUrl = row ? row.foto_url : paramAvatar;
  const portraitSrc =
    fotoUrl ?? (avatarId ? `${AVATAR_API_BASE}/avatar/image/${avatarId}` : rpgClass.photo);

  const maxAttr = Math.max(...Object.values(attrs), 1);
  const barPct = (v: number) => Math.round((v / maxAttr) * 100);

  // QR de batalha usa o id do jogador (do link ?id= ou do banco).
  const jogadorId = row ? row.id : idParam;
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const qrUrl = jogadorId ? `${baseUrl}/batalha?oponenteId=${jogadorId}` : baseUrl;

  // ── Estados de carregamento / não encontrado (só no fluxo por ?id=) ──
  if (loading) {
    return (
      <div className="paper-card paper-frame arcane-corners p-12 flex flex-col items-center gap-4">
        <span className="ac-bl" /><span className="ac-br" />
        <div className="w-10 h-10 border-2 border-[rgba(138,100,40,0.35)] border-t-[var(--foil)] rounded-full animate-spin" />
        <span className="text-[var(--ink-70)] text-[.6rem] tracking-[.25em] uppercase" style={{ fontFamily: "var(--font-cinzel), serif" }}>
          Invocando personagem…
        </span>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="paper-card paper-frame arcane-corners p-12 text-center">
        <span className="ac-bl" /><span className="ac-br" />
        <div className="text-4xl mb-4 opacity-60">🕯️</div>
        <p className="text-[var(--ink)] text-lg mb-1" style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}>
          Personagem não encontrado
        </p>
        <p className="text-sm italic mb-6">
          Este link não existe mais ou expirou.
        </p>
        <a href="/jogar" className="press btn-seal inline-block px-6 py-3 text-[.7rem] tracking-[.12em] uppercase"
          style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}>
          ⚔ Criar o meu
        </a>
      </div>
    );
  }

  return (
    <div className="paper-card paper-frame arcane-corners p-8">
      <span className="ac-bl" /><span className="ac-br" />

      {/* Class header */}
      <div className="text-center mb-6">
        <span
          className="section-eyebrow"
          style={{ fontSize: ".6rem", letterSpacing: ".35em", marginBottom: "16px", color: "var(--seal)", opacity: 0.9 }}
        >
          Manifestação do Ser
        </span>

        <div className="wax-seal !w-20 !h-20 mx-auto text-4xl mb-4">
          {rpgClass.icon}
        </div>

        <h1
          className="text-[1.6rem] text-[var(--seal)] mb-1"
          style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
        >
          {rpgClass.name}
        </h1>
        <p className="text-[.9rem] italic max-w-xs mx-auto leading-relaxed mb-4">
          {rpgClass.desc}
        </p>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={portraitSrc}
          alt={rpgClass.name}
          className="w-48 h-48 object-cover mx-auto border border-[rgba(96,66,26,0.45)] shadow-[0_4px_10px_rgba(0,0,0,0.35)]"
          onError={(e) => {
            // .jpg falhou → tenta .png; depois disso, cai na ilustração da classe.
            const img = e.currentTarget;
            const step = img.dataset.fbstep ?? "0";
            if (step === "0" && fotoUrl && fotoUrl.endsWith(".jpg")) {
              img.dataset.fbstep = "png";
              img.src = fotoUrl.slice(0, -4) + ".png";
            } else if (step !== "final") {
              img.dataset.fbstep = "final";
              img.src = rpgClass.photo;
            }
          }}
        />
      </div>

      {/* Divider */}
      <div className="divider my-5" />

      {/* Attributes */}
      <div className="mb-5">
        <div
          className="text-[.7rem] tracking-[.2em] uppercase text-[var(--foil)] mb-4 text-center"
          style={{ fontFamily: "var(--font-cinzel), serif" }}
        >
          Atributos Arcanos
        </div>
        <div className="space-y-3">
          {ATTR_LABELS.map(([key, label, icon]) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span>{icon}</span>
                  <span
                    className="text-[var(--foil)] text-[.7rem] uppercase tracking-[.15em]"
                    style={{ fontFamily: "var(--font-cinzel), serif" }}
                  >
                    {label}
                  </span>
                </div>
                <span
                  className="text-[var(--ink)] text-[.85rem]"
                  style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
                >
                  {attrs[key]}
                </span>
              </div>
              <div className="h-1.5 bg-[rgba(96,66,26,0.15)] border border-[rgba(96,66,26,0.25)] overflow-hidden">
                <div className="stat-bar-fill" style={{ width: `${barPct(attrs[key])}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QR Code (batalha) */}
      <div className="pt-5 border-t border-[rgba(96,66,26,0.25)] flex flex-col items-center gap-3">
        <span
          className="text-[.55rem] tracking-[.3em] uppercase text-[var(--foil)]"
          style={{ fontFamily: "var(--font-cinzel), serif" }}
        >
          Desafie este herói
        </span>
        <div className="bg-[#f8f0da] border border-[rgba(96,66,26,0.35)] p-2.5">
          <QRCodeSVG value={qrUrl} size={120} bgColor="#f8f0da" fgColor="#3c2a18" />
        </div>
        <p className="text-[.78rem] italic text-center">
          Escaneie para entrar em batalha
        </p>
      </div>
    </div>
  );
}
