"use client";

import { useState, useMemo } from "react";

interface Point { x: number; y: number }

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

function totalPathLen(pts: Point[]): number {
  return pts.reduce((s, p, i) => {
    if (i === 0) return 0;
    const q = pts[i - 1];
    return s + Math.sqrt((p.x - q.x) ** 2 + (p.y - q.y) ** 2);
  }, 0);
}

/**
 * Average Velocity — compares avg speed vs avg velocity.
 * Shows displacement vector + path, numerical comparison.
 */
export default function AverageVelocitySim() {
  const W = 700, H = 400;
  const [complexity, setComplexity] = useState(0.5);
  const [timeVal, setTimeVal] = useState(5);

  const path = useMemo(() => generatePath(complexity, W, H), [complexity]);
  const dist = totalPathLen(path) / 8;
  const start = path[0];
  const end = path[path.length - 1];
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const displacement = Math.sqrt(dx * dx + dy * dy) / 8;
  const avgSpeed = dist / timeVal;
  const avgVelMag = displacement / timeVal;

  const pathD = path.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  // Arrowhead for displacement
  const angle = Math.atan2(end.y - start.y, end.x - start.x);
  const hl = 14;
  const hlX = end.x - hl * Math.cos(angle - Math.PI / 6);
  const hlY = end.y - hl * Math.sin(angle - Math.PI / 6);
  const hrX = end.x - hl * Math.cos(angle + Math.PI / 6);
  const hrY = end.y - hl * Math.sin(angle + Math.PI / 6);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">
      {/* Canvas */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#060e1a] shadow-2xl">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ aspectRatio: `${W}/${H}` }}>
          {Array.from({ length: 14 }).map((_, i) => (
            <line key={`gx${i}`} x1={(i+1)*50} y1={0} x2={(i+1)*50} y2={H} stroke="#1e293b" strokeWidth={0.5} />
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={`gy${i}`} x1={0} y1={(i+1)*50} x2={W} y2={(i+1)*50} stroke="#1e293b" strokeWidth={0.5} />
          ))}

          <defs>
            <filter id="vel-avg-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Path trail (distance) — dashed amber */}
          <path d={pathD} fill="none" stroke="#f59e0b" strokeWidth={2} strokeDasharray="6 4" opacity={0.6} strokeLinejoin="round" />

          {/* Displacement vector — solid cyan */}
          <line x1={start.x} y1={start.y} x2={end.x} y2={end.y}
            stroke="#22d3ee" strokeWidth={3} strokeLinecap="round" filter="url(#vel-avg-glow)" />
          <polygon points={`${end.x},${end.y} ${hlX},${hlY} ${hrX},${hrY}`}
            fill="#22d3ee" filter="url(#vel-avg-glow)" />

          {/* Displacement label */}
          <text x={(start.x + end.x) / 2 - 10} y={(start.y + end.y) / 2 - 12}
            fill="#22d3ee" fontSize="12" fontWeight="700" filter="url(#vel-avg-glow)">
            Δr⃗ = {displacement.toFixed(1)} m
          </text>

          {/* Start / End markers */}
          <circle cx={start.x} cy={start.y} r={6} fill="#f59e0b" />
          <text x={start.x} y={start.y + 20} fill="#f59e0b" fontSize="10" fontWeight="700" textAnchor="middle">START</text>
          <circle cx={end.x} cy={end.y} r={6} fill="#a78bfa" />
          <text x={end.x} y={end.y - 14} fill="#a78bfa" fontSize="10" fontWeight="700" textAnchor="middle">END</text>

          {/* Legend */}
          <g transform="translate(16, 20)">
            <line x1={0} y1={0} x2={20} y2={0} stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 3" />
            <text x={26} y={4} fill="#f59e0b" fontSize="10" fontWeight="500">Distance (path)</text>
            <line x1={0} y1={16} x2={20} y2={16} stroke="#22d3ee" strokeWidth={2} />
            <text x={26} y={20} fill="#22d3ee" fontSize="10" fontWeight="500">Displacement (vector)</text>
          </g>
        </svg>
      </div>

      {/* Info panel */}
      <div className="space-y-5">
        <p className="text-base text-slate-300 leading-relaxed">
          <span className="text-cyan-400 font-semibold">Average Velocity</span> ={" "}
          <span className="text-white font-mono">Displacement ÷ Time</span>
        </p>
        <p className="text-sm text-slate-400">It&apos;s a <em>vector</em> — direction matters. Only the start and end positions count.</p>

        {/* Controls */}
        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Path Complexity</label>
          <input type="range" min={0.1} max={1} step={0.05} value={complexity}
            onChange={(e) => setComplexity(Number(e.target.value))} className="w-full accent-amber-500" />
        </div>
        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Total Time (s)</label>
          <input type="range" min={1} max={20} step={0.5} value={timeVal}
            onChange={(e) => setTimeVal(Number(e.target.value))} className="w-full accent-cyan-500" />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>1 s</span>
            <span className="text-cyan-400 font-semibold">{timeVal.toFixed(1)} s</span>
            <span>20 s</span>
          </div>
        </div>

        {/* Comparison readouts */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-amber-400 font-bold uppercase">Avg Speed</span>
            <span className="text-lg font-extrabold text-amber-400 tabular-nums">
              {avgSpeed.toFixed(2)} <span className="text-xs font-normal">m/s</span>
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-cyan-400 font-bold uppercase">|Avg Velocity|</span>
            <span className="text-lg font-extrabold text-cyan-400 tabular-nums">
              {avgVelMag.toFixed(2)} <span className="text-xs font-normal">m/s</span>
            </span>
          </div>
          <div className="border-t border-white/10 pt-2">
            <p className="text-xs text-slate-500">
              Avg Speed ≥ |Avg Velocity| — equality holds only for straight-line motion.
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-4">
          <p className="text-xs text-cyan-400/70 font-bold uppercase tracking-wider mb-1">💡 Key Insight</p>
          <p className="text-sm text-slate-300 leading-relaxed">
            Increase path complexity — the <span className="text-amber-400">average speed</span> rises but
            <span className="text-cyan-400"> |average velocity|</span> stays similar because displacement barely changes!
          </p>
        </div>
      </div>
    </div>
  );
}
