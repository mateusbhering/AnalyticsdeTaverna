"use client";

import { Scroll, Swords, Trophy, TriangleAlert, Route } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import AnimatedBar from "@/components/ui/animated-bar";
import { ATRIBUTOS_CARD } from "@/lib/atributos";
import { byName, isClasseConhecida } from "@/lib/classes";
import type { AnalyticsExtra } from "@/lib/analytics";

/** Emoji da classe; classes fora do catálogo atual não herdam o ícone errado. */
function classIcon(nome: string): string {
  return isClasseConhecida(nome) ? byName(nome).icon : "✦";
}

/** Rótulo (substantivo) das 10 dimensões — mesmas chaves de `DIMENSOES` no backend. */
const DIMENSAO_ROTULOS: Record<string, string> = {
  lideranca: "Liderança",
  estrategia: "Estratégia",
  disciplina: "Disciplina",
  persistencia: "Persistência",
  sociabilidade: "Sociabilidade",
  empatia: "Empatia",
  adaptabilidade: "Adaptabilidade",
  criatividade: "Criatividade",
  impulsividade: "Impulsividade",
  percepcao: "Percepção",
};

/** Rótulo de um atributo pela chave — cai na própria chave se for desconhecida. */
function atributoRotulo(chave: string): string {
  return ATRIBUTOS_CARD.find((a) => a.chave === chave)?.rotulo ?? chave;
}
function AtributoIcon({ chave }: { chave: string }) {
  const Icon = ATRIBUTOS_CARD.find((a) => a.chave === chave)?.Icon;
  return Icon ? <Icon size={14} strokeWidth={1.6} className="flex-shrink-0" /> : null;
}

const BarraLinha = ({
  label,
  icon,
  pct,
  valor,
  delay,
}: {
  label: string;
  icon?: React.ReactNode;
  pct: number;
  valor: string;
  delay: number;
}) => (
  <div>
    <div className="flex items-center justify-between mb-1 gap-2">
      <div className="flex items-center gap-2 text-[.82rem] text-[var(--ink-70)] min-w-0">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <span
        className="text-[var(--foil)] text-[.7rem] flex-shrink-0 tabular-nums"
        style={{ fontFamily: "var(--font-cinzel), serif" }}
      >
        {valor}
      </span>
    </div>
    <div className="h-1.5 bg-[rgba(96,66,26,0.14)] border border-[rgba(96,66,26,0.2)] overflow-hidden">
      <AnimatedBar
        pct={pct}
        delay={delay}
        className="opacity-90 bg-gradient-to-r from-[var(--seal)] to-[var(--gold)]"
      />
    </div>
  </div>
);

const CardTitulo = ({ children }: { children: React.ReactNode }) => (
  <h3
    className="text-[.8rem] text-[var(--foil)] tracking-[.15em] uppercase mb-5"
    style={{ fontFamily: "var(--font-cinzel), serif" }}
  >
    {children}
  </h3>
);

