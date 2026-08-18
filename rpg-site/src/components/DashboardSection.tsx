"use client";

import { Sparkles, Smartphone } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import CountUp from "@/components/ui/count-up";
import AnimatedBar from "@/components/ui/animated-bar";
import { byName, isClasseConhecida } from "@/lib/classes";
// Só o tipo: `import type` é apagado na compilação, então o client não puxa
// o supabase-js nem o next/cache que stats.ts importa.
import type { PlayerStats } from "@/lib/stats";

/** Quantas classes aparecem na lista antes de agrupar o resto em "outras". */
const TOP_N = 10;

const ATTR_LABELS: [keyof PlayerStats["averages"], string, string][] = [
  ["forca",        "Força",        "💪"],
  ["inteligencia", "Inteligência", "🧠"],
  ["agilidade",    "Agilidade",    "⚡"],
  ["resistencia",  "Resistência",  "🛡️"],
  ["carisma",      "Carisma",      "✨"],
  ["sabedoria",    "Sabedoria",    "👁️"],
  ["caos",         "Caos",         "🌪️"],
];

/** Emoji da classe; classes fora do catálogo atual não herdam o ícone errado. */
function classIcon(nome: string): string {
  return isClasseConhecida(nome) ? byName(nome).icon : "✦";
}

export default function DashboardSection({ stats }: { stats: PlayerStats | null }) {
  const top = stats?.byClass.slice(0, TOP_N) ?? [];
  const resto = stats?.byClass.slice(TOP_N) ?? [];
  const restoPct = Math.round(resto.reduce((s, c) => s + c.pct, 0) * 10) / 10;
  const maisComum = stats?.byClass[0];

  // Barras de atributo são comparadas entre si, então a escala é o maior valor
  // médio — não 100, que deixaria todas as barras quase vazias (as médias reais
  // ficam na casa de 2 a 4 pontos).
  const maiorMedia = stats
    ? Math.max(...ATTR_LABELS.map(([k]) => stats.averages[k]), 1)
    : 1;

  return (
    <div className="bg-black-linen">
      <section className="py-28 px-6 relative max-w-7xl mx-auto overflow-hidden">
        <div className="section-line-top" />

        <Reveal>
          <div className="text-center mb-16">
            <span className="section-eyebrow">Pós-Experiência</span>
            <h2 className="text-5xl text-[var(--parchment)] mb-4">
              Dashboard <span className="gold-grad">ao Vivo</span>
            </h2>
            <p className="text-[rgba(240,226,189,0.6)] text-lg max-w-2xl mx-auto italic">
              Um painel dinâmico que transforma o projeto em análise de comportamento coletivo em tempo real.
            </p>
          </div>
        </Reveal>

        {!stats ? (
          <Reveal>
            <div className="paper-card paper-frame p-10 max-w-md mx-auto text-center">
              <Sparkles size={28} strokeWidth={1.4} className="text-[var(--seal)] mx-auto mb-3" />
              <p className="text-[.9rem] leading-relaxed">
                Ainda não há personagens gerados. Os números aparecem aqui assim que
                as primeiras fichas forem forjadas na taverna.
              </p>
            </div>
          </Reveal>
        ) : (
          <Stagger className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Totais */}
            <StaggerItem className="space-y-4">
              <div className="paper-card paper-frame p-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 bg-[#3f6b34] rounded-full animate-pulse" />
                  <span
                    className="text-[.55rem] text-[#3f6b34] tracking-[.25em] uppercase"
                    style={{ fontFamily: "var(--font-cinzel), serif" }}
                  >
                    Ao Vivo
                  </span>
                </div>
                <div
                  className="text-[2.8rem] text-[var(--ink)] leading-none mb-1"
                  style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
                >
                  <CountUp value={stats.total} />
                </div>
                <div
                  className="text-[.65rem] text-[var(--ink-50)] tracking-[.1em]"
                  style={{ fontFamily: "var(--font-cinzel), serif" }}
                >
                  {stats.total === 1 ? "Personagem forjado" : "Personagens forjados"}
                </div>
              </div>

              {maisComum && (
                <div className="paper-card paper-frame p-6">
                  <div
                    className="text-[.65rem] text-[var(--foil)] tracking-[.1em] mb-2"
                    style={{ fontFamily: "var(--font-cinzel), serif" }}
                  >
                    Mais Popular
                  </div>
                  <div
                    className="text-base text-[var(--ink)] leading-snug flex items-start gap-2"
                    style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
                  >
                    <span className="mt-0.5 flex-shrink-0">{classIcon(maisComum.name)}</span>
                    <span>{maisComum.name}</span>
                  </div>
                  <div
                    className="text-[.65rem] text-[var(--ink-50)] tracking-[.1em] mt-1"
                    style={{ fontFamily: "var(--font-cinzel), serif" }}
                  >
                    Classe mais comum · {maisComum.pct.toFixed(1)}%
                  </div>
                </div>
              )}

              <div className="paper-card paper-frame p-8 text-center">
                <Smartphone size={30} strokeWidth={1.4} className="text-[var(--seal)] mx-auto mb-3" />
                <h3
                  className="text-[.85rem] text-[var(--ink)] mb-2"
                  style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
                >
                  QR Code Digital
                </h3>
                <p className="text-[.82rem] leading-relaxed mb-4">
                  Escaneie e baixe seu card de RPG personalizado. Elimina custos de impressão e promove compartilhamento viral.
                </p>
                <div className="w-20 h-20 mx-auto bg-[#f8f0da] border border-[rgba(96,66,26,0.35)] p-1.5 grid grid-cols-5 gap-[2px]">
                  {[1,1,1,1,1, 1,0,0,0,1, 1,0,1,0,1, 1,0,0,0,1, 1,1,1,1,1].map((v, i) => (
                    <div key={i} className={v ? "bg-[#3c2a18]" : "bg-[#f8f0da]"} style={{ borderRadius: "1px" }} />
                  ))}
                </div>
              </div>
            </StaggerItem>

            {/* Distribuição de classes */}
            <StaggerItem>
              <div className="paper-card paper-frame p-8">
                <h3
                  className="text-[.8rem] text-[var(--foil)] tracking-[.15em] uppercase mb-5"
                  style={{ fontFamily: "var(--font-cinzel), serif" }}
                >
                  Distribuição de Classes
                </h3>
                <div className="space-y-4">
                  {top.map((cls, i) => (
                    <div key={cls.name}>
                      <div className="flex items-center justify-between mb-1 gap-2">
                        <div className="flex items-center gap-2 text-[.82rem] text-[var(--ink-70)] min-w-0">
                          <span className="flex-shrink-0">{classIcon(cls.name)}</span>
                          <span className="truncate">{cls.name}</span>
                        </div>
                        <span
                          className="text-[var(--foil)] text-[.7rem] flex-shrink-0 tabular-nums"
                          style={{ fontFamily: "var(--font-cinzel), serif" }}
                        >
                          {cls.pct.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-[rgba(96,66,26,0.14)] border border-[rgba(96,66,26,0.2)] overflow-hidden">
                        <AnimatedBar
                          pct={cls.pct}
                          delay={i * 0.08}
                          className="opacity-90 bg-gradient-to-r from-[var(--seal)] to-[var(--gold)]"
                        />
                      </div>
                    </div>
                  ))}

                  {resto.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-1 gap-2">
                        <div className="flex items-center gap-2 text-[.82rem] text-[var(--ink-70)] min-w-0">
                          <span className="flex-shrink-0">✦</span>
                          <span className="truncate">
                            {resto.length === 1 ? "Outra classe" : `Outras ${resto.length} classes`}
                          </span>
                        </div>
                        <span
                          className="text-[var(--foil)] text-[.7rem] flex-shrink-0 tabular-nums"
                          style={{ fontFamily: "var(--font-cinzel), serif" }}
                        >
                          {restoPct.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-[rgba(96,66,26,0.14)] border border-[rgba(96,66,26,0.2)] overflow-hidden">
                        <AnimatedBar
                          pct={restoPct}
                          delay={TOP_N * 0.08}
                          className="opacity-60 bg-gradient-to-r from-[var(--seal)] to-[var(--gold)]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </StaggerItem>

            {/* Atributos médios + QR */}
            <StaggerItem className="space-y-4">
              <div className="paper-card paper-frame p-8">
                <h3
                  className="text-[.8rem] text-[var(--foil)] tracking-[.15em] uppercase mb-5"
                  style={{ fontFamily: "var(--font-cinzel), serif" }}
                >
                  Atributos Médios
                </h3>
                <div className="space-y-3">
                  {ATTR_LABELS.map(([key, label, icon], i) => (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1 gap-2">
                        <div className="flex items-center gap-2 text-[.82rem] text-[var(--ink-70)] min-w-0">
                          <span className="flex-shrink-0">{icon}</span>
                          <span className="truncate">{label}</span>
                        </div>
                        <span
                          className="text-[var(--foil)] text-[.7rem] flex-shrink-0 tabular-nums"
                          style={{ fontFamily: "var(--font-cinzel), serif" }}
                        >
                          {stats.averages[key].toFixed(1)}
                        </span>
                      </div>
                      <div className="h-1.5 bg-[rgba(96,66,26,0.14)] border border-[rgba(96,66,26,0.2)] overflow-hidden">
                        <AnimatedBar
                          pct={(stats.averages[key] / maiorMedia) * 100}
                          delay={i * 0.08}
                          className="opacity-90 bg-gradient-to-r from-[var(--seal)] to-[var(--gold)]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[.7rem] text-[var(--ink-50)] italic mt-4 leading-relaxed">
                  Média por atributo entre {stats.total === 1 ? "o personagem gerado" : `os ${stats.total} personagens gerados`}. As barras comparam os atributos entre si.
                </p>
              </div>

            </StaggerItem>
          </Stagger>
        )}
      </section>
    </div>
  );
}
