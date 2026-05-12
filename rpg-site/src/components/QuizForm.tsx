"use client";

import { useState } from "react";

// As perguntas serão adicionadas aqui quando o CSV chegar
const questions: { id: number; text: string; options: string[] }[] = [];

export default function QuizForm() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

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

  const handleAnswer = (option: string) => {
    setAnswers((prev) => ({ ...prev, [question.id]: option }));
    if (current < total - 1) {
      setCurrent((c) => c + 1);
    } else {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-2xl bg-white/3 border border-purple-800/30 p-10 backdrop-blur-sm text-center">
        <div className="text-6xl mb-4 animate-float">🏆</div>
        <h2 className="text-2xl font-black text-white mb-2">Aventura Completa!</h2>
        <p className="text-purple-300/70 mb-6">Suas respostas foram registradas.</p>
        <button
          onClick={() => { setCurrent(0); setAnswers({}); setSubmitted(false); }}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-500 hover:to-indigo-500 transition-all"
        >
          Jogar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white/3 border border-purple-800/30 p-8 backdrop-blur-sm">
      {/* Progress */}
      <div className="flex items-center justify-between mb-2 text-xs text-purple-400/60">
        <span>Pergunta {current + 1} de {total}</span>
        <span>{progress}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 mb-8 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question */}
      <h2 className="text-white font-bold text-xl mb-6 leading-snug">{question.text}</h2>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(opt)}
            className="w-full text-left px-5 py-4 rounded-xl bg-white/3 border border-purple-800/30 text-purple-200 hover:bg-purple-900/30 hover:border-purple-600/60 hover:text-white transition-all duration-200 font-medium"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
