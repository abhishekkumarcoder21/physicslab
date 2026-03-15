"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Point { x: number; y: number }

/**
 * Projectile Motion — powered by physics engine concepts.
 * Launch angle + initial speed sliders.
 * Shows parabolic trajectory, velocity/acceleration arrows, range & max height.
 */
export default function ProjectileMotionSim() {
  const W = 700, H = 450;
  const [angle, setAngle] = useState(45);
  const [speed, setSpeed] = useState(20);
  const [playing, setPlaying] = useState(true);
  const [showComponents, setShowComponents] = useState(true);

  const g = 9.8;
  const rad = (angle * Math.PI) / 180;
  const vx0 = speed * Math.cos(rad);
  const vy0 = speed * Math.sin(rad);

  // Flight calculations
  const tFlight = (2 * vy0) / g;
  const range = vx0 * tFlight;
  const maxHeight = (vy0 * vy0) / (2 * g);

  // Scale to canvas
  const margin = 60;
  const scaleX = (W - margin * 2) / Math.max(range, 1);
  const scaleY = (H - margin * 2) / Math.max(maxHeight * 1.3, 1);
  const scale = Math.min(scaleX, scaleY);
  const groundY = H - margin;

  const toCanvas = (x: number, y: number): Point => ({
    x: margin + x * scale,
    y: groundY - y * scale,
  });

  // Generate trajectory points
  const trajSteps = 100;
  const trajectory: Point[] = [];
  for (let i = 0; i <= trajSteps; i++) {
    const t = (i / trajSteps) * tFlight;
    const px = vx0 * t;
    const py = vy0 * t - 0.5 * g * t * t;
    trajectory.push(toCanvas(px, Math.max(0, py)));
  }
  const trajD = trajectory.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  // Animation state
  const animRef = useRef<number>(0);
  const startRef = useRef(performance.now());
  const [time, setTime] = useState(0);

  useEffect(() => {
    startRef.current = performance.now();
    setTime(0);
  }, [angle, speed]);

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

  // Current particle
  const cx = vx0 * time;
  const cy = vy0 * time - 0.5 * g * time * time;
  const pos = toCanvas(cx, Math.max(0, cy));

  // Current velocity
  const cvx = vx0;
  const cvy = vy0 - g * time;
  const arrowScale = 1.5;

  // Velocity arrow endpoint
  const vEnd = { x: pos.x + cvx * arrowScale, y: pos.y - cvy * arrowScale };

  // Max height marker
  const maxHPos = toCanvas(range / 2, maxHeight);
  // Range marker
  const rangePos = toCanvas(range, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#060e1a] shadow-2xl">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ aspectRatio: `${W}/${H}` }}>
          <defs>
            <filter id="proj-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <linearGradient id="proj-trail" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Ground */}
          <line x1={margin - 20} y1={groundY} x2={W - margin + 20} y2={groundY} stroke="#334155" strokeWidth={1.5} />
          <line x1={margin} y1={groundY + 5} x2={margin} y2={margin - 20} stroke="#334155" strokeWidth={1} />
          {/* Ground ticks */}
          {Array.from({ length: 10 }).map((_, i) => {
            const px = margin + (i + 1) * ((W - margin * 2) / 10);
            return px < W - margin + 10 ? (
              <line key={i} x1={px} y1={groundY - 3} x2={px} y2={groundY + 3} stroke="#475569" strokeWidth={0.5} />
            ) : null;
          })}

          {/* Trajectory trail */}
          <path d={trajD} fill="none" stroke="url(#proj-trail)" strokeWidth={2} strokeLinejoin="round" />
          <path d={trajD} fill="none" stroke="#6366f1" strokeWidth={4} opacity={0.08} filter="url(#proj-glow)" />

          {/* Max height dashed line */}
          <line x1={margin} y1={maxHPos.y} x2={maxHPos.x} y2={maxHPos.y}
            stroke="#f59e0b" strokeWidth={1} strokeDasharray="4 3" opacity={0.4} />
          <line x1={maxHPos.x} y1={maxHPos.y} x2={maxHPos.x} y2={groundY}
            stroke="#f59e0b" strokeWidth={1} strokeDasharray="4 3" opacity={0.4} />
          <text x={margin - 5} y={maxHPos.y + 4} fill="#f59e0b" fontSize="9" fontWeight="600" textAnchor="end">
            H = {maxHeight.toFixed(1)}m
          </text>

          {/* Range marker */}
          {rangePos.x < W - 20 && (
            <>
              <line x1={margin} y1={groundY + 14} x2={rangePos.x} y2={groundY + 14}
                stroke="#22d3ee" strokeWidth={1} />
              <text x={(margin + rangePos.x) / 2} y={groundY + 28} fill="#22d3ee" fontSize="9" fontWeight="600" textAnchor="middle">
                R = {range.toFixed(1)}m
              </text>
            </>
          )}

          {/* Velocity arrow (full) */}
          {time <= tFlight && (
            <>
              <line x1={pos.x} y1={pos.y} x2={vEnd.x} y2={vEnd.y}
                stroke="#22d3ee" strokeWidth={2.5} strokeLinecap="round" filter="url(#proj-glow)" />
              <circle cx={vEnd.x} cy={vEnd.y} r={3} fill="#22d3ee" filter="url(#proj-glow)" />

              {/* Component arrows */}
              {showComponents && (
                <>
                  {/* Vx */}
                  <line x1={pos.x} y1={pos.y} x2={pos.x + cvx * arrowScale} y2={pos.y}
                    stroke="#22d3ee" strokeWidth={1.5} strokeDasharray="4 2" opacity={0.5} />
                  <text x={pos.x + cvx * arrowScale / 2} y={pos.y + 14}
                    fill="#22d3ee" fontSize="8" fontWeight="500" textAnchor="middle" opacity={0.6}>
                    vx={cvx.toFixed(1)}
                  </text>
                  {/* Vy */}
                  <line x1={pos.x} y1={pos.y} x2={pos.x} y2={pos.y - cvy * arrowScale}
                    stroke="#a78bfa" strokeWidth={1.5} strokeDasharray="4 2" opacity={0.5} />
                  <text x={pos.x - 10} y={pos.y - cvy * arrowScale / 2}
                    fill="#a78bfa" fontSize="8" fontWeight="500" textAnchor="end" opacity={0.6}>
                    vy={cvy.toFixed(1)}
                  </text>
                </>
              )}

              {/* Gravity arrow */}
              <line x1={pos.x} y1={pos.y + 5} x2={pos.x} y2={pos.y + 30}
                stroke="#f59e0b" strokeWidth={2} strokeLinecap="round" filter="url(#proj-glow)" />
              <polygon points={`${pos.x},${pos.y + 30} ${pos.x - 4},${pos.y + 24} ${pos.x + 4},${pos.y + 24}`}
                fill="#f59e0b" filter="url(#proj-glow)" />
              <text x={pos.x + 10} y={pos.y + 26} fill="#f59e0b" fontSize="8" fontWeight="600">g</text>
            </>
          )}

          {/* Particle */}
          <circle cx={pos.x} cy={pos.y} r={14} fill="#6366f1" opacity={0.1} />
          <circle cx={pos.x} cy={pos.y} r={6} fill="#a78bfa" stroke="#6366f1" strokeWidth={2} />

          {/* Launch angle display */}
          <path
            d={`M ${margin + 25} ${groundY} A 25 25 0 0 0 ${margin + 25 * Math.cos(rad)} ${groundY - 25 * Math.sin(rad)}`}
            fill="none" stroke="#f59e0b" strokeWidth={1} opacity={0.5} />
          <text x={margin + 32} y={groundY - 8} fill="#f59e0b" fontSize="9" fontWeight="600">{angle}°</text>

          {/* Legend */}
          <g transform="translate(16, 16)">
            <line x1={0} y1={0} x2={14} y2={0} stroke="#22d3ee" strokeWidth={2} />
            <text x={20} y={4} fill="#22d3ee" fontSize="9">Velocity</text>
            <line x1={0} y1={14} x2={14} y2={14} stroke="#f59e0b" strokeWidth={2} />
            <text x={20} y={18} fill="#f59e0b" fontSize="9">Gravity</text>
            <line x1={80} y1={0} x2={94} y2={0} stroke="#6366f1" strokeWidth={2} />
            <text x={100} y={4} fill="#6366f1" fontSize="9">Trail</text>
          </g>

          <text x={W - 16} y={20} fill="#64748b" fontSize="10" textAnchor="end">t = {time.toFixed(1)} s</text>
        </svg>
      </div>

      <div className="space-y-5">
        <p className="text-base text-slate-300 leading-relaxed">
          <span className="text-indigo-400 font-semibold">Projectile Motion</span> —
          an object launched at an angle follows a <span className="text-cyan-400">parabolic path</span> under gravity.
        </p>

        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Launch Angle (°)</label>
          <input type="range" min={5} max={85} step={1} value={angle}
            onChange={(e) => setAngle(Number(e.target.value))} className="w-full accent-amber-500" />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>5°</span><span className="text-amber-400 font-semibold">{angle}°</span><span>85°</span>
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Initial Speed (m/s)</label>
          <input type="range" min={5} max={40} step={1} value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))} className="w-full accent-cyan-500" />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>5</span><span className="text-cyan-400 font-semibold">{speed} m/s</span><span>40</span>
          </div>
        </div>

        <button onClick={() => setShowComponents(!showComponents)}
          className={`w-full px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            showComponents ? "bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/50"
                          : "bg-white/5 text-slate-400 border border-white/10"}`}>
          {showComponents ? "✓ Showing vx, vy" : "Show Components"}
        </button>

        <div className="flex gap-2">
          <button onClick={() => setPlaying(!playing)}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              playing ? "bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/50"
                      : "bg-white/5 text-slate-400 border border-white/10"}`}>
            {playing ? "⏸ Pause" : "▶ Play"}
          </button>
          <button onClick={() => { startRef.current = performance.now(); setTime(0); }}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-sm hover:bg-white/10 transition-all">↺</button>
        </div>

        {/* Readouts */}
        <div className="rounded-xl bg-indigo-500/10 border border-indigo-500/20 p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Range</span>
            <span className="text-cyan-400 font-bold tabular-nums">{range.toFixed(1)} m</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Max Height</span>
            <span className="text-amber-400 font-bold tabular-nums">{maxHeight.toFixed(1)} m</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Flight Time</span>
            <span className="text-indigo-400 font-bold tabular-nums">{tFlight.toFixed(2)} s</span>
          </div>
        </div>

        <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
          <p className="text-xs text-amber-400/70 font-bold uppercase tracking-wider mb-1">💡 Key Insight</p>
          <p className="text-sm text-slate-300 leading-relaxed">
            Maximum range at <span className="text-amber-400 font-semibold">45°</span>.
            Same range for complementary angles (e.g. 30° and 60°).
            <span className="text-cyan-400"> vx stays constant</span>, only <span className="text-violet-400">vy changes</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
