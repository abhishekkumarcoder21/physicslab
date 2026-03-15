"use client";

import { useRef, useEffect } from "react";
import * as THREE from "three";

export interface MotionSimulatorConfig {
  /** Gravity magnitude (default 9.8) */
  gravity?: number;
  /** Initial velocity [vx, vy, vz] */
  initialVelocity?: [number, number, number];
  /** Ball color (hex) */
  ballColor?: string;
  /** Floor y-position */
  floorY?: number;
}

interface MotionSimulatorProps {
  config?: MotionSimulatorConfig;
  /** Container height (px) */
  height?: number;
}

/**
 * Three.js-based motion simulator.
 * Renders a bouncing ball under gravity as a proof-of-concept.
 * Swap `config` to change physics behavior.
 */
export default function MotionSimulator({
  config = {},
  height = 400,
}: MotionSimulatorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const {
      gravity = 9.8,
      initialVelocity = [2, 8, 0],
      ballColor = "#6366f1",
      floorY = -3,
    } = config;

    // --- Scene setup ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);

    const camera = new THREE.PerspectiveCamera(
      50,
      el.clientWidth / height,
      0.1,
      100
    );
    camera.position.set(0, 3, 12);
    camera.lookAt(0, 1, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(el.clientWidth, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    el.appendChild(renderer.domElement);

    // --- Lighting ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    // --- Floor ---
    const floorGeo = new THREE.PlaneGeometry(20, 20);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      side: THREE.DoubleSide,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = floorY;
    scene.add(floor);

    // --- Grid helper ---
    const grid = new THREE.GridHelper(20, 20, 0xcbd5e1, 0xcbd5e1);
    grid.position.y = floorY + 0.01;
    scene.add(grid);

    // --- Ball ---
    const ballGeo = new THREE.SphereGeometry(0.4, 32, 32);
    const ballMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(ballColor),
      roughness: 0.3,
      metalness: 0.1,
    });
    const ball = new THREE.Mesh(ballGeo, ballMat);
    ball.position.set(0, 1, 0);
    scene.add(ball);

    // --- Physics state ---
    const velocity = {
      x: initialVelocity[0],
      y: initialVelocity[1],
      z: initialVelocity[2],
    };
    const clock = new THREE.Clock();

    // --- Animation loop ---
    function animate() {
      frameRef.current = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);

      // Apply gravity
      velocity.y -= gravity * dt;

      // Update position
      ball.position.x += velocity.x * dt;
      ball.position.y += velocity.y * dt;
      ball.position.z += velocity.z * dt;

      // Bounce off floor
      if (ball.position.y - 0.4 <= floorY) {
        ball.position.y = floorY + 0.4;
        velocity.y = -velocity.y * 0.75; // energy loss
      }

      // Wrap x
      if (ball.position.x > 10) ball.position.x = -10;
      if (ball.position.x < -10) ball.position.x = 10;

      renderer.render(scene, camera);
    }

    animate();

    // --- Resize ---
    function onResize() {
      if (!el) return;
      camera.aspect = el.clientWidth / height;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, height);
    }
    window.addEventListener("resize", onResize);

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) {
        el.removeChild(renderer.domElement);
      }
    };
  }, [config, height]);

  return (
    <div className="rounded-2xl border border-border overflow-hidden bg-surface-card shadow-sm">
      <div ref={containerRef} style={{ height }} className="w-full" />
      <div className="px-5 py-3 border-t border-border bg-surface flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-success animate-pulse-gentle" />
        <span className="text-xs text-text-muted font-medium">
          Simulation running — Gravity: {config.gravity ?? 9.8} m/s²
        </span>
      </div>
    </div>
  );
}
