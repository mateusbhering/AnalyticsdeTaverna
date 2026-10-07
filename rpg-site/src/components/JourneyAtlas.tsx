import { Castle, Signpost, Users, DoorOpen } from "@/components/ui/illustrated-icons";
const atlasIcons = [Castle, Signpost, Users, DoorOpen];
export default function JourneyAtlas() {
  return (
    <section className="journey-atlas" aria-labelledby="atlas-title">
      <div className="journey-atlas-header">
        <span className="section-eyebrow">Seu mapa de navegação</span>
        <h2 id="atlas-title">Toda jornada começa com um chamado</h2>
      </div>
      <svg className="atlas-landscape" viewBox="0 0 1000 350" preserveAspectRatio="none" fill="none" stroke="currentColor" aria-hidden="true">
        <defs>
          <pattern id="atlas-trees" width="45" height="50" patternUnits="userSpaceOnUse">
            <path d="M23 4 10 28h8L7 41h32L28 28h8ZM23 41v7" strokeWidth="1.2" />
          </pattern>
          <pattern id="atlas-hills" width="100" height="70" patternUnits="userSpaceOnUse">
            <path d="m5 60 35-50 35 50M40 10l-4 22 12-6 8 17M52 60 22 38M65 60l24-35 20 35" strokeWidth="1.2" />
          </pattern>
        </defs>
        <path d="M80 85C220 300 260 70 420 200S640 260 760 140 910 100 960 240" strokeWidth="3" strokeDasharray="6 6" />
        <path d="M570 0c-90 90 130 120 30 210s30 70 120 140" strokeWidth="2" />
        <rect x="20" y="160" width="230" height="160" fill="url(#atlas-trees)" stroke="none" />
        <rect x="770" y="0" width="210" height="130" fill="url(#atlas-hills)" stroke="none" />
        <rect x="360" y="0" width="170" height="110" fill="url(#atlas-trees)" stroke="none" />
        <rect x="780" y="210" width="190" height="120" fill="url(#atlas-trees)" stroke="none" />
        <path d="M300 330h55v-40l-28-20-27 20ZM300 290h55M310 330v-25h15v25M660 78h70V35l-35-25-35 25ZM660 35h70M680 78V52h20v26" strokeWidth="2" />
      </svg>
      <nav className="journey-atlas-path" aria-label="Explore a taverna">
        {[
          { href: "#conceito", step: "I · O chamado", title: "Conheça a taverna", detail: "Descubra o universo e a proposta." },
          { href: "#fluxo", step: "II · O caminho", title: "Trace sua rota", detail: "Entenda cada etapa da experiência." },
          { href: "#guilda", step: "III · A guilda", title: "Encontre a guilda", detail: "Conheça quem construiu essa história." },
          { href: "#jornada", step: "IV · O portal", title: "Inicie sua jornada", detail: "Avance para descobrir seu personagem." },
        ].map((item, index) => { const Icon = atlasIcons[index]; return <a key={item.href} href={item.href}>
          <Icon className="atlas-symbol" aria-hidden="true" />
          <span>{item.step}</span><strong>{item.title}</strong><small>{item.detail}</small>
        </a>; })}
      </nav>
    </section>
  );
}
