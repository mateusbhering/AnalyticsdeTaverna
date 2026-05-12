"use client";

import { QRCodeSVG } from "qrcode.react";
import { useRef } from "react";

const CLASSES = [
  { name: "Guerreiro", icon: "⚔️", color: "from-red-700 to-red-900", border: "border-red-600/50", desc: "Força inabalável e resistência lendária. Você avança sem hesitar." },
  { name: "Mago", icon: "🔮", color: "from-blue-700 to-blue-900", border: "border-blue-600/50", desc: "Mestre do arcano. Sua inteligência dobra a realidade à sua vontade." },
  { name: "Ladino", icon: "🗡️", color: "from-gray-700 to-gray-900", border: "border-gray-500/50", desc: "Nas sombras, aguarda o momento perfeito. Sua agilidade é inigualável." },
  { name: "Paladino", icon: "🏰", color: "from-amber-700 to-amber-900", border: "border-amber-600/50", desc: "Guardião da luz. Carisma e resistência caminham juntos em você." },
  { name: "Arqueiro", icon: "🏹", color: "from-green-700 to-green-900", border: "border-green-600/50", desc: "Precisão cirúrgica. Você nunca erra o alvo, mesmo na escuridão." },
];

interface Attributes {
  forca: number;
  inteligencia: number;
  agilidade: number;
  carisma: number;
  resistencia: number;
}

interface Props {
  photo: string;
  attributes: Attributes;
  onRestart: () => void;
}

function getClass(attrs: Attributes) {
  const scores = [
    attrs.forca + attrs.resistencia,
    attrs.inteligencia * 1.5,
    attrs.agilidade * 1.5,
    attrs.carisma + attrs.resistencia,
    attrs.agilidade + attrs.inteligencia,
  ];
  return CLASSES[scores.indexOf(Math.max(...scores))];
}

const ATTR_LABELS: [keyof Attributes, string, string][] = [
  ["forca", "Força", "💪"],
  ["inteligencia", "Inteligência", "🧠"],
  ["agilidade", "Agilidade", "⚡"],
  ["carisma", "Carisma", "✨"],
  ["resistencia", "Resistência", "🛡️"],
];

export default function CharacterResult({ photo, attributes, onRestart }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rpgClass = getClass(attributes);

  const qrData = `${typeof window !== "undefined" ? window.location.origin : ""}/personagem?classe=${encodeURIComponent(rpgClass.name)}&forca=${attributes.forca}&int=${attributes.inteligencia}&agi=${attributes.agilidade}&car=${attributes.carisma}&res=${attributes.resistencia}`;

  return (
    <div className="space-y-6">
      {/* Character card */}
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
                <span className="text-amber-400 font-bold text-sm">{attributes[key]}</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${rpgClass.color} transition-all duration-700`}
                  style={{ width: `${attributes[key]}%` }}
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
