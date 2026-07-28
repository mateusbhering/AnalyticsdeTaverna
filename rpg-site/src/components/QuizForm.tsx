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
      <div className="arcane-corners bg-[rgba(15,9,5,0.9)] border border-[rgba(184,134,11,0.2)] p-8 backdrop-blur-sm">
        <span className="ac-bl" /><span className="ac-br" />
        <div className="text-center mb-6">
          <span
            className="section-eyebrow"
            style={{ fontSize: ".6rem", letterSpacing: ".25em" }}
          >
            Passo 1 de 2 — Captura
          </span>
          <h2
            className="text-[1.5rem] text-[var(--parchment)] mb-1"
            style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
          >
            A Essência do Seu Herói
          </h2>
          <p className="text-[rgba(244,228,188,0.5)] text-sm italic">
            Tire uma foto para gerar seu avatar de RPG único
          </p>
        </div>

        <WebcamCapture onCapture={(dataUrl) => setPhoto(dataUrl)} />

        {photo && (
          <button
            onClick={() => setStep("quiz")}
            className="mt-6 w-full py-4 bg-[var(--wine)] border-2 border-[rgba(184,134,11,0.6)] text-[var(--parchment)] tracking-[.12em] uppercase flex items-center justify-center gap-2 hover:border-[var(--gold)] hover:bg-[rgba(74,14,14,0.7)] transition-all animate-pulse-wine text-[.8rem]"
            style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
          >
            ⚔ Continuar para o Quiz →
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
      <div className="arcane-corners bg-[rgba(15,9,5,0.9)] border border-[rgba(184,134,11,0.2)] p-8 backdrop-blur-sm">
        <span className="ac-bl" /><span className="ac-br" />
        <div className="text-center mb-5">
          <span className="section-eyebrow" style={{ fontSize: ".6rem", letterSpacing: ".25em" }}>
            Passo 2 de 2 — Ritual
          </span>
          <h2
            className="text-[1.3rem] text-[var(--parchment)]"
            style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
          >
            Quiz Comportamental
          </h2>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div
            className="flex items-center justify-between mb-1.5 text-[.6rem] text-[rgba(184,134,11,0.6)] tracking-[.2em] uppercase"
            style={{ fontFamily: "var(--font-cinzel), serif" }}
          >
            <span>Páginas do Grimório</span>
            <span>{current + 1} / {total}</span>
          </div>
          <div className="quiz-progress-track">
            <div className="quiz-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Question card — parchment style */}
        <div
          className="arcane-corners p-7 mb-5"
          style={{
            background: "linear-gradient(135deg, #f4e4bc 0%, #e8d5a0 100%)",
            border: "1px solid rgba(184,134,11,.4)",
          }}
        >
          <span className="ac-bl" /><span className="ac-br" />
          <h2
            className="text-[var(--wood)] text-base leading-relaxed mb-5 tracking-[.04em]"
            style={{ fontFamily: "var(--font-cinzel), serif" }}
          >
            {question.text}
          </h2>
          <div className="space-y-2">
            {question.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(opt)}
                className="w-full text-left px-5 py-3.5 border text-[var(--wood)] transition-all duration-200 flex items-center justify-between group text-sm"
                style={{
                  background: "rgba(45,27,13,.06)",
                  borderColor: "rgba(45,27,13,.15)",
                  fontFamily: "var(--font-crimson-pro), Georgia, serif",
                  fontSize: "1rem",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(74,14,14,.12)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(74,14,14,.4)";
                  (e.currentTarget as HTMLButtonElement).style.paddingLeft = "28px";
                  (e.currentTarget as HTMLButtonElement).style.color = "#4a0e0e";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(45,27,13,.06)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(45,27,13,.15)";
                  (e.currentTarget as HTMLButtonElement).style.paddingLeft = "20px";
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--wood)";
                }}
              >
                <span>{opt.text}</span>
                <span className="text-[rgba(45,27,13,.3)] group-hover:text-[rgba(74,14,14,.8)] transition-all text-lg">›</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── STEP 3: Result ─────────────────────────────────────────────
  return <CharacterResult photo={photo} dims={dims} tags={tags} onRestart={restart} />;
}
