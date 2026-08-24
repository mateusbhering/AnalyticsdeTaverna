import type { ChaveAtributo } from "./atributos";
import { QTD_ATRIBUTOS_POR_BATALHA } from "./atributos";

/**
 * Cliente da API de batalha (FastAPI).
 *
 * O duelo NÃO passa pelo Supabase direto: o placar (xp/vitórias/derrotas) não
 * tem policy de UPDATE para a chave anon — de propósito, senão qualquer um
 * abriria o console e se daria 10.000 de XP. Quem escreve é o backend, com a
 * service_role. Ver `backend/sql/schema.sql`, seção RLS.
 */

/**
 * Base da API de batalha — um caminho do NOSSO domínio, não a URL da Render.
 *
 * O `/taverna-api` é reescrito pelo Next para o FastAPI (ver `next.config.ts`).
 * Falar com a própria origem tira do caminho tudo que costuma quebrar em
 * produção: CORS, conteúdo misto e — o motivo de existir — bloqueadores de
 * anúncio e filtros de DNS que derrubam domínios de hospedagem gratuita e
 * fazem o `fetch` falhar como se o servidor estivesse fora do ar.
 *
 * Dá pra apontar para outro lugar com NEXT_PUBLIC_API_URL (útil pra depurar
 * contra um backend específico), mas aí o pedido volta a ser entre origens.
 */
export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "/taverna-api";

/** Uma das 3 rodadas — o MESMO atributo dos dois lados. */
export interface Rodada {
  atributo: string;
  /** Rótulo pronto ("Força"): vem do backend para não duplicar a tradução. */
  rotulo: string;
  valor_a: number;
  valor_b: number;
  vencedor: "a" | "b" | "empate";
  diferenca: number;
}

export interface LadoBatalha {
  id: number;
  nome: string | null;
  classe: string | null;
  foto_url: string | null;
}

export interface ResultadoBatalha {
  id: number | null;
  jogador_a_id: number;
  jogador_b_id: number;
  desafiante: LadoBatalha | null;
  oponente: LadoBatalha | null;
  /** Os 3 atributos que o desafiante escolheu, na ordem em que clicou. */
  atributos: string[];
  rodadas: Rodada[];
  vitorias_a: number;
  vitorias_b: number;
  empates_rodada: number;
  /** Do ponto de vista da API: 'a' = desafiante, 'b' = oponente. */
  resultado: "a" | "b" | "empate";
  vencedor_id: number | null;
  /** XP do desafiante. */
  xp_a: number;
  /** XP do oponente. */
  xp_b: number;
  narrativa: string;
}

/* O backend fica na Render. Quando o serviço está ocioso ele hiberna, e a
   primeira requisição espera o processo subir — o que passa fácil dos 30s.
   Sem um teto explícito, o navegador é quem decide desistir, e cada um decide
   uma coisa (em rede móvel, mais cedo ainda). */
const ESPERA_MAXIMA_MS = 75_000;

/**
 * Cutuca o backend para ele sair da hibernação.
 *
 * Chamado quando o oponente aparece na tela: o tempo que a pessoa leva lendo o
 * card é o tempo que o servidor usa para acordar, então o duelo já encontra
 * tudo de pé. É um GET no /health — idempotente, barato e sem efeito nenhum
 * se o serviço já estiver acordado. Falha em silêncio de propósito: isto é
 * conforto, não requisito.
 */
export function aquecer(): void {
  void fetch(`${API_BASE}/health`, { cache: "no-store" }).catch(() => {});
}

export class ErroDeBatalha extends Error {}

/**
 * Dispara o duelo. Instantâneo e assíncrono: o oponente não precisa aceitar
 * nada — o backend resolve as 3 rodadas e já devolve o resultado gravado.
 *
 * `desafianteId` é sempre o lado A: quem escaneou o QR e escolheu os atributos.
 */
