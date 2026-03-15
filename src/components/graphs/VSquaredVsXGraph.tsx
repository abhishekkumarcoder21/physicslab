"use client";

import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

/**
 * v² vs Position Graph (D3.js).
 * slope = 2a. Demonstrates v² = u² + 2as.
 */
export default function VSquaredVsXGraph() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [u, setU] = useState(3);
  const [accel, setAccel] = useState(2);
  const HEIGHT = 380;

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = containerRef.current.clientWidth;
    const m = { top: 20, right: 30, bottom: 50, left: 70 };
    const iW = width - m.left - m.right;
    const iH = HEIGHT - m.top - m.bottom;

    svg.attr("width", width).attr("height", HEIGHT);
    const g = svg.append("g").attr("transform", `translate(${m.left},${m.top})`);

    const xMax = 50;
    const data: { x: number; vSq: number }[] = [];
    for (let i = 0; i <= 100; i++) {
      const x = (i / 100) * xMax;
      const vSq = u * u + 2 * accel * x;
      if (vSq >= 0) data.push({ x, vSq });
    }

    const vSqMax = Math.max(d3.max(data, d => d.vSq) ?? 100, 20);

    const xScale = d3.scaleLinear().domain([0, xMax]).range([0, iW]);
    const yScale = d3.scaleLinear().domain([0, vSqMax * 1.1]).range([iH, 0]);

    // Grid
    g.append("g").call(d3.axisLeft(yScale).tickSize(-iW).tickFormat(() => ""))
      .selectAll("line").attr("stroke", "#1e293b").attr("stroke-dasharray", "2,4");
    g.selectAll(".domain").attr("stroke", "#334155");

    // Axes
    g.append("g").attr("transform", `translate(0,${iH})`).call(d3.axisBottom(xScale).ticks(6))
      .selectAll("text").attr("fill", "#94a3b8").attr("font-size", "11px");
    g.append("text").attr("x", iW / 2).attr("y", iH + 40)
      .attr("text-anchor", "middle").attr("fill", "#94a3b8").attr("font-size", "13px").attr("font-weight", "600")
      .text("Position x (m)");

    g.append("g").call(d3.axisLeft(yScale).ticks(6))
      .selectAll("text").attr("fill", "#94a3b8").attr("font-size", "11px");
    g.append("text").attr("transform", "rotate(-90)").attr("x", -iH / 2).attr("y", -52)
      .attr("text-anchor", "middle").attr("fill", "#94a3b8").attr("font-size", "13px").attr("font-weight", "600")
      .text("v² (m²/s²)");

    const defs = svg.append("defs");

    // Gradient fill
    const grad = defs.append("linearGradient").attr("id", "vsq-grad")
      .attr("x1", "0%").attr("y1", "0%").attr("x2", "0%").attr("y2", "100%");
    grad.append("stop").attr("offset", "0%").attr("stop-color", "#f59e0b").attr("stop-opacity", 0.2);
    grad.append("stop").attr("offset", "100%").attr("stop-color", "#f59e0b").attr("stop-opacity", 0.02);

    // Glow
    const filter = defs.append("filter").attr("id", "vsq-glow");
    filter.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "blur");
    const merge = filter.append("feMerge");
    merge.append("feMergeNode").attr("in", "blur");
    merge.append("feMergeNode").attr("in", "SourceGraphic");

    // Area fill
    const area = d3.area<{ x: number; vSq: number }>()
      .x(d => xScale(d.x)).y0(yScale(0)).y1(d => yScale(d.vSq)).curve(d3.curveMonotoneX);
    g.append("path").datum(data).attr("fill", "url(#vsq-grad)").attr("d", area);

    // Line
    const line = d3.line<{ x: number; vSq: number }>()
      .x(d => xScale(d.x)).y(d => yScale(d.vSq)).curve(d3.curveMonotoneX);
    g.append("path").datum(data)
      .attr("fill", "none").attr("stroke", "#f59e0b").attr("stroke-width", 2.5).attr("d", line)
      .attr("filter", "url(#vsq-glow)");

    // Intercept marker (u²)
    const uSq = u * u;
    g.append("circle")
      .attr("cx", xScale(0)).attr("cy", yScale(uSq)).attr("r", 5)
      .attr("fill", "#22d3ee").attr("filter", "url(#vsq-glow)");
    g.append("text")
      .attr("x", xScale(0) + 10).attr("y", yScale(uSq) - 8)
      .attr("fill", "#22d3ee").attr("font-size", "11px").attr("font-weight", "700")
      .text(`u² = ${uSq.toFixed(1)}`);

    // Slope annotation
    const p1x = 10, p2x = 35;
    const p1vSq = u * u + 2 * accel * p1x;
    const p2vSq = u * u + 2 * accel * p2x;
    if (p1vSq >= 0 && p2vSq >= 0) {
      g.append("line")
        .attr("x1", xScale(p1x)).attr("y1", yScale(p1vSq))
        .attr("x2", xScale(p2x)).attr("y2", yScale(p2vSq))
        .attr("stroke", "#22c55e").attr("stroke-width", 1.5).attr("stroke-dasharray", "6 4").attr("opacity", 0.7);
      g.append("text")
        .attr("x", xScale((p1x + p2x) / 2) + 10)
        .attr("y", yScale((p1vSq + p2vSq) / 2) - 12)
        .attr("fill", "#22c55e").attr("font-size", "12px").attr("font-weight", "700")
        .text(`slope = 2a = ${(2 * accel).toFixed(1)}`);
    }

    // End point
    const last = data[data.length - 1];
    if (last) {
      g.append("circle")
        .attr("cx", xScale(last.x)).attr("cy", yScale(last.vSq)).attr("r", 4)
        .attr("fill", "#f59e0b").attr("filter", "url(#vsq-glow)");
    }

  }, [u, accel]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">
      <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#060e1a] shadow-2xl p-2">
        <div ref={containerRef} className="w-full">
          <svg ref={svgRef} className="w-full" />
        </div>
      </div>

      <div className="space-y-5">
        <p className="text-base text-slate-300 leading-relaxed">
          The <span className="text-amber-400 font-semibold">v² vs x graph</span> is a straight line
          for uniform acceleration. Its <span className="text-green-400 font-semibold">slope = 2a</span> and
          y-intercept = <span className="text-cyan-400">u²</span>.
        </p>
        <p className="text-sm text-slate-400 font-mono">v² = u² + 2ax</p>

        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Initial Speed u (m/s)</label>
          <input type="range" min={0} max={10} step={0.5} value={u}
            onChange={(e) => setU(Number(e.target.value))} className="w-full accent-cyan-500" />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>0</span><span className="text-cyan-400 font-semibold">{u.toFixed(1)}</span><span>10</span>
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Acceleration (m/s²)</label>
          <input type="range" min={-3} max={5} step={0.25} value={accel}
            onChange={(e) => setAccel(Number(e.target.value))} className="w-full accent-amber-500" />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>−3</span><span className="text-amber-400 font-semibold">{accel > 0 ? "+" : ""}{accel.toFixed(1)}</span><span>+5</span>
          </div>
        </div>

        <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Slope (2a)</span>
            <span className="text-green-400 font-bold tabular-nums">{(2 * accel).toFixed(1)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">y-intercept (u²)</span>
            <span className="text-cyan-400 font-bold tabular-nums">{(u * u).toFixed(1)}</span>
          </div>
        </div>

        <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
          <p className="text-xs text-amber-400/70 font-bold uppercase tracking-wider mb-1">💡 JEE Tip</p>
          <p className="text-sm text-slate-300 leading-relaxed">
            Negative slope → deceleration. If v² hits zero, the particle stops.
            The x-intercept gives the stopping distance!
          </p>
        </div>
      </div>
    </div>
  );
}
