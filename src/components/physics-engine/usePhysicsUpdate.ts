import { useRef, useCallback } from "react";
import { ParticleBody } from "./ParticleBody";
import { ParticleConfig, PhysicsState, ParticleSnapshot } from "./types";

/**
 * usePhysicsUpdate — manages a set of ParticleBody instances.
 * Provides add/remove/reset/step utilities and a snapshot getter.
 */
export function usePhysicsUpdate() {
  const particlesRef = useRef<Map<string, ParticleBody>>(new Map());
  const timeRef = useRef(0);

  /** Add a particle and return its id */
  const addParticle = useCallback((config: ParticleConfig = {}): string => {
    const p = new ParticleBody(config);
    particlesRef.current.set(p.id, p);
    return p.id;
  }, []);

  /** Remove a particle by id */
  const removeParticle = useCallback((id: string) => {
    particlesRef.current.delete(id);
  }, []);

  /** Get a particle by id */
  const getParticle = useCallback((id: string) => {
    return particlesRef.current.get(id);
  }, []);

  /** Step all particles forward by dt (in seconds) */
  const step = useCallback((dt: number, timeScale: number = 1) => {
    const scaledDt = dt * timeScale;
    timeRef.current += scaledDt;
    particlesRef.current.forEach((p) => p.update(scaledDt));
  }, []);

  /** Get a snapshot of the current state */
  const getState = useCallback((): PhysicsState => {
    const particles = new Map<string, ParticleSnapshot>();
    particlesRef.current.forEach((p) => {
      particles.set(p.id, {
        id: p.id,
        position: p.position.clone(),
        velocity: p.velocity.clone(),
        acceleration: p.acceleration.clone(),
        speed: p.speed,
      });
    });
    return { time: timeRef.current, deltaTime: 0, particles };
  }, []);

  /** Reset all particles and timer */
  const resetAll = useCallback((configs?: ParticleConfig[]) => {
    timeRef.current = 0;
    if (configs) {
      particlesRef.current.clear();
      configs.forEach((c) => {
        const p = new ParticleBody(c);
        particlesRef.current.set(p.id, p);
      });
    } else {
      particlesRef.current.forEach((p) => p.reset());
    }
  }, []);

  /** Iterate over current particles */
  const forEachParticle = useCallback((fn: (p: ParticleBody) => void) => {
    particlesRef.current.forEach(fn);
  }, []);

  return {
    addParticle,
    removeParticle,
    getParticle,
    step,
    getState,
    resetAll,
    forEachParticle,
    particlesRef,
    timeRef,
  };
}
