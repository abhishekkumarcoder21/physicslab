import StarfieldBackground from "@/components/simulation/StarfieldBackground";
import InteractiveConceptSection from "@/components/learning/InteractiveConceptSection";
import RestVsMotionSim from "@/components/simulation/RestVsMotionSim";
import DistanceSim from "@/components/simulation/DistanceSim";
import DisplacementSim from "@/components/simulation/DisplacementSim";
import DistanceDisplacementSim from "@/components/simulation/DistanceDisplacementSim";
import AverageSpeedSim from "@/components/simulation/AverageSpeedSim";
import AverageVelocitySim from "@/components/simulation/AverageVelocitySim";
import InstantaneousVelocitySim from "@/components/simulation/InstantaneousVelocitySim";
import TurningPointSim from "@/components/simulation/TurningPointSim";
import AccelerationSim from "@/components/simulation/AccelerationSim";
import AverageAccelerationSim from "@/components/simulation/AverageAccelerationSim";
import InstantaneousAccelerationSim from "@/components/simulation/InstantaneousAccelerationSim";
import SpeedVelocitySim from "@/components/simulation/SpeedVelocitySim";
import PositionTimeGraph from "@/components/graphs/PositionTimeGraph";
import VelocityTimeGraph from "@/components/graphs/VelocityTimeGraph";
import AreaUnderVTGraph from "@/components/graphs/AreaUnderVTGraph";
import PhysicsEngineDemo from "@/components/simulation/PhysicsEngineDemo";
import ProjectileMotionSim from "@/components/simulation/ProjectileMotionSim";
import RelativeMotionEngineSim from "@/components/simulation/RelativeMotionEngineSim";
import GravityMotionSim from "@/components/simulation/GravityMotionSim";
import EquationsOfMotionSim from "@/components/simulation/EquationsOfMotionSim";
import AccelerationTimeGraph from "@/components/graphs/AccelerationTimeGraph";
import VSquaredVsXGraph from "@/components/graphs/VSquaredVsXGraph";
import VariableAccelerationSim from "@/components/simulation/VariableAccelerationSim";
import MinDistanceSim from "@/components/simulation/MinDistanceSim";

