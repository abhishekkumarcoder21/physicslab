"use client";

import { useState, useRef, useEffect } from "react";

/**
 * Acceleration — 1D particle with initial velocity + acceleration.
 * Velocity arrow dynamically changes length. Shows a = dv/dt.
 */
export default function AccelerationSim() {
  const W = 700, H = 300;
  const [initVel, setInitVel] = useState(2);
  const [accel, setAccel] = useState(1.5);
  const [playing, setPlaying] = useState(true);

  const animRef = useRef<number>(0);
  const startRef = useRef(performance.now());
  const [time, setTime] = useState(0);

  const x0 = 80;
  const lineY = H / 2 + 20;
  const scale = 28;

  const velAt = (t: number) => initVel + accel * t;
  const posAt = (t: number) => x0 + (initVel * t + 0.5 * accel * t * t) * scale;

  useEffect(() => {
    startRef.current = performance.now();
    setTime(0);
  }, [initVel, accel]);

  useEffect(() => {
    if (!playing) return;
    function loop(now: number) {
      const t = (now - startRef.current) / 1000;
      const px = posAt(t);
      if (px < 20 || px > W - 20 || t > 10) {
        startRef.current = now;
        setTime(0);
      } else {
        setTime(t);
      }
      animRef.current = requestAnimationFrame(loop);
    }
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [playing, initVel, accel]);

  const currentV = velAt(time);
  const currentX = Math.max(30, Math.min(W - 30, posAt(time)));
  const arrowScale = 10;
  const arrowEnd = currentX + currentV * arrowScale;
  const aArrowEnd = currentX + accel * arrowScale * 1.5;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#060e1a] shadow-2xl">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ aspectRatio: `${W}/${H}` }}>
          <defs>
            <filter id="acc-glow" x="-50%" y="-50%" width="200%" height="200%">
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
                <text x={px} y={lineY + 16} fill="#475569" fontSize="9" textAnchor="middle">
                  {((px - x0) / scale).toFixed(0)}
                </text>
              </g>
            );
          })}

          {/* Velocity arrow (cyan) */}
          {Math.abs(currentV) > 0.15 && (
            <>
              <line x1={currentX} y1={lineY - 40} x2={arrowEnd} y2={lineY - 40}
                stroke="#22d3ee" strokeWidth={2.5} strokeLinecap="round" filter="url(#acc-glow)" />
              <polygon
                points={`${arrowEnd},${lineY - 40} ${arrowEnd - (currentV > 0 ? 8 : -8)},${lineY - 45} ${arrowEnd - (currentV > 0 ? 8 : -8)},${lineY - 35}`}
                fill="#22d3ee" filter="url(#acc-glow)" />
              <text x={(currentX + arrowEnd) / 2} y={lineY - 50}
                fill="#22d3ee" fontSize="10" fontWeight="700" textAnchor="middle">
                v = {currentV.toFixed(1)} m/s
              </text>
            </>
          )}

          {/* Acceleration arrow (amber) */}
          {Math.abs(accel) > 0.1 && (
            <>
              <line x1={currentX} y1={lineY + 30} x2={aArrowEnd} y2={lineY + 30}
                stroke="#f59e0b" strokeWidth={2} strokeLinecap="round" filter="url(#acc-glow)" />
              <polygon
                points={`${aArrowEnd},${lineY + 30} ${aArrowEnd - (accel > 0 ? 7 : -7)},${lineY + 25} ${aArrowEnd - (accel > 0 ? 7 : -7)},${lineY + 35}`}
                fill="#f59e0b" filter="url(#acc-glow)" />
              <text x={(currentX + aArrowEnd) / 2} y={lineY + 48}
                fill="#f59e0b" fontSize="10" fontWeight="700" textAnchor="middle">
                a = {accel.toFixed(1)} m/s²
              </text>
            </>
          )}

          {/* Particle */}
          <circle cx={currentX} cy={lineY} r={12} fill="#6366f1" opacity={0.12} />
          <circle cx={currentX} cy={lineY} r={6} fill="#a78bfa" stroke="#6366f1" strokeWidth={2} />

          {/* Legend */}
          <g transform="translate(16, 20)">
            <line x1={0} y1={0} x2={16} y2={0} stroke="#22d3ee" strokeWidth={2} />
            <text x={22} y={4} fill="#22d3ee" fontSize="9" fontWeight="500">Velocity</text>
            <line x1={0} y1={14} x2={16} y2={14} stroke="#f59e0b" strokeWidth={2} />
            <text x={22} y={18} fill="#f59e0b" fontSize="9" fontWeight="500">Acceleration</text>
          </g>

          <text x={W - 20} y={20} fill="#64748b" fontSize="10" fontWeight="500" textAnchor="end">
            t = {time.toFixed(1)} s
          </text>
        </svg>
      </div>

      <div className="space-y-5">
        <p className="text-base text-slate-300 leading-relaxed">
          <span className="text-amber-400 font-semibold">Acceleration</span> is the rate
          at which <span className="text-cyan-400">velocity</span> changes:{" "}
          <span className="text-white font-mono">a⃗ = dv⃗/dt</span>
        </p>

        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Initial Velocity (m/s)</label>
          <input type="range" min={0} max={8} step={0.5} value={initVel}
            onChange={(e) => setInitVel(Number(e.target.value))} className="w-full accent-cyan-500" />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>0</span><span className="text-cyan-400 font-semibold">{initVel.toFixed(1)}</span><span>8</span>
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Acceleration (m/s²)</label>
          <input type="range" min={-4} max={4} step={0.25} value={accel}
            onChange={(e) => setAccel(Number(e.target.value))} className="w-full accent-amber-500" />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>−4</span><span className="text-amber-400 font-semibold">{accel > 0 ? "+" : ""}{accel.toFixed(1)}</span><span>+4</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setPlaying(!playing)}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              playing ? "bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/50"
                      : "bg-white/5 text-slate-400 border border-white/10"}`}>
            {playing ? "⏸ Pause" : "▶ Play"}
          </button>
          <button onClick={() => { startRef.current = performance.now(); setTime(0); }}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-sm font-medium hover:bg-white/10 transition-all">
            ↺
          </button>
        </div>

        <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
          <p className="text-xs text-amber-400/70 font-bold uppercase tracking-wider mb-1">💡 Key Insight</p>
          <p className="text-sm text-slate-300 leading-relaxed">
            {accel > 0 ? "Positive acceleration → velocity increases → the cyan arrow grows longer over time."
              : accel < 0 ? "Negative acceleration (deceleration) → velocity decreases → the cyan arrow shrinks."
              : "Zero acceleration → velocity stays constant → no change in the arrow length."}
          </p>
        </div>
      </div>
    </div>
  );
}
