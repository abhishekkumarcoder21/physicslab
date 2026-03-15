"use client";

import { useRef, useState, useCallback, useEffect } from "react";

interface Point {
  x: number;
  y: number;
}

/**
 * Distance — interactive canvas.
 * User drags/clicks to move a particle along a curved path.
 * Shows the total path length (distance) dynamically with a glowing trail.
 */
export default function DistanceSim() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [points, setPoints] = useState<Point[]>([{ x: 80, y: 320 }]);
  const [isDragging, setIsDragging] = useState(false);
  const W = 700;
  const H = 420;

  // Predefined curved path waypoints for guided experience
  const guidePath: Point[] = [
    { x: 80, y: 320 },
    { x: 160, y: 260 },
    { x: 260, y: 180 },
    { x: 340, y: 230 },
    { x: 420, y: 140 },
    { x: 500, y: 200 },
    { x: 560, y: 120 },
    { x: 620, y: 180 },
  ];

  const [guideIndex, setGuideIndex] = useState(0);
  const [showGuide, setShowGuide] = useState(true);

  const addPoint = useCallback(
    (clientX: number, clientY: number) => {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * W;
      const y = ((clientY - rect.top) / rect.height) * H;
      setPoints((prev) => [...prev, { x, y }]);
      setShowGuide(false);
    },
    []
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!isDragging) return;
      addPoint(e.clientX, e.clientY);
    },
    [isDragging, addPoint]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      addPoint(e.clientX, e.clientY);
    },
    [addPoint]
  );

  // Auto-animate guide path
  useEffect(() => {
    if (!showGuide) return;
    if (guideIndex >= guidePath.length) return;

    const timer = setTimeout(() => {
      setPoints((prev) => [...prev, guidePath[guideIndex]]);
      setGuideIndex((i) => i + 1);
    }, 400);
    return () => clearTimeout(timer);
  }, [guideIndex, showGuide, guidePath]);

  // Calculate total distance
  const totalDistance = points.reduce((sum, pt, i) => {
    if (i === 0) return 0;
    const prev = points[i - 1];
    return sum + Math.sqrt((pt.x - prev.x) ** 2 + (pt.y - prev.y) ** 2);
  }, 0);

  // Build path SVG string
  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  // Smooth curve version for display
  const curvePath =
    points.length > 2
      ? points.reduce((acc, pt, i) => {
          if (i === 0) return `M ${pt.x} ${pt.y}`;
          return `${acc} L ${pt.x} ${pt.y}`;
        }, "")
      : pathD;

  const reset = () => {
    setPoints([{ x: 80, y: 320 }]);
    setGuideIndex(0);
    setShowGuide(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">
      {/* Canvas */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#060e1a] shadow-2xl">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full cursor-crosshair select-none"
          style={{ aspectRatio: `${W}/${H}` }}
          onClick={handleClick}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onMouseMove={handleMouseMove}
        >
          {/* Subtle grid */}
          {Array.from({ length: 14 }).map((_, i) => (
            <line
              key={`gx-${i}`}
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
              key={`gy-${i}`}
              x1={0}
              y1={(i + 1) * 50}
              x2={W}
              y2={(i + 1) * 50}
              stroke="#1e293b"
              strokeWidth={0.5}
            />
          ))}

          {/* Glow filter */}
          <defs>
            <filter id="trail-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="trail-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* Traveled path (glowing trail) */}
          {points.length > 1 && (
            <>
              {/* Glow layer */}
              <path
                d={curvePath}
                fill="none"
                stroke="#f59e0b"
                strokeWidth={5}
                opacity={0.15}
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#trail-glow)"
              />
              {/* Main trail */}
              <path
                d={curvePath}
                fill="none"
                stroke="url(#trail-grad)"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#trail-glow)"
              />
            </>
          )}

          {/* Start marker */}
          <circle cx={points[0].x} cy={points[0].y} r={12} fill="#f59e0b" opacity={0.1} />
          <circle cx={points[0].x} cy={points[0].y} r={6} fill="#f59e0b" />
          <text
            x={points[0].x}
            y={points[0].y - 16}
            fill="#f59e0b"
            fontSize="11"
            fontWeight="700"
            textAnchor="middle"
            fontFamily="Inter, sans-serif"
          >
            START
          </text>

          {/* Current position marker */}
          {points.length > 1 && (
            <>
              <circle
                cx={points[points.length - 1].x}
                cy={points[points.length - 1].y}
                r={14}
                fill="#f59e0b"
                opacity={0.12}
                className="animate-pulse"
              />
              <circle
                cx={points[points.length - 1].x}
                cy={points[points.length - 1].y}
                r={5}
                fill="#fbbf24"
                stroke="#f59e0b"
                strokeWidth={2}
              />
            </>
          )}

          {/* Distance markers along path */}
          {points.length > 3 &&
            points
              .filter((_, i) => i > 0 && i % Math.max(1, Math.floor(points.length / 5)) === 0)
              .map((pt, i) => (
                <circle
                  key={`mark-${i}`}
                  cx={pt.x}
                  cy={pt.y}
                  r={2}
                  fill="#fbbf24"
                  opacity={0.5}
                />
              ))}

          {/* Instruction hint */}
          {showGuide && points.length === 1 && (
            <text
              x={W / 2}
              y={H / 2 - 20}
              fill="#64748b"
              fontSize="14"
              textAnchor="middle"
              fontFamily="Inter, sans-serif"
            >
              Watch the particle trace a path...
            </text>
          )}
          {!showGuide && points.length < 3 && (
            <text
              x={W / 2}
              y={H / 2 - 20}
              fill="#64748b"
              fontSize="14"
              textAnchor="middle"
              fontFamily="Inter, sans-serif"
            >
              Click or drag to trace more path
            </text>
          )}
        </svg>
      </div>

      {/* Info panel */}
      <div className="space-y-5">
        <p className="text-base text-slate-300 leading-relaxed">
          <span className="text-amber-400 font-semibold">Distance</span> is a{" "}
          <em className="text-amber-300">scalar</em> quantity — it measures the{" "}
          <strong className="text-white">total length of the path</strong> an object has traveled.
        </p>

        <div className="space-y-2 text-sm text-slate-400">
          <p>✦ Always positive (or zero)</p>
          <p>✦ Depends on the actual path taken</p>
          <p>✦ SI unit: metre (m)</p>
        </div>

        {/* Live readout */}
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-5">
          <p className="text-xs text-amber-400/70 font-bold uppercase tracking-wider mb-1">
            Total Distance
          </p>
          <p className="text-3xl font-extrabold text-amber-400 tabular-nums">
            {(totalDistance / 10).toFixed(1)}{" "}
            <span className="text-base font-normal text-amber-400/60">m</span>
          </p>
        </div>

        {/* Insight */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
            💡 Key Insight
          </p>
          <p className="text-sm text-slate-300 leading-relaxed">
            No matter how curved or zigzag the path, distance keeps adding up.
            It can never decrease — it only grows.
          </p>
        </div>

        <button
          onClick={reset}
          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-sm font-medium hover:bg-white/10 hover:text-white transition-all"
        >
          ↺ Reset
        </button>
      </div>
    </div>
  );
}
