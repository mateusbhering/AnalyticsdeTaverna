"use client";

import { QRCodeSVG } from "qrcode.react";
import { useRef, useMemo } from "react";
import type { Dimensions } from "./QuizForm";

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

function byName(name: string): ClassInfo {
  return CLASS_LIST.find((c) => c.name === name) ?? CLASS_LIST[0];
}

interface Attributes {
  forca: number;
  inteligencia: number;
  agilidade: number;
  resistencia: number;
  carisma: number;
  sabedoria: number;
  caos: number;
}

function calcAttributes(dims: Dimensions): Attributes {
  return {
    forca:        dims.persistencia + dims.lideranca + Math.round(dims.impulsividade * 0.5),
    inteligencia: dims.estrategia + dims.percepcao,
    agilidade:    dims.adaptabilidade + Math.round(dims.impulsividade * 0.5),
    resistencia:  dims.disciplina + dims.persistencia,
    carisma:      dims.sociabilidade + dims.lideranca,
    sabedoria:    dims.empatia + dims.percepcao,
    caos:         dims.criatividade + dims.impulsividade,
  };
}

function determineClass(dims: Dimensions, tags: string[]): ClassInfo {
  const tc = (tag: string) => tags.filter((t) => t === tag).length;

  if (dims.estrategia >= 15 && tc("TECNOLÓGICO") >= 3 && tc("NERD") >= 2)                                          return byName("Mago do ChatGPT");
  if (dims.adaptabilidade >= 12 && tc("FURTIVO") >= 3 && tc("PROCRASTINADOR") >= 2)                                return byName("Ninja do Visto por Último");
  if (dims.impulsividade >= 14 && tc("ATLETA") >= 3 && tc("DOPAMINA") >= 2)                                        return byName("Berserker do Crossfit");
  if (dims.disciplina >= 15 && tc("PERFECCIONISTA") >= 3 && tc("NERD") >= 2)                                       return byName("Necromante de Planilha");
  if (dims.adaptabilidade >= 13 && tc("FURTIVO") >= 2 && tc("PROCRASTINADOR") >= 2 && dims.sociabilidade < 10)    return byName("Ladino do Home Office");
  if (dims.persistencia >= 14 && tc("ANSIOSO") >= 3 && tc("RESOLUTIVO") >= 2)                                      return byName("Warlock do Boleto");
  if (dims.sociabilidade >= 14 && tc("EXTROVERTIDO") >= 3 && tc("MALANDRO") >= 2)                                  return byName("Ilusionista de Call");
  if (dims.criatividade >= 15 && tc("GAMBIARRA") >= 3 && tc("RESOLUTIVO") >= 2)                                    return byName("Artífice da Gambiarra");
  if (dims.impulsividade >= 12 && tc("DOPAMINA") >= 3 && tc("PROCRASTINADOR") >= 2)                                return byName("Invocador de iFood");
  if (dims.empatia >= 14 && tc("ZEN") >= 3 && tc("INTROVERTIDO") >= 2)                                             return byName("Druida de Varanda");
  if (dims.disciplina >= 14 && tc("ZEN") >= 2 && tc("RESOLUTIVO") >= 3)                                            return byName("Ranger da Faxina");
  if (dims.sociabilidade >= 15 && tc("EXTROVERTIDO") >= 3 && tc("DOPAMINA") >= 2)                                  return byName("Bardo do Karaokê");
  if (dims.estrategia >= 12 && tc("CAÓTICO") >= 3 && tc("MALANDRO") >= 2)                                          return byName("Xamã das Criptomoedas");
  if (dims.percepcao >= 15 && tc("ANSIOSO") >= 4 && tc("OVERTHINKING") >= 3)                                       return byName("Vidente da Ansiedade");
  if (dims.lideranca >= 15 && tc("LÍDER") >= 3 && tc("JUSTICEIRO") >= 2)                                           return byName("Paladino do Grupo");
  if (dims.empatia >= 13 && tc("CURADOR") >= 3 && tc("ZEN") >= 2)                                                  return byName("Domador de Pet");

  // Fallback: dominant dimension
  const entries = Object.entries(dims) as [keyof Dimensions, number][];
  const dominant = entries.reduce((a, b) => (b[1] > a[1] ? b : a))[0];
  const fallback: Record<keyof Dimensions, string> = {
    lideranca:      "Paladino do Grupo",
    estrategia:     "Mago do ChatGPT",
    disciplina:     "Necromante de Planilha",
    persistencia:   "Warlock do Boleto",
    sociabilidade:  "Bardo do Karaokê",
    empatia:        "Domador de Pet",
    adaptabilidade: "Ladino do Home Office",
    criatividade:   "Artífice da Gambiarra",
    impulsividade:  "Invocador de iFood",
    percepcao:      "Vidente da Ansiedade",
  };
  return byName(fallback[dominant]);
}

