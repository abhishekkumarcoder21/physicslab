"use client";

import { useState, useRef, useEffect, useCallback } from "react";

/**
 * Variable Acceleration — particle with a(t) = A sin(ωt).
 * Demonstrates non-uniform acceleration where standard equations fail.
 * Shows dynamic velocity + acceleration arrows, time slider.
 */
export default function VariableAccelerationSim() {
  const W = 700, H = 340;
  const [amp, setAmp] = useState(4);
  const [omega, setOmega] = useState(1.5);
  const [autoPlay, setAutoPlay] = useState(true);
  const [tNorm, setTNorm] = useState(0.1);

  const animRef = useRef<number>(0);
  const duration = 10;
  const time = tNorm * duration;

  // a(t) = A sin(ωt)
  const accelFn = (t: number) => amp * Math.sin(omega * t);
  // v(t) = ∫a dt = -A/ω cos(ωt) + A/ω  (starting from v=0)
  const velFn = (t: number) => (amp / omega) * (1 - Math.cos(omega * t));
  // x(t) = ∫v dt = A/ω * t - A/ω² sin(ωt)
  const posFn = (t: number) => (amp / omega) * t - (amp / (omega * omega)) * Math.sin(omega * t);

  const currentA = accelFn(time);
  const currentV = velFn(time);
  const currentX = posFn(time);

  useEffect(() => {
    if (!autoPlay) return;
    let start = performance.now();
    function loop(now: number) {
      const elapsed = (now - start) / 1000;
      setTNorm((elapsed / duration) % 1);
      animRef.current = requestAnimationFrame(loop);
    }
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [autoPlay, duration]);

  const lineY = H / 2 + 20;
  const x0 = 100;
  const scale = 4;
  const particleX = Math.max(30, Math.min(W - 30, x0 + currentX * scale));

  const vArrowScale = 4;
  const aArrowScale = 5;

  // Mini a(t) graph at bottom
  const graphY0 = H - 40;
  const graphH = 30;

  const handleSlider = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setAutoPlay(false);
    setTNorm(Number(e.target.value));
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#060e1a] shadow-2xl">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ aspectRatio: `${W}/${H}` }}>
          <defs>
            <filter id="va-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Number line */}
          <line x1={30} y1={lineY} x2={W - 30} y2={lineY} stroke="#334155" strokeWidth={1.5} />
          {Array.from({ length: 13 }).map((_, i) => (
            <line key={i} x1={50 + i * 50} y1={lineY - 3} x2={50 + i * 50} y2={lineY + 3} stroke="#475569" strokeWidth={1} />
          ))}

          {/* Velocity arrow (cyan) */}
          {Math.abs(currentV) > 0.2 && (
            <>
              <line x1={particleX} y1={lineY - 32} x2={particleX + currentV * vArrowScale} y2={lineY - 32}
                stroke="#22d3ee" strokeWidth={2.5} strokeLinecap="round" filter="url(#va-glow)" />
              <polygon
                points={`${particleX + currentV * vArrowScale},${lineY - 32} ${particleX + currentV * vArrowScale - (currentV > 0 ? 7 : -7)},${lineY - 37} ${particleX + currentV * vArrowScale - (currentV > 0 ? 7 : -7)},${lineY - 27}`}
                fill="#22d3ee" filter="url(#va-glow)" />
              <text x={particleX + currentV * vArrowScale / 2} y={lineY - 44}
                fill="#22d3ee" fontSize="9" fontWeight="700" textAnchor="middle">
                v = {currentV.toFixed(1)}
              </text>
            </>
          )}

          {/* Acceleration arrow (green/red) */}
          {Math.abs(currentA) > 0.3 && (
            <>
              <line x1={particleX} y1={lineY + 28} x2={particleX + currentA * aArrowScale} y2={lineY + 28}
                stroke={currentA >= 0 ? "#22c55e" : "#ef4444"} strokeWidth={2.5} strokeLinecap="round" filter="url(#va-glow)" />
              <polygon
                points={`${particleX + currentA * aArrowScale},${lineY + 28} ${particleX + currentA * aArrowScale - (currentA > 0 ? 6 : -6)},${lineY + 23} ${particleX + currentA * aArrowScale - (currentA > 0 ? 6 : -6)},${lineY + 33}`}
                fill={currentA >= 0 ? "#22c55e" : "#ef4444"} filter="url(#va-glow)" />
              <text x={particleX + currentA * aArrowScale / 2} y={lineY + 46}
                fill={currentA >= 0 ? "#22c55e" : "#ef4444"} fontSize="9" fontWeight="700" textAnchor="middle">
                a = {currentA.toFixed(1)}
              </text>
            </>
          )}

          {/* Particle */}
          <circle cx={particleX} cy={lineY} r={14} fill="#6366f1" opacity={0.1} />
          <circle cx={particleX} cy={lineY} r={6} fill="#a78bfa" stroke="#6366f1" strokeWidth={2} />

          {/* Mini a(t) graph */}
          <text x={30} y={graphY0 - graphH - 8} fill="#475569" fontSize="8" fontWeight="500">a(t) waveform</text>
          <line x1={30} y1={graphY0} x2={W - 30} y2={graphY0} stroke="#1e293b" strokeWidth={0.5} />
          {Array.from({ length: 100 }).map((_, i) => {
            const tt = (i / 100) * duration;
            const ax = 30 + (i / 100) * (W - 60);
            const ay = graphY0 - (accelFn(tt) / (amp || 1)) * graphH;
            const nextT = ((i + 1) / 100) * duration;
            const nextX = 30 + ((i + 1) / 100) * (W - 60);
            const nextY = graphY0 - (accelFn(nextT) / (amp || 1)) * graphH;
            return (
              <line key={i} x1={ax} y1={ay} x2={nextX} y2={nextY}
                stroke={accelFn(tt) >= 0 ? "#22c55e" : "#ef4444"} strokeWidth={1} opacity={0.5} />
            );
          })}
          {/* Current time marker */}
          <line x1={30 + tNorm * (W - 60)} y1={graphY0 - graphH - 2} x2={30 + tNorm * (W - 60)} y2={graphY0 + 2}
            stroke="#f59e0b" strokeWidth={1.5} opacity={0.7} />

          {/* Legend */}
          <g transform="translate(16, 16)">
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
          <span className="text-violet-400 font-semibold">Variable Acceleration</span> —
          when <span className="text-white font-mono">a(t) = A sin(ωt)</span>, standard
          equations <span className="text-red-400">don&apos;t apply</span>. Must use
          <span className="text-cyan-400"> v = ∫a dt</span> and <span className="text-indigo-400">x = ∫v dt</span>.
        </p>

        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Amplitude A (m/s²)</label>
          <input type="range" min={1} max={8} step={0.5} value={amp}
            onChange={(e) => setAmp(Number(e.target.value))} className="w-full accent-green-500" />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>1</span><span className="text-green-400 font-semibold">{amp.toFixed(1)}</span><span>8</span>
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Frequency ω (rad/s)</label>
          <input type="range" min={0.5} max={4} step={0.25} value={omega}
            onChange={(e) => setOmega(Number(e.target.value))} className="w-full accent-violet-500" />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>0.5</span><span className="text-violet-400 font-semibold">{omega.toFixed(1)}</span><span>4</span>
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Time Position</label>
          <input type="range" min={0.01} max={0.99} step={0.005} value={tNorm}
            onChange={handleSlider} className="w-full accent-amber-500" />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>0 s</span><span className="text-amber-400 font-semibold">{time.toFixed(1)} s</span><span>{duration} s</span>
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
              {currentA > 0 ? "+" : ""}{currentA.toFixed(1)} m/s²
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Displacement</span>
            <span className="text-indigo-400 font-bold tabular-nums">{currentX.toFixed(1)} m</span>
          </div>
        </div>
      </div>
    </div>
  );
}
