"use client";

import { useId, useState, type ReactNode, type RefObject } from "react";
import { QRCodeSVG } from "qrcode.react";
import Image from "next/image";
import { CLASS_ARTWORK } from "@/lib/class-artwork";
import { IconText } from "@/components/ui/illustrated-icons";

type Stat = { label: string; icon: string; value: number };
function CardStar() {
  return <Image src="/icons/card-golden-star-v1.png" alt="" aria-hidden="true" width={80} height={90} unoptimized className="hero-card-star" />;
}

export default function HeroTradingCard({ cardRef, name, classTitle, description, stats, tags = [], portrait, rarity, qrUrl, portraitError = false }: { cardRef?: RefObject<HTMLDivElement | null>; name?: string; classTitle: string; description: string; stats: Stat[]; tags?: string[]; portrait: ReactNode; rarity?: ReactNode; qrUrl?: string | null; portraitError?: boolean }) {
  const [back, setBack] = useState(false);
  const id = useId();
  const classArtwork = CLASS_ARTWORK[classTitle];
  const strongest = [...stats].sort((a,b)=>b.value-a.value).slice(0,2);
  return <div className="hero-trading-wrap">
    <div ref={cardRef} className="hero-trading-card hero-parchment-card" data-side={back ? "back" : "front"} id={id}>
      <div className="hero-trading-front" aria-hidden={back} inert={back}>
        <div className="hero-trading-brand">Analytics de Taverna</div>
        <div className="hero-trading-portrait" role="status" aria-live="polite" data-export-ignore={portraitError ? "" : undefined}>{portrait}</div>
        <div className="hero-card-star-top"><CardStar /></div>
        <div className="hero-trading-caption"><div className="hero-card-star-bottom"><CardStar /></div><h2 className="hero-trading-player">{name || "Aventureiro sem nome"}</h2><p className="hero-trading-class">{classTitle}</p>{rarity && <div className="hero-trading-rarity">{rarity}</div>}</div>
        <ul className="hero-trading-stats" aria-label="Atributos do personagem">{stats.map((stat,index)=><li key={stat.label} className={`hero-trading-stat stat-${index}`}><span className="hero-trading-stat-symbol" aria-hidden="true"><IconText text={stat.icon} /></span><span className="hero-trading-stat-label">{stat.label}</span><strong>{stat.value}</strong></li>)}</ul>
        {qrUrl ? <div className="hero-trading-front-qr"><QRCodeSVG value={qrUrl} size={88} bgColor="#fff8e8" fgColor="#241a11" marginSize={4} title="QR code para desafiar este personagem" /><span>Escaneie para a batalha</span></div> : <p className="hero-trading-front-qr-pending">O QR de batalha aparece quando o personagem termina de ser salvo.</p>}
        <span className="hero-trading-origin">Uma lenda forjada nas suas escolhas</span>
      </div>
      <div className="hero-trading-back" aria-hidden={!back} inert={!back} data-export-ignore>
        <div className="hero-trading-back-art" aria-hidden="true">{classArtwork && <Image src={`/classes/${classArtwork}.png`} alt="" width={640} height={640} unoptimized />}</div>
        <div className="hero-trading-back-content">
        <span className="hero-trading-back-brand">Analytics de Taverna</span>
        {classArtwork && <div className="hero-trading-back-miniature"><Image src={`/classes/${classArtwork}.png`} alt={`Miniatura de ${classTitle}`} width={140} height={140} unoptimized /></div>}
        <span className="hero-trading-lore-label">Crônicas do personagem</span>
        <h2>{name || "Aventureiro sem nome"}</h2>
        <span className="hero-trading-lore-class">{classTitle}</span>
        <p className="hero-trading-lore">{description}</p>
        <p className="hero-trading-lore-profile">Suas escolhas no quiz destacam {strongest.map(stat=>stat.label.toLocaleLowerCase("pt-BR")).join(" e ")}.</p>
        {tags.length > 0 && <ul className="hero-trading-tags" aria-label="Traços revelados pelas suas respostas">{tags.map(tag=><li key={tag}>{tag}</li>)}</ul>}

        <span className="hero-trading-lore-seal">Cada escolha escreve uma nova lenda.</span>
        </div>
      </div>
    </div>
    <button type="button" className="hero-trading-flip" onClick={()=>setBack(value=>!value)} aria-controls={id} aria-pressed={back}>{back ? "Ver frente da carta" : "Virar carta · Ler sua história"}</button>
  </div>;
}
