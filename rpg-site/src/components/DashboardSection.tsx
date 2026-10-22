"use client";
import DashboardGuide from "@/components/DashboardGuide";
import DashboardScrollEffects from "@/components/DashboardScrollEffects";
import type { ReactNode } from "react";
import { IconText, Sparkles } from "@/components/ui/illustrated-icons";
import { Reveal } from "@/components/ui/reveal";
import ClassFrequencyMap from "@/components/ClassFrequencyMap";
import CountUp from "@/components/ui/count-up";
import AnimatedBar from "@/components/ui/animated-bar";
import { ATRIBUTOS_CARD } from "@/lib/atributos";
import { byName, isClasseConhecida } from "@/lib/classes";
import type { PlayerStats } from "@/lib/stats";

const TOP_N = 10;
function classIcon(nome: string) {
  return <IconText text={isClasseConhecida(nome) ? byName(nome).icon : "✦"} />;
}
export default function DashboardSection({ stats, children }: { stats: PlayerStats | null; children?: ReactNode }) {
  const top = stats?.byClass.slice(0, TOP_N) ?? [];
  const resto = stats?.byClass.slice(TOP_N) ?? [];
  const restoPct = Math.round(resto.reduce((s, c) => s + c.pct, 0) * 10) / 10;
  const maisComum = stats?.byClass[0];
  const maiorMedia = stats ? Math.max(...ATRIBUTOS_CARD.map(({ chave }) => stats.averages[chave]), 1) : 1;
  return <div className="bg-black-linen dashboard-painted-scene">
    <DashboardScrollEffects />
    <section id="dashboard" className="dashboard-painted-root">
      <div className="section-line-top" />
      <Reveal><div className="text-center mb-16 dashboard-painted-heading">
        <span className="section-eyebrow">Pós-Experiência</span>
        <h2 className="text-5xl text-[var(--parchment)] mb-4">Dashboard <span className="gold-grad">ao Vivo</span></h2>
        <p className="text-[rgba(240,226,189,0.6)] text-lg max-w-2xl mx-auto italic">Um painel dinâmico que transforma o projeto em análise de comportamento coletivo em tempo real.</p>
      </div></Reveal>
      <div className="dashboard-painted-layout">
        <DashboardGuide />
        <div className="dashboard-painted-canvas">
          <div className="dashboard-painted-scroll" role="region" aria-label="Estatísticas do dashboard" tabIndex={0}>
      <div className="dashboard-rpg-console">
        <div className="dashboard-rpg-topline"><span>✦ Indicadores do reino</span><span>{stats ? "Registros da taverna" : "Aguardando registros"}</span></div>
        <div className="dashboard-rpg-layout">
          <section id="dashboard-atributos" className="dashboard-rpg-panel dashboard-rpg-attributes" aria-labelledby="dashboard-attributes-title">
            <h3 id="dashboard-attributes-title">Atributos médios</h3>
            <p className="dashboard-rpg-subtitle">O perfil dos aventureiros</p>
            <div className="dashboard-rpg-rows">
              {ATRIBUTOS_CARD.map(({ chave, rotulo, Icon }, i) => <div className="dashboard-rpg-row" key={chave}>
                <span className="dashboard-rpg-icon"><Icon size={24} strokeWidth={1.6} /></span>
                <div className="dashboard-rpg-row-content"><div className="dashboard-rpg-row-label"><span>{rotulo}</span><strong>{stats ? stats.averages[chave].toFixed(1) : "—"}</strong></div>
                  <div className="dashboard-rpg-track"><AnimatedBar pct={stats ? (stats.averages[chave] / maiorMedia) * 100 : 0} delay={i * 0.08} className="dashboard-rpg-fill" /></div>
                </div>
              </div>)}
            </div>
            <p className="dashboard-rpg-footnote">{stats ? `Média por atributo entre ${stats.total === 1 ? "o personagem gerado" : `os ${stats.total} personagens gerados`}. As barras comparam os atributos entre si.` : "As médias aparecem quando os dados estiverem disponíveis."}</p>
          </section>
          <div id="dashboard-frequencia" className="dashboard-rpg-map"><ClassFrequencyMap classes={stats?.byClass ?? []} /></div>
          <section id="dashboard-classes" className="dashboard-rpg-panel dashboard-rpg-distribution" aria-labelledby="dashboard-classes-title">
            <h3 id="dashboard-classes-title">Distribuição de classes</h3>
            <p className="dashboard-rpg-subtitle">Presença entre as fichas</p>
            <div className="dashboard-rpg-rows">
              {top.map((cls, i) => <div className="dashboard-rpg-row" key={cls.name}>
                <span className="dashboard-rpg-icon">{classIcon(cls.name)}</span>
                <div className="dashboard-rpg-row-content"><div className="dashboard-rpg-row-label"><span>{cls.name}</span><strong>{cls.pct.toFixed(1)}%</strong></div><div className="dashboard-rpg-track"><AnimatedBar pct={cls.pct} delay={i * 0.08} className="dashboard-rpg-fill" /></div></div>
              </div>)}
              {resto.length > 0 && <div className="dashboard-rpg-row"><span className="dashboard-rpg-icon"><IconText text="✦" /></span><div className="dashboard-rpg-row-content"><div className="dashboard-rpg-row-label"><span>{resto.length === 1 ? "Outra classe" : `Outras ${resto.length} classes`}</span><strong>{restoPct.toFixed(1)}%</strong></div><div className="dashboard-rpg-track"><AnimatedBar pct={restoPct} delay={TOP_N * 0.08} className="dashboard-rpg-fill" /></div></div></div>}
              {!top.length && <div className="dashboard-rpg-empty"><Sparkles size={30} /><p>A distribuição será revelada com os registros dos aventureiros.</p></div>}
            </div>
          </section>
        </div>
        <div id="dashboard-kpis" className="dashboard-rpg-summary" role="region" aria-label="Indicadores do reino">
          <div><span className="dashboard-rpg-summary-icon"><IconText text="📜" /></span><div><span>Personagens forjados</span><strong>{stats ? <CountUp value={stats.total} /> : "—"}</strong></div></div>
          <div><span className="dashboard-rpg-summary-icon">{maisComum ? classIcon(maisComum.name) : <IconText text="✦" />}</span><div><span>Classe mais popular</span><strong>{maisComum?.name ?? "Aguardando registros"}</strong></div></div>
          <div><span className="dashboard-rpg-summary-icon"><IconText text="🏆" /></span><div><span>Presença da classe mais popular</span><strong>{maisComum ? `${maisComum.pct.toFixed(1)}%` : "—"}</strong></div></div>
        </div>
      </div>
      {!stats && <p className="dashboard-rpg-status">Ainda não há personagens gerados. Os números aparecem aqui assim que as primeiras fichas forem forjadas na taverna.</p>}
      <div className="dashboard-painted-extra">{children}</div>
          </div>
        </div>
      </div>
    </section>
  </div>;
}







