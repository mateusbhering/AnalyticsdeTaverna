import { BicepsFlexed, Brain, Zap, Shield, Sparkles, Eye, Tornado, type LucideIcon } from "lucide-react";

/**
 * Os 7 atributos do card do personagem. Mesmas chaves que o backend usa em
 * `app/domain/batalha.py` (`ATRIBUTOS_VALIDOS`) — se um lado mudar o nome de
 * uma chave, o outro para de bater e o TypeScript/Pydantic acusam na hora.
 *
 * Ordem intencional: bate com o protótipo (Força/Inteligência na 1ª linha,
 * Resistência/Agilidade na 2ª, Sabedoria/Carisma na 3ª, Caos sozinho por
 * último) — é a mesma ordem que `AttributesSection.tsx` usa no card do
 * personagem, então o jogador já reconhece o layout.
 */
export type ChaveAtributo =
  | "forca"
  | "inteligencia"
  | "resistencia"
  | "agilidade"
  | "sabedoria"
  | "carisma"
  | "caos";

export const ATRIBUTOS_CARD: { chave: ChaveAtributo; rotulo: string; Icon: LucideIcon }[] = [
  { chave: "forca", rotulo: "Força", Icon: BicepsFlexed },
  { chave: "inteligencia", rotulo: "Inteligência", Icon: Brain },
  { chave: "resistencia", rotulo: "Resistência", Icon: Shield },
  { chave: "agilidade", rotulo: "Agilidade", Icon: Zap },
  { chave: "sabedoria", rotulo: "Sabedoria", Icon: Eye },
  { chave: "carisma", rotulo: "Carisma", Icon: Sparkles },
  { chave: "caos", rotulo: "Caos", Icon: Tornado },
];

export const QTD_ATRIBUTOS_POR_BATALHA = 3;
