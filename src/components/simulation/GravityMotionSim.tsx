"use client";

import { useState, useRef, useEffect, useCallback } from "react";

/**
 * Motion Under Gravity — free fall, upward throw, downward throw.
 * Configurable g, initial velocity, height. Shows real-time height + velocity.
 */
export default function GravityMotionSim() {
  const W = 700, H = 450;
  const [v0, setV0] = useState(15);
  const [gVal, setGVal] = useState(9.8);
  const [h0, setH0] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [mode, setMode] = useState<"up" | "down" | "free">("up");

  const animRef = useRef<number>(0);
  const startRef = useRef(performance.now());
  const [time, setTime] = useState(0);
  const [trail, setTrail] = useState<number[]>([]);

  // Physics
  const initV = mode === "up" ? v0 : mode === "down" ? -v0 : 0;
  const initH = mode === "free" ? 60 : mode === "down" ? 60 : h0;
  const heightAt = (t: number) => initH + initV * t - 0.5 * gVal * t * t;
  const velAt = (t: number) => initV - gVal * t;

  // Time to ground
  const disc = initV * initV + 2 * gVal * initH;
  const tGround = disc >= 0 ? (initV + Math.sqrt(disc)) / gVal : 5;
  const maxH = mode === "up" ? initH + (initV * initV) / (2 * gVal) : initH;

  // Canvas scaling
  const margin = 60;
  const groundY = H - margin;
  const maxDisplay = Math.max(maxH, initH, 10) * 1.2;
  const yScale = (groundY - margin) / maxDisplay;
  const toY = (h: number) => groundY - h * yScale;

  // Column x position
  const colX = W / 2;

  useEffect(() => {
    startRef.current = performance.now();
    setTime(0);
    setTrail([]);
  }, [v0, gVal, h0, mode]);

  useEffect(() => {
    if (!playing) return;
    function loop(now: number) {
      const elapsed = (now - startRef.current) / 1000;
      const t = elapsed % (tGround + 2);
      const tClamped = Math.min(t, tGround);
      setTime(tClamped);
      const curH = heightAt(tClamped);
      if (curH >= 0) {
        setTrail(prev => {
          const next = [...prev, curH];
          return next.length > 200 ? next.slice(-200) : next;
        });
      }
      if (t > tGround + 1.5) {
        startRef.current = now;
        setTrail([]);
      }
      animRef.current = requestAnimationFrame(loop);
    }
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [playing, tGround, initV, initH, gVal, mode]);

  const currentH = Math.max(0, heightAt(time));
  const currentV = velAt(time);
  const ballY = toY(currentH);

  // Velocity arrow
  const vArrowScale = 2.5;
  const vArrowEnd = ballY + currentV * vArrowScale; // positive V goes up, so subtract

  const handleReset = useCallback(() => {
    startRef.current = performance.now();
    setTime(0);
    setTrail([]);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#060e1a] shadow-2xl">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ aspectRatio: `${W}/${H}` }}>
          <defs>
            <filter id="grav-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <linearGradient id="grav-bg" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#060e1a" />
            </linearGradient>
          </defs>

          <rect width={W} height={H} fill="url(#grav-bg)" />

          {/* Ground */}
          <line x1={20} y1={groundY} x2={W - 20} y2={groundY} stroke="#334155" strokeWidth={2} />
          <text x={W - 24} y={groundY + 16} fill="#475569" fontSize="9" fontWeight="500">ground</text>

          {/* Height scale */}
          {Array.from({ length: 6 }).map((_, i) => {
            const hVal = (maxDisplay / 5) * i;
            const py = toY(hVal);
            return py > margin - 10 ? (
              <g key={i}>
                <line x1={colX - 80} y1={py} x2={colX - 70} y2={py} stroke="#334155" strokeWidth={0.5} />
                <text x={colX - 85} y={py + 3} fill="#475569" fontSize="8" textAnchor="end">
                  {hVal.toFixed(0)}m
                </text>
              </g>
            ) : null;
          })}

          {/* Trail (ghost positions) */}
          {trail.map((h, i) => (
            <circle key={i} cx={colX} cy={toY(h)} r={1.5}
              fill="#6366f1" opacity={0.08 + (i / trail.length) * 0.15} />
          ))}

          {/* Max height marker */}
          {mode === "up" && maxH > 1 && (
            <>
              <line x1={colX - 40} y1={toY(maxH)} x2={colX + 40} y2={toY(maxH)}
                stroke="#f59e0b" strokeWidth={1} strokeDasharray="4 3" opacity={0.4} />
              <text x={colX + 46} y={toY(maxH) + 4} fill="#f59e0b" fontSize="9" fontWeight="600">
                H_max = {maxH.toFixed(1)}m
              </text>
            </>
          )}

          {/* Gravity arrow (always down) */}
          <line x1={colX + 30} y1={ballY + 10} x2={colX + 30} y2={ballY + 40}
            stroke="#f59e0b" strokeWidth={2} strokeLinecap="round" filter="url(#grav-glow)" />
          <polygon points={`${colX + 30},${ballY + 40} ${colX + 26},${ballY + 34} ${colX + 34},${ballY + 34}`}
            fill="#f59e0b" filter="url(#grav-glow)" />
          <text x={colX + 42} y={ballY + 32} fill="#f59e0b" fontSize="9" fontWeight="600">g = {gVal.toFixed(1)}</text>

          {/* Velocity arrow */}
          {Math.abs(currentV) > 0.3 && currentH > 0.1 && (
            <>
              <line x1={colX - 25} y1={ballY} x2={colX - 25} y2={ballY + currentV * vArrowScale}
                stroke={currentV > 0 ? "#22d3ee" : "#ef4444"} strokeWidth={2.5} strokeLinecap="round" filter="url(#grav-glow)" />
              <polygon
                points={`${colX - 25},${ballY + currentV * vArrowScale} ${colX - 29},${ballY + currentV * vArrowScale + (currentV > 0 ? -6 : 6)} ${colX - 21},${ballY + currentV * vArrowScale + (currentV > 0 ? -6 : 6)}`}
                fill={currentV > 0 ? "#22d3ee" : "#ef4444"} filter="url(#grav-glow)" />
              <text x={colX - 40} y={ballY + currentV * vArrowScale / 2}
                fill={currentV > 0 ? "#22d3ee" : "#ef4444"} fontSize="9" fontWeight="700" textAnchor="end">
                v = {currentV.toFixed(1)}
              </text>
            </>
          )}

          {/* Ball */}
          <circle cx={colX} cy={ballY} r={18} fill="#6366f1" opacity={0.1} />
          <circle cx={colX} cy={ballY} r={8} fill="#a78bfa" stroke="#6366f1" strokeWidth={2.5} />

          {/* Height readout */}
          <text x={colX + 60} y={ballY + 4} fill="#94a3b8" fontSize="11" fontWeight="600">
            h = {currentH.toFixed(1)} m
          </text>

          <text x={20} y={24} fill="#64748b" fontSize="10" fontWeight="500">t = {time.toFixed(1)} s</text>
        </svg>
      </div>

      <div className="space-y-5">
        <p className="text-base text-slate-300 leading-relaxed">
          <span className="text-violet-400 font-semibold">Motion Under Gravity</span> —
          every object near Earth accelerates at <span className="text-amber-400 font-mono">g ≈ 9.8 m/s²</span> downward.
        </p>

        {/* Mode selector */}
        <div className="flex gap-1.5">
          {([["up", "⬆ Throw Up"], ["free", "⬇ Free Fall"], ["down", "⬇ Throw Down"]] as const).map(([m, label]) => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex-1 px-2 py-2 rounded-xl text-xs font-semibold transition-all ${
                mode === m ? "bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/50"
                           : "bg-white/5 text-slate-400 border border-white/10"}`}>
              {label}
            </button>
          ))}
        </div>

        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
            {mode === "free" ? "Drop Height (m)" : "Initial Speed (m/s)"}
          </label>
          <input type="range" min={mode === "free" ? 10 : 2} max={mode === "free" ? 80 : 30} step={1}
            value={mode === "free" ? h0 || 60 : v0}
            onChange={(e) => mode === "free" ? setH0(Number(e.target.value)) : setV0(Number(e.target.value))}
            className="w-full accent-cyan-500" />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>{mode === "free" ? "10m" : "2"}</span>
            <span className="text-cyan-400 font-semibold">{mode === "free" ? `${h0 || 60}m` : `${v0} m/s`}</span>
            <span>{mode === "free" ? "80m" : "30"}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Gravity (m/s²)</label>
          <input type="range" min={1} max={20} step={0.5} value={gVal}
            onChange={(e) => setGVal(Number(e.target.value))} className="w-full accent-amber-500" />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>1</span>
            <span className="text-amber-400 font-semibold">{gVal.toFixed(1)} m/s²</span>
            <span>20</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setPlaying(!playing)}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              playing ? "bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/50"
                      : "bg-white/5 text-slate-400 border border-white/10"}`}>
            {playing ? "⏸ Pause" : "▶ Play"}
          </button>
          <button onClick={handleReset}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-sm hover:bg-white/10 transition-all">↺</button>
        </div>

        {/* Readout */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Height</span>
            <span className="text-indigo-400 font-bold tabular-nums">{currentH.toFixed(1)} m</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Velocity</span>
            <span className={`font-bold tabular-nums ${currentV > 0 ? "text-cyan-400" : "text-red-400"}`}>
              {currentV.toFixed(1)} m/s
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Time to ground</span>
            <span className="text-amber-400 font-bold tabular-nums">{tGround.toFixed(2)} s</span>
          </div>
        </div>

        <div className="rounded-xl bg-violet-500/10 border border-violet-500/20 p-4">
          <p className="text-xs text-violet-400/70 font-bold uppercase tracking-wider mb-1">💡 Key Insight</p>
          <p className="text-sm text-slate-300 leading-relaxed">
            {mode === "up"
              ? "Thrown upward: velocity decreases, reaches zero at max height, then free falls."
              : mode === "free"
              ? "Free fall: starts from rest, velocity increases linearly — v = gt."
              : "Thrown down: initial downward velocity plus gravity → hits ground faster."}
            {" "}Try changing g to simulate the Moon (1.6) or Jupiter (24.8)!
          </p>
        </div>
      </div>
    </div>
  );
}
