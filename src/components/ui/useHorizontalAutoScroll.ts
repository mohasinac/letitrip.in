"use client";

/**
 * useHorizontalAutoScroll
 *
 * Encapsulates the auto-scroll timer for HorizontalScroller.
 *
 * Features:
 * - Starts/stops a setInterval that fires `onTick` at the configured interval.
 * - pause() / resume() are stable function references (safe to call from
 *   pointer and mouse handlers without re-creating them).
 * - The timer is reliably cleaned up on unmount.
 * - Re-starts cleanly whenever `enabled`, `interval`, or `onTick` changes.
 */

import { useRef, useCallback, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AutoScrollOptions {
  /** When false the timer is not started at all. */
  enabled: boolean;
  /** Milliseconds between ticks. */
  interval: number;
  /**
   * Called on each timer tick (if not paused).
   * Should be stable (memoised) to avoid redundant timer restarts.
   */
  onTick: () => void;
}

export interface AutoScrollControls {
  /** Temporarily suppress ticks without stopping the timer. */
  pause: () => void;
  /**
   * Re-enable ticks after a pause.
   * Does NOT restart the timer — the existing interval keeps running.
   */
  resume: () => void;
  /** Stop the underlying setInterval immediately. */
  stop: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useHorizontalAutoScroll({
  enabled,
  interval,
  onTick,
}: AutoScrollOptions): AutoScrollControls {
  // A ref means pause/resume don't cause re-renders or break the interval closure.
  const isPausedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Keep the latest onTick in a ref so the interval closure always calls the
  // most current version without needing to restart the timer on every render.
  const onTickRef = useRef(onTick);
  useEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);

  const stop = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (!enabled) return;
    stop();
    timerRef.current = setInterval(() => {
      if (!isPausedRef.current) onTickRef.current();
    }, interval);
  }, [enabled, interval, stop]);

  // Start / restart whenever enabled or interval changes; clean up on unmount.
  useEffect(() => {
    start();
    return stop;
  }, [start, stop]);

  const pause = useCallback(() => {
    isPausedRef.current = true;
  }, []);
  const resume = useCallback(() => {
    isPausedRef.current = false;
  }, []);

  return { pause, resume, stop };
}
