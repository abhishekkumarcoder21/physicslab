"use client";

interface VectorArrowProps {
  /** Start position [x, y] */
  from: [number, number];
  /** End position [x, y] */
  to: [number, number];
  /** Arrow color */
  color?: string;
  /** Stroke width */
  strokeWidth?: number;
  /** Label text placed near the arrow tip */
  label?: string;
  /** Whether to show a neon glow effect */
  glow?: boolean;
  /** Additional CSS class */
  className?: string;
}

/**
 * SVG vector arrow with optional neon glow.
 * Used across simulations to visualize displacement, velocity, etc.
 */
export default function VectorArrow({
  from,
  to,
  color = "#22d3ee",
  strokeWidth = 2.5,
  label,
  glow = true,
  className = "",
}: VectorArrowProps) {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const length = Math.sqrt(dx * dx + dy * dy);
  if (length < 1) return null;

  const angle = Math.atan2(dy, dx);
  const headLen = Math.min(14, length * 0.3);

  // Arrowhead points
  const tipX = to[0];
  const tipY = to[1];
  const leftX = tipX - headLen * Math.cos(angle - Math.PI / 6);
  const leftY = tipY - headLen * Math.sin(angle - Math.PI / 6);
  const rightX = tipX - headLen * Math.cos(angle + Math.PI / 6);
  const rightY = tipY - headLen * Math.sin(angle + Math.PI / 6);

  const filterId = `glow-${color.replace("#", "")}`;

  return (
    <g className={className}>
      {glow && (
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      )}

      {/* Shaft */}
      <line
        x1={from[0]}
        y1={from[1]}
        x2={to[0]}
        y2={to[1]}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        filter={glow ? `url(#${filterId})` : undefined}
      />

      {/* Arrowhead */}
      <polygon
        points={`${tipX},${tipY} ${leftX},${leftY} ${rightX},${rightY}`}
        fill={color}
        filter={glow ? `url(#${filterId})` : undefined}
      />

      {/* Label */}
      {label && (
        <text
          x={tipX + 10 * Math.cos(angle - Math.PI / 4)}
          y={tipY + 10 * Math.sin(angle - Math.PI / 4)}
          fill={color}
          fontSize="13"
          fontWeight="600"
          fontFamily="Inter, sans-serif"
          filter={glow ? `url(#${filterId})` : undefined}
        >
          {label}
        </text>
      )}
    </g>
  );
}
