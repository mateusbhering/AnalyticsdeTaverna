"use client";

import { useSearchParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";

interface ClassInfo {
  name: string;
  icon: string;
  color: string;
  border: string;
  desc: string;
}

const CLASS_LIST: ClassInfo[] = [
  { name: "Mago do ChatGPT",          icon: "🔮", color: "from-blue-700 to-violet-900",    border: "border-blue-500/50",    desc: "Você não resolve problemas, você prompta soluções. Sua magia é a IA." },
  { name: "Ninja do Visto por Último", icon: "👁️", color: "from-gray-700 to-gray-900",     border: "border-gray-500/50",    desc: "Visto. Não respondido. Estratégia ou procrastinação? Só você sabe." },
  { name: "Berserker do Crossfit",     icon: "💪", color: "from-red-700 to-orange-900",    border: "border-red-500/50",     desc: "Você não falha missões. Você falha repetições. E tenta de novo." },
  { name: "Necromante de Planilha",    icon: "📊", color: "from-emerald-800 to-teal-900",  border: "border-emerald-500/50", desc: "Você ressuscita dados mortos e dá vida a abas que ninguém abre." },
  { name: "Ladino do Home Office",     icon: "🏠", color: "from-slate-700 to-slate-900",   border: "border-slate-500/50",   desc: "Câmera desligada. Microfone no mudo. Em algum lugar sendo produtivo." },
  { name: "Warlock do Boleto",         icon: "💸", color: "from-amber-700 to-yellow-900",  border: "border-amber-500/50",   desc: "Você fez um pacto sombrio com o sistema financeiro e sobreviveu." },
  { name: "Ilusionista de Call",       icon: "🎭", color: "from-pink-700 to-rose-900",     border: "border-pink-500/50",    desc: "Você parece presente em toda reunião. Ninguém sabe o que você faz." },
  { name: "Artífice da Gambiarra",     icon: "🔧", color: "from-orange-700 to-amber-900",  border: "border-orange-500/50",  desc: "Não é a solução certa. Mas funciona. E isso é o suficiente." },
  { name: "Invocador de iFood",        icon: "🍕", color: "from-red-600 to-red-900",       border: "border-red-400/50",     desc: "Você transforma tédio em pedido. Seu familiar é o entregador." },
  { name: "Druida de Varanda",         icon: "🌿", color: "from-green-700 to-emerald-900", border: "border-green-500/50",   desc: "Você nutre plantas, gatos e amigos à distância com energia serena." },
  { name: "Ranger da Faxina",          icon: "🧹", color: "from-cyan-700 to-teal-900",     border: "border-cyan-500/50",    desc: "Você limpa o ambiente e a mente ao mesmo tempo. Método sagrado." },
  { name: "Bardo do Karaokê",          icon: "🎤", color: "from-fuchsia-700 to-pink-900",  border: "border-fuchsia-500/50", desc: "Você não canta bem. Você canta alto. E todo mundo ama." },
  { name: "Xamã das Criptomoedas",     icon: "📈", color: "from-yellow-700 to-orange-900", border: "border-yellow-500/50",  desc: "Você lê gráficos como runas. Seu portfólio é uma profecia." },
  { name: "Vidente da Ansiedade",      icon: "🔭", color: "from-indigo-700 to-purple-900", border: "border-indigo-500/50",  desc: "Você previu todos os problemas. Inclusive os que não aconteceram." },
  { name: "Paladino do Grupo",         icon: "🏰", color: "from-amber-600 to-yellow-800",  border: "border-amber-400/50",   desc: "Você não deixa ninguém pra trás. Nem no grupo de zap, nem na vida." },
  { name: "Domador de Pet",            icon: "🐾", color: "from-lime-700 to-green-900",    border: "border-lime-500/50",    desc: "Você entende seu animal antes de entender as pessoas. Faz sentido." },
];

const ATTR_LABELS: [string, string, string][] = [
  ["for", "Força",        "💪"],
  ["int", "Inteligência", "🧠"],
  ["agi", "Agilidade",    "⚡"],
  ["res", "Resistência",  "🛡️"],
  ["car", "Carisma",      "✨"],
  ["sab", "Sabedoria",    "👁️"],
  ["cao", "Caos",         "🌪️"],
];

export default function PersonagemCard() {
  const params = useSearchParams();

  const className = params.get("classe") ?? "";
  const rpgClass = CLASS_LIST.find((c) => c.name === className) ?? CLASS_LIST[0];

  const attrs = Object.fromEntries(
    ATTR_LABELS.map(([key]) => [key, Number(params.get(key) ?? 0)])
  );
  const maxAttr = Math.max(...Object.values(attrs), 1);
  const barPct = (v: number) => Math.round((v / maxAttr) * 100);

  const pageUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className={`rounded-3xl bg-gradient-to-br from-[#0d001a] to-[#050010] border ${rpgClass.border} p-6 shadow-2xl`}>
      {/* Class badge */}
      <div className="text-center mb-6">
        <div className={`inline-flex w-20 h-20 rounded-2xl bg-gradient-to-br ${rpgClass.color} items-center justify-center text-5xl shadow-xl mb-3`}>
          {rpgClass.icon}
        </div>
        <h1 className="text-2xl font-black text-white leading-snug">{rpgClass.name}</h1>
        <p className="text-purple-300/70 text-sm mt-1 max-w-xs mx-auto">{rpgClass.desc}</p>
      </div>

      {/* Attributes */}
      <div className="space-y-3 mb-6">
        {ATTR_LABELS.map(([key, label, icon]) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-purple-200/80 flex items-center gap-1.5">
                <span>{icon}</span> {label}
              </span>
              <span className="text-amber-400 font-bold text-sm">{attrs[key]}</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${rpgClass.color} transition-all duration-700`}
                style={{ width: `${barPct(attrs[key])}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* QR + label */}
      <div className="flex flex-col items-center gap-3 pt-4 border-t border-purple-900/40">
        <p className="text-purple-400/60 text-xs uppercase tracking-widest">Card Digital</p>
        <div className="bg-white p-3 rounded-xl shadow-lg">
          <QRCodeSVG value={pageUrl || "https://analytics-de-taverna.vercel.app"} size={112} bgColor="#ffffff" fgColor="#1a0033" />
        </div>
        <p className="text-purple-400/50 text-xs text-center">
          Escaneie para ver este personagem
        </p>
      </div>
    </div>
  );
}
