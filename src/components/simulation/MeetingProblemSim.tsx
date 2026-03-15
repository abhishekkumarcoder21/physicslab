"use client";

import { useState, useRef, useEffect } from "react";

/**
 * Meeting Problem — two objects starting at different times/speeds
 * converging or catching up on a straight line.
 */
export default function MeetingProblemSim() {
  const W = 700, H = 320;
  const [uA, setUA] = useState(4);
  const [aA, setAA] = useState(2);
  const [uB, setUB] = useState(8);
  const [aB, setAB] = useState(0);
  const [delay, setDelay] = useState(1.5);
  const [playing, setPlaying] = useState(true);

  const animRef = useRef<number>(0);
  const startRef = useRef(performance.now());
  const [time, setTime] = useState(0);

  const posA = (t: number) => uA * t + 0.5 * aA * t * t;
  const posB = (t: number) => t > delay ? uB * (t - delay) + 0.5 * aB * (t - delay) * (t - delay) : 0;

  // Find meeting time numerically
  let meetT = -1;
  for (let t = delay + 0.01; t <= 15; t += 0.02) {
    const diff = posA(t) - posB(t);
    const prevDiff = posA(t - 0.02) - posB(t - 0.02);
    if (prevDiff > 0 && diff <= 0) {
      meetT = t - 0.01;
      break;
    }
  }
  const meetX = meetT > 0 ? posA(meetT) : -1;

  const tMax = 10;

  useEffect(() => {
    startRef.current = performance.now();
    setTime(0);
  }, [uA, aA, uB, aB, delay]);

  useEffect(() => {
    if (!playing) return;
    function loop(now: number) {
      const elapsed = (now - startRef.current) / 1000;
      setTime(elapsed % (tMax + 2));
      animRef.current = requestAnimationFrame(loop);
    }
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [playing]);

  const clampedT = Math.min(time, tMax);
  const xA = posA(clampedT);
  const xB = posB(clampedT);

  const lineY = H / 2;
  const x0 = 60;
  const scale = 4;
  const pxA = Math.min(W - 30, x0 + xA * scale);
  const pxB = Math.min(W - 30, x0 + xB * scale);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#060e1a] shadow-2xl">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ aspectRatio: `${W}/${H}` }}>
          <defs>
            <filter id="mp-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Track */}
          <line x1={30} y1={lineY} x2={W - 30} y2={lineY} stroke="#334155" strokeWidth={1.5} />
          {Array.from({ length: 14 }).map((_, i) => (
            <line key={i} x1={50 + i * 46} y1={lineY - 3} x2={50 + i * 46} y2={lineY + 3} stroke="#475569" strokeWidth={1} />
          ))}

          {/* Start marker */}
          <line x1={x0} y1={lineY - 20} x2={x0} y2={lineY + 20} stroke="#475569" strokeWidth={1} strokeDasharray="3 2" />
          <text x={x0} y={lineY + 30} fill="#475569" fontSize="8" textAnchor="middle">start</text>

          {/* Meeting point ghost */}
          {meetT > 0 && meetX < (W - 60) / scale && (
            <>
              <line x1={x0 + meetX * scale} y1={lineY - 25} x2={x0 + meetX * scale} y2={lineY + 25}
                stroke="#22c55e" strokeWidth={1} strokeDasharray="4 3" opacity={0.4} />
              <text x={x0 + meetX * scale} y={lineY + 38} fill="#22c55e" fontSize="8" fontWeight="600" textAnchor="middle">
                Meet at t={meetT.toFixed(1)}s
              </text>
            </>
          )}

          {/* Particle A (starts at t=0) */}
          <circle cx={pxA} cy={lineY - 18} r={12} fill="#6366f1" opacity={0.1} />
          <circle cx={pxA} cy={lineY - 18} r={6} fill="#a78bfa" stroke="#6366f1" strokeWidth={2} />
          <text x={pxA} y={lineY - 36} fill="#a78bfa" fontSize="10" fontWeight="700" textAnchor="middle">A</text>

          {/* Particle B (starts at t=delay) */}
          {clampedT >= delay ? (
            <>
              <circle cx={pxB} cy={lineY + 18} r={12} fill="#f59e0b" opacity={0.1} />
              <circle cx={pxB} cy={lineY + 18} r={6} fill="#fbbf24" stroke="#f59e0b" strokeWidth={2} />
            </>
          ) : (
            <>
              <circle cx={x0} cy={lineY + 18} r={6} fill="#fbbf24" opacity={0.3} stroke="#f59e0b" strokeWidth={1} strokeDasharray="2 2" />
            </>
          )}
          <text x={clampedT >= delay ? pxB : x0} y={lineY + 42}
            fill="#fbbf24" fontSize="10" fontWeight="700" textAnchor="middle">B</text>

          {/* Distance between them */}
          {clampedT >= delay && Math.abs(pxA - pxB) > 10 && (
            <>
              <line x1={Math.min(pxA, pxB)} y1={lineY + 55} x2={Math.max(pxA, pxB)} y2={lineY + 55}
                stroke="#94a3b8" strokeWidth={1} />
              <text x={(pxA + pxB) / 2} y={lineY + 68} fill="#94a3b8" fontSize="9" textAnchor="middle">
                Δx = {Math.abs(xA - xB).toFixed(1)}m
              </text>
            </>
          )}

          {/* Delay indicator */}
          {clampedT < delay && (
            <text x={x0 + 30} y={lineY + 55} fill="#f59e0b" fontSize="10" opacity={0.5}>
              B starts in {(delay - clampedT).toFixed(1)}s...
            </text>
          )}

          <text x={W - 16} y={20} fill="#64748b" fontSize="10" textAnchor="end">t = {clampedT.toFixed(1)} s</text>
        </svg>
      </div>

      <div className="space-y-3">
        <p className="text-base text-slate-300 leading-relaxed">
          <span className="text-indigo-400 font-semibold">Meeting / Catching Problem</span> —
          <span className="text-violet-400"> A</span> starts first,
          <span className="text-amber-400"> B</span> starts after delay.
        </p>

        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">A: Speed (m/s)</label>
          <input type="range" min={0} max={10} step={0.5} value={uA}
            onChange={(e) => setUA(Number(e.target.value))} className="w-full accent-violet-500" />
          <div className="flex justify-between text-xs text-slate-500"><span>0</span><span className="text-violet-400 font-semibold">{uA.toFixed(1)}</span><span>10</span></div>
        </div>
        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">A: Acceleration (m/s²)</label>
          <input type="range" min={0} max={5} step={0.25} value={aA}
            onChange={(e) => setAA(Number(e.target.value))} className="w-full accent-violet-500" />
          <div className="flex justify-between text-xs text-slate-500"><span>0</span><span className="text-violet-400 font-semibold">{aA.toFixed(1)}</span><span>5</span></div>
        </div>
        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">B: Speed (m/s)</label>
          <input type="range" min={1} max={15} step={0.5} value={uB}
            onChange={(e) => setUB(Number(e.target.value))} className="w-full accent-amber-500" />
          <div className="flex justify-between text-xs text-slate-500"><span>1</span><span className="text-amber-400 font-semibold">{uB.toFixed(1)}</span><span>15</span></div>
        </div>
        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">B: Delay (s)</label>
          <input type="range" min={0} max={5} step={0.25} value={delay}
            onChange={(e) => setDelay(Number(e.target.value))} className="w-full accent-amber-500" />
          <div className="flex justify-between text-xs text-slate-500"><span>0</span><span className="text-amber-400 font-semibold">{delay.toFixed(1)}s</span><span>5</span></div>
        </div>

        <button onClick={() => setPlaying(!playing)}
          className={`w-full px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            playing ? "bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/50"
                    : "bg-white/5 text-slate-400 border border-white/10"}`}>
          {playing ? "⏸ Pause" : "▶ Play"}
        </button>

        <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-3">
          <p className="text-xs text-green-400/70 font-bold uppercase tracking-wider mb-1">Meeting Point</p>
          {meetT > 0 ? (
            <p className="text-lg font-extrabold text-green-400 tabular-nums">
              t = {meetT.toFixed(1)} s, x = {meetX.toFixed(1)} m
            </p>
          ) : (
            <p className="text-sm text-slate-400">B never catches A with current settings</p>
          )}
        </div>
      </div>
    </div>
  );
}
