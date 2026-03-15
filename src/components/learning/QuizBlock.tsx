"use client";

import { useState } from "react";

export interface QuizOption {
  id: string;
  text: string;
}

interface QuizBlockProps {
  question: string;
  options: QuizOption[];
  correctId: string;
  /** Optional explanation shown after answering */
  explanation?: string;
}

/**
 * Multiple-choice quiz block.
 * Tracks selection, validates answer, shows result with explanation.
 */
export default function QuizBlock({
  question,
  options,
  correctId,
  explanation,
}: QuizBlockProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const isCorrect = selected === correctId;

  function handleSubmit() {
    if (!selected) return;
    setSubmitted(true);
  }

  function handleReset() {
    setSelected(null);
    setSubmitted(false);
  }

  return (
    <div className="rounded-2xl border border-border bg-surface-card p-6 shadow-sm">
      {/* Question */}
      <p className="text-base font-semibold text-text mb-4">{question}</p>

      {/* Options */}
      <div className="space-y-2 mb-5">
        {options.map((opt) => {
          const isThis = selected === opt.id;
          let ringClass = "border-border hover:border-primary/50";
          if (submitted && opt.id === correctId) {
            ringClass = "border-success bg-success/10";
          } else if (submitted && isThis && !isCorrect) {
            ringClass = "border-danger bg-danger/10";
          } else if (isThis) {
            ringClass = "border-primary bg-primary/5";
          }

          return (
            <button
              key={opt.id}
              onClick={() => !submitted && setSelected(opt.id)}
              disabled={submitted}
              className={`w-full text-left rounded-xl border px-4 py-3 text-sm font-medium transition-all ${ringClass} disabled:cursor-default`}
            >
              {opt.text}
            </button>
          );
        })}
      </div>

      {/* Actions */}
      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={!selected}
          className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Check Answer
        </button>
      ) : (
        <div className="space-y-3">
          <p
            className={`flex items-center gap-2 text-sm font-semibold ${
              isCorrect ? "text-success" : "text-danger"
            }`}
          >
            {isCorrect ? "✓ Correct!" : "✗ Incorrect"}
          </p>
          {explanation && (
            <p className="text-sm text-text-muted leading-relaxed">
              {explanation}
            </p>
          )}
          <button
            onClick={handleReset}
            className="rounded-xl border border-border px-5 py-2 text-sm font-medium text-text-muted hover:bg-surface-hover transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
