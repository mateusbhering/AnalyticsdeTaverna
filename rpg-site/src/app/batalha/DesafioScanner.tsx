"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import QrScanner from "@/components/QrScanner";
import TelaCarregando from "@/components/TelaCarregando";
import { getSupabaseClient } from "@/lib/supabase";
import { byName } from "@/lib/classes";
import ArenaDuelo from "./ArenaDuelo";
import { aquecer, ErroDeBatalha, lutar, type ResultadoBatalha } from "@/lib/batalha-api";

interface Oponente {
  id: number | string;
  nome: string | null;
  classe: string | null;
  xp: number | null;
  vitorias: number | null;
  derrotas: number | null;
  empates: number | null;
  foto_url: string | null;
}

/** Id do jogador desta pessoa, gravado ao terminar o quiz (CharacterResult). */
const CHAVE_MEU_ID = "taverna:jogadorId";

/* O localStorage não existe no servidor. Lendo por useSyncExternalStore, o
   primeiro render (servidor e hidratação) enxerga `undefined` — "ainda não
   sabemos" — e o valor real entra no reconcile seguinte, sem mismatch. */
const semInscricao = () => () => {};
function lerMeuId(): string | null {
  try {
    return localStorage.getItem(CHAVE_MEU_ID);
  } catch {
    return null; // modo privado / storage bloqueado
  }
}
const meuIdNoServidor = () => undefined;

/* Quanto a tela do duelo fica no ar antes de revelar o oponente. A consulta ao
   Supabase leva uns 300ms — sem um mínimo, a arte apareceria e sumiria num
   piscar. Precisa bater com a duração da animação em `.barra-duelo`. */
const DUELO_CARREGANDO_MS = 2400;

/* Só no celular, por ora. Lido no handler do scan (não na renderização), então
   não há risco de divergência de hidratação. 639px = limite do `sm` do Tailwind. */
function ehCelular() {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 639px)").matches;
}

/**
 * Aceita as duas formas de QR que circulam por aí:
 *   /batalha?oponenteId=7   → o QR do card (PersonagemCard)
 *   /personagem?id=7        → o link de compartilhar (CharacterResult)
 * e também um id cru, para quem digita à mão.
 */
