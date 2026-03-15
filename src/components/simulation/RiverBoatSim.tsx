"use client";

import { useState, useRef, useEffect } from "react";

/**
 * River-Boat Problem — 2D relative motion.
 * Boat crosses river with current; shows shortest time vs shortest path.
 */
export default function RiverBoatSim() {
  const W = 700, H = 420;
  const [vBoat, setVBoat] = useState(5);
  const [vRiver, setVRiver] = useState(3);
  const [angle, setAngle] = useState(90);
  const [playing, setPlaying] = useState(true);

  const animRef = useRef<number>(0);
  const startRef = useRef(performance.now());
  const [time, setTime] = useState(0);

  const rad = (angle * Math.PI) / 180;
  const vBx = vBoat * Math.cos(rad);
  const vBy = vBoat * Math.sin(rad);
  const vNetX = vBx + vRiver;
  const vNetY = vBy;

  const riverW = 20; // meters
  const tCross = vBy > 0.01 ? riverW / vBy : 999;
  const drift = vNetX * tCross;

  const scale = 16;
  const riverLeft = 100;
  const riverRight = riverLeft + riverW * scale;
  const riverTop = 40;
  const riverBottom = H - 50;
  const bankLen = riverBottom - riverTop;

  const startX = riverLeft;
  const startY = riverBottom - 40;

  useEffect(() => {
    startRef.current = performance.now();
    setTime(0);
  }, [vBoat, vRiver, angle]);

  useEffect(() => {
    if (!playing) return;
    function loop(now: number) {
      const elapsed = (now - startRef.current) / 1000;
      const t = elapsed % (tCross + 2);
      setTime(Math.min(t, tCross));
      animRef.current = requestAnimationFrame(loop);
    }
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [playing, tCross]);

  const boatX = startX + vNetX * time * scale;
  const boatY = startY - vNetY * time * scale;

  // Trajectory for full crossing
  const trajSteps = 50;
  const trajPts = Array.from({ length: trajSteps + 1 }).map((_, i) => {
    const t = (i / trajSteps) * tCross;
    return {
      x: startX + vNetX * t * scale,
      y: startY - vNetY * t * scale,
    };
  });
  const trajD = trajPts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  const arrowScale = 5;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#060e1a] shadow-2xl">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ aspectRatio: `${W}/${H}` }}>
          <defs>
            <filter id="rb-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <linearGradient id="river-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0369a1" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* River */}
          <rect x={riverLeft} y={riverTop} width={riverW * scale} height={bankLen}
            fill="url(#river-grad)" />
          <line x1={riverLeft} y1={riverTop} x2={riverLeft} y2={riverBottom} stroke="#0ea5e9" strokeWidth={2} opacity={0.5} />
          <line x1={riverRight} y1={riverTop} x2={riverRight} y2={riverBottom} stroke="#0ea5e9" strokeWidth={2} opacity={0.5} />

          {/* River flow arrows */}
          {Array.from({ length: 4 }).map((_, i) => {
            const y = riverTop + 40 + i * 70;
            return (
              <g key={i}>
                <line x1={riverLeft + 20} y1={y} x2={riverLeft + 50} y2={y}
                  stroke="#0ea5e9" strokeWidth={1} opacity={0.3} />
                <polygon points={`${riverLeft + 50},${y} ${riverLeft + 44},${y - 3} ${riverLeft + 44},${y + 3}`}
                  fill="#0ea5e9" opacity={0.3} />
              </g>
            );
          })}

          {/* Bank labels */}
          <text x={riverLeft - 10} y={H / 2} fill="#94a3b8" fontSize="10" fontWeight="600" textAnchor="end">Start</text>
          <text x={riverRight + 10} y={H / 2} fill="#94a3b8" fontSize="10" fontWeight="600">End</text>

          {/* Width label */}
          <text x={(riverLeft + riverRight) / 2} y={riverTop - 8} fill="#0ea5e9" fontSize="10" fontWeight="600" textAnchor="middle">
            d = {riverW} m
          </text>

          {/* Current label */}
          <text x={(riverLeft + riverRight) / 2} y={riverBottom + 18} fill="#0ea5e9" fontSize="9" textAnchor="middle" opacity={0.6}>
            v_river = {vRiver.toFixed(1)} m/s →
          </text>

          {/* Trajectory */}
          <path d={trajD} fill="none" stroke="#6366f1" strokeWidth={1.5} opacity={0.4} strokeDasharray="4 3" />

          {/* Velocity arrows on boat */}
          {/* v_boat (angle) */}
          <line x1={boatX} y1={boatY} x2={boatX + vBx * arrowScale} y2={boatY - vBy * arrowScale}
            stroke="#22c55e" strokeWidth={2} strokeLinecap="round" filter="url(#rb-glow)" />
          <text x={boatX + vBx * arrowScale + 8} y={boatY - vBy * arrowScale}
            fill="#22c55e" fontSize="8" fontWeight="600">v_b</text>

          {/* v_river (horizontal) */}
          <line x1={boatX} y1={boatY} x2={boatX + vRiver * arrowScale} y2={boatY}
            stroke="#0ea5e9" strokeWidth={2} strokeLinecap="round" filter="url(#rb-glow)" />

          {/* v_net (resultant) */}
          <line x1={boatX} y1={boatY} x2={boatX + vNetX * arrowScale} y2={boatY - vNetY * arrowScale}
            stroke="#f59e0b" strokeWidth={2.5} strokeLinecap="round" filter="url(#rb-glow)" />
          <text x={boatX + vNetX * arrowScale + 8} y={boatY - vNetY * arrowScale}
            fill="#f59e0b" fontSize="8" fontWeight="600">v_net</text>

          {/* Boat */}
          <circle cx={boatX} cy={boatY} r={14} fill="#6366f1" opacity={0.1} />
          <circle cx={boatX} cy={boatY} r={6} fill="#a78bfa" stroke="#6366f1" strokeWidth={2} />

          {/* Drift marker */}
          {Math.abs(drift) > 0.5 && (
            <>
              <line x1={riverRight} y1={startY} x2={riverRight} y2={startY - riverW * scale * (vNetY > 0.01 ? 1 : 0)}
                stroke="#f59e0b" strokeWidth={1} strokeDasharray="3 2" opacity={0.3} />
              <text x={riverRight + 8} y={startY - riverW * scale / 2}
                fill="#f59e0b" fontSize="9" fontWeight="500" opacity={0.6}>
                drift = {drift.toFixed(1)}m
              </text>
            </>
          )}

          <text x={W - 16} y={20} fill="#64748b" fontSize="10" textAnchor="end">t = {time.toFixed(1)} s</text>
        </svg>
      </div>

      <div className="space-y-4">
        <p className="text-base text-slate-300 leading-relaxed">
          <span className="text-sky-400 font-semibold">River-Boat Problem</span>:
          the boat aims at angle <span className="text-green-400">θ</span> but river current
          causes <span className="text-amber-400">drift</span>.
        </p>

        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Boat Speed (m/s)</label>
          <input type="range" min={2} max={10} step={0.5} value={vBoat}
            onChange={(e) => setVBoat(Number(e.target.value))} className="w-full accent-green-500" />
          <div className="flex justify-between text-xs text-slate-500">
            <span>2</span><span className="text-green-400 font-semibold">{vBoat.toFixed(1)} m/s</span><span>10</span>
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">River Current (m/s)</label>
          <input type="range" min={0} max={8} step={0.5} value={vRiver}
            onChange={(e) => setVRiver(Number(e.target.value))} className="w-full accent-sky-500" />
          <div className="flex justify-between text-xs text-slate-500">
            <span>0</span><span className="text-sky-400 font-semibold">{vRiver.toFixed(1)} m/s</span><span>8</span>
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Boat Angle (°)</label>
          <input type="range" min={10} max={170} step={1} value={angle}
            onChange={(e) => setAngle(Number(e.target.value))} className="w-full accent-amber-500" />
          <div className="flex justify-between text-xs text-slate-500">
            <span>10°</span><span className="text-amber-400 font-semibold">{angle}°</span><span>170°</span>
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
            <span className="text-slate-400">Crossing Time</span>
            <span className="text-cyan-400 font-bold tabular-nums">{tCross < 100 ? tCross.toFixed(2) : "∞"} s</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Drift</span>
            <span className="text-amber-400 font-bold tabular-nums">{drift < 1000 ? drift.toFixed(1) : "∞"} m</span>
          </div>
        </div>

        <div className="rounded-xl bg-sky-500/10 border border-sky-500/20 p-3">
          <p className="text-xs text-sky-400/70 font-bold uppercase tracking-wider mb-1">💡 JEE Tip</p>
          <p className="text-sm text-slate-300 leading-relaxed">
            <span className="text-white font-semibold">90°</span> → shortest crossing time.
            <span className="text-white font-semibold"> θ = sin⁻¹(v_r/v_b)</span> upstream → zero drift (if v_b &gt; v_r).
          </p>
        </div>
      </div>
    </div>
  );
}
