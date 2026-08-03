"use client";

import { useState, useEffect } from "react";
import {
  Wrench,
  WandSparkles,
  House,
  BarChart3,
  Pizza,
  Telescope,
  Sparkles,
  Lightbulb,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import CountUp from "@/components/ui/count-up";
import AnimatedBar from "@/components/ui/animated-bar";

const classDistribution: { name: string; pct: number; Icon: LucideIcon }[] = [
  { name: "Artífice da Gambiarra", pct: 19, Icon: Wrench },
  { name: "Mago do ChatGPT",       pct: 17, Icon: WandSparkles },
  { name: "Ladino do Home Office", pct: 15, Icon: House },
  { name: "Necromante de Planilha",pct: 13, Icon: BarChart3 },
  { name: "Invocador de iFood",    pct: 11, Icon: Pizza },
  { name: "Vidente da Ansiedade",  pct: 10, Icon: Telescope },
  { name: "Outras 10 classes",     pct: 15, Icon: Sparkles },
];

const insights = [
  "A maioria apresenta perfil Adaptável — improvisação é a habilidade mais frequente entre os participantes.",
  "Pessoas com alta Percepção tendem a demorar mais nas perguntas e acumulam mais a tag OVERTHINKING.",
  "A combinação Criatividade + Impulsividade é a mais comum, gerando o perfil «Artífice da Gambiarra».",
];

export default function DashboardSection() {
  const [participants, setParticipants] = useState(1247);
  const [avgAttr, setAvgAttr] = useState(67.3);

  useEffect(() => {
    const iv = setInterval(() => {
      setParticipants((p) => p + Math.floor(Math.random() * 3));
      setAvgAttr((a) => Math.round((a + (Math.random() - 0.5) * 0.4) * 10) / 10);
    }, 2500);
    return () => clearInterval(iv);
  }, []);

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

        <Stagger className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Live stats column */}
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
                <CountUp value={participants} />
              </div>
              <div
                className="text-[.65rem] text-[var(--ink-50)] tracking-[.1em]"
                style={{ fontFamily: "var(--font-cinzel), serif" }}
              >
                Participantes totais
              </div>
            </div>

            <div className="paper-card paper-frame p-6">
              <div
                className="text-[.65rem] text-[var(--foil)] tracking-[.1em] mb-2"
                style={{ fontFamily: "var(--font-cinzel), serif" }}
              >
                Média Global
              </div>
              <div
                className="text-[2.8rem] text-[var(--seal)] leading-none mb-1"
                style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
              >
                <CountUp value={avgAttr} decimals={1} />
              </div>
              <div
                className="text-[.65rem] text-[var(--ink-50)] tracking-[.1em]"
                style={{ fontFamily: "var(--font-cinzel), serif" }}
              >
                Média de atributos
              </div>
            </div>

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
                <Wrench size={18} strokeWidth={1.6} className="text-[var(--seal)] mt-0.5 flex-shrink-0" />
                <span>Artífice<br />da Gambiarra</span>
              </div>
              <div
                className="text-[.65rem] text-[var(--ink-50)] tracking-[.1em] mt-1"
                style={{ fontFamily: "var(--font-cinzel), serif" }}
              >
                Classe mais comum
              </div>
            </div>
          </StaggerItem>

          {/* Distribution */}
          <StaggerItem>
            <div className="paper-card paper-frame p-8 h-full">
              <h3
                className="text-[.8rem] text-[var(--foil)] tracking-[.15em] uppercase mb-5"
                style={{ fontFamily: "var(--font-cinzel), serif" }}
              >
                Distribuição de Classes
              </h3>
              <div className="space-y-4">
                {classDistribution.map((cls, i) => (
                  <div key={cls.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 text-[.82rem] text-[var(--ink-70)]">
                        <cls.Icon size={15} strokeWidth={1.6} className="text-[var(--seal)] flex-shrink-0" />
                        <span className="truncate max-w-[150px]">{cls.name}</span>
                      </div>
                      <span
                        className="text-[var(--foil)] text-[.7rem] flex-shrink-0"
                        style={{ fontFamily: "var(--font-cinzel), serif" }}
                      >
                        {cls.pct}%
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
              </div>
            </div>
          </StaggerItem>

          {/* Insights + QR */}
          <StaggerItem className="space-y-4">
            <div className="paper-card paper-frame p-8">
              <h3
                className="text-[.75rem] text-[var(--foil)] tracking-[.15em] mb-4 flex items-center gap-2"
                style={{ fontFamily: "var(--font-cinzel), serif" }}
              >
                <Lightbulb size={15} strokeWidth={1.6} /> Insights Comportamentais
              </h3>
              <div className="space-y-4">
                {insights.map((insight, i) => (
                  <div key={i} className="flex gap-2.5 pb-4 border-b border-[rgba(96,66,26,0.18)] last:border-0 last:pb-0">
                    <div className="w-1 h-1 bg-[rgba(138,100,40,0.7)] flex-shrink-0 mt-2" />
                    <p className="text-[.88rem] leading-relaxed">{insight}</p>
                  </div>
                ))}
              </div>
            </div>

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
        </Stagger>
      </section>
    </div>
  );
}
