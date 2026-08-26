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
import {
  useAvatarGeneration,
  dataUrlToBlob,
  mensagemDeFalha,
} from "@/lib/useAvatarGeneration";
import { getSupabaseClient } from "@/lib/supabase";
import { avisarNovoJogador } from "@/lib/stats-actions";
import { byName, type ClassInfo } from "@/lib/classes";
import { lembrarJogador } from "@/lib/jogador-local";


/** Nome do arquivo ao baixar o avatar: slug da classe + extensão do mime. */
function avatarFileName(className: string, mime: string): string {
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

/**
 * Classe de cada dimensão quando nenhuma regra bate, com as tags que aquela
 * classe usa na sua regra — servem para desempatar dimensões empatadas no topo.
 */
const FALLBACK: Record<keyof Dimensions, { name: string; tags: [string, string] }> = {
  lideranca:      { name: "Paladino do Grupo",       tags: ["LÍDER", "JUSTICEIRO"] },
  estrategia:     { name: "Mago do ChatGPT",         tags: ["TECNOLÓGICO", "NERD"] },
  disciplina:     { name: "Necromante de Planilha",  tags: ["PERFECCIONISTA", "NERD"] },
  persistencia:   { name: "Warlock do Boleto",       tags: ["ANSIOSO", "RESOLUTIVO"] },
  sociabilidade:  { name: "Bardo do Karaokê",        tags: ["EXTROVERTIDO", "DOPAMINA"] },
  empatia:        { name: "Domador de Pet",          tags: ["CURADOR", "ZEN"] },
  adaptabilidade: { name: "Ladino do Home Office",   tags: ["INTROVERTIDO", "FURTIVO"] },
  criatividade:   { name: "Artífice da Gambiarra",   tags: ["GAMBIARRA", "RESOLUTIVO"] },
  impulsividade:  { name: "Invocador de iFood",      tags: ["DOPAMINA", "PROCRASTINADOR"] },
  percepcao:      { name: "Vidente da Ansiedade",    tags: ["ANSIOSO", "OVERTHINKING"] },
};

const FALLBACK_KEYS = Object.keys(FALLBACK) as (keyof Dimensions)[];

/**
 * FNV-1a 32 bits + avalanche. Usado só para desempatar de forma estável: a mesma
 * partida precisa render sempre a mesma classe (o cartão é compartilhado por
 * link), então sortear com Math.random() aqui não serve.
 *
 * A avalanche no fim protege o consumo como `hash % n`, que lê os bits baixos —
 * os mais fracos do FNV-1a, já que multiplicar por uma constante ímpar preserva
 * o bit menos significativo (`% 2` tende à paridade dos bytes da entrada). Com as
 * entradas de hoje as duas versões medem uniformes; a avalanche é o que mantém
 * isso verdadeiro se a serialização do estado mudar.
 */
function hashState(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  h ^= h >>> 16;
  h = Math.imul(h, 0x7feb352d) >>> 0;
  h ^= h >>> 15;
  h = Math.imul(h, 0x846ca68b) >>> 0;
  h ^= h >>> 16;
  return h >>> 0;
}

/**
 * Classe do jogador: dimensões cruzadas com as tags acumuladas.
 *
 * Forma de cada regra — `dim >= D && tagA >= 1 && (tagA + tagB) >= S`:
 * a tag-assinatura da classe é obrigatória e a segunda tag *soma* afinidade.
 * Exigir as duas simultaneamente (`tagA >= x && tagB >= y`) é inviável num quiz
 * de 5 respostas: mesmo com os limiares no mínimo, essa forma só alcança 1,7%
 * a 15% dos jogadores por regra.
 *
 * Os limiares foram calibrados por simulação contra o banco real de perguntas
 * (300 mil partidas): cada regra captura de 2,4% a 7,7% dos jogadores e 73% do
 * total é classificado por regra — o resto cai no fallback por dimensão dominante.
 * Mexer nas perguntas muda essa distribuição; recalibre se editar o banco.
 */
function determineClass(dims: Dimensions, tags: string[]): ClassInfo {
  const tc = (tag: string) => tags.filter((t) => t === tag).length;
  const match = (dim: number, minDim: number, a: string, b: string, minSum: number) =>
    dim >= minDim && tc(a) >= 1 && tc(a) + tc(b) >= minSum;

  // Ordem = prioridade. Classes raras primeiro: as que dividem uma tag com outra
  // (ANSIOSO, FURTIVO, DOPAMINA…) precisam escolher antes de a genérica levar tudo.
  if (match(dims.estrategia,     4, "TECNOLÓGICO",    "NERD",           1)) return byName("Mago do ChatGPT");
  if (match(dims.adaptabilidade, 4, "FURTIVO",        "PROCRASTINADOR", 1)) return byName("Ninja do Visto por Último");
  if (match(dims.impulsividade,  3, "ATLETA",         "DOPAMINA",       1)) return byName("Berserker do Crossfit");
  if (match(dims.adaptabilidade, 3, "INTROVERTIDO",   "FURTIVO",        1)) return byName("Ladino do Home Office");
  if (match(dims.impulsividade,  3, "DOPAMINA",       "PROCRASTINADOR", 1)) return byName("Invocador de iFood");
  if (match(dims.sociabilidade,  3, "EXTROVERTIDO",   "DOPAMINA",       1)) return byName("Bardo do Karaokê");
  if (match(dims.sociabilidade,  2, "MALANDRO",       "EXTROVERTIDO",   1)) return byName("Ilusionista de Call");
  if (match(dims.lideranca,      3, "LÍDER",          "JUSTICEIRO",     1)) return byName("Paladino do Grupo");
  if (match(dims.persistencia,   2, "ANSIOSO",        "RESOLUTIVO",     1)) return byName("Warlock do Boleto");
  if (match(dims.percepcao,      2, "ANSIOSO",        "OVERTHINKING",   1)) return byName("Vidente da Ansiedade");
  if (match(dims.estrategia,     3, "CAÓTICO",        "MALANDRO",       1)) return byName("Xamã das Criptomoedas");
  if (match(dims.disciplina,     3, "PERFECCIONISTA", "NERD",           2)) return byName("Necromante de Planilha");
  if (match(dims.criatividade,   2, "GAMBIARRA",      "RESOLUTIVO",     2)) return byName("Artífice da Gambiarra");
  if (match(dims.empatia,        2, "CURADOR",        "ZEN",            2)) return byName("Domador de Pet");
  if (match(dims.empatia,        2, "ZEN",            "INTROVERTIDO",   2)) return byName("Druida de Varanda");
  if (match(dims.disciplina,     3, "ZEN",            "RESOLUTIVO",     1)) return byName("Ranger da Faxina");

  // Nenhuma regra bateu: a classe vem da dimensão dominante.
  const max = Math.max(...FALLBACK_KEYS.map((k) => dims[k]));
  let tied = FALLBACK_KEYS.filter((k) => dims[k] === max);

  // ~28% das partidas empatam no topo, então o desempate decide muita coisa.
  // Pegar o primeiro do objeto (o que um `reduce` faz) fazia a posição na lista
  // valer como critério: `lideranca` ganhava 100% dos empates de que participava
  // e `percepcao`, 0%. Critério 1 — afinidade com as tags da classe candidata.
  if (tied.length > 1) {
    const afinidade = (k: keyof Dimensions) =>
      FALLBACK[k].tags.reduce((n, t) => n + tc(t), 0);
    const topo = Math.max(...tied.map(afinidade));
    tied = tied.filter((k) => afinidade(k) === topo);
  }

  // Critério 2 — hash do estado. Continua determinístico (a mesma partida sempre
  // dá a mesma classe), mas nenhuma dimensão é favorecida pela posição.
  const escolhida =
    tied.length === 1
      ? tied[0]
      : tied[hashState(
          FALLBACK_KEYS.map((k) => dims[k]).join(",") + "|" + [...tags].sort().join(",")
        ) % tied.length];

  return byName(FALLBACK[escolhida].name);
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
  const {
    status: avatarStatus,
    avatarUrl,
    errorReason: avatarErro,
    jobId,
    start,
  } = useAvatarGeneration();
  useEffect(() => {
    if (photo) start(photo, rpgClass.name);
  }, [start, photo, rpgClass.name]);

  /* O avatar agora chega como URL do Storage, não mais como data URL. Baixar e
     compartilhar precisam dos BYTES, e `navigator.share` precisa deles de forma
     SÍNCRONA — um await dentro do handler perde o gesto do usuário e o Safari
     do iOS recusa. Então o blob é buscado assim que a URL aparece e fica
     guardado, pronto para os dois botões. */
  // Resultado no formato antigo (data URL): converte na hora, sem rede nem estado.
  const blobLocal = useMemo(() => {
    if (!avatarUrl?.startsWith("data:")) return null;
    try {
      return dataUrlToBlob(avatarUrl);
    } catch {
      return null;
    }
  }, [avatarUrl]);

  // Formato novo (URL do Storage): busca os bytes uma vez, guardando de qual
  // URL eles vieram — assim uma troca de avatar não serve o blob anterior.
  const [baixado, setBaixado] = useState<{ url: string; blob: Blob } | null>(null);
  useEffect(() => {
    if (!avatarUrl || avatarUrl.startsWith("data:")) return;
    let cancelado = false;
    fetch(avatarUrl)
      .then((r) => (r.ok ? r.blob() : null))
      .then((blob) => {
        // Sem os bytes os botões ficam inertes — a imagem continua na tela.
        if (!cancelado && blob) setBaixado({ url: avatarUrl, blob });
      })
      .catch(() => {});
    return () => {
      cancelado = true;
    };
  }, [avatarUrl]);

  const avatarBlob = blobLocal ?? (baixado?.url === avatarUrl ? baixado.blob : null);

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
      lembrarJogador(cached, uniqueTags);
      savedRef.current = true;
      return;
    }
    savedRef.current = true;

    const supabaseBase = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    const fotoUrl =
      avatarStatus === "done" && supabaseBase
        ? `${supabaseBase}/storage/v1/object/public/avatars/${jobId}.jpg`
        : null;

    // O que o card sempre soube gravar.
    const base = {
      classe: rpgClass.name,
      forca: attrs.forca,
      inteligencia: attrs.inteligencia,
      agilidade: attrs.agilidade,
      resistencia: attrs.resistencia,
      carisma: attrs.carisma,
      sabedoria: attrs.sabedoria,
      caos: attrs.caos,
      foto_url: fotoUrl,
    };

    (async () => {
      try {
        const supabase = getSupabaseClient();
        const salvar = (linha: object) =>
          supabase.from("jogadores").insert([linha]).select();

        let { data, error } = await salvar({
          ...base,
          // As tags NÃO são deriváveis do resto: a classe e os atributos saem
          // delas, mas o caminho não volta. Sem gravar aqui, quem sai do card e
          // volta por /personagem?id= perde as tags para sempre.
          tags: uniqueTags,
          // As 10 colunas de dimensão já existiam no schema e ficavam NULL.
          // As chaves de `Dimensions` batem uma a uma com os nomes delas.
          ...dims,
        });

        /* `tags` é coluna nova, e o banco é um deploy separado do frontend: se o
           `sql/schema.sql` ainda não rodou no Supabase, o insert volta 42703
           (undefined_column) e o jogador NUNCA seria salvo — sem id no aparelho,
           /batalha diria "você ainda não tem um herói" e o evento inteiro cairia.
           Nesse caso grava o formato antigo; as tags ficam só no espelho local
           até a migração rodar. Mesmo tropeço que o README documenta em
           `batalhas.rodadas`. */
        if (error?.code === "42703") {
          console.warn(
            "Coluna nova ausente em `jogadores` — rode sql/schema.sql no Supabase. " +
              "Salvando sem tags/dimensões por enquanto.",
            error.message,
          );
          ({ data, error } = await salvar(base));
        }

        if (error || !data) {
          console.error("Erro ao salvar personagem:", error);
          savedRef.current = false; // permite fallback pro link por params
          return;
        }
        const id = data[0].id as number;
        setPersonagemId(id);
        if (typeof window !== "undefined") sessionStorage.setItem(dedupKey, String(id));
        lembrarJogador(String(id), uniqueTags);

        // O dashboard da landing é cacheado; sem este aviso o personagem novo
        // só entraria na contagem no próximo ciclo de 5 min. Sem await: é uma
        // atualização de cache, não pode atrasar o card que já está pronto na
        // tela — e se falhar, o revalidate por tempo ainda cobre.
        avisarNovoJogador().catch((e) =>
          console.error("Falha ao atualizar o dashboard:", e),
        );
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
    // Sem os bytes não há download: o `download` de um <a> é ignorado quando o
    // href aponta para outra origem, e o clique só abriria a imagem.
    if (!avatarBlob) return;

    const objectUrl = URL.createObjectURL(avatarBlob);

    e.preventDefault();
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = avatarFileName(rpgClass.name, avatarBlob.type);
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
    // O blob já foi buscado quando a URL chegou: aqui é tudo síncrono, senão o
    // Safari do iOS perderia o gesto do usuário e recusaria o navigator.share.
    if (!avatarBlob) return;
    const file = new File([avatarBlob], avatarFileName(rpgClass.name, avatarBlob.type), {
      type: avatarBlob.type,
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
                    {/* Ações do avatar — dependem dos BYTES, não da URL: o
                        `download` de um <a> é ignorado entre origens e o
                        navigator.share precisa de um File. Só aparecem quando o
                        blob chega, para nenhum botão ficar inerte na tela.
                        Baixar sempre; compartilhar só no celular (galeria). */}
                    {avatarBlob && (
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
                        <a
                          href={avatarUrl}
                          download={avatarFileName(rpgClass.name, avatarBlob.type)}
                          onClick={saveAvatar}
                          title="Baixar avatar"
                          aria-label="Baixar avatar"
                          className={AVATAR_ACTION_CLASS}
                        >
                          <Download size={15} strokeWidth={1.8} />
                        </a>
                      </div>
                    )}
                  </>
                ) : avatarStatus === "error" ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-3 text-center">
                    <span className="text-2xl opacity-50">🎭</span>
                    <span
                      className="text-[rgba(240,226,189,0.65)] text-[.55rem] tracking-[.12em] uppercase leading-relaxed"
                      style={{ fontFamily: "var(--font-cinzel), serif" }}
                    >
                      {mensagemDeFalha(avatarErro)}
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
          href="/batalha"
          className="btn-seal flex-1 min-w-[140px] py-4 text-[.75rem] tracking-[.12em] uppercase text-center"
          style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
        >
          ⚔ Desafiar Alguém
        </a>
      </div>
    </div>
  );
}
