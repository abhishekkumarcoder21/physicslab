"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  ParticleBody,
  PhysicsControls,
  usePhysicsUpdate,
  SliderDef,
} from "@/components/physics-engine";

// Dynamic import to avoid SSR issues with Three.js
const PhysicsWorld = dynamic(
  () => import("@/components/physics-engine/PhysicsWorld"),
  { ssr: false }
);

/**
 * Physics Engine Demo — showcases the reusable engine.
 * A particle moves in 2D with configurable velocity & acceleration,
 * displaying velocity arrow, acceleration arrow, and motion trail.
 */
export default function PhysicsEngineDemo() {
  const [playing, setPlaying] = useState(true);
  const [vx, setVx] = useState(5);
  const [vy, setVy] = useState(3);
  const [ax, setAx] = useState(0);
  const [ay, setAy] = useState(-2);

  const physics = usePhysicsUpdate();
  const particleRef = useRef<ParticleBody | null>(null);
  const [, forceRender] = useState(0);

  // Init particle
  useEffect(() => {
    const id = physics.addParticle({
      id: "demo",
      position: { x: -20, y: 0, z: 0 },
      velocity: { x: vx, y: vy, z: 0 },
      acceleration: { x: ax, y: ay, z: 0 },
      color: "#a78bfa",
      trailColor: "#6366f1",
      radius: 0.5,
      showVelocity: true,
      showAcceleration: true,
      showTrail: true,
      trailLength: 600,
    });
    particleRef.current = physics.getParticle(id) || null;
    return () => physics.removeParticle(id);
  }, []);

  // Sync params on slider change
  useEffect(() => {
    const p = particleRef.current;
    if (!p) return;
    p.setVelocity({ x: vx, y: vy, z: 0 });
    p.setAcceleration({ x: ax, y: ay, z: 0 });
  }, [vx, vy, ax, ay]);

  // Frame update
  const handleUpdate = useCallback(
    (dt: number) => {
      physics.step(dt);

      // Bounds check — reset if way off screen
      const p = particleRef.current;
      if (p && (Math.abs(p.position.x) > 60 || Math.abs(p.position.y) > 60)) {
        p.reset({
          position: { x: -20, y: 0, z: 0 },
          velocity: { x: vx, y: vy, z: 0 },
          acceleration: { x: ax, y: ay, z: 0 },
        });
      }

      forceRender((n) => n + 1);
    },
    [physics, vx, vy, ax, ay]
  );

  const handleReset = useCallback(() => {
    const p = particleRef.current;
    if (p) {
      p.reset({
        position: { x: -20, y: 0, z: 0 },
        velocity: { x: vx, y: vy, z: 0 },
        acceleration: { x: ax, y: ay, z: 0 },
      });
    }
  }, [vx, vy, ax, ay]);

  // Slider config
  const sliders: SliderDef[] = [
    { id: "vx", label: "Velocity X (m/s)", min: -10, max: 10, step: 0.5, value: vx, color: "#22d3ee", unit: "m/s" },
    { id: "vy", label: "Velocity Y (m/s)", min: -10, max: 10, step: 0.5, value: vy, color: "#22d3ee", unit: "m/s" },
    { id: "ax", label: "Acceleration X (m/s²)", min: -5, max: 5, step: 0.25, value: ax, color: "#f59e0b", unit: "m/s²" },
    { id: "ay", label: "Acceleration Y (m/s²)", min: -5, max: 5, step: 0.25, value: ay, color: "#f59e0b", unit: "m/s²" },
  ];

  const handleSliderChange = useCallback((id: string, val: number) => {
    switch (id) {
      case "vx": setVx(val); break;
      case "vy": setVy(val); break;
      case "ax": setAx(val); break;
      case "ay": setAy(val); break;
    }
  }, []);

  const p = particleRef.current;
  const speed = p ? p.speed.toFixed(1) : "0.0";
  const pos = p ? `(${p.position.x.toFixed(1)}, ${p.position.y.toFixed(1)})` : "(0, 0)";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
      {/* Simulation Canvas */}
      <PhysicsWorld
        height={450}
        backgroundColor="#060e1a"
        cameraZ={35}
        mode2D
        showGrid
        gridSize={60}
        running={playing}
        particles={p ? [p] : []}
        onUpdate={handleUpdate}
      />

      {/* Controls + Readouts */}
      <div className="space-y-5">
        <p className="text-base text-slate-300 leading-relaxed">
          <span className="text-indigo-400 font-semibold">Physics Engine Demo</span> —
          configure velocity &amp; acceleration to see the particle move with
          <span className="text-cyan-400"> velocity arrow</span>,
          <span className="text-amber-400"> acceleration arrow</span>, and
          <span className="text-indigo-400"> motion trail</span>.
        </p>

        <PhysicsControls
          sliders={sliders}
          onChange={handleSliderChange}
          playing={playing}
          onTogglePlay={() => setPlaying(!playing)}
          onReset={handleReset}
        />

        {/* Live readout */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Position</span>
            <span className="text-indigo-400 font-bold tabular-nums">{pos}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Speed</span>
            <span className="text-cyan-400 font-bold tabular-nums">{speed} m/s</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Time</span>
            <span className="text-slate-300 font-bold tabular-nums">{physics.timeRef.current.toFixed(1)} s</span>
          </div>
        </div>

        <div className="rounded-xl bg-indigo-500/10 border border-indigo-500/20 p-4">
          <p className="text-xs text-indigo-400/70 font-bold uppercase tracking-wider mb-1">🔧 Engine Architecture</p>
          <p className="text-sm text-slate-300 leading-relaxed">
            This demo uses <strong className="text-white">PhysicsWorld</strong>,{" "}
            <strong className="text-white">ParticleBody</strong>,{" "}
            <strong className="text-white">PhysicsControls</strong>, and{" "}
            <strong className="text-white">usePhysicsUpdate</strong> — all from the
            reusable engine. Future sims just configure parameters.
          </p>
        </div>
      </div>
    </div>
  );
}
