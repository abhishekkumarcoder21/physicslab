"use client";

import { SliderDef } from "./types";

interface Props {
  /** Slider definitions */
  sliders: SliderDef[];
  /** Called when any slider changes */
  onChange: (id: string, value: number) => void;
  /** Play / pause toggle */
  playing?: boolean;
  onTogglePlay?: () => void;
  /** Reset callback */
  onReset?: () => void;
  /** Extra class for the panel */
  className?: string;
}

/**
 * PhysicsControls — sidebar-style slider panel.
 * Renders sliders defined by SliderDef[], with play/pause + reset buttons.
 */
export default function PhysicsControls({
  sliders,
  onChange,
  playing,
  onTogglePlay,
  onReset,
  className = "",
}: Props) {
  return (
    <div className={`space-y-5 ${className}`}>
      {sliders.map((s) => (
        <div key={s.id}>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
            {s.label}
          </label>
          <input
            type="range"
            min={s.min}
            max={s.max}
            step={s.step}
            value={s.value}
            onChange={(e) => onChange(s.id, Number(e.target.value))}
            className={`w-full ${s.color ? `accent-[${s.color}]` : "accent-cyan-500"}`}
            style={s.color ? { accentColor: s.color } : undefined}
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>{s.min}{s.unit ? ` ${s.unit}` : ""}</span>
            <span className="font-semibold" style={{ color: s.color || "#22d3ee" }}>
              {s.value > 0 && s.min < 0 ? "+" : ""}{s.value.toFixed(1)}{s.unit ? ` ${s.unit}` : ""}
            </span>
            <span>{s.max}{s.unit ? ` ${s.unit}` : ""}</span>
          </div>
        </div>
      ))}

      {/* Play / Pause + Reset */}
      {(onTogglePlay || onReset) && (
        <div className="flex gap-2 pt-1">
          {onTogglePlay && (
            <button
              onClick={onTogglePlay}
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                playing
                  ? "bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/50"
                  : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"
              }`}
            >
              {playing ? "⏸ Pause" : "▶ Play"}
            </button>
          )}
          {onReset && (
            <button
              onClick={onReset}
              className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-sm font-medium hover:bg-white/10 transition-all"
            >
              ↺ Reset
            </button>
          )}
        </div>
      )}
    </div>
  );
}
