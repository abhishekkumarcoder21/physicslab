import { useRef, useEffect, useCallback } from "react";

/**
 * useAnimationLoop — runs a callback on every animation frame.
 * Returns start / stop / reset helpers.
 */
export function useAnimationLoop(
  callback: (dt: number, elapsed: number) => void,
  active: boolean = true
) {
  const rafRef = useRef<number>(0);
  const prevRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const cbRef = useRef(callback);

  // Keep callback ref fresh
  useEffect(() => {
    cbRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!active) return;
    startRef.current = performance.now();
    prevRef.current = startRef.current;

    function loop(now: number) {
      const dt = Math.min((now - prevRef.current) / 1000, 0.05); // cap at 50ms
      const elapsed = (now - startRef.current) / 1000;
      prevRef.current = now;
      cbRef.current(dt, elapsed);
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active]);

  const resetTimer = useCallback(() => {
    startRef.current = performance.now();
    prevRef.current = startRef.current;
  }, []);

  return { resetTimer };
}
