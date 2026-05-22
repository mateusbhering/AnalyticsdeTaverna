"use client";

import { useState } from "react";
import WebcamCapture from "./WebcamCapture";
import CharacterResult from "./CharacterResult";
import { ALL_QUESTIONS } from "./questions-data";
import type { Option } from "./questions-data";

export interface Dimensions {
  lideranca: number;
  estrategia: number;
  disciplina: number;
  persistencia: number;
  sociabilidade: number;
  empatia: number;
  adaptabilidade: number;
  criatividade: number;
  impulsividade: number;
  percepcao: number;
}

const BASE_DIMS: Dimensions = {
  lideranca: 0, estrategia: 0, disciplina: 0, persistencia: 0,
  sociabilidade: 0, empatia: 0, adaptabilidade: 0, criatividade: 0,
  impulsividade: 0, percepcao: 0,
};

const QUIZ_SIZE = 5;

function pickRandom() {
  const shuffled = [...ALL_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, QUIZ_SIZE);
}

type Step = "photo" | "quiz" | "result";

export default function QuizForm() {
  const [step, setStep] = useState<Step>("photo");
  const [photo, setPhoto] = useState("");
  const [questions, setQuestions] = useState(pickRandom);
  const [current, setCurrent] = useState(0);
  const [dims, setDims] = useState<Dimensions>({ ...BASE_DIMS });
  const [tags, setTags] = useState<string[]>([]);

  const restart = () => {
    setStep("photo");
    setPhoto("");
    setQuestions(pickRandom());
    setCurrent(0);
    setDims({ ...BASE_DIMS });
    setTags([]);
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
            onClick={() => setStep("quiz")}
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
    const question = questions[current];
    const total = questions.length;
    const progress = Math.round((current / total) * 100);

    const handleAnswer = (opt: Option) => {
      setDims((prev) => {
        const next = { ...prev };
        if (opt.dimMain) next[opt.dimMain] += 2;
        if (opt.dimSec) next[opt.dimSec] = Math.max(0, next[opt.dimSec] + opt.pesoSec);
        return next;
      });
      if (opt.tag) setTags((prev) => [...prev, opt.tag]);
      if (current < total - 1) setCurrent((c) => c + 1);
      else setStep("result");
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
              onClick={() => handleAnswer(opt)}
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
  return <CharacterResult photo={photo} dims={dims} tags={tags} onRestart={restart} />;
}
