"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Point { x: number; y: number }

/** Parametric curve: a smooth S-curve path */
function curvePoint(t: number, W: number, H: number): Point {
  const x = 50 + t * (W - 100);
  const y =
    H / 2 +
    Math.sin(t * Math.PI * 2.2) * (H * 0.28) +
    Math.cos(t * Math.PI * 1.1) * (H * 0.12);
  return { x, y };
}

/** Derivative of the curve (tangent direction) */
function curveTangent(t: number, W: number, H: number): Point {
  const dt = 0.001;
  const p1 = curvePoint(t, W, H);
  const p2 = curvePoint(Math.min(1, t + dt), W, H);
  const dx = (p2.x - p1.x) / dt;
  const dy = (p2.y - p1.y) / dt;
  const mag = Math.sqrt(dx * dx + dy * dy);
  return { x: dx / mag, y: dy / mag };
}

/**
 * Instantaneous Velocity — particle on smooth curve.
 * Time slider moves the particle; tangent arrow = instantaneous velocity.
 */
export default function InstantaneousVelocitySim() {
  const W = 700, H = 400;
  const [t, setT] = useState(0.3);
  const [autoPlay, setAutoPlay] = useState(true);
  const animRef = useRef<number>(0);
  const tRef = useRef(t);

  useEffect(() => { tRef.current = t; }, [t]);

  // Auto-animate
  useEffect(() => {
    if (!autoPlay) return;
    let startTime = performance.now();
    function loop(now: number) {
      const elapsed = (now - startTime) / 1000;
      const newT = (elapsed * 0.08) % 1;
      tRef.current = newT;
      setT(newT);
      animRef.current = requestAnimationFrame(loop);
    }
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [autoPlay]);

  // Generate full curve path
  const steps = 200;
  const curvePts: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    curvePts.push(curvePoint(i / steps, W, H));
  }
  const curveD = curvePts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  // Traveled portion
  const traveledIdx = Math.floor(t * steps);
  const traveledPts = curvePts.slice(0, traveledIdx + 1);
  const traveledD = traveledPts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  // Current point + tangent
  const pos = curvePoint(t, W, H);
  const tang = curveTangent(t, W, H);
  const arrowLen = 60;
  const arrowEnd = { x: pos.x + tang.x * arrowLen, y: pos.y + tang.y * arrowLen };

  // Arrowhead
  const ha = Math.atan2(arrowEnd.y - pos.y, arrowEnd.x - pos.x);
  const hl = 12;
  const hlX = arrowEnd.x - hl * Math.cos(ha - Math.PI / 6);
  const hlY = arrowEnd.y - hl * Math.sin(ha - Math.PI / 6);
  const hrX = arrowEnd.x - hl * Math.cos(ha + Math.PI / 6);
  const hrY = arrowEnd.y - hl * Math.sin(ha + Math.PI / 6);

  // Speed magnitude (derivative magnitude)
  const dt = 0.001;
  const p1 = curvePoint(t, W, H);
  const p2 = curvePoint(Math.min(1, t + dt), W, H);
  const speed = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2) / dt / 80;
  const direction = (Math.atan2(-(p2.y - p1.y), p2.x - p1.x) * 180) / Math.PI;

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setAutoPlay(false);
    setT(Number(e.target.value));
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">
      {/* Canvas */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#060e1a] shadow-2xl">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ aspectRatio: `${W}/${H}` }}>
          {Array.from({ length: 14 }).map((_, i) => (
            <line key={`g${i}`} x1={(i+1)*50} y1={0} x2={(i+1)*50} y2={H} stroke="#1e293b" strokeWidth={0.5} />
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={`h${i}`} x1={0} y1={(i+1)*50} x2={W} y2={(i+1)*50} stroke="#1e293b" strokeWidth={0.5} />
          ))}

          <defs>
            <filter id="iv-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Full curve (faint) */}
          <path d={curveD} fill="none" stroke="#334155" strokeWidth={1.5} strokeLinejoin="round" />

          {/* Traveled portion (glowing) */}
          {traveledPts.length > 1 && (
            <path d={traveledD} fill="none" stroke="#6366f1" strokeWidth={2.5} strokeLinejoin="round" opacity={0.7} filter="url(#iv-glow)" />
          )}

          {/* Tangent arrow = instantaneous velocity */}
          <line x1={pos.x} y1={pos.y} x2={arrowEnd.x} y2={arrowEnd.y}
            stroke="#22d3ee" strokeWidth={3} strokeLinecap="round" filter="url(#iv-glow)" />
          <polygon points={`${arrowEnd.x},${arrowEnd.y} ${hlX},${hlY} ${hrX},${hrY}`}
            fill="#22d3ee" filter="url(#iv-glow)" />
          <text x={arrowEnd.x + 8} y={arrowEnd.y - 8}
            fill="#22d3ee" fontSize="12" fontWeight="700" filter="url(#iv-glow)">
            v⃗(t)
          </text>

          {/* Particle */}
          <circle cx={pos.x} cy={pos.y} r={14} fill="#6366f1" opacity={0.15} />
          <circle cx={pos.x} cy={pos.y} r={6} fill="#a78bfa" stroke="#6366f1" strokeWidth={2} />

          {/* Time label */}
          <text x={20} y={H - 16} fill="#64748b" fontSize="11" fontWeight="500">
            t = {(t * 10).toFixed(1)} s
          </text>
        </svg>
      </div>

      {/* Controls */}
      <div className="space-y-5">
        <p className="text-base text-slate-300 leading-relaxed">
          <span className="text-cyan-400 font-semibold">Instantaneous velocity</span> is the
          velocity at a <strong className="text-white">specific moment</strong> in time.
        </p>
        <p className="text-sm text-slate-400 leading-relaxed">
          Mathematically, <span className="text-white font-mono">v⃗ = dx⃗/dt</span>. The arrow is <em>tangent</em> to the curve at the particle&apos;s current position.
        </p>

        {/* Time slider */}
        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
            Time Position
          </label>
          <input type="range" min={0.01} max={0.99} step={0.005} value={t}
            onChange={handleSliderChange}
            className="w-full accent-indigo-500" />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>0 s</span>
            <span className="text-indigo-400 font-semibold">{(t * 10).toFixed(1)} s</span>
            <span>10 s</span>
          </div>
        </div>

        {/* Play/Pause */}
        <button onClick={() => setAutoPlay(!autoPlay)}
          className={`w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            autoPlay
              ? "bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/50"
              : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"
          }`}>
          {autoPlay ? "⏸ Pause Animation" : "▶ Play Animation"}
        </button>

        {/* Readout */}
        <div className="rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-4 space-y-2">
          <p className="text-xs text-cyan-400/70 font-bold uppercase tracking-wider">Instantaneous Velocity</p>
          <p className="text-xl font-extrabold text-white tabular-nums">
            |v⃗| = {speed.toFixed(2)} <span className="text-sm font-normal text-slate-400">m/s</span>
          </p>
          <p className="text-sm text-slate-400">
            Direction: <span className="text-amber-400 font-semibold">{direction.toFixed(0)}°</span>
          </p>
        </div>

        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">💡 Key Insight</p>
          <p className="text-sm text-slate-300 leading-relaxed">
            The tangent arrow <strong className="text-cyan-400">changes direction</strong> as the particle moves along the curve. The velocity vector is always tangent to the path.
          </p>
        </div>
      </div>
    </div>
  );
}
