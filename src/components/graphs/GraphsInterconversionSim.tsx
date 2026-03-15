"use client";

import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

/**
 * Graphs Interconversion — shows x-t, v-t, a-t side by side.
 * Demonstrates how to derive one from another via slope/area.
 */
export default function GraphsInterconversionSim() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [u, setU] = useState(2);
  const [a, setA] = useState(1.5);
  const [tCursor, setTCursor] = useState(4);
  const HEIGHT = 440;
  const tMax = 8;

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = containerRef.current.clientWidth;
    const m = { top: 16, right: 16, bottom: 36, left: 40 };
    const gapY = 20;
    const panelH = (HEIGHT - m.top - m.bottom - gapY * 2) / 3;
    const iW = width - m.left - m.right;

    svg.attr("width", width).attr("height", HEIGHT);

    const tScale = d3.scaleLinear().domain([0, tMax]).range([0, iW]);
    const steps = 100;

    // Data
    const data = Array.from({ length: steps + 1 }).map((_, i) => {
      const t = (i / steps) * tMax;
      return {
        t,
        x: u * t + 0.5 * a * t * t,
        v: u + a * t,
        a: a,
      };
    });

    const defs = svg.append("defs");
    const filter = defs.append("filter").attr("id", "gi-glow");
    filter.append("feGaussianBlur").attr("stdDeviation", "2").attr("result", "blur");
    const merge = filter.append("feMerge");
    merge.append("feMergeNode").attr("in", "blur");
    merge.append("feMergeNode").attr("in", "SourceGraphic");

    const panels = [
      { label: "x(t) — Position", key: "x" as const, color: "#6366f1", yData: data.map(d => d.x) },
      { label: "v(t) — Velocity  [slope of x-t]", key: "v" as const, color: "#22d3ee", yData: data.map(d => d.v) },
      { label: "a(t) — Acceleration  [slope of v-t]", key: "a" as const, color: "#f59e0b", yData: data.map(d => d.a) },
    ];

    panels.forEach((panel, idx) => {
      const yOff = m.top + idx * (panelH + gapY);
      const g = svg.append("g").attr("transform", `translate(${m.left},${yOff})`);

      const yMin = d3.min(panel.yData) ?? 0;
      const yMax = d3.max(panel.yData) ?? 1;
      const pad = Math.max((yMax - yMin) * 0.15, 0.5);
      const yScale = d3.scaleLinear().domain([yMin - pad, yMax + pad]).range([panelH, 0]);

      // Panel bg
      g.append("rect").attr("width", iW).attr("height", panelH).attr("fill", "#0a1628").attr("rx", 6);

      // Grid
      g.append("g").call(d3.axisLeft(yScale).ticks(3).tickSize(-iW).tickFormat(() => ""))
        .selectAll("line").attr("stroke", "#1e293b").attr("stroke-dasharray", "2,4");
      g.selectAll(".domain").remove();

      // Axes
      g.append("g").attr("transform", `translate(0,${panelH})`).call(d3.axisBottom(tScale).ticks(4).tickSize(0))
        .selectAll("text").attr("fill", "#64748b").attr("font-size", "9px");
      g.append("g").call(d3.axisLeft(yScale).ticks(3).tickSize(0))
        .selectAll("text").attr("fill", "#64748b").attr("font-size", "9px");

      // Line
      const line = d3.line<number>()
        .x((_, i) => tScale((i / steps) * tMax))
        .y(d => yScale(d))
        .curve(panel.key === "a" ? d3.curveStepAfter : d3.curveMonotoneX);
      g.append("path").datum(panel.yData)
        .attr("fill", "none").attr("stroke", panel.color).attr("stroke-width", 2).attr("d", line)
        .attr("filter", "url(#gi-glow)");

      // Cursor
      const ci = Math.round((tCursor / tMax) * steps);
      const cy = panel.yData[ci] ?? 0;
      g.append("line")
        .attr("x1", tScale(tCursor)).attr("y1", 0).attr("x2", tScale(tCursor)).attr("y2", panelH)
        .attr("stroke", "#f59e0b").attr("stroke-width", 1).attr("stroke-dasharray", "3 2").attr("opacity", 0.4);
      g.append("circle")
        .attr("cx", tScale(tCursor)).attr("cy", yScale(cy)).attr("r", 4)
        .attr("fill", panel.color).attr("filter", "url(#gi-glow)");
      g.append("text")
        .attr("x", tScale(tCursor) + 8).attr("y", yScale(cy) - 5)
        .attr("fill", panel.color).attr("font-size", "10px").attr("font-weight", "700")
        .text(cy.toFixed(1));

      // Label
      g.append("text")
        .attr("x", 6).attr("y", 14)
        .attr("fill", panel.color).attr("font-size", "10px").attr("font-weight", "700")
        .text(panel.label);

      // Annotations between panels
      if (idx < 2) {
        const arrowY = yOff + panelH + gapY / 2;
        svg.append("text")
          .attr("x", m.left + iW / 2).attr("y", arrowY + 4)
          .attr("text-anchor", "middle").attr("fill", "#475569").attr("font-size", "10px")
          .text(idx === 0 ? "↓ slope = velocity" : "↓ slope = acceleration");
        svg.append("text")
          .attr("x", m.left + iW / 2 + 140).attr("y", arrowY + 4)
          .attr("text-anchor", "middle").attr("fill", "#475569").attr("font-size", "10px")
          .text(idx === 0 ? "↑ area = displacement" : "↑ area = Δv");
      }
    });

  }, [u, a, tCursor]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-8 items-start">
      <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#060e1a] shadow-2xl p-2">
        <div ref={containerRef} className="w-full">
          <svg ref={svgRef} className="w-full" />
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-base text-slate-300 leading-relaxed">
          <span className="text-indigo-400 font-semibold">Graphs Interconversion</span> —
          see how x-t, v-t, and a-t graphs relate via
          <span className="text-cyan-400"> slope</span> and <span className="text-green-400">area</span>.
        </p>

        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Initial Velocity u</label>
          <input type="range" min={-3} max={6} step={0.5} value={u}
            onChange={(e) => setU(Number(e.target.value))} className="w-full accent-cyan-500" />
          <div className="flex justify-between text-xs text-slate-500">
            <span>−3</span><span className="text-cyan-400 font-semibold">{u.toFixed(1)}</span><span>6</span>
          </div>
        </div>
        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Acceleration a</label>
          <input type="range" min={-3} max={4} step={0.25} value={a}
            onChange={(e) => setA(Number(e.target.value))} className="w-full accent-amber-500" />
          <div className="flex justify-between text-xs text-slate-500">
            <span>−3</span><span className="text-amber-400 font-semibold">{a > 0 ? "+" : ""}{a.toFixed(1)}</span><span>4</span>
          </div>
        </div>
        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Time Cursor</label>
          <input type="range" min={0.5} max={7.5} step={0.25} value={tCursor}
            onChange={(e) => setTCursor(Number(e.target.value))} className="w-full accent-rose-500" />
          <div className="flex justify-between text-xs text-slate-500">
            <span>0.5s</span><span className="text-rose-400 font-semibold">{tCursor.toFixed(1)}s</span><span>7.5s</span>
          </div>
        </div>

        <div className="rounded-xl bg-white/5 border border-white/10 p-3 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-indigo-400">x(t)</span>
            <span className="text-indigo-400 font-bold tabular-nums">{(u * tCursor + 0.5 * a * tCursor * tCursor).toFixed(1)} m</span>
          </div>
          <div className="flex justify-between">
            <span className="text-cyan-400">v(t)</span>
            <span className="text-cyan-400 font-bold tabular-nums">{(u + a * tCursor).toFixed(1)} m/s</span>
          </div>
          <div className="flex justify-between">
            <span className="text-amber-400">a(t)</span>
            <span className="text-amber-400 font-bold tabular-nums">{a.toFixed(1)} m/s²</span>
          </div>
        </div>

        <div className="rounded-xl bg-indigo-500/10 border border-indigo-500/20 p-3">
          <p className="text-xs text-indigo-400/70 font-bold uppercase tracking-wider mb-1">💡 Key Relations</p>
          <p className="text-sm text-slate-300 leading-relaxed">
            <strong>slope</strong> of x-t = v &nbsp;|&nbsp; <strong>slope</strong> of v-t = a<br />
            <strong>area</strong> under v-t = Δx &nbsp;|&nbsp; <strong>area</strong> under a-t = Δv
          </p>
        </div>
      </div>
    </div>
  );
}
