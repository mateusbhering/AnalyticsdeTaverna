"use client";

import { useState } from "react";
import WebcamCapture from "./WebcamCapture";
import CharacterResult from "./CharacterResult";
import { ALL_QUESTIONS } from "./questions-data";
import type { Option } from "./questions-data";
import { useTavernFeedback } from "@/lib/useTavernFeedback";

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

/**
 * Sorteia QUIZ_SIZE perguntas distintas do banco, todas com a mesma chance.
 *
 * Fisher-Yates parcial: para cada uma das QUIZ_SIZE primeiras posições, troca
 * com uma posição sorteada entre ela e o fim. Como só as posições sorteadas
 * importam, para o embaralhamento no tamanho do quiz em vez de percorrer as 120.
 *
 * O `sort(() => Math.random() - 0.5)` que estava aqui não serve: o comparador é
 * inconsistente (não define uma ordem total), então o resultado depende do
 * algoritmo de ordenação do motor e as perguntas do começo do banco saem com
 * frequência bem maior que as do fim.
 */
function pickRandom() {
  const pool = [...ALL_QUESTIONS];
  for (let i = 0; i < QUIZ_SIZE; i++) {
    const j = i + Math.floor(Math.random() * (pool.length - i));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, QUIZ_SIZE);
}

type Step = "photo" | "quiz" | "result";

export default function QuizForm() {
  /* Som e vibração ficam no topo do componente porque hooks não podem viver
     dentro dos ramos de `step`. Nada toca até o primeiro gesto do usuário — o
     próprio hook segura isso. */
  const { playPageTurn, playStamp } = useTavernFeedback();

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
      <div className="paper-card paper-frame arcane-corners p-8">
        <span className="ac-bl" /><span className="ac-br" />
        <div className="text-center mb-6">
          <span
            className="section-eyebrow"
            style={{ fontSize: ".6rem", letterSpacing: ".25em", color: "var(--seal)", opacity: 0.9 }}
          >
            Passo 1 de 2 — Captura
          </span>
          <h2
            className="text-[1.5rem] text-[var(--ink)] mb-1"
            style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
          >
            A Essência do Seu Herói
          </h2>
          <p className="text-sm italic">
            Tire uma foto para gerar seu avatar de RPG único
          </p>
        </div>

        <WebcamCapture onCapture={(dataUrl) => setPhoto(dataUrl)} />

        {photo && (
          <button
            onClick={() => setStep("quiz")}
            className="btn-seal mt-6 w-full py-4 tracking-[.12em] uppercase flex items-center justify-center gap-2 animate-pulse-wine text-[.8rem] cursor-pointer"
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
      if (current < total - 1) {
        setCurrent((c) => c + 1);
        playPageTurn(); // mais uma página do diário
      } else {
        setStep("result");
        playStamp(); // o lacre fecha o personagem
      }
    };

    return (
      <div className="paper-card paper-frame arcane-corners p-8">
        <span className="ac-bl" /><span className="ac-br" />
        <div className="text-center mb-5">
          <span
            className="section-eyebrow"
            style={{ fontSize: ".6rem", letterSpacing: ".25em", color: "var(--seal)", opacity: 0.9 }}
          >
            Passo 2 de 2 — Ritual
          </span>
          <h2
            className="text-[1.3rem] text-[var(--ink)]"
            style={{ fontFamily: "var(--font-cinzel-decorative), serif" }}
          >
            Quiz Comportamental
          </h2>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div
            className="flex items-center justify-between mb-1.5 text-[.6rem] text-[var(--foil)] tracking-[.2em] uppercase"
            style={{ fontFamily: "var(--font-cinzel), serif" }}
          >
            <span>Páginas do Grimório</span>
            <span>{current + 1} / {total}</span>
          </div>
          <div className="quiz-progress-track">
            <div className="quiz-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Pergunta — escrita direto na página do diário */}
        <div className="border-t border-[rgba(96,66,26,0.25)] pt-6 mb-5">
          <h2
            className="text-[var(--ink)] text-base leading-relaxed mb-5 tracking-[.04em]"
            style={{ fontFamily: "var(--font-cinzel), serif" }}
          >
            {question.text}
          </h2>
          <div className="space-y-2">
            {question.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(opt)}
                className="w-full text-left px-5 py-3.5 border text-[var(--ink)] transition-all duration-200 flex items-center justify-between group text-sm cursor-pointer"
                style={{
                  background: "rgba(60,42,24,.05)",
                  borderColor: "rgba(96,66,26,.22)",
                  fontFamily: "var(--font-crimson-pro), Georgia, serif",
                  fontSize: "1rem",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(140,35,24,.10)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(140,35,24,.45)";
                  (e.currentTarget as HTMLButtonElement).style.paddingLeft = "28px";
                  (e.currentTarget as HTMLButtonElement).style.color = "#8c2318";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(60,42,24,.05)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(96,66,26,.22)";
                  (e.currentTarget as HTMLButtonElement).style.paddingLeft = "20px";
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--ink)";
                }}
              >
                <span>{opt.text}</span>
                <span className="text-[rgba(96,66,26,.4)] group-hover:text-[rgba(140,35,24,.85)] transition-all text-lg">›</span>
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