export async function lutar(
  desafianteId: number | string,
  oponenteId: number | string,
  atributos: ChaveAtributo[],
  sinal?: AbortSignal,
): Promise<ResultadoBatalha> {
  /* Os ids vêm do localStorage e da URL — nenhum dos dois é confiável. Um
     valor estranho vira NaN no `Number`, e `JSON.stringify` transforma NaN em
     `null`, porque JSON não tem NaN. O backend responderia 422 e a pessoa
     leria "não foi possível realizar o duelo" sem nenhuma pista de que o
     problema é o cadastro dela neste aparelho. Melhor barrar aqui e dizer o
     que fazer. */
  const a = Number(desafianteId);
  const b = Number(oponenteId);
  if (!Number.isInteger(a) || a <= 0) {
    console.error(`[batalha] id do desafiante inválido: ${JSON.stringify(desafianteId)}`);
    throw new ErroDeBatalha(
      "Seu personagem não foi reconhecido neste aparelho. Refaça o quiz para desafiar alguém.",
    );
  }
  if (!Number.isInteger(b) || b <= 0) {
    console.error(`[batalha] id do oponente inválido: ${JSON.stringify(oponenteId)}`);
    throw new ErroDeBatalha("O brasão do oponente não foi reconhecido. Escaneie de novo.");
  }

  /* A grade de escolha já impede as duas coisas, mas ela não é a fronteira de
     confiança — e um 422 do backend por isso viraria uma mensagem pior. */
  if (atributos.length !== QTD_ATRIBUTOS_POR_BATALHA) {
    throw new ErroDeBatalha(
      `Escolha ${QTD_ATRIBUTOS_POR_BATALHA} atributos para entrar no duelo.`,
    );
  }
  if (new Set(atributos).size !== atributos.length) {
    throw new ErroDeBatalha("Não dá para levar o mesmo atributo duas vezes.");
  }

  /* Relógio próprio, encadeado no sinal de quem chamou: assim o cancelamento
     do componente continua funcionando e ainda existe um teto de espera. */
  const controle = new AbortController();
  const relogio = setTimeout(
    () => controle.abort(new DOMException("Tempo esgotado.", "TimeoutError")),
    ESPERA_MAXIMA_MS,
  );
  sinal?.addEventListener("abort", () => controle.abort(sinal.reason), { once: true });

  let resposta: Response;
  try {
    resposta = await fetch(`${API_BASE}/batalha`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jogador_a_id: a,
        jogador_b_id: b,
        atributos,
      }),
      signal: controle.signal,
    });
  } catch (erro) {
    // AbortError sobe como está: quem cancelou sabe o que fazer com ele.
    if (erro instanceof DOMException && erro.name === "AbortError") throw erro;

    /* Estourou o teto: o servidor existe, só não respondeu a tempo. Não
       tentamos de novo sozinhos — POST /batalha grava uma batalha e distribui
       XP, então uma repetição automática pode contar o duelo duas vezes se a
       primeira tiver chegado. Quem decide repetir é a pessoa, no botão. */
    if (erro instanceof DOMException && erro.name === "TimeoutError") {
      throw new ErroDeBatalha(
        "A taverna demorou demais para responder. Tente de novo em alguns instantes.",
      );
    }

    /* Aqui o pedido nem chegou a completar. São três causas bem diferentes
       com a mesma cara pro `fetch` — servidor fora do ar, CORS barrando, ou
       endereço errado — e nenhuma delas dá pra distinguir pelo objeto de erro.
       O texto na tela fica temático; o diagnóstico de verdade vai pro console,
       com o endereço tentado, senão não há como saber qual das três foi. */
    console.error(
      `[batalha] o pedido para ${API_BASE}/batalha não completou. ` +
        "Confira se o backend FastAPI está no ar nesse endereço, se ele " +
        "libera esta origem no CORS e se NEXT_PUBLIC_API_URL aponta pra ele.",
      erro,
    );
    throw new ErroDeBatalha(
      "A taverna não respondeu — o servidor da batalha parece estar fora do ar.",
    );
  } finally {
    clearTimeout(relogio);
  }

  if (!resposta.ok) {
    /* O corpo é lido como texto e só depois interpretado: um 502 do proxy ou
       uma página de erro em HTML fariam `.json()` estourar, e o `catch` engolia
       junto o status — que é justamente o que diz onde olhar. */
    const bruto = await resposta.text().catch(() => "");
    console.error(
      `[batalha] ${resposta.status} ${resposta.statusText} em ${API_BASE}/batalha`,
      bruto.slice(0, 500),
    );
    throw new ErroDeBatalha(descreverErro(resposta.status, bruto));
  }

  return (await resposta.json()) as ResultadoBatalha;
}

/**
 * Transforma o corpo de erro do backend numa frase para a tela.
 *
 * O FastAPI usa `detail` de dois jeitos: string nas exceções que nós lançamos
 * ("Jogador 7 não encontrado") e LISTA de objetos quando o Pydantic recusa o
 * corpo (422). A versão anterior só sabia ler a string e mandava todo o resto
 * para uma mensagem genérica — que é o mesmo que não dizer nada.
 */
function descreverErro(status: number, bruto: string): string {
  let corpo: unknown;
  try {
    corpo = JSON.parse(bruto);
  } catch {
    // Não é JSON: veio de um proxy ou de uma página de erro, não do FastAPI.
    return status >= 500
      ? "A taverna tropeçou no próprio feitiço. Tente de novo em alguns instantes."
      : "Não foi possível realizar o duelo agora.";
  }

  const detalhe = (corpo as { detail?: unknown })?.detail;

  if (typeof detalhe === "string") return detalhe;

  if (Array.isArray(detalhe)) {
    const campos = detalhe
      .map((e) => {
        const loc = (e as { loc?: unknown[] })?.loc;
        return Array.isArray(loc) ? loc[loc.length - 1] : null;
      })
      .filter(Boolean)
      .join(", ");
    return campos
      ? `A taverna recusou o pedido do duelo (${campos}). Escaneie o card de novo.`
      : "A taverna recusou o pedido do duelo. Escaneie o card de novo.";
  }

  return status >= 500
    ? "A taverna tropeçou no próprio feitiço. Tente de novo em alguns instantes."
    : "Não foi possível realizar o duelo agora.";
}

/** XP que o desafiante levou — é o número que a tela de resultado destaca. */
export function xpDoDesafiante(resultado: ResultadoBatalha): number {
  return resultado.xp_a;
}

/** Traduz o resultado da API para o ponto de vista de quem está olhando a tela. */
export function pontoDeVistaDoDesafiante(
  resultado: ResultadoBatalha,
): "vitoria" | "derrota" | "empate" {
  if (resultado.resultado === "empate") return "empate";
  return resultado.resultado === "a" ? "vitoria" : "derrota";
}
