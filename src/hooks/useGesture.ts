"use client";

import { useRef, useEffect, RefObject } from "react";

/**
 * Gesture types supported
 */
export type GestureType =
  | "tap"
  | "doubletap"
  | "longpress"
  | "pinch"
  | "rotate";

/**
 * Configuration options for useGesture hook
 */
export interface UseGestureOptions {
  /** Callback for tap gesture */
  onTap?: (x: number, y: number) => void;
  /** Callback for double tap gesture */
  onDoubleTap?: (x: number, y: number) => void;
  /** Callback for long press gesture */
  onLongPress?: (x: number, y: number) => void;
  /** Callback for pinch gesture (zoom in/out) */
  onPinch?: (scale: number, distance: number) => void;
  /** Callback during pinching */
  onPinching?: (scale: number) => void;
  /** Callback for rotation gesture */
  onRotate?: (angle: number) => void;
  /** Callback during rotation */
  onRotating?: (angle: number) => void;
  /** Maximum time between taps for double tap (ms, default: 300) */
  doubleTapDelay?: number;
  /** Minimum time for long press (ms, default: 500) */
  longPressDelay?: number;
  /** Maximum movement allowed for tap (px, default: 10) */
  tapMovementThreshold?: number;
  /** Prevent default behavior */
  preventDefault?: boolean;
}

/**
 * useGesture Hook
 *
 * Detects various touch gestures including tap, double tap, long press, pinch, and rotate.
 * Primarily designed for touch devices but also works with mouse for basic gestures.
 *
 * @param ref - Reference to the element to attach gesture handlers
 * @param options - Configuration options for gesture detection
 *
 * @example
 * ```tsx
 * const ref = useRef<HTMLDivElement>(null);
 *
 * useGesture(ref, {
 *   onTap: (x, y) => console.log('Tapped at', x, y),
 *   onDoubleTap: () => console.log('Double tapped'),
 *   onPinch: (scale) => console.log('Pinch scale', scale),
 * });
 *
 * return <div ref={ref}>Touch me!</div>;
 * ```
 */
