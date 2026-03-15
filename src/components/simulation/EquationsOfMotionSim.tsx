"use client";

import { useState, useRef, useEffect } from "react";

/**
 * Equations of Motion — interactive sim for the big three:
 *  v = u + at
 *  s = ut + ½at²
 *  v² = u² + 2as
 * Particle moves on a number line matching the equation outputs.
 */
export default function EquationsOfMotionSim() {
  const W = 700, H = 320;
  const [u, setU] = useState(3);
  const [a, setA] = useState(2);
  const [t, setT] = useState(3);
  const [playing, setPlaying] = useState(false);

  const animRef = useRef<number>(0);
  const startRef = useRef(performance.now());
  const [animTime, setAnimTime] = useState(0);

  const activeT = playing ? animTime : t;

  // Equations
  const v = u + a * activeT;
  const s = u * activeT + 0.5 * a * activeT * activeT;
  const vSq = u * u + 2 * a * s;

  const lineY = H / 2 + 10;
  const x0 = 80;
  const scale = 12;
  const particleX = Math.max(30, Math.min(W - 30, x0 + s * scale));

  useEffect(() => {
    startRef.current = performance.now();
    setAnimTime(0);
  }, [u, a]);

  useEffect(() => {
    if (!playing) return;
    startRef.current = performance.now();
    function loop(now: number) {
      const elapsed = (now - startRef.current) / 1000;
      if (elapsed > 8) {
        startRef.current = now;
        setAnimTime(0);
      } else {
        setAnimTime(elapsed);
      }
      animRef.current = requestAnimationFrame(loop);
    }
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [playing, u, a]);

  const arrowScale = 6;
  const vEnd = particleX + v * arrowScale;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#060e1a] shadow-2xl">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ aspectRatio: `${W}/${H}` }}>
          <defs>
            <filter id="eom-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Number line */}
          <line x1={30} y1={lineY} x2={W - 30} y2={lineY} stroke="#334155" strokeWidth={1.5} />
          {Array.from({ length: 14 }).map((_, i) => {
            const px = 50 + i * 46;
            return (
              <g key={i}>
                <line x1={px} y1={lineY - 4} x2={px} y2={lineY + 4} stroke="#475569" strokeWidth={1} />
                <text x={px} y={lineY + 16} fill="#475569" fontSize="8" textAnchor="middle">
                  {((px - x0) / scale).toFixed(0)}
                </text>
              </g>
            );
          })}

          {/* Start marker */}
          <line x1={x0} y1={lineY - 20} x2={x0} y2={lineY + 20} stroke="#22c55e" strokeWidth={1} strokeDasharray="3 2" opacity={0.4} />
          <text x={x0} y={lineY + 30} fill="#22c55e" fontSize="8" textAnchor="middle" opacity={0.5}>start</text>

          {/* Displacement bracket */}
          {Math.abs(s) > 0.5 && (
            <>
              <line x1={x0} y1={lineY + 36} x2={particleX} y2={lineY + 36}
                stroke="#6366f1" strokeWidth={1.5} strokeLinecap="round" />
              <text x={(x0 + particleX) / 2} y={lineY + 52}
                fill="#6366f1" fontSize="10" fontWeight="600" textAnchor="middle">
                s = {s.toFixed(1)} m
              </text>
            </>
          )}

          {/* Velocity arrow */}
          {Math.abs(v) > 0.2 && (
            <>
              <line x1={particleX} y1={lineY - 35} x2={vEnd} y2={lineY - 35}
                stroke="#22d3ee" strokeWidth={2.5} strokeLinecap="round" filter="url(#eom-glow)" />
              <polygon
                points={`${vEnd},${lineY - 35} ${vEnd - (v > 0 ? 8 : -8)},${lineY - 40} ${vEnd - (v > 0 ? 8 : -8)},${lineY - 30}`}
                fill="#22d3ee" filter="url(#eom-glow)" />
              <text x={(particleX + vEnd) / 2} y={lineY - 48}
                fill="#22d3ee" fontSize="10" fontWeight="700" textAnchor="middle">
                v = {v.toFixed(1)} m/s
              </text>
            </>
          )}

          {/* Particle */}
          <circle cx={particleX} cy={lineY} r={14} fill="#6366f1" opacity={0.1} />
          <circle cx={particleX} cy={lineY} r={6} fill="#a78bfa" stroke="#6366f1" strokeWidth={2} />

          <text x={W - 16} y={20} fill="#64748b" fontSize="10" textAnchor="end">
            t = {activeT.toFixed(1)} s
          </text>
        </svg>
      </div>

      <div className="space-y-4">
        <p className="text-base text-slate-300 leading-relaxed">
          The <span className="text-indigo-400 font-semibold">three equations of motion</span> for uniform acceleration:
        </p>

        {/* Equation cards */}
        <div className="space-y-2">
          <div className="rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-3 flex justify-between items-center">
            <span className="text-sm text-slate-300 font-mono">v = u + at</span>
            <span className="text-cyan-400 font-bold tabular-nums text-lg">{v.toFixed(1)} <span className="text-xs font-normal">m/s</span></span>
          </div>
          <div className="rounded-xl bg-indigo-500/10 border border-indigo-500/20 p-3 flex justify-between items-center">
            <span className="text-sm text-slate-300 font-mono">s = ut + ½at²</span>
            <span className="text-indigo-400 font-bold tabular-nums text-lg">{s.toFixed(1)} <span className="text-xs font-normal">m</span></span>
          </div>
          <div className="rounded-xl bg-violet-500/10 border border-violet-500/20 p-3 flex justify-between items-center">
            <span className="text-sm text-slate-300 font-mono">v² = u² + 2as</span>
            <span className="text-violet-400 font-bold tabular-nums text-lg">{vSq.toFixed(1)} <span className="text-xs font-normal">m²/s²</span></span>
          </div>
        </div>

        {/* Sliders */}
        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Initial Velocity u (m/s)</label>
          <input type="range" min={0} max={10} step={0.5} value={u}
            onChange={(e) => setU(Number(e.target.value))} className="w-full accent-cyan-500" />
          <div className="flex justify-between text-xs text-slate-500 mt-0.5">
            <span>0</span><span className="text-cyan-400 font-semibold">{u.toFixed(1)}</span><span>10</span>
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Acceleration a (m/s²)</label>
          <input type="range" min={-4} max={5} step={0.25} value={a}
            onChange={(e) => setA(Number(e.target.value))} className="w-full accent-amber-500" />
          <div className="flex justify-between text-xs text-slate-500 mt-0.5">
            <span>−4</span><span className="text-amber-400 font-semibold">{a > 0 ? "+" : ""}{a.toFixed(1)}</span><span>+5</span>
          </div>
        </div>

        {!playing && (
          <div>
            <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Time t (s)</label>
            <input type="range" min={0} max={8} step={0.25} value={t}
              onChange={(e) => setT(Number(e.target.value))} className="w-full accent-indigo-500" />
            <div className="flex justify-between text-xs text-slate-500 mt-0.5">
              <span>0</span><span className="text-indigo-400 font-semibold">{t.toFixed(1)} s</span><span>8</span>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={() => setPlaying(!playing)}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              playing ? "bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/50"
                      : "bg-white/5 text-slate-400 border border-white/10"}`}>
            {playing ? "⏸ Pause (use sliders)" : "▶ Auto-play"}
          </button>
        </div>

        <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3">
          <p className="text-xs text-amber-400/70 font-bold uppercase tracking-wider mb-1">💡 Try This</p>
          <p className="text-sm text-slate-300 leading-relaxed">
            Set <span className="text-cyan-400">u = 0</span> and increase <span className="text-amber-400">a</span>
            to see how displacement grows with t². Set negative acceleration to see the particle slow down and reverse.
          </p>
        </div>
      </div>
    </div>
  );
}
