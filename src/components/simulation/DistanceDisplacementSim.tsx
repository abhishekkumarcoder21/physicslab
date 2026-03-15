"use client";

import { useRef, useState, useCallback } from "react";
import VectorArrow from "./VectorArrow";

interface Point {
  x: number;
  y: number;
}

/**
 * Distance vs Displacement — interactive canvas.
 * User clicks to add waypoints. Shows:
 * - path trail (total distance)
 * - straight glowing displacement vector
 * - live numeric readouts
 */
export default function DistanceDisplacementSim() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [points, setPoints] = useState<Point[]>([{ x: 100, y: 300 }]);
  const W = 700;
  const H = 420;

  const handleClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * W;
      const y = ((e.clientY - rect.top) / rect.height) * H;
      setPoints((prev) => [...prev, { x, y }]);
    },
    []
  );

  // Calculate distance (sum of path segments)
  const totalDistance = points.reduce((sum, pt, i) => {
    if (i === 0) return 0;
    const prev = points[i - 1];
    return sum + Math.sqrt((pt.x - prev.x) ** 2 + (pt.y - prev.y) ** 2);
  }, 0);

  // Displacement (start → end straight line)
  const start = points[0];
  const end = points[points.length - 1];
  const displacement = Math.sqrt(
    (end.x - start.x) ** 2 + (end.y - start.y) ** 2
  );

  // Build path string
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  const reset = () => setPoints([{ x: 100, y: 300 }]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
      {/* Canvas */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#060e1a] shadow-2xl">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full cursor-crosshair"
          onClick={handleClick}
          style={{ aspectRatio: `${W}/${H}` }}
        >
          {/* Grid */}
          {Array.from({ length: 15 }).map((_, i) => (
            <line
              key={`gx-${i}`}
              x1={(i + 1) * (W / 15)}
              y1={0}
              x2={(i + 1) * (W / 15)}
              y2={H}
              stroke="#1e293b"
              strokeWidth={0.5}
            />
          ))}
          {Array.from({ length: 9 }).map((_, i) => (
            <line
              key={`gy-${i}`}
              x1={0}
              y1={(i + 1) * (H / 9)}
              x2={W}
              y2={(i + 1) * (H / 9)}
              stroke="#1e293b"
              strokeWidth={0.5}
            />
          ))}

          {/* Path trail (distance) */}
          {points.length > 1 && (
            <path
              d={pathD}
              fill="none"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="6 4"
              opacity={0.8}
            />
          )}

          {/* Displacement vector */}
          {points.length > 1 && (
            <VectorArrow
              from={[start.x, start.y]}
              to={[end.x, end.y]}
              color="#22d3ee"
              strokeWidth={2.5}
              label="Δx"
              glow
            />
          )}

          {/* Waypoints */}
          {points.map((pt, i) => (
            <g key={i}>
              {/* Glow */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={i === 0 || i === points.length - 1 ? 10 : 5}
                fill={
                  i === 0
                    ? "#22d3ee"
                    : i === points.length - 1
                    ? "#a78bfa"
                    : "#f59e0b"
                }
                opacity={0.15}
              />
              {/* Dot */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={i === 0 || i === points.length - 1 ? 5 : 3}
                fill={
                  i === 0
                    ? "#22d3ee"
                    : i === points.length - 1
                    ? "#a78bfa"
                    : "#f59e0b"
                }
              />
              {i === 0 && (
                <text
                  x={pt.x}
                  y={pt.y - 14}
                  fill="#22d3ee"
                  fontSize="11"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  START
                </text>
              )}
            </g>
          ))}

          {/* Click hint */}
          {points.length === 1 && (
            <text
              x={W / 2}
              y={H / 2}
              fill="#64748b"
              fontSize="14"
              textAnchor="middle"
              fontFamily="Inter, sans-serif"
            >
              Click anywhere to trace a path
            </text>
          )}
        </svg>
      </div>

      {/* Info panel */}
      <div className="space-y-5">
        <p className="text-base text-slate-300 leading-relaxed">
          <span className="text-amber-400 font-semibold">Distance</span> is the
          total length of the path traveled.{" "}
          <span className="text-cyan-400 font-semibold">Displacement</span> is
          the shortest straight-line vector from start to end.
        </p>

        {/* Readouts */}
        <div className="space-y-3">
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <p className="text-xs text-amber-400/70 font-bold uppercase tracking-wider mb-1">
              Distance (path length)
            </p>
            <p className="text-2xl font-bold text-amber-400 tabular-nums">
              {(totalDistance / 10).toFixed(1)}{" "}
              <span className="text-sm font-normal text-amber-400/60">m</span>
            </p>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <p className="text-xs text-cyan-400/70 font-bold uppercase tracking-wider mb-1">
              Displacement (|Δx|)
            </p>
            <p className="text-2xl font-bold text-cyan-400 tabular-nums">
              {(displacement / 10).toFixed(1)}{" "}
              <span className="text-sm font-normal text-cyan-400/60">m</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-amber-400 inline-block" style={{ borderTop: "2px dashed #f59e0b" }} /> Distance
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-cyan-400 inline-block" /> Displacement
          </span>
        </div>

        <button
          onClick={reset}
          className="w-full mt-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-sm font-medium hover:bg-white/10 hover:text-white transition-all"
        >
          ↺ Reset Path
        </button>
      </div>
    </div>
  );
}
