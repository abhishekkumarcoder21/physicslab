"use client";

import { useState, useRef, useEffect, useCallback } from "react";

/**
 * Speed vs Velocity — interactive SVG canvas.
 * Sliders for magnitude & direction angle.
 * Shows moving particle with velocity vector arrow.
 */
export default function SpeedVelocitySim() {
  const [magnitude, setMagnitude] = useState(4);
  const [angleDeg, setAngleDeg] = useState(30);
  const svgRef = useRef<SVGSVGElement>(null);
  const animRef = useRef<number>(0);
  const posRef = useRef({ x: 350, y: 250 });
  const [pos, setPos] = useState({ x: 350, y: 250 });
  const [trail, setTrail] = useState<{ x: number; y: number }[]>([]);

  const W = 700;
  const H = 420;

  const angleRad = (angleDeg * Math.PI) / 180;
  const vx = magnitude * Math.cos(angleRad);
  const vy = -magnitude * Math.sin(angleRad); // SVG y-axis is inverted

  // Animation loop
  useEffect(() => {
    let lastTime = performance.now();

    function loop(now: number) {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const p = posRef.current;
      let nx = p.x + vx * dt * 30;
      let ny = p.y + vy * dt * 30;

      // Wrap around
      if (nx > W + 20) nx = -20;
      if (nx < -20) nx = W + 20;
      if (ny > H + 20) ny = -20;
      if (ny < -20) ny = H + 20;

      posRef.current = { x: nx, y: ny };
      setPos({ x: nx, y: ny });
      setTrail((prev) => {
        const next = [...prev, { x: nx, y: ny }];
        return next.length > 80 ? next.slice(-80) : next;
      });

      animRef.current = requestAnimationFrame(loop);
    }
    animRef.current = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animRef.current);
  }, [vx, vy]);

  // Reset on magnitude/angle change
  const reset = useCallback(() => {
    posRef.current = { x: 350, y: 250 };
    setPos({ x: 350, y: 250 });
    setTrail([]);
  }, []);

  const arrowScale = 12;
  const arrowEndX = pos.x + vx * arrowScale;
  const arrowEndY = pos.y + vy * arrowScale;

  // Arrowhead
  const headLen = 10;
  const headAngle = Math.atan2(arrowEndY - pos.y, arrowEndX - pos.x);
  const hlX = arrowEndX - headLen * Math.cos(headAngle - Math.PI / 6);
  const hlY = arrowEndY - headLen * Math.sin(headAngle - Math.PI / 6);
  const hrX = arrowEndX - headLen * Math.cos(headAngle + Math.PI / 6);
  const hrY = arrowEndY - headLen * Math.sin(headAngle + Math.PI / 6);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
      {/* Canvas */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#060e1a] shadow-2xl">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ aspectRatio: `${W}/${H}` }}
        >
          {/* Subtle grid */}
          {Array.from({ length: 14 }).map((_, i) => (
            <line
              key={`gx${i}`}
              x1={(i + 1) * 50}
              y1={0}
              x2={(i + 1) * 50}
              y2={H}
              stroke="#1e293b"
              strokeWidth={0.5}
            />
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <line
              key={`gy${i}`}
              x1={0}
              y1={(i + 1) * 50}
              x2={W}
              y2={(i + 1) * 50}
              stroke="#1e293b"
              strokeWidth={0.5}
            />
          ))}

          {/* Trail */}
          {trail.length > 1 && (
            <polyline
              points={trail.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke="#6366f1"
              strokeWidth={1.5}
              opacity={0.4}
            />
          )}

          {/* Glow filter */}
          <defs>
            <filter id="vel-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Velocity arrow */}
          <line
            x1={pos.x}
            y1={pos.y}
            x2={arrowEndX}
            y2={arrowEndY}
            stroke="#22d3ee"
            strokeWidth={2.5}
            strokeLinecap="round"
            filter="url(#vel-glow)"
          />
          <polygon
            points={`${arrowEndX},${arrowEndY} ${hlX},${hlY} ${hrX},${hrY}`}
            fill="#22d3ee"
            filter="url(#vel-glow)"
          />
          <text
            x={arrowEndX + 8}
            y={arrowEndY - 8}
            fill="#22d3ee"
            fontSize="12"
            fontWeight="700"
          >
            v⃗
          </text>

          {/* Particle */}
          <circle
            cx={pos.x}
            cy={pos.y}
            r={10}
            fill="#6366f1"
            opacity={0.2}
          />
          <circle cx={pos.x} cy={pos.y} r={5} fill="#a78bfa" />

          {/* Speed arc indicator */}
          <text x={16} y={28} fill="#64748b" fontSize="11" fontWeight="500">
            |v| = {magnitude.toFixed(1)} m/s &nbsp;&nbsp; θ = {angleDeg}°
          </text>
        </svg>
      </div>

      {/* Controls */}
      <div className="space-y-6">
        <p className="text-base text-slate-300 leading-relaxed">
          <span className="text-violet-400 font-semibold">Speed</span> is a{" "}
          <em>scalar</em> — it only tells you how fast.{" "}
          <span className="text-cyan-400 font-semibold">Velocity</span> is a{" "}
          <em>vector</em> — it tells you how fast <em>and in which direction</em>.
        </p>

        {/* Magnitude slider */}
        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
            Speed (magnitude)
          </label>
          <input
            type="range"
            min={0.5}
            max={10}
            step={0.1}
            value={magnitude}
            onChange={(e) => setMagnitude(Number(e.target.value))}
            className="w-full accent-violet-500"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>0.5 m/s</span>
            <span className="text-violet-400 font-semibold">
              {magnitude.toFixed(1)} m/s
            </span>
            <span>10 m/s</span>
          </div>
        </div>

        {/* Angle slider */}
        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
            Direction (angle)
          </label>
          <input
            type="range"
            min={0}
            max={360}
            step={1}
            value={angleDeg}
            onChange={(e) => setAngleDeg(Number(e.target.value))}
            className="w-full accent-cyan-500"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>0°</span>
            <span className="text-cyan-400 font-semibold">{angleDeg}°</span>
            <span>360°</span>
          </div>
        </div>

        {/* Readout card */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-2">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
            Velocity vector
          </p>
          <p className="text-lg font-bold text-white tabular-nums">
            v⃗ = ({vx.toFixed(1)}, {(-vy).toFixed(1)}) m/s
          </p>
          <p className="text-sm text-slate-400">
            Speed = |v⃗| ={" "}
            <span className="text-violet-400 font-semibold">
              {magnitude.toFixed(1)} m/s
            </span>
          </p>
        </div>

        <button
          onClick={reset}
          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-sm font-medium hover:bg-white/10 hover:text-white transition-all"
        >
          ↺ Reset Particle
        </button>
      </div>
    </div>
  );
}
