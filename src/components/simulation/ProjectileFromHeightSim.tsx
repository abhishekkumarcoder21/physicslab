"use client";

import { useState, useRef, useEffect } from "react";

/**
 * Projectile from a Height — horizontal throw from a cliff/building.
 * Shows horizontal + vertical motion independence.
 */
export default function ProjectileFromHeightSim() {
  const W = 700, H = 420;
  const [h0, setH0] = useState(40);
  const [vx, setVx] = useState(12);
  const [playing, setPlaying] = useState(true);

  const g = 9.8;
  const tGround = Math.sqrt((2 * h0) / g);
  const range = vx * tGround;

  const animRef = useRef<number>(0);
  const startRef = useRef(performance.now());
  const [time, setTime] = useState(0);

  const margin = 60;
  const groundY = H - margin;
  const cliffX = 120;
  const scaleX = Math.min((W - cliffX - margin) / Math.max(range, 1), 8);
  const scaleY = (groundY - margin) / Math.max(h0, 1);

  const toScreen = (x: number, y: number) => ({
    x: cliffX + x * scaleX,
    y: groundY - y * scaleY,
  });

  useEffect(() => {
    startRef.current = performance.now();
    setTime(0);
  }, [h0, vx]);

  useEffect(() => {
    if (!playing) return;
    function loop(now: number) {
      const elapsed = (now - startRef.current) / 1000;
      const t = elapsed % (tGround + 1.5);
      setTime(Math.min(t, tGround));
      animRef.current = requestAnimationFrame(loop);
    }
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [playing, tGround]);

  // Current position
  const cx = vx * time;
  const cy = h0 - 0.5 * g * time * time;
  const pos = toScreen(cx, Math.max(0, cy));

  // Current velocity
  const curVy = -g * time;
  const curSpeed = Math.sqrt(vx * vx + curVy * curVy);
  const impactAngle = Math.atan2(Math.abs(curVy), vx) * 180 / Math.PI;

  // Trajectory
  const trajSteps = 60;
  const trajPts = Array.from({ length: trajSteps + 1 }).map((_, i) => {
    const t = (i / trajSteps) * tGround;
    return toScreen(vx * t, Math.max(0, h0 - 0.5 * g * t * t));
  });
  const trajD = trajPts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  const cliffTop = toScreen(0, h0);
  const landingPt = toScreen(range, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#060e1a] shadow-2xl">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ aspectRatio: `${W}/${H}` }}>
          <defs>
            <filter id="pfh-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Ground */}
          <line x1={20} y1={groundY} x2={W - 20} y2={groundY} stroke="#334155" strokeWidth={1.5} />

          {/* Cliff */}
          <rect x={40} y={cliffTop.y} width={cliffX - 40} height={groundY - cliffTop.y}
            fill="#1e293b" stroke="#334155" strokeWidth={1} />
          <text x={(40 + cliffX) / 2} y={(cliffTop.y + groundY) / 2 + 4}
            fill="#475569" fontSize="10" fontWeight="600" textAnchor="middle">
            h = {h0}m
          </text>

          {/* Trajectory */}
          <path d={trajD} fill="none" stroke="#6366f1" strokeWidth={2} opacity={0.4} />

          {/* Height drop reference */}
          <line x1={cliffX - 5} y1={cliffTop.y} x2={cliffX - 5} y2={groundY}
            stroke="#f59e0b" strokeWidth={1} strokeDasharray="3 2" opacity={0.3} />

          {/* Range */}
          {range > 0.5 && landingPt.x < W - 20 && (
            <>
              <line x1={cliffX} y1={groundY + 14} x2={landingPt.x} y2={groundY + 14}
                stroke="#22d3ee" strokeWidth={1.5} />
              <text x={(cliffX + landingPt.x) / 2} y={groundY + 28}
                fill="#22d3ee" fontSize="10" fontWeight="600" textAnchor="middle">R = {range.toFixed(1)}m</text>
            </>
          )}

          {/* Velocity arrows */}
          {/* Vx (horizontal, constant) */}
          <line x1={pos.x} y1={pos.y - 20} x2={pos.x + vx * 2.5} y2={pos.y - 20}
            stroke="#22d3ee" strokeWidth={2} strokeLinecap="round" filter="url(#pfh-glow)" />
          <text x={pos.x + vx * 1.2} y={pos.y - 28} fill="#22d3ee" fontSize="8" fontWeight="600" textAnchor="middle">
            vx = {vx.toFixed(0)}
          </text>

          {/* Vy (vertical, growing) */}
          {Math.abs(curVy) > 0.5 && (
            <>
              <line x1={pos.x - 18} y1={pos.y} x2={pos.x - 18} y2={pos.y - curVy * 2}
                stroke="#ef4444" strokeWidth={2} strokeLinecap="round" filter="url(#pfh-glow)" />
              <text x={pos.x - 28} y={pos.y - curVy} fill="#ef4444" fontSize="8" fontWeight="600" textAnchor="end">
                vy = {curVy.toFixed(1)}
              </text>
            </>
          )}

          {/* Gravity arrow */}
          <line x1={pos.x + 15} y1={pos.y + 8} x2={pos.x + 15} y2={pos.y + 28}
            stroke="#f59e0b" strokeWidth={1.5} filter="url(#pfh-glow)" />
          <polygon points={`${pos.x + 15},${pos.y + 28} ${pos.x + 12},${pos.y + 23} ${pos.x + 18},${pos.y + 23}`}
            fill="#f59e0b" />

          {/* Particle */}
          <circle cx={pos.x} cy={pos.y} r={14} fill="#6366f1" opacity={0.1} />
          <circle cx={pos.x} cy={pos.y} r={6} fill="#a78bfa" stroke="#6366f1" strokeWidth={2} />

          <text x={W - 16} y={20} fill="#64748b" fontSize="10" textAnchor="end">t = {time.toFixed(1)} s</text>
        </svg>
      </div>

      <div className="space-y-4">
        <p className="text-base text-slate-300 leading-relaxed">
          <span className="text-indigo-400 font-semibold">Horizontal Projectile</span> —
          thrown horizontally from height <span className="text-amber-400">h</span>.
          <span className="text-cyan-400"> vx</span> stays constant,
          <span className="text-red-400"> vy</span> grows under gravity.
        </p>

        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Height h (m)</label>
          <input type="range" min={10} max={80} step={1} value={h0}
            onChange={(e) => setH0(Number(e.target.value))} className="w-full accent-amber-500" />
          <div className="flex justify-between text-xs text-slate-500">
            <span>10</span><span className="text-amber-400 font-semibold">{h0}m</span><span>80</span>
          </div>
        </div>
        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Horizontal Speed vx (m/s)</label>
          <input type="range" min={2} max={25} step={1} value={vx}
            onChange={(e) => setVx(Number(e.target.value))} className="w-full accent-cyan-500" />
          <div className="flex justify-between text-xs text-slate-500">
            <span>2</span><span className="text-cyan-400 font-semibold">{vx} m/s</span><span>25</span>
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
            <span className="text-slate-400">Time to ground</span>
            <span className="text-amber-400 font-bold tabular-nums">{tGround.toFixed(2)} s</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Range</span>
            <span className="text-cyan-400 font-bold tabular-nums">{range.toFixed(1)} m</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Impact speed</span>
            <span className="text-red-400 font-bold tabular-nums">{curSpeed.toFixed(1)} m/s</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Impact angle</span>
            <span className="text-violet-400 font-bold tabular-nums">{impactAngle.toFixed(1)}° below horiz.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
