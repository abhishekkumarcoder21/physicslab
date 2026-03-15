"use client";

import { useState, useRef, useEffect } from "react";

/**
 * Projectile on Inclined Plane — launch up/down a slope.
 * Shows range along incline, time of flight, max height above slope.
 */
export default function ProjectileInclineSim() {
  const W = 700, H = 420;
  const [alpha, setAlpha] = useState(30); // incline angle
  const [beta, setBeta] = useState(45);   // launch angle above incline
  const [speed, setSpeed] = useState(15);
  const [playing, setPlaying] = useState(true);

  const animRef = useRef<number>(0);
  const startRef = useRef(performance.now());
  const [time, setTime] = useState(0);

  const g = 9.8;
  const alphaR = (alpha * Math.PI) / 180;
  const betaR = (beta * Math.PI) / 180;

  // Effective components along and perpendicular to incline
  const gPar = g * Math.sin(alphaR);   // along incline (down)
  const gPerp = g * Math.cos(alphaR);  // perp to incline (into surface)

  const uPar = speed * Math.cos(betaR);   // along incline (up)
  const uPerp = speed * Math.sin(betaR);  // perp to incline (away)

  // Time of flight (when perp displacement = 0)
  const tFlight = (2 * uPerp) / gPerp;
  // Range along incline
  const rangeIncline = uPar * tFlight - 0.5 * gPar * tFlight * tFlight;
  // Max height above incline
  const maxH = (uPerp * uPerp) / (2 * gPerp);

  // Convert incline coords to screen coords
  const origin = { x: 80, y: H - 80 };
  const scale = 5;

  const inclineEnd = {
    x: origin.x + Math.cos(alphaR) * 500,
    y: origin.y - Math.sin(alphaR) * 500,
  };

  const toScreen = (par: number, perp: number) => {
    const x = origin.x + par * scale * Math.cos(alphaR) - perp * scale * Math.sin(alphaR);
    const y = origin.y - par * scale * Math.sin(alphaR) - perp * scale * Math.cos(alphaR);
    return { x, y };
  };

  useEffect(() => {
    startRef.current = performance.now();
    setTime(0);
  }, [alpha, beta, speed]);

  useEffect(() => {
    if (!playing) return;
    function loop(now: number) {
      const elapsed = (now - startRef.current) / 1000;
      const t = elapsed % (tFlight + 1.5);
      setTime(Math.min(t, tFlight));
      animRef.current = requestAnimationFrame(loop);
    }
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [playing, tFlight]);

  // Current position on incline
  const curPar = uPar * time - 0.5 * gPar * time * time;
  const curPerp = uPerp * time - 0.5 * gPerp * time * time;
  const curPos = toScreen(curPar, Math.max(0, curPerp));

  // Trajectory points
  const trajSteps = 60;
  const trajPts = Array.from({ length: trajSteps + 1 }).map((_, i) => {
    const t = (i / trajSteps) * tFlight;
    const par = uPar * t - 0.5 * gPar * t * t;
    const perp = uPerp * t - 0.5 * gPerp * t * t;
    return toScreen(par, Math.max(0, perp));
  });
  const trajD = trajPts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  // Landing point
  const landPos = toScreen(rangeIncline, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#060e1a] shadow-2xl">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ aspectRatio: `${W}/${H}` }}>
          <defs>
            <filter id="pi-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Ground */}
          <line x1={20} y1={origin.y + 5} x2={W - 20} y2={origin.y + 5} stroke="#1e293b" strokeWidth={1} />

          {/* Incline surface */}
          <line x1={origin.x} y1={origin.y} x2={inclineEnd.x} y2={inclineEnd.y}
            stroke="#475569" strokeWidth={2.5} />

          {/* Incline angle arc */}
          <path d={`M ${origin.x + 40} ${origin.y} A 40 40 0 0 0 ${origin.x + 40 * Math.cos(alphaR)} ${origin.y - 40 * Math.sin(alphaR)}`}
            fill="none" stroke="#f59e0b" strokeWidth={1} opacity={0.5} />
          <text x={origin.x + 50} y={origin.y - 8} fill="#f59e0b" fontSize="10" fontWeight="600">α={alpha}°</text>

          {/* Trajectory trail */}
          <path d={trajD} fill="none" stroke="#6366f1" strokeWidth={2} opacity={0.4} />

          {/* Range along incline */}
          {rangeIncline > 0 && (
            <>
              <line x1={origin.x} y1={origin.y} x2={landPos.x} y2={landPos.y}
                stroke="#22c55e" strokeWidth={1.5} strokeDasharray="4 3" opacity={0.4} />
              <text x={(origin.x + landPos.x) / 2 + 10} y={(origin.y + landPos.y) / 2 + 16}
                fill="#22c55e" fontSize="10" fontWeight="600">R = {rangeIncline.toFixed(1)}m</text>
            </>
          )}

          {/* Gravity arrow */}
          <line x1={curPos.x + 20} y1={curPos.y} x2={curPos.x + 20} y2={curPos.y + 30}
            stroke="#f59e0b" strokeWidth={2} filter="url(#pi-glow)" />
          <polygon points={`${curPos.x + 20},${curPos.y + 30} ${curPos.x + 16},${curPos.y + 24} ${curPos.x + 24},${curPos.y + 24}`}
            fill="#f59e0b" />
          <text x={curPos.x + 32} y={curPos.y + 24} fill="#f59e0b" fontSize="8" fontWeight="600">g</text>

          {/* Particle */}
          <circle cx={curPos.x} cy={curPos.y} r={14} fill="#6366f1" opacity={0.1} />
          <circle cx={curPos.x} cy={curPos.y} r={6} fill="#a78bfa" stroke="#6366f1" strokeWidth={2} />

          {/* Launch angle annotation */}
          <text x={origin.x + 15} y={origin.y - 30} fill="#22d3ee" fontSize="9" fontWeight="600">β={beta}°</text>

          <text x={W - 16} y={20} fill="#64748b" fontSize="10" textAnchor="end">t = {time.toFixed(1)} s</text>
        </svg>
      </div>

      <div className="space-y-4">
        <p className="text-base text-slate-300 leading-relaxed">
          <span className="text-violet-400 font-semibold">Projectile on Inclined Plane</span> —
          launched at angle <span className="text-cyan-400">β</span> above a slope of angle
          <span className="text-amber-400"> α</span>.
        </p>

        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Incline α (°)</label>
          <input type="range" min={5} max={60} step={1} value={alpha}
            onChange={(e) => setAlpha(Number(e.target.value))} className="w-full accent-amber-500" />
          <div className="flex justify-between text-xs text-slate-500">
            <span>5°</span><span className="text-amber-400 font-semibold">{alpha}°</span><span>60°</span>
          </div>
        </div>
        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Launch β above incline (°)</label>
          <input type="range" min={10} max={80} step={1} value={beta}
            onChange={(e) => setBeta(Number(e.target.value))} className="w-full accent-cyan-500" />
          <div className="flex justify-between text-xs text-slate-500">
            <span>10°</span><span className="text-cyan-400 font-semibold">{beta}°</span><span>80°</span>
          </div>
        </div>
        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Speed (m/s)</label>
          <input type="range" min={5} max={25} step={1} value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))} className="w-full accent-indigo-500" />
          <div className="flex justify-between text-xs text-slate-500">
            <span>5</span><span className="text-indigo-400 font-semibold">{speed}</span><span>25</span>
          </div>
        </div>

        <button onClick={() => setPlaying(!playing)}
          className={`w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            playing ? "bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/50"
                    : "bg-white/5 text-slate-400 border border-white/10"}`}>
          {playing ? "⏸ Pause" : "▶ Play"}
        </button>

        <div className="rounded-xl bg-white/5 border border-white/10 p-3 space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Range (along incline)</span>
            <span className="text-green-400 font-bold tabular-nums">{rangeIncline.toFixed(1)} m</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Max Height (above incline)</span>
            <span className="text-amber-400 font-bold tabular-nums">{maxH.toFixed(1)} m</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Flight Time</span>
            <span className="text-cyan-400 font-bold tabular-nums">{tFlight.toFixed(2)} s</span>
          </div>
        </div>

        <div className="rounded-xl bg-violet-500/10 border border-violet-500/20 p-3">
          <p className="text-xs text-violet-400/70 font-bold uppercase tracking-wider mb-1">💡 JEE Tip</p>
          <p className="text-sm text-slate-300 leading-relaxed">
            Max range along incline when β = (90° − α)/2 = <span className="text-amber-400 font-semibold">{((90 - alpha) / 2).toFixed(0)}°</span>.
            Use g_∥ and g_⊥ components for easier calculations.
          </p>
        </div>
      </div>
    </div>
  );
}
