"use client";

import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

/**
 * Acceleration vs Time Graph (D3.js).
 * Shows constant + step-change acceleration profiles.
 * Shaded area under curve = change in velocity (Δv).
 */
export default function AccelerationTimeGraph() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [a1, setA1] = useState(3);
  const [a2, setA2] = useState(-1.5);
  const [tSwitch, setTSwitch] = useState(4);
  const HEIGHT = 380;

  const tMax = 10;

  // Acceleration profile: a1 for t < tSwitch, a2 for t >= tSwitch
  const accelAt = (t: number) => (t < tSwitch ? a1 : a2);
  // Δv = area = a1 * tSwitch + a2 * (tMax - tSwitch)
  const deltaV = a1 * tSwitch + a2 * (tMax - tSwitch);

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

    const aMin = Math.min(-5, a1, a2) - 1;
    const aMax = Math.max(5, a1, a2) + 1;

    const tScale = d3.scaleLinear().domain([0, tMax]).range([0, iW]);
    const aScale = d3.scaleLinear().domain([aMin, aMax]).range([iH, 0]);

    // Grid
    g.append("g").call(d3.axisLeft(aScale).tickSize(-iW).tickFormat(() => ""))
      .selectAll("line").attr("stroke", "#1e293b").attr("stroke-dasharray", "2,4");
    g.selectAll(".domain").attr("stroke", "#334155");

    // Zero line
    g.append("line")
      .attr("x1", 0).attr("y1", aScale(0)).attr("x2", iW).attr("y2", aScale(0))
      .attr("stroke", "#475569").attr("stroke-width", 1);

    // Axes
    g.append("g").attr("transform", `translate(0,${iH})`).call(d3.axisBottom(tScale).ticks(6))
      .selectAll("text").attr("fill", "#94a3b8").attr("font-size", "11px");
    g.append("text").attr("x", iW / 2).attr("y", iH + 40)
      .attr("text-anchor", "middle").attr("fill", "#94a3b8").attr("font-size", "13px").attr("font-weight", "600")
      .text("Time (s)");

    g.append("g").call(d3.axisLeft(aScale).ticks(6))
      .selectAll("text").attr("fill", "#94a3b8").attr("font-size", "11px");
    g.append("text").attr("transform", "rotate(-90)").attr("x", -iH / 2).attr("y", -42)
      .attr("text-anchor", "middle").attr("fill", "#94a3b8").attr("font-size", "13px").attr("font-weight", "600")
      .text("Acceleration (m/s²)");

    const defs = svg.append("defs");

    // Glow
    const filter = defs.append("filter").attr("id", "at-glow");
    filter.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "blur");
    const merge = filter.append("feMerge");
    merge.append("feMergeNode").attr("in", "blur");
    merge.append("feMergeNode").attr("in", "SourceGraphic");

    // Shaded area phase 1 (green for positive, red for negative)
    const area1Color = a1 >= 0 ? "#22c55e" : "#ef4444";
    g.append("rect")
      .attr("x", tScale(0)).attr("y", a1 >= 0 ? aScale(a1) : aScale(0))
      .attr("width", tScale(tSwitch) - tScale(0))
      .attr("height", Math.abs(aScale(0) - aScale(a1)))
      .attr("fill", area1Color).attr("opacity", 0.15);

    // Shaded area phase 2
    const area2Color = a2 >= 0 ? "#22c55e" : "#ef4444";
    g.append("rect")
      .attr("x", tScale(tSwitch)).attr("y", a2 >= 0 ? aScale(a2) : aScale(0))
      .attr("width", tScale(tMax) - tScale(tSwitch))
      .attr("height", Math.abs(aScale(0) - aScale(a2)))
      .attr("fill", area2Color).attr("opacity", 0.15);

    // Step function line
    const stepData = [
      { t: 0, a: a1 }, { t: tSwitch, a: a1 },
      { t: tSwitch, a: a2 }, { t: tMax, a: a2 }
    ];
    const line = d3.line<{ t: number; a: number }>()
      .x(d => tScale(d.t)).y(d => aScale(d.a));
    g.append("path").datum(stepData)
      .attr("fill", "none").attr("stroke", "#f59e0b").attr("stroke-width", 2.5).attr("d", line)
      .attr("filter", "url(#at-glow)");

    // Switch point marker
    g.append("line")
      .attr("x1", tScale(tSwitch)).attr("y1", 0).attr("x2", tScale(tSwitch)).attr("y2", iH)
      .attr("stroke", "#6366f1").attr("stroke-width", 1).attr("stroke-dasharray", "6 3").attr("opacity", 0.5);
    g.append("text")
      .attr("x", tScale(tSwitch)).attr("y", -5)
      .attr("text-anchor", "middle").attr("fill", "#6366f1").attr("font-size", "10px").attr("font-weight", "600")
      .text(`t = ${tSwitch.toFixed(1)}s`);

    // Area labels
    const area1Val = a1 * tSwitch;
    g.append("text")
      .attr("x", tScale(tSwitch / 2)).attr("y", aScale(a1 / 2))
      .attr("text-anchor", "middle").attr("fill", area1Color).attr("font-size", "12px").attr("font-weight", "700")
      .text(`Δv₁ = ${area1Val.toFixed(1)}`);

    const area2Val = a2 * (tMax - tSwitch);
    g.append("text")
      .attr("x", tScale(tSwitch + (tMax - tSwitch) / 2)).attr("y", aScale(a2 / 2))
      .attr("text-anchor", "middle").attr("fill", area2Color).attr("font-size", "12px").attr("font-weight", "700")
      .text(`Δv₂ = ${area2Val.toFixed(1)}`);

    // Phase dots
    g.append("circle").attr("cx", tScale(0)).attr("cy", aScale(a1)).attr("r", 4).attr("fill", "#f59e0b");
    g.append("circle").attr("cx", tScale(tSwitch)).attr("cy", aScale(a1)).attr("r", 4).attr("fill", "#f59e0b");
    g.append("circle").attr("cx", tScale(tSwitch)).attr("cy", aScale(a2)).attr("r", 4).attr("fill", "#f59e0b");
    g.append("circle").attr("cx", tScale(tMax)).attr("cy", aScale(a2)).attr("r", 4).attr("fill", "#f59e0b");

  }, [a1, a2, tSwitch]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">
      <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#060e1a] shadow-2xl p-2">
        <div ref={containerRef} className="w-full">
          <svg ref={svgRef} className="w-full" />
        </div>
      </div>

      <div className="space-y-5">
        <p className="text-base text-slate-300 leading-relaxed">
          The <span className="text-amber-400 font-semibold">acceleration–time graph</span> shows
          how acceleration changes over time. The <span className="text-green-400 font-semibold">area under the curve</span> equals
          the <span className="text-cyan-400 font-semibold">change in velocity</span> (Δv).
        </p>

        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Phase 1 Acceleration</label>
          <input type="range" min={-4} max={6} step={0.5} value={a1}
            onChange={(e) => setA1(Number(e.target.value))} className="w-full accent-amber-500" />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>−4</span><span className="text-amber-400 font-semibold">{a1 > 0 ? "+" : ""}{a1.toFixed(1)} m/s²</span><span>+6</span>
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Phase 2 Acceleration</label>
          <input type="range" min={-4} max={6} step={0.5} value={a2}
            onChange={(e) => setA2(Number(e.target.value))} className="w-full accent-rose-500" />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>−4</span><span className="text-rose-400 font-semibold">{a2 > 0 ? "+" : ""}{a2.toFixed(1)} m/s²</span><span>+6</span>
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Switch Time (s)</label>
          <input type="range" min={1} max={9} step={0.5} value={tSwitch}
            onChange={(e) => setTSwitch(Number(e.target.value))} className="w-full accent-indigo-500" />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>1 s</span><span className="text-indigo-400 font-semibold">{tSwitch.toFixed(1)} s</span><span>9 s</span>
          </div>
        </div>

        <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-4">
          <p className="text-xs text-green-400/70 font-bold uppercase tracking-wider mb-1">Total Δv (Area)</p>
          <p className="text-2xl font-extrabold text-green-400 tabular-nums">
            {deltaV > 0 ? "+" : ""}{deltaV.toFixed(1)} <span className="text-sm font-normal text-green-400/60">m/s</span>
          </p>
        </div>

        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">💡 Key Insight</p>
          <p className="text-sm text-slate-300 leading-relaxed">
            Green area = positive Δv (speeding up). Red area = negative Δv (slowing down). Net area = total velocity change.
          </p>
        </div>
      </div>
    </div>
  );
}
