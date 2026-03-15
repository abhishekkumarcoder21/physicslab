import { cn } from "@/lib/utils/helpers";

interface ProgressTrackerProps {
  /** Current step (0-indexed) */
  currentStep: number;
  /** List of step labels */
  steps: string[];
}

/**
 * Visual step-based progress tracker with dots and connecting lines.
 */
export default function ProgressTracker({
  currentStep,
  steps,
}: ProgressTrackerProps) {
  const percent = steps.length > 1 ? (currentStep / (steps.length - 1)) * 100 : 0;

  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="relative h-2 rounded-full bg-surface-hover mb-4 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Step dots */}
      <div className="flex items-center justify-between">
        {steps.map((label, i) => {
          const done = i <= currentStep;
          const active = i === currentStep;
          return (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                  done
                    ? "bg-primary text-white shadow-md shadow-primary/30"
                    : "bg-surface-hover text-text-muted",
                  active && "ring-4 ring-primary/20 scale-110"
                )}
              >
                {done && i < currentStep ? (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={cn(
                  "text-[11px] font-medium max-w-[80px] text-center leading-tight",
                  done ? "text-primary" : "text-text-muted"
                )}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
