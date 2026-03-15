"use client";

interface TopBarProps {
  /** Global progress percentage (0–100) */
  progress?: number;
}

export default function TopBar({ progress = 0 }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-white/80 backdrop-blur-md px-6 lg:pl-72">
      {/* Left: page context (placeholder) */}
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold text-text">Learn Physics</h2>
      </div>

      {/* Center: global progress bar */}
      <div className="hidden sm:flex items-center gap-3 flex-1 max-w-md mx-8">
        <span className="text-xs font-medium text-text-muted whitespace-nowrap">
          Overall Progress
        </span>
        <div className="relative w-full h-2 rounded-full bg-surface-hover overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <span className="text-xs font-bold text-primary min-w-[3ch] text-right">
          {Math.round(progress)}%
        </span>
      </div>

      {/* Right: user avatar */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent text-white text-sm font-bold shadow-md">
          U
        </div>
      </div>
    </header>
  );
}
