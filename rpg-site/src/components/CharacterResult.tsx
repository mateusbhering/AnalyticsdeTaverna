"use client";

import { QRCodeSVG } from "qrcode.react";
import { Download, Share2 } from "lucide-react";
import {
  useRef,
  useMemo,
  useEffect,
  useState,
  useSyncExternalStore,
  type MouseEvent,
} from "react";
import type { Dimensions } from "./QuizForm";
import { useAvatarGeneration, dataUrlToBlob } from "@/lib/useAvatarGeneration";
import { getSupabaseClient } from "@/lib/supabase";

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

function byName(name: string): ClassInfo {
  return CLASS_LIST.find((c) => c.name === name) ?? CLASS_LIST[0];
}

/** Nome do arquivo ao baixar o avatar: slug da classe + extensão do data URL. */
function avatarFileName(className: string, dataUrl: string): string {
  const mime = /^data:(.*?);/.exec(dataUrl)?.[1] ?? "image/png";
  const ext = mime === "image/jpeg" ? "jpg" : mime === "image/webp" ? "webp" : "png";
  const slug = className
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `avatar-${slug}.${ext}`;
}

/** Estilo comum dos botões sobre o avatar (baixar / compartilhar). */
const AVATAR_ACTION_CLASS =
  "press w-8 h-8 flex items-center justify-center bg-[rgba(23,13,6,0.78)] border border-[rgba(230,188,106,0.45)] text-[var(--gold-light)] hover:bg-[rgba(23,13,6,0.92)] hover:border-[var(--gold-light)] hover:text-[var(--parchment)] transition-colors";

