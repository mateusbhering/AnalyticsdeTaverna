"use client";

import Image from "next/image";
import { useState } from "react";

type Stage = "choose" | "capture" | "name" | "ready" | "error";
const dialogue: Record<Stage, { title: string; text: string }> = {
  choose: { title: "1 · Vamos preparar seu retrato!", text: "Clique em Abrir Câmera e permita o acesso, ou use Escolher Foto. Vamos revelar esse herói!" },
  capture: { title: "2 · Hora da pose de herói!", text: "Rosto no centro e boa luz! Clique em Tirar Foto. Cara de herói é opcional!" },
  name: { title: "3 · Como vamos chamar esse herói?", text: "Digite seu nome na faixa do retrato: é opcional e aparece no ranking. Pose de goblin? Use Refazer!" },
  ready: { title: "4 · Retrato e nome prontos!", text: "Sua foto inspira o avatar; suas respostas definem a classe. Clique em Continuar para o Quiz. Que rolem os dados!" },
  error: { title: "A câmera falhou no teste de magia!", text: "Libere a câmera no navegador e tente de novo, ou use Escolher Foto. Magia também tem plano B!" },
};

export default function PhotoCaptureGuide({ stage }: { stage: Stage }) {
  const line = dialogue[stage];
  const [open, setOpen] = useState(true);
  return <aside className="photo-capture-guide photo-capture-guide-docked" data-open={open} aria-label="Ajuda do Ilusionista de Call">
    <button type="button" className="photo-guide-toggle" aria-label={open ? "Recolher ajuda do Ilusionista" : "Abrir ajuda do Ilusionista"} aria-expanded={open} aria-controls="photo-guide-dialogue" onClick={() => setOpen(value => !value)}>
    <Image src="/classes/ilusionista-v2.png" alt="Ilusionista de Call com sua máscara de papel" width={180} height={200} unoptimized className="photo-capture-guide-character" />
    <span aria-hidden="true" className="photo-guide-toggle-badge">{open ? "−" : "?"}</span></button>
    <div id="photo-guide-dialogue" className="photo-capture-guide-bubble" hidden={!open}>
      <button type="button" className="photo-guide-close" aria-label="Recolher explicação" onClick={() => setOpen(false)}>×</button>
      <p aria-live="polite" aria-atomic="true">{line.text}</p>
    </div>
  </aside>;
}
