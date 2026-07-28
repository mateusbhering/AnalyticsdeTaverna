"use client";

import { useSearchParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { AVATAR_API_BASE } from "@/lib/useAvatarGeneration";

interface ClassInfo {
  name: string;
  icon: string;
  desc: string;
  photo: string;
}

const CLASS_LIST: ClassInfo[] = [
  { name: "Mago do ChatGPT",           icon: "🔮", desc: "Você não resolve problemas, você prompta soluções. Sua magia é a IA.",            photo: "/fotos_cartas/mago_do_chat_gpt.jpeg" },
  { name: "Ninja do Visto por Último", icon: "👁️", desc: "Visto. Não respondido. Estratégia ou procrastinação? Só você sabe.",              photo: "/fotos_cartas/ninja_do_visto_por_ultimo.jpeg" },
  { name: "Berserker do Crossfit",     icon: "💪", desc: "Você não falha missões. Você falha repetições. E tenta de novo.",                  photo: "/fotos_cartas/beserk_do_crossfit.jpeg" },
  { name: "Necromante de Planilha",    icon: "📊", desc: "Você ressuscita dados mortos e dá vida a abas que ninguém abre.",                  photo: "/fotos_cartas/necromante_de_planilha.png" },
  { name: "Ladino do Home Office",     icon: "🏠", desc: "Câmera desligada. Microfone no mudo. Em algum lugar sendo produtivo.",             photo: "/fotos_cartas/ladino_do_home_office.png" },
  { name: "Warlock do Boleto",         icon: "💸", desc: "Você fez um pacto sombrio com o sistema financeiro e sobreviveu.",                 photo: "/fotos_cartas/warlock_do_boleto.jpeg" },
  { name: "Ilusionista de Call",       icon: "🎭", desc: "Você parece presente em toda reunião. Ninguém sabe o que você faz.",               photo: "/fotos_cartas/ilusionista_de_call.png" },
  { name: "Artífice da Gambiarra",     icon: "🔧", desc: "Não é a solução certa. Mas funciona. E isso é o suficiente.",                      photo: "/fotos_cartas/artifice_da_gambiarra.png" },
  { name: "Invocador de iFood",        icon: "🍕", desc: "Você transforma tédio em pedido. Seu familiar é o entregador.",                    photo: "/fotos_cartas/invocador_de_ifood.png" },
  { name: "Druida de Varanda",         icon: "🌿", desc: "Você nutre plantas, gatos e amigos à distância com energia serena.",               photo: "/fotos_cartas/druida_de_varanda.png" },
  { name: "Ranger da Faxina",          icon: "🧹", desc: "Você limpa o ambiente e a mente ao mesmo tempo. Método sagrado.",                  photo: "/fotos_cartas/ranger_da_faxina.jpeg" },
  { name: "Bardo do Karaokê",          icon: "🎤", desc: "Você não canta bem. Você canta alto. E todo mundo ama.",                           photo: "/fotos_cartas/bardo_do_karaoke.jpeg" },
  { name: "Xamã das Criptomoedas",     icon: "📈", desc: "Você lê gráficos como runas. Seu portfólio é uma profecia.",                       photo: "/fotos_cartas/xama_das_criptomodeas.jpeg" },
  { name: "Vidente da Ansiedade",      icon: "🔭", desc: "Você previu todos os problemas. Inclusive os que não aconteceram.",                photo: "/fotos_cartas/vidente_da_ansiedade.jpeg" },
  { name: "Paladino do Grupo",         icon: "🏰", desc: "Você não deixa ninguém pra trás. Nem no grupo de zap, nem na vida.",               photo: "/fotos_cartas/paladino_do_grupo.jpeg" },
  { name: "Domador de Pet",            icon: "🐾", desc: "Você entende seu animal antes de entender as pessoas. Faz sentido.",               photo: "/fotos_cartas/domador_de_pet.png" },
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

  // Avatar gerado pela IA: se o QR trouxe um id, busca a imagem no backend.
  // Se tiver expirado (404), o onError cai na ilustração da classe.
  const avatarId = params.get("avatar");
  const portraitSrc = avatarId
    ? `${AVATAR_API_BASE}/avatar/image/${avatarId}`
    : rpgClass.photo;

  const attrs = Object.fromEntries(
    ATTR_LABELS.map(([key]) => [key, Number(params.get(key) ?? 0)])
  );
  const maxAttr = Math.max(...Object.values(attrs), 1);
  const barPct = (v: number) => Math.round((v / maxAttr) * 100);

  const pageUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div
      className="arcane-corners border-2 border-[rgba(184,134,11,0.35)] p-8"
      style={{
        background:
          "url('https://www.transparenttextures.com/patterns/dark-wood.png'), linear-gradient(160deg, rgba(30,10,4,.98) 0%, rgba(15,6,3,.98) 100%)",
      }}
    >
      <span className="ac-bl" /><span className="ac-br" />

      {/* Class header */}
      <div className="text-center mb-6">
        <span className="section-eyebrow" style={{ fontSize: ".6rem", letterSpacing: ".35em", marginBottom: "16px" }}>
          Manifestação do Ser
        </span>

        <div className="inline-flex w-20 h-20 bg-gradient-to-br from-[var(--wine)] to-[rgba(74,14,14,0.6)] border-2 border-[rgba(184,134,11,0.5)] items-center justify-center text-5xl mb-4">
          {rpgClass.icon}
        </div>

        <h1
          className="text-[1.6rem] text-[var(--gold)] mb-1"
          style={{
            fontFamily: "var(--font-cinzel-decorative), serif",
            textShadow: "0 0 20px rgba(184,134,11,0.4)",
          }}
        >
          {rpgClass.name}
        </h1>
        <p className="text-[rgba(244,228,188,0.55)] text-[.9rem] italic max-w-xs mx-auto leading-relaxed mb-4">
          {rpgClass.desc}
        </p>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={portraitSrc}
          alt={rpgClass.name}
          className="w-48 h-48 object-cover mx-auto border-2 border-[rgba(184,134,11,0.4)]"
          onError={(e) => {
            // Avatar expirado/indisponível → volta pra ilustração da classe.
            const img = e.currentTarget;
            if (!img.dataset.fallback) {
              img.dataset.fallback = "1";
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
          className="text-[.7rem] tracking-[.2em] uppercase text-[var(--gold)] opacity-70 mb-4 text-center"
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
                    className="text-[rgba(184,134,11,0.9)] text-[.7rem] uppercase tracking-[.15em]"
                    style={{ fontFamily: "var(--font-cinzel), serif" }}
                  >
                    {label}
                  </span>
                </div>
                <span
                  className="text-[var(--parchment)] text-[.85rem]"
                  style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
                >
                  {attrs[key]}
                </span>
              </div>
              <div className="h-1.5 bg-[rgba(184,134,11,0.1)] border border-[rgba(184,134,11,0.15)] overflow-hidden">
                <div className="stat-bar-fill" style={{ width: `${barPct(attrs[key])}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QR Code */}
      <div className="pt-5 border-t border-[rgba(184,134,11,0.15)] flex flex-col items-center gap-3">
        <span
          className="text-[.55rem] tracking-[.3em] uppercase text-[rgba(184,134,11,0.5)]"
          style={{ fontFamily: "var(--font-cinzel), serif" }}
        >
          Seu Card Digital
        </span>
        <div className="bg-white p-2.5">
          <QRCodeSVG value={pageUrl || "https://analytics-de-taverna.vercel.app"} size={120} bgColor="#ffffff" fgColor="#1a0033" />
        </div>
        <p className="text-[rgba(244,228,188,0.4)] text-[.78rem] italic text-center">
          Escaneie para compartilhar seu personagem
        </p>
      </div>
    </div>
  );
}
