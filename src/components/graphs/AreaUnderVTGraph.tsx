"use client";

import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

/**
 * Area Under v-t Graph = Displacement (D3.js).
 * Interactive: change velocity profile, shaded area updates.
 */
export default function AreaUnderVTGraph() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [v0, setV0] = useState(2);
  const [accel, setAccel] = useState(1.5);
  const [tEnd, setTEnd] = useState(6);
  const HEIGHT = 380;

  // Displacement = v0*t + 0.5*a*t²
  const displacement = v0 * tEnd + 0.5 * accel * tEnd * tEnd;

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = containerRef.current.clientWidth;
    const m = { top: 20, right: 30, bottom: 50, left: 60 };
    const iW = width - m.left - m.right;
    const iH = HEIGHT - m.top - m.bottom;

    svg.attr("width", width).attr("height", HEIGHT);
    const g = svg.append("g").attr("transform", `translate(${m.left},${m.top})`);

    const tMax = 10;
    const allData: { t: number; v: number }[] = [];
    for (let i = 0; i <= 200; i++) {
      const t = (i / 200) * tMax;
      allData.push({ t, v: v0 + accel * t });
    }

    // Only shade up to tEnd
    const shadedData = allData.filter(d => d.t <= tEnd);

    const vMin = Math.min(0, d3.min(allData, d => d.v)! - 2);
    const vMax = Math.max(10, d3.max(allData, d => d.v)! + 2);

    const tScale = d3.scaleLinear().domain([0, tMax]).range([0, iW]);
    const vScale = d3.scaleLinear().domain([vMin, vMax]).range([iH, 0]);

    // Grid
    g.append("g").call(d3.axisLeft(vScale).tickSize(-iW).tickFormat(() => ""))
      .selectAll("line").attr("stroke", "#1e293b").attr("stroke-dasharray", "2,4");
    g.selectAll(".domain").attr("stroke", "#334155");

    // Zero line
    if (vMin < 0 && vMax > 0) {
      g.append("line")
        .attr("x1", 0).attr("y1", vScale(0)).attr("x2", iW).attr("y2", vScale(0))
        .attr("stroke", "#475569").attr("stroke-width", 1);
    }

    // Axes
    g.append("g").attr("transform", `translate(0,${iH})`).call(d3.axisBottom(tScale).ticks(6))
      .selectAll("text").attr("fill", "#94a3b8").attr("font-size", "11px");
    g.append("text").attr("x", iW / 2).attr("y", iH + 40)
      .attr("text-anchor", "middle").attr("fill", "#94a3b8").attr("font-size", "13px").attr("font-weight", "600")
      .text("Time (s)");

    g.append("g").call(d3.axisLeft(vScale).ticks(6))
      .selectAll("text").attr("fill", "#94a3b8").attr("font-size", "11px");
    g.append("text").attr("transform", "rotate(-90)").attr("x", -iH / 2).attr("y", -42)
      .attr("text-anchor", "middle").attr("fill", "#94a3b8").attr("font-size", "13px").attr("font-weight", "600")
      .text("Velocity (m/s)");

    const defs = svg.append("defs");

    // Shaded area gradient
    const grad = defs.append("linearGradient").attr("id", "area-fill")
      .attr("x1", "0%").attr("y1", "0%").attr("x2", "0%").attr("y2", "100%");
    grad.append("stop").attr("offset", "0%").attr("stop-color", "#6366f1").attr("stop-opacity", 0.4);
    grad.append("stop").attr("offset", "100%").attr("stop-color", "#6366f1").attr("stop-opacity", 0.05);

    // Glow
    const filter = defs.append("filter").attr("id", "area-glow");
    filter.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "blur");
    const merge = filter.append("feMerge");
    merge.append("feMergeNode").attr("in", "blur");
    merge.append("feMergeNode").attr("in", "SourceGraphic");

    // Shaded area (UP TO tEnd)
    const area = d3.area<{ t: number; v: number }>()
      .x(d => tScale(d.t)).y0(vScale(0)).y1(d => vScale(d.v)).curve(d3.curveMonotoneX);
    g.append("path").datum(shadedData).attr("fill", "url(#area-fill)").attr("d", area);

    // Border of shaded area
    g.append("line")
      .attr("x1", tScale(tEnd)).attr("y1", vScale(0))
      .attr("x2", tScale(tEnd)).attr("y2", vScale(v0 + accel * tEnd))
      .attr("stroke", "#6366f1").attr("stroke-width", 1.5).attr("stroke-dasharray", "4 3").attr("opacity", 0.6);

    // Full line (faded beyond tEnd)
    const lineFull = d3.line<{ t: number; v: number }>()
      .x(d => tScale(d.t)).y(d => vScale(d.v)).curve(d3.curveMonotoneX);

    // Faded portion
    const fadedData = allData.filter(d => d.t >= tEnd);
    if (fadedData.length > 1) {
      g.append("path").datum(fadedData)
        .attr("fill", "none").attr("stroke", "#334155").attr("stroke-width", 1.5).attr("d", lineFull);
    }

    // Active portion
    g.append("path").datum(shadedData)
      .attr("fill", "none").attr("stroke", "#22d3ee").attr("stroke-width", 2.5).attr("d", lineFull)
      .attr("filter", "url(#area-glow)");

    // Displacement label in shaded area
    const midT = tEnd / 2;
    const midV = (v0 + (v0 + accel * tEnd)) / 4;
    g.append("text")
      .attr("x", tScale(midT)).attr("y", vScale(midV))
      .attr("text-anchor", "middle").attr("fill", "#a78bfa").attr("font-size", "14px").attr("font-weight", "700")
      .attr("filter", "url(#area-glow)")
      .text(`Δx = ${displacement.toFixed(1)} m`);

    // tEnd marker point
    g.append("circle")
      .attr("cx", tScale(tEnd)).attr("cy", vScale(v0 + accel * tEnd)).attr("r", 5)
      .attr("fill", "#22d3ee").attr("filter", "url(#area-glow)");

  }, [v0, accel, tEnd, displacement]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">
      <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#060e1a] shadow-2xl p-2">
        <div ref={containerRef} className="w-full">
          <svg ref={svgRef} className="w-full" />
        </div>
      </div>

      <div className="space-y-5">
        <p className="text-base text-slate-300 leading-relaxed">
          The <span className="text-indigo-400 font-semibold">area under the v–t graph</span>{" "}
          represents the <span className="text-violet-400 font-semibold">displacement</span>.
        </p>
        <p className="text-sm text-slate-400">
          For uniform acceleration: Δx = v₀t + ½at² — which is exactly the shaded area (a trapezoid).
        </p>

        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Initial Velocity (m/s)</label>
          <input type="range" min={-3} max={8} step={0.5} value={v0}
            onChange={(e) => setV0(Number(e.target.value))} className="w-full accent-cyan-500" />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>−3</span><span className="text-cyan-400 font-semibold">{v0 > 0 ? "+" : ""}{v0.toFixed(1)}</span><span>8</span>
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Acceleration (m/s²)</label>
          <input type="range" min={-3} max={4} step={0.25} value={accel}
            onChange={(e) => setAccel(Number(e.target.value))} className="w-full accent-amber-500" />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>−3</span><span className="text-amber-400 font-semibold">{accel > 0 ? "+" : ""}{accel.toFixed(1)}</span><span>+4</span>
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Time Range (s)</label>
          <input type="range" min={1} max={10} step={0.5} value={tEnd}
            onChange={(e) => setTEnd(Number(e.target.value))} className="w-full accent-indigo-500" />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>1 s</span><span className="text-indigo-400 font-semibold">{tEnd.toFixed(1)} s</span><span>10 s</span>
          </div>
        </div>

        <div className="rounded-xl bg-indigo-500/10 border border-indigo-500/20 p-4">
          <p className="text-xs text-indigo-400/70 font-bold uppercase tracking-wider mb-1">Displacement (Area)</p>
          <p className="text-2xl font-extrabold text-violet-400 tabular-nums">
            {displacement.toFixed(1)} <span className="text-sm font-normal text-violet-400/60">m</span>
          </p>
        </div>

        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">💡 Key Insight</p>
          <p className="text-sm text-slate-300 leading-relaxed">
            Change the time range slider to see how the shaded area (displacement) grows.
            Negative area below the zero line represents <strong className="text-red-400">backward displacement</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
