"use client";

import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

/**
 * Velocity vs Time Graph (D3.js).
 * Acceleration slider controls slope. Explains: slope = acceleration.
 */
export default function VelocityTimeGraph() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [accel, setAccel] = useState(2);
  const [v0, setV0] = useState(1);
  const HEIGHT = 360;

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
    const data: { t: number; v: number }[] = [];
    for (let i = 0; i <= 100; i++) {
      const t = (i / 100) * tMax;
      data.push({ t, v: v0 + accel * t });
    }

    const vMin = Math.min(0, d3.min(data, d => d.v)! - 2);
    const vMax = Math.max(10, d3.max(data, d => d.v)! + 2);

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
    g.append("g").attr("transform", `translate(0,${iH})`)
      .call(d3.axisBottom(tScale).ticks(6))
      .selectAll("text").attr("fill", "#94a3b8").attr("font-size", "11px");
    g.append("text").attr("x", iW / 2).attr("y", iH + 40)
      .attr("text-anchor", "middle").attr("fill", "#94a3b8").attr("font-size", "13px").attr("font-weight", "600")
      .text("Time (s)");

    g.append("g").call(d3.axisLeft(vScale).ticks(6))
      .selectAll("text").attr("fill", "#94a3b8").attr("font-size", "11px");
    g.append("text").attr("transform", "rotate(-90)").attr("x", -iH / 2).attr("y", -42)
      .attr("text-anchor", "middle").attr("fill", "#94a3b8").attr("font-size", "13px").attr("font-weight", "600")
      .text("Velocity (m/s)");

    // Gradient
    const defs = svg.append("defs");
    const grad = defs.append("linearGradient").attr("id", "vt-grad")
      .attr("x1", "0%").attr("y1", "0%").attr("x2", "0%").attr("y2", "100%");
    grad.append("stop").attr("offset", "0%").attr("stop-color", "#22d3ee").attr("stop-opacity", 0.25);
    grad.append("stop").attr("offset", "100%").attr("stop-color", "#22d3ee").attr("stop-opacity", 0.01);

    // Glow filter
    const filter = defs.append("filter").attr("id", "vt-glow");
    filter.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "blur");
    const merge = filter.append("feMerge");
    merge.append("feMergeNode").attr("in", "blur");
    merge.append("feMergeNode").attr("in", "SourceGraphic");

    // Area
    const area = d3.area<{ t: number; v: number }>()
      .x(d => tScale(d.t)).y0(vScale(0)).y1(d => vScale(d.v)).curve(d3.curveMonotoneX);
    g.append("path").datum(data).attr("fill", "url(#vt-grad)").attr("d", area);

    // Line
    const line = d3.line<{ t: number; v: number }>()
      .x(d => tScale(d.t)).y(d => vScale(d.v)).curve(d3.curveMonotoneX);
    g.append("path").datum(data)
      .attr("fill", "none").attr("stroke", "#22d3ee").attr("stroke-width", 2.5).attr("d", line)
      .attr("filter", "url(#vt-glow)");

    // Slope annotation line
    const p1 = { t: 2, v: v0 + accel * 2 };
    const p2 = { t: 7, v: v0 + accel * 7 };
    g.append("line")
      .attr("x1", tScale(p1.t)).attr("y1", vScale(p1.v))
      .attr("x2", tScale(p2.t)).attr("y2", vScale(p2.v))
      .attr("stroke", "#f59e0b").attr("stroke-width", 1.5).attr("stroke-dasharray", "6 4").attr("opacity", 0.7);
    g.append("text")
      .attr("x", tScale((p1.t + p2.t) / 2) + 10)
      .attr("y", vScale((p1.v + p2.v) / 2) - 12)
      .attr("fill", "#f59e0b").attr("font-size", "12px").attr("font-weight", "700")
      .text(`slope = a = ${accel.toFixed(1)} m/s²`);

    // Current tip point
    const last = data[data.length - 1];
    g.append("circle")
      .attr("cx", tScale(last.t)).attr("cy", vScale(last.v)).attr("r", 5)
      .attr("fill", "#22d3ee").attr("filter", "url(#vt-glow)");

  }, [accel, v0]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">
      <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#060e1a] shadow-2xl p-2">
        <div ref={containerRef} className="w-full">
          <svg ref={svgRef} className="w-full" />
        </div>
      </div>

      <div className="space-y-5">
        <p className="text-base text-slate-300 leading-relaxed">
          The <span className="text-cyan-400 font-semibold">velocity–time graph</span> shows
          how velocity changes over time. For uniform acceleration, this is a straight line.
        </p>
        <p className="text-sm text-slate-400">
          The <span className="text-amber-400 font-semibold">slope</span> of the v–t graph
          equals the <span className="text-green-400 font-semibold">acceleration</span>.
        </p>

        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Initial Velocity (m/s)</label>
          <input type="range" min={-5} max={10} step={0.5} value={v0}
            onChange={(e) => setV0(Number(e.target.value))} className="w-full accent-cyan-500" />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>−5</span><span className="text-cyan-400 font-semibold">{v0 > 0 ? "+" : ""}{v0.toFixed(1)}</span><span>10</span>
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Acceleration (m/s²)</label>
          <input type="range" min={-4} max={4} step={0.25} value={accel}
            onChange={(e) => setAccel(Number(e.target.value))} className="w-full accent-amber-500" />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>−4</span><span className="text-amber-400 font-semibold">{accel > 0 ? "+" : ""}{accel.toFixed(1)}</span><span>+4</span>
          </div>
        </div>

        <div className="rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-4">
          <p className="text-xs text-cyan-400/70 font-bold uppercase tracking-wider mb-1">💡 Key Insight</p>
          <p className="text-sm text-slate-300 leading-relaxed">
            {accel > 0 ? "Positive slope → positive acceleration → velocity increases linearly."
              : accel < 0 ? "Negative slope → negative acceleration → velocity decreases linearly."
              : "Zero slope → zero acceleration → constant velocity (flat line)."}
          </p>
        </div>
      </div>
    </div>
  );
}