// O navegador consegue abrir a folha nativa com um arquivo? Na prática isso é
// "está num celular": desktops não implementam share de arquivos. A resposta
// não muda durante a sessão, então memorizamos — `useSyncExternalStore` exige
// um snapshot estável.
let fileShareSupport: boolean | null = null;
function supportsFileShare(): boolean {
  if (fileShareSupport === null) {
    try {
      const probe = new File([new Uint8Array()], "probe.png", { type: "image/png" });
      fileShareSupport = navigator.canShare?.({ files: [probe] }) === true;
    } catch {
      fileShareSupport = false;
    }
  }
  return fileShareSupport;
}
// A capacidade nunca muda: subscribe é um no-op e o servidor sempre vê `false`,
// o que mantém o HTML do SSR igual ao da primeira renderização no cliente.
const noopSubscribe = () => () => {};

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

  const entries = Object.entries(dims) as [keyof Dimensions, number][];
  const dominant = entries.reduce((a, b) => (b[1] > a[1] ? b : a))[0];
  const fallback: Record<keyof Dimensions, string> = {
    lideranca: "Paladino do Grupo", estrategia: "Mago do ChatGPT", disciplina: "Necromante de Planilha",
    persistencia: "Warlock do Boleto", sociabilidade: "Bardo do Karaokê", empatia: "Domador de Pet",
    adaptabilidade: "Ladino do Home Office", criatividade: "Artífice da Gambiarra",
    impulsividade: "Invocador de iFood", percepcao: "Vidente da Ansiedade",
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

  // A geração do avatar acontece AQUI (não durante o quiz), porque só agora a
  // classe é conhecida — assim o avatar é gerado no estilo da classe do jogador.
  const { status: avatarStatus, avatarUrl, jobId, start } = useAvatarGeneration();
  useEffect(() => {
    if (photo) start(photo, rpgClass.name);
  }, [start, photo, rpgClass.name]);

  const maxAttr = Math.max(...Object.values(attrs), 1);
  const barPct = (v: number) => Math.round((v / maxAttr) * 100);

  const uniqueTags = [...new Set(tags)].slice(0, 5);

  // ── Salva o jogador e gera um LINK ÚNICO compartilhável (/personagem?id=) ──
  // Roda uma vez quando o avatar chega a um estado terminal (done ou error).
  const savedRef = useRef(false);
  const [personagemId, setPersonagemId] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  // Botão de compartilhar só onde a folha nativa existe (celular). No servidor
  // e na primeira renderização do cliente o snapshot é o mesmo — sem hydration
  // mismatch; o botão surge no primeiro reconcile no browser.
  const canShare = useSyncExternalStore(noopSubscribe, supportsFileShare, () => false);

  useEffect(() => {
    if (avatarStatus !== "done" && avatarStatus !== "error") return;
    if (savedRef.current || !jobId) return;

    // Dedup por sessão (resiste a remontagens): evita salvar 2x o mesmo jogador.
    const dedupKey = `taverna:player:${jobId}`;
    const cached = typeof window !== "undefined" ? sessionStorage.getItem(dedupKey) : null;
    if (cached) {
      setPersonagemId(Number(cached));
      savedRef.current = true;
      return;
    }
    savedRef.current = true;

    const supabaseBase = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    const fotoUrl =
      avatarStatus === "done" && supabaseBase
        ? `${supabaseBase}/storage/v1/object/public/avatars/${jobId}.jpg`
        : null;

    (async () => {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from("jogadores")
          .insert([
            {
              classe: rpgClass.name,
              forca: attrs.forca,
              inteligencia: attrs.inteligencia,
              agilidade: attrs.agilidade,
              resistencia: attrs.resistencia,
              carisma: attrs.carisma,
              sabedoria: attrs.sabedoria,
              caos: attrs.caos,
              foto_url: fotoUrl,
            },
          ])
          .select();
        if (error) {
          console.error("Erro ao salvar personagem:", error);
          savedRef.current = false; // permite fallback pro link por params
          return;
        }
        const id = data[0].id as number;
        setPersonagemId(id);
        if (typeof window !== "undefined") sessionStorage.setItem(dedupKey, String(id));
      } catch (e) {
        console.error("Supabase indisponível:", e);
        savedRef.current = false;
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [avatarStatus, jobId]);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  // Link por id quando salvo; senão (ou se o save falhar) cai no link por params,
  // que também funciona e carrega o avatar do Supabase.
  const paramLink =
    `${origin}/personagem?classe=${encodeURIComponent(rpgClass.name)}` +
    `&for=${attrs.forca}&int=${attrs.inteligencia}&agi=${attrs.agilidade}` +
    `&res=${attrs.resistencia}&car=${attrs.carisma}&sab=${attrs.sabedoria}&cao=${attrs.caos}` +
    (avatarStatus === "done" && jobId ? `&avatar=${jobId}` : "");
  const terminal = avatarStatus === "done" || avatarStatus === "error";
  const shareUrl =
    personagemId != null ? `${origin}/personagem?id=${personagemId}` : terminal ? paramLink : null;

  // Baixar: download direto em qualquer plataforma. O data URL vira Blob URL
  // antes de baixar porque data URLs longos travam ou são bloqueados em vários
  // navegadores móveis; com Blob URL o arquivo cai em Downloads (desktop) ou
  // Downloads/Arquivos (celular).
  // Se a conversão falhar, o clique segue para o href/download do próprio <a>.
  const saveAvatar = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!avatarUrl) return;

    let objectUrl: string;
    try {
      objectUrl = URL.createObjectURL(dataUrlToBlob(avatarUrl));
    } catch {
      return; // fallback: o navegador baixa o data URL do href
    }

    e.preventDefault();
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = avatarFileName(rpgClass.name, avatarUrl);
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    // Revogar na hora aborta o download em alguns navegadores; espera o início.
    setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
  };

  // Compartilhar: só aparece onde a folha nativa aceita arquivos (celular). É o
  // único caminho até a galeria — ela oferece "Salvar imagem" / "Save to Photos",
  // coisa que nenhum download consegue fazer.
  const shareAvatar = () => {
    if (!avatarUrl) return;
    // Conversão síncrona de propósito: um await aqui perderia o gesto do
    // usuário e o Safari do iOS recusaria o navigator.share.
    const blob = dataUrlToBlob(avatarUrl);
    const file = new File([blob], avatarFileName(rpgClass.name, avatarUrl), {
      type: blob.type,
    });
    if (!navigator.canShare?.({ files: [file] })) return;

    navigator.share({ files: [file], title: rpgClass.name }).catch(() => {
      /* usuário fechou a folha de compartilhamento */
    });
  };

  const copyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard indisponível */
    }
  };

  return (
    <div className="space-y-5">
      {/* Result card */}
      <div ref={cardRef} className="paper-card paper-frame arcane-corners p-9">
        <span className="ac-bl" /><span className="ac-br" />

        {/* Class reveal */}
        <div className="text-center mb-6">
          <span
            className="section-eyebrow"
            style={{
              fontSize: ".6rem",
              letterSpacing: ".35em",
              marginBottom: "16px",
              color: "var(--seal)",
              opacity: 0.9,
            }}
          >
            Manifestação do Ser
          </span>

          {/* Brasão da classe — lacre de cera */}
          <div className="wax-seal !w-20 !h-20 mx-auto text-4xl mb-4">
            {rpgClass.icon}
          </div>

          <h2
            className="text-[1.7rem] text-[var(--seal)] mb-1"
            style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
          >
            {rpgClass.name}
          </h2>
          <p className="text-[.95rem] italic max-w-xs mx-auto leading-relaxed mb-4">
            {rpgClass.desc}
          </p>

          {/* Retrato: só o avatar gerado pela IA. Enquanto gera, mostra o loading;
              em caso de erro, uma mensagem — sem foto de placeholder da classe. */}
          <div className="flex flex-col items-center gap-2 mb-4">
            <div className="polaroid !p-2">
              <div className="relative w-48 h-48 border border-[rgba(96,66,26,0.4)] overflow-hidden bg-[rgba(23,13,6,0.9)]">
                {avatarStatus === "done" && avatarUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={avatarUrl}
                      alt={rpgClass.name}
                      className="w-full h-full object-cover"
                      style={{ imageRendering: "auto" }}
                    />
                    {/* Ações do avatar — o data URL já traz a imagem inteira.
                        Baixar sempre; compartilhar só no celular (galeria). */}
                    <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
                      {canShare && (
                        <button
                          type="button"
                          onClick={shareAvatar}
                          title="Compartilhar avatar"
                          aria-label="Compartilhar avatar"
                          className={AVATAR_ACTION_CLASS}
                        >
                          <Share2 size={15} strokeWidth={1.8} />
                        </button>
                      )}
                      {/* O onClick baixa via Blob URL; o href/download é o fallback. */}
                      <a
                        href={avatarUrl}
                        download={avatarFileName(rpgClass.name, avatarUrl)}
                        onClick={saveAvatar}
                        title="Baixar avatar"
                        aria-label="Baixar avatar"
                        className={AVATAR_ACTION_CLASS}
                      >
                        <Download size={15} strokeWidth={1.8} />
                      </a>
                    </div>
                  </>
                ) : avatarStatus === "error" ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-3 text-center">
                    <span className="text-2xl opacity-50">🎭</span>
                    <span
                      className="text-[rgba(240,226,189,0.65)] text-[.55rem] tracking-[.12em] uppercase leading-relaxed"
                      style={{ fontFamily: "var(--font-cinzel), serif" }}
                    >
                      Não foi possível conjurar seu avatar
                    </span>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <div className="w-8 h-8 border-2 border-[rgba(230,188,106,0.3)] border-t-[var(--gold-light)] rounded-full animate-spin" />
                    <span
                      className="text-[rgba(240,226,189,0.85)] text-[.55rem] tracking-[.2em] uppercase text-center px-2"
                      style={{ fontFamily: "var(--font-cinzel), serif" }}
                    >
                      Conjurando seu avatar…
                    </span>
                  </div>
                )}
              </div>
            </div>
            {avatarStatus === "done" && avatarUrl && (
              <span
                className="text-[var(--foil)] text-[.55rem] tracking-[.25em] uppercase"
                style={{ fontFamily: "var(--font-cinzel), serif" }}
              >
                ✦ Avatar Arcano
              </span>
            )}
          </div>

          {/* Tags */}
          {uniqueTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 justify-center">
              {uniqueTags.map((t) => (
                <span key={t} className="tag-pill">{t}</span>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="divider my-5" />

        {/* Attributes */}
        <div className="mb-5">
          <div
            className="text-[.7rem] tracking-[.2em] uppercase text-[var(--foil)] mb-4 text-center"
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
                      className="text-[var(--foil)] text-[.7rem] uppercase tracking-[.15em]"
                      style={{ fontFamily: "var(--font-cinzel), serif" }}
                    >
                      {label}
                    </span>
                  </div>
                  <span
                    className="text-[var(--ink)] text-[.85rem]"
                    style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
                  >
                    {attrs[key]}
                  </span>
                </div>
                <div className="h-1.5 bg-[rgba(96,66,26,0.15)] border border-[rgba(96,66,26,0.25)] overflow-hidden">
                  <div className="stat-bar-fill" style={{ width: `${barPct(attrs[key])}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Link único compartilhável */}
        <div className="pt-5 border-t border-[rgba(96,66,26,0.25)] flex flex-col items-center gap-3">
          <span
            className="text-[.55rem] tracking-[.3em] uppercase text-[var(--foil)]"
            style={{ fontFamily: "var(--font-cinzel), serif" }}
          >
            Seu Card Digital
          </span>
          {shareUrl ? (
            <>
              <div className="bg-[#f8f0da] border border-[rgba(96,66,26,0.35)] p-2.5">
                <QRCodeSVG value={shareUrl} size={120} bgColor="#f8f0da" fgColor="#3c2a18" />
              </div>
              <button
                onClick={copyLink}
                className="press px-5 py-2 bg-[rgba(60,42,24,0.06)] border border-[rgba(96,66,26,0.5)] text-[var(--ink)] text-[.6rem] tracking-[.15em] uppercase hover:border-[var(--seal)] hover:text-[var(--seal)] transition-all cursor-pointer"
                style={{ fontFamily: "var(--font-cinzel), serif" }}
              >
                {copied ? "✓ Link copiado" : "🔗 Copiar link"}
              </button>
              <p className="text-[.78rem] italic text-center">
                Escaneie ou compartilhe o link do seu personagem
              </p>
            </>
          ) : (
            <>
              <div className="w-[120px] h-[120px] flex items-center justify-center bg-[rgba(60,42,24,0.08)] border border-[rgba(96,66,26,0.3)]">
                <div className="w-7 h-7 border-2 border-[rgba(138,100,40,0.35)] border-t-[var(--foil)] rounded-full animate-spin" />
              </div>
              <p className="text-[.78rem] italic text-center">
                Preparando seu link…
              </p>
            </>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={onRestart}
          className="btn-parchment flex-1 min-w-[140px] py-4 text-[.75rem] tracking-[.12em] uppercase text-center cursor-pointer"
          style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
        >
          🔄 Jogar Novamente
        </button>
        <a
          href="/"
          className="btn-seal flex-1 min-w-[140px] py-4 text-[.75rem] tracking-[.12em] uppercase text-center"
          style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
        >
          ✦ Voltar ao Início
        </a>
      </div>
    </div>
  );
}
