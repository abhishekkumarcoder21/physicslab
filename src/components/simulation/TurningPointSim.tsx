"use client";

import { useState, useRef, useEffect, useCallback } from "react";

/**
 * Turning Point — 1D motion with initial velocity + acceleration.
 * The particle reverses direction when velocity = 0.
 * Visually highlights the turning point.
 */
export default function TurningPointSim() {
  const W = 700, H = 320;
  const [initVel, setInitVel] = useState(6);
  const [accel, setAccel] = useState(-2);
  const [playing, setPlaying] = useState(true);

  const animRef = useRef<number>(0);
  const startRef = useRef(performance.now());
  const [time, setTime] = useState(0);
  const [trail, setTrail] = useState<{ x: number; t: number }[]>([]);

  // Physics
  const turningTime = accel !== 0 ? -initVel / accel : Infinity;
  const hasTurning = turningTime > 0 && turningTime < 15;

  // Position: x(t) = x0 + v0*t + 0.5*a*t²
  const x0 = 100; // pixel start position
  const scale = 35; // pixels per metre
  const posAt = (t: number) => x0 + (initVel * t + 0.5 * accel * t * t) * scale;
  const velAt = (t: number) => initVel + accel * t;

  // Reset on parameter change
  useEffect(() => {
    startRef.current = performance.now();
    setTime(0);
    setTrail([]);
  }, [initVel, accel]);

  // Animation loop
  useEffect(() => {
    if (!playing) return;
    function loop(now: number) {
      const t = (now - startRef.current) / 1000;
      if (t > 12) {
        startRef.current = now;
        setTrail([]);
      }
      const px = posAt(t);
      if (px > 20 && px < W - 20) {
        setTime(t);
        setTrail((prev) => {
          const next = [...prev, { x: px, t }];
          return next.length > 300 ? next.slice(-300) : next;
        });
      } else if (t > 0.5) {
        // Reset when out of bounds
        startRef.current = now;
        setTrail([]);
      }
      animRef.current = requestAnimationFrame(loop);
    }
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [playing, initVel, accel]);

  const currentX = posAt(time);
  const currentV = velAt(time);
  const turningX = hasTurning ? posAt(turningTime) : 0;
  const pastTurning = hasTurning && time >= turningTime;

  // Y position on the line
  const lineY = H / 2 + 20;

  const handleReset = useCallback(() => {
    startRef.current = performance.now();
    setTime(0);
    setTrail([]);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">
      {/* Canvas */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#060e1a] shadow-2xl">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ aspectRatio: `${W}/${H}` }}>
          <defs>
            <filter id="tp-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Number line */}
          <line x1={30} y1={lineY} x2={W - 30} y2={lineY} stroke="#334155" strokeWidth={1.5} />
          {Array.from({ length: 14 }).map((_, i) => {
            const px = 50 + i * 46;
            return (
              <g key={i}>
                <line x1={px} y1={lineY - 5} x2={px} y2={lineY + 5} stroke="#475569" strokeWidth={1} />
                <text x={px} y={lineY + 18} fill="#475569" fontSize="9" textAnchor="middle">
                  {((px - x0) / scale).toFixed(0)}
                </text>
              </g>
            );
          })}
          <text x={W - 24} y={lineY + 18} fill="#64748b" fontSize="10" fontWeight="500">m</text>

          {/* Trail */}
          {trail.length > 1 && trail.map((pt, i) => (
            <circle key={i} cx={pt.x} cy={lineY} r={1}
              fill={velAt(pt.t) >= 0 ? "#6366f1" : "#f87171"} opacity={0.25 + (i / trail.length) * 0.3} />
          ))}

          {/* Turning point marker */}
          {hasTurning && turningX > 30 && turningX < W - 30 && (
            <>
              {/* Glow ring */}
              <circle cx={turningX} cy={lineY} r={20} fill="none"
                stroke="#f59e0b" strokeWidth={2} opacity={pastTurning ? 0.8 : 0.2}
                strokeDasharray={pastTurning ? "none" : "4 3"}
                filter={pastTurning ? "url(#tp-glow)" : undefined} />
              <circle cx={turningX} cy={lineY} r={30} fill="#f59e0b" opacity={pastTurning ? 0.06 : 0.02} />
              <text x={turningX} y={lineY - 30} fill="#f59e0b" fontSize="11" fontWeight="700" textAnchor="middle"
                opacity={pastTurning ? 1 : 0.4}>
                TURNING POINT
              </text>
              <text x={turningX} y={lineY - 18} fill="#f59e0b" fontSize="9" fontWeight="500" textAnchor="middle"
                opacity={pastTurning ? 0.7 : 0.3}>
                v = 0 at t = {turningTime.toFixed(1)}s
              </text>
            </>
          )}

          {/* Velocity arrow */}
          {Math.abs(currentV) > 0.2 && currentX > 40 && currentX < W - 40 && (
            <>
              <line
                x1={currentX} y1={lineY - 40}
                x2={currentX + currentV * 12} y2={lineY - 40}
                stroke={currentV >= 0 ? "#22d3ee" : "#f87171"}
                strokeWidth={2.5} strokeLinecap="round"
                filter="url(#tp-glow)" />
              {/* Arrowhead */}
              <polygon
                points={`${currentX + currentV * 12},${lineY - 40} ${currentX + currentV * 12 - (currentV > 0 ? 8 : -8)},${lineY - 45} ${currentX + currentV * 12 - (currentV > 0 ? 8 : -8)},${lineY - 35}`}
                fill={currentV >= 0 ? "#22d3ee" : "#f87171"}
                filter="url(#tp-glow)" />
              <text x={currentX + currentV * 6} y={lineY - 50}
                fill={currentV >= 0 ? "#22d3ee" : "#f87171"} fontSize="10" fontWeight="700" textAnchor="middle">
                v = {currentV.toFixed(1)} m/s
              </text>
            </>
          )}

          {/* Particle */}
          <circle cx={Math.max(30, Math.min(W - 30, currentX))} cy={lineY} r={14}
            fill={currentV >= 0 ? "#6366f1" : "#f87171"} opacity={0.12} />
          <circle cx={Math.max(30, Math.min(W - 30, currentX))} cy={lineY} r={6}
            fill={currentV >= 0 ? "#a78bfa" : "#fb7185"} stroke={currentV >= 0 ? "#6366f1" : "#f87171"} strokeWidth={2} />

          {/* Start marker */}
          <circle cx={x0} cy={lineY} r={4} fill="#64748b" />
          <text x={x0} y={lineY + 28} fill="#64748b" fontSize="9" fontWeight="500" textAnchor="middle">START</text>

          {/* Time */}
          <text x={20} y={24} fill="#64748b" fontSize="11" fontWeight="500">t = {time.toFixed(1)} s</text>
        </svg>
      </div>

      {/* Controls */}
      <div className="space-y-5">
        <p className="text-base text-slate-300 leading-relaxed">
          A <span className="text-amber-400 font-semibold">turning point</span> occurs when
          velocity becomes <strong className="text-white">zero</strong> and the particle
          <span className="text-red-400 font-semibold"> reverses direction</span>.
        </p>

        {/* Initial velocity */}
        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
            Initial Velocity (m/s)
          </label>
          <input type="range" min={1} max={10} step={0.5} value={initVel}
            onChange={(e) => setInitVel(Number(e.target.value))}
            className="w-full accent-indigo-500" />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>1</span>
            <span className="text-indigo-400 font-semibold">+{initVel.toFixed(1)} m/s</span>
            <span>10</span>
          </div>
        </div>

        {/* Acceleration */}
        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
            Acceleration (m/s²)
          </label>
          <input type="range" min={-5} max={-0.5} step={0.25} value={accel}
            onChange={(e) => setAccel(Number(e.target.value))}
            className="w-full accent-red-500" />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>−5</span>
            <span className="text-red-400 font-semibold">{accel.toFixed(1)} m/s²</span>
            <span>−0.5</span>
          </div>
        </div>

        {/* Play/Reset */}
        <div className="flex gap-2">
          <button onClick={() => setPlaying(!playing)}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              playing ? "bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/50"
                      : "bg-white/5 text-slate-400 border border-white/10"
            }`}>
            {playing ? "⏸ Pause" : "▶ Play"}
          </button>
          <button onClick={handleReset}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-sm font-medium hover:bg-white/10 transition-all">
            ↺
          </button>
        </div>

        {/* Readout */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Velocity</span>
            <span className={`font-bold tabular-nums ${currentV >= 0 ? "text-cyan-400" : "text-red-400"}`}>
              {currentV.toFixed(1)} m/s
            </span>
          </div>
          {hasTurning && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Turns at</span>
              <span className="text-amber-400 font-bold tabular-nums">t = {turningTime.toFixed(1)} s</span>
            </div>
          )}
        </div>

        <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
          <p className="text-xs text-amber-400/70 font-bold uppercase tracking-wider mb-1">💡 Key Insight</p>
          <p className="text-sm text-slate-300 leading-relaxed">
            At the turning point: <span className="text-white font-mono">v = v₀ + at = 0</span>.
            The particle decelerates, stops momentarily, then reverses.
            {hasTurning && (
              <span className="text-amber-400"> Here, the turning point is at t = {turningTime.toFixed(1)}s.</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
