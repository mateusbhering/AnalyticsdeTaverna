"use client";
import { CLASS_ARTWORK } from "@/lib/class-artwork";
import PerfilLudico from "@/components/PerfilLudico";
import { IconText } from "@/components/ui/illustrated-icons";

import { getSupabaseClient } from "@/lib/supabase";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import HeroTradingCard from "@/components/HeroTradingCard";
import { AVATAR_API_BASE } from "@/lib/useAvatarGeneration";
import { byName } from "@/lib/classes";
import { useMeuId, useTagsEspelhadas } from "@/lib/jogador-local";


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
  nome?: string | null;
  forca: number;
  inteligencia: number;
  agilidade: number;
  resistencia: number;
  carisma: number;
  sabedoria: number;
  caos: number;
  foto_url: string | null;
  tags: string[] | null;
}

const subscribeOrigin = () => () => {};
const readOrigin = () => window.location.origin;
const serverOrigin = () => "";

export default function PersonagemCard({ playerId }: { playerId?: string } = {}) {
  const params = useSearchParams();
  const idParam = playerId ?? params.get("id");
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

  const classArtwork = CLASS_ARTWORK[rpgClass.name];
  const classIllustration = classArtwork ? `/classes/${classArtwork}.png` : rpgClass.photo;
  const fotoUrl = row ? row.foto_url : paramAvatar;
  const portraitSrc =
    fotoUrl ?? (avatarId ? `${AVATAR_API_BASE}/avatar/image/${avatarId}` : classIllustration);


  // QR de batalha usa o id do jogador (do link ?id= ou do banco).
  const jogadorId = row ? row.id : idParam;

  /* ── Visão do dono ──────────────────────────────────────────────────────────
     Mesma rota, mesmo fetch: o que muda é quem está olhando. Se o id da URL é o
     id guardado neste aparelho, a pessoa é a dona do card e ganha os botões de
     ação; qualquer outra vê exatamente o card público de antes.

     O gate é cosmético, não de segurança — as ações são links públicos, e o RLS
     não tem policy de update para `anon`, então mexer no storage não forja
     placar nenhum. */
  const meuId = useMeuId();
  const ehDono = typeof meuId === "string" && idParam === meuId;

  /* Tags: da coluna nova quando a linha é recente, senão do espelho no aparelho
     (linhas criadas antes da migração não têm como ser preenchidas — o RLS não
     dá update para `anon`). Derivado, sem estado nem efeito. */
  const espelho = useTagsEspelhadas(ehDono ? idParam : null);
  const tags = row?.tags?.length ? row.tags : espelho;

  const baseUrl = useSyncExternalStore(subscribeOrigin, readOrigin, serverOrigin);
  const qrUrl = jogadorId ? `${baseUrl}/batalha?oponenteId=${jogadorId}` : null;

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
        <div className="text-4xl mb-4 opacity-60">{<IconText text={"🕯️"} />}</div>
        <p className="text-[var(--ink)] text-lg mb-1" style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}>
          Personagem não encontrado
        </p>
        <p className="text-sm italic mb-6">
          Este link não existe mais ou expirou.
        </p>
        <a href="/jogar" className="press btn-seal inline-block px-6 py-3 text-[.7rem] tracking-[.12em] uppercase"
          style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}>{<IconText text={"\r\n          ⚔ Criar o meu\r\n        "} />}</a>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <HeroTradingCard name={row?.nome ?? params.get("nome") ?? undefined} classTitle={rpgClass.name} description={rpgClass.desc} stats={ATTR_LABELS.map(([key,label,icon])=>({label,icon,value:attrs[key]}))} tags={ehDono ? tags : []} qrUrl={qrUrl} portrait={<>
        {/* eslint-disable-next-line @next/next/no-img-element */}
<img
            src={portraitSrc}
            alt={rpgClass.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // .jpg falhou → tenta .png; depois disso, cai na ilustração da classe.
              const img = e.currentTarget;
              const step = img.dataset.fbstep ?? "0";
              if (step === "0" && fotoUrl && fotoUrl.endsWith(".jpg")) {
                img.dataset.fbstep = "png";
                img.src = fotoUrl.slice(0, -4) + ".png";
              } else if (step !== "final") {
                img.dataset.fbstep = "final";
                img.src = classIllustration;
              }
            }}
          />
      </>} />
      {idParam && <PerfilLudico jogadorId={idParam} ehDono={ehDono} />}

      {/* Ações do dono — a única diferença entre esta visão e a pública. Levam
          para uma partida nova e para o desafio; o visitante não vê nenhuma. */}
      {ehDono && (
        <div className="hero-character-actions flex gap-3 flex-wrap">
          <a
            href="/jogar"
            className="btn-parchment flex-1 min-w-[140px] py-4 text-[.75rem] tracking-[.12em] uppercase text-center"
            style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
          >{<IconText text={"\r\n            🔄 Jogar Novamente\r\n          "} />}</a>
          <a
            href="/batalha"
            className="btn-seal flex-1 min-w-[140px] py-4 text-[.75rem] tracking-[.12em] uppercase text-center"
            style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
          >{<IconText text={"\r\n            ⚔ Desafiar Alguém\r\n          "} />}</a>
        </div>
      )}
    </div>
  );
}

