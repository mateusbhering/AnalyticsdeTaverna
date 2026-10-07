import Image from "next/image";
import { Swords, WandSparkles, ArrowDown } from "lucide-react";

export default function Hero() {
  return (
    <section className="rpg-hero cinematic-hero" aria-labelledby="hero-title">
      <Image src="/scenery/forest-battle-action-v2.png" alt="" fill priority unoptimized sizes="100vw" className="cinematic-backdrop" />
      <div className="cinematic-shade" aria-hidden="true" />
      <div className="rpg-hero-content">
        <div className="cinematic-brand">
          <Image src="/logo.png" alt="" width={72} height={72} priority />
          <span className="section-eyebrow">Entre na taverna · Descubra sua história</span>
        </div>
        <h1 id="hero-title"><span className="text-[var(--gold-light)]">Analytics de</span><br /><span className="text-[var(--parchment)]">Taverna</span></h1>
        <div className="cinematic-intro">
          <p>Uma experiência interativa que transforma <strong className="text-[var(--gold-light)]">dados comportamentais</strong> em <strong className="text-[var(--copper)]">personagens de RPG únicos.</strong></p>
          <p className="cinematic-motto">“Descubra qual é sua classe de RPG com base no seu perfil”</p>
          <div className="rpg-actions flex flex-wrap">
            <a href="#jornada" className="press btn-seal inline-flex items-center gap-2"><Swords size={18} /> Iniciar Aventura</a>
            <a href="#conceito" className="press btn-parchment inline-flex items-center gap-2"><WandSparkles size={18} /> Como Funciona</a>
          </div>
          <div className="rpg-resources grid grid-cols-4" aria-label="A experiência em números">
            {[{ val: 16, label: "Classes" }, { val: 7, label: "Atributos" }, { val: 120, label: "Perguntas" }, { val: 10, label: "Dimensões" }].map((s) => (
              <div key={s.label}><div className="text-gradient-gold">{s.val}</div><div>{s.label}</div></div>
            ))}
          </div>
        </div>
      </div>
      <a href="#conceito" className="cinematic-scroll"><span>Explore a taverna</span><ArrowDown size={16} /></a>
    </section>
  );
}
