"use client";
import { useState, type CSSProperties } from "react";
import Image from "next/image";
import { CLASS_ARTWORK } from "@/lib/class-artwork";
import { CLASS_LIST } from "@/lib/classes";
import { IconText } from "@/components/ui/illustrated-icons";
import type { ClassCount } from "@/lib/stats";
const portraits = CLASS_ARTWORK;
export default function ClassFrequencyMap({ classes }: { classes: ClassCount[] }) {
  const [selectedName,setSelectedName] = useState<string | null>(null);
  // Normalização exclusiva do brilho; não altera as métricas recebidas.
  const maximum = Math.max(...classes.map(item=>item.count),1);
  const catalog = [...CLASS_LIST.map(item=>({name:item.name,icon:item.icon})),...classes.filter(item=>!CLASS_LIST.some(known=>known.name===item.name)).map(item=>({name:item.name,icon:"✦"}))];
  const selected = classes.find(item=>item.name===selectedName) ?? (selectedName ? {name:selectedName,count:0,pct:0} : classes[0]);
  const nodes = catalog.map((item,index)=>{
    const inner=index<6, ringIndex=inner?index:index-6, ringTotal=inner?Math.min(6,catalog.length):catalog.length-6;
    const angle=(-90+ringIndex*360/ringTotal)*Math.PI/180, radius=inner?142:250;
    const actual=classes.find(entry=>entry.name===item.name);
    return {...item,count:actual?.count??0,pct:actual?.pct??0,x:300+Math.cos(angle)*radius,y:300+Math.sin(angle)*radius};
  });
  return <section className="class-frequency-map" aria-labelledby="class-frequency-title">
    <div className="class-frequency-heading"><span>As presenças do reino</span><h3 id="class-frequency-title">Mapa de frequência das classes</h3><p>Quanto mais uma classe aparece no jogo, mais intenso é seu brilho.</p></div>
    <div className="class-frequency-wheel">
      <svg viewBox="0 0 600 600" className="class-frequency-runes" fill="none" aria-hidden="true"><circle cx="300" cy="300" r="250"/><circle cx="300" cy="300" r="225"/><circle cx="300" cy="300" r="142"/><circle cx="300" cy="300" r="105"/><path d="M300 48 518 174V426L300 552 82 426V174ZM300 158 423 229V371L300 442 177 371V229Z"/>{nodes.map(node=><path key={node.name} d={`M300 300 ${node.x} ${node.y}`} className="class-frequency-ray"/>)}</svg>
      <div className="class-frequency-heart" aria-hidden="true"><span>{!selected?"Aguardando dados":selected.name===classes[0]?.name?"Mais frequente":"Classe selecionada"}</span><strong>{selected?.pct.toFixed(1)??"0.0"}%</strong><small>{selected?.name??"Sem registros"}</small></div>
      {nodes.map(node=><button key={node.name} type="button" className={`class-frequency-node ${selected?.name===node.name?"is-selected":""} ${node.count===0?"is-unseen":""}`} style={{left:`${node.x/6}%`,top:`${node.y/6}%`,"--class-heat":node.count/maximum} as CSSProperties} aria-label={`${node.name}: ${node.count} personagens, ${node.pct.toFixed(1)}%`} aria-pressed={selected?.name===node.name} title={node.name} onClick={()=>setSelectedName(node.name)}><span className="class-frequency-medallion">{portraits[node.name]?<Image src={`/classes/${portraits[node.name]}.png`} alt="" width={100} height={100} unoptimized/>:<IconText text={node.icon}/>}</span><span className="class-frequency-node-count" aria-hidden="true">{node.count}</span></button>)}
    </div>
    <div className="class-frequency-readout" aria-live="polite" aria-atomic="true"><strong>{selected?.name??"Sem registros"}</strong><span>{selected?.count??0} {(selected?.count??0)===1?"personagem":"personagens"} · {selected?.pct.toFixed(1)??"0.0"}% do total</span></div>
    <div className="class-frequency-legend"><span>Menor frequência</span><i aria-hidden="true"/><span>Maior frequência</span></div><p className="class-frequency-note">Selecione um símbolo para ver os números. Classes sem registros ficam apagadas.</p>
  </section>;
}
