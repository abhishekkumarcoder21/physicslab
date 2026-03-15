"use client";

import { useRef, useEffect } from "react";
import * as THREE from "three";

interface StarfieldBackgroundProps {
  /** Number of particles */
  count?: number;
  /** Speed multiplier */
  speed?: number;
  /** Deep color tint */
  color?: string;
  /** Height of the section (CSS value) */
  height?: string;
  children?: React.ReactNode;
}

/**
 * Lightweight Three.js starfield background.
 * Renders animated point-particles in a dark cosmic canvas.
 * Children are overlaid on top.
 */
export default function StarfieldBackground({
  count = 1200,
  speed = 0.3,
  color = "#ffffff",
  height = "100vh",
  children,
}: StarfieldBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const w = el.clientWidth;
    const h = el.clientHeight;

    // ─── Scene ───
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
    camera.position.z = 50;

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    el.insertBefore(renderer.domElement, el.firstChild);
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.inset = "0";
    renderer.domElement.style.zIndex = "0";

    // ─── Particles ───
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const opacities = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
      sizes[i] = Math.random() * 2 + 0.5;
      opacities[i] = Math.random() * 0.6 + 0.4;
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geom.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const mat = (() => {
      // Generate a circular star texture via canvas
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext("2d")!;
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, "rgba(255,255,255,1)");
      gradient.addColorStop(0.2, "rgba(255,255,255,0.8)");
      gradient.addColorStop(0.5, "rgba(255,255,255,0.15)");
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
      const texture = new THREE.CanvasTexture(canvas);

      return new THREE.PointsMaterial({
        color: new THREE.Color(color),
        size: 1.2,
        sizeAttenuation: true,
        transparent: true,
        opacity: 1.0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        map: texture,
      });
    })();

    const points = new THREE.Points(geom, mat);
    scene.add(points);

    // ─── Floating center particle ───
    const glowGeom = new THREE.SphereGeometry(0.6, 16, 16);
    const glowMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#22d3ee"),
      transparent: true,
      opacity: 0.9,
    });
    const glowBall = new THREE.Mesh(glowGeom, glowMat);
    scene.add(glowBall);

    // Outer glow ring
    const ringGeom = new THREE.RingGeometry(1.2, 1.5, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#6366f1"),
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    scene.add(ring);

    // ─── Animate ───
    const clock = new THREE.Clock();
    function animate() {
      frameRef.current = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      points.rotation.y = t * speed * 0.05;
      points.rotation.x = t * speed * 0.02;

      // Floating motion for center orb
      glowBall.position.y = Math.sin(t * 1.2) * 1.5;
      glowBall.position.x = Math.cos(t * 0.8) * 1.0;
      glowBall.scale.setScalar(1 + Math.sin(t * 2) * 0.15);

      ring.position.copy(glowBall.position);
      ring.rotation.z = t * 0.5;
      ring.scale.setScalar(1 + Math.sin(t * 1.5) * 0.2);

      renderer.render(scene, camera);
    }
    animate();

    // ─── Resize ───
    function onResize() {
      if (!el) return;
      const nw = el.clientWidth;
      const nh = el.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    }
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) {
        el.removeChild(renderer.domElement);
      }
    };
  }, [count, speed, color]);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden"
      style={{ height, background: "linear-gradient(to bottom, #030712, #0f172a)" }}
    >
      {/* Content overlaid on starfield */}
      <div className="relative z-10 h-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
