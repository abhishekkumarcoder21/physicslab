"use client";

import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

/**
 * Position vs Time graph (D3.js).
 * User controls velocity — graph plots x(t) in real time.
 * Explains: slope = velocity.
 */
export default function PositionTimeGraph() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [velocity, setVelocity] = useState(3);
  const [dataPoints, setDataPoints] = useState<{ t: number; x: number }[]>([]);
  const animRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const HEIGHT = 360;

  // Restart data when velocity changes
  useEffect(() => {
    setDataPoints([]);
    startTimeRef.current = performance.now();

    function accum() {
      const elapsed = (performance.now() - startTimeRef.current) / 1000;
      if (elapsed > 12) {
        // Reset after 12 seconds
        startTimeRef.current = performance.now();
        setDataPoints([]);
      }
      setDataPoints((prev) => [
        ...prev,
        { t: elapsed, x: velocity * elapsed },
      ]);
      animRef.current = requestAnimationFrame(accum);
    }
    animRef.current = requestAnimationFrame(accum);
    return () => cancelAnimationFrame(animRef.current);
  }, [velocity]);

  // D3 render
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || dataPoints.length < 2) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = containerRef.current.clientWidth;
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const iW = width - margin.left - margin.right;
    const iH = HEIGHT - margin.top - margin.bottom;

    svg.attr("width", width).attr("height", HEIGHT);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const tMax = Math.max(10, d3.max(dataPoints, (d) => d.t)! + 1);
    const xMax = Math.max(20, d3.max(dataPoints, (d) => d.x)! + 5);

    const tScale = d3.scaleLinear().domain([0, tMax]).range([0, iW]);
    const xScale = d3.scaleLinear().domain([0, xMax]).range([iH, 0]);

    // Grid
    g.append("g")
      .call(
        d3
          .axisLeft(xScale)
          .tickSize(-iW)
          .tickFormat(() => "")
      )
      .selectAll("line")
      .attr("stroke", "#1e293b")
      .attr("stroke-dasharray", "2,4");
    g.selectAll(".domain").attr("stroke", "#334155");

    // X axis
    g.append("g")
      .attr("transform", `translate(0,${iH})`)
      .call(d3.axisBottom(tScale).ticks(6))
      .selectAll("text")
      .attr("fill", "#94a3b8")
      .attr("font-size", "11px");
    g.append("text")
      .attr("x", iW / 2)
      .attr("y", iH + 40)
      .attr("text-anchor", "middle")
      .attr("fill", "#94a3b8")
      .attr("font-size", "13px")
      .attr("font-weight", "600")
      .text("Time (s)");

    // Y axis
    g.append("g")
      .call(d3.axisLeft(xScale).ticks(5))
      .selectAll("text")
      .attr("fill", "#94a3b8")
      .attr("font-size", "11px");
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -iH / 2)
      .attr("y", -42)
      .attr("text-anchor", "middle")
      .attr("fill", "#94a3b8")
      .attr("font-size", "13px")
      .attr("font-weight", "600")
      .text("Position (m)");

    // Area gradient
    const defs = svg.append("defs");
    const grad = defs
      .append("linearGradient")
      .attr("id", "xt-grad")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
    grad.append("stop").attr("offset", "0%").attr("stop-color", "#6366f1").attr("stop-opacity", 0.25);
    grad.append("stop").attr("offset", "100%").attr("stop-color", "#6366f1").attr("stop-opacity", 0.01);

    // Area
    const area = d3
      .area<{ t: number; x: number }>()
      .x((d) => tScale(d.t))
      .y0(iH)
      .y1((d) => xScale(d.x))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(dataPoints)
      .attr("fill", "url(#xt-grad)")
      .attr("d", area);

    // Line
    const line = d3
      .line<{ t: number; x: number }>()
      .x((d) => tScale(d.t))
      .y((d) => xScale(d.x))
      .curve(d3.curveMonotoneX);

    // Glow filter
    const filter = defs.append("filter").attr("id", "line-glow");
    filter.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "blur");
    const merge = filter.append("feMerge");
    merge.append("feMergeNode").attr("in", "blur");
    merge.append("feMergeNode").attr("in", "SourceGraphic");

    g.append("path")
      .datum(dataPoints)
      .attr("fill", "none")
      .attr("stroke", "#818cf8")
      .attr("stroke-width", 2.5)
      .attr("d", line)
      .attr("filter", "url(#line-glow)");

    // Current point
    const last = dataPoints[dataPoints.length - 1];
    g.append("circle")
      .attr("cx", tScale(last.t))
      .attr("cy", xScale(last.x))
      .attr("r", 5)
      .attr("fill", "#22d3ee")
      .attr("filter", "url(#line-glow)");

    // Slope annotation
    if (dataPoints.length > 20) {
      const p1 = dataPoints[Math.floor(dataPoints.length * 0.2)];
      const p2 = dataPoints[Math.floor(dataPoints.length * 0.8)];
      g.append("line")
        .attr("x1", tScale(p1.t))
        .attr("y1", xScale(p1.x))
        .attr("x2", tScale(p2.t))
        .attr("y2", xScale(p2.x))
        .attr("stroke", "#f59e0b")
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "6 4")
        .attr("opacity", 0.6);

      g.append("text")
        .attr("x", tScale((p1.t + p2.t) / 2) + 10)
        .attr("y", xScale((p1.x + p2.x) / 2) - 10)
        .attr("fill", "#f59e0b")
        .attr("font-size", "12px")
        .attr("font-weight", "700")
        .text(`slope = v = ${velocity.toFixed(1)} m/s`);
    }
  }, [dataPoints, velocity]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
      {/* Graph */}
      <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#060e1a] shadow-2xl p-2">
        <div ref={containerRef} className="w-full">
          <svg ref={svgRef} className="w-full" />
        </div>
      </div>

      {/* Explanation + control */}
      <div className="space-y-5">
        <p className="text-base text-slate-300 leading-relaxed">
          The <span className="text-indigo-400 font-semibold">position–time graph</span>{" "}
          plots an object&apos;s position as time passes. For uniform motion, this is a
          straight line.
        </p>
        <p className="text-sm text-slate-400 leading-relaxed">
          The <span className="text-amber-400 font-semibold">slope</span> of the
          x–t graph equals the <span className="text-cyan-400 font-semibold">velocity</span>.
          A steeper slope = faster motion.
        </p>

        {/* Velocity control */}
        <div>
          <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
            Velocity (m/s)
          </label>
          <input
            type="range"
            min={-8}
            max={8}
            step={0.5}
            value={velocity}
            onChange={(e) => setVelocity(Number(e.target.value))}
            className="w-full accent-indigo-500"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>−8</span>
            <span className="text-indigo-400 font-semibold">
              {velocity > 0 ? "+" : ""}
              {velocity.toFixed(1)} m/s
            </span>
            <span>+8</span>
          </div>
        </div>

        {/* Insight card */}
        <div className="rounded-xl bg-indigo-500/10 border border-indigo-500/20 p-4">
          <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider mb-1">
            Key Insight
          </p>
          <p className="text-sm text-slate-300">
            {velocity > 0
              ? "Positive velocity → position increases → upward slope."
              : velocity < 0
              ? "Negative velocity → position decreases → downward slope."
              : "Zero velocity → object at rest → flat line (no slope)."}
          </p>
        </div>
      </div>
    </div>
  );
}
