import React from "react";

interface ConceptCardProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  /** Accent color class (e.g. "from-primary to-accent") */
  gradient?: string;
}

/**
 * Card component for presenting a physics concept.
 * Supports optional icon and gradient accent.
 */
export default function ConceptCard({
  title,
  children,
  icon,
  gradient = "from-primary to-accent",
}: ConceptCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-surface-card border border-border p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      {/* Gradient accent bar */}
      <div
        className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${gradient} opacity-80 group-hover:opacity-100 transition-opacity`}
      />

      <div className="flex items-start gap-4">
        {icon && (
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary shrink-0">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-text mb-2">{title}</h3>
          <div className="text-text-muted text-sm leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
