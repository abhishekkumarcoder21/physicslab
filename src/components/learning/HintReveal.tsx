"use client";

import { useState, type ReactNode } from "react";

interface HintRevealProps {
  /** Label shown on the hint trigger */
  label?: string;
  children: ReactNode;
}

/**
 * Collapsible hint block — click to expand/collapse with smooth animation.
 */
export default function HintReveal({
  label = "💡 Show Hint",
  children,
}: HintRevealProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-dashed border-warning/60 bg-warning/5 overflow-hidden transition-all">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-5 py-3 text-sm font-medium text-warning hover:bg-warning/10 transition-colors"
      >
        <span>{open ? "💡 Hide Hint" : label}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-5 pb-4 text-sm text-text-muted leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}
