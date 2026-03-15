import * as THREE from "three";
import { Vec3, ParticleConfig, DEFAULT_PARTICLE } from "./types";

/**
 * ParticleBody — pure physics data model.
 * Manages position, velocity, acceleration and exposes update methods.
 * Not a React component — consumed by PhysicsWorld.
 */
export class ParticleBody {
  readonly id: string;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  acceleration: THREE.Vector3;
  mass: number;
  radius: number;
  color: string;
  trailColor: string;
  trailLength: number;
  showVelocity: boolean;
  showAcceleration: boolean;
  showTrail: boolean;

  /** Trail history (world-space positions) */
  trail: THREE.Vector3[] = [];

  constructor(config: ParticleConfig = {}) {
    const c = { ...DEFAULT_PARTICLE, ...config };
    this.id = c.id || `p_${Math.random().toString(36).slice(2, 8)}`;
    this.position = ParticleBody.toVec(c.position);
    this.velocity = ParticleBody.toVec(c.velocity);
    this.acceleration = ParticleBody.toVec(c.acceleration);
    this.mass = c.mass;
    this.radius = c.radius;
    this.color = c.color;
    this.trailColor = c.trailColor;
    this.trailLength = c.trailLength;
    this.showVelocity = c.showVelocity;
    this.showAcceleration = c.showAcceleration;
    this.showTrail = c.showTrail;
  }

  /* ── Physics Updates ── */

  /** Advance by dt seconds using Euler integration */
  update(dt: number) {
    // v += a * dt
    this.velocity.addScaledVector(this.acceleration, dt);
    // x += v * dt
    this.position.addScaledVector(this.velocity, dt);
    // Record trail
    if (this.showTrail) {
      this.trail.push(this.position.clone());
      if (this.trail.length > this.trailLength) {
        this.trail.shift();
      }
    }
  }

  /** Manually set velocity */
  setVelocity(v: Vec3) {
    this.velocity.set(v.x, v.y, v.z);
  }

  /** Manually set acceleration */
  setAcceleration(a: Vec3) {
    this.acceleration.set(a.x, a.y, a.z);
  }

  /** Manually set position */
  setPosition(p: Vec3) {
    this.position.set(p.x, p.y, p.z);
  }

  /** Reset to a given config (preserves id) */
  reset(config: ParticleConfig = {}) {
    const c = { ...DEFAULT_PARTICLE, ...config };
    this.position.set(c.position.x, c.position.y, c.position.z);
    this.velocity.set(c.velocity.x, c.velocity.y, c.velocity.z);
    this.acceleration.set(c.acceleration.x, c.acceleration.y, c.acceleration.z);
    this.trail = [];
  }

  /** Current speed scalar */
  get speed(): number {
    return this.velocity.length();
  }

  /* ── Helpers ── */

  private static toVec(v: Vec3): THREE.Vector3 {
    return new THREE.Vector3(v.x, v.y, v.z);
  }
}