export default function KinematicsPage() {
  return (
    <div className="w-full overflow-x-hidden bg-[#030712] text-white">
      {/* ━━━━━ HERO ━━━━━ */}
      <StarfieldBackground height="100vh" count={1400} speed={0.25}>
        <div className="text-center px-6 max-w-3xl mx-auto animate-fade-in">
          <p className="text-sm font-bold tracking-[0.35em] uppercase text-cyan-400/70 mb-4">
            Chapter 01 — Kinematics
          </p>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-b from-white via-indigo-100 to-indigo-400/60 bg-clip-text text-transparent">
            Explore Motion
          </h1>
          <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-xl mx-auto mb-10">
            From galaxies spinning across the cosmos to electrons orbiting atoms
            — motion is the heartbeat of the universe. Scroll down to uncover the
            physics that governs it all.
          </p>
          <div className="flex justify-center">
            <svg className="w-6 h-6 text-indigo-400/60 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </StarfieldBackground>

      {/* ═══════ MODULE 01 — MOTION FUNDAMENTALS ═══════ */}
      <div className="w-full py-16 text-center bg-gradient-to-b from-[#030712] via-[#0a1628] to-[#0f172a]">
        <p className="text-xs font-bold tracking-[0.4em] uppercase text-indigo-400/50 mb-3">Module 01</p>
        <h2 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-indigo-300 via-white to-cyan-300 bg-clip-text text-transparent">
          Motion Fundamentals
        </h2>
        <p className="text-slate-500 text-sm mt-3 max-w-md mx-auto">
          Understand the building blocks: rest, motion, distance, and displacement.
        </p>
      </div>

      <InteractiveConceptSection tag="Concept 01" title="Rest & Motion Are Relative">
        <RestVsMotionSim />
      </InteractiveConceptSection>

      <InteractiveConceptSection tag="Concept 02" title="Distance — Total Path Length" dark={false}>
        <DistanceSim />
      </InteractiveConceptSection>

      <InteractiveConceptSection tag="Concept 03" title="Displacement — The Shortest Route">
        <DisplacementSim />
      </InteractiveConceptSection>

      <InteractiveConceptSection tag="Concept 04" title="Distance vs Displacement" dark={false}>
        <DistanceDisplacementSim />
      </InteractiveConceptSection>

      {/* ═══════ MODULE 02 — SPEED & VELOCITY ═══════ */}
      <div className="w-full py-16 text-center bg-gradient-to-b from-[#0c1425] via-[#0a1628] to-[#0f172a]">
        <div className="w-20 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent mx-auto mb-6" />
        <p className="text-xs font-bold tracking-[0.4em] uppercase text-cyan-400/50 mb-3">Module 02</p>
        <h2 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-cyan-300 via-white to-indigo-300 bg-clip-text text-transparent">
          Speed &amp; Velocity
        </h2>
        <p className="text-slate-500 text-sm mt-3 max-w-md mx-auto">
          How fast? In which direction? Explore the quantities that describe motion.
        </p>
      </div>

      <InteractiveConceptSection tag="Concept 05" title="Average Speed">
        <AverageSpeedSim />
      </InteractiveConceptSection>

      <InteractiveConceptSection tag="Concept 06" title="Average Velocity" dark={false}>
        <AverageVelocitySim />
      </InteractiveConceptSection>

      <InteractiveConceptSection tag="Concept 07" title="Instantaneous Velocity">
        <InstantaneousVelocitySim />
      </InteractiveConceptSection>

      <InteractiveConceptSection tag="Concept 08" title="Turning Point" dark={false}>
        <TurningPointSim />
      </InteractiveConceptSection>

      {/* ═══════ MODULE 03 — ACCELERATION & MOTION GRAPHS ═══════ */}
      <div className="w-full py-16 text-center bg-gradient-to-b from-[#0c1425] via-[#0a1628] to-[#0f172a]">
        <div className="w-20 h-px bg-gradient-to-r from-transparent via-green-500/30 to-transparent mx-auto mb-6" />
        <p className="text-xs font-bold tracking-[0.4em] uppercase text-green-400/50 mb-3">Module 03</p>
        <h2 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-green-300 via-white to-cyan-300 bg-clip-text text-transparent">
          Acceleration &amp; Motion Graphs
        </h2>
        <p className="text-slate-500 text-sm mt-3 max-w-md mx-auto">
          How does velocity change? Master acceleration and read motion through graphs.
        </p>
      </div>

      <InteractiveConceptSection tag="Concept 09" title="Acceleration — Rate of Change of Velocity">
        <AccelerationSim />
      </InteractiveConceptSection>

      <InteractiveConceptSection tag="Concept 10" title="Average Acceleration" dark={false}>
        <AverageAccelerationSim />
      </InteractiveConceptSection>

      <InteractiveConceptSection tag="Concept 11" title="Instantaneous Acceleration">
        <InstantaneousAccelerationSim />
      </InteractiveConceptSection>

      <InteractiveConceptSection tag="Graph Analysis" title="Velocity–Time Graph" dark={false}>
        <VelocityTimeGraph />
      </InteractiveConceptSection>

      <InteractiveConceptSection tag="Graph Analysis" title="Area Under v–t Graph = Displacement">
        <AreaUnderVTGraph />
      </InteractiveConceptSection>

      {/* ═══════ CONSTANT ACCELERATION & GRAPH EXTENSIONS ═══════ */}
      <div className="w-full py-16 text-center bg-gradient-to-b from-[#0c1425] via-[#0a1628] to-[#0f172a]">
        <div className="w-20 h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent mx-auto mb-6" />
        <p className="text-xs font-bold tracking-[0.4em] uppercase text-orange-400/50 mb-3">Equations</p>
        <h2 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-orange-300 via-white to-cyan-300 bg-clip-text text-transparent">
          Constant Acceleration Motion
        </h2>
        <p className="text-slate-500 text-sm mt-3 max-w-md mx-auto">
          The three kinematic equations — the backbone of every JEE Kinematics problem.
        </p>
      </div>

      <InteractiveConceptSection tag="Equations" title="Equations of Motion — v, s, v²">
        <EquationsOfMotionSim />
      </InteractiveConceptSection>

      <InteractiveConceptSection tag="Graph Analysis" title="Acceleration–Time Graph — Area = Δv" dark={false}>
        <AccelerationTimeGraph />
      </InteractiveConceptSection>

      {/* ═══════ PHYSICS ENGINE SANDBOX ═══════ */}
      <div className="w-full py-16 text-center bg-gradient-to-b from-[#0c1425] via-[#0a1628] to-[#0f172a]">
        <div className="w-20 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent mx-auto mb-6" />
        <p className="text-xs font-bold tracking-[0.4em] uppercase text-violet-400/50 mb-3">Engine Demo</p>
        <h2 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-violet-300 via-white to-cyan-300 bg-clip-text text-transparent">
          Physics Simulation Engine
        </h2>
        <p className="text-slate-500 text-sm mt-3 max-w-md mx-auto">
          A reusable engine powering all future simulations. Try the sandbox below.
        </p>
      </div>

      <InteractiveConceptSection tag="Engine" title="Particle Motion Sandbox">
        <PhysicsEngineDemo />
      </InteractiveConceptSection>

      {/* ═══════ MODULE 04 — APPLIED KINEMATICS ═══════ */}
      <div className="w-full py-16 text-center bg-gradient-to-b from-[#0c1425] via-[#0a1628] to-[#0f172a]">
        <div className="w-20 h-px bg-gradient-to-r from-transparent via-rose-500/30 to-transparent mx-auto mb-6" />
        <p className="text-xs font-bold tracking-[0.4em] uppercase text-rose-400/50 mb-3">Module 04</p>
        <h2 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-rose-300 via-white to-amber-300 bg-clip-text text-transparent">
          Applied Kinematics
        </h2>
        <p className="text-slate-500 text-sm mt-3 max-w-md mx-auto">
          Projectile motion, relative motion, and gravity — the concepts that tie it all together.
        </p>
      </div>

      <InteractiveConceptSection tag="Concept 12" title="Projectile Motion">
        <ProjectileMotionSim />
      </InteractiveConceptSection>

      <InteractiveConceptSection tag="Concept 13" title="Relative Motion — Frame of Reference" dark={false}>
        <RelativeMotionEngineSim />
      </InteractiveConceptSection>

      <InteractiveConceptSection tag="Concept 14" title="Motion Under Gravity">
        <GravityMotionSim />
      </InteractiveConceptSection>

      {/* ═══════ MODULE 05 — ADVANCED KINEMATICS ═══════ */}
      <div className="w-full py-16 text-center bg-gradient-to-b from-[#0c1425] via-[#0a1628] to-[#0f172a]">
        <div className="w-20 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent mx-auto mb-6" />
        <p className="text-xs font-bold tracking-[0.4em] uppercase text-emerald-400/50 mb-3">Module 05</p>
        <h2 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-emerald-300 via-white to-violet-300 bg-clip-text text-transparent">
          Advanced Kinematics
        </h2>
        <p className="text-slate-500 text-sm mt-3 max-w-md mx-auto">
          v²–x analysis, variable acceleration, and minimum distance — JEE Advanced-level concepts.
        </p>
      </div>

      <InteractiveConceptSection tag="Advanced" title="v² vs Position Graph — Slope = 2a">
        <VSquaredVsXGraph />
      </InteractiveConceptSection>

      <InteractiveConceptSection tag="Advanced" title="Variable Acceleration — a(t) = A sin(ωt)" dark={false}>
        <VariableAccelerationSim />
      </InteractiveConceptSection>

      <InteractiveConceptSection tag="Advanced" title="Minimum Distance Between Two Particles">
        <MinDistanceSim />
      </InteractiveConceptSection>

      {/* ─── BONUS: EARLIER VISUALIZATIONS ─── */}
      <div className="w-full py-12 text-center bg-gradient-to-b from-[#0c1425] to-[#0f172a]">
        <div className="w-16 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent mx-auto mb-4" />
        <p className="text-xs font-bold tracking-[0.3em] uppercase text-slate-600">
          Bonus Visualizations
        </p>
      </div>

      <InteractiveConceptSection tag="Bonus" title="Speed vs Velocity — Visual Comparison" dark={false}>
        <SpeedVelocitySim />
      </InteractiveConceptSection>

      <InteractiveConceptSection tag="Bonus" title="Position–Time Graph">
        <PositionTimeGraph />
      </InteractiveConceptSection>

      {/* ━━━━━ FOOTER ━━━━━ */}
      <section className="relative w-full py-24 px-6 bg-gradient-to-b from-[#030712] to-[#0f172a] text-center">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
        <p className="text-xs font-bold tracking-[0.3em] uppercase text-slate-500 mb-3">Coming Next</p>
        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent mb-4">
          Equations of Motion &amp; Numerical Problems
        </h2>
        <p className="text-slate-500 max-w-lg mx-auto text-sm">
          Derive the three kinematic equations, solve real JEE-level problems step by step.
        </p>
      </section>
    </div>
  );
}
