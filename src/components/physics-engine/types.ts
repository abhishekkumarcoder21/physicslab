import * as THREE from "three";

/* ─────────────── Core Types ─────────────── */

/** 3D vector shorthand */
export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

/** Configuration for a single particle body */
export interface ParticleConfig {
  id?: string;
  position?: Vec3;
  velocity?: Vec3;
  acceleration?: Vec3;
  mass?: number;
  radius?: number;
  color?: string;
  trailColor?: string;
  trailLength?: number;
  showVelocity?: boolean;
  showAcceleration?: boolean;
  showTrail?: boolean;
}

/** Configuration for a vector arrow */
export interface VectorConfig {
  origin: Vec3;
  direction: Vec3;
  magnitude: number;
  color: string;
  label?: string;
  headLength?: number;
  headWidth?: number;
}

/** Slider control definition */
export interface SliderDef {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  unit?: string;
  color?: string;
}

/** Physics world configuration */
export interface WorldConfig {
  /** Width of the canvas in px (auto if omitted) */
  width?: number;
  /** Height of the canvas in px */
  height?: number;
  /** Background color */
  backgroundColor?: string;
  /** Camera distance */
  cameraZ?: number;
  /** Whether to show a reference grid */
  showGrid?: boolean;
  /** Grid size */
  gridSize?: number;
  /** Time scale (1 = realtime) */
  timeScale?: number;
  /** Enable orbit controls */
  orbitControls?: boolean;
  /** Enable 2D mode (orthographic camera, lock Z) */
  mode2D?: boolean;
}

/** State snapshot exposed to parent components */
export interface PhysicsState {
  time: number;
  deltaTime: number;
  particles: Map<string, ParticleSnapshot>;
}

export interface ParticleSnapshot {
  id: string;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  acceleration: THREE.Vector3;
  speed: number;
}

/* ─────────────── Defaults ─────────────── */

export const DEFAULT_WORLD: Required<WorldConfig> = {
  width: 0,
  height: 400,
  backgroundColor: "#060e1a",
  cameraZ: 50,
  showGrid: true,
  gridSize: 50,
  timeScale: 1,
  orbitControls: false,
  mode2D: true,
};

export const DEFAULT_PARTICLE: Required<ParticleConfig> = {
  id: "",
  position: { x: 0, y: 0, z: 0 },
  velocity: { x: 0, y: 0, z: 0 },
  acceleration: { x: 0, y: 0, z: 0 },
  mass: 1,
  radius: 0.4,
  color: "#a78bfa",
  trailColor: "#6366f1",
  trailLength: 300,
  showVelocity: true,
  showAcceleration: true,
  showTrail: true,
};
