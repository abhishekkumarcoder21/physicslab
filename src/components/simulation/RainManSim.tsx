"use client";

import { useState, useRef, useEffect } from "react";

/**
 * Rain-Man Problem — relative velocity of rain for a moving person.
 * Shows how the rain appears to fall at an angle when the person walks.
 */
export default function RainManSim() {
  const W = 700, H = 380;
  const [vRain, setVRain] = useState(8);
  const [vMan, setVMan] = useState(4);
  const [playing, setPlaying] = useState(true);

  const animRef = useRef<number>(0);
  const [tick, setTick] = useState(0);

  const vRelX = -vMan; // rain appears to come from the direction opposite to man's motion
  const vRelY = -vRain;
  const vRelMag = Math.sqrt(vRelX * vRelX + vRelY * vRelY);
  const angleRad = Math.atan2(Math.abs(vRelX), Math.abs(vRelY));
  const angleDeg = (angleRad * 180) / Math.PI;

  const umbrellaAngle = angleDeg;

  useEffect(() => {
    if (!playing) return;
    function loop() {
      setTick((t) => t + 1);
      animRef.current = requestAnimationFrame(loop);
    }
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [playing]);

  // Man position (walks right)
  const manX = 350 + (playing ? ((tick * 0.8) % 200) - 100 : 0);
  const manY = 300;

  // Rain drops (fall vertically + man correction)
  const drops = Array.from({ length: 30 }).map((_, i) => {
    const seed = (i * 47 + tick * 2) % 1000;
    const x = 50 + (seed * 7) % (W - 100);
    const y = ((seed * 3 + tick * 3) % (H + 40)) - 40;
    return { x, y };
  });

  // Apparent drops (tilted by relative velocity angle)
  const apparentDrops = Array.from({ length: 20 }).map((_, i) => {
    const seed = (i * 73 + tick * 2) % 1000;
    const baseX = manX - 60 + (seed * 3) % 120;
    const baseY = ((seed * 5 + tick * 4) % 200);
    return {
      x1: baseX,
      y1: manY - 140 + baseY,
      x2: baseX + Math.sin(angleRad) * 20,
      y2: manY - 140 + baseY + Math.cos(angleRad) * 20,
    };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#060e1a] shadow-2xl">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ aspectRatio: `${W}/${H}` }}>
          <defs>
            <filter id="rain-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Ground */}
          <line x1={20} y1={manY + 20} x2={W - 20} y2={manY + 20} stroke="#334155" strokeWidth={1.5} />

          {/* Actual rain drops (vertical) */}
          {drops.map((d, i) => (
            <line key={i} x1={d.x} y1={d.y} x2={d.x} y2={d.y + 12}
              stroke="#0ea5e9" strokeWidth={1} opacity={0.15} />
          ))}

          {/* Man's perceived rain (tilted) */}
          {apparentDrops.map((d, i) => (
            <line key={`a${i}`} x1={d.x1} y1={d.y1} x2={d.x2} y2={d.y2}
              stroke="#22d3ee" strokeWidth={1.5} opacity={0.3} />
          ))}

          {/* Man (stick figure) */}
          <circle cx={manX} cy={manY - 30} r={8} fill="none" stroke="#a78bfa" strokeWidth={2} />
          <line x1={manX} y1={manY - 22} x2={manX} y2={manY + 5} stroke="#a78bfa" strokeWidth={2} />
          <line x1={manX} y1={manY + 5} x2={manX - 8} y2={manY + 18} stroke="#a78bfa" strokeWidth={2} />
          <line x1={manX} y1={manY + 5} x2={manX + 8} y2={manY + 18} stroke="#a78bfa" strokeWidth={2} />
          <line x1={manX} y1={manY - 12} x2={manX - 10} y2={manY - 4} stroke="#a78bfa" strokeWidth={2} />
          <line x1={manX} y1={manY - 12} x2={manX + 10} y2={manY - 4} stroke="#a78bfa" strokeWidth={2} />

          {/* Man velocity arrow */}
          <line x1={manX + 15} y1={manY} x2={manX + 15 + vMan * 4} y2={manY}
            stroke="#22c55e" strokeWidth={2} strokeLinecap="round" filter="url(#rain-glow)" />
          <polygon points={`${manX + 15 + vMan * 4},${manY} ${manX + 15 + vMan * 4 - 6},${manY - 4} ${manX + 15 + vMan * 4 - 6},${manY + 4}`}
            fill="#22c55e" filter="url(#rain-glow)" />
          <text x={manX + 15 + vMan * 2} y={manY + 16} fill="#22c55e" fontSize="9" fontWeight="600" textAnchor="middle">
            v_man = {vMan.toFixed(0)}
          </text>

          {/* Rain velocity (vertical down) */}
          <g transform={`translate(${manX - 50}, 50)`}>
            <line x1={0} y1={0} x2={0} y2={vRain * 3}
              stroke="#0ea5e9" strokeWidth={2} strokeLinecap="round" filter="url(#rain-glow)" />
            <polygon points={`0,${vRain * 3} -4,${vRain * 3 - 6} 4,${vRain * 3 - 6}`}
              fill="#0ea5e9" filter="url(#rain-glow)" />
            <text x={-10} y={vRain * 1.5} fill="#0ea5e9" fontSize="9" fontWeight="600" textAnchor="end">v_rain</text>
          </g>

          {/* Relative velocity (apparent rain direction) */}
          <g transform={`translate(${manX + 60}, 60)`}>
            <line x1={0} y1={0} x2={-Math.sin(angleRad) * vRelMag * 2.5} y2={Math.cos(angleRad) * vRelMag * 2.5}
              stroke="#f59e0b" strokeWidth={2.5} strokeLinecap="round" filter="url(#rain-glow)" />
            <text x={-Math.sin(angleRad) * vRelMag * 1.2 + 10} y={Math.cos(angleRad) * vRelMag * 1.2}
              fill="#f59e0b" fontSize="9" fontWeight="700">v_rel</text>
          </g>

          {/* Angle arc */}
          <g transform={`translate(${manX + 60}, 60)`}>
            <path d={`M 0 20 A 20 20 0 0 0 ${-Math.sin(angleRad) * 20} ${Math.cos(angleRad) * 20}`}
              fill="none" stroke="#f59e0b" strokeWidth={1} opacity={0.5} />
            <text x={-8} y={28} fill="#f59e0b" fontSize="9" fontWeight="600">{angleDeg.toFixed(0)}°</text>
          </g>

          {/* Legend */}
          <g transform="translate(16, 16)">
            <line x1={0} y1={0} x2={14} y2={0} stroke="#0ea5e9" strokeWidth={2} />
            <text x={20} y={4} fill="#0ea5e9" fontSize="9">Rain (actual)</text>
            <line x1={0} y1={14} x2={14} y2={14} stroke="#22c55e" strokeWidth={2} />
            <text x={20} y={18} fill="#22c55e" fontSize="9">Man</text>
            <line x1={0} y1={28} x2={14} y2={28} stroke="#f59e0b" strokeWidth={2} />
            <text x={20} y={32} fill="#f59e0b" fontSize="9">Rain (apparent)</text>
          </g>
        </svg>
      </div>

      <div className="space-y-4">
        <p className="text-base text-slate-300 leading-relaxed">
          <span className="text-sky-400 font-semibold">Rain-Man Problem</span>:
          when you walk, rain <span className="text-amber-400">appears tilted</span>. The apparent angle depends on
          <span className="text-green-400"> v_man</span> / <span className="text-sky-400">v_rain</span>.
        </p>
        <p className="text-sm text-white font-mono text-center bg-white/5 rounded-xl p-2 border border-white/10">
          tan θ = v_man / v_rain
        </p>

        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Rain Speed (m/s)</label>
          <input type="range" min={2} max={15} step={0.5} value={vRain}
            onChange={(e) => setVRain(Number(e.target.value))} className="w-full accent-sky-500" />
          <div className="flex justify-between text-xs text-slate-500">
            <span>2</span><span className="text-sky-400 font-semibold">{vRain.toFixed(1)}</span><span>15</span>
          </div>
        </div>
        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Man Speed (m/s)</label>
          <input type="range" min={0} max={12} step={0.5} value={vMan}
            onChange={(e) => setVMan(Number(e.target.value))} className="w-full accent-green-500" />
          <div className="flex justify-between text-xs text-slate-500">
            <span>0</span><span className="text-green-400 font-semibold">{vMan.toFixed(1)}</span><span>12</span>
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
            <span className="text-slate-400">Apparent angle</span>
            <span className="text-amber-400 font-bold tabular-nums">{angleDeg.toFixed(1)}° from vertical</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">|v_rel|</span>
            <span className="text-amber-400 font-bold tabular-nums">{vRelMag.toFixed(1)} m/s</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Umbrella tilt</span>
            <span className="text-violet-400 font-bold tabular-nums">{umbrellaAngle.toFixed(1)}° forward</span>
          </div>
        </div>
      </div>
    </div>
  );
}
