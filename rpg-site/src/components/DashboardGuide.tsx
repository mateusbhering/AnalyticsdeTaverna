"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
const topics = [
  { id: "dashboard-kpis", number: "01", title: "Indicadores do reino", speech: "Aqui estão os personagens forjados, a classe mais popular e sua presença no reino. Meu placar de almas... digo, de aventureiros!" },
  { id: "dashboard-frequencia", number: "02", title: "Mapa de frequência", speech: "Cada símbolo é uma classe. Mais brilho, mais personagens! Clique para ver a quantidade e o percentual. Nada de invocar números extras." },
  { id: "dashboard-atributos", number: "03", title: "Atributos médios", speech: "Estas são as médias dos sete atributos. As barras comparam os atributos entre si. Até o caos tem sua planilha!" },
  { id: "dashboard-classes", number: "04", title: "Distribuição de classes", speech: "Aqui você compara a participação de cada classe no total. Quem domina a taverna? Os números entregam o segredo." },
];
export default function DashboardGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const guide = useRef<HTMLDivElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const [spokenTopic, setSpokenTopic] = useState<string | null>(null);
  useEffect(() => {
    if (isOpen) guide.current?.querySelector<HTMLButtonElement>(".dashboard-guide-close")?.focus({ preventScroll: true });
  }, [isOpen]);
  const closeGuide = () => { setIsOpen(false); launcher.current?.focus(); };
  const openGuide = () => {
    const current = guide.current?.querySelector<HTMLAnchorElement>('a[aria-current="location"]');
    if (current) setSpokenTopic(current.hash.slice(1));
    setIsOpen(true);
  };
  const speech = topics.find(topic => topic.id === spokenTopic)?.speech ?? "Ressuscitei os relatórios! Escolha um tópico para explorar os resultados comigo. Prometo que nenhuma célula vai te morder.";
  return <>
    <div ref={guide} className="dashboard-guide-shell" data-guide-open={isOpen}>
    <aside id="dashboard-guide" className="dashboard-analyst" aria-labelledby="dashboard-analyst-name" aria-hidden={!isOpen} inert={!isOpen} onKeyDown={event => { if (event.key === "Escape") closeGuide(); }}>
    <button type="button" className="dashboard-guide-close" onClick={closeGuide}><span aria-hidden="true">×</span> Recolher guia</button>
    <div className="dashboard-analyst-sticky">
      <div className="dashboard-analyst-dialogue">
        <span>Seu escriba de resultados</span>
        <h3 id="dashboard-analyst-name">Necromante de Planilha</h3>
        <p aria-live="polite" aria-atomic="true">{speech}</p>
      </div>
      <div key={spokenTopic ?? "welcome"} className={`dashboard-analyst-portrait${spokenTopic ? " is-explaining" : ""}`}>
        <Image src="/classes/necromante.png" alt="Necromante de Planilha apresentando seus relatórios mágicos" width={640} height={640} unoptimized />
      </div>
      <nav className="dashboard-analyst-nav" aria-label="Explorar estatísticas do dashboard">
        {topics.map(topic => <a key={topic.id} href={`#${topic.id}`} onClick={() => setSpokenTopic(topic.id)}><span>{topic.number}</span>{topic.title}</a>)}
      </nav>
    </div>
    </aside>
    </div>
    <button ref={launcher} type="button" className="dashboard-guide-launcher" aria-label={isOpen ? "Recolher explicações do Necromante" : "Abrir explicações do Necromante"} aria-expanded={isOpen} aria-controls="dashboard-guide" onClick={isOpen ? closeGuide : openGuide} title={isOpen ? "Recolher guia" : "Precisa de ajuda?"}>
      <Image src="/classes/necromante.png" alt="" width={64} height={64} unoptimized />
      <span className="dashboard-guide-mini-bubble" aria-hidden="true">?</span>
    </button>
  </>;
}
