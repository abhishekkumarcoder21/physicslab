"use client";

import { useState, useMemo } from "react";

interface Point { x: number; y: number }

/** Generate a zig-zag path with controlled complexity */
function generatePath(complexity: number, W: number, H: number): Point[] {
  const segments = 3 + Math.floor(complexity * 5);
  const pts: Point[] = [{ x: 60, y: H - 60 }];
  const xStep = (W - 120) / segments;

  for (let i = 1; i <= segments; i++) {
    const x = 60 + i * xStep;
    const yBase = H / 2;
    const amplitude = 40 + complexity * 100;
    const y = yBase + Math.sin(i * 1.8 + complexity * 2) * amplitude * 0.5
            + Math.cos(i * 0.7) * amplitude * 0.3;
    pts.push({ x, y: Math.max(40, Math.min(H - 40, y)) });
  }
  return pts;
}

/** Compute total path distance */
function pathLength(pts: Point[]): number {
  return pts.reduce((sum, p, i) => {
    if (i === 0) return 0;
    const prev = pts[i - 1];
    return sum + Math.sqrt((p.x - prev.x) ** 2 + (p.y - prev.y) ** 2);
  }, 0);
}

/**
 * Average Speed — interactive motion experiment.
 * Path complexity slider + time slider, live readouts.
 */
export default function AverageSpeedSim() {
  const W = 700, H = 400;
  const [complexity, setComplexity] = useState(0.5);
  const [timeVal, setTimeVal] = useState(5);

  const path = useMemo(() => generatePath(complexity, W, H), [complexity]);
  const totalDist = pathLength(path) / 8; // scale to "metres"
  const avgSpeed = totalDist / timeVal;

  const pathD = path.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  // Particle position — interpolated on the path based on an animation "progress"
  const progress = 0.85; // show particle near end
  const targetIdx = Math.floor(progress * (path.length - 1));
  const particlePos = path[Math.min(targetIdx, path.length - 1)];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">
      {/* Canvas */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#060e1a] shadow-2xl">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ aspectRatio: `${W}/${H}` }}>
          {/* Grid */}
          {Array.from({ length: 14 }).map((_, i) => (
            <line key={`gx${i}`} x1={(i+1)*50} y1={0} x2={(i+1)*50} y2={H} stroke="#1e293b" strokeWidth={0.5} />
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={`gy${i}`} x1={0} y1={(i+1)*50} x2={W} y2={(i+1)*50} stroke="#1e293b" strokeWidth={0.5} />
          ))}

          <defs>
            <filter id="spd-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <linearGradient id="spd-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* Glowing trail */}
          <path d={pathD} fill="none" stroke="#f59e0b" strokeWidth={5} opacity={0.12} filter="url(#spd-glow)" strokeLinejoin="round" />
          <path d={pathD} fill="none" stroke="url(#spd-grad)" strokeWidth={2.5} strokeLinejoin="round" filter="url(#spd-glow)" />

          {/* Waypoints */}
          {path.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={i === 0 || i === path.length - 1 ? 5 : 2.5}
              fill={i === 0 ? "#f59e0b" : i === path.length - 1 ? "#a78bfa" : "#f59e0b"} opacity={i === 0 || i === path.length - 1 ? 1 : 0.4} />
          ))}

          {/* Start / End labels */}
          <text x={path[0].x} y={path[0].y + 20} fill="#f59e0b" fontSize="10" fontWeight="700" textAnchor="middle">START</text>
          <text x={path[path.length-1].x} y={path[path.length-1].y - 14} fill="#a78bfa" fontSize="10" fontWeight="700" textAnchor="middle">END</text>

          {/* Animated particle */}
          <circle cx={particlePos.x} cy={particlePos.y} r={12} fill="#f59e0b" opacity={0.12} className="animate-pulse" />
          <circle cx={particlePos.x} cy={particlePos.y} r={5} fill="#fbbf24" stroke="#f59e0b" strokeWidth={2} />

          {/* Distance label along path */}
          <text x={W/2} y={30} fill="#64748b" fontSize="11" textAnchor="middle" fontWeight="500">
            Total path length = {totalDist.toFixed(1)} m
          </text>
        </svg>
      </div>

      {/* Controls + info */}
      <div className="space-y-5">
        <p className="text-base text-slate-300 leading-relaxed">
          <span className="text-amber-400 font-semibold">Average Speed</span> ={" "}
          <span className="text-white font-mono">Total Distance ÷ Total Time</span>
        </p>
        <p className="text-sm text-slate-400">It&apos;s a <em>scalar</em> — it tells you how fast on average, regardless of direction.</p>

        {/* Path complexity */}
        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
            Path Complexity
          </label>
          <input type="range" min={0.1} max={1} step={0.05} value={complexity}
            onChange={(e) => setComplexity(Number(e.target.value))}
            className="w-full accent-amber-500" />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>Simple</span><span>Complex</span>
          </div>
        </div>

        {/* Time */}
        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
            Total Time (s)
          </label>
          <input type="range" min={1} max={20} step={0.5} value={timeVal}
            onChange={(e) => setTimeVal(Number(e.target.value))}
            className="w-full accent-cyan-500" />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>1 s</span>
            <span className="text-cyan-400 font-semibold">{timeVal.toFixed(1)} s</span>
            <span>20 s</span>
          </div>
        </div>

        {/* Readouts */}
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Distance</span>
            <span className="text-amber-400 font-bold tabular-nums">{totalDist.toFixed(1)} m</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Time</span>
            <span className="text-cyan-400 font-bold tabular-nums">{timeVal.toFixed(1)} s</span>
          </div>
          <div className="border-t border-white/10 pt-2 flex justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase">Avg Speed</span>
            <span className="text-xl font-extrabold text-amber-400 tabular-nums">
              {avgSpeed.toFixed(2)} <span className="text-sm font-normal text-amber-400/60">m/s</span>
            </span>
          </div>
        </div>

        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">💡 Key Insight</p>
          <p className="text-sm text-slate-300 leading-relaxed">
            Average speed depends on the <strong className="text-amber-400">entire path</strong>. A more complex (longer) path at the same time = higher average speed.
          </p>
        </div>
      </div>
    </div>
  );
}
