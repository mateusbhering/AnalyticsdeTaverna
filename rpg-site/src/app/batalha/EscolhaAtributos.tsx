"use client";
import { IconText } from "@/components/ui/illustrated-icons";


import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { byName } from "@/lib/classes";
import { ATRIBUTOS_CARD, QTD_ATRIBUTOS_POR_BATALHA, type ChaveAtributo } from "@/lib/atributos";
import { aquecer, ErroDeBatalha, lutar, type ResultadoBatalha } from "@/lib/batalha-api";
import Image from "next/image";
import { CLASS_ARTWORK } from "@/lib/class-artwork";
import { deveEspelhar } from "@/lib/battle-rigs";
import type { ClassInfo } from "@/lib/classes";
import styles from "./EscolhaAtributos.module.css";
import BotaoLacre from "@/components/ui/botao-lacre";
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
    if (enviando) return;
    setErro(null);
    setSelecionados((atual) => {
      if (atual.includes(chave)) return atual.filter((c) => c !== chave);
      if (atual.length >= QTD_ATRIBUTOS_POR_BATALHA) return atual; // já tem 3 — ignora
      return [...atual, chave];
    });
  }

  async function confirmarEscolha() {
    if (enviando || selecionados.length !== QTD_ATRIBUTOS_POR_BATALHA || !meuJogador) return;
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
    <div className={`paper-card paper-frame arcane-corners p-6 sm:p-8 ${styles.pergaminho}`}>
      <span className="ac-bl" /><span className="ac-br" />

      <div className={styles.confronto} aria-label="Personagens do confronto">
        <div className={styles.voce}>
          <span className={styles.rotulo}>Seu personagem</span>
          <h2 className={styles.tituloVoce}>Você</h2>
          <div className={styles.retratoVoce}>
            {carregandoEu ? <span className={styles.carregando} role="status">Carregando…</span>
              : meuJogador?.classe ? <ArtePersonagem classe={minhaClasse} lado="a"/> : <span className={styles.carregando}>Classe não informada</span>}
          </div>
          {meuJogador?.nome && <strong className={styles.nomeVoce}>{meuJogador.nome}</strong>}
          <p className={styles.classeVoce}>{carregandoEu ? "Preparando seu card…" : meuJogador?.classe ? minhaClasse.name : "Seu aventureiro"}</p>
        </div>
        <span className={styles.vs} aria-label="contra">VS</span>
        <div className={styles.rival}>
          <span className={styles.rotulo}>Oponente</span>
          <h2 className={styles.tituloRival}>Rival</h2>
          <div className={styles.retratoRival}><ArtePersonagem classe={classeRival} lado="b"/></div>
          {oponente.nome && <strong className={styles.nomeRival}>{oponente.nome}</strong>}
          <p className={styles.classeRival}>{classeRival.name}</p>
        </div>
      </div>

      <div className={styles.divisor} aria-hidden="true"><span>✦</span></div>

      <div className={styles.cabecalho}>
        <span className={styles.rotulo}>Prepare seu confronto</span>
        <h2 className={styles.tituloEscolha}>Escolha seus atributos</h2>
        <p>Escolha {QTD_ATRIBUTOS_POR_BATALHA} atributos para enfrentar seu rival.</p>
      </div>

      <div className={styles.grade} role="group" aria-label="Atributos para a batalha">
        {ATRIBUTOS_CARD.map((a) => (
          <BotaoAtributo
            key={a.chave}
            rotulo={a.rotulo}
            Icon={a.Icon}
            selecionado={selecionados.includes(a.chave)}
            ordem={selecionados.indexOf(a.chave) + 1}
            centralizado={a.chave === "caos"}
            desabilitado={enviando || (completo && !selecionados.includes(a.chave))}
            onClick={() => alternar(a.chave)}
          />
        ))}
      </div>

      <p className={styles.contagem} role="status" aria-live="polite">
        <strong>{selecionados.length} / {QTD_ATRIBUTOS_POR_BATALHA}</strong>
        <span>{completo ? "Pronto para o confronto!" : "atributos escolhidos"}</span>
      </p>

      {erro && (
        <p role="alert" className="text-[var(--seal)] text-sm text-center bg-[rgba(140,35,24,0.08)] border border-[rgba(140,35,24,0.35)] px-4 py-3 italic mb-4">
          {erro}
        </p>
      )}

      <div className="space-y-3">
        {completo && (
          <BotaoLacre
            onClick={confirmarEscolha}
            disabled={enviando || carregandoEu}
            className="py-4 text-[.75rem] tracking-[.12em] uppercase"
          >
            {<IconText text={enviando ? "Resolvendo o confronto…" : "⚔️ Confirmar escolha"} />}
          </BotaoLacre>
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

function ArtePersonagem({ classe, lado }: { classe: ClassInfo; lado: "a" | "b" }) {
  const arte = CLASS_ARTWORK[classe.name];
  return <Image
    src={arte ? `/classes/${arte}.png` : classe.photo}
    alt={classe.name}
    width={384}
    height={384}
    unoptimized
    loading="eager"
    draggable={false}
    className={styles.artePersonagem}
    style={{ transform: deveEspelhar(arte, lado) ? "scaleX(-1)" : undefined }}
  />;
}

function BotaoAtributo({ rotulo, Icon, selecionado, ordem, centralizado, desabilitado, onClick }: {
  rotulo: string;
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  selecionado: boolean;
  ordem: number;
  centralizado: boolean;
  desabilitado: boolean;
  onClick: () => void;
}) {
  return <button
    type="button"
    onClick={onClick}
    aria-label={rotulo}
    aria-pressed={selecionado}
    disabled={desabilitado}
    data-centralizado={centralizado || undefined}
    className={`${styles.atributo} ${selecionado ? styles.selecionado : ""}`}
  >
    <span className={styles.moldura}>
      <svg className={styles.ornamento} viewBox="0 0 100 100" fill="none" aria-hidden="true">
        <rect x="8" y="8" width="84" height="84" rx="14" stroke="currentColor" strokeWidth="2.2"/>
        <rect x="13" y="13" width="74" height="74" rx="11" stroke="currentColor" strokeWidth=".9"/>
        <path d="M9 31Q2 9 25 8 M69 8Q94 0 92 25 M92 69Q100 94 75 92 M31 92Q6 100 8 75" stroke="currentColor" strokeWidth="2.4"/>
        <path d="M15 22Q14 12 25 15Q32 19 23 23Q18 24 19 19 M78 15Q88 14 85 25Q81 32 77 23Q76 18 81 19 M85 78Q86 88 75 85Q68 81 77 77Q82 76 81 81 M22 85Q12 86 15 75Q19 68 23 77Q24 82 19 81" stroke="currentColor" strokeWidth="1.4"/>
      </svg>
      <Icon size={48} strokeWidth={1.6} className={styles.icone}/>
      {selecionado && <span className={styles.seloEscolha} aria-hidden="true">{ordem}</span>}
    </span>
    <span className={styles.nomeAtributo}>{rotulo}</span>
  </button>;
}
