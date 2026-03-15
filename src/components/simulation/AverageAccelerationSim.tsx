"use client";

import { useState, useRef, useEffect } from "react";

/**
 * Average Acceleration — shows v_i, v_f, Δt and calculates a_avg.
 * Particle animates between two velocities over a time interval.
 */
export default function AverageAccelerationSim() {
  const W = 700, H = 300;
  const [vi, setVi] = useState(2);
  const [vf, setVf] = useState(8);
  const [deltaT, setDeltaT] = useState(4);
  const [playing, setPlaying] = useState(true);

  const animRef = useRef<number>(0);
  const startRef = useRef(performance.now());
  const [time, setTime] = useState(0);

  const avgAccel = (vf - vi) / deltaT;
  const lineY = H / 2 + 10;
  const x0 = 80;
  const scale = 22;

  // v(t) = vi + a_avg * t (linear interpolation)
  const velAt = (t: number) => vi + avgAccel * Math.min(t, deltaT);
  const posAt = (t: number) => {
    const tc = Math.min(t, deltaT);
    return x0 + (vi * tc + 0.5 * avgAccel * tc * tc) * scale;
  };

  useEffect(() => {
    startRef.current = performance.now();
    setTime(0);
  }, [vi, vf, deltaT]);

  useEffect(() => {
    if (!playing) return;
    function loop(now: number) {
      const t = (now - startRef.current) / 1000;
      if (t > deltaT + 1.5) {
        startRef.current = now;
        setTime(0);
      } else {
        setTime(t);
      }
      animRef.current = requestAnimationFrame(loop);
    }
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [playing, vi, vf, deltaT, avgAccel]);

  const currentV = velAt(time);
  const currentX = Math.max(30, Math.min(W - 30, posAt(time)));
  const progress = Math.min(time / deltaT, 1);

  const arrowScale = 8;
  const arrowEnd = currentX + currentV * arrowScale;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#060e1a] shadow-2xl">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ aspectRatio: `${W}/${H}` }}>
          <defs>
            <filter id="aavg-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Number line */}
          <line x1={30} y1={lineY} x2={W - 30} y2={lineY} stroke="#334155" strokeWidth={1.5} />
          {Array.from({ length: 13 }).map((_, i) => {
            const px = 50 + i * 50;
            return <line key={i} x1={px} y1={lineY - 4} x2={px} y2={lineY + 4} stroke="#475569" strokeWidth={1} />;
          })}

          {/* Progress bar showing Δt */}
          <rect x={30} y={lineY + 24} width={(W - 60) * progress}
            height={3} rx={1.5} fill="#6366f1" opacity={0.5} />
          <rect x={30} y={lineY + 24} width={W - 60}
            height={3} rx={1.5} fill="#1e293b" />
          <rect x={30} y={lineY + 24} width={(W - 60) * progress}
            height={3} rx={1.5} fill="#6366f1" opacity={0.6} />
          <text x={30 + (W - 60) * progress} y={lineY + 40}
            fill="#6366f1" fontSize="9" fontWeight="600" textAnchor="middle">
            {Math.min(time, deltaT).toFixed(1)}s / {deltaT.toFixed(1)}s
          </text>

          {/* Initial velocity marker */}
          <g transform={`translate(${x0}, ${lineY - 60})`}>
            <line x1={0} y1={0} x2={vi * arrowScale} y2={0}
              stroke="#22d3ee" strokeWidth={2} strokeDasharray="4 3" opacity={0.4} />
            <text x={vi * arrowScale / 2} y={-8}
              fill="#22d3ee" fontSize="9" fontWeight="600" textAnchor="middle" opacity={0.5}>
              v₀ = {vi.toFixed(1)}
            </text>
          </g>

          {/* Velocity arrow (current) */}
          {Math.abs(currentV) > 0.2 && (
            <>
              <line x1={currentX} y1={lineY - 35} x2={arrowEnd} y2={lineY - 35}
                stroke="#22d3ee" strokeWidth={2.5} strokeLinecap="round" filter="url(#aavg-glow)" />
              <polygon
                points={`${arrowEnd},${lineY - 35} ${arrowEnd - (currentV > 0 ? 8 : -8)},${lineY - 40} ${arrowEnd - (currentV > 0 ? 8 : -8)},${lineY - 30}`}
                fill="#22d3ee" filter="url(#aavg-glow)" />
              <text x={(currentX + arrowEnd) / 2} y={lineY - 46}
                fill="#22d3ee" fontSize="10" fontWeight="700" textAnchor="middle">
                v = {currentV.toFixed(1)} m/s
              </text>
            </>
          )}

          {/* Particle */}
          <circle cx={currentX} cy={lineY} r={12} fill="#6366f1" opacity={0.12} />
          <circle cx={currentX} cy={lineY} r={6} fill="#a78bfa" stroke="#6366f1" strokeWidth={2} />

          <text x={W - 16} y={20} fill="#64748b" fontSize="10" textAnchor="end">t = {time.toFixed(1)} s</text>
        </svg>
      </div>

      <div className="space-y-5">
        <p className="text-base text-slate-300 leading-relaxed">
          <span className="text-green-400 font-semibold">Average Acceleration</span> ={" "}
          <span className="text-white font-mono">(v<sub>f</sub> − v<sub>i</sub>) / Δt</span>
        </p>

        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Initial Velocity</label>
          <input type="range" min={0} max={10} step={0.5} value={vi}
            onChange={(e) => setVi(Number(e.target.value))} className="w-full accent-cyan-500" />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>0</span><span className="text-cyan-400 font-semibold">{vi.toFixed(1)} m/s</span><span>10</span>
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Final Velocity</label>
          <input type="range" min={-5} max={15} step={0.5} value={vf}
            onChange={(e) => setVf(Number(e.target.value))} className="w-full accent-violet-500" />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>−5</span><span className="text-violet-400 font-semibold">{vf.toFixed(1)} m/s</span><span>15</span>
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Time Interval (Δt)</label>
          <input type="range" min={1} max={10} step={0.5} value={deltaT}
            onChange={(e) => setDeltaT(Number(e.target.value))} className="w-full accent-indigo-500" />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>1 s</span><span className="text-indigo-400 font-semibold">{deltaT.toFixed(1)} s</span><span>10 s</span>
          </div>
        </div>

        {/* Readout */}
        <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">v<sub>i</sub></span>
            <span className="text-cyan-400 font-bold tabular-nums">{vi.toFixed(1)} m/s</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">v<sub>f</sub></span>
            <span className="text-violet-400 font-bold tabular-nums">{vf.toFixed(1)} m/s</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Δt</span>
            <span className="text-indigo-400 font-bold tabular-nums">{deltaT.toFixed(1)} s</span>
          </div>
          <div className="border-t border-white/10 pt-2 flex justify-between">
            <span className="text-xs text-green-400 font-bold uppercase">a<sub>avg</sub></span>
            <span className="text-xl font-extrabold text-green-400 tabular-nums">
              {avgAccel > 0 ? "+" : ""}{avgAccel.toFixed(2)} <span className="text-sm font-normal text-green-400/60">m/s²</span>
            </span>
          </div>
        </div>

        <button onClick={() => setPlaying(!playing)}
          className={`w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            playing ? "bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/50"
                    : "bg-white/5 text-slate-400 border border-white/10"}`}>
          {playing ? "⏸ Pause" : "▶ Play"}
        </button>
      </div>
    </div>
  );
}
