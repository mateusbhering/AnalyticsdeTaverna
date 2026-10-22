"use client";

import Image from "next/image";
import { useRef, useState, type CSSProperties } from "react";

const symbols = ["Selo da personalidade", "Selo da criação arcana", "Selo das histórias conectadas", "Selo da jornada"];

function SigilDrawing({ variant }: { variant: number }) {
  if (variant === 0) return <>
    <path d="M150 70 220 110V190L150 230 80 190V110ZM150 70V230M80 110 220 190M220 110 80 190" opacity=".55" />
    <path d="M148 119C135 102 111 111 112 130 96 135 97 160 112 165 107 186 133 197 148 180ZM152 119C165 102 189 111 188 130 204 135 203 160 188 165 193 186 167 197 152 180ZM119 132 134 140 127 157M181 132 166 140 173 157M119 171 135 165M181 171 165 165" strokeWidth="3" />
    {[[150,70],[220,110],[220,190],[150,230],[80,190],[80,110]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="9" fill="currentColor" fillOpacity=".3" />)}
  </>;
  if (variant === 1) return <>
    <path d="M150 55 210 134 150 218 90 134ZM150 55V218M90 134H210M150 55 126 134 150 218 174 134Z" strokeWidth="3" />
    <ellipse cx="150" cy="146" rx="94" ry="33" transform="rotate(-25 150 146)" />
    <path d="M73 70V94M61 82H85M226 191V217M213 204H239M216 68V84M208 76H224" strokeWidth="3" />
    <circle cx="150" cy="134" r="13" fill="currentColor" fillOpacity=".25" />
  </>;
  if (variant === 2) return <>
    <path d="M150 83 224 206H76ZM150 83V169M76 206 150 169 224 206" strokeDasharray="5 5" />
    <rect x="124" y="55" width="52" height="76" rx="4" strokeWidth="3" /><rect x="46" y="167" width="52" height="76" rx="4" strokeWidth="3" /><rect x="202" y="167" width="52" height="76" rx="4" strokeWidth="3" />
    <path d="m150 72 12 19-12 19-12-19ZM72 183 84 202 72 222 60 202ZM228 183 240 202 228 222 216 202Z" />
    <circle cx="150" cy="169" r="14" /><path d="M139 169H161M150 158V180" />
  </>;
  return <>
    <path d="M150 62 214 91V154C214 191 185 219 150 238 115 219 86 191 86 154V91Z" strokeWidth="3" />
    <path d="M150 89 165 145 150 170 135 145ZM150 170V205M125 178H175" strokeWidth="3" />
    <path d="M52 215 62 199 72 215 82 199M218 90 228 74 238 90 248 74M60 95 73 82 86 95 73 108Z" />
    <circle cx="73" cy="95" r="22" /><path d="M54 145C30 187 62 252 118 250M192 49C239 38 265 86 250 127" strokeDasharray="4 7" />
  </>;
}

export function AdvantageSigilIcon({ variant }: { variant: number }) {
  return <svg viewBox="0 0 300 300" fill="none" aria-hidden="true" className="advantage-sigil-icon"><g stroke="currentColor" strokeWidth="3"><circle cx="150" cy="150" r="132" /><circle cx="150" cy="150" r="119" opacity=".4" /><SigilDrawing variant={variant} /></g></svg>;
}
export default function MagicTable({ simulation, transition, onNavigate, onInteractionChange }: { simulation: number; transition: number; onNavigate: (direction: number) => void; onInteractionChange: (interacting: boolean) => void }) {
  const surface = useRef<HTMLDivElement>(null);
  const pointer = useRef<{ id: number; x: number; y: number } | null>(null);
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const finish = () => { pointer.current = null; setOffset(0); setDragging(false); onInteractionChange(false); };
  return <div className="ritual-table-wrap">
    <div ref={surface} className={`ritual-table-surface ritual-simulation-${simulation} ${dragging ? "is-swiping" : ""}`} onPointerDown={event => {
      if (event.button !== 0 || pointer.current) return;
      pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragging(true); onInteractionChange(true);
    }} onPointerMove={event => {
      const drag = pointer.current;
      if (!drag || drag.id !== event.pointerId) return;
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      if (Math.abs(dx) > Math.abs(dy)) setOffset(Math.max(-65,Math.min(65,dx * .45)));
    }} onPointerUp={event => {
      const drag = pointer.current;
      if (!drag || drag.id !== event.pointerId) return;
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      const threshold = Math.max(30,(surface.current?.clientWidth ?? 300) * .09);
      if (Math.abs(dx) >= threshold && Math.abs(dx) > Math.abs(dy) * 1.2) onNavigate(dx < 0 ? 1 : -1);
      finish();
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    }} onPointerCancel={finish} onLostPointerCapture={finish}>
      <Image src="/scenery/ritual-table-cutout-v2.png" alt="Mesa de madeira recortada, com velas, livros e pergaminhos" width={1536} height={1024} unoptimized className="ritual-table-cutout" draggable={false} />
      <button type="button" className="ritual-magic-drag" style={{ left: "50%", top: "55%", marginLeft: offset }} aria-label={`${symbols[simulation]}. Arraste para mudar de vantagem`} onKeyDown={event => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault(); onNavigate(event.key === "ArrowRight" ? 1 : -1);
      }}>
        <svg viewBox="0 0 300 300" fill="none" aria-hidden="true" className="ritual-sigil">
          <g stroke="currentColor" strokeWidth="2">
            <circle cx="150" cy="150" r="132" strokeWidth="4" /><circle cx="150" cy="150" r="119" />
            {Array.from({ length: 16 }, (_, index) => <g key={index} transform={`rotate(${index * 22.5} 150 150)`}><path d="M146 25V35H154M150 28H156" strokeWidth="2.5" /></g>)}
            {[0,1,2,3].map(variant => <g key={variant} className={`ritual-symbol-variant ${simulation === variant ? "is-active" : ""}`}><SigilDrawing variant={variant} /></g>)}
          </g>
          <g className="ritual-sigil-orbit" stroke="currentColor" strokeWidth="4"><circle cx="150" cy="150" r="110" strokeDasharray="10 155" /></g>
          <g className="ritual-sigil-pixels" fill="currentColor">{Array.from({ length: 12 }, (_, index) => <rect key={index} x="146" y="5" width="4" height="4" transform={`rotate(${index * 30} 150 150)`} />)}</g>
        </svg>
      </button>
      {transition > 0 && <div key={transition} className="ritual-potion-smoke" aria-hidden="true">
        {Array.from({ length: 20 }, (_, index) => <svg key={index} viewBox="0 0 24 24" className="ritual-smoke-puff" style={{ left: `${12 + index * 31 % 76}%`, top: `${40 + index * 17 % 40}%`, width: `${13 + index % 5 * 3}%`, animationDelay: `${index % 6 * 45}ms`, animationDuration: `${1550 + index % 5 * 130}ms`, "--smoke-x": `${(index % 7 - 3) * 13}px`, "--smoke-y": `${-35 - index % 4 * 13}px` } as CSSProperties} shapeRendering="crispEdges"><path d="M8 1h8v3h4v4h3v8h-3v4h-4v3H8v-3H4v-4H1V8h3V4h4Z" fill="currentColor" /><path d="M8 5h8v3h3v8h-3v3H8v-3H5V8h3Z" fill="white" fillOpacity=".13" /></svg>)}
      </div>}
    </div>

  </div>;
}