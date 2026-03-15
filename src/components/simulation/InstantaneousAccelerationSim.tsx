"use client";

import { useState, useRef, useEffect, useCallback } from "react";

/**
 * Instantaneous Acceleration — particle with non-uniform velocity.
 * Time slider; shows dynamic acceleration vector at each instant.
 * Velocity follows a sinusoidal profile so acceleration varies.
 */
export default function InstantaneousAccelerationSim() {
  const W = 700, H = 320;
  const [autoPlay, setAutoPlay] = useState(true);
  const [tNorm, setTNorm] = useState(0.1); // 0..1 normalized
  const animRef = useRef<number>(0);

  const duration = 8; // seconds for full cycle
  const time = tNorm * duration;

  // Velocity profile: v(t) = 5 + 4 sin(t) — varies smoothly
  const velFn = (t: number) => 5 + 4 * Math.sin(t * 1.2);
  // Acceleration: a(t) = dv/dt = 4 * 1.2 * cos(t * 1.2)
  const accelFn = (t: number) => 4 * 1.2 * Math.cos(t * 1.2);

  const currentV = velFn(time);
  const currentA = accelFn(time);

  // Position by integration: x(t) = 5t - (4/1.2) cos(1.2t) + C
  const posFn = (t: number) => 5 * t - (4 / 1.2) * Math.cos(t * 1.2) + (4 / 1.2);

  useEffect(() => {
    if (!autoPlay) return;
    let start = performance.now();
    function loop(now: number) {
      const elapsed = (now - start) / 1000;
      const newT = (elapsed / duration) % 1;
      setTNorm(newT);
      animRef.current = requestAnimationFrame(loop);
    }
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [autoPlay]);

  const lineY = H / 2 + 10;
  const x0 = 60;
  const scale = 7;
  const currentX = Math.max(30, Math.min(W - 30, x0 + posFn(time) * scale));

  const vArrowScale = 6;
  const aArrowScale = 8;
  const vEnd = currentX + currentV * vArrowScale;
  const aEnd = currentX + currentA * aArrowScale;

  const handleSlider = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setAutoPlay(false);
    setTNorm(Number(e.target.value));
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#060e1a] shadow-2xl">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ aspectRatio: `${W}/${H}` }}>
          <defs>
            <filter id="iacc-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Line */}
          <line x1={30} y1={lineY} x2={W - 30} y2={lineY} stroke="#334155" strokeWidth={1.5} />
          {Array.from({ length: 13 }).map((_, i) => (
            <line key={i} x1={50 + i * 50} y1={lineY - 4} x2={50 + i * 50} y2={lineY + 4} stroke="#475569" strokeWidth={1} />
          ))}

          {/* Velocity arrow (cyan) */}
          <line x1={currentX} y1={lineY - 35} x2={vEnd} y2={lineY - 35}
            stroke="#22d3ee" strokeWidth={2.5} strokeLinecap="round" filter="url(#iacc-glow)" />
          <polygon
            points={`${vEnd},${lineY - 35} ${vEnd - (currentV > 0 ? 8 : -8)},${lineY - 40} ${vEnd - (currentV > 0 ? 8 : -8)},${lineY - 30}`}
            fill="#22d3ee" filter="url(#iacc-glow)" />
          <text x={(currentX + vEnd) / 2} y={lineY - 48}
            fill="#22d3ee" fontSize="10" fontWeight="700" textAnchor="middle">
            v = {currentV.toFixed(1)} m/s
          </text>

          {/* Acceleration arrow (amber / red) */}
          {Math.abs(currentA) > 0.3 && (
            <>
              <line x1={currentX} y1={lineY + 30} x2={aEnd} y2={lineY + 30}
                stroke={currentA >= 0 ? "#22c55e" : "#ef4444"} strokeWidth={2.5} strokeLinecap="round" filter="url(#iacc-glow)" />
              <polygon
                points={`${aEnd},${lineY + 30} ${aEnd - (currentA > 0 ? 7 : -7)},${lineY + 25} ${aEnd - (currentA > 0 ? 7 : -7)},${lineY + 35}`}
                fill={currentA >= 0 ? "#22c55e" : "#ef4444"} filter="url(#iacc-glow)" />
              <text x={(currentX + aEnd) / 2} y={lineY + 50}
                fill={currentA >= 0 ? "#22c55e" : "#ef4444"} fontSize="10" fontWeight="700" textAnchor="middle">
                a = {currentA > 0 ? "+" : ""}{currentA.toFixed(1)} m/s²
              </text>
            </>
          )}

          {/* Particle */}
          <circle cx={currentX} cy={lineY} r={12} fill="#6366f1" opacity={0.12} />
          <circle cx={currentX} cy={lineY} r={6} fill="#a78bfa" stroke="#6366f1" strokeWidth={2} />

          {/* Legend */}
          <g transform="translate(16, 18)">
            <line x1={0} y1={0} x2={14} y2={0} stroke="#22d3ee" strokeWidth={2} />
            <text x={20} y={4} fill="#22d3ee" fontSize="9">Velocity</text>
            <line x1={0} y1={14} x2={14} y2={14} stroke="#22c55e" strokeWidth={2} />
            <text x={20} y={18} fill="#22c55e" fontSize="9">Accel (+)</text>
            <line x1={80} y1={14} x2={94} y2={14} stroke="#ef4444" strokeWidth={2} />
            <text x={100} y={18} fill="#ef4444" fontSize="9">Accel (−)</text>
          </g>

          <text x={W - 16} y={20} fill="#64748b" fontSize="10" textAnchor="end">t = {time.toFixed(1)} s</text>
        </svg>
      </div>

      <div className="space-y-5">
        <p className="text-base text-slate-300 leading-relaxed">
          <span className="text-green-400 font-semibold">Instantaneous acceleration</span> is
          the acceleration at a <strong className="text-white">specific instant</strong>:{" "}
          <span className="text-white font-mono">a = dv/dt</span>
        </p>
        <p className="text-sm text-slate-400 leading-relaxed">
          Here velocity varies as <span className="text-cyan-400 font-mono">v(t) = 5 + 4 sin(1.2t)</span>,
          so acceleration oscillates.
        </p>

        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Time Position</label>
          <input type="range" min={0.01} max={0.99} step={0.005} value={tNorm}
            onChange={handleSlider} className="w-full accent-green-500" />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>0 s</span><span className="text-green-400 font-semibold">{time.toFixed(1)} s</span><span>{duration} s</span>
          </div>
        </div>

        <button onClick={() => setAutoPlay(!autoPlay)}
          className={`w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            autoPlay ? "bg-green-500/20 text-green-300 ring-1 ring-green-500/50"
                     : "bg-white/5 text-slate-400 border border-white/10"}`}>
          {autoPlay ? "⏸ Pause" : "▶ Play"}
        </button>

        <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Velocity</span>
            <span className="text-cyan-400 font-bold tabular-nums">{currentV.toFixed(1)} m/s</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Acceleration</span>
            <span className={`font-bold tabular-nums ${currentA >= 0 ? "text-green-400" : "text-red-400"}`}>
              {currentA > 0 ? "+" : ""}{currentA.toFixed(2)} m/s²
            </span>
          </div>
        </div>

        <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-4">
          <p className="text-xs text-green-400/70 font-bold uppercase tracking-wider mb-1">💡 Key Insight</p>
          <p className="text-sm text-slate-300 leading-relaxed">
            {currentA >= 0
              ? "Positive acceleration → velocity is increasing → the particle is speeding up."
              : "Negative acceleration → velocity is decreasing → the particle is slowing down."}
          </p>
        </div>
      </div>
    </div>
  );
}
