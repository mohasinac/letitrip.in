"use client";

/**
 * useHorizontalScrollDrag
 *
 * Unified pointer-events drag-to-scroll hook for mouse (and stylus/pen).
 *
 * Features:
 * - Works on desktop via mouse hold-and-drag.
 * - Touch devices use native `overflow-x: auto` scroll (better momentum +
 *   elastic bounce on iOS). Touch pointer events are NOT intercepted.
 * - Momentum / inertia: on mouse-release the scroll continues with exponential
 *   velocity decay driven by requestAnimationFrame.
 * - Velocity is estimated from the last N pointer-move samples so rapid flicks
 *   feel natural.
 * - Click suppression: clicks on children are stopped when the drag distance
 *   exceeds 5 px, preventing accidental item activation after a scroll gesture.
 * - Reports `isDragging` state so the consumer can change cursor styling.
 *
 * Usage:
 *   const drag = useHorizontalScrollDrag(scrollRef, {
 *     onDragStart: () => autoScroll.pause(),
 *     onDragEnd:   () => autoScroll.resume(),
 *   });
 *   <div {...drag.handlers} style={drag.style} className={drag.cursorClass} />
 */

import { useRef, useState, useCallback, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DragScrollOptions {
  /** Called when the user starts a drag gesture. */
  onDragStart?: () => void;
  /**
   * Called when the drag gesture ends (pointer up / cancel).
   * Fires before momentum animation begins.
   */
  onDragEnd?: () => void;
}

export interface DragScrollResult {
  /** True while the pointer is held down and moving. */
  isDragging: boolean;
  /**
   * Tailwind cursor classes to spread onto the scroll element.
   * `cursor-grab` at rest, `cursor-grabbing` while dragging.
   */
  cursorClass: string;
  /**
   * Inline style that must be applied to the scrollable element.
   * Sets `user-select: none` during drag to prevent text-selection flicker.
   * Does NOT set `touch-action` — touch devices use native scroll.
   */
  style: React.CSSProperties;
  /**
   * Cancel any in-flight momentum animation immediately.
   * Call this before programmatic scroll position changes (e.g. circular reset)
   * to avoid the momentum animation fighting the new position.
   */
  cancelMomentum: () => void;
  /**
   * Spread these onto the scrollable `<div>` to wire up all pointer handlers
   * and click suppression.
   */
  handlers: {
    onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
    onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
    onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void;
    onPointerCancel: (e: React.PointerEvent<HTMLDivElement>) => void;
    onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const VELOCITY_SAMPLES = 5; // number of recent pointer-move events used for velocity
const MOMENTUM_DECAY = 0.94; // velocity multiplied per frame (0.94 ≈ smooth coast)
const MOMENTUM_STOP_PX = 0.5; // stop momentum loop when |v| < this value
const CLICK_SUPPRESS_PX = 5; // drag distance threshold to suppress child click
const MOMENTUM_PX_PER_MS = 16; // convert px/ms → px/frame at 60 fps

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useHorizontalScrollDrag(
  scrollRef: React.RefObject<HTMLDivElement | null>,
  options?: DragScrollOptions,
): DragScrollResult {
  const [isDragging, setIsDragging] = useState(false);

  // Mutable state that doesn't need to trigger re-renders.
  const isActiveRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollRef = useRef(0);
  const dragDistRef = useRef(0);
  const velSamplesRef = useRef<{ t: number; x: number }[]>([]);
  const rafRef = useRef<number | null>(null);
  // Tracks whether setPointerCapture has been called for the current gesture.
  // Capture is set lazily in onPointerMove once the drag threshold is crossed,
  // so that a plain click never redirects the browser's `click` event away from
  // the child element (e.g. a TextLink) that was actually pressed.
  const hasCaptureRef = useRef(false);
  const capturePointerIdRef = useRef<number>(0);

  // Keep callbacks in refs so the handlers below never need to be recreated
  // when the parent component re-renders.
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // ─── Momentum animation ───────────────────────────────────────────────────

  const cancelMomentum = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const applyMomentum = useCallback(
    (el: HTMLDivElement, initialVelocity: number) => {
      cancelMomentum();
      let v = initialVelocity;
      const step = () => {
        if (Math.abs(v) < MOMENTUM_STOP_PX) return;
        el.scrollLeft += v;
        v *= MOMENTUM_DECAY;
        rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
    },
    [cancelMomentum],
  );

  // ─── Cleanup on unmount ───────────────────────────────────────────────────

  useEffect(() => cancelMomentum, [cancelMomentum]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = scrollRef.current;
      if (!el) return;
      // Only intercept mouse (primary button) and pen — let touch use native scroll.
      if (e.pointerType === "touch") return;
      if (e.pointerType === "mouse" && e.button !== 0) return;

      cancelMomentum();

      isActiveRef.current = true;
      hasCaptureRef.current = false;
      capturePointerIdRef.current = e.pointerId;
      startXRef.current = e.clientX;
      startScrollRef.current = el.scrollLeft;
      dragDistRef.current = 0;
      velSamplesRef.current = [{ t: e.timeStamp, x: e.clientX }];

      // NOTE: setPointerCapture is intentionally NOT called here.
      // Eager capture in pointerdown causes Chromium to dispatch the subsequent
      // `click` event on the capture element rather than the child that was
      // pressed, breaking link/button navigation. Capture is set lazily in
      // onPointerMove once an actual drag gesture is confirmed.
      setIsDragging(true);
      optionsRef.current?.onDragStart?.();
    },
    [scrollRef, cancelMomentum],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isActiveRef.current) return;
      const el = scrollRef.current;
      if (!el) return;

      const delta = startXRef.current - e.clientX;
      const newDist = Math.abs(delta);
      dragDistRef.current = newDist;

      // Set pointer capture lazily once the gesture is clearly a drag.
      // This ensures that for a plain click (no movement) capture is never set,
      // so the browser fires `click` on the actual child element.
      if (!hasCaptureRef.current && newDist >= CLICK_SUPPRESS_PX) {
        el.setPointerCapture(e.pointerId);
        hasCaptureRef.current = true;
      }

      el.scrollLeft = startScrollRef.current + delta;

      // Maintain rolling velocity sample window.
      const samples = velSamplesRef.current;
      samples.push({ t: e.timeStamp, x: e.clientX });
      if (samples.length > VELOCITY_SAMPLES) samples.shift();
    },
    [scrollRef],
  );

  const finishDrag = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isActiveRef.current) return;
      isActiveRef.current = false;
      setIsDragging(false);
      // Only release capture if we actually set it (lazy capture pattern).
      if (hasCaptureRef.current) {
        scrollRef.current?.releasePointerCapture(capturePointerIdRef.current);
        hasCaptureRef.current = false;
      }
      optionsRef.current?.onDragEnd?.();

      // Compute velocity from oldest→newest sample pair.
      const samples = velSamplesRef.current;
      if (samples.length >= 2) {
        const oldest = samples[0];
        const newest = samples[samples.length - 1];
        const dt = newest.t - oldest.t;
        if (dt > 0) {
          // Negate dx: scrolling goes opposite to finger/cursor movement.
          const velocityPerFrame =
            (-(newest.x - oldest.x) / dt) * MOMENTUM_PX_PER_MS;
          const el = scrollRef.current;
          if (el && Math.abs(velocityPerFrame) > 1) {
            applyMomentum(el, velocityPerFrame);
          }
        }
      }
      velSamplesRef.current = [];
    },
    [scrollRef, applyMomentum],
  );

  const onClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (dragDistRef.current > CLICK_SUPPRESS_PX) {
      e.preventDefault();
      e.stopPropagation();
    }
    // Reset after checking so the next independent click always goes through.
    dragDistRef.current = 0;
  }, []);

  // ─── Derived values ───────────────────────────────────────────────────────

  const cursorClass = isDragging ? "cursor-grabbing" : "cursor-grab";

  const style: React.CSSProperties = {
    userSelect: isDragging ? "none" : undefined,
  };

  return {
    isDragging,
    cancelMomentum,
    cursorClass,
    style,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: finishDrag,
      onPointerCancel: finishDrag,
      onClick,
    },
  };
}
