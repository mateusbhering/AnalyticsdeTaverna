"use client";

import { useId, useState, type ReactNode, type RefObject } from "react";
import { QRCodeSVG } from "qrcode.react";
import { IconText } from "@/components/ui/illustrated-icons";

type Stat = { label: string; icon: string; value: number };
export default function HeroTradingCard({ cardRef, name, classTitle, description, stats, tags = [], portrait, rarity, qrUrl, portraitError = false }: { cardRef?: RefObject<HTMLDivElement | null>; name?: string; classTitle: string; description: string; stats: Stat[]; tags?: string[]; portrait: ReactNode; rarity?: ReactNode; qrUrl?: string | null; portraitError?: boolean }) {
  const [back, setBack] = useState(false);
  const id = useId();
  const strongest = [...stats].sort((a,b)=>b.value-a.value).slice(0,2);
  return <div className="hero-trading-wrap">
    <div ref={cardRef} className="hero-trading-card" id={id}>
      <div className="hero-trading-front" aria-hidden={back} inert={back}>
        <div className="hero-trading-portrait" role="status" aria-live="polite" data-export-ignore={portraitError ? "" : undefined}>{portrait}</div>
        <div className="hero-trading-shade" aria-hidden="true" />
        <div className="hero-trading-brand">Analytics de Taverna</div>
        <ul className="hero-trading-stats" aria-label="Atributos do personagem">{stats.map((stat,index)=><li key={stat.label} className={`hero-trading-stat stat-${index}`} aria-label={`${stat.label}: ${stat.value}`} title={`${stat.label}: ${stat.value}`}><span className="hero-trading-stat-symbol"><IconText text={stat.icon} /></span><strong>{stat.value}</strong></li>)}</ul>
        <div className="hero-trading-caption">{name && <p className="hero-trading-player">{name}</p>}<h2>{classTitle}</h2><div className="hero-trading-rarity">{rarity}</div><span className="hero-trading-origin">Uma lenda forjada nas suas escolhas</span></div>

      </div>
      {back && <div className="hero-trading-back" data-export-ignore>
        <span className="hero-trading-back-brand">Analytics de Taverna</span>
        <div className="hero-trading-back-sigil" aria-hidden="true">✧</div>
        <span className="hero-trading-lore-label">Crônicas do personagem</span>
        <h2>{name || classTitle}</h2>
        {name && <span className="hero-trading-lore-class">{classTitle}</span>}
        <p className="hero-trading-lore">{description}</p>
        <p className="hero-trading-lore-profile">Sua jornada revela destaque em {strongest.map(stat=>stat.label.toLocaleLowerCase("pt-BR")).join(" e ")}.</p>
        {tags.length > 0 && <ul className="hero-trading-tags" aria-label="Traços do personagem">{tags.map(tag=><li key={tag}>{tag}</li>)}</ul>}
        {qrUrl && <div className="hero-trading-back-qr"><QRCodeSVG value={qrUrl} size={62} bgColor="#ede5d1" fgColor="#201b19" /><span>Explore esta lenda</span></div>}
        <span className="hero-trading-lore-seal">Cada escolha escreve uma nova lenda.</span>
      </div>}
    </div>
    <button type="button" className="hero-trading-flip" onClick={()=>setBack(value=>!value)} aria-controls={id} aria-pressed={back}>{back ? "Ver frente da carta" : "Virar carta · Ler sua história"}</button>
  </div>;
}