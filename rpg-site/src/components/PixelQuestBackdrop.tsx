"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";

function Favor({ type }: { type: number }) {
  return <svg viewBox="0 0 24 24" shapeRendering="crispEdges" aria-hidden="true">
    {type === 0 ? <><path d="M3 4h8v16H3Zm10 0h8v16h-8Z" fill="#d8bf87" stroke="#493524" strokeWidth="2"/><path d="M6 8h3m6 0h3M6 12h3m6 0h3" stroke="#735735" strokeWidth="2"/></> : type === 1 ? <><path d="M11 8h3v14h-3Z" fill="#8b7041"/><path d="M3 4h7v4h4V2h6v8h-6v4h-4V9H3Z" fill="#80a35d"/><path d="M5 16h14v6H5Z" fill="#b88c55"/></> : <><path d="M4 8h16v14H4Z" fill="#bb975f"/><path d="M7 9V4h10v5" fill="none" stroke="#69512e" strokeWidth="2"/><path d="M8 14h8m-8 4h8" stroke="#81613c" strokeWidth="2"/></>}
  </svg>;
}

export default function PixelQuestBackdrop({ setting = "village", showScenery = true }: { setting?: "village" | "academy"; showScenery?: boolean }) {
  const scene = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .05 });
    if (scene.current) observer.observe(scene.current);
    const handleVisibility = () => setTabVisible(!document.hidden);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", handleVisibility); };
  }, []);
  return <>
    <div ref={scene} className={`pixel-quest-backdrop ${showScenery ? "" : "without-scenery"} ${visible && tabVisible && !paused ? "is-running" : "is-paused"}`} aria-hidden="true">
      {showScenery && <Image src={setting === "academy" ? "/scenery/attributes-academy-pixel-v1.png" : "/scenery/daily-quest-village-desktop-v2.png"} alt="" fill unoptimized loading="eager" sizes="100vw" className="pixel-quest-village" />}
      <div className="pixel-quest-vignette" />
      {[0,1,2].map(pair => <div key={pair} className={`pixel-quest-pair pair-${pair}`}>
        <div className="pixel-chat chat-left"><i/><i/><i/></div>
        <div className="pixel-chat chat-right"><i/><i/><i/></div>
        {[0,1].map(side => <div key={side} className={`pixel-actor actor-${side}`} style={{ "--actor-column": pair * 2 + side } as CSSProperties}>
          <Image src="/classes/daily-quest-characters-v2.png" alt="" width={1536} height={512} unoptimized loading="eager" className="pixel-actor-sheet" />
        </div>)}
        <span className="pixel-favor"><Favor type={pair}/></span>
        <span className="pixel-task-done">✓</span>
      </div>)}
      <span className="pixel-firefly firefly-one"/><span className="pixel-firefly firefly-two"/>
    </div>
    <button type="button" className="pixel-motion-toggle" onClick={() => setPaused(value => !value)} aria-pressed={paused} aria-label={paused ? "Retomar animação do cenário de RPG" : "Pausar animação do cenário de RPG"}>{paused ? "Retomar cenário" : "Pausar cenário"}</button>
  </>;
}
