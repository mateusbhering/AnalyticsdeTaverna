"use client";

import { useState, useEffect } from "react";

const classDistribution = [
  { name: "Guerreiro", pct: 32, color: "bg-red-500", icon: "⚔️" },
  { name: "Mago", pct: 28, color: "bg-blue-500", icon: "🔮" },
  { name: "Paladino", pct: 20, color: "bg-amber-500", icon: "🏰" },
  { name: "Ladino", pct: 12, color: "bg-gray-400", icon: "🗡️" },
  { name: "Arqueiro", pct: 8, color: "bg-green-500", icon: "🏹" },
];

const insights = [
  "A maioria das pessoas apresentou perfil mais impulsivo do que estratégico.",
  "Perfis com alto Carisma tendem a escolher o modo multiplayer.",
  "Guerreiros têm 23% mais vitórias em batalha contra IA.",
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
    <section className="py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(124,58,237,0.12)_0%,_transparent_70%)]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-600/40 to-transparent" />

      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-20">
          <span className="text-green-400 text-sm font-semibold uppercase tracking-widest">Pós-Experiência</span>
          <h2 className="text-5xl font-black text-white mt-3 mb-4">
            Dashboard <span className="text-gradient-purple">ao Vivo</span>
          </h2>
          <p className="text-purple-300/70 text-lg max-w-2xl mx-auto">
            Um painel dinâmico que transforma o projeto em uma análise de comportamento coletivo em tempo real.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live stats */}
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-2xl bg-white/3 border border-purple-800/30 p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-green-400 font-semibold uppercase tracking-widest">Ao Vivo</span>
              </div>
              <div className="text-5xl font-black text-white mb-1">{participants.toLocaleString()}</div>
              <div className="text-purple-400 text-sm">Participantes totais</div>
            </div>

            <div className="rounded-2xl bg-white/3 border border-amber-800/30 p-6 backdrop-blur-sm">
              <div className="text-xs text-amber-400 font-semibold uppercase tracking-widest mb-2">Média Global</div>
              <div className="text-5xl font-black text-amber-400 mb-1">{avgAttr}</div>
              <div className="text-purple-400 text-sm">Média de atributos</div>
            </div>

            <div className="rounded-2xl bg-white/3 border border-cyan-800/30 p-6 backdrop-blur-sm">
              <div className="text-xs text-cyan-400 font-semibold uppercase tracking-widest mb-2">Mais Popular</div>
              <div className="text-3xl font-black text-white mb-1">⚔️ Guerreiro</div>
              <div className="text-purple-400 text-sm">Classe mais comum</div>
            </div>
          </div>

          {/* Class distribution */}
          <div className="lg:col-span-1 rounded-2xl bg-white/3 border border-purple-800/30 p-8 backdrop-blur-sm">
            <h3 className="text-white font-bold text-lg mb-6">Distribuição de Classes</h3>
            <div className="space-y-5">
              {classDistribution.map((cls) => (
                <div key={cls.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 text-sm text-purple-200">
                      <span>{cls.icon}</span>
                      <span>{cls.name}</span>
                    </div>
                    <span className="text-amber-400 font-bold text-sm">{cls.pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className={`h-full rounded-full ${cls.color}`} style={{ width: `${cls.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Insights + QR */}
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-2xl bg-white/3 border border-purple-800/30 p-8 backdrop-blur-sm">
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <span>💡</span> Insights Comportamentais
              </h3>
              <div className="space-y-4">
                {insights.map((insight, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                    <p className="text-purple-300/80 leading-relaxed">{insight}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-amber-900/30 to-amber-800/10 border border-amber-600/30 p-8 backdrop-blur-sm text-center">
              <div className="text-4xl mb-3">📱</div>
              <h3 className="text-white font-bold text-lg mb-2">QR Code Digital</h3>
              <p className="text-amber-300/70 text-sm leading-relaxed">
                Escaneie e baixe seu card de RPG personalizado. Elimina custos de impressão e promove compartilhamento viral.
              </p>
              <div className="mt-4 w-20 h-20 mx-auto rounded-lg bg-white p-1.5 grid grid-cols-5 gap-0.5">
                {[1,1,1,1,1, 1,0,0,0,1, 1,0,1,0,1, 1,0,0,0,1, 1,1,1,1,1].map((v, i) => (
                  <div key={i} className={`rounded-sm ${v ? "bg-black" : "bg-white"}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
