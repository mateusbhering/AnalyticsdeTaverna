"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { byName } from "@/lib/classes";
import { ATRIBUTOS_CARD, QTD_ATRIBUTOS_POR_BATALHA, type ChaveAtributo } from "@/lib/atributos";
import { aquecer, ErroDeBatalha, lutar, type ResultadoBatalha } from "@/lib/batalha-api";
import type { Oponente } from "./DesafioScanner";

interface MeuJogador {
  nome: string | null;
  classe: string | null;
}

interface Props {
  meuId: string;
  oponente: Oponente;
  onVoltar: () => void;
  onBatalhaConcluida: (resultado: ResultadoBatalha, meuJogador: MeuJogador) => void;
}

/**
 * "Você vs Rival" + grade dos 7 atributos, até 3 selecionados.
 *
 * Só precisa buscar UM dado extra que o `DesafioScanner` ainda não tem: a
 * classe/nome do PRÓPRIO jogador (ele só busca o oponente). O resto — id de
 * quem eu sou e quem é o rival — já chega pronto via props.
 */
export default function EscolhaAtributos({ meuId, oponente, onVoltar, onBatalhaConcluida }: Props) {
  const [meuJogador, setMeuJogador] = useState<MeuJogador | null>(null);
  const [carregandoEu, setCarregandoEu] = useState(true);
  const [selecionados, setSelecionados] = useState<ChaveAtributo[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const supabase = getSupabaseClient();
        const { data } = await supabase
          .from("jogadores")
          .select("nome, classe")
          .eq("id", meuId)
          .single();
        if (!cancelado) setMeuJogador((data as MeuJogador) ?? { nome: null, classe: null });
      } catch {
        if (!cancelado) setMeuJogador({ nome: null, classe: null });
      } finally {
        if (!cancelado) setCarregandoEu(false);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [meuId]);

  /* A escolha leva alguns segundos — tempo de sobra para a Render sair da
     hibernação antes do POST. Ver `aquecer` em lib/batalha-api.ts. */
  useEffect(() => {
    aquecer();
  }, []);

  function alternar(chave: ChaveAtributo) {
    setErro(null);
    setSelecionados((atual) => {
      if (atual.includes(chave)) return atual.filter((c) => c !== chave);
      if (atual.length >= QTD_ATRIBUTOS_POR_BATALHA) return atual; // já tem 3 — ignora
      return [...atual, chave];
    });
  }

  async function confirmarEscolha() {
    if (selecionados.length !== QTD_ATRIBUTOS_POR_BATALHA || !meuJogador) return;
    setEnviando(true);
    setErro(null);
    try {
      const resultado = await lutar(meuId, oponente.id, selecionados);
      onBatalhaConcluida(resultado, meuJogador);
    } catch (e) {
      /* `ErroDeBatalha` já vem com a frase pronta pra tela — inclusive a do
         422, onde o backend explica o que recusou. Qualquer outra coisa é bug
         nosso e não deve virar texto de taverna. */
      setErro(
        e instanceof ErroDeBatalha ? e.message : "Não consegui resolver a batalha agora.",
      );
      setEnviando(false);
    }
  }

  const minhaClasse = byName(meuJogador?.classe ?? "");
  const classeRival = byName(oponente.classe ?? "");
  const completo = selecionados.length === QTD_ATRIBUTOS_POR_BATALHA;

  return (
    <div className="paper-card paper-frame arcane-corners p-6 sm:p-8">
      <span className="ac-bl" /><span className="ac-br" />

      {/* Você vs Rival */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="text-center flex-1 min-w-0">
          <span
            className="text-[.55rem] tracking-[.3em] uppercase text-[var(--foil)]"
            style={{ fontFamily: "var(--font-cinzel), serif" }}
          >
            Você
          </span>
          <div className="wax-seal !w-14 !h-14 mx-auto text-2xl my-2">
            {carregandoEu ? "…" : minhaClasse.icon}
          </div>
          <p
            className="text-[.68rem] leading-tight truncate"
            style={{ fontFamily: "var(--font-cinzel), serif", color: "var(--seal)" }}
          >
            {carregandoEu ? "Carregando…" : minhaClasse.name}
          </p>
        </div>

        <div
          className="text-xl px-1 shrink-0"
          style={{ fontFamily: "var(--font-cinzel-decorative), serif", color: "var(--seal)" }}
        >
          VS
        </div>

        <div className="text-center flex-1 min-w-0">
          <span
            className="text-[.55rem] tracking-[.3em] uppercase text-[var(--foil)]"
            style={{ fontFamily: "var(--font-cinzel), serif" }}
          >
            Rival
          </span>
          <div className="wax-seal !w-14 !h-14 mx-auto text-2xl my-2">{classeRival.icon}</div>
          <p
            className="text-[.68rem] leading-tight truncate"
            style={{ fontFamily: "var(--font-cinzel), serif", color: "var(--seal)" }}
          >
            {classeRival.name}
          </p>
        </div>
      </div>

      <div className="divider mb-5" />

      {/* Seleção de atributos */}
      <div className="text-center mb-4">
        <h2
          className="text-[1.15rem] text-[var(--seal)] mb-1"
          style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
        >
          Escolha seus atributos
        </h2>
        <p className="text-[.8rem] italic">
          Você pode escolher no máximo {QTD_ATRIBUTOS_POR_BATALHA} atributos para sua batalha!
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-2">
        {ATRIBUTOS_CARD.filter((a) => a.chave !== "caos").map((a) => (
          <BotaoAtributo
            key={a.chave}
            rotulo={a.rotulo}
            Icon={a.Icon}
            selecionado={selecionados.includes(a.chave)}
            desabilitado={completo && !selecionados.includes(a.chave)}
            onClick={() => alternar(a.chave)}
          />
        ))}
      </div>
      {/* Caos fica sozinho, centralizado, igual ao protótipo. */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        <div />
        <BotaoAtributo
          rotulo="Caos"
          Icon={ATRIBUTOS_CARD.find((a) => a.chave === "caos")!.Icon}
          selecionado={selecionados.includes("caos")}
          desabilitado={completo && !selecionados.includes("caos")}
          onClick={() => alternar("caos")}
        />
      </div>

      {erro && (
        <p className="text-[var(--seal)] text-sm text-center bg-[rgba(140,35,24,0.08)] border border-[rgba(140,35,24,0.35)] px-4 py-3 italic mb-4">
          {erro}
        </p>
      )}

      <div className="space-y-3">
        {completo && (
          <button
            onClick={confirmarEscolha}
            disabled={enviando || carregandoEu}
            className="press btn-seal block w-full py-4 text-[.75rem] tracking-[.12em] uppercase cursor-pointer disabled:opacity-50"
            style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
          >
            {enviando ? "Resolvendo o confronto…" : "⚔️ Confirmar escolha"}
          </button>
        )}
        <button
          onClick={onVoltar}
          disabled={enviando}
          className="press btn-parchment block w-full py-3.5 text-[.72rem] tracking-[.12em] uppercase cursor-pointer disabled:opacity-50"
          style={{ fontFamily: "var(--font-cinzel), serif" }}
        >
          ← Voltar
        </button>
      </div>
    </div>
  );
}

function BotaoAtributo({
  rotulo,
  Icon,
  selecionado,
  desabilitado,
  onClick,
}: {
  rotulo: string;
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  selecionado: boolean;
  desabilitado: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={desabilitado}
      className={`press py-4 flex flex-col items-center gap-1.5 border transition-all disabled:opacity-35 disabled:cursor-not-allowed ${
        selecionado
          ? "border-[var(--seal)] bg-[rgba(140,35,24,0.1)]"
          : "border-[rgba(96,66,26,0.3)] hover:border-[var(--foil)]"
      }`}
    >
      <Icon size={20} strokeWidth={1.6} className={selecionado ? "text-[var(--seal)]" : "text-[var(--foil)]"} />
      <span
        className="text-[.62rem] tracking-[.1em] uppercase"
        style={{ fontFamily: "var(--font-cinzel), serif", color: selecionado ? "var(--seal)" : "var(--ink-70)" }}
      >
        {rotulo}
      </span>
    </button>
  );
}
