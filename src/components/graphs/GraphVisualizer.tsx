"use client";

import { useRef, useEffect } from "react";
import * as d3 from "d3";

export interface DataPoint {
  x: number;
  y: number;
}

interface GraphVisualizerProps {
  data: DataPoint[];
  xLabel?: string;
  yLabel?: string;
  /** Line color */
  color?: string;
  /** SVG height */
  height?: number;
  /** Show area fill under the line */
  showArea?: boolean;
}

/**
 * D3.js-based responsive line chart.
 * Plug in any x-y dataset to visualize physics relationships.
 */
export default function GraphVisualizer({
  data,
  xLabel = "x",
  yLabel = "y",
  color = "#6366f1",
  height = 300,
  showArea = true,
}: GraphVisualizerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = containerRef.current.clientWidth;
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    svg.attr("width", width).attr("height", height);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.x) as [number, number])
      .range([0, innerW])
      .nice();

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.y)!])
      .range([innerH, 0])
      .nice();

    // Grid lines
    g.append("g")
      .attr("class", "grid")
      .call(
        d3
          .axisLeft(yScale)
          .tickSize(-innerW)
          .tickFormat(() => "")
      )
      .selectAll("line")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-dasharray", "3,3");

    g.selectAll(".grid .domain").remove();

    // X axis
    g.append("g")
      .attr("transform", `translate(0,${innerH})`)
      .call(d3.axisBottom(xScale).ticks(6))
      .selectAll("text")
      .attr("fill", "#64748b")
      .attr("font-size", "12px");

    g.append("text")
      .attr("x", innerW / 2)
      .attr("y", innerH + 40)
      .attr("text-anchor", "middle")
      .attr("fill", "#64748b")
      .attr("font-size", "13px")
      .attr("font-weight", "500")
      .text(xLabel);

    // Y axis
    g.append("g")
      .call(d3.axisLeft(yScale).ticks(5))
      .selectAll("text")
      .attr("fill", "#64748b")
      .attr("font-size", "12px");

    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerH / 2)
      .attr("y", -45)
      .attr("text-anchor", "middle")
      .attr("fill", "#64748b")
      .attr("font-size", "13px")
      .attr("font-weight", "500")
      .text(yLabel);

    // Area fill
    if (showArea) {
      const area = d3
        .area<DataPoint>()
        .x((d) => xScale(d.x))
        .y0(innerH)
        .y1((d) => yScale(d.y))
        .curve(d3.curveMonotoneX);

      // Gradient
      const gradientId = "area-gradient";
      const defs = svg.append("defs");
      const gradient = defs
        .append("linearGradient")
        .attr("id", gradientId)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%");
      gradient.append("stop").attr("offset", "0%").attr("stop-color", color).attr("stop-opacity", 0.3);
      gradient.append("stop").attr("offset", "100%").attr("stop-color", color).attr("stop-opacity", 0.02);

      g.append("path")
        .datum(data)
        .attr("fill", `url(#${gradientId})`)
        .attr("d", area);
    }

    // Line
    const line = d3
      .line<DataPoint>()
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", 2.5)
      .attr("d", line);

    // Dots
    g.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d.x))
      .attr("cy", (d) => yScale(d.y))
      .attr("r", 3.5)
      .attr("fill", "white")
      .attr("stroke", color)
      .attr("stroke-width", 2);

    // Tooltip
    const tooltip = d3
      .select(containerRef.current)
      .append("div")
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("background", "#1e293b")
      .style("color", "#f1f5f9")
      .style("padding", "6px 10px")
      .style("border-radius", "8px")
      .style("font-size", "12px")
      .style("opacity", "0")
      .style("transition", "opacity 0.15s");

    g.selectAll("circle")
      .on("mouseover", function (event, d) {
        const dp = d as DataPoint;
        tooltip
          .style("opacity", "1")
          .html(`${xLabel}: ${dp.x.toFixed(1)}<br/>${yLabel}: ${dp.y.toFixed(1)}`)
          .style("left", `${event.offsetX + 12}px`)
          .style("top", `${event.offsetY - 30}px`);
        d3.select(this).attr("r", 5).attr("fill", color);
      })
      .on("mouseout", function () {
        tooltip.style("opacity", "0");
        d3.select(this).attr("r", 3.5).attr("fill", "white");
      });

    return () => {
      tooltip.remove();
    };
  }, [data, xLabel, yLabel, color, height, showArea]);

  return (
    <div className="rounded-2xl border border-border bg-surface-card p-4 shadow-sm">
      <div ref={containerRef} className="relative w-full">
        <svg ref={svgRef} className="w-full" />
      </div>
    </div>
  );
}
