"use client";

import { useState, useRef, useEffect } from "react";

/**
 * Relative Motion — two reference frames.
 * Train + ground observer with velocity composition: v_AG = v_AT + v_TG.
 */
export default function RelativeMotionEngineSim() {
  const W = 700, H = 400;
  const [vTrain, setVTrain] = useState(6);
  const [vManInTrain, setVManInTrain] = useState(2);
  const [playing, setPlaying] = useState(true);
  const [observer, setObserver] = useState<"ground" | "train">("ground");

  const animRef = useRef<number>(0);
  const startRef = useRef(performance.now());
  const [time, setTime] = useState(0);

  const vManGround = vManInTrain + vTrain;

  useEffect(() => {
    startRef.current = performance.now();
    setTime(0);
  }, [vTrain, vManInTrain]);

  useEffect(() => {
    if (!playing) return;
    function loop(now: number) {
      const t = ((now - startRef.current) / 1000) % 12;
      setTime(t);
      animRef.current = requestAnimationFrame(loop);
    }
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [playing]);

  const groundY = H - 80;
  const trackY = groundY - 60;
  const scale = 14;

  // Positions
  const trainX = observer === "ground"
    ? 60 + (vTrain * time * scale) % (W - 120)
    : W / 2 - 80; // stationary in train frame

  const manAbsX = 60 + (vManGround * time * scale) % (W - 120);
  const manRelX = observer === "ground"
    ? manAbsX
    : W / 2 - 80 + ((vManInTrain * time * scale) % 200);

  // Arrows
  const arrowY = trackY - 50;
  const arrowScale = 6;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#060e1a] shadow-2xl">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ aspectRatio: `${W}/${H}` }}>
          <defs>
            <filter id="rm-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Ground */}
          <line x1={20} y1={groundY} x2={W - 20} y2={groundY} stroke="#334155" strokeWidth={1.5} />
          {/* Rails */}
          <line x1={20} y1={groundY - 3} x2={W - 20} y2={groundY - 3} stroke="#475569" strokeWidth={0.5} strokeDasharray="8 4" />

          {/* Train body */}
          <rect x={trainX} y={trackY} width={160} height={40} rx={6}
            fill="#1e293b" stroke="#334155" strokeWidth={1.5} />
          <rect x={trainX + 10} y={trackY + 5} width={30} height={22} rx={3} fill="#0f172a" stroke="#475569" strokeWidth={0.5} />
          <rect x={trainX + 50} y={trackY + 5} width={30} height={22} rx={3} fill="#0f172a" stroke="#475569" strokeWidth={0.5} />
          <rect x={trainX + 90} y={trackY + 5} width={30} height={22} rx={3} fill="#0f172a" stroke="#475569" strokeWidth={0.5} />
          {/* Wheels */}
          <circle cx={trainX + 25} cy={groundY - 2} r={8} fill="#334155" stroke="#475569" />
          <circle cx={trainX + 135} cy={groundY - 2} r={8} fill="#334155" stroke="#475569" />
          <text x={trainX + 80} y={trackY + 52} fill="#64748b" fontSize="10" fontWeight="600" textAnchor="middle">TRAIN</text>

          {/* Man inside train */}
          <circle cx={manRelX + 10} cy={trackY + 16} r={6} fill="#a78bfa" stroke="#6366f1" strokeWidth={2} />
          <line x1={manRelX + 10} y1={trackY + 22} x2={manRelX + 10} y2={trackY + 34}
            stroke="#a78bfa" strokeWidth={2} />
          <text x={manRelX + 10} y={trackY - 2} fill="#a78bfa" fontSize="9" fontWeight="600" textAnchor="middle">Man</text>

          {/* Train observer (ground) */}
          <circle cx={80} cy={groundY - 24} r={6} fill="#22c55e" stroke="#16a34a" strokeWidth={2} />
          <line x1={80} y1={groundY - 18} x2={80} y2={groundY - 6}
            stroke="#22c55e" strokeWidth={2} />
          <text x={80} y={groundY + 16} fill="#22c55e" fontSize="9" fontWeight="600" textAnchor="middle">Ground Obs.</text>

          {/* Velocity arrows */}
          {/* v_train (yellow) */}
          <line x1={trainX + 80} y1={arrowY} x2={trainX + 80 + vTrain * arrowScale} y2={arrowY}
            stroke="#f59e0b" strokeWidth={2.5} strokeLinecap="round" filter="url(#rm-glow)" />
          <polygon
            points={`${trainX + 80 + vTrain * arrowScale},${arrowY} ${trainX + 80 + vTrain * arrowScale - 7},${arrowY - 4} ${trainX + 80 + vTrain * arrowScale - 7},${arrowY + 4}`}
            fill="#f59e0b" filter="url(#rm-glow)" />
          <text x={trainX + 80 + vTrain * arrowScale / 2} y={arrowY - 10}
            fill="#f59e0b" fontSize="10" fontWeight="700" textAnchor="middle">
            v_TG = {vTrain.toFixed(0)}
          </text>

          {/* v_man relative to train (cyan) */}
          <line x1={manRelX + 10} y1={arrowY - 28} x2={manRelX + 10 + vManInTrain * arrowScale} y2={arrowY - 28}
            stroke="#22d3ee" strokeWidth={2} strokeLinecap="round" filter="url(#rm-glow)" />
          <polygon
            points={`${manRelX + 10 + vManInTrain * arrowScale},${arrowY - 28} ${manRelX + 10 + vManInTrain * arrowScale - 6},${arrowY - 32} ${manRelX + 10 + vManInTrain * arrowScale - 6},${arrowY - 24}`}
            fill="#22d3ee" filter="url(#rm-glow)" />
          <text x={manRelX + 10 + vManInTrain * arrowScale / 2} y={arrowY - 38}
            fill="#22d3ee" fontSize="9" fontWeight="600" textAnchor="middle">
            v_AT = {vManInTrain.toFixed(0)}
          </text>

          {/* Frame label */}
          <text x={W / 2} y={24} fill="#94a3b8" fontSize="12" fontWeight="700" textAnchor="middle">
            Observer: {observer === "ground" ? "🌍 Ground Frame" : "🚂 Train Frame"}
          </text>

          <text x={W - 16} y={H - 10} fill="#64748b" fontSize="10" textAnchor="end">t = {time.toFixed(1)} s</text>
        </svg>
      </div>

      <div className="space-y-5">
        <p className="text-base text-slate-300 leading-relaxed">
          <span className="text-amber-400 font-semibold">Relative Motion</span>: velocity depends
          on the <span className="text-white">observer&apos;s frame</span>.
        </p>
        <p className="text-sm text-slate-400 font-mono">
          v⃗<sub>AG</sub> = v⃗<sub>AT</sub> + v⃗<sub>TG</sub>
        </p>

        {/* Observer toggle */}
        <div className="flex gap-2">
          <button onClick={() => setObserver("ground")}
            className={`flex-1 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              observer === "ground" ? "bg-green-500/20 text-green-300 ring-1 ring-green-500/50"
                                    : "bg-white/5 text-slate-400 border border-white/10"}`}>
            🌍 Ground
          </button>
          <button onClick={() => setObserver("train")}
            className={`flex-1 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              observer === "train" ? "bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/50"
                                   : "bg-white/5 text-slate-400 border border-white/10"}`}>
            🚂 Train
          </button>
        </div>

        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Train Speed (v_TG)</label>
          <input type="range" min={1} max={12} step={0.5} value={vTrain}
            onChange={(e) => setVTrain(Number(e.target.value))} className="w-full accent-amber-500" />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>1</span><span className="text-amber-400 font-semibold">{vTrain.toFixed(1)} m/s</span><span>12</span>
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Man&apos;s Speed in Train (v_AT)</label>
          <input type="range" min={-5} max={8} step={0.5} value={vManInTrain}
            onChange={(e) => setVManInTrain(Number(e.target.value))} className="w-full accent-cyan-500" />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>−5</span><span className="text-cyan-400 font-semibold">{vManInTrain > 0 ? "+" : ""}{vManInTrain.toFixed(1)} m/s</span><span>8</span>
          </div>
        </div>

        <button onClick={() => setPlaying(!playing)}
          className={`w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            playing ? "bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/50"
                    : "bg-white/5 text-slate-400 border border-white/10"}`}>
          {playing ? "⏸ Pause" : "▶ Play"}
        </button>

        {/* Readout */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-amber-400 text-xs font-bold">v<sub>TG</sub></span>
            <span className="text-amber-400 font-bold tabular-nums">{vTrain.toFixed(1)} m/s</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-cyan-400 text-xs font-bold">v<sub>AT</sub></span>
            <span className="text-cyan-400 font-bold tabular-nums">{vManInTrain.toFixed(1)} m/s</span>
          </div>
          <div className="border-t border-white/10 pt-2 flex justify-between">
            <span className="text-xs text-indigo-400 font-bold">v<sub>AG</sub> (ground)</span>
            <span className="text-lg font-extrabold text-indigo-400 tabular-nums">
              {vManGround.toFixed(1)} <span className="text-xs font-normal">m/s</span>
            </span>
          </div>
        </div>

        <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
          <p className="text-xs text-amber-400/70 font-bold uppercase tracking-wider mb-1">💡 Key Insight</p>
          <p className="text-sm text-slate-300 leading-relaxed">
            {vManInTrain >= 0
              ? "Man walks forward → velocities add up → faster relative to ground."
              : "Man walks backward → velocities partially cancel → slower (or reversed) relative to ground."}
          </p>
        </div>
      </div>
    </div>
  );
}
