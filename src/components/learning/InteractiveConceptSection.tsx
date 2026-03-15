"use client";

import React from "react";

interface InteractiveConceptSectionProps {
  /** Section title */
  title: string;
  /** Section subtitle / concept number label */
  tag?: string;
  children: React.ReactNode;
  /** Reverse layout (content right, visual left) */
  reverse?: boolean;
  /** Full dark background */
  dark?: boolean;
}

/**
 * Full-width immersive section wrapper for the kinematics scroll page.
 * Provides consistent spacing, title treatment, and dark theme.
 */
export default function InteractiveConceptSection({
  title,
  tag,
  children,
  dark = true,
}: InteractiveConceptSectionProps) {
  return (
    <section
      className={`relative w-full py-20 px-6 md:px-12 lg:px-20 ${
        dark
          ? "bg-gradient-to-b from-[#0f172a] to-[#030712] text-white"
          : "bg-[#0c1425] text-white"
      }`}
    >
      {/* Subtle top border glow */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="mb-12 text-center">
          {tag && (
            <span className="inline-block mb-3 text-xs font-bold tracking-[0.25em] uppercase text-cyan-400/80">
              {tag}
            </span>
          )}
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-cyan-300 bg-clip-text text-transparent">
            {title}
          </h2>
        </div>

        {/* Content */}
        {children}
      </div>
    </section>
  );
}
