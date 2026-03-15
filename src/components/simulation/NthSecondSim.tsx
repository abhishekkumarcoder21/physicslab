"use client";

import { useState } from "react";

/**
 * Displacement in nth Second — sₙ = u + a(2n−1)/2.
 * Animated bar chart showing displacement per second.
 */
export default function NthSecondSim() {
  const W = 700, H = 340;
  const [u, setU] = useState(2);
  const [a, setA] = useState(3);
  const [highlight, setHighlight] = useState(3);

  const maxN = 8;
  const bars: { n: number; sn: number }[] = [];
  for (let n = 1; n <= maxN; n++) {
    bars.push({ n, sn: u + (a * (2 * n - 1)) / 2 });
  }

  const maxS = Math.max(...bars.map((b) => Math.abs(b.sn)), 1);
  const margin = { left: 60, right: 30, top: 30, bottom: 50 };
  const iW = W - margin.left - margin.right;
  const iH = H - margin.top - margin.bottom;
  const barW = iW / maxN - 8;
  const zeroY = margin.top + (a >= 0 && u >= 0 ? iH : iH / 2);

  const scaleY = (val: number) => {
    const range = a >= 0 && u >= 0 ? iH : iH / 2;
    return Math.min(range, (Math.abs(val) / maxS) * range);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#060e1a] shadow-2xl">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ aspectRatio: `${W}/${H}` }}>
          <defs>
            <filter id="nth-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Zero line */}
          <line x1={margin.left} y1={zeroY} x2={W - margin.right} y2={zeroY}
            stroke="#334155" strokeWidth={1} />

          {/* Bars */}
          {bars.map((b, i) => {
            const x = margin.left + i * (iW / maxN) + 4;
            const h = scaleY(b.sn);
            const isHigh = b.n === highlight;
            const isPos = b.sn >= 0;
            const y = isPos ? zeroY - h : zeroY;
            const color = isHigh ? "#22d3ee" : "#6366f1";
            const opacity = isHigh ? 1 : 0.6;
            return (
              <g key={b.n} onClick={() => setHighlight(b.n)} style={{ cursor: "pointer" }}>
                <rect x={x} y={y} width={barW} height={Math.max(h, 2)} rx={4}
                  fill={color} opacity={opacity * 0.3} />
                <rect x={x} y={y} width={barW} height={Math.max(h, 2)} rx={4}
                  fill="none" stroke={color} strokeWidth={isHigh ? 2 : 1} opacity={opacity} />
                {isHigh && (
                  <rect x={x} y={y} width={barW} height={Math.max(h, 2)} rx={4}
                    fill={color} opacity={0.15} filter="url(#nth-glow)" />
                )}
                <text x={x + barW / 2} y={zeroY + 16}
                  fill="#94a3b8" fontSize="10" fontWeight="600" textAnchor="middle">
                  n={b.n}
                </text>
                <text x={x + barW / 2} y={isPos ? y - 6 : y + h + 14}
                  fill={color} fontSize="9" fontWeight="700" textAnchor="middle">
                  {b.sn.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Y-axis label */}
          <text x={margin.left - 10} y={margin.top + iH / 2} fill="#94a3b8" fontSize="11"
            fontWeight="600" textAnchor="middle" transform={`rotate(-90, ${margin.left - 30}, ${margin.top + iH / 2})`}>
            Displacement in nth sec (m)
          </text>

          {/* Title */}
          <text x={W / 2} y={H - 8} fill="#64748b" fontSize="10" textAnchor="middle">
            Click a bar to highlight
          </text>
        </svg>
      </div>

      <div className="space-y-4">
        <p className="text-base text-slate-300 leading-relaxed">
          <span className="text-cyan-400 font-semibold">Displacement in the nᵗʰ second:</span>
        </p>
        <p className="text-lg text-white font-mono text-center bg-white/5 rounded-xl p-3 border border-white/10">
          sₙ = u + <span className="text-amber-400">a</span>(2n − 1) / 2
        </p>

        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Initial Velocity u</label>
          <input type="range" min={-3} max={8} step={0.5} value={u}
            onChange={(e) => setU(Number(e.target.value))} className="w-full accent-cyan-500" />
          <div className="flex justify-between text-xs text-slate-500 mt-0.5">
            <span>−3</span><span className="text-cyan-400 font-semibold">{u.toFixed(1)} m/s</span><span>8</span>
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Acceleration a</label>
          <input type="range" min={-4} max={6} step={0.5} value={a}
            onChange={(e) => setA(Number(e.target.value))} className="w-full accent-amber-500" />
          <div className="flex justify-between text-xs text-slate-500 mt-0.5">
            <span>−4</span><span className="text-amber-400 font-semibold">{a > 0 ? "+" : ""}{a.toFixed(1)} m/s²</span><span>+6</span>
          </div>
        </div>

        {/* Highlighted readout */}
        <div className="rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-4">
          <p className="text-xs text-cyan-400/70 font-bold uppercase tracking-wider mb-1">n = {highlight}</p>
          <p className="text-2xl font-extrabold text-cyan-400 tabular-nums">
            s<sub>{highlight}</sub> = {bars[highlight - 1]?.sn.toFixed(2)} <span className="text-sm font-normal">m</span>
          </p>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            = {u} + {a}×(2×{highlight} − 1)/2 = {u} + {a}×{2 * highlight - 1}/2
          </p>
        </div>

        <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3">
          <p className="text-xs text-amber-400/70 font-bold uppercase tracking-wider mb-1">💡 Key Insight</p>
          <p className="text-sm text-slate-300 leading-relaxed">
            Successive displacements differ by <span className="text-amber-400 font-semibold">a</span> (constant).
            If sₙ becomes negative, particle is moving backward in that second.
          </p>
        </div>
      </div>
    </div>
  );
}