const ATTR_LABELS: [keyof Attributes, string, string][] = [
  ["forca",        "Força",        "💪"],
  ["inteligencia", "Inteligência", "🧠"],
  ["agilidade",    "Agilidade",    "⚡"],
  ["resistencia",  "Resistência",  "🛡️"],
  ["carisma",      "Carisma",      "✨"],
  ["sabedoria",    "Sabedoria",    "👁️"],
  ["caos",         "Caos",         "🌪️"],
];

interface Props {
  photo: string;
  dims: Dimensions;
  tags: string[];
  onRestart: () => void;
}

export default function CharacterResult({ photo, dims, tags, onRestart }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);

  const attrs = useMemo(() => calcAttributes(dims), [dims]);
  const rpgClass = useMemo(() => determineClass(dims, tags), [dims, tags]);

  const maxAttr = Math.max(...Object.values(attrs), 1);
  const barPct = (v: number) => Math.round((v / maxAttr) * 100);

  const qrData = `${typeof window !== "undefined" ? window.location.origin : ""}/personagem?classe=${encodeURIComponent(rpgClass.name)}&for=${attrs.forca}&int=${attrs.inteligencia}&agi=${attrs.agilidade}&res=${attrs.resistencia}&car=${attrs.carisma}&sab=${attrs.sabedoria}&cao=${attrs.caos}`;

  return (
    <div className="space-y-6">
      <div
        ref={cardRef}
        className={`rounded-3xl bg-gradient-to-br from-[#0d001a] to-[#050010] border ${rpgClass.border} p-6 shadow-2xl`}
      >
        {/* Class badge */}
        <div className="text-center mb-6">
          <div className={`inline-flex w-20 h-20 rounded-2xl bg-gradient-to-br ${rpgClass.color} items-center justify-center text-5xl shadow-xl mb-3`}>
            {rpgClass.icon}
          </div>
          <h2 className="text-3xl font-black text-white">{rpgClass.name}</h2>
          <p className="text-purple-300/70 text-sm mt-1 max-w-xs mx-auto">{rpgClass.desc}</p>
        </div>

        {/* Photo */}
        <div className="flex justify-center mb-6">
          <div className={`w-28 h-28 rounded-full overflow-hidden border-4 bg-gradient-to-br ${rpgClass.color} shadow-xl`} style={{ borderColor: "rgba(124,58,237,0.6)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo} alt="Seu personagem" className="w-full h-full object-cover" />
          </div>
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

        {/* QR Code */}
        <div className="flex flex-col items-center gap-3 pt-4 border-t border-purple-900/40">
          <p className="text-purple-400/60 text-xs uppercase tracking-widest">Seu Card Digital</p>
          <div className="bg-white p-3 rounded-xl shadow-lg">
            <QRCodeSVG value={qrData} size={120} bgColor="#ffffff" fgColor="#1a0033" />
          </div>
          <p className="text-purple-400/50 text-xs text-center">
            Escaneie para compartilhar seu personagem
          </p>
        </div>
      </div>

      <button
        onClick={onRestart}
        className="w-full py-4 rounded-2xl bg-white/5 border border-purple-800/30 text-purple-300 font-semibold hover:bg-white/10 hover:text-white transition-all"
      >
        🔄 Jogar novamente
      </button>
    </div>
  );
}
