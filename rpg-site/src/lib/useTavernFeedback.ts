"use client";

import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from "react";

/**
 * Feedback auditivo e tátil da taverna.
 *
 * Dois caminhos para o som, e o motivo importa:
 *
 * 1. **Arquivo** (`fontes`), via HTML5 Audio — o caminho preferido quando
 *    existirem gravações de verdade.
 * 2. **Síntese** via Web Audio, usado quando não há arquivo. O projeto não tem
 *    nenhum áudio em `public/`, e um hook apontando para `/sons/x.mp3`
 *    inexistente ficaria MUDO sem avisar ninguém: o 404 de um `Audio` não
 *    lança, só nunca toca. Sintetizar entrega som hoje e some sozinho no dia
 *    em que os arquivos entrarem.
 *
 * Os três sons são curtos e percussivos, que é justamente o tipo que a síntese
 * reproduz bem — ruído filtrado com envelope, nada de instrumento afinado.
 */

export interface FontesDeSom {
  /** Página do quiz virando. */
  pageTurn?: string;
  /** Lacre batendo no pergaminho. */
  stamp?: string;
  /** Lâminas se cruzando na arena. */
  clash?: string;
}

export type Som = keyof FontesDeSom;

/** Padrões de vibração, em ms. Curtos: haptic longo em web irrita. */
const VIBRACAO: Record<Som, number | number[]> = {
  pageTurn: 8,
  stamp: [0, 18, 26, 34],
  clash: [0, 12, 18, 22],
};

const CHAVE_MUDO = "taverna:som-mudo";
const EVENTO_MUDO = "taverna:som-mudo-alterado";

/* A preferência de silêncio é estado EXTERNO (fica no aparelho), então entra
   por `useSyncExternalStore` e não por um efeito que copia localStorage para
   dentro do React. É o mesmo padrão do DesafioScanner, e resolve as duas
   coisas de uma vez: o servidor lê `false` sem divergir da hidratação, e uma
   troca numa aba chega às outras pelo evento `storage`. */
function assinarMudo(aoMudar: () => void) {
  window.addEventListener(EVENTO_MUDO, aoMudar);
  window.addEventListener("storage", aoMudar);
  return () => {
    window.removeEventListener(EVENTO_MUDO, aoMudar);
    window.removeEventListener("storage", aoMudar);
  };
}
function lerMudo() {
  try {
    return localStorage.getItem(CHAVE_MUDO) === "1";
  } catch {
    return false; // modo privado / storage bloqueado
  }
}
const mudoNoServidor = () => false;

/* ── Liberação por gesto, compartilhada por TODAS as instâncias ────────
   Precisa ser de módulo, e não estado local do hook: o gesto que destrava o
   áudio quase nunca acontece no componente que vai tocar. Quem clica em
   "Confirmar escolha" está na tela de escolha; quem toca o som das rodadas é a
   tela de resultado, que só monta DEPOIS. Com estado por instância, essa
   segunda instância nasce esperando um gesto que já passou — e fica muda para
   sempre, que foi exatamente o que aconteceu no primeiro teste de ponta a
   ponta. */
let gestoOcorreu = false;
const ouvintes = new Set<() => void>();

function registrarGesto() {
  if (gestoOcorreu) return;
  gestoOcorreu = true;
  for (const notificar of ouvintes) notificar();
}

/* Os listeners entram na CARGA DO MÓDULO, não quando o primeiro hook monta.
   Amarrá-los à montagem falha justamente no caso mais comum: em /batalha,
   nenhum componente usa o hook até o resultado aparecer, então o clique em
   "Confirmar escolha" acontecia sem ninguém escutando e o áudio nunca
   destravava. O gesto precisa ser registrado mesmo antes de existir ouvinte.

   Os listeners ficam para sempre: são três, passivos, e o custo é irrelevante
   perto de perder o único gesto que importa. */
if (typeof window !== "undefined") {
  const opts = { passive: true } as const;
  window.addEventListener("pointerdown", registrarGesto, opts);
  window.addEventListener("keydown", registrarGesto, opts);
  window.addEventListener("touchstart", registrarGesto, opts);
}

function assinarGesto(aoMudar: () => void) {
  ouvintes.add(aoMudar);
  return () => {
    ouvintes.delete(aoMudar);
  };
}
const lerGesto = () => gestoOcorreu;
const gestoNoServidor = () => false;

export interface TavernFeedback {
  playPageTurn: () => void;
  playStamp: () => void;
  playClash: () => void;
  /** `false` até o primeiro gesto do usuário — antes disso nada toca. */
  liberado: boolean;
  mudo: boolean;
  alternarMudo: () => void;
}