export function useGesture<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  options: UseGestureOptions = {},
) {
  const {
    onTap,
    onDoubleTap,
    onLongPress,
    onPinch,
    onPinching,
    onRotate,
    onRotating,
    doubleTapDelay = 300,
    longPressDelay = 500,
    tapMovementThreshold = 10,
    preventDefault = false,
  } = options;

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(
    null,
  );
  const lastTapRef = useRef<number>(0);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const initialPinchDistanceRef = useRef<number>(0);
  const initialRotationRef = useRef<number>(0);

  // Store callbacks in refs to avoid event listener churn
  const onTapRef = useRef(onTap);
  const onDoubleTapRef = useRef(onDoubleTap);
  const onLongPressRef = useRef(onLongPress);
  const onPinchRef = useRef(onPinch);
  const onPinchingRef = useRef(onPinching);
  const onRotateRef = useRef(onRotate);
  const onRotatingRef = useRef(onRotating);

  useEffect(() => {
    onTapRef.current = onTap;
  }, [onTap]);
  useEffect(() => {
    onDoubleTapRef.current = onDoubleTap;
  }, [onDoubleTap]);
  useEffect(() => {
    onLongPressRef.current = onLongPress;
  }, [onLongPress]);
  useEffect(() => {
    onPinchRef.current = onPinch;
  }, [onPinch]);
  useEffect(() => {
    onPinchingRef.current = onPinching;
  }, [onPinching]);
  useEffect(() => {
    onRotateRef.current = onRotate;
  }, [onRotate]);
  useEffect(() => {
    onRotatingRef.current = onRotating;
  }, [onRotating]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Helper: Calculate distance between two touch points
    const getDistance = (touch1: Touch, touch2: Touch): number => {
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    // Helper: Calculate angle between two touch points
    const getAngle = (touch1: Touch, touch2: Touch): number => {
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      return Math.atan2(dy, dx) * (180 / Math.PI);
    };

    // Touch Start
    const handleTouchStart = (e: TouchEvent) => {
      if (preventDefault) e.preventDefault();

      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };

      // Start long press timer
      if (onLongPressRef.current) {
        longPressTimerRef.current = setTimeout(() => {
          if (touchStartRef.current) {
            onLongPressRef.current?.(
              touchStartRef.current.x,
              touchStartRef.current.y,
            );
            touchStartRef.current = null; // Prevent tap after long press
          }
        }, longPressDelay);
      }

      // Handle multi-touch gestures
      if (e.touches.length === 2) {
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }

        initialPinchDistanceRef.current = getDistance(
          e.touches[0],
          e.touches[1],
        );
        initialRotationRef.current = getAngle(e.touches[0], e.touches[1]);
      }
    };

    // Touch Move
    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      // Cancel long press if moved too much
      if (longPressTimerRef.current) {
        const touch = e.touches[0];
        const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
        const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);

        if (deltaX > tapMovementThreshold || deltaY > tapMovementThreshold) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
      }

      // Handle pinch and rotate
      if (
        e.touches.length === 2 &&
        (onPinchRef.current ||
          onPinchingRef.current ||
          onRotateRef.current ||
          onRotatingRef.current)
      ) {
        if (preventDefault) e.preventDefault();

        const currentDistance = getDistance(e.touches[0], e.touches[1]);
        const currentAngle = getAngle(e.touches[0], e.touches[1]);

        if (initialPinchDistanceRef.current > 0) {
          const scale = currentDistance / initialPinchDistanceRef.current;
          onPinchingRef.current?.(scale);
        }

        if (initialRotationRef.current !== 0) {
          const rotation = currentAngle - initialRotationRef.current;
          onRotatingRef.current?.(rotation);
        }
      }
    };

    // Touch End
    const handleTouchEnd = (e: TouchEvent) => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }

      if (!touchStartRef.current) return;
      if (preventDefault) e.preventDefault();

      const touch = e.changedTouches[0];
      const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
      const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
      const deltaTime = Date.now() - touchStartRef.current.time;

      // Check for tap (minimal movement)
      if (deltaX < tapMovementThreshold && deltaY < tapMovementThreshold) {
        const now = Date.now();
        const timeSinceLastTap = now - lastTapRef.current;

        // Double tap detection
        if (onDoubleTapRef.current && timeSinceLastTap < doubleTapDelay) {
          onDoubleTapRef.current(
            touchStartRef.current.x,
            touchStartRef.current.y,
          );
          lastTapRef.current = 0; // Reset to prevent triple tap
        } else {
          // Single tap
          if (onTapRef.current) {
            onTapRef.current(touchStartRef.current.x, touchStartRef.current.y);
          }
          lastTapRef.current = now;
        }
      }

      // Handle pinch end
      if (e.touches.length === 0 && initialPinchDistanceRef.current > 0) {
        const currentDistance = getDistance(
          e.changedTouches[0],
          e.changedTouches[1] || e.changedTouches[0],
        );
        const scale = currentDistance / initialPinchDistanceRef.current;
        onPinchRef.current?.(scale, currentDistance);
        initialPinchDistanceRef.current = 0;
      }

      // Handle rotation end
      if (e.touches.length === 0 && initialRotationRef.current !== 0) {
        const currentAngle = getAngle(
          e.changedTouches[0],
          e.changedTouches[1] || e.changedTouches[0],
        );
        const rotation = currentAngle - initialRotationRef.current;
        onRotateRef.current?.(rotation);
        initialRotationRef.current = 0;
      }

      touchStartRef.current = null;
    };

    // Mouse Events (basic support for tap)
    const handleMouseDown = (e: MouseEvent) => {
      if (preventDefault) e.preventDefault();
      touchStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        time: Date.now(),
      };

      if (onLongPressRef.current) {
        longPressTimerRef.current = setTimeout(() => {
          if (touchStartRef.current) {
            onLongPressRef.current?.(
              touchStartRef.current.x,
              touchStartRef.current.y,
            );
            touchStartRef.current = null;
          }
        }, longPressDelay);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }

      if (!touchStartRef.current) return;
      if (preventDefault) e.preventDefault();

      const deltaX = Math.abs(e.clientX - touchStartRef.current.x);
      const deltaY = Math.abs(e.clientY - touchStartRef.current.y);

      if (deltaX < tapMovementThreshold && deltaY < tapMovementThreshold) {
        const now = Date.now();
        const timeSinceLastTap = now - lastTapRef.current;

        if (onDoubleTapRef.current && timeSinceLastTap < doubleTapDelay) {
          onDoubleTapRef.current(
            touchStartRef.current.x,
            touchStartRef.current.y,
          );
          lastTapRef.current = 0;
        } else {
          onTapRef.current?.(touchStartRef.current.x, touchStartRef.current.y);
          lastTapRef.current = now;
        }
      }

      touchStartRef.current = null;
    };

    // Add event listeners
    element.addEventListener("touchstart", handleTouchStart, {
      passive: !preventDefault,
    });
    element.addEventListener("touchmove", handleTouchMove, {
      passive: !preventDefault,
    });
    element.addEventListener("touchend", handleTouchEnd, {
      passive: !preventDefault,
    });
    element.addEventListener("mousedown", handleMouseDown);
    element.addEventListener("mouseup", handleMouseUp);

    // Cleanup
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }

      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
      element.removeEventListener("mousedown", handleMouseDown);
      element.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    ref,
    doubleTapDelay,
    longPressDelay,
    tapMovementThreshold,
    preventDefault,
  ]);
}
