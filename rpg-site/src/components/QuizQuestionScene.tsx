"use client";

import Image from "next/image";
import { useEffect, useId, useRef } from "react";
import type { Option, Question } from "./questions-data";

export default function QuizQuestionScene({ question, number, total, onAnswer }: { question: Question; number: number; total: number; onAnswer: (option: Option) => void }) {
  const title = useRef<HTMLHeadingElement>(null);
  const id = useId();
  useEffect(() => { title.current?.focus(); }, [question.id]);
  return <div className="quiz-grimoire-scene">
    <div className="quiz-grimoire-dialogue">
      <Image src="/classes/mago-chatgpt.png" alt="Mago do ChatGPT segurando seu grimório" width={384} height={384} unoptimized className="quiz-grimoire-mage" />
      <div className="quiz-grimoire-bubble">
        <h2 id={id} ref={title} tabIndex={-1}><span className="sr-only">Pergunta {number} de {total}. </span>{question.text}</h2>
      </div>
    </div>
    <div className="quiz-grimoire-answers" role="group" aria-labelledby={id}>
      {question.options.map((option, index) => <button key={`${question.id}-${index}`} type="button" className="quiz-grimoire-answer" onClick={() => onAnswer(option)}><span className="quiz-answer-letter" aria-hidden="true">{String.fromCharCode(65 + index)}</span><span>{option.text}</span></button>)}
    </div>
  </div>;
}