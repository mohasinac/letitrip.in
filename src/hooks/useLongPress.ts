'use client';

import { useRef, useCallback } from 'react';

/**
 * Configuration options for useLongPress hook
 */
export interface UseLongPressOptions {
  /** Duration in ms to register as long press (default: 500) */
  delay?: number;
  /** Maximum movement allowed in pixels (default: 10) */
  movementThreshold?: number;
  /** Callback when long press is triggered */
  onLongPress: (e: React.MouseEvent | React.TouchEvent) => void;
  /** Callback when long press starts (optional) */
  onLongPressStart?: () => void;
  /** Callback when long press is cancelled (optional) */
  onLongPressCancel?: () => void;
  /** Whether to prevent context menu on long press (default: true) */
  preventContextMenu?: boolean;
}

/**
 * useLongPress Hook
 * 
 * Detects long press gestures on both mouse and touch events.
 * Useful for context menus, item selection, or alternative actions.
 * 
 * @param options - Configuration options
 * @returns Event handlers to spread on the target element
 * 
 * @example
 * ```tsx
 * const longPressHandlers = useLongPress({
 *   onLongPress: () => console.log('Long pressed!'),
 *   delay: 500,
 * });
 * 
 * return <button {...longPressHandlers}>Press and hold</button>;
 * ```
 */
export function useLongPress(options: UseLongPressOptions) {
  const {
    delay = 500,
    movementThreshold = 10,
    onLongPress,
    onLongPressStart,
    onLongPressCancel,
    preventContextMenu = true,
  } = options;

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const eventRef = useRef<React.MouseEvent | React.TouchEvent | null>(null);
  const isLongPressRef = useRef(false);

  const start = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      isLongPressRef.current = false;
      eventRef.current = e;

      // Get position based on event type
      const pos = 'touches' in e
        ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
        : { x: e.clientX, y: e.clientY };

      startPosRef.current = pos;
      onLongPressStart?.();

      timerRef.current = setTimeout(() => {
        isLongPressRef.current = true;
        if (eventRef.current) {
          onLongPress(eventRef.current);
        }
      }, delay);
    },
    [delay, onLongPress, onLongPressStart]
  );

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!isLongPressRef.current && startPosRef.current) {
      onLongPressCancel?.();
    }

    startPosRef.current = null;
    eventRef.current = null;
    isLongPressRef.current = false;
  }, [onLongPressCancel]);

  const move = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!startPosRef.current) return;

      // Get current position
      const pos = 'touches' in e
        ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
        : { x: e.clientX, y: e.clientY };

      // Check if moved too much
      const deltaX = Math.abs(pos.x - startPosRef.current.x);
      const deltaY = Math.abs(pos.y - startPosRef.current.y);

      if (deltaX > movementThreshold || deltaY > movementThreshold) {
        cancel();
      }
    },
    [movementThreshold, cancel]
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (preventContextMenu && isLongPressRef.current) {
        e.preventDefault();
      }
    },
    [preventContextMenu]
  );

  // Return event handlers to spread on element
  return {
    onMouseDown: start,
    onMouseUp: cancel,
    onMouseLeave: cancel,
    onMouseMove: move,
    onTouchStart: start,
    onTouchEnd: cancel,
    onTouchMove: move,
    onContextMenu: handleContextMenu,
  };
}
