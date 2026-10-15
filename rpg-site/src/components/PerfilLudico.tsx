"use client";

import { useEffect, useState } from "react";
import { Lock, Target, Trophy, Check } from "lucide-react";
import { buscarPerfil, type PerfilLudico as Perfil } from "@/lib/ludico";
import SeloRaridade from "./SeloRaridade";

const FONTE_TITULO = { fontFamily: "var(--font-cinzel), serif" } as const;

/**
 * Nível, título, raridade, conquistas e (para o dono) a missão do dia.
 * Some sem barulho se o backend não responder: é brinde, não requisito.
 */
export default function PerfilLudico({ jogadorId, ehDono }: { jogadorId: number | string; ehDono: boolean }) {
  const [perfil, setPerfil] = useState<Perfil | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    buscarPerfil(jogadorId, ctrl.signal).then((p) => {
      if (!ctrl.signal.aborted) setPerfil(p);
    });
    return () => ctrl.abort();
  }, [jogadorId]);

  if (!perfil) return null;
  const { progressao: nv, missao_hoje: missao } = perfil;

  return (
    <section className="paper-card paper-frame p-6 space-y-5" aria-label="Progressão do herói">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-[var(--ink)] text-[1.05rem]" style={FONTE_TITULO}>
            Nível {nv.nivel} · {nv.titulo_nivel}
          </div>
          {perfil.titulo && <div className="text-[.85rem] italic text-[var(--ink-70)]">{perfil.titulo}</div>}
        </div>
        <SeloRaridade raridade={perfil.raridade.nivel} />
      </div>

      <div>
        <div
          className="h-2 bg-[rgba(96,66,26,0.15)] border border-[rgba(96,66,26,0.3)] overflow-hidden"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(nv.progresso_pct)}
          aria-label={`Progresso para o próximo nível: ${Math.round(nv.progresso_pct)}%`}
        >
          <div className="stat-bar-fill h-full" style={{ width: `${nv.progresso_pct}%` }} />
        </div>
        <p className="text-[.72rem] text-[var(--ink-50)] mt-1">
          {nv.nivel_maximo ? "Nível máximo alcançado." : `${nv.xp_para_proximo} XP para o nível ${nv.nivel + 1}`}
          {perfil.raridade.amostra_suficiente && ` · ${perfil.raridade.percentual.toLocaleString("pt-BR")}% dos heróis têm esta classe`}
        </p>
      </div>

      {ehDono && (
        <div className="border border-[rgba(96,66,26,0.35)] bg-[rgba(60,42,24,0.05)] p-4">
          <div className="flex items-center gap-2 text-[var(--foil)] text-[.7rem] uppercase tracking-[.15em]" style={FONTE_TITULO}>
            <Target size={14} strokeWidth={1.8} aria-hidden="true" /> Missão do dia
          </div>
          <p className="text-[var(--ink)] mt-1">
            <strong>{missao.nome}</strong> — {missao.descricao}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex-1 h-1.5 bg-[rgba(96,66,26,0.15)] border border-[rgba(96,66,26,0.3)] overflow-hidden">
              <div className="stat-bar-fill h-full" style={{ width: `${(missao.progresso / missao.meta) * 100}%` }} />
            </div>
            <span className="text-[.75rem] text-[var(--ink-70)] tabular-nums">
              {missao.progresso}/{missao.meta}
            </span>
          </div>
          <p className="text-[.75rem] text-[var(--ink-70)] mt-1.5 flex items-center gap-1">
            {missao.recompensa_paga ? (
              <>
                <Check size={13} aria-hidden="true" /> Cumprida — +{missao.recompensa_xp} XP recebidos
              </>
            ) : (
              <>Recompensa: +{missao.recompensa_xp} XP ao cumprir (vale duelando como desafiante)</>
            )}
          </p>
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 text-[var(--foil)] text-[.7rem] uppercase tracking-[.15em] mb-2" style={FONTE_TITULO}>
          <Trophy size={14} strokeWidth={1.8} aria-hidden="true" />
          Conquistas {perfil.conquistas_desbloqueadas}/{perfil.conquistas_total}
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {perfil.conquistas.map((c) => (
            <li
              key={c.codigo}
              className={`flex items-start gap-2 border p-2 text-[.8rem] ${
                c.desbloqueada
                  ? "border-[rgba(140,35,24,0.45)] bg-[rgba(140,35,24,0.06)] text-[var(--ink)]"
                  : "border-[rgba(96,66,26,0.25)] text-[var(--ink-70)]"
              }`}
            >
              {c.desbloqueada ? (
                <Trophy size={15} className="mt-0.5 text-[var(--seal)] shrink-0" aria-hidden="true" />
              ) : (
                <Lock size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
              )}
              <span>
                <strong className="block">{c.nome}</strong>
                {c.descricao}
                <span className="sr-only">{c.desbloqueada ? " Desbloqueada." : " Bloqueada."}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