export function extrairId(texto: string): string | null {
  const limpo = texto.trim();
  if (/^\d+$/.test(limpo)) return limpo;
  try {
    const url = new URL(limpo);
    const id = url.searchParams.get("oponenteId") ?? url.searchParams.get("id");
    return id && /^\d+$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

export default function DesafioScanner() {
  const params = useSearchParams();

  // `undefined` = ainda não lemos o aparelho; `null` = não tem personagem.
  const meuId = useSyncExternalStore<string | null | undefined>(
    semInscricao,
    lerMeuId,
    meuIdNoServidor,
  );

  const [oponenteId, setOponenteId] = useState<string | null>(params.get("oponenteId"));
  const [oponente, setOponente] = useState<Oponente | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  // Tela épica de carregamento: `pedida` no scan, `liberada` quando o tempo
  // mínimo se cumpre. Ela sai quando o tempo acabou E o oponente chegou.
  const [telaPedida, setTelaPedida] = useState(false);
  const [telaLiberada, setTelaLiberada] = useState(false);

  // Duelo: `null` até o jogador mandar lutar. O backend resolve na hora — não
  // há convite pendente do outro lado.
  const [duelo, setDuelo] = useState<ResultadoBatalha | null>(null);
  const [duelando, setDuelando] = useState(false);
  const [erroDuelo, setErroDuelo] = useState<string | null>(null);

  const ehEuMesmo = oponenteId !== null && meuId != null && oponenteId === meuId;
  // Derivado em vez de um `useState` de loading: temos um id válido, ninguém
  // carregado e nenhum erro ⇒ a busca está em andamento.
  const buscando = oponenteId !== null && !ehEuMesmo && oponente === null && erro === null;

  // Busca o oponente assim que temos um id (do QR ou da própria URL).
  useEffect(() => {
    if (!oponenteId || ehEuMesmo || meuId === undefined) return;

    let cancelado = false;
    (async () => {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from("jogadores")
          .select("id, nome, classe, xp, vitorias, derrotas, empates, foto_url")
          .eq("id", oponenteId)
          .single();
        if (cancelado) return;
        if (error || !data) {
          setOponenteId(null);
          setErro("Nenhum aventureiro com esse brasão foi encontrado.");
        } else {
          setOponente(data as Oponente);
        }
      } catch {
        if (cancelado) return;
        setOponenteId(null);
        setErro("Não foi possível consultar a taverna agora. Tente de novo.");
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [oponenteId, ehEuMesmo, meuId]);

  const aoEscanear = useCallback((texto: string) => {
    const id = extrairId(texto);
    if (!id) {
      setErro("Esse QR não é de um personagem da taverna.");
      return;
    }
    setErro(null);
    setOponenteId(id);

    if (ehCelular()) {
      setTelaPedida(true);
      setTelaLiberada(false);
      setTimeout(() => setTelaLiberada(true), DUELO_CARREGANDO_MS);
    }
  }, []);

  /* O oponente entrou na tela: o duelo é o próximo passo quase certo. Acordar
     a Render agora esconde a hibernação atrás do tempo de leitura do card. */
  useEffect(() => {
    if (oponente) aquecer();
  }, [oponente]);

  const duelar = useCallback(async () => {
    if (!meuId || !oponente || duelando) return;
    setDuelando(true);
    setErroDuelo(null);
    try {
      setDuelo(await lutar(meuId, oponente.id));
    } catch (erro) {
      setErroDuelo(
        erro instanceof ErroDeBatalha
          ? erro.message
          : "Não foi possível realizar o duelo agora.",
      );
    } finally {
      setDuelando(false);
    }
  }, [meuId, oponente, duelando]);

  const escanearOutro = () => {
    setOponente(null);
    setOponenteId(null);
    setErro(null);
    setTelaPedida(false);
    setTelaLiberada(false);
    setDuelo(null);
    setErroDuelo(null);
    setDuelando(false);
  };

  // ── Duelo resolvido: a arena toma a tela ──
  if (duelo) return <ArenaDuelo resultado={duelo} onNovoDuelo={escanearOutro} />;

  // A tela épica cobre a página inteira até o tempo fechar E o oponente chegar.
  // Erro e auto-desafio saem na hora: não há duelo para anunciar.
  if (telaPedida && !erro && !ehEuMesmo && !(telaLiberada && oponente)) {
    return <TelaCarregando />;
  }

  // ── Escaneou o próprio card ──
  if (ehEuMesmo) {
    return (
      <Painel>
        <div className="text-4xl mb-4 opacity-70 text-center">🪞</div>
        <h2
          className="text-[1.25rem] text-[var(--seal)] text-center mb-2"
          style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
        >
          Esse brasão é o seu
        </h2>
        <p className="text-center italic mb-6">
          Nem o mais bravo herói duela contra o próprio reflexo. Escaneie o card de outro
          aventureiro.
        </p>
        <button
          onClick={escanearOutro}
          className="press btn-seal block w-full py-4 text-[.75rem] tracking-[.12em] uppercase cursor-pointer"
          style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
        >
          📷 Escanear outro
        </button>
      </Painel>
    );
  }

  // ── Ainda não tem personagem: não dá pra desafiar ninguém ──
  if (meuId === null && !oponente) {
    return (
      <Painel>
        <div className="text-4xl mb-4 opacity-70 text-center">🕯️</div>
        <h2
          className="text-[1.3rem] text-[var(--seal)] text-center mb-2"
          style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
        >
          Você ainda não tem um herói
        </h2>
        <p className="text-center italic mb-6">
          Só é possível desafiar alguém depois de descobrir a sua própria classe.
        </p>
        <a
          href="/jogar"
          className="press btn-seal block w-full py-4 text-center text-[.75rem] tracking-[.12em] uppercase"
          style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
        >
          ⚔ Descobrir minha classe
        </a>
      </Painel>
    );
  }

  if (meuId === undefined || buscando) {
    return (
      <Painel>
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="w-10 h-10 border-2 border-[rgba(138,100,40,0.35)] border-t-[var(--foil)] rounded-full animate-spin" />
          <span
            className="text-[var(--ink-70)] text-[.6rem] tracking-[.25em] uppercase"
            style={{ fontFamily: "var(--font-cinzel), serif" }}
          >
            {buscando ? "Procurando o oponente…" : "Consultando o grimório…"}
          </span>
        </div>
      </Painel>
    );
  }

  // ── Oponente encontrado ──
  if (oponente)
    return (
      <CardOponente
        oponente={oponente}
        onEscanearOutro={escanearOutro}
        onDuelar={duelar}
        duelando={duelando}
        erroDuelo={erroDuelo}
      />
    );

  // ── Leitor de QR ──
  return (
    <Painel>
      <div className="text-center mb-5">
        <span
          className="section-eyebrow"
          style={{ fontSize: ".6rem", letterSpacing: ".35em", color: "var(--seal)", opacity: 0.9 }}
        >
          Escolha do Adversário
        </span>
        <p className="italic text-[.9rem] max-w-xs mx-auto">
          Peça o card do outro aventureiro e aponte a câmera para o QR no rodapé dele.
        </p>
      </div>

      {erro && (
        <p className="text-[var(--seal)] text-sm text-center bg-[rgba(140,35,24,0.08)] border border-[rgba(140,35,24,0.35)] px-4 py-3 italic mb-4">
          {erro}
        </p>
      )}

      <QrScanner onScan={aoEscanear} />
    </Painel>
  );
}

function Painel({ children }: { children: React.ReactNode }) {
  return (
    <div className="paper-card paper-frame arcane-corners p-6 sm:p-8">
      <span className="ac-bl" />
      <span className="ac-br" />
      {children}
    </div>
  );
}

function CardOponente({
  oponente,
  onEscanearOutro,
  onDuelar,
  duelando,
  erroDuelo,
}: {
  oponente: Oponente;
  onEscanearOutro: () => void;
  onDuelar: () => void;
  duelando: boolean;
  erroDuelo: string | null;
}) {
  const classe = byName(oponente.classe ?? "");
  const retrato = oponente.foto_url ?? classe.photo;

  return (
    <div className="space-y-6">
      <Painel>
        <div className="text-center">
          <span
            className="section-eyebrow"
            style={{ fontSize: ".6rem", letterSpacing: ".35em", color: "var(--seal)", opacity: 0.9 }}
          >
            Desafio Lançado
          </span>

          <div className="wax-seal !w-16 !h-16 mx-auto text-3xl mb-4">{classe.icon}</div>

          {oponente.nome && (
            <p
              className="text-[.7rem] tracking-[.2em] uppercase text-[var(--foil)] mb-1"
              style={{ fontFamily: "var(--font-cinzel), serif" }}
            >
              {oponente.nome}
            </p>
          )}
          <h2
            className="text-[1.4rem] text-[var(--seal)] mb-1"
            style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
          >
            {classe.name}
          </h2>
          <p className="text-[.85rem] italic max-w-xs mx-auto leading-relaxed mb-5">{classe.desc}</p>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={retrato}
            alt={classe.name}
            className="w-40 h-40 object-cover mx-auto border border-[rgba(96,66,26,0.45)] shadow-[0_4px_10px_rgba(0,0,0,0.35)]"
            onError={(e) => {
              // .jpg falhou → tenta .png; depois cai na ilustração da classe.
              const img = e.currentTarget;
              const passo = img.dataset.fbstep ?? "0";
              if (passo === "0" && oponente.foto_url?.endsWith(".jpg")) {
                img.dataset.fbstep = "png";
                img.src = oponente.foto_url.slice(0, -4) + ".png";
              } else if (passo !== "final") {
                img.dataset.fbstep = "final";
                img.src = classe.photo;
              }
            }}
          />
        </div>

        <div className="divider my-5" />

        <div className="grid grid-cols-4 gap-2 text-center">
          <Placar rotulo="XP" valor={oponente.xp ?? 0} />
          <Placar rotulo="Vitórias" valor={oponente.vitorias ?? 0} />
          <Placar rotulo="Derrotas" valor={oponente.derrotas ?? 0} />
          <Placar rotulo="Empates" valor={oponente.empates ?? 0} />
        </div>
      </Painel>

      {erroDuelo && (
        <p className="text-[var(--seal)] text-sm text-center bg-[rgba(140,35,24,0.08)] border border-[rgba(140,35,24,0.35)] px-4 py-3 italic">
          {erroDuelo}
        </p>
      )}

      <div className="space-y-3">
        <button
          onClick={onDuelar}
          disabled={duelando}
          className="press btn-seal block w-full py-4 text-[.75rem] tracking-[.12em] uppercase cursor-pointer disabled:cursor-wait disabled:opacity-70"
          style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
        >
          {duelando ? "⏳ Cruzando as lâminas…" : "⚔ Iniciar o duelo"}
        </button>
        <p className="text-center text-[.65rem] italic text-[rgba(230,188,106,0.5)] leading-relaxed px-2">
          Vocês dois entram com os três maiores atributos. O oponente não
          precisa fazer nada — o resultado sai na hora.
        </p>
        <button
          onClick={onEscanearOutro}
          disabled={duelando}
          className="press btn-parchment block w-full py-3.5 text-[.72rem] tracking-[.12em] uppercase cursor-pointer disabled:opacity-50"
          style={{ fontFamily: "var(--font-cinzel), serif" }}
        >
          📷 Escanear outro oponente
        </button>
        <a
          href={`/personagem?id=${oponente.id}`}
          className="block text-center text-[rgba(230,188,106,0.55)] hover:text-[var(--gold-light)] text-[.7rem] tracking-[.15em] uppercase transition-colors"
          style={{ fontFamily: "var(--font-cinzel), serif" }}
        >
          Ver o card completo →
        </a>
      </div>
    </div>
  );
}

function Placar({ rotulo, valor }: { rotulo: string; valor: number }) {
  return (
    <div>
      <div
        className="text-[1.15rem] text-[var(--ink)]"
        style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
      >
        {valor}
      </div>
      <div
        className="text-[.5rem] tracking-[.2em] uppercase text-[var(--foil)]"
        style={{ fontFamily: "var(--font-cinzel), serif" }}
      >
        {rotulo}
      </div>
    </div>
  );
}
