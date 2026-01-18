
/**
 * useWindowResize Hook
 *
 * Framework-agnostic window resize hook with debounce support.
 * Provides current window dimensions and breakpoint detection.
 *
 * @example
 * ```tsx
 * const { width, height, isDesktop, isMobile } = useWindowResize();
 *
 * // With custom debounce
 * const { width, height } = useWindowResize({ debounceMs: 500 });
 *
 * // With custom breakpoints
 * const { isMobile, isTablet } = useWindowResize({
 *   mobileBreakpoint: 640,
 *   tabletBreakpoint: 1024,
 * });
 * ```
 */

import { useCallback, useEffect, useState } from "react";

export interface WindowSize {
  /** Window width in pixels */
  width: number;
  /** Window height in pixels */
  height: number;
}

export interface UseWindowResizeOptions {
  /** Debounce delay in milliseconds (default: 200) */
  debounceMs?: number;
  /** Mobile breakpoint in pixels (default: 768) */
  mobileBreakpoint?: number;
  /** Tablet breakpoint in pixels (default: 1024) */
  tabletBreakpoint?: number;
  /** Desktop breakpoint in pixels (default: 1280) */
  desktopBreakpoint?: number;
  /** Callback when resize occurs */
  onResize?: (size: WindowSize) => void;
}

export interface UseWindowResizeReturn extends WindowSize {
  /** Whether screen is mobile size */
  isMobile: boolean;
  /** Whether screen is tablet size */
  isTablet: boolean;
  /** Whether screen is desktop size */
  isDesktop: boolean;
  /** Whether screen is large desktop size */
  isLargeDesktop: boolean;
}

function getWindowSize(): WindowSize {
  if (typeof window === "undefined") {
    return { width: 0, height: 0 };
  }
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

export function useWindowResize(
  options: UseWindowResizeOptions = {}
): UseWindowResizeReturn {
  const {
    debounceMs = 200,
    mobileBreakpoint = 768,
    tabletBreakpoint = 1024,
    desktopBreakpoint = 1280,
    onResize,
  } = options;

  const [windowSize, setWindowSize] = useState<WindowSize>(getWindowSize);

  const handleResize = useCallback(() => {
    const newSize = getWindowSize();
    setWindowSize(newSize);
    onResize?.(newSize);
  }, [onResize]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const debouncedHandleResize = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, debounceMs);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("resize", debouncedHandleResize);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", debouncedHandleResize);
      }
    };
  }, [debounceMs, handleResize]);

  const { width } = windowSize;

  return {
    ...windowSize,
    isMobile: width < mobileBreakpoint,
    isTablet: width >= mobileBreakpoint && width < tabletBreakpoint,
    isDesktop: width >= tabletBreakpoint && width < desktopBreakpoint,
    isLargeDesktop: width >= desktopBreakpoint,
  };
}

export default useWindowResize;
