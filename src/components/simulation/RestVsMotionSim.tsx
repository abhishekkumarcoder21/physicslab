"use client";

import { useRef, useEffect, useState } from "react";
import * as THREE from "three";

/**
 * Rest vs Motion — Three.js simulation.
 * Shows a moving object + observer. Toggle observer perspectives
 * to demonstrate relative motion.
 */
export default function RestVsMotionSim() {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);
  const [perspective, setPerspective] = useState<"ground" | "train">("ground");
  const perspRef = useRef(perspective);

  useEffect(() => {
    perspRef.current = perspective;
  }, [perspective]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const w = el.clientWidth;
    const h = 400;

    // ─── Scene ───
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060e1a);

    const camera = new THREE.OrthographicCamera(-12, 12, 6, -6, 0.1, 100);
    camera.position.z = 20;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    // ─── Ground line ───
    const groundGeo = new THREE.PlaneGeometry(30, 0.05);
    const groundMat = new THREE.MeshBasicMaterial({ color: 0x334155 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -2;
    scene.add(ground);

    // Grid marks
    for (let i = -12; i <= 12; i += 2) {
      const mGeo = new THREE.PlaneGeometry(0.03, 0.3);
      const mMat = new THREE.MeshBasicMaterial({ color: 0x475569 });
      const mark = new THREE.Mesh(mGeo, mMat);
      mark.position.set(i, -2, 0);
      scene.add(mark);
    }

    // ─── Train (moving object) ───
    const trainBody = new THREE.Mesh(
      new THREE.BoxGeometry(3, 1.2, 1),
      new THREE.MeshBasicMaterial({ color: 0x6366f1 })
    );
    trainBody.position.y = -1;
    scene.add(trainBody);

    // Train glow
    const trainGlow = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 1.4, 1.1),
      new THREE.MeshBasicMaterial({
        color: 0x6366f1,
        transparent: true,
        opacity: 0.15,
      })
    );
    trainGlow.position.y = -1;
    scene.add(trainGlow);

    // Wheels
    const wheelGeo = new THREE.CircleGeometry(0.25, 16);
    const wheelMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8 });
    const positions = [-1, 1];
    const wheels: THREE.Mesh[] = [];
    positions.forEach((xOff) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.position.set(xOff, -1.7, 0.6);
      scene.add(wheel);
      wheels.push(wheel);
    });

    // ─── Observer (person on ground) ───
    const observerHead = new THREE.Mesh(
      new THREE.CircleGeometry(0.3, 16),
      new THREE.MeshBasicMaterial({ color: 0x22d3ee })
    );
    observerHead.position.set(-8, -0.5, 0);
    scene.add(observerHead);

    const observerBody = new THREE.Mesh(
      new THREE.PlaneGeometry(0.15, 1),
      new THREE.MeshBasicMaterial({ color: 0x22d3ee })
    );
    observerBody.position.set(-8, -1.3, 0);
    scene.add(observerBody);

    // Observer glow
    const obsGlow = new THREE.Mesh(
      new THREE.CircleGeometry(0.5, 16),
      new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: 0.12,
      })
    );
    obsGlow.position.set(-8, -0.5, 0);
    scene.add(obsGlow);

    // ─── Labels (as sprite-like planes — simplified) ───
    // We'll use HTML overlays instead for labels

    // ─── Animate ───
    const clock = new THREE.Clock();
    function animate() {
      frameRef.current = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const trainSpeed = 3;

      if (perspRef.current === "ground") {
        // Ground observer: train moves, observer stays
        const rawX = ((t * trainSpeed) % 28) - 14;
        trainBody.position.x = rawX;
        trainGlow.position.x = rawX;
        wheels.forEach((wh, i) => {
          wh.position.x = rawX + positions[i];
          wh.rotation.z = -t * 8;
        });
        camera.position.x = 0;
        observerHead.position.x = -8;
        observerBody.position.x = -8;
        obsGlow.position.x = -8;
      } else {
        // Train perspective: observer appears to move backward
        const rawX = ((t * trainSpeed) % 28) - 14;
        trainBody.position.x = 0;
        trainGlow.position.x = 0;
        wheels.forEach((wh, i) => {
          wh.position.x = positions[i];
          wh.rotation.z = -t * 8;
        });
        camera.position.x = 0;
        observerHead.position.x = -8 - rawX;
        observerBody.position.x = -8 - rawX;
        obsGlow.position.x = -8 - rawX;
      }

      renderer.render(scene, camera);
    }
    animate();

    // ─── Resize ───
    function onResize() {
      if (!el) return;
      const nw = el.clientWidth;
      renderer.setSize(nw, h);
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
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
      {/* Left: concept */}
      <div className="space-y-5">
        <p className="text-lg leading-relaxed text-slate-300">
          Is an object truly at <span className="text-cyan-400 font-semibold">rest</span> or
          in <span className="text-indigo-400 font-semibold">motion</span>?
          It depends on your{" "}
          <span className="text-white font-semibold">frame of reference</span>.
        </p>
        <p className="text-base text-slate-400 leading-relaxed">
          A passenger sitting in a moving train is at rest relative to the train, but
          in motion relative to a person standing on the ground. Toggle the perspective
          below to see this in action.
        </p>

        {/* Toggle */}
        <div className="flex gap-3">
          <button
            onClick={() => setPerspective("ground")}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
              perspective === "ground"
                ? "bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/50 shadow-lg shadow-cyan-500/10"
                : "bg-white/5 text-slate-400 hover:bg-white/10"
            }`}
          >
            👁 Ground Observer
          </button>
          <button
            onClick={() => setPerspective("train")}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
              perspective === "train"
                ? "bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/50 shadow-lg shadow-indigo-500/10"
                : "bg-white/5 text-slate-400 hover:bg-white/10"
            }`}
          >
            🚂 Train Passenger
          </button>
        </div>

        <p className="text-xs text-slate-500 italic">
          {perspective === "ground"
            ? "From the ground, the train moves to the right."
            : "From the train, everything else moves to the left."}
        </p>
      </div>

      {/* Right: simulation */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-indigo-500/5">
        <div ref={containerRef} style={{ height: 400 }} className="w-full" />
        {/* Overlay labels */}
        <div className="absolute top-4 right-4 flex items-center gap-2 text-xs font-bold">
          <span className="flex items-center gap-1 text-indigo-400">
            <span className="w-2 h-2 rounded-full bg-indigo-500" /> Train
          </span>
          <span className="flex items-center gap-1 text-cyan-400">
            <span className="w-2 h-2 rounded-full bg-cyan-500" /> Observer
          </span>
        </div>
      </div>
    </div>
  );
}
