"use client";

import { useRef, useState, useEffect } from "react";

/**
 * Displacement — interactive visualization.
 * Shows start/end points with a glowing displacement vector.
 * User can drag the end point to see how displacement changes.
 */
export default function DisplacementSim() {
  const svgRef = useRef<SVGSVGElement>(null);
  const W = 700;
  const H = 420;

  const start = { x: 120, y: 300 };
  const [end, setEnd] = useState({ x: 520, y: 120 });
  const [dragging, setDragging] = useState(false);

  // Auto-animate end point on first load
  const [autoPlayed, setAutoPlayed] = useState(false);
  useEffect(() => {
    if (autoPlayed) return;
    const targets = [
      { x: 400, y: 200 },
      { x: 520, y: 120 },
    ];
    let step = 0;
    const timer = setInterval(() => {
      if (step >= targets.length) {
        clearInterval(timer);
        setAutoPlayed(true);
        return;
      }
      setEnd(targets[step]);
      step++;
    }, 1200);
    return () => clearInterval(timer);
  }, [autoPlayed]);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!dragging || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = Math.max(20, Math.min(W - 20, ((e.clientX - rect.left) / rect.width) * W));
    const y = Math.max(20, Math.min(H - 20, ((e.clientY - rect.top) / rect.height) * H));
    setEnd({ x, y });
  };

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const displacement = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(-dy, dx); // -dy because SVG y-axis is inverted
  const angleDeg = (angle * 180) / Math.PI;

  // Arrowhead
  const headLen = 14;
  const headAngle = Math.atan2(end.y - start.y, end.x - start.x);
  const hlX = end.x - headLen * Math.cos(headAngle - Math.PI / 6);
  const hlY = end.y - headLen * Math.sin(headAngle - Math.PI / 6);
  const hrX = end.x - headLen * Math.cos(headAngle + Math.PI / 6);
  const hrY = end.y - headLen * Math.sin(headAngle + Math.PI / 6);

  // Component projections
  const projX = { x: end.x, y: start.y };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">
      {/* Canvas */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#060e1a] shadow-2xl">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full select-none"
          style={{ aspectRatio: `${W}/${H}`, cursor: dragging ? "grabbing" : "default" }}
          onMouseMove={handleMouseMove}
          onMouseUp={() => setDragging(false)}
          onMouseLeave={() => setDragging(false)}
        >
          {/* Grid */}
          {Array.from({ length: 14 }).map((_, i) => (
            <line key={`gx-${i}`} x1={(i + 1) * 50} y1={0} x2={(i + 1) * 50} y2={H} stroke="#1e293b" strokeWidth={0.5} />
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={`gy-${i}`} x1={0} y1={(i + 1) * 50} x2={W} y2={(i + 1) * 50} stroke="#1e293b" strokeWidth={0.5} />
          ))}

          <defs>
            <filter id="disp-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Component lines (dotted) */}
          {/* Horizontal (Δx) */}
          <line
            x1={start.x} y1={start.y}
            x2={projX.x} y2={projX.y}
            stroke="#6366f1" strokeWidth={1.5} strokeDasharray="5 4" opacity={0.5}
          />
          <text
            x={(start.x + projX.x) / 2} y={start.y + 20}
            fill="#6366f1" fontSize="11" fontWeight="600" textAnchor="middle"
          >
            Δx = {(Math.abs(dx) / 10).toFixed(1)} m
          </text>

          {/* Vertical (Δy) */}
          <line
            x1={projX.x} y1={projX.y}
            x2={end.x} y2={end.y}
            stroke="#a78bfa" strokeWidth={1.5} strokeDasharray="5 4" opacity={0.5}
          />
          <text
            x={end.x + 16} y={(start.y + end.y) / 2}
            fill="#a78bfa" fontSize="11" fontWeight="600" textAnchor="start"
          >
            Δy = {(Math.abs(dy) / 10).toFixed(1)} m
          </text>

          {/* Displacement vector (main) */}
          <line
            x1={start.x} y1={start.y}
            x2={end.x} y2={end.y}
            stroke="#22d3ee" strokeWidth={3}
            strokeLinecap="round"
            filter="url(#disp-glow)"
          />
          <polygon
            points={`${end.x},${end.y} ${hlX},${hlY} ${hrX},${hrY}`}
            fill="#22d3ee"
            filter="url(#disp-glow)"
          />

          {/* Displacement label */}
          <text
            x={(start.x + end.x) / 2 - 20}
            y={(start.y + end.y) / 2 - 14}
            fill="#22d3ee"
            fontSize="13"
            fontWeight="700"
            filter="url(#disp-glow)"
          >
            Δr⃗ = {(displacement / 10).toFixed(1)} m
          </text>

          {/* Angle arc */}
          {displacement > 30 && (
            <>
              <path
                d={`M ${start.x + 40} ${start.y} A 40 40 0 0 ${dy < 0 ? 0 : 1} ${
                  start.x + 40 * Math.cos(headAngle)
                } ${start.y + 40 * Math.sin(headAngle)}`}
                fill="none"
                stroke="#f59e0b"
                strokeWidth={1.5}
                opacity={0.6}
              />
              <text
                x={start.x + 52}
                y={start.y + (dy < 0 ? -8 : 18)}
                fill="#f59e0b"
                fontSize="11"
                fontWeight="600"
              >
                {Math.abs(angleDeg).toFixed(0)}°
              </text>
            </>
          )}

          {/* Start point */}
          <circle cx={start.x} cy={start.y} r={12} fill="#22d3ee" opacity={0.1} />
          <circle cx={start.x} cy={start.y} r={6} fill="#22d3ee" />
          <text x={start.x} y={start.y + 24} fill="#22d3ee" fontSize="11" fontWeight="700" textAnchor="middle">
            START
          </text>

          {/* End point (draggable) */}
          <circle
            cx={end.x} cy={end.y} r={18}
            fill="#a78bfa" opacity={0.1}
            className={dragging ? "" : "animate-pulse"}
          />
          <circle
            cx={end.x} cy={end.y} r={8}
            fill="#a78bfa" stroke="#c4b5fd" strokeWidth={2}
            style={{ cursor: "grab" }}
            onMouseDown={(e) => { e.stopPropagation(); setDragging(true); }}
          />
          <text x={end.x} y={end.y - 22} fill="#a78bfa" fontSize="11" fontWeight="700" textAnchor="middle">
            END (drag me)
          </text>
        </svg>
      </div>

      {/* Info panel */}
      <div className="space-y-5">
        <p className="text-base text-slate-300 leading-relaxed">
          <span className="text-cyan-400 font-semibold">Displacement</span> is the{" "}
          <strong className="text-white">shortest straight-line distance</strong> from
          start to finish — it&apos;s a <em className="text-cyan-300">vector</em>, meaning
          it has both magnitude and direction.
        </p>

        <div className="space-y-2 text-sm text-slate-400">
          <p>✦ Vector quantity (magnitude + direction)</p>
          <p>✦ Can be positive, negative, or zero</p>
          <p>✦ Independent of the path taken</p>
          <p>✦ SI unit: metre (m)</p>
        </div>

        {/* Live readout */}
        <div className="rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-5">
          <p className="text-xs text-cyan-400/70 font-bold uppercase tracking-wider mb-1">
            Displacement Vector
          </p>
          <p className="text-2xl font-extrabold text-cyan-400 tabular-nums">
            {(displacement / 10).toFixed(1)}{" "}
            <span className="text-sm font-normal text-cyan-400/60">m</span>
          </p>
          <p className="text-sm text-slate-400 mt-1">
            Direction: <span className="text-amber-400 font-semibold">{Math.abs(angleDeg).toFixed(0)}°</span>
            {" "}{angleDeg >= 0 ? "above" : "below"} horizontal
          </p>
        </div>

        {/* Key insight */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
            💡 Key Insight
          </p>
          <p className="text-sm text-slate-300 leading-relaxed">
            If an object returns to its starting point, its displacement is{" "}
            <strong className="text-cyan-400">zero</strong> — even if it traveled a large distance.
            Drag the end point back to START to see this!
          </p>
        </div>
      </div>
    </div>
  );
}
