import React from "react";

interface LessonContainerProps {
  /** Lesson title */
  title: string;
  /** Module name (e.g. "Kinematics") */
  module?: string;
  children: React.ReactNode;
}

/**
 * Top-level wrapper for a lesson page.
 * Renders a header with module tag + title, then arranges children
 * in a consistent vertical layout.
 */
export default function LessonContainer({
  title,
  module,
  children,
}: LessonContainerProps) {
  return (
    <article className="max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <header className="mb-8">
        {module && (
          <span className="inline-block mb-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider">
            {module}
          </span>
        )}
        <h1 className="text-3xl font-bold text-text tracking-tight">{title}</h1>
      </header>

      {/* Content sections */}
      <div className="space-y-8">{children}</div>
    </article>
  );
}