export function useTavernFeedback(fontes: FontesDeSom = {}): TavernFeedback {
  /* `liberado` só vira true depois de um gesto real. Todo navegador bloqueia
     áudio antes disso, e um AudioContext criado cedo demais nasce `suspended`
     e fica assim. Começa `false` no servidor e no cliente — nenhuma leitura de
     ambiente no estado inicial, nenhum risco de divergência na hidratação. */
  const liberado = useSyncExternalStore(assinarGesto, lerGesto, gestoNoServidor);
  const mudo = useSyncExternalStore(assinarMudo, lerMudo, mudoNoServidor);

  const ctxRef = useRef<AudioContext | null>(null);
  const ruidoRef = useRef<AudioBuffer | null>(null);
  const tagsRef = useRef<Partial<Record<Som, HTMLAudioElement>>>({});

  // Pré-carrega as tags de áudio das fontes que existirem.
  useEffect(() => {
    for (const [nome, url] of Object.entries(fontes) as [Som, string | undefined][]) {
      if (!url || tagsRef.current[nome]) continue;
      const a = new Audio(url);
      a.preload = "auto";
      a.volume = 0.45;
      tagsRef.current[nome] = a;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fontes.pageTurn, fontes.stamp, fontes.clash]);

  const contexto = useCallback(() => {
    if (ctxRef.current) return ctxRef.current;
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    const ctx = new Ctor();
    ctxRef.current = ctx;

    /* Um segundo de ruído branco, gerado uma vez e reaproveitado. Os três sons
       saem dele com filtros diferentes — é ruído filtrado que produz farfalhar,
       pancada e metal, não osciladores afinados. */
    const buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const dados = buf.getChannelData(0);
    for (let i = 0; i < dados.length; i++) dados[i] = Math.random() * 2 - 1;
    ruidoRef.current = buf;

    return ctx;
  }, []);

  const sintetizar = useCallback(
    (som: Som) => {
      const ctx = contexto();
      const ruido = ruidoRef.current;
      if (!ctx || !ruido) return;
      // Safari suspende o contexto ao trocar de aba; retomar é barato.
      if (ctx.state === "suspended") void ctx.resume();

      const t = ctx.currentTime;
      const fonte = ctx.createBufferSource();
      fonte.buffer = ruido;
      const filtro = ctx.createBiquadFilter();
      const ganho = ctx.createGain();
      fonte.connect(filtro).connect(ganho).connect(ctx.destination);

      if (som === "pageTurn") {
        // Papel: banda média varrendo para cima, decaimento macio.
        filtro.type = "bandpass";
        filtro.Q.value = 0.8;
        filtro.frequency.setValueAtTime(700, t);
        filtro.frequency.exponentialRampToValueAtTime(2600, t + 0.16);
        ganho.gain.setValueAtTime(0.0001, t);
        ganho.gain.exponentialRampToValueAtTime(0.13, t + 0.03);
        ganho.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
        fonte.start(t);
        fonte.stop(t + 0.24);
      } else if (som === "stamp") {
        // Lacre: estalo curto em cima + corpo grave embaixo.
        filtro.type = "lowpass";
        filtro.frequency.setValueAtTime(2200, t);
        filtro.frequency.exponentialRampToValueAtTime(300, t + 0.09);
        ganho.gain.setValueAtTime(0.28, t);
        ganho.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
        fonte.start(t);
        fonte.stop(t + 0.18);

        const corpo = ctx.createOscillator();
        const gCorpo = ctx.createGain();
        corpo.type = "sine";
        corpo.frequency.setValueAtTime(120, t);
        corpo.frequency.exponentialRampToValueAtTime(52, t + 0.14);
        gCorpo.gain.setValueAtTime(0.24, t);
        gCorpo.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
        corpo.connect(gCorpo).connect(ctx.destination);
        corpo.start(t);
        corpo.stop(t + 0.2);
      } else {
        // Lâminas: ataque instantâneo, brilho alto, cauda curta.
        filtro.type = "highpass";
        filtro.frequency.setValueAtTime(1800, t);
        ganho.gain.setValueAtTime(0.001, t);
        ganho.gain.exponentialRampToValueAtTime(0.2, t + 0.006);
        ganho.gain.exponentialRampToValueAtTime(0.0001, t + 0.26);
        fonte.start(t);
        fonte.stop(t + 0.28);
      }
    },
    [contexto],
  );

  const tocar = useCallback(
    (som: Som) => {
      if (!liberado || mudo) return;

      const tag = tagsRef.current[som];
      if (tag) {
        // `currentTime = 0` permite retocar antes de o anterior terminar.
        tag.currentTime = 0;
        // Um play() recusado não pode derrubar a interação que o disparou.
        void tag.play().catch(() => sintetizar(som));
      } else {
        sintetizar(som);
      }

      /* Vibração é enfeite: `navigator.vibrate` não existe no Safari do iOS e
         é ignorado em desktop. Nunca condicione lógica ao retorno dele. */
      try {
        navigator.vibrate?.(VIBRACAO[som]);
      } catch {
        /* alguns navegadores lançam se a aba estiver em segundo plano */
      }
    },
    [liberado, mudo, sintetizar],
  );

  const alternarMudo = useCallback(() => {
    try {
      localStorage.setItem(CHAVE_MUDO, lerMudo() ? "0" : "1");
    } catch {
      /* modo privado: sem persistir, mas o evento abaixo ainda atualiza a tela */
    }
    // `storage` não dispara na aba que escreveu; o evento próprio cobre esta.
    window.dispatchEvent(new Event(EVENTO_MUDO));
  }, []);

  // Fecha o contexto ao desmontar: cada AudioContext segura hardware de áudio.
  useEffect(() => {
    const ctx = ctxRef.current;
    return () => {
      void ctx?.close().catch(() => {});
    };
  }, []);

  return useMemo(
    () => ({
      playPageTurn: () => tocar("pageTurn"),
      playStamp: () => tocar("stamp"),
      playClash: () => tocar("clash"),
      liberado,
      mudo,
      alternarMudo,
    }),
    [tocar, liberado, mudo, alternarMudo],
  );
}

export default useTavernFeedback;
