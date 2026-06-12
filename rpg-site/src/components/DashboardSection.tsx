"use client";

import { useState, useEffect } from "react";

const classDistribution = [
  { name: "Artífice da Gambiarra", pct: 19, icon: "🔧" },
  { name: "Mago do ChatGPT",       pct: 17, icon: "🔮" },
  { name: "Ladino do Home Office", pct: 15, icon: "🏠" },
  { name: "Necromante de Planilha",pct: 13, icon: "📊" },
  { name: "Invocador de iFood",    pct: 11, icon: "🍕" },
  { name: "Vidente da Ansiedade",  pct: 10, icon: "🔭" },
  { name: "Outras 10 classes",     pct: 15, icon: "✨" },
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

        <div className="text-center mb-16">
          <span className="section-eyebrow">Pós-Experiência</span>
          <h2 className="text-5xl text-[var(--parchment)] mb-4">
            Dashboard <span className="gold-grad">ao Vivo</span>
          </h2>
          <p className="text-[rgba(244,228,188,0.55)] text-lg max-w-2xl mx-auto italic">
            Um painel dinâmico que transforma o projeto em análise de comportamento coletivo em tempo real.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Live stats column */}
          <div className="space-y-4">
            <div className="arcane-corners bg-[rgba(15,9,5,0.9)] border border-[rgba(184,134,11,0.15)] p-6">
              <span className="ac-bl" /><span className="ac-br" />
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <span
                  className="text-[.55rem] text-green-400 tracking-[.25em] uppercase"
                  style={{ fontFamily: "var(--font-cinzel), serif" }}
                >
                  Ao Vivo
                </span>
              </div>
              <div
                className="text-[2.8rem] text-[var(--parchment)] leading-none mb-1"
                style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
              >
                {participants.toLocaleString("pt-BR")}
              </div>
              <div
                className="text-[.65rem] text-[rgba(244,228,188,0.45)] tracking-[.1em]"
                style={{ fontFamily: "var(--font-cinzel), serif" }}
              >
                Participantes totais
              </div>
            </div>

            <div className="arcane-corners bg-[rgba(15,9,5,0.9)] border border-[rgba(184,134,11,0.25)] p-6">
              <span className="ac-bl" /><span className="ac-br" />
              <div
                className="text-[.65rem] text-[var(--gold)] tracking-[.1em] mb-2"
                style={{ fontFamily: "var(--font-cinzel), serif" }}
              >
                Média Global
              </div>
              <div
                className="text-[2.8rem] text-[var(--gold)] leading-none mb-1"
                style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
              >
                {avgAttr.toFixed(1)}
              </div>
              <div
                className="text-[.65rem] text-[rgba(244,228,188,0.45)] tracking-[.1em]"
                style={{ fontFamily: "var(--font-cinzel), serif" }}
              >
                Média de atributos
              </div>
            </div>

            <div className="arcane-corners bg-[rgba(15,9,5,0.9)] border border-[rgba(184,134,11,0.15)] p-6">
              <span className="ac-bl" /><span className="ac-br" />
              <div
                className="text-[.65rem] text-[var(--copper)] tracking-[.1em] mb-2"
                style={{ fontFamily: "var(--font-cinzel), serif" }}
              >
                Mais Popular
              </div>
              <div
                className="text-base text-[var(--parchment)] leading-snug"
                style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
              >
                🔧 Artífice<br />da Gambiarra
              </div>
              <div
                className="text-[.65rem] text-[rgba(244,228,188,0.45)] tracking-[.1em] mt-1"
                style={{ fontFamily: "var(--font-cinzel), serif" }}
              >
                Classe mais comum
              </div>
            </div>
          </div>

          {/* Distribution */}
          <div className="arcane-corners bg-[rgba(15,9,5,0.9)] border border-[rgba(184,134,11,0.15)] p-8">
            <span className="ac-bl" /><span className="ac-br" />
            <h3
              className="text-[.8rem] text-[var(--gold)] tracking-[.15em] uppercase mb-5 opacity-80"
              style={{ fontFamily: "var(--font-cinzel), serif" }}
            >
              Distribuição de Classes
            </h3>
            <div className="space-y-4">
              {classDistribution.map((cls) => (
                <div key={cls.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 text-[.82rem] text-[rgba(244,228,188,0.7)]">
                      <span>{cls.icon}</span>
                      <span className="truncate max-w-[150px]">{cls.name}</span>
                    </div>
                    <span
                      className="text-[var(--gold)] text-[.7rem] flex-shrink-0"
                      style={{ fontFamily: "var(--font-cinzel), serif" }}
                    >
                      {cls.pct}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-[rgba(184,134,11,0.08)] border border-[rgba(184,134,11,0.1)] overflow-hidden">
                    <div
                      className="h-full opacity-80"
                      style={{
                        width: `${cls.pct}%`,
                        background: "linear-gradient(90deg, var(--wine), var(--gold))",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Insights + QR */}
          <div className="space-y-4">
            <div className="arcane-corners bg-[rgba(15,9,5,0.9)] border border-[rgba(184,134,11,0.15)] p-8">
              <span className="ac-bl" /><span className="ac-br" />
              <h3
                className="text-[.75rem] text-[var(--gold)] tracking-[.15em] opacity-80 mb-4"
                style={{ fontFamily: "var(--font-cinzel), serif" }}
              >
                💡 Insights Comportamentais
              </h3>
              <div className="space-y-4">
                {insights.map((insight, i) => (
                  <div key={i} className="flex gap-2.5 pb-4 border-b border-[rgba(184,134,11,0.08)] last:border-0 last:pb-0">
                    <div className="w-1 h-1 bg-[rgba(184,134,11,0.5)] flex-shrink-0 mt-2" />
                    <p className="text-[.88rem] text-[rgba(244,228,188,0.6)] leading-relaxed">{insight}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="arcane-corners bg-[rgba(15,9,5,0.9)] border border-[rgba(184,134,11,0.25)] p-8 text-center">
              <span className="ac-bl" /><span className="ac-br" />
              <div className="text-3xl mb-3">📱</div>
              <h3
                className="text-[.85rem] text-[var(--parchment)] mb-2"
                style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
              >
                QR Code Digital
              </h3>
              <p className="text-[rgba(184,134,11,0.6)] text-[.82rem] leading-relaxed mb-4">
                Escaneie e baixe seu card de RPG personalizado. Elimina custos de impressão e promove compartilhamento viral.
              </p>
              <div className="w-20 h-20 mx-auto bg-white p-1.5 grid grid-cols-5 gap-[2px]">
                {[1,1,1,1,1, 1,0,0,0,1, 1,0,1,0,1, 1,0,0,0,1, 1,1,1,1,1].map((v, i) => (
                  <div key={i} className={v ? "bg-[#1a0033]" : "bg-white"} style={{ borderRadius: "1px" }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