export default function TavernaInsightsSection({ dados }: { dados: AnalyticsExtra }) {
  const { batalhas, taxaVitoria, insight, funil } = dados;

  // Nada veio do backend — API fora do ar ou hibernando. Silêncio, não erro:
  // o dashboard acima já cobre o caso "ainda não há personagens".
  if (!batalhas && !taxaVitoria && !insight?.frase && !funil) return null;

  const etapasFunil = funil?.etapas.filter((e) => e.total > 0) ?? [];

  const dimensoes = insight?.medias
    ? Object.entries(insight.medias).sort((a, b) => b[1] - a[1])
    : [];
  const maiorDimensao = dimensoes.length ? Math.max(...dimensoes.map(([, v]) => v), 1) : 1;

  const atributosEscolhidos = batalhas?.atributos_escolhidos.slice(0, 7) ?? [];
  const maiorEscolha = atributosEscolhidos.length
    ? Math.max(...atributosEscolhidos.map((a) => a.percentual), 1)
    : 1;

  const rankingClasses = taxaVitoria?.classes.filter((c) => c.total_batalhas > 0) ?? [];
  const top5 = rankingClasses.slice(0, 5);
  const maisFraca =
    rankingClasses.length > 5 ? rankingClasses[rankingClasses.length - 1] : undefined;

  return (
    <div className="bg-black-linen">
      <section className="py-16 px-6 relative max-w-7xl mx-auto">
        <Reveal>
          <div className="text-center mb-16">
            <span className="section-eyebrow">Ciência de Dados da Taverna</span>
            <h2 className="text-5xl text-[var(--parchment)] mb-4">
              Perfil <span className="gold-grad">Coletivo</span>
            </h2>
            <p className="text-[rgba(240,226,189,0.6)] text-lg max-w-2xl mx-auto italic">
              O que os duelos e os quizzes revelam sobre quem passou pela taverna.
            </p>
          </div>
        </Reveal>

        {insight?.frase && (
          <Reveal>
            <div className="paper-card paper-frame p-8 mb-6 flex items-start gap-5">
              <div className="wax-seal flex-shrink-0">
                <Scroll size={22} strokeWidth={1.6} />
              </div>
              <div>
                <div
                  className="text-[.65rem] text-[var(--foil)] tracking-[.15em] uppercase mb-2"
                  style={{ fontFamily: "var(--font-cinzel), serif" }}
                >
                  Insight da Taverna
                </div>
                <p
                  className="text-[1.15rem] text-[var(--ink)] leading-snug"
                  style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
                >
                  {insight.frase}
                </p>
                <p className="text-[.7rem] text-[var(--ink-50)] italic mt-2">
                  Calculado sobre as 10 dimensões de {insight.base}{" "}
                  {insight.base === 1 ? "jogador" : "jogadores"}.
                </p>
              </div>
            </div>
          </Reveal>
        )}

        {etapasFunil.length > 1 && (
          <Reveal>
            <div className="paper-card paper-frame p-8 mb-6">
              <div className="flex items-center gap-2 mb-1">
                <Route size={16} strokeWidth={1.6} className="text-[var(--seal)] flex-shrink-0" />
                <CardTitulo>Funil de Conversão</CardTitulo>
              </div>
              <div className="space-y-4 mt-3">
                {etapasFunil.map((e, i) => (
                  <div key={e.etapa}>
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <span className="text-[.82rem] text-[var(--ink-70)]">{e.rotulo}</span>
                      <div className="flex items-baseline gap-2 flex-shrink-0">
                        <span
                          className="text-[.95rem] text-[var(--ink)] tabular-nums"
                          style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
                        >
                          {e.total}
                        </span>
                        <span className="text-[.65rem] text-[var(--foil)] tabular-nums">
                          {e.percentual_do_topo.toFixed(0)}% do topo
                        </span>
                        {e.percentual_da_etapa_anterior !== null && (
                          <span className="text-[.65rem] text-[var(--ink-50)] tabular-nums">
                            ({e.percentual_da_etapa_anterior.toFixed(0)}% da etapa anterior)
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="h-2 bg-[rgba(96,66,26,0.14)] border border-[rgba(96,66,26,0.2)] overflow-hidden">
                      <AnimatedBar
                        pct={e.percentual_do_topo}
                        delay={i * 0.08}
                        className="opacity-90 bg-gradient-to-r from-[var(--seal)] to-[var(--gold)]"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[.7rem] text-[var(--ink-50)] italic mt-4 leading-relaxed">
                {funil?.sem_eventos
                  ? "Instrumentação nova: ainda não há eventos suficientes para montar o funil."
                  : "Cada etapa segue a mesma sessão — de quem abriu o quiz até quem virou personagem e duelou. Sessões de antes da instrumentação não entram."}
              </p>
            </div>
          </Reveal>
        )}

        <Stagger className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {dimensoes.length > 0 && (
            <StaggerItem>
              <div className="paper-card paper-frame p-8 h-full">
                <CardTitulo>Perfil Comportamental Médio</CardTitulo>
                <div className="space-y-3">
                  {dimensoes.map(([dim, media], i) => (
                    <BarraLinha
                      key={dim}
                      label={DIMENSAO_ROTULOS[dim] ?? dim}
                      pct={(media / maiorDimensao) * 100}
                      valor={media.toFixed(1)}
                      delay={i * 0.06}
                    />
                  ))}
                </div>
                <p className="text-[.7rem] text-[var(--ink-50)] italic mt-4 leading-relaxed">
                  Média das 10 dimensões medidas pelo quiz. As barras comparam as dimensões entre si.
                </p>
              </div>
            </StaggerItem>
          )}

          {batalhas && batalhas.total_batalhas > 0 && (
            <StaggerItem>
              <div className="paper-card paper-frame p-8 h-full">
                <CardTitulo>Duelos da Taverna</CardTitulo>
                <div className="flex items-center gap-6 mb-5">
                  <div className="flex items-center gap-2">
                    <Swords size={16} strokeWidth={1.6} className="text-[var(--seal)]" />
                    <span
                      className="text-[1.4rem] text-[var(--ink)]"
                      style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
                    >
                      {batalhas.total_batalhas}
                    </span>
                    <span className="text-[.65rem] text-[var(--ink-50)] uppercase tracking-[.1em]">
                      {batalhas.total_batalhas === 1 ? "duelo" : "duelos"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[1.4rem] text-[var(--ink)]"
                      style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
                    >
                      {batalhas.taxa_empate.toFixed(1)}%
                    </span>
                    <span className="text-[.65rem] text-[var(--ink-50)] uppercase tracking-[.1em]">
                      empates
                    </span>
                  </div>
                </div>
                {atributosEscolhidos.length > 0 && (
                  <>
                    <div
                      className="text-[.65rem] text-[var(--ink-50)] tracking-[.1em] uppercase mb-3"
                      style={{ fontFamily: "var(--font-cinzel), serif" }}
                    >
                      Atributos mais levados ao combate
                    </div>
                    <div className="space-y-3">
                      {atributosEscolhidos.map((a, i) => (
                        <BarraLinha
                          key={a.atributo}
                          label={atributoRotulo(a.atributo)}
                          icon={<AtributoIcon chave={a.atributo} />}
                          pct={(a.percentual / maiorEscolha) * 100}
                          valor={`${a.percentual.toFixed(1)}%`}
                          delay={i * 0.06}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </StaggerItem>
          )}

          {top5.length > 0 && (
            <StaggerItem>
              <div className="paper-card paper-frame p-8 h-full">
                <CardTitulo>Classes Mais Fortes</CardTitulo>
                <div className="space-y-2.5">
                  {top5.map((c, i) => (
                    <div key={c.classe} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-[.82rem] text-[var(--ink-70)] min-w-0">
                        <span
                          className="text-[.65rem] text-[var(--ink-50)] w-4 flex-shrink-0 tabular-nums"
                          style={{ fontFamily: "var(--font-cinzel), serif" }}
                        >
                          {i + 1}
                        </span>
                        <span className="flex-shrink-0">{classIcon(c.classe)}</span>
                        <span className="truncate">{c.classe}</span>
                      </div>
                      <span className="tag-pill flex-shrink-0">{c.taxa_vitoria.toFixed(0)}%</span>
                    </div>
                  ))}
                </div>

                {maisFraca && (
                  <div className="divider !my-4" />
                )}
                {maisFraca && (
                  <div className="flex items-start gap-2 text-[.72rem] text-[var(--ink-50)] italic leading-relaxed">
                    <TriangleAlert size={14} strokeWidth={1.6} className="flex-shrink-0 mt-0.5" />
                    <span>
                      {maisFraca.classe} é a que menos vence ({maisFraca.taxa_vitoria.toFixed(0)}% em{" "}
                      {maisFraca.total_batalhas}{" "}
                      {maisFraca.total_batalhas === 1 ? "duelo" : "duelos"}) — sinal de possível
                      desbalanceamento entre classes.
                    </span>
                  </div>
                )}

                <p className="text-[.7rem] text-[var(--ink-50)] italic mt-4 leading-relaxed flex items-center gap-1.5">
                  <Trophy size={12} strokeWidth={1.8} className="flex-shrink-0" />
                  Só classes com ao menos um duelo registrado entram no ranking.
                </p>
              </div>
            </StaggerItem>
          )}
        </Stagger>
      </section>
    </div>
  );
}
