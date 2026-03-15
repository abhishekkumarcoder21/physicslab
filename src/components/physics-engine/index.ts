/**
 * Physics Engine — barrel export.
 * Import everything from "@/components/physics-engine"
 */

// Types & constants
export type {
  Vec3,
  ParticleConfig,
  VectorConfig,
  SliderDef,
  WorldConfig,
  PhysicsState,
  ParticleSnapshot,
} from "./types";
export { DEFAULT_WORLD, DEFAULT_PARTICLE } from "./types";

// Core class
export { ParticleBody } from "./ParticleBody";

// Hooks
export { useAnimationLoop } from "./useAnimationLoop";
export { usePhysicsUpdate } from "./usePhysicsUpdate";

// Components
export { default as PhysicsWorld } from "./PhysicsWorld";
export type { PhysicsWorldHandle } from "./PhysicsWorld";
export { default as PhysicsControls } from "./PhysicsControls";
