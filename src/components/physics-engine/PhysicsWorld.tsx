"use client";

import React, { useRef, useEffect, useImperativeHandle, forwardRef, useCallback } from "react";
import * as THREE from "three";
import { WorldConfig, DEFAULT_WORLD } from "./types";
import { ParticleBody } from "./ParticleBody";

/* ── Public handle for parent components ── */
export interface PhysicsWorldHandle {
  scene: THREE.Scene;
  camera: THREE.Camera;
  renderer: THREE.WebGLRenderer | null;
  getSize: () => { width: number; height: number };
}

interface Props extends WorldConfig {
  /** Called each frame with (dt, elapsed) */
  onUpdate?: (dt: number, elapsed: number) => void;
  /** Extra Three.js objects to add to the scene (via ref) */
  children?: React.ReactNode;
  /** CSS class for the wrapper */
  className?: string;
  /** Whether the loop is running */
  running?: boolean;
  /** Particles to render */
  particles?: ParticleBody[];
}

/**
 * PhysicsWorld — main Three.js container.
 * Sets up scene, camera, renderer, grid, and drives the animation loop.
 * Renders particles, their vector arrows, and trails.
 */
const PhysicsWorld = forwardRef<PhysicsWorldHandle, Props>(function PhysicsWorld(
  props,
  ref
) {
  const {
    height = DEFAULT_WORLD.height,
    backgroundColor = DEFAULT_WORLD.backgroundColor,
    cameraZ = DEFAULT_WORLD.cameraZ,
    showGrid = DEFAULT_WORLD.showGrid,
    gridSize = DEFAULT_WORLD.gridSize,
    timeScale = DEFAULT_WORLD.timeScale,
    mode2D = DEFAULT_WORLD.mode2D,
    onUpdate,
    running = true,
    particles = [],
    className = "",
  } = props;

  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef(new THREE.Scene());
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | THREE.PerspectiveCamera | null>(null);
  const rafRef = useRef<number>(0);
  const prevRef = useRef(0);
  const startRef = useRef(0);
  const onUpdateRef = useRef(onUpdate);

  useEffect(() => { onUpdateRef.current = onUpdate; }, [onUpdate]);

  /* ── Refs to Three.js objects for particles ── */
  const meshMapRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const velArrowMapRef = useRef<Map<string, THREE.ArrowHelper>>(new Map());
  const accArrowMapRef = useRef<Map<string, THREE.ArrowHelper>>(new Map());
  const trailMapRef = useRef<Map<string, THREE.Line>>(new Map());
  const glowMapRef = useRef<Map<string, THREE.Mesh>>(new Map());

  /* ── Expose handle ── */
  useImperativeHandle(ref, () => ({
    scene: sceneRef.current,
    camera: cameraRef.current!,
    renderer: rendererRef.current,
    getSize: () => {
      const el = mountRef.current;
      return { width: el?.clientWidth ?? 0, height: el?.clientHeight ?? 0 };
    },
  }));

  /* ── Init renderer + scene ── */
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = sceneRef.current;
    scene.background = new THREE.Color(backgroundColor);

    const w = mount.clientWidth;
    const h = height;

    // Camera
    if (mode2D) {
      const aspect = w / h;
      const frustum = cameraZ;
      const cam = new THREE.OrthographicCamera(
        -frustum * aspect, frustum * aspect, frustum, -frustum, 0.1, 1000
      );
      cam.position.set(0, 0, 100);
      cam.lookAt(0, 0, 0);
      cameraRef.current = cam;
    } else {
      const cam = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
      cam.position.set(0, 0, cameraZ);
      cameraRef.current = cam;
    }

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Grid
    if (showGrid) {
      const grid = new THREE.GridHelper(gridSize, gridSize, 0x1e293b, 0x1e293b);
      grid.rotation.x = Math.PI / 2; // XY plane in 2D mode
      scene.add(grid);
    }

    // Ambient light
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));

    return () => {
      renderer.dispose();
      mount.removeChild(renderer.domElement);
      // Clean up objects
      meshMapRef.current.forEach((m) => { scene.remove(m); m.geometry.dispose(); });
      velArrowMapRef.current.forEach((a) => scene.remove(a));
      accArrowMapRef.current.forEach((a) => scene.remove(a));
      trailMapRef.current.forEach((l) => { scene.remove(l); l.geometry.dispose(); });
      glowMapRef.current.forEach((g) => { scene.remove(g); g.geometry.dispose(); });
      meshMapRef.current.clear();
      velArrowMapRef.current.clear();
      accArrowMapRef.current.clear();
      trailMapRef.current.clear();
      glowMapRef.current.clear();
    };
  }, [backgroundColor, cameraZ, gridSize, height, mode2D, showGrid]);

  /* ── Sync particle Three.js objects ── */
  const syncParticles = useCallback(() => {
    const scene = sceneRef.current;

    particles.forEach((p) => {
      // Mesh
      if (!meshMapRef.current.has(p.id)) {
        const geo = new THREE.SphereGeometry(p.radius, 16, 16);
        const mat = new THREE.MeshStandardMaterial({ color: p.color, emissive: p.color, emissiveIntensity: 0.4 });
        const mesh = new THREE.Mesh(geo, mat);
        scene.add(mesh);
        meshMapRef.current.set(p.id, mesh);

        // Glow sphere
        const glowGeo = new THREE.SphereGeometry(p.radius * 2.5, 12, 12);
        const glowMat = new THREE.MeshBasicMaterial({ color: p.color, transparent: true, opacity: 0.08 });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        scene.add(glow);
        glowMapRef.current.set(p.id, glow);
      }

      const mesh = meshMapRef.current.get(p.id)!;
      mesh.position.copy(p.position);
      const glow = glowMapRef.current.get(p.id);
      if (glow) glow.position.copy(p.position);

      // Velocity arrow
      if (p.showVelocity && p.velocity.length() > 0.1) {
        const dir = p.velocity.clone().normalize();
        const len = p.velocity.length() * 0.8;
        if (velArrowMapRef.current.has(p.id)) {
          const arrow = velArrowMapRef.current.get(p.id)!;
          arrow.position.copy(p.position);
          arrow.setDirection(dir);
          arrow.setLength(len, len * 0.15, len * 0.08);
          arrow.visible = true;
        } else {
          const arrow = new THREE.ArrowHelper(dir, p.position, len, 0x22d3ee, len * 0.15, len * 0.08);
          scene.add(arrow);
          velArrowMapRef.current.set(p.id, arrow);
        }
      } else if (velArrowMapRef.current.has(p.id)) {
        velArrowMapRef.current.get(p.id)!.visible = false;
      }

      // Acceleration arrow
      if (p.showAcceleration && p.acceleration.length() > 0.1) {
        const dir = p.acceleration.clone().normalize();
        const len = p.acceleration.length() * 1.2;
        if (accArrowMapRef.current.has(p.id)) {
          const arrow = accArrowMapRef.current.get(p.id)!;
          arrow.position.copy(p.position);
          arrow.setDirection(dir);
          arrow.setLength(len, len * 0.15, len * 0.08);
          arrow.visible = true;
        } else {
          const arrow = new THREE.ArrowHelper(dir, p.position, len, 0xf59e0b, len * 0.15, len * 0.08);
          scene.add(arrow);
          accArrowMapRef.current.set(p.id, arrow);
        }
      } else if (accArrowMapRef.current.has(p.id)) {
        accArrowMapRef.current.get(p.id)!.visible = false;
      }

      // Trail
      if (p.showTrail && p.trail.length > 1) {
        const positions = new Float32Array(p.trail.length * 3);
        p.trail.forEach((pt, i) => {
          positions[i * 3] = pt.x;
          positions[i * 3 + 1] = pt.y;
          positions[i * 3 + 2] = pt.z;
        });

        if (trailMapRef.current.has(p.id)) {
          const line = trailMapRef.current.get(p.id)!;
          const geo = line.geometry as THREE.BufferGeometry;
          geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
          geo.setDrawRange(0, p.trail.length);
        } else {
          const geo = new THREE.BufferGeometry();
          geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
          const mat = new THREE.LineBasicMaterial({ color: p.trailColor, transparent: true, opacity: 0.5 });
          const line = new THREE.Line(geo, mat);
          scene.add(line);
          trailMapRef.current.set(p.id, line);
        }
      }
    });
  }, [particles]);

  /* ── Animation loop ── */
  useEffect(() => {
    if (!running || !rendererRef.current || !cameraRef.current) return;

    startRef.current = performance.now();
    prevRef.current = startRef.current;

    function loop(now: number) {
      const dt = Math.min((now - prevRef.current) / 1000, 0.05) * timeScale;
      const elapsed = (now - startRef.current) / 1000;
      prevRef.current = now;

      onUpdateRef.current?.(dt, elapsed);
      syncParticles();

      rendererRef.current!.render(sceneRef.current, cameraRef.current!);
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, timeScale, syncParticles]);

  return (
    <div
      ref={mountRef}
      className={`rounded-2xl overflow-hidden border border-white/10 shadow-2xl ${className}`}
      style={{ height }}
    />
  );
});

export default PhysicsWorld;
