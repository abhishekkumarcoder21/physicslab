"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Vec2 { x: number; y: number }

/**
 * Minimum Distance Between Two Moving Particles.
 * Two particles move linearly in 2D; highlights closest approach.
 */
export default function MinDistanceSim() {
  const W = 700, H = 450;
  const [vAx, setVAx] = useState(4);
  const [vAy, setVAy] = useState(1);
  const [vBx, setVBx] = useState(-1);
  const [vBy, setVBy] = useState(3);
  const [playing, setPlaying] = useState(true);

  const animRef = useRef<number>(0);
  const startRef = useRef(performance.now());
  const [time, setTime] = useState(0);

  const scale = 18;
  const cx = W / 2, cy = H / 2;

  // Starting positions
  const startA: Vec2 = { x: -12, y: -6 };
  const startB: Vec2 = { x: 8, y: -8 };

  const posA = (t: number): Vec2 => ({ x: startA.x + vAx * t, y: startA.y + vAy * t });
  const posB = (t: number): Vec2 => ({ x: startB.x + vBx * t, y: startB.y + vBy * t });

  const dist = (t: number) => {
    const a = posA(t), b = posB(t);
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  };

  // Find time of closest approach analytically
  // d²(t) = |rA - rB + (vA - vB)t|²
  const dx0 = startA.x - startB.x;
  const dy0 = startA.y - startB.y;
  const dvx = vAx - vBx;
  const dvy = vAy - vBy;
  const a_coeff = dvx * dvx + dvy * dvy;
  const b_coeff = 2 * (dx0 * dvx + dy0 * dvy);
  const tMin = a_coeff > 0.001 ? Math.max(0, -b_coeff / (2 * a_coeff)) : 0;
  const minDist = dist(tMin);

  const toCanvas = (p: Vec2): Vec2 => ({ x: cx + p.x * scale, y: cy - p.y * scale });

  const tMax = 8;

  useEffect(() => {
    startRef.current = performance.now();
    setTime(0);
  }, [vAx, vAy, vBx, vBy]);

  useEffect(() => {
    if (!playing) return;
    function loop(now: number) {
      const elapsed = (now - startRef.current) / 1000;
      const t = elapsed % (tMax + 2);
      setTime(Math.min(t, tMax));
      animRef.current = requestAnimationFrame(loop);
    }
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [playing]);

  // Trails
  const trailSteps = 60;
  const trailA = Array.from({ length: trailSteps + 1 }).map((_, i) => {
    const t = (i / trailSteps) * tMax;
    return toCanvas(posA(t));
  });
  const trailB = Array.from({ length: trailSteps + 1 }).map((_, i) => {
    const t = (i / trailSteps) * tMax;
    return toCanvas(posB(t));
  });

  const curA = toCanvas(posA(time));
  const curB = toCanvas(posB(time));
  const curDist = dist(time);

  const minA = toCanvas(posA(tMin));
  const minB = toCanvas(posB(tMin));

  const trailToD = (pts: Vec2[]) => pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#060e1a] shadow-2xl">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ aspectRatio: `${W}/${H}` }}>
          <defs>
            <filter id="md-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Light grid */}
          {Array.from({ length: 21 }).map((_, i) => (
            <g key={i}>
              <line x1={cx + (i - 10) * scale} y1={30} x2={cx + (i - 10) * scale} y2={H - 30}
                stroke="#0f172a" strokeWidth={0.5} />
              <line x1={30} y1={cy + (i - 10) * scale} x2={W - 30} y2={cy + (i - 10) * scale}
                stroke="#0f172a" strokeWidth={0.5} />
            </g>
          ))}
          <line x1={30} y1={cy} x2={W - 30} y2={cy} stroke="#1e293b" strokeWidth={1} />
          <line x1={cx} y1={30} x2={cx} y2={H - 30} stroke="#1e293b" strokeWidth={1} />

          {/* Trail A */}
          <path d={trailToD(trailA)} fill="none" stroke="#6366f1" strokeWidth={1.5} opacity={0.3} />
          {/* Trail B */}
          <path d={trailToD(trailB)} fill="none" stroke="#f59e0b" strokeWidth={1.5} opacity={0.3} />

          {/* Min distance line (ghost) */}
          <line x1={minA.x} y1={minA.y} x2={minB.x} y2={minB.y}
            stroke="#22c55e" strokeWidth={1.5} strokeDasharray="5 3" opacity={0.4} />
          <circle cx={(minA.x + minB.x) / 2} cy={(minA.y + minB.y) / 2} r={3}
            fill="#22c55e" opacity={0.5} />
          <text x={(minA.x + minB.x) / 2} y={(minA.y + minB.y) / 2 - 10}
            fill="#22c55e" fontSize="9" fontWeight="600" textAnchor="middle" opacity={0.6}>
            d_min = {minDist.toFixed(1)}
          </text>

          {/* Current distance line */}
          <line x1={curA.x} y1={curA.y} x2={curB.x} y2={curB.y}
            stroke="#94a3b8" strokeWidth={1} strokeDasharray="4 3" opacity={0.5} />
          <text x={(curA.x + curB.x) / 2 + 8} y={(curA.y + curB.y) / 2 - 6}
            fill="#94a3b8" fontSize="9" fontWeight="500">
            d = {curDist.toFixed(1)}
          </text>

          {/* Velocity arrows */}
          <line x1={curA.x} y1={curA.y} x2={curA.x + vAx * 5} y2={curA.y - vAy * 5}
            stroke="#818cf8" strokeWidth={1.5} opacity={0.6} />
          <line x1={curB.x} y1={curB.y} x2={curB.x + vBx * 5} y2={curB.y - vBy * 5}
            stroke="#fbbf24" strokeWidth={1.5} opacity={0.6} />

          {/* Particle A */}
          <circle cx={curA.x} cy={curA.y} r={16} fill="#6366f1" opacity={0.08} />
          <circle cx={curA.x} cy={curA.y} r={7} fill="#a78bfa" stroke="#6366f1" strokeWidth={2} />
          <text x={curA.x} y={curA.y - 14} fill="#a78bfa" fontSize="10" fontWeight="700" textAnchor="middle">A</text>

          {/* Particle B */}
          <circle cx={curB.x} cy={curB.y} r={16} fill="#f59e0b" opacity={0.08} />
          <circle cx={curB.x} cy={curB.y} r={7} fill="#fbbf24" stroke="#f59e0b" strokeWidth={2} />
          <text x={curB.x} y={curB.y - 14} fill="#fbbf24" fontSize="10" fontWeight="700" textAnchor="middle">B</text>

          <text x={W - 16} y={20} fill="#64748b" fontSize="10" textAnchor="end">t = {time.toFixed(1)} s</text>
        </svg>
      </div>

      <div className="space-y-4">
        <p className="text-base text-slate-300 leading-relaxed">
          Two particles approach and separate. The <span className="text-green-400 font-semibold">minimum distance</span> occurs at
          <span className="text-amber-400 font-mono"> t = {tMin.toFixed(2)} s</span>.
        </p>

        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">A: Velocity X</label>
          <input type="range" min={-6} max={8} step={0.5} value={vAx}
            onChange={(e) => setVAx(Number(e.target.value))} className="w-full accent-violet-500" />
          <div className="flex justify-between text-xs text-slate-500"><span>−6</span><span className="text-violet-400 font-semibold">{vAx.toFixed(1)}</span><span>8</span></div>
        </div>
        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">A: Velocity Y</label>
          <input type="range" min={-6} max={6} step={0.5} value={vAy}
            onChange={(e) => setVAy(Number(e.target.value))} className="w-full accent-violet-500" />
          <div className="flex justify-between text-xs text-slate-500"><span>−6</span><span className="text-violet-400 font-semibold">{vAy.toFixed(1)}</span><span>6</span></div>
        </div>
        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">B: Velocity X</label>
          <input type="range" min={-6} max={6} step={0.5} value={vBx}
            onChange={(e) => setVBx(Number(e.target.value))} className="w-full accent-amber-500" />
          <div className="flex justify-between text-xs text-slate-500"><span>−6</span><span className="text-amber-400 font-semibold">{vBx.toFixed(1)}</span><span>6</span></div>
        </div>
        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">B: Velocity Y</label>
          <input type="range" min={-6} max={8} step={0.5} value={vBy}
            onChange={(e) => setVBy(Number(e.target.value))} className="w-full accent-amber-500" />
          <div className="flex justify-between text-xs text-slate-500"><span>−6</span><span className="text-amber-400 font-semibold">{vBy.toFixed(1)}</span><span>8</span></div>
        </div>

        <button onClick={() => setPlaying(!playing)}
          className={`w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            playing ? "bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/50"
                    : "bg-white/5 text-slate-400 border border-white/10"}`}>
          {playing ? "⏸ Pause" : "▶ Play"}
        </button>

        <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Min Distance</span>
            <span className="text-green-400 font-bold tabular-nums text-lg">{minDist.toFixed(2)} m</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">At time</span>
            <span className="text-amber-400 font-bold tabular-nums">{tMin.toFixed(2)} s</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Current dist</span>
            <span className="text-slate-300 font-bold tabular-nums">{curDist.toFixed(1)} m</span>
          </div>
        </div>
      </div>
    </div>
  );
}
