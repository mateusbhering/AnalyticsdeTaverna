"use client";

import { useState } from "react";
import WebcamCapture from "./WebcamCapture";
import CharacterResult from "./CharacterResult";

// As perguntas serão adicionadas aqui quando o CSV chegar
const questions: { id: number; text: string; options: { text: string; attrs: Partial<Attributes> }[] }[] = [];

interface Attributes {
  forca: number;
  inteligencia: number;
  agilidade: number;
  carisma: number;
  resistencia: number;
}

const BASE_ATTRS: Attributes = { forca: 50, inteligencia: 50, agilidade: 50, carisma: 50, resistencia: 50 };

type Step = "photo" | "quiz" | "result";

export default function QuizForm() {
  const [step, setStep] = useState<Step>("photo");
  const [photo, setPhoto] = useState<string>("");
  const [current, setCurrent] = useState(0);
  const [attrs, setAttrs] = useState<Attributes>({ ...BASE_ATTRS });

  const restart = () => {
    setStep("photo");
    setPhoto("");
    setCurrent(0);
    setAttrs({ ...BASE_ATTRS });
  };

  // ── STEP 1: Photo ──────────────────────────────────────────────
  if (step === "photo") {
    return (
      <div className="rounded-2xl bg-white/3 border border-purple-800/30 p-8 backdrop-blur-sm">
        <div className="text-center mb-6">
          <p className="text-white font-bold text-lg mb-1">Passo 1 de 2 — Foto</p>
          <p className="text-purple-400/60 text-sm">Tire uma foto para gerar seu avatar de RPG</p>
        </div>

        <WebcamCapture onCapture={(dataUrl) => setPhoto(dataUrl)} />

        {photo && (
          <button
            onClick={() => setStep(questions.length > 0 ? "quiz" : "result")}
            className="mt-6 w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-lg hover:from-purple-500 hover:to-indigo-500 transition-all animate-pulse-glow"
          >
            Continuar →
          </button>
        )}
      </div>
    );
  }

  // ── STEP 2: Quiz ───────────────────────────────────────────────
  if (step === "quiz") {
    if (questions.length === 0) {
      return (
        <div className="rounded-2xl bg-white/3 border border-purple-800/30 p-10 backdrop-blur-sm text-center">
          <div className="text-5xl mb-4">⚙️</div>
          <p className="text-purple-300/70 text-lg font-semibold">Quiz em preparação</p>
          <p className="text-purple-400/50 text-sm mt-2">As perguntas serão adicionadas em breve.</p>
        </div>
      );
    }

    const question = questions[current];
    const total = questions.length;
    const progress = Math.round((current / total) * 100);

    const handleAnswer = (partialAttrs: Partial<Attributes>) => {
      const updated = { ...attrs };
      for (const [k, v] of Object.entries(partialAttrs) as [keyof Attributes, number][]) {
        updated[k] = Math.min(100, updated[k] + v);
      }
      setAttrs(updated);

      if (current < total - 1) {
        setCurrent((c) => c + 1);
      } else {
        setStep("result");
      }
    };

    return (
      <div className="rounded-2xl bg-white/3 border border-purple-800/30 p-8 backdrop-blur-sm">
        <div className="text-center mb-4">
          <p className="text-white font-bold text-lg mb-1">Passo 2 de 2 — Quiz</p>
        </div>

        <div className="flex items-center justify-between mb-2 text-xs text-purple-400/60">
          <span>Pergunta {current + 1} de {total}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/10 mb-6 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <h2 className="text-white font-bold text-xl mb-6 leading-snug">{question.text}</h2>

        <div className="space-y-3">
          {question.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(opt.attrs)}
              className="w-full text-left px-5 py-4 rounded-xl bg-white/3 border border-purple-800/30 text-purple-200 hover:bg-purple-900/30 hover:border-purple-600/60 hover:text-white transition-all duration-200 font-medium"
            >
              {opt.text}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── STEP 3: Result ─────────────────────────────────────────────
  return <CharacterResult photo={photo} attributes={attrs} onRestart={restart} />;
}
